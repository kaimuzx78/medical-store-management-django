from rest_framework import viewsets, status
from .models import Medicine, Company, CompanyBank
from .serializers import MedicineSerializer, CompanySerializer, CompanyBankSerializer
from rest_framework.response import Response
from rest_framework.decorators import action

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

    def list(self, request):
        medicines = self.get_queryset()
        serializer = self.get_serializer(medicines, many=True)
        return Response({
            "error": False,
            "message": "Medicine List Fetched",
            "data": serializer.data
        })

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    def list(self, request):
        companies = self.get_queryset()
        serializer = self.get_serializer(companies, many=True)
        return Response({
            "error": False,
            "message": "Companies List Fetched",
            "data": serializer.data
        })

    @action(detail=True, methods=['get'], url_path='bank-accounts')
    def bank_accounts(self, request, pk=None):
        try:
            print(f"Fetching bank accounts for company ID: {pk}")
            company = self.get_object()
            accounts = CompanyBank.objects.filter(company=company)
            serializer = CompanyBankSerializer(accounts, many=True)
            print(f"Found {len(accounts)} bank accounts")
            return Response({
                "error": False,
                "message": "Bank accounts fetched successfully",
                "data": serializer.data
            })
        except Exception as e:
            print(f"Error fetching bank accounts: {str(e)}")
            return Response({
                'error': True,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class CompanyBankViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyBankSerializer

    def get_queryset(self):
        company_pk = self.kwargs.get('pk')
        return CompanyBank.objects.filter(company_id=company_pk)

    def perform_create(self, serializer):
        company_pk = self.kwargs.get('pk')
        company = Company.objects.get(pk=company_pk)
        serializer.save(company=company)

    def list(self, request, company_pk=None):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "error": False,
            "message": "Bank accounts fetched successfully",
            "data": serializer.data
        })

    def create(self, request, company_pk=None, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return Response({
                'error': False,
                'message': 'Bank Account Added Successfully',
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'error': True,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, company_pk=None, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response({
                'error': False,
                'message': 'Bank Account Updated Successfully',
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'error': True,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, company_pk=None, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response({
                'error': False,
                'message': 'Bank Account Deleted Successfully'
            })
        except Exception as e:
            return Response({
                'error': True,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST) 