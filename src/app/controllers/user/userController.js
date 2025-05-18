import UserModel from "../../model/user/userModel.js";

const renderAccountPage = async (req, res, next) => {
  try {
    let user_name = "";
    let user_lastname = "";
    let dateOfBirth = "";
    let monthOfBirth = "";
    let yearOfBirth = "";
    let user = {};

    if (req.session.user_id) {
      const data = await UserModel.getInforUser(req.session.user_id);

      if (data && data.length > 0) {
        user = data[0];

        const fullName = user.TenKH || "";
        const nameParts = fullName.trim().split(" ");
        user_name = nameParts[0] || "";
        user_lastname = nameParts.slice(1).join(" ") || "";

        let rawDate = user.NgaySinh;

        if (rawDate instanceof Date) {
          rawDate = rawDate.toISOString().split("T")[0]; 
        }

        if (rawDate) {
          const [y, m, d] = rawDate.split("-");
          yearOfBirth = y;
          monthOfBirth = m;
          dateOfBirth = d;
        }
      }
    }
    console.log(      user_name,
      user_lastname,
      dateOfBirth,
      monthOfBirth,
      yearOfBirth)
    console.log(user)

    res.render("user/account", {
      user_name,
      user_lastname,
      dateOfBirth,
      monthOfBirth,
      yearOfBirth,
      user,
      session: req.session,
    });
  } catch (err) {
    console.error("Lỗi tại renderAccountPage:", err);
    next(err);
  }
};

const changeUserInfo = async (req, res, next) => {
  const {
    dateOfBirth,
    monthOfBirth,
    yearOfBirth,
    user_name,
    user_lastname,
    user_telephone,
  } = req.body;

  if (!dateOfBirth || !monthOfBirth || !yearOfBirth || !user_name || !user_lastname) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đầy đủ thông tin.",
    });
  }

  const isValidDate = /^(0?[1-9]|[12][0-9]|3[01])$/.test(dateOfBirth);
  const isValidMonth = /^(0?[1-9]|1[0-2])$/.test(monthOfBirth);
  const isValidYear = parseInt(yearOfBirth) < new Date().getFullYear();
  const isValidPhone = !user_telephone || /^(0[2-9][0-9]{8,9})$/.test(user_telephone);

  if (!isValidDate || !isValidMonth || !isValidYear) {
    return res.status(400).json({
      success: false,
      message: "Ngày/tháng/năm sinh không hợp lệ.",
    });
  }

  if (user_telephone && !isValidPhone) {
    return res.status(400).json({
      success: false,
      message: "Số điện thoại không hợp lệ.",
    });
  }

  try {
    const user = await UserModel.getUserById(req.session.user_id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Phiên làm việc không hợp lệ.",
      });
    }

    if (user_telephone) {
      const existed = await UserModel.getUserByPhoneExceptId(user_telephone, user.ID_KH);
      if (existed) {
        return res.status(409).json({
          success: false,
          message: "Số điện thoại đã được sử dụng bởi tài khoản khác.",
        });
      }
    }

    const fullName = user_lastname.trim() + " " + user_name.trim();
    const birthDateStr = `${yearOfBirth}-${monthOfBirth.padStart(2, "0")}-${dateOfBirth.padStart(2, "0")}`;

    if (!user_telephone) {
      await UserModel.updateUserInfoNoPhone(user.ID_KH, {
        TenKH: fullName,
        NgaySinh: birthDateStr,
      });
    } else {
      await UserModel.updateUserInfo(user.ID_KH, {
        TenKH: fullName,
        NgaySinh: birthDateStr,
        SDT: user_telephone,
      });
    }

    return res.json({ success: true, message: "Cập nhật thành công!" });

  } catch (error) {
    console.error("❌ Lỗi khi cập nhật:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi khi cập nhật thông tin.",
    });
  }
};




const errorPage = async (req, res) => {
  const errorMessage = req.query.error;
  res.render("user/errorPage", { errorMessage: errorMessage });
};

const login = async (req, res, next) => {
  const { user_telephone, user_password } = req.body;

  if (!user_telephone || !user_password) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin." });
  }

  try {
    const user = await UserModel.findUserByPhone(user_telephone);
    if (!user) {
      return res.status(401).json({ success: false, message: "Số điện thoại không tồn tại." });
    }

    if (user.MatKhau !== user_password) {
      return res.status(401).json({ success: false, message: "Mật khẩu không đúng." });
    }

    req.session.user_id = user.ID_KH;
    return res.json({ success: true, message: "Đăng nhập thành công" });
  } catch (err) {
    console.error("Lỗi khi đăng nhập:", err);
    return res.status(500).json({ success: false, message: "Lỗi server, vui lòng thử lại." });
  }
};


const changePasswordUser = async (req, res, next) => {
  const { user_old_password, user_new_password, user_confirm_new_password } = req.body;

  if (!user_old_password || !user_new_password || !user_confirm_new_password) {
    return res.status(400).json({
      success: false,
      message: "Vui lòng nhập đầy đủ thông tin."
    });
  }

  if (user_new_password !== user_confirm_new_password) {
    return res.status(400).json({
      success: false,
      message: "Mật khẩu xác nhận không khớp."
    });
  }

  try {
    const user = await UserModel.findUserByIdAndPassword(
      req.session.user_id,
      user_old_password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng."
      });
    }

    await UserModel.updatePassword(req.session.user_id, user_new_password);

    return res.json({
      success: true,
      message: "Đổi mật khẩu thành công!"
    });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi, vui lòng thử lại sau."
    });
  }
};


const registerUser = async (req, res, next) => {
  try {
    const {
      user_telephone,
      user_password,
      user_confirm_password,
      user_name,
      user_account_name,
    } = req.body;
    console.log(user_telephone,      user_password,
      user_confirm_password,
      user_name,
      user_account_name,)

    if (!user_password || !user_account_name || !user_name) {
      return res.status(400).json({ success: false, message: "Chưa nhập đủ thông tin" });
    }

    if (user_password !== user_confirm_password) {
      return res.status(400).json({ success: false, message: "Mật khẩu không khớp" });
    }

    const existingUser = await UserModel.findUserByPhone(user_telephone);

    if (existingUser) {
      return res.status(400).json({ success: false, message: "Số điện thoại đã tồn tại" });
    }

    await UserModel.createUser({
      user_account_name,
      user_name,
      user_telephone,
      user_password,
    });

    return res.json({ success: true, message: "Đăng ký thành công" });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra lỗi, vui lòng thử lại sau",
    });
  }
};


const logoutUser = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

const checkSession = (req, res) => {
  if (req.session.user_id) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
};

export default {
  renderAccountPage,
  changeUserInfo,
  errorPage,
  login,
  changePasswordUser,
  registerUser,
  logoutUser,
  checkSession,
};
