# TFG II - Sistema de Classificação Automática de Tickets para Monitoramento Animal

Sistema completo desenvolvido como Trabalho Final de Graduação II do curso de Sistemas de Informação da Universidade Franciscana. Automatiza a classificação de tickets de suporte técnico para equipamentos de monitoramento animal em fazendas de gado leiteiro utilizando técnicas de Processamento de Linguagem Natural e Aprendizado de Máquina.

**Autor:** Itamar Alves Ferreira Júnior  
**Orientador:** Prof. Alessandro André Mainardi de Oliveira  
**Instituição:** Universidade Franciscana - Santa Maria, RS  
**Ano:** 2025

---

## 📊 Resultados Alcançados

O sistema desenvolvido apresentou os seguintes resultados na fase de validação experimental:

- **Acurácia de 97,30%** na classificação de urgência (baixa, média, alta)
- **Acurácia de 99,90%** na classificação de tipo de equipamento (coleira, antena, internet, fonte)
- **33 testes automatizados** implementados com 100% de aprovação
- **Interface web responsiva** com autenticação JWT e dashboard em tempo real
- **API REST documentada** com 8 endpoints funcionais

---

## 🎯 Problema Abordado

Em sistemas de monitoramento animal para fazendas de gado leiteiro, cada animal utiliza uma coleira eletrônica que transmite dados sobre localização, saúde e comportamento. Estes dados são captados por antenas instaladas na propriedade, que dependem de infraestrutura de rede (Wi-Fi) e fontes de energia estáveis. Quando ocorre uma falha em qualquer componente do sistema, técnicos de suporte precisam:

1. Ler e interpretar a descrição textual do problema reportado
2. Identificar qual equipamento está afetado (coleira, antena, rede ou fonte de energia)
3. Determinar o nível de urgência do atendimento (baixa, média ou alta)
4. Encaminhar o chamado para a equipe técnica adequada

Este processo manual é lento, sujeito a interpretações divergentes e pode resultar em atrasos no atendimento de problemas críticos. O sistema desenvolvido automatiza completamente este fluxo utilizando classificadores Naive Bayes treinados com cinco mil exemplos sintéticos.

---

## 🏗️ Arquitetura do Sistema

O projeto está organizado em uma arquitetura cliente-servidor com separação clara entre backend e frontend:
```
animal-monitoring-support-system/
├── src/                  # Backend (API REST)
│   ├── controllers/      # Lógica de negócio
│   ├── routes/          # Definição de endpoints
│   ├── services/        # Serviço de classificação ML
│   ├── middlewares/     # Autenticação JWT
│   ├── ml/              # Modelos treinados e dados
│   ├── scripts/         # Utilitários e validação
│   └── config/          # Configuração do banco
│
├── frontend/            # Interface Web (React)
│   ├── src/
│   │   ├── pages/       # Componentes de página
│   │   ├── context/     # Gerenciamento de estado
│   │   └── App.jsx      # Roteamento principal
│   ├── public/          # Assets estáticos
│   └── package.json     # Dependências frontend
│
├── package.json         # Dependências backend
└── README.md           # Este arquivo
```

---

## 🚀 Tecnologias Utilizadas

### Backend (API REST)
- **Node.js 20.x** - Runtime JavaScript server-side
- **Express 5.1.0** - Framework web minimalista
- **MySQL 8.0** - Sistema de gerenciamento de banco de dados relacional
- **Natural** - Biblioteca de Processamento de Linguagem Natural para JavaScript
- **Naive Bayes** - Algoritmo de classificação probabilística
- **JWT (jsonwebtoken)** - Autenticação baseada em tokens
- **Bcrypt** - Criptografia de senhas com salt
- **Jest 30.2.0** - Framework de testes unitários e integração
- **Supertest 7.1.4** - Testes de APIs HTTP
- **Helmet** - Middleware de segurança para headers HTTP
- **Express Rate Limit** - Proteção contra ataques de força bruta

### Frontend (Interface Web)
- **React 18.3.1** - Biblioteca para construção de interfaces de usuário
- **Vite 6.0.5** - Build tool de nova geração com HMR instantâneo
- **React Router DOM 7.1.1** - Roteamento declarativo para Single Page Applications
- **Tailwind CSS 3.4.17** - Framework CSS utility-first
- **Axios 1.7.9** - Cliente HTTP para comunicação com API
- **Lucide React 0.469.0** - Biblioteca de ícones SVG otimizados
- **Context API** - Gerenciamento de estado global nativo do React

---

## 🤖 Funcionamento da Inteligência Artificial

O sistema utiliza dois classificadores Naive Bayes independentes e especializados, treinados com cinco mil exemplos sintéticos que representam situações típicas de suporte em sistemas de monitoramento animal.

### Classificador de Urgência

Este classificador analisa a descrição do problema buscando termos que indicam gravidade. A classificação segue três níveis:

**Urgência Alta:** Identifica situações críticas através de termos como "queimado", "explodiu", "inchado", "vazamento", "fumaça", "faísca", "cheiro forte", "derreteu". Estes problemas representam risco imediato aos equipamentos ou animais e requerem atenção urgente.

**Urgência Média:** Reconhece problemas intermitentes ou parciais através de expressões como "às vezes funciona", "intermitente", "instável", "ocasional", "não sincroniza", "lento". Estes problemas afetam a operação mas não representam risco imediato.

**Urgência Baixa:** Identifica situações de menor impacto através de termos como "LED apagado", "aviso", "notificação", "bateria fraca", "necessita calibração". Estes problemas podem ser tratados no fluxo normal de manutenção.

### Classificador de Área Técnica

Este classificador identifica qual equipamento está envolvido no problema através de vocabulário específico de cada categoria:

**Coleira (Collar):** Reconhece termos como "coleira", "bateria", "LED", "cinta", "fivela", "sensor", "acelerômetro", "GPS embutido".

**Antena (Antenna):** Identifica menções a "antena", "receptor", "cabo coaxial", "conector", "amplificador", "sinal fraco", "alcance".

**Internet:** Detecta problemas de rede através de "Wi-Fi", "roteador", "internet", "conexão", "IP", "DNS", "provedor", "fibra óptica".

**Fonte de Energia (Power):** Reconhece "fonte", "energia", "tomada", "voltagem", "corrente", "transformador", "disjuntor", "no-break".

### Cálculo de Confiança

Para cada classificação realizada, o sistema calcula a confiança da predição normalizando as probabilidades retornadas pelo algoritmo Naive Bayes. O valor de confiança (model_accuracy) varia entre zero e um, onde valores próximos a um indicam alta certeza na classificação. Descrições claras e específicas tipicamente resultam em confiança superior a noventa por cento, enquanto descrições ambíguas podem apresentar confiança inferior a setenta por cento. Este valor permite identificar situações onde revisão humana pode ser necessária.

### Dados de Treinamento

O conjunto de treinamento foi cuidadosamente elaborado para representar a diversidade de problemas encontrados em ambientes reais de fazendas de gado leiteiro. A distribuição dos cinco mil exemplos sintéticos é a seguinte:

**Distribuição por Tipo de Equipamento (relativamente balanceada):**
- Coleiras: 1075 exemplos (21,5%)
- Antenas: 1270 exemplos (25,4%)
- Internet: 1330 exemplos (26,6%)
- Fontes de Energia: 1325 exemplos (26,5%)

**Distribuição por Nível de Urgência (desbalanceada, reflete realidade operacional):**
- Urgência Baixa: 1180 exemplos (23,6%)
- Urgência Média: 520 exemplos (10,4%)
- Urgência Alta: 3300 exemplos (66,0%)

O desbalanceamento na urgência reflete a realidade operacional onde problemas graves são mais frequentemente reportados. Apesar deste desbalanceamento, o modelo mantém alta acurácia geral de 97,30% para classificação de urgência.

### Processo de Validação

A validação dos modelos foi realizada utilizando a metodologia de validação cruzada com divisão de oitenta por cento para treinamento e vinte por cento para teste. Do conjunto total de cinco mil exemplos, quatro mil foram utilizados para treinar os classificadores e mil foram reservados exclusivamente para teste. Os modelos não tiveram acesso aos exemplos de teste durante o treinamento, garantindo avaliação imparcial da capacidade de generalização.

Os modelos treinados são persistidos em arquivos JSON (model_urgency.json e model_area.json) para carregamento rápido nas inicializações subsequentes do servidor, reduzindo o tempo de inicialização de aproximadamente cinco segundos para instantâneo.

---

## 📦 Instalação e Configuração

### Pré-requisitos

Antes de iniciar a instalação, certifique-se de ter os seguintes softwares instalados no sistema:

- Node.js versão 20 ou superior
- MySQL Server 8.0 ou superior em execução
- npm (geralmente instalado junto com Node.js) ou yarn
- Git para clonar o repositório

### Clonando o Repositório
```bash
git clone https://github.com/ItamarJuniorDEV/animal-monitoring-support-system.git
cd animal-monitoring-support-system
```

### Configuração do Backend

Entre na pasta raiz do projeto (onde está o arquivo package.json principal) e instale as dependências do backend:
```bash
npm install
```

Crie um arquivo de ambiente `.env` na raiz do projeto com as seguintes variáveis:
```env
PORT=3333
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha_mysql
DB_NAME=tfg2
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
```

**Importante:** A variável JWT_SECRET deve ser uma string aleatória longa e complexa. Em ambiente de produção, utilize um gerador de chaves criptográficas apropriado.

Execute o script SQL para criar o banco de dados e todas as tabelas necessárias:
```bash
mysql -u root -p < src/scripts/createTables.sql
```

O script irá criar o banco de dados `tfg2` e as seguintes tabelas: users, farms, tickets e history.

Crie o usuário administrador inicial executando o script de seed:
```bash
node src/scripts/seedUser.js
```

Este script cria o seguinte usuário:
- Email: itamar@gmail.com
- Senha: 123456
- Função: admin

**Atenção:** Em ambiente de produção, troque esta senha imediatamente após o primeiro acesso.

### Configuração do Frontend

Entre na pasta do frontend e instale suas dependências:
```bash
cd frontend
npm install
```

Opcionalmente, você pode criar um arquivo `.env` na pasta frontend para configurar a URL da API:
```env
VITE_API_URL=http://localhost:3333
```

Se este arquivo não for criado, o frontend utilizará o proxy configurado no arquivo vite.config.js que aponta para localhost:3333 por padrão.

Certifique-se de que as imagens necessárias estão presentes na pasta `/frontend/public/images/`:
- hero-farm.jpg - Imagem para tela de login (recomendado 1920x1080px)
- empty-state.jpg - Imagem para estado vazio do dashboard
- vaquinha-icone.png - Favicon (32x32px)

---

## ▶️ Executando o Sistema

O sistema requer dois processos em execução simultânea: o servidor backend (API REST) e o servidor de desenvolvimento do frontend (interface web). Recomenda-se utilizar dois terminais separados.

### Iniciando o Backend

No terminal 1, na pasta raiz do projeto:
```bash
npm run dev
```

O servidor backend estará disponível em `http://localhost:3333`. Você verá uma mensagem confirmando a conexão com o banco de dados e a porta em que o servidor está ouvindo.

### Iniciando o Frontend

No terminal 2, na pasta frontend:
```bash
cd frontend
npm run dev
```

O servidor de desenvolvimento do Vite estará disponível em `http://localhost:5173`. A interface abrirá automaticamente no navegador ou você pode acessá-la manualmente.

### Acessando o Sistema

1. Abra seu navegador e acesse `http://localhost:5173`
2. Na tela de login, utilize as credenciais do usuário administrador:
   - Email: itamar@gmail.com
   - Senha: 123456
3. Após autenticação bem-sucedida, você será redirecionado para o dashboard principal

---

## 🧪 Executando os Testes

### Testes Automatizados do Backend

O projeto inclui trinta e três testes automatizados implementados com Jest e Supertest que validam:

- Autenticação e geração de tokens JWT
- Criação e listagem de tickets
- Atualização de status com registro de histórico
- Classificação automática via Machine Learning
- Validações de entrada de dados
- Tratamento de erros e casos extremos
- Integridade referencial do banco de dados

Para executar a suíte completa de testes:
```bash
npm test
```

O Jest executará todos os testes e apresentará um relatório detalhado com cobertura de código.

### Validação dos Modelos de Machine Learning

Para verificar a acurácia real dos classificadores treinados, execute o script de teste dos modelos:
```bash
node src/scripts/testModel.js
```

Este script realiza validação cruzada completa, dividindo os dados em conjuntos de treino e teste, treinando modelos temporários e calculando métricas detalhadas incluindo matriz de confusão, precisão, recall e F1-Score para cada classe. O output esperado deve confirmar:
```
VALIDAÇÃO DOS MODELOS DE CLASSIFICAÇÃO
=======================================
Acurácia - Classificação de Urgência: 97.30%
Acurácia - Classificação de Equipamento: 99.90%
```

---

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza quatro tabelas principais com relacionamentos bem definidos:

### Tabela: users

Armazena informações de autenticação e autorização dos usuários do sistema.
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: farms

Cadastro de fazendas clientes do sistema de monitoramento.
```sql
CREATE TABLE farms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: tickets

Registro completo de todos os chamados técnicos com classificações automáticas.
```sql
CREATE TABLE tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  farm_id INT NOT NULL,
  description TEXT NOT NULL,
  urgency ENUM('low', 'medium', 'high') NOT NULL,
  area ENUM('collar', 'antenna', 'internet', 'power') NOT NULL,
  status ENUM('open', 'progress', 'closed') DEFAULT 'open',
  predicted_urgency VARCHAR(50),
  predicted_area VARCHAR(50),
  model_accuracy VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farm_id) REFERENCES farms(id)
);
```

### Tabela: history

Histórico completo de todas as alterações realizadas nos tickets.
```sql
CREATE TABLE history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT NOT NULL,
  note TEXT NOT NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);
```

O relacionamento entre as tabelas garante integridade referencial: cada ticket está associado a uma fazenda, e cada entrada de histórico está vinculada a um ticket específico.

---

## 🔌 API REST - Documentação dos Endpoints

A API segue os princípios REST e utiliza autenticação baseada em tokens JWT. Com exceção do endpoint de teste de classificação, todas as rotas requerem um token válido no header Authorization.

### Autenticação

#### POST /api/auth/login

Realiza autenticação do usuário e retorna um token JWT válido por vinte e quatro horas.

**Request Body:**
```json
{
  "email": "itamar@gmail.com",
  "password": "123456"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "itamar@gmail.com",
    "role": "admin"
  }
}
```

**Erros Possíveis:**
- 400 Bad Request - Email ou senha ausentes
- 401 Unauthorized - Credenciais inválidas
- 429 Too Many Requests - Limite de tentativas excedido (10 tentativas por 5 minutos)

#### POST /api/auth/register

Cria um novo usuário no sistema (requer token de administrador).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "email": "novo@exemplo.com",
  "password": "senha_segura_123",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "msg": "Usuário criado com sucesso"
}
```

### Gerenciamento de Tickets

#### GET /api/tickets

Lista todos os tickets do sistema com suporte a filtros opcionais.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (opcionais):**
- urgency: low | medium | high
- area: collar | antenna | internet | power
- status: open | progress | closed

**Exemplo:**
```
GET /api/tickets?urgency=high&status=open
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "farm_id": 1,
    "farm_code": "FAZ001",
    "description": "coleira com bateria inchada e superaquecimento",
    "urgency": "high",
    "area": "collar",
    "status": "open",
    "predicted_urgency": "high",
    "predicted_area": "collar",
    "model_accuracy": "0.94",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
]
```

#### POST /api/tickets

Cria um novo ticket e realiza classificação automática utilizando Machine Learning.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "farm_code": "FAZ001",
  "description": "coleira número 47 apresentando superaquecimento severo e bateria inchada com risco de explosão"
}
```

**Validações:**
- farm_code: obrigatório, string não vazia
- description: obrigatório, mínimo de 10 caracteres

**Response (201 Created):**
```json
{
  "id": 1,
  "farm_id": 1,
  "farm_code": "FAZ001",
  "description": "coleira número 47 apresentando superaquecimento severo e bateria inchada com risco de explosão",
  "urgency": "high",
  "area": "collar",
  "status": "open",
  "predicted_urgency": "high",
  "predicted_area": "collar",
  "model_accuracy": "0.96",
  "created_at": "2025-01-15T10:30:00.000Z"
}
```

**Nota Técnica:** Se a fazenda especificada em farm_code não existir no banco de dados, ela será criada automaticamente antes da inserção do ticket.

#### GET /api/tickets/:id

Retorna detalhes completos de um ticket específico.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "farm_id": 1,
  "farm_code": "FAZ001",
  "description": "coleira com bateria inchada",
  "urgency": "high",
  "area": "collar",
  "status": "open",
  "predicted_urgency": "high",
  "predicted_area": "collar",
  "model_accuracy": "0.94",
  "created_at": "2025-01-15T10:30:00.000Z"
}
```

#### PUT /api/tickets/:id

Atualiza o status de um ticket existente e registra a mudança no histórico.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "status": "progress"
}
```

**Valores Válidos para Status:**
- open: Ticket aberto, aguardando atendimento
- progress: Em atendimento pela equipe técnica
- closed: Problema resolvido, ticket encerrado

**Response (200 OK):**
```json
{
  "msg": "Status atualizado com sucesso"
}
```

Automaticamente, uma entrada é criada na tabela history com a descrição da mudança e timestamp.

#### DELETE /api/tickets/:id

Remove um ticket do sistema. Utilize com cautela pois a operação é irreversível.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "msg": "Ticket excluído com sucesso"
}
```

#### GET /api/tickets/:id/history

Retorna o histórico completo de alterações de um ticket, ordenado cronologicamente.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "ticket_id": 1,
    "note": "Ticket criado",
    "changed_at": "2025-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "ticket_id": 1,
    "note": "Status alterado para: progress",
    "changed_at": "2025-01-15T11:45:00.000Z"
  }
]
```

#### POST /api/tickets/classify

Testa a classificação automática sem criar ticket no banco de dados. Útil para demonstrações e validações. Este endpoint não requer autenticação.

**Request Body:**
```json
{
  "description": "antena com cheiro forte de queimado e chip derretido"
}
```

**Response (200 OK):**
```json
{
  "urgency": "high",
  "area": "antenna",
  "accuracy": 0.92
}
```

### Gerenciamento de Fazendas

#### GET /api/farms

Lista todas as fazendas cadastradas no sistema.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "code": "FAZ001",
    "created_at": "2025-01-10T08:00:00.000Z"
  },
  {
    "id": 2,
    "code": "FAZ002",
    "created_at": "2025-01-11T09:30:00.000Z"
  }
]
```

---

## Interface Web - Funcionalidades

A interface foi desenvolvida como uma Single Page Application moderna e responsiva, oferecendo experiência fluida sem recarregamentos de página.

### Página de Login

Tela de autenticação com design split-screen profissional. O lado esquerdo apresenta o formulário de login com validação em tempo real de email e senha. O lado direito exibe imagem contextual de fazenda de gado leiteiro. A autenticação utiliza tokens JWT com validade de vinte e quatro horas armazenados em localStorage para persistência entre sessões.

### Dashboard Principal

Interface executiva que apresenta visão geral completa do sistema através de cards de estatísticas mostrando total de tickets, distribuição por urgência (alta, média, baixa) e por status (aberto, em progresso, fechado). A lista principal de tickets suporta paginação inteligente com dez registros por página e filtros dinâmicos por urgência, área técnica e status. Um botão de ação primário permite criação rápida de novos tickets através de modal com integração em tempo real com o sistema de classificação automática.

### Detalhes do Ticket

Página dedicada à visualização completa de um ticket individual, incluindo todas as informações de classificação, descrição textual completa, fazenda associada e timestamps. A interface apresenta timeline visual do histórico completo de alterações com todas as mudanças de status registradas cronologicamente. Botões de ação contextuais permitem transições de status (Abrir Atendimento, Finalizar, Reabrir) de acordo com o estado atual do ticket. Um card lateral explica como a classificação automática foi realizada, incluindo confiança do modelo.

### Página de Teste da IA

Interface dedicada para demonstração e teste do sistema de classificação sem necessidade de criar tickets reais no banco de dados. Permite inserir descrições textuais e visualizar instantaneamente os resultados da classificação automática com indicadores visuais de urgência, área e confiança.

### Design System

A interface implementa design system proprietário construído sobre Tailwind CSS com paleta de cores cuidadosamente escolhida. Utiliza gradientes suaves de cyan a emerald para elementos primários, criando identidade visual moderna e profissional. Cada nível de urgência possui cor específica com gradientes correspondentes: vermelho para alta urgência, laranja para média e verde para baixa. Todos os componentes seguem princípios de design consistentes com transições suaves, estados de hover bem definidos e feedback visual claro para todas as interações do usuário.

### Responsividade

A interface é completamente responsiva com breakpoints otimizados para três categorias de dispositivos. Em mobile (menor que 640px) utiliza layout de coluna única com sidebar escondida e navegação adaptada. Em tablet (640px a 1024px) apresenta cards em duas colunas e filtros organizados em linha. Em desktop (maior que 1024px) expande para grid de três colunas com sidebar permanentemente visível e máximo aproveitamento do espaço horizontal.

---

## 🔒 Segurança Implementada

O sistema implementa múltiplas camadas de segurança seguindo as melhores práticas da indústria:

### Autenticação e Autorização

**Tokens JWT:** Todos os endpoints sensíveis requerem token JWT válido enviado no header Authorization com formato Bearer. Os tokens têm validade de vinte e quatro horas e são assinados com chave secreta configurada na variável de ambiente JWT_SECRET.

**Middleware de Verificação:** O middleware verifyToken intercepta todas as requisições para rotas protegidas, valida a assinatura do token, verifica sua expiração e extrai informações do usuário antes de permitir acesso ao endpoint.

**Criptografia de Senhas:** Todas as senhas são criptografadas utilizando Bcrypt com salt rounds configurado em dez iterações. As senhas nunca são armazenadas em texto plano no banco de dados.

### Proteção Contra Ataques

**Rate Limiting:** O endpoint de login implementa limitação de taxa configurada para máximo de dez tentativas a cada cinco minutos por endereço IP. Após exceder o limite, requisições adicionais recebem erro 429 Too Many Requests.

**Headers HTTP Seguros:** O middleware Helmet configura automaticamente headers de segurança incluindo X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security e outros, protegendo contra clickjacking, MIME sniffing e outros ataques comuns.

**Prepared Statements:** Todas as queries SQL utilizam prepared statements com placeholders parametrizados, eliminando completamente o risco de SQL injection mesmo com entrada maliciosa de usuários.

**CORS Configurado:** O backend aceita requisições apenas de origens confiáveis (localhost:5173 em desenvolvimento). Em produção, esta configuração deve ser ajustada para o domínio real da aplicação.

### Validações de Entrada

Todos os endpoints implementam validação rigorosa de dados de entrada antes de processamento. Emails são validados quanto ao formato correto, descrições de tickets requerem mínimo de dez caracteres, valores de status e urgência são validados contra enumerações permitidas. Requisições com dados inválidos recebem erro 400 Bad Request com mensagem explicativa.

---

##   Scripts Utilitários

O projeto inclui diversos scripts auxiliares para facilitar desenvolvimento, testes e manutenção do sistema.

### Backend

**npm run dev**  
Inicia o servidor em modo de desenvolvimento utilizando nodemon. O servidor reinicia automaticamente sempre que arquivos são modificados, agilizando o ciclo de desenvolvimento.

**npm test**  
Executa a suíte completa de trinta e três testes automatizados utilizando Jest. Gera relatório detalhado com cobertura de código e tempo de execução de cada teste.

**node src/scripts/testModel.js**  
Valida a acurácia real dos modelos de Machine Learning. Divide os dados em conjuntos de treino e teste, treina classificadores temporários e calcula métricas completas incluindo matriz de confusão, precisão, recall e F1-Score para cada classe.

**node src/scripts/createTestTickets.js**  
Popula o banco de dados com dez tickets de exemplo associados a fazendas FAZ001 até FAZ010. Útil para demonstrações, testes manuais e validação da interface.

**node src/scripts/seedUser.js**  
Cria o usuário administrador inicial com email itamar@gmail.com e senha 123456. Execute este script apenas uma vez após criar o banco de dados.

### Frontend

**npm run dev**  
Inicia o servidor de desenvolvimento Vite com Hot Module Replacement. Alterações no código são refletidas instantaneamente no navegador sem necessidade de recarregamento completo da página.

**npm run build**  
Gera build otimizado para produção. O Vite aplica minificação, tree-shaking, code splitting por rota e outras otimizações, resultando em bundle final de aproximadamente duzentos kilobytes comprimidos.

**npm run preview**  
Inicia servidor local para preview do build de produção. Permite testar a versão otimizada antes do deploy em ambiente real.

---

##   Troubleshooting - Soluções para Problemas Comuns

### Backend não inicia ou apresenta erro de conexão

**Sintoma:** Mensagem de erro relacionada a conexão com banco de dados ou servidor não inicia.

**Soluções:**
1. Verifique se o MySQL Server está em execução utilizando `sudo systemctl status mysql`
2. Confirme que as credenciais no arquivo .env estão corretas (DB_USER, DB_PASS, DB_HOST)
3. Teste a conexão manualmente com `mysql -u root -p` e verifique se o banco tfg2 existe
4. Se necessário, execute novamente o script createTables.sql

### Frontend não conecta com backend

**Sintoma:** Erro de rede (ERR_CONNECTION_REFUSED) ou timeout nas requisições.

**Soluções:**
1. Confirme que o backend está rodando em localhost:3333 (verifique a saída do terminal do backend)
2. Verifique a configuração de proxy no arquivo vite.config.js do frontend
3. Confirme que o CORS está configurado corretamente no backend para aceitar localhost:5173
4. Desabilite temporariamente firewall ou antivírus que possam estar bloqueando a porta 3333

### Testes automatizados falhando

**Sintoma:** Um ou mais testes retornam erro ao executar npm test.

**Soluções:**
1. Recrie o banco de dados executando novamente o script createTables.sql
2. Execute o script seedUser.js para garantir que o usuário de teste existe
3. Limpe completamente node_modules e reinstale: `rm -rf node_modules package-lock.json && npm install`
4. Verifique se as variáveis de ambiente no .env estão configuradas corretamente

### Imagens não aparecem no frontend

**Sintoma:** Ícones ou imagens de fundo não carregam, exibindo espaços vazios.

**Soluções:**
1. Confirme que os arquivos de imagem estão presentes em /frontend/public/images/
2. Verifique os nomes exatos dos arquivos (sistema de arquivos Linux é case-sensitive)
3. Limpe o cache do navegador pressionando Ctrl+Shift+R
4. Inspecione o console do navegador (F12) para verificar erros 404 e identificar qual arquivo está faltando

### Erro de autenticação ou token inválido

**Sintoma:** Requisições retornam erro 401 Unauthorized mesmo após login bem-sucedido.

**Soluções:**
1. Verifique se a variável JWT_SECRET está definida no arquivo .env do backend
2. Limpe o localStorage do navegador (F12 → Application → Local Storage → Clear)
3. Faça logout e login novamente para obter um token novo
4. Verifique se o token não expirou (validade de vinte e quatro horas)

### Classificação automática retorna resultados inconsistentes

**Sintoma:** Tickets similares recebem classificações muito diferentes.

**Soluções:**
1. Verifique se os arquivos model_urgency.json e model_area.json existem na pasta src/ml/
2. Execute node src/scripts/testModel.js para validar se os modelos estão funcionando corretamente
3. Se os arquivos de modelo não existirem, eles serão criados automaticamente na primeira execução do servidor
4. Descrições muito curtas (menos de dez palavras) podem resultar em baixa confiança

---

## 📚 Limitações Conhecidas e Trabalhos Futuros

### Limitações do Sistema Atual

**Dados Sintéticos:** Os modelos foram treinados exclusivamente com cinco mil exemplos sintéticos elaborados manualmente. Embora representem situações típicas baseadas em conhecimento do domínio, estes dados não capturam toda a variabilidade linguística e casos extremos encontrados em descrições reais de técnicos de campo. Validação com tickets reais de produção é necessária para confirmar a generalização dos modelos.

**Desbalanceamento de Classes:** O conjunto de treinamento apresenta desbalanceamento significativo na categoria de urgência média, representando apenas 10,4% dos exemplos comparado a 66% da categoria alta. Este desbalanceamento resulta em precisão ligeiramente inferior (83%) para a classe média em comparação às demais classes (98-99%). O desbalanceamento reflete parcialmente a realidade operacional onde problemas graves são mais frequentes, mas poderia ser mitigado com coleta adicional de exemplos.

**Contexto Limitado:** A classificação é baseada exclusivamente na descrição textual do problema, sem considerar contexto adicional como histórico de problemas da fazenda, tipo de equipamento instalado, condições climáticas ou época do ano. Integração com dados contextuais poderia melhorar significativamente a acurácia.

**Reprodutibilidade:** O processo de divisão treino/teste utiliza embaralhamento sem seed fixo, dificultando a reprodução exata dos mesmos resultados de acurácia em execuções diferentes do script de validação.

### Trabalhos Futuros Propostos

**Curto Prazo:**
- Coletar tickets reais de empresas parceiras do setor
- Retreinar modelos com dados reais e comparar métricas
- Expandir conjunto de exemplos para classe de urgência média
- Implementar validação A/B com técnicos reais para medir impacto operacional

**Médio Prazo:**
- Incorporar histórico de problemas de cada fazenda como feature adicional
- Implementar aprendizado contínuo onde o modelo aprende com novos tickets confirmados
- Desenvolver dashboard de métricas para acompanhar performance do modelo em produção
- Adicionar suporte a anexos de imagem para problemas visuais

**Longo Prazo:**
- Explorar algoritmos mais modernos (BERT, transformers) caso volume de dados justifique
- Integrar dados contextuais como clima, época do ano e histórico de manutenção
- Expandir classificação para outros tipos de problemas além dos quatro atuais
- Desenvolver aplicativo mobile para técnicos de campo

---

## Informações do Autor

**Nome:** Itamar Alves Ferreira Júnior  
**Instituição:** Universidade Franciscana  
**Curso:** Sistemas de Informação  
**Cidade:** Santa Maria, Rio Grande do Sul, Brasil  
**Email:** cdajuniorf@gmail.com  
**GitHub:** [@ItamarJuniorDEV](https://github.com/ItamarJuniorDEV)

**Orientador:** Prof. Alessandro André Mainardi de Oliveira

---

## 📄 Licença

Este projeto foi desenvolvido exclusivamente para fins acadêmicos como Trabalho Final de Graduação II do curso de Sistemas de Informação. O código fonte está disponível publicamente sob licença MIT para fins educacionais, permitindo que outros estudantes e pesquisadores aprendam com a implementação e adaptem para seus próprios contextos.

---

##   Considerações Finais

Este sistema demonstra a viabilidade de aplicação de técnicas de Processamento de Linguagem Natural e Aprendizado de Máquina em contextos específicos de domínio. Os resultados alcançados (97,30% de acurácia para urgência e 99,90% para tipo de equipamento) confirmam que mesmo algoritmos relativamente simples como Naive Bayes podem apresentar desempenho excelente quando treinados adequadamente com dados representativos do domínio de aplicação.

A arquitetura desenvolvida (API REST + interface web moderna) garante que o sistema seja facilmente integrável com sistemas legados existentes, permitindo adoção gradual em ambientes reais de produção. A separação clara entre backend e frontend facilita manutenção evolutiva e permite que cada camada seja desenvolvida e testada independentemente.

O conjunto completo de trinta e três testes automatizados com cobertura abrangente garante que modificações futuras no código não introduzam regressões, permitindo evolução segura do sistema ao longo do tempo.

Para implantação em ambiente de produção, recomenda-se especial atenção às limitações identificadas, particularmente a necessidade de validação com dados reais e o desbalanceamento da classe de urgência média. Com os ajustes apropriados e coleta de feedback de usuários reais, o sistema tem potencial para impactar significativamente a eficiência operacional de empresas do setor de monitoramento animal.

---

**Repositório GitHub:** https://github.com/ItamarJuniorDEV/animal-monitoring-support-system

**Documentação Completa:** Consulte os READMEs individuais nas pastas `/backend` e `/frontend` para informações técnicas detalhadas de cada componente.
