from django.urls import path
from .views import ActiveCategoryListView, UserPreferenceView, CategoryListCreateAPIView, CategoryDetailAPIView, \
    RecoverCategoryAPIView

urlpatterns = [
    path('', CategoryListCreateAPIView.as_view(), name='category-list'),
    path('<int:pk>/', CategoryDetailAPIView.as_view(), name='category-detail'),
    path('<int:pk>/recover/', RecoverCategoryAPIView.as_view(), name='category-recover'),
    path('categories/active/', ActiveCategoryListView.as_view(), name='active-categories'),
    path('preferences/', UserPreferenceView.as_view(), name='user-preferences'),
]
