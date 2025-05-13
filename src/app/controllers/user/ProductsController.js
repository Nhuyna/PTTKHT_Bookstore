import bookModel from "../../model/user/bookModel.js";
import categoryModel from "../../model/user/categoryModel.js";

class ProductsController {
  // [GET] /pd
  async index(req, res) {
    try {
      const productid = req.query.id;

      const { getProductDetail, getListProducts, getProductImages } = bookModel;
      const { getAllCategories } = categoryModel;

      const productDetail = await getProductDetail(productid);
      if (!productDetail) {
        return res.status(404).send("Sản phẩm không tồn tại");
      }

      const categories = await getAllCategories();
      const danhMucList = productDetail.DanhMucs.map((dm) => Number(dm.id));

      // Tạo bộ lọc cho giá nếu có
      const filter = {};
      if (req.query.minPrice) {
        filter.minPrice = parseInt(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.maxPrice = parseInt(req.query.maxPrice);
      }

      // Lấy các sản phẩm khác theo danh mục và áp dụng bộ lọc giá (nếu có)
      const otherbook = await getListProducts(danhMucList, filter);

      // Lấy danh sách hình ảnh của sản phẩm
      const images = await getProductImages(productid);

      const isLoggedIn = !!req.session.user_id;

      console.log("Danh sách danh mục:", productDetail);
      // Truyền dữ liệu vào view
      res.render("user/pdDetail", {
        productDetail,
        danhMucList,
        categories,
        otherbook,
        images,
        query: req.query,
        session: req.session,
        isLoggedIn,
      });
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      res.status(500).send("Đã có lỗi xảy ra, vui lòng thử lại sau.");
    }
  }
}

export default new ProductsController();
