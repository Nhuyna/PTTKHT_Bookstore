import bookModel from "../../model/user/bookModel.js";
import categoryModel from "../../model/user/categoryModel.js";

class SiteController {
  // Hiển thị trang chủ 
  async index(req, res) {
    try {
      const { getAllBooks, getBooksinPopularCategory } = bookModel;

      const { getAllCategories, getfiveCategoriespopular } = categoryModel;

      const books = await getAllBooks();
      const categories = await getAllCategories();
      const popularCategories = await getfiveCategoriespopular();
      const popularProducts = await getBooksinPopularCategory();
      // console.log(popularProducts);

      const isLoggedIn = !!req.session.user_id;
      // console.log(popularProducts);

      res.render("user/home", {
        books,
        categories,
        popularCategories,
        popularProducts,
        query: req.query,
        session: req.session,
        isLoggedIn,
      });
    } catch (error) {
      console.error("Error in SiteController:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // Xử lý tìm kiếm
  async search(req, res) {
    try {
      const { searchBooksByKeyword, getBooksByIds, getListProducts } =
        bookModel;

      const { getAllCategories } = categoryModel;

      const { q: keywordRaw, maxPrice, categories: categoryIDs } = req.query;
      const categories = await getAllCategories();
      const keyword = keywordRaw?.trim();
      let baseList = [];

      if (keyword) {
        const matched = await searchBooksByKeyword(keyword);
        const ids = matched.map((b) => Number(b.SanPhamID));
        baseList = await getBooksByIds(ids);
      } else if (categoryIDs) {
        const categoryArray = Array.isArray(categoryIDs)
          ? categoryIDs.map(Number)
          : [Number(categoryIDs)];
        baseList = await getListProducts(categoryArray);
      } else {
        // Không có keyword và category, quay về trang chủ
        return res.redirect("/");
      }

      // Lọc theo giá nếu có
      let filteredList = baseList;
      if (maxPrice && baseList.length) {
        filteredList = baseList.filter((book) => book.Gia <= Number(maxPrice));
      }

      res.render("user/searchResults", {
        keyword: keyword || "",
        categories,
        listbook: filteredList,
        hasResults: filteredList.length > 0,
        currentPage: 1,
        totalPages: 1,
        query: req.query,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).send("Internal Server Error");
    }
  }
}

export default new SiteController();
