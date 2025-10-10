"""
Script para inserir 100 condutores no banco de dados
"""
import os
import sys
import django
from datetime import datetime, timedelta
import random

# Configurar Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from conductors.models import Conductor
from django.contrib.auth.models import User

def generate_cpf():
    """Gera um CPF fictício válido"""
    def calculate_digit(cpf_list, factor):
        total = sum(int(digit) * factor for digit, factor in zip(cpf_list, range(factor, 1, -1)))
        remainder = total % 11
        return '0' if remainder < 2 else str(11 - remainder)

    # Gera 9 primeiros dígitos
    cpf = [random.randint(0, 9) for _ in range(9)]

    # Calcula primeiro dígito verificador
    cpf.append(int(calculate_digit(cpf, 10)))

    # Calcula segundo dígito verificador
    cpf.append(int(calculate_digit(cpf, 11)))

    return ''.join(map(str, cpf))

def format_cpf(cpf):
    """Formata CPF com pontos e traço"""
    return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"

# Listas de dados para gerar condutores
first_names = [
    'João', 'Maria', 'José', 'Ana', 'Pedro', 'Carla', 'Paulo', 'Fernanda',
    'Carlos', 'Juliana', 'Lucas', 'Mariana', 'Rafael', 'Beatriz', 'Fernando',
    'Patricia', 'Marcos', 'Amanda', 'Ricardo', 'Camila', 'Roberto', 'Leticia',
    'André', 'Gabriela', 'Luiz', 'Renata', 'Rodrigo', 'Aline', 'Bruno', 'Larissa',
    'Gustavo', 'Vanessa', 'Thiago', 'Bruna', 'Marcelo', 'Tatiana', 'Felipe',
    'Carolina', 'Daniel', 'Priscila', 'Fabio', 'Daniela', 'Diego', 'Simone',
    'Leandro', 'Michele', 'Anderson', 'Bianca', 'Eduardo', 'Adriana'
]

last_names = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
    'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
    'Rocha', 'Almeida', 'Nascimento', 'Araújo', 'Melo', 'Barbosa', 'Cardoso',
    'Correia', 'Dias', 'Teixeira', 'Cavalcanti', 'Monteiro', 'Moreira'
]

streets = [
    'Rua das Flores', 'Av. Principal', 'Rua do Comércio', 'Av. Central',
    'Rua São João', 'Av. Paulista', 'Rua das Acácias', 'Rua XV de Novembro',
    'Av. Brasil', 'Rua da Paz', 'Av. Getúlio Vargas', 'Rua Sete de Setembro',
    'Av. Rio Branco', 'Rua Dom Pedro II', 'Rua Santos Dumont', 'Av. JK',
    'Rua Tiradentes', 'Av. Independência', 'Rua Marechal Deodoro', 'Av. Atlântica'
]

neighborhoods = [
    'Centro', 'Jardim das Flores', 'Vila Nova', 'Bairro Alto', 'São José',
    'Santa Maria', 'Boa Vista', 'Vila Rica', 'Parque Industrial', 'Jardim América',
    'Centro Sul', 'Nova Esperança', 'Cidade Nova', 'São Pedro', 'Santa Cruz'
]

cities = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre',
    'Brasília', 'Salvador', 'Fortaleza', 'Recife', 'Manaus', 'Campinas',
    'Guarulhos', 'São Bernardo', 'Santo André', 'Osasco', 'Ribeirão Preto'
]

genders = ['M', 'F']
categories = ['A', 'B', 'C', 'D', 'AB', 'AC', 'AD']

print("Iniciando insercao de 100 condutores...")
print("-" * 60)

# Buscar usuário admin para associar
try:
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        admin_user = User.objects.first()
except:
    admin_user = None

conductors_created = 0
conductors_failed = 0

for i in range(1, 101):
    try:
        # Gerar dados do condutor
        first_name = random.choice(first_names)
        last_name = f"{random.choice(last_names)} {random.choice(last_names)}"
        name = f"{first_name} {last_name}"

        cpf = generate_cpf()
        cpf_formatted = format_cpf(cpf)

        # Data de nascimento (18 a 65 anos)
        days_ago = random.randint(18*365, 65*365)
        birth_date = datetime.now().date() - timedelta(days=days_ago)

        gender = random.choice(genders)

        # Endereço
        street = random.choice(streets)
        number = str(random.randint(1, 9999))
        neighborhood = random.choice(neighborhoods)
        city = random.choice(cities)

        # Contato
        ddd = random.choice(['11', '21', '31', '41', '51', '61', '71', '81', '85', '91'])
        phone_number = f"{random.randint(90000, 99999)}{random.randint(1000, 9999)}"
        phone = f"({ddd}) {phone_number[:5]}-{phone_number[5:]}"

        email = f"{first_name.lower()}.{last_name.split()[0].lower()}{i}@email.com"
        whatsapp = phone

        # CNH
        license_number = f"{random.randint(10000000000, 99999999999)}"
        license_category = random.choice(categories)

        # Validade CNH (1 a 5 anos no futuro)
        days_future = random.randint(365, 365*5)
        license_expiry_date = datetime.now().date() + timedelta(days=days_future)

        # Criar condutor
        conductor = Conductor.objects.create(
            name=name,
            cpf=cpf_formatted,
            birth_date=birth_date,
            gender=gender,
            nationality='Brasileira',
            street=street,
            number=number,
            neighborhood=neighborhood,
            city=city,
            reference_point=f'Próximo ao {random.choice(["mercado", "banco", "posto", "hospital", "escola"])}',
            phone=phone,
            email=email,
            whatsapp=whatsapp,
            license_number=license_number,
            license_category=license_category,
            license_expiry_date=license_expiry_date,
            is_active=True,
            created_by=admin_user
        )

        conductors_created += 1
        print(f"[OK] [{conductors_created:3d}/100] {name} - CPF: {cpf_formatted}")

    except Exception as e:
        conductors_failed += 1
        print(f"[ERRO] Erro ao criar condutor {i}: {str(e)}")

print("-" * 60)
print(f"\nProcesso finalizado!")
print(f"   [OK] Sucesso: {conductors_created} condutores criados")
print(f"   [ERRO] Falhas:  {conductors_failed} condutores")
print(f"\nTotal no banco: {Conductor.objects.count()} condutores")
