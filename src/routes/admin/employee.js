import express from "express";
const router = express.Router();
import EmployeeController from '../../app/controllers/admin/EmployeeController.js';

router.get('/view/:id', EmployeeController.view);

router.get('/create', EmployeeController.create);

router.get('/create_excel', EmployeeController.create_excel);

router.post('/store', EmployeeController.store);

router.get('/update/:id', EmployeeController.update);

router.post('/edit', EmployeeController.edit);

router.get('/delete/:id', EmployeeController.delete);

router.get('/', EmployeeController.index);

export default router;
