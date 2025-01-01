import { Router } from 'express';
import { IndexController } from '../controllers/index';
import express from 'express';

const router = Router();
const indexController = new IndexController();

router.get('/', indexController.getHome);
router.get('/about', indexController.getAbout);
router.get('/employee/:employeeId', indexController.getEmployeeById);
router.get('/employees/manager/:managerId', indexController.getEmployeesByManagerId);
router.get('/attendance/:reportId', indexController.getAttendanceByReportId);
router.put('/attendance/:reportId/:recordId', indexController.updateAttendanceTimesByDate);
router.put('/attendance/approve/:managerId/:employeeId/:reportId/:recordId', indexController.setApprovalStatus);

export function setRoutes(app: express.Application) {
    app.use(express.json()); // Ensure the app can parse JSON request bodies
    app.use('/', router);
}