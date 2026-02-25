/**
 * OTP Generation and Validation Utilities
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6
 */

/**
 * Generate a 6-digit random OTP
 * Requirement: 7.6
 */
export function generateOTP(): string {
  // Generate random 6-digit number (100000 to 999999)
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

/**
 * Validate OTP format (6 digits)
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}
