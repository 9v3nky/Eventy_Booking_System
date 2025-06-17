from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Category, Preference
from .serializers import CategorySerializer, PreferenceSerializer
from django.core.paginator import Paginator
from django.db.models import Q


class CategoryListCreateAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        status_filter = request.GET.get('status', '1')  # Default to active
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))

        categories = Category.objects.filter(status=status_filter).order_by('-id')
        paginator = Paginator(categories, page_size)
        page_obj = paginator.get_page(page)

        serializer = CategorySerializer(page_obj, many=True)
        return Response({
            'data': serializer.data,
            'total_pages': paginator.num_pages,
            'current_page': page,
            'total_items': paginator.count
        }, status=status.HTTP_200_OK)

    def post(self, request):
        data = request.data.copy()
        serializer = CategorySerializer(data=data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CategoryDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk):
        try:
            return Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return None

    def put(self, request, pk):
        category = self.get_object(pk)
        if not category:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CategorySerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        category = self.get_object(pk)
        if not category:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        category.status = 0
        category.save()
        return Response({'message': 'Category marked as inactive (soft deleted)'}, status=status.HTTP_200_OK)


class RecoverCategoryAPIView(APIView):
    def post(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
            if category.status == 1:
                return Response({"detail": "Already active."}, status=400)
            category.status = 1
            category.save()
            return Response({"detail": "Recovered successfully."})
        except Category.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)


class ActiveCategoryListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        active_categories = Category.objects.filter(status=1).order_by('name')
        serializer = CategorySerializer(active_categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserPreferenceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        preferences = Preference.objects.filter(user=request.user)
        serializer = PreferenceSerializer(preferences, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        selected_category_ids = request.data.get('category_ids', [])

        # Remove existing preferences not in selected list
        Preference.objects.filter(user=user).exclude(category_id__in=selected_category_ids).delete()

        # Add new preferences
        existing = Preference.objects.filter(user=user).values_list('category_id', flat=True)
        new_ids = [cid for cid in selected_category_ids if cid not in existing]

        for cid in new_ids:
            Preference.objects.create(user=user, category_id=cid)

        return Response({'message': 'Preferences updated successfully.'}, status=status.HTTP_200_OK)
