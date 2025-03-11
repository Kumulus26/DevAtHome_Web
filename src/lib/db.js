import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  port: 8889,
  user: 'admin',
  password: '3Evee1965@--',
  database: 'DevAtHomeDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool; 