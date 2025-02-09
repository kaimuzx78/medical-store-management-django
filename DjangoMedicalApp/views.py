from datetime import datetime, timedelta
from decimal import Decimal

from django.db.models import Sum, Count, F, ExpressionWrapper, FloatField, DecimalField, Q
from rest_framework import viewsets, generics
from rest_framework.decorators import action

# Create your views here.
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from django.db.models.functions import TruncMonth
from django.db import transaction
from django.http import HttpResponse
from django.template.loader import render_to_string, get_template
import pdfkit
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.db.models.functions import Extract
from django.conf import settings
import os
from django.core.exceptions import ValidationError, MultipleObjectsReturned
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
import phonenumbers
from phonenumbers import NumberParseException
from django.contrib.auth.models import User

from DjangoMedicalApp.models import Company, CompanyBank, Medicine, MedicalDetails, CompanyAccount, Employee, \
    EmployeeBank, EmployeeSalary, CustomerRequest, Bill, BillDetails, Customer, Order
from DjangoMedicalApp.serializers import CompanySerliazer, CompanyBankSerializer, MedicineSerliazer, \
    MedicalDetailsSerializer, MedicalDetailsSerializerSimple, CompanyAccountSerializer, EmployeeSerializer, \
    EmployeeBankSerializer, EmployeeSalarySerializer, CustomerSerializer, BillSerializer, BillDetailsSerializer, \
    CustomerRequestSerializer, OrderSerializer

try:
    # Windows path
    config = pdfkit.configuration(wkhtmltopdf=r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe')
except Exception:
    try:
        # Linux/Mac path
        config = pdfkit.configuration(wkhtmltopdf='/usr/local/bin/wkhtmltopdf')
    except Exception:
        # Fallback to system PATH
        config = None

#OLD Viewset
# class CompanyViewSet(viewsets.ModelViewSet):
#     queryset = Company.objects.all()
#     serializer_class = CompanySerliazer


class CompanyViewSet(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self,request):
        company=Company.objects.all()
        serializer=CompanySerliazer(company,many=True,context={"request":request})
        response_dict={"error":False,"message":"All Company List Data","data":serializer.data}
        return Response(response_dict)

    def create(self,request):
        try:
            serializer=CompanySerliazer(data=request.data,context={"request":request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            dict_response={"error":False,"message":"Company Data Save Successfully"}
        except:
            dict_response={"error":True,"message":"Error During Saving Company Data"}
        return Response(dict_response)

    def retrieve(self, request, pk=None):
        queryset = Company.objects.all()
        company = get_object_or_404(queryset, pk=pk)
        serializer = CompanySerliazer(company, context={"request": request})

        serializer_data = serializer.data
        # Accessing All the Medicine Details of Current Medicine ID
        company_bank_details = CompanyBank.objects.filter(company_id=serializer_data["id"])
        companybank_details_serializers = CompanyBankSerializer(company_bank_details, many=True)
        serializer_data["company_bank"] = companybank_details_serializers.data

        return Response({"error": False, "message": "Single Data Fetch", "data": serializer_data})

    def update(self,request,pk=None):
        try:
            queryset=Company.objects.all()
            company=get_object_or_404(queryset,pk=pk)
            serializer=CompanySerliazer(company,data=request.data,context={"request":request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            dict_response={"error":False,"message":"Successfully Updated Company Data"}
        except:
            dict_response={"error":True,"message":"Error During Updating Company Data"}

        return Response(dict_response)

    def destroy(self, request, pk=None):
        try:
            queryset = Company.objects.all()
            company = get_object_or_404(queryset, pk=pk)
            company.delete()
            return Response({
                "error": False,
                "message": "Company Deleted Successfully"
            })
        except Company.DoesNotExist:
            return Response({
                "error": True,
                "message": "Company not found"
            }, status=404)
        except Exception as e:
            return Response({
                "error": True,
                "message": str(e)
            }, status=500)


class CompanyBankViewset(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def create(self,request):
        try:
            serializer=CompanyBankSerializer(data=request.data,context={"request":request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            dict_response={"error":False,"message":"Company Bank Data Save Successfully"}
        except:
            dict_response={"error":True,"message":"Error During Saving Company Bank Data"}
        return Response(dict_response)

    def list(self,request):
        companybank=CompanyBank.objects.all()
        serializer=CompanyBankSerializer(companybank,many=True,context={"request":request})
        response_dict={"error":False,"message":"All Company Bank List Data","data":serializer.data}
        return Response(response_dict)

    def retrieve(self,request,pk=None):
        queryset=CompanyBank.objects.all()
        companybank=get_object_or_404(queryset,pk=pk)
        serializer=CompanyBankSerializer(companybank,context={"request":request})
        return Response({"error":False,"message":"Single Data Fetch","data":serializer.data})

    def update(self,request,pk=None):
        queryset=CompanyBank.objects.all()
        companybank=get_object_or_404(queryset,pk=pk)
        serializer=CompanyBankSerializer(companybank,data=request.data,context={"request":request})
        serializer.is_valid()
        serializer.save()
        return Response({"error":False,"message":"Data Has Been Updated"})

    def destroy(self, request, pk=None):
        try:
            queryset = CompanyBank.objects.all()
            company_bank = get_object_or_404(queryset, pk=pk)
            company_bank.delete()
            return Response({
                "error": False,
                "message": "Company Bank Account Deleted Successfully"
            })
        except CompanyBank.DoesNotExist:
            return Response({
                "error": True,
                "message": "Company Bank Account not found"
            }, status=404)
        except Exception as e:
            return Response({
                "error": True,
                "message": str(e)
            }, status=500)





class CompanyNameViewSet(generics.ListAPIView):
    serializer_class = CompanySerliazer
    def get_queryset(self):
        name=self.kwargs["name"]
        return Company.objects.filter(name=name)

class MedicineByNameViewSet(generics.ListAPIView):
    serializer_class = MedicineSerliazer
    def get_queryset(self):
        name=self.kwargs["name"]
        return Medicine.objects.filter(name__contains=name)

class CompanyOnlyViewSet(generics.ListAPIView):
    serializer_class = CompanySerliazer
    def get_queryset(self):
        return Company.objects.all()


class MedicineViewSet(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        medicine = Medicine.objects.all()
        serializer = MedicineSerliazer(medicine, many=True, context={"request": request})
        response_dict = {"error": False, "message": "All Medicine List Data", "data": serializer.data}
        return Response(response_dict)

    def create(self, request):
        try:
            serializer = MedicineSerliazer(data=request.data, context={"request": request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({"error": False, "message": "Medicine Data Save Successfully"})
        except Exception as e:
            return Response({"error": True, "message": str(e)})

    def retrieve(self,request,pk=None):
        queryset=Medicine.objects.all()
        medicine=get_object_or_404(queryset,pk=pk)
        serializer=MedicineSerliazer(medicine,context={"request":request})

        serializer_data=serializer.data
        # Accessing All the Medicine Details of Current Medicine ID
        medicine_details = MedicalDetails.objects.filter(medicine_id=serializer_data["id"])
        medicine_details_serializers = MedicalDetailsSerializerSimple(medicine_details, many=True)
        serializer_data["medicine_details"] = medicine_details_serializers.data

        return Response({"error":False,"message":"Single Data Fetch","data":serializer_data})

    def update(self, request, pk=None):
        try:
            queryset = Medicine.objects.all()
            medicine = get_object_or_404(queryset, pk=pk)
            serializer = MedicineSerliazer(medicine, data=request.data, context={"request": request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({"error": False, "message": "Medicine Updated Successfully"})
        except Exception as e:
            return Response({"error": True, "message": str(e)})

    def destroy(self, request, pk=None):
        try:
            queryset = Medicine.objects.all()
            medicine = get_object_or_404(queryset, pk=pk)
            medicine.delete()
            return Response({
                "error": False,
                "message": "Medicine Deleted Successfully"
            })
        except Medicine.DoesNotExist:
            return Response({
                "error": True,
                "message": "Medicine not found"
            }, status=404)
        except Exception as e:
            return Response({
                "error": True,
                "message": str(e)
            }, status=500)


#Company Account Viewset
class CompanyAccountViewset(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def create(self,request):
        try:
            serializer=CompanyAccountSerializer(data=request.data,context={"request":request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            dict_response={"error":False,"message":"Company Account Data Save Successfully"}
        except:
            dict_response={"error":True,"message":"Error During Saving Company Account Data"}
        return Response(dict_response)

    def list(self,request):
        companyaccount=CompanyAccount.objects.all()
        serializer=CompanyAccountSerializer(companyaccount,many=True,context={"request":request})
        response_dict={"error":False,"message":"All Company Account List Data","data":serializer.data}
        return Response(response_dict)

    def retrieve(self,request,pk=None):
        queryset=CompanyAccount.objects.all()
        companyaccount=get_object_or_404(queryset,pk=pk)
        serializer=CompanyAccountSerializer(companyaccount,context={"request":request})
        return Response({"error":False,"message":"Single Data Fetch","data":serializer.data})

    def update(self,request,pk=None):
        queryset=CompanyAccount.objects.all()
        companyaccount=get_object_or_404(queryset,pk=pk)
        serializer=CompanyBankSerializer(companyaccount,data=request.data,context={"request":request})
        serializer.is_valid()
        serializer.save()
        return Response({"error":False,"message":"Data Has Been Updated"})


#Employee Viewset
class EmployeeViewset(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def create(self, request):
        try:
            serializer = EmployeeSerializer(data=request.data, context={"request": request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({
                "error": False,
                "message": "Employee Data Save Successfully",
                "data": serializer.data
            })
        except Exception as e:
            return Response({
                "error": True,
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def list(self,request):
        employee=Employee.objects.all()
        serializer=EmployeeSerializer(employee,many=True,context={"request":request})
        response_dict={"error":False,"message":"All Employee List Data","data":serializer.data}
        return Response(response_dict)

    def retrieve(self,request,pk=None):
        queryset=Employee.objects.all()
        employee=get_object_or_404(queryset,pk=pk)
        serializer=EmployeeSerializer(employee,context={"request":request})
        return Response({"error":False,"message":"Single Data Fetch","data":serializer.data})

    def update(self,request,pk=None):
        queryset=Employee.objects.all()
        employee=get_object_or_404(queryset,pk=pk)
        serializer=EmployeeSerializer(employee,data=request.data,context={"request":request})
        serializer.is_valid()
        serializer.save()
        return Response({"error":False,"message":"Data Has Been Updated"})

    def destroy(self, request, pk=None):
        try:
            # Get the employee instance
            queryset = Employee.objects.all()
            employee = get_object_or_404(queryset, pk=pk)
            
            # Delete the employee
            employee.delete()
            
            return Response({
                "error": False,
                "message": "Employee Deleted Successfully"
            })
        except Exception as e:
            return Response({
                "error": True,
                "message": str(e)
            })

#Employee Bank Viewset
class EmployeeBankViewset(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def create(self,request):
        try:
            serializer=EmployeeBankSerializer(data=request.data,context={"request":request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            dict_response={"error":False,"message":"Employee Bank Save Successfully"}
        except:
            dict_response={"error":True,"message":"Error During Saving Employee Bank"}
        return Response(dict_response)

    def list(self,request):
        employeebank=EmployeeBank.objects.all()
        serializer=EmployeeBankSerializer(employeebank,many=True,context={"request":request})
        response_dict={"error":False,"message":"All Employee Bank List Data","data":serializer.data}
        return Response(response_dict)

    def retrieve(self,request,pk=None):
        queryset=EmployeeBank.objects.all()
        employeebank=get_object_or_404(queryset,pk=pk)
        serializer=EmployeeBankSerializer(employeebank,context={"request":request})
        return Response({"error":False,"message":"Single Data Fetch","data":serializer.data})

    def update(self,request,pk=None):
        queryset=EmployeeBank.objects.all()
        employeebank=get_object_or_404(queryset,pk=pk)
        serializer=EmployeeBankSerializer(employeebank,data=request.data,context={"request":request})
        serializer.is_valid()
        serializer.save()
        return Response({"error":False,"message":"Data Has Been Updated"})

    def destroy(self, request, pk=None):
        try:
            bank_account = EmployeeBank.objects.get(pk=pk)
            bank_account.delete()
            return Response({
                "error": False,
                "message": "Bank Account Deleted Successfully"
            })
        except EmployeeBank.DoesNotExist:
            return Response({
                "error": True,
                "message": "Bank Account not found"
            }, status=404)
        except Exception as e:
            return Response({
                "error": True,
                "message": str(e)
            }, status=500)

#Employee Salary Viewset
class EmployeeSalaryViewset(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def create(self,request):
        try:
            serializer=EmployeeSalarySerializer(data=request.data,context={"request":request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            dict_response={"error":False,"message":"Employee Salary Save Successfully"}
        except:
            dict_response={"error":True,"message":"Error During Saving Employee Salary"}
        return Response(dict_response)

    def list(self,request):
        employeesalary=EmployeeSalary.objects.all()
        serializer=EmployeeSalarySerializer(employeesalary,many=True,context={"request":request})
        response_dict={"error":False,"message":"All Employee Salary List Data","data":serializer.data}
        return Response(response_dict)

    def retrieve(self,request,pk=None):
        queryset=EmployeeSalary.objects.all()
        employeesalary=get_object_or_404(queryset,pk=pk)
        serializer=EmployeeSalarySerializer(employeesalary,context={"request":request})
        return Response({"error":False,"message":"Single Data Fetch","data":serializer.data})

    def update(self,request,pk=None):
        queryset=EmployeeSalary.objects.all()
        employeesalary=get_object_or_404(queryset,pk=pk)
        serializer=EmployeeSalarySerializer(employeesalary,data=request.data,context={"request":request})
        serializer.is_valid()
        serializer.save()
        return Response({"error":False,"message":"Data Has Been Updated"})

class EmployeeBankByEIDViewSet(generics.ListAPIView):
    serializer_class = EmployeeBankSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        employee_id=self.kwargs["employee_id"]
        return EmployeeBank.objects.filter(employee_id=employee_id)

class EmployeeSalaryByEIDViewSet(generics.ListAPIView):
    serializer_class = EmployeeSalarySerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        employee_id=self.kwargs["employee_id"]
        return EmployeeSalary.objects.filter(employee_id=employee_id)

class GenerateBillViewSet(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def generate_bill(self, request):
        try:
            with transaction.atomic():
                # 1. Validate customer data
                customer_data = request.data.get('customer_data', {})
                
                # Phone number validation
                try:
                    phone = phonenumbers.parse(customer_data['contact'], "IN")
                    if not phonenumbers.is_valid_number(phone):
                        return Response(
                            {"error": True, "message": "Invalid phone number"},
                            status=400
                        )
                    clean_contact = phonenumbers.format_number(
                        phone, 
                        phonenumbers.PhoneNumberFormat.E164
                    ).replace("+", "")
                except NumberParseException:
                    return Response(
                        {"error": True, "message": "Invalid phone number format"},
                        status=400
                    )

                # 2. Handle customer creation/update
                try:
                    customer = Customer.objects.get(contact=clean_contact)
                    customer.name = customer_data['name']
                    customer.address = customer_data.get('address', '')
                    customer.save()
                except Customer.DoesNotExist:
                    customer = Customer.objects.create(
                        name=customer_data['name'],
                        contact=clean_contact,
                        address=customer_data.get('address', '')
                    )
                except Customer.MultipleObjectsReturned:
                    customer = Customer.objects.filter(contact=clean_contact).first()
                    customer.name = customer_data['name']
                    customer.address = customer_data.get('address', '')
                    customer.save()

                # 3. Create bill
                bill = Bill.objects.create(customer=customer)
                total_amount = Decimal('0')
                medicine_details = request.data.get('medicine_details', [])

                # 4. Validate medicine details
                if not medicine_details:
                    return Response({"error": True, "message": "At least one medicine required"}, 
                                   status=status.HTTP_400_BAD_REQUEST)

                for item in medicine_details:
                    medicine = get_object_or_404(Medicine, pk=item['medicine_id'])
                    qty = Decimal(str(item['qty']))
                    
                    # 5. Check stock availability
                    if medicine.in_stock_total < qty:
                        raise ValueError(f"Not enough stock for {medicine.name}. Available: {medicine.in_stock_total}")
                    
                    # 6. Create bill detail
                    BillDetails.objects.create(
                        bill=bill,
                        medicine=medicine,
                        qty=qty
                    )
                    
                    # 7. Update medicine stock
                    medicine.in_stock_total -= qty
                    medicine.save()
                    
                    # 8. Calculate totals
                    total_amount += medicine.sell_price * qty

                # 9. Add GST calculation
                gst_rate = (medicine.c_gst + medicine.s_gst) / Decimal('100')
                total_amount = total_amount * (Decimal('1') + gst_rate)
                bill.total_amount = total_amount.quantize(Decimal('0.01'))
                bill.save()

                return Response({
                    "error": False,
                    "message": "Bill generated successfully",
                    "bill_id": bill.id
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            print(f"Bill Generation Error: {str(e)}")  # Check Django server logs
            return Response({
                "error": True,
                "message": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        try:
            print("Starting PDF generation for bill:", pk)
            bill = get_object_or_404(Bill, pk=pk)
            bill_details = BillDetails.objects.filter(bill=bill)
            
            # Calculate totals
            total = sum(detail.get_total_price() for detail in bill_details)
            gst_total = sum(detail.get_gst_amount() for detail in bill_details)
            subtotal = total - gst_total
            
            context = {
                'bill': bill,
                'bill_details': bill_details,
                'subtotal': subtotal,
                'gst_total': gst_total,
                'total': total,
                'date': timezone.localtime(bill.added_on).strftime('%d %b %Y %H:%M')
            }
            
            # Debug print statements
            print("Context prepared:", {
                'bill_id': bill.id,
                'customer': bill.customer.name,
                'items_count': bill_details.count(),
                'total': total
            })
            
            # Configure PDF options
            options = {
                'page-size': 'A4',
                'margin-top': '0.75in',
                'margin-right': '0.75in',
                'margin-bottom': '0.75in',
                'margin-left': '0.75in',
                'encoding': "UTF-8",
                'no-outline': None,
                'quiet': ''
            }
            
            # Generate PDF
            config = pdfkit.configuration(wkhtmltopdf=settings.WKHTMLTOPDF_CMD)
            html = render_to_string('pdf_template.html', context)
            pdf = pdfkit.from_string(html, False, options=options, configuration=config)
            
            print("PDF generated successfully")
            
            # Return PDF response
            response = HttpResponse(pdf, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="invoice_{pk}.pdf"'
            return response
            
        except Exception as e:
            print(f"PDF Generation Error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {"error": True, "message": f"Error generating PDF: {str(e)}"},
                status=500
            )

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        try:
            bill_ids = request.data.get('bill_ids', [])
            # Convert string IDs to integers
            bill_ids = [int(id) for id in bill_ids]
            
            print(f"Attempting to bulk delete bills: {bill_ids}")  # Debug log
            
            if not bill_ids:
                return Response({
                    "error": True,
                    "message": "No bills selected for deletion"
                }, status=400)

            with transaction.atomic():
                bills = Bill.objects.filter(id__in=bill_ids)
                found_ids = set(bills.values_list('id', flat=True))
                missing_ids = set(bill_ids) - found_ids
                
                if missing_ids:
                    return Response({
                        "error": True,
                        "message": f"Bills not found: {list(missing_ids)}"
                    }, status=404)

                print(f"Found {bills.count()} bills to delete")  # Debug log

                # Get all bill details before deletion
                bill_details = BillDetails.objects.filter(bill__in=bills)
                print(f"Found {bill_details.count()} bill details to process")  # Debug log

                # Update medicine stock
                medicine_updates = {}
                for detail in bill_details:
                    medicine_id = detail.medicine_id
                    if medicine_id not in medicine_updates:
                        medicine_updates[medicine_id] = detail.qty
                    else:
                        medicine_updates[medicine_id] += detail.qty

                # Bulk update medicine stock
                for medicine_id, qty_to_restore in medicine_updates.items():
                    Medicine.objects.filter(id=medicine_id).update(
                        in_stock_total=F('in_stock_total') + qty_to_restore
                    )
                    print(f"Restored {qty_to_restore} units to medicine {medicine_id}")  # Debug log

                # Delete bills (will cascade to bill_details)
                deleted_count = bills.count()
                bills.delete()
                print(f"Successfully deleted {deleted_count} bills")  # Debug log

                return Response({
                    "error": False,
                    "message": f"Successfully deleted {deleted_count} bills"
                })

        except Exception as e:
            print(f"Error in bulk delete: {str(e)}")  # Debug log
            import traceback
            traceback.print_exc()
            return Response({
                "error": True,
                "message": f"Error deleting bills: {str(e)}"
            }, status=500)

class CustomerRequestViewset(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self,request):
        customer_request=CustomerRequest.objects.all()
        serializer=CustomerRequestSerializer(customer_request,many=True,context={"request":request})
        response_dict={"error":False,"message":"All Customer Request Data","data":serializer.data}
        return Response(response_dict)

    def create(self,request):
        try:
            serializer=CustomerRequestSerializer(data=request.data,context={"request":request})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            dict_response={"error":False,"message":"Customer Request Data Save Successfully"}
        except:
            dict_response={"error":True,"message":"Error During Saving Customer Request Data"}
        return Response(dict_response)

    def retrieve(self, request, pk=None):
        queryset = CustomerRequest.objects.all()
        customer_request = get_object_or_404(queryset, pk=pk)
        serializer = CustomerRequestSerializer(customer_request, context={"request": request})

        serializer_data = serializer.data

        return Response({"error": False, "message": "Single Data Fetch", "data": serializer_data})

    def update(self, request, pk=None):
        try:
            queryset = CustomerRequest.objects.all()
            customer_request = get_object_or_404(queryset, pk=pk)
            
            # Print received data for debugging
            print("Received data:", request.data)
            
            # Create a new data dictionary with only the fields we want to update
            update_data = {}
            
            # If only status is being updated
            if 'status' in request.data:
                update_data['status'] = request.data['status']
            else:
                # For full updates, copy all fields
                update_data = request.data.copy()
            
            serializer = CustomerRequestSerializer(
                customer_request, 
                data=update_data, 
                partial=True  # Allow partial updates
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "error": False,
                    "message": "Successfully Updated Customer Request",
                    "data": serializer.data
                })
            else:
                print("Serializer errors:", serializer.errors)
                return Response({
                    "error": True,
                    "message": "Validation Error",
                    "errors": serializer.errors
                }, status=400)
                
        except CustomerRequest.DoesNotExist:
            return Response({
                "error": True,
                "message": "Customer Request not found"
            }, status=404)
        except Exception as e:
            print("Update error:", str(e))
            return Response({
                "error": True,
                "message": str(e)
            }, status=500)

    def destroy(self, request, pk=None):
        try:
            queryset = CustomerRequest.objects.all()
            customer_request = get_object_or_404(queryset, pk=pk)
            customer_request.delete()
            
            return Response({
                "error": False,
                "message": "Customer Request Deleted Successfully"
            })
        except CustomerRequest.DoesNotExist:
            return Response({
                "error": True,
                "message": "Customer Request not found"
            }, status=404)
        except Exception as e:
            return Response({
                "error": True,
                "message": str(e)
            }, status=500)

class HomeApiViewset(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        try:
            # Add debug prints
            print("\n=== DATABASE STATUS ===")
            print("Total Medicines:", Medicine.objects.count())
            print("Total Companies:", Company.objects.count())
            print("Total Employees:", Employee.objects.count())
            print("Total Bills:", Bill.objects.count())
            print("Total BillDetails:", BillDetails.objects.count())
            
            # Verify one medicine record
            if Medicine.objects.exists():
                med = Medicine.objects.first()
                print("Sample Medicine:", med.name, "Buy:", med.buy_price, "Sell:", med.sell_price)
            
            # Check timezone
            print("Current Time:", timezone.localtime(timezone.now()).isoformat())
            
            today = timezone.now().date()
            
            # Basic counts
            medicine_count = Medicine.objects.count()
            company_count = Company.objects.count()
            employee_count = Employee.objects.count()
            customer_request = CustomerRequest.objects.count()

            # Calculate total sales and profit
            bill_details = BillDetails.objects.select_related('medicine')
            total_sales = bill_details.aggregate(
                total=Sum(
                    ExpressionWrapper(
                        F('qty') * F('medicine__sell_price'),
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                )
            )['total'] or Decimal('0.00')

            total_profit = bill_details.aggregate(
                total=Sum(
                    ExpressionWrapper(
                        F('qty') * (F('medicine__sell_price') - F('medicine__buy_price')),
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                )
            )['total'] or Decimal('0.00')

            # Today's sales and profit
            today_bill_details = bill_details.filter(added_on__date=today)
            today_sales = today_bill_details.aggregate(
                total=Sum(
                    ExpressionWrapper(
                        F('qty') * F('medicine__sell_price'),
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                )
            )['total'] or Decimal('0.00')

            today_profit = today_bill_details.aggregate(
                total=Sum(
                    ExpressionWrapper(
                        F('qty') * (F('medicine__sell_price') - F('medicine__buy_price')),
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                )
            )['total'] or Decimal('0.00')

            # Request counts
            request_pending = CustomerRequest.objects.filter(status=False).count()
            request_completed = CustomerRequest.objects.filter(status=True).count()

            # Expiring medicines (next 30 days)
            medicine_expire = Medicine.objects.filter(
                expire_date__range=[today, today + timezone.timedelta(days=30)]
            ).count()

            # Sales chart data (last 30 days)
            start_date = today - timezone.timedelta(days=30)
            daily_sales = bill_details.filter(
                added_on__date__gte=start_date
            ).values('added_on__date').annotate(
                amt=Sum(
                    ExpressionWrapper(
                        F('qty') * F('medicine__sell_price'),
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                )
            ).order_by('added_on__date')

            # Profit chart data
            daily_profit = bill_details.filter(
                added_on__date__gte=start_date
            ).values('added_on__date').annotate(
                amt=Sum(
                    ExpressionWrapper(
                        F('qty') * (F('medicine__sell_price') - F('medicine__buy_price')),
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                )
            ).order_by('added_on__date')

            dict_response = {
                "error": False,
                "message": "Home Page Data",
                "medicine_count": medicine_count,
                "company_count": company_count,
                "employee_count": employee_count,
                "customer_request": customer_request,
                "sell_total": float(total_sales),
                "profit_total": float(total_profit),
                "request_pending": request_pending,
                "request_completed": request_completed,
                "sell_amt_today": float(today_sales),
                "profit_amt_today": float(today_profit),
                "medicine_expire_serializer_data": medicine_expire,
                "sell_chart": [
                    {
                        "date": item['added_on__date'].strftime("%Y-%m-%d"),
                        "amt": float(item['amt'] or 0)
                    } for item in daily_sales
                ],
                "profit_chart": [
                    {
                        "date": item['added_on__date'].strftime("%Y-%m-%d"),
                        "amt": float(item['amt'] or 0)
                    } for item in daily_profit
                ]
            }

            return Response(dict_response)
        except Exception as e:
            print(f"Dashboard Error: {str(e)}")
            return Response({"error": True, "message": str(e)})

class DashboardDataView(APIView):
    def get(self, request):
        try:
            today = timezone.now().date()
            
            # Get data for the last 30 days
            start_date = today - timezone.timedelta(days=30)
            
            # Get daily sales and profit data
            daily_data = BillDetails.objects.filter(
                added_on__date__gte=start_date
            ).values('added_on__date').annotate(
                sales=Sum(
                    ExpressionWrapper(
                        F('qty') * F('medicine__sell_price'),
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                ),
                profit=Sum(
                    ExpressionWrapper(
                        F('qty') * (F('medicine__sell_price') - F('medicine__buy_price')),
                        output_field=DecimalField(max_digits=10, decimal_places=2)
                    )
                )
            ).order_by('added_on__date')

            # Format data for the graph
            chart_data = [
                {
                    'date': item['added_on__date'].strftime('%Y-%m-%d'),
                    'sales': float(item['sales'] or 0),
                    'profit': float(item['profit'] or 0)
                }
                for item in daily_data
            ]

            # Calculate other metrics...
            data = {
                'customer_requests_count': CustomerRequest.objects.count(),
                'total_bill_amount': BillDetails.objects.aggregate(
                    total=Sum(
                        ExpressionWrapper(
                            F('qty') * F('medicine__sell_price'),
                            output_field=DecimalField(max_digits=10, decimal_places=2)
                        )
                    )
                )['total'] or Decimal('0.00'),
                'medicines_count': Medicine.objects.count(),
                'companies_count': Company.objects.count(),
                'employees_count': Employee.objects.count(),
                'total_profit': BillDetails.objects.aggregate(
                    total=Sum(ExpressionWrapper(
                        F('qty') * (F('medicine__sell_price') - F('medicine__buy_price')),
                        output_field=FloatField()
                    ))
                )['total'] or 0,
                'expiring_medicines_count': Medicine.objects.filter(
                    expire_date__lte=timezone.now() + timezone.timedelta(days=30)
                ).count(),
                'pending_requests_count': CustomerRequest.objects.filter(status=False).count(),
                'monthly_data': chart_data,  # Add this for the graph
                'today_sales': float(today_sales),
                'today_profit': float(today_profit),
            }
            
            return Response(data)
        except Exception as e:
            print(f"Dashboard Error: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(APIView):
    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            user = authenticate(username=username, password=password)
            
            if user is not None:
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'error': False,
                    'message': 'Login successful',
                    'data': {
                        'access_token': str(refresh.access_token),
                        'refresh_token': str(refresh),
                        'username': user.username
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': True,
                    'message': 'Invalid credentials'
                }, status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            return Response({
                'error': True,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class BillHistoryViewSet(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def list(self, request):
        try:
            phone = request.query_params.get('phone', '')
            # Clean the phone number and get last 10 digits
            clean_phone = ''.join(filter(str.isdigit, phone))
            
            queryset = Bill.objects.select_related('customer')
            
            if clean_phone:
                if len(clean_phone) < 10:
                    return Response(
                        {"error": True, "message": "Phone number must be at least 10 digits"},
                        status=400
                    )
                # Get the last 10 digits for matching
                last_10_digits = clean_phone[-10:]
                # Match any phone number ending with these 10 digits
                queryset = queryset.filter(customer__contact__endswith=last_10_digits)
            
            start_date = request.query_params.get('start_date', '')
            end_date = request.query_params.get('end_date', '')
            
            if start_date and end_date:
                try:
                    start = datetime.strptime(start_date, '%Y-%m-%d').date()
                    end = datetime.strptime(end_date, '%Y-%m-%d').date() + timedelta(days=1)
                    queryset = queryset.filter(added_on__date__gte=start, added_on__date__lt=end)
                except ValueError as e:
                    return Response({"error": True, "message": "Invalid date format. Use YYYY-MM-DD"}, status=400)
            
            bills = queryset.order_by('-id')
            serializer = BillSerializer(bills, many=True)
            
            return Response({
                "error": False,
                "message": "Bill history retrieved",
                "data": serializer.data
            })
        except Exception as e:
            print(f"Bill History Error: {str(e)}")
            return Response({"error": True, "message": str(e)}, status=500)

    @action(detail=True, methods=['delete'])
    def delete_bill(self, request, pk=None):
        try:
            print(f"Attempting to delete bill {pk}")  # Debug log
            bill = get_object_or_404(Bill, pk=pk)
            
            # Start transaction to ensure atomicity
            with transaction.atomic():
                # Restore medicine stock
                bill_details = BillDetails.objects.filter(bill=bill)
                print(f"Found {bill_details.count()} bill details")  # Debug log
                
                for detail in bill_details:
                    medicine = detail.medicine
                    print(f"Restoring {detail.qty} units to {medicine.name}")  # Debug log
                    medicine.in_stock_total += detail.qty
                    medicine.save()
                
                # Delete the bill (this will cascade delete bill_details)
                bill.delete()
                print("Bill deleted successfully")  # Debug log
            
            return Response({
                "error": False,
                "message": "Bill deleted successfully"
            })
        except Bill.DoesNotExist:
            print(f"Bill {pk} not found")  # Debug log
            return Response({
                "error": True,
                "message": f"Bill {pk} not found"
            }, status=404)
        except Exception as e:
            print(f"Error deleting bill: {str(e)}")  # Debug log
            import traceback
            traceback.print_exc()  # Print full stack trace
            return Response({
                "error": True,
                "message": f"Error deleting bill: {str(e)}"
            }, status=500)

    @action(detail=False, methods=['post'])
    def bulk_delete(self, request):
        try:
            bill_ids = request.data.get('bill_ids', [])
            # Convert string IDs to integers
            bill_ids = [int(id) for id in bill_ids]
            
            print(f"Attempting to bulk delete bills: {bill_ids}")  # Debug log
            
            if not bill_ids:
                return Response({
                    "error": True,
                    "message": "No bills selected for deletion"
                }, status=400)

            with transaction.atomic():
                bills = Bill.objects.filter(id__in=bill_ids)
                found_ids = set(bills.values_list('id', flat=True))
                missing_ids = set(bill_ids) - found_ids
                
                if missing_ids:
                    return Response({
                        "error": True,
                        "message": f"Bills not found: {list(missing_ids)}"
                    }, status=404)

                print(f"Found {bills.count()} bills to delete")  # Debug log

                # Get all bill details before deletion
                bill_details = BillDetails.objects.filter(bill__in=bills)
                print(f"Found {bill_details.count()} bill details to process")  # Debug log

                # Update medicine stock
                medicine_updates = {}
                for detail in bill_details:
                    medicine_id = detail.medicine_id
                    if medicine_id not in medicine_updates:
                        medicine_updates[medicine_id] = detail.qty
                    else:
                        medicine_updates[medicine_id] += detail.qty

                # Bulk update medicine stock
                for medicine_id, qty_to_restore in medicine_updates.items():
                    Medicine.objects.filter(id=medicine_id).update(
                        in_stock_total=F('in_stock_total') + qty_to_restore
                    )
                    print(f"Restored {qty_to_restore} units to medicine {medicine_id}")  # Debug log

                # Delete bills (will cascade to bill_details)
                deleted_count = bills.count()
                bills.delete()
                print(f"Successfully deleted {deleted_count} bills")  # Debug log

                return Response({
                    "error": False,
                    "message": f"Successfully deleted {deleted_count} bills"
                })

        except Exception as e:
            print(f"Error in bulk delete: {str(e)}")  # Debug log
            import traceback
            traceback.print_exc()
            return Response({
                "error": True,
                "message": f"Error deleting bills: {str(e)}"
            }, status=500)

class RegisterUserView(APIView):
    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            email = request.data.get('email')
            
            if User.objects.filter(username=username).exists():
                return Response({
                    'status': 'error',
                    'message': 'Username already exists'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                is_staff=False  # This ensures the user is not an admin
            )
            
            return Response({
                'status': 'success',
                'message': 'User registered successfully'
            })
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class AvailableMedicinesView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            medicines = Medicine.objects.filter(in_stock_total__gt=0)
            serializer = MedicineSerliazer(medicines, many=True)
            return Response({
                "error": False,
                "message": "Medicines fetched successfully",
                "data": serializer.data
            })
        except Exception as e:
            return Response({
                "error": True,
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class UserOrderHistoryView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Assuming you have an Order model
            orders = Order.objects.filter(user=request.user).order_by('-created_at')
            serializer = OrderSerializer(orders, many=True)
            return Response({
                "error": False,
                "message": "Orders fetched successfully",
                "data": serializer.data
            })
        except Exception as e:
            return Response({
                "error": True,
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class OrderMedicineView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            prescription_file = request.FILES.get('prescription')
            if not prescription_file:
                return Response({
                    "error": True,
                    "message": "Prescription file is required"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Create order with prescription and a default total price
            order = Order.objects.create(
                user=request.user,
                patient_name=request.data.get('patientName'),
                age=request.data.get('age'),
                gender=request.data.get('gender'),
                delivery_address=request.data.get('address'),
                phone=request.data.get('phone'),
                payment_method=request.data.get('paymentMethod'),
                description=request.data.get('description'),
                prescription=prescription_file,
                total_price=0.00  # Set initial total price to 0
            )

            return Response({
                "error": False,
                "message": "Order request submitted successfully",
                "data": OrderSerializer(order).data
            })
        except Exception as e:
            return Response({
                "error": True,
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class AdminOrderView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({
                "error": True,
                "message": "Unauthorized"
            }, status=status.HTTP_403_FORBIDDEN)

        # If it's a stats request
        if request.path.endswith('/stats/'):
            return self.get_stats(request)
            
        # Regular orders list request
        try:
            orders = Order.objects.all().order_by('-created_at')
            serializer = OrderSerializer(orders, many=True, context={'request': request})
            return Response({
                "error": False,
                "message": "Orders fetched successfully",
                "data": serializer.data
            })
        except Exception as e:
            return Response({
                "error": True,
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def get_stats(self, request):
        try:
            today = timezone.now().date()
            
            # Calculate total orders statistics
            total_orders = Order.objects.count()
            pending_orders = Order.objects.filter(status='pending').count()
            completed_orders = Order.objects.filter(status='completed').count()
            approved_orders = Order.objects.filter(status='approved').count()
            
            # Calculate all-time sales and profit
            all_orders = Order.objects.filter(
                status__in=['approved', 'completed']
            ).aggregate(
                total_sales=Sum('total_price'),
                total_profit=Sum('profit'),
                total_cost=Sum('total_cost')
            )
            
            # Debug print
            print("All Orders Aggregate:", all_orders)
            
            total_sales = float(all_orders['total_sales'] or 0)
            total_profit = float(all_orders['total_profit'] or 0)
            
            # Calculate today's sales and profit
            today_orders = Order.objects.filter(
                status__in=['approved', 'completed'],
                created_at__date=today
            ).aggregate(
                today_sales=Sum('total_price'),
                today_profit=Sum('profit'),
                today_cost=Sum('total_cost')
            )
            
            # Debug print
            print("Today's Orders Aggregate:", today_orders)
            
            today_sales = float(today_orders['today_sales'] or 0)
            today_profit = float(today_orders['today_profit'] or 0)

            response_data = {
                "error": False,
                "message": "Statistics fetched successfully",
                "data": {
                    "totalOrders": total_orders,
                    "pendingOrders": pending_orders,
                    "completedOrders": completed_orders + approved_orders,
                    "totalSales": total_sales,
                    "totalProfit": total_profit,
                    "todaySales": today_sales,
                    "todayProfit": today_profit,
                    "approvedOrders": approved_orders,
                    "totalActiveOrders": pending_orders + approved_orders,
                    "totalCompletedOrders": completed_orders
                }
            }
            
            # Debug print
            print("Response Data:", response_data)
            
            return Response(response_data)
            
        except Exception as e:
            print(f"Error in get_stats: {str(e)}")
            return Response({
                "error": True,
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, order_id=None):
        if not request.user.is_staff:
            return Response({
                "error": True,
                "message": "Unauthorized"
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            order = Order.objects.get(id=order_id)
            
            # Debug print
            print("Received data for edit:", request.data)
            
            # Update all fields that are present in the request
            fields_to_update = [
                'patient_name', 'age', 'gender', 'phone', 'delivery_address',
                'payment_method', 'status', 'admin_note', 'buy_price',
                'sell_price', 'quantity'
            ]
            
            for field in fields_to_update:
                if field in request.data and request.data[field] is not None:
                    if field in ['buy_price', 'sell_price']:
                        setattr(order, field, Decimal(str(request.data[field])))
                    elif field == 'quantity':
                        setattr(order, field, int(request.data[field]))
                    else:
                        setattr(order, field, request.data[field])

            # Calculate totals if price fields are updated
            if order.buy_price and order.sell_price and order.quantity:
                order.total_cost = Decimal(str(order.buy_price)) * Decimal(str(order.quantity))
                order.total_price = Decimal(str(order.sell_price)) * Decimal(str(order.quantity))
                order.profit = order.total_price - order.total_cost

            # Debug print
            print(f"Order {order_id} updated values:")
            print(f"Buy Price: {order.buy_price}")
            print(f"Sell Price: {order.sell_price}")
            print(f"Quantity: {order.quantity}")
            print(f"Total Cost: {order.total_cost}")
            print(f"Total Price: {order.total_price}")
            print(f"Profit: {order.profit}")
            
            order.save()

            # Return updated order data
            serializer = OrderSerializer(order, context={'request': request})
            return Response({
                "error": False,
                "message": "Order updated successfully",
                "data": serializer.data
            })

        except Order.DoesNotExist:
            return Response({
                "error": True,
                "message": "Order not found"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error updating order: {str(e)}")
            print(f"Error type: {type(e)}")
            print(f"Error args: {e.args}")
            return Response({
                "error": True,
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        if not request.user.is_staff:
            return Response({
                "error": True,
                "message": "Unauthorized"
            }, status=status.HTTP_403_FORBIDDEN)

        try:
            order_ids = request.data.get('order_ids', [])
            Order.objects.filter(id__in=order_ids).delete()
            
            return Response({
                "error": False,
                "message": "Orders deleted successfully"
            })
        except Exception as e:
            return Response({
                "error": True,
                "message": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

def update_dashboard_data():
    # Update your dashboard calculations here
    # For example:
    today = timezone.now().date()
    today_orders = Order.objects.filter(
        status='approved',
        created_at__date=today
    ).aggregate(
        total_amount=Sum('total_price')
    )
    # Update other dashboard metrics as needed

company_list=CompanyViewSet.as_view({"get":"list"})
company_creat=CompanyViewSet.as_view({"post":"create"})
company_update=CompanyViewSet.as_view({"put":"update"})

employee_delete = EmployeeViewset.as_view({"delete": "destroy"})
