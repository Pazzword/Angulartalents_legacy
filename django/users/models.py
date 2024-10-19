from mongoengine import Document, EmailField, StringField, BooleanField, UUIDField
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

class User(Document):
    id = UUIDField(primary_key=True, default=uuid.uuid4, binary=True)  # Ensure binary=True
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
        return True

    @property
    def is_anonymous(self):
        return False

    @property
    def is_active(self):
        return True

    @property
    def get_username(self):
        return self.email
