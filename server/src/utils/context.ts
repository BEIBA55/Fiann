import { Request } from 'express';
import { verifyToken, getTokenFromRequest, JWTPayload } from './auth';
import { AppError, ErrorCode } from './errors';

export interface Context {
  req: Request;
  userId?: string;
  userRole?: string;
  isAuthenticated: boolean;
}

export const createContext = async ({ req }: { req: Request }): Promise<Context> => {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    return {
      req,
      isAuthenticated: false,
    };
  }

  try {
    const payload = verifyToken(token);
    return {
      req,
      userId: payload.userId,
      userRole: payload.role,
      isAuthenticated: true,
    };
  } catch {
    return {
      req,
      isAuthenticated: false,
    };
  }
};

export const requireAuth = (context: Context): void => {
  if (!context.isAuthenticated || !context.userId) {
    throw new AppError('Authentication required', ErrorCode.UNAUTHENTICATED, 401);
  }
};

export const requireRole = (context: Context, roles: string[]): void => {
  requireAuth(context);
  if (!context.userRole || !roles.includes(context.userRole)) {
    throw new AppError('Insufficient permissions', ErrorCode.UNAUTHORIZED, 403);
  }
};

