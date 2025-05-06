import db from "../../../config/db.js";
class Permission {
  async getRoleById(id) {
    const [rows] = await db.execute(
      "SELECT * FROM nhomquyen WHERE ID_NhomQuyen = ?",
      [id]
    );
    return rows[0];
  }

  async getPermissionsOfRole(roleId) {
    const [rows] = await db.execute(
      `
      SELECT * FROM chitietquyen WHERE ID_NhomQuyen = ?
    `,
      [roleId]
    );
    return rows;
  }
  async getAll() {
    const query = `SELECT * FROM nhomquyen
        WHERE tinhTrang = 1`;
    const [rows] = await db.execute(query);
    return rows;
  }

  async getRolesWithPermissions() {
    try {
      const [rows] = await db.execute("SELECT * FROM DanhMucChucNang");

      const groups = {};

      for (const row of rows) {
        const { ChucNang, TenQuyen, QuyenCha } = row;

        // Nếu là quyền cha (QuyenCha = null)
        if (!QuyenCha) {
          if (!groups[ChucNang]) {
            groups[ChucNang] = {
              id: ChucNang,
              name: TenQuyen,
              permissions: [],
            };
          }
        } else {
          // Nếu cha chưa tồn tại thì tạo mới
          if (!groups[QuyenCha]) {
            groups[QuyenCha] = {
              id: QuyenCha,
              name: QuyenCha,
              permissions: [],
            };
          }

          // Thêm quyền con vào nhóm cha tương ứng
          groups[QuyenCha].permissions.push({
            name: TenQuyen,
            code: ChucNang,
          });

          // Đảm bảo nhóm 'qldoanhnghiep' tồn tại
          if (!groups["qldoanhnghiep"]) {
            groups["qldoanhnghiep"] = {
              id: "qldoanhnghiep",
              name: "Quản lý doanh nghiệp",
              permissions: [],
            };
          }

          // Thêm quyền con vào 'qldoanhnghiep' nếu chưa có
          if (
            !groups["qldoanhnghiep"].permissions.some(
              (p) => p.code === ChucNang
            )
          ) {
            groups["qldoanhnghiep"].permissions.push({
              name: TenQuyen,
              code: ChucNang,
            });
          }
        }
      }

      // Cập nhật lại tên nhóm nếu cần
      for (const row of rows) {
        if (!row.QuyenCha && groups[row.ChucNang]) {
          groups[row.ChucNang].name = row.TenQuyen;
        }
      }

      return Object.values(groups);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách roles:", error);
      return [];
    }
  }
}
export default new Permission();
