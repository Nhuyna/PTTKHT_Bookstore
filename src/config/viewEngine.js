import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import hbs from "express-handlebars";
import moment from "moment";
import hbsHelpers from "./helpers.js";

// Thiết lập __filename và __dirname cho ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hbsInstance = hbs.create({
  extname: ".hbs",
  layoutsDir: path.join(__dirname, "../resources/views/layouts"),
  partialsDir: path.join(__dirname, "../resources/views/partials"),
  defaultLayout: "main",
  helpers: hbsHelpers,
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
});

const configViewEngine = (app) => {
  // Serve static files trước
  app.use(express.static(path.join(__dirname, "../public")));

  // Đăng ký Handlebars engine với helpers
  app.engine("hbs", hbsInstance.engine);
  app.locals.hbsInstance = hbsInstance;

  // Set views folder và view engine
  app.set("views", path.join(__dirname, "../resources/views"));
  app.set("view engine", "hbs");
};
export default configViewEngine;
