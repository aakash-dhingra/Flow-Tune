import { NextFunction, Request, Response } from 'express';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('[Error]: ', err.message);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
};
