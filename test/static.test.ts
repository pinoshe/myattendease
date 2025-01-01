// filepath: /c:/Users/pi/projects/myattendease/test/static.test.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });

import { expect } from 'chai';
import request from 'supertest';
import app from '../src/app'; // Ensure your app is exported from app.ts
import { describe, it } from 'mocha';

describe('Static Paths', function () {
    this.timeout(10000); // Increase timeout to 10 seconds

    describe('GET /about', () => {
        it('should return About Page', (done) => {
            request(app)
                .get('/about')
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    expect(res.text).to.equal('About Page');
                    done();
                });
        });
    });
});