import bcrypt from "bcrypt";


// Configuration parameters
const BCRYPT_ROUNDS = 10; 
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;

/**
 * Simplified password verification - only check length
 * @param {string} password - password to validate
 * @returns {Object} - validation result
 */
export function validatePasswordStrength(password) {
  const errors = [];

  // Check length
  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    errors.push(`Password must be no more than ${MAX_PASSWORD_LENGTH} characters long`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions: [],
    strength: "valid",
    score: 1
  };
}

/**
 * Hash a password
 * @param {string} password - orignal password
 * @returns {Promise<string>} - hashed password
 */
export async function hashPassword(password) {
  try {
    // Validate password strength
    const validation = validatePasswordStrength(password);
    if (!validation.isValid) {
      throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
    }

    // Generate salt and hash password
    const saltRounds = BCRYPT_ROUNDS;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    console.log(`Password hashed with ${saltRounds} rounds`);
    return hashedPassword;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password
 * @param {string} password - original password
 * @param {string} hashedPassword - hashed password
 * @returns {Promise<boolean>} - verification result
 */
export async function verifyPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate password hints
 * @param {string} password - password
 * @returns {Array} - hints array
 */
export function generatePasswordHints(password) {
  const hints = [];
  
  if (password.length < 8) {
    hints.push("Use at least 8 characters");
  }
  if (!/(?=.*[a-z])/.test(password)) {
    hints.push("Add lowercase letters");
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    hints.push("Add uppercase letters");
  }
  if (!/(?=.*\d)/.test(password)) {
    hints.push("Add numbers");
  }
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    hints.push("Add special characters");
  }
  
  return hints;
}
