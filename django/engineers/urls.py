from django.urls import path
from .views import EngineerListCreateView, UploadImageView, EngineerDetailUpdateView

urlpatterns = [
    path('engineers/', EngineerListCreateView.as_view(), name='engineers-list-create'),
    path('engineers/<str:engineer_id>/', EngineerDetailUpdateView.as_view(), name='engineer-detail-update'),
    path('upload/', UploadImageView.as_view(), name='upload-image'),  # Ensure the endpoint matches with your frontend request
]
