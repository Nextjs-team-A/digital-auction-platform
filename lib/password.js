// lib/password.js
import bcrypt from 'bcrypt';

const saltRounds = 10;

/**
 * Hashes a plain text password.
 * @param {string} password - The plain text password.
 * @returns {Promise<string>} The hashed password string.
 */
export async function hashPassword(password) {
    // NOTE: The 'export' keyword here is CRUCIAL.
    return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain text password with a hashed password.
 * @param {string} password - The plain text password entered by the user.
 * @param {string} hash - The stored hashed password from the database.
 * @returns {Promise<boolean>} True if the passwords match, false otherwise.
 */
export async function comparePassword(password, hash) {
    // NOTE: The 'export' keyword here is CRUCIAL.
    return bcrypt.compare(password, hash);
}