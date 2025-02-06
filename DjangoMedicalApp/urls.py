from django.urls import path
from .auth import LoginView, VerifyTokenView
from . import views
from rest_framework.routers import DefaultRouter

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
]

urlpatterns += router.urls 