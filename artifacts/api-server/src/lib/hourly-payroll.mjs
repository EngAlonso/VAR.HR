export function deriveHourlyRate(
  referenceMonthlySalary,
  workDaysPerMonth,
  referenceHoursPerDay,
) {
  if (!Number.isFinite(referenceMonthlySalary) || referenceMonthlySalary < 0) {
    throw new RangeError("Monthly reference salary must be a non-negative number.");
  }
  if (
    !Number.isInteger(workDaysPerMonth) ||
    workDaysPerMonth < 1 ||
    workDaysPerMonth > 31
  ) {
    throw new RangeError("Reference workdays must be an integer from 1 to 31.");
  }
  if (
    !Number.isFinite(referenceHoursPerDay) ||
    referenceHoursPerDay <= 0 ||
    referenceHoursPerDay > 24
  ) {
    throw new RangeError("Reference work hours must be greater than 0 and at most 24.");
  }

  return referenceMonthlySalary / (workDaysPerMonth * referenceHoursPerDay);
}

export function calculateHourlyPayroll(workedMinutes, hourlyRate) {
  if (!Number.isFinite(workedMinutes) || workedMinutes < 0) {
    throw new RangeError("Worked minutes must be a non-negative number.");
  }
  if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
    throw new RangeError("Hourly rate must be a non-negative number.");
  }

  const workedHours = workedMinutes / 60;
  return {
    workedMinutes,
    workedHours: roundMoney(workedHours),
    basicPay: roundMoney(workedHours * hourlyRate),
  };
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}