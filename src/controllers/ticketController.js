import db from '../config/db.js';
import { classifyTicket } from '../services/classifyService.js';

export async function listTickets(req, res) {
  try {
    const filters = req.query;
    let sql = `SELECT t.*, f.code AS farm_code 
               FROM tickets t 
               JOIN farms f ON t.farm_id = f.id 
               WHERE 1=1`;
    const params = [];
    
    if (filters.urgency) { sql += ' AND t.urgency=?'; params.push(filters.urgency); }
    if (filters.area)    { sql += ' AND t.area=?';    params.push(filters.area); }
    if (filters.status)  { sql += ' AND t.status=?';  params.push(filters.status); }
    
    sql += ' ORDER BY t.created_at DESC';
    
    const [rows] = await db.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar tickets:', error);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
}

export async function createTicket(req, res) {
  try {
    const { farm_code, description } = req.body;
    
    if (!farm_code || !description) {
      return res.status(400).json({ msg: 'farm_code e description obrigatórios' });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({ msg: 'Descrição deve ter no mínimo 10 caracteres' });
    }

    let [farm] = await db.execute('SELECT id FROM farms WHERE code=?', [farm_code]);
    if (farm.length === 0) {
      const [result] = await db.execute('INSERT INTO farms (code) VALUES (?)', [farm_code]);
      farm = [{ id: result.insertId }];
    }

    const { urgency, area, accuracy } = classifyTicket(description);
    
    const [result] = await db.execute(
      `INSERT INTO tickets (farm_id, description, urgency, area, predicted_urgency, predicted_area, model_accuracy) 
       VALUES (?,?,?,?,?,?,?)`,
      [farm[0].id, description, urgency, area, urgency, area, accuracy]
    );

    const [ticket] = await db.execute(
      'SELECT t.*, f.code AS farm_code FROM tickets t JOIN farms f ON t.farm_id = f.id WHERE t.id=?',
      [result.insertId]
    );
    
    res.status(201).json(ticket[0]);
  } catch (error) {
    console.error('Erro ao criar ticket:', error);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
}

export async function updateTicketStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) return res.status(400).json({ msg: 'Status obrigatório' });

    const validStatuses = ['open', 'progress', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        msg: 'Status inválido. Valores aceitos: open, progress, closed' 
      });
    }
    
    const [tickets] = await db.execute('SELECT id FROM tickets WHERE id=?', [id]);
    if (tickets.length === 0) {
      return res.status(404).json({ msg: 'Ticket não encontrado' });
    }
    
    await db.execute('UPDATE tickets SET status=? WHERE id=?', [status, id]);
    
    await db.execute(
      'INSERT INTO history (ticket_id, note) VALUES (?, ?)',
      [id, `Status alterado para: ${status}`]
    );
    
    res.json({ msg: 'Status atualizado' });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
}

export async function deleteTicket(req, res) {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM tickets WHERE id=?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Ticket não encontrado' });
    }
    
    res.json({ msg: 'Ticket excluído' });
  } catch (error) {
    console.error('Erro ao deletar ticket:', error);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
}

export async function getTicketHistory(req, res) {
  try {
    const { id } = req.params;
    
    const [history] = await db.execute(
      'SELECT * FROM history WHERE ticket_id = ? ORDER BY changed_at DESC',
      [id]
    );
    
    res.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
}

export async function testClassification(req, res) {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ msg: 'Descrição obrigatória' });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({ msg: 'Descrição deve ter no mínimo 10 caracteres' });
    }

    const result = classifyTicket(description);
    res.json(result);
  } catch (error) {
    console.error('Erro ao testar classificação:', error);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
}