from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MedicineViewSet, CompanyViewSet, CompanyBankViewSet

router = DefaultRouter()
router.register('medicine', MedicineViewSet)
router.register('company', CompanyViewSet)

# Remove the nested router registration and add explicit URLs for bank operations
urlpatterns = [
    path('api/', include([
        path('', include(router.urls)),
        # Add explicit paths for bank operations
        path('company/<int:pk>/bank/', CompanyBankViewSet.as_view({
            'get': 'list',
            'post': 'create'
        })),
        path('company/<int:pk>/bank/<int:bank_pk>/', CompanyBankViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'delete': 'destroy'
        })),
    ])),
] 