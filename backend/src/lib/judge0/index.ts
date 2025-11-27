// src/lib/judge0/index.ts

export * from './judge0.types';
export * from './judge0.languages';
export { Judge0Client } from './judge0.client';
export { Judge0Service, judge0Service } from './judge0.service';

// Default export for backward compatibility
export { judge0Service as default } from './judge0.service';