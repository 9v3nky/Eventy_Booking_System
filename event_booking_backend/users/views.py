from django.db.models import Q
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import CustomUser
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # token = get_tokens_for_user(user)
            return Response({
                "message": "Registration Successful"
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token = get_tokens_for_user(user)
            return Response({
                "token": token.get('access'),
                "refresh": token.get('refresh'),
                "username": user.username,
                "is_admin": user.is_admin,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class UserListAPIView(ListAPIView):
    queryset = CustomUser.objects.all().order_by('username')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', '')
        if len(search) > 2:
            queryset = queryset.filter(Q(username__icontains=search))
        return queryset


class ToggleAdminAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        user = get_object_or_404(CustomUser, pk=pk)
        if not user.is_active:
            return Response({"error": "Cannot modify inactive user."}, status=status.HTTP_400_BAD_REQUEST)
        if user.username == 'admin':
            return Response({"error": "Cannot modify user 'admin'."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_admin = not user.is_admin
        user.save()
        return Response({'is_admin': user.is_admin}, status=status.HTTP_200_OK)
