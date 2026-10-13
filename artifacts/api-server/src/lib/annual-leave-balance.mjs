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

export function calculateAnnualLeaveSupportAdjustmentAmounts({
  previousAllocated,
  allocated,
  previousUsed,
  used,
}) {
  const roundDays = (value) => Math.round(Number(value) * 100) / 100;
  return {
    allocationAdjustment: roundDays(Number(allocated) - Number(previousAllocated)),
    usageCorrection: roundDays(Number(previousUsed) - Number(used)),
  };
}

export function annualLeaveAllocationAdjustmentFromSupportAudit(
  adjustment,
  supportAudit,
) {
  if (!supportAudit) return Number(adjustment.amount);
  const beforeAllocated = Number(supportAudit.before?.allocated);
  const afterAllocated = Number(supportAudit.after?.allocated);
  if (!Number.isFinite(beforeAllocated) || !Number.isFinite(afterAllocated)) {
    return Number(adjustment.amount);
  }
  return Math.round((afterAllocated - beforeAllocated) * 100) / 100;
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