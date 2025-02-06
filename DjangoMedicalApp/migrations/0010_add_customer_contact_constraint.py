from django.db import migrations, models
from django.core.validators import RegexValidator

class Migration(migrations.Migration):

    dependencies = [
        ('DjangoMedicalApp', '0009_remove_customer_contact_constraint'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customer',
            name='contact',
            field=models.CharField(
                max_length=15,
                unique=True,
                validators=[
                    RegexValidator(
                        regex=r'^[0-9]{10}$',
                        message="Phone number must be 10 digits"
                    )
                ]
            ),
        ),
    ] 