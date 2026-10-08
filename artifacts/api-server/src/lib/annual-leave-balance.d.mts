export function calculateAbsencePenaltyMinutes(input: {
  attendanceState: string;
  scheduledMinutes: number;
  absencePenaltyMultiplier: number;
}): number;