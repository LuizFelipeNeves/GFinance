import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gfinance-secret-key';

export interface JwtPayload {
    userId: string;
    email: string;
}

export const jwtService = {
    sign(payload: JwtPayload): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    },

    verify(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, JWT_SECRET) as JwtPayload;
        } catch {
            return null;
        }
    }
};
