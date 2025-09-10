from django.db import models
from django.contrib.auth.models import User

class Vehicle(models.Model):
    plate = models.CharField(max_length=10, unique=True, verbose_name='Placa')
    model = models.CharField(max_length=100, default='Modelo não informado', verbose_name='Modelo')
    brand = models.CharField(max_length=50, default='Marca não informada', verbose_name='Marca')
    year = models.IntegerField(default=2024, verbose_name='Ano')
    color = models.CharField(max_length=30, default='Não informada', verbose_name='Cor')
    photo = models.ImageField(upload_to='vehicles/', blank=True, null=True, verbose_name='Foto')
    
    # Dados técnicos do veículo
    chassis_number = models.CharField(max_length=50, unique=True, default='', verbose_name='Chassi')
    renavam = models.CharField(max_length=20, unique=True, default='', verbose_name='RENAVAM')
    fuel_type = models.CharField(max_length=20, choices=[
        ('gasoline', 'Gasolina'),
        ('ethanol', 'Etanol'),
        ('diesel', 'Diesel'),
        ('flex', 'Flex'),
        ('electric', 'Elétrico'),
        ('hybrid', 'Híbrido'),
    ], default='flex', verbose_name='Tipo de Combustível')
    
    # Capacidade
    passenger_capacity = models.PositiveIntegerField(default=5, verbose_name='Capacidade de Passageiros')
    
    # Status e relacionamentos
    conductors = models.ManyToManyField('conductors.Conductor', blank=True, related_name='vehicles', verbose_name='Condutores')
    is_active = models.BooleanField(default=True, verbose_name='Ativo')
    created_at = models.DateTimeField(auto_now_add=True, null=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, null=True, verbose_name='Atualizado em')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Criado por')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='vehicle_updates', verbose_name='Atualizado por')

    class Meta:
        verbose_name = 'Veículo'
        verbose_name_plural = 'Veículos'
        ordering = ['plate']

    def __str__(self):
        return f"{self.brand} {self.model} - {self.plate}"

    @property
    def age(self):
        from django.utils import timezone
        return timezone.now().year - self.year