import request from 'supertest';
import app from '../../src/app.js';
import Category from '../../src/models/Category.js';
import jwt from 'jsonwebtoken';

describe('Category API', () => {
    let adminToken;
    let userToken;

    beforeAll(() => {
        process.env.JWT_SECRET = 'testsecret';
        adminToken = jwt.sign({ id: 'admin123', isAdmin: true }, process.env.JWT_SECRET);
        userToken = jwt.sign({ id: 'user123', isAdmin: false }, process.env.JWT_SECRET);
    });

    describe('Public Routes', () => {
        beforeEach(async () => {
            await Category.create([
                { name: 'Active Category 1', status: true },
                { name: 'Inactive Category', status: false },
                { name: 'Active Category 2', status: true }
            ]);
        });

        it('GET /cat/all - should return all categories (active and inactive)', async () => {
            const res = await request(app).get('/cat/all');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBe(3);
        });

        it('GET /cat/ - should return only active categories with product counts', async () => {
            const res = await request(app).get('/cat/');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBe(2);
            expect(res.body[0]).toHaveProperty('productCount');
        });
    });

    describe('Admin Routes', () => {
        let existingCategory;

        beforeEach(async () => {
            existingCategory = await Category.create({ name: 'To Be Modified' });
        });

        describe('POST /admin/cat/add', () => {
            it('should create a new category when admin', async () => {
                const res = await request(app)
                    .post('/admin/cat/add')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ name: 'New Category' });

                expect(res.status).toBe(201);
                expect(res.body).toHaveProperty('name', 'New Category');
                
                const cat = await Category.findOne({ name: 'New Category' });
                expect(cat).toBeTruthy();
            });

            it('should return 403 when not admin', async () => {
                const res = await request(app)
                    .post('/admin/cat/add')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({ name: 'New Category' });

                expect(res.status).toBe(403);
            });
        });

        describe('POST /admin/cat/update', () => {
            it('should update an existing category', async () => {
                const res = await request(app)
                    .post('/admin/cat/update')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ id: existingCategory._id.toString(), name: 'Updated Name' });

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('message', 'Category updated');
                
                const cat = await Category.findById(existingCategory._id);
                expect(cat.name).toBe('Updated Name');
            });
        });

        describe('POST /admin/cat/delete', () => {
            it('should soft delete an existing category by setting status to false', async () => {
                const res = await request(app)
                    .post('/admin/cat/delete')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ id: existingCategory._id.toString() });

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('message', 'Category deleted');
                
                const cat = await Category.findById(existingCategory._id);
                expect(cat.status).toBe(false);
            });
        });
    });
});
