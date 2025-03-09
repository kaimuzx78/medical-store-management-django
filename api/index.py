from DjangoMedicalStoreManagementSystem.wsgi import application

# Vercel serverless function handler
def handler(request):
    return application(request) 