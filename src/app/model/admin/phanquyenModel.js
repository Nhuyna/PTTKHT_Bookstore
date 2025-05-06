import db from "../../../config/db.js";

async function findPermissionbyQuyenCha(name) {
  try {
    let query = "";
    let params = [];

    if (name === null || name === undefined) {
      query = "SELECT * FROM danhmucchucnang WHERE QuyenCha IS NULL";
    } else {
      query = "SELECT * FROM danhmucchucnang WHERE QuyenCha = ?";
      params = [name];
    }

    const [rows] = await db.execute(query, params);
    return rows;
  } catch (error) {
    console.error("Lỗi khi truy vấn:", error);
    return [];
  }
}

async function findQuyenChaFromPermissions(permissions) {
  if (!permissions || permissions.length === 0) return "qldoanhnghiep";

  // Bước 1: lấy các chức năng không trùng
  const dsChucNang = Array.from(new Set(permissions.map((p) => p.ChucNang)));
  console.log("danh sách chức năng nè,", dsChucNang);

  // Bước 2: lấy danh sách quyền cha có thể có
  const dsquyencha = await findPermissionbyQuyenCha();
  console.log("dsqc", dsquyencha);

  // Bước 3: truy vấn các quyền cha từ bảng
  const placeholders = dsChucNang.map(() => "?").join(",");
  const sql = `
    SELECT DISTINCT quyencha 
    FROM danhmucchucnang 
    WHERE ChucNang IN (${placeholders}) 
      AND quyencha IS NOT NULL
  `;
  const [rows] = await db.query(sql, dsChucNang);
  console.log("rows".rows);
  // Nếu chỉ có 1 quyền cha → trả về nó
  if (rows.length === 1) {
    return rows[0].quyencha;
  }

  // Nếu KHÔNG có dòng nào được trả về
  if (rows.length === 0) {
    // Kiểm tra nếu tất cả chức
    // vonăng giống nhau
    console.log("Khong có nè");
    if (dsChucNang.length === 1) {
      const chucnang = dsChucNang[0];
      console.log(chucnang);
      const found = dsquyencha.some((item) => item.ChucNang === chucnang);
      if (found) return chucnang;
    }
  }

  // Mặc định trả về
  return "qldoanhnghiep";
}

async function findPAccessIdNhomQuyen(id, action) {
  try {
    const [rows] = await db.execute(
      `SELECT ChucNang FROM ChiTietQuyen WHERE ID_NhomQuyen = ? AND HanhDong = ?`,
      [id, action]
    );
    console.log(rows);

    return rows;
  } catch (error) {
    console.error("Lỗi khi truy vấn quyền:", error);
    return [];
  }
}

async function action(id, ChucNang) {
  try {
    const [rows] = await db.execute(
      `SELECT HanhDong FROM ChiTietQuyen WHERE ID_NhomQuyen = ? AND ChucNang = ?`,
      [id, ChucNang]
    );

    const actions = rows.map((p) => p.HanhDong);
    return actions;
  } catch (error) {
    console.error("Lỗi khi truy vấn quyền:", error);
    return [];
  }
}

async function addRoleToTable(TenNhomQuyen) {
  try {
    const query = `
      INSERT INTO nhomquyen (TenNhomQuyen)
      VALUES (?)
    `;
    const [result] = await db.execute(query, [TenNhomQuyen]);

    // Trả về ID_NhomQuyen vừa được tạo
    return result.insertId;
  } catch (err) {
    console.error("Lỗi khi thêm vai trò:", err);
    throw err;
  }
}
async function deleteRoleById(ID_NhomQuyen) {
  try {
    // Xóa quyền chi tiết trước
    await deletePermissionsByRoleId(ID_NhomQuyen);

    // Kiểm tra xem nhóm quyền có đang được sử dụng không
    const checkQuery = `SELECT COUNT(*) as count FROM TaiKhoan WHERE ID_NhomQuyen = ?`;
    const [checkResult] = await db.execute(checkQuery, [ID_NhomQuyen]);

    if (checkResult[0].count > 0) {
      // Nếu có tài khoản đang sử dụng nhóm quyền này
      const updateQuery = `UPDATE TaiKhoan SET ID_NhomQuyen = NULL WHERE ID_NhomQuyen = ?`;
      await db.execute(updateQuery, [ID_NhomQuyen]);
      console.log("Đã xóa nhóm quyền khỏi tài khoản đang sử dụng.");
    }

    // Xóa nhóm quyền
    const query = `DELETE FROM NhomQuyen WHERE ID_NhomQuyen = ?`;
    const [result] = await db.execute(query, [ID_NhomQuyen]);

    return result;
  } catch (err) {
    console.error("Lỗi khi xóa nhóm quyền:", err);
    throw err;
  }
}

// Hàm xóa quyền chi tiết (ChiTietQuyen)
async function deletePermissionsByRoleId(ID_NhomQuyen) {
  try {
    const query = `DELETE FROM ChiTietQuyen WHERE ID_NhomQuyen = ?`;
    await db.execute(query, [ID_NhomQuyen]);
  } catch (err) {
    console.error("Lỗi khi xóa chi tiết quyền:", err);
    throw err;
  }
}

async function addPermissionsToTable(ID_NhomQuyen, ChucNang, HanhDong) {
  try {
    const query = `
      INSERT INTO ChiTietQuyen (ID_NhomQuyen, ChucNang, HanhDong)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.execute(query, [
      ID_NhomQuyen,
      ChucNang,
      HanhDong,
    ]);

    return result; // Hoặc return result.insertId nếu có AUTO_INCREMENT
  } catch (err) {
    console.error("Lỗi khi thêm quyền:", err);
    throw err;
  }
}
async function insertPermissionsForRole(roleId, quyen) {
  const values = [];

  const quyenCha = Object.keys(quyen)[0];
  const nhomChucNang = quyen[quyenCha];

  values.push([roleId, quyenCha, "access"]);

  for (const chucnang in nhomChucNang) {
    const actions = nhomChucNang[chucnang];
    actions.forEach((action) => {
      values.push([roleId, chucnang, action]);
    });
  }

  if (values.length > 0) {
    const sqlInsert = `
      INSERT INTO chitietquyen (ID_NhomQuyen, ChucNang, HanhDong)
      VALUES ?
    `;
    await db.query(sqlInsert, [values]);
  }
}

export default {
  findPermissionbyQuyenCha,
  findPAccessIdNhomQuyen,
  action,
  addRoleToTable,
  addPermissionsToTable,
  deletePermissionsByRoleId,
  deleteRoleById,
  findQuyenChaFromPermissions,
  insertPermissionsForRole,
};
