import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateAbsencePenaltyMinutes,
  calculateAnnualLeaveDeduction,
} from "../src/lib/annual-leave-balance.mjs";

const base = {
  absenceKind: "approved_permission",
  date: "2026-08-10",
  allowedBalanceMonths: [8, 10],
  monthlyDeductionLimit: 2,
  deductedThisMonth: 0,
  requestedDays: 1,
  allocated: 10,
  used: 0,
  pending: 0,
};

test("selected month + approved permission deducts annual leave", () => {
  assert.equal(calculateAnnualLeaveDeduction(base), 1);
});

test("non-selected month + approved permission does not deduct", () => {
  assert.equal(
    calculateAnnualLeaveDeduction({ ...base, date: "2026-09-10" }),
    0,
  );
});

test("unauthorized absence never deducts annual leave", () => {
  assert.equal(
    calculateAnnualLeaveDeduction({
      ...base,
      absenceKind: "unauthorized_absence",
    }),
    0,
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

test("monthly limit 1 caps one or more permissions in the month", () => {
  const first = calculateAnnualLeaveDeduction({
    ...base,
    monthlyDeductionLimit: 1,
    requestedDays: 1,
  });
  const second = calculateAnnualLeaveDeduction({
    ...base,
    monthlyDeductionLimit: 1,
    deductedThisMonth: first,
    requestedDays: 1,
  });
  assert.equal(first, 1);
  assert.equal(second, 0);
});

test("monthly limit 2 allows two days but not a third", () => {
  const first = calculateAnnualLeaveDeduction({
    ...base,
    monthlyDeductionLimit: 2,
    requestedDays: 1,
  });
  const second = calculateAnnualLeaveDeduction({
    ...base,
    monthlyDeductionLimit: 2,
    deductedThisMonth: first,
    requestedDays: 1,
  });
  const third = calculateAnnualLeaveDeduction({
    ...base,
    monthlyDeductionLimit: 2,
    deductedThisMonth: first + second,
    requestedDays: 1,
  });
  assert.deepEqual([first, second, third], [1, 1, 0]);
});

test("multiple absences cannot bypass the monthly maximum", () => {
  let deductedThisMonth = 0;
  const deductions = [];
  for (let index = 0; index < 4; index += 1) {
    const deduction = calculateAnnualLeaveDeduction({
      ...base,
      monthlyDeductionLimit: 2,
      deductedThisMonth,
    });
    deductions.push(deduction);
    deductedThisMonth += deduction;
  }
  assert.deepEqual(deductions, [1, 1, 0, 0]);
  assert.equal(deductedThisMonth, 2);
  assert.equal(
    calculateAnnualLeaveDeduction({
      ...base,
      monthlyDeductionLimit: 2,
      deductedThisMonth: 2,
    }),
    0,
  );
});

test("zero and insufficient balance never produce a negative balance", () => {
  assert.equal(
    calculateAnnualLeaveDeduction({
      ...base,
      allocated: 0,
    }),
    0,
  );
  assert.equal(
    calculateAnnualLeaveDeduction({
      ...base,
      allocated: 1,
      used: 0.75,
      requestedDays: 1,
    }),
    0.25,
  );
});

test("separate months have independent monthly caps", () => {
  assert.equal(
    calculateAnnualLeaveDeduction({
      ...base,
      date: "2026-08-31",
      monthlyDeductionLimit: 1,
      deductedThisMonth: 1,
    }),
    0,
  );
  assert.equal(
    calculateAnnualLeaveDeduction({
      ...base,
      date: "2026-10-01",
      monthlyDeductionLimit: 1,
      deductedThisMonth: 0,
    }),
    1,
  );
});

test("historical date uses the policy month represented by that date", () => {
  assert.equal(
    calculateAnnualLeaveDeduction({
      ...base,
      date: "2025-08-10",
      allowedBalanceMonths: [8],
    }),
    1,
  );
  assert.equal(
    calculateAnnualLeaveDeduction({
      ...base,
      date: "2025-09-10",
      allowedBalanceMonths: [8],
    }),
    0,
  );
});