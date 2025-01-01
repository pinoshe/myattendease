import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
    recordId: { type: Number, required: true, unique: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    approved: { type: Boolean, default: false }
});

const attendanceSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    employeeId: { type: Number, required: true },
    reportId: { type: String, required: true, unique: true },
    attendanceRecords: { type: [attendanceRecordSchema], required: true }
});

export const Attendance = mongoose.model('Attendance', attendanceSchema, 'attendanceCollection');