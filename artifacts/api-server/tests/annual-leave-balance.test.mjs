import assert from "node:assert/strict";
import { test } from "node:test";
import {
  annualLeaveAllocationAdjustmentFromSupportAudit,
  calculateAbsencePenaltyMinutes,
  calculateAnnualLeaveSupportAdjustmentAmounts,
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

test("correcting used annual leave does not become an allocation adjustment", () => {
  const amounts = calculateAnnualLeaveSupportAdjustmentAmounts({
    previousAllocated: 11,
    allocated: 11,
    previousUsed: 1,
    used: 0,
  });
  assert.deepEqual(amounts, {
    allocationAdjustment: 0,
    usageCorrection: 1,
  });
  assert.equal(
    annualLeaveAllocationAdjustmentFromSupportAudit(
      { amount: 1 },
      { before: { allocated: 11 }, after: { allocated: 11 } },
    ),
    0,
  );
});

test("legacy support allocation changes are derived from audited allocated totals", () => {
  assert.equal(
    annualLeaveAllocationAdjustmentFromSupportAudit(
      { amount: 5 },
      { before: { allocated: 10 }, after: { allocated: 12 } },
    ),
    2,
  );
  assert.equal(
    annualLeaveAllocationAdjustmentFromSupportAudit({ amount: -2 }, null),
    -2,
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