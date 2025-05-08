import phanquyen from "../../model/admin/phanquyenModel.js";
import perModel from "../../model/admin/permissionsModel.js";
import db from "../../../config/db.js";
class Permissions {
  async show(req, res) {
    let permissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
    ).map((p) => p.ChucNang);

    const allPermissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
    ).map((p) => p.ChucNang);

    permissions = permissions.concat(allPermissions);
    permissions.push("admin");

    let action = await phanquyen.action(req.session.user.idNQ, "nhomquyen");
    try {
      console.log("Vào per nè");
      const listper = await perModel.getAll();
      console.log(listper);
      res.render("admin/permissions", {
        title: "Permissions",
        cssFiles: ["admin/style"],
        layout: "admin",
        listper,
        permissions,
        action,
      });
    } catch (error) {}
  }
  async create(req, res) {
    let permissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
    ).map((p) => p.ChucNang);

    const allPermissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
    ).map((p) => p.ChucNang);
    const roles = await perModel.getRolesWithPermissions();
    console.log("ê", roles);
    permissions = permissions.concat(allPermissions);
    permissions.push("admin");
    let action = await phanquyen.action(req.session.user.idNQ, "nhomquyen");
    try {
      console.log("Vào per nè");
      const listper = await perModel.getAll();
      // console.log(listper);
      console.log("action nè: " + action);

      res.render("admin/createpm", {
        title: "Permissions",
        cssFiles: ["admin/style"],
        layout: "admin",
        listper,
        permissions,
        action,
        roles,
      });
    } catch (error) {}
  }
  // controllers/admin/PermissionController.js

  // async createpost(req, res) {
  //   try {
  //     console.log(
  //       "Dữ liệu nhận được từ client:",
  //       JSON.stringify(req.body, null, 2)
  //     );

  //     const ds = req.body;
  //     const result = await phanquyen.addRoleToTable(req.body.name);
  //     for (let group in ds.quyen) {
  //       for (let role in ds.quyen[group]) {
  //         for (let permission of ds.quyen[group][role]) {
  //           console.log(
  //             "Giờ thêm nè: " + result + " " + role + " " + permission
  //           );
  //           await phanquyen.addPermissionsToTable(result, role, permission);
  //         }
  //       }
  //     }

  //     res.redirect("/admin/permissions");
  //   } catch (err) {
  //     console.error("Lỗi khi xử lý dữ liệu:", err);
  //     res.status(500).send("Có lỗi xảy ra");
  //   }
  // }

  async createpost(req, res) {
    try {
      console.log(
        "Dữ liệu nhận được từ client:",
        JSON.stringify(req.body, null, 2)
      );

      const ds = req.body;
      const result = await phanquyen.addRoleToTable(req.body.name);
      console.log("result: ", result);
      console.log("Danhsach:", ds.quyen);
      await phanquyen.insertPermissionsForRole(result, ds.quyen);

      res.redirect("/admin/permissions");
    } catch (err) {
      console.error("Lỗi khi xử lý dữ liệu:", err);
      res.status(500).send("Có lỗi xảy ra");
    }
  }
  async view(req, res) {
    const id = req.params.id;
    let permissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
    ).map((p) => p.ChucNang);
    const allPermissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
    ).map((p) => p.ChucNang);
    permissions = permissions.concat(allPermissions);
    permissions.push("admin");
    const role = await perModel.getRoleById(id);

    const roles = await perModel.getRolesWithPermissions();

    const existingPermissions = await perModel.getPermissionsOfRole(id);

    const quyenCha = await phanquyen.findQuyenChaFromPermissions(
      existingPermissions
    );

    const matchedRole = roles.find((role) => role.id === quyenCha);

    matchedRole.permissions.forEach((p) => {
      p.pm = [];

      existingPermissions.forEach((e) => {
        if (e.HanhDong === "access") return;
        if (e.ChucNang === matchedRole.id) {
          if (!p.pm.includes(e.HanhDong)) {
            p.pm.push(e.HanhDong);
          }
        } else if (e.ChucNang === p.code) {
          if (!p.pm.includes(e.HanhDong)) {
            p.pm.push(e.HanhDong);
          }
        }
      });
    });
    res.render("admin/viewpm", {
      title: "Cập nhật Nhóm quyền",
      cssFiles: ["admin/style"],
      layout: "admin",
      role,
      permissions,
      matchedRole,
    });
  }
  async delete(req, res) {
    try {
      const roleId = req.params.id;
      console.log("ID nhóm quyền cần xóa:", roleId);

      // Gọi model để xóa
      const result = await phanquyen.deleteRoleById(roleId);
      console.log("Kết quả xóa:", result);

      res.redirect("/admin/permissions");
    } catch (err) {
      console.error("Lỗi khi xóa nhóm quyền:", err);
      res.status(500).send("Có lỗi xảy ra khi xóa nhóm quyền");
    }
  }

  async update(req, res) {
    const id = req.params.id;
    const ds = req.body;
    const { name, quyen } = req.body;

    try {
      const sqlUpdate =
        "UPDATE nhomquyen SET TenNhomQuyen = ? WHERE ID_NhomQuyen = ?";
      await db.query(sqlUpdate, [name, id]);

      const sqlDelete = "DELETE FROM chitietquyen WHERE ID_NhomQuyen = ?";
      await db.query(sqlDelete, [id]);
      console.log("Trong update: quyền : ", quyen);
      console.log("id nè trong quyen: ", id);

      // {
      //   name: 'quyền test',
      //   id: '23',
      //   matchedRoleId: 'qlkho',
      //   quyen: [ { qldanhmuc: [Array] } ]
      // }
      const group = {
        [ds.matchedRoleId]: quyen[0],
      };

      // Danhsach: {
      //   qlkho: {
      //     qldanhmuc: ["view"];
      //   }
      // }
      console.log("group nè", JSON.stringify(group, null, 2));

      if (quyen && id) {
        await phanquyen.insertPermissionsForRole(id, group);
        // Trong update: quyền :  [ { taikhoan: [ 'view' ] } ]
        // Danhsach: { qlkho: { qldanhmuc: [ 'view' ], qlhdn: [ 'view' ] } }
      }

      res.redirect("/admin/permissions");
    } catch (error) {
      console.error("Lỗi khi cập nhật nhóm quyền:", error);
      res.status(500).send("Có lỗi xảy ra khi cập nhật nhóm quyền.");
    }
  }

  // async update(req, res) {
  //   const id = req.params.id;
  //   const { name, quyen } = req.body;

  //   try {
  //     const sqlUpdate =
  //       "UPDATE nhomquyen SET TenNhomQuyen = ? WHERE ID_NhomQuyen = ?";
  //     await db.query(sqlUpdate, [name, id]);

  //     // Xóa quyền cũ
  //     const sqlDelete = "DELETE FROM chitietquyen WHERE ID_NhomQuyen = ?";
  //     await db.query(sqlDelete, [id]);

  //     // Thêm quyền mới
  //     const values = [];
  //     if (quyen[id]) {
  //       for (const chucnang in quyen[id]) {
  //         const actions = quyen[id][chucnang];
  //         actions.forEach((action) => {
  //           values.push([id, chucnang, action]);
  //         });
  //       }
  //     }

  //     if (values.length > 0) {
  //       const sqlInsert =
  //         "INSERT INTO chitietquyen (ID_NhomQuyen, ChucNang, HanhDong) VALUES ?";
  //       await db.query(sqlInsert, [values]);
  //     }

  //     res.redirect("/admin/permissions");
  //   } catch (error) {
  //     console.error("Lỗi khi cập nhật nhóm quyền:", error);
  //     res.status(500).send("Có lỗi xảy ra khi cập nhật nhóm quyền.");
  //   }
  // }

  async editForm(req, res) {
    const id = req.params.id;
    let permissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
    ).map((p) => p.ChucNang);
    const allPermissions = (
      await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
    ).map((p) => p.ChucNang);
    permissions = permissions.concat(allPermissions);
    permissions.push("admin");
    const role = await perModel.getRoleById(id);

    const roles = await perModel.getRolesWithPermissions();

    const existingPermissions = await perModel.getPermissionsOfRole(id);

    const quyenCha = await phanquyen.findQuyenChaFromPermissions(
      existingPermissions
    );

    const matchedRole = roles.find((role) => role.id === quyenCha);

    matchedRole.permissions.forEach((p) => {
      p.pm = [];

      existingPermissions.forEach((e) => {
        if (e.HanhDong === "access") return;
        if (e.ChucNang === matchedRole.id) {
          if (!p.pm.includes(e.HanhDong)) {
            p.pm.push(e.HanhDong);
          }
        } else if (e.ChucNang === p.code) {
          if (!p.pm.includes(e.HanhDong)) {
            p.pm.push(e.HanhDong);
          }
        }
      });
    });
    console.log("match:", matchedRole);
    res.render("admin/updatepm", {
      title: "Cập nhật Nhóm quyền",
      cssFiles: ["admin/style"],
      layout: "admin",
      role,
      permissions,
      matchedRole,
    });
  }
}

export default new Permissions();
