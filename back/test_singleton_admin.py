"""
Script de teste para verificar o padrão Singleton do SiteConfiguration.

Execute este script para verificar se:
1. Apenas uma configuração pode existir
2. A configuração é criada automaticamente
3. Não é possível deletar a configuração
4. Múltiplas tentativas de save mantêm pk=1
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from sitehome.models import SiteConfiguration
from django.core.exceptions import ValidationError


def test_singleton_pattern():
    """Test the singleton pattern implementation"""

    print("=" * 80)
    print("TESTANDO PADRÃO SINGLETON - SiteConfiguration")
    print("=" * 80)
    print()

    # Test 1: Get or create configuration
    print("1. Testando get_configuration()...")
    config1 = SiteConfiguration.objects.get_configuration()
    print(f"   Configuração obtida: ID={config1.pk}")
    print(f"   Nome da empresa: {config1.company_name if config1.company_name else '(não configurado)'}")
    print()

    # Test 2: Verify singleton
    print("2. Verificando se é singleton...")
    config2 = SiteConfiguration.objects.get_configuration()
    print(f"   Segunda chamada retorna o mesmo objeto? {config1.pk == config2.pk}")
    print(f"   ID da primeira: {config1.pk}, ID da segunda: {config2.pk}")
    print()

    # Test 3: Try to update via save
    print("3. Tentando múltiplas atualizações...")
    config1.company_name = "Teste de Atualização 1"
    config1.save()
    print(f"   Após save(), pk={config1.pk} (deve ser sempre 1)")

    total_configs = SiteConfiguration.objects.all().count()
    print(f"   Total de configurações no banco: {total_configs} (deve ser 1)")
    print()

    # Test 4: Try to delete
    print("4. Tentando deletar a configuração...")
    try:
        config1.delete()
        print("   ERRO: Deleção foi permitida! (não deveria)")
    except ValidationError as e:
        print(f"   Deleção bloqueada corretamente: {str(e)}")
    print()

    # Test 5: Verify pk is always 1 via get_configuration
    print("5. Verificando múltiplas chamadas get_configuration()...")
    for i in range(3):
        test_config = SiteConfiguration.objects.get_configuration()
        test_config.company_name = f"Teste {i}"
        test_config.save()
        print(f"   Tentativa {i+1}: pk={test_config.pk}")

    total_configs = SiteConfiguration.objects.all().count()
    print(f"   Total de configurações após múltiplas tentativas: {total_configs}")
    print()

    # Test 6: Load method
    print("6. Testando método load()...")
    loaded_config = SiteConfiguration.load()
    print(f"   Configuração carregada: ID={loaded_config.pk}")
    print(f"   Nome: {loaded_config.company_name}")
    print()

    # Summary
    print("=" * 80)
    print("RESUMO DOS TESTES")
    print("=" * 80)
    final_count = SiteConfiguration.objects.all().count()
    print(f"Total de configurações no banco: {final_count}")

    if final_count == 1:
        print("Status: SUCESSO - Padrão Singleton funcionando corretamente!")
    else:
        print(f"Status: ERRO - Existem {final_count} configurações (deveria ser 1)")

    # Show current configuration
    current_config = SiteConfiguration.objects.get(pk=1)
    print()
    print("Configuração atual:")
    print(f"  - ID: {current_config.pk}")
    print(f"  - Nome da Empresa: {current_config.company_name}")
    print(f"  - Email: {current_config.email}")
    print(f"  - Telefone: {current_config.phone}")
    print(f"  - Criado em: {current_config.created_at}")
    print(f"  - Atualizado em: {current_config.updated_at}")
    print()


if __name__ == '__main__':
    test_singleton_pattern()
