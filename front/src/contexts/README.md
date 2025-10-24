# Contexts - Gerenciamento de Estado

Esta pasta centraliza todo o gerenciamento de estado global da aplicação usando React Context API.

## 📁 Estrutura

```
contexts/
├── index.ts                    # Exportações centralizadas
├── AuthContext.tsx             # Contexto de autenticação
├── InterceptorContext.tsx      # Interceptor de requisições HTTP
└── README.md                   # Esta documentação
```

## 🔐 AuthContext

**Responsabilidade:** Gerenciar o estado de autenticação do usuário em toda a aplicação.

### Funcionalidades

- ✅ Login/Logout de usuários
- ✅ Armazenamento seguro de tokens (localStorage + cookies)
- ✅ Refresh automático de tokens expirados
- ✅ Sincronização entre múltiplas abas
- ✅ Cache de dados de autenticação (5 segundos)
- ✅ Verificação de expiração de tokens

### Uso

```tsx
import { useAuthContext } from '@/contexts'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthContext()

  return (
    <div>
      {isAuthenticated ? (
        <p>Olá, {user?.first_name}!</p>
      ) : (
        <button onClick={() => login(authData)}>Login</button>
      )}
    </div>
  )
}
```

### Estado Disponível

```typescript
{
  user: UserData | null           // Dados do usuário autenticado
  accessToken: string | null      // Token de acesso JWT
  isAuthenticated: boolean        // Estado de autenticação
  isLoading: boolean              // Estado de carregamento
  error: string | null            // Mensagens de erro
  login: Function                 // Função de login
  logout: Function                // Função de logout
  refreshAccessToken: Function    // Renovação manual de token
}
```

## 🔄 InterceptorContext

**Responsabilidade:** Interceptar todas as requisições HTTP para adicionar tokens de autenticação e renovar tokens expirados automaticamente.

### Funcionalidades

- ✅ Adiciona automaticamente o header `Authorization` em todas as requisições
- ✅ Detecta respostas 401 (não autorizado)
- ✅ Renova tokens expirados automaticamente
- ✅ Retry de requisições falhadas com novo token
- ✅ Gerenciamento de fila para requisições simultâneas durante refresh

### Arquitetura

O InterceptorContext sobrescreve a função `window.fetch` global para interceptar todas as requisições:

```
Request → Interceptor → Add Auth Header → API
                ↓ (401 Error)
         Refresh Token → Retry Request
```

### Como funciona

1. **Requisição inicial**: Adiciona o token de autenticação no header
2. **Erro 401**: Detecta que o token expirou
3. **Refresh token**: Solicita um novo token ao backend
4. **Retry**: Tenta novamente a requisição original com o novo token
5. **Fila**: Se múltiplas requisições falharem simultaneamente, apenas um refresh é feito

### Integração com AuthContext

O InterceptorContext usa `useAuthContext` para acessar as funções de refresh e logout:

```tsx
const { refreshAccessToken, logout } = useAuthContext()
```

## 📦 Importações Centralizadas

Use o arquivo `index.ts` para importações mais limpas:

```tsx
// ❌ Antes (importações múltiplas)
import { AuthProvider } from '@/contexts/AuthContext'
import { useAuthContext } from '@/contexts/AuthContext'
import { InterceptorProvider } from '@/contexts/InterceptorContext'

// ✅ Agora (importação centralizada)
import { AuthProvider, useAuthContext, InterceptorProvider } from '@/contexts'
```

## 🏗️ Estrutura de Providers

No arquivo `app/layout.tsx`, os providers são aninhados na seguinte ordem:

```tsx
<AuthProvider>
  <InterceptorProvider>
    <App />
  </InterceptorProvider>
</AuthProvider>
```

**Ordem importante:** AuthProvider deve envolver InterceptorProvider porque o interceptor depende do contexto de autenticação.

## 🎯 Boas Práticas

### 1. **Use hooks personalizados**
   ```tsx
   // ✅ Correto
   const { user } = useAuthContext()

   // ❌ Evite
   const context = useContext(AuthContext)
   ```

### 2. **Não crie múltiplos providers**
   - Cada contexto deve ter apenas um provider na raiz da aplicação
   - Evite envolver componentes individuais com providers

### 3. **Otimização de performance**
   - Os contextos usam `useMemo` e `useCallback` para evitar re-renderizações desnecessárias
   - Cache de 5 segundos para dados de autenticação

### 4. **Tratamento de erros**
   - Sempre verifique o estado `error` antes de fazer operações
   - Use o estado `isLoading` para exibir feedback ao usuário

## 🔒 Segurança

### Armazenamento de Tokens

- **localStorage**: Token de acesso e refresh
- **Cookies**: Backup dos tokens com SameSite=strict
- **Limpeza**: Logout remove todos os dados

### Renovação de Tokens

- Tokens são renovados automaticamente quando expiram
- Se o refresh falhar, o usuário é deslogado automaticamente
- Proteção contra múltiplas chamadas de refresh simultâneas

## 📚 Documentação Adicional

Para mais informações sobre:

- **Next.js App Router**: https://nextjs.org/docs/app
- **React Context**: https://react.dev/reference/react/useContext
- **JWT**: https://jwt.io/
