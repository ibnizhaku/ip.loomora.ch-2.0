/**
 * JWT Token Payload für Multi-Tenant Auth
 */
export interface JwtPayload {
  /** User ID (subject) */
  sub: string;
  
  /** User Email */
  email: string;
  
  /** Active Company ID (kann null sein wenn Company-Auswahl erforderlich) */
  activeCompanyId: string | null;
  
  /** Role ID in der aktiven Company */
  roleId: string | null;
  
  /** Permissions Array (für schnellen Zugriff) */
  permissions: string[];
  
  /** Ist User Owner der aktiven Company */
  isOwner: boolean;
  
  /** Token issued at */
  iat?: number;
  
  /** Token expiration */
  exp?: number;
}

/**
 * Temporary Token Payload (für Company-Auswahl oder Payment-Flow)
 */
export interface TempJwtPayload {
  /** User ID (subject) */
  sub: string;
  
  /** User Email */
  email: string;
  
  /** Token type */
  type: 'company_selection' | 'payment_pending' | 'two_factor_pending';

  /** Active Company ID (für 2FA nach Company-Auswahl) */
  activeCompanyId?: string | null;
  
  /** Token issued at */
  iat?: number;
  
  /** Token expiration */
  exp?: number;
}

/**
 * Refresh Token Payload
 */
export interface RefreshTokenPayload {
  /** User ID (subject) */
  sub: string;
  
  /** Token ID für Revocation */
  jti: string;
  
  /** Token type */
  type: 'refresh';
  
  /** Token issued at */
  iat?: number;
  
  /** Token expiration */
  exp?: number;
}
