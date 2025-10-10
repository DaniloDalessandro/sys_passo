import os
import django
import random
from datetime import datetime, timedelta
from faker import Faker

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from conductors.models import Conductor

fake = Faker('pt_BR')

def generate_cpf():
    """Generate a valid CPF"""
    def calculate_digit(cpf_digits):
        total = sum((len(cpf_digits) + 1 - i) * int(digit) for i, digit in enumerate(cpf_digits))
        remainder = total % 11
        return 0 if remainder < 2 else 11 - remainder

    cpf_base = [random.randint(0, 9) for _ in range(9)]
    first_digit = calculate_digit(cpf_base)
    cpf_base.append(first_digit)
    second_digit = calculate_digit(cpf_base)
    cpf_base.append(second_digit)

    return ''.join(map(str, cpf_base))

def generate_cnh():
    """Generate a CNH number"""
    return ''.join([str(random.randint(0, 9)) for _ in range(11)])

def create_conductors(count=100):
    """Create multiple conductor records"""

    categories = ['A', 'B', 'AB', 'C', 'D', 'E']
    genders = ['M', 'F', 'O']

    created_count = 0

    for i in range(count):
        try:
            # Generate unique CPF and CNH
            cpf = generate_cpf()
            cnh = generate_cnh()

            # Check if CPF or CNH already exists
            if Conductor.objects.filter(cpf=cpf).exists():
                print(f"CPF {cpf} já existe, gerando outro...")
                continue

            if Conductor.objects.filter(license_number=cnh).exists():
                print(f"CNH {cnh} já existe, gerando outra...")
                continue

            # Generate personal data
            gender = random.choice(genders)
            first_name = fake.first_name_male() if gender == 'M' else fake.first_name_female()
            last_name = fake.last_name()
            name = f"{first_name} {last_name}"

            # Generate birth date (18 to 70 years old)
            birth_date = fake.date_of_birth(minimum_age=18, maximum_age=70)

            # Generate CNH expiry date (between 1 year ago and 5 years from now)
            days_offset = random.randint(-365, 1825)  # -1 year to +5 years
            license_expiry_date = datetime.now().date() + timedelta(days=days_offset)

            # Generate address
            street = fake.street_name()
            number = str(random.randint(1, 9999))
            neighborhood = fake.bairro()
            city = fake.city()
            reference = fake.sentence(nb_words=5) if random.random() > 0.5 else ""

            # Generate contact
            phone = fake.cellphone_number()[4:].replace('-', '').replace(' ', '')[:11]
            whatsapp = phone if random.random() > 0.3 else fake.cellphone_number()[4:].replace('-', '').replace(' ', '')[:11]
            email = fake.email()

            # Create conductor
            conductor = Conductor.objects.create(
                name=name,
                cpf=cpf,
                birth_date=birth_date,
                gender=gender,
                nationality='Brasileiro',
                street=street,
                number=number,
                neighborhood=neighborhood,
                city=city,
                reference_point=reference,
                phone=phone,
                whatsapp=whatsapp,
                email=email,
                license_number=cnh,
                license_category=random.choice(categories),
                license_expiry_date=license_expiry_date,
                is_active=random.random() > 0.1  # 90% active, 10% inactive
            )

            created_count += 1
            print(f"[OK] Criado {created_count}/{count}: {conductor.name} - CPF: {conductor.cpf}")

        except Exception as e:
            print(f"[ERRO] Erro ao criar condutor {i+1}: {str(e)}")
            continue

    print(f"\n{'='*60}")
    print(f"RESUMO: {created_count} condutores criados com sucesso!")
    print(f"{'='*60}")

    # Print statistics
    total = Conductor.objects.count()
    active = Conductor.objects.filter(is_active=True).count()
    inactive = Conductor.objects.filter(is_active=False).count()

    print(f"\nESTATÍSTICAS DO BANCO:")
    print(f"Total de condutores: {total}")
    print(f"Ativos: {active}")
    print(f"Inativos: {inactive}")

if __name__ == '__main__':
    print("Iniciando inserção de 100 condutores...\n")
    create_conductors(100)
