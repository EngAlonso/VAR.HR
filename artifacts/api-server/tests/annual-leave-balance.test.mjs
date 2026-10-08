import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateAbsencePenaltyMinutes,
  calculateEligibleAnnualLeaveAllocation,
} from "../src/lib/annual-leave-balance.mjs";

test("employees without annual eligibility keep manual balance only", () => {
  assert.equal(
    calculateEligibleAnnualLeaveAllocation({
      eligible: false,
      annualEntitlement: 21,
      activatedAt: "2026-09-01T00:00:00.000Z",
      manualAdjustments: [],
    }),
    null,
  );
});

test("previous manual balance is counted within the annual entitlement", () => {
  assert.equal(
    calculateEligibleAnnualLeaveAllocation({
      eligible: true,
      annualEntitlement: 21,
      activatedAt: "2026-09-10T00:00:00.000Z",
      manualAdjustments: [
        { amount: 10, createdAt: "2026-09-09T12:00:00.000Z" },
      ],
    }),
    21,
  );
});

test("manual adjustments after activation remain on top of the company entitlement", () => {
  assert.equal(
    calculateEligibleAnnualLeaveAllocation({
      eligible: true,
      annualEntitlement: 21,
      activatedAt: "2026-09-10T00:00:00.000Z",
      manualAdjustments: [
        { amount: 10, createdAt: "2026-09-09T12:00:00.000Z" },
        { amount: 2, createdAt: "2026-09-10T12:00:00.000Z" },
      ],
    }),
    23,
  );
});

test("configured unauthorized-absence penalty is separate", () => {
  assert.equal(
    calculateAbsencePenaltyMinutes({
      attendanceState: "unexcused_absence",
      scheduledMinutes: 480,
      absencePenaltyMultiplier: 1.5,
    }),
    720,
  );
  assert.equal(
    calculateAbsencePenaltyMinutes({
      attendanceState: "approved_permission",
      scheduledMinutes: 480,
      absencePenaltyMultiplier: 1.5,
    }),
    0,
  );
});