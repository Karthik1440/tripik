# trips/urls.py — COMPLETE

from django.urls import path
from .views import (
    PackageListView, PackageDetailView, BookPackageView,
    UserBookingsView, DeleteBookingView, ReviewPackageView, PackageReviewsView,
    AllBookingsAdminView, UpdateBookingStatusView, NotificationsView,
    CategoryListView, HeroBannerListView, SecondaryBannerListView,
    BlogPostListView, BlogPostDetailView, FAQItemListView,
    HiddenSpotListView, AddHiddenSpotView, HiddenSpotDetailView, AnnouncementBarView, DynamicSitemapView
)

urlpatterns = [
    # ── Travel Packages ──────────────────────────────────
    path('sitemap.xml', DynamicSitemapView.as_view(), name='dynamic-sitemap'),
    path('announcement-bar/', AnnouncementBarView.as_view(), name='announcement-bar'),
    path('packages/', PackageListView.as_view(), name='package-list'),
    path('packages/<int:package_id>/', PackageDetailView.as_view(), name='package-detail'),
    path('packages/<int:package_id>/reviews/', PackageReviewsView.as_view(), name='package-reviews'),
    path('notifications/', NotificationsView.as_view(), name='notifications'),
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('banners/', HeroBannerListView.as_view(), name='hero-banners'),
    path('secondary-banner/', SecondaryBannerListView.as_view(), name='secondary-banner'),
    path('blogs/', BlogPostListView.as_view(), name='blog-list'),
    path('blogs/<slug:slug>/', BlogPostDetailView.as_view(), name='blog-detail'),
    path('faqs/', FAQItemListView.as_view(), name='faq-list'),
    path('hidden-spots/', HiddenSpotListView.as_view(), name='hidden-spot-list'),
    path('hidden-spots/add/', AddHiddenSpotView.as_view(), name='add-hidden-spot'),
    path('hidden-spots/<int:spot_id>/', HiddenSpotDetailView.as_view(), name='hidden-spot-detail'),


    # ── Bookings ─────────────────────────────────────────
    path('packages/<int:package_id>/book/', BookPackageView.as_view(), name='book-package'),
    path('bookings/', UserBookingsView.as_view(), name='user-bookings'),
    path('bookings/<int:booking_id>/', DeleteBookingView.as_view(), name='delete-booking'),
    path('bookings/<int:booking_id>/review/', ReviewPackageView.as_view(), name='review-package'),

    # ── Admin ─────────────────────────────────────────────
    path('admin/bookings/', AllBookingsAdminView.as_view(), name='admin-all-bookings'),
    path('bookings/<int:booking_id>/status/', UpdateBookingStatusView.as_view(), name='update-booking-status'),
]