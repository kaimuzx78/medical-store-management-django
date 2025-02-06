from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def dashboard_data(request):
    # Add your logic to fetch the required data
    data = {
        'total_request': 0,
        'total_sales': 0,
        'total_medicines': 0,
        'total_companies': 0,
        'total_employees': 0,
        'total_profit': 0,
        'total_amount': 0,
        'expiring_medicines': 0,
        'completed_requests': 0,
        'pending_requests': 0,
        'today_amount': 0,
        'today_profit': 0,
        'monthly_data': []
    }
    return Response(data) 