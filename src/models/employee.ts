import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    employeeId: { type: Number, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, required: true },
    managerId: { type: Number, required: true }
});

export const Employee = mongoose.model('Employee', employeeSchema, 'employeesCollection');