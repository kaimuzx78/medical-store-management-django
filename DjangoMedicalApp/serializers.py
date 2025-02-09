from rest_framework import serializers
from django.conf import settings

from DjangoMedicalApp.models import Company, CompanyBank, Medicine, MedicalDetails, Employee, Customer, Bill, \
    CustomerRequest, CompanyAccount, EmployeeBank, EmployeeSalary, BillDetails, Order


class CompanySerliazer(serializers.ModelSerializer):
    class Meta:
        model=Company
        fields="__all__"


class CompanyBankSerializer(serializers.ModelSerializer):
    class Meta:
        model=CompanyBank
        fields="__all__"

    # def to_representation(self, instance):
    #     response=super().to_representation(instance)
    #     response['company']=CompanySerliazer(instance.company_id).data
    #     return response


class MedicineSerliazer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        try:
            representation['company_name'] = instance.company_id.name if instance.company_id else None
            # Ensure numeric fields are properly formatted
            representation['sell_price'] = float(instance.sell_price or 0)
            representation['buy_price'] = float(instance.buy_price or 0)
            representation['c_gst'] = float(instance.c_gst or 0)
            representation['s_gst'] = float(instance.s_gst or 0)
            representation['in_stock_total'] = int(instance.in_stock_total or 0)
        except Exception as e:
            print(f"Error in medicine serializer: {e}")
        return representation



class MedicalDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model=MedicalDetails
        fields="__all__"

    def to_representation(self, instance):
        response = super().to_representation(instance)
        response['medicine'] = MedicineSerliazer(instance.medicine_id).data
        return response

class MedicalDetailsSerializerSimple(serializers.ModelSerializer):
    class Meta:
        model=MedicalDetails
        fields="__all__"

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model=Employee
        fields="__all__"


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"
        read_only_fields = ('added_on',)

    def validate(self, data):
        # Ensure required fields are present
        required_fields = ['name', 'address', 'contact']
        for field in required_fields:
            if not data.get(field):
                raise serializers.ValidationError({field: 'This field is required.'})
        return data

class BillSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer()
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Bill
        fields = '__all__'

class CustomerRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerRequest
        fields = '__all__'


class CompanyAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model=CompanyAccount
        fields="__all__"

    def to_representation(self, instance):
        response = super().to_representation(instance)
        response['company'] = CompanySerliazer(instance.company_id).data
        return response


class EmployeeBankSerializer(serializers.ModelSerializer):
    class Meta:
        model=EmployeeBank
        fields="__all__"

    def to_representation(self, instance):
        response = super().to_representation(instance)
        response['employee'] = EmployeeSerializer(instance.employee_id).data
        return response


class EmployeeSalarySerializer(serializers.ModelSerializer):
    class Meta:
        model=EmployeeSalary
        fields="__all__"

class BillDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillDetails
        fields = '__all__'

    def validate(self, data):
        if not data.get('medicine') or not data.get('qty', 0) > 0:
            raise serializers.ValidationError("Both medicine and quantity are required")
        return data

class OrderSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(source='medicine.name', read_only=True, required=False)
    username = serializers.CharField(source='user.username', read_only=True)
    prescription_url = serializers.SerializerMethodField()
    
    def get_prescription_url(self, obj):
        if obj.prescription:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.prescription.url)
            return obj.prescription.url
        return None
    
    class Meta:
        model = Order
        fields = [
            'id', 'username', 'patient_name', 'age', 'gender',
            'delivery_address', 'phone', 'medicine_name', 'quantity',
            'buy_price', 'sell_price', 'total_cost', 'total_price', 'profit',
            'payment_method', 'prescription', 'prescription_url',
            'description', 'status', 'created_at', 'admin_note'
        ]
        read_only_fields = ['id', 'username', 'medicine_name', 'status', 'created_at', 'admin_note']

