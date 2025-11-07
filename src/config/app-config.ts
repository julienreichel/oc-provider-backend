export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
}

export class AppConfig {
  readonly DATABASE_URL?: string;
  readonly NODE_ENV: string;
  readonly PORT: string;
  readonly CLIENT_BASE_URL?: string;

  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL;
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.PORT = process.env.PORT || '3001';
    this.CLIENT_BASE_URL = process.env.CLIENT_BASE_URL;
  }

  /**
   * Validates configuration based on environment profile
   * In production, DATABASE_URL is required
   * In development/test, DATABASE_URL is optional for unit-only runs
   */
  validate(): ConfigValidationResult {
    const errors: string[] = [];

    // Production requires DATABASE_URL
    if (this.isProduction() && !this.DATABASE_URL) {
      errors.push('DATABASE_URL is required in production environment');
    }

    // Validate DATABASE_URL format if provided
    if (this.DATABASE_URL && !this.isValidDatabaseUrl(this.DATABASE_URL)) {
      errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
    }

    if (this.isProduction() && !this.CLIENT_BASE_URL) {
      errors.push('CLIENT_BASE_URL is required in production environment');
    }

    if (this.CLIENT_BASE_URL && !this.isValidHttpUrl(this.CLIENT_BASE_URL)) {
      errors.push('CLIENT_BASE_URL must be a valid HTTP(S) url');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }

  isDevelopment(): boolean {
    return this.NODE_ENV === 'development' || this.NODE_ENV === 'test';
  }

  hasDatabase(): boolean {
    return !!this.DATABASE_URL;
  }

  hasClientBaseUrl(): boolean {
    return !!this.CLIENT_BASE_URL;
  }

  private isValidDatabaseUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return (
        parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:'
      );
    } catch {
      return false;
    }
  }

  private isValidHttpUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
