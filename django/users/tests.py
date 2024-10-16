# backend/users/tests.py

from django.test import TestCase, Client
from django.urls import reverse
from users.models import User
from unittest.mock import patch
import uuid

class UserModelTest(TestCase):
    def setUp(self):
        """
        Set up a user instance for testing with a unique email.
        """
        unique_email = f'testuser_{uuid.uuid4()}@example.com'
        self.user = User(
            email=unique_email,
            is_verified=False,
            verification_code=str(uuid.uuid4()),
            role='engineer'
        )
        self.user.set_password('securepassword123')
        self.user.save()

    def tearDown(self):
        """
        Clean up after tests by dropping the User collection.
        """
        User.drop_collection()

    def test_user_creation(self):
        """
        Test that a user is created correctly.
        """
        user = User.objects.get(email=self.user.email)
        self.assertEqual(user.email, self.user.email)
        self.assertFalse(user.is_verified)
        self.assertIsNotNone(user.verification_code)
        self.assertEqual(user.role, 'engineer')

    def test_password_hashing(self):
        """
        Test that the password is hashed correctly.
        """
        user = User.objects.get(email=self.user.email)
        self.assertNotEqual(user.password_hash, 'securepassword123')
        self.assertTrue(user.check_password('securepassword123'))
        self.assertFalse(user.check_password('wrongpassword'))

class RegistrationViewTest(TestCase):
    def setUp(self):
        """
        Initialize the test client and registration URL.
        """
        self.client = Client()
        self.register_url = reverse('register')  # Ensure this matches your URL configuration

        self.user_data = {
            'email': f'newuser_{uuid.uuid4()}@example.com',
            'password': 'newsecurepassword',
            'role': 'recruiter'
        }

    @patch('django.core.mail.send_mail')
    def test_register_view_success(self, mock_send_mail):
        """
        Test successful user registration.
        """
        response = self.client.post(
            self.register_url,
            data=self.user_data,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn('user', response.json())
        self.assertIn('access', response.json())
        self.assertIn('refresh', response.json())

        user = User.objects.get(email=self.user_data['email'])
        self.assertFalse(user.is_verified)
        self.assertIsNotNone(user.verification_code)
        self.assertEqual(user.role, 'recruiter')
        self.assertTrue(user.check_password('newsecurepassword'))

        # Ensure that send_mail was called once
        mock_send_mail.assert_called_once()
        sent_email = mock_send_mail.call_args[0]
        self.assertIn('Verify your email address', sent_email[0])  # Subject
        self.assertIn(user.email, sent_email[3])  # Recipient list

    def test_register_view_missing_role(self):
        """
        Test registration with missing role field.
        """
        data = {
            'email': f'noroleuser_{uuid.uuid4()}@example.com',
            'password': 'password123'
            # 'role' is missing
        }
        response = self.client.post(
            self.register_url,
            data=data,
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.json())
        self.assertEqual(response.json()['error'], 'Role is required')
