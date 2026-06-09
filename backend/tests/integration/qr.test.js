import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import QRToken from '../../src/models/QRToken.js';
import jwt from 'jsonwebtoken';

describe('QR API', () => {
    let userToken;
    let normalUser;

    beforeAll(() => {
        process.env.JWT_SECRET = 'testsecret';
    });

    beforeEach(async () => {
        normalUser = await User.create({
            username: 'qruser',
            email: 'qruser@example.com',
            password: 'hashedpassword',
            role: 'user',
            phone: '2222'
        });

        userToken = jwt.sign({ id: normalUser._id, isAdmin: false }, process.env.JWT_SECRET);
    });

    describe('GET /qr/', () => {
        it('should generate a QR token for the user if none exists', async () => {
            const res = await request(app)
                .get('/qr/')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('qr');
            expect(res.body).toHaveProperty('token');

            const tokenInDb = await QRToken.findOne({ userId: normalUser._id });
            expect(tokenInDb).toBeTruthy();
            expect(tokenInDb.token).toBe(res.body.token);
        });

        it('should return the existing QR token if it already exists', async () => {
            await QRToken.create({ userId: normalUser._id, token: 'existing-token-123' });

            const res = await request(app)
                .get('/qr/')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.token).toBe('existing-token-123');
        });

        it('should return 401 if unauthorized', async () => {
            const res = await request(app).get('/qr/');
            expect(res.status).toBe(401);
        });
    });

    describe('GET /qr/verify', () => {
        it('should verify a valid token and return the user', async () => {
            await QRToken.create({ userId: normalUser._id, token: 'valid-token-123' });

            const res = await request(app)
                .get('/qr/verify?token=valid-token-123');

            expect(res.status).toBe(200);
            expect(res.body.user).toHaveProperty('_id', normalUser._id.toString());
            expect(res.body.user).toHaveProperty('username', 'qruser');
            expect(res.body.user).not.toHaveProperty('password'); // Password should be excluded
        });

        it('should return 404 for an invalid token', async () => {
            const res = await request(app)
                .get('/qr/verify?token=invalid-token-123');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Invalid QR');
        });
    });
});
