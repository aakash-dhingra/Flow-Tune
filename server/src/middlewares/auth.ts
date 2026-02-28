import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import axios from 'axios';

const JWT_SECRET = process.env.SESSION_SECRET || 'flowtune_super_secret';
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Check if Spotify token is expired, if so, refresh it
        if (new Date() >= user.tokenExpiry) {
            try {
                const response = await axios.post(
                    'https://accounts.spotify.com/api/token',
                    {
                        grant_type: 'refresh_token',
                        refresh_token: user.refreshToken,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                        },
                    }
                );

                const { access_token, expires_in, refresh_token } = response.data;

                const expiryDate = new Date();
                expiryDate.setSeconds(expiryDate.getSeconds() + expires_in);

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        accessToken: access_token,
                        // Spotify might not return a new refresh token every time
                        refreshToken: refresh_token || user.refreshToken,
                        tokenExpiry: expiryDate,
                    },
                });

            } catch (err: any) {
                console.error('Failed to refresh Spotify token', err.message);
                return res.status(401).json({ error: 'Spotify token expired and refresh failed' });
            }
        }

        // Attach userId to request
        (req as any).userId = user.id;
        next();
    } catch (error) {
        console.error('Auth error', error);
        return res.status(401).json({ error: 'Invalid or expired session' });
    }
};
