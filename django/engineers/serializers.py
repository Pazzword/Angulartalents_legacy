# engineers/serializers.py
from rest_framework_mongoengine.serializers import DocumentSerializer
from .models import Engineer
from rest_framework import serializers

class EngineerSerializer(DocumentSerializer):
    avatar = serializers.URLField(required=False, allow_blank=True)
    role_type = serializers.ListField(child=serializers.CharField())
    role_level = serializers.ListField(child=serializers.CharField())
    linkedIn = serializers.URLField(required=True)
    github = serializers.URLField(required=True)
    website = serializers.URLField(required=False, allow_blank=True)
    twitter = serializers.URLField(required=False, allow_blank=True)
    stackoverflow = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = Engineer
        fields = '__all__'
        read_only_fields = ['user']

    def create(self, validated_data):
        user = self.context['request'].user
        engineer = Engineer(user=user, **validated_data)
        engineer.save()
        return engineer