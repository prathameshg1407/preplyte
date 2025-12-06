"use strict";
// src/modules/instituteadmin/mock-drive/registration/registration.types.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationAlreadyExistsError = exports.RegistrationStatusError = exports.RegistrationNotFoundError = exports.RegistrationError = void 0;
// ============================================
// Error Classes
// ============================================
class RegistrationError extends Error {
    code;
    statusCode;
    constructor(code, message, statusCode = 400) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'RegistrationError';
    }
}
exports.RegistrationError = RegistrationError;
class RegistrationNotFoundError extends RegistrationError {
    constructor(registrationId) {
        super('REGISTRATION_NOT_FOUND', `Registration not found: ${registrationId}`, 404);
    }
}
exports.RegistrationNotFoundError = RegistrationNotFoundError;
class RegistrationStatusError extends RegistrationError {
    constructor(status, action) {
        super('REGISTRATION_INVALID_STATUS', `Cannot ${action} registration with status: ${status}`, 400);
    }
}
exports.RegistrationStatusError = RegistrationStatusError;
class RegistrationAlreadyExistsError extends RegistrationError {
    constructor() {
        super('REGISTRATION_ALREADY_EXISTS', 'User is already registered for this mock drive', 409);
    }
}
exports.RegistrationAlreadyExistsError = RegistrationAlreadyExistsError;
//# sourceMappingURL=registration.types.js.map