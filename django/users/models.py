from werkzeug.security import generate_password_hash, check_password_hash
from mongoengine import Document, EmailField, StringField, BooleanField, UUIDField
import uuid

class User(Document):
    id = UUIDField(primary_key=True, default=uuid.uuid4)  # Use MongoEngine's UUIDField
    email = EmailField(required=True, unique=True)
    password_hash = StringField(required=True)
    role = StringField(choices=('engineer', 'recruiter'), null=True)
    is_verified = BooleanField(default=False)
    verification_code = StringField()

    meta = {'collection': 'users'}

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    @property
    def is_authenticated(self):
        return True  # Return True since the user is authenticated if this method is called

    @property
    def is_anonymous(self):
        return False  # Return False since this user is not anonymous

    @property
    def is_active(self):
        return True  # If the user should be considered active

    @property
    def get_username(self):
        return self.email  # Or return another unique identifier
