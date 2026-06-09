import request from 'supertest';
import app from '../../src/app.js';
import Product from '../../src/models/Product.js';
import Category from '../../src/models/Category.js';
import jwt from 'jsonwebtoken';

describe('Product API', () => {
    let adminToken;
    let userToken;
    let testCategory;

    beforeAll(async () => {
        process.env.JWT_SECRET = 'testsecret';
        adminToken = jwt.sign({ id: 'admin123', isAdmin: true }, process.env.JWT_SECRET);
        userToken = jwt.sign({ id: 'user123', isAdmin: false }, process.env.JWT_SECRET);
    });

    beforeEach(async () => {
        testCategory = await Category.create({ name: 'Test Category' });
    });

    describe('Public Routes - GET /product/', () => {
        beforeEach(async () => {
            await Product.create([
                { name: 'Active Product 1', price: 100, category: testCategory._id, status: true },
                { name: 'Inactive Product', price: 150, category: testCategory._id, status: false },
                { name: 'Active Product 2', price: 200, category: testCategory._id, status: true }
            ]);
        });

        it('should return only active products', async () => {
            const res = await request(app).get('/product/');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBeTruthy();
            expect(res.body.length).toBe(2);
            expect(res.body[0]).toHaveProperty('category'); // should be populated
            expect(res.body[0].category).toHaveProperty('name', 'Test Category');
        });
    });

    describe('Admin Routes', () => {
        let existingProduct;

        beforeEach(async () => {
            existingProduct = await Product.create({
                name: 'To Be Modified',
                price: 10,
                desc: 'Old desc',
                category: testCategory._id
            });
        });

        describe('POST /admin/product/add', () => {
            it('should create a new product without image when admin', async () => {
                const res = await request(app)
                    .post('/admin/product/add')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                        name: 'New Product',
                        price: 50,
                        desc: 'A new product description',
                        category: testCategory._id.toString()
                    });

                expect(res.status).toBe(201);
                expect(res.body).toHaveProperty('name', 'New Product');
                expect(res.body).toHaveProperty('price', 50);

                const prod = await Product.findOne({ name: 'New Product' });
                expect(prod).toBeTruthy();
            });

            it('should create a new category if category id is not valid ObjectId', async () => {
                const res = await request(app)
                    .post('/admin/product/add')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                        name: 'Product with New Cat',
                        price: 60,
                        category: 'Completely New Category Name'
                    });

                expect(res.status).toBe(201);
                const newCat = await Category.findOne({ name: 'Completely New Category Name' });
                expect(newCat).toBeTruthy();
                expect(res.body.category.toString()).toBe(newCat._id.toString());
            });

            it('should return 403 when not admin', async () => {
                const res = await request(app)
                    .post('/admin/product/add')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send({ name: 'New Product', price: 50, category: testCategory._id.toString() });

                expect(res.status).toBe(403);
            });
        });

        describe('PUT /admin/product/update', () => {
            it('should update an existing product', async () => {
                const res = await request(app)
                    .put('/admin/product/update')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({
                        id: existingProduct._id.toString(),
                        name: 'Updated Product Name',
                        price: 20,
                        category: testCategory._id.toString()
                    });

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('name', 'Updated Product Name');
                expect(res.body).toHaveProperty('price', 20);

                const prod = await Product.findById(existingProduct._id);
                expect(prod.name).toBe('Updated Product Name');
                expect(prod.price).toBe(20);
            });
        });

        describe('DELETE /admin/product/delete', () => {
            // Note: Router uses .delete("/delete") but controller expects `id` in req.body
            // Supertest can send body in delete request
            it('should soft delete an existing product', async () => {
                const res = await request(app)
                    .delete('/admin/product/delete')
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send({ id: existingProduct._id.toString() });

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('message', 'Product deleted successfully');

                const prod = await Product.findById(existingProduct._id);
                expect(prod.status).toBe(false);
            });
        });
    });
});
