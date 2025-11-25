# TFG II - Interface Web para Sistema de Monitoramento Animal

Frontend desenvolvido como parte do Trabalho Final de Graduação do curso de Sistemas de Informação da Universidade Franciscana.

## Sobre o Projeto

Esta aplicação web fornece interface moderna e intuitiva para o sistema de classificação automática de tickets de suporte técnico em equipamentos de monitoramento animal. A interface permite que técnicos e gestores visualizem tickets classificados por machine learning, gerenciem status em tempo real e acompanhem histórico completo de atendimentos.

### Problema Resolvido

Técnicos de suporte em fazendas de gado leiteiro precisam de acesso rápido e visual a informações críticas sobre falhas em equipamentos de monitoramento. A interface desenvolvida:

1. Apresenta dashboard executivo com estatísticas em tempo real
2. Exibe classificações automáticas de urgência e área técnica
3. Permite atualização de status com histórico rastreável
4. Oferece filtros inteligentes por múltiplos critérios
5. Garante experiência responsiva em dispositivos móveis

A interface elimina a necessidade de consultas manuais ao banco de dados e centraliza todas as operações em uma aplicação web moderna e intuitiva.

## Tecnologias Utilizadas

- **React 18.3.1** - Biblioteca JavaScript para construção de interfaces
- **React Router DOM 7.1.1** - Roteamento declarativo para Single Page Application
- **Vite 6.0.5** - Build tool de nova geração com HMR instantâneo
- **Tailwind CSS 3.4.17** - Framework CSS utility-first para estilização rápida
- **Axios 1.7.9** - Cliente HTTP para comunicação com API REST
- **Lucide React 0.469.0** - Biblioteca de ícones SVG otimizados
- **Context API** - Gerenciamento de estado global para autenticação

## Como Funciona a Interface

A aplicação é uma Single Page Application (SPA) que se comunica com o backend via API REST. Toda navegação acontece no lado do cliente sem recarregamento de página, proporcionando experiência fluida e responsiva.

### Arquitetura de Componentes

A aplicação segue arquitetura baseada em componentes React com separação clara de responsabilidades:

1. **Context Layer**: AuthContext gerencia estado de autenticação globalmente
2. **Page Layer**: Componentes de página (Dashboard, Login, TicketDetail)
3. **Protected Routes**: HOC que protege rotas autenticadas
4. **API Layer**: Axios com interceptors para headers JWT automáticos

### Sistema de Autenticação

O frontend implementa autenticação JWT com as seguintes características:

- **Token Storage**: JWT armazenado em localStorage para persistência
- **Auto-login**: Verifica token válido ao carregar aplicação
- **Protected Routes**: Redireciona para login se token inválido/ausente
- **Logout Seguro**: Limpa token e redireciona para tela de login
- **Token Refresh**: Token válido por 24 horas (gerenciado pelo backend)

### Design System

Interface construída com design system proprietário baseado em Tailwind CSS:

**Paleta de Cores:**
- Primary: Cyan 500 (#06b6d4) → Emerald 500 (#10b981) gradiente
- Urgência Alta: Red 500 (#ef4444) com gradiente para Red 600
- Urgência Média: Orange 500 (#f97316) com gradiente para Amber 500
- Urgência Baixa: Green 500 (#22c55e) com gradiente para Emerald 500
- Background: Slate 50 → Cyan 50 → Emerald 50 (gradiente suave)

**Componentes Customizados:**
- `.btn-primary`: Botão principal com gradiente e hover effects
- `.btn-secondary`: Botão secundário com borda e hover states
- `.card`: Card com backdrop blur e shadow animado
- `.input`: Input com focus ring e transições suaves
- `.badge-{type}`: Badges coloridos para urgência e área

### Paginação Inteligente

Sistema de paginação adaptativo que mostra até 5 páginas simultaneamente:

- Se total ≤ 5 páginas: Mostra todas (1 2 3 4 5)
- Se página atual ≤ 3: Mostra primeiras 5 (1 2 3 4 5)
- Se página atual ≥ total-2: Mostra últimas 5 (6 7 8 9 10)
- Caso contrário: Centraliza em página atual (3 4 5 6 7)

Cada página exibe 10 tickets com contador "Mostrando X a Y de Z".

## Pré-requisitos

- Node.js 18 ou superior
- npm ou yarn
- Backend rodando em http://localhost:3333
- Navegador moderno com suporte a ES6+ (Chrome 90+, Firefox 88+, Safari 14+)

## Instalação

Clone o repositório e instale as dependências:
```bash
git clone https://github.com/seu-usuario/tfg2-frontend.git
cd tfg2-frontend
npm install
```

Configure o proxy para o backend editando `vite.config.js` (já configurado por padrão):
```javascript
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3333'
    }
  }
}
```

Certifique-se de que as imagens estão presentes em `/public/images/`:
- `hero-farm.jpg` - Imagem da tela de login (1920x1080px recomendado)
- `empty-state.jpg` - Imagem para estado vazio do dashboard
- `vaquinha-icone.png` - Favicon 32x32px

## Executando o Projeto

Modo de desenvolvimento com Hot Module Replacement:
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:5173`

Build para produção:
```bash
npm run build
```

Preview do build de produção:
```bash
npm run preview
```

## Estrutura da Aplicação

### Componentes Principais

**AuthContext.jsx**
Context Provider que gerencia estado global de autenticação:
- `user`: Objeto do usuário logado
- `token`: JWT token para requisições
- `login(email, password)`: Função assíncrona de login
- `register(email, password, role)`: Função assíncrona de registro
- `logout()`: Limpa token e estado
- `loading`: Flag de carregamento inicial

**ProtectedRoute.jsx**
Higher-Order Component que protege rotas autenticadas:
```jsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```
Redireciona para `/login` se token ausente/inválido.

### Páginas

**Login.jsx**
Tela de autenticação com design split-screen:
- Lado esquerdo: Formulário de login
- Lado direito: Imagem hero da fazenda
- Validações: Email válido, senha mínima
- Link para tela de registro
- Feedback visual de erros

**Dashboard.jsx**
Interface principal do sistema com:
- Cards de estatísticas (total, urgências, status)
- Filtros por urgência, área e status
- Lista paginada de tickets
- Botão de criação de novo ticket
- Modal de criação com classificação ML
- Sidebar com navegação e logout

**TicketDetail.jsx**
Visualização detalhada de ticket individual:
- Informações completas (descrição, fazenda, data)
- Badges de urgência, área e status
- Card explicativo sobre ML
- Histórico completo de mudanças com timeline
- Botões de ação contextuais (Iniciar/Finalizar/Reabrir)
- Card lateral com informações do modelo ML

## Rotas da Aplicação
```javascript
/ (Login)
├── Rota pública
├── Redireciona para /dashboard se autenticado
└── Formulário de login

/dashboard (Dashboard)
├── Rota protegida (requer autenticação)
├── Exibe estatísticas e lista de tickets
├── Filtros: urgency, area, status
└── Modal de criação de tickets

/ticket/:id (TicketDetail)
├── Rota protegida (requer autenticação)
├── Exibe detalhes completos do ticket
├── Histórico de mudanças
└── Ações de mudança de status
```

## Integração com Backend

### Endpoints Consumidos

Todas as requisições incluem automaticamente o header `Authorization: Bearer {token}` via interceptor do Axios.

**Autenticação**
```javascript
// Login
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: object }

// Registro (não utilizado na versão final)
POST /api/auth/register
Body: { email: string, password: string, role: string }
Response: { msg: string }
```

**Tickets**
```javascript
// Listar tickets (com filtros opcionais)
GET /api/tickets?urgency=high&area=collar&status=open
Response: Array<Ticket>

// Criar ticket
POST /api/tickets
Body: { farm_code: string, description: string }
Response: Ticket (com classificações ML)

// Buscar ticket individual
GET /api/tickets/:id
Response: Ticket

// Atualizar status
PUT /api/tickets/:id
Body: { status: 'open' | 'progress' | 'closed' }
Response: { msg: string }

// Histórico do ticket
GET /api/tickets/:id/history
Response: Array<HistoryEntry>
```

**Fazendas**
```javascript
// Listar fazendas
GET /api/farms
Response: Array<Farm>
```

### Estrutura de Dados

**Ticket Object:**
```typescript
{
  id: number
  farm_id: number
  farm_code: string
  description: string
  urgency: 'low' | 'medium' | 'high'
  area: 'collar' | 'antenna' | 'internet' | 'power'
  status: 'open' | 'progress' | 'closed'
  predicted_urgency: string
  predicted_area: string
  model_accuracy: string (0-1)
  created_at: string (ISO 8601)
}
```

**History Entry:**
```typescript
{
  id: number
  ticket_id: number
  note: string
  changed_at: string (ISO 8601)
}
```

## Fluxo de Funcionamento
```
1. Usuário acessa aplicação (/)
   ↓
2. AuthContext verifica token em localStorage
   ↓
3a. Se token válido → Redireciona para /dashboard
3b. Se token inválido/ausente → Mantém em /login
   ↓
4. Usuário faz login
   ↓
5. Frontend envia POST /api/auth/login
   ↓
6. Backend valida e retorna JWT
   ↓
7. Frontend salva token em localStorage
   ↓
8. AuthContext atualiza estado global
   ↓
9. Aplicação redireciona para /dashboard
   ↓
10. Dashboard faz GET /api/tickets e GET /api/farms
   ↓
11. Renderiza cards de estatísticas e lista
   ↓
12. Usuário cria novo ticket
   ↓
13. Frontend envia POST /api/tickets com token
   ↓
14. Backend classifica via ML e retorna resultado
   ↓
15. Frontend exibe modal de sucesso com badges
   ↓
16. Lista atualiza automaticamente
   ↓
17. Usuário clica em ticket
   ↓
18. Navega para /ticket/:id
   ↓
19. Carrega detalhes e histórico
   ↓
20. Usuário atualiza status
   ↓
21. Frontend envia PUT /api/tickets/:id
   ↓
22. Backend atualiza e registra no histórico
   ↓
23. Frontend recarrega dados atualizados
```

## Estrutura do Projeto
```
tfg2-frontend/
├── public/
│   ├── images/
│   │   ├── hero-farm.jpg           # Imagem do login (1.5MB)
│   │   ├── empty-state.jpg         # Estado vazio (200KB)
│   │   └── vaquinha-icone.png      # Favicon (5KB)
│   └── index.html                  # HTML base
├── src/
│   ├── context/
│   │   └── AuthContext.jsx         # Context de autenticação
│   ├── pages/
│   │   ├── Login.jsx               # Tela de login (250 linhas)
│   │   ├── Dashboard.jsx           # Dashboard principal (450 linhas)
│   │   └── TicketDetail.jsx        # Detalhes do ticket (240 linhas)
│   ├── App.jsx                     # Rotas e layout principal
│   ├── main.jsx                    # Entry point do React
│   ├── index.css                   # Estilos globais + Tailwind
│   └── ProtectedRoute.jsx          # HOC para rotas protegidas
├── .env                            # Variáveis de ambiente (não commitado)
├── vite.config.js                  # Configuração do Vite
├── tailwind.config.js              # Configuração do Tailwind
├── postcss.config.js               # PostCSS para Tailwind
├── package.json                    # Dependências e scripts
└── README.md                       # Este arquivo
```

## Observações Técnicas

### Performance e Otimização

**Build Otimizado:**
- Vite gera chunks separados para cada rota (code splitting)
- Imagens otimizadas com lazy loading
- CSS purgado automaticamente pelo Tailwind (apenas classes usadas)
- Build final ~200KB gzipped (excluindo imagens)

**Renderização:**
- React 18 com Concurrent Features
- Componentes otimizados para re-render mínimo
- useEffect com dependências corretas
- Memoização implícita via arrow functions estáveis

### Segurança no Frontend

**Proteção de Rotas:**
- ProtectedRoute verifica autenticação antes de renderizar
- Redirecionamento automático para login se token inválido
- Token verificado a cada navegação

**Armazenamento Seguro:**
- Token JWT em localStorage (aceito para aplicações internas)
- Nenhuma informação sensível além do token
- Logout limpa completamente o storage

**Validações Client-Side:**
- Email validado com regex RFC 5322 simplificado
- Descrição de ticket mínima de 10 caracteres
- Farm code obrigatório antes de criar ticket
- Feedback imediato de erros ao usuário

### Responsividade

Interface totalmente responsiva com breakpoints Tailwind:

- **Mobile (< 640px)**: Layout de coluna única, sidebar escondida
- **Tablet (640px - 1024px)**: Cards em 2 colunas, filtros em linha
- **Desktop (> 1024px)**: Grid de 3 colunas, sidebar visível

Testado em:
- Chrome 120+ (Desktop/Mobile)
- Firefox 121+ (Desktop)
- Safari 17+ (Desktop/iOS)
- Edge 120+ (Desktop)

### Acessibilidade

**WCAG 2.1 Level AA:**
- Contraste de cores ≥ 4.5:1 em todos os textos
- Focus states visíveis em todos os elementos interativos
- Labels semânticos em formulários
- Navegação por teclado funcional
- Estados de loading com indicadores visuais

**Screen Readers:**
- Alt text em todas as imagens
- ARIA labels em botões de ícone
- Landmarks semânticos (header, main, nav)

### Limitações Conhecidas

**Browser Storage Limitations:**
- localStorage tem limite de ~5MB por domínio
- Token JWT tipicamente ~500 bytes (sem risco)
- Navegação privada pode bloquear localStorage

**Network Requirements:**
- Aplicação requer conexão constante com backend
- Sem modo offline implementado
- Timeout de requisições: 30 segundos (padrão Axios)

**Browser Compatibility:**
- Não suporta Internet Explorer (descontinuado)
- Requer JavaScript habilitado
- CSS Grid e Flexbox necessários

## Exemplo de Uso Completo

### Fluxo de Usuário Típico

**1. Acesso Inicial**
```
Usuário digita: http://localhost:5173
↓
Sistema verifica token em localStorage
↓
Não encontrado → Exibe tela de login
```

**2. Login**
```
Usuário preenche:
- Email: itamar@gmail.com
- Senha: 123456
↓
Clica "Entrar"
↓
POST /api/auth/login
↓
Resposta: { token: "eyJhbGc...", user: {...} }
↓
Token salvo em localStorage
↓
Redirecionamento para /dashboard
```

**3. Visualização do Dashboard**
```
Carrega GET /api/tickets
Carrega GET /api/farms
↓
Renderiza:
- 31 tickets totais
- 14 alta urgência
- 11 média urgência
- 6 baixa urgência
- 16 abertos, 11 em progresso, 4 fechados
↓
Lista paginada com 10 tickets por página
```

**4. Criação de Ticket**
```
Usuário clica "Novo Ticket"
↓
Modal abre
↓
Usuário preenche:
- Descrição: "coleira número 47 apresentando superaquecimento severo e bateria inchada com risco de explosão"
- Fazenda: Faz001
↓
Clica "Criar Ticket"
↓
POST /api/tickets { farm_code: "Faz001", description: "..." }
↓
Backend classifica via ML
↓
Resposta: { urgency: "high", area: "collar", ... }
↓
Modal exibe:
- Badge vermelha: "Urgência: Alta"
- Badge roxa: "Área: Coleira"
- Auto-fecha em 2 segundos
↓
Lista atualiza com novo ticket no topo
```

**5. Visualização de Detalhes**
```
Usuário clica no ticket #32
↓
Navegação para /ticket/32
↓
GET /api/tickets/32
GET /api/tickets/32/history
↓
Renderiza:
- Descrição completa
- Fazenda: Faz001
- Data: 24/11/2025 às 02:47
- Status: Aberto
- Histórico: "Ticket criado"
```

**6. Mudança de Status**
```
Usuário clica "Iniciar Atendimento"
↓
PUT /api/tickets/32 { status: "progress" }
↓
Backend atualiza e registra histórico
↓
Página recarrega dados
↓
Status muda para "Em Progresso" (badge amarela)
↓
Histórico adiciona: "Status alterado para: progress"
```

**7. Filtros**
```
Usuário seleciona:
- Urgência: Alta
- Área: Coleira
- Status: Em Progresso
↓
Lista filtra client-side
↓
Exibe apenas tickets que correspondem
↓
Usuário clica "Limpar Filtros"
↓
Lista volta ao estado original
```

**8. Logout**
```
Usuário clica "Sair" na sidebar
↓
localStorage.removeItem('token')
↓
AuthContext limpa estado
↓
Redirecionamento para /login
↓
Próximo acesso requer nova autenticação
```

## Scripts Disponíveis
```bash
# Desenvolvimento com HMR
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview

# Análise do bundle
npm run build -- --mode=analyze
```

## Variáveis de Ambiente

Crie arquivo `.env` na raiz (opcional):
```env
VITE_API_URL=http://localhost:3333
VITE_APP_TITLE=AgroTech Monitoramento
```

Acesse via `import.meta.env.VITE_API_URL`

## Troubleshooting

**Problema: "Failed to fetch" ao fazer login**
- Verifique se backend está rodando em localhost:3333
- Confirme configuração de proxy em vite.config.js
- Verifique CORS no backend (deve aceitar localhost:5173)

**Problema: Imagens não aparecem**
- Confirme arquivos em /public/images/
- Verifique nomes exatos (case-sensitive)
- Limpe cache do navegador (Ctrl+Shift+R)

**Problema: Token expirado constantemente**
- Backend configurado para 24h de validade
- Verifique se JWT_SECRET está configurado no backend
- Faça logout e login novamente

**Problema: "Invalid Date" no histórico**
- Backend deve retornar campo `changed_at` (não `created_at`)
- Verifique estrutura da tabela history no MySQL
- Execute script createTables.sql novamente se necessário

**Problema: Paginação não funciona**
- Limpe cache do Vite: `rm -rf node_modules/.vite`
- Recarregue navegador com Ctrl+Shift+R
- Verifique console do DevTools (F12) para erros JavaScript

**Problema: Tailwind classes não funcionam**
- Execute `npm install` novamente
- Verifique se postcss.config.js existe
- Reinicie servidor de desenvolvimento

**Problema: Botões não respondem**
- Abra DevTools (F12) e verifique Console
- Procure por erros JavaScript em vermelho
- Verifique se evento onClick está correto no código
**Recursos Visuais:**
- Ícone da vaca: Dighital - Flaticon
- Imagem hero fazenda: Unsplash (Fotógrafo: [nome])
- Empty state: Undraw.co illustrations

**Bibliotecas Open Source:**
- React - Meta (Facebook)
- Vite - Evan You
- Tailwind CSS - Tailwind Labs
- Lucide Icons - Lucide Contributors

## Autor

**Itamar Alves Ferreira Júnior**  
Curso de Sistemas de Informação  
Universidade Franciscana  
Santa Maria, RS, Brasil  
cdajuniorf@gmail.com
## Licença

Este projeto foi desenvolvido para fins acadêmicos como Trabalho Final de Graduação. O código está disponível sob licença MIT para fins educacionais.

---
Para mais informações sobre o backend, consulte: [tfg2-backend](https://github.com/ItamarJuniorDEV/animal-monitoring-support-system)