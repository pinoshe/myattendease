// filepath: /c:/Users/pi/projects/myattendease/test/index.test.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app'; // Ensure your app is exported from app.ts
import { Attendance } from '../src/models/attendance';
import { describe, it, before, after } from 'mocha';

describe('IndexController', () => {
    before((done) => {
        mongoose.connect(process.env.MONGODB_URI || '')
            .then(() => {
                // Insert test data
                const testAttendance = new Attendance({
                    _id: new mongoose.Types.ObjectId(),
                    employeeId: 1,
                    reportId: '1_012025',
                    attendanceRecords: [
                        {
                            recordId: 20250101,
                            date: new Date('2025-01-01T00:00:00.000Z'),
                            startTime: null,
                            endTime: null,
                            approved: false
                        }
                    ]
                });
                return testAttendance.save();
            })
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
        it('should update attendance times by recordId', (done) => {
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