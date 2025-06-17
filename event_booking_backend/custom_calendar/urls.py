from django.urls import path
from .views import WeeklySlotAPIView, CreateUpdateSlotAPIView, BookUnbookSlotAPIView

urlpatterns = [
    path('slots/', WeeklySlotAPIView.as_view(), name='weekly-slots'),
    path('slots/create/', CreateUpdateSlotAPIView.as_view(), name='create-slot'),
    path('slots/update/<int:pk>/', CreateUpdateSlotAPIView.as_view(), name='update-slot'),
    path('slots/book/<int:slot_id>/', BookUnbookSlotAPIView.as_view(), name='book-unbook-slot'),
]
