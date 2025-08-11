// Global type definitions for JIMS System

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    SMTP_HOST?: string;
    SMTP_PORT?: string;
    SMTP_USER?: string;
    SMTP_PASS?: string;
    FROM_EMAIL?: string;
    FROM_NAME?: string;
    TWILIO_ACCOUNT_SID?: string;
    TWILIO_AUTH_TOKEN?: string;
    TWILIO_PHONE_NUMBER?: string;
    MAX_FILE_SIZE?: string;
    ALLOWED_FILE_TYPES?: string;
    UPLOAD_PATH?: string;
    MFA_ISSUER?: string;
    MFA_TOKEN_EXPIRY?: string;
  }
}
