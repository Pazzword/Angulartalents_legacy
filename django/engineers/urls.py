from django.urls import path
from .views import EngineerCountView, EngineerListCreateView, EngineerMeView, UploadImageView, EngineerDetailUpdateView

urlpatterns = [
    path('engineers/count/', EngineerCountView.as_view(), name='engineer-count'),
    path('engineers/me/', EngineerMeView.as_view(), name='engineer-me'),
    path('engineers/upload/', UploadImageView.as_view(), name='upload-image'),
    path('engineers/<uuid:engineer_id>/', EngineerDetailUpdateView.as_view(), name='engineer-detail-update'),
    path('engineers/', EngineerListCreateView.as_view(), name='engineers-list-create'),
]
