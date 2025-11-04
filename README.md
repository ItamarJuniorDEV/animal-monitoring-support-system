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

### Dados de Treinamento

- Total de exemplos: 518 frases
- Distribuição:
  - Coleiras: 25%
  - Antenas: 25%
  - Internet: 25%
  - Fontes: 25%

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
- model_accuracy - Confiança da classificação
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
```json
{
  "email": "itamar@gmail.com",
  "password": "123456"
}

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**POST** `/api/auth/register`
```json
{
  "email": "novo@exemplo.com",
  "password": "senha123",
  "role": "user"
}

{
  "msg": "Usuário criado com sucesso"
}
```

### Tickets

**GET** `/api/tickets?urgency=high&status=open`

Lista tickets com filtros opcionais (urgency, area, status).

**POST** `/api/tickets`
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
  "model_accuracy": 0.86,
  "created_at": "2025-01-15T10:30:00.000Z"
}
```

**PUT** `/api/tickets/:id`
```json
{
  "status": "progress"
}

{
  "msg": "Status atualizado"
}
```

**GET** `/api/tickets/:id/history`

Retorna histórico de alterações do ticket.

**DELETE** `/api/tickets/:id`

Exclui um ticket.

**POST** `/api/tickets/classify`

Testa a classificação sem criar ticket no banco.
```json
{
  "description": "antena com cheiro de queimado"
}

{
  "urgency": "high",
  "area": "antenna",
  "accuracy": 0.86
}
```

### Fazendas

**GET** `/api/farms`

Lista todas as fazendas cadastradas.

## Executando os Testes

O projeto inclui 8 testes automatizados que validam:
- Autenticação (login válido/inválido, validação de email)
- Criação de tickets (com/sem dados, validações)
- Classificação de texto pela IA
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

## Estrutura do Projeto
```
src/
├── __tests__/          # Testes automatizados com Jest
├── config/             # Configuração do pool de conexões MySQL
├── controllers/        # Lógica de negócio (auth, tickets, farms)
├── middlewares/        # Middlewares personalizados (reservado)
├── ml/                 # Dados de treinamento e modelos salvos
│   ├── trainData.js    # 518 exemplos de treinamento
│   ├── model_urgency.json   # Modelo treinado (gerado automaticamente)
│   └── model_area.json      # Modelo treinado (gerado automaticamente)
├── routes/             # Definição das rotas da API
├── scripts/            # Scripts utilitários
├── services/           # Serviço de classificação com Natural
└── index.js            # Arquivo principal do servidor
```

## Fluxo de Funcionamento
```
1. Usuário cria ticket via API
   ↓
2. Sistema valida dados (descrição mínima 10 caracteres, farm_code obrigatório)
   ↓
3. Verifica/cria fazenda no banco
   ↓
4. Envia descrição para classifyService
   ↓
5. Classificadores Naive Bayes analisam o texto
   ↓
6. Retorna: { urgency, area, accuracy }
   ↓
7. Salva ticket no banco com classificações
   ↓
8. Retorna ticket completo para o cliente
```

## Segurança Implementada

- **Helmet**: Proteção de headers HTTP contra vulnerabilidades comuns
- **Rate Limit**: Máximo de 10 tentativas de login a cada 5 minutos
- **JWT**: Tokens com expiração de 1 dia
- **Bcrypt**: Senhas criptografadas com salt rounds = 10
- **Validações**: Email, descrição mínima, status válidos

## Observações Técnicas

### Modelos Salvos
Os arquivos `model_urgency.json` e `model_area.json` são gerados automaticamente na primeira execução do servidor. Nas execuções seguintes, os modelos são carregados do disco, reduzindo o tempo de inicialização de ~5 segundos para instantâneo.

### Criação Automática de Fazendas
Quando um ticket é criado com um farm_code inexistente, o sistema cria a fazenda automaticamente. Esta decisão simplifica o fluxo de uso, evitando pré-cadastro obrigatório.

### Histórico de Alterações
Sempre que o status de um ticket é atualizado, um registro é inserido na tabela history com timestamp e descrição da mudança.

## Autor

**Itamar Alves Ferreira Júnior**  
Curso de Sistemas de Informação  
Universidade Franciscana  
Santa Maria, RS, Brasil  
cdajuniorf@gmail.com

**Orientador:** Alessandro André Mainardi de Oliveira

## Licença

Este projeto foi desenvolvido para fins acadêmicos como Trabalho Final de Graduação.