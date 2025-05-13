// config/db.js
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: "3307",
  password: process.env.DB_PASS || "",
  user: "root",
  database: "cua_hang_sach",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
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
