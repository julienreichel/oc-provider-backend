// Jest setup for Boston-style unit tests
// This file runs before each test file

import 'reflect-metadata';

// Global test configuration
jest.setTimeout(10000);

// Mock console methods in tests to avoid noise
global.console = {
  ...console,
  // Uncomment to ignore specific console methods during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
