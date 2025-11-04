import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

function isValidEmail(email) {
  return email.includes('@') && email.includes('.');
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email e senha obrigatórios' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: 'Email inválido' });
    }

    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ msg: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(password, users[0].password_hash);
    
    if (!senhaValida) {
      return res.status(401).json({ msg: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: users[0].id, email: users[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
}

export async function registerUser(req, res) {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ msg: 'Email e senha obrigatórios' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: 'Email inválido' });
    }

    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ msg: 'Email já cadastrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const userRole = role || 'user';

    await db.execute(
      'INSERT INTO users (email, password_hash, role) VALUES (?,?,?)',
      [email, hash, userRole]
    );

    res.status(201).json({ msg: 'Usuário criado com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ msg: 'Erro interno do servidor' });
  }
}