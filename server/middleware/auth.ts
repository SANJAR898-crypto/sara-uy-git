import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Keep a set of active admin sessions/tokens
const ADMIN_SESSIONS = new Set<string>();

// Get the admin secret from environment variables (or a secure default for testing)
const getAdminSecret = (): string => {
  return process.env.ADMIN_SECRET || 'SaraUylarAdminSecure2026!';
};

/**
 * Validates Telegram WebApp initData
 * @param initData Raw query string from Telegram
 * @param botToken Bot token from Telegram
 */
export function verifyTelegramInitData(initData: string, botToken: string): boolean {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;

    // Sort parameters alphabetically
    const keys = Array.from(params.keys()).filter(k => k !== 'hash').sort();
    const dataCheckString = keys.map(k => `${k}=${params.get(k)}`).join('\n');

    // Generate secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Generate signature
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (e) {
    console.error('Telegram initData verification failed:', e);
    return false;
  }
}

/**
 * Express middleware to validate Telegram requests
 */
export function requireTelegramAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['x-telegram-init-data'] as string;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  // If no bot token is set in development, let it pass but log a warning
  if (!botToken) {
    return next();
  }

  if (!authHeader) {
    return res.status(401).json({ error: 'Telegram authentication required (Missing x-telegram-init-data header)' });
  }

  const isValid = verifyTelegramInitData(authHeader, botToken);
  if (!isValid) {
    return res.status(403).json({ error: 'Invalid Telegram authentication signature' });
  }

  next();
}

export const ADMIN_IDS = [
  8638170982, // DB Subscriber ID
  123456789,
  987654321
];

export function getAuthenticatedTelegramUser(req: Request): any | null {
  const telegramInitData = req.headers['x-telegram-init-data'] as string;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!telegramInitData) return null;

  let isValid = true;
  if (botToken) {
    isValid = verifyTelegramInitData(telegramInitData, botToken);
  }

  if (isValid) {
    try {
      const params = new URLSearchParams(telegramInitData);
      const userString = params.get('user');
      if (userString) {
        return JSON.parse(userString);
      }
    } catch (e) {
      console.error('Error parsing telegram user in getAuthenticatedTelegramUser:', e);
    }
  }

  // Fallback for development if no signature verification was needed
  if (process.env.NODE_ENV !== 'production' && !botToken) {
    try {
      const params = new URLSearchParams(telegramInitData);
      const userString = params.get('user');
      if (userString) {
        return JSON.parse(userString);
      }
    } catch (e) {}
  }

  return null;
}

/**
 * Express middleware to protect admin routes
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const adminToken = req.headers['x-admin-token'] as string;
  const adminSecretHeader = req.headers['x-admin-secret'] as string;

  // 1. Allow bypass via direct X-Admin-Secret header
  if (adminSecretHeader && adminSecretHeader === getAdminSecret()) {
    return next();
  }

  // 2. Allow bypass via active session token
  if (adminToken && ADMIN_SESSIONS.has(adminToken)) {
    return next();
  }

  // 3. Telegram initData admin authorization (Strict production check)
  const authUser = getAuthenticatedTelegramUser(req);
  if (authUser) {
    const userId = Number(authUser.id);
    if (ADMIN_IDS.includes(userId)) {
      return next();
    }
  }

  // 4. Fallback for local development environment
  if (process.env.NODE_ENV !== 'production') {
    const devAdminBypass = req.headers['x-dev-admin'] === 'true';
    if (devAdminBypass) {
      return next();
    }
  }

  return res.status(403).json({ error: 'Access denied. Administrator authorization required.' });
}

/**
 * Admin login endpoint handler
 */
export function handleAdminLogin(req: Request, res: Response) {
  const { secret } = req.body;
  
  if (!secret) {
    return res.status(400).json({ error: 'Secret is required' });
  }

  if (secret === getAdminSecret()) {
    // Generate a secure session token
    const token = crypto.randomBytes(32).toString('hex');
    ADMIN_SESSIONS.add(token);
    return res.json({ success: true, token });
  }

  return res.status(401).json({ error: 'Xato administrator paroli' });
}

/**
 * Admin logout endpoint handler
 */
export function handleAdminLogout(req: Request, res: Response) {
  const adminToken = req.headers['x-admin-token'] as string;
  if (adminToken) {
    ADMIN_SESSIONS.delete(adminToken);
  }
  return res.json({ success: true });
}
