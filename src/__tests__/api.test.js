import request from 'supertest';
import express from 'express';
import natural from 'natural';
import authRoutes from '../routes/authRoutes.js';
import ticketRoutes from '../routes/ticketRoutes.js';
import farmRoutes from '../routes/farmRoutes.js';
import { classifyTicket } from '../services/classifyService.js';
import { trainData } from '../ml/trainData.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/farms', farmRoutes);

// =============================================================================
// VARIÁVEIS GLOBAIS PARA AUTENTICAÇÃO E CONTROLE DE TESTES
// =============================================================================
let authToken = null;
let testTicketId = null;

// =============================================================================
// SUITE COMPLETA DE TESTES - TFG II
// Total: 35 testes automatizados
// =============================================================================

describe('Testes da API - TFG II - Suíte Completa', () => {
  
  // ===========================================================================
  // GRUPO 1: AUTENTICAÇÃO E REGISTRO (RF01, RF02)
  // ===========================================================================
  
  describe('RF01/RF02 - Autenticação e Registro de Usuários', () => {
    
    test('Login com credenciais válidas retorna token JWT', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'itamar@gmail.com', password: '123456' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      
      authToken = response.body.token;
      
      console.log('\n✅ Token JWT obtido com sucesso');
    });

    test('Login sem email retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: '123456' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('msg');
    });

    test('Login com email inválido retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'emailinvalido', password: '123456' });
      
      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('inválido');
    });

    test('Login com credenciais incorretas retorna erro 401', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'itamar@gmail.com', password: 'senhaerrada' });
      
      expect(response.status).toBe(401);
    });

    test('Registro com dados válidos retorna sucesso', async () => {
      const randomEmail = `teste${Date.now()}@teste.com`;
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({ 
          email: randomEmail, 
          password: '123456',
          role: 'user'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.msg).toContain('sucesso');
      
      console.log(`\n✅ Usuário ${randomEmail} registrado com sucesso`);
    });

    test('Registro sem email retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ password: '123456' });
      
      expect(response.status).toBe(400);
    });

    test('Registro com email inválido retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ 
          email: 'emailinvalido', 
          password: '123456' 
        });
      
      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('inválido');
    });

    test('Registro com email já existente retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ 
          email: 'itamar@gmail.com',
          password: '123456' 
        });
      
      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('cadastrado');
    });

    test('Requisição sem token em rota protegida retorna erro 401', async () => {
      const response = await request(app)
        .get('/api/tickets');
      
      expect(response.status).toBe(401);
      expect(response.body.msg).toContain('Token');
    });
  });

  // ===========================================================================
  // GRUPO 2: CRIAÇÃO E LISTAGEM DE TICKETS (RF03, RF04)
  // ===========================================================================
  
  describe('RF03 - Criação de Tickets com ClassifyService', () => {
    
    test('Criar ticket classifica automaticamente usando classifyService', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farm_code: 'FAZTEST',
          description: 'coleira com bateria inchada e superaquecendo'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('urgency');
      expect(response.body).toHaveProperty('area');
      expect(response.body).toHaveProperty('farm_code');
      
      expect(['low', 'medium', 'high']).toContain(response.body.urgency);
      expect(['collar', 'antenna', 'internet', 'power']).toContain(response.body.area);
      
      testTicketId = response.body.id;
      
      console.log(`\n✅ Ticket ${testTicketId} criado via classifyService: ${response.body.urgency}/${response.body.area}`);
    });

    test('Criar ticket sem descrição retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ farm_code: 'FAZTEST' });
      
      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('obrigatório');
    });

    test('Criar ticket com descrição muito curta retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farm_code: 'FAZTEST',
          description: 'curta'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('mínimo');
    });

    test('Criar ticket sem farm_code retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'descrição válida com mais de dez caracteres'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('RF04 - Visualização e Filtragem de Tickets', () => {
    
    test('Listar todos os tickets retorna array', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      console.log(`\n✅ Total de tickets no sistema: ${response.body.length}`);
    });

    test('Filtrar tickets por urgência funciona corretamente', async () => {
      const response = await request(app)
        .get('/api/tickets?urgency=high')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      response.body.forEach(ticket => {
        expect(ticket.urgency).toBe('high');
      });
    });

    test('Filtrar tickets por área funciona corretamente', async () => {
      const response = await request(app)
        .get('/api/tickets?area=collar')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      response.body.forEach(ticket => {
        expect(ticket.area).toBe('collar');
      });
    });

    test('Filtrar tickets por status funciona corretamente', async () => {
      const response = await request(app)
        .get('/api/tickets?status=open')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      response.body.forEach(ticket => {
        expect(ticket.status).toBe('open');
      });
    });
  });

  // ===========================================================================
  // GRUPO 3: ATUALIZAÇÃO DE TICKETS
  // ===========================================================================
  
  describe('Atualização de Status de Tickets (PUT)', () => {
    
    test('Atualizar status de ticket para "progress" funciona', async () => {
      const response = await request(app)
        .put(`/api/tickets/${testTicketId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'progress' });
      
      expect(response.status).toBe(200);
      expect(response.body.msg).toContain('atualizado');
      
      console.log(`\n✅ Status do ticket ${testTicketId} atualizado para progress`);
    });

    test('Atualizar status de ticket para "closed" funciona', async () => {
      const response = await request(app)
        .put(`/api/tickets/${testTicketId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'closed' });
      
      expect(response.status).toBe(200);
    });

    test('Atualizar com status inválido retorna erro 400', async () => {
      const response = await request(app)
        .put(`/api/tickets/${testTicketId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalido' });
      
      expect(response.status).toBe(400);
      expect(response.body.msg).toContain('inválido');
    });

    test('Atualizar ticket inexistente retorna erro 404', async () => {
      const response = await request(app)
        .put('/api/tickets/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'progress' });
      
      expect(response.status).toBe(404);
    });
  });

  // ===========================================================================
  // GRUPO 4: HISTÓRICO DE TICKETS (RF05)
  // ===========================================================================
  
  describe('RF05 - Histórico de Tickets', () => {
    
    test('Buscar histórico de ticket retorna array de mudanças', async () => {
      const response = await request(app)
        .get(`/api/tickets/${testTicketId}/history`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      response.body.forEach(entry => {
        expect(entry).toHaveProperty('id');
        expect(entry).toHaveProperty('ticket_id');
        expect(entry).toHaveProperty('note');
        expect(entry).toHaveProperty('changed_at');
      });
      
      console.log(`\n✅ Histórico do ticket ${testTicketId}: ${response.body.length} entradas`);
    });

    test('Buscar histórico de ticket inexistente retorna array vazio', async () => {
      const response = await request(app)
        .get('/api/tickets/999999/history')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  // ===========================================================================
  // GRUPO 5: CLASSIFICAÇÃO AUTOMÁTICA (RF06, RF08)
  // ===========================================================================
  
  describe('RF06/RF08 - Classificação Automática via Endpoint', () => {
    
    test('Endpoint de teste classifica usando classifyService', async () => {
      const response = await request(app)
        .post('/api/tickets/classify')
        .send({ description: 'antena com superaquecimento e chip queimado' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('urgency');
      expect(response.body).toHaveProperty('area');
      expect(response.body).toHaveProperty('accuracy');

      expect(['low', 'medium', 'high']).toContain(response.body.urgency);
      expect(['collar', 'antenna', 'internet', 'power']).toContain(response.body.area);
      expect(response.body.accuracy).toBeGreaterThan(0);
      expect(response.body.accuracy).toBeLessThanOrEqual(1);
      
      console.log(`\n✅ Classificação via endpoint: ${response.body.urgency}/${response.body.area} (confiança: ${response.body.accuracy})`);
    });

    test('Classificação sem descrição retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/tickets/classify')
        .send({});
      
      expect(response.status).toBe(400);
    });

    test('Classificação com descrição curta retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/tickets/classify')
        .send({ description: 'curto' });
      
      expect(response.status).toBe(400);
    });
  });

  // ===========================================================================
  // GRUPO 6: GESTÃO DE FAZENDAS
  // ===========================================================================
  
  describe('Gestão de Fazendas', () => {
    
    test('Listar fazendas retorna array', async () => {
      const response = await request(app)
        .get('/api/farms')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      console.log(`\n✅ Total de fazendas cadastradas: ${response.body.length}`);
    });
  });

  // ===========================================================================
  // GRUPO 7: VALIDAÇÃO ML COM MODELO EM PRODUÇÃO (classifyService)
  // Usa o modelo já treinado com 100% dos dados
  // ===========================================================================
  
  describe('Validação ML - Modelo em Produção (classifyService)', () => {
    
    // Seed fixo para reprodutibilidade
    function seededShuffle(array, seed = 42) {
      const shuffled = [...array];
      let random = seed;
      
      for (let i = shuffled.length - 1; i > 0; i--) {
        random = (random * 9301 + 49297) % 233280;
        const j = Math.floor((random / 233280) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      return shuffled;
    }

    test('ClassifyService: Acurácia em amostra de teste', () => {
      const shuffled = seededShuffle(trainData);
      const splitIndex = Math.floor(shuffled.length * 0.8);
      const testSample = shuffled.slice(splitIndex);
      
      console.log(`\n📊 TESTE DO MODELO EM PRODUÇÃO (classifyService)`);
      console.log(`   Amostra de teste: ${testSample.length} exemplos\n`);
      
      let correctUrgency = 0;
      let correctArea = 0;
      
      for (const item of testSample) {
        const result = classifyTicket(item.text);
        if (result.urgency === item.urgency) correctUrgency++;
        if (result.area === item.area) correctArea++;
      }
      
      const urgencyAccuracy = (correctUrgency / testSample.length) * 100;
      const areaAccuracy = (correctArea / testSample.length) * 100;
      
      console.log(`   📊 RESULTADOS:`);
      console.log(`   Acurácia Urgência: ${urgencyAccuracy.toFixed(2)}%`);
      console.log(`   Acurácia Área: ${areaAccuracy.toFixed(2)}%`);
      console.log(`   Acertos Urgência: ${correctUrgency}/${testSample.length}`);
      console.log(`   Acertos Área: ${correctArea}/${testSample.length}\n`);
      
      expect(urgencyAccuracy).toBeGreaterThanOrEqual(90);
      expect(areaAccuracy).toBeGreaterThanOrEqual(95);
    });

    test('ClassifyService: Validação com casos específicos conhecidos', () => {
      const testCases = [
        { 
          text: 'coleira com bateria superaquecendo e inchada', 
          expectedUrgency: 'high', 
          expectedArea: 'collar' 
        },
        { 
          text: 'antena com chip danificado não reconhece', 
          expectedUrgency: 'high', 
          expectedArea: 'antenna' 
        },
        { 
          text: 'internet oscilando no smartphone do técnico', 
          expectedUrgency: 'low', 
          expectedArea: 'internet' 
        },
        { 
          text: 'fonte de alimentação com capacitor estourado', 
          expectedUrgency: 'high', 
          expectedArea: 'power' 
        }
      ];
      
      console.log(`\n📊 TESTE COM CASOS ESPECÍFICOS (classifyService):\n`);
      
      let correctUrgency = 0;
      let correctArea = 0;
      
      for (const testCase of testCases) {
        const result = classifyTicket(testCase.text);
        
        const urgencyMatch = result.urgency === testCase.expectedUrgency ? '✅' : '❌';
        const areaMatch = result.area === testCase.expectedArea ? '✅' : '❌';
        
        console.log(`   "${testCase.text}"`);
        console.log(`   ${urgencyMatch} Urgency: esperado=${testCase.expectedUrgency}, obtido=${result.urgency}`);
        console.log(`   ${areaMatch} Area: esperado=${testCase.expectedArea}, obtido=${result.area}\n`);
        
        if (result.urgency === testCase.expectedUrgency) correctUrgency++;
        if (result.area === testCase.expectedArea) correctArea++;
      }
      
      expect(correctUrgency).toBeGreaterThanOrEqual(3);
      expect(correctArea).toBeGreaterThanOrEqual(3);
    });
  });

  // ===========================================================================
  // GRUPO 8: VALIDAÇÃO CIENTÍFICA ML - DIVISÃO 80/20
  // ===========================================================================
  
  describe('Validação Científica ML - Divisão 80/20 (Igual testModel.js)', () => {
    
    // Seed fixo para reprodutibilidade
    function seededShuffle(array, seed = 42) {
      const shuffled = [...array];
      let random = seed;
      
      for (let i = shuffled.length - 1; i > 0; i--) {
        random = (random * 9301 + 49297) % 233280;
        const j = Math.floor((random / 233280) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      return shuffled;
    }
    
    test('Validação 80/20: Acurácia de Urgência >= 95%', () => {
      const shuffled = seededShuffle(trainData);
      const splitIndex = Math.floor(shuffled.length * 0.8);
      const trainSet = shuffled.slice(0, splitIndex);
      const testSet = shuffled.slice(splitIndex);
      
      console.log(`\n📊 VALIDAÇÃO CIENTÍFICA - URGÊNCIA (Metodologia TFG)`);
      console.log(`   Total de dados: ${trainData.length}`);
      console.log(`   Treino (80%): ${trainSet.length}`);
      console.log(`   Teste (20%): ${testSet.length}\n`);
      
      const classifierUrg = new natural.BayesClassifier();
      
      for (const item of trainSet) {
        classifierUrg.addDocument(item.text, item.urgency);
      }
      
      classifierUrg.train();
      console.log('   ✅ Modelo treinado com 80% dos dados\n');
      
      let correct = 0;
      for (const item of testSet) {
        const predicted = classifierUrg.classify(item.text);
        if (predicted === item.urgency) correct++;
      }
      
      const accuracy = (correct / testSet.length) * 100;
      
      console.log(`   📊 RESULTADOS:`);
      console.log(`   Acurácia: ${accuracy.toFixed(2)}%`);
      console.log(`   Acertos: ${correct}/${testSet.length}`);
      console.log(`   Erros: ${testSet.length - correct}\n`);
      
      expect(accuracy).toBeGreaterThanOrEqual(95);
    });

    test('Validação 80/20: Acurácia de Área >= 99%', () => {
      const shuffled = seededShuffle(trainData);
      const splitIndex = Math.floor(shuffled.length * 0.8);
      const trainSet = shuffled.slice(0, splitIndex);
      const testSet = shuffled.slice(splitIndex);
      
      console.log(`\n📊 VALIDAÇÃO CIENTÍFICA - ÁREA (Metodologia TFG)`);
      console.log(`   Total de dados: ${trainData.length}`);
      console.log(`   Treino (80%): ${trainSet.length}`);
      console.log(`   Teste (20%): ${testSet.length}\n`);
      
      const classifierArea = new natural.BayesClassifier();
      
      for (const item of trainSet) {
        classifierArea.addDocument(item.text, item.area);
      }
      
      classifierArea.train();
      console.log('   ✅ Modelo treinado com 80% dos dados\n');
      
      let correct = 0;
      for (const item of testSet) {
        const predicted = classifierArea.classify(item.text);
        if (predicted === item.area) correct++;
      }
      
      const accuracy = (correct / testSet.length) * 100;
      
      console.log(`   📊 RESULTADOS:`);
      console.log(`   Acurácia: ${accuracy.toFixed(2)}%`);
      console.log(`   Acertos: ${correct}/${testSet.length}`);
      console.log(`   Erros: ${testSet.length - correct}\n`);
      
      expect(accuracy).toBeGreaterThanOrEqual(99);
    });

    test('Matriz de Confusão e Métricas - Urgência', () => {
      const shuffled = seededShuffle(trainData);
      const splitIndex = Math.floor(shuffled.length * 0.8);
      const trainSet = shuffled.slice(0, splitIndex);
      const testSet = shuffled.slice(splitIndex);
      
      const classifierUrg = new natural.BayesClassifier();
      for (const item of trainSet) {
        classifierUrg.addDocument(item.text, item.urgency);
      }
      classifierUrg.train();
      
      const confusion = {
        'low': { 'low': 0, 'medium': 0, 'high': 0 },
        'medium': { 'low': 0, 'medium': 0, 'high': 0 },
        'high': { 'low': 0, 'medium': 0, 'high': 0 }
      };
      
      for (const item of testSet) {
        const predicted = classifierUrg.classify(item.text);
        confusion[item.urgency][predicted]++;
      }
      
      console.log(`\n📊 MATRIZ DE CONFUSÃO - URGÊNCIA:`);
      console.log(`   ───────────────────────────────────────`);
      console.log(`   Real      │ Low    │ Medium │ High   │`);
      console.log(`   ───────────────────────────────────────`);
      console.log(`   Low       │  ${String(confusion.low.low).padStart(3)}   │   ${String(confusion.low.medium).padStart(3)}  │  ${String(confusion.low.high).padStart(3)}   │`);
      console.log(`   Medium    │  ${String(confusion.medium.low).padStart(3)}   │   ${String(confusion.medium.medium).padStart(3)}  │  ${String(confusion.medium.high).padStart(3)}   │`);
      console.log(`   High      │  ${String(confusion.high.low).padStart(3)}   │   ${String(confusion.high.medium).padStart(3)}  │  ${String(confusion.high.high).padStart(3)}   │`);
      console.log(`   ───────────────────────────────────────\n`);
      
      const classes = ['low', 'medium', 'high'];
      
      console.log(`   📊 MÉTRICAS POR CLASSE:\n`);
      
      for (const cls of classes) {
        const tp = confusion[cls][cls];
        let fp = 0;
        let fn = 0;
        
        for (const other of classes) {
          if (other !== cls) {
            fp += confusion[other][cls];
            fn += confusion[cls][other];
          }
        }
        
        const precision = tp + fp > 0 ? ((tp / (tp + fp)) * 100) : 0;
        const recall = tp + fn > 0 ? ((tp / (tp + fn)) * 100) : 0;
        const f1 = precision + recall > 0 ? ((2 * precision * recall) / (precision + recall)) : 0;
        
        console.log(`   Classe "${cls}":`);
        console.log(`      Precisão: ${precision.toFixed(2)}%`);
        console.log(`      Recall:   ${recall.toFixed(2)}%`);
        console.log(`      F1-Score: ${f1.toFixed(2)}%\n`);
        
        expect(tp).toBeGreaterThan(0);
      }
    });

    test('Matriz de Confusão e Métricas - Área', () => {
      const shuffled = seededShuffle(trainData);
      const splitIndex = Math.floor(shuffled.length * 0.8);
      const trainSet = shuffled.slice(0, splitIndex);
      const testSet = shuffled.slice(splitIndex);
      
      const classifierArea = new natural.BayesClassifier();
      for (const item of trainSet) {
        classifierArea.addDocument(item.text, item.area);
      }
      classifierArea.train();
      
      const confusion = {
        'collar': { 'collar': 0, 'antenna': 0, 'internet': 0, 'power': 0 },
        'antenna': { 'collar': 0, 'antenna': 0, 'internet': 0, 'power': 0 },
        'internet': { 'collar': 0, 'antenna': 0, 'internet': 0, 'power': 0 },
        'power': { 'collar': 0, 'antenna': 0, 'internet': 0, 'power': 0 }
      };
      
      for (const item of testSet) {
        const predicted = classifierArea.classify(item.text);
        confusion[item.area][predicted]++;
      }
      
      console.log(`\n📊 MATRIZ DE CONFUSÃO - ÁREA:`);
      console.log(`   ───────────────────────────────────────────────────`);
      console.log(`   Real      │ Collar │ Antenna │ Internet │ Power  │`);
      console.log(`   ───────────────────────────────────────────────────`);
      console.log(`   Collar    │  ${String(confusion.collar.collar).padStart(3)}   │   ${String(confusion.collar.antenna).padStart(3)}   │    ${String(confusion.collar.internet).padStart(3)}    │  ${String(confusion.collar.power).padStart(3)}   │`);
      console.log(`   Antenna   │  ${String(confusion.antenna.collar).padStart(3)}   │   ${String(confusion.antenna.antenna).padStart(3)}   │    ${String(confusion.antenna.internet).padStart(3)}    │  ${String(confusion.antenna.power).padStart(3)}   │`);
      console.log(`   Internet  │  ${String(confusion.internet.collar).padStart(3)}   │   ${String(confusion.internet.antenna).padStart(3)}   │    ${String(confusion.internet.internet).padStart(3)}    │  ${String(confusion.internet.power).padStart(3)}   │`);
      console.log(`   Power     │  ${String(confusion.power.collar).padStart(3)}   │   ${String(confusion.power.antenna).padStart(3)}   │    ${String(confusion.power.internet).padStart(3)}    │  ${String(confusion.power.power).padStart(3)}   │`);
      console.log(`   ───────────────────────────────────────────────────\n`);
      
      const classes = ['collar', 'antenna', 'internet', 'power'];
      
      console.log(`   📊 MÉTRICAS POR CLASSE:\n`);
      
      for (const cls of classes) {
        const tp = confusion[cls][cls];
        let fp = 0;
        let fn = 0;
        
        for (const other of classes) {
          if (other !== cls) {
            fp += confusion[other][cls];
            fn += confusion[cls][other];
          }
        }
        
        const precision = tp + fp > 0 ? ((tp / (tp + fp)) * 100) : 0;
        const recall = tp + fn > 0 ? ((tp / (tp + fn)) * 100) : 0;
        const f1 = precision + recall > 0 ? ((2 * precision * recall) / (precision + recall)) : 0;
        
        console.log(`   Classe "${cls}":`);
        console.log(`      Precisão: ${precision.toFixed(2)}%`);
        console.log(`      Recall:   ${recall.toFixed(2)}%`);
        console.log(`      F1-Score: ${f1.toFixed(2)}%\n`);
        
        expect(tp).toBeGreaterThan(0);
      }
    });

    test('Análise de Distribuição dos Dados de Treinamento', () => {
      const urgencyCount = { low: 0, medium: 0, high: 0 };
      const areaCount = { collar: 0, antenna: 0, internet: 0, power: 0 };
      
      for (const item of trainData) {
        urgencyCount[item.urgency]++;
        areaCount[item.area]++;
      }
      
      console.log(`\n📊 DISTRIBUIÇÃO DOS DADOS DE TREINAMENTO:\n`);
      console.log(`   Total de exemplos: ${trainData.length}`);
      console.log(`\n   Urgência:`);
      console.log(`      Low:    ${urgencyCount.low} (${((urgencyCount.low/trainData.length)*100).toFixed(1)}%)`);
      console.log(`      Medium: ${urgencyCount.medium} (${((urgencyCount.medium/trainData.length)*100).toFixed(1)}%)`);
      console.log(`      High:   ${urgencyCount.high} (${((urgencyCount.high/trainData.length)*100).toFixed(1)}%)`);
      console.log(`\n   Área:`);
      console.log(`      Collar:   ${areaCount.collar} (${((areaCount.collar/trainData.length)*100).toFixed(1)}%)`);
      console.log(`      Antenna:  ${areaCount.antenna} (${((areaCount.antenna/trainData.length)*100).toFixed(1)}%)`);
      console.log(`      Internet: ${areaCount.internet} (${((areaCount.internet/trainData.length)*100).toFixed(1)}%)`);
      console.log(`      Power:    ${areaCount.power} (${((areaCount.power/trainData.length)*100).toFixed(1)}%)\n`);
      
      expect(urgencyCount.low).toBeGreaterThan(0);
      expect(urgencyCount.medium).toBeGreaterThan(0);
      expect(urgencyCount.high).toBeGreaterThan(0);
      expect(areaCount.collar).toBeGreaterThan(0);
      expect(areaCount.antenna).toBeGreaterThan(0);
      expect(areaCount.internet).toBeGreaterThan(0);
      expect(areaCount.power).toBeGreaterThan(0);
    });
  });
});