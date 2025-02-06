from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('DjangoMedicalApp', '0008_auto_20250206_1209'),
    ]

    operations = [
        migrations.RunSQL(
            # Remove the unique constraint
            "DROP INDEX IF EXISTS DjangoMedicalApp_customer_contact_unique;",
            # Add it back (for reverse migration)
            "CREATE UNIQUE INDEX DjangoMedicalApp_customer_contact_unique ON DjangoMedicalApp_customer(contact);"
        ),
    ] 