import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Product from '../../src/models/Product.js';
import Category from '../../src/models/Category.js';
import Order from '../../src/models/Order.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

describe('Order API', () => {
    let adminToken;
    let userToken;
    let user;
    let product;

    beforeAll(() => {
        process.env.JWT_SECRET = 'testsecret';
    });

    beforeEach(async () => {
        const adminUser = await User.create({
            username: 'admin1',
            email: 'admin1@order.com',
            password: 'hashedpassword',
            role: 'admin',
            phone: '1111'
        });

        user = await User.create({
            username: 'user1',
            email: 'user1@order.com',
            password: 'hashedpassword',
            role: 'user',
            phone: '2222'
        });

        const category = await Category.create({ name: 'Food' });
        product = await Product.create({
            name: 'Burger',
            price: 50,
            category: category._id
        });

        adminToken = jwt.sign({ id: adminUser._id, isAdmin: true }, process.env.JWT_SECRET);
        userToken = jwt.sign({ id: user._id, isAdmin: false }, process.env.JWT_SECRET);
    });

    describe('Admin Order Routes', () => {
        let orderId;

        describe('POST /admin/order/add', () => {
            it('should create a new order', async () => {
                const res = await request(app)
                    .post('/admin/order/add')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                        userId: user._id,
                        items: [{ productId: product._id, quantity: 2, price: product.price }]
                    });

                expect(res.status).toBe(201);
                expect(res.body.subtotalAmount).toBe(100);
                expect(res.body.totalAmount).toBe(100);
                orderId = res.body._id;
            });

            it('should return 400 for invalid data', async () => {
                const res = await request(app)
                    .post('/admin/order/add')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({});

                expect(res.status).toBe(400);
            });
        });

        describe('PATCH /admin/order/update/:id/status', () => {
            beforeEach(async () => {
                const order = await Order.create({
                    userId: user._id,
                    subtotalAmount: 100,
                    totalAmount: 100,
                    status: 'processing'
                });
                orderId = order._id;
            });

            it('should update order status', async () => {
                const res = await request(app)
                    .patch(`/admin/order/update/${orderId}/status`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ status: 'completed' });

                expect(res.status).toBe(200);
                expect(res.body.status).toBe('completed');
            });
        });

        describe('GET /admin/order/get', () => {
            it('should get all orders', async () => {
                await Order.create({
                    userId: user._id,
                    subtotalAmount: 100,
                    totalAmount: 100
                });

                const res = await request(app)
                    .get('/admin/order/get')
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                expect(Array.isArray(res.body)).toBeTruthy();
                expect(res.body.length).toBeGreaterThan(0);
            });
        });

        describe('GET /admin/order/get/:id', () => {
            it('should get order by id', async () => {
                const order = await Order.create({
                    userId: user._id,
                    subtotalAmount: 100,
                    totalAmount: 100
                });

                const res = await request(app)
                    .get(`/admin/order/get/${order._id}`)
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                expect(res.body._id).toBe(order._id.toString());
            });
        });

        describe('GET /admin/order/getReportByRange', () => {
            it('should generate an excel report for a date range', async () => {
                const start = new Date();
                start.setDate(start.getDate() - 1);
                const end = new Date();
                end.setDate(end.getDate() + 1);

                const res = await request(app)
                    .get(`/admin/order/getReportByRange?startDate=${start.toISOString()}&endDate=${end.toISOString()}`)
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                // The response should be a binary excel file
                expect(res.headers['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            });
        });

        describe('PUT /admin/order/getByRange', () => {
            it('should get orders by date range', async () => {
                await Order.create({
                    userId: user._id,
                    subtotalAmount: 100,
                    totalAmount: 100,
                    orderDate: new Date()
                });

                const start = new Date();
                start.setDate(start.getDate() - 1);
                const end = new Date();
                end.setDate(end.getDate() + 1);

                const res = await request(app)
                    .put('/admin/order/getByRange')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                        startDate: start.toISOString(),
                        endDate: end.toISOString()
                    });

                expect(res.status).toBe(200);
                expect(res.body.length).toBeGreaterThan(0);
            });
        });

        describe('GET /admin/order/getDailyStats', () => {
            it('should get daily stats', async () => {
                await Order.create({
                    userId: user._id,
                    subtotalAmount: 100,
                    totalAmount: 100,
                    status: 'completed',
                    orderDate: new Date()
                });

                const res = await request(app)
                    .get('/admin/order/getDailyStats')
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                expect(res.body.totalOrders).toBe(1);
                expect(res.body.totalRevenue).toBe(100);
            });
        });
    });

    describe('User Order Routes', () => {
        beforeEach(async () => {
            await Order.create({
                userId: user._id,
                subtotalAmount: 100,
                totalAmount: 100,
                orderDate: new Date()
            });
        });

        describe('GET /user/order/', () => {
            it('should get orders for logged in user', async () => {
                const res = await request(app)
                    .get('/user/order/')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(Array.isArray(res.body)).toBeTruthy();
                expect(res.body.length).toBe(1);
                expect(res.body[0].userId.toString()).toBe(user._id.toString());
            });

            it('should return 404 if user has no orders', async () => {
                const newUser = await User.create({
                    username: 'user2',
                    email: 'user2@order.com',
                    password: 'pass',
                    phone: '3333'
                });
                const newToken = jwt.sign({ id: newUser._id, isAdmin: false }, process.env.JWT_SECRET);

                const res = await request(app)
                    .get('/user/order/')
                    .set('Authorization', `Bearer ${newToken}`);

                expect(res.status).toBe(404);
            });
        });
    });
});
