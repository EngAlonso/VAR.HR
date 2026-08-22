import { Router, type IRouter, type Request, type Response } from "express";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  gte,
  ilike,
  lt,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import {
  ApiError,
  AttendanceReport,
  CalculatePayrollParams,
  CheckInBody,
  CheckInResponse,
  CheckOutBody,
  CheckOutResponse,
  CorrectAttendanceBody,
  CorrectAttendanceParams,
  CorrectAttendanceResponse,
  CreateBranchBody,
  CreateBranchResponse,
  CreateDepartmentBody,
  CreateDepartmentResponse,
  CreateDeviceBody,
  CreateDeviceResponse,
  CreateDeviceMappingBody,
  CreateDeviceMappingParams,
  CreateDeviceMappingResponse,
  CreateAttendanceLocationBody,
  CreateAttendanceLocationResponse,
  CreateEmployeeBody,
  CreateEmployeeResponse,
  CreateHolidayBody,
  CreateHolidayResponse,
  CreateLeaveRequestBody,
  CreateLeaveRequestResponse,
  CreatePermissionRequestBody,
  CreatePermissionRequestResponse,
  CreateWorkScheduleBody,
  CreateWorkScheduleResponse,
  DashboardSummary,
  DecideLeaveRequestBody,
  DecideLeaveRequestParams,
  DecideLeaveRequestResponse,
  DecidePermissionRequestBody,
  DecidePermissionRequestParams,
  DecidePermissionRequestResponse,
  Department,
  GetAttendanceReportQueryParams,
  GetAttendanceReportResponse,
  GetAttendanceRulesResponse,
  GetAttendanceTodayResponse,
  GetMyPayrollQueryParams,
  GetMyPayrollResponse,
  GetPayrollCalculationParams,
  GetPayrollCalculationResponse,
  GetDashboardSummaryResponse,
  GetEmployeeParams,
  GetEmployeeResponse,
  GetEmployeeHrRecordParams,
  GetEmployeeHrRecordResponse,
  GetEmployeeScheduleParams,
  GetEmployeeScheduleResponse,
  GetReportQueryParams,
  GetReportResponse,
  GetSubscriptionResponse,
  GetWorkspaceResponse,
  IngestBiometricEventBody,
  IngestBiometricEventParams,
  IngestBiometricEventResponse,
  ListAttendanceHistoryQueryParams,
  ListAttendanceHistoryResponse,
  ListAttendanceLocationsResponse,
  ListBiometricProvidersResponse,
  ListDeviceMappingsParams,
  ListDeviceMappingsResponse,
  ListDeviceSyncHistoryParams,
  ListDeviceSyncHistoryResponse,
  ListBranchesResponse,
  ListDepartmentsResponse,
  ListDevicesResponse,
  ListHolidaysResponse,
  ListEmployeesQueryParams,
  ListEmployeesResponse,
  ListLeaveBalancesResponse,
  ListLeaveRequestsResponse,
  ListPayrollPeriodsResponse,
  ListPayrollAdjustmentsQueryParams,
  ListPayrollAdjustmentsResponse,
  ListWorkSchedulesResponse,
  CreatePayrollPeriodBody,
  CreatePayrollPeriodResponse,
  CreatePayrollAdjustmentBody,
  CreatePayrollAdjustmentResponse,
  DeletePayrollAdjustmentParams,
  DeletePayrollAdjustmentResponse,
  FinalizePayrollParams,
  FinalizePayrollResponse,
  ListPermissionRequestsResponse,
  ListPlatformCompaniesResponse,
  RequestDecisionInput,
  DeleteDeviceMappingParams,
  DeleteDeviceMappingResponse,
  DeleteHolidayParams,
  DeleteHolidayResponse,
  AssignEmployeeScheduleBody,
  AssignEmployeeScheduleParams,
  AssignEmployeeScheduleResponse,
  SyncDeviceParams,
  SyncDeviceResponse,
  TestDeviceConnectionParams,
  TestDeviceConnectionResponse,
  UpdateAttendanceLocationBody,
  UpdateAttendanceLocationParams,
  UpdateAttendanceLocationResponse,
  UpdateAttendanceRulesBody,
  UpdateAttendanceRulesResponse,
  UpdateEmployeeBody,
  UpdateEmployeeParams,
  UpdateEmployeeResponse,
  UpdateEmployeeHrRecordBody,
  UpdateEmployeeHrRecordParams,
  UpdateEmployeeHrRecordResponse,
  UpdateHolidayBody,
  UpdateHolidayParams,
  UpdateHolidayResponse,
  UpdateWorkScheduleBody,
  UpdateWorkScheduleParams,
  UpdateWorkScheduleResponse,
} from "@workspace/api-zod";
import {
  attendanceRulesTable,
  attendanceLocationsTable,
  attendanceTable,
  auditLogsTable,
  authAuditEventsTable,
  biometricEventsTable,
  biometricSyncHistoryTable,
  branchesTable,
  companiesTable,
  departmentsTable,
  deviceEmployeeMappingsTable,
  devicesTable,
  employeeIdentitiesTable,
  employeeHrRecordsTable,
  employeeScheduleAssignmentsTable,
  employeesTable,
  holidaysTable,
  leaveBalancesTable,
  leaveRequestsTable,
  payrollCalculationsTable,
  payrollAdjustmentsTable,
  payrollPeriodsTable,
  plansTable,
  permissionRequestsTable,
  subscriptionsTable,
  workSchedulesTable,
  userAccountsTable,
} from "@workspace/db";
import { db } from "@workspace/db";
import {
  canApprove,
  canManageCompany,
  canViewPayroll,
  employeeScopeCondition,
  getTenantContext,
  hasCapability,
  workspaceCapabilities,
  requestedLocale,
  type TenantContext,
} from "../lib/tenant-context";
import { translateApiMessage } from "../lib/i18n";
import type { SQL } from "drizzle-orm";
import {
  ensureEmployeeCapacity,
  allocateDeviceLetter,
  deviceLetter,
  generateNumericPassword,
  hashPassword,
  replaceAccountPermissions,
  writeAuthAudit,
} from "../lib/auth";
import {
  BiometricProviderError,
  getBiometricProvider,
  listBiometricProviders,
  type ProviderAttendanceEvent,
} from "../lib/biometric-provider";

const router: IRouter = Router();
const TODAY = "2026-08-16";
const employeeImportInputSchema = z.object({
  headers: z.array(z.string()).min(1),
  rows: z.array(z.record(z.string(), z.unknown())).min(1),
});
const employeeImportResultSchema = z.object({
  imported: z.number().int(),
  failed: z.number().int(),
  rows: z.array(
    z.object({
      row: z.number().int(),
      success: z.boolean(),
      employeeId: z.string().nullable(),
      error: z.string().nullable(),
    }),
  ),
});

function message(
  req: Request,
  key: Parameters<typeof translateApiMessage>[1],
  variables: Record<string, string | number> = {},
): string {
  return translateApiMessage(requestedLocale(req), key, variables);
}

function canUseCapability(
  context: TenantContext,
  capability: string,
  employeeMayUseOwn = false,
): boolean {
  return (
    context.role === "platform_owner" ||
    context.role === "company_owner" ||
    (context.role === "employee" && employeeMayUseOwn) ||
    hasCapability(context, capability)
  );
}

function denyCapability(res: Response, req: Request, capability: string): void {
  res.status(403).json({
    error: `This account is not allowed to use ${capability}.`,
    code: "PERMISSION_DENIED",
  });
}

function calendarDate(
  value: Date | string | null | undefined,
): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString().slice(0, 10) : value;
}

function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function asDate(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function clockMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function dateOffset(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function dateDifference(from: string, to: string): number {
  return Math.round(
    (new Date(`${to}T00:00:00Z`).getTime() -
      new Date(`${from}T00:00:00Z`).getTime()) /
      86_400_000,
  );
}

function localClockMinutes(value: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );
  return hour * 60 + minute;
}

function localCalendarDate(value: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function localElapsedMinutes(
  value: Date,
  shiftDate: string,
  shiftStart: string,
  timeZone: string,
): number {
  return (
    dateDifference(shiftDate, localCalendarDate(value, timeZone)) * 1440 +
    localClockMinutes(value, timeZone) -
    clockMinutes(shiftStart)
  );
}

function scheduleDurationMinutes(startTime: string, endTime: string): number {
  const duration = clockMinutes(endTime) - clockMinutes(startTime);
  return duration > 0 ? duration : duration + 1440;
}

function isOvernightSchedule(
  schedule: Pick<EffectiveSchedule, "startTime" | "endTime">,
): boolean {
  return clockMinutes(schedule.endTime) <= clockMinutes(schedule.startTime);
}

function haversineMeters(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const r = 6_371_000;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * r * Math.asin(Math.min(1, Math.sqrt(a)));
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isUuid(value: string): boolean {
  return z.string().uuid().safeParse(value).success;
}

function validCoordinates(latitude: unknown, longitude: unknown): boolean {
  return (
    finiteNumber(latitude) &&
    finiteNumber(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function mapDeviceRow(row: {
  device: typeof devicesTable.$inferSelect;
  branch: typeof branchesTable.$inferSelect;
  mappedEmployeeCount?: number;
}) {
  return {
    id: row.device.id,
    name: row.device.name,
    manufacturer: row.device.manufacturer,
    model: row.device.model,
    branch: row.branch.name,
    adapterKey: row.device.adapterKey,
    connectionType: row.device.connectionType as
      "unknown" | "lan" | "http" | "cloud",
    host: row.device.host,
    port: row.device.port,
    deviceIdentifier: row.device.deviceIdentifier,
    status: row.device.status as
      "connected" | "attention" | "offline" | "not_configured",
    lastSync: row.device.lastSync ? row.device.lastSync.toISOString() : null,
    integrationState: row.device.integrationState as
      "adapter_pending" | "configured" | "syncing" | "unavailable",
    connectionState: row.device.connectionState as
      | "connected"
      | "unreachable"
      | "authentication_failure"
      | "unsupported"
      | "configuration_error"
      | "unknown",
    lastHealthCheck: row.device.lastHealthCheck
      ? row.device.lastHealthCheck.toISOString()
      : null,
    mappedEmployeeCount: row.mappedEmployeeCount ?? 0,
    note: row.device.note,
  };
}

async function deviceRows(context: TenantContext) {
  const rows = await db
    .select({ device: devicesTable, branch: branchesTable })
    .from(devicesTable)
    .innerJoin(branchesTable, eq(devicesTable.branchId, branchesTable.id))
    .where(eq(devicesTable.companyId, context.companyId))
    .orderBy(asc(devicesTable.name));
  if (!rows.length) return rows;
  const mappings = await db
    .select({ deviceId: deviceEmployeeMappingsTable.deviceId })
    .from(deviceEmployeeMappingsTable)
    .where(eq(deviceEmployeeMappingsTable.companyId, context.companyId));
  const counts = new Map<string, number>();
  for (const mapping of mappings) {
    counts.set(mapping.deviceId, (counts.get(mapping.deviceId) ?? 0) + 1);
  }
  return rows.map((row) => ({
    ...row,
    mappedEmployeeCount: counts.get(row.device.id) ?? 0,
  }));
}

function mapWorkSchedule(schedule: typeof workSchedulesTable.$inferSelect) {
  return {
    id: schedule.id,
    name: schedule.name,
    workingDays: schedule.workingDays,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    requiredHours: schedule.requiredHours,
    graceMinutes: schedule.graceMinutes,
    overtimeAfterMinutes: schedule.overtimeAfterMinutes,
    overtimeEligible: schedule.overtimeEligible,
    active: schedule.active,
    createdAt: schedule.createdAt.toISOString(),
    updatedAt: schedule.updatedAt.toISOString(),
  };
}

function mapScheduleAssignment(
  assignment: typeof employeeScheduleAssignmentsTable.$inferSelect,
) {
  return {
    id: assignment.id,
    scheduleId: assignment.scheduleId,
    effectiveFrom: assignment.effectiveFrom,
    effectiveTo: assignment.effectiveTo,
  };
}

function mapHoliday(holiday: typeof holidaysTable.$inferSelect) {
  return {
    id: holiday.id,
    name: holiday.name,
    date: holiday.date,
    recurring: holiday.recurring,
    createdAt: holiday.createdAt.toISOString(),
  };
}

function mapEmployeeHrRecord(
  record: typeof employeeHrRecordsTable.$inferSelect,
) {
  return {
    id: record.id,
    employeeId: record.employeeId,
    jobTitle: record.jobTitle,
    employmentType: record.employmentType,
    managerId: record.managerId,
    address: record.address,
    emergencyContactName: record.emergencyContactName,
    emergencyContactPhone: record.emergencyContactPhone,
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

async function authorizedEmployee(context: TenantContext, employeeId: string) {
  const [employee] = await db
    .select()
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.id, employeeId),
        eq(employeesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!employee) {
    return { employee: null, denied: false };
  }
  const allowed =
    context.role === "company_owner" ||
    context.role === "platform_owner" ||
    (context.role === "employee" && context.employeeId === employee.id) ||
    (context.role === "manager" &&
      context.departmentId === employee.departmentId);
  return { employee: allowed ? employee : null, denied: !allowed };
}

function effectiveScheduleResponse(
  employeeId: string,
  schedule: typeof workSchedulesTable.$inferSelect | null,
  assignment: typeof employeeScheduleAssignmentsTable.$inferSelect | null,
) {
  return {
    employeeId,
    schedule: schedule ? mapWorkSchedule(schedule) : null,
    assignment: assignment ? mapScheduleAssignment(assignment) : null,
  };
}

type AttendanceLocationInput = {
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
};

async function resolveAttendanceLocation(
  context: TenantContext,
  input: AttendanceLocationInput | null,
  gpsPolicy: string,
  locale: Parameters<typeof translateApiMessage>[0],
): Promise<{
  status:
    | "not_required"
    | "verified"
    | "outside_geofence"
    | "low_accuracy"
    | "pending";
  explanation: string;
}> {
  if (!input || gpsPolicy === "disabled") {
    return {
      status: "not_required",
      explanation: translateApiMessage(locale, "checkInFromWorkspace"),
    };
  }
  const locations = await db
    .select()
    .from(attendanceLocationsTable)
    .where(
      and(
        eq(attendanceLocationsTable.companyId, context.companyId),
        eq(attendanceLocationsTable.active, true),
      ),
    );
  if (!locations.length) {
    const branch = context.employeeId
      ? (
          await db
            .select({ branch: branchesTable })
            .from(employeesTable)
            .innerJoin(
              branchesTable,
              eq(employeesTable.branchId, branchesTable.id),
            )
            .where(
              and(
                eq(employeesTable.id, context.employeeId),
                eq(employeesTable.companyId, context.companyId),
              ),
            )
            .limit(1)
        )[0]?.branch
      : undefined;
    if (
      branch?.gpsEnabled &&
      finiteNumber(branch.latitude) &&
      finiteNumber(branch.longitude) &&
      finiteNumber(branch.radiusMeters)
    ) {
      const distance = haversineMeters(
        input.latitude,
        input.longitude,
        branch.latitude,
        branch.longitude,
      );
      if (
        input.accuracyMeters != null &&
        input.accuracyMeters > branch.radiusMeters
      ) {
        return {
          status: "low_accuracy",
          explanation: translateApiMessage(locale, "gpsLowAccuracy"),
        };
      }
      return distance <= branch.radiusMeters
        ? {
            status: "verified",
            explanation: translateApiMessage(locale, "checkInLocationVerified"),
          }
        : {
            status: "outside_geofence",
            explanation: translateApiMessage(locale, "gpsOutsideGeofence"),
          };
    }
    return {
      status: "pending",
      explanation: translateApiMessage(locale, "checkInLocationPending"),
    };
  }
  const radius = Math.min(
    ...locations.map((location) => location.radiusMeters),
  );
  if (input.accuracyMeters != null && input.accuracyMeters > radius) {
    return {
      status: "low_accuracy",
      explanation: translateApiMessage(locale, "gpsLowAccuracy"),
    };
  }
  const inside = locations.some(
    (location) =>
      haversineMeters(
        input.latitude,
        input.longitude,
        location.latitude,
        location.longitude,
      ) <= location.radiusMeters,
  );
  return inside
    ? {
        status: "verified",
        explanation: translateApiMessage(locale, "checkInLocationVerified"),
      }
    : {
        status: "outside_geofence",
        explanation: translateApiMessage(locale, "gpsOutsideGeofence"),
      };
}

const defaultAttendanceRules = {
  workStart: "09:00",
  workEnd: "17:00",
  scheduleName: "Standard schedule",
  requiredHours: 8,
  graceMinutes: 10,
  earlyCheckoutGraceMinutes: 0,
  overtimeAfterMinutes: 30,
  overtimeEligible: true,
  overtimeMethod: "multiplier" as const,
  overtimeMultiplier: 1.25,
  hourlyRateDivisor: 160,
  lateDeductionMethod: "hourly_rate" as const,
  lateDeductionFactor: 0.5,
  earlyCheckoutDeductionFactor: 0.5,
  absenceDeductionMethod: "daily_rate" as const,
  absenceDeductionFactor: 1,
  workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
  holidayDates: [] as string[],
  gpsPolicy: "optional" as const,
  locationRadiusMeters: 180,
  version: 1,
  effectiveFrom: TODAY,
};

async function attendanceRulesFor(companyId: string) {
  const [rules] = await db
    .select()
    .from(attendanceRulesTable)
    .where(eq(attendanceRulesTable.companyId, companyId))
    .limit(1);
  return rules ?? defaultAttendanceRules;
}

type EffectiveSchedule = {
  name: string;
  workingDays: string[];
  startTime: string;
  endTime: string;
  requiredHours: number;
  graceMinutes: number;
  overtimeAfterMinutes: number;
  overtimeEligible: boolean;
};

type ScheduleAssignmentRow = {
  assignment: typeof employeeScheduleAssignmentsTable.$inferSelect;
  schedule: typeof workSchedulesTable.$inferSelect;
};

function defaultScheduleFromRules(
  rules: Awaited<ReturnType<typeof attendanceRulesFor>>,
): EffectiveSchedule {
  return {
    name: rules.scheduleName,
    workingDays: rules.workingDays,
    startTime: rules.workStart,
    endTime: rules.workEnd,
    requiredHours: rules.requiredHours,
    graceMinutes: rules.graceMinutes,
    overtimeAfterMinutes: rules.overtimeAfterMinutes,
    overtimeEligible: rules.overtimeEligible,
  };
}

function effectiveScheduleFromRows(
  employeeId: string,
  date: string,
  rules: Awaited<ReturnType<typeof attendanceRulesFor>>,
  rows: ScheduleAssignmentRow[],
): EffectiveSchedule {
  const assignment = rows
    .filter(
      (row) =>
        row.assignment.employeeId === employeeId &&
        row.assignment.effectiveFrom <= date &&
        (row.assignment.effectiveTo === null ||
          row.assignment.effectiveTo >= date) &&
        row.schedule.active,
    )
    .sort((a, b) =>
      b.assignment.effectiveFrom.localeCompare(a.assignment.effectiveFrom),
    )[0];
  if (!assignment) return defaultScheduleFromRules(rules);
  return {
    name: assignment.schedule.name,
    workingDays: assignment.schedule.workingDays,
    startTime: assignment.schedule.startTime,
    endTime: assignment.schedule.endTime,
    requiredHours: assignment.schedule.requiredHours,
    graceMinutes: assignment.schedule.graceMinutes,
    overtimeAfterMinutes: assignment.schedule.overtimeAfterMinutes,
    overtimeEligible: assignment.schedule.overtimeEligible,
  };
}

async function scheduleRowsForCompany(
  companyId: string,
): Promise<ScheduleAssignmentRow[]> {
  return db
    .select({
      assignment: employeeScheduleAssignmentsTable,
      schedule: workSchedulesTable,
    })
    .from(employeeScheduleAssignmentsTable)
    .innerJoin(
      workSchedulesTable,
      eq(employeeScheduleAssignmentsTable.scheduleId, workSchedulesTable.id),
    )
    .where(eq(employeeScheduleAssignmentsTable.companyId, companyId));
}

async function effectiveScheduleFor(
  companyId: string,
  employeeId: string,
  date: string,
  rules: Awaited<ReturnType<typeof attendanceRulesFor>>,
): Promise<EffectiveSchedule> {
  return effectiveScheduleFromRows(
    employeeId,
    date,
    rules,
    await scheduleRowsForCompany(companyId),
  );
}

function holidayMatchesDate(
  holiday: typeof holidaysTable.$inferSelect,
  date: string,
): boolean {
  return (
    holiday.date === date ||
    (holiday.recurring && holiday.date.slice(5) === date.slice(5))
  );
}

async function holidaysForCompany(
  companyId: string,
): Promise<(typeof holidaysTable.$inferSelect)[]> {
  return db
    .select()
    .from(holidaysTable)
    .where(eq(holidaysTable.companyId, companyId));
}

function isHolidayDate(
  date: string,
  rules: Awaited<ReturnType<typeof attendanceRulesFor>>,
  holidays: (typeof holidaysTable.$inferSelect)[],
): boolean {
  return (
    rules.holidayDates.includes(date) ||
    holidays.some((holiday) => holidayMatchesDate(holiday, date))
  );
}

function isWorkingScheduleDay(
  schedule: EffectiveSchedule,
  date: string,
): boolean {
  return schedule.workingDays.includes(weekdayFor(date));
}

function attendanceMetrics(input: {
  checkIn: Date | null;
  checkOut: Date | null;
  attendanceDate: string;
  schedule: EffectiveSchedule;
  rules: Awaited<ReturnType<typeof attendanceRulesFor>>;
  timeZone: string;
  holiday: boolean;
}) {
  const workingDay = isWorkingScheduleDay(input.schedule, input.attendanceDate);
  const scheduledMinutes = scheduleDurationMinutes(
    input.schedule.startTime,
    input.schedule.endTime,
  );
  const workedMinutes =
    input.checkIn && input.checkOut
      ? Math.max(
          0,
          Math.round(
            (input.checkOut.getTime() - input.checkIn.getTime()) / 60_000,
          ),
        )
      : 0;
  const checkInElapsed = input.checkIn
    ? localElapsedMinutes(
        input.checkIn,
        input.attendanceDate,
        input.schedule.startTime,
        input.timeZone,
      )
    : 0;
  const checkOutElapsed = input.checkOut
    ? localElapsedMinutes(
        input.checkOut,
        input.attendanceDate,
        input.schedule.startTime,
        input.timeZone,
      )
    : 0;
  const lateMinutes =
    input.holiday || !workingDay
      ? 0
      : Math.max(0, checkInElapsed - input.schedule.graceMinutes);
  const earlyCheckoutMinutes =
    input.holiday || !workingDay || !input.checkOut
      ? 0
      : Math.max(
          0,
          scheduledMinutes -
            checkOutElapsed -
            input.rules.earlyCheckoutGraceMinutes,
        );
  const missingMinutes =
    input.holiday || !workingDay || !input.checkOut
      ? 0
      : Math.max(
          0,
          Math.round(input.schedule.requiredHours * 60) - workedMinutes,
        );
  const overtimeMinutes = input.schedule.overtimeEligible
    ? Math.max(
        0,
        workedMinutes - scheduledMinutes - input.schedule.overtimeAfterMinutes,
      )
    : 0;
  return {
    workedMinutes,
    workedHours: Number((workedMinutes / 60).toFixed(2)),
    overtimeHours: Number((overtimeMinutes / 60).toFixed(2)),
    lateMinutes,
    earlyCheckoutMinutes,
    missingMinutes,
    rawLateMinutes:
      input.holiday || !workingDay ? 0 : Math.max(0, checkInElapsed),
  };
}

type SyncHistoryStatus =
  "queued" | "running" | "completed" | "failed" | "unavailable";
type SyncOperation = "employee_sync" | "attendance_sync" | "full_sync";

async function recordDeviceSyncHistory(input: {
  companyId: string;
  deviceId: string;
  providerKey: string;
  operation: SyncOperation;
  status: SyncHistoryStatus;
  message: string;
  eventsReceived?: number;
  eventsProcessed?: number;
  errorCount?: number;
  startedAt: Date;
  completedAt?: Date;
}) {
  const [history] = await db
    .insert(biometricSyncHistoryTable)
    .values({
      companyId: input.companyId,
      deviceId: input.deviceId,
      providerKey: input.providerKey,
      operation: input.operation,
      status: input.status,
      message: input.message,
      eventsReceived: input.eventsReceived ?? 0,
      eventsProcessed: input.eventsProcessed ?? 0,
      errorCount: input.errorCount ?? 0,
      startedAt: input.startedAt,
      completedAt: input.completedAt ?? null,
    })
    .returning();
  return history;
}

function providerEventValidationError(
  event: ProviderAttendanceEvent,
): string | null {
  if (!event.deviceEmployeeId.trim())
    return "Provider returned an event without an employee identity.";
  if (Number.isNaN(event.occurredAt.getTime()))
    return "Provider returned an event with an invalid timestamp.";
  if (event.eventType !== "attendance")
    return "Provider returned an unsupported event type.";
  if (event.direction !== "in" && event.direction !== "out")
    return "Provider returned an unsupported attendance direction.";
  if (!event.idempotencyKey.trim())
    return "Provider returned an event without an idempotency key.";
  return null;
}

async function applyProviderAttendanceEvent(
  context: TenantContext,
  event: ProviderAttendanceEvent,
  employeeId: string,
): Promise<void> {
  const eventDate = localCalendarDate(
    event.occurredAt,
    context.company.timezone,
  );
  const rules = await attendanceRulesFor(context.companyId);
  const holidays = await holidaysForCompany(context.companyId);
  let attendanceDate = eventDate;
  let existing: typeof attendanceTable.$inferSelect | undefined;
  if (event.direction === "in") {
    [existing] = await db
      .select()
      .from(attendanceTable)
      .where(
        and(
          eq(attendanceTable.companyId, context.companyId),
          eq(attendanceTable.employeeId, employeeId),
          eq(attendanceTable.date, eventDate),
        ),
      )
      .limit(1);
  } else {
    const priorDate = dateOffset(eventDate, -1);
    const candidates = await db
      .select()
      .from(attendanceTable)
      .where(
        and(
          eq(attendanceTable.companyId, context.companyId),
          eq(attendanceTable.employeeId, employeeId),
          or(
            eq(attendanceTable.date, eventDate),
            eq(attendanceTable.date, priorDate),
          ),
        ),
      )
      .orderBy(desc(attendanceTable.date));
    for (const candidate of candidates) {
      if (candidate.checkOut) continue;
      if (candidate.date === eventDate) {
        existing = candidate;
        break;
      }
      const candidateSchedule = await effectiveScheduleFor(
        context.companyId,
        employeeId,
        candidate.date,
        rules,
      );
      if (
        candidate.date === priorDate &&
        isOvernightSchedule(candidateSchedule)
      ) {
        existing = candidate;
        break;
      }
    }
    attendanceDate = existing?.date ?? eventDate;
  }
  const schedule = await effectiveScheduleFor(
    context.companyId,
    employeeId,
    attendanceDate,
    rules,
  );
  const holiday = isHolidayDate(attendanceDate, rules, holidays);

  if (event.direction === "in") {
    const metrics = attendanceMetrics({
      checkIn: event.occurredAt,
      checkOut: null,
      attendanceDate,
      schedule,
      rules,
      timeZone: context.company.timezone,
      holiday,
    });
    const values = {
      status: holiday
        ? "holiday"
        : metrics.rawLateMinutes > schedule.graceMinutes
          ? "late"
          : "present",
      scheduledStart: schedule.startTime,
      scheduledEnd: schedule.endTime,
      requiredHours: schedule.requiredHours,
      checkIn: event.occurredAt,
      workedHours: 0,
      overtimeHours: 0,
      lateMinutes: metrics.lateMinutes,
      source: "biometric",
      locationStatus: "not_required",
      location: null,
      explanation: holiday
        ? "Biometric provider check-in synchronized on a company holiday."
        : "Biometric provider check-in synchronized.",
      updatedAt: new Date(),
    };
    if (!existing) {
      await db.insert(attendanceTable).values({
        companyId: context.companyId,
        employeeId,
        date: attendanceDate,
        ...values,
      });
    } else if (!existing.checkIn) {
      await db
        .update(attendanceTable)
        .set(values)
        .where(
          and(
            eq(attendanceTable.id, existing.id),
            eq(attendanceTable.companyId, context.companyId),
          ),
        );
    }
    return;
  }

  if (existing?.checkOut) return;
  const checkIn = existing?.checkIn;
  if (!existing) {
    await db.insert(attendanceTable).values({
      companyId: context.companyId,
      employeeId,
      date: attendanceDate,
      status: holiday ? "holiday" : "incomplete",
      scheduledStart: schedule.startTime,
      scheduledEnd: schedule.endTime,
      requiredHours: schedule.requiredHours,
      checkOut: event.occurredAt,
      workedHours: 0,
      overtimeHours: 0,
      missingMinutes:
        holiday || !isWorkingScheduleDay(schedule, attendanceDate)
          ? 0
          : Math.round(schedule.requiredHours * 60),
      source: "biometric",
      locationStatus: "not_required",
      location: null,
      explanation: holiday
        ? "Biometric provider check-out synchronized on a company holiday."
        : "Biometric provider check-out synchronized before a check-in.",
    });
    return;
  }
  const metrics = attendanceMetrics({
    checkIn: checkIn ?? null,
    checkOut: event.occurredAt,
    attendanceDate,
    schedule,
    rules,
    timeZone: context.company.timezone,
    holiday,
  });
  await db
    .update(attendanceTable)
    .set({
      checkOut: event.occurredAt,
      workedHours: metrics.workedHours,
      overtimeHours: metrics.overtimeHours,
      earlyCheckoutMinutes: metrics.earlyCheckoutMinutes,
      missingMinutes: metrics.missingMinutes,
      status: holiday
        ? "holiday"
        : metrics.earlyCheckoutMinutes > 0 || metrics.missingMinutes > 0
          ? "incomplete"
          : existing.status,
      source: "biometric",
      explanation: holiday
        ? "Biometric provider check-out synchronized on a company holiday."
        : "Biometric provider check-out synchronized.",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(attendanceTable.id, existing.id),
        eq(attendanceTable.companyId, context.companyId),
      ),
    );
}

function payrollPeriodResponse(
  period: typeof payrollPeriodsTable.$inferSelect,
) {
  return {
    id: period.id,
    label: period.label,
    from: period.from,
    to: period.to,
    status: period.status as
      "draft" | "calculated" | "finalized" | "approved" | "locked",
    employeeCount: period.employeeCount,
    totalNet: period.totalNet,
    finalizedAt: period.finalizedAt ? period.finalizedAt.toISOString() : null,
    finalizedBy: period.finalizedBy,
  };
}

function dateStrings(from: string, to: string): string[] {
  const result: string[] = [];
  const current = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (current <= end) {
    result.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return result;
}

function weekdayFor(dateValue: string): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    new Date(`${dateValue}T00:00:00Z`).getUTCDay()
  ];
}

function moneyValue(value: number): number {
  return Number(value.toFixed(2));
}

type PayrollLineItem = {
  label: string;
  amount: number;
  type:
    | "basic"
    | "addition"
    | "overtime"
    | "attendance_deduction"
    | "early_checkout_deduction"
    | "absence_deduction"
    | "deduction";
  explanation: string;
};

async function employeeRows(context: TenantContext) {
  return db
    .select({
      employee: employeesTable,
      department: departmentsTable,
      branch: branchesTable,
    })
    .from(employeesTable)
    .innerJoin(
      departmentsTable,
      eq(employeesTable.departmentId, departmentsTable.id),
    )
    .innerJoin(branchesTable, eq(employeesTable.branchId, branchesTable.id))
    .where(
      and(
        eq(employeesTable.companyId, context.companyId),
        employeeScopeCondition(context),
      ),
    )
    .orderBy(asc(employeesTable.firstName));
}

function employeeResponse(
  row: Awaited<ReturnType<typeof employeeRows>>[number],
) {
  return {
    id: row.employee.id,
    employeeNumber: row.employee.employeeNumber,
    firstName: row.employee.firstName,
    lastName: row.employee.lastName,
    email: row.employee.email,
    phone: row.employee.phone,
    department: {
      id: row.department.id,
      name: row.department.name,
      employeeCount: 0,
    },
    branch: {
      id: row.branch.id,
      name: row.branch.name,
      city: row.branch.city,
      employeeCount: 0,
      gpsEnabled: row.branch.gpsEnabled,
    },
    status: row.employee.status as "active" | "inactive",
    role: row.employee.role as "employee" | "manager",
    joinedOn: calendarDate(row.employee.joinedOn)!,
    salary: row.employee.salary,
    avatarInitials: initials(row.employee.firstName, row.employee.lastName),
  };
}

function employeeReference(
  employee: typeof employeesTable.$inferSelect,
  departmentName: string,
) {
  return {
    id: employee.id,
    name: `${employee.firstName} ${employee.lastName}`,
    initials: initials(employee.firstName, employee.lastName),
    department: departmentName,
  };
}

async function recordAudit(
  companyId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  after: unknown,
  before: unknown = null,
) {
  await db.insert(auditLogsTable).values({
    companyId,
    actorType: "workspace_demo",
    actorId: "demo-actor",
    action,
    entityType,
    entityId,
    before,
    after,
  });
}

async function getAttendanceRows(
  context: TenantContext,
  from?: string,
  to?: string,
  employeeId?: string,
  departmentId?: string,
) {
  return db
    .select({
      attendance: attendanceTable,
      employee: employeesTable,
      department: departmentsTable,
    })
    .from(attendanceTable)
    .innerJoin(
      employeesTable,
      eq(attendanceTable.employeeId, employeesTable.id),
    )
    .innerJoin(
      departmentsTable,
      eq(employeesTable.departmentId, departmentsTable.id),
    )
    .where(
      and(
        eq(attendanceTable.companyId, context.companyId),
        employeeScopeCondition(context),
        from ? gte(attendanceTable.date, from) : undefined,
        to ? lte(attendanceTable.date, to) : undefined,
        employeeId ? eq(employeesTable.id, employeeId) : undefined,
        departmentId
          ? eq(employeesTable.departmentId, departmentId)
          : undefined,
      ),
    )
    .orderBy(desc(attendanceTable.date), asc(employeesTable.firstName));
}

function attendanceResponse(
  row: Awaited<ReturnType<typeof getAttendanceRows>>[number],
) {
  return {
    id: row.attendance.id,
    employee: employeeReference(row.employee, row.department.name),
    date: row.attendance.date,
    status: row.attendance.status as
      "present" | "late" | "absent" | "on_leave" | "incomplete" | "holiday",
    scheduledStart: row.attendance.scheduledStart,
    checkIn: asDate(row.attendance.checkIn),
    checkOut: asDate(row.attendance.checkOut),
    workedHours: row.attendance.workedHours,
    overtimeHours: row.attendance.overtimeHours,
    lateMinutes: row.attendance.lateMinutes,
    locationStatus: row.attendance.locationStatus as
      | "not_required"
      | "verified"
      | "outside_geofence"
      | "low_accuracy"
      | "pending",
    source: row.attendance.source as "web" | "mobile" | "biometric" | "manual",
    explanation: row.attendance.explanation,
  };
}

function requestEmployeeReference(
  employee: typeof employeesTable.$inferSelect,
  departmentName: string,
) {
  return employeeReference(employee, departmentName);
}

async function leaveRows(context: TenantContext) {
  return db
    .select({
      request: leaveRequestsTable,
      employee: employeesTable,
      department: departmentsTable,
    })
    .from(leaveRequestsTable)
    .innerJoin(
      employeesTable,
      eq(leaveRequestsTable.employeeId, employeesTable.id),
    )
    .innerJoin(
      departmentsTable,
      eq(employeesTable.departmentId, departmentsTable.id),
    )
    .where(
      and(
        eq(leaveRequestsTable.companyId, context.companyId),
        employeeScopeCondition(context),
      ),
    )
    .orderBy(desc(leaveRequestsTable.submittedAt));
}

async function permissionRows(context: TenantContext) {
  return db
    .select({
      request: permissionRequestsTable,
      employee: employeesTable,
      department: departmentsTable,
    })
    .from(permissionRequestsTable)
    .innerJoin(
      employeesTable,
      eq(permissionRequestsTable.employeeId, employeesTable.id),
    )
    .innerJoin(
      departmentsTable,
      eq(employeesTable.departmentId, departmentsTable.id),
    )
    .where(
      and(
        eq(permissionRequestsTable.companyId, context.companyId),
        employeeScopeCondition(context),
      ),
    )
    .orderBy(desc(permissionRequestsTable.submittedAt));
}

type ReportFilters = {
  type: string;
  from?: string;
  to?: string;
  employeeId?: string;
  departmentId?: string;
  status?: string;
  attendanceStatus?: string;
  leaveStatus?: string;
  permissionStatus?: string;
  payrollStatus?: string;
  periodId?: string;
  leaveType?: string;
  permissionType?: string;
};

function reportEmployeeMatches(
  employee: typeof employeesTable.$inferSelect,
  filters: ReportFilters,
): boolean {
  return (
    (!filters.employeeId || employee.id === filters.employeeId) &&
    (!filters.departmentId || employee.departmentId === filters.departmentId) &&
    (filters.type !== "employees" ||
      !filters.status ||
      filters.status === "all" ||
      employee.status === filters.status)
  );
}

function requestOverlapsRange(
  from: string,
  to: string,
  rangeFrom: string,
  rangeTo: string,
): boolean {
  return from <= rangeTo && to >= rangeFrom;
}

function timeDurationHours(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);
  if (![startHours, startMinutes, endHours, endMinutes].every(Number.isFinite))
    return 0;
  const start = startHours * 60 + startMinutes;
  const end = endHours * 60 + endMinutes;
  return Math.max(0, (end - start) / 60);
}

async function validateReportReferences(
  context: TenantContext,
  filters: ReportFilters,
): Promise<{
  status: number;
  key: Parameters<typeof translateApiMessage>[1];
} | null> {
  if (filters.periodId && filters.type !== "payroll") {
    return { status: 400, key: "reportInvalid" };
  }
  if (filters.employeeId) {
    const [employee] = await db
      .select({ companyId: employeesTable.companyId })
      .from(employeesTable)
      .where(eq(employeesTable.id, filters.employeeId))
      .limit(1);
    if (!employee || employee.companyId !== context.companyId) {
      return { status: 403, key: "reportAccess" };
    }
    const [scopedEmployee] = await db
      .select({ id: employeesTable.id })
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.id, filters.employeeId),
          eq(employeesTable.companyId, context.companyId),
          employeeScopeCondition(context),
        ),
      )
      .limit(1);
    if (!scopedEmployee) {
      return { status: 403, key: "reportAccess" };
    }
  }
  if (filters.departmentId) {
    const [department] = await db
      .select({ companyId: departmentsTable.companyId })
      .from(departmentsTable)
      .where(eq(departmentsTable.id, filters.departmentId))
      .limit(1);
    if (!department || department.companyId !== context.companyId) {
      return { status: 403, key: "reportAccess" };
    }
    if (
      (context.role === "manager" || context.role === "employee") &&
      context.departmentId !== filters.departmentId
    ) {
      return { status: 403, key: "reportAccess" };
    }
  }
  if (filters.periodId) {
    const [period] = await db
      .select({ companyId: payrollPeriodsTable.companyId })
      .from(payrollPeriodsTable)
      .where(eq(payrollPeriodsTable.id, filters.periodId))
      .limit(1);
    if (!period || period.companyId !== context.companyId) {
      return {
        status: period ? 403 : 404,
        key: period ? "reportAccess" : "reportNotFound",
      };
    }
  }
  return null;
}

router.get("/workspace", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  const locale = requestedLocale(req);
  const response = {
    company: {
      id: context.company.id,
      name: context.company.name,
      slug: context.company.slug,
      timezone: context.company.timezone,
      currency: context.company.currency,
    },
    role: context.role,
    employeeId: context.employeeId,
    locale,
    direction: locale === "ar" ? "rtl" : "ltr",
    capabilities: workspaceCapabilities(context.role, context.permissions),
  };
  res.json(GetWorkspaceResponse.parse(response));
});

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  const locale = requestedLocale(req);
  const employees = (await employeeRows(context)).map(employeeResponse);
  const attendance = await getAttendanceRows(context, TODAY, TODAY);
  const leaves = await leaveRows(context);
  const permissions = await permissionRows(context);
  const [payroll] = canViewPayroll(context)
    ? await db
        .select()
        .from(payrollPeriodsTable)
        .where(eq(payrollPeriodsTable.companyId, context.companyId))
        .orderBy(desc(payrollPeriodsTable.to))
        .limit(1)
    : [];
  const devices = canManageCompany(context)
    ? await db
        .select()
        .from(devicesTable)
        .where(eq(devicesTable.companyId, context.companyId))
    : [];

  const response = {
    date: TODAY,
    workforce: {
      activeEmployees: employees.filter((item) => item.status === "active")
        .length,
      activeManagers: employees.filter(
        (item) => item.status === "active" && item.role === "manager",
      ).length,
      departments: new Set(employees.map((item) => item.department.id)).size,
      branches: new Set(employees.map((item) => item.branch.id)).size,
    },
    attendance: {
      present: attendance.filter((row) => row.attendance.status === "present")
        .length,
      late: attendance.filter((row) => row.attendance.status === "late").length,
      absent: attendance.filter((row) => row.attendance.status === "absent")
        .length,
      onLeave: attendance.filter((row) => row.attendance.status === "on_leave")
        .length,
      overtimeHours: attendance.reduce(
        (total, row) => total + row.attendance.overtimeHours,
        0,
      ),
    },
    requests: {
      pendingLeave: leaves.filter((row) => row.request.status === "pending")
        .length,
      pendingPermissions: permissions.filter(
        (row) => row.request.status === "pending",
      ).length,
    },
    payroll: {
      periodLabel:
        payroll?.label ??
        (context.role === "employee"
          ? translateApiMessage(locale, "personalPayroll")
          : translateApiMessage(locale, "noPeriodConfigured")),
      status: (payroll?.status ?? "draft") as
        "draft" | "calculated" | "approved" | "locked",
      totalNet: payroll?.totalNet ?? 0,
    },
    devices: {
      total: devices.length,
      connected: devices.filter((device) => device.status === "connected")
        .length,
      attention: devices.filter((device) => device.status !== "connected")
        .length,
    },
    alerts:
      context.role === "employee"
        ? []
        : [
            {
              id: "device-adapter",
              severity: "info" as const,
              title: translateApiMessage(locale, "biometricConnectorPending"),
              detail: translateApiMessage(
                locale,
                "deviceSyncUnavailableDetail",
              ),
            },
            ...(employees.filter((item) => item.status === "active").length >=
            45
              ? [
                  {
                    id: "employee-limit",
                    severity: "warning" as const,
                    title: translateApiMessage(locale, "employeeLimitTitle"),
                    detail: translateApiMessage(locale, "employeeLimitDetail"),
                  },
                ]
              : []),
          ],
  };
  res.json(GetDashboardSummaryResponse.parse(response));
});

router.get("/departments", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  const departments = await db
    .select()
    .from(departmentsTable)
    .where(
      and(
        eq(departmentsTable.companyId, context.companyId),
        context.role === "employee" || context.role === "manager"
          ? context.departmentId
            ? eq(departmentsTable.id, context.departmentId)
            : sql`false`
          : undefined,
      ),
    )
    .orderBy(asc(departmentsTable.name));
  const employees = await db
    .select({ departmentId: employeesTable.departmentId })
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.companyId, context.companyId),
        employeeScopeCondition(context),
      ),
    );
  const response = departments.map((department) => ({
    id: department.id,
    name: department.name,
    employeeCount: employees.filter(
      (employee) => employee.departmentId === department.id,
    ).length,
  }));
  res.json(ListDepartmentsResponse.parse(response));
});

router.post("/departments", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canManageCompany(context)) {
    res
      .status(403)
      .json({ error: message(req, "noPermissionCreateDepartments") });
    return;
  }
  const parsed = CreateDepartmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [department] = await db
    .insert(departmentsTable)
    .values({ companyId: context.companyId, name: parsed.data.name })
    .returning();
  await recordAudit(
    context.companyId,
    "created",
    "department",
    department.id,
    department,
  );
  res.status(201).json(
    CreateDepartmentResponse.parse({
      id: department.id,
      name: department.name,
      employeeCount: 0,
    }),
  );
});

router.get("/branches", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  const branches = await db
    .select()
    .from(branchesTable)
    .where(
      and(
        eq(branchesTable.companyId, context.companyId),
        context.role === "employee" || context.role === "manager"
          ? context.branchId
            ? eq(branchesTable.id, context.branchId)
            : sql`false`
          : undefined,
      ),
    )
    .orderBy(asc(branchesTable.name));
  const employees = await db
    .select({ branchId: employeesTable.branchId })
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.companyId, context.companyId),
        employeeScopeCondition(context),
      ),
    );
  res.json(
    ListBranchesResponse.parse(
      branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        city: branch.city,
        employeeCount: employees.filter(
          (employee) => employee.branchId === branch.id,
        ).length,
        gpsEnabled: branch.gpsEnabled,
      })),
    ),
  );
});

router.post("/branches", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canManageCompany(context)) {
    res.status(403).json({ error: message(req, "noPermissionCreateBranches") });
    return;
  }
  const parsed = CreateBranchBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [branch] = await db
    .insert(branchesTable)
    .values({
      companyId: context.companyId,
      name: parsed.data.name,
      city: parsed.data.city,
      gpsEnabled: parsed.data.gpsEnabled,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      radiusMeters: parsed.data.radiusMeters,
    })
    .returning();
  await recordAudit(context.companyId, "created", "branch", branch.id, branch);
  res.status(201).json(
    CreateBranchResponse.parse({
      id: branch.id,
      name: branch.name,
      city: branch.city,
      employeeCount: 0,
      gpsEnabled: branch.gpsEnabled,
    }),
  );
});

router.get("/employees", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "employees.view", true)) {
    denyCapability(res, req, "employees.view");
    return;
  }
  const query = ListEmployeesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const rows = await employeeRows(context);
  const filtered = rows.filter((row) => {
    const status = query.data.status ?? "all";
    const matchesStatus = status === "all" || row.employee.status === status;
    const matchesDepartment =
      !query.data.departmentId ||
      row.employee.departmentId === query.data.departmentId;
    const haystack =
      `${row.employee.firstName} ${row.employee.lastName} ${row.employee.email} ${row.employee.employeeNumber}`.toLowerCase();
    const matchesSearch =
      !query.data.search || haystack.includes(query.data.search.toLowerCase());
    return matchesStatus && matchesDepartment && matchesSearch;
  });
  const response = filtered.map((row) => employeeResponse(row));
  res.json(ListEmployeesResponse.parse(response));
});

router.post("/employees", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canManageCompany(context)) {
    res
      .status(403)
      .json({ error: message(req, "noPermissionManageEmployees") });
    return;
  }
  const parsed = CreateEmployeeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const capacity = await ensureEmployeeCapacity(context.companyId);
  const activeCount = await db
    .select({ id: employeesTable.id })
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.companyId, context.companyId),
        eq(employeesTable.status, "active"),
      ),
    );
  if (!capacity.allowed) {
    res.status(409).json({
      error: message(req, "activeEmployeeLimit", {
        limit: capacity.employeeLimit,
      }),
      code: "ACTIVE_EMPLOYEE_LIMIT",
    });
    return;
  }
  const [employee] = await db
    .insert(employeesTable)
    .values({
      companyId: context.companyId,
      employeeNumber: `NS-${String(1100 + activeCount.length).padStart(4, "0")}`,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      departmentId: parsed.data.departmentId,
      branchId: parsed.data.branchId,
      status: "active",
      role: parsed.data.role ?? "employee",
      joinedOn: calendarDate(parsed.data.joinedOn)!,
      salary: parsed.data.salary,
    })
    .returning();
  const [row] = await employeeRows(context).then((rows) =>
    rows.filter((item) => item.employee.id === employee.id),
  );
  await recordAudit(
    context.companyId,
    "created",
    "employee",
    employee.id,
    employee,
  );
  res.status(201).json(CreateEmployeeResponse.parse(employeeResponse(row)));
});

router.get("/employees/:employeeId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  const params = GetEmployeeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (
    context.role === "employee" &&
    params.data.employeeId !== context.employeeId
  ) {
    res.status(403).json({ error: message(req, "employeeOwnProfile") });
    return;
  }
  if (!canUseCapability(context, "employees.view", true)) {
    denyCapability(res, req, "employees.view");
    return;
  }
  const [row] = (await employeeRows(context)).filter(
    (item) => item.employee.id === params.data.employeeId,
  );
  if (!row) {
    res.status(404).json({ error: message(req, "employeeNotFound") });
    return;
  }
  res.json(GetEmployeeResponse.parse(employeeResponse(row)));
});

router.patch("/employees/:employeeId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canManageCompany(context)) {
    res
      .status(403)
      .json({ error: message(req, "noPermissionManageEmployees") });
    return;
  }
  const params = UpdateEmployeeParams.safeParse(req.params);
  const parsed = UpdateEmployeeBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [employee] = await db
    .update(employeesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(
      and(
        eq(employeesTable.id, params.data.employeeId),
        eq(employeesTable.companyId, context.companyId),
      ),
    )
    .returning();
  if (!employee) {
    res.status(404).json({ error: message(req, "employeeNotFound") });
    return;
  }
  const [row] = (await employeeRows(context)).filter(
    (item) => item.employee.id === employee.id,
  );
  await recordAudit(
    context.companyId,
    "updated",
    "employee",
    employee.id,
    parsed.data,
  );
  res.json(UpdateEmployeeResponse.parse(employeeResponse(row)));
});

router.get("/attendance/today", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "attendance.view", true)) {
    denyCapability(res, req, "attendance.view");
    return;
  }
  const rows = await getAttendanceRows(context, TODAY, TODAY);
  const summary = {
    present: rows.filter((row) => row.attendance.status === "present").length,
    late: rows.filter((row) => row.attendance.status === "late").length,
    absent: rows.filter((row) => row.attendance.status === "absent").length,
    onLeave: rows.filter((row) => row.attendance.status === "on_leave").length,
    overtimeHours: rows.reduce(
      (total, row) => total + row.attendance.overtimeHours,
      0,
    ),
  };
  res.json(
    GetAttendanceTodayResponse.parse({
      date: TODAY,
      records: rows.map(attendanceResponse),
      summary,
    }),
  );
});

router.get("/attendance/history", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "attendance.view", true)) {
    denyCapability(res, req, "attendance.view");
    return;
  }
  const query = ListAttendanceHistoryQueryParams.safeParse({
    ...req.query,
    from: req.query.from ? String(req.query.from) : undefined,
    to: req.query.to ? String(req.query.to) : undefined,
  });
  if (!query.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (query.data.from && query.data.to && query.data.from > query.data.to) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const rows = (
    await getAttendanceRows(
      context,
      calendarDate(query.data.from),
      calendarDate(query.data.to),
    )
  ).filter((row) => {
    const requestedEmployeeId =
      context.role === "employee" ? context.employeeId : query.data.employeeId;
    return !requestedEmployeeId || row.employee.id === requestedEmployeeId;
  });
  res.json(
    ListAttendanceHistoryResponse.parse(
      rows
        .filter(
          (row) =>
            !query.data.employeeId || row.employee.id === query.data.employeeId,
        )
        .map(attendanceResponse),
    ),
  );
});

async function recordCurrentAttendance(
  req: Request,
  res: Response,
  direction: "in" | "out",
): Promise<void> {
  const context = await getTenantContext(req);
  const locale = requestedLocale(req);
  if (!context.employeeId) {
    res.status(400).json({ error: message(req, "noActiveEmployee") });
    return;
  }
  const bodySchema = direction === "in" ? CheckInBody : CheckOutBody;
  const parsed = bodySchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const hasLatitude = parsed.data.latitude != null;
  const hasLongitude = parsed.data.longitude != null;
  if (
    hasLatitude !== hasLongitude ||
    (hasLatitude &&
      !validCoordinates(parsed.data.latitude, parsed.data.longitude))
  ) {
    res.status(400).json({ error: message(req, "gpsValidationRequired") });
    return;
  }
  if (
    parsed.data.accuracyMeters != null &&
    (!finiteNumber(parsed.data.accuracyMeters) ||
      parsed.data.accuracyMeters < 0)
  ) {
    res.status(400).json({ error: message(req, "gpsAccuracyInvalid") });
    return;
  }
  const now = new Date();
  const eventAt = parsed.data.capturedAt
    ? new Date(parsed.data.capturedAt)
    : now;
  const eventDate = Number.isNaN(eventAt.getTime())
    ? ""
    : localCalendarDate(eventAt, context.company.timezone);
  const validCapturedDate =
    direction === "in"
      ? eventDate === TODAY
      : eventDate === TODAY || eventDate === dateOffset(TODAY, 1);
  if (
    Number.isNaN(eventAt.getTime()) ||
    (parsed.data.capturedAt && !validCapturedDate)
  ) {
    res.status(400).json({ error: message(req, "gpsTimestampInvalid") });
    return;
  }
  const rules = await attendanceRulesFor(context.companyId);
  const holidays = await holidaysForCompany(context.companyId);
  const location: AttendanceLocationInput | null =
    hasLatitude && hasLongitude
      ? {
          latitude: parsed.data.latitude!,
          longitude: parsed.data.longitude!,
          accuracyMeters: parsed.data.accuracyMeters,
        }
      : null;
  if (rules.gpsPolicy === "required" && !location) {
    res.status(400).json({ error: message(req, "gpsValidationRequired") });
    return;
  }

  let existing: typeof attendanceTable.$inferSelect | undefined;
  let attendanceDate = TODAY;
  if (direction === "in") {
    [existing] = await db
      .select()
      .from(attendanceTable)
      .where(
        and(
          eq(attendanceTable.companyId, context.companyId),
          eq(attendanceTable.employeeId, context.employeeId),
          eq(attendanceTable.date, TODAY),
        ),
      )
      .limit(1);
  } else {
    const priorDate = dateOffset(eventDate || TODAY, -1);
    const candidates = await db
      .select()
      .from(attendanceTable)
      .where(
        and(
          eq(attendanceTable.companyId, context.companyId),
          eq(attendanceTable.employeeId, context.employeeId),
          or(
            eq(attendanceTable.date, eventDate || TODAY),
            eq(attendanceTable.date, priorDate),
          ),
        ),
      )
      .orderBy(desc(attendanceTable.date));
    for (const candidate of candidates) {
      if (candidate.checkOut) continue;
      if (candidate.date === eventDate) {
        existing = candidate;
        break;
      }
      const candidateSchedule = await effectiveScheduleFor(
        context.companyId,
        context.employeeId,
        candidate.date,
        rules,
      );
      if (
        candidate.date === priorDate &&
        isOvernightSchedule(candidateSchedule)
      ) {
        existing = candidate;
        break;
      }
    }
    attendanceDate = (existing?.date ?? eventDate) || TODAY;
  }
  const schedule = await effectiveScheduleFor(
    context.companyId,
    context.employeeId,
    attendanceDate,
    rules,
  );
  const holiday = isHolidayDate(attendanceDate, rules, holidays);

  if (direction === "in") {
    if (existing) {
      res.status(409).json({
        error: message(
          req,
          existing.checkIn ? "checkInAlready" : "attendanceRecordExists",
        ),
      });
      return;
    }
    const metrics = attendanceMetrics({
      checkIn: eventAt,
      checkOut: null,
      attendanceDate,
      schedule,
      rules,
      timeZone: context.company.timezone,
      holiday,
    });
    const locationValidation = await resolveAttendanceLocation(
      context,
      location,
      rules.gpsPolicy,
      locale,
    );
    const [created] = await db
      .insert(attendanceTable)
      .values({
        companyId: context.companyId,
        employeeId: context.employeeId,
        date: attendanceDate,
        status: holiday
          ? "holiday"
          : metrics.rawLateMinutes > schedule.graceMinutes
            ? "late"
            : "present",
        scheduledStart: schedule.startTime,
        scheduledEnd: schedule.endTime,
        requiredHours: schedule.requiredHours,
        checkIn: eventAt,
        workedHours: 0,
        overtimeHours: 0,
        lateMinutes: metrics.lateMinutes,
        source: parsed.data.source,
        locationStatus: locationValidation.status,
        location: location
          ? { ...location, capturedAt: eventAt.toISOString() }
          : null,
        explanation: holiday
          ? `${locationValidation.explanation} Company holiday.`
          : locationValidation.explanation,
      })
      .returning();
    await recordAudit(
      context.companyId,
      "checked_in",
      "attendance",
      created.id,
      created,
    );
    const rows = await getAttendanceRows(
      context,
      attendanceDate,
      attendanceDate,
    );
    res
      .status(201)
      .json(
        CheckInResponse.parse(
          attendanceResponse(
            rows.find((row) => row.attendance.id === created.id)!,
          ),
        ),
      );
    return;
  }

  if (!existing) {
    res.status(400).json({ error: message(req, "checkInRequired") });
    return;
  }
  if (existing.checkOut) {
    res.status(409).json({ error: message(req, "checkOutAlready") });
    return;
  }
  const checkIn = existing.checkIn ?? now;
  const metrics = attendanceMetrics({
    checkIn,
    checkOut: eventAt,
    attendanceDate,
    schedule,
    rules,
    timeZone: context.company.timezone,
    holiday,
  });
  const earlyDeparture = metrics.earlyCheckoutMinutes > 0;
  const locationValidation = location
    ? await resolveAttendanceLocation(
        context,
        location,
        rules.gpsPolicy,
        locale,
      )
    : {
        status: existing.locationStatus as
          | "not_required"
          | "verified"
          | "outside_geofence"
          | "low_accuracy"
          | "pending",
        explanation: existing.explanation,
      };
  const [updated] = await db
    .update(attendanceTable)
    .set({
      checkOut: eventAt,
      workedHours: metrics.workedHours,
      overtimeHours: metrics.overtimeHours,
      earlyCheckoutMinutes: metrics.earlyCheckoutMinutes,
      missingMinutes: metrics.missingMinutes,
      status: holiday
        ? "holiday"
        : earlyDeparture || metrics.missingMinutes > 0
          ? "incomplete"
          : existing.status,
      source: parsed.data.source,
      locationStatus: locationValidation.status,
      location: location
        ? { ...location, capturedAt: eventAt.toISOString() }
        : existing.location,
      explanation: `${earlyDeparture ? message(req, "earlyDeparture") : ""}${location ? `${locationValidation.explanation} ` : ""}${holiday ? "Company holiday. " : ""}${message(req, "workedHours", { worked: metrics.workedHours.toFixed(2), overtime: metrics.overtimeHours.toFixed(2) })}`,
      updatedAt: now,
    })
    .where(eq(attendanceTable.id, existing.id))
    .returning();
  await recordAudit(
    context.companyId,
    "checked_out",
    "attendance",
    updated.id,
    updated,
  );
  const rows = await getAttendanceRows(context, attendanceDate, attendanceDate);
  res
    .status(201)
    .json(
      CheckOutResponse.parse(
        attendanceResponse(
          rows.find((row) => row.attendance.id === updated.id)!,
        ),
      ),
    );
}

router.post("/attendance/check-in", async (req, res): Promise<void> => {
  await recordCurrentAttendance(req, res, "in");
});

router.post("/attendance/check-out", async (req, res): Promise<void> => {
  await recordCurrentAttendance(req, res, "out");
});

router.patch(
  "/attendance/:attendanceId/correction",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (
      !workspaceCapabilities(context.role, context.permissions).includes(
        "attendance.correct",
      )
    ) {
      res
        .status(403)
        .json({ error: message(req, "attendanceCorrectionAccess") });
      return;
    }
    const params = CorrectAttendanceParams.safeParse(req.params);
    const parsed = CorrectAttendanceBody.safeParse(req.body);
    if (!params.success || !parsed.success) {
      res
        .status(400)
        .json({ error: message(req, "attendanceCorrectionInvalid") });
      return;
    }
    const scopedRecord = (await getAttendanceRows(context)).find(
      (row) => row.attendance.id === params.data.attendanceId,
    );
    if (!scopedRecord) {
      res.status(404).json({ error: message(req, "attendanceNotFound") });
      return;
    }
    const checkIn =
      parsed.data.checkIn === undefined
        ? scopedRecord.attendance.checkIn
        : parsed.data.checkIn
          ? new Date(parsed.data.checkIn)
          : null;
    const checkOut =
      parsed.data.checkOut === undefined
        ? scopedRecord.attendance.checkOut
        : parsed.data.checkOut
          ? new Date(parsed.data.checkOut)
          : null;
    if (
      (checkIn && Number.isNaN(checkIn.getTime())) ||
      (checkOut && Number.isNaN(checkOut.getTime()))
    ) {
      res
        .status(400)
        .json({ error: message(req, "attendanceCorrectionInvalid") });
      return;
    }
    if (checkIn && checkOut && checkIn > checkOut) {
      res
        .status(400)
        .json({ error: message(req, "attendanceCorrectionInvalid") });
      return;
    }
    const rules = await attendanceRulesFor(context.companyId);
    const schedule = await effectiveScheduleFor(
      context.companyId,
      scopedRecord.attendance.employeeId,
      scopedRecord.attendance.date,
      rules,
    );
    const holiday = isHolidayDate(
      scopedRecord.attendance.date,
      rules,
      await holidaysForCompany(context.companyId),
    );
    const metrics = attendanceMetrics({
      checkIn,
      checkOut,
      attendanceDate: scopedRecord.attendance.date,
      schedule,
      rules,
      timeZone: context.company.timezone,
      holiday,
    });
    const status = holiday
      ? "holiday"
      : (parsed.data.status ??
        (metrics.earlyCheckoutMinutes > 0 || metrics.missingMinutes > 0
          ? "incomplete"
          : metrics.rawLateMinutes > schedule.graceMinutes
            ? "late"
            : scopedRecord.attendance.status));
    const [updated] = await db
      .update(attendanceTable)
      .set({
        checkIn,
        checkOut,
        scheduledStart: schedule.startTime,
        scheduledEnd: schedule.endTime,
        requiredHours: schedule.requiredHours,
        status,
        workedHours: metrics.workedHours,
        overtimeHours: metrics.overtimeHours,
        lateMinutes: metrics.lateMinutes,
        earlyCheckoutMinutes: metrics.earlyCheckoutMinutes,
        missingMinutes: metrics.missingMinutes,
        source: "manual",
        explanation: parsed.data.reason,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(attendanceTable.id, params.data.attendanceId),
          eq(attendanceTable.companyId, context.companyId),
        ),
      )
      .returning();
    if (!updated) {
      res.status(404).json({ error: message(req, "attendanceNotFound") });
      return;
    }
    await recordAudit(
      context.companyId,
      "corrected",
      "attendance",
      updated.id,
      updated,
      scopedRecord.attendance,
    );
    const rows = await getAttendanceRows(context);
    res.json(
      CorrectAttendanceResponse.parse(
        attendanceResponse(
          rows.find((row) => row.attendance.id === updated.id)!,
        ),
      ),
    );
  },
);

router.get("/leave/balances", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "leave.approve", true)) {
    denyCapability(res, req, "leave.approve");
    return;
  }
  const balances = await db
    .select({
      balance: leaveBalancesTable,
      employee: employeesTable,
      department: departmentsTable,
    })
    .from(leaveBalancesTable)
    .innerJoin(
      employeesTable,
      eq(leaveBalancesTable.employeeId, employeesTable.id),
    )
    .innerJoin(
      departmentsTable,
      eq(employeesTable.departmentId, departmentsTable.id),
    )
    .where(
      and(
        eq(leaveBalancesTable.companyId, context.companyId),
        employeeScopeCondition(context),
      ),
    );
  res.json(
    ListLeaveBalancesResponse.parse(
      balances.map(({ balance, employee, department }) => ({
        id: balance.id,
        employee: employeeReference(employee, department.name),
        type: balance.type,
        allocated: balance.allocated,
        used: balance.used,
        pending: balance.pending,
        remaining: Math.max(
          0,
          balance.allocated - balance.used - balance.pending,
        ),
      })),
    ),
  );
});

router.get("/leave/requests", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "leave.approve", true)) {
    denyCapability(res, req, "leave.approve");
    return;
  }
  const rows = await leaveRows(context);
  res.json(
    ListLeaveRequestsResponse.parse(
      rows.map((row) => ({
        id: row.request.id,
        employee: requestEmployeeReference(row.employee, row.department.name),
        type: row.request.type,
        from: row.request.from,
        to: row.request.to,
        days: row.request.days,
        reason: row.request.reason,
        status: row.request.status as
          "pending" | "approved" | "rejected" | "cancelled",
        submittedAt: row.request.submittedAt.toISOString(),
        decidedBy: row.request.decidedBy,
        decisionReason: row.request.decisionReason,
      })),
    ),
  );
});

router.post("/leave/requests", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "leave.create", true)) {
    denyCapability(res, req, "leave.create");
    return;
  }
  if (!context.employeeId) {
    res.status(400).json({ error: message(req, "noActiveEmployee") });
    return;
  }
  const parsed = CreateLeaveRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const from = new Date(`${calendarDate(parsed.data.from)}T00:00:00Z`);
  const to = new Date(`${calendarDate(parsed.data.to)}T00:00:00Z`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
    res.status(400).json({ error: message(req, "leaveDatesInvalid") });
    return;
  }
  const days = Math.max(
    1,
    Math.floor((to.getTime() - from.getTime()) / 86_400_000) + 1,
  );
  const [balance] = await db
    .select()
    .from(leaveBalancesTable)
    .where(
      and(
        eq(leaveBalancesTable.companyId, context.companyId),
        eq(leaveBalancesTable.employeeId, context.employeeId),
        eq(leaveBalancesTable.type, parsed.data.type),
      ),
    )
    .limit(1);
  if (!balance) {
    res.status(409).json({
      error: message(req, "leaveBalanceMissing", { type: parsed.data.type }),
    });
    return;
  }
  if (balance.allocated - balance.used - balance.pending < days) {
    res.status(409).json({
      error: message(req, "leaveExceedsBalance", { type: parsed.data.type }),
    });
    return;
  }
  const [overlap] = await db
    .select({ id: leaveRequestsTable.id })
    .from(leaveRequestsTable)
    .where(
      and(
        eq(leaveRequestsTable.companyId, context.companyId),
        eq(leaveRequestsTable.employeeId, context.employeeId),
        eq(leaveRequestsTable.type, parsed.data.type),
        or(
          and(
            lte(leaveRequestsTable.from, calendarDate(parsed.data.to)!),
            gte(leaveRequestsTable.to, calendarDate(parsed.data.from)!),
          ),
        ),
        or(
          eq(leaveRequestsTable.status, "pending"),
          eq(leaveRequestsTable.status, "approved"),
        ),
      ),
    )
    .limit(1);
  if (overlap) {
    res.status(409).json({ error: message(req, "leaveOverlap") });
    return;
  }
  const [request] = await db
    .insert(leaveRequestsTable)
    .values({
      companyId: context.companyId,
      employeeId: context.employeeId,
      type: parsed.data.type,
      from: calendarDate(parsed.data.from)!,
      to: calendarDate(parsed.data.to)!,
      days,
      reason: parsed.data.reason,
    })
    .returning();
  await db
    .update(leaveBalancesTable)
    .set({ pending: sql`${leaveBalancesTable.pending} + ${days}` })
    .where(eq(leaveBalancesTable.id, balance.id));
  await recordAudit(
    context.companyId,
    "created",
    "leave_request",
    request.id,
    request,
  );
  const rows = await leaveRows(context);
  const row = rows.find((item) => item.request.id === request.id)!;
  res.status(201).json(
    CreateLeaveRequestResponse.parse({
      id: request.id,
      employee: requestEmployeeReference(row.employee, row.department.name),
      type: request.type,
      from: request.from,
      to: request.to,
      days: request.days,
      reason: request.reason,
      status: "pending",
      submittedAt: request.submittedAt.toISOString(),
      decidedBy: null,
      decisionReason: null,
    }),
  );
});

router.post(
  "/leave/requests/:requestId/decision",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canApprove(context)) {
      res.status(403).json({ error: message(req, "noPermissionDecideLeave") });
      return;
    }
    const params = DecideLeaveRequestParams.safeParse(req.params);
    const parsed = DecideLeaveRequestBody.safeParse(req.body);
    if (!params.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    if (!parsed.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    if (parsed.data.decision === "rejected" && !parsed.data.reason?.trim()) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const scopedRequest = (await leaveRows(context)).find(
      (row) => row.request.id === params.data.requestId,
    );
    if (!scopedRequest) {
      res.status(404).json({ error: message(req, "leaveNotFound") });
      return;
    }
    if (scopedRequest.request.status !== "pending") {
      res.status(409).json({ error: message(req, "pendingLeaveOnly") });
      return;
    }
    if (
      context.employeeId &&
      scopedRequest.request.employeeId === context.employeeId
    ) {
      res.status(403).json({ error: message(req, "cannotDecideOwnRequest") });
      return;
    }
    const [request] = await db
      .update(leaveRequestsTable)
      .set({
        status: parsed.data.decision,
        decidedBy:
          context.role === "manager" ? "Team manager" : "Company owner",
        decisionReason: parsed.data.reason || null,
        decidedAt: new Date(),
      })
      .where(
        and(
          eq(leaveRequestsTable.id, params.data.requestId),
          eq(leaveRequestsTable.companyId, context.companyId),
        ),
      )
      .returning();
    if (!request) {
      res.status(404).json({ error: message(req, "leaveNotFound") });
      return;
    }
    const balanceUpdate =
      parsed.data.decision === "approved"
        ? {
            pending: sql`${leaveBalancesTable.pending} - ${request.days}`,
            used: sql`${leaveBalancesTable.used} + ${request.days}`,
          }
        : { pending: sql`${leaveBalancesTable.pending} - ${request.days}` };
    await db
      .update(leaveBalancesTable)
      .set(balanceUpdate)
      .where(
        and(
          eq(leaveBalancesTable.companyId, context.companyId),
          eq(leaveBalancesTable.employeeId, request.employeeId),
          eq(leaveBalancesTable.type, request.type),
        ),
      );
    await recordAudit(
      context.companyId,
      parsed.data.decision,
      "leave_request",
      request.id,
      parsed.data,
    );
    const rows = await leaveRows(context);
    const row = rows.find((item) => item.request.id === request.id)!;
    res.json(
      DecideLeaveRequestResponse.parse({
        id: request.id,
        employee: requestEmployeeReference(row.employee, row.department.name),
        type: request.type,
        from: request.from,
        to: request.to,
        days: request.days,
        reason: request.reason,
        status: request.status,
        submittedAt: request.submittedAt.toISOString(),
        decidedBy: request.decidedBy,
        decisionReason: request.decisionReason,
      }),
    );
  },
);

router.get("/permissions/requests", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "permissions.approve", true)) {
    denyCapability(res, req, "permissions.approve");
    return;
  }
  const rows = await permissionRows(context);
  res.json(
    ListPermissionRequestsResponse.parse(
      rows.map((row) => ({
        id: row.request.id,
        employee: requestEmployeeReference(row.employee, row.department.name),
        type: row.request.type,
        date: row.request.date,
        startTime: row.request.startTime,
        endTime: row.request.endTime,
        reason: row.request.reason,
        status: row.request.status as
          "pending" | "approved" | "rejected" | "cancelled",
        submittedAt: row.request.submittedAt.toISOString(),
        decisionReason: row.request.decisionReason,
      })),
    ),
  );
});

router.post("/permissions/requests", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "permissions.create", true)) {
    denyCapability(res, req, "permissions.create");
    return;
  }
  if (!context.employeeId) {
    res.status(400).json({ error: message(req, "noActiveEmployee") });
    return;
  }
  const parsed = CreatePermissionRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (parsed.data.startTime >= parsed.data.endTime) {
    res.status(400).json({ error: message(req, "permissionTimeInvalid") });
    return;
  }
  const [request] = await db
    .insert(permissionRequestsTable)
    .values({
      companyId: context.companyId,
      employeeId: context.employeeId,
      type: parsed.data.type,
      date: calendarDate(parsed.data.date)!,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      reason: parsed.data.reason,
    })
    .returning();
  await recordAudit(
    context.companyId,
    "created",
    "permission_request",
    request.id,
    request,
  );
  const rows = await permissionRows(context);
  const row = rows.find((item) => item.request.id === request.id)!;
  res.status(201).json(
    CreatePermissionRequestResponse.parse({
      id: request.id,
      employee: requestEmployeeReference(row.employee, row.department.name),
      type: request.type,
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      reason: request.reason,
      status: "pending",
      submittedAt: request.submittedAt.toISOString(),
      decisionReason: null,
    }),
  );
});

router.post(
  "/permissions/requests/:requestId/decision",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canApprove(context)) {
      res
        .status(403)
        .json({ error: message(req, "noPermissionDecidePermission") });
      return;
    }
    const params = DecidePermissionRequestParams.safeParse(req.params);
    const parsed = DecidePermissionRequestBody.safeParse(req.body);
    if (!params.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    if (!parsed.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    if (parsed.data.decision === "rejected" && !parsed.data.reason?.trim()) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const scopedRequest = (await permissionRows(context)).find(
      (row) => row.request.id === params.data.requestId,
    );
    if (!scopedRequest) {
      res.status(404).json({ error: message(req, "permissionNotFound") });
      return;
    }
    if (scopedRequest.request.status !== "pending") {
      res.status(409).json({ error: message(req, "pendingPermissionOnly") });
      return;
    }
    if (
      context.employeeId &&
      scopedRequest.request.employeeId === context.employeeId
    ) {
      res.status(403).json({ error: message(req, "cannotDecideOwnRequest") });
      return;
    }
    const [request] = await db
      .update(permissionRequestsTable)
      .set({
        status: parsed.data.decision,
        decisionReason: parsed.data.reason || null,
        decidedAt: new Date(),
      })
      .where(
        and(
          eq(permissionRequestsTable.id, params.data.requestId),
          eq(permissionRequestsTable.companyId, context.companyId),
        ),
      )
      .returning();
    if (!request) {
      res.status(404).json({ error: message(req, "permissionNotFound") });
      return;
    }
    await recordAudit(
      context.companyId,
      parsed.data.decision,
      "permission_request",
      request.id,
      parsed.data,
    );
    const rows = await permissionRows(context);
    const row = rows.find((item) => item.request.id === request.id)!;
    res.json(
      DecidePermissionRequestResponse.parse({
        id: request.id,
        employee: requestEmployeeReference(row.employee, row.department.name),
        type: request.type,
        date: request.date,
        startTime: request.startTime,
        endTime: request.endTime,
        reason: request.reason,
        status: request.status,
        submittedAt: request.submittedAt.toISOString(),
        decisionReason: request.decisionReason,
      }),
    );
  },
);

router.get("/rules", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "attendance.correct")) {
    res.status(403).json({ error: message(req, "attendanceRulesAccess") });
    return;
  }
  const [rules] = await db
    .select()
    .from(attendanceRulesTable)
    .where(eq(attendanceRulesTable.companyId, context.companyId))
    .limit(1);
  const response = rules ?? defaultAttendanceRules;
  res.json(GetAttendanceRulesResponse.parse(response));
});

router.put("/rules", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "attendance.correct")) {
    res.status(403).json({ error: message(req, "attendanceRulesUpdate") });
    return;
  }
  const parsed = UpdateAttendanceRulesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [existing] = await db
    .select()
    .from(attendanceRulesTable)
    .where(eq(attendanceRulesTable.companyId, context.companyId))
    .limit(1);
  const [rules] = existing
    ? await db
        .update(attendanceRulesTable)
        .set({
          ...parsed.data,
          version: existing.version + 1,
          updatedAt: new Date(),
        })
        .where(eq(attendanceRulesTable.id, existing.id))
        .returning()
    : await db
        .insert(attendanceRulesTable)
        .values({
          companyId: context.companyId,
          ...parsed.data,
          version: 1,
          effectiveFrom: TODAY,
        })
        .returning();
  await recordAudit(
    context.companyId,
    "updated",
    "attendance_rules",
    rules.id,
    parsed.data,
  );
  res.json(UpdateAttendanceRulesResponse.parse(rules));
});

router.get("/schedules", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "schedules", false)) {
    res.status(403).json({ error: message(req, "attendanceRulesAccess") });
    return;
  }
  const schedules = await db
    .select()
    .from(workSchedulesTable)
    .where(eq(workSchedulesTable.companyId, context.companyId))
    .orderBy(asc(workSchedulesTable.name));
  res.json(ListWorkSchedulesResponse.parse(schedules.map(mapWorkSchedule)));
});

router.post("/schedules", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "schedules")) {
    res.status(403).json({ error: message(req, "attendanceRulesUpdate") });
    return;
  }
  const parsed = CreateWorkScheduleBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [schedule] = await db
    .insert(workSchedulesTable)
    .values({
      companyId: context.companyId,
      name: parsed.data.name,
      workingDays: parsed.data.workingDays,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      requiredHours: parsed.data.requiredHours,
      graceMinutes: parsed.data.graceMinutes,
      overtimeAfterMinutes: parsed.data.overtimeAfterMinutes,
      overtimeEligible: parsed.data.overtimeEligible,
      active: parsed.data.active,
    })
    .returning();
  await recordAudit(
    context.companyId,
    "created",
    "work_schedule",
    schedule.id,
    schedule,
  );
  res
    .status(201)
    .json(CreateWorkScheduleResponse.parse(mapWorkSchedule(schedule)));
});

router.patch("/schedules/:scheduleId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "schedules")) {
    res.status(403).json({ error: message(req, "attendanceRulesUpdate") });
    return;
  }
  const params = UpdateWorkScheduleParams.safeParse(req.params);
  const parsed = UpdateWorkScheduleBody.safeParse(req.body ?? {});
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (!isUuid(params.data.scheduleId)) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [existing] = await db
    .select()
    .from(workSchedulesTable)
    .where(
      and(
        eq(workSchedulesTable.id, params.data.scheduleId),
        eq(workSchedulesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [schedule] = await db
    .update(workSchedulesTable)
    .set({
      name: parsed.data.name,
      workingDays: parsed.data.workingDays,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      requiredHours: parsed.data.requiredHours,
      graceMinutes: parsed.data.graceMinutes,
      overtimeAfterMinutes: parsed.data.overtimeAfterMinutes,
      overtimeEligible: parsed.data.overtimeEligible,
      active: parsed.data.active,
      updatedAt: new Date(),
    })
    .where(eq(workSchedulesTable.id, existing.id))
    .returning();
  await recordAudit(
    context.companyId,
    "updated",
    "work_schedule",
    schedule.id,
    schedule,
    existing,
  );
  res.json(UpdateWorkScheduleResponse.parse(mapWorkSchedule(schedule)));
});

router.get(
  "/employees/:employeeId/schedule",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    const params = GetEmployeeScheduleParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    if (!isUuid(params.data.employeeId)) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    if (
      !canUseCapability(context, "schedules", true) &&
      params.data.employeeId !== context.employeeId
    ) {
      denyCapability(res, req, "schedules");
      return;
    }
    const access = await authorizedEmployee(context, params.data.employeeId);
    if (access.denied) {
      res.status(403).json({ error: message(req, "employeeOwnProfile") });
      return;
    }
    if (!access.employee) {
      res.status(404).json({ error: message(req, "employeeNotFound") });
      return;
    }
    const rows = await db
      .select({
        assignment: employeeScheduleAssignmentsTable,
        schedule: workSchedulesTable,
      })
      .from(employeeScheduleAssignmentsTable)
      .innerJoin(
        workSchedulesTable,
        eq(employeeScheduleAssignmentsTable.scheduleId, workSchedulesTable.id),
      )
      .where(
        and(
          eq(employeeScheduleAssignmentsTable.companyId, context.companyId),
          eq(employeeScheduleAssignmentsTable.employeeId, access.employee.id),
          lte(employeeScheduleAssignmentsTable.effectiveFrom, TODAY),
        ),
      )
      .orderBy(desc(employeeScheduleAssignmentsTable.effectiveFrom));
    const effective = rows.find(
      (row) =>
        row.assignment.effectiveTo === null ||
        row.assignment.effectiveTo >= TODAY,
    );
    res.json(
      GetEmployeeScheduleResponse.parse(
        effectiveScheduleResponse(
          access.employee.id,
          effective?.schedule ?? null,
          effective?.assignment ?? null,
        ),
      ),
    );
  },
);

router.put(
  "/employees/:employeeId/schedule",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canUseCapability(context, "schedules")) {
      res.status(403).json({ error: message(req, "attendanceRulesUpdate") });
      return;
    }
    const params = AssignEmployeeScheduleParams.safeParse(req.params);
    const parsed = AssignEmployeeScheduleBody.safeParse(req.body ?? {});
    if (!params.success || !parsed.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    if (!isUuid(params.data.employeeId) || !isUuid(parsed.data.scheduleId)) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const [employee] = await db
      .select()
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.id, params.data.employeeId),
          eq(employeesTable.companyId, context.companyId),
        ),
      )
      .limit(1);
    const [schedule] = await db
      .select()
      .from(workSchedulesTable)
      .where(
        and(
          eq(workSchedulesTable.id, parsed.data.scheduleId),
          eq(workSchedulesTable.companyId, context.companyId),
          eq(workSchedulesTable.active, true),
        ),
      )
      .limit(1);
    if (!employee || !schedule) {
      res.status(404).json({
        error: message(req, !employee ? "employeeNotFound" : "invalidRequest"),
      });
      return;
    }
    if (
      parsed.data.effectiveTo &&
      parsed.data.effectiveTo < parsed.data.effectiveFrom
    ) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const assignments = await db
      .select()
      .from(employeeScheduleAssignmentsTable)
      .where(
        and(
          eq(employeeScheduleAssignmentsTable.companyId, context.companyId),
          eq(employeeScheduleAssignmentsTable.employeeId, employee.id),
        ),
      );
    const matchingStart = assignments.find(
      (assignment) => assignment.effectiveFrom === parsed.data.effectiveFrom,
    );
    const newEnd = parsed.data.effectiveTo ?? "9999-12-31";
    const overlaps = assignments.some((assignment) => {
      if (matchingStart?.id === assignment.id) return false;
      const existingEnd = assignment.effectiveTo ?? "9999-12-31";
      return (
        assignment.effectiveFrom <= newEnd &&
        existingEnd >= parsed.data.effectiveFrom
      );
    });
    if (overlaps) {
      res.status(409).json({ error: message(req, "invalidRequest") });
      return;
    }
    const assignment = matchingStart
      ? (
          await db
            .update(employeeScheduleAssignmentsTable)
            .set({
              scheduleId: schedule.id,
              effectiveTo: parsed.data.effectiveTo ?? null,
            })
            .where(eq(employeeScheduleAssignmentsTable.id, matchingStart.id))
            .returning()
        )[0]
      : (
          await db
            .insert(employeeScheduleAssignmentsTable)
            .values({
              companyId: context.companyId,
              employeeId: employee.id,
              scheduleId: schedule.id,
              effectiveFrom: parsed.data.effectiveFrom,
              effectiveTo: parsed.data.effectiveTo ?? null,
            })
            .returning()
        )[0];
    await recordAudit(
      context.companyId,
      matchingStart ? "updated" : "created",
      "employee_schedule_assignment",
      assignment.id,
      assignment,
    );
    res.json(
      AssignEmployeeScheduleResponse.parse(
        effectiveScheduleResponse(employee.id, schedule, assignment),
      ),
    );
  },
);

router.get("/holidays", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "holidays", true)) {
    denyCapability(res, req, "holidays");
    return;
  }
  const holidays = await db
    .select()
    .from(holidaysTable)
    .where(eq(holidaysTable.companyId, context.companyId))
    .orderBy(asc(holidaysTable.date), asc(holidaysTable.name));
  res.json(ListHolidaysResponse.parse(holidays.map(mapHoliday)));
});

router.post("/holidays", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "holidays")) {
    res.status(403).json({ error: message(req, "attendanceRulesUpdate") });
    return;
  }
  const parsed = CreateHolidayBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [existing] = await db
    .select({ id: holidaysTable.id })
    .from(holidaysTable)
    .where(
      and(
        eq(holidaysTable.companyId, context.companyId),
        eq(holidaysTable.date, parsed.data.date),
      ),
    )
    .limit(1);
  if (existing) {
    res.status(409).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [holiday] = await db
    .insert(holidaysTable)
    .values({
      companyId: context.companyId,
      name: parsed.data.name,
      date: parsed.data.date,
      recurring: parsed.data.recurring,
    })
    .returning();
  await recordAudit(
    context.companyId,
    "created",
    "holiday",
    holiday.id,
    holiday,
  );
  res.status(201).json(CreateHolidayResponse.parse(mapHoliday(holiday)));
});

router.patch("/holidays/:holidayId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "holidays")) {
    res.status(403).json({ error: message(req, "attendanceRulesUpdate") });
    return;
  }
  const params = UpdateHolidayParams.safeParse(req.params);
  const parsed = UpdateHolidayBody.safeParse(req.body ?? {});
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (!isUuid(params.data.holidayId)) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [existing] = await db
    .select()
    .from(holidaysTable)
    .where(
      and(
        eq(holidaysTable.id, params.data.holidayId),
        eq(holidaysTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [duplicate] = await db
    .select({ id: holidaysTable.id })
    .from(holidaysTable)
    .where(
      and(
        eq(holidaysTable.companyId, context.companyId),
        eq(holidaysTable.date, parsed.data.date),
        sql`${holidaysTable.id} <> ${existing.id}`,
      ),
    )
    .limit(1);
  if (duplicate) {
    res.status(409).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [holiday] = await db
    .update(holidaysTable)
    .set({
      name: parsed.data.name,
      date: parsed.data.date,
      recurring: parsed.data.recurring,
    })
    .where(eq(holidaysTable.id, existing.id))
    .returning();
  await recordAudit(
    context.companyId,
    "updated",
    "holiday",
    holiday.id,
    holiday,
    existing,
  );
  res.json(UpdateHolidayResponse.parse(mapHoliday(holiday)));
});

router.delete("/holidays/:holidayId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canManageCompany(context)) {
    res.status(403).json({ error: message(req, "attendanceRulesUpdate") });
    return;
  }
  const params = DeleteHolidayParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (!isUuid(params.data.holidayId)) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [holiday] = await db
    .select()
    .from(holidaysTable)
    .where(
      and(
        eq(holidaysTable.id, params.data.holidayId),
        eq(holidaysTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!holiday) {
    res.status(404).json({ error: message(req, "invalidRequest") });
    return;
  }
  await db.delete(holidaysTable).where(eq(holidaysTable.id, holiday.id));
  await recordAudit(
    context.companyId,
    "deleted",
    "holiday",
    holiday.id,
    null,
    holiday,
  );
  res.status(204).send(DeleteHolidayResponse.parse(undefined));
});

router.get(
  "/employees/:employeeId/hr-record",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    const params = GetEmployeeHrRecordParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    if (!isUuid(params.data.employeeId)) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const access = await authorizedEmployee(context, params.data.employeeId);
    if (access.denied) {
      res.status(403).json({ error: message(req, "employeeOwnProfile") });
      return;
    }
    if (!access.employee) {
      res.status(404).json({ error: message(req, "employeeNotFound") });
      return;
    }
    const [record] = await db
      .select()
      .from(employeeHrRecordsTable)
      .where(
        and(
          eq(employeeHrRecordsTable.companyId, context.companyId),
          eq(employeeHrRecordsTable.employeeId, access.employee.id),
        ),
      )
      .limit(1);
    if (!record) {
      res.status(404).json({ error: message(req, "employeeNotFound") });
      return;
    }
    res.json(GetEmployeeHrRecordResponse.parse(mapEmployeeHrRecord(record)));
  },
);

router.put(
  "/employees/:employeeId/hr-record",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canManageCompany(context)) {
      res
        .status(403)
        .json({ error: message(req, "noPermissionManageEmployees") });
      return;
    }
    const params = UpdateEmployeeHrRecordParams.safeParse(req.params);
    const parsed = UpdateEmployeeHrRecordBody.safeParse(req.body ?? {});
    if (!params.success || !parsed.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    if (
      !isUuid(params.data.employeeId) ||
      (parsed.data.managerId !== null &&
        parsed.data.managerId !== undefined &&
        !isUuid(parsed.data.managerId))
    ) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const [employee] = await db
      .select()
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.id, params.data.employeeId),
          eq(employeesTable.companyId, context.companyId),
        ),
      )
      .limit(1);
    if (!employee) {
      res.status(404).json({ error: message(req, "employeeNotFound") });
      return;
    }
    if (parsed.data.managerId) {
      if (parsed.data.managerId === employee.id) {
        res.status(400).json({ error: message(req, "invalidRequest") });
        return;
      }
      const [manager] = await db
        .select({ id: employeesTable.id })
        .from(employeesTable)
        .where(
          and(
            eq(employeesTable.id, parsed.data.managerId),
            eq(employeesTable.companyId, context.companyId),
            eq(employeesTable.role, "manager"),
          ),
        )
        .limit(1);
      if (!manager) {
        res.status(400).json({ error: message(req, "employeeNotFound") });
        return;
      }
    }
    const [existing] = await db
      .select()
      .from(employeeHrRecordsTable)
      .where(
        and(
          eq(employeeHrRecordsTable.companyId, context.companyId),
          eq(employeeHrRecordsTable.employeeId, employee.id),
        ),
      )
      .limit(1);
    const nextRecord = {
      jobTitle:
        parsed.data.jobTitle !== undefined
          ? parsed.data.jobTitle
          : (existing?.jobTitle ?? null),
      employmentType:
        parsed.data.employmentType !== undefined
          ? parsed.data.employmentType
          : (existing?.employmentType ?? null),
      managerId:
        parsed.data.managerId !== undefined
          ? parsed.data.managerId
          : (existing?.managerId ?? null),
      address:
        parsed.data.address !== undefined
          ? parsed.data.address
          : (existing?.address ?? null),
      emergencyContactName:
        parsed.data.emergencyContactName !== undefined
          ? parsed.data.emergencyContactName
          : (existing?.emergencyContactName ?? null),
      emergencyContactPhone:
        parsed.data.emergencyContactPhone !== undefined
          ? parsed.data.emergencyContactPhone
          : (existing?.emergencyContactPhone ?? null),
      notes:
        parsed.data.notes !== undefined
          ? parsed.data.notes
          : (existing?.notes ?? null),
      updatedAt: new Date(),
    };
    const record = existing
      ? (
          await db
            .update(employeeHrRecordsTable)
            .set(nextRecord)
            .where(
              and(
                eq(employeeHrRecordsTable.id, existing.id),
                eq(employeeHrRecordsTable.companyId, context.companyId),
                eq(employeeHrRecordsTable.employeeId, employee.id),
              ),
            )
            .returning()
        )[0]
      : (
          await db
            .insert(employeeHrRecordsTable)
            .values({
              companyId: context.companyId,
              employeeId: employee.id,
              ...nextRecord,
            })
            .onConflictDoUpdate({
              target: employeeHrRecordsTable.employeeId,
              set: nextRecord,
            })
            .returning()
        )[0];
    if (!record) {
      res.status(404).json({ error: message(req, "employeeNotFound") });
      return;
    }
    await recordAudit(
      context.companyId,
      existing ? "updated" : "created",
      "employee_hr_record",
      record.id,
      record,
      existing,
    );
    res.json(UpdateEmployeeHrRecordResponse.parse(mapEmployeeHrRecord(record)));
  },
);

router.get("/reports/attendance", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "reports.view", true)) {
    denyCapability(res, req, "reports.view");
    return;
  }
  const query = GetAttendanceReportQueryParams.safeParse({
    ...req.query,
    from: req.query.from ? String(req.query.from) : undefined,
    to: req.query.to ? String(req.query.to) : undefined,
  });
  if (!query.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (query.data.from && query.data.to && query.data.from > query.data.to) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const from = calendarDate(query.data.from) ?? "2026-08-01";
  const to = calendarDate(query.data.to) ?? TODAY;
  const rows = await getAttendanceRows(context, from, to);
  const grouped = new Map<
    string,
    {
      employee: ReturnType<typeof employeeReference>;
      presentDays: number;
      lateDays: number;
      absentDays: number;
      overtimeHours: number;
      workedHours: number;
    }
  >();
  for (const row of rows) {
    const current = grouped.get(row.employee.id) ?? {
      employee: employeeReference(row.employee, row.department.name),
      presentDays: 0,
      lateDays: 0,
      absentDays: 0,
      overtimeHours: 0,
      workedHours: 0,
    };
    if (row.attendance.status === "present") current.presentDays += 1;
    if (row.attendance.status === "late") current.lateDays += 1;
    if (row.attendance.status === "absent") current.absentDays += 1;
    current.overtimeHours += row.attendance.overtimeHours;
    current.workedHours += row.attendance.workedHours;
    grouped.set(row.employee.id, current);
  }
  const response = {
    from,
    to,
    totals: {
      present: rows.filter((row) => row.attendance.status === "present").length,
      late: rows.filter((row) => row.attendance.status === "late").length,
      absent: rows.filter((row) => row.attendance.status === "absent").length,
      onLeave: rows.filter((row) => row.attendance.status === "on_leave")
        .length,
      overtimeHours: rows.reduce(
        (total, row) => total + row.attendance.overtimeHours,
        0,
      ),
    },
    rows: [...grouped.values()],
  };
  res.json(GetAttendanceReportResponse.parse(response));
});

router.get("/reports/data", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "reports.view", true)) {
    denyCapability(res, req, "reports.view");
    return;
  }
  const query = GetReportQueryParams.safeParse({
    ...req.query,
    from: req.query.from ? String(req.query.from) : undefined,
    to: req.query.to ? String(req.query.to) : undefined,
    employeeId: req.query.employeeId ? String(req.query.employeeId) : undefined,
    departmentId: req.query.departmentId
      ? String(req.query.departmentId)
      : undefined,
    status: req.query.status ? String(req.query.status) : undefined,
    attendanceStatus: req.query.attendanceStatus
      ? String(req.query.attendanceStatus)
      : undefined,
    leaveStatus: req.query.leaveStatus
      ? String(req.query.leaveStatus)
      : undefined,
    permissionStatus: req.query.permissionStatus
      ? String(req.query.permissionStatus)
      : undefined,
    payrollStatus: req.query.payrollStatus
      ? String(req.query.payrollStatus)
      : undefined,
    periodId: req.query.periodId ? String(req.query.periodId) : undefined,
    leaveType: req.query.leaveType ? String(req.query.leaveType) : undefined,
    permissionType: req.query.permissionType
      ? String(req.query.permissionType)
      : undefined,
  });
  if (!query.success) {
    res.status(400).json({ error: message(req, "reportInvalid") });
    return;
  }
  const filters: ReportFilters = query.data;
  const referenceError = await validateReportReferences(context, filters);
  if (referenceError) {
    res
      .status(referenceError.status)
      .json({ error: message(req, referenceError.key) });
    return;
  }
  const from = query.data.from ?? "2026-08-01";
  const to = query.data.to ?? TODAY;
  if (from > to) {
    res.status(400).json({ error: message(req, "reportInvalid") });
    return;
  }
  const employeeCondition = and(
    eq(employeesTable.companyId, context.companyId),
    employeeScopeCondition(context),
    query.data.employeeId
      ? eq(employeesTable.id, query.data.employeeId)
      : undefined,
    query.data.departmentId
      ? eq(employeesTable.departmentId, query.data.departmentId)
      : undefined,
  );
  const employees = await db
    .select({
      employee: employeesTable,
      department: departmentsTable,
      branch: branchesTable,
    })
    .from(employeesTable)
    .innerJoin(
      departmentsTable,
      eq(employeesTable.departmentId, departmentsTable.id),
    )
    .innerJoin(branchesTable, eq(employeesTable.branchId, branchesTable.id))
    .where(employeeCondition);
  const response = {
    reportType: query.data.type,
    company: {
      id: context.company.id,
      name: context.company.name,
      slug: context.company.slug,
      timezone: context.company.timezone,
      currency: context.company.currency,
    },
    from,
    to,
    currency: context.company.currency,
    periodLabel: undefined as string | undefined,
    totals: {
      records: 0,
      workedHours: 0,
      overtimeHours: 0,
      presentDays: 0,
      lateDays: 0,
      absentDays: 0,
      leaveDays: 0,
      gross: 0,
      additions: 0,
      deductions: 0,
      net: 0,
      overtimeAmount: 0,
    },
    rows: [] as Array<Record<string, unknown>>,
  };
  if (query.data.type === "employees") {
    const filtered = employees.filter((row) =>
      reportEmployeeMatches(row.employee, filters),
    );
    response.rows = filtered.map((row) => ({
      employee: employeeReference(row.employee, row.department.name),
      department: row.department.name,
      branch: row.branch.name,
      email: row.employee.email,
      joinedOn: row.employee.joinedOn,
      salary: row.employee.salary,
      status: row.employee.status,
      role: row.employee.role,
    }));
    response.totals.records = response.rows.length;
  } else if (query.data.type === "attendance") {
    const rows = (
      await getAttendanceRows(
        context,
        from,
        to,
        query.data.employeeId,
        query.data.departmentId,
      )
    )
      .filter((row) => reportEmployeeMatches(row.employee, filters))
      .filter(
        (row) =>
          !filters.attendanceStatus ||
          row.attendance.status === filters.attendanceStatus,
      );
    response.rows = rows.map((row) => ({
      employee: employeeReference(row.employee, row.department.name),
      date: row.attendance.date,
      attendanceStatus: row.attendance.status,
      workedHours: row.attendance.workedHours,
      overtimeHours: row.attendance.overtimeHours,
      lateMinutes: row.attendance.lateMinutes,
      earlyCheckoutMinutes: row.attendance.earlyCheckoutMinutes,
      checkIn: asDate(row.attendance.checkIn),
      checkOut: asDate(row.attendance.checkOut),
      locationStatus: row.attendance.locationStatus,
    }));
    response.totals.records = rows.length;
    response.totals.workedHours = rows.reduce(
      (t, r) => t + r.attendance.workedHours,
      0,
    );
    response.totals.overtimeHours = rows.reduce(
      (t, r) => t + r.attendance.overtimeHours,
      0,
    );
    response.totals.presentDays = rows.filter(
      (r) => r.attendance.status === "present",
    ).length;
    response.totals.lateDays = rows.filter(
      (r) => r.attendance.status === "late",
    ).length;
    response.totals.absentDays = rows.filter(
      (r) => r.attendance.status === "absent",
    ).length;
  } else if (query.data.type === "leave" || query.data.type === "permission") {
    const rows =
      query.data.type === "leave"
        ? await leaveRows(context)
        : await permissionRows(context);
    response.rows = rows
      .filter((row) => reportEmployeeMatches(row.employee, filters))
      .filter((row) => {
        if (query.data.type === "leave") {
          return (
            "from" in row.request &&
            "to" in row.request &&
            requestOverlapsRange(row.request.from, row.request.to, from, to)
          );
        }
        return (
          "date" in row.request &&
          row.request.date >= from &&
          row.request.date <= to
        );
      })
      .filter((row) =>
        query.data.type === "leave"
          ? !filters.leaveStatus || row.request.status === filters.leaveStatus
          : !filters.permissionStatus ||
            row.request.status === filters.permissionStatus,
      )
      .filter(
        (row) =>
          !query.data.leaveType ||
          query.data.type !== "leave" ||
          row.request.type === query.data.leaveType,
      )
      .filter(
        (row) =>
          !query.data.permissionType ||
          query.data.type !== "permission" ||
          row.request.type === query.data.permissionType,
      )
      .map((row) => ({
        employee: employeeReference(row.employee, row.department.name),
        type: row.request.type,
        status: row.request.status,
        reason: row.request.reason,
        from: "from" in row.request ? row.request.from : null,
        to: "to" in row.request ? row.request.to : null,
        date: "date" in row.request ? row.request.date : null,
        startTime: "startTime" in row.request ? row.request.startTime : null,
        endTime: "endTime" in row.request ? row.request.endTime : null,
        durationHours:
          "startTime" in row.request && "endTime" in row.request
            ? timeDurationHours(row.request.startTime, row.request.endTime)
            : 0,
        days: "days" in row.request ? row.request.days : 0,
      }));
    response.totals.records = response.rows.length;
    response.totals.leaveDays =
      query.data.type === "leave"
        ? response.rows.reduce((t, r: any) => t + (r.days ?? 0), 0)
        : 0;
  } else if (query.data.type === "overtime") {
    const rows = (
      await getAttendanceRows(
        context,
        from,
        to,
        query.data.employeeId,
        query.data.departmentId,
      )
    )
      .filter((row) => reportEmployeeMatches(row.employee, filters))
      .filter(
        (row) =>
          !filters.attendanceStatus ||
          row.attendance.status === filters.attendanceStatus,
      )
      .filter((row) => row.attendance.overtimeHours > 0);
    response.rows = rows.map((row) => ({
      employee: employeeReference(row.employee, row.department.name),
      overtimeHours: row.attendance.overtimeHours,
      workedHours: row.attendance.workedHours,
      lateMinutes: row.attendance.lateMinutes,
      earlyCheckoutMinutes: row.attendance.earlyCheckoutMinutes,
      attendanceStatus: row.attendance.status,
      date: row.attendance.date,
    }));
    response.totals.records = rows.length;
    response.totals.overtimeHours = rows.reduce(
      (t, r) => t + r.attendance.overtimeHours,
      0,
    );
    response.totals.workedHours = rows.reduce(
      (t, r) => t + r.attendance.workedHours,
      0,
    );
  } else if (query.data.type === "payroll") {
    if (!canViewPayroll(context) && context.role !== "employee") {
      res.status(403).json({ error: message(req, "payrollAccess") });
      return;
    }
    const [period] = await db
      .select()
      .from(payrollPeriodsTable)
      .where(
        and(
          eq(payrollPeriodsTable.companyId, context.companyId),
          query.data.periodId
            ? eq(payrollPeriodsTable.id, query.data.periodId)
            : undefined,
        ),
      )
      .orderBy(desc(payrollPeriodsTable.to))
      .limit(1);
    if (!period) {
      res.status(404).json({ error: message(req, "reportNotFound") });
      return;
    }
    response.from = period.from;
    response.to = period.to;
    response.periodLabel = period.label;
    const rows = await db
      .select({
        calculation: payrollCalculationsTable,
        employee: employeesTable,
        department: departmentsTable,
      })
      .from(payrollCalculationsTable)
      .innerJoin(
        employeesTable,
        eq(payrollCalculationsTable.employeeId, employeesTable.id),
      )
      .innerJoin(
        departmentsTable,
        eq(employeesTable.departmentId, departmentsTable.id),
      )
      .where(
        and(
          eq(payrollCalculationsTable.companyId, context.companyId),
          eq(payrollCalculationsTable.periodId, period.id),
          employeeScopeCondition(context),
          query.data.employeeId
            ? eq(employeesTable.id, query.data.employeeId)
            : undefined,
          query.data.departmentId
            ? eq(employeesTable.departmentId, query.data.departmentId)
            : undefined,
        ),
      );
    const filtered = rows.filter(
      (row) =>
        reportEmployeeMatches(row.employee, filters) &&
        (!filters.payrollStatus || period.status === filters.payrollStatus),
    );
    response.rows = filtered.map((row) => ({
      employee: employeeReference(row.employee, row.department.name),
      periodId: period.id,
      periodLabel: period.label,
      payrollStatus: period.status,
      gross:
        row.calculation.basicSalary +
        row.calculation.additions +
        row.calculation.overtime,
      additions: row.calculation.additions,
      deductions:
        row.calculation.attendanceDeductions + row.calculation.otherDeductions,
      net: row.calculation.netSalary,
      regularHours: row.calculation.regularHours,
      overtimeHours: row.calculation.overtimeHours,
      overtimeAmount: row.calculation.overtime,
      lateMinutes: row.calculation.lateMinutes,
      earlyCheckoutMinutes: row.calculation.earlyCheckoutMinutes,
      absentDays: row.calculation.absentDays,
      payrollLineItems: row.calculation.lineItems,
    }));
    response.totals.records = filtered.length;
    response.totals.gross = filtered.reduce(
      (t, r) =>
        t +
        r.calculation.basicSalary +
        r.calculation.additions +
        r.calculation.overtime,
      0,
    );
    response.totals.additions = filtered.reduce(
      (t, r) => t + r.calculation.additions,
      0,
    );
    response.totals.deductions = filtered.reduce(
      (t, r) =>
        t + r.calculation.attendanceDeductions + r.calculation.otherDeductions,
      0,
    );
    response.totals.net = filtered.reduce(
      (t, r) => t + r.calculation.netSalary,
      0,
    );
    response.totals.overtimeHours = filtered.reduce(
      (t, r) => t + r.calculation.overtimeHours,
      0,
    );
    response.totals.overtimeAmount = filtered.reduce(
      (t, r) => t + r.calculation.overtime,
      0,
    );
  }
  res.json(GetReportResponse.parse(response));
});

router.post("/employees/import", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canManageCompany(context)) {
    res.status(403).json({ error: message(req, "reportImportAccess") });
    return;
  }
  const parsed = employeeImportInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "reportValidationFailed") });
    return;
  }
  const normalizeHeader = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");
  const aliases: Record<string, string> = {
    employeenumber: "employeeNumber",
    employeeid: "employeeNumber",
    firstname: "firstName",
    lastname: "lastName",
    email: "email",
    phone: "phone",
    departmentid: "departmentId",
    branchid: "branchId",
    status: "status",
    role: "role",
    joinedon: "joinedOn",
    salary: "salary",
  };
  const canonicalHeaders = parsed.data.headers.map(normalizeHeader);
  const requiredHeaders = [
    "firstname",
    "lastname",
    "email",
    "departmentid",
    "branchid",
    "joinedon",
    "salary",
  ];
  const headerError = canonicalHeaders.some(
    (header, index) =>
      !aliases[header] || canonicalHeaders.indexOf(header) !== index,
  )
    ? message(req, "reportValidationFailed")
    : requiredHeaders.some((header) => !canonicalHeaders.includes(header))
      ? message(req, "reportValidationFailed")
      : null;
  const result = {
    imported: 0,
    failed: 0,
    rows: [] as Array<{
      row: number;
      success: boolean;
      employeeId: string | null;
      error: string | null;
    }>,
  };
  if (headerError) {
    result.failed = parsed.data.rows.length;
    result.rows = parsed.data.rows.map((_, index) => ({
      row: index + 2,
      success: false,
      employeeId: null,
      error: headerError,
    }));
    res.status(400).json(employeeImportResultSchema.parse(result));
    return;
  }
  const [existingEmployees, departments, branches] = await Promise.all([
    db
      .select({
        id: employeesTable.id,
        email: employeesTable.email,
        employeeNumber: employeesTable.employeeNumber,
      })
      .from(employeesTable)
      .where(eq(employeesTable.companyId, context.companyId)),
    db
      .select()
      .from(departmentsTable)
      .where(eq(departmentsTable.companyId, context.companyId)),
    db
      .select()
      .from(branchesTable)
      .where(eq(branchesTable.companyId, context.companyId)),
  ]);
  const existingEmails = new Set(
    existingEmployees.map((item) => item.email.toLowerCase()),
  );
  const existingNumbers = new Set(
    existingEmployees.map((item) => item.employeeNumber.toLowerCase()),
  );
  const seenEmails = new Set<string>();
  const seenNumbers = new Set<string>();
  const departmentIds = new Set(departments.map((item) => item.id));
  const branchIds = new Set(branches.map((item) => item.id));
  const valueFor = (
    row: Record<string, unknown>,
    canonical: string,
  ): unknown => {
    const headerIndex = canonicalHeaders.findIndex(
      (header) => aliases[header] === canonical,
    );
    return headerIndex === -1
      ? undefined
      : row[parsed.data.headers[headerIndex]];
  };
  const preparedRows: Array<{
    rowNumber: number;
    values: {
      companyId: string;
      employeeNumber: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
      departmentId: string;
      branchId: string;
      status: string;
      role: string;
      joinedOn: string;
      salary: number;
    };
    resultIndex: number;
  }> = [];
  const nextEmployeeNumber = () => {
    let sequence = existingEmployees.length + preparedRows.length + 1;
    let candidate = `NS-${String(1100 + sequence).padStart(4, "0")}`;
    while (
      existingNumbers.has(candidate.toLowerCase()) ||
      seenNumbers.has(candidate.toLowerCase())
    ) {
      sequence += 1;
      candidate = `NS-${String(1100 + sequence).padStart(4, "0")}`;
    }
    return candidate;
  };
  for (const [index, row] of parsed.data.rows.entries()) {
    const rowNumber = index + 2;
    const read = (key: string) => {
      const value = valueFor(row, key);
      return typeof value === "string" ? value.trim() : value;
    };
    const firstName = read("firstName");
    const lastName = read("lastName");
    const email = read("email");
    const phone = read("phone");
    const departmentId = read("departmentId");
    const branchId = read("branchId");
    const joinedOn = read("joinedOn");
    const salaryValue = read("salary");
    const status = read("status") || "active";
    const role = read("role") || "employee";
    const providedNumber = read("employeeNumber");
    let error: string | null = null;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !departmentId ||
      !branchId ||
      !joinedOn ||
      salaryValue === undefined ||
      salaryValue === ""
    ) {
      error = message(req, "reportValidationFailed");
    } else if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      error = message(req, "reportValidationFailed");
    } else if (
      typeof departmentId !== "string" ||
      !departmentIds.has(departmentId) ||
      typeof branchId !== "string" ||
      !branchIds.has(branchId)
    ) {
      error = message(req, "reportReferenceMissing");
    } else if (
      typeof joinedOn !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(joinedOn) ||
      Number.isNaN(Date.parse(`${joinedOn}T00:00:00Z`))
    ) {
      error = message(req, "reportValidationFailed");
    } else if (
      typeof salaryValue !== "number" &&
      (typeof salaryValue !== "string" ||
        salaryValue.trim() === "" ||
        Number.isNaN(Number(salaryValue)))
    ) {
      error = message(req, "reportValidationFailed");
    } else if (
      Number(salaryValue) < 0 ||
      !["active", "inactive"].includes(String(status)) ||
      !["employee", "manager"].includes(String(role))
    ) {
      error = message(req, "reportValidationFailed");
    } else {
      const normalizedEmail = email.toLowerCase();
      const employeeNumber = String(
        providedNumber || nextEmployeeNumber(),
      ).trim();
      const normalizedNumber = employeeNumber.toLowerCase();
      if (
        existingEmails.has(normalizedEmail) ||
        seenEmails.has(normalizedEmail) ||
        existingNumbers.has(normalizedNumber) ||
        seenNumbers.has(normalizedNumber)
      ) {
        error = message(req, "reportDuplicate");
      } else {
        const resultIndex = result.rows.length;
        result.rows.push({
          row: rowNumber,
          success: true,
          employeeId: null,
          error: null,
        });
        preparedRows.push({
          rowNumber,
          resultIndex,
          values: {
            companyId: context.companyId,
            employeeNumber,
            firstName: String(firstName),
            lastName: String(lastName),
            email: String(email),
            phone: phone ? String(phone) : null,
            departmentId: String(departmentId),
            branchId: String(branchId),
            status: String(status),
            role: String(role),
            joinedOn: String(joinedOn),
            salary: Number(salaryValue),
          },
        });
        existingEmails.add(normalizedEmail);
        existingNumbers.add(normalizedNumber);
        seenEmails.add(normalizedEmail);
        seenNumbers.add(normalizedNumber);
      }
    }
    if (error) {
      result.failed += 1;
      result.rows.push({
        row: rowNumber,
        success: false,
        employeeId: null,
        error,
      });
    }
  }
  if (result.failed) {
    const atomicError = message(req, "reportImportAtomicAborted");
    result.imported = 0;
    result.failed = parsed.data.rows.length;
    result.rows = result.rows.map((row) =>
      row.success
        ? { ...row, success: false, employeeId: null, error: atomicError }
        : row,
    );
    res.status(400).json(employeeImportResultSchema.parse(result));
    return;
  }
  const capacity = await ensureEmployeeCapacity(context.companyId);
  const incomingActiveEmployees = preparedRows.filter(
    (prepared) => prepared.values.status === "active",
  ).length;
  if (
    capacity.employeeLimit > 0 &&
    capacity.activeEmployees + incomingActiveEmployees > capacity.employeeLimit
  ) {
    res.status(409).json({
      error: message(req, "activeEmployeeLimit", {
        limit: capacity.employeeLimit,
      }),
      code: "ACTIVE_EMPLOYEE_LIMIT",
    });
    return;
  }
  try {
    await db.transaction(async (tx) => {
      for (const prepared of preparedRows) {
        const [employee] = await tx
          .insert(employeesTable)
          .values(prepared.values)
          .returning({ id: employeesTable.id });
        result.rows[prepared.resultIndex] = {
          row: prepared.rowNumber,
          success: true,
          employeeId: employee.id,
          error: null,
        };
        await tx.insert(auditLogsTable).values({
          companyId: context.companyId,
          actorType: "workspace_demo",
          actorId: "demo-actor",
          action: "created",
          entityType: "employee",
          entityId: employee.id,
          before: null,
          after: prepared.values,
        });
      }
    });
    result.imported = preparedRows.length;
  } catch {
    res.status(500).json({ error: message(req, "internalError") });
    return;
  }
  res.status(201).json(employeeImportResultSchema.parse(result));
});

router.get("/payroll/periods", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canViewPayroll(context)) {
    res.status(403).json({ error: message(req, "payrollAccess") });
    return;
  }
  const periods = await db
    .select()
    .from(payrollPeriodsTable)
    .where(eq(payrollPeriodsTable.companyId, context.companyId))
    .orderBy(desc(payrollPeriodsTable.to));
  res.json(
    ListPayrollPeriodsResponse.parse(periods.map(payrollPeriodResponse)),
  );
});

router.post("/payroll/periods", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canManageCompany(context)) {
    res.status(403).json({ error: message(req, "payrollManage") });
    return;
  }
  const parsed = CreatePayrollPeriodBody.safeParse(req.body);
  if (!parsed.success || parsed.data.from > parsed.data.to) {
    res.status(400).json({ error: message(req, "payrollPeriodInvalid") });
    return;
  }
  const [overlap] = await db
    .select({ id: payrollPeriodsTable.id })
    .from(payrollPeriodsTable)
    .where(
      and(
        eq(payrollPeriodsTable.companyId, context.companyId),
        lte(payrollPeriodsTable.from, parsed.data.to),
        gte(payrollPeriodsTable.to, parsed.data.from),
      ),
    )
    .limit(1);
  if (overlap) {
    res.status(409).json({ error: message(req, "payrollPeriodOverlap") });
    return;
  }
  const [period] = await db
    .insert(payrollPeriodsTable)
    .values({
      companyId: context.companyId,
      label: parsed.data.label,
      from: parsed.data.from,
      to: parsed.data.to,
      status: "draft",
    })
    .returning();
  await recordAudit(
    context.companyId,
    "created",
    "payroll_period",
    period.id,
    period,
  );
  res
    .status(201)
    .json(CreatePayrollPeriodResponse.parse(payrollPeriodResponse(period)));
});

async function storedPayrollCalculation(
  context: TenantContext,
  req: Request,
  period: typeof payrollPeriodsTable.$inferSelect,
) {
  const rows = await db
    .select({
      calculation: payrollCalculationsTable,
      employee: employeesTable,
      department: departmentsTable,
    })
    .from(payrollCalculationsTable)
    .innerJoin(
      employeesTable,
      eq(payrollCalculationsTable.employeeId, employeesTable.id),
    )
    .innerJoin(
      departmentsTable,
      eq(employeesTable.departmentId, departmentsTable.id),
    )
    .where(
      and(
        eq(payrollCalculationsTable.companyId, context.companyId),
        eq(payrollCalculationsTable.periodId, period.id),
        employeeScopeCondition(context),
      ),
    )
    .orderBy(desc(payrollCalculationsTable.calculatedAt));
  const latest = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    if (!latest.has(row.calculation.employeeId))
      latest.set(row.calculation.employeeId, row);
  }
  const items = [...latest.values()].map((row) => ({
    employee: employeeReference(row.employee, row.department.name),
    basicSalary: row.calculation.basicSalary,
    additions: row.calculation.additions,
    overtime: row.calculation.overtime,
    attendanceDeductions: row.calculation.attendanceDeductions,
    otherDeductions: row.calculation.otherDeductions,
    netSalary: row.calculation.netSalary,
    regularHours: row.calculation.regularHours,
    overtimeHours: row.calculation.overtimeHours,
    lateMinutes: row.calculation.lateMinutes,
    earlyCheckoutMinutes: row.calculation.earlyCheckoutMinutes,
    missingHours: row.calculation.missingHours,
    absentDays: row.calculation.absentDays,
    lineItems: row.calculation.lineItems as PayrollLineItem[],
  }));
  if (!items.length) return null;
  const totals = items.reduce(
    (total, item) => ({
      basicSalary: total.basicSalary + item.basicSalary,
      additions: total.additions + item.additions,
      overtime: total.overtime + item.overtime,
      attendanceDeductions:
        total.attendanceDeductions + item.attendanceDeductions,
      otherDeductions: total.otherDeductions + item.otherDeductions,
      netSalary: total.netSalary + item.netSalary,
    }),
    {
      basicSalary: 0,
      additions: 0,
      overtime: 0,
      attendanceDeductions: 0,
      otherDeductions: 0,
      netSalary: 0,
    },
  );
  const calculatedAt = rows[0].calculation.calculatedAt.toISOString();
  return {
    period: payrollPeriodResponse(period),
    calculatedAt,
    items,
    totals: Object.fromEntries(
      Object.entries(totals).map(([key, value]) => [key, moneyValue(value)]),
    ),
    explanation: message(req, "payrollFoundationExplanation"),
  };
}

async function calculatePayrollPeriod(
  context: TenantContext,
  req: Request,
  period: typeof payrollPeriodsTable.$inferSelect,
) {
  const existing = await storedPayrollCalculation(context, req, period);
  if (period.status === "finalized" || period.status === "locked")
    return existing;
  const rules = await attendanceRulesFor(context.companyId);
  const rows = (await employeeRows(context)).filter(
    (row) => row.employee.status === "active",
  );
  const attendance = await getAttendanceRows(context, period.from, period.to);
  const approvedLeaves = await db
    .select()
    .from(leaveRequestsTable)
    .where(
      and(
        eq(leaveRequestsTable.companyId, context.companyId),
        eq(leaveRequestsTable.status, "approved"),
      ),
    );
  const approvedPermissions = await db
    .select()
    .from(permissionRequestsTable)
    .where(
      and(
        eq(permissionRequestsTable.companyId, context.companyId),
        eq(permissionRequestsTable.status, "approved"),
      ),
    );
  const dates = dateStrings(period.from, period.to);
  const holidays = await holidaysForCompany(context.companyId);
  const scheduleRows = await scheduleRowsForCompany(context.companyId);
  const adjustments = await db
    .select()
    .from(payrollAdjustmentsTable)
    .where(
      and(
        eq(payrollAdjustmentsTable.companyId, context.companyId),
        eq(payrollAdjustmentsTable.periodId, period.id),
      ),
    );
  const existingVersions = await db
    .select({ calculationVersion: payrollCalculationsTable.calculationVersion })
    .from(payrollCalculationsTable)
    .where(
      and(
        eq(payrollCalculationsTable.companyId, context.companyId),
        eq(payrollCalculationsTable.periodId, period.id),
      ),
    );
  const calculationVersion =
    Math.max(0, ...existingVersions.map((item) => item.calculationVersion)) + 1;
  let totalNet = 0;

  for (const row of rows) {
    const employeeAttendance = attendance.filter(
      (item) => item.employee.id === row.employee.id,
    );
    const attendanceByDate = new Map(
      employeeAttendance.map((item) => [item.attendance.date, item.attendance]),
    );
    const scheduledDates = dates.filter((dateValue) => {
      const schedule = effectiveScheduleFromRows(
        row.employee.id,
        dateValue,
        rules,
        scheduleRows,
      );
      return (
        isWorkingScheduleDay(schedule, dateValue) &&
        !isHolidayDate(dateValue, rules, holidays)
      );
    });
    const scheduledDayCount = Math.max(1, scheduledDates.length);
    const leaveDates = new Set(
      approvedLeaves
        .filter(
          (leave) =>
            leave.employeeId === row.employee.id &&
            leave.from <= period.to &&
            leave.to >= period.from,
        )
        .flatMap((leave) =>
          dateStrings(
            leave.from < period.from ? period.from : leave.from,
            leave.to > period.to ? period.to : leave.to,
          ),
        ),
    );
    const permissionDates = new Set(
      approvedPermissions
        .filter(
          (permission) =>
            permission.employeeId === row.employee.id &&
            permission.date >= period.from &&
            permission.date <= period.to,
        )
        .map((permission) => permission.date),
    );
    const absentDays = scheduledDates.filter(
      (dateValue) =>
        !attendanceByDate.has(dateValue) &&
        !leaveDates.has(dateValue) &&
        !permissionDates.has(dateValue),
    ).length;
    const overtimeHours = employeeAttendance.reduce(
      (total, item) => total + item.attendance.overtimeHours,
      0,
    );
    const regularHours = employeeAttendance.reduce(
      (total, item) =>
        total +
        Math.max(
          0,
          item.attendance.workedHours - item.attendance.overtimeHours,
        ),
      0,
    );
    const lateMinutes = employeeAttendance.reduce(
      (total, item) => total + item.attendance.lateMinutes,
      0,
    );
    const earlyCheckoutMinutes = employeeAttendance.reduce(
      (total, item) => total + item.attendance.earlyCheckoutMinutes,
      0,
    );
    const missingHours = employeeAttendance.reduce(
      (total, item) => total + item.attendance.missingMinutes / 60,
      0,
    );
    const hourlyRate =
      row.employee.salary / Math.max(1, rules.hourlyRateDivisor);
    const overtime = rules.overtimeEligible
      ? moneyValue(
          overtimeHours *
            hourlyRate *
            (rules.overtimeMethod === "multiplier"
              ? rules.overtimeMultiplier
              : 1),
        )
      : 0;
    const lateDeduction =
      rules.lateDeductionMethod === "none"
        ? 0
        : rules.lateDeductionMethod === "fixed_per_minute"
          ? moneyValue(lateMinutes * rules.lateDeductionFactor)
          : moneyValue(
              (lateMinutes / 60) * hourlyRate * rules.lateDeductionFactor,
            );
    const earlyDeduction = moneyValue(
      (earlyCheckoutMinutes / 60) *
        hourlyRate *
        rules.earlyCheckoutDeductionFactor,
    );
    const dailyRate = row.employee.salary / scheduledDayCount;
    const absenceDeduction =
      rules.absenceDeductionMethod === "none"
        ? 0
        : rules.absenceDeductionMethod === "fixed_per_day"
          ? moneyValue(absentDays * rules.absenceDeductionFactor)
          : moneyValue(absentDays * dailyRate * rules.absenceDeductionFactor);
    const employeeAdjustments = adjustments.filter(
      (adjustment) => adjustment.employeeId === row.employee.id,
    );
    const additions = moneyValue(
      employeeAdjustments
        .filter((item) => item.type === "addition")
        .reduce((total, item) => total + item.amount, 0),
    );
    const adjustmentDeductions = moneyValue(
      employeeAdjustments
        .filter((item) => item.type === "deduction")
        .reduce((total, item) => total + item.amount, 0),
    );
    const attendanceDeductions = moneyValue(
      lateDeduction + earlyDeduction + absenceDeduction,
    );
    const otherDeductions = adjustmentDeductions;
    const netSalary = moneyValue(
      row.employee.salary +
        additions +
        overtime -
        attendanceDeductions -
        otherDeductions,
    );
    totalNet += netSalary;
    const lineItems: PayrollLineItem[] = [
      {
        label: message(req, "basicSalary"),
        amount: row.employee.salary,
        type: "basic",
        explanation: message(req, "compensationProfile"),
      },
      ...(overtime > 0
        ? [
            {
              label: message(req, "overtimeLineLabel"),
              amount: overtime,
              type: "overtime" as const,
              explanation: translateApiMessage(
                requestedLocale(req),
                "overtimeExplanation",
                { hours: overtimeHours.toFixed(2) },
              ),
            },
          ]
        : []),
      ...(additions > 0
        ? [
            {
              label: message(req, "additionsLineLabel"),
              amount: additions,
              type: "addition" as const,
              explanation: message(req, "adjustmentAdditionExplanation"),
            },
          ]
        : []),
      ...(lateDeduction > 0
        ? [
            {
              label: message(req, "lateDeductionLineLabel"),
              amount: -lateDeduction,
              type: "attendance_deduction" as const,
              explanation: translateApiMessage(
                requestedLocale(req),
                "attendanceDeductionExplanation",
                { minutes: lateMinutes },
              ),
            },
          ]
        : []),
      ...(earlyDeduction > 0
        ? [
            {
              label: message(req, "earlyCheckoutDeductionLineLabel"),
              amount: -earlyDeduction,
              type: "early_checkout_deduction" as const,
              explanation: message(req, "earlyCheckoutDeductionExplanation", {
                minutes: earlyCheckoutMinutes,
              }),
            },
          ]
        : []),
      ...(absenceDeduction > 0
        ? [
            {
              label: message(req, "absenceDeductionLineLabel"),
              amount: -absenceDeduction,
              type: "absence_deduction" as const,
              explanation: message(req, "absenceDeductionExplanation", {
                days: absentDays,
              }),
            },
          ]
        : []),
      ...employeeAdjustments.map((adjustment) => ({
        label: adjustment.reason,
        amount:
          adjustment.type === "addition"
            ? adjustment.amount
            : -adjustment.amount,
        type:
          adjustment.type === "addition"
            ? ("addition" as const)
            : ("deduction" as const),
        explanation:
          adjustment.category === "fixed"
            ? message(req, "fixedAdjustmentExplanation")
            : message(req, "variableAdjustmentExplanation"),
      })),
    ];
    await db.insert(payrollCalculationsTable).values({
      companyId: context.companyId,
      periodId: period.id,
      employeeId: row.employee.id,
      basicSalary: row.employee.salary,
      additions,
      overtime,
      attendanceDeductions,
      otherDeductions,
      netSalary,
      regularHours: moneyValue(regularHours),
      overtimeHours: moneyValue(overtimeHours),
      lateMinutes,
      earlyCheckoutMinutes,
      missingHours: moneyValue(missingHours),
      absentDays,
      lineItems,
      inputsSnapshot: {
        rules,
        period: { from: period.from, to: period.to },
        attendance: {
          regularHours,
          overtimeHours,
          lateMinutes,
          earlyCheckoutMinutes,
          missingHours,
          absentDays,
        },
        adjustments: employeeAdjustments,
        calculatedValues: {
          overtime,
          additions,
          attendanceDeductions,
          otherDeductions,
          netSalary,
        },
      },
      calculationVersion,
    });
  }
  const calculatedAt = new Date();
  const updated = await db
    .update(payrollPeriodsTable)
    .set({
      status: "calculated",
      employeeCount: rows.length,
      totalNet: moneyValue(totalNet),
      calculatedAt,
    })
    .where(eq(payrollPeriodsTable.id, period.id))
    .returning();
  const result = await storedPayrollCalculation(context, req, {
    ...period,
    ...updated[0],
  });
  if (!result) return null;
  await recordAudit(
    context.companyId,
    "calculated",
    "payroll_period",
    period.id,
    { calculationVersion, employeeCount: rows.length },
  );
  return {
    ...result,
    period: { ...result.period, status: "calculated" as const, totalNet },
    calculatedAt: calculatedAt.toISOString(),
  };
}

router.post(
  "/payroll/periods/:periodId/calculate",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canManageCompany(context)) {
      res.status(403).json({ error: message(req, "payrollCalculate") });
      return;
    }
    const params = CalculatePayrollParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const [period] = await db
      .select()
      .from(payrollPeriodsTable)
      .where(
        and(
          eq(payrollPeriodsTable.id, params.data.periodId),
          eq(payrollPeriodsTable.companyId, context.companyId),
        ),
      )
      .limit(1);
    if (!period) {
      res.status(404).json({ error: message(req, "payrollPeriodNotFound") });
      return;
    }
    const calculation = await calculatePayrollPeriod(context, req, period);
    if (!calculation) {
      res
        .status(409)
        .json({ error: message(req, "payrollCalculationMissing") });
      return;
    }
    res.json(GetPayrollCalculationResponse.parse(calculation));
  },
);

router.get(
  "/payroll/periods/:periodId/calculation",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canViewPayroll(context) && !context.employeeId) {
      res.status(403).json({ error: message(req, "payrollAccess") });
      return;
    }
    const params = GetPayrollCalculationParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const [period] = await db
      .select()
      .from(payrollPeriodsTable)
      .where(
        and(
          eq(payrollPeriodsTable.id, params.data.periodId),
          eq(payrollPeriodsTable.companyId, context.companyId),
        ),
      )
      .limit(1);
    if (!period) {
      res.status(404).json({ error: message(req, "payrollPeriodNotFound") });
      return;
    }
    const calculation = await storedPayrollCalculation(context, req, period);
    if (!calculation) {
      res
        .status(404)
        .json({ error: message(req, "payrollCalculationMissing") });
      return;
    }
    res.json(GetPayrollCalculationResponse.parse(calculation));
  },
);

router.post(
  "/payroll/periods/:periodId/finalize",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canManageCompany(context)) {
      res.status(403).json({ error: message(req, "payrollFinalize") });
      return;
    }
    const params = FinalizePayrollParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const [period] = await db
      .select()
      .from(payrollPeriodsTable)
      .where(
        and(
          eq(payrollPeriodsTable.id, params.data.periodId),
          eq(payrollPeriodsTable.companyId, context.companyId),
        ),
      )
      .limit(1);
    if (!period) {
      res.status(404).json({ error: message(req, "payrollPeriodNotFound") });
      return;
    }
    if (period.status === "finalized" || period.status === "locked") {
      res.json(FinalizePayrollResponse.parse(payrollPeriodResponse(period)));
      return;
    }
    const calculation = await storedPayrollCalculation(context, req, period);
    if (!calculation) {
      res
        .status(409)
        .json({ error: message(req, "payrollMustCalculateFirst") });
      return;
    }
    const [finalized] = await db
      .update(payrollPeriodsTable)
      .set({
        status: "finalized",
        finalizedAt: new Date(),
        finalizedBy: context.role,
      })
      .where(
        and(
          eq(payrollPeriodsTable.id, period.id),
          eq(payrollPeriodsTable.companyId, context.companyId),
        ),
      )
      .returning();
    await recordAudit(
      context.companyId,
      "finalized",
      "payroll_period",
      period.id,
      { status: "finalized", totalNet: calculation.totals.netSalary },
    );
    res.json(FinalizePayrollResponse.parse(payrollPeriodResponse(finalized)));
  },
);

router.get("/payroll/adjustments", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canManageCompany(context)) {
    res.status(403).json({ error: message(req, "payrollAdjustmentAccess") });
    return;
  }
  const query = ListPayrollAdjustmentsQueryParams.safeParse({
    periodId: req.query.periodId ? String(req.query.periodId) : undefined,
    employeeId: req.query.employeeId ? String(req.query.employeeId) : undefined,
  });
  if (!query.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const rows = await db
    .select({
      adjustment: payrollAdjustmentsTable,
      employee: employeesTable,
      department: departmentsTable,
    })
    .from(payrollAdjustmentsTable)
    .innerJoin(
      employeesTable,
      eq(payrollAdjustmentsTable.employeeId, employeesTable.id),
    )
    .innerJoin(
      departmentsTable,
      eq(employeesTable.departmentId, departmentsTable.id),
    )
    .where(
      and(
        eq(payrollAdjustmentsTable.companyId, context.companyId),
        query.data.periodId
          ? eq(payrollAdjustmentsTable.periodId, query.data.periodId)
          : undefined,
        query.data.employeeId
          ? eq(payrollAdjustmentsTable.employeeId, query.data.employeeId)
          : undefined,
      ),
    )
    .orderBy(desc(payrollAdjustmentsTable.createdAt));
  res.json(
    ListPayrollAdjustmentsResponse.parse(
      rows.map((row) => ({
        id: row.adjustment.id,
        periodId: row.adjustment.periodId,
        employee: employeeReference(row.employee, row.department.name),
        type: row.adjustment.type,
        category: row.adjustment.category,
        amount: row.adjustment.amount,
        reason: row.adjustment.reason,
        createdAt: row.adjustment.createdAt.toISOString(),
      })),
    ),
  );
});

router.post("/payroll/adjustments", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canManageCompany(context)) {
    res.status(403).json({ error: message(req, "payrollAdjustmentAccess") });
    return;
  }
  const parsed = CreatePayrollAdjustmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [period] = await db
    .select()
    .from(payrollPeriodsTable)
    .where(
      and(
        eq(payrollPeriodsTable.id, parsed.data.periodId),
        eq(payrollPeriodsTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  const [employee] = await db
    .select({ employee: employeesTable, department: departmentsTable })
    .from(employeesTable)
    .innerJoin(
      departmentsTable,
      eq(employeesTable.departmentId, departmentsTable.id),
    )
    .where(
      and(
        eq(employeesTable.id, parsed.data.employeeId),
        eq(employeesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!period || !employee) {
    res
      .status(404)
      .json({ error: message(req, "payrollAdjustmentTargetMissing") });
    return;
  }
  if (period.status === "finalized" || period.status === "locked") {
    res.status(409).json({ error: message(req, "payrollFinalizedImmutable") });
    return;
  }
  const [adjustment] = await db
    .insert(payrollAdjustmentsTable)
    .values({
      companyId: context.companyId,
      periodId: period.id,
      employeeId: employee.employee.id,
      type: parsed.data.type,
      category: parsed.data.category,
      amount: parsed.data.amount,
      reason: parsed.data.reason,
      createdBy: context.role,
    })
    .returning();
  await recordAudit(
    context.companyId,
    "created",
    "payroll_adjustment",
    adjustment.id,
    adjustment,
  );
  res.status(201).json(
    CreatePayrollAdjustmentResponse.parse({
      id: adjustment.id,
      periodId: adjustment.periodId,
      employee: employeeReference(employee.employee, employee.department.name),
      type: adjustment.type,
      category: adjustment.category,
      amount: adjustment.amount,
      reason: adjustment.reason,
      createdAt: adjustment.createdAt.toISOString(),
    }),
  );
});

router.delete(
  "/payroll/adjustments/:adjustmentId",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canManageCompany(context)) {
      res.status(403).json({ error: message(req, "payrollAdjustmentAccess") });
      return;
    }
    const params = DeletePayrollAdjustmentParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const [adjustment] = await db
      .select()
      .from(payrollAdjustmentsTable)
      .where(
        and(
          eq(payrollAdjustmentsTable.id, params.data.adjustmentId),
          eq(payrollAdjustmentsTable.companyId, context.companyId),
        ),
      )
      .limit(1);
    if (!adjustment) {
      res
        .status(404)
        .json({ error: message(req, "payrollAdjustmentTargetMissing") });
      return;
    }
    const [period] = await db
      .select()
      .from(payrollPeriodsTable)
      .where(
        and(
          eq(payrollPeriodsTable.id, adjustment.periodId),
          eq(payrollPeriodsTable.companyId, context.companyId),
        ),
      )
      .limit(1);
    if (period?.status === "finalized" || period?.status === "locked") {
      res
        .status(409)
        .json({ error: message(req, "payrollFinalizedImmutable") });
      return;
    }
    await db
      .delete(payrollAdjustmentsTable)
      .where(
        and(
          eq(payrollAdjustmentsTable.id, adjustment.id),
          eq(payrollAdjustmentsTable.companyId, context.companyId),
        ),
      );
    res.status(204).send(DeletePayrollAdjustmentResponse.parse(undefined));
  },
);

router.get("/payroll/my", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!context.employeeId) {
    res.status(403).json({ error: message(req, "personalPayrollOnly") });
    return;
  }
  const query = GetMyPayrollQueryParams.safeParse({
    periodId: req.query.periodId ? String(req.query.periodId) : undefined,
  });
  if (!query.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const period = query.data.periodId
    ? (
        await db
          .select()
          .from(payrollPeriodsTable)
          .where(
            and(
              eq(payrollPeriodsTable.id, query.data.periodId),
              eq(payrollPeriodsTable.companyId, context.companyId),
            ),
          )
          .limit(1)
      )[0]
    : (
        await db
          .select()
          .from(payrollPeriodsTable)
          .where(
            and(
              eq(payrollPeriodsTable.companyId, context.companyId),
              or(
                eq(payrollPeriodsTable.status, "calculated"),
                eq(payrollPeriodsTable.status, "finalized"),
              ),
            ),
          )
          .orderBy(desc(payrollPeriodsTable.to))
          .limit(1)
      )[0];
  if (!period) {
    res.status(404).json({ error: message(req, "payrollPeriodNotFound") });
    return;
  }
  const calculation = await storedPayrollCalculation(context, req, period);
  if (!calculation) {
    res.status(404).json({ error: message(req, "payrollCalculationMissing") });
    return;
  }
  res.json(GetMyPayrollResponse.parse(calculation));
});

router.get("/devices", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "devices")) {
    res.status(403).json({ error: message(req, "deviceAdmin") });
    return;
  }
  res.json(
    ListDevicesResponse.parse((await deviceRows(context)).map(mapDeviceRow)),
  );
});

router.post("/devices", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "devices")) {
    res.status(403).json({ error: message(req, "deviceManage") });
    return;
  }
  const parsed = CreateDeviceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [branch] = await db
    .select()
    .from(branchesTable)
    .where(
      and(
        eq(branchesTable.id, parsed.data.branchId),
        eq(branchesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!branch) {
    res.status(400).json({ error: message(req, "branchNotFound") });
    return;
  }
  const [device] = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`var_hr_device_letters:${context.companyId}`}))`,
    );
    const registeredDevices = await tx
      .select({ biometricCode: devicesTable.biometricCode })
      .from(devicesTable)
      .where(eq(devicesTable.companyId, context.companyId));
    const usedLetters = new Set(
      registeredDevices
        .map((registeredDevice) => registeredDevice.biometricCode)
        .filter((code): code is string => Boolean(code)),
    );
    let nextIndex = 0;
    while (usedLetters.has(deviceLetter(nextIndex))) nextIndex += 1;
    return tx
      .insert(devicesTable)
      .values({
        companyId: context.companyId,
        name: parsed.data.name,
        manufacturer: parsed.data.manufacturer,
        model: parsed.data.model,
        branchId: branch.id,
        adapterKey: parsed.data.adapterKey,
        connectionType: parsed.data.connectionType,
        host: parsed.data.host,
        port: parsed.data.port,
        deviceIdentifier: parsed.data.deviceIdentifier,
        biometricCode: deviceLetter(nextIndex),
        status: "not_configured",
        integrationState: "adapter_pending",
        note: message(req, "hardwareConnectorNote"),
      })
      .returning();
  });
  await recordAudit(context.companyId, "created", "device", device.id, device);
  const row = (await deviceRows(context)).find(
    (item) => item.device.id === device.id,
  );
  res.status(201).json(CreateDeviceResponse.parse(mapDeviceRow(row!)));
});

router.get("/devices/providers", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "devices")) {
    res.status(403).json({ error: message(req, "deviceAdmin") });
    return;
  }
  res.json(
    ListBiometricProvidersResponse.parse(
      listBiometricProviders().map((provider) => ({
        key: provider.key,
        name: provider.name,
        available: provider.available,
        description: provider.description,
      })),
    ),
  );
});

router.get(
  "/devices/:deviceId/sync-history",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canUseCapability(context, "sync-history")) {
      res.status(403).json({ error: message(req, "deviceAdmin") });
      return;
    }
    const params = ListDeviceSyncHistoryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    if (!isUuid(params.data.deviceId)) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const [device] = await db
      .select({ id: devicesTable.id })
      .from(devicesTable)
      .where(
        and(
          eq(devicesTable.id, params.data.deviceId),
          eq(devicesTable.companyId, context.companyId),
        ),
      )
      .limit(1);
    if (!device) {
      res.status(404).json({ error: message(req, "deviceNotFound") });
      return;
    }
    const history = await db
      .select()
      .from(biometricSyncHistoryTable)
      .where(
        and(
          eq(biometricSyncHistoryTable.companyId, context.companyId),
          eq(biometricSyncHistoryTable.deviceId, device.id),
        ),
      )
      .orderBy(desc(biometricSyncHistoryTable.startedAt));
    res.json(
      ListDeviceSyncHistoryResponse.parse(
        history.map((entry) => ({
          id: entry.id,
          deviceId: entry.deviceId,
          providerKey: entry.providerKey,
          operation: entry.operation as
            "employee_sync" | "attendance_sync" | "full_sync",
          status: entry.status as
            "queued" | "running" | "completed" | "failed" | "unavailable",
          message: entry.message,
          eventsReceived: entry.eventsReceived,
          eventsProcessed: entry.eventsProcessed,
          errorCount: entry.errorCount,
          startedAt: entry.startedAt.toISOString(),
          completedAt: entry.completedAt
            ? entry.completedAt.toISOString()
            : null,
        })),
      ),
    );
  },
);

router.post("/devices/:deviceId/sync", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "devices")) {
    res.status(403).json({ error: message(req, "deviceSyncAccess") });
    return;
  }
  const params = SyncDeviceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (!isUuid(params.data.deviceId)) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [device] = await db
    .select()
    .from(devicesTable)
    .where(
      and(
        eq(devicesTable.id, params.data.deviceId),
        eq(devicesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!device) {
    res.status(404).json({ error: message(req, "deviceNotFound") });
    return;
  }
  const startedAt = new Date();
  const provider = getBiometricProvider(device.adapterKey);
  if (!provider || !provider.available) {
    await recordDeviceSyncHistory({
      companyId: context.companyId,
      deviceId: device.id,
      providerKey: device.adapterKey,
      operation: "full_sync",
      status: "unavailable",
      message: message(req, "noManufacturerAdapter"),
      startedAt,
      completedAt: new Date(),
    });
    await db
      .update(devicesTable)
      .set({
        integrationState: "unavailable",
        connectionState: "unsupported",
        status: "attention",
        lastHealthCheck: new Date(),
      })
      .where(
        and(
          eq(devicesTable.id, device.id),
          eq(devicesTable.companyId, context.companyId),
        ),
      );
    res.status(202).json(
      SyncDeviceResponse.parse({
        deviceId: device.id,
        status: "unavailable",
        message: message(req, "noManufacturerAdapter"),
      }),
    );
    return;
  }

  await db
    .update(devicesTable)
    .set({
      integrationState: "syncing",
      lastHealthCheck: new Date(),
    })
    .where(
      and(
        eq(devicesTable.id, device.id),
        eq(devicesTable.companyId, context.companyId),
      ),
    );

  const mappedRows = await db
    .select({ mapping: deviceEmployeeMappingsTable, employee: employeesTable })
    .from(deviceEmployeeMappingsTable)
    .innerJoin(
      employeesTable,
      eq(deviceEmployeeMappingsTable.employeeId, employeesTable.id),
    )
    .where(
      and(
        eq(deviceEmployeeMappingsTable.companyId, context.companyId),
        eq(deviceEmployeeMappingsTable.deviceId, device.id),
        eq(employeesTable.companyId, context.companyId),
      ),
    );
  const mappings = mappedRows.map((row) => row.mapping);
  const employees = mappedRows.map((row) => row.employee);

  const connection = await provider.connect(device);
  await db
    .update(devicesTable)
    .set({
      connectionState: connection.status,
      status: connection.status === "connected" ? "connected" : "attention",
      integrationState:
        connection.status === "connected" ? "configured" : "unavailable",
      lastHealthCheck: new Date(),
      note: connection.message,
    })
    .where(
      and(
        eq(devicesTable.id, device.id),
        eq(devicesTable.companyId, context.companyId),
      ),
    );
  if (connection.status !== "connected") {
    await recordDeviceSyncHistory({
      companyId: context.companyId,
      deviceId: device.id,
      providerKey: provider.key,
      operation: "full_sync",
      status: "failed",
      message: connection.message,
      startedAt,
      completedAt: new Date(),
      errorCount: 1,
    });
    res.status(202).json(
      SyncDeviceResponse.parse({
        deviceId: device.id,
        status: "unavailable",
        message: connection.message,
      }),
    );
    return;
  }

  let employeeSync: { synchronized: number; message: string };
  try {
    employeeSync = await provider.syncEmployees(device, employees, mappings);
    await recordDeviceSyncHistory({
      companyId: context.companyId,
      deviceId: device.id,
      providerKey: provider.key,
      operation: "employee_sync",
      status: "completed",
      message: employeeSync.message,
      eventsProcessed: employeeSync.synchronized,
      startedAt,
      completedAt: new Date(),
    });
  } catch (error) {
    const failureMessage =
      error instanceof BiometricProviderError
        ? error.message
        : "The provider could not synchronize employee mappings.";
    await recordDeviceSyncHistory({
      companyId: context.companyId,
      deviceId: device.id,
      providerKey: provider.key,
      operation: "employee_sync",
      status: "failed",
      message: failureMessage,
      startedAt,
      completedAt: new Date(),
      errorCount: 1,
    });
    await db
      .update(devicesTable)
      .set({ integrationState: "unavailable", status: "attention" })
      .where(
        and(
          eq(devicesTable.id, device.id),
          eq(devicesTable.companyId, context.companyId),
        ),
      );
    res.status(202).json(
      SyncDeviceResponse.parse({
        deviceId: device.id,
        status: "unavailable",
        message: failureMessage,
      }),
    );
    return;
  }

  let events: ProviderAttendanceEvent[];
  try {
    events = await provider.syncAttendance(device, mappings, TODAY);
  } catch (error) {
    const failureMessage =
      error instanceof BiometricProviderError
        ? error.message
        : "The provider could not synchronize attendance events.";
    await recordDeviceSyncHistory({
      companyId: context.companyId,
      deviceId: device.id,
      providerKey: provider.key,
      operation: "attendance_sync",
      status: "failed",
      message: failureMessage,
      startedAt,
      completedAt: new Date(),
      errorCount: 1,
    });
    await db
      .update(devicesTable)
      .set({ integrationState: "unavailable", status: "attention" })
      .where(
        and(
          eq(devicesTable.id, device.id),
          eq(devicesTable.companyId, context.companyId),
        ),
      );
    res.status(202).json(
      SyncDeviceResponse.parse({
        deviceId: device.id,
        status: "unavailable",
        message: failureMessage,
      }),
    );
    return;
  }

  const mappingsByIdentity = new Map(
    mappings.map((mapping) => [mapping.deviceEmployeeId, mapping]),
  );
  let eventsProcessed = 0;
  let errorCount = 0;
  for (const providerEvent of events) {
    const validationError = providerEventValidationError(providerEvent);
    const mapping = mappingsByIdentity.get(providerEvent.deviceEmployeeId);
    if (validationError || !mapping || !mapping.active) {
      errorCount += 1;
      continue;
    }
    const [storedEvent] = await db
      .insert(biometricEventsTable)
      .values({
        companyId: context.companyId,
        deviceId: device.id,
        deviceEmployeeId: providerEvent.deviceEmployeeId,
        employeeId: mapping.employeeId,
        occurredAt: providerEvent.occurredAt,
        eventType: providerEvent.eventType,
        direction: providerEvent.direction,
        idempotencyKey: providerEvent.idempotencyKey,
        rawPayload: providerEvent.rawPayload,
        processingStatus: "received",
      })
      .onConflictDoNothing({
        target: [
          biometricEventsTable.companyId,
          biometricEventsTable.idempotencyKey,
        ],
      })
      .returning();
    if (!storedEvent) continue;
    try {
      await applyProviderAttendanceEvent(
        context,
        providerEvent,
        mapping.employeeId,
      );
      await db
        .update(biometricEventsTable)
        .set({ processingStatus: "mapped", processedAt: new Date() })
        .where(
          and(
            eq(biometricEventsTable.id, storedEvent.id),
            eq(biometricEventsTable.companyId, context.companyId),
          ),
        );
      eventsProcessed += 1;
    } catch {
      errorCount += 1;
      await db
        .update(biometricEventsTable)
        .set({ processingStatus: "failed", processedAt: new Date() })
        .where(
          and(
            eq(biometricEventsTable.id, storedEvent.id),
            eq(biometricEventsTable.companyId, context.companyId),
          ),
        );
    }
  }

  const historyMessage = errorCount
    ? `Mock/provider synchronization completed with ${errorCount} event error${errorCount === 1 ? "" : "s"}.`
    : `Attendance synchronization completed: ${eventsProcessed} new event${eventsProcessed === 1 ? "" : "s"} processed; ${employeeSync.synchronized} employee mapping${employeeSync.synchronized === 1 ? "" : "s"} synchronized.`;
  await recordDeviceSyncHistory({
    companyId: context.companyId,
    deviceId: device.id,
    providerKey: provider.key,
    operation: "attendance_sync",
    status: errorCount ? "failed" : "completed",
    message: historyMessage,
    eventsReceived: events.length,
    eventsProcessed,
    errorCount,
    startedAt,
    completedAt: new Date(),
  });
  await db
    .update(devicesTable)
    .set({
      integrationState: errorCount ? "unavailable" : "configured",
      connectionState: "connected",
      status: errorCount ? "attention" : "connected",
      lastSync: new Date(),
    })
    .where(
      and(
        eq(devicesTable.id, device.id),
        eq(devicesTable.companyId, context.companyId),
      ),
    );
  res.status(202).json(
    SyncDeviceResponse.parse({
      deviceId: device.id,
      status: errorCount ? "unavailable" : "completed",
      message: historyMessage,
    }),
  );
});

router.post(
  "/devices/:deviceId/connection-test",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canUseCapability(context, "devices")) {
      res.status(403).json({ error: message(req, "deviceSyncAccess") });
      return;
    }
    const parsed = TestDeviceConnectionParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const deviceId = parsed.data.deviceId;
    if (!isUuid(deviceId)) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const [device] = await db
      .select()
      .from(devicesTable)
      .where(
        and(
          eq(devicesTable.id, deviceId),
          eq(devicesTable.companyId, context.companyId),
        ),
      )
      .limit(1);
    if (!device) {
      res.status(404).json({ error: message(req, "deviceNotFound") });
      return;
    }
    const provider = getBiometricProvider(device.adapterKey);
    const connection =
      provider && provider.available
        ? await provider.connect(device)
        : {
            status: "unsupported" as const,
            message: message(req, "noManufacturerAdapter"),
          };
    await db
      .update(devicesTable)
      .set({
        lastHealthCheck: new Date(),
        connectionState: connection.status,
        status: connection.status === "connected" ? "connected" : "attention",
        integrationState:
          connection.status === "connected" ? "configured" : "unavailable",
        note: connection.message,
      })
      .where(
        and(
          eq(devicesTable.id, device.id),
          eq(devicesTable.companyId, context.companyId),
        ),
      );
    res.json(
      TestDeviceConnectionResponse.parse({
        deviceId: device.id,
        status: connection.status,
        message: connection.message,
        testedAt: new Date().toISOString(),
      }),
    );
  },
);

router.get("/devices/:deviceId/mappings", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "devices")) {
    res.status(403).json({ error: message(req, "deviceManage") });
    return;
  }
  const parsed = ListDeviceMappingsParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const deviceId = parsed.data.deviceId;
  const [device] = await db
    .select()
    .from(devicesTable)
    .where(
      and(
        eq(devicesTable.id, deviceId),
        eq(devicesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!device) {
    res.status(404).json({ error: message(req, "deviceNotFound") });
    return;
  }
  const rows = await db
    .select({
      mapping: deviceEmployeeMappingsTable,
      employee: employeesTable,
      department: departmentsTable,
      identity: employeeIdentitiesTable,
    })
    .from(deviceEmployeeMappingsTable)
    .innerJoin(
      employeesTable,
      eq(deviceEmployeeMappingsTable.employeeId, employeesTable.id),
    )
    .innerJoin(
      departmentsTable,
      eq(employeesTable.departmentId, departmentsTable.id),
    )
    .leftJoin(
      employeeIdentitiesTable,
      eq(
        employeeIdentitiesTable.employeeId,
        deviceEmployeeMappingsTable.employeeId,
      ),
    )
    .where(
      and(
        eq(deviceEmployeeMappingsTable.companyId, context.companyId),
        eq(deviceEmployeeMappingsTable.deviceId, device.id),
      ),
    )
    .orderBy(desc(deviceEmployeeMappingsTable.createdAt));
  res.json(
    ListDeviceMappingsResponse.parse(
      rows.map((row) => ({
        id: row.mapping.id,
        deviceId: row.mapping.deviceId,
        deviceEmployeeId: row.mapping.deviceEmployeeId,
        username:
          row.identity?.username ??
          `${device.biometricCode ?? "UNKNOWN"}-${row.mapping.deviceEmployeeId}`,
        employee: employeeReference(row.employee, row.department.name),
        active: row.mapping.active,
      })),
    ),
  );
});

router.post("/devices/:deviceId/mappings", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "devices")) {
    res.status(403).json({ error: message(req, "deviceManage") });
    return;
  }
  const params = CreateDeviceMappingParams.safeParse(req.params);
  const parsed = CreateDeviceMappingBody.safeParse(req.body ?? {});
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const deviceId = params.data.deviceId;
  if (!isUuid(deviceId) || !isUuid(parsed.data.employeeId)) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [device] = await db
    .select()
    .from(devicesTable)
    .where(
      and(
        eq(devicesTable.id, deviceId),
        eq(devicesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  const [employee] = await db
    .select({ employee: employeesTable, department: departmentsTable })
    .from(employeesTable)
    .innerJoin(
      departmentsTable,
      eq(employeesTable.departmentId, departmentsTable.id),
    )
    .where(
      and(
        eq(employeesTable.id, parsed.data.employeeId),
        eq(employeesTable.companyId, context.companyId),
        eq(employeesTable.status, "active"),
      ),
    )
    .limit(1);
  if (!device || !employee) {
    res.status(404).json({ error: message(req, "deviceNotFound") });
    return;
  }
  const [existingMapping] = await db
    .select({ id: deviceEmployeeMappingsTable.id })
    .from(deviceEmployeeMappingsTable)
    .where(
      and(
        eq(deviceEmployeeMappingsTable.companyId, context.companyId),
        eq(deviceEmployeeMappingsTable.deviceId, device.id),
        eq(
          deviceEmployeeMappingsTable.deviceEmployeeId,
          parsed.data.deviceEmployeeId,
        ),
      ),
    )
    .limit(1);
  if (existingMapping) {
    res.status(409).json({ error: message(req, "deviceMappingDuplicate") });
    return;
  }
  const [existingIdentity] = await db
    .select()
    .from(employeeIdentitiesTable)
    .where(eq(employeeIdentitiesTable.employeeId, employee.employee.id))
    .limit(1);
  if (existingIdentity) {
    res.status(409).json({
      error: "This employee already has a biometric username.",
      code: "EMPLOYEE_IDENTITY_EXISTS",
    });
    return;
  }
  const biometricCode =
    device.biometricCode ?? (await allocateDeviceLetter(context.companyId));
  if (!device.biometricCode) {
    await db
      .update(devicesTable)
      .set({ biometricCode })
      .where(
        and(
          eq(devicesTable.id, device.id),
          eq(devicesTable.companyId, context.companyId),
        ),
      );
  }
  const [existingAccount] = await db
    .select()
    .from(userAccountsTable)
    .where(eq(userAccountsTable.employeeId, employee.employee.id))
    .limit(1);
  const temporaryPassword = existingAccount ? null : generateNumericPassword();
  const username = `${biometricCode}-${parsed.data.deviceEmployeeId}`;
  if (existingAccount && existingAccount.username !== username) {
    res.status(409).json({
      error: "This employee already has an account with a different username.",
      code: "EMPLOYEE_ACCOUNT_USERNAME_MISMATCH",
    });
    return;
  }
  let account: typeof userAccountsTable.$inferSelect;
  let mapping: typeof deviceEmployeeMappingsTable.$inferSelect;
  try {
    const result = await db.transaction(async (tx) => {
      const [createdAccount] = existingAccount
        ? [existingAccount]
        : await tx
            .insert(userAccountsTable)
            .values({
              username,
              passwordHash: hashPassword(temporaryPassword!),
              accountType: "employee",
              displayRole: "Employee",
              companyId: context.companyId,
              employeeId: employee.employee.id,
              active: true,
            })
            .returning();
      if (!createdAccount) throw new Error("EMPLOYEE_ACCOUNT_CREATE_FAILED");
      const [createdMapping] = await tx
        .insert(deviceEmployeeMappingsTable)
        .values({
          companyId: context.companyId,
          deviceId: device.id,
          employeeId: employee.employee.id,
          deviceEmployeeId: parsed.data.deviceEmployeeId,
          active: true,
        })
        .returning();
      const [createdIdentity] = await tx
        .insert(employeeIdentitiesTable)
        .values({
          companyId: context.companyId,
          employeeId: employee.employee.id,
          deviceId: device.id,
          biometricEmployeeNumber: parsed.data.deviceEmployeeId,
          username: createdAccount.username,
          accountId: createdAccount.id,
        })
        .returning();
      if (!createdMapping || !createdIdentity)
        throw new Error("EMPLOYEE_IDENTITY_CREATE_FAILED");
      return { account: createdAccount, mapping: createdMapping };
    });
    account = result.account;
    mapping = result.mapping;
  } catch (error) {
    const duplicate =
      error instanceof Error &&
      (error.message.includes("unique") ||
        error.message.includes("duplicate") ||
        error.message.includes("EMPLOYEE_IDENTITY"));
    res.status(duplicate ? 409 : 500).json({
      error: duplicate
        ? "That biometric identity or generated username is already in use."
        : message(req, "internalError"),
      code: duplicate ? "BIOMETRIC_IDENTITY_COLLISION" : "INTERNAL_ERROR",
    });
    return;
  }
  if (!account) {
    res.status(500).json({ error: message(req, "internalError") });
    return;
  }
  if (!existingAccount) {
    await replaceAccountPermissions(account.id, [
      "attendance.view",
      "leave.create",
      "permissions.create",
      "reports.view",
    ]);
  }
  await writeAuthAudit({
    accountId: context.accountId,
    companyId: context.companyId,
    action: "employee_identity_created",
    entityType: "employee",
    entityId: employee.employee.id,
    metadata: { username: account.username, deviceId: device.id },
  });
  res.status(201).json(
    CreateDeviceMappingResponse.parse({
      id: mapping.id,
      deviceId: mapping.deviceId,
      deviceEmployeeId: mapping.deviceEmployeeId,
       username: account.username,
      employee: employeeReference(employee.employee, employee.department.name),
      active: mapping.active,
       temporaryPassword,
    }),
  );
});

router.delete(
  "/devices/:deviceId/mappings/:mappingId",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canUseCapability(context, "devices")) {
      res.status(403).json({ error: message(req, "deviceManage") });
      return;
    }
    const params = DeleteDeviceMappingParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const { deviceId, mappingId } = params.data;
    const [mapping] = await db
      .select()
      .from(deviceEmployeeMappingsTable)
      .where(
        and(
          eq(deviceEmployeeMappingsTable.id, mappingId),
          eq(deviceEmployeeMappingsTable.deviceId, deviceId),
          eq(deviceEmployeeMappingsTable.companyId, context.companyId),
        ),
      )
      .limit(1);
    if (!mapping) {
      res.status(404).json({ error: message(req, "deviceMappingNotFound") });
      return;
    }
    await db
      .delete(deviceEmployeeMappingsTable)
      .where(eq(deviceEmployeeMappingsTable.id, mapping.id));
    res.status(204).send(DeleteDeviceMappingResponse.parse(undefined));
  },
);

router.post("/devices/:deviceId/events", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "devices")) {
    res.status(403).json({ error: message(req, "deviceManage") });
    return;
  }
  const params = IngestBiometricEventParams.safeParse(req.params);
  const parsed = IngestBiometricEventBody.safeParse(req.body ?? {});
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [device] = await db
    .select()
    .from(devicesTable)
    .where(
      and(
        eq(devicesTable.id, params.data.deviceId),
        eq(devicesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!device) {
    res.status(404).json({ error: message(req, "deviceNotFound") });
    return;
  }
  const [existing] = await db
    .select()
    .from(biometricEventsTable)
    .where(
      and(
        eq(biometricEventsTable.companyId, context.companyId),
        eq(biometricEventsTable.idempotencyKey, parsed.data.idempotencyKey),
      ),
    )
    .limit(1);
  if (existing) {
    res.status(200).json(
      IngestBiometricEventResponse.parse({
        id: existing.id,
        deviceId: existing.deviceId,
        deviceEmployeeId: existing.deviceEmployeeId,
        employeeId: existing.employeeId,
        occurredAt: existing.occurredAt.toISOString(),
        processingStatus: existing.processingStatus,
        duplicate: true,
      }),
    );
    return;
  }
  const [mapping] = await db
    .select({ employeeId: deviceEmployeeMappingsTable.employeeId })
    .from(deviceEmployeeMappingsTable)
    .where(
      and(
        eq(deviceEmployeeMappingsTable.companyId, context.companyId),
        eq(deviceEmployeeMappingsTable.deviceId, device.id),
        eq(
          deviceEmployeeMappingsTable.deviceEmployeeId,
          parsed.data.deviceEmployeeId,
        ),
        eq(deviceEmployeeMappingsTable.active, true),
      ),
    )
    .limit(1);
  const [event] = await db
    .insert(biometricEventsTable)
    .values({
      companyId: context.companyId,
      deviceId: device.id,
      deviceEmployeeId: parsed.data.deviceEmployeeId,
      employeeId: mapping?.employeeId ?? null,
      occurredAt: new Date(parsed.data.occurredAt),
      eventType: parsed.data.eventType,
      direction: parsed.data.direction,
      idempotencyKey: parsed.data.idempotencyKey,
      rawPayload: parsed.data.rawPayload ?? {},
      processingStatus: mapping ? "mapped" : "pending_adapter",
    })
    .returning();
  res.status(201).json(
    IngestBiometricEventResponse.parse({
      id: event.id,
      deviceId: event.deviceId,
      deviceEmployeeId: event.deviceEmployeeId,
      employeeId: event.employeeId,
      occurredAt: event.occurredAt.toISOString(),
      processingStatus: event.processingStatus,
      duplicate: false,
    }),
  );
});

router.get("/attendance/locations", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  const rows = await db
    .select()
    .from(attendanceLocationsTable)
    .where(eq(attendanceLocationsTable.companyId, context.companyId))
    .orderBy(asc(attendanceLocationsTable.name));
  res.json(
    ListAttendanceLocationsResponse.parse(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        latitude: row.latitude,
        longitude: row.longitude,
        radiusMeters: row.radiusMeters,
        active: row.active,
      })),
    ),
  );
});

router.post("/attendance/locations", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canManageCompany(context)) {
    res.status(403).json({ error: message(req, "attendanceLocationAdmin") });
    return;
  }
  const parsed = CreateAttendanceLocationBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [location] = await db
    .insert(attendanceLocationsTable)
    .values({
      companyId: context.companyId,
      name: parsed.data.name,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      radiusMeters: parsed.data.radiusMeters,
      active: parsed.data.active ?? true,
    })
    .returning();
  await recordAudit(
    context.companyId,
    "created",
    "attendance_location",
    location.id,
    location,
  );
  res.status(201).json(
    CreateAttendanceLocationResponse.parse({
      id: location.id,
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      radiusMeters: location.radiusMeters,
      active: location.active,
    }),
  );
});

router.patch(
  "/attendance/locations/:locationId",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canManageCompany(context)) {
      res.status(403).json({ error: message(req, "attendanceLocationAdmin") });
      return;
    }
    const params = UpdateAttendanceLocationParams.safeParse(req.params);
    const parsed = UpdateAttendanceLocationBody.safeParse(req.body ?? {});
    if (!params.success || !parsed.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const [existing] = await db
      .select()
      .from(attendanceLocationsTable)
      .where(
        and(
          eq(attendanceLocationsTable.id, params.data.locationId),
          eq(attendanceLocationsTable.companyId, context.companyId),
        ),
      )
      .limit(1);
    if (!existing) {
      res
        .status(404)
        .json({ error: message(req, "attendanceLocationNotFound") });
      return;
    }
    const [location] = await db
      .update(attendanceLocationsTable)
      .set(parsed.data)
      .where(eq(attendanceLocationsTable.id, existing.id))
      .returning();
    await recordAudit(
      context.companyId,
      "updated",
      "attendance_location",
      location.id,
      location,
    );
    res.json(
      UpdateAttendanceLocationResponse.parse({
        id: location.id,
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        radiusMeters: location.radiusMeters,
        active: location.active,
      }),
    );
  },
);

router.get("/subscription", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canManageCompany(context)) {
    res.status(403).json({ error: message(req, "subscriptionAccess") });
    return;
  }
  const [row] = await db
    .select({ subscription: subscriptionsTable, plan: plansTable })
    .from(subscriptionsTable)
    .innerJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
    .where(eq(subscriptionsTable.companyId, context.companyId))
    .limit(1);
  const activeEmployees = await db
    .select({ id: employeesTable.id })
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.companyId, context.companyId),
        eq(employeesTable.status, "active"),
      ),
    );
  res.json(
    GetSubscriptionResponse.parse({
      planName: row?.plan.name ?? message(req, "unconfigured"),
      status: (row?.subscription.status ?? "trial") as
        "trial" | "active" | "past_due" | "cancelled",
      activeEmployees: activeEmployees.length,
      employeeLimit: row?.subscription.employeeLimit ?? row?.plan.employeeLimit ?? 0,
      features: row?.plan.features ?? [],
    }),
  );
});

router.get("/platform/companies", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (context.role !== "platform_owner") {
    res.status(403).json({ error: message(req, "platformAdmin") });
    return;
  }
  const companies = await db
    .select()
    .from(companiesTable)
    .orderBy(asc(companiesTable.name));
  const rows = [];
  for (const company of companies) {
    const [subscription] = await db
      .select({ subscription: subscriptionsTable, plan: plansTable })
      .from(subscriptionsTable)
      .innerJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
      .where(eq(subscriptionsTable.companyId, company.id))
      .limit(1);
    const activeEmployees = await db
      .select({ id: employeesTable.id })
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.companyId, company.id),
          eq(employeesTable.status, "active"),
        ),
      );
    rows.push({
      id: company.id,
      name: company.name,
      status:
        company.active
          ? subscription?.subscription.status === "active"
            ? "active"
            : "trial"
          : "suspended",
      planName: subscription?.plan.name ?? message(req, "unconfigured"),
      activeEmployees: activeEmployees.length,
      employeeLimit:
        subscription?.subscription.employeeLimit ??
        subscription?.plan.employeeLimit ??
        0,
      lastActivity: company.createdAt.toISOString(),
    });
  }
  res.json(ListPlatformCompaniesResponse.parse(rows));
});

router.get("/platform/summary", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (context.role !== "platform_owner") {
    res.status(403).json({ error: message(req, "platformAdmin") });
    return;
  }

  const [companies, employees, accounts, subscriptions, activity] =
    await Promise.all([
      db.select().from(companiesTable).orderBy(desc(companiesTable.createdAt)),
      db.select({
        id: employeesTable.id,
        companyId: employeesTable.companyId,
        status: employeesTable.status,
      }).from(employeesTable),
      db.select({
        id: userAccountsTable.id,
        username: userAccountsTable.username,
        displayRole: userAccountsTable.displayRole,
        companyId: userAccountsTable.companyId,
        active: userAccountsTable.active,
        accountType: userAccountsTable.accountType,
      }).from(userAccountsTable),
      db.select({
        companyId: subscriptionsTable.companyId,
        status: subscriptionsTable.status,
        planName: plansTable.name,
        employeeLimit: subscriptionsTable.employeeLimit,
        planEmployeeLimit: plansTable.employeeLimit,
      }).from(subscriptionsTable)
        .innerJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id)),
      db.select({
        id: authAuditEventsTable.id,
        action: authAuditEventsTable.action,
        entityType: authAuditEventsTable.entityType,
        entityId: authAuditEventsTable.entityId,
        accountId: authAuditEventsTable.accountId,
        companyId: authAuditEventsTable.companyId,
        metadata: authAuditEventsTable.metadata,
        createdAt: authAuditEventsTable.createdAt,
      }).from(authAuditEventsTable)
        .orderBy(desc(authAuditEventsTable.createdAt))
        .limit(12),
    ]);

  const employeesByCompany = new Map<string, { total: number; active: number }>();
  for (const employee of employees) {
    const current = employeesByCompany.get(employee.companyId) ?? {
      total: 0,
      active: 0,
    };
    current.total += 1;
    if (employee.status === "active") current.active += 1;
    employeesByCompany.set(employee.companyId, current);
  }
  const accountsByCompany = new Map<string, typeof accounts>();
  for (const account of accounts) {
    if (!account.companyId) continue;
    const current = accountsByCompany.get(account.companyId) ?? [];
    current.push(account);
    accountsByCompany.set(account.companyId, current);
  }
  const subscriptionByCompany = new Map(
    subscriptions.map((subscription) => [subscription.companyId, subscription]),
  );
  const ownerByCompany = new Map(
    accounts
      .filter((account) => account.accountType === "company_owner" && account.companyId)
      .map((account) => [account.companyId!, account]),
  );

  const statusCounts = {
    trial: 0,
    active: 0,
    past_due: 0,
    cancelled: 0,
  };
  for (const subscription of subscriptions) {
    if (subscription.status in statusCounts) {
      statusCounts[subscription.status as keyof typeof statusCounts] += 1;
    }
  }

  const platformAlerts = [
    ...companies
      .filter((company) => !company.active)
      .map((company) => ({
        id: `company-suspended-${company.id}`,
        severity: "warning" as const,
        title: "Company suspended",
        detail: `${company.name} is not accepting active workspace access.`,
      })),
    ...subscriptions
      .filter((subscription) => subscription.status === "past_due")
      .map((subscription) => {
        const company = companies.find((item) => item.id === subscription.companyId);
        return {
          id: `subscription-past-due-${subscription.companyId}`,
          severity: "critical" as const,
          title: "Subscription needs attention",
          detail: `${company?.name ?? "A company"} has a past-due subscription.`,
        };
      }),
    ...companies
      .filter((company) => !ownerByCompany.has(company.id))
      .map((company) => ({
        id: `company-owner-missing-${company.id}`,
        severity: "critical" as const,
        title: "Company Owner missing",
        detail: `${company.name} has no Company Owner account.`,
      })),
  ];

  res.json({
    metrics: {
      totalCompanies: companies.length,
      activeCompanies: companies.filter((company) => company.active).length,
      suspendedCompanies: companies.filter((company) => !company.active).length,
      totalEmployees: employees.length,
      totalPlatformUsers: accounts.length,
      activeSubscriptions: subscriptions.filter(
        (subscription) => subscription.status === "active",
      ).length,
    },
    subscriptionStatus: statusCounts,
    companies: companies.map((company) => {
      const companyEmployees = employeesByCompany.get(company.id) ?? {
        total: 0,
        active: 0,
      };
      const companyAccounts = accountsByCompany.get(company.id) ?? [];
      const subscription = subscriptionByCompany.get(company.id);
      const owner = ownerByCompany.get(company.id);
      return {
        id: company.id,
        name: company.name,
        slug: company.slug,
         timezone: company.timezone,
         currency: company.currency,
        active: company.active,
        status: company.active
          ? subscription?.status === "active"
            ? "active"
            : subscription?.status ?? "trial"
          : "suspended",
        planName: subscription?.planName ?? "Unconfigured",
        subscriptionStatus: subscription?.status ?? "trial",
        employeeCount: companyEmployees.total,
        activeEmployees: companyEmployees.active,
        userCount: companyAccounts.length,
        activeUsers: companyAccounts.filter((account) => account.active).length,
        employeeLimit:
          subscription?.employeeLimit ??
          subscription?.planEmployeeLimit ??
          0,
        owner: owner
          ? {
              id: owner.id,
              username: owner.username,
              displayRole: owner.displayRole,
              active: owner.active,
            }
          : null,
        createdAt: company.createdAt.toISOString(),
      };
    }),
    activity: activity.map((event) => ({
      ...event,
      createdAt: event.createdAt.toISOString(),
    })),
    alerts: platformAlerts.slice(0, 8),
  });
});

export default router;
