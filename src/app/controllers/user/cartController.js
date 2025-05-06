import CartModel from "../../model/user/cartModel.js";
import ProductModel from "../../model/user/productModel.js";
import OrderModel from "../../model/user/orderModel.js";
import BookModel from "../../model/user/bookModel.js";

const renderCartPage = async (req, res, next) => {
  try {
    const cartItems = await CartModel.getCartByUserId(req.session.user_id);
    res.render("user/cart", { cart: cartItems, session: req.session });
  } catch (error) {
    res.redirect(
      "/user/errorPage?error=" + encodeURIComponent("Lỗi khi tải giỏ hàng")
    );
  }
};

const thanhtoan1 = async (req, res) => {
  try {
    const { idSanPham, soluong, tongTien } = req.body;
    const userId = req.session.user_id;

    if (!userId) {
      return res.redirect(
        "user/account?error=" + encodeURIComponent("Chưa đăng nhập")
      );
    }

    res.render("user/thanhtoan", { session: req.session });
  } catch (error) {
    console.error("Lỗi xử lý giỏ hàng:", error);
    res.redirect(
      "user/errorPage?error=" + encodeURIComponent("Lỗi xử lý giỏ hàng")
    );
  }
};

const thanhtoan = async (req, res) => {
  try {
    const { idSanPham, soluong, tongTien } = req.body;

    const cart = [];
    for (let i = 0; i < idSanPham.length; i++) {
      const soLuong = parseInt(soluong[i]);
      if (soLuong > 0) {
        const product = await BookModel.getProductById(idSanPham[i]);
        cart.push({
          SanPhamID: idSanPham[i],
          TenSanPham: product.TenSanPham,
          Gia: product.Gia,
          Anh: product.Anh,
          SoLuong: soLuong,
          Tong: product.Gia * soLuong,
        });
      }
    }
    req.session.cartCheckout = cart;
    req.session.cartTotal = tongTien;

    res.render("user/thanhtoan", {
      cart,
      total: tongTien,
      session: req.session,
    });
  } catch (error) {
    console.error("Lỗi xử lý giỏ hàng:", error);
    res.redirect(
      "user/errorPage?error=" + encodeURIComponent("Lỗi xử lý giỏ hàng")
    );
  }
};

const afterpayment = async (req, res) => {
  try {
    const cart = req.session.cartCheckout;
    const total = parseFloat(req.session.cartTotal);
    const userId = req.session.user_id;

    if (!cart || cart.length === 0) {
      return res.redirect("/cart");
    }

    const { TenKH, SDT, address, phuong, quan, thanhpho, payment } = req.body;

    await OrderModel.capNhatDiaChi({
      ID_KH: userId,
      TenNguoiNhan: TenKH,
      SoDienThoai: SDT,
      DiaChiNhanHang: address,
      PhuongXa: phuong,
      QuanHuyen: quan,
      TinhThanhPho: thanhpho,
    });

    let tinhtrangthanhtoan = "Chua thanh toan";
    if (payment === "Chuyen khoan" || payment === "Credit card") {
      tinhtrangthanhtoan = "Da thanh toan";
    }

    const hoaDonId = await OrderModel.createHoaDonXuat({
      ID_KH: userId,
      PhuongThucThanhToan: payment,
      TongTien: total,
      TinhTrangThanhToan: tinhtrangthanhtoan,
    });

    for (const item of cart) {
      await CartModel.xoaSanPhamTrongGio(userId, item.SanPhamID);
    }
    req.session.cartCheckout = null;
    req.session.cartTotal = 0;

    res.redirect("/cart/confirm");
  } catch (error) {
    console.error("Lỗi khi lưu hoá đơn:", error);
    res.redirect(
      "/user/errorPage?error=" + encodeURIComponent("Lỗi khi lưu hoá đơn")
    );
  }
};

const renderThankYouPage = (req, res) => {
  try {
    const cart = req.session.cartData || [];
    const total = req.session.cartTotal || 0;
    res.render("user/confirm", {
      layout: "main",
      cart,
      total,
    });
  } catch (error) {
    console.error("Lỗi xử lý giỏ hàng:", error);
    res.redirect(
      "user/errorPage?error=" + encodeURIComponent("Lỗi xử lý giỏ hàng")
    );
  }
};

const addToCart = async (req, res) => {
  try {
    const productId = parseInt(req.body.productId);
    const userId = req.session.user_id;
    if (!userId) {
      return res.json({
        success: false,
        message: "Vui lòng đăng nhập để thêm vào giỏ hàng!",
        redirect: "/user/account",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu ID sản phẩm!",
      });
    }

    await CartModel.themVaoGio(userId, productId);

    return res.json({
      success: true,
      message: "Đã thêm vào giỏ hàng!",
    });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm vào giỏ hàng!",
    });
  }
};

const getcartCount = async (req, res) => {
  try {
    const userId = req.session.user_id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Chưa đăng nhập" });
    }

    const cartItems = await CartModel.getCartByUserId(userId);
    const cartCount = cartItems.length;

    res.json({ success: true, cartCount });
  } catch (error) {
    console.error("Lỗi khi lấy số lượng giỏ hàng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy số lượng giỏ hàng",
    });
  }
};

export default {
  renderCartPage,
  thanhtoan,
  afterpayment,
  renderThankYouPage,
  addToCart,
  getcartCount,
};
