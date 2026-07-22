# trips/models.py
from django.db import models

class AppUser(models.Model):
    firebase_uid = models.CharField(max_length=128, unique=True)
    email = models.EmailField()
    display_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_authenticated(self): return True
    @property
    def is_anonymous(self): return False

    def __str__(self): return self.email


# 0. Categories Model
class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=50, blank=True, help_text="Lucide icon name (e.g., 'palmtree')")
    image = models.ImageField(upload_to='categories/', blank=True, null=True, help_text="Upload category icon image (20x20 or thumbnail)")
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self): return self.name

class HeroBanner(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to='banners/')
    link_to = models.CharField(max_length=255, blank=True, help_text="Optional ID or URL to link to")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class SecondaryBanner(models.Model):
    title = models.CharField(max_length=255, default="Solo, Couple Or Friends - We Have Trips for All")
    subtitle = models.TextField(blank=True, default="Most travellers don't just travel with us, they meet strangers who quickly turn into their people.")
    image = models.ImageField(upload_to='banners/', blank=True, null=True, help_text="Upload custom Banner 2 image")
    button_text = models.CharField(max_length=50, default="Explore Trips", blank=True)
    link_to = models.CharField(max_length=255, default="/packages", blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Secondary Banner (Under Why Tripik)"
        verbose_name_plural = "Secondary Banners (Under Why Tripik)"

    def __str__(self):
        return self.title


# 1. TourPackage Model
class TourPackage(models.Model):
    title = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    start_location = models.CharField(max_length=255)
    duration_days = models.PositiveIntegerField()
    duration_nights = models.PositiveIntegerField()
    base_price_per_person = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    cover_image = models.ImageField(upload_to='package_covers/', null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='packages')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Cached metrics for frontend compatibility
    avg_rating = models.FloatField(default=0)
    total_reviews = models.IntegerField(default=0)
    total_bookings = models.IntegerField(default=0)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.duration_days}D/{self.duration_nights}N)"


# 2. Package Gallery Images
class PackageImage(models.Model):
    package = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name='gallery_images')
    image = models.ImageField(upload_to='package_gallery/')
    alt_text = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.package.title}"


# 2. Day-wise Itinerary Model
class DayItinerary(models.Model):
    package = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name='itinerary_days')
    day_number = models.PositiveIntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    travel_distance_km = models.PositiveIntegerField(null=True, blank=True)
    travel_time = models.CharField(max_length=100, null=True, blank=True)
    stay_type = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        ordering = ['day_number']

    def __str__(self):
        return f"Day {self.day_number}: {self.title}"


# 3. Itinerary Places
class ItineraryPlace(models.Model):
    itinerary = models.ForeignKey(DayItinerary, on_delete=models.CASCADE, related_name='places')
    place_name = models.CharField(max_length=255)
    type = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.place_name


# 4. Pricing Breakdown Model
class PricingBreakdown(models.Model):
    package = models.OneToOneField(TourPackage, on_delete=models.CASCADE, related_name='pricing')
    transport_cost_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stay_cost_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    food_cost_per_person = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    activity_cost_per_person = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fuel_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    price_per_person_calculated = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Pricing for {self.package.title}"


# 5. Include / Exclude Model
class PackageIncludeExclude(models.Model):
    TYPE_CHOICES = [('INCLUDE', 'Include'), ('EXCLUDE', 'Exclude')]
    package = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name='includes_excludes')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    text = models.CharField(max_length=255)

    def __str__(self):
        return f"[{self.type}] {self.text}"


# 6. Add-ons Model
class PackageAddon(models.Model):
    package = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name='addons')
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} (+{self.price})"


# 7. Original Core Entities (Bookings, Reviews, Notifications) mapped to TourPackage
class PackageBooking(models.Model):
    STATUS_CHOICES = [('inquiry', 'Inquiry'), ('confirmed', 'Confirmed'), ('completed', 'Completed'), ('cancelled', 'Cancelled')]
    package = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name='bookings')
    user = models.ForeignKey(AppUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='package_bookings')
    adults = models.PositiveIntegerField(default=1)
    children = models.PositiveIntegerField(default=0)
    start_date = models.DateField()
    end_date = models.DateField()
    phone = models.CharField(max_length=20)
    special_requests = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inquiry')
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    review_submitted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

class PackageReview(models.Model):
    package = models.ForeignKey(TourPackage, on_delete=models.CASCADE, related_name='reviews')
    booking = models.OneToOneField(PackageBooking, on_delete=models.CASCADE, related_name='review')
    user = models.ForeignKey(AppUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='package_reviews')
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    title = models.CharField(max_length=255)
    review_text = models.TextField()
    accommodation_rating = models.IntegerField(default=5)
    guide_rating = models.IntegerField(default=5)
    experience_rating = models.IntegerField(default=5)
    review_photo = models.ImageField(upload_to='package_reviews/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    TYPE_CHOICES = [('info', 'Info'), ('promo', 'Promo / Offer'), ('alert', 'Alert'), ('update', 'Update')]
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    icon = models.CharField(max_length=50, default='bell')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)


class HiddenSpot(models.Model):
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='General')
    address = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    nearby_landmark = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    distance_km = models.PositiveIntegerField(default=75)
    cover_image = models.ImageField(upload_to='hidden_spots/')
    image_2 = models.ImageField(upload_to='hidden_spots/', null=True, blank=True)
    image_3 = models.ImageField(upload_to='hidden_spots/', null=True, blank=True)
    submitted_by = models.ForeignKey(AppUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='hidden_spots')
    avg_rating = models.FloatField(default=4.7)
    reviews_count = models.PositiveIntegerField(default=12)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.address})"


class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    category = models.CharField(max_length=100, default='Travel Guide')
    read_time = models.CharField(max_length=50, default='5 min read')
    cover_image = models.ImageField(upload_to='blogs/')
    excerpt = models.TextField(help_text="Short summary displayed on cards")
    content = models.TextField(help_text="Full blog post content")
    author_name = models.CharField(max_length=100, default="Tripik Team")
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Blog Post"
        verbose_name_plural = "Blog Posts"

    def __str__(self):
        return self.title


class FAQItem(models.Model):
    question = models.CharField(max_length=255)
    answer = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = "FAQ Item"
        verbose_name_plural = "FAQ Items"

    def __str__(self):
        return self.question


class AnnouncementBar(models.Model):
    badge_text = models.CharField(max_length=50, default="ANNOUNCEMENT")
    message = models.TextField(default="🎉 Special Launch Offer: Book your Kashmir & Kerala group departure with zero booking fees!")
    link_url = models.CharField(max_length=255, blank=True, null=True, help_text="Optional relative or full URL link")
    bg_color = models.CharField(max_length=50, default="#b45309", help_text="HEX or CSS background color")
    text_color = models.CharField(max_length=50, default="#ffffff")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Announcement Bar"
        verbose_name_plural = "Announcement Bars"

    def __str__(self):
        return f"Announcement ({'Active' if self.is_active else 'Disabled'}): {self.message[:40]}"