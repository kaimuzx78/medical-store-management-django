from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import User

# Create your models here.
class Company(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=255)
    license_no=models.CharField(max_length=255)
    address=models.CharField(max_length=255)
    contact_no=models.CharField(max_length=255)
    email=models.CharField(max_length=255)
    description=models.CharField(max_length=255)
    added_on=models.DateTimeField(auto_now_add=True)
    objects=models.Manager()

class Medicine(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=255)
    medical_type=models.CharField(max_length=255)
    buy_price=models.DecimalField(max_digits=10, decimal_places=2)
    sell_price=models.DecimalField(max_digits=10, decimal_places=2)
    c_gst=models.DecimalField(max_digits=5, decimal_places=2)
    s_gst=models.DecimalField(max_digits=5, decimal_places=2)
    batch_no=models.CharField(max_length=255)
    shelf_no=models.CharField(max_length=255)
    expire_date=models.DateField()
    mfg_date=models.DateField()
    company_id=models.ForeignKey(Company,on_delete=models.CASCADE)
    description=models.CharField(max_length=255)
    in_stock_total=models.IntegerField()
    qty_in_strip=models.IntegerField()
    added_on=models.DateTimeField(auto_now_add=True)
    objects=models.Manager()

class MedicalDetails(models.Model):
    id=models.AutoField(primary_key=True)
    medicine_id=models.ForeignKey(Medicine,on_delete=models.CASCADE)
    salt_name=models.CharField(max_length=255)
    salt_qty=models.CharField(max_length=255)
    salt_qty_type=models.CharField(max_length=255)
    description=models.CharField(max_length=255)
    added_on=models.DateTimeField(auto_now_add=True)
    objects=models.Manager()

class Employee(models.Model):
    id=models.AutoField(primary_key=True)
    name=models.CharField(max_length=255)
    joining_date=models.DateField()
    phone=models.CharField(max_length=255)
    address=models.CharField(max_length=255)
    added_on=models.DateTimeField(auto_now_add=True)
    objects=models.Manager()

class Customer(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    contact = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^[0-9]{10}$',
                message="Phone number must be 10 digits"
            )
        ]
    )
    added_on = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

class Bill(models.Model):
    id = models.AutoField(primary_key=True)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    added_on = models.DateTimeField(auto_now_add=True)

    @property
    def customer_info(self):
        if self.customer:
            return {
                'name': self.customer.name,
                'contact': self.customer.contact
            }
        return None

class EmployeeSalary(models.Model):
    id=models.AutoField(primary_key=True)
    employee_id=models.ForeignKey(Employee,on_delete=models.CASCADE)
    salary_date=models.DateField()
    salary_amount=models.CharField(max_length=255)
    added_on=models.DateTimeField(auto_now_add=True)
    objects=models.Manager()

class BillDetails(models.Model):
    id = models.AutoField(primary_key=True)
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='details')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    qty = models.IntegerField()
    added_on = models.DateTimeField(auto_now_add=True)
    objects = models.Manager()

    def get_total_price(self):
        return self.qty * self.medicine.sell_price

    def get_profit(self):
        return self.qty * (self.medicine.sell_price - self.medicine.buy_price)

    def get_gst_amount(self):
        base_price = self.qty * self.medicine.sell_price
        gst_rate = (self.medicine.c_gst + self.medicine.s_gst) / 100
        return base_price * gst_rate

class CustomerRequest(models.Model):
    id = models.AutoField(primary_key=True)
    customer_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    medicine_details = models.CharField(max_length=255)
    status = models.BooleanField(default=False)
    added_on = models.DateTimeField(auto_now_add=True)
    prescription = models.FileField(default="")
    objects = models.Manager()

    def __str__(self):
        return f"{self.customer_name} - {self.added_on}"

class CompanyAccount(models.Model):
    choices=((1,"Debit"),(2,"Credit"))

    id=models.AutoField(primary_key=True)
    company_id=models.ForeignKey(Company,on_delete=models.CASCADE)
    transaction_type=models.CharField(choices=choices,max_length=255)
    transaction_amt=models.CharField(max_length=255)
    transaction_date=models.DateField()
    payment_mode=models.CharField(max_length=255)
    added_on=models.DateTimeField(auto_now_add=True)
    objects=models.Manager()

class CompanyBank(models.Model):
    id=models.AutoField(primary_key=True)
    bank_account_no=models.CharField(max_length=255)
    ifsc_no=models.CharField(max_length=255)
    company_id=models.ForeignKey(Company,on_delete=models.CASCADE)
    added_on=models.DateTimeField(auto_now_add=True)
    objects=models.Manager()

class EmployeeBank(models.Model):
    id=models.AutoField(primary_key=True)
    bank_account_no=models.CharField(max_length=255)
    ifsc_no=models.CharField(max_length=255)
    employee_id=models.ForeignKey(Employee,on_delete=models.CASCADE)
    added_on=models.DateTimeField(auto_now_add=True)
    objects=models.Manager()

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, null=True, blank=True)
    patient_name = models.CharField(max_length=100, default='')
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, default='')
    delivery_address = models.TextField(default='')
    phone = models.CharField(max_length=15, default='')
    buy_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sell_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    quantity = models.IntegerField(null=True, blank=True)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    profit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_method = models.CharField(
        max_length=20, 
        choices=[
            ('cash', 'Cash on Delivery'),
            ('upi', 'UPI'),
            ('card', 'Card')
        ],
        default='cash'
    )
    prescription = models.FileField(upload_to='prescriptions/', null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20, 
        choices=[
            ('pending', 'Pending'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled')
        ], 
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    admin_note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Order #{self.id} - {self.patient_name}"

    class Meta:
        ordering = ['-created_at']

    def get_prescription_url(self):
        if self.prescription:
            return f'/media/{self.prescription}'
        return None

    def save(self, *args, **kwargs):
        if self.buy_price and self.sell_price and self.quantity:
            self.total_cost = self.buy_price * self.quantity
            self.total_price = self.sell_price * self.quantity
            self.profit = self.total_price - self.total_cost
        super().save(*args, **kwargs)

class Notification(models.Model):
    message = models.TextField(max_length=1000)
    active = models.BooleanField(default=True)
    important = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    html_content = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.message




