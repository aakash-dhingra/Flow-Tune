"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const axios_1 = __importDefault(require("axios"));
const JWT_SECRET = process.env.SESSION_SECRET || 'flowtune_super_secret';
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const requireAuth = async (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        // Check if Spotify token is expired, if so, refresh it
        if (new Date() >= user.tokenExpiry) {
            try {
                const response = await axios_1.default.post('https://accounts.spotify.com/api/token', {
                    grant_type: 'refresh_token',
                    refresh_token: user.refreshToken,
                }, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                    },
                });
                const { access_token, expires_in, refresh_token } = response.data;
                const expiryDate = new Date();
                expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);
                await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        accessToken: access_token,
                        // Spotify might not return a new refresh token every time
                        refreshToken: refresh_token || user.refreshToken,
                        tokenExpiry: expiryDate,
                    },
                });
            }
            catch (err) {
                console.error('Failed to refresh Spotify token', err.message);
                return res.status(401).json({ error: 'Spotify token expired and refresh failed' });
            }
        }
        // Attach userId to request
        req.userId = user.id;
        next();
    }
    catch (error) {
        console.error('Auth error', error);
        return res.status(401).json({ error: 'Invalid or expired session' });
    }
};
exports.requireAuth = requireAuth;
