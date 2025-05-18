import database from "../../../config/db.js";

const getInforUser = async (id) => {
  const [rows] = await database.query("select * from KhachHang where ID_KH=?", [
    id,
  ]);
  return rows;
};

const getResultFromQuery = async (query) => {
  const [rows] = await database.query(query);
  return rows;
};

const getUserById = async (id) => {
  const [rows] = await database.query(
    "SELECT * FROM KhachHang WHERE ID_KH = ?",
    [id]
  );
  return rows[0];
};

const updateUserInfo = async (ID_KH, { TenKH, SDT, NgaySinh }) => {
  const query = `UPDATE KhachHang SET NgaySinh = ?, TenKH = ?, SDT = ? WHERE ID_KH = ?`;
  await database.query(query, [NgaySinh, TenKH, SDT, ID_KH]);
};

const updateUserInfoNoPhone = async (ID_KH, { TenKH, NgaySinh }) => {
  const query = `UPDATE KhachHang SET NgaySinh = ?, TenKH = ? WHERE ID_KH = ?`;
  await database.query(query, [NgaySinh, TenKH, ID_KH]);
};

const findUserByPhone = async (phone) => {
  const [rows] = await database.query("SELECT * FROM KhachHang WHERE SDT = ?", [
    phone,
  ]);
  return rows[0]; // trả về user hoặc undefined
};

const findUserByIdAndPassword = async (id, password) => {
  const [rows] = await database.query(
    "SELECT * FROM KhachHang WHERE ID_KH = ? AND MatKhau = ?",
    [id, password]
  );
  return rows[0]; // trả về user nếu đúng mật khẩu
};

const updatePassword = async (id, newPassword) => {
  await database.query("UPDATE KhachHang SET MatKhau = ? WHERE ID_KH = ?", [
    newPassword,
    id,
  ]);
};

const createUser = async ({
  user_account_name,
  user_name,
  user_telephone,
  user_password,
}) => {
  const query = `INSERT INTO KhachHang (TenTK, TenKH, SDT, MatKhau) VALUES (?, ?, ?, ?)`;
  await database.query(query, [
    user_account_name,
    user_name,
    user_telephone,
    user_password,
  ]);
};
const getUserByPhoneExceptId = async (phone, currentId) => {
  const query = `SELECT * FROM KhachHang WHERE SDT = ? AND ID_KH != ?`;
  const [rows] = await database.query(query, [phone, currentId]);
  return rows.length > 0 ? rows[0] : null;
};

export default {
  getInforUser,
  getResultFromQuery,
  getUserById,
  updateUserInfo,
  updateUserInfoNoPhone,
  findUserByPhone,
  updatePassword,
  findUserByIdAndPassword,
  createUser,
  getUserByPhoneExceptId
};
