import generateOrderPdf from "../../services/pdfService.js";
import { Order } from "../../model/sales/Order.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { generateOrdersExcel } from "../../services/excelService.js";
import phanquyen from "../../model/admin/phanquyenModel.js";
// import Dashboard from "../models/Dashboard.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class OrderController {
  async show(req, res) {
    console.log("Vào được show chưa");
    try {
      const query = req.query;
      const tab = req.query.tab || "all";
      const sortField = req.query.sortField;
      const sortDir = req.query.sortDir || "asc";

      const orderModel = new Order();

      // Prepare filter labels for display
      const filterLabels = {
        status: {
          pending: "Chờ xác nhận",
          processing: "Chờ lấy hàng",
          shipping: "Đang giao hàng",
          completed: "Đã giao",
          cancelled: "Đã hủy",
          returned: "Trả hàng",
        },
        paymentMethod: {
          cod: "Tiền mặt",
          bank: "Chuyển khoản",
          credit: "Credit card",
        },
        paymentStatus: {
          paid: "Đã thanh toán",
          unpaid: "Chưa thanh toán",
          refunded: "Đã hoàn tiền",
          not_refunded: "Chưa hoàn tiền",
        },
      };

      // Process filters to display
      const activeFilters = [];

      if (query.id) {
        activeFilters.push({
          name: "Mã đơn hàng",
          value: query.id,
          param: "id",
        });
      }

      if (query.status && filterLabels.status[query.status]) {
        activeFilters.push({
          name: "Trạng thái",
          value: filterLabels.status[query.status],
          param: "status",
        });
      }

      if (
        query.paymentMethod &&
        filterLabels.paymentMethod[query.paymentMethod]
      ) {
        activeFilters.push({
          name: "Phương thức thanh toán",
          value: filterLabels.paymentMethod[query.paymentMethod],
          param: "paymentMethod",
        });
      }

      if (
        query.paymentStatus &&
        filterLabels.paymentStatus[query.paymentStatus]
      ) {
        activeFilters.push({
          name: "Tình trạng thanh toán",
          value: filterLabels.paymentStatus[query.paymentStatus],
          param: "paymentStatus",
        });
      }

      if (query.fromDate) {
        activeFilters.push({
          name: "Từ ngày",
          value: new Date(query.fromDate).toLocaleDateString("vi-VN"),
          param: "fromDate",
        });
      }

      if (query.toDate) {
        activeFilters.push({
          name: "Đến ngày",
          value: new Date(query.toDate).toLocaleDateString("vi-VN"),
          param: "toDate",
        });
      }

      let counts = { returnRequests: 0 };
      let orders;
      let returnCancelRequests;
      let archivedOrders;

      // Pass sorting parameters to the model methods
      orders = (await orderModel.findAll(query, sortField, sortDir)) || [];

      const tempReturnRequests = await orderModel.findReturnCancelRequests();
      counts.returnRequests = Array.isArray(tempReturnRequests)
        ? tempReturnRequests.length
        : 0;

      if (tab === "return-cancel") {
        returnCancelRequests = await orderModel.findReturnCancelRequests(
          query,
          sortField,
          sortDir
        );
      } else returnCancelRequests = [];

      if (tab === "archived") {
        archivedOrders = await orderModel.findArchivedOrders(
          query,
          sortField,
          sortDir
        );
      } else archivedOrders = [];
      // console.log("Đang show");
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      res.render("sales/orders/show", {
        title: "Order",
        orders,
        returnCancelRequests,
        archivedOrders,
        counts,
        activeTab: tab,
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
      console.error("Error fetching orders:", error);
      res.status(500).send("Server error");
    }
  }

  async showById(req, res, next) {
    try {
      const orderModel = new Order();
      const orderId = req.params.id;
      const orderDetails = await orderModel._findById(orderId);
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      res.render("sales/orders/detail", {
        title: "Order Details",
        orderDetails,
        layout: "sales",
        permissions,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  updateStatus(req, res, next) {
    try {
      const orderId = req.params.id;
      const status = req.body.status || req.query.status;
      const request = req.body.request || req.query.request;
      console.log("status", status);
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái không được cung cấp",
        });
      }

      const orderModel = new Order();
      orderModel
        ._updateStatus(orderId, status, request)
        .then((result) => {
          // console.log(result);
          res.json({
            success: true,
            message: `Đơn hàng đã được cập nhật thành "${status}" thành công`,
          });
        })
        .catch(() => {
          res.status(404).json({
            success: false,
            message: "Đơn hàng không tồn tại",
          });
        });
    } catch (error) {
      console.error("Error updating order status:", error);
      next(error);
    }
  }

  async updateArchive(req, res, next) {
    try {
      const orderId = req.params.id;
      const status = req.body.status || req.query.status;
      // console.log("status", status);
      if (status === undefined || status === null) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái không được cung cấp",
        });
      }

      const orderModel = new Order();
      orderModel
        ._updateArchive(orderId, status)
        .then((result) => {
          console.log(result);
          res.json({
            success: true,
            message: `Đơn hàng đã được cập nhật thành công`,
          });
        })
        .catch(() => {
          res.status(404).json({
            success: false,
            message: "Đơn hàng không tồn tại",
          });
        });
    } catch (error) {
      console.error("Error updating order status:", error);
      next(error);
    }
  }

  async updatePaymentStatus(req, res, next) {
    try {
      const orderId = req.params.id;
      const status = req.body.status || req.query.status;
      console.log("status", status);
      if (status === undefined || status === null) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái không được cung cấp",
        });
      }

      const orderModel = new Order();
      orderModel
        ._updatePaymentStatus(orderId, status)
        .then((result) => {
          console.log(result);
          res.json({
            success: true,
            message: `Đơn hàng đã được cập nhật thành công`,
          });
        })
        .catch(() => {
          res.status(404).json({
            success: false,
            message: "Đơn hàng không tồn tại",
          });
        });
      // await orderModel._updatePaymentStatus(orderId, status);
    } catch (error) {
      console.error("Error updating order status:", error);
      next(error);
    }
  }

  async exportOrderPdf(req, res) {
    try {
      console.log("Exporting PDF...");
      const orderId = req.params.id;
      const orderModel = new Order();
      const orderDetails = await orderModel._findById(orderId);

      if (!orderDetails) {
        return res.status(404).json({
          success: false,
          message: "Đơn hàng không tồn tại",
        });
      }

      console.log("orderDetails", orderDetails);

      // Tạo tên file với thời gian hiện tại
      const currentDate = new Date();
      const timestamp = currentDate.toISOString().replace(/[:.]/g, "-");
      const fileName = `order-${orderId}-${timestamp}.pdf`;

      // Cài đặt header trước khi tạo PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      // Tạo PDF và gửi trực tiếp đến response
      await generateOrderPdf(orderDetails, res);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi xuất PDF",
      });
    }
  }

  async exportOrdersExcel(req, res) {
    try {
      const query = req.query;
      const orderModel = new Order();
      const orders = await orderModel.findAll(query);
      if (!orders) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // Cài đặt header cho file Excel
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `orders_${timestamp}.xlsx`;

      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      // Tạo Excel và gửi trực tiếp đến response
      const buffer = await generateOrdersExcel(orders, res);
      res.send(buffer);
    } catch (error) {
      console.error("Error exporting Excel:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi khi xuất Excel",
      });
    }
  }
}
export default new OrderController();
