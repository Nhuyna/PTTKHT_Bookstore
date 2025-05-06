// const productConfig = require('../db/product');
// const categoryConfig = require('../db/category');
import productConfig from "../../model/warehouse/product.js";
import categoryConfig from "../../model/warehouse/category.js";
import phanquyen from "../../model/admin/phanquyenModel.js";
import ExcelJS from "exceljs";

class ProductController {
  // show all products
  async index(req, res) {
    try {
      const product = await productConfig.getAll();

      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qlsanpham");
      console.log(action);
      res.render("warehouse/product", {
        product,
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (err) {
      console.error(err);
    }
  }

  // search product
  async search(req, res) {
    try {
      const query = req.query.search || "";
      const product = await productConfig.search_product(query);
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qlsanpham");
      res.render("warehouse/product", {
        product,
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (err) {
      console.error(err);
    }
  }

  // view detail product
  async view(req, res) {
    try {
      const { id } = req.params;
      const product = (await productConfig.search(id))[0];
      const category = await productConfig.getCategory_by_name(id);
      const image = await productConfig.getImage(id);
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);

      let action = await phanquyen.action(req.session.user.idNQ, "qlsanpham");
      console.log("action" + action);

      res.render("warehouse/view_product", {
        product,
        category,
        image,
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (error) {
      console.error(err);
    }
  }

  // create new product form
  async create(req, res) {
    try {
      const category = await categoryConfig.getAll();
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qlsanpham");
      res.render("warehouse/create_product", {
        category,
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (err) {
      console.error(err);
    }
  }

  // create excel
  async create_excel(req, res) {
    try {
      const data = await productConfig.getAll(); // Lấy dữ liệu từ DB
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Danh sách sản phẩm");

      // Định nghĩa các cột
      worksheet.columns = [
        { header: "Mã Sản Phẩm", key: "SanPhamID", width: 20 },
        { header: "Tên Sản Phẩm", key: "TenSanPham", width: 30 },
        { header: "Tác Giả", key: "TenTacGia", width: 20 },
        { header: "Nhà Xuất Bản", key: "TenNXB", width: 30 },
        { header: "Số Lượng Tồn", key: "SoLuongTon", width: 20 },
        { header: "Số Trang", key: "SoTrang", width: 20 },
        { header: "Giá", key: "Gia", width: 20 },
        { header: "Mô Tả", key: "MoTa", width: 30 },
        { header: "Hình Ảnh", key: "Anh", width: 20 },
      ];

      // Thêm dữ liệu
      data.forEach((item, index) => {
        worksheet.addRow({
          ...item,
          Anh: item.Anh && item.Anh.length > 0 ? "Đã có ảnh" : "Không có ảnh",
        });
      });

      // Format tiền
      worksheet.getColumn("Gia").eachCell((cell, rowNumber) => {
        if (rowNumber > 1) {
          const value = Number(cell.value);
          cell.value = new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(value);
        }
      });

      // Xuất file
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=ds_sanpham.xlsx"
      );
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.log(error);
    }
  }

  // get data from create form and add new product
  async store(req, res) {
    try {
      const {
        name,
        author,
        publisher,
        category,
        price,
        inventory,
        pages,
        description,
        imageBase64,
      } = req.body;
      const images = JSON.parse(imageBase64); // Giải mã chuỗi JSON thành mảng
      await productConfig.insert(
        name,
        author,
        publisher,
        category,
        price,
        inventory,
        pages,
        description,
        images
      );
      res.redirect("/admin/warehouse/product");
    } catch (error) {
      console.log(error);
    }
  }

  // update data form
  async update(req, res) {
    try {
      const { id } = req.params;
      const edit_product = (await productConfig.search(id))[0];
      const list_category = await categoryConfig.getAll();
      const checked_category = await productConfig.getCategory_by_id(id);
      const images = await productConfig.getImage(id);
      const imageBase64 = await productConfig.getImageBase64(id);
      const json_image = JSON.stringify(imageBase64);
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qlsanpham");
      res.render("warehouse/update_product", {
        edit_product,
        list_category,
        checked_category,
        json_image,
        images,
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (error) {
      console.log(error);
    }
  }

  // edit product
  async edit(req, res) {
    try {
      const {
        id,
        name,
        author,
        publisher,
        category,
        price,
        inventory,
        pages,
        description,
        imageBase64,
      } = req.body;
      const images = JSON.parse(imageBase64); // Giải mã chuỗi JSON thành mảng
      await productConfig.update(
        id,
        name,
        author,
        publisher,
        category,
        price,
        inventory,
        pages,
        description,
        images
      );
      return res.redirect("/admin/warehouse/product");
    } catch (error) {
      console.log(error);
      return res.status(500).send("Lỗi khi cập nhật sản phẩm.");
    }
  }

  // delete product
  async delete(req, res) {
    try {
      await productConfig.delete(req.params.id);
      res.redirect("/admin/warehouse/product");
    } catch (error) {
      console.log(error);
    }
  }

  async delete_opt(req, res) {
    try {
      const product = await productConfig.getAll_delete();
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      let action = await phanquyen.action(req.session.user.idNQ, "qlsanpham");
      res.render("warehouse/product", {
        product,
        layout: "warehouse",
        permissions,
        action,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async on_sale(req, res) {
    try {
      const product = await productConfig.getAll();
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      res.render("warehouse/product", {
        product,
        layout: "warehouse",
        permissions,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

// module.exports = new ProductController();
export default new ProductController();
