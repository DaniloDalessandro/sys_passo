# -*- coding: utf-8 -*-
"""
Django management command to test Portuguese character encoding.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from rest_framework.test import APIClient
import json
from conductors.models import Conductor
from conductors.serializers import ConductorCreateSerializer


class Command(BaseCommand):
    help = 'Test Portuguese character encoding in conductor creation'

    def handle(self, *args, **options):
        """
        Run encoding tests.
        """
        self.stdout.write("=== Testing Portuguese Character Encoding ===\n")

        # Test 1: Serializer validation with Portuguese characters
        self.test_serializer()

        # Test 2: JSON encoding/decoding
        self.test_json()

        # Test 3: Database operations
        self.test_database()

    def test_serializer(self):
        """Test serializer with Portuguese characters."""
        self.stdout.write("Testing serializer validation...")

        test_cases = [
            {
                "name": "João Silva",
                "city": "São Paulo",
                "street": "Rua das Aações",
                "neighborhood": "Moóca"
            },
            {
                "name": "Maria José Conceição",
                "city": "Belo Horizonte",
                "street": "Avenida Afonso Pena",
                "neighborhood": "Savassi"
            }
        ]

        for i, test_case in enumerate(test_cases):
            conductor_data = {
                "name": test_case["name"],
                "cpf": f"123456789{i:02d}",
                "birth_date": "1990-01-01",
                "gender": "M",
                "nationality": "Brasileira",
                "street": test_case["street"],
                "number": f"{100 + i}",
                "neighborhood": test_case["neighborhood"],
                "city": test_case["city"],
                "phone": f"11999{i:06d}",
                "email": f"test{i}@example.com",
                "license_number": f"12345678{i:03d}",
                "license_category": "B",
                "license_expiry_date": "2025-12-31",
                "is_active": True
            }

            try:
                serializer = ConductorCreateSerializer(data=conductor_data)
                if serializer.is_valid():
                    self.stdout.write(
                        self.style.SUCCESS(f"[OK] Test {i+1}: {test_case['name']} - PASSED")
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR(f"[FAIL] Test {i+1}: {test_case['name']} - FAILED")
                    )
                    self.stdout.write(f"  Errors: {serializer.errors}")

            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f"[ERROR] Test {i+1}: {test_case['name']} - ERROR")
                )
                self.stdout.write(f"  Exception: {str(e)}")

    def test_json(self):
        """Test JSON encoding/decoding."""
        self.stdout.write("\nTesting JSON encoding/decoding...")

        test_data = {
            "name": "José da Silva",
            "city": "São Paulo",
            "street": "Rua das Nações Unidas",
            "reference_point": "Próximo à estação de metrô"
        }

        try:
            # Test JSON serialization
            json_str = json.dumps(test_data, ensure_ascii=False, indent=2)

            # Test JSON deserialization
            parsed_data = json.loads(json_str)

            # Test UTF-8 encoding/decoding
            utf8_bytes = json_str.encode('utf-8')
            decoded_str = utf8_bytes.decode('utf-8')

            self.stdout.write(self.style.SUCCESS("[OK] JSON/UTF-8 Test: PASSED"))

        except Exception as e:
            self.stdout.write(self.style.ERROR("[FAIL] JSON/UTF-8 Test: FAILED"))
            self.stdout.write(f"  Exception: {str(e)}")

    def test_database(self):
        """Test database operations with Portuguese characters."""
        self.stdout.write("\nTesting database operations...")

        # Clean up any existing test data
        Conductor.objects.filter(cpf='98765432100').delete()

        try:
            # Create conductor with Portuguese characters
            conductor = Conductor.objects.create(
                name="João das Neves",
                cpf="98765432100",
                birth_date="1985-06-15",
                gender="M",
                nationality="Brasileira",
                street="Rua São João",
                number="123",
                neighborhood="Centro",
                city="São Paulo",
                reference_point="Próximo à estação São Bento",
                phone="11987654321",
                email="joao.database.test@example.com",
                license_number="987654321",
                license_category="B",
                license_expiry_date="2026-06-15",
                is_active=True
            )

            # Retrieve and verify the data
            retrieved = Conductor.objects.get(cpf='98765432100')

            if retrieved.name == "João das Neves" and retrieved.city == "São Paulo":
                self.stdout.write(self.style.SUCCESS("[OK] Database Test: PASSED"))
            else:
                self.stdout.write(self.style.ERROR("[FAIL] Database Test: FAILED - Data corruption"))

            # Clean up
            retrieved.delete()

        except Exception as e:
            self.stdout.write(self.style.ERROR("[FAIL] Database Test: FAILED"))
            self.stdout.write(f"  Exception: {str(e)}")

        self.stdout.write("\n" + "="*50)
        self.stdout.write("Encoding tests completed!")
        self.stdout.write("="*50)