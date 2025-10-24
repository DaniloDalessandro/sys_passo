import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from vehicles.models import Vehicle

# Total de veículos
total = Vehicle.objects.count()
print(f"Total de veiculos no banco: {total}")

# Veículos por categoria
print("\nVeiculos por categoria:")
from django.db.models import Count
categories = Vehicle.objects.values('category').annotate(count=Count('id')).order_by('-count')
for cat in categories:
    print(f"  {cat['category']}: {cat['count']}")

# Veículos por marca
print("\nTop 10 marcas:")
brands = Vehicle.objects.values('brand').annotate(count=Count('id')).order_by('-count')[:10]
for brand in brands:
    print(f"  {brand['brand']}: {brand['count']}")

# Primeiros 10 veículos
print("\nPrimeiros 10 veiculos:")
for v in Vehicle.objects.all()[:10]:
    print(f"  {v.plate} - {v.brand} {v.model} ({v.year}) - {v.category} - {v.color}")
