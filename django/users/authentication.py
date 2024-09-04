# authentication.py

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.settings import api_settings
from .models import User
from rest_framework.exceptions import AuthenticationFailed

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        try:
            # Fetching the user ID from the token
            user_id = validated_token.get(api_settings.USER_ID_CLAIM)

            if not user_id:
                raise AuthenticationFailed('Invalid token: no user ID claim found.')
                
            # Make sure user_id is in the correct format (UUID) for MongoDB query
            user = User.objects.get(id=user_id)
            return user
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found.')
        except Exception as e:
            raise AuthenticationFailed(f'Error in authentication: {str(e)}')
