# Checklist de Verificação - Singleton SiteConfiguration

Use este checklist para verificar se o padrão singleton está funcionando corretamente.

## Testes Automáticos

### 1. Execute o Script de Teste
```bash
cd C:\Users\danilo.ecopel\Documents\PROJETOS\PYTHON\sys_passo\back
venv\Scripts\python.exe test_singleton_admin.py
```

**Resultado esperado:**
```
Status: SUCESSO - Padrão Singleton funcionando corretamente!
Total de configurações no banco: 1
```

## Testes Manuais no Django Admin

### 2. Acesse a Lista de Configurações
```
URL: http://localhost:8000/admin/sitehome/siteconfiguration/
```

**Comportamento esperado:**
- Deve redirecionar automaticamente para a página de edição
- Não deve mostrar lista de configurações

### 3. Verifique a Página de Edição
```
URL: http://localhost:8000/admin/sitehome/siteconfiguration/1/change/
```

**Verifique:**
- [ ] Mensagem azul informativa aparece no topo
- [ ] Título da página é "Configuração do Site"
- [ ] Não há botão "Salvar e adicionar outro"
- [ ] Não há botão "Deletar"
- [ ] Há botão "Salvar"
- [ ] Há botão "Salvar e continuar editando"

### 4. Tente Adicionar Nova Configuração
```
URL: http://localhost:8000/admin/sitehome/siteconfiguration/add/
```

**Comportamento esperado:**
- Não deve haver link "Adicionar Configuração" no menu lateral
- Não deve haver botão "+" ao lado de "Configuração do Site"
- Acessar /add/ diretamente deve retornar erro 403 (Forbidden)

### 5. Verifique os Estilos CSS

**Verifique:**
- [ ] Preview da logo tem borda arredondada e sombra
- [ ] Fieldsets têm cabeçalhos com gradiente azul
- [ ] Mensagem de ajuda tem fundo azul claro
- [ ] Animação suave ao carregar a página

## Testes via Django Shell

### 6. Teste no Django Shell
```bash
cd C:\Users\danilo.ecopel\Documents\PROJETOS\PYTHON\sys_passo\back
venv\Scripts\python.exe manage.py shell
```

```python
from sitehome.models import SiteConfiguration

# Teste 1: Get configuration
config = SiteConfiguration.objects.get_configuration()
print(f"ID: {config.pk}")  # Deve ser 1

# Teste 2: Count
count = SiteConfiguration.objects.count()
print(f"Total: {count}")  # Deve ser 1

# Teste 3: Try to delete
try:
    config.delete()
except Exception as e:
    print(f"Deleção bloqueada: {e}")  # Deve dar erro

# Teste 4: Multiple gets
config1 = SiteConfiguration.objects.get_configuration()
config2 = SiteConfiguration.objects.get_configuration()
print(f"Mesmo objeto? {config1.pk == config2.pk}")  # Deve ser True
```

## Verificação de Arquivos

### 7. Verifique se os Arquivos Existem

**Backend:**
- [ ] `C:\Users\danilo.ecopel\Documents\PROJETOS\PYTHON\sys_passo\back\sitehome\models.py` (modificado)
- [ ] `C:\Users\danilo.ecopel\Documents\PROJETOS\PYTHON\sys_passo\back\sitehome\admin.py` (modificado)
- [ ] `C:\Users\danilo.ecopel\Documents\PROJETOS\PYTHON\sys_passo\back\sitehome\static\admin\sitehome\siteconfiguration.css` (novo)
- [ ] `C:\Users\danilo.ecopel\Documents\PROJETOS\PYTHON\sys_passo\back\sitehome\templates\admin\sitehome\siteconfiguration\change_form.html` (novo)
- [ ] `C:\Users\danilo.ecopel\Documents\PROJETOS\PYTHON\sys_passo\back\test_singleton_admin.py` (novo)
- [ ] `C:\Users\danilo.ecopel\Documents\PROJETOS\PYTHON\sys_passo\back\sitehome\SINGLETON_README.md` (novo)
- [ ] `C:\Users\danilo.ecopel\Documents\PROJETOS\PYTHON\sys_passo\back\sitehome\CHECKLIST_SINGLETON.md` (este arquivo)

### 8. Colete Arquivos Estáticos

Se os estilos não aparecerem, execute:
```bash
cd C:\Users\danilo.ecopel\Documents\PROJETOS\PYTHON\sys_passo\back
venv\Scripts\python.exe manage.py collectstatic --noinput
```

## Testes de Funcionalidade

### 9. Teste de Atualização
1. Acesse a página de edição
2. Altere o nome da empresa
3. Clique em "Salvar"
4. Verifique se a mudança foi salva
5. Verifique se o ID continua sendo 1

### 10. Teste de Múltiplas Abas
1. Abra a página de edição em 2 abas do navegador
2. Edite campos diferentes em cada aba
3. Salve em ambas
4. Verifique que apenas uma configuração existe
5. A última alteração deve prevalecer

## Comportamentos Garantidos

### Checklist Final
- [ ] Apenas 1 configuração existe no banco
- [ ] Sempre com ID = 1
- [ ] Não é possível adicionar nova configuração
- [ ] Não é possível deletar a configuração
- [ ] Redirecionamento automático funciona
- [ ] Mensagens informativas aparecem
- [ ] CSS customizado está aplicado
- [ ] Template customizado está sendo usado
- [ ] Botões desnecessários estão ocultos

## Resolução de Problemas

### CSS não aparece
```bash
cd C:\Users\danilo.ecopel\Documents\PROJETOS\PYTHON\sys_passo\back
venv\Scripts\python.exe manage.py collectstatic --noinput
# Reinicie o servidor
```

### Redirecionamento não funciona
- Verifique se o admin.py tem o método `changelist_view()`
- Verifique se há erros no console do Django
- Limpe o cache do navegador (Ctrl+Shift+R)

### Mensagem não aparece
- Verifique se o método `change_view()` está implementado
- Verifique se o middleware de messages está ativo
- Limpe o cache do navegador

### Template customizado não carrega
- Verifique se o caminho está correto
- Certifique-se que `APP_DIRS = True` em settings.py
- Reinicie o servidor Django

### Múltiplas configurações existem
```python
# No Django shell
from sitehome.models import SiteConfiguration

# Delete extras mantendo apenas ID=1
SiteConfiguration.objects.exclude(pk=1).delete()

# Verifique
print(SiteConfiguration.objects.count())  # Deve ser 1
```

## Performance

### Otimizações Recomendadas

Se você acessa a configuração frequentemente, considere adicionar cache:

```python
from django.core.cache import cache

def get_site_config():
    """Get configuration with caching"""
    config = cache.get('site_configuration')
    if config is None:
        config = SiteConfiguration.objects.get_configuration()
        cache.set('site_configuration', config, 3600)  # 1 hora
    return config
```

Limpe o cache ao salvar:
```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache

@receiver(post_save, sender=SiteConfiguration)
def clear_config_cache(sender, instance, **kwargs):
    cache.delete('site_configuration')
```

## Status Esperado

### Banco de Dados
```sql
SELECT COUNT(*) FROM sitehome_siteconfiguration;
-- Resultado: 1

SELECT id FROM sitehome_siteconfiguration;
-- Resultado: 1
```

### Admin
- URL `/admin/sitehome/siteconfiguration/` → redirect para `/admin/sitehome/siteconfiguration/1/change/`
- Sem link "Adicionar" no admin
- Sem botão "Deletar" na página de edição

### Código
- `SiteConfiguration.objects.count()` → 1
- `SiteConfiguration.objects.get_configuration().pk` → 1
- `SiteConfiguration.load().pk` → 1

---

**Data da última verificação:** _____________

**Verificado por:** _____________

**Todos os testes passaram?** [ ] Sim  [ ] Não

**Observações:**
_______________________________________________________
_______________________________________________________
_______________________________________________________
