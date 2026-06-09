import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import WebInformation from '../../src/models/WebInformation.js';
import jwt from 'jsonwebtoken';

describe('WebInformation API', () => {
    let adminToken;
    let userToken;

    beforeAll(() => {
        process.env.JWT_SECRET = 'testsecret';
    });

    beforeEach(async () => {
        const adminUser = await User.create({
            username: 'admin1',
            email: 'admin1@webinfo.com',
            password: 'hashedpassword',
            role: 'admin',
            phone: '1111'
        });

        const normalUser = await User.create({
            username: 'user1',
            email: 'user1@webinfo.com',
            password: 'hashedpassword',
            role: 'user',
            phone: '2222'
        });

        adminToken = jwt.sign({ id: adminUser._id, isAdmin: true }, process.env.JWT_SECRET);
        userToken = jwt.sign({ id: normalUser._id, isAdmin: false }, process.env.JWT_SECRET);
    });

    describe('GET /web-info/', () => {
        it('should return 404 if no web info is found', async () => {
            const res = await request(app).get('/web-info/');
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Web information not found');
        });

        it('should return web info if it exists', async () => {
            await WebInformation.create({
                mainTitle: 'My Cafe',
                shortDesc: 'Best cafe',
                longDesc: 'Best cafe long desc',
                motto1: 'Good food',
                motto2: 'Good life',
                motto3: 'Good coffee',
                address: '123 Test',
                establishedYear: '2020',
                mapsLink: 'http',
                phoneNumber: '12345'
            });

            const res = await request(app).get('/web-info/');
            expect(res.status).toBe(200);
            expect(res.body.mainTitle).toBe('My Cafe');
        });
    });

    describe('Admin GET /admin/web-info/', () => {
        it('should return web info for admin', async () => {
            await WebInformation.create({
                mainTitle: 'My Cafe Admin',
                shortDesc: 'Best cafe admin',
                longDesc: 'Best cafe long desc admin',
                motto1: 'Good food',
                motto2: 'Good life',
                motto3: 'Good coffee',
                address: '123 Test Admin',
                establishedYear: '2020',
                mapsLink: 'http admin',
                phoneNumber: '12345'
            });

            const res = await request(app)
                .get('/admin/web-info/')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.mainTitle).toBe('My Cafe Admin');
        });
    });

    describe('PUT /admin/web-info/update', () => {
        it('should update or create web info', async () => {
            const res = await request(app)
                .put('/admin/web-info/update')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    mainTitle: 'Updated Cafe Title',
                    shortDesc: 'Updated short desc',
                    phoneNumber: '99999'
                });

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Web information updated successfully');
            expect(res.body.data.mainTitle).toBe('Updated Cafe Title');

            const infoInDb = await WebInformation.findOne();
            expect(infoInDb.mainTitle).toBe('Updated Cafe Title');
        });

        it('should return 403 when not admin', async () => {
            const res = await request(app)
                .put('/admin/web-info/update')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ mainTitle: 'Hacked Title' });

            expect(res.status).toBe(403);
        });
    });
});
