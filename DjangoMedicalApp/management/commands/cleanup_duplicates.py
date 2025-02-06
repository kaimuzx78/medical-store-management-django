from django.core.management.base import BaseCommand
from DjangoMedicalApp.models import Customer, Bill
from django.db.models import Count

class Command(BaseCommand):
    help = 'Clean up duplicate customer records'

    def handle(self, *args, **kwargs):
        # Find customers with duplicate phone numbers
        duplicates = Customer.objects.values('contact').annotate(
            count=Count('id')
        ).filter(count__gt=1)

        self.stdout.write(f"Found {len(duplicates)} duplicate phone numbers")

        for dup in duplicates:
            contact = dup['contact']
            customers = Customer.objects.filter(contact=contact).order_by('id')
            
            # Keep the first customer and update all bills to point to it
            keeper = customers.first()
            others = customers.exclude(id=keeper.id)
            
            # Update bills to point to the keeper
            bills_updated = Bill.objects.filter(customer__in=others).update(customer=keeper)
            
            # Delete other duplicate customers
            deleted_count = others.delete()[0]
            
            self.stdout.write(
                f"Processed {contact}: kept ID {keeper.id}, "
                f"updated {bills_updated} bills, deleted {deleted_count} duplicates"
            ) 