// Helper functions for Handlebars templates

export default {
  block: function (name, options) {
    if (!this._blocks) {
      this._blocks = {};
    }
    // @ts-ignore
    this._blocks[name] = options.fn(this);
    return null;
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
  formatCurrency: function (value) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  },
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
  multi: (a, b) => a * b,
  eq: (a, b) => a === b,
  or: function () {
    return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
  },
  not: function (value) {
    return !value;
  },
  json: function (context) {
    return JSON.stringify(context);
  },
  includes: function (arr, value) {
    return Array.isArray(arr) && arr.includes(value);
  },

  some: function (value, arr) {
    return Array.isArray(arr) && arr.includes(value);
  },

  all: function (value, arr) {
    return Array.isArray(arr) && arr.every((item) => item === value);
  },
};
