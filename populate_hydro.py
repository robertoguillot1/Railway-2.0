import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from modules.farms.models import CropType

crops = [
    {
        "name": "Maíz (Forraje)",
        "scientific_name": "Zea mays",
        "duration_days": 10,
        "description": "Forraje verde hidropónico de crecimiento rápido para alimentación animal."
    },
    {
        "name": "Avena (Forraje)",
        "scientific_name": "Avena sativa",
        "duration_days": 12,
        "description": "Cultivo forrajero con alto valor nutricional, ideal para cosecha a los 12 días."
    },
    {
        "name": "Cebada (Forraje)",
        "scientific_name": "Hordeum vulgare",
        "duration_days": 10,
        "description": "Excelente para forraje verde, muy resistente y de ciclo rápido."
    },
    {
        "name": "Lechuga Hidropónica",
        "scientific_name": "Lactuca sativa",
        "duration_days": 35,
        "description": "Cultivo para consumo humano, requiere mayor tiempo y control de nutrientes."
    },
    {
        "name": "Albahaca",
        "scientific_name": "Ocimum basilicum",
        "duration_days": 25,
        "description": "Hierba aromática de ciclo medio en sistemas hidropónicos."
    }
]

for crop_data in crops:
    crop, created = CropType.objects.get_or_create(
        name=crop_data["name"],
        defaults=crop_data
    )
    if created:
        print(f"Cultivo creado: {crop.name}")
    else:
        print(f"El cultivo {crop.name} ya existia.")

print("\nCatalogo de cultivos hidroponicos listo.")
