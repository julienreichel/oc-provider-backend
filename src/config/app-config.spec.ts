import { AppConfig } from './app-config';

describe('AppConfig', () => {
  describe('when NODE_ENV is production', () => {
    let originalEnv: string | undefined;
    let originalClient: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
      originalClient = process.env.CLIENT_BASE_URL;
      process.env.NODE_ENV = 'production';
      process.env.CLIENT_BASE_URL = 'https://client.example.com';
    });

    afterEach(() => {
      if (originalEnv !== undefined) {
        process.env.NODE_ENV = originalEnv;
      } else {
        delete process.env.NODE_ENV;
      }
      if (originalClient !== undefined) {
        process.env.CLIENT_BASE_URL = originalClient;
      } else {
        delete process.env.CLIENT_BASE_URL;
      }
    });

    it('should require DATABASE_URL in production', () => {
      // Given
      delete process.env.DATABASE_URL;
      process.env.CLIENT_BASE_URL = 'https://client.example.com';
      const config = new AppConfig();

      // When
      const result = config.validate();

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'DATABASE_URL is required in production environment',
      );
    });

    it('should require CLIENT_BASE_URL in production', () => {
      delete process.env.CLIENT_BASE_URL;
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5433/db';
      const config = new AppConfig();

      const result = config.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'CLIENT_BASE_URL is required in production environment',
      );
    });

    it('should pass validation with valid DATABASE_URL and CLIENT_BASE_URL', () => {
      // Given
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5433/db';
      process.env.CLIENT_BASE_URL = 'https://client.example.com';
      const config = new AppConfig();

      // When
      const result = config.validate();

      // Then
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(config.hasDatabase()).toBe(true);
      expect(config.isProduction()).toBe(true);
      expect(config.hasClientBaseUrl()).toBe(true);
    });

    it('should reject invalid DATABASE_URL format', () => {
      // Given
      process.env.DATABASE_URL = 'invalid-url';
      process.env.CLIENT_BASE_URL = 'https://client.example.com';
      const config = new AppConfig();

      // When
      const result = config.validate();

      // Then
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'DATABASE_URL must be a valid PostgreSQL connection string',
      );
    });

    it('should reject invalid CLIENT_BASE_URL format', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5433/db';
      process.env.CLIENT_BASE_URL = 'ftp://invalid';
      const config = new AppConfig();

      const result = config.validate();

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'CLIENT_BASE_URL must be a valid HTTP(S) url',
      );
    });
  });

  describe('when NODE_ENV is development', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      delete process.env.CLIENT_BASE_URL;
    });

    afterEach(() => {
      if (originalEnv !== undefined) {
        process.env.NODE_ENV = originalEnv;
      } else {
        delete process.env.NODE_ENV;
      }
      delete process.env.CLIENT_BASE_URL;
    });

    it('should allow missing DATABASE_URL in development', () => {
      // Given
      delete process.env.DATABASE_URL;
      const config = new AppConfig();

      // When
      const result = config.validate();

      // Then
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(config.hasDatabase()).toBe(false);
      expect(config.isDevelopment()).toBe(true);
    });

    it('should pass with valid DATABASE_URL when provided', () => {
      // Given
      process.env.DATABASE_URL = 'postgres://app:pass@localhost:5433/db';
      const config = new AppConfig();

      // When
      const result = config.validate();

      // Then
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(config.hasDatabase()).toBe(true);
    });
  });

  describe('when NODE_ENV is test', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';
      delete process.env.CLIENT_BASE_URL;
    });

    afterEach(() => {
      if (originalEnv !== undefined) {
        process.env.NODE_ENV = originalEnv;
      } else {
        delete process.env.NODE_ENV;
      }
      delete process.env.CLIENT_BASE_URL;
    });

    it('should allow missing DATABASE_URL in test environment', () => {
      // Given
      delete process.env.DATABASE_URL;
      const config = new AppConfig();

      // When
      const result = config.validate();

      // Then
      expect(result.isValid).toBe(true);
      expect(config.isDevelopment()).toBe(true);
      expect(config.hasDatabase()).toBe(false);
    });
  });

  describe('default values', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
      delete process.env.NODE_ENV;
      delete process.env.PORT;
      delete process.env.DATABASE_URL;
      delete process.env.CLIENT_BASE_URL;
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should use default values when environment variables are not set', () => {
      // Given / When
      const config = new AppConfig();

      // Then
      expect(config.NODE_ENV).toBe('development');
      expect(config.PORT).toBe('3001');
      expect(config.DATABASE_URL).toBeUndefined();
      expect(config.CLIENT_BASE_URL).toBeUndefined();
      expect(config.isDevelopment()).toBe(true);
      expect(config.isProduction()).toBe(false);
    });
  });
});
