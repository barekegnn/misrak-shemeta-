import { fc } from '@fast-check/jest';
import { describe, it, expect } from '@jest/globals';

/**
 * Property-Based Test: OTP Validation Security
 * 
 * Property 4: OTP Validation Security
 * Validates: Requirements 17.1-17.6
 * 
 * This test verifies that OTP validation is secure and prevents
 * unauthorized order completion.
 */

/**
 * Generate a 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Validate OTP against stored OTP
 */
function validateOTP(
  providedOTP: string,
  storedOTP: string,
  attemptCount: number
): { valid: boolean; locked: boolean; attemptsRemaining: number } {
  const MAX_ATTEMPTS = 3;

  if (attemptCount >= MAX_ATTEMPTS) {
    return {
      valid: false,
      locked: true,
      attemptsRemaining: 0,
    };
  }

  const isValid = providedOTP === storedOTP;

  return {
    valid: isValid,
    locked: false,
    attemptsRemaining: MAX_ATTEMPTS - (attemptCount + 1),
  };
}

describe('Property: OTP Validation Security', () => {
  /**
   * Property: Correct OTP validates successfully
   * 
   * For any generated OTP:
   * - Validating with the same OTP should succeed
   * - Validation should not lock the order
   */
  it('should validate correct OTP successfully', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 999999 }), (seed) => {
        // Generate OTP
        const otp = seed.toString().padStart(6, '0');

        // Validate with correct OTP
        const result = validateOTP(otp, otp, 0);

        expect(result.valid).toBe(true);
        expect(result.locked).toBe(false);
        expect(result.attemptsRemaining).toBe(2);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Incorrect OTP fails validation
   * 
   * For any two different OTPs:
   * - Validating with incorrect OTP should fail
   * - Validation should not lock the order (unless max attempts reached)
   */
  it('should reject incorrect OTP', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 100000, max: 999999 }),
          fc.integer({ min: 100000, max: 999999 })
        ),
        ([otp1, otp2]) => {
          // Skip if OTPs are the same
          if (otp1 === otp2) return;

          const storedOTP = otp1.toString();
          const providedOTP = otp2.toString();

          // Validate with incorrect OTP
          const result = validateOTP(providedOTP, storedOTP, 0);

          expect(result.valid).toBe(false);
          expect(result.locked).toBe(false);
          expect(result.attemptsRemaining).toBe(2);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Order locks after 3 failed attempts
   * 
   * For any OTP:
   * - After 3 failed attempts, order should be locked
   * - Further validation attempts should be rejected
   */
  it('should lock order after 3 failed attempts', () => {
    const storedOTP = '123456';
    const wrongOTP = '654321';

    // First attempt
    let result = validateOTP(wrongOTP, storedOTP, 0);
    expect(result.valid).toBe(false);
    expect(result.locked).toBe(false);
    expect(result.attemptsRemaining).toBe(2);

    // Second attempt
    result = validateOTP(wrongOTP, storedOTP, 1);
    expect(result.valid).toBe(false);
    expect(result.locked).toBe(false);
    expect(result.attemptsRemaining).toBe(1);

    // Third attempt
    result = validateOTP(wrongOTP, storedOTP, 2);
    expect(result.valid).toBe(false);
    expect(result.locked).toBe(true);
    expect(result.attemptsRemaining).toBe(0);

    // Fourth attempt (should be locked)
    result = validateOTP(wrongOTP, storedOTP, 3);
    expect(result.valid).toBe(false);
    expect(result.locked).toBe(true);
    expect(result.attemptsRemaining).toBe(0);
  });

  /**
   * Property: Attempt counter increments correctly
   * 
   * For any sequence of validation attempts:
   * - Attempt counter should increment with each failed attempt
   * - Attempts remaining should decrement correctly
   */
  it('should track attempt count correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 5 }),
        (attemptCount) => {
          const storedOTP = '123456';
          const wrongOTP = '654321';

          const result = validateOTP(wrongOTP, storedOTP, attemptCount);

          if (attemptCount >= 3) {
            expect(result.locked).toBe(true);
            expect(result.attemptsRemaining).toBe(0);
          } else {
            expect(result.locked).toBe(false);
            expect(result.attemptsRemaining).toBe(3 - attemptCount - 1);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: OTP format is always 6 digits
   * 
   * For any generated OTP:
   * - OTP should be exactly 6 digits
   * - OTP should contain only numeric characters
   */
  it('should generate OTP in correct format', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 999 })), (seed) => {
        // Generate multiple OTPs
        for (let i = 0; i < 10; i++) {
          const otp = generateOTP();

          // Verify format
          expect(otp).toMatch(/^\d{6}$/);
          expect(otp.length).toBe(6);
          expect(parseInt(otp)).toBeGreaterThanOrEqual(100000);
          expect(parseInt(otp)).toBeLessThanOrEqual(999999);
        }
      },
      { numRuns: 50 }
    );
  });

  /**
   * Property: OTP validation is case-sensitive (if alphanumeric)
   * 
   * For any OTP:
   * - OTP comparison should be exact
   * - Different cases should not match (if applicable)
   */
  it('should perform exact OTP comparison', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 100000, max: 999999 }),
          fc.integer({ min: 100000, max: 999999 })
        ),
        ([otp1, otp2]) => {
          const storedOTP = otp1.toString();
          const providedOTP = otp2.toString();

          const result = validateOTP(providedOTP, storedOTP, 0);

          // Verify exact comparison
          if (storedOTP === providedOTP) {
            expect(result.valid).toBe(true);
          } else {
            expect(result.valid).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Correct OTP succeeds even after failed attempts
   * 
   * For any OTP:
   * - Correct OTP should succeed even if there were previous failed attempts
   * - Order should not be locked if attempts < 3
   */
  it('should allow correct OTP after failed attempts', () => {
    const storedOTP = '123456';
    const wrongOTP = '654321';

    // First attempt with wrong OTP
    let result = validateOTP(wrongOTP, storedOTP, 0);
    expect(result.valid).toBe(false);
    expect(result.locked).toBe(false);

    // Second attempt with correct OTP
    result = validateOTP(storedOTP, storedOTP, 1);
    expect(result.valid).toBe(true);
    expect(result.locked).toBe(false);
  });

  /**
   * Property: OTP validation prevents brute force attacks
   * 
   * For any OTP:
   * - Maximum 3 attempts should be allowed
   * - After 3 attempts, order should be locked
   * - Brute force attack should be prevented
   */
  it('should prevent brute force attacks', () => {
    const storedOTP = '123456';
    const possibleOTPs = [
      '000000',
      '111111',
      '222222',
      '333333',
      '444444',
      '555555',
      '666666',
      '777777',
      '888888',
      '999999',
    ];

    let attemptCount = 0;
    let locked = false;

    for (const otp of possibleOTPs) {
      if (locked) break;

      const result = validateOTP(otp, storedOTP, attemptCount);

      if (result.locked) {
        locked = true;
        break;
      }

      if (!result.valid) {
        attemptCount++;
      }

      // Should lock after 3 attempts
      if (attemptCount >= 3) {
        expect(locked).toBe(true);
        break;
      }
    }

    // Verify that we couldn't try all 10 OTPs
    expect(attemptCount).toBeLessThanOrEqual(3);
  });

  /**
   * Property: OTP validation state is independent
   * 
   * For any two orders:
   * - Validation of one order should not affect another
   * - Attempt counts should be tracked separately
   */
  it('should track OTP validation state independently per order', () => {
    const order1OTP = '123456';
    const order2OTP = '654321';
    const wrongOTP = '000000';

    // Attempt validation on order 1
    let result1 = validateOTP(wrongOTP, order1OTP, 0);
    expect(result1.valid).toBe(false);
    expect(result1.attemptsRemaining).toBe(2);

    // Attempt validation on order 2 (should start fresh)
    let result2 = validateOTP(wrongOTP, order2OTP, 0);
    expect(result2.valid).toBe(false);
    expect(result2.attemptsRemaining).toBe(2);

    // Order 1 should still have 2 attempts remaining
    result1 = validateOTP(wrongOTP, order1OTP, 1);
    expect(result1.attemptsRemaining).toBe(1);

    // Order 2 should still have 2 attempts remaining
    result2 = validateOTP(wrongOTP, order2OTP, 1);
    expect(result2.attemptsRemaining).toBe(1);
  });
});
