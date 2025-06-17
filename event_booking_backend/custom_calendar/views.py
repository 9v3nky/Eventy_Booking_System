from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Q
from datetime import datetime, time

from .models import TimeSlot, Booking_slots
from .serializers import TimeSlotSerializer, BookingSerializer
from category.models import Category

class WeeklySlotAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from_date = request.query_params.get('from')
        to_date = request.query_params.get('to')
        category_ids = request.query_params.getlist('categories',[])

        if not from_date or not to_date or not category_ids:
            return Response(
                {"error": "Missing required query parameters: from, to, categories"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            slots = TimeSlot.objects.filter(
                date__range=[from_date, to_date],
                category_id__in=category_ids
            )
            bookings = Booking_slots.objects.filter(slot__in=slots)

            data = {}
            for slot in slots:
                date_str = slot.date.strftime('%Y-%m-%d')
                time_str = slot.start_time.strftime('%H:%M')
                cat_id = slot.category_id

                if date_str not in data:
                    data[date_str] = {}
                if time_str not in data[date_str]:
                    data[date_str][time_str] = {}
                data[date_str][time_str][cat_id] = TimeSlotSerializer(slot).data

                booked = bookings.filter(slot=slot).first()
                if booked:
                    data[date_str][time_str][cat_id]['booked_by'] = booked.user.username  # or .id

            return Response(data)

        except Exception as e:
            print("Error in WeeklySlotAPIView:", e)
            return Response({"error": "Something went wrong while fetching slots."}, status=500)


class CreateUpdateSlotAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data.copy()
        data['created_by'] = request.user.id

        start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        if end_time <= start_time or end_time > time(18, 0) or start_time < time(9, 0):
            return Response({'error': 'Invalid slot time.'}, status=400)

        overlaps = TimeSlot.objects.filter(
            category_id=data['category'],
            date=data['date']
        ).filter(
            Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
        )
        if overlaps.exists():
            return Response({'error': 'Overlapping slot exists'}, status=400)

        serializer = TimeSlotSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def put(self, request, pk):
        try:
            slot = TimeSlot.objects.get(pk=pk)
        except TimeSlot.DoesNotExist:
            return Response({'error': 'Slot not found'}, status=404)

        if Booking_slots.objects.filter(slot=slot).exists():
            return Response({'error': 'Cannot edit a booked slot'}, status=400)

        data = request.data.copy()
        start_time = datetime.strptime(data['start_time'], '%H:%M').time()
        end_time = datetime.strptime(data['end_time'], '%H:%M').time()
        if end_time <= start_time or end_time > time(18, 0) or start_time < time(9, 0):
            return Response({'error': 'Invalid slot time.'}, status=400)

        overlaps = TimeSlot.objects.filter(
            category=slot.category,
            date=slot.date
        ).exclude(id=slot.id).filter(
            Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
        )
        if overlaps.exists():
            return Response({'error': 'Overlapping slot exists'}, status=400)

        serializer = TimeSlotSerializer(slot, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        try:
            slot = TimeSlot.objects.get(pk=pk)
            slot.delete()
            return Response({'message': 'Slot deleted successfully'}, status=200)
        except TimeSlot.DoesNotExist:
            return Response({'error': 'Slot not found'}, status=404)




class BookUnbookSlotAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, slot_id):
        user = request.user
        try:
            slot = TimeSlot.objects.get(id=slot_id)
        except TimeSlot.DoesNotExist:
            return Response({'error': 'Slot not found'}, status=404)

        booking, created = Booking_slots.objects.get_or_create(user=user, slot=slot)
        if created:
            return Response({'message': 'Booked successfully'})
        else:
            booking.delete()
            return Response({'message': 'Unbooked successfully'})
