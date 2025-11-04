import bcrypt from 'bcrypt';
import db from '../config/db.js';

(async () => {
  const hash = await bcrypt.hash('123456', 10);
  await db.execute(
    'INSERT INTO users (email, password_hash, role) VALUES (?,?,?)',
    ['itamar@gmail.com', hash, 'admin']
  );
  console.log('Usuário teste inserido');
  process.exit();
})();