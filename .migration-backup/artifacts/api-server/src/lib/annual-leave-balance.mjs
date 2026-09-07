export function calculateAnnualLeaveDeduction({
  absenceKind,
  date,
  allowedBalanceMonths,
  monthlyDeductionLimit,
  deductedThisMonth,
  requestedDays,
  allocated,
  used,
  pending,
}) {
  if (absenceKind !== "approved_permission") return 0;

  const month = Number(date.slice(5, 7));
  const allowedMonths = new Set(
    (allowedBalanceMonths || []).filter(
      (value) => Number.isInteger(value) && value >= 1 && value <= 12,
    ),
  );
  if (!allowedMonths.has(month)) return 0;

  const availableBalance = Math.max(
    0,
    Number(allocated) - Number(used) - Number(pending),
  );
  const remainingMonthlyLimit = Math.max(
    0,
    Number(monthlyDeductionLimit) - Number(deductedThisMonth),
  );
  return Math.max(
    0,
    Math.min(
      Number(requestedDays),
      availableBalance,
      remainingMonthlyLimit,
    ),
  );
}

export function calculateAbsencePenaltyMinutes({
  attendanceState,
  scheduledMinutes,
  absencePenaltyMultiplier,
}) {
  if (
    attendanceState !== "unexcused_absence" &&
    attendanceState !== "missing_attendance"
  ) {
    return 0;
  }
  return Math.round(
    Math.max(0, Number(scheduledMinutes)) *
      Math.max(0, Number(absencePenaltyMultiplier)),
  );
}