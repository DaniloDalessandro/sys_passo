from rest_framework import serializers
from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    # Aliases em português para compatibilidade com o frontend
    placa = serializers.CharField(source='plate', required=False)
    marca = serializers.CharField(source='brand', required=False)
    modelo = serializers.CharField(source='model', required=False)
    ano = serializers.IntegerField(source='year', required=False)
    cor = serializers.CharField(source='color', required=False)
    chassi = serializers.CharField(source='chassis_number', required=False)
    combustivel = serializers.CharField(source='fuel_type', required=False)
    categoria = serializers.CharField(source='category', required=False)
    capacidade = serializers.IntegerField(source='passenger_capacity', required=False)

    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            'id',
            'plate', 'brand', 'model', 'year', 'color',
            'chassis_number', 'renavam', 'fuel_type', 'category', 'passenger_capacity',
            'photo_1', 'photo_2', 'photo_3', 'photo_4', 'photo_5',
            'status', 'is_active',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            # Portuguese aliases
            'placa', 'marca', 'modelo', 'ano', 'cor',
            'chassi', 'combustivel', 'categoria', 'capacidade',
            'created_by_username', 'updated_by_username',
        ]
        extra_kwargs = {
            'plate': {'required': False},
            'brand': {'required': False},
            'model': {'required': False},
            'year': {'required': False},
            'color': {'required': False},
            'chassis_number': {'required': False},
            'fuel_type': {'required': False},
            'category': {'required': False},
            'passenger_capacity': {'required': False},
        }
