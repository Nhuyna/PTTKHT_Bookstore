// const dashboardConfig = require('../db/dashboard');
import dashboardConfig from "../../model/warehouse/dashboard.js";
import phanquyen from "../../model/admin/phanquyenModel.js";
class DashboardController {
  // show the dashboard
  async index(req, res) {
    try {
      const sum_product = (await dashboardConfig.get_sum_of_product())[0];
      const sum_provider = (await dashboardConfig.get_sum_of_provider())[0];
      const sum_receipt = (await dashboardConfig.get_sum_of_receipt())[0];
      const sum_paid_money = (await dashboardConfig.get_sum_of_paid_money())[0];
      const provider_recently = await dashboardConfig.get_provider_recently();
      const receipt_recently = await dashboardConfig.get_receipt_recently();
      let permissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
      ).map((p) => p.ChucNang);

      const allPermissions = (
        await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
      ).map((p) => p.ChucNang);

      permissions = permissions.concat(allPermissions);
      console.log("per nè");
      console.log(permissions);
      res.render("warehouse/dashboard", {
        sum_product,
        sum_provider,
        sum_receipt,
        sum_paid_money,
        receipt_recently,
        provider_recently,
        accessList: req.session.user.accessList,
        layout: "admin",
        permissions,
      });
    } catch (error) {
      console.log(error);
    }
  }
}

// module.exports = new DashboardController();
export default new DashboardController();
