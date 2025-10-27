from rest_framework import serializers
from .models import Vehicle

class VehicleSerializer(serializers.ModelSerializer):
    # Campos com nomes em português para o frontend
    placa = serializers.CharField(source='plate', required=False)
    marca = serializers.CharField(source='brand', required=False)
    modelo = serializers.CharField(source='model', required=False)
    ano = serializers.IntegerField(source='year', required=False)
    cor = serializers.CharField(source='color', required=False)
    chassi = serializers.CharField(source='chassis_number', required=False)
    combustivel = serializers.CharField(source='fuel_type', required=False)
    categoria = serializers.CharField(source='category', required=False)
    capacidade = serializers.IntegerField(source='passenger_capacity', required=False)

    # Campos de autoria
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)

    class Meta:
        model = Vehicle
        fields = '__all__'
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

    def to_representation(self, instance):
        """
        Converte o objeto do modelo para representação JSON
        Retorna tanto os campos em português quanto em inglês
        """
        representation = super().to_representation(instance)
        # Adiciona os campos em português
        representation['placa'] = instance.plate
        representation['marca'] = instance.brand
        representation['modelo'] = instance.model
        representation['ano'] = instance.year
        representation['cor'] = instance.color
        representation['chassi'] = instance.chassis_number
        representation['combustivel'] = instance.fuel_type
        representation['categoria'] = instance.category
        representation['capacidade'] = instance.passenger_capacity

        # Campos de autoria
        representation['created_by_username'] = instance.created_by.username if instance.created_by else None
        representation['updated_by_username'] = instance.updated_by.username if instance.updated_by else None

        return representation
