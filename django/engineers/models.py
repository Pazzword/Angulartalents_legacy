from mongoengine import Document, StringField, UUIDField, ReferenceField, ListField, URLField
from users.models import User
import uuid

class Engineer(Document):
    id = UUIDField(primary_key=True, default=uuid.uuid4)
    user = ReferenceField(User, required=True, dbref=False)
    first_name = StringField(required=True)
    last_name = StringField(required=True)
    tag_line = StringField()
    city = StringField()
    country = StringField()
    avatar = StringField()
    bio = StringField()
    search_status = StringField()
    role_type = ListField(StringField(choices=('contract_part_time', 'contract_full_time', 'employee_part_time', 'employee_full_time')))
    role_level = ListField(StringField(choices=('junior', 'mid_level', 'senior', 'principal_staff', 'c_level')))
    linkedIn = URLField()
    website = URLField(required=False)
    github = URLField()
    twitter = URLField(required=False)
    stackoverflow = URLField(required=False)

    meta = {'collection': 'engineers'}
