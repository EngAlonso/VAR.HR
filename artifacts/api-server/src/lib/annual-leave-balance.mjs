export function calculateEligibleAnnualLeaveAllocation({
  eligible,
  annualEntitlement,
  activatedAt,
  manualAdjustments,
}) {
  if (!eligible) return null;

  const activationTime = activatedAt
    ? new Date(activatedAt).getTime()
    : Number.POSITIVE_INFINITY;
  const manualAdjustmentTotal = (manualAdjustments || []).reduce(
    (total, adjustment) => {
      const createdAt = new Date(adjustment.createdAt).getTime();
      return createdAt >= activationTime
        ? total + Number(adjustment.amount)
        : total;
    },
    0,
  );

  return Math.max(0, Number(annualEntitlement) + manualAdjustmentTotal);
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