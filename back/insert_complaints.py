import os
import sys
import django
from datetime import date, timedelta

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from complaints.models import Complaint
from vehicles.models import Vehicle

def insert_complaints():
    """Insere 4 denuncias de exemplo no banco de dados."""

    print("Iniciando insercao de denuncias...")

    # Buscar alguns veiculos existentes
    vehicles = list(Vehicle.objects.all()[:4])

    if len(vehicles) < 4:
        print(f"AVISO: Apenas {len(vehicles)} veiculos encontrados. Serao criadas denuncias com placas ficticias.")

    complaints_data = [
        {
            'vehicle_plate': vehicles[0].plate if len(vehicles) > 0 else 'ABC1D23',
            'complaint_type': 'excesso_velocidade',
            'description': 'Veículo trafegando em alta velocidade na Avenida Principal, ultrapassando o limite permitido de 60km/h. O condutor estava em velocidade estimada de aproximadamente 100km/h, colocando em risco pedestres e outros veículos.',
            'occurrence_date': date.today() - timedelta(days=2),
            'occurrence_location': 'Avenida Principal, 1500 - Centro',
            'complainant_name': 'João Silva Santos',
            'complainant_email': 'joao.silva@email.com',
            'complainant_phone': '(11) 98765-4321',
            'status': 'pendente',
            'priority': 'alta',
        },
        {
            'vehicle_plate': vehicles[1].plate if len(vehicles) > 1 else 'XYZ9W87',
            'complaint_type': 'uso_celular',
            'description': 'Motorista dirigindo com celular na mão, conversando ao telefone sem dispositivo viva-voz. Situação observada no semáforo da Rua das Flores e manteve-se durante o trajeto pela via.',
            'occurrence_date': date.today() - timedelta(days=1),
            'occurrence_location': 'Rua das Flores esquina com Av. Central',
            'complainant_name': None,
            'complainant_email': None,
            'complainant_phone': None,
            'status': 'pendente',
            'priority': 'media',
        },
        {
            'vehicle_plate': vehicles[2].plate if len(vehicles) > 2 else 'DEF4G56',
            'complaint_type': 'direcao_perigosa',
            'description': 'Condutor realizando manobras perigosas, fazendo zigue-zague entre os veículos, ultrapassando pela direita e não respeitando a distância de segurança. Comportamento agressivo que quase causou acidente.',
            'occurrence_date': date.today() - timedelta(days=3),
            'occurrence_location': 'Rodovia BR-101, km 45',
            'complainant_name': 'Maria Oliveira',
            'complainant_email': 'maria.oliveira@email.com',
            'complainant_phone': '(21) 99876-5432',
            'status': 'em_analise',
            'priority': 'urgente',
        },
        {
            'vehicle_plate': vehicles[3].plate if len(vehicles) > 3 else 'GHI7J89',
            'complaint_type': 'estacionamento_irregular',
            'description': 'Veículo estacionado em local proibido, sobre faixa de pedestres, dificultando a passagem de pessoas, incluindo cadeirantes e pessoas com mobilidade reduzida. Permaneceu no local por mais de 30 minutos.',
            'occurrence_date': date.today(),
            'occurrence_location': 'Rua Sete de Setembro, 890 - em frente ao mercado',
            'complainant_name': 'Pedro Costa',
            'complainant_email': 'pedro.costa@email.com',
            'complainant_phone': '(31) 97654-3210',
            'status': 'pendente',
            'priority': 'baixa',
        },
    ]

    created_count = 0
    for complaint_data in complaints_data:
        try:
            complaint = Complaint.objects.create(**complaint_data)
            print(f"[OK] Denuncia #{complaint.id} criada - Placa: {complaint.vehicle_plate} - Tipo: {complaint.get_complaint_type_display()}")
            created_count += 1
        except Exception as e:
            print(f"[ERRO] Erro ao criar denuncia para placa {complaint_data['vehicle_plate']}: {str(e)}")

    print(f"\n{created_count} denuncias inseridas com sucesso!")

    # Exibir resumo
    total_complaints = Complaint.objects.count()
    print(f"\nTotal de denuncias no banco: {total_complaints}")
    print("\nDenuncias por status:")
    for status, label in Complaint.STATUS_CHOICES:
        count = Complaint.objects.filter(status=status).count()
        print(f"  - {label}: {count}")

    print("\nDenuncias por prioridade:")
    for priority, label in Complaint.PRIORITY_CHOICES:
        count = Complaint.objects.filter(priority=priority).count()
        print(f"  - {label}: {count}")

if __name__ == '__main__':
    insert_complaints()
