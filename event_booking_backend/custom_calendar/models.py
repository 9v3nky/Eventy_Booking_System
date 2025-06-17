from django.db import models
from django.conf import settings

from category.models import Category


class TimeSlot(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.category.name} - {self.date} ({self.start_time}-{self.end_time})"

    class Meta:
        unique_together = ('category', 'date', 'start_time')


class Booking_slots(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, null=True)

    class Meta:
        unique_together = ('user', 'slot')
