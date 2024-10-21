# Rest framework
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
#Internal imports
from .models import Engineer
from .serializers import EngineerSerializer
from users.models import User
from django.utils.decorators import method_decorator
from engineers.decorators import engineer_required
# Cloudinary
from cloudinary.uploader import upload
# JSON
from django.http import JsonResponse
import json

class EngineerMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        engineer = Engineer.objects.filter(user=user).first()
        if engineer:
            serializer = EngineerSerializer(engineer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'detail': 'Engineer profile not found'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        user = request.user
        engineer = Engineer.objects.filter(user=user).first()
        if not engineer:
            return Response({'detail': 'Engineer profile not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = EngineerSerializer(engineer, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class EngineerCountView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        count = Engineer.objects.count()
        return Response({'count': count})

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
        data = request.data.copy()

        # Parse role_type and role_level if they are JSON strings
        if 'role_type' in data and isinstance(data['role_type'], str):
            try:
                data['role_type'] = json.loads(data['role_type'])
            except json.JSONDecodeError:
                pass  # Handle the error as needed

        if 'role_level' in data and isinstance(data['role_level'], str):
            try:
                data['role_level'] = json.loads(data['role_level'])
            except json.JSONDecodeError:
                pass  # Handle the error as needed

        # Add 'user' to data
        data['user'] = str(request.user.id)  # Associate the engineer profile with the authenticated user

        # Log the processed data --> NOT FOR PRODUCTION
        # print("Processed data:", data)

        # **Pass the request context to the serializer**
        serializer = EngineerSerializer(data=data, context={'request': request})

        if serializer.is_valid():
            engineer = serializer.save()  
            return Response({
                'engineerId': str(engineer.id),  
                'message': 'Engineer profile created successfully'
            }, status=status.HTTP_201_CREATED)
        else:
            print("Serializer errors:", serializer.errors)
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
            serializer = EngineerSerializer(engineer, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                print("Serializer errors:", serializer.errors)
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
