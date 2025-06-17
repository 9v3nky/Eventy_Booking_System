from rest_framework import serializers
from .models import TimeSlot, Booking_slots


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking_slots
        fields = '__all__'
