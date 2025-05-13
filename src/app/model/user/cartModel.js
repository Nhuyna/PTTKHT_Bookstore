import database from "../../../config/db.js";

const getCartByUserId = async (userId) => {
  const query = `
SELECT 
    KhachHang.*, 
    GioHang.*, 
    SanPham.*, 
    AnhSP.*

FROM KhachHang
JOIN GioHang ON KhachHang.ID_KH = GioHang.ID_KH
JOIN SanPham ON SanPham.SanPhamID = GioHang.ID_SP
LEFT JOIN (
    SELECT ID_SP, MIN(STT) AS MIN_STT
    FROM AnhSP
    GROUP BY ID_SP
) AS FirstAnhSP ON FirstAnhSP.ID_SP = SanPham.SanPhamID
LEFT JOIN AnhSP ON AnhSP.ID_SP = FirstAnhSP.ID_SP AND AnhSP.STT = FirstAnhSP.MIN_STT
WHERE KhachHang.ID_KH = ?;

    `;
  const [rows] = await database.query(query, [userId]);
  return rows;
};

const taoHoaDon = async (idKH, tongTien, PhuongThucThanhToan) => {
  const [result] = await database.query(
    "INSERT INTO HoaDonXuat (ID_KH, TongTien, PhuongThucThanhToan) VALUES (?, ?, ?)",
    [idKH, tongTien, PhuongThucThanhToan]
  );
  return result.insertId;
};

// const getCartByUserId = async (userId) => {
//   const query = `
// SELECT
//     KhachHang.*,
//     GioHang.*,
//     SanPham.*

// FROM KhachHang
// JOIN GioHang ON KhachHang.ID_KH = GioHang.ID_KH
// JOIN SanPham ON SanPham.SanPhamID = GioHang.ID_SP
// WHERE KhachHang.ID_KH = ?;

//     `;
//   const [rows] = await database.query(query, [userId]);
//   return rows;
// };

const themVaoGio = async (ID_KH, ID_SP, soluong = 1) => {
  try {
    await database.query(
      `INSERT INTO GioHang (ID_KH, ID_SP, SoLuong)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE SoLuong = SoLuong + VALUES(SoLuong)`,
      [ID_KH, ID_SP, soluong]
    );

    return { success: true };
  } catch (err) {
    console.error("❌ Lỗi khi thêm vào giỏ hàng:", err);
    throw err;
  }
};

const xoaSanPhamTrongGio = async (ID_KH, ID_SP) => {
  try {
    await database.query(`DELETE FROM GioHang WHERE ID_KH = ? AND ID_SP = ?`, [
      ID_KH,
      ID_SP,
    ]);
    return { success: true };
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    throw error;
  }
};
const deleteItem = async (userId, productId) => {
  try {
    await database.query(`DELETE FROM GioHang WHERE ID_KH = ? AND ID_SP = ?`, [
      userId,
      productId,
    ]);
    return { success: true };
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    throw error;
  }
};
const getTotalPrice = async (userId) => {
  try {
    const [rows] = await database.query(
      `SELECT SanPham.Gia, GioHang.SoLuong 
       FROM GioHang 
       JOIN SanPham ON GioHang.ID_SP = SanPham.SanPhamID 
       WHERE GioHang.ID_KH = ?`,
      [userId]
    );

    const totalPrice = rows.reduce((acc, item) => {
      return acc + item.Gia * item.SoLuong;
    }, 0);

    return totalPrice;
  } catch (error) {
    console.error("❌ Lỗi khi tính tổng giá trị giỏ hàng:", error);
    throw error;
  }
};
export default {
  getCartByUserId,
  themVaoGio,
  xoaSanPhamTrongGio,
  taoHoaDon,
  getTotalPrice,
  deleteItem,
};
