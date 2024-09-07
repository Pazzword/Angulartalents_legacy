# views.py
from django.shortcuts import redirect
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_mongoengine.generics import CreateAPIView, RetrieveAPIView
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from .models import User
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, UserSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import logging

# Setup logger
logger = logging.getLogger(__name__)

# Class-based view for registering a new user
class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        # Get the role from the request data
        role = request.data.get('role', None)
        logger.debug(f"Role received in registration: {role}")
        if not role:
            return Response({'error': 'Role is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Call the parent class's create method to handle user creation
        response = super().create(request, *args, **kwargs)
        
        # Retrieve the created user using their email
        user = User.objects.get(email=response.data['email'])

        # Set the user role
        user.role = role
        user.save()

        # Check if the role has been saved
        logger.debug(f"User role after saving: {user.role}")

        # Generate tokens for the user
        refresh = RefreshToken.for_user(user)

        # Return response with role information
        return Response({
            'user': {
                'email': user.email,
                'is_verified': user.is_verified,
                'role': user.role,
            },
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })






# Class-based view for retrieving user profile information
class ProfileView(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        return user  # Return user instance, UserSerializer will handle the attributes


@api_view(['GET'])
@permission_classes([AllowAny])
def verify_email(request, user_id, verification_code):
    try:
        user = User.objects.get(id=user_id)

        if not user:
            return Response({'message': 'Invalid verification link!'}, status=status.HTTP_404_NOT_FOUND)

        if user.verification_code == verification_code:
            user.is_verified = True
            user.verification_code = None  # Clear the verification code
            user.save()

            return redirect("http://localhost:4200/signin")  # Adjust this to your actual frontend URL
        else:
            return redirect("http://localhost:4200/verify-error")

    except User.DoesNotExist:
        return Response({'message': 'Invalid verification link!'}, status=status.HTTP_404_NOT_FOUND)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        logger.debug(f"Login attempt for email: {email}")

        if not email or not password:
            logger.debug("Email or password not provided")
            return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects(email=email).first()
            if user and user.check_password(password):
                logger.debug(f"Authenticated user: {user.email}")
            else:
                logger.debug("Invalid credentials")
                return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

            if not user.is_verified:
                logger.debug(f"User {email} is not verified")
                return Response({'error': 'Email not verified'}, status=status.HTTP_403_FORBIDDEN)

            if not user.role:
                logger.debug(f"User {email} does not have a role set")
                return Response({'error': 'User role not set'}, status=status.HTTP_403_FORBIDDEN)

            refresh = RefreshToken.for_user(user)
            logger.debug(f"Login successful for user: {email}")

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'role': user.role,  # Include role in the response
                'id': str(user.id)  # Include user ID for frontend routing
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error during login: {str(e)}")
            return Response({'error': 'An error occurred during login'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

