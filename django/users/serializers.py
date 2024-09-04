from rest_framework_mongoengine.serializers import DocumentSerializer
from .models import User
from rest_framework import serializers
from django.core.mail import send_mail
from django.urls import reverse
from django.conf import settings
import uuid

class RegisterSerializer(DocumentSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'is_verified')

    def create(self, validated_data):
        password = validated_data.pop('password', None)  # Get the password from validated data
        user = User(
            email=validated_data['email'],
            is_verified=False,  # Initially not verified
            verification_code=str(uuid.uuid4())  # Generate a verification code
        )
        if password:
            user.set_password(password)  # Use set_password to handle hashing
        user.save()

        # Send verification email
        verification_url = f"http://localhost:8000/api/verify/{user.id}/{user.verification_code}/"
        send_mail(
            'Verify your email address',
            f'Click the link to verify your email: {verification_url}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

        return user




class UserSerializer(DocumentSerializer):
    class Meta:
        model = User
        fields = ['email', 'is_verified', 'role', 'id']
