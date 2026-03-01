import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3001/api/auth/callback';
const JWT_SECRET = process.env.SESSION_SECRET || 'flowtune_super_secret';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const SCOPES = 'user-library-read playlist-modify-public playlist-modify-private user-read-private user-read-email';

export const login = (req: Request, res: Response) => {
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${SPOTIFY_CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&show_dialog=true`;
    res.redirect(authUrl);
};

export const callback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const code = req.query.code || null;
        if (!code) {
            return res.redirect(`${CLIENT_URL}?error=no_code`);
        }

        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            data: new URLSearchParams({
                code: typeof code === 'string' ? code : '',
                redirect_uri: SPOTIFY_REDIRECT_URI,
                grant_type: 'authorization_code',
            }).toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
            },
        };

        const response = await axios.post(authOptions.url, authOptions.data, { headers: authOptions.headers });
        const { access_token, refresh_token, expires_in } = response.data;

        // Fetch user profile from Spotify
        const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${access_token}` },
        });
        const spotifyId = profileResponse.data.id;

        // Upsert user in db
        const expiryDate = new Date();
        expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);

        const user = await prisma.user.upsert({
            where: { spotifyId },
            update: {
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenExpiry: expiryDate,
            },
            create: {
                spotifyId,
                accessToken: access_token,
                refreshToken: refresh_token,
                tokenExpiry: expiryDate,
            },
        });

        // Generate JWT for session
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        // Set cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Use 'lax' for local dev
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.redirect(`${CLIENT_URL}/dashboard`); // assuming client routes based on dashboard eventually, or root
    } catch (error) {
        next(error);
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.status(200).json({ success: true, message: 'Logged out' });
};

// Also endpoint to fetch current user session 
export const me = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Assuming requireAuth middleware has run
        const userId = (req as any).userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ id: user.id, spotifyId: user.spotifyId });
    } catch (error) {
        next(error);
    }
};
