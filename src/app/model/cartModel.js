const database=require('../../config/db')

const getCartByUserId = async (userId) => {
    const query = `
        SELECT * 
        FROM KhachHang
        JOIN GioHang ON KhachHang.ID_KH = GioHang.ID_KH
        JOIN SanPham ON SanPham.SanPhamID = GioHang.ID_SP
        JOIN AnhSP ON AnhSP.ID_SP = SanPham.SanPhamID
        WHERE KhachHang.ID_KH = ?
    `;
    const [rows] = await database.query(query, [userId]);
    return rows;
};



const themVaoGio = async (ID_KH, ID_SP) => {
    try {
      const [rows] = await database.query(
        `SELECT * FROM GioHang WHERE ID_KH = ? AND ID_SP = ?`,
        [ID_KH, ID_SP]
      );
  
      if (rows.length === 0) {
        await database.query(
          `INSERT INTO GioHang (ID_KH, ID_SP, SoLuong) VALUES (?, ?, 0)`,
          [ID_KH, ID_SP]
        );
      }
  
      return { success: true };
    } catch (err) {
      console.error('❌ Lỗi khi thêm vào giỏ hàng:', err);
      throw err;
    }
  };


  const xoaSanPhamTrongGio = async (ID_KH, ID_SP) => {
    try {
      await database.query(
        `DELETE FROM GioHang WHERE ID_KH = ? AND ID_SP = ?`,
        [ID_KH, ID_SP]
      );
      return { success: true };
    } catch (error) {
      console.error('❌ Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
      throw error;
    }
  };

module.exports = {
    getCartByUserId,
    themVaoGio,
    xoaSanPhamTrongGio

};