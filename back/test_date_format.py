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

def test_frontend_date_handling():
    """Test how the frontend sends date data and how Django processes it"""

    print("Testing Frontend Date Handling")
    print("=" * 50)

    # Simulate how the frontend converts Date to ISO string and splits
    # This is what happens in line 98: conductorData.birth_date.toISOString().split('T')[0]

    from datetime import datetime

    # Test case 1: A person born on October 1, 2007 (would be 17 on 2025-09-30)
    birth_date_js = datetime(2007, 10, 1, 12, 0, 0)  # JS Date with time
    birth_date_iso = birth_date_js.isoformat().split('T')[0]  # "2007-10-01"

    print(f"JavaScript Date: {birth_date_js}")
    print(f"ISO String split: {birth_date_iso}")

    # This is how Django's DateField parses it
    django_date = date.fromisoformat(birth_date_iso)
    print(f"Django parsed date: {django_date}")

    # Now test our age calculation logic
    today = timezone.now().date()
    age = today.year - django_date.year - ((today.month, today.day) < (django_date.month, django_date.day))

    print(f"Today: {today}")
    print(f"Calculated age: {age}")
    print(f"Is valid (>= 18): {age >= 18}")
    print()

    # Test case 2: Edge case - born exactly 18 years ago
    birth_date_18 = datetime(today.year - 18, today.month, today.day, 12, 0, 0)
    birth_date_18_iso = birth_date_18.isoformat().split('T')[0]
    django_date_18 = date.fromisoformat(birth_date_18_iso)
    age_18 = today.year - django_date_18.year - ((today.month, django_date_18.day) < (django_date_18.month, django_date_18.day))

    print("Edge case - exactly 18 years old:")
    print(f"Birth date: {django_date_18}")
    print(f"Age: {age_18}")
    print(f"Is valid (>= 18): {age_18 >= 18}")
    print()

    # Test case 3: What the user might have tried
    print("Possible user input scenarios:")
    test_dates = [
        "2005-09-30",  # Should be valid (20 years old)
        "2006-09-30",  # Should be valid (19 years old)
        "2007-09-30",  # Should be valid (18 years old)
        "2007-10-01",  # Should be invalid (17 years old)
        "2008-01-01",  # Should be invalid (17 years old)
    ]

    for test_date_str in test_dates:
        test_date = date.fromisoformat(test_date_str)
        test_age = today.year - test_date.year - ((today.month, today.day) < (test_date.month, test_date.day))
        print(f"Date: {test_date}, Age: {test_age}, Valid: {test_age >= 18}")

if __name__ == "__main__":
    test_frontend_date_handling()