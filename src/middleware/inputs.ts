import { checkValidationErrors, emailValidator, passwordValidator, usernameValidator } from '../lib/inputs';

/**
 * Sanitize Authentication input data
 */

export const registerInputValidation = [
    // Sanitize and validate user registration data
    usernameValidator(),
    emailValidator(),
    passwordValidator(),
    checkValidationErrors(),
];

export const loginInputValidation = [
    // Sanitize and validate user login data
    emailValidator(),
    passwordValidator(),
    checkValidationErrors(),
];
