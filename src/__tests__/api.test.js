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

let authToken = null;
let testTicketId = null;

describe('Sistema de Monitoramento Animal - Testes Automatizados', () => {
  
  describe('Autenticacao e Registro', () => {
    
    test('Login com credenciais validas retorna token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'itamar@gmail.com', password: '123456' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
    });

    test('Login sem email retorna erro', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: '123456' });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('msg');
    });

    test('Login com email invalido retorna erro', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'emailinvalido', password: '123456' });
      
      expect(response.status).toBe(400);
    });

    test('Login com senha incorreta retorna erro', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'itamar@gmail.com', password: 'senhaerrada' });
      
      expect(response.status).toBe(401);
    });

    test('Registro com dados validos retorna sucesso', async () => {
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
    });

    test('Registro sem email retorna erro', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ password: '123456' });
      
      expect(response.status).toBe(400);
    });

    test('Registro com email ja existente retorna erro', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ 
          email: 'itamar@gmail.com',
          password: '123456' 
        });
      
      expect(response.status).toBe(400);
    });

    test('Requisicao sem token retorna erro', async () => {
      const response = await request(app)
        .get('/api/tickets');
      
      expect(response.status).toBe(401);
    });
  });

  describe('Criacao e Listagem de Tickets', () => {
    
    test('Criar ticket classifica automaticamente', async () => {
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
      expect(['low', 'medium', 'high']).toContain(response.body.urgency);
      expect(['collar', 'antenna', 'internet', 'power']).toContain(response.body.area);
      
      testTicketId = response.body.id;
    });

    test('Criar ticket sem descricao retorna erro', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ farm_code: 'FAZTEST' });
      
      expect(response.status).toBe(400);
    });

    test('Criar ticket com descricao curta retorna erro', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farm_code: 'FAZTEST',
          description: 'curta'
        });
      
      expect(response.status).toBe(400);
    });

    test('Criar ticket sem farm_code retorna erro', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'descricao valida com mais de dez caracteres'
        });
      
      expect(response.status).toBe(400);
    });

    test('Listar todos os tickets retorna array', async () => {
      const response = await request(app)
        .get('/api/tickets')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('Filtrar tickets por urgencia funciona', async () => {
      const response = await request(app)
        .get('/api/tickets?urgency=high')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Filtrar tickets por area funciona', async () => {
      const response = await request(app)
        .get('/api/tickets?area=collar')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Filtrar tickets por status funciona', async () => {
      const response = await request(app)
        .get('/api/tickets?status=open')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Atualizacao de Status', () => {
    
    test('Atualizar status para progress funciona', async () => {
      const response = await request(app)
        .put(`/api/tickets/${testTicketId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'progress' });
      
      expect(response.status).toBe(200);
    });

    test('Atualizar status para closed funciona', async () => {
      const response = await request(app)
        .put(`/api/tickets/${testTicketId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'closed' });
      
      expect(response.status).toBe(200);
    });

    test('Atualizar com status invalido retorna erro', async () => {
      const response = await request(app)
        .put(`/api/tickets/${testTicketId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalido' });
      
      expect(response.status).toBe(400);
    });

    test('Atualizar ticket inexistente retorna erro', async () => {
      const response = await request(app)
        .put('/api/tickets/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'progress' });
      
      expect(response.status).toBe(404);
    });
  });

  describe('Historico de Tickets', () => {
    
    test('Buscar historico retorna array de mudancas', async () => {
      const response = await request(app)
        .get(`/api/tickets/${testTicketId}/history`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    test('Buscar historico de ticket inexistente retorna array vazio', async () => {
      const response = await request(app)
        .get('/api/tickets/999999/history')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('Classificacao Automatica', () => {
    
    test('Endpoint de classificacao retorna urgencia e area', async () => {
      const response = await request(app)
        .post('/api/tickets/classify')
        .send({ description: 'antena com superaquecimento e chip queimado' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('urgency');
      expect(response.body).toHaveProperty('area');
      expect(response.body).toHaveProperty('accuracy');
      expect(['low', 'medium', 'high']).toContain(response.body.urgency);
      expect(['collar', 'antenna', 'internet', 'power']).toContain(response.body.area);
    });

    test('Classificacao sem descricao retorna erro', async () => {
      const response = await request(app)
        .post('/api/tickets/classify')
        .send({});
      
      expect(response.status).toBe(400);
    });

    test('Classificacao com descricao curta retorna erro', async () => {
      const response = await request(app)
        .post('/api/tickets/classify')
        .send({ description: 'curto' });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Gestao de Fazendas', () => {
    
    test('Listar fazendas retorna array', async () => {
      const response = await request(app)
        .get('/api/farms')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Validacao Machine Learning - Modelo em Producao', () => {
    
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

    test('Acuracia do modelo em amostra de teste', () => {
      const shuffled = seededShuffle(trainData);
      const splitIndex = Math.floor(shuffled.length * 0.8);
      const testSample = shuffled.slice(splitIndex);
      
      let correctUrgency = 0;
      let correctArea = 0;
      
      for (const item of testSample) {
        const result = classifyTicket(item.text);
        if (result.urgency === item.urgency) correctUrgency++;
        if (result.area === item.area) correctArea++;
      }
      
      const urgencyAccuracy = (correctUrgency / testSample.length) * 100;
      const areaAccuracy = (correctArea / testSample.length) * 100;
      
      expect(urgencyAccuracy).toBeGreaterThanOrEqual(90);
      expect(areaAccuracy).toBeGreaterThanOrEqual(95);
    });

    test('Validacao com casos especificos conhecidos', () => {
      const testCases = [
        { 
          text: 'coleira com bateria superaquecendo e inchada', 
          expectedUrgency: 'high', 
          expectedArea: 'collar' 
        },
        { 
          text: 'antena com chip danificado nao reconhece', 
          expectedUrgency: 'high', 
          expectedArea: 'antenna' 
        },
        { 
          text: 'internet oscilando no smartphone do tecnico', 
          expectedUrgency: 'low', 
          expectedArea: 'internet' 
        },
        { 
          text: 'fonte de alimentacao com capacitor estourado', 
          expectedUrgency: 'high', 
          expectedArea: 'power' 
        }
      ];
      
      let correctUrgency = 0;
      let correctArea = 0;
      
      for (const testCase of testCases) {
        const result = classifyTicket(testCase.text);
        if (result.urgency === testCase.expectedUrgency) correctUrgency++;
        if (result.area === testCase.expectedArea) correctArea++;
      }
      
      expect(correctUrgency).toBeGreaterThanOrEqual(3);
      expect(correctArea).toBeGreaterThanOrEqual(3);
    });
  });

  describe('Validacao Cientifica - Divisao 80/20', () => {
    
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
    
    test('Acuracia de Urgencia >= 95%', () => {
      const shuffled = seededShuffle(trainData);
      const splitIndex = Math.floor(shuffled.length * 0.8);
      const trainSet = shuffled.slice(0, splitIndex);
      const testSet = shuffled.slice(splitIndex);
      
      const classifierUrg = new natural.BayesClassifier();
      
      for (const item of trainSet) {
        classifierUrg.addDocument(item.text, item.urgency);
      }
      
      classifierUrg.train();
      
      let correct = 0;
      for (const item of testSet) {
        const predicted = classifierUrg.classify(item.text);
        if (predicted === item.urgency) correct++;
      }
      
      const accuracy = (correct / testSet.length) * 100;
      
      expect(accuracy).toBeGreaterThanOrEqual(95);
    });

    test('Acuracia de Area >= 99%', () => {
      const shuffled = seededShuffle(trainData);
      const splitIndex = Math.floor(shuffled.length * 0.8);
      const trainSet = shuffled.slice(0, splitIndex);
      const testSet = shuffled.slice(splitIndex);
      
      const classifierArea = new natural.BayesClassifier();
      
      for (const item of trainSet) {
        classifierArea.addDocument(item.text, item.area);
      }
      
      classifierArea.train();
      
      let correct = 0;
      for (const item of testSet) {
        const predicted = classifierArea.classify(item.text);
        if (predicted === item.area) correct++;
      }
      
      const accuracy = (correct / testSet.length) * 100;
      
      expect(accuracy).toBeGreaterThanOrEqual(99);
    });

    test('Matriz de Confusao - Urgencia', () => {
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
      
      const classes = ['low', 'medium', 'high'];
      
      for (const cls of classes) {
        const tp = confusion[cls][cls];
        expect(tp).toBeGreaterThan(0);
      }
    });

    test('Matriz de Confusao - Area', () => {
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
      
      const classes = ['collar', 'antenna', 'internet', 'power'];
      
      for (const cls of classes) {
        const tp = confusion[cls][cls];
        expect(tp).toBeGreaterThan(0);
      }
    });

    test('Distribuicao dos dados de treinamento', () => {
      const urgencyCount = { low: 0, medium: 0, high: 0 };
      const areaCount = { collar: 0, antenna: 0, internet: 0, power: 0 };
      
      for (const item of trainData) {
        urgencyCount[item.urgency]++;
        areaCount[item.area]++;
      }
      
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