# trips/views.py — COMPLETE

from django.db import models
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404

from .models import (
    TourPackage, PackageBooking, PackageReview, Notification,
    Category, HeroBanner, SecondaryBanner, HiddenSpot, BlogPost, FAQItem, AnnouncementBar
)
from .serializers import (
    PackageListSerializer, PackageDetailSerializer,
    PackageBookingSerializer, PackageReviewCreateSerializer,
    PackageReviewSerializer, NotificationSerializer,
    CategorySerializer, HeroBannerSerializer, SecondaryBannerSerializer,
    BlogPostSerializer, FAQItemSerializer, HiddenSpotSerializer, AnnouncementBarSerializer
)


# ──────────────────────────────────────────────────────────
# ── PACKAGE VIEWS ──
# ──────────────────────────────────────────────────────────

class PackageListView(APIView):
    """GET: Browse all published packages"""
    permission_classes = [AllowAny]

    def get(self, request):
        location = request.query_params.get('location')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        days = request.query_params.get('days')
        category = request.query_params.get('category')
        
        packages = TourPackage.objects.filter(is_active=True).order_by('-avg_rating', '-total_bookings')
        
        if category and category.lower() != 'all':
            packages = packages.filter(
                models.Q(category__slug__iexact=category) |
                models.Q(category__name__icontains=category) |
                models.Q(destination__icontains=category)
            )
        
        if location:
            packages = packages.filter(destination__icontains=location)
        if min_price:
            packages = packages.filter(base_price_per_person__gte=min_price)
        if max_price:
            packages = packages.filter(base_price_per_person__lte=max_price)
        if days:
            packages = packages.filter(duration_days=days)
        
        serializer = PackageListSerializer(packages, many=True, context={'request': request})
        return Response(serializer.data)


class PackageDetailView(APIView):
    """GET: Full package details"""
    permission_classes = [AllowAny]

    def get(self, request, package_id):
        package = get_object_or_404(TourPackage, id=package_id, is_active=True)
        serializer = PackageDetailSerializer(package, context={'request': request})
        return Response(serializer.data)


class BookPackageView(APIView):
    """POST: Inquire/Book a package"""
    permission_classes = [AllowAny]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def post(self, request, package_id):
        package = get_object_or_404(TourPackage, id=package_id, is_active=True)
        
        try:
            # Get data
            adults = int(request.data.get('adults', 1))
            children = int(request.data.get('children', 0))
            start_date = request.data.get('start_date')
            end_date = request.data.get('end_date')
            phone = request.data.get('phone')
            special_requests = request.data.get('special_requests', '')
            
            # Validate required fields
            if not all([start_date, end_date, phone]):
                return Response(
                    {'detail': 'start_date, end_date, and phone are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calculate total cost
            total_cost = package.base_price_per_person * adults
            
            # Handle optional logged in user
            booking_user = request.user if (request.user and request.user.is_authenticated) else None

            # Create booking
            booking = PackageBooking.objects.create(
                package=package,
                user=booking_user,
                adults=adults,
                children=children,
                start_date=start_date,
                end_date=end_date,
                phone=phone,
                special_requests=special_requests,
                total_cost=total_cost,
                status='inquiry'
            )
            
            return Response(
                PackageBookingSerializer(booking, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        except ValueError as e:
            return Response(
                {'detail': f'Invalid data: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'detail': f'Booking failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserBookingsView(APIView):
    """GET: User's package bookings & inquiries"""
    permission_classes = [AllowAny]

    def get(self, request):
        phone = request.query_params.get('phone')
        if request.user and request.user.is_authenticated:
            bookings = PackageBooking.objects.filter(
                models.Q(user=request.user) | models.Q(user__isnull=True)
            ).order_by('-created_at')
        elif phone:
            bookings = PackageBooking.objects.filter(phone=phone).order_by('-created_at')
        else:
            bookings = PackageBooking.objects.all().order_by('-created_at')
        serializer = PackageBookingSerializer(bookings, many=True, context={'request': request})
        return Response(serializer.data)


class DeleteBookingView(APIView):
    """DELETE: Remove a booking from user history"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, booking_id):
        booking = get_object_or_404(PackageBooking, id=booking_id, user=request.user)
        booking.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AllBookingsAdminView(APIView):
    """GET: All bookings — admin dashboard"""
    permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def get(self, request):
        status_filter = request.query_params.get('status')
        bookings = PackageBooking.objects.select_related('user', 'package').order_by('-created_at')
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        serializer = PackageBookingSerializer(bookings, many=True)
        return Response(serializer.data)


class UpdateBookingStatusView(APIView):
    """PATCH: Update a booking status — admin only"""
    permission_classes = [IsAuthenticated]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    VALID_TRANSITIONS = {
        'inquiry':   ['confirmed', 'cancelled'],
        'confirmed': ['completed', 'cancelled'],
        'completed': [],
        'cancelled': [],
    }

    def patch(self, request, booking_id):
        booking = get_object_or_404(PackageBooking, id=booking_id)
        new_status = request.data.get('status')

        if not new_status:
            return Response({'detail': 'status field is required'}, status=status.HTTP_400_BAD_REQUEST)

        allowed = self.VALID_TRANSITIONS.get(booking.status, [])
        if new_status not in allowed:
            return Response(
                {'detail': f'Cannot move from "{booking.status}" to "{new_status}". Allowed: {allowed}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = new_status
        booking.save()
        serializer = PackageBookingSerializer(booking)
        return Response(serializer.data)


class ReviewPackageView(APIView):
    """POST: Review a completed package"""
    permission_classes = [AllowAny]
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def post(self, request, booking_id):
        booking = get_object_or_404(PackageBooking, id=booking_id)
        
        if booking.status != 'completed':
            return Response(
                {'detail': 'Can only review completed bookings'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if hasattr(booking, 'review'):
            return Response(
                {'detail': 'Already reviewed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PackageReviewCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        review_user = request.user if (request.user and request.user.is_authenticated) else booking.user

        review = serializer.save(
            booking=booking,
            package=booking.package,
            user=review_user
        )
        
        # Update package ratings
        package = booking.package
        all_reviews = package.reviews.all()
        avg = sum(r.rating for r in all_reviews) / len(all_reviews)
        package.avg_rating = round(avg, 1)
        package.total_reviews = all_reviews.count()
        
        # Count bookings
        completed = package.bookings.filter(status='completed').count()
        package.total_bookings = completed
        package.save()
        
        booking.review_submitted = True
        booking.save()
        
        return Response(
            PackageReviewSerializer(review, context={'request': request}).data,
            status=status.HTTP_201_CREATED
        )


class PackageReviewsView(APIView):
    """GET: All reviews for a package"""
    permission_classes = [AllowAny]

    def get(self, request, package_id):
        package = get_object_or_404(TourPackage, id=package_id)
        reviews = package.reviews.all().order_by('-created_at')
        serializer = PackageReviewSerializer(reviews, many=True, context={'request': request})
        return Response(serializer.data)


class NotificationsView(APIView):
    """GET: Active notifications (admin-controlled)"""
    permission_classes = [AllowAny]

    def get(self, request):
        from django.utils import timezone
        now = timezone.now()
        notifications = Notification.objects.filter(is_active=True).filter(
            models.Q(expires_at__isnull=True) | models.Q(expires_at__gt=now)
        )
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

class CategoryListView(APIView):
    """GET: All active categories"""
    permission_classes = [AllowAny]
    def get(self, request):
        categories = Category.objects.filter(is_active=True)
        serializer = CategorySerializer(categories, many=True, context={'request': request})
        return Response(serializer.data)

class HeroBannerListView(APIView):
    """GET: All active hero banners"""
    permission_classes = [AllowAny]
    def get(self, request):
        banners = HeroBanner.objects.filter(is_active=True)
        serializer = HeroBannerSerializer(banners, many=True, context={'request': request})
        return Response(serializer.data)

class SecondaryBannerListView(APIView):
    """GET: Active secondary banner (under Why Tripik)"""
    permission_classes = [AllowAny]
    def get(self, request):
        banner = SecondaryBanner.objects.filter(is_active=True).first()
        if not banner:
            return Response(None)
        serializer = SecondaryBannerSerializer(banner, context={'request': request})
        return Response(serializer.data)

class BlogPostListView(APIView):
    """GET: List published blog posts for Home page section"""
    permission_classes = [AllowAny]
    def get(self, request):
        blogs = BlogPost.objects.filter(is_published=True)
        serializer = BlogPostSerializer(blogs, many=True, context={'request': request})
        return Response(serializer.data)

class BlogPostDetailView(APIView):
    """GET: Single blog detail by slug"""
    permission_classes = [AllowAny]
    def get(self, request, slug):
        blog = get_object_or_404(BlogPost, slug=slug, is_published=True)
        serializer = BlogPostSerializer(blog, context={'request': request})
        return Response(serializer.data)

class FAQItemListView(APIView):
    """GET: Active FAQ items for Home page section"""
    permission_classes = [AllowAny]
    def get(self, request):
        faqs = FAQItem.objects.filter(is_active=True)
        serializer = FAQItemSerializer(faqs, many=True)
        return Response(serializer.data)


class HiddenSpotListView(APIView):
    """GET: List all approved hidden spots with category and search filter"""
    permission_classes = [AllowAny]

    def get(self, request):
        category = request.query_params.get('category')
        search = request.query_params.get('search')
        
        spots = HiddenSpot.objects.filter(is_approved=True)

        if category and category.lower() != 'all':
            spots = spots.filter(category__iexact=category)
        if search:
            spots = spots.filter(
                models.Q(name__icontains=search) | 
                models.Q(address__icontains=search) | 
                models.Q(nearby_landmark__icontains=search) | 
                models.Q(description__icontains=search)
            )

        serializer = HiddenSpotSerializer(spots, many=True, context={'request': request})
        return Response(serializer.data)


class AddHiddenSpotView(APIView):
    """POST: Upload a new hidden spot with up to 3 photos"""
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        data = request.data
        name = data.get('name')
        address = data.get('address')
        description = data.get('description')

        if not name or not address or not description:
            return Response(
                {"error": "Spot name, address, and description are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        category = data.get('category', 'General')
        nearby_landmark = data.get('nearby_landmark', '')
        
        try:
            latitude = float(data.get('latitude')) if data.get('latitude') else None
        except (ValueError, TypeError):
            latitude = None

        try:
            longitude = float(data.get('longitude')) if data.get('longitude') else None
        except (ValueError, TypeError):
            longitude = None

        try:
            distance_km = int(data.get('distance_km', 85))
        except (ValueError, TypeError):
            distance_km = 85

        # Photos parsing (from 'photos' array or explicit fields 'cover_image', 'image_2', 'image_3')
        files = request.FILES.getlist('photos')
        cover_image = files[0] if len(files) > 0 else request.FILES.get('cover_image')
        image_2 = files[1] if len(files) > 1 else request.FILES.get('image_2')
        image_3 = files[2] if len(files) > 2 else request.FILES.get('image_3')

        if not cover_image:
            return Response(
                {"error": "At least 1 photo is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        spot = HiddenSpot.objects.create(
            name=name,
            category=category,
            address=address,
            latitude=latitude,
            longitude=longitude,
            nearby_landmark=nearby_landmark,
            description=description,
            distance_km=distance_km,
            cover_image=cover_image,
            image_2=image_2,
            image_3=image_3,
            is_approved=True
        )

        serializer = HiddenSpotSerializer(spot, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class HiddenSpotDetailView(APIView):
    """GET: Retrieve single hidden spot detail by ID"""
    permission_classes = [AllowAny]

    def get(self, request, spot_id):
        spot = get_object_or_404(HiddenSpot, id=spot_id, is_approved=True)
        serializer = HiddenSpotSerializer(spot, context={'request': request})
        return Response(serializer.data)


class AnnouncementBarView(APIView):
    """GET: Retrieve active top announcement bar"""
    permission_classes = [AllowAny]

    def get(self, request):
        bar = AnnouncementBar.objects.filter(is_active=True).first()
        if not bar:
            return Response(None, status=status.HTTP_204_NO_CONTENT)
        serializer = AnnouncementBarSerializer(bar, context={'request': request})
        return Response(serializer.data)


from django.http import HttpResponse

class DynamicSitemapView(APIView):
    """GET: Generate dynamic XML sitemap for packages and hidden spots"""
    permission_classes = [AllowAny]

    def get(self, request):
        xml_content = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
        
        for route, prio in [('/', '1.0'), ('/packages', '0.9'), ('/hidden-gems', '0.9')]:
            xml_content.append(f'  <url><loc>https://www.tripik.in{route}</loc><priority>{prio}</priority></url>')
            
        packages = TourPackage.objects.filter(is_active=True)
        for pkg in packages:
            xml_content.append(f'  <url><loc>https://www.tripik.in/package/{pkg.id}</loc><priority>0.8</priority></url>')

        spots = HiddenSpot.objects.filter(is_approved=True)
        for spot in spots:
            xml_content.append(f'  <url><loc>https://www.tripik.in/hidden-gems/{spot.id}</loc><priority>0.7</priority></url>')

        xml_content.append('</urlset>')
        return HttpResponse('\n'.join(xml_content), content_type='application/xml')



