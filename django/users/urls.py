from django.urls import path
from .views import RegisterView, ProfileView, verify_email, LoginView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('sign-up/', RegisterView.as_view(), name='register'),  
    path('login/', LoginView.as_view(), name='login'),  # Use your custom LoginView
    # path('login/', TokenObtainPairView.as_view(), name='login'),  # Uncomment this if you want to use Simple JWT's view instead
    path('me/', ProfileView.as_view(), name='profile'),  
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify/<str:user_id>/<str:verification_code>/', verify_email, name='verify-email'),
]
