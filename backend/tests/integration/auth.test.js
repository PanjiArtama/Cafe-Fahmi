import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import bcrypt from 'bcrypt';

describe('Auth API', () => {
    
    // Set JWT_SECRET for tests
    beforeAll(() => {
        process.env.JWT_SECRET = 'testsecret';
    });

    describe('POST /auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@example.com',
                    password: 'password123',
                    phone: '1234567890'
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('message', 'User created successfully');

            const userInDb = await User.findOne({ email: 'test@example.com' });
            expect(userInDb).toBeTruthy();
            expect(userInDb.username).toBe('testuser');
        });

        it('should return 400 if user already exists', async () => {
            // Create user first
            await User.create({
                username: 'existinguser',
                email: 'existing@example.com',
                password: 'password123',
                phone: '1234567890'
            });

            const res = await request(app)
                .post('/auth/register')
                .send({
                    username: 'newuser',
                    email: 'existing@example.com',
                    password: 'password123',
                    phone: '0987654321'
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('message', 'User already exists');
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                username: 'loginuser',
                email: 'login@example.com',
                password: hashedPassword,
                phone: '1234567890'
            });
        });

        it('should login successfully with correct credentials', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', 'login@example.com');
        });

        it('should return 401 for invalid email', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'wrong@example.com',
                    password: 'password123'
                });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Invalid User');
        });

        it('should return 401 for invalid password', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Invalid Password');
        });
    });

    describe('POST /auth/login-admin', () => {
        beforeEach(async () => {
            const hashedPassword = await bcrypt.hash('adminpass', 10);
            await User.create({
                username: 'adminuser',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
                phone: '1111111111'
            });
        });

        it('should login admin successfully', async () => {
            const res = await request(app)
                .post('/auth/login-admin')
                .send({
                    username: 'adminuser',
                    password: 'adminpass'
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should return 401 if not an admin', async () => {
            const hashedPassword = await bcrypt.hash('userpass', 10);
            await User.create({
                username: 'normaluser',
                email: 'normal@example.com',
                password: hashedPassword,
                role: 'user', // default is usually user
                phone: '2222222222'
            });

            const res = await request(app)
                .post('/auth/login-admin')
                .send({
                    username: 'normaluser',
                    password: 'userpass'
                });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Invalid User');
        });
    });
});
