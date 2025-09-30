#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script for Portuguese character encoding and conductor creation.
"""

import os
import sys
import django
import json
from datetime import datetime, date

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import RequestFactory, Client
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from conductors.models import Conductor
from conductors.serializers import ConductorCreateSerializer


def test_portuguese_characters():
    """
    Test various Portuguese characters and special cases.
    """
    print("=== Testing Portuguese Character Encoding ===")

    # Test data with various Portuguese characters
    test_cases = [
        {
            "name": "João Silva",
            "city": "São Paulo",
            "neighborhood": "Moóca",
            "street": "Rua das Aações",
        },
        {
            "name": "Maria José Conceição",
            "city": "Belo Horizonte",
            "neighborhood": "Savassi",
            "street": "Avenida Afonso Pena",
        },
        {
            "name": "José de Souza Oliveira Neto",
            "city": "Rio de Janeiro",
            "neighborhood": "Copacabana",
            "street": "Rua Barata Ribeiro",
        },
        {
            "name": "Ana Cristina Çavalcanti",
            "city": "Recife",
            "neighborhood": "Boa Viagem",
            "street": "Rua dos Navegantes",
        }
    ]

    results = []

    for i, test_case in enumerate(test_cases):
        try:
            # Create complete conductor data
            conductor_data = {
                "name": test_case["name"],
                "cpf": f"123456789{i:02d}",  # Unique CPF for each test
                "birth_date": "1990-01-01",
                "gender": "M",
                "nationality": "Brasileira",
                "street": test_case["street"],
                "number": f"{100 + i}",
                "neighborhood": test_case["neighborhood"],
                "city": test_case["city"],
                "reference_point": f"Próximo ao shopping {test_case['city']}",
                "phone": f"11999{i:06d}",
                "email": f"test{i}@example.com",
                "whatsapp": f"11999{i:06d}",
                "license_number": f"12345678{i:03d}",
                "license_category": "B",
                "license_expiry_date": "2025-12-31",
                "is_active": True
            }

            # Test serializer validation
            serializer = ConductorCreateSerializer(data=conductor_data)
            is_valid = serializer.is_valid()

            if is_valid:
                print(f"✓ Test case {i+1}: PASSED - {test_case['name']}")
                results.append({
                    "test": f"Test {i+1}",
                    "name": test_case["name"],
                    "status": "PASSED",
                    "data": conductor_data
                })
            else:
                print(f"✗ Test case {i+1}: FAILED - {test_case['name']}")
                print(f"  Errors: {serializer.errors}")
                results.append({
                    "test": f"Test {i+1}",
                    "name": test_case["name"],
                    "status": "FAILED",
                    "errors": serializer.errors
                })

        except Exception as e:
            print(f"✗ Test case {i+1}: ERROR - {test_case['name']}")
            print(f"  Exception: {str(e)}")
            results.append({
                "test": f"Test {i+1}",
                "name": test_case["name"],
                "status": "ERROR",
                "exception": str(e)
            })

    return results


def test_json_encoding():
    """
    Test JSON encoding/decoding with Portuguese characters.
    """
    print("\n=== Testing JSON Encoding/Decoding ===")

    test_data = {
        "name": "José da Silva",
        "city": "São Paulo",
        "street": "Rua das Nações Unidas",
        "neighborhood": "Vila Olímpia",
        "reference_point": "Próximo à estação de metrô"
    }

    try:
        # Test JSON serialization
        json_str = json.dumps(test_data, ensure_ascii=False, indent=2)
        print("✓ JSON Serialization: PASSED")
        print(f"JSON Output:\n{json_str}")

        # Test JSON deserialization
        parsed_data = json.loads(json_str)
        print("✓ JSON Deserialization: PASSED")

        # Test UTF-8 encoding/decoding
        utf8_bytes = json_str.encode('utf-8')
        decoded_str = utf8_bytes.decode('utf-8')
        print("✓ UTF-8 Encoding/Decoding: PASSED")

        return True

    except Exception as e:
        print(f"✗ JSON/UTF-8 Test: FAILED")
        print(f"  Exception: {str(e)}")
        return False


def test_api_request_simulation():
    """
    Simulate API requests with Portuguese characters.
    """
    print("\n=== Testing API Request Simulation ===")

    # Create test user
    try:
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()

        print("✓ Test user created/retrieved")
    except Exception as e:
        print(f"✗ Failed to create test user: {e}")
        return False

    # Test API client
    client = APIClient()
    client.force_authenticate(user=user)

    # Test data with Portuguese characters
    test_conductor = {
        "name": "João das Neves",
        "cpf": "98765432100",
        "birth_date": "1985-06-15",
        "gender": "M",
        "nationality": "Brasileira",
        "street": "Rua São João",
        "number": "123",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "reference_point": "Próximo à estação São Bento",
        "phone": "11987654321",
        "email": "joao@example.com",
        "whatsapp": "11987654321",
        "license_number": "987654321",
        "license_category": "B",
        "license_expiry_date": "2026-06-15",
        "is_active": True
    }

    try:
        # Clean up any existing conductor with same CPF/email
        Conductor.objects.filter(cpf=test_conductor['cpf']).delete()
        Conductor.objects.filter(email=test_conductor['email']).delete()

        # Test POST request
        response = client.post('/api/conductors/', test_conductor, format='json')

        if response.status_code in [200, 201]:
            print("✓ API POST Request: PASSED")
            print(f"  Response status: {response.status_code}")
            print(f"  Response data: {response.data}")

            # Test GET request
            conductor_id = response.data.get('id')
            if conductor_id:
                get_response = client.get(f'/api/conductors/{conductor_id}/')
                if get_response.status_code == 200:
                    print("✓ API GET Request: PASSED")
                    return True
                else:
                    print(f"✗ API GET Request: FAILED - Status {get_response.status_code}")

        else:
            print(f"✗ API POST Request: FAILED")
            print(f"  Status: {response.status_code}")
            print(f"  Response: {response.data}")
            return False

    except Exception as e:
        print(f"✗ API Request Simulation: ERROR")
        print(f"  Exception: {str(e)}")
        return False

    return True


def main():
    """
    Run all encoding tests.
    """
    print("Starting Portuguese Character Encoding Tests\n")

    # Test 1: Portuguese characters in serializer
    serializer_results = test_portuguese_characters()

    # Test 2: JSON encoding/decoding
    json_test_result = test_json_encoding()

    # Test 3: API request simulation
    api_test_result = test_api_request_simulation()

    # Summary
    print("\n" + "="*50)
    print("TEST SUMMARY")
    print("="*50)

    passed_tests = sum(1 for result in serializer_results if result['status'] == 'PASSED')
    failed_tests = len(serializer_results) - passed_tests

    print(f"Serializer Tests: {passed_tests} passed, {failed_tests} failed")
    print(f"JSON Test: {'PASSED' if json_test_result else 'FAILED'}")
    print(f"API Test: {'PASSED' if api_test_result else 'FAILED'}")

    # Clean up test data
    try:
        Conductor.objects.filter(cpf__startswith='123456789').delete()
        Conductor.objects.filter(cpf='98765432100').delete()
        print("\n✓ Test data cleaned up")
    except Exception as e:
        print(f"\n⚠ Warning: Failed to clean up test data: {e}")


if __name__ == "__main__":
    main()