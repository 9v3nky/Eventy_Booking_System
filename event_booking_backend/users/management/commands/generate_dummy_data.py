from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, time
import random
from django.contrib.auth.hashers import make_password

from category.models import Category, Preference
from custom_calendar.models import TimeSlot, Booking_slots
from users.models import CustomUser


class Command(BaseCommand):
    help = 'Generate dummy data for development'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Generating dummy data...'))
        # Create admin user
        Booking_slots.objects.all().delete()
        TimeSlot.objects.all().delete()

        Preference.objects.all().delete()
        Category.objects.all().delete()
        CustomUser.objects.all().delete()

        admin, created = CustomUser.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@example.com',
                'is_active': True,
                'is_admin': True,
                'password': make_password('admin')
            }
        )

        # Create 5 random users
        users = []
        for i in range(5):
            user = CustomUser.objects.create(
                username=f'user{i + 1}',
                email=f'user{i + 1}@example.com',
                is_active=True,
                is_admin=False,
                password=make_password('123123')
            )
            users.append(user)

        # Create categories
        names = ['Dance', 'Music', 'Yoga', 'Painting', 'Cooking', 'Drama', 'Singing', 'Coding']
        categories = []
        for i, name in enumerate(names):
            cat = Category.objects.create(
                name=name,
                status=1 if i < 4 else 0,
                created_by=admin,
                updated_by=admin
            )
            categories.append(cat)
        active_categories = [cat for cat in categories if cat.status == 1]

        # Preferences: each user gets 1 or 2 random active categories
        for user in users:
            for cat in random.sample(active_categories, random.randint(1, 2)):
                Preference.objects.create(user=user, category=cat)

        # TimeSlots for every active category for last, current, next week
        def generate_time_slots():
            weeks = [-7, 0, 7]  # days offset
            all_slots = []
            for cat in active_categories:
                for week_offset in weeks:
                    today = timezone.now().date() + timedelta(days=week_offset)
                    monday = today - timedelta(days=today.weekday())
                    for i in range(5):  # Monday to Friday
                        date = monday + timedelta(days=i)
                        used_ranges = []
                        for _ in range(5):  # Max 5 slots/day
                            start_hour = random.randint(9, 15)
                            end_hour = start_hour + random.randint(1, 3)
                            if end_hour > 18:
                                continue
                            start = time(hour=start_hour)
                            end = time(hour=end_hour)
                            if any(s < end and e > start for s, e in used_ranges):
                                continue
                            used_ranges.append((start, end))
                            slot = TimeSlot.objects.create(
                                category=cat,
                                date=date,
                                start_time=start,
                                end_time=end,
                                created_by=admin
                            )
                            all_slots.append(slot)
            return all_slots

        slots = generate_time_slots()

        # Bookings: random users book random available slots
        for slot in random.sample(slots, min(len(slots), len(users) * 5)):
            user = random.choice(users)
            if not Booking_slots.objects.filter(slot=slot).exists():
                Booking_slots.objects.create(user=user, slot=slot)

        self.stdout.write(self.style.SUCCESS('Dummy data generated successfully.'))
