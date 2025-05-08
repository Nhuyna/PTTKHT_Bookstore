import Customer from "../../model/sales/Customer.js";
import phanquyen from "../../model/admin/phanquyenModel.js";
import ExcelJS from "exceljs";

class CustomerController {
  async index(req, res) {
    try {
      const customerModel = new Customer();
      const query = req.query;
      const sortField = req.query.sortField || "ID_KH";
      const sortDir = req.query.sortDir || "asc";

      // Lấy danh sách khách hàng với các bộ lọc và sắp xếp
      const customers = await customerModel.getAllCustomers(
        query,
        sortField,
        sortDir
      );

      // Xử lý filter labels
      const filterLabels = {};

      // Xử lý active filters
      const activeFilters = [];

      if (query.id) {
        activeFilters.push({
          name: "Mã khách hàng",
          value: query.id,
          param: "id",
        });
      }

      if (query.name) {
        activeFilters.push({
          name: "Tên khách hàng",
          value: query.name,
          param: "name",
        });
      }

      if (query.phone) {
        activeFilters.push({
          name: "Số điện thoại",
          value: query.phone,
          param: "phone",
        });
      }

      // Lấy danh sách quyền
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);

      res.render("sales/customers/show", {
        title: "Quản lý Khách hàng",
        customers,
        query,
        sortField,
        sortDir,
        activeFilters,
        hasActiveFilters: activeFilters.length > 0,
        layout: "sales",
        currentPath: req.path,
        permissions,
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).send("Server error");
    }
  }

  async getCustomerDetail(req, res) {
    try {
      const customerModel = new Customer();
      const customerId = req.params.id;

      // Lấy thông tin khách hàng
      const customerDetails = await customerModel.getCustomerById(customerId);

      if (!customerDetails) {
        return res.status(404).send("Không tìm thấy khách hàng");
      }

      // Lấy lịch sử đơn hàng của khách hàng
      const customerOrders = await customerModel.getCustomerOrders(customerId);

      // Lấy danh sách quyền
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);

      res.render("sales/customers/detail", {
        title: "Chi tiết Khách hàng",
        customerDetails,
        customerOrders,
        layout: "sales",
        permissions,
      });
    } catch (error) {
      console.error(`Error retrieving customer details:`, error);
      res.status(500).send("Server error");
    }
  }

  async exportToExcel(req, res) {
    try {
      const customerModel = new Customer();
      const query = req.query;
      const sortField = req.query.sortField || "ID_KH";
      const sortDir = req.query.sortDir || "asc";

      // Lấy tất cả khách hàng với cùng bộ lọc như trang danh sách
      const customers = await customerModel.getAllCustomers(
        query,
        sortField,
        sortDir
      );

      // Lấy thêm thông tin chi tiết về đơn hàng cho mỗi khách hàng
      const customersWithOrderDetails = await Promise.all(
        customers.map(async (customer) => {
          const orders = await customerModel.getCustomerOrders(customer.ID_KH);
          const completedOrders = orders.filter(
            (order) =>
              order.TinhTrangDon === "Đã giao" &&
              order.TinhTrangThanhToan === "Đã thanh toán"
          );

          return {
            ...customer,
            SoDonHang: completedOrders.length,
            TongChiTieu: completedOrders.reduce(
              (sum, order) => sum + parseFloat(order.TongTien || 0),
              0
            ),
          };
        })
      );

      // Tạo workbook và worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Danh sách khách hàng");

      // Định dạng tiêu đề
      worksheet.columns = [
        { header: "Mã KH", key: "ID_KH", width: 10 },
        { header: "Tên khách hàng", key: "TenKH", width: 30 },
        { header: "Tên tài khoản", key: "TenTK", width: 20 },
        { header: "Số điện thoại", key: "SDT", width: 15 },
        { header: "Ngày sinh", key: "NgaySinh", width: 15 },
        { header: "Số đơn hàng", key: "SoDonHang", width: 15 },
        { header: "Tổng chi tiêu (VNĐ)", key: "TongChiTieu", width: 20 },
      ];

      // Thêm dữ liệu
      customersWithOrderDetails.forEach((customer) => {
        worksheet.addRow({
          ID_KH: customer.ID_KH,
          TenKH: customer.TenKH,
          TenTK: customer.TenTK,
          SDT: customer.SDT,
          NgaySinh: customer.NgaySinh
            ? new Date(customer.NgaySinh).toLocaleDateString("vi-VN")
            : "",
          SoDonHang: customer.SoDonHang,
          TongChiTieu: customer.TongChiTieu.toLocaleString("vi-VN"),
        });
      });

      // Định dạng tiêu đề
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      // Định dạng cột số tiền
      const chiTieuColumn = worksheet.getColumn("TongChiTieu");
      chiTieuColumn.numFmt = "#,##0";
      chiTieuColumn.alignment = { horizontal: "right" };

      // Thêm border cho tất cả các ô có dữ liệu
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Tên file khi download
      const currentDate = new Date().toISOString().slice(0, 10);
      const fileName = `danh-sach-khach-hang-${currentDate}.xlsx`;

      // Set response headers
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      // Gửi file
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Error exporting customers to Excel:", error);
      res.status(500).send("Lỗi khi xuất danh sách khách hàng ra Excel");
    }
  }

  async deleteCustomer(req, res) {
    try {
      const customerId = req.params.id;
      const customerModel = new Customer();

      const result = await customerModel.deleteCustomer(customerId);

      return res.redirect("/admin/sales/khachhang");
    } catch (error) {
      console.error("Error deleting customer:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xóa khách hàng: " + error.message,
      });
    }
  }

  // Hiển thị form tạo khách hàng mới
  async showCreateForm(req, res) {
    try {
      // Lấy danh sách quyền
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);

      res.render("sales/customers/create", {
        title: "Thêm Khách Hàng Mới",
        layout: "sales",
        currentPath: req.path,
        permissions,
      });
    } catch (error) {
      console.error("Error showing create form:", error);
      res.status(500).send("Lỗi khi hiển thị form thêm khách hàng");
    }
  }

  // Xử lý tạo khách hàng mới
  async createCustomer(req, res) {
    try {
      const customerModel = new Customer();
      const { TenKH, TenTK, MatKhau, SDT, NgaySinh } = req.body;
      console.log("Dữ liệu khách hàng mới:", req.body);

      // Validate dữ liệu đầu vào
      if (!TenKH || TenKH.trim() === "") {
        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          return res.status(400).json({
            success: false,
            message: "Tên khách hàng không được để trống",
          });
        }
        return res.status(400).send("Tên khách hàng không được để trống");
      }

      // Nếu có tên tài khoản thì phải có mật khẩu
      if (TenTK && TenTK.trim() && (!MatKhau || MatKhau.trim() === "")) {
        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          return res.status(400).json({
            success: false,
            message: "Vui lòng nhập mật khẩu cho tài khoản",
          });
        }
        return res.status(400).send("Vui lòng nhập mật khẩu cho tài khoản");
      }

      // Tạo đối tượng dữ liệu khách hàng
      const customerData = {
        TenKH: TenKH.trim(),
        TenTK: TenTK ? TenTK.trim() : null,
        MatKhau,
        SDT: SDT ? SDT.trim() : null,
        NgaySinh: NgaySinh || null,
        Active: 1,
        TinhTrang: 1, // Mặc định khách hàng mới có trạng thái hoạt động
      };

      console.log("Dữ liệu khách hàng mới:", customerData);

      // Tạo khách hàng mới
      const result = await customerModel.createCustomer(customerData);

      if (!result.success) {
        console.error("Error creating customer:", result.message);

        // Kiểm tra nếu request là AJAX
        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          return res.status(400).json({
            success: false,
            message: result.message || "Lỗi khi tạo khách hàng",
          });
        }

        // Nếu không phải AJAX, redirect về trang tạo
        if (req.session.flash) {
          req.flash("error", result.message || "Lỗi khi tạo khách hàng");
        }
        return res.redirect("/admin/sales/khachhang/create");
      }

      // Nếu thành công:

      // Kiểm tra nếu request là AJAX
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.json({
          success: true,
          message: result.message,
          customerId: result.customerId,
        });
      }

      // Nếu không phải AJAX, thêm flash message và redirect
      if (req.session.flash) {
        req.flash(
          "success",
          result.message || "Khách hàng đã được tạo thành công"
        );
      }
      return res.redirect("/admin/sales/khachhang");
    } catch (error) {
      console.error("Error creating customer:", error);

      // Kiểm tra nếu request là AJAX
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(400).json({
          success: false,
          message: error.message || "Lỗi khi tạo khách hàng",
        });
      }

      // Nếu không phải AJAX, thêm flash message và redirect
      if (req.session.flash) {
        req.flash("error", error.message || "Lỗi khi tạo khách hàng");
      }
      return res.redirect("/admin/sales/khachhang/create");
    }
  }

  async showEditForm(req, res) {
    try {
      const customerId = req.params.id;
      const customerModel = new Customer();

      // Lấy thông tin chi tiết của khách hàng
      const customerDetails = await customerModel.getCustomerById(customerId);

      if (!customerDetails) {
        return res.status(404).send("Không tìm thấy khách hàng");
      }

      // Lấy danh sách quyền
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);

      res.render("sales/customers/edit", {
        title: `Sửa thông tin khách hàng`,
        customerDetails,
        layout: "sales",
        currentPath: req.path,
        permissions,
      });
    } catch (error) {
      console.error("Error showing edit form:", error);
      res.status(500).send("Lỗi khi hiển thị form sửa thông tin khách hàng");
    }
  }

  // Xử lý cập nhật thông tin khách hàng
  async updateCustomer(req, res) {
    try {
      const customerId = req.params.id;
      const customerModel = new Customer();
      const { TenKH, TenTK, MatKhau, SDT, NgaySinh, Active, TinhTrang } =
        req.body;

      console.log("Dữ liệu cập nhật khách hàng:", req.body);

      // Validate dữ liệu đầu vào
      if (!TenKH || TenKH.trim() === "") {
        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          return res.status(400).json({
            success: false,
            message: "Tên khách hàng không được để trống",
          });
        }
        return res.status(400).send("Tên khách hàng không được để trống");
      }

      // Nếu có tên tài khoản thì phải có mật khẩu (chỉ khi đang thêm mới tài khoản)
      if (
        TenTK &&
        TenTK.trim() &&
        MatKhau === "" &&
        req.body.isNewAccount === "true"
      ) {
        if (req.xhr || req.headers.accept.indexOf("json") > -1) {
          return res.status(400).json({
            success: false,
            message: "Vui lòng nhập mật khẩu cho tài khoản mới",
          });
        }
        return res.status(400).send("Vui lòng nhập mật khẩu cho tài khoản mới");
      }

      // Tạo đối tượng dữ liệu khách hàng
      const customerData = {
        TenKH: TenKH.trim(),
        TenTK: TenTK ? TenTK.trim() : null,
        SDT: SDT ? SDT.trim() : null,
        NgaySinh: NgaySinh || null,
        Active: Active !== undefined ? parseInt(Active) : 1,
        TinhTrang: TinhTrang !== undefined ? parseInt(TinhTrang) : 1,
      };

      // Chỉ cập nhật mật khẩu nếu có nhập mật khẩu mới
      if (MatKhau && MatKhau.trim() !== "") {
        customerData.MatKhau = MatKhau;
      }

      console.log("Dữ liệu khách hàng cập nhật:", customerData);

      // Cập nhật thông tin khách hàng
      const result = await customerModel.updateCustomer(
        customerId,
        customerData
      );

      // Kiểm tra nếu request là AJAX
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        if (result.success) {
          return res.json({
            success: true,
            message: result.message,
            customerId: customerId,
          });
        } else {
          return res.status(400).json({
            success: false,
            message: result.message || "Lỗi khi cập nhật thông tin khách hàng",
          });
        }
      }

      // Xử lý flash message và chuyển hướng nếu không phải AJAX
      if (!result.success) {
        if (req.session.flash) {
          req.flash(
            "error",
            result.message || "Lỗi khi cập nhật thông tin khách hàng"
          );
        }
        return res.redirect(`/admin/sales/khachhang/edit/${customerId}`);
      }

      // Thêm flash message thành công nếu có sử dụng
      if (req.session.flash) {
        req.flash(
          "success",
          result.message || "Thông tin khách hàng đã được cập nhật thành công"
        );
      }

      // Chuyển hướng về trang chi tiết khách hàng
      return res.redirect(`/admin/sales/khachhang/detail/${customerId}`);
    } catch (error) {
      console.error("Error updating customer:", error);

      // Kiểm tra nếu request là AJAX
      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.status(400).json({
          success: false,
          message: error.message || "Lỗi khi cập nhật thông tin khách hàng",
        });
      }

      // Thêm flash message nếu có sử dụng
      if (req.session.flash) {
        req.flash(
          "error",
          error.message || "Lỗi khi cập nhật thông tin khách hàng"
        );
      }

      // Chuyển hướng về form chỉnh sửa
      return res.redirect(`/admin/sales/khachhang/edit/${req.params.id}`);
      ne;
      w;
    }
  }
}

export default new CustomerController();
