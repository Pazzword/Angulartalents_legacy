from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Engineer
from .serializers import EngineerSerializer
from users.models import User
from django.utils.decorators import method_decorator
from engineers.decorators import engineer_required
# CLOUDINARY
from rest_framework.parsers import MultiPartParser, FormParser
from cloudinary.uploader import upload
from django.http import JsonResponse


class EngineerListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    @method_decorator(engineer_required)
    def get(self, request):
        country = request.query_params.get('country', '')
        role_type = request.query_params.get('roleType', '')
        role_level = request.query_params.get('roleLevel', '')
        page = int(request.query_params.get('page', 1))
        limit = int(request.query_params.get('limit', 10))

        # Filtering engineers based on query params
        engineers = Engineer.objects()
        if country:
            engineers = engineers.filter(country=country)
        if role_type:
            engineers = engineers.filter(role_type=role_type)
        if role_level:
            engineers = engineers.filter(role_level=role_level)

        total_engineers = engineers.count()
        engineers = engineers[(page - 1) * limit: page * limit]

        serializer = EngineerSerializer(engineers, many=True)
        return Response({
            'engineers': serializer.data,
            'total': total_engineers
        }, status=status.HTTP_200_OK)

    @method_decorator(engineer_required)
    def post(self, request):
        data = request.data.copy()  # Copy the request data to modify it
        user = request.user
        
        # Ensure we link the user and role (from User model) to the Engineer profile
        data['user'] = user.id  # Link the user to the engineer profile
        data['role'] = user.role  # Assuming role is part of the User model

        serializer = EngineerSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # Save the profile linked to the authenticated user
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EngineerDetailUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    @method_decorator(engineer_required)
    def get(self, request, engineer_id):
        try:
            engineer = Engineer.objects.get(id=engineer_id)
            serializer = EngineerSerializer(engineer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Engineer.DoesNotExist:
            return Response({'error': 'Engineer not found'}, status=status.HTTP_404_NOT_FOUND)

    @method_decorator(engineer_required)
    def put(self, request, engineer_id):
        try:
            engineer = Engineer.objects.get(id=engineer_id)
            serializer = EngineerSerializer(engineer, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Engineer.DoesNotExist:
            return Response({'error': 'Engineer not found'}, status=status.HTTP_404_NOT_FOUND)


class UploadImageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file = request.data.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = upload(file)
            return JsonResponse(result, status=200)
        except Exception as e:
            return Response({'error': f"Error uploading to Cloudinary: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
