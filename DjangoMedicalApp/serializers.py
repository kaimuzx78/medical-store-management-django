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
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

    def validate(self, data):
        # If status is being changed to approved, validate required fields
        if data.get('status') == 'approved':
            required_fields = ['buy_price', 'sell_price', 'quantity']
            for field in required_fields:
                if field not in data:
                    raise serializers.ValidationError({
                        field: f"{field} is required for order approval"
                    })
                
                # Validate numeric fields
                try:
                    if field in ['buy_price', 'sell_price']:
                        value = float(data[field])
                        if value <= 0:
                            raise serializers.ValidationError({
                                field: f"{field} must be greater than 0"
                            })
                    elif field == 'quantity':
                        value = int(data[field])
                        if value <= 0:
                            raise serializers.ValidationError({
                                field: "quantity must be greater than 0"
                            })
                except (ValueError, TypeError):
                    raise serializers.ValidationError({
                        field: f"Invalid value for {field}"
                    })

            # Calculate derived fields
            data['total_cost'] = float(data['buy_price']) * int(data['quantity'])
            data['total_price'] = float(data['sell_price']) * int(data['quantity'])
            data['profit'] = data['total_price'] - data['total_cost']

        return data

    def update(self, instance, validated_data):
        print(f"Updating order {instance.id} with data:", validated_data)
        
        # If rejecting, only update status and admin_note
        if validated_data.get('status') == 'rejected':
            instance.status = validated_data.get('status', instance.status)
            instance.admin_note = validated_data.get('admin_note', instance.admin_note)
        else:
            # For other updates, update all provided fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
        
        try:
            instance.save()
            print(f"Order {instance.id} updated successfully")
            return instance
        except Exception as e:
            print(f"Error saving order {instance.id}:", str(e))
            raise serializers.ValidationError(f"Error saving order: {str(e)}")
