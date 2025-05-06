import Dashboard from "../../model/sales/Dashboard.js";
import { Order } from "../../model/sales/Order.js";
import phanquyen from "../../model/admin/phanquyenModel.js";
class DashboardController {
  async show(req, res) {
    try {
      const dashboardModel = new Dashboard();
      const orderModel = new Order();

      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate.setMonth(startDate.getMonth() - 1);

      const topProducts =
        (await dashboardModel.getTopProductsByDateRange(startDate, today)) ||
        [];

      const dashboard =
        (await dashboardModel.getDashboard(startDate, today)) || [];

      // Fetch revenue data for current month
      const revenueData = (await dashboardModel.getRevenueCurrentMonth()) || [];

      const currentOrders =
        (await orderModel.findAll({}, "date", "desc", 5)) || [];

      const data = {
        dashboard: dashboard[0],
        topProducts,
        currentOrders,
        revenueData,
      };
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      console.log(permissions);
      console.log("per   " + permissions);
      res.render("sales/dashboard", {
        title: "Dashboard",
        data,
        layout: "sales",
        currentPath: req.path,
        permissions,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).send("Server error");
    }
  }
}

export default new DashboardController();
