from django.urls import path
from .views import RegisterView, LoginView, UserListAPIView, ToggleAdminAPIView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/', UserListAPIView.as_view(), name='user-list'),
    path('users/<int:pk>/toggle-admin/', ToggleAdminAPIView.as_view(), name='toggle-admin'),
]