import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Coupon from '../../src/models/Coupon.js';
import UserCoupon from '../../src/models/UserCoupon.js';
import jwt from 'jsonwebtoken';

describe('Coupon API', () => {
    let adminToken;
    let userToken;
    let user;

    beforeAll(() => {
        process.env.JWT_SECRET = 'testsecret';
    });

    beforeEach(async () => {
        const adminUser = await User.create({
            username: 'admin1',
            email: 'admin1@coupon.com',
            password: 'hashedpassword',
            role: 'admin',
            phone: '1111'
        });

        user = await User.create({
            username: 'user1',
            email: 'user1@coupon.com',
            password: 'hashedpassword',
            role: 'user',
            phone: '2222'
        });

        adminToken = jwt.sign({ id: adminUser._id, isAdmin: true }, process.env.JWT_SECRET);
        userToken = jwt.sign({ id: user._id, isAdmin: false }, process.env.JWT_SECRET);
    });

    describe('Admin Coupon Routes', () => {
        let couponId;

        describe('POST /admin/coupon/add', () => {
            it('should create a new coupon', async () => {
                const res = await request(app)
                    .post('/admin/coupon/add')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                        code: 'DISCOUNT10',
                        type: 'percentage',
                        value: 10,
                        maxDiscount: 50,
                        minPurchase: 100,
                        desc: '10% off',
                        isActive: true
                    });

                expect(res.status).toBe(201);
                expect(res.body.code).toBe('DISCOUNT10');
                couponId = res.body._id;
            });
        });

        describe('GET /admin/coupon/get', () => {
            beforeEach(async () => {
                const c = await Coupon.create({
                    code: 'SAVE20',
                    type: 'fixed',
                    value: 20,
                    isActive: true
                });
                couponId = c._id;
            });

            it('should get all coupons', async () => {
                const res = await request(app)
                    .get('/admin/coupon/get')
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                expect(Array.isArray(res.body)).toBeTruthy();
                expect(res.body.length).toBeGreaterThan(0);
            });
        });

        describe('GET /admin/coupon/getAvailable', () => {
            it('should get only active and non-expired coupons', async () => {
                await Coupon.create({ code: 'ACTIVE1', isActive: true, type: 'fixed', value: 10 });
                await Coupon.create({ code: 'INACTIVE1', isActive: false, type: 'fixed', value: 10 });

                const res = await request(app)
                    .get('/admin/coupon/getAvailable')
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                const codes = res.body.map(c => c.code);
                expect(codes).toContain('ACTIVE1');
                expect(codes).not.toContain('INACTIVE1');
            });
        });

        describe('GET /admin/coupon/get/:id', () => {
            beforeEach(async () => {
                const c = await Coupon.create({ code: 'GETBYID1', isActive: true, type: 'fixed', value: 10 });
                couponId = c._id;
            });

            it('should get a specific coupon by ID', async () => {
                const res = await request(app)
                    .get(`/admin/coupon/get/${couponId}`)
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                expect(res.body._id).toBe(couponId.toString());
                expect(res.body.code).toBe('GETBYID1');
            });
        });

        describe('GET /admin/coupon/getByUser/:id', () => {
            it('should get coupons assigned to a specific user', async () => {
                const c = await Coupon.create({ code: 'USERC1', isActive: true, type: 'fixed', value: 10 });
                await UserCoupon.create({ userId: user._id, couponId: c._id });

                const res = await request(app)
                    .get(`/admin/coupon/getByUser/${user._id}`)
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                expect(Array.isArray(res.body)).toBeTruthy();
                const userCouponCodes = res.body.map(uc => uc.couponId.code);
                expect(userCouponCodes).toContain('USERC1');
            });
        });

        describe('PUT /admin/coupon/update/:id', () => {
            beforeEach(async () => {
                const c = await Coupon.create({
                    code: 'UPDATE1',
                    type: 'fixed',
                    value: 10,
                    isActive: true
                });
                couponId = c._id;
            });

            it('should update a coupon', async () => {
                const res = await request(app)
                    .put(`/admin/coupon/update/${couponId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                        _id: couponId,
                        code: 'updatedcode', // should uppercase
                        value: 15
                    });

                expect(res.status).toBe(200);
                expect(res.body.code).toBe('UPDATEDCODE');
                expect(res.body.value).toBe(15);
            });
        });

        describe('PATCH /admin/coupon/toggle/:id', () => {
            beforeEach(async () => {
                const c = await Coupon.create({ code: 'TOGGLE1', isActive: true, type: 'fixed', value: 10 });
                couponId = c._id;
            });

            it('should toggle coupon status', async () => {
                const res = await request(app)
                    .patch(`/admin/coupon/toggle/${couponId}`)
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                expect(res.body.isActive).toBe(false);
            });
        });

        describe('POST /admin/coupon/assign', () => {
            beforeEach(async () => {
                const c = await Coupon.create({ code: 'ASSIGN1', isActive: true, type: 'fixed', value: 10 });
                couponId = c._id;
            });

            it('should assign a coupon to users', async () => {
                const res = await request(app)
                    .post('/admin/coupon/assign')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                        couponId: couponId,
                        userIds: [user._id]
                    });

                expect(res.status).toBe(201);
                expect(res.body.message).toBe('Coupons assigned');

                const uc = await UserCoupon.findOne({ userId: user._id, couponId: couponId });
                expect(uc).toBeTruthy();
            });
        });

        describe('DELETE /admin/coupon/delete/:id', () => {
            beforeEach(async () => {
                const c = await Coupon.create({ code: 'DELETE1', isActive: true, type: 'fixed', value: 10 });
                couponId = c._id;
            });

            it('should delete a coupon', async () => {
                const res = await request(app)
                    .delete(`/admin/coupon/delete/${couponId}`)
                    .set('Authorization', `Bearer ${adminToken}`);

                expect(res.status).toBe(200);
                
                const c = await Coupon.findById(couponId);
                expect(c).toBeNull();
            });
        });
    });

    describe('User Coupon Routes', () => {
        beforeEach(async () => {
            const c = await Coupon.create({ code: 'USERCOUPON', isActive: true, type: 'fixed', value: 10 });
            await UserCoupon.create({ userId: user._id, couponId: c._id });
        });

        describe('GET /user/coupon/get', () => {
            it('should get coupons assigned to the user', async () => {
                const res = await request(app)
                    .get('/user/coupon/get')
                    .set('Authorization', `Bearer ${userToken}`);

                expect(res.status).toBe(200);
                expect(Array.isArray(res.body)).toBeTruthy();
                expect(res.body.length).toBe(1);
                expect(res.body[0].couponId.code).toBe('USERCOUPON');
            });
        });
    });
});
