import phanquyen from "../../model/admin/phanquyenModel.js";
import dashboardModel from "../../model/admin/dashboardModel.js";
import Dashboard from "../../model/sales/Dashboard.js";

class DashboardController {
  async show(req, res) {
    try {
      // Lấy quyền người dùng
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      // Thêm quyền "all" vào danh sách permissions
      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      permissions.push("admin");

      const dashboardSales = new Dashboard();

      // Khởi tạo đối tượng dữ liệu với giá trị mặc định
      const dashboardData = {
        revenueData: [],
        dashboardStats: {
          current: {
            DoanhThu: 0,
            Von: 0,
            LoiNhuan: 0,
            SoSanPhamBan: 0,
            SoKhachHang: 0,
          },
          previous: {
            DoanhThu: 0,
            Von: 0,
            LoiNhuan: 0,
            SoSanPhamBan: 0,
            SoKhachHang: 0,
          },
          percentChange: {
            DoanhThu: 0,
            Von: 0,
            LoiNhuan: 0,
            SoSanPhamBan: 0,
            SoKhachHang: 0,
          },
        },
        topProducts: [],
        recentProviders: [],
        recentOrders: [],
        recentReceipts: [],
        productCategories: [],
      }; // Lấy dữ liệu cho dashboard từng phần và xử lý lỗi riêng biệt
      try {
        dashboardData.revenueData =
          await dashboardSales.getRevenueCurrentMonth();
      } catch (error) {
        console.error("Error fetching revenue data:", error);
      }

      try {
        dashboardData.dashboardStats = await dashboardModel.getDashboardStats();
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }

      try {
        dashboardData.topProducts =
          await dashboardSales.getTopProductsByCurrentMonth();
      } catch (error) {
        console.error("Error fetching top selling products:", error);
      }

      try {
        dashboardData.recentProviders =
          await dashboardModel.getRecentProviders();
      } catch (error) {
        console.error("Error fetching recent providers:", error);
      }

      try {
        dashboardData.recentOrders = await dashboardModel.getRecentOrders();
      } catch (error) {
        console.error("Error fetching recent orders:", error);
      }

      try {
        dashboardData.recentReceipts = await dashboardModel.getRecentReceipts();
      } catch (error) {
        console.error("Error fetching recent receipts:", error);
      }

      try {
        dashboardData.productCategories =
          await dashboardModel.getProductCategories();
      } catch (error) {
        console.error("Error fetching product categories:", error);
      } // Chuyển dữ liệu doanh thu sang JSON để sử dụng trong biểu đồ
      const revenueDataJSON = JSON.stringify(dashboardData.revenueData);
      const productCategoriesJSON = JSON.stringify(
        dashboardData.productCategories
      );

      res.render("admin/dashboard", {
        title: "Dashboard",
        layout: "admin",
        permissions,
        revenueData: revenueDataJSON,
        dashboardStats: dashboardData.dashboardStats,
        topProducts: dashboardData.topProducts,
        recentProviders: dashboardData.recentProviders,
        recentOrders: dashboardData.recentOrders,
        recentReceipts: dashboardData.recentReceipts,
        productCategories: productCategoriesJSON,
      });
    } catch (error) {
      console.error("Error in dashboard controller:", error);
      res.render("admin/dashboard", {
        title: "Dashboard",
        layout: "admin",
        error: "Có lỗi xảy ra khi tải dữ liệu dashboard",
      });
    }
  }
}

export default new DashboardController();
