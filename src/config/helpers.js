import moment from "moment";

export default {
  formatNumber: (number) => {
    const num = Number(number);
    if (isNaN(num)) return "";
    return num.toLocaleString("vi-VN") + "₫";
  },

  formatCurrency: (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value),

  formatDate: (timestamp, fmt) => moment(timestamp).format(fmt),

  inc: (value) => parseInt(value, 10) + 1,

  add: (a, b) => Number(a) + Number(b),

  subtract: (a, b) => Number(a) - Number(b),

  eq: (a, b) => a == b,

  or: (...args) => {
    const options = args.pop();
    return args.some(Boolean);
  },

  range: (start, end) => {
    let arr = [];
    for (let i = start; i <= end; i++) {
      arr.push(i);
    }
    return arr;
  },

  isChecked: (id, list) =>
    Array.isArray(list) && list.some((cat) => cat.DanhMucID == id)
      ? "checked"
      : "",

  range: (start, end, opts) => {
    if (opts && typeof opts.fn === "function") {
      let res = "";
      for (let i = start; i <= end; i++) res += opts.fn(i);
      return res;
    }
    let arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  },

  paginationURL: (page, opts) =>
    `?${new URLSearchParams({
      ...opts.data.root.query,
      page,
    }).toString()}`,

  includes: (arr, val) => {
    const a = Array.isArray(arr) ? arr : [arr];
    return a.includes(val.toString()) || a.includes(Number(val));
  },
  orIncludes: (arr, val1, val2) => {
    const a = Array.isArray(arr) ? arr : [arr];
    return a.includes(val1) || a.includes(val2);
  },

  block: function (name, opts) {
    this._blocks = this._blocks || {};
    this._blocks[name] = opts.fn(this);
    return null;
  },

  // 🌟 THÊM CÁC HÀM MỚI:
  multi: (a, b) => a * b,

  not: (value) => !value,

  json: (context) => JSON.stringify(context),

  statusClass: function (status) {
    const statusMap = {
      "Chờ xác nhận": "status-pending",
      "Chờ lấy hàng": "status-processing",
      "Đang giao hàng": "status-shipping",
      "Đã giao": "status-completed",
      "Đã hủy": "status-cancelled",
      "Trả hàng": "status-returned",
      "Đã thanh toán": "payment-paid",
      "Chưa thanh toán": "payment-unpaid",
      "Đã hoàn tiền": "payment-refunded",
      "Chưa hoàn tiền": "payment-not-refunded",
    };
    return statusMap[status] || "";
  },

  formatCurrentDate: function (value) {
    if (!value) {
      return "Invalid date";
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return dateFormatter.format(date) + " " + timeFormatter.format(date);
  },

  // Helper ifCond added here
  ifCond: function (v1, operator, v2, options) {
    switch (operator) {
      case "==":
        return v1 == v2 ? options.fn(this) : options.inverse(this);
      case "===":
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      case "<":
        return v1 < v2 ? options.fn(this) : options.inverse(this);
      case ">":
        return v1 > v2 ? options.fn(this) : options.inverse(this);
      case "&&":
        return v1 && v2 ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  },
  contains: function (array, value) {
    return array.indexOf(value) !== -1;
  },

  // Thêm helper cho trang khách hàng
  sortUrl: function (query, field, defaultDir) {
    const newQuery = { ...query };

    // Nếu đang sort theo field này, đảo chiều sort
    if (newQuery.sortField === field) {
      newQuery.sortDir = newQuery.sortDir === "asc" ? "desc" : "asc";
    } else {
      // Nếu sort theo field mới, dùng chiều sort mặc định
      newQuery.sortField = field;
      newQuery.sortDir = defaultDir;
    }

    return new URLSearchParams(newQuery).toString();
  },

  removeFilter: function (query, paramName) {
    const newQuery = { ...query };
    delete newQuery[paramName];
    return new URLSearchParams(newQuery).toString();
  },

  formatDateSimple: function (dateString) {
    if (!dateString) return "";
    return moment(dateString).format("DD/MM/YYYY");
  },

  getPaymentStatusClass: function (status) {
    const statusMap = {
      "Da thanh toan": "status-paid",
      "Chua thanh toan": "status-unpaid",
      "Da hoan tien": "payment-refunded",
      "Chua hoan tien": "payment-not-refunded",
    };
    return statusMap[status] || "";
  },

  formatPaymentStatus: function (status) {
    const statusMap = {
      "Da thanh toan": "Đã thanh toán",
      "Chua thanh toan": "Chưa thanh toán",
      "Da hoan tien": "Đã hoàn tiền",
      "Chua hoan tien": "Chưa hoàn tiền",
    };
    return statusMap[status] || status;
  },

  getOrderStatusClass: function (status) {
    const statusMap = {
      "Cho xac nhan": "status-pending",
      "Cho lay hang": "status-processing",
      "Dang giao hang": "status-shipping",
      "Da giao": "status-completed",
      "Da huy": "status-cancelled",
      "Tra hang": "status-returned",
    };
    return statusMap[status] || "";
  },

  formatOrderStatus: function (status) {
    const statusMap = {
      "Cho xac nhan": "Chờ xác nhận",
      "Cho lay hang": "Chờ lấy hàng",
      "Dang giao hang": "Đang giao hàng",
      "Da giao": "Đã giao",
      "Da huy": "Đã hủy",
      "Tra hang": "Trả hàng",
    };
    return statusMap[status] || status;
  },

  // Helper để tạo query string cho nút xuất Excel
  exportQueryString: function (query) {
    if (!query || Object.keys(query).length === 0) {
      return "";
    }

    const newQuery = { ...query };
    return "?" + new URLSearchParams(newQuery).toString();
  },
};
