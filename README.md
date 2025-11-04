# TFG II - Sistema de Análise de Tickets para Monitoramento Animal

Backend desenvolvido como parte do Trabalho Final de Graduação do curso de Sistemas de Informação da Universidade Franciscana.

## Sobre o Projeto

Este sistema automatiza a classificação de tickets de suporte técnico para equipamentos de monitoramento animal utilizados em fazendas de gado de leite. O sistema analisa descrições textuais de problemas reportados e classifica automaticamente a urgência e o tipo de equipamento envolvido.

### Contexto do Problema

Em sistemas de monitoramento animal, cada vaca utiliza uma coleira eletrônica que transmite dados sobre localização, saúde e atividades. Estes dados são captados por antenas instaladas na propriedade, que dependem de infraestrutura de rede (Wi-Fi) e fontes de energia. Quando ocorre uma falha em qualquer destes componentes, técnicos de suporte precisam:

1. Ler a descrição do problema
2. Identificar qual equipamento está afetado (coleira, antena, internet ou fonte)
3. Determinar a urgência (baixa, média ou alta)
4. Encaminhar para a equipe técnica adequada

Este processo manual é lento e sujeito a erros. O sistema desenvolvido automatiza esta classificação usando técnicas de processamento de linguagem natural e aprendizado de máquina.

## Tecnologias Utilizadas

- Node.js 20.x
- Express 5.1.0
- MySQL 8.0
- Natural (biblioteca de NLP para classificação Naive Bayes)
- JWT para autenticação
- Bcrypt para criptografia de senhas
- Jest e Supertest para testes automatizados
- Helmet para segurança HTTP
- Express Rate Limit para proteção contra força bruta

## Como Funciona a IA

O sistema utiliza dois classificadores Naive Bayes independentes:

1. **Classificador de Urgência**: Analisa palavras-chave que indicam gravidade (ex: "quebrado", "queimado", "inchado" = urgência alta)
2. **Classificador de Área**: Identifica termos que indicam o equipamento (ex: "coleira", "bateria" = área collar)

### Cálculo de Confiança

Para cada ticket classificado, o sistema calcula a confiança real da predição normalizando as probabilidades retornadas pelo classificador Naive Bayes. O valor de confiança (accuracy) representa o quão seguro o modelo está sobre sua previsão e varia entre 0 e 1 (0% a 100%). Descrições claras e específicas tendem a ter maior confiança (acima de 90%), enquanto descrições vagas ou ambíguas resultam em menor confiança (abaixo de 70%).

### Dados de Treinamento

- Total de exemplos: 518 frases
- Distribuição por área (balanceada):
  - Coleiras: 23,4% (121 exemplos)
  - Antenas: 25,9% (134 exemplos)
  - Internet: 24,7% (128 exemplos)
  - Fontes: 26,1% (135 exemplos)
- Distribuição por urgência:
  - Baixa: 21,6% (112 exemplos)
  - Média: 10,2% (53 exemplos)
  - Alta: 68,1% (353 exemplos)

### Acurácia do Modelo

Testado com validação cruzada (80% treino, 20% teste):
- **Classificação de urgência: 91,16%**
- **Classificação de tipo de equipamento: 99,04%**

Os modelos são treinados uma vez e salvos em arquivo JSON para carregamento rápido nas inicializações seguintes.

## Pré-requisitos

- Node.js instalado (versão 20 ou superior)
- MySQL Server rodando
- npm ou yarn

## Instalação

Clone o repositório e instale as dependências:
```bash
npm install
```

Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto:
```
PORT=3333
DB_HOST=localhost
DB_USER=root
DB_PASS=sua_senha
DB_NAME=tfg2
JWT_SECRET=sua_chave_secreta_aqui
```

Crie o banco de dados executando o script SQL:
```bash
mysql -u root -p < src/scripts/createTables.sql
```

Crie o usuário administrador inicial:
```bash
node src/scripts/seedUser.js
```

## Executando o Projeto

Modo de desenvolvimento:
```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3333`

## Estrutura do Banco de Dados

### Tabela users
Armazena credenciais e permissões dos usuários.
```sql
- id (PK)
- email (unique)
- password_hash
- role (admin/user)
```

### Tabela farms
Cadastro de fazendas clientes.
```sql
- id (PK)
- code (unique) - Código da fazenda (ex: FAZ001)
```

### Tabela tickets
Registro de todos os chamados técnicos.
```sql
- id (PK)
- farm_id (FK) - Fazenda que reportou o problema
- description - Descrição textual do problema
- urgency - Classificação de urgência (low/medium/high)
- area - Tipo de equipamento (collar/antenna/internet/power)
- status - Status atual (open/progress/closed)
- predicted_urgency - Previsão da IA para urgência
- predicted_area - Previsão da IA para tipo
- model_accuracy - Confiança da classificação (calculada dinamicamente)
- created_at - Data de criação
```

### Tabela history
Histórico de alterações dos tickets.
```sql
- id (PK)
- ticket_id (FK)
- note - Descrição da alteração
- changed_at - Data da alteração
```

## Endpoints da API

### Autenticação

**POST** `/api/auth/login`

Realiza login e retorna um token JWT válido por 24 horas.

```json
{
  "email": "itamar@gmail.com",
  "password": "123456"
}

// Response (200)
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**POST** `/api/auth/register`

Cria um novo usuário no sistema.

```json
{
  "email": "novo@exemplo.com",
  "password": "senha123",
  "role": "user"
}

// Response (201)
{
  "msg": "Usuário criado com sucesso"
}
```

### Tickets

**Todas as rotas de tickets requerem autenticação JWT via header Authorization.**

Para usar estas rotas, inclua o token no header:
```
Authorization: Bearer SEU_TOKEN_AQUI
```

**GET** `/api/tickets?urgency=high&status=open`

Lista tickets com filtros opcionais (urgency, area, status). Requer autenticação.

Exemplo de uso:
```bash
curl -X GET "http://localhost:3333/api/tickets?urgency=high" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

**POST** `/api/tickets`

Cria um novo ticket e classifica automaticamente usando IA. Requer autenticação.

```json
{
  "farm_code": "FAZ001",
  "description": "coleira com bateria inchada e superaquecimento"
}

// Response (201)
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
```

Exemplo de uso:
```bash
curl -X POST http://localhost:3333/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{"farm_code": "FAZ001", "description": "coleira com bateria inchada"}'
```

**PUT** `/api/tickets/:id`

Atualiza o status de um ticket. Requer autenticação.

```json
{
  "status": "progress"
}

// Response (200)
{
  "msg": "Status atualizado"
}
```

**GET** `/api/tickets/:id/history`

Retorna histórico de alterações do ticket. Requer autenticação.

**DELETE** `/api/tickets/:id`

Exclui um ticket. Requer autenticação.

**POST** `/api/tickets/classify`

Testa a classificação sem criar ticket no banco. Não requer autenticação (útil para testes).

```json
{
  "description": "antena com cheiro de queimado"
}

// Response (200)
{
  "urgency": "high",
  "area": "antenna",
  "accuracy": 0.92
}
```

### Fazendas

**GET** `/api/farms`

Lista todas as fazendas cadastradas. Requer autenticação.

Exemplo de uso:
```bash
curl -X GET http://localhost:3333/api/farms \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Executando os Testes

O projeto inclui 8 testes automatizados que validam:
- Autenticação (login válido/inválido, validação de email)
- Criação de tickets (com/sem dados, validações)
- Classificação de texto pela IA com validação de confiança
- Listagem de fazendas

Para executar:
```bash
npm test
```

Resultado esperado:
```
Test Suites: 1 passed
Tests:       8 passed
```

## Scripts Utilitários

### Calcular Acurácia do Modelo
```bash
node src/scripts/testModel.js
```

Este script divide os dados em treino (80%) e teste (20%), treina modelos temporários e calcula a acurácia real. Útil para validar melhorias nos dados de treinamento.

### Popular Banco com Dados de Teste
```bash
node src/scripts/createTestTickets.js
```

Cria 10 tickets de exemplo associados a fazendas FAZ001 até FAZ010. Útil para demonstrações.

### Criar Novo Usuário Admin
```bash
node src/scripts/seedUser.js
```

Cria o usuário inicial:
- Email: itamar@gmail.com
- Senha: 123456
- Role: admin

**Importante:** Troque esta senha após o primeiro login em ambiente de produção.

## Estrutura do Projeto
```
src/
├── __tests__/          # Testes automatizados com Jest
├── config/             # Configuração do pool de conexões MySQL
├── controllers/        # Lógica de negócio (auth, tickets, farms)
├── middlewares/        # Middleware de autenticação JWT
│   └── authMiddleware.js    # Verifica token nas rotas protegidas
├── ml/                 # Dados de treinamento e modelos salvos
│   ├── trainData.js         # 518 exemplos de treinamento
│   ├── model_urgency.json   # Modelo treinado (gerado automaticamente)
│   └── model_area.json      # Modelo treinado (gerado automaticamente)
├── routes/             # Definição das rotas da API
├── scripts/            # Scripts utilitários
├── services/           # Serviço de classificação com Natural
│   └── classifyService.js   # Classificação e cálculo de confiança
└── index.js            # Arquivo principal do servidor
```

## Fluxo de Funcionamento
```
1. Usuário faz login e recebe token JWT
   ↓
2. Usuário cria ticket via API com token no header
   ↓
3. Sistema valida token (middleware verifyToken)
   ↓
4. Sistema valida dados (descrição mínima 10 caracteres, farm_code obrigatório)
   ↓
5. Verifica/cria fazenda no banco
   ↓
6. Envia descrição para classifyService
   ↓
7. Classificadores Naive Bayes analisam o texto
   ↓
8. Calcula confiança real da predição (normalização das probabilidades)
   ↓
9. Retorna: { urgency, area, accuracy }
   ↓
10. Salva ticket no banco com classificações
   ↓
11. Retorna ticket completo para o cliente
```

## Segurança Implementada

- **Autenticação JWT**: Todas as rotas sensíveis (criação, modificação e deleção de tickets) requerem token válido
- **Middleware de Verificação**: O middleware `verifyToken` valida tokens antes de permitir acesso às rotas protegidas
- **Helmet**: Proteção de headers HTTP contra vulnerabilidades comuns
- **Rate Limit**: Máximo de 10 tentativas de login a cada 5 minutos
- **JWT com Expiração**: Tokens expiram após 1 dia
- **Bcrypt**: Senhas criptografadas com salt rounds = 10
- **Validações**: Email, descrição mínima, status válidos
- **Prepared Statements**: Todas as queries SQL usam prepared statements para prevenir SQL injection

## Observações Técnicas

### Modelos Salvos
Os arquivos `model_urgency.json` e `model_area.json` são gerados automaticamente na primeira execução do servidor. Nas execuções seguintes, os modelos são carregados do disco, reduzindo o tempo de inicialização de aproximadamente 5 segundos para instantâneo.

### Cálculo Dinâmico de Confiança
Diferente de sistemas que retornam valores fixos de confiança, este sistema calcula a confiança real de cada predição individual. O cálculo normaliza as probabilidades retornadas pelo classificador Naive Bayes, garantindo que o valor de accuracy reflita com precisão a certeza do modelo para aquela classificação específica. Isso permite identificar quando o modelo está em dúvida e pode necessitar de revisão humana.

### Criação Automática de Fazendas
Quando um ticket é criado com um farm_code inexistente, o sistema cria a fazenda automaticamente. Esta decisão simplifica o fluxo de uso, evitando pré-cadastro obrigatório.

### Histórico de Alterações
Sempre que o status de um ticket é atualizado, um registro é inserido na tabela history com timestamp e descrição da mudança.

### Desbalanceamento nos Dados
Os dados de treinamento apresentam desbalanceamento na classe de urgência, com a categoria "medium" representando apenas 10,2% dos exemplos. Apesar disso, o modelo mantém alta acurácia geral de 91,16% para classificação de urgência. Em trabalhos futuros, recomenda-se equilibrar melhor esta distribuição para potencialmente melhorar a precisão na categoria "medium".

## Exemplo de Uso Completo

Aqui está um exemplo do fluxo completo de uso da API:

```bash
# 1. Fazer login e obter token
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "itamar@gmail.com", "password": "123456"}'

# Resposta: {"token": "eyJhbGc..."}

# 2. Criar ticket usando o token
curl -X POST http://localhost:3333/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{"farm_code": "FAZ001", "description": "coleira com bateria inchada"}'

# Resposta: Ticket criado com classificação automática

# 3. Listar tickets da fazenda
curl -X GET "http://localhost:3333/api/tickets?farm_code=FAZ001" \
  -H "Authorization: Bearer eyJhbGc..."

# 4. Atualizar status do ticket
curl -X PUT http://localhost:3333/api/tickets/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{"status": "progress"}'

# 5. Ver histórico do ticket
curl -X GET http://localhost:3333/api/tickets/1/history \
  -H "Authorization: Bearer eyJhbGc..."
```

## Autor

**Itamar Alves Ferreira Júnior**  
Curso de Sistemas de Informação  
Universidade Franciscana  
Santa Maria, RS, Brasil  
cdajuniorf@gmail.com

**Orientador:** Alessandro André Mainardi de Oliveira

## Licença

Este projeto foi desenvolvido para fins acadêmicos como Trabalho Final de Graduação.