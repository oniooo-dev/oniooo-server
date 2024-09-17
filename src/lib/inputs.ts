import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

/**
 * Validates the username field in a request.
 *
 * This validator ensures that the username field:
 * - Is a string that has been trimmed of leading and trailing whitespace.
 * - Has a length of at least 3 characters and at most 15 characters.
 * - Contains only letters (both uppercase and lowercase), numbers, underscores, and hyphens.
 * - Does not contain any other special characters or whitespace.
 *
 * If the username does not meet these criteria, appropriate error messages are returned.
 *
 * @returns {ValidationChain} A validation chain that can be used in Express routes to validate the username field.
 */
export const usernameValidator = () =>
    body('username')
        .trim()
        .isLength({ min: 3, max: 15 })
        .withMessage('Username must be at least 3 characters long and at most 15 characters')
        .matches(/^[a-zA-Z0-9_-]{3,20}$/)
        .withMessage('No weird chracters bro. Only letters, numbers, underscores, and hyphens are allowed.')
        .escape();

/**
 * Validates the email field in a request.
 *
 * This validator ensures that the email field:
 * - Is a properly formatted email address.
 * - Is trimmed of leading and trailing whitespace.
 * - Is normalized to lowercase (except for domain names, which are case-insensitive).
 *
 * The normalization process includes:
 * - Converting the entire email address to lowercase, except for the domain part.
 * - Not modifying dots in the local part of the Gmail addresses, as Gmail is dot-insensitive.
 *
 * If the email does not meet these criteria, an 'Invalid email' error message is returned.
 *
 * @returns {ValidationChain} A validation chain that can be used in Express routes to validate the email field.
 */
export const emailValidator = () =>
    body('email').trim().isEmail().withMessage('Invalid email').normalizeEmail({
        all_lowercase: true,
        gmail_remove_dots: false,
    });

/**
 * Validates the password field in a request.
 *
 * This validator ensures that the password field:
 * - Is a string that has been trimmed of leading and trailing whitespace.
 * - Has a minimum length of 8 characters.
 * - Contains at least one lowercase letter, one uppercase letter, one number, and one special character from the set (!@#$%^&*).
 *
 * If the password does not meet these criteria, an error message detailing the requirements is returned.
 *
 * @returns {ValidationChain} A validation chain that can be used in Express routes to validate the password field.
 */
export const passwordValidator = () =>
    body('password')
        .trim()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
        .withMessage('Password must include at least one lowercase letter, one uppercase letter, one number, and one special character')
        .escape();

/**
 * Checks if there are any validation errors in the request.
*/
export const checkValidationErrors = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Should only print one message at a time
            return res.status(422).json({ message: errors.array()[0].msg });
        }
        next();
    };
};