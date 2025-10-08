# Como Configurar as Informações do Site

## Acesso ao Django Admin

1. **Certifique-se de que o servidor Django está rodando:**
   ```bash
   cd back
   python manage.py runserver
   ```

2. **Acesse o Django Admin:**
   - URL: http://localhost:8000/admin/
   - Faça login com suas credenciais de superusuário

3. **Navegue até "Configurações do Site":**
   - No menu lateral, procure por "SITEHOME"
   - Clique em "Configurações do Site"

## Campos Disponíveis para Edição

### 📋 Informações da Empresa
- **Nome da Empresa**: Nome oficial que aparece no site
- **Logo**: Upload de imagem da logo (JPG, PNG)
  - Preview da logo é mostrado após upload

### 📞 Informações de Contato
- **Telefone**: Telefone principal da empresa
- **E-mail**: Email de contato principal
- **Endereço**: Endereço completo da empresa
- **WhatsApp**: Número do WhatsApp (apenas números)

### 🌐 Redes Sociais (Opcional)
- **Facebook**: URL completa da página do Facebook
- **Instagram**: URL completa do perfil do Instagram
- **LinkedIn**: URL completa da página do LinkedIn

### 📝 Conteúdo da Página Inicial
- **Título Principal**: Título principal da hero section
- **Subtítulo**: Subtítulo da hero section
- **Texto Sobre**: Texto descritivo sobre a empresa (seção "Sobre")

## Características Especiais

### Singleton Pattern
- **Apenas UMA configuração existe**: O sistema garante que exista apenas uma configuração de site
- **Não pode ser deletada**: A configuração não pode ser removida, apenas editada
- **ID sempre é 1**: A configuração sempre terá ID = 1

### Preview da Logo
- Após fazer upload da logo, um preview é mostrado automaticamente
- Tamanho máximo de preview: 300x200 pixels
- A logo é salva em: `media/site_config/logos/`

## Como Editar

1. Acesse http://localhost:8000/admin/sitehome/siteconfiguration/
2. Clique no único registro existente ("Sys Passo - Configuração do Site")
3. Edite os campos desejados
4. Clique em "Salvar" ou "Salvar e continuar editando"
5. As alterações aparecerão imediatamente no site público

## Onde as Informações Aparecem no Site

### Site Público (`/sitehome`)

**Navbar:**
- Nome da Empresa (ou Logo se enviada)

**Hero Section:**
- Título Principal
- Subtítulo

**Rodapé:**
- Nome da Empresa
- Telefone (formatado)
- Email
- Endereço
- WhatsApp (link clicável)
- Links para redes sociais (se preenchidos)

**Seção Sobre:**
- Texto Sobre

## API Endpoint

As configurações também estão disponíveis via API:
```
GET http://localhost:8000/api/site/configuration/
```

Resposta:
```json
{
  "success": true,
  "data": {
    "company_name": "Sys Passo",
    "logo_url": "/media/site_config/logos/logo.png",
    "hero_title": "Gestão Inteligente de Frotas",
    "hero_subtitle": "Controle completo da sua frota",
    "about_text": "Texto sobre a empresa...",
    "phone": "(00) 00000-0000",
    "email": "contato@syspasso.com",
    "address": "Endereço completo",
    "whatsapp": "00000000000",
    "facebook_url": "https://facebook.com/...",
    "instagram_url": "https://instagram.com/...",
    "linkedin_url": "https://linkedin.com/..."
  }
}
```

## Dicas

1. **Logo**: Recomenda-se usar imagens PNG com fundo transparente
2. **WhatsApp**: Insira apenas números (DDD + número)
3. **URLs das Redes Sociais**: Use URLs completas começando com `https://`
4. **Texto Sobre**: Pode usar quebras de linha, serão preservadas no site
5. **Telefone**: Pode usar formatação com parênteses e traços

## Estrutura de Arquivos

```
back/
├── sitehome/
│   ├── models.py          # Modelo SiteConfiguration
│   ├── admin.py           # Admin customizado
│   ├── views.py           # API endpoint
│   └── serializers.py     # Serializer da API
└── media/
    └── site_config/
        └── logos/         # Logos enviadas
```

## Segurança

- ✅ Admin protegido por autenticação
- ✅ Apenas superusuários podem editar
- ✅ Validação de URLs
- ✅ Validação de formato de email
- ✅ Singleton pattern impede duplicação

## Suporte

Se encontrar problemas:
1. Verifique se o servidor Django está rodando
2. Verifique se você está logado como superusuário
3. Verifique os logs do Django para erros
4. Confira se a pasta `media/` tem permissões de escrita
