// test-exports.ts (in backend root)
import * as ModuleTypes from './src/module/instituteadmin/mock-drive/modules/modules.types';

console.log('All exports:', Object.keys(ModuleTypes));
console.log('Has ModuleResponse?', 'ModuleResponse' in ModuleTypes);