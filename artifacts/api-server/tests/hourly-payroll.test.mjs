import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateHourlyPayroll,
  deriveHourlyRate,
} from "../src/lib/hourly-payroll.mjs";

test("hourly rate uses the employee's monthly reference inputs", () => {
  assert.equal(deriveHourlyRate(10_000, 26, 8), 10_000 / 208);
});

test("hourly payroll pays the full recorded attendance duration at one rate", () => {
  const hourlyRate = deriveHourlyRate(10_000, 26, 8);
  assert.deepEqual(calculateHourlyPayroll(160 * 60, hourlyRate), {
    workedMinutes: 9_600,
    workedHours: 160,
    basicPay: 7_692.31,
  });
});

test("hourly pay uses exact worked minutes before rounding currency", () => {
  const hourlyRate = deriveHourlyRate(10_000, 26, 8);
  assert.deepEqual(calculateHourlyPayroll(127, hourlyRate), {
    workedMinutes: 127,
    workedHours: 2.12,
    basicPay: 101.76,
  });
});

test("hourly rate rejects invalid divisor inputs instead of hiding bad setup", () => {
  assert.throws(() => deriveHourlyRate(10_000, 0, 8), RangeError);
  assert.throws(() => deriveHourlyRate(10_000, 26, 0), RangeError);
});