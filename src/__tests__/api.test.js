import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes.js';
import ticketRoutes from '../routes/ticketRoutes.js';
import farmRoutes from '../routes/farmRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/farms', farmRoutes);

describe('Testes da API', () => {
  
  describe('POST /api/auth/login', () => {
    test('Login com credenciais válidas retorna token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'itamar@gmail.com', password: '123456' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    test('Login sem email retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: '123456' });
      
      expect(response.status).toBe(400);
    });

    test('Login com email inválido retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'emailinvalido', password: '123456' });
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/tickets', () => {
    test('Criar ticket com dados válidos retorna 201', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .send({
          farm_code: 'FAZTEST',
          description: 'coleira com bateria inchada'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('urgency');
      expect(response.body).toHaveProperty('area');
    });

    test('Criar ticket sem descrição retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .send({ farm_code: 'FAZTEST' });
      
      expect(response.status).toBe(400);
    });

    test('Criar ticket com descrição curta retorna erro 400', async () => {
      const response = await request(app)
        .post('/api/tickets')
        .send({
          farm_code: 'FAZTEST',
          description: 'curta'
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/tickets/classify', () => {
    test('Classificar descrição válida retorna urgência e área', async () => {
      const response = await request(app)
        .post('/api/tickets/classify')
        .send({ description: 'antena com superaquecimento' });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('urgency');
      expect(response.body).toHaveProperty('area');
      expect(response.body).toHaveProperty('accuracy');

      expect(response.body.accuracy).toBeGreaterThan(0.5);  
      expect(response.body.accuracy).toBeLessThanOrEqual(1);  
    });
  });

  describe('GET /api/farms', () => {
    test('Listar fazendas retorna array', async () => {
      const response = await request(app).get('/api/farms');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

});