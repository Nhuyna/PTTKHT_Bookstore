import express from "express";
import siteRouter from "./user/site.js";
import userRouter from "./user/userRouter.js";
import cartRouter from "./user/cartRouter.js";
import historyRouter from "./user/historyRouter.js";
import orderRouter from "./user/orderRouter.js";

// Controllers
import pdController from "../app/controllers/user/ProductsController.js";
import categoryController from "../app/controllers/user/CategoryController.js";
import siteController from "../app/controllers/user/SiteController.js";
const router = express.Router();

router.get("/products", pdController.index);
router.get("/category/:id?", categoryController.index);
router.use("/user", userRouter);
router.use("/cart", cartRouter); 
router.use("/order", orderRouter);
router.use("/lichsudonhang", historyRouter);
router.get("/search", siteController.search);

router.use("/", siteRouter);

export default router;
