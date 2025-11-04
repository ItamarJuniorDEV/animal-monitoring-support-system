import db from '../config/db.js';
import { classifyTicket } from '../services/classifyService.js';

const testPhrases = [
  { text: 'coleira com antena interna danificada', urgency: 'high', area: 'collar' },
  { text: 'antena com chip não detectado', urgency: 'high', area: 'antenna' },
  { text: 'internet com provedor fora do ar', urgency: 'high', area: 'internet' },
  { text: 'fonte com placa com umidade', urgency: 'high', area: 'power' },
  { text: 'coleira com superaquecimento na bateria', urgency: 'high', area: 'collar' },
  { text: 'antena com vazamento de eletrólito', urgency: 'high', area: 'antenna' },
  { text: 'internet com queda em smartphone', urgency: 'low', area: 'internet' },
  { text: 'fonte com capacitor estourado', urgency: 'high', area: 'power' },
  { text: 'coleira com LED piscando', urgency: 'medium', area: 'collar' },
  { text: 'antena com botão duplo clique falhando', urgency: 'medium', area: 'antenna' },
];

async function createTestTicket(phrase, farmCode) {
  const { urgency, area } = classifyTicket(phrase.text);

  let [farm] = await db.execute('SELECT id FROM farms WHERE code=?', [farmCode]);
  if (farm.length === 0) {
    const [result] = await db.execute('INSERT INTO farms (code) VALUES (?)', [farmCode]);
    farm = [{ id: result.insertId }];
  }

  const [result] = await db.execute(
    'INSERT INTO tickets (farm_id, description, urgency, area) VALUES (?,?,?,?)',
    [farm[0].id, phrase.text, urgency, area]
  );

  return result.insertId;
}

async function createTestTickets() {
  console.log('Criando 10 tickets de teste...');

  for (let i = 0; i < 10; i++) {
    const phrase = testPhrases[i];
    const farmCode = `Faz${String(i + 1).padStart(3, '0')}`;
    const ticketId = await createTestTicket(phrase, farmCode);
    console.log(`Ticket ${ticketId} criado: "${phrase.text}" → urgency: ${phrase.urgency}, area: ${phrase.area}`);
  }

  console.log('10 tickets de teste criados com sucesso!');
  process.exit();
}

createTestTickets();