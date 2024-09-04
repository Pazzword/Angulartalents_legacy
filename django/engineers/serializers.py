# engineers/serializers.py
from rest_framework_mongoengine.serializers import DocumentSerializer
from .models import Engineer

class EngineerSerializer(DocumentSerializer):
    class Meta:
        model = Engineer
        fields = '__all__'
