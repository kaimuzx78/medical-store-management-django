from django.urls import path
from .auth import LoginView, VerifyTokenView
from . import views
from rest_framework.routers import DefaultRouter
from .views import NotificationView, ActiveNotificationsView

# Update the company_list line to include delete
company_list = views.CompanyViewSet.as_view({
    "get": "list",
    "post": "create",
    "delete": "destroy"
})

# Update the company_detail line to include delete
company_detail = views.CompanyViewSet.as_view({
    "get": "retrieve",
    "put": "update",
    "delete": "destroy"
})

router = DefaultRouter()
router.register("bill_history", views.BillHistoryViewSet, basename="bill_history")

urlpatterns = [
    # ... your existing urls ...
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/verify-token/', VerifyTokenView.as_view(), name='verify-token'),
    path('api/dashboard/', views.DashboardDataView.as_view(), name='dashboard-data'),
    path('api/company/', company_list, name='company-list'),
    path('api/company/<int:pk>/', company_detail, name='company-detail'),
    path('api/bill_history/', views.BillHistoryViewSet.as_view({'get': 'list'})),
    path('api/generate_bill/', views.GenerateBillViewSet.as_view({'post': 'generate_bill'})),
    path('api/bills/<int:pk>/pdf/', views.GenerateBillViewSet.as_view({'get': 'pdf'})),
    path('api/bills/<int:pk>/delete_bill/', views.BillHistoryViewSet.as_view({'delete': 'delete_bill'})),
    path('api/bills/bulk_delete/', views.BillHistoryViewSet.as_view({'post': 'bulk_delete'})),
    path('api/register/', views.RegisterUserView.as_view(), name='register'),
    path('api/available-medicines/', views.AvailableMedicinesView.as_view(), name='available-medicines'),
    path('api/user/orders/', views.UserOrderHistoryView.as_view(), name='user-orders'),
    path('api/order-medicine/', views.OrderMedicineView.as_view(), name='order-medicine'),
    path('api/admin/orders/stats/', views.AdminOrderView.as_view(), name='admin-orders-stats'),
    path('api/admin/orders/<int:order_id>/', views.AdminOrderView.as_view(), name='admin-order-update'),
    path('api/admin/orders/', views.AdminOrderView.as_view(), name='admin-orders'),
    path('api/admin/orders/bulk-delete/', views.AdminOrderView.as_view(), name='admin-orders-bulk-delete'),
    path('api/admin/orders/<int:order_id>/edit/', views.AdminOrderView.as_view(), name='admin-order-edit'),
    path('api/admin/orders/<int:order_id>/bill/', views.AdminOrderView.as_view(), name='order-bill'),
    path('api/admin/orders/<int:order_id>/prescription/', views.AdminOrderView.as_view(), name='order-prescription'),
    path('api/test/', views.TestView.as_view(), name='test'),
    path('api/user/profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('api/user/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('api/notifications/active/', ActiveNotificationsView.as_view(), name='active-notifications'),
    path('api/notifications/<int:pk>/', NotificationView.as_view(), name='notification-detail'),
    path('api/notifications/', NotificationView.as_view(), name='notifications'),
]

urlpatterns += router.urls 