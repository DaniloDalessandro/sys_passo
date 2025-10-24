import os
import django
import random
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from vehicles.models import Vehicle

# Listas para gerar dados realistas
BRANDS = [
    'Volkswagen', 'Fiat', 'Chevrolet', 'Ford', 'Toyota',
    'Honda', 'Hyundai', 'Nissan', 'Renault', 'Jeep',
    'Mitsubishi', 'Peugeot', 'Citroen', 'Kia', 'Volvo',
    'Mercedes-Benz', 'BMW', 'Audi', 'Scania', 'Volvo',
    'Iveco', 'MAN', 'DAF', 'Volkswagen', 'Ford'
]

MODELS_BY_BRAND = {
    'Volkswagen': ['Gol', 'Polo', 'Virtus', 'T-Cross', 'Saveiro', 'Amarok', 'Delivery'],
    'Fiat': ['Uno', 'Argo', 'Mobi', 'Cronos', 'Toro', 'Strada', 'Ducato'],
    'Chevrolet': ['Onix', 'Tracker', 'S10', 'Montana', 'Spin', 'Cruze'],
    'Ford': ['Ka', 'EcoSport', 'Ranger', 'Transit', 'Cargo'],
    'Toyota': ['Corolla', 'Hilux', 'SW4', 'Yaris', 'Etios'],
    'Honda': ['Civic', 'HR-V', 'City', 'Fit', 'WR-V'],
    'Hyundai': ['HB20', 'Creta', 'Tucson', 'HR', 'HD78'],
    'Nissan': ['Kicks', 'Versa', 'Frontier', 'March'],
    'Renault': ['Kwid', 'Sandero', 'Duster', 'Oroch', 'Master'],
    'Jeep': ['Renegade', 'Compass', 'Commander'],
    'Mitsubishi': ['L200', 'Outlander', 'ASX'],
    'Peugeot': ['208', '2008', '3008', 'Partner'],
    'Citroen': ['C3', 'C4 Cactus', 'Berlingo'],
    'Kia': ['Sportage', 'Seltos', 'Picanto'],
    'Volvo': ['XC60', 'XC40', 'FH', 'FM'],
    'Mercedes-Benz': ['Classe A', 'GLA', 'Sprinter', 'Atego', 'Accelo'],
    'BMW': ['X1', 'X3', '320i', '118i'],
    'Audi': ['A3', 'Q3', 'Q5'],
    'Scania': ['R450', 'P320', 'G410'],
    'Iveco': ['Daily', 'Tector', 'Vertis'],
    'MAN': ['TGX', 'TGL'],
    'DAF': ['XF', 'CF'],
}

COLORS = [
    'Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho',
    'Azul', 'Verde', 'Amarelo', 'Laranja', 'Bege',
    'Marrom', 'Dourado', 'Roxo'
]

FUEL_TYPES = ['gasoline', 'ethanol', 'diesel', 'flex', 'electric', 'hybrid']

def generate_plate():
    """Gera uma placa no formato brasileiro (ABC1234 ou ABC1D23)"""
    letters = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=3))

    # 50% chance de placa antiga (ABC1234) ou mercosul (ABC1D23)
    if random.choice([True, False]):
        # Placa antiga
        numbers = ''.join(random.choices('0123456789', k=4))
        return f"{letters}{numbers}"
    else:
        # Placa Mercosul
        number1 = random.choice('0123456789')
        letter = random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
        numbers2 = ''.join(random.choices('0123456789', k=2))
        return f"{letters}{number1}{letter}{numbers2}"

def generate_renavam():
    """Gera um RENAVAM de 11 dígitos"""
    return ''.join(random.choices('0123456789', k=11))

def generate_chassis():
    """Gera um número de chassi"""
    return ''.join(random.choices('ABCDEFGHJKLMNPRSTUVWXYZ0123456789', k=17))

def generate_year():
    """Gera um ano entre 2010 e 2024"""
    return str(random.randint(2010, 2024))

def create_vehicles(count=100):
    """Cria veículos no banco de dados"""
    created_count = 0
    attempts = 0
    max_attempts = count * 3  # Tentar até 3x mais para evitar duplicatas

    print(f"Iniciando criacao de {count} veiculos...")

    categories = ['Van', 'Caminhao', 'Onibus', 'Carreta', 'Carro']

    while created_count < count and attempts < max_attempts:
        attempts += 1

        # Selecionar marca
        brand = random.choice(BRANDS)

        # Selecionar modelo baseado na marca
        model = random.choice(MODELS_BY_BRAND[brand])

        # Gerar dados
        plate = generate_plate()

        # Verificar se a placa já existe
        if Vehicle.objects.filter(plate=plate).exists():
            continue

        year = random.randint(2010, 2024)
        color = random.choice(COLORS)
        renavam = generate_renavam()

        # Verificar se RENAVAM já existe
        if Vehicle.objects.filter(renavam=renavam).exists():
            continue

        chassis_number = generate_chassis()

        # Verificar se chassi já existe
        if Vehicle.objects.filter(chassis_number=chassis_number).exists():
            continue

        fuel_type = random.choice(FUEL_TYPES)
        category = random.choice(categories)

        # Capacidade baseada na categoria
        if category == 'Carro':
            passenger_capacity = random.randint(4, 7)
        elif category == 'Van':
            passenger_capacity = random.randint(8, 16)
        elif category == 'Onibus':
            passenger_capacity = random.randint(20, 50)
        else:
            passenger_capacity = 2

        try:
            vehicle = Vehicle.objects.create(
                plate=plate,
                brand=brand,
                model=model,
                year=year,
                color=color,
                renavam=renavam,
                chassis_number=chassis_number,
                fuel_type=fuel_type,
                category=category,
                passenger_capacity=passenger_capacity,
                status='ativo',
                is_active=True
            )

            created_count += 1

            if created_count % 10 == 0:
                print(f"Criados {created_count}/{count} veiculos...")

        except Exception as e:
            print(f"Erro ao criar veiculo: {e}")
            continue

    print(f"\nTotal de veiculos criados: {created_count}")
    print(f"Tentativas necessarias: {attempts}")

    return created_count

if __name__ == '__main__':
    # Verificar quantos veículos já existem
    existing_count = Vehicle.objects.count()
    print(f"Veículos existentes no banco: {existing_count}")

    # Criar 100 veículos
    created = create_vehicles(100)

    # Verificar total final
    final_count = Vehicle.objects.count()
    print(f"\nTotal de veículos no banco após inserção: {final_count}")
    print(f"Novos veículos inseridos: {final_count - existing_count}")
