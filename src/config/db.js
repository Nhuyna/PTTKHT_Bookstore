// config/db.js
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// pool.getConnection((err, connection) => {
//     if (err) {
//         console.error('Kết nối MySQL thất bại:', err);
//     } else {
//         console.log('Kết nối MySQL thành công!');
//         connection.release();
//     }
// });

export default pool.promise();
