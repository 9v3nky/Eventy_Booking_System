from rest_framework import serializers
from .models import Category, Preference


class CategorySerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)
    updated_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Category
        fields = '__all__'

    def validate_name(self, value):
        title_case_name = value.title()
        existing = Category.objects.filter(name=title_case_name)
        if self.instance:
            existing = existing.exclude(id=self.instance.id)

        if existing.exists():
            cat = existing.first()
            if cat.status == 0:
                raise serializers.ValidationError("Category already exists but is inactive. Consider recovering it.")
            raise serializers.ValidationError("Category with this name already exists.")
        return title_case_name


class PreferenceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Preference
        fields = ['id', 'user', 'category', 'category_name']
        extra_kwargs = {
            'user': {'read_only': True}
        }
