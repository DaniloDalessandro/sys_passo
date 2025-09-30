#!/usr/bin/env python
import os
import sys
import django
from datetime import date

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
django.setup()

from django.utils import timezone

def calculate_age(birth_date):
    """Age calculation logic from the serializer"""
    today = timezone.now().date()
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    return age

def test_age_validation():
    print("Testing age validation logic")
    print("=" * 50)

    today = timezone.now().date()
    print(f"Today's date: {today}")
    print()

    # Test cases
    test_cases = [
        # Birth date exactly 18 years ago
        date(today.year - 18, today.month, today.day),

        # Birth date 18 years and 1 day ago (should be valid)
        date(today.year - 18, today.month, today.day - 1) if today.day > 1 else date(today.year - 18, today.month - 1, 30),

        # Birth date 17 years and 364 days ago (should be invalid)
        date(today.year - 18, today.month, today.day + 1) if today.day < 28 else date(today.year - 18, today.month + 1, 1),

        # Birth date 25 years ago (should be valid)
        date(today.year - 25, today.month, today.day),

        # Birth date 17 years ago (should be invalid)
        date(today.year - 17, today.month, today.day),
    ]

    for i, birth_date in enumerate(test_cases, 1):
        age = calculate_age(birth_date)
        is_valid = age >= 18

        print(f"Test Case {i}:")
        print(f"  Birth Date: {birth_date}")
        print(f"  Calculated Age: {age}")
        print(f"  Is Valid (>= 18): {is_valid}")
        print()

if __name__ == "__main__":
    test_age_validation()