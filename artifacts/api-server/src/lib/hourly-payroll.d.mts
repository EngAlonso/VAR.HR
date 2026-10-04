export function deriveHourlyRate(
  referenceMonthlySalary: number,
  workDaysPerMonth: number,
  referenceHoursPerDay: number,
): number;

export function calculateHourlyPayroll(
  workedMinutes: number,
  hourlyRate: number,
): {
  workedMinutes: number;
  workedHours: number;
  basicPay: number;
};