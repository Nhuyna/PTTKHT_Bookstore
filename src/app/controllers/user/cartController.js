import CartModel from "../../model/user/cartModel.js";
import ProductModel from "../../model/user/productModel.js";
import OrderModel from "../../model/user/orderModel.js";
import BookModel from "../../model/user/bookModel.js";
import session from "express-session";

const renderCartPage = async (req, res, next) => {
  try {
    const cartItems = await CartModel.getCartByUserId(req.session.user_id);
    console.log("id user : ", req.session.user_id);
    console.log("Giỏ hàng:", cartItems);
    res.render("user/cart", { cart: cartItems, session: req.session });
  } catch (error) {
    console.log(req.session.user_id);
    res.redirect(
      "/user/errorPage?error=" + encodeURIComponent("Lỗi khi tải giỏ hàng")
    );
  }
};

const thanhtoan = async (req, res) => {
  try {
    console.log("có vào thanh toán kh");
    let idSanPham = [];
    let soluong = [];
    let tongTien = 0;
    let cart = [];

    // TH1: Mua ngay (GET /thanhtoan?productId=...)
    if (req.method === "GET") {
      const productId = req.query.productId;
      const quantity = parseInt(req.query.quantity) || 1;

      if (!productId || isNaN(quantity)) {
        return res.redirect(
          "/errorPage?error=" + encodeURIComponent("Dữ liệu không hợp lệ")
        );
      }

      const product = await BookModel.getProductById(productId);
      if (!product) {
        return res.redirect(
          "/errorPage?error=" + encodeURIComponent("Không tìm thấy sản phẩm")
        );
      }

      idSanPham.push(productId);
      soluong.push(quantity);
      tongTien = product.Gia * quantity;
    }

    // TH2: Thanh toán từ giỏ hàng (POST /thanhtoan)
    else if (req.method === "POST") {
      idSanPham = req.body.idSanPham;
      soluong = req.body.soluong;
      tongTien = req.body.tongTien;

      // Kiểm tra đầu vào
      if (!idSanPham || !soluong || !Array.isArray(idSanPham)) {
        return res.redirect(
          "/errorPage?error=" + encodeURIComponent("Dữ liệu không hợp lệ")
        );
      }
    }

    // Xử lý sản phẩm thanh toán
    for (let i = 0; i < idSanPham.length; i++) {
      const soLuong = parseInt(soluong[i]);
      if (!idSanPham[i] || isNaN(soLuong) || soLuong <= 0) continue;

      const product = await BookModel.getProductById(idSanPham[i]);
      if (!product) continue;

      cart.push({
        SanPhamID: idSanPham[i],
        TenSanPham: product.TenSanPham,
        Gia: product.Gia,
        Anh: product.Anh,
        SoLuong: soLuong,
        Tong: product.Gia * soLuong,
      });
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
      "/errorPage?error=" + encodeURIComponent("Lỗi xử lý giỏ hàng")
    );
  }
};

// const afterpayment = async (req, res) => {
//   try {
//     const cart = req.session.cartCheckout;
//     const total = parseFloat(req.session.cartTotal);
//     const userId = req.session.user_id;
//     console.log("cart : ",cart)

//     if (!cart || cart.length === 0) {
//       return res.redirect("/cart");
//     }

//     const { TenKH, SDT, address, phuong, quan, thanhpho, payment } = req.body;

//     await OrderModel.capNhatDiaChi({
//       ID_KH: userId,
//       TenNguoiNhan: TenKH,
//       SoDienThoai: SDT,
//       DiaChiNhanHang: address,
//       PhuongXa: phuong,
//       QuanHuyen: quan,
//       TinhThanhPho: thanhpho,
//     });
//     console.log("phuong thuc thanh toan : ",payment)

//     let tinhtrangthanhtoan = "Chưa thanh toán";
//     if (payment === "Chuyển khoản" || payment === "Credit card") {
//       tinhtrangthanhtoan = "Đã thanh toán";
//     }
//     await OrderModel.createHoaDonXuat({
//   ID_KH: userId,
//   TongTien: total,
//   PhuongThucThanhToan: payment,
//   TinhTrangThanhToan: tinhtrangthanhtoan
// });

//     for (const item of cart) {
//       await CartModel.xoaSanPhamTrongGio(userId, item.SanPhamID);
//     }

//     req.session.cartCheckout = null;
//     req.session.cartTotal = 0;

//     res.redirect("/cart/confirm");
//   } catch (error) {
//     console.error("Lỗi khi lưu hoá đơn:", error);
//     res.redirect(
//       "/user/errorPage?error=" + encodeURIComponent("Lỗi khi lưu hoá đơn")
//     );
//   }
// };

const afterpayment = async (req, res) => {
  try {
    const cart = req.session.cartCheckout;
    const total = parseFloat(req.session.cartTotal);
    const userId = req.session.user_id;

    if (!cart || cart.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Giỏ hàng trống." });
    }

    const { TenKH, SDT, address, ward, district, thanhpho, payment } = req.body;
    console.log("địa chỉ", address);

    const IDDiaChi = await OrderModel.themDiaChi({
      ID_KH: userId,
      TenNguoiNhan: TenKH,
      SoDienThoai: SDT,
      SoNhaDuong: address,
      PhuongXa: ward,
      QuanHuyen: district,
      TinhThanhPho: thanhpho,
    });

    let tinhtrangthanhtoan = "Chưa thanh toán";
    if (payment === "Chuyển khoản" || payment === "Credit card") {
      tinhtrangthanhtoan = "Đã thanh toán";
    }

    const ID_HoaDonXuat = await OrderModel.createHoaDonXuat({
      ID_KH: userId,
      TongTien: total,
      PhuongThucThanhToan: payment,
      TinhTrangThanhToan: tinhtrangthanhtoan,
    });

    for (const item of cart) {
      await OrderModel.createChiTietHoaDonXuat({
        ID_HoaDonXuat,
        ID_SP: item.SanPhamID,
        SoLuong: item.SoLuong,
        DonGia: item.Gia,
      });

      await CartModel.xoaSanPhamTrongGio(userId, item.SanPhamID);
    }

    await OrderModel.createGiaoHang({
      ID_HDX: ID_HoaDonXuat,
      IDNhanVien: null,
      IDDiaChi: IDDiaChi,
      NgayGiaoHang: null,
      TinhTrangDon: "Chờ xác nhận",
    });

    req.session.cartCheckout = null;
    req.session.cartTotal = 0;

    res.json({ success: true, message: "Thanh toán thành công!" });
  } catch (error) {
    console.error("Lỗi khi lưu hoá đơn:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lưu hoá đơn." });
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
      session: req.session,
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
    const soluong = parseInt(req.body.soluong);
    const userId = req.session.user_id;
    console.log("body nè", req.body);

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

    await CartModel.themVaoGio(userId, productId, soluong);
    console.log("Số lượng: " + soluong);
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
const deleteCartItem = async (req, res) => {
  const { book_id } = req.body;
  const userId = req.session.user_id;

  if (!userId || !book_id) {
    return res.json({ success: false, message: "Thiếu thông tin!" });
  }

  try {
    await CartModel.deleteItem(userId, book_id);

    const totalPrice = await CartModel.getTotalPrice(userId);

    res.json({ success: true, totalPrice });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Lỗi server!" });
  }
};
const updateQuantity = async (req, res) => {
  const { book_id, action } = req.body;
  const userId = req.session.user_id;

  if (!userId || !book_id || !["increase", "decrease"].includes(action)) {
    return res.json({ success: false, message: "Dữ liệu không hợp lệ" });
  }

  try {
    const item = await CartModel.getCartItem(userId, book_id);
    if (!item) {
      return res.json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }

    const book = await CartModel.getBookById(book_id);
    if (!book) {
      return res.json({ success: false, message: 'Không tìm thấy sách trong kho' });
    }

    let newQty = item.SoLuong + (action === "increase" ? 1 : -1);
    if (newQty <= 0) newQty = 0;

    if (newQty > book.SoLuongTon) {
      return res.json({
        success: false,
        message: `Chỉ còn ${book.SoLuongTon} sản phẩm trong kho`
      });
    }

    await CartModel.updateCartItemQuantity(userId, book_id, newQty);

    return res.json({ success: true, newQty });
  } catch (err) {
    console.error("Lỗi cập nhật giỏ hàng:", err);
    return res.json({ success: false, message: "Lỗi server" });
  }
};
export default {
  renderCartPage,
  thanhtoan,
  afterpayment,
  renderThankYouPage,
  addToCart,
  getcartCount,
  deleteCartItem,
  updateQuantity,
};
