// filepath: /c:/Users/pi/projects/myattendease/test/employee.test.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app'; // Ensure your app is exported from app.ts
import { Employee } from '../src/models/employee';
import { describe, it, before, after } from 'mocha';

describe('Employee API', function () {
    this.timeout(10000); // Increase timeout to 10 seconds

    before((done) => {
        mongoose.connect(process.env.MONGODB_URI || '')
            .then(() => Employee.deleteMany({})) // Clear the employee collection
            .then(() => {
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

                return testEmployee.save();
            })
            .then(() => done())
            .catch((err) => done(err));
    });

    after((done) => {
        mongoose.connection.close()
            .then(() => done())
            .catch((err) => done(err));
    });

    describe('GET /employee/:employeeId', () => {
        it('should return employee by employeeId', (done) => {
            request(app)
                .get('/employee/1')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('object');
                    expect(res.body).to.have.property('employeeId', 1);
                    expect(res.body).to.have.property('firstName', 'John');
                    expect(res.body).to.have.property('lastName', 'Doe');
                    done();
                });
        });
    });

    describe('GET /employees/manager/:managerId', () => {
        it('should return employees by managerId', (done) => {
            request(app)
                .get('/employees/manager/1')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.greaterThan(0);
                    const employee = res.body.find((e: any) => e.employeeId === 1);
                    expect(employee).to.have.property('firstName', 'John');
                    expect(employee).to.have.property('lastName', 'Doe');
                    done();
                });
        });
    });
});