const path = require("path");
const express = require("express");
const hbs = require("express-handlebars");

let configViewEngine = (app) => {
  // Thiết lập thư mục views và view engine
  app.set("views", path.join(__dirname, "../resources/views"));
  app.set("view engine", "hbs");

  // Đường dẫn static phải đúng theo vị trí thật sự của thư mục public
  app.use(express.static(path.join(__dirname, "../public")));

  // Cấu hình handlebars với helpers đầy đủ
  app.engine(
    "hbs",
    hbs.engine({
      extname: ".hbs",
      layoutsDir: path.join(__dirname, "../resources/views/layouts"),
      partialsDir: path.join(__dirname, "../resources/views/partials"),
      defaultLayout: "main",
      helpers: {
        formatNumber: (number) => {
          const num = Number(number);
          if (isNaN(num)) return "";
          return num.toLocaleString("vi-VN") + "₫";
        },
        eq: (a, b) => a === b,
        subtract: (a, b) => a - b,
        add: (a, b) => a + b,
        range: (start, end, options) => {
          let result = "";
          if (typeof options.fn === "function") {
            for (let i = start; i <= end; i++) {
              result += options.fn(i); // Gọi options.fn(i) nếu options.fn là một hàm
            }
          }
          return result;
        },
        paginationURL: (page, options) => {
          const query = { ...options.data.root.query, page };
          const params = new URLSearchParams(query);
          return `?${params.toString()}`;
        },
        includes: (array, value) => {
          if (!Array.isArray(array)) array = [array];
          return (
            array.includes(value.toString()) || array.includes(Number(value))
          );
        },
        or: (a, b) => a || b,
        json: (context) => JSON.stringify(context),
      },
    })
  );
};

module.exports = configViewEngine;
