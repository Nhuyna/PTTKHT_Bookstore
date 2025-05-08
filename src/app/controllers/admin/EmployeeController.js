// const employeeConfig = require('../db/employee');
import employeeConfig from '../../model/admin/employee.js';
import phanquyen from "../../model/admin/phanquyenModel.js";
import ExcelJS from 'exceljs';
import moment from 'moment';

class EmployeeController{
    // show all employee
    async index (req, res){
        try {
            let permissions = (
                await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
            ).map((p) => p.ChucNang);
        
            // Thêm quyền "all" vào danh sách permissions
            const allPermissions = (
                await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
            ).map((p) => p.ChucNang);
        
            permissions = permissions.concat(allPermissions);
            let action = await phanquyen.action(req.session.user.idNQ, "nhanvien");
            console.log(action)
            const employee = await employeeConfig.getAll();
            res.render('admin/employee', {
                employee,
                layout: "admin",
                permissions,
                action,
            });
        } catch (err) {
            console.log(err);
        }
    }

    // search employee
    async search(req, res){
        try {
            const {id} = req.params;
            res.render('admin/employee',{layout: "admin"});
        } catch (err) {
            console.log(err);
        }
    }

    // view detail employee
    async view(req, res){
        try {
            let permissions = (
                await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
            ).map((p) => p.ChucNang);
        
            // Thêm quyền "all" vào danh sách permissions
            const allPermissions = (
                await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
            ).map((p) => p.ChucNang);
        
            permissions = permissions.concat(allPermissions);
            let action = await phanquyen.action(req.session.user.idNQ, "nhanvien");
            const {id} = req.params;
            const employee = (await employeeConfig.search(id))[0];
            res.render('admin/view_employee', {
                employee,
                layout: "admin",
                permissions,
                action,
            });
        } catch (error) {
            console.log(error);
        }
    }

    // create form
    async create(req, res){
        try {
            let permissions = (
                await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
            ).map((p) => p.ChucNang);
        
            // Thêm quyền "all" vào danh sách permissions
            const allPermissions = (
                await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
            ).map((p) => p.ChucNang);
        
            permissions = permissions.concat(allPermissions);
            let action = await phanquyen.action(req.session.user.idNQ, "nhanvien");
            res.render('admin/create_employee', {
                layout: "admin",
                permissions,
                action,
            });
        } catch (error) {
            console.log(error);
        }
    }

    // create excel
    async create_excel(req, res){
        try {
            const data = await employeeConfig.getAll(); // Lấy dữ liệu từ DB
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Danh sách nhân viên');
        
            // Định nghĩa các cột
            worksheet.columns = [
                { header: 'Mã Nhân Viên', key: 'IDNhanVien', width: 15 },
                { header: 'Tên Nhân Viên', key: 'TenNhanVien', width: 30 },
                { header: 'Ngày Sinh', key: 'NgaySinh', width: 20 },
                { header: 'SĐT', key: 'SDT', width: 15 },
                { header: 'Email', key: 'Mail', width: 30 },
                { header: 'Số Nhà / Đường', key: 'SoNhaDuong', width: 25 },
                { header: 'Phường / Xã', key: 'PhuongXa', width: 25 },
                { header: 'Quận / Huyện', key: 'QuanHuyen', width: 25 },
                { header: 'Tỉnh / Thành Phố', key: 'TinhThanhPho', width: 25 },
                { header: 'Vị trí', key: 'ViTri', width: 20 },
                { header: 'Ngày Vào Làm', key: 'NgayVaoLam', width: 20 },
                { header: 'Lương', key: 'Luong', width: 15 },
            ];
        
            // Thêm dữ liệu
            data.forEach((item, index) => {
                worksheet.addRow({
                    ...item,
                    NgaySinh: new Date(item.NgaySinh),
                    NgayVaoLam: new Date(item.NgayVaoLam),
                });
            });

            // Format ngày
            worksheet.getColumn('NgaySinh').eachCell((cell, rowNumber) => {
                if (rowNumber > 1 && cell.value instanceof Date) {
                    cell.value = moment(cell.value).format('DD/MM/YYYY');
                }
            });
            worksheet.getColumn('NgayVaoLam').eachCell((cell, rowNumber) => {
                if (rowNumber > 1 && cell.value instanceof Date) {
                    cell.value = moment(cell.value).format('DD/MM/YYYY');
                }
            });
            // Format tiền
            worksheet.getColumn('Luong').eachCell((cell, rowNumber) => {
                if (rowNumber > 1) {
                    const value = Number(cell.value);
                    cell.value = new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    }).format(value);
                }
            });

            // Xuất file
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=ds_nhanvien.xlsx');
            await workbook.xlsx.write(res);
            res.end();
        } catch (error) {
            console.log(error);
        }
    }

    // get data from create form and add new employee
    async store(req, res){
        try {
            const {name, dob_day, dob_month, dob_year, phone, email, street, ward, 
                district, city, position, dow_day, dow_month, dow_year, salary} = req.body;
            // Ghép ngày lại theo chuẩn YYYY-MM-DD
            const dob = `${dob_year}-${dob_month.padStart(2, '0')}-${dob_day.padStart(2, '0')}`;
            const dow = `${dow_year}-${dow_month.padStart(2, '0')}-${dow_day.padStart(2, '0')}`;
            await employeeConfig.insert(name, dob, phone, email, street, ward, district, city, position, dow, salary);
            res.redirect('/admin/employee', {layout: "admin"});
        } catch (error) {
            console.log(error);
        }
    }

    // update data form
    async update(req, res){
        try {
            let permissions = (
                await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "view")
            ).map((p) => p.ChucNang);
        
            // Thêm quyền "all" vào danh sách permissions
            const allPermissions = (
                await phanquyen.findPAccessIdNhomQuyen(req.session.user.idNQ, "all")
            ).map((p) => p.ChucNang);
        
            permissions = permissions.concat(allPermissions);
            let action = await phanquyen.action(req.session.user.idNQ, "nhanvien");
            const {id} = req.params;
            const employee = (await employeeConfig.search(id))[0];
            // Tách NgaySinh thành từng phần
            const dob = new Date(employee.NgaySinh);
            employee.dob_day = dob.getDate();
            employee.dob_month = dob.getMonth() + 1;
            employee.dob_year = dob.getFullYear();
            const dow = new Date(employee.NgayVaoLam);
            employee.dow_day = dow.getDate();
            employee.dow_month = dow.getMonth() + 1;
            employee.dow_year = dow.getFullYear();
            res.render('admin/update_employee', {
                employee, 
                layout: "admin",
                permissions,
                action,
            });
        } catch (error) {
            console.log(error);
        }
    }

    // get data from update and edit employee
    async edit(req, res){
        try {
            const {id, name, dob_day, dob_month, dob_year, phone, email, street, ward, 
                district, city, position, dow_day, dow_month, dow_year, salary} = req.body;
            // Ghép ngày lại theo chuẩn YYYY-MM-DD
            const dob = `${dob_year}-${dob_month.padStart(2, '0')}-${dob_day.padStart(2, '0')}`;
            const dow = `${dow_year}-${dow_month.padStart(2, '0')}-${dow_day.padStart(2, '0')}`;
            await employeeConfig.update(id, name, dob, phone, email, street, ward, district, city, position, dow, salary);
            res.redirect('/admin/employee', {layout: "admin"});
        } catch (error) {
            console.log(error);
        }
    }

    // delete data
    async delete(req, res){
        try {
            await employeeConfig.delete(req.params.id);
            res.redirect('/admin/employee', {layout: "admin"});
        } catch (error) {
            console.log(error);
        }
    }
}

// module.exports = new EmployeeController();
export default new EmployeeController();