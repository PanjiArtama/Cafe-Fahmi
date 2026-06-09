import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Order from '../../src/models/Order.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('User API', () => {
    let adminToken;
    let userToken;
    let normalUser;
    let adminUser;

    beforeAll(() => {
        process.env.JWT_SECRET = 'testsecret';
    });

    beforeEach(async () => {
        adminUser = await User.create({
            username: 'admin1',
            email: 'admin1@example.com',
            password: 'hashedpassword',
            role: 'admin',
            phone: '1111'
        });

        normalUser = await User.create({
            username: 'user1',
            email: 'user1@example.com',
            password: 'hashedpassword',
            role: 'user',
            phone: '2222'
        });

        adminToken = jwt.sign({ id: adminUser._id, isAdmin: true }, process.env.JWT_SECRET);
        userToken = jwt.sign({ id: normalUser._id, isAdmin: false }, process.env.JWT_SECRET);
    });

    describe('Admin Routes', () => {
        describe('GET /admin/user/get', () => {
            it('should return all users with role "user"', async () => {
                const res = await request(app)
                    .get('/admin/user/get')
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(res.status).toBe(200);
                expect(Array.isArray(res.body)).toBeTruthy();
                // Should contain normalUser but not adminUser
                expect(res.body.length).toBe(1);
                expect(res.body[0].username).toBe('user1');
                expect(res.body[0].password).toBeUndefined(); // Should exclude password
            });

            it('should return 403 if not admin', async () => {
                const res = await request(app)
                    .get('/admin/user/get')
                    .set('Authorization', `Bearer ${userToken}`);
                expect(res.status).toBe(403);
            });
        });

        describe('GET /admin/user/get/:id', () => {
            it('should return user by id', async () => {
                const res = await request(app)
                    .get(`/admin/user/get/${normalUser._id}`)
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(res.status).toBe(200);
                expect(res.body.username).toBe('user1');
            });

            it('should return 404 for non-existent user', async () => {
                const fakeId = new mongoose.Types.ObjectId();
                const res = await request(app)
                    .get(`/admin/user/get/${fakeId}`)
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(res.status).toBe(404);
            });
        });

        describe('POST /admin/user/getStat', () => {
            it('should return user statistics', async () => {
                // Mock an order for the user
                await Order.create({
                    userId: normalUser._id,
                    totalAmount: 500,
                    subtotalAmount: 500,
                    status: 'completed',
                    items: [], // mock
                    shippingAddress: '123 Test St',
                    paymentMethod: 'cash'
                });

                const res = await request(app)
                    .post('/admin/user/getStat')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({}); // No date filter

                expect(res.status).toBe(200);
                expect(Array.isArray(res.body)).toBeTruthy();
                const userStat = res.body.find(u => u.username === 'user1');
                expect(userStat).toBeTruthy();
                expect(userStat.lifetimeSpend).toBe(500);
                expect(userStat.totalOrders).toBe(1);
            });
        });
    });

    describe('User Profile Routes', () => {
        describe('GET /user/profile/', () => {
            it('should get own profile', async () => {
                const res = await request(app)
                    .get('/user/profile/')
                    .set('Authorization', `Bearer ${userToken}`);
                
                expect(res.status).toBe(200);
                expect(res.body.username).toBe('user1');
                expect(res.body.password).toBeUndefined();
            });

            it('should return 403 if accessed by admin token', async () => {
                const res = await request(app)
                    .get('/user/profile/')
                    .set('Authorization', `Bearer ${adminToken}`);
                // isUser middleware denies if decoded.isAdmin is true
                expect(res.status).toBe(403);
            });
        });

        describe('PUT /user/profile/update', () => {
            it('should update own profile', async () => {
                const res = await request(app)
                    .put('/user/profile/update')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({
                        username: 'updatedUser1',
                        email: 'updated@example.com',
                        phone: '9999'
                    });

                expect(res.status).toBe(200);
                expect(res.body.username).toBe('updatedUser1');

                const userInDb = await User.findById(normalUser._id);
                expect(userInDb.username).toBe('updatedUser1');
                expect(userInDb.phone).toBe('9999');
            });
        });
    });
});
