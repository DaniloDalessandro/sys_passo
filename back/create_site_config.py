"""
Script to create initial SiteConfiguration data.
Run this with: python manage.py shell < create_site_config.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from sitehome.models import SiteConfiguration

# Create or update the configuration
config, created = SiteConfiguration.objects.get_or_create(pk=1)

config.company_name = 'Sys Passo'
config.phone = '(11) 1234-5678'
config.email = 'contato@syspasso.com'
config.address = 'São Paulo, SP - Brasil'
config.whatsapp = '5511987654321'
config.facebook_url = 'https://facebook.com/syspasso'
config.instagram_url = 'https://instagram.com/syspasso'
config.linkedin_url = 'https://linkedin.com/company/syspasso'
config.hero_title = 'Gestão Inteligente de Frotas e Veículos'
config.hero_subtitle = 'Controle total sobre sua frota com tecnologia de ponta e soluções personalizadas'
config.about_text = """
Somos uma empresa especializada em gestão de frotas e transporte, oferecendo soluções
completas para otimizar operações, reduzir custos e aumentar a eficiência da sua empresa.

Com anos de experiência no mercado, desenvolvemos um sistema robusto e intuitivo que
facilita o controle de veículos, motoristas, manutenções e muito mais.

Nossa missão é transformar a gestão de frotas através da tecnologia, proporcionando
ferramentas que tornam o dia a dia mais produtivo e seguro.
""".strip()

config.save()

if created:
    print('[SUCCESS] Site configuration created successfully!')
else:
    print('[SUCCESS] Site configuration updated successfully!')

print(f'\nCompany: {config.company_name}')
print(f'Email: {config.email}')
print(f'Phone: {config.phone}')
