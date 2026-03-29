/// <reference types="jest" />

process.env.NODE_ENV = 'test';

afterEach(() => {
  jest.clearAllMocks();
});
