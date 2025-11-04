import db from '../config/db.js';

export async function listFarms(req, res) {
  try {
    const [farms] = await db.execute('SELECT * FROM farms ORDER BY code ASC');
    res.json(farms);
  } catch (error) {
    console.error('Erro ao listar fazendas:', error);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
}