export type AnnualLeaveAbsenceKind =
  | "approved_permission"
  | "unauthorized_absence"
  | "other";

export function calculateAnnualLeaveDeduction(input: {
  absenceKind: AnnualLeaveAbsenceKind;
  date: string;
  allowedBalanceMonths: number[];
  monthlyDeductionLimit: number;
  deductedThisMonth: number;
  requestedDays: number;
  allocated: number;
  used: number;
  pending: number;
}): number;

export function calculateAbsencePenaltyMinutes(input: {
  attendanceState: string;
  scheduledMinutes: number;
  absencePenaltyMultiplier: number;
}): number;