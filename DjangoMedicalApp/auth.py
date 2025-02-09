from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
import logging
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

logger = logging.getLogger(__name__)

class LoginView(APIView):
    permission_classes = []  # Allow unauthenticated access
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        logger.debug(f"Login attempt - Request Data: {request.data}")
        print(f"Login attempt for user: {username}")  # Add print for immediate feedback
        
        user = authenticate(username=username, password=password)
        print(f"Authentication result: {user}")  # Add print for debugging
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            print(f"Login successful for user: {username}")
            return Response({
                'status': 'success',
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'username': user.username,
                'user_id': user.id,
                'role': 'admin' if user.is_staff else 'user'  # Add role based on is_staff
            })
        else:
            print(f"Login failed for user: {username}")
            return Response({
                'status': 'error',
                'message': 'Invalid username or password'
            }, status=status.HTTP_401_UNAUTHORIZED) 

class VerifyTokenView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'status': 'success',
            'message': 'Token is valid',
            'user': {
                'username': request.user.username,
                'id': request.user.id
            }
        }) 