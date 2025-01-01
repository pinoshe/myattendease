import { Request, Response } from 'express';
import { Employee } from '../models/employee';
import { Attendance } from '../models/attendance';

export class IndexController {
    public async getHome(req: Request, res: Response): Promise<void> {
        res.send('Home Page');
    }

    public async getAbout(req: Request, res: Response): Promise<void> {
        res.send('About Page');
    }

    public async getEmployeeById(req: Request, res: Response): Promise<void> {
        const { employeeId } = req.params;
        try {
            const employee = await Employee.findOne({ employeeId: Number(employeeId) });
            if (!employee) {
                res.status(404).send('Employee not found');
                return;
            }
            res.json(employee);
        } catch (err) {
            res.status(500).send('Server error');
        }
    }

    public async getEmployeesByManagerId(req: Request, res: Response): Promise<void> {
        const { managerId } = req.params;
        try {
            const employees = await Employee.find({ managerId: Number(managerId) });
            if (employees.length === 0) {
                res.status(404).send('No employees found for this manager');
                return;
            }
            res.json(employees);
        } catch (err) {
            res.status(500).send('Server error');
        }
    }

    public async getAttendanceByReportId(req: Request, res: Response): Promise<void> {
        const { reportId } = req.params;
        try {
            const attendance = await Attendance.findOne({ reportId });
            if (!attendance) {
                res.status(404).send('Attendance record not found');
                return;
            }
            res.json(attendance);
        } catch (err) {
            res.status(500).send('Server error');
        }
    }

    public async updateAttendanceTimesByDate(req: Request, res: Response): Promise<void> {
        const { reportId, recordId } = req.params;
        const { startTime, endTime } = req.body;
        try {
            const updateFields: any = {};
            if (startTime) {
                updateFields['attendanceRecords.$.startTime'] = new Date(startTime);
            }
            if (endTime) {
                updateFields['attendanceRecords.$.endTime'] = new Date(endTime);
            }

            const attendance = await Attendance.findOneAndUpdate(
                { reportId, 'attendanceRecords.recordId': Number(recordId) },
                { $set: updateFields },
                { new: true }
            );

            if (!attendance) {
                res.status(404).send('Attendance record not found');
                return;
            }
            res.json(attendance);
        } catch (err) {
            res.status(500).send('Server error');
        }
    }

    public async setApprovalStatus(req: Request, res: Response): Promise<void> {
        const { managerId, employeeId, reportId, recordId } = req.params;
        const { approved } = req.body;
        try {
            // Check if the manager is the manager of the employee
            const employee = await Employee.findOne({ employeeId: Number(employeeId), managerId: Number(managerId) });
            if (!employee) {
                res.status(403).send('You are not authorized to change the approval status of this attendance record');
                return;
            }

            // Set the approval status of the attendance record
            const attendance = await Attendance.findOneAndUpdate(
                { reportId, 'attendanceRecords.recordId': Number(recordId) },
                { $set: { 'attendanceRecords.$.approved': approved } },
                { new: true }
            );

            if (!attendance) {
                res.status(404).send('Attendance record not found');
                return;
            }
            res.json(attendance);
        } catch (err) {
            res.status(500).send('Server error');
        }
    }
}