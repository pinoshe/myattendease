// filepath: /c:/Users/pi/projects/myattendease/test/attendance.test.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app'; // Ensure your app is exported from app.ts
import { Attendance } from '../src/models/attendance';
import { Employee } from '../src/models/employee';
import { describe, it, before, after, beforeEach } from 'mocha';

describe('Attendance API', function () {
    this.timeout(10000); // Increase timeout to 10 seconds

    before((done) => {
        mongoose.connect(process.env.MONGODB_URI || '')
            .then(() => Promise.all([
                Attendance.deleteMany({}), // Clear the attendance collection
                Employee.deleteMany({}) // Clear the employee collection
            ]))
            .then(() => done())
            .catch((err) => done(err));
    });

    beforeEach((done) => {
        // Insert test data
        const testEmployee = new Employee({
            _id: new mongoose.Types.ObjectId(),
            employeeId: 1,
            managerId: 1,
            firstName: 'John',
            lastName: 'Doe',
            role: 'Developer',
            position: 'Developer'
        });

        const testAttendance = new Attendance({
            _id: new mongoose.Types.ObjectId(),
            employeeId: 1,
            reportId: '1_012025',
            attendanceRecords: [
                {
                    recordId: 20250101,
                    date: new Date('2025-01-01T00:00:00.000Z'),
                    startTime: new Date('2025-01-01T09:00:00.000Z'),
                    endTime: new Date('2025-01-01T17:00:00.000Z'),
                    approved: false
                }
            ]
        });

        Promise.all([
            testEmployee.save(),
            testAttendance.save()
        ])
            .then(() => done())
            .catch((err) => done(err));
    });

    after((done) => {
        mongoose.connection.close()
            .then(() => done())
            .catch((err) => done(err));
    });

    describe('GET /attendance/:reportId', () => {
        it('should return attendance by reportId', (done) => {
            request(app)
                .get('/attendance/1_012025')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('reportId', '1_012025');
                    done();
                });
        });
    });

    describe('PUT /attendance/:reportId/:recordId', () => {
        it('should update startTime only by recordId', (done) => {
            request(app)
                .put('/attendance/1_012025/20250101')
                .send({ startTime: '2025-01-01T10:10:00.000Z' })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    expect(res.body.attendanceRecords).to.be.an('array');
                    const record = res.body.attendanceRecords.find((r: any) => r.recordId === 20250101);
                    expect(record).to.have.property('startTime', '2025-01-01T10:10:00.000Z');
                    expect(record).to.have.property('endTime', '2025-01-01T17:00:00.000Z'); // unchanged
                    done();
                });
        });

        it('should update endTime only by recordId', (done) => {
            request(app)
                .put('/attendance/1_012025/20250101')
                .send({ endTime: '2025-01-01T18:00:00.000Z' })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    expect(res.body.attendanceRecords).to.be.an('array');
                    const record = res.body.attendanceRecords.find((r: any) => r.recordId === 20250101);
                    expect(record).to.have.property('startTime', '2025-01-01T09:00:00.000Z'); // unchanged
                    expect(record).to.have.property('endTime', '2025-01-01T18:00:00.000Z');
                    done();
                });
        });

        it('should update both startTime and endTime by recordId', (done) => {
            request(app)
                .put('/attendance/1_012025/20250101')
                .send({ startTime: '2025-01-01T10:10:00.000Z', endTime: '2025-01-01T15:42:00.000Z' })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    expect(res.body.attendanceRecords).to.be.an('array');
                    const record = res.body.attendanceRecords.find((r: any) => r.recordId === 20250101);
                    expect(record).to.have.property('startTime', '2025-01-01T10:10:00.000Z');
                    expect(record).to.have.property('endTime', '2025-01-01T15:42:00.000Z');
                    done();
                });
        });
    });

    describe('PUT /attendance/approve/:managerId/:employeeId/:reportId/:recordId', () => {
        it('should approve attendance record', (done) => {
            request(app)
                .put('/attendance/approve/1/1/1_012025/20250101')
                .send({ approved: true })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    expect(res.body.attendanceRecords).to.be.an('array');
                    const record = res.body.attendanceRecords.find((r: any) => r.recordId === 20250101);
                    expect(record).to.have.property('approved', true);
                    done();
                });
        });

        it('should unapprove attendance record', (done) => {
            request(app)
                .put('/attendance/approve/1/1/1_012025/20250101')
                .send({ approved: false })
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    expect(res.body.attendanceRecords).to.be.an('array');
                    const record = res.body.attendanceRecords.find((r: any) => r.recordId === 20250101);
                    expect(record).to.have.property('approved', false);
                    done();
                });
        });
    });
});