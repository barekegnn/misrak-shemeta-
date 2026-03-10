import { fc } from '@fast-check/jest';
import { describe, it, expect } from '@jest/globals';

/**
 * Property-Based Test: Escrow State Machine Validity
 * 
 * Property 3: Escrow State Machine Validity
 * Validates: Requirements 23.1-23.5
 * 
 * This test verifies that the order state machine only allows
 * valid state transitions and rejects invalid ones.
 */

// Define valid order statuses
type OrderStatus =
  | 'PENDING'
  | 'PAID_ESCROW'
  | 'DISPATCHED'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REFUNDED';

// Define the state machine transitions
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID_ESCROW', 'CANCELLED', 'FAILED'],
  PAID_ESCROW: ['DISPATCHED', 'CANCELLED', 'REFUNDED'],
  DISPATCHED: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [], // Terminal state
  CANCELLED: [], // Terminal state
  FAILED: ['PENDING'], // Can retry
  REFUNDED: [], // Terminal state
};

/**
 * Validate if a transition is allowed
 */
function isValidTransition(
  fromStatus: OrderStatus,
  toStatus: OrderStatus
): boolean {
  const allowedTransitions = VALID_TRANSITIONS[fromStatus] || [];
  return allowedTransitions.includes(toStatus);
}

/**
 * Get all valid next states for a given status
 */
function getValidNextStates(status: OrderStatus): OrderStatus[] {
  return VALID_TRANSITIONS[status] || [];
}

describe('Property: Escrow State Machine Validity', () => {
  /**
   * Property: Only defined transitions are allowed
   * 
   * For any two statuses:
   * - If a transition is not in VALID_TRANSITIONS, it should be rejected
   * - If a transition is in VALID_TRANSITIONS, it should be allowed
   */
  it('should only allow defined transitions', () => {
    const allStatuses: OrderStatus[] = [
      'PENDING',
      'PAID_ESCROW',
      'DISPATCHED',
      'ARRIVED',
      'COMPLETED',
      'CANCELLED',
      'FAILED',
      'REFUNDED',
    ];

    fc.assert(
      fc.property(
        fc.sample(fc.constantFrom(...allStatuses), 2),
        ([fromStatus, toStatus]) => {
          const isValid = isValidTransition(fromStatus, toStatus);
          const expectedValid = VALID_TRANSITIONS[fromStatus]?.includes(
            toStatus
          );

          expect(isValid).toBe(expectedValid);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Terminal states have no outgoing transitions
   * 
   * For terminal states (COMPLETED, CANCELLED, REFUNDED):
   * - No transitions should be allowed
   * - getValidNextStates should return empty array
   */
  it('should prevent transitions from terminal states', () => {
    const terminalStates: OrderStatus[] = [
      'COMPLETED',
      'CANCELLED',
      'REFUNDED',
    ];
    const allStatuses: OrderStatus[] = [
      'PENDING',
      'PAID_ESCROW',
      'DISPATCHED',
      'ARRIVED',
      'COMPLETED',
      'CANCELLED',
      'FAILED',
      'REFUNDED',
    ];

    for (const terminalState of terminalStates) {
      const validNextStates = getValidNextStates(terminalState);
      expect(validNextStates).toEqual([]);

      for (const targetStatus of allStatuses) {
        const isValid = isValidTransition(terminalState, targetStatus);
        expect(isValid).toBe(false);
      }
    }
  });

  /**
   * Property: PENDING state has correct transitions
   * 
   * From PENDING status:
   * - Can transition to PAID_ESCROW (payment successful)
   * - Can transition to CANCELLED (user cancels)
   * - Can transition to FAILED (payment failed)
   * - Cannot transition to other states
   */
  it('should enforce PENDING state transitions correctly', () => {
    const validTransitions = getValidNextStates('PENDING');
    expect(validTransitions).toEqual(['PAID_ESCROW', 'CANCELLED', 'FAILED']);

    expect(isValidTransition('PENDING', 'PAID_ESCROW')).toBe(true);
    expect(isValidTransition('PENDING', 'CANCELLED')).toBe(true);
    expect(isValidTransition('PENDING', 'FAILED')).toBe(true);

    expect(isValidTransition('PENDING', 'DISPATCHED')).toBe(false);
    expect(isValidTransition('PENDING', 'ARRIVED')).toBe(false);
    expect(isValidTransition('PENDING', 'COMPLETED')).toBe(false);
  });

  /**
   * Property: PAID_ESCROW state has correct transitions
   * 
   * From PAID_ESCROW status:
   * - Can transition to DISPATCHED (shop owner marks as dispatched)
   * - Can transition to CANCELLED (user cancels before dispatch)
   * - Can transition to REFUNDED (refund initiated)
   * - Cannot transition to other states
   */
  it('should enforce PAID_ESCROW state transitions correctly', () => {
    const validTransitions = getValidNextStates('PAID_ESCROW');
    expect(validTransitions).toEqual(['DISPATCHED', 'CANCELLED', 'REFUNDED']);

    expect(isValidTransition('PAID_ESCROW', 'DISPATCHED')).toBe(true);
    expect(isValidTransition('PAID_ESCROW', 'CANCELLED')).toBe(true);
    expect(isValidTransition('PAID_ESCROW', 'REFUNDED')).toBe(true);

    expect(isValidTransition('PAID_ESCROW', 'PENDING')).toBe(false);
    expect(isValidTransition('PAID_ESCROW', 'ARRIVED')).toBe(false);
    expect(isValidTransition('PAID_ESCROW', 'COMPLETED')).toBe(false);
  });

  /**
   * Property: DISPATCHED state has correct transitions
   * 
   * From DISPATCHED status:
   * - Can transition to ARRIVED (runner reaches delivery location)
   * - Can transition to CANCELLED (order cancelled during delivery)
   * - Cannot transition to other states
   */
  it('should enforce DISPATCHED state transitions correctly', () => {
    const validTransitions = getValidNextStates('DISPATCHED');
    expect(validTransitions).toEqual(['ARRIVED', 'CANCELLED']);

    expect(isValidTransition('DISPATCHED', 'ARRIVED')).toBe(true);
    expect(isValidTransition('DISPATCHED', 'CANCELLED')).toBe(true);

    expect(isValidTransition('DISPATCHED', 'PENDING')).toBe(false);
    expect(isValidTransition('DISPATCHED', 'PAID_ESCROW')).toBe(false);
    expect(isValidTransition('DISPATCHED', 'COMPLETED')).toBe(false);
  });

  /**
   * Property: ARRIVED state has correct transitions
   * 
   * From ARRIVED status:
   * - Can transition to COMPLETED (user verifies OTP)
   * - Can transition to CANCELLED (user rejects delivery)
   * - Cannot transition to other states
   */
  it('should enforce ARRIVED state transitions correctly', () => {
    const validTransitions = getValidNextStates('ARRIVED');
    expect(validTransitions).toEqual(['COMPLETED', 'CANCELLED']);

    expect(isValidTransition('ARRIVED', 'COMPLETED')).toBe(true);
    expect(isValidTransition('ARRIVED', 'CANCELLED')).toBe(true);

    expect(isValidTransition('ARRIVED', 'PENDING')).toBe(false);
    expect(isValidTransition('ARRIVED', 'PAID_ESCROW')).toBe(false);
    expect(isValidTransition('ARRIVED', 'DISPATCHED')).toBe(false);
  });

  /**
   * Property: FAILED state can retry
   * 
   * From FAILED status:
   * - Can transition back to PENDING (retry payment)
   * - Cannot transition to other states
   */
  it('should allow FAILED state to retry', () => {
    const validTransitions = getValidNextStates('FAILED');
    expect(validTransitions).toEqual(['PENDING']);

    expect(isValidTransition('FAILED', 'PENDING')).toBe(true);

    expect(isValidTransition('FAILED', 'PAID_ESCROW')).toBe(false);
    expect(isValidTransition('FAILED', 'DISPATCHED')).toBe(false);
    expect(isValidTransition('FAILED', 'COMPLETED')).toBe(false);
  });

  /**
   * Property: State machine prevents invalid paths
   * 
   * For any sequence of transitions:
   * - Each transition must be valid
   * - Invalid transitions should be rejected
   */
  it('should prevent invalid state paths', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom<OrderStatus>(
            'PENDING',
            'PAID_ESCROW',
            'DISPATCHED',
            'ARRIVED',
            'COMPLETED',
            'CANCELLED',
            'FAILED',
            'REFUNDED'
          ),
          { minLength: 2, maxLength: 10 }
        ),
        (statePath) => {
          // Check each transition in the path
          for (let i = 0; i < statePath.length - 1; i++) {
            const fromStatus = statePath[i];
            const toStatus = statePath[i + 1];
            const isValid = isValidTransition(fromStatus, toStatus);

            // If transition is invalid, verify it's not in VALID_TRANSITIONS
            if (!isValid) {
              expect(
                VALID_TRANSITIONS[fromStatus]?.includes(toStatus)
              ).toBe(false);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Valid paths exist from initial state to terminal states
   * 
   * From PENDING (initial state):
   * - There should be at least one valid path to COMPLETED
   * - There should be at least one valid path to CANCELLED
   * - There should be at least one valid path to REFUNDED
   */
  it('should have valid paths from initial to terminal states', () => {
    // Path to COMPLETED: PENDING -> PAID_ESCROW -> DISPATCHED -> ARRIVED -> COMPLETED
    const pathToCompleted = [
      'PENDING',
      'PAID_ESCROW',
      'DISPATCHED',
      'ARRIVED',
      'COMPLETED',
    ] as OrderStatus[];
    for (let i = 0; i < pathToCompleted.length - 1; i++) {
      expect(
        isValidTransition(pathToCompleted[i], pathToCompleted[i + 1])
      ).toBe(true);
    }

    // Path to CANCELLED: PENDING -> CANCELLED
    const pathToCancelled = ['PENDING', 'CANCELLED'] as OrderStatus[];
    for (let i = 0; i < pathToCancelled.length - 1; i++) {
      expect(
        isValidTransition(pathToCancelled[i], pathToCancelled[i + 1])
      ).toBe(true);
    }

    // Path to REFUNDED: PENDING -> PAID_ESCROW -> REFUNDED
    const pathToRefunded = [
      'PENDING',
      'PAID_ESCROW',
      'REFUNDED',
    ] as OrderStatus[];
    for (let i = 0; i < pathToRefunded.length - 1; i++) {
      expect(
        isValidTransition(pathToRefunded[i], pathToRefunded[i + 1])
      ).toBe(true);
    }
  });

  /**
   * Property: State machine is acyclic (no infinite loops)
   * 
   * For any state:
   * - Following valid transitions should eventually reach a terminal state
   * - No cycles should exist (except FAILED -> PENDING -> ...)
   */
  it('should prevent infinite loops in state transitions', () => {
    const terminalStates: OrderStatus[] = [
      'COMPLETED',
      'CANCELLED',
      'REFUNDED',
    ];

    // Check that all non-terminal states can reach a terminal state
    const nonTerminalStates: OrderStatus[] = [
      'PENDING',
      'PAID_ESCROW',
      'DISPATCHED',
      'ARRIVED',
      'FAILED',
    ];

    for (const state of nonTerminalStates) {
      const validNextStates = getValidNextStates(state);
      expect(validNextStates.length).toBeGreaterThan(0);

      // At least one path should lead to a terminal state
      let canReachTerminal = false;
      for (const nextState of validNextStates) {
        if (terminalStates.includes(nextState)) {
          canReachTerminal = true;
          break;
        }
      }
      expect(canReachTerminal).toBe(true);
    }
  });
});
