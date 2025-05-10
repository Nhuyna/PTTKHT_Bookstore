import express from "express";
const router = express.Router();
import AccountController from '../../app/controllers/admin/AccountController.js';

router.get("/search_employee", AccountController.search_employee);

router.get("/search_permission", AccountController.search_permission);

router.get('/view/:id', AccountController.view);

router.get('/create', AccountController.create);

router.get('/create_excel', AccountController.create_excel);

router.post('/store', AccountController.store);

router.get('/update/:id', AccountController.update);

router.post('/edit', AccountController.edit);

router.get('/delete/:id', AccountController.delete);

router.get('/', AccountController.index);

export default router;
