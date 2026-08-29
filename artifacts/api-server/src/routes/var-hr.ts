import { Router, type IRouter, type Request, type Response } from "express";
import { createHash, randomBytes } from "node:crypto";
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
  type SQL,
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
  CreateAttendanceRuleVersionBody,
  CreateAttendanceRuleVersionResponse,
  CorrectAttendanceBody,
  CorrectAttendanceParams,
  CorrectAttendanceResponse,
  CreateBranchBody,
  CreateBranchResponse,
  GetBranchParams,
  GetBranchResponse,
  UpdateBranchBody,
  UpdateBranchResponse,
  CreateDepartmentBody,
  CreateDepartmentResponse,
  GetDepartmentParams,
  GetDepartmentResponse,
  CreateDeviceBody,
  CreateDeviceResponse,
  UpdateDeviceBody,
  UpdateDeviceResponse,
  CreateDeviceMappingBody,
  CreateDeviceMappingParams,
  CreateDeviceMappingResponse,
  CreateAttendanceLocationBody,
  CreateAttendanceLocationResponse,
  CreateEmployeeBody,
  CreateEmployeeResponse,
  DeleteBranchParams,
  DeleteBranchResponse,
  DeleteDepartmentParams,
  DeleteDepartmentResponse,
  DeleteEmployeeParams,
  DeleteEmployeeResponse,
  CreateHolidayBody,
  CreateHolidayResponse,
  CreateLeaveRequestBody,
  CreateLeaveRequestResponse,
  CreateLeavePolicyBody,
  CreateLeavePolicyResponse,
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
  PreviewAttendanceCalculationParams,
  PreviewAttendanceCalculationResponse,
  RecalculateAttendanceParams,
  RecalculateAttendanceResponse,
  CreateAttendanceTimeAdjustmentBody,
  CreateAttendanceTimeAdjustmentResponse,
  DecideAttendanceTimeAdjustmentBody,
  DecideAttendanceTimeAdjustmentParams,
  DecideAttendanceTimeAdjustmentResponse,
  ListAttendanceTimeAdjustmentsResponse,
  ReverseAttendanceTimeAdjustmentBody,
  ReverseAttendanceTimeAdjustmentParams,
  ReverseAttendanceTimeAdjustmentResponse,
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
  ListBiometricDeviceEventsResponse,
  ListAttendanceHistoryQueryParams,
  ListAttendanceHistoryResponse,
  ListAttendanceRuleVersionsResponse,
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
  ListLeavePoliciesResponse,
  ListLeaveBalanceTransactionsResponse,
  AdjustLeaveBalanceParams,
  AdjustLeaveBalanceBody,
  AdjustLeaveBalanceResponse,
  CancelLeaveRequestBody,
  CancelLeaveRequestParams,
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
  BulkAssignEmployeeSchedulesBody,
  BulkAssignEmployeeSchedulesResponse,
  ListScheduleAssignmentsResponse,
  SetDefaultWorkScheduleResponse,
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
  UpdateDepartmentBody,
  UpdateDepartmentParams,
  UpdateDepartmentResponse,
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
  attendanceRuleVersionsTable,
  attendanceRulesTable,
  attendanceLocationsTable,
  attendanceTable,
  attendanceCalculationsTable,
  attendanceTimeAdjustmentsTable,
  accountPermissionsTable,
  auditLogsTable,
  authAuditEventsTable,
  authSessionsTable,
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
  leavePoliciesTable,
  leaveBalanceTransactionsTable,
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
  getWorkspaceContext,
  getTenantContext,
  hasCapability,
  requirePlatformOwner,
  workspaceCapabilities,
  requestedLocale,
  type TenantContext,
} from "../lib/tenant-context";
import { translateApiMessage } from "../lib/i18n";
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

const employeeNationalIdUniqueConstraint =
  "var_hr_employees_company_national_id_uidx";
const employeePhoneUniqueConstraint = "var_hr_employees_company_phone_uidx";
const employeeNumberUniqueConstraint =
  "var_hr_employees_company_employee_number_uidx";

function postgresUniqueConstraint(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const candidate = error as { code?: unknown; constraint?: unknown };
  return candidate.code === "23505" && typeof candidate.constraint === "string"
    ? candidate.constraint
    : null;
}

function canUseCapability(
  context: TenantContext,
  capability: string,
  employeeMayUseOwn = false,
): boolean {
  const aliases: Record<string, string[]> = {
    schedules: ["schedules.view", "schedules.manage"],
    holidays: ["holidays.view", "holidays.manage"],
    devices: ["devices.view", "devices.manage"],
    "sync-history": ["sync-history.view"],
  };
  const granted = [capability, ...(aliases[capability] ?? [])];
  return (
    context.role === "platform_owner" ||
    context.role === "company_owner" ||
    (context.role === "employee" && employeeMayUseOwn) ||
    granted.some((value) => hasCapability(context, value))
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

function isValidClockTime(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
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
  schedule: Pick<EffectiveSchedule, "startTime" | "endTime" | "overnight">,
): boolean {
  return (
    schedule.overnight ||
    clockMinutes(schedule.endTime) <= clockMinutes(schedule.startTime)
  );
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
    branchId: row.device.branchId,
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

function mapWorkSchedule(
  schedule: typeof workSchedulesTable.$inferSelect,
  isDefault = false,
) {
  return {
    id: schedule.id,
    name: schedule.name,
    nameAr: schedule.nameAr,
    workingDays: schedule.workingDays,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    overnight: schedule.overnight,
    requiredHours: schedule.requiredHours,
    breakDurationMinutes: schedule.breakDurationMinutes,
    breakPaid: schedule.breakPaid,
    graceMinutes: schedule.graceMinutes,
    earlyCheckoutGraceMinutes: schedule.earlyCheckoutGraceMinutes,
    overtimeAfterMinutes: schedule.overtimeAfterMinutes,
    overtimeEligible: schedule.overtimeEligible,
    active: schedule.active,
    createdAt: schedule.createdAt.toISOString(),
    updatedAt: schedule.updatedAt.toISOString(),
    isDefault,
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
  latePenaltyMultiplier: 1,
  earlyDeparturePenaltyMultiplier: 1,
  absencePenaltyMultiplier: 1,
  permissionCoversLate: true,
  permissionCoversEarly: true,
  permissionCoveredMinutesMultiplier: 0,
  fullDayPermissionMultiplier: 0,
  workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
  holidayDates: [] as string[],
  gpsPolicy: "optional" as const,
  locationRadiusMeters: 180,
  version: 1,
  effectiveFrom: TODAY,
};

type ResolvedAttendanceRules = typeof defaultAttendanceRules & {
  id: string | null;
  companyId: string;
  effectiveTo: string | null;
  status: string;
  createdBy: string;
  createdAt: Date | null;
};

function rulesConfiguration(
  rules:
    typeof attendanceRulesTable.$inferSelect | typeof defaultAttendanceRules,
) {
  return {
    workStart: rules.workStart,
    workEnd: rules.workEnd,
    scheduleName: rules.scheduleName,
    requiredHours: rules.requiredHours,
    graceMinutes: rules.graceMinutes,
    earlyCheckoutGraceMinutes: rules.earlyCheckoutGraceMinutes,
    overtimeAfterMinutes: rules.overtimeAfterMinutes,
    overtimeEligible: rules.overtimeEligible,
    overtimeMethod: rules.overtimeMethod,
    overtimeMultiplier: rules.overtimeMultiplier,
    hourlyRateDivisor: rules.hourlyRateDivisor,
    lateDeductionMethod: rules.lateDeductionMethod,
    lateDeductionFactor: rules.lateDeductionFactor,
    earlyCheckoutDeductionFactor: rules.earlyCheckoutDeductionFactor,
    absenceDeductionMethod: rules.absenceDeductionMethod,
    absenceDeductionFactor: rules.absenceDeductionFactor,
    latePenaltyMultiplier: rules.latePenaltyMultiplier,
    earlyDeparturePenaltyMultiplier: rules.earlyDeparturePenaltyMultiplier,
    absencePenaltyMultiplier: rules.absencePenaltyMultiplier,
    permissionCoversLate: rules.permissionCoversLate,
    permissionCoversEarly: rules.permissionCoversEarly,
    permissionCoveredMinutesMultiplier:
      rules.permissionCoveredMinutesMultiplier,
    fullDayPermissionMultiplier: rules.fullDayPermissionMultiplier,
    holidayDates: rules.holidayDates,
    workingDays: rules.workingDays,
    gpsPolicy: rules.gpsPolicy,
    locationRadiusMeters: rules.locationRadiusMeters,
  };
}

async function ensureInitialRuleVersion(companyId: string) {
  const [existingVersion] = await db
    .select()
    .from(attendanceRuleVersionsTable)
    .where(eq(attendanceRuleVersionsTable.companyId, companyId))
    .orderBy(desc(attendanceRuleVersionsTable.version))
    .limit(1);
  if (existingVersion) return existingVersion;
  const [legacy] = await db
    .select()
    .from(attendanceRulesTable)
    .where(eq(attendanceRulesTable.companyId, companyId))
    .limit(1);
  const source = legacy ?? defaultAttendanceRules;
  const [created] = await db
    .insert(attendanceRuleVersionsTable)
    .values({
      companyId,
      version: source.version || 1,
      effectiveFrom: source.effectiveFrom || TODAY,
      status: "active",
      createdBy: legacy ? "migration" : "system",
      configuration: {
        ...rulesConfiguration(source),
        version: source.version || 1,
        effectiveFrom: source.effectiveFrom || TODAY,
      },
    })
    .returning();
  return created;
}

async function attendanceRulesFor(
  companyId: string,
  attendanceDate = TODAY,
): Promise<ResolvedAttendanceRules> {
  await ensureInitialRuleVersion(companyId);
  const [version] = await db
    .select()
    .from(attendanceRuleVersionsTable)
    .where(
      and(
        eq(attendanceRuleVersionsTable.companyId, companyId),
        lte(attendanceRuleVersionsTable.effectiveFrom, attendanceDate),
        or(
          sql`${attendanceRuleVersionsTable.effectiveTo} is null`,
          gte(attendanceRuleVersionsTable.effectiveTo, attendanceDate),
        ),
        eq(attendanceRuleVersionsTable.status, "active"),
      ),
    )
    .orderBy(
      desc(attendanceRuleVersionsTable.effectiveFrom),
      desc(attendanceRuleVersionsTable.version),
    )
    .limit(1);
  const selected =
    version ??
    (
      await db
        .select()
        .from(attendanceRuleVersionsTable)
        .where(eq(attendanceRuleVersionsTable.companyId, companyId))
        .orderBy(asc(attendanceRuleVersionsTable.effectiveFrom))
        .limit(1)
    )[0];
  if (!selected) {
    return {
      ...defaultAttendanceRules,
      id: null,
      companyId,
      effectiveTo: null,
      status: "active",
      createdBy: "system",
      createdAt: null,
    };
  }
  return {
    ...defaultAttendanceRules,
    ...(selected.configuration as Record<string, unknown>),
    id: selected.id,
    companyId: selected.companyId,
    version: selected.version,
    effectiveFrom: selected.effectiveFrom,
    effectiveTo: selected.effectiveTo,
    status: selected.status,
    createdBy: selected.createdBy,
    createdAt: selected.createdAt,
  } as ResolvedAttendanceRules;
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
  overnight: boolean;
  breakDurationMinutes: number;
  breakPaid: boolean;
  earlyCheckoutGraceMinutes: number;
  source:
    | "employee_assignment"
    | "department_default"
    | "company_default"
    | "legacy_rules";
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
    overnight: rules.workEnd <= rules.workStart,
    breakDurationMinutes: 0,
    breakPaid: true,
    earlyCheckoutGraceMinutes: rules.earlyCheckoutGraceMinutes,
    source: "legacy_rules",
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
    overnight: assignment.schedule.overnight,
    breakDurationMinutes: assignment.schedule.breakDurationMinutes,
    breakPaid: assignment.schedule.breakPaid,
    earlyCheckoutGraceMinutes: assignment.schedule.earlyCheckoutGraceMinutes,
    source: "employee_assignment",
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
  const rows = await scheduleRowsForCompany(companyId);
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
  if (assignment) {
    return {
      name: assignment.schedule.name,
      workingDays: assignment.schedule.workingDays,
      startTime: assignment.schedule.startTime,
      endTime: assignment.schedule.endTime,
      requiredHours: assignment.schedule.requiredHours,
      graceMinutes: assignment.schedule.graceMinutes,
      overtimeAfterMinutes: assignment.schedule.overtimeAfterMinutes,
      overtimeEligible: assignment.schedule.overtimeEligible,
      overnight: assignment.schedule.overnight,
      breakDurationMinutes: assignment.schedule.breakDurationMinutes,
      breakPaid: assignment.schedule.breakPaid,
      earlyCheckoutGraceMinutes: assignment.schedule.earlyCheckoutGraceMinutes,
      source: "employee_assignment",
    };
  }
  const [employee] = await db
    .select({ departmentId: employeesTable.departmentId })
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.id, employeeId),
        eq(employeesTable.companyId, companyId),
      ),
    )
    .limit(1);
  const [department] = employee?.departmentId
    ? await db
        .select({ defaultScheduleId: departmentsTable.defaultScheduleId })
        .from(departmentsTable)
        .where(
          and(
            eq(departmentsTable.id, employee.departmentId),
            eq(departmentsTable.companyId, companyId),
            eq(departmentsTable.active, true),
          ),
        )
        .limit(1)
    : [];
  if (department?.defaultScheduleId) {
    const [schedule] = await db
      .select()
      .from(workSchedulesTable)
      .where(
        and(
          eq(workSchedulesTable.id, department.defaultScheduleId),
          eq(workSchedulesTable.companyId, companyId),
          eq(workSchedulesTable.active, true),
        ),
      )
      .limit(1);
    if (schedule) {
      return {
        name: schedule.name,
        workingDays: schedule.workingDays,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        requiredHours: schedule.requiredHours,
        graceMinutes: schedule.graceMinutes,
        overtimeAfterMinutes: schedule.overtimeAfterMinutes,
        overtimeEligible: schedule.overtimeEligible,
        overnight: schedule.overnight,
        breakDurationMinutes: schedule.breakDurationMinutes,
        breakPaid: schedule.breakPaid,
        earlyCheckoutGraceMinutes: schedule.earlyCheckoutGraceMinutes,
        source: "department_default",
      };
    }
  }
  const [company] = await db
    .select({ defaultScheduleId: companiesTable.defaultScheduleId })
    .from(companiesTable)
    .where(eq(companiesTable.id, companyId))
    .limit(1);
  if (!company?.defaultScheduleId) return defaultScheduleFromRules(rules);
  const [schedule] = await db
    .select()
    .from(workSchedulesTable)
    .where(
      and(
        eq(workSchedulesTable.id, company.defaultScheduleId),
        eq(workSchedulesTable.companyId, companyId),
        eq(workSchedulesTable.active, true),
      ),
    )
    .limit(1);
  return schedule
    ? {
        name: schedule.name,
        workingDays: schedule.workingDays,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        requiredHours: schedule.requiredHours,
        graceMinutes: schedule.graceMinutes,
        overtimeAfterMinutes: schedule.overtimeAfterMinutes,
        overtimeEligible: schedule.overtimeEligible,
        overnight: schedule.overnight,
        breakDurationMinutes: schedule.breakDurationMinutes,
        breakPaid: schedule.breakPaid,
        earlyCheckoutGraceMinutes: schedule.earlyCheckoutGraceMinutes,
        source: "company_default",
      }
    : defaultScheduleFromRules(rules);
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

function permissionWindowMinutes(
  startTime: string,
  endTime: string,
  schedule: EffectiveSchedule,
): { start: number; end: number } {
  const start = Math.max(
    0,
    clockMinutes(startTime) - clockMinutes(schedule.startTime),
  );
  const rawEnd = clockMinutes(endTime) - clockMinutes(schedule.startTime);
  const end = Math.min(
    scheduleDurationMinutes(schedule.startTime, schedule.endTime),
    rawEnd <= 0 ? rawEnd + 1440 : rawEnd,
  );
  return { start, end: Math.max(start, end) };
}

function mergePermissionWindows(
  windows: Array<{ start: number; end: number }>,
): Array<{ start: number; end: number }> {
  return windows
    .filter((window) => window.end > window.start)
    .sort((a, b) => a.start - b.start)
    .reduce<Array<{ start: number; end: number }>>((merged, window) => {
      const previous = merged[merged.length - 1];
      if (previous && window.start <= previous.end) {
        previous.end = Math.max(previous.end, window.end);
      } else {
        merged.push({ ...window });
      }
      return merged;
    }, []);
}

function overlapMinutes(
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number,
): number {
  return Math.max(
    0,
    Math.min(firstEnd, secondEnd) - Math.max(firstStart, secondStart),
  );
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
  const breakMinutes = Math.min(
    Math.max(0, input.schedule.breakDurationMinutes),
    workedMinutes,
  );
  const unpaidBreakMinutes = input.schedule.breakPaid ? 0 : breakMinutes;
  const netWorkedMinutes = Math.max(0, workedMinutes - unpaidBreakMinutes);
  const normalScheduledMinutes = Math.max(
    0,
    scheduledMinutes -
      (input.schedule.breakPaid ? 0 : input.schedule.breakDurationMinutes),
  );
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
  const rawLateMinutes =
    input.holiday || !workingDay ? 0 : Math.max(0, checkInElapsed);
  const lateMinutes = Math.max(0, rawLateMinutes - input.schedule.graceMinutes);
  const rawEarlyDepartureMinutes =
    input.holiday || !workingDay || !input.checkOut
      ? 0
      : Math.max(0, scheduledMinutes - checkOutElapsed);
  const earlyCheckoutMinutes = Math.max(
    0,
    rawEarlyDepartureMinutes - input.schedule.earlyCheckoutGraceMinutes,
  );
  const missingMinutes =
    input.holiday || !workingDay || !input.checkOut
      ? 0
      : Math.max(
          0,
          Math.round(input.schedule.requiredHours * 60) - netWorkedMinutes,
        );
  const overtimeMinutes =
    input.schedule.overtimeEligible && workingDay && !input.holiday
      ? Math.max(
          0,
          netWorkedMinutes -
            normalScheduledMinutes -
            input.schedule.overtimeAfterMinutes,
        )
      : 0;
  return {
    workedMinutes,
    netWorkedMinutes,
    breakMinutes,
    unpaidBreakMinutes,
    normalWorkedMinutes: Math.min(netWorkedMinutes, normalScheduledMinutes),
    overtimeMinutes,
    workedHours: Number((workedMinutes / 60).toFixed(2)),
    overtimeHours: Number((overtimeMinutes / 60).toFixed(2)),
    lateMinutes,
    earlyCheckoutMinutes,
    rawEarlyDepartureMinutes,
    missingMinutes,
    rawLateMinutes,
    lateGraceMinutes: input.schedule.graceMinutes,
    earlyDepartureGraceMinutes: input.schedule.earlyCheckoutGraceMinutes,
    workingDay,
    holiday: input.holiday,
  };
}

async function attendanceCalculationFor(
  context: TenantContext,
  attendance: typeof attendanceTable.$inferSelect,
  persist: boolean,
) {
  const rules = await attendanceRulesFor(context.companyId, attendance.date);
  const schedule = await effectiveScheduleFor(
    context.companyId,
    attendance.employeeId,
    attendance.date,
    rules,
  );
  const [employee] = await db
    .select({ automaticOvertime: employeesTable.automaticOvertime })
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.id, attendance.employeeId),
        eq(employeesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  const overtimeEligible =
    employee?.automaticOvertime === "enabled"
      ? true
      : employee?.automaticOvertime === "disabled"
        ? false
        : rules.overtimeEligible;
  const calculationSchedule = { ...schedule, overtimeEligible };
  const holiday = isHolidayDate(
    attendance.date,
    rules,
    await holidaysForCompany(context.companyId),
  );
  const [approvedLeave] = await db
    .select({ id: leaveRequestsTable.id })
    .from(leaveRequestsTable)
    .where(
      and(
        eq(leaveRequestsTable.companyId, context.companyId),
        eq(leaveRequestsTable.employeeId, attendance.employeeId),
        eq(leaveRequestsTable.status, "approved"),
        lte(leaveRequestsTable.from, attendance.date),
        gte(leaveRequestsTable.to, attendance.date),
      ),
    )
    .limit(1);
  const permissionRequests = await db
    .select()
    .from(permissionRequestsTable)
    .where(
      and(
        eq(permissionRequestsTable.companyId, context.companyId),
        eq(permissionRequestsTable.employeeId, attendance.employeeId),
        eq(permissionRequestsTable.date, attendance.date),
      ),
    );
  const approvedPermissions = permissionRequests.filter(
    (permission) => permission.status === "approved",
  );
  const pendingPermissionCount = permissionRequests.filter(
    (permission) => permission.status === "pending",
  ).length;
  const rejectedPermissionCount = permissionRequests.filter(
    (permission) => permission.status === "rejected",
  ).length;
  const adjustmentRows = await db
    .select()
    .from(attendanceTimeAdjustmentsTable)
    .where(
      and(
        eq(attendanceTimeAdjustmentsTable.companyId, context.companyId),
        eq(attendanceTimeAdjustmentsTable.attendanceId, attendance.id),
      ),
    )
    .orderBy(desc(attendanceTimeAdjustmentsTable.createdAt));
  const approvedAdjustments = adjustmentRows.filter(
    (adjustment) => adjustment.status === "approved",
  );
  const approvedPermissionWindows = mergePermissionWindows(
    approvedPermissions.map((permission) =>
      permissionWindowMinutes(
        permission.startTime,
        permission.endTime,
        schedule,
      ),
    ),
  );
  const metrics = attendanceMetrics({
    checkIn: attendance.checkIn,
    checkOut: attendance.checkOut,
    attendanceDate: attendance.date,
    schedule: calculationSchedule,
    rules,
    timeZone: context.company.timezone,
    holiday,
  });
  const manualMinutes = approvedAdjustments
    .filter((adjustment) => adjustment.adjustmentType === "time")
    .reduce((total, adjustment) => total + adjustment.minutes, 0);
  const manualOvertimeMinutes = approvedAdjustments
    .filter((adjustment) => adjustment.adjustmentType === "overtime")
    .reduce((total, adjustment) => total + Math.max(0, adjustment.minutes), 0);
  const manualPermissionMinutes = approvedAdjustments
    .filter((adjustment) => adjustment.adjustmentType === "permission")
    .reduce((total, adjustment) => total + Math.max(0, adjustment.minutes), 0);
  const finalWorkedMinutes = Math.max(
    0,
    metrics.netWorkedMinutes + manualMinutes,
  );
  const scheduledMinutes = scheduleDurationMinutes(
    schedule.startTime,
    schedule.endTime,
  );
  const fullDayPermission = approvedPermissionWindows.some(
    (window) => window.start <= 0 && window.end >= scheduledMinutes,
  );
  const approvedPermissionMinutes = approvedPermissionWindows.reduce(
    (total, window) =>
      total + overlapMinutes(0, scheduledMinutes, window.start, window.end),
    0,
  );
  const latePermissionMinutes = approvedPermissionWindows.reduce(
    (total, window) =>
      total +
      overlapMinutes(0, metrics.rawLateMinutes, window.start, window.end),
    0,
  );
  const earlyPermissionMinutes = approvedPermissionWindows.reduce(
    (total, window) =>
      total +
      overlapMinutes(
        scheduledMinutes - metrics.rawEarlyDepartureMinutes,
        scheduledMinutes,
        window.start,
        window.end,
      ),
    0,
  );
  const permissionCoveredLateMinutes = rules.permissionCoversLate
    ? Math.min(metrics.lateMinutes, latePermissionMinutes)
    : 0;
  const permissionCoveredEarlyMinutes = rules.permissionCoversEarly
    ? Math.min(metrics.earlyCheckoutMinutes, earlyPermissionMinutes)
    : 0;
  const uncoveredLateMinutes = Math.max(
    0,
    metrics.lateMinutes - permissionCoveredLateMinutes,
  );
  const uncoveredEarlyMinutes = Math.max(
    0,
    metrics.earlyCheckoutMinutes - permissionCoveredEarlyMinutes,
  );
  const attendanceState = holiday
    ? "holiday"
    : !metrics.workingDay
      ? "scheduled_day_off"
      : approvedLeave
        ? "approved_leave"
        : fullDayPermission
          ? "approved_permission"
          : attendance.status === "absent"
            ? "unexcused_absence"
            : !attendance.checkIn
              ? "missing_attendance"
              : "present";
  const latePenaltyMinutes =
    uncoveredLateMinutes * rules.latePenaltyMultiplier +
    permissionCoveredLateMinutes *
      (fullDayPermission
        ? rules.fullDayPermissionMultiplier
        : rules.permissionCoveredMinutesMultiplier);
  const earlyDeparturePenaltyMinutes =
    uncoveredEarlyMinutes * rules.earlyDeparturePenaltyMultiplier +
    permissionCoveredEarlyMinutes *
      (fullDayPermission
        ? rules.fullDayPermissionMultiplier
        : rules.permissionCoveredMinutesMultiplier);
  const absencePenaltyMinutes =
    attendanceState === "unexcused_absence" ||
    attendanceState === "missing_attendance"
      ? Math.round(scheduledMinutes * rules.absencePenaltyMultiplier)
      : 0;
  const totalPenaltyMinutes =
    latePenaltyMinutes + earlyDeparturePenaltyMinutes + absencePenaltyMinutes;
  const automaticOvertimeMinutes = calculationSchedule.overtimeEligible
    ? Math.max(
        0,
        finalWorkedMinutes -
          Math.max(
            0,
            scheduledMinutes -
              (calculationSchedule.breakPaid
                ? 0
                : calculationSchedule.breakDurationMinutes),
          ) -
          rules.overtimeAfterMinutes,
      )
    : 0;
  const finalOvertimeMinutes = Math.max(
    0,
    automaticOvertimeMinutes + manualOvertimeMinutes,
  );
  const finalPenaltyMinutes = Math.max(
    0,
    totalPenaltyMinutes - manualPermissionMinutes,
  );
  const explanation = [
    `Rule version ${rules.version} effective from ${rules.effectiveFrom}.`,
    `Schedule source: ${calculationSchedule.source}; ${calculationSchedule.startTime}–${calculationSchedule.endTime}${calculationSchedule.overnight ? " (overnight)" : ""}.`,
    `Automatic overtime: ${calculationSchedule.overtimeEligible ? "enabled" : "disabled"}; employee setting: ${employee?.automaticOvertime ?? "default"}.`,
    `Working day: ${metrics.workingDay ? "yes" : "no"}; holiday: ${metrics.holiday ? "yes" : "no"}.`,
    `Late: raw ${metrics.rawLateMinutes} − grace ${metrics.lateGraceMinutes} = effective ${metrics.lateMinutes} minutes.`,
    `Early departure: raw ${metrics.rawEarlyDepartureMinutes} − grace ${metrics.earlyDepartureGraceMinutes} = effective ${metrics.earlyCheckoutMinutes} minutes.`,
    `Worked: ${metrics.workedMinutes} elapsed minutes − ${metrics.unpaidBreakMinutes} unpaid break minutes = ${metrics.netWorkedMinutes} net minutes (${metrics.breakMinutes} total scheduled break minutes; ${schedule.breakPaid ? "paid" : "unpaid"}).`,
    `Normal time: ${metrics.normalWorkedMinutes} minutes; overtime: ${metrics.overtimeMinutes} minutes.`,
    `Attendance state: ${attendanceState}. Approved leave: ${approvedLeave ? "yes" : "no"}; permissions: ${approvedPermissions.length} approved, ${pendingPermissionCount} pending, ${rejectedPermissionCount} rejected.`,
    `Permission coverage uses merged approved windows (overlaps counted once): ${approvedPermissionMinutes} minutes total, ${permissionCoveredLateMinutes} late minutes, ${permissionCoveredEarlyMinutes} early-departure minutes${fullDayPermission ? "; full-day policy applies" : ""}.`,
    `Penalties: late ${uncoveredLateMinutes} × ${rules.latePenaltyMultiplier} + covered ${permissionCoveredLateMinutes} × ${fullDayPermission ? rules.fullDayPermissionMultiplier : rules.permissionCoveredMinutesMultiplier}; early ${uncoveredEarlyMinutes} × ${rules.earlyDeparturePenaltyMultiplier} + covered ${permissionCoveredEarlyMinutes} × ${fullDayPermission ? rules.fullDayPermissionMultiplier : rules.permissionCoveredMinutesMultiplier}; absence ${absencePenaltyMinutes} minutes; total ${totalPenaltyMinutes} minutes.`,
  ];
  const values = {
    companyId: context.companyId,
    attendanceId: attendance.id,
    employeeId: attendance.employeeId,
    attendanceDate: attendance.date,
    ruleVersion: rules.version,
    ruleEffectiveFrom: rules.effectiveFrom,
    scheduleSource: schedule.source,
    rawLateMinutes: metrics.rawLateMinutes,
    lateGraceMinutes: metrics.lateGraceMinutes,
    effectiveLateMinutes: metrics.lateMinutes,
    rawEarlyDepartureMinutes: metrics.rawEarlyDepartureMinutes,
    earlyDepartureGraceMinutes: metrics.earlyDepartureGraceMinutes,
    effectiveEarlyDepartureMinutes: metrics.earlyCheckoutMinutes,
    workedMinutes: metrics.workedMinutes,
    breakMinutes: metrics.breakMinutes,
    paidBreak: schedule.breakPaid,
    normalWorkedMinutes: metrics.normalWorkedMinutes,
    overtimeMinutes: metrics.overtimeMinutes,
    workingDay: metrics.workingDay,
    holiday: metrics.holiday,
    attendanceState,
    approvedPermissionMinutes,
    permissionCoveredLateMinutes,
    permissionCoveredEarlyMinutes,
    latePenaltyMinutes,
    earlyDeparturePenaltyMinutes,
    absencePenaltyMinutes,
    totalPenaltyMinutes,
    originalWorkedMinutes: metrics.netWorkedMinutes,
    originalOvertimeMinutes: metrics.overtimeMinutes,
    manualMinutes,
    manualOvertimeMinutes,
    manualPermissionMinutes,
    finalWorkedMinutes,
    finalOvertimeMinutes,
    finalPenaltyMinutes,
    adjustments: adjustmentRows,
    explanation,
    calculatedAt: new Date(),
    updatedAt: new Date(),
  };
  if (persist) {
    const [stored] = await db
      .insert(attendanceCalculationsTable)
      .values(values)
      .onConflictDoUpdate({
        target: attendanceCalculationsTable.attendanceId,
        set: values,
      })
      .returning();
    return stored;
  }
  return {
    id: attendance.id,
    ...values,
    calculatedAt: values.calculatedAt,
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

export async function applyProviderAttendanceEvent(
  context: Pick<TenantContext, "companyId" | "company">,
  event: ProviderAttendanceEvent,
  employeeId: string,
): Promise<void> {
  const eventDate = localCalendarDate(
    event.occurredAt,
    context.company.timezone,
  );
  const rules = await attendanceRulesFor(context.companyId, eventDate);
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
  const rows = await db
    .select({
      employee: employeesTable,
      department: departmentsTable,
      branch: branchesTable,
    })
    .from(employeesTable)
    .leftJoin(
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
    .orderBy(
      sql`CASE WHEN ${employeesTable.employeeNumber} ~ '^[0-9]+$' THEN ${employeesTable.employeeNumber}::bigint ELSE 9223372036854775807 END`,
      asc(employeesTable.firstName),
    );
  const devices = await db
    .select({ branchId: devicesTable.branchId })
    .from(devicesTable)
    .where(eq(devicesTable.companyId, context.companyId));
  const deviceCounts = new Map<string, number>();
  for (const device of devices) {
    deviceCounts.set(
      device.branchId,
      (deviceCounts.get(device.branchId) ?? 0) + 1,
    );
  }
  return rows.map((row) => ({
    ...row,
    deviceCount: deviceCounts.get(row.branch.id) ?? 0,
  }));
}

async function allocateEmployeeNumber(companyId: string): Promise<string> {
  const existing = await db
    .select({ employeeNumber: employeesTable.employeeNumber })
    .from(employeesTable)
    .where(eq(employeesTable.companyId, companyId));
  const used = new Set(
    existing.map((item) => item.employeeNumber.trim().toLowerCase()),
  );
  let sequence = 1;
  let candidate = String(sequence);
  while (used.has(candidate.toLowerCase())) {
    sequence += 1;
    candidate = String(sequence);
  }
  return candidate;
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
    nationalId: row.employee.nationalId,
    biometricCode: row.employee.biometricCode,
    workingHours: row.employee.workingHours,
    department: row.department
      ? {
          id: row.department.id,
          name: row.department.name,
          nameAr: row.department.nameAr,
          active: row.department.active,
          employeeCount: 0,
        }
      : null,
    branch: {
      id: row.branch.id,
      name: row.branch.name,
      city: row.branch.city,
      employeeCount: 0,
      deviceCount: row.deviceCount,
      gpsEnabled: row.branch.gpsEnabled,
      active: row.branch.active,
      createdAt: row.branch.createdAt.toISOString(),
      updatedAt: row.branch.updatedAt.toISOString(),
    },
    status: row.employee.status as "active" | "inactive",
    role: row.employee.role as "employee" | "manager",
    automaticOvertime: (row.employee.automaticOvertime ?? "default") as
      | "default"
      | "enabled"
      | "disabled",
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

async function validateDepartmentReferences(
  companyId: string,
  managerId: string | null | undefined,
  defaultScheduleId: string | null | undefined,
) {
  const [manager, schedule] = await Promise.all([
    managerId
      ? db
          .select({ id: employeesTable.id })
          .from(employeesTable)
          .where(
            and(
              eq(employeesTable.id, managerId),
              eq(employeesTable.companyId, companyId),
              eq(employeesTable.status, "active"),
              eq(employeesTable.role, "manager"),
            ),
          )
          .limit(1)
      : Promise.resolve([{ id: null }]),
    defaultScheduleId
      ? db
          .select({ id: workSchedulesTable.id })
          .from(workSchedulesTable)
          .where(
            and(
              eq(workSchedulesTable.id, defaultScheduleId),
              eq(workSchedulesTable.companyId, companyId),
              eq(workSchedulesTable.active, true),
            ),
          )
          .limit(1)
      : Promise.resolve([{ id: null }]),
  ]);
  return (!managerId || manager.length > 0) &&
    (!defaultScheduleId || schedule.length > 0);
}

async function validateEmployeeDepartmentReferences(
  companyId: string,
  departmentId: string | null | undefined,
  branchId: string | null | undefined,
) {
  const [department, branch] = await Promise.all([
    departmentId
      ? db
          .select({ id: departmentsTable.id })
          .from(departmentsTable)
          .where(
            and(
              eq(departmentsTable.id, departmentId),
              eq(departmentsTable.companyId, companyId),
              eq(departmentsTable.active, true),
            ),
          )
          .limit(1)
      : Promise.resolve([{ id: null }]),
    branchId
      ? db
          .select({ id: branchesTable.id })
          .from(branchesTable)
          .where(
            and(
              eq(branchesTable.id, branchId),
              eq(branchesTable.companyId, companyId),
            ),
          )
          .limit(1)
      : Promise.resolve([{ id: null }]),
  ]);
  return (
    (!departmentId || department.length > 0) &&
    (!branchId || branch.length > 0)
  );
}

async function employeeDeleteDependencies(companyId: string, employeeId: string) {
  const [
    attendance,
    attendanceCalculations,
    leaveRequests,
    permissionRequests,
    attendanceAdjustments,
    leaveBalances,
    leaveTransactions,
    payrollCalculations,
    payrollAdjustments,
    scheduleAssignments,
    deviceMappings,
    biometricEvents,
    hrRecords,
    hrManagerRecords,
    identities,
    departmentManager,
  ] = await Promise.all([
    db.select({ id: attendanceTable.id }).from(attendanceTable).where(
      and(eq(attendanceTable.companyId, companyId), eq(attendanceTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: attendanceCalculationsTable.id }).from(attendanceCalculationsTable).where(
      and(eq(attendanceCalculationsTable.companyId, companyId), eq(attendanceCalculationsTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: leaveRequestsTable.id }).from(leaveRequestsTable).where(
      and(eq(leaveRequestsTable.companyId, companyId), eq(leaveRequestsTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: permissionRequestsTable.id }).from(permissionRequestsTable).where(
      and(eq(permissionRequestsTable.companyId, companyId), eq(permissionRequestsTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: attendanceTimeAdjustmentsTable.id }).from(attendanceTimeAdjustmentsTable).where(
      and(eq(attendanceTimeAdjustmentsTable.companyId, companyId), eq(attendanceTimeAdjustmentsTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: leaveBalancesTable.id }).from(leaveBalancesTable).where(
      and(eq(leaveBalancesTable.companyId, companyId), eq(leaveBalancesTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: leaveBalanceTransactionsTable.id }).from(leaveBalanceTransactionsTable).where(
      and(eq(leaveBalanceTransactionsTable.companyId, companyId), eq(leaveBalanceTransactionsTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: payrollCalculationsTable.id }).from(payrollCalculationsTable).where(
      and(eq(payrollCalculationsTable.companyId, companyId), eq(payrollCalculationsTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: payrollAdjustmentsTable.id }).from(payrollAdjustmentsTable).where(
      and(eq(payrollAdjustmentsTable.companyId, companyId), eq(payrollAdjustmentsTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: employeeScheduleAssignmentsTable.id }).from(employeeScheduleAssignmentsTable).where(
      and(eq(employeeScheduleAssignmentsTable.companyId, companyId), eq(employeeScheduleAssignmentsTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: deviceEmployeeMappingsTable.id }).from(deviceEmployeeMappingsTable).where(
      and(eq(deviceEmployeeMappingsTable.companyId, companyId), eq(deviceEmployeeMappingsTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: biometricEventsTable.id }).from(biometricEventsTable).where(
      and(eq(biometricEventsTable.companyId, companyId), eq(biometricEventsTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: employeeHrRecordsTable.id }).from(employeeHrRecordsTable).where(
      and(eq(employeeHrRecordsTable.companyId, companyId), eq(employeeHrRecordsTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: employeeHrRecordsTable.id }).from(employeeHrRecordsTable).where(
      and(eq(employeeHrRecordsTable.companyId, companyId), eq(employeeHrRecordsTable.managerId, employeeId)),
    ).limit(1),
    db.select({ id: employeeIdentitiesTable.id }).from(employeeIdentitiesTable).where(
      and(eq(employeeIdentitiesTable.companyId, companyId), eq(employeeIdentitiesTable.employeeId, employeeId)),
    ).limit(1),
    db.select({ id: departmentsTable.id }).from(departmentsTable).where(
      and(eq(departmentsTable.companyId, companyId), eq(departmentsTable.managerId, employeeId)),
    ).limit(1),
  ]);
  return [
    ["attendance", attendance],
    ["attendanceCalculations", attendanceCalculations],
    ["leaveRequests", leaveRequests],
    ["permissionRequests", permissionRequests],
    ["attendanceAdjustments", attendanceAdjustments],
    ["leaveBalances", leaveBalances],
    ["leaveTransactions", leaveTransactions],
    ["payrollCalculations", payrollCalculations],
    ["payrollAdjustments", payrollAdjustments],
    ["scheduleAssignments", scheduleAssignments],
    ["deviceMappings", deviceMappings],
    ["biometricEvents", biometricEvents],
    ["hrRecords", hrRecords],
    ["hrManagerRecords", hrManagerRecords],
    ["biometricIdentity", identities],
    ["departmentManager", departmentManager],
  ].filter(([, rows]) => rows.length > 0).map(([name]) => name);
}

async function departmentResponse(
  context: TenantContext,
  departmentId: string,
) {
  const [department] = await db
    .select()
    .from(departmentsTable)
    .where(
      and(
        eq(departmentsTable.id, departmentId),
        eq(departmentsTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!department) return null;
  const members = await db
    .select()
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.companyId, context.companyId),
        eq(employeesTable.departmentId, department.id),
        employeeScopeCondition(context),
      ),
    )
    .orderBy(asc(employeesTable.firstName));
  const manager = department.managerId
    ? (
        await db
          .select()
          .from(employeesTable)
          .where(
            and(
              eq(employeesTable.id, department.managerId),
              eq(employeesTable.companyId, context.companyId),
            ),
          )
          .limit(1)
      )[0]
    : null;
  return {
    id: department.id,
    name: department.name,
    nameAr: department.nameAr,
    description: department.description,
    active: department.active,
    manager: manager
      ? employeeReference(manager, department.name)
      : null,
    defaultScheduleId: department.defaultScheduleId,
    employeeCount: members.length,
    employees: members.map((employee) =>
      employeeReference(employee, department.name),
    ),
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
    actorType: "system",
    actorId: "system",
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
  const context = await getWorkspaceContext(req);
  const locale = requestedLocale(req);
  const response = {
    company: context.company
      ? {
          id: context.company.id,
          name: context.company.name,
          slug: context.company.slug,
          timezone: context.company.timezone,
          currency: context.company.currency,
        }
      : null,
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
  const devices = canUseCapability(context, "devices.view")
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
      departments: new Set(
        employees
          .map((item) => item.department?.id)
          .filter((id): id is string => Boolean(id)),
      ).size,
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
  if (!canUseCapability(context, "departments.view", true)) {
    res.status(403).json({ error: message(req, "noPermissionCreateDepartments") });
    return;
  }
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
  const response = (
    await Promise.all(
      departments.map((department) =>
        departmentResponse(context, department.id),
      ),
    )
  ).filter((department): department is NonNullable<typeof department> =>
    Boolean(department),
  );
  res.json(ListDepartmentsResponse.parse(response));
});

router.post("/departments", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "departments.manage")) {
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
    .values({
      companyId: context.companyId,
      name: parsed.data.name,
      // Keep the legacy column in sync while department names remain a
      // single, locale-independent value in the product.
      nameAr: parsed.data.name,
    })
    .returning();
  await recordAudit(
    context.companyId,
    "created",
    "department",
    department.id,
    department,
  );
  const response = await departmentResponse(context, department.id);
  res.status(201).json(CreateDepartmentResponse.parse(response));
});

router.get("/departments/:departmentId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  const params = GetDepartmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (
    (context.role === "employee" || context.role === "manager") &&
    params.data.departmentId !== context.departmentId
  ) {
    res.status(403).json({ error: message(req, "workspaceAccessDenied") });
    return;
  }
  const response = await departmentResponse(context, params.data.departmentId);
  if (!response) {
    res.status(404).json({ error: message(req, "invalidRequest") });
    return;
  }
  res.json(GetDepartmentResponse.parse(response));
});

router.patch("/departments/:departmentId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "departments.manage")) {
    res
      .status(403)
      .json({ error: message(req, "noPermissionCreateDepartments") });
    return;
  }
  const params = UpdateDepartmentParams.safeParse(req.params);
  const parsed = UpdateDepartmentBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [before] = await db
    .select()
    .from(departmentsTable)
    .where(
      and(
        eq(departmentsTable.id, params.data.departmentId),
        eq(departmentsTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!before) {
    res.status(404).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [department] = await db
    .update(departmentsTable)
    .set({
      ...parsed.data,
      ...(parsed.data.name !== undefined ? { nameAr: parsed.data.name } : {}),
    })
    .where(
      and(
        eq(departmentsTable.id, before.id),
        eq(departmentsTable.companyId, context.companyId),
      ),
    )
    .returning();
  await recordAudit(
    context.companyId,
    "updated",
    "department",
    department.id,
    department,
    before,
  );
  const response = await departmentResponse(context, department.id);
  res.json(UpdateDepartmentResponse.parse(response));
});

router.delete("/departments/:departmentId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "departments.manage")) {
    res
      .status(403)
      .json({ error: message(req, "noPermissionCreateDepartments") });
    return;
  }
  const params = DeleteDepartmentParams.safeParse(req.params);
  if (!params.success || !isUuid(params.data.departmentId)) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [department] = await db
    .select()
    .from(departmentsTable)
    .where(
      and(
        eq(departmentsTable.id, params.data.departmentId),
        eq(departmentsTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!department) {
    res.status(404).json({ error: message(req, "invalidRequest") });
    return;
  }
  const members = await db
    .select({ id: employeesTable.id })
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.companyId, context.companyId),
        eq(employeesTable.departmentId, department.id),
      ),
    )
    .limit(1);
  if (members.length > 0) {
    res.status(409).json({
      error: message(req, "departmentDeleteBlocked"),
      code: "DEPARTMENT_DELETE_BLOCKED",
    });
    return;
  }
  await db
    .delete(departmentsTable)
    .where(
      and(
        eq(departmentsTable.id, department.id),
        eq(departmentsTable.companyId, context.companyId),
      ),
    );
  await recordAudit(
    context.companyId,
    "deleted",
    "department",
    department.id,
    null,
    department,
  );
  res.status(204).send(DeleteDepartmentResponse.parse(undefined));
});

router.get("/branches", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "branches.view", true)) {
    res.status(403).json({ error: message(req, "noPermissionCreateBranches") });
    return;
  }
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
  const devices = await db
    .select({ branchId: devicesTable.branchId })
    .from(devicesTable)
    .where(eq(devicesTable.companyId, context.companyId));
  res.json(
    ListBranchesResponse.parse(
      branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        city: branch.city,
        employeeCount: employees.filter(
          (employee) => employee.branchId === branch.id,
        ).length,
        deviceCount: devices.filter((device) => device.branchId === branch.id).length,
        gpsEnabled: branch.gpsEnabled,
        active: branch.active,
        createdAt: branch.createdAt.toISOString(),
        updatedAt: branch.updatedAt.toISOString(),
      })),
    ),
  );
});

router.post("/branches", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "branches.manage")) {
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
      deviceCount: 0,
      gpsEnabled: branch.gpsEnabled,
      active: branch.active,
      createdAt: branch.createdAt.toISOString(),
      updatedAt: branch.updatedAt.toISOString(),
    }),
  );
});

async function branchResponse(context: TenantContext, branchId: string) {
  const [branch] = await db
    .select()
    .from(branchesTable)
    .where(
      and(
        eq(branchesTable.id, branchId),
        eq(branchesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!branch) return null;
  const [employeeRows, deviceRowsForBranch] = await Promise.all([
    db
      .select({ id: employeesTable.id })
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.companyId, context.companyId),
          eq(employeesTable.branchId, branch.id),
        ),
      ),
    db
      .select({ id: devicesTable.id })
      .from(devicesTable)
      .where(
        and(
          eq(devicesTable.companyId, context.companyId),
          eq(devicesTable.branchId, branch.id),
        ),
      ),
  ]);
  return {
    id: branch.id,
    name: branch.name,
    city: branch.city,
    employeeCount: employeeRows.length,
    deviceCount: deviceRowsForBranch.length,
    gpsEnabled: branch.gpsEnabled,
    active: branch.active,
    createdAt: branch.createdAt.toISOString(),
    updatedAt: branch.updatedAt.toISOString(),
  };
}

router.get("/branches/:branchId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "branches.view", true)) {
    denyCapability(res, req, "branches.view");
    return;
  }
  const params = GetBranchParams.safeParse(req.params);
  if (!params.success || !isUuid(params.data.branchId)) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const response = await branchResponse(context, params.data.branchId);
  if (!response) {
    res.status(404).json({ error: message(req, "branchNotFound") });
    return;
  }
  res.json(GetBranchResponse.parse(response));
});

router.patch("/branches/:branchId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "branches.manage")) {
    res.status(403).json({ error: message(req, "noPermissionCreateBranches") });
    return;
  }
  const params = GetBranchParams.safeParse(req.params);
  const parsed = UpdateBranchBody.safeParse(req.body);
  if (!params.success || !isUuid(params.data.branchId) || !parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [before] = await db
    .select()
    .from(branchesTable)
    .where(
      and(
        eq(branchesTable.id, params.data.branchId),
        eq(branchesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!before) {
    res.status(404).json({ error: message(req, "branchNotFound") });
    return;
  }
  const [branch] = await db
    .update(branchesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(
      and(
        eq(branchesTable.id, before.id),
        eq(branchesTable.companyId, context.companyId),
      ),
    )
    .returning();
  await recordAudit(
    context.companyId,
    "updated",
    "branch",
    branch.id,
    branch,
    before,
  );
  const response = await branchResponse(context, branch.id);
  res.json(UpdateBranchResponse.parse(response));
});

router.delete("/branches/:branchId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "branches.manage")) {
    res.status(403).json({ error: message(req, "noPermissionCreateBranches") });
    return;
  }
  const params = DeleteBranchParams.safeParse(req.params);
  if (!params.success || !isUuid(params.data.branchId)) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [branch] = await db
    .select()
    .from(branchesTable)
    .where(
      and(
        eq(branchesTable.id, params.data.branchId),
        eq(branchesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!branch) {
    res.status(404).json({ error: message(req, "branchNotFound") });
    return;
  }
  const [employeeReference, deviceReference] = await Promise.all([
    db
      .select({ id: employeesTable.id })
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.companyId, context.companyId),
          eq(employeesTable.branchId, branch.id),
        ),
      )
      .limit(1),
    db
      .select({ id: devicesTable.id })
      .from(devicesTable)
      .where(
        and(
          eq(devicesTable.companyId, context.companyId),
          eq(devicesTable.branchId, branch.id),
        ),
      )
      .limit(1),
  ]);
  if (employeeReference.length > 0 || deviceReference.length > 0) {
    res.status(409).json({
      error: message(req, "branchDeleteBlocked"),
      code: "BRANCH_DELETE_BLOCKED",
    });
    return;
  }
  await db
    .delete(branchesTable)
    .where(
      and(
        eq(branchesTable.id, branch.id),
        eq(branchesTable.companyId, context.companyId),
      ),
    );
  await recordAudit(
    context.companyId,
    "deleted",
    "branch",
    branch.id,
    null,
    branch,
  );
  res.status(204).send(DeleteBranchResponse.parse(undefined));
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
  if (!canUseCapability(context, "employees.create")) {
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
  if (
    !(await validateEmployeeDepartmentReferences(
      context.companyId,
      parsed.data.departmentId,
      parsed.data.branchId,
    ))
  ) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (!isUuid(parsed.data.scheduleId)) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
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
  if (!schedule) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [nationalIdMatch, phoneMatch] = await Promise.all([
    parsed.data.nationalId
      ? db
          .select({ id: employeesTable.id })
          .from(employeesTable)
          .where(
            and(
              eq(employeesTable.companyId, context.companyId),
              eq(employeesTable.nationalId, parsed.data.nationalId),
            ),
          )
          .limit(1)
      : Promise.resolve([]),
    parsed.data.phone
      ? db
          .select({ id: employeesTable.id })
          .from(employeesTable)
          .where(
            and(
              eq(employeesTable.companyId, context.companyId),
              eq(employeesTable.phone, parsed.data.phone),
            ),
          )
          .limit(1)
      : Promise.resolve([]),
  ]);
  if (nationalIdMatch.length > 0) {
    res.status(409).json({
      error: message(req, "employeeNationalIdDuplicate"),
      code: "EMPLOYEE_NATIONAL_ID_DUPLICATE",
    });
    return;
  }
  if (phoneMatch.length > 0) {
    res.status(409).json({
      error: message(req, "employeePhoneDuplicate"),
      code: "EMPLOYEE_PHONE_DUPLICATE",
    });
    return;
  }
  const employeeUsername = parsed.data.phone.trim();
  if (!employeeUsername) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [accountUsernameMatch] = await db
    .select({ id: userAccountsTable.id })
    .from(userAccountsTable)
    .where(eq(userAccountsTable.username, employeeUsername))
    .limit(1);
  if (accountUsernameMatch) {
    res.status(409).json({
      error: "That phone number is already used as a login username.",
      code: "EMPLOYEE_USERNAME_DUPLICATE",
    });
    return;
  }
  const capacity = await ensureEmployeeCapacity(context.companyId);
  if (!capacity.allowed) {
    res.status(409).json({
      error: message(req, "activeEmployeeLimit", {
        limit: capacity.employeeLimit,
      }),
      code: "ACTIVE_EMPLOYEE_LIMIT",
    });
    return;
  }
  let employee: typeof employeesTable.$inferSelect | undefined;
  let assignment:
    | typeof employeeScheduleAssignmentsTable.$inferSelect
    | undefined;
  let employeeAccount:
    | typeof userAccountsTable.$inferSelect
    | undefined;
  let temporaryPassword: string | undefined;
  const employeeNumber = await allocateEmployeeNumber(context.companyId);
  temporaryPassword = generateNumericPassword();
  try {
    await db.transaction(async (tx) => {
      [employee] = await tx
        .insert(employeesTable)
        .values({
          companyId: context.companyId,
          employeeNumber,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email:
            parsed.data.email ||
            `employee-${employeeNumber.toLowerCase()}@varhr.local`,
          phone: parsed.data.phone,
          nationalId: parsed.data.nationalId,
          biometricCode: parsed.data.biometricCode,
          workingHours: parsed.data.workingHours ?? 8,
          departmentId: parsed.data.departmentId,
          branchId: parsed.data.branchId,
          status: "active",
          role: parsed.data.role ?? "employee",
          joinedOn: calendarDate(parsed.data.joinedOn)!,
          salary: parsed.data.salary,
        })
        .returning();
      if (!employee) {
        throw new Error("EMPLOYEE_CREATE_FAILED");
      }
      [employeeAccount] = await tx
        .insert(userAccountsTable)
        .values({
          username: employeeUsername,
          fullName: `${employee.firstName} ${employee.lastName}`,
          primaryPhone: employeeUsername,
          passwordHash: hashPassword(temporaryPassword!),
          accountType: "employee",
          displayRole: "Employee",
          companyId: context.companyId,
          employeeId: employee.id,
          active: true,
        })
        .returning();
      if (!employeeAccount) {
        throw new Error("EMPLOYEE_ACCOUNT_CREATE_FAILED");
      }
      [assignment] = await tx
        .insert(employeeScheduleAssignmentsTable)
        .values({
          companyId: context.companyId,
          employeeId: employee.id,
          scheduleId: schedule.id,
          effectiveFrom: calendarDate(parsed.data.joinedOn)!,
          effectiveTo: null,
        })
        .returning();
      if (!assignment) {
        throw new Error("EMPLOYEE_SCHEDULE_ASSIGNMENT_CREATE_FAILED");
      }
    });
  } catch (error) {
    const constraint = postgresUniqueConstraint(error);
    if (constraint === employeeNationalIdUniqueConstraint) {
      res.status(409).json({
        error: message(req, "employeeNationalIdDuplicate"),
        code: "EMPLOYEE_NATIONAL_ID_DUPLICATE",
      });
      return;
    }
    if (constraint === employeePhoneUniqueConstraint) {
      res.status(409).json({
        error: message(req, "employeePhoneDuplicate"),
        code: "EMPLOYEE_PHONE_DUPLICATE",
      });
      return;
    }
    if (constraint === employeeNumberUniqueConstraint) {
      res.status(409).json({
        error: message(req, "reportDuplicate"),
        code: "EMPLOYEE_NUMBER_DUPLICATE",
      });
      return;
    }
    if (
      error instanceof Error &&
      (error.message.includes("EMPLOYEE_ACCOUNT_CREATE_FAILED") ||
        error.message.includes("user_accounts_username"))
    ) {
      res.status(409).json({
        error: "That phone number is already used as a login username.",
        code: "EMPLOYEE_USERNAME_DUPLICATE",
      });
      return;
    }
    throw error;
  }
  if (!employee) {
    throw new Error("EMPLOYEE_CREATE_FAILED");
  }
  if (!assignment) {
    throw new Error("EMPLOYEE_SCHEDULE_ASSIGNMENT_CREATE_FAILED");
  }
  if (!employeeAccount || !temporaryPassword) {
    throw new Error("EMPLOYEE_ACCOUNT_CREATE_FAILED");
  }
  const createdEmployee = employee;
  const [row] = await employeeRows(context).then((rows) =>
    rows.filter((item) => item.employee.id === createdEmployee.id),
  );
  await recordAudit(
    context.companyId,
    "created",
    "employee",
    createdEmployee.id,
    createdEmployee,
  );
  await recordAudit(
    context.companyId,
    "created",
    "employee_schedule_assignment",
    assignment.id,
    assignment,
  );
  res.status(201).json(
    CreateEmployeeResponse.parse({
      ...employeeResponse(row),
      accountCredentials: {
        username: employeeAccount.username,
        generatedPassword: temporaryPassword,
      },
    }),
  );
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
  if (!canUseCapability(context, "employees.edit")) {
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
  const [before] = await db
    .select()
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.id, params.data.employeeId),
        eq(employeesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!before) {
    res.status(404).json({ error: message(req, "employeeNotFound") });
    return;
  }
  const employeeScope = employeeScopeCondition(context);
  if (
    employeeScope &&
    !(await db
      .select({ id: employeesTable.id })
      .from(employeesTable)
      .where(and(eq(employeesTable.id, before.id), employeeScope))
      .limit(1)).length
  ) {
    res.status(403).json({ error: message(req, "workspaceAccessDenied") });
    return;
  }
  if (
    context.role === "manager" &&
    parsed.data.departmentId !== undefined &&
    parsed.data.departmentId !== context.departmentId
  ) {
    res.status(403).json({ error: message(req, "workspaceAccessDenied") });
    return;
  }
  const updateData = {
    ...parsed.data,
    ...(parsed.data.employeeNumber !== undefined
      ? { employeeNumber: parsed.data.employeeNumber.trim() }
      : {}),
  };
  if (
    (updateData.employeeNumber !== undefined &&
      !/^[1-9][0-9]*$/.test(updateData.employeeNumber)) ||
    !(await validateEmployeeDepartmentReferences(
      context.companyId,
      parsed.data.departmentId !== undefined
        ? parsed.data.departmentId
        : before.departmentId,
      parsed.data.branchId !== undefined ? parsed.data.branchId : before.branchId,
    ))
  ) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (updateData.employeeNumber !== undefined) {
    const [duplicate] = await db
      .select({ id: employeesTable.id })
      .from(employeesTable)
      .where(
        and(
          eq(employeesTable.companyId, context.companyId),
          eq(employeesTable.employeeNumber, updateData.employeeNumber),
        ),
      )
      .limit(1);
    if (duplicate && duplicate.id !== before.id) {
      res.status(409).json({
        error: message(req, "employeeNumberDuplicate"),
        code: "EMPLOYEE_NUMBER_DUPLICATE",
      });
      return;
    }
  }
  let employee: typeof employeesTable.$inferSelect | undefined;
  try {
    [employee] = await db
      .update(employeesTable)
      .set({ ...updateData, updatedAt: new Date() })
      .where(
        and(
          eq(employeesTable.id, params.data.employeeId),
          eq(employeesTable.companyId, context.companyId),
        ),
      )
      .returning();
  } catch (error) {
    if (postgresUniqueConstraint(error) === employeeNumberUniqueConstraint) {
      res.status(409).json({
        error: message(req, "employeeNumberDuplicate"),
        code: "EMPLOYEE_NUMBER_DUPLICATE",
      });
      return;
    }
    throw error;
  }
  if (!employee) {
    res.status(404).json({ error: message(req, "employeeNotFound") });
    return;
  }
  const [row] = (await employeeRows(context)).filter(
    (item) => item.employee.id === employee.id,
  );
  const activeLeavePolicies = await db
    .select({ leaveType: leavePoliciesTable.leaveType })
    .from(leavePoliciesTable)
    .where(
      and(
        eq(leavePoliciesTable.companyId, context.companyId),
        eq(leavePoliciesTable.status, "active"),
        lte(leavePoliciesTable.effectiveFrom, TODAY),
      ),
    );
  for (const policy of activeLeavePolicies) {
    await db
      .insert(leaveBalancesTable)
      .values({
        companyId: context.companyId,
        employeeId: employee.id,
        type: policy.leaveType,
      })
      .onConflictDoNothing();
  }
  await recordAudit(
    context.companyId,
    "updated",
    "employee",
    employee.id,
    updateData,
    before,
  );
  res.json(UpdateEmployeeResponse.parse(employeeResponse(row)));
});

router.delete("/employees/:employeeId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "employees.manage")) {
    res
      .status(403)
      .json({ error: message(req, "noPermissionManageEmployees") });
    return;
  }
  const params = DeleteEmployeeParams.safeParse(req.params);
  if (!params.success || !isUuid(params.data.employeeId)) {
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
  const employeeScope = employeeScopeCondition(context);
  if (
    employeeScope &&
    !(await db
      .select({ id: employeesTable.id })
      .from(employeesTable)
      .where(and(eq(employeesTable.id, employee.id), employeeScope))
      .limit(1)).length
  ) {
    res.status(403).json({ error: message(req, "workspaceAccessDenied") });
    return;
  }
  const dependencies = await employeeDeleteDependencies(
    context.companyId,
    employee.id,
  );
  if (dependencies.length > 0) {
    res.status(409).json({
      error: message(req, "employeeDeleteBlocked"),
      code: "EMPLOYEE_DELETE_BLOCKED",
      dependencies,
    });
    return;
  }
  await db.transaction(async (tx) => {
    const [account] = await tx
      .select({ id: userAccountsTable.id })
      .from(userAccountsTable)
      .where(
        and(
          eq(userAccountsTable.companyId, context.companyId),
          eq(userAccountsTable.employeeId, employee.id),
        ),
      )
      .limit(1);
    if (account) {
      await tx
        .delete(authSessionsTable)
        .where(eq(authSessionsTable.accountId, account.id));
      await tx
        .delete(accountPermissionsTable)
        .where(eq(accountPermissionsTable.accountId, account.id));
      await tx
        .update(authAuditEventsTable)
        .set({ accountId: null })
        .where(eq(authAuditEventsTable.accountId, account.id));
      await tx
        .delete(userAccountsTable)
        .where(eq(userAccountsTable.id, account.id));
    }
    await tx
      .delete(employeesTable)
      .where(
        and(
          eq(employeesTable.id, employee.id),
          eq(employeesTable.companyId, context.companyId),
        ),
      );
  });
  await recordAudit(
    context.companyId,
    "deleted",
    "employee",
    employee.id,
    null,
    employee,
  );
  res.status(204).send(DeleteEmployeeResponse.parse(undefined));
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

async function attendanceForCalculation(
  context: TenantContext,
  attendanceId: string,
) {
  const rows = await getAttendanceRows(context);
  return rows.find((row) => row.attendance.id === attendanceId);
}

router.get(
  "/attendance/:attendanceId/calculation",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canUseCapability(context, "attendance.view", true)) {
      denyCapability(res, req, "attendance.view");
      return;
    }
    const params = PreviewAttendanceCalculationParams.safeParse(req.params);
    if (!params.success || !isUuid(params.data.attendanceId)) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const row = await attendanceForCalculation(
      context,
      params.data.attendanceId,
    );
    if (!row) {
      res.status(404).json({ error: message(req, "attendanceNotFound") });
      return;
    }
    const calculation = await attendanceCalculationFor(
      context,
      row.attendance,
      false,
    );
    res.json(PreviewAttendanceCalculationResponse.parse(calculation));
  },
);

router.post(
  "/attendance/:attendanceId/calculation",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canUseCapability(context, "attendance.correct")) {
      denyCapability(res, req, "attendance.correct");
      return;
    }
    const params = RecalculateAttendanceParams.safeParse(req.params);
    if (!params.success || !isUuid(params.data.attendanceId)) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const row = await attendanceForCalculation(
      context,
      params.data.attendanceId,
    );
    if (!row) {
      res.status(404).json({ error: message(req, "attendanceNotFound") });
      return;
    }
    const calculation = await attendanceCalculationFor(
      context,
      row.attendance,
      true,
    );
    res.json(RecalculateAttendanceResponse.parse(calculation));
  },
);

router.get(
  "/attendance/:attendanceId/time-adjustments",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canUseCapability(context, "attendance.view", true)) {
      denyCapability(res, req, "attendance.view");
      return;
    }
    const attendanceId = String(req.params.attendanceId);
    if (!isUuid(attendanceId)) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const row = await attendanceForCalculation(context, attendanceId);
    if (!row) {
      res.status(404).json({ error: message(req, "attendanceNotFound") });
      return;
    }
    const adjustments = await db
      .select()
      .from(attendanceTimeAdjustmentsTable)
      .where(
        and(
          eq(attendanceTimeAdjustmentsTable.companyId, context.companyId),
          eq(attendanceTimeAdjustmentsTable.attendanceId, attendanceId),
        ),
      )
      .orderBy(desc(attendanceTimeAdjustmentsTable.createdAt));
    res.json(ListAttendanceTimeAdjustmentsResponse.parse(adjustments));
  },
);

router.post(
  "/attendance/:attendanceId/time-adjustments",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canUseCapability(context, "attendance.adjust")) {
      denyCapability(res, req, "attendance.adjust");
      return;
    }
    const attendanceId = String(req.params.attendanceId);
    const parsed = CreateAttendanceTimeAdjustmentBody.safeParse(req.body);
    if (!isUuid(attendanceId) || !parsed.success) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    if (parsed.data.minutes === 0) {
      res.status(400).json({ error: "Adjustment minutes must be non-zero." });
      return;
    }
    if (parsed.data.adjustmentType === "overtime" && parsed.data.minutes <= 0) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const row = await attendanceForCalculation(context, attendanceId);
    if (!row) {
      res.status(404).json({ error: message(req, "attendanceNotFound") });
      return;
    }
    const existing = await db
      .select()
      .from(attendanceTimeAdjustmentsTable)
      .where(
        and(
          eq(attendanceTimeAdjustmentsTable.companyId, context.companyId),
          eq(
            attendanceTimeAdjustmentsTable.employeeId,
            row.attendance.employeeId,
          ),
          eq(
            attendanceTimeAdjustmentsTable.adjustmentDate,
            row.attendance.date,
          ),
          eq(
            attendanceTimeAdjustmentsTable.adjustmentType,
            parsed.data.adjustmentType,
          ),
        ),
      );
    const active = existing.filter(
      (item) => item.status === "pending" || item.status === "approved",
    );
    if (
      active.some(
        (item) =>
          item.minutes === parsed.data.minutes &&
          item.reason.trim().toLowerCase() ===
            parsed.data.reason.trim().toLowerCase(),
      )
    ) {
      res
        .status(409)
        .json({ error: "A duplicate attendance adjustment already exists." });
      return;
    }
    if (
      parsed.data.adjustmentType === "time" &&
      active.some(
        (item) => Math.sign(item.minutes) !== Math.sign(parsed.data.minutes),
      )
    ) {
      res.status(409).json({
        error: "A conflicting time adjustment is already pending or approved.",
      });
      return;
    }
    const [created] = await db
      .insert(attendanceTimeAdjustmentsTable)
      .values({
        companyId: context.companyId,
        employeeId: row.attendance.employeeId,
        attendanceId,
        adjustmentDate: row.attendance.date,
        minutes: parsed.data.minutes,
        adjustmentType: parsed.data.adjustmentType,
        reason: parsed.data.reason.trim(),
        status: "pending",
        createdBy: context.accountId,
      })
      .returning();
    await recordAudit(
      context.companyId,
      "created",
      "attendance_time_adjustment",
      created.id,
      created,
    );
    res.status(201).json(CreateAttendanceTimeAdjustmentResponse.parse(created));
  },
);

router.post(
  "/attendance/time-adjustments/:adjustmentId/decision",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canUseCapability(context, "attendance.adjust")) {
      denyCapability(res, req, "attendance.adjust");
      return;
    }
    const params = DecideAttendanceTimeAdjustmentParams.safeParse(req.params);
    const parsed = DecideAttendanceTimeAdjustmentBody.safeParse(req.body);
    if (
      !params.success ||
      !parsed.success ||
      !isUuid(params.data.adjustmentId)
    ) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const [current] = await db
      .select()
      .from(attendanceTimeAdjustmentsTable)
      .where(
        and(
          eq(attendanceTimeAdjustmentsTable.id, params.data.adjustmentId),
          eq(attendanceTimeAdjustmentsTable.companyId, context.companyId),
        ),
      );
    if (!current) {
      res.status(404).json({ error: message(req, "attendanceNotFound") });
      return;
    }
    if (current.status !== "pending") {
      res
        .status(409)
        .json({ error: "Only pending adjustments can be decided." });
      return;
    }
    const now = new Date();
    const [updated] = await db
      .update(attendanceTimeAdjustmentsTable)
      .set(
        parsed.data.decision === "approved"
          ? {
              status: "approved",
              approvedBy: context.accountId,
              approvedAt: now,
            }
          : {
              status: "rejected",
              rejectedBy: context.accountId,
              rejectedAt: now,
            },
      )
      .where(eq(attendanceTimeAdjustmentsTable.id, current.id))
      .returning();
    await recordAudit(
      context.companyId,
      parsed.data.decision,
      "attendance_time_adjustment",
      updated.id,
      updated,
      current,
    );
    if (updated.status === "approved") {
      const [attendance] = await db
        .select()
        .from(attendanceTable)
        .where(eq(attendanceTable.id, updated.attendanceId));
      if (attendance) await attendanceCalculationFor(context, attendance, true);
    }
    res.json(DecideAttendanceTimeAdjustmentResponse.parse(updated));
  },
);

router.post(
  "/attendance/time-adjustments/:adjustmentId/reverse",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canUseCapability(context, "attendance.adjust")) {
      denyCapability(res, req, "attendance.adjust");
      return;
    }
    const params = ReverseAttendanceTimeAdjustmentParams.safeParse(req.params);
    const parsed = ReverseAttendanceTimeAdjustmentBody.safeParse(req.body);
    if (
      !params.success ||
      !parsed.success ||
      !isUuid(params.data.adjustmentId)
    ) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const [current] = await db
      .select()
      .from(attendanceTimeAdjustmentsTable)
      .where(
        and(
          eq(attendanceTimeAdjustmentsTable.id, params.data.adjustmentId),
          eq(attendanceTimeAdjustmentsTable.companyId, context.companyId),
        ),
      );
    if (!current) {
      res.status(404).json({ error: message(req, "attendanceNotFound") });
      return;
    }
    if (current.status !== "approved") {
      res
        .status(409)
        .json({ error: "Only approved adjustments can be reversed." });
      return;
    }
    const [updated] = await db
      .update(attendanceTimeAdjustmentsTable)
      .set({
        status: "reversed",
        reversedBy: context.accountId,
        reversedAt: new Date(),
      })
      .where(eq(attendanceTimeAdjustmentsTable.id, current.id))
      .returning();
    await recordAudit(
      context.companyId,
      "reversed",
      "attendance_time_adjustment",
      updated.id,
      { ...updated, reversalReason: parsed.data.reason.trim() },
      current,
    );
    const [attendance] = await db
      .select()
      .from(attendanceTable)
      .where(eq(attendanceTable.id, updated.attendanceId));
    if (attendance) await attendanceCalculationFor(context, attendance, true);
    res.json(ReverseAttendanceTimeAdjustmentResponse.parse(updated));
  },
);

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
  const rules = await attendanceRulesFor(context.companyId, eventDate || TODAY);
  const holidays = await holidaysForCompany(context.companyId);
  const location: AttendanceLocationInput | null =
    hasLatitude && hasLongitude
      ? {
          latitude: parsed.data.latitude!,
          longitude: parsed.data.longitude!,
          accuracyMeters: parsed.data.accuracyMeters,
        }
      : null;
  if ((rules.gpsPolicy as string) === "required" && !location) {
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
    await attendanceCalculationFor(context, created, true);
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
  await attendanceCalculationFor(context, updated, true);
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
    const rules = await attendanceRulesFor(
      context.companyId,
      scopedRecord.attendance.date,
    );
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
    await attendanceCalculationFor(context, updated, true);
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

async function effectiveLeavePolicy(
  companyId: string,
  leaveType: string,
  date = TODAY,
) {
  const [policy] = await db
    .select()
    .from(leavePoliciesTable)
    .where(
      and(
        eq(leavePoliciesTable.companyId, companyId),
        eq(leavePoliciesTable.leaveType, leaveType),
        lte(leavePoliciesTable.effectiveFrom, date),
        or(
          sql`${leavePoliciesTable.effectiveTo} is null`,
          gte(leavePoliciesTable.effectiveTo, date),
        ),
        eq(leavePoliciesTable.status, "active"),
      ),
    )
    .orderBy(
      desc(leavePoliciesTable.effectiveFrom),
      desc(leavePoliciesTable.version),
    )
    .limit(1);
  return policy;
}

function leavePolicyResponse(policy: typeof leavePoliciesTable.$inferSelect) {
  return {
    id: policy.id,
    leaveType: policy.leaveType,
    version: policy.version,
    annualEntitlement: policy.annualEntitlement,
    accrualFrequency: policy.accrualFrequency,
    deductionMode: policy.deductionMode,
    carryForwardAllowed: policy.carryForwardAllowed,
    carryForwardDays: policy.carryForwardDays,
    carryForwardExpiryMonths: policy.carryForwardExpiryMonths,
    allowNegative: policy.allowNegative,
    effectiveFrom: policy.effectiveFrom,
    effectiveTo: policy.effectiveTo,
    status: policy.status,
    createdBy: policy.createdBy,
    createdAt: policy.createdAt.toISOString(),
  };
}

function accrualPeriodKeys(
  policy: typeof leavePoliciesTable.$inferSelect,
  employee: { id: string; joinedOn: string },
  through = TODAY,
) {
  const start =
    policy.effectiveFrom > employee.joinedOn
      ? policy.effectiveFrom
      : employee.joinedOn;
  const startYear = Number(start.slice(0, 4));
  const endYear = Number(through.slice(0, 4));
  const keys: string[] = [];
  for (let year = startYear; year <= endYear; year += 1) {
    if (policy.accrualFrequency === "annual") {
      const date = `${year}-01-01`;
      if (date >= start && date <= through) keys.push(`${year}`);
    } else if (policy.accrualFrequency === "monthly") {
      for (let month = 1; month <= 12; month += 1) {
        const date = `${year}-${String(month).padStart(2, "0")}-01`;
        if (date >= start && date <= through)
          keys.push(`${year}-${String(month).padStart(2, "0")}`);
      }
    } else if (policy.accrualFrequency === "quarterly") {
      for (let quarter = 1; quarter <= 4; quarter += 1) {
        const month = (quarter - 1) * 3 + 1;
        const date = `${year}-${String(month).padStart(2, "0")}-01`;
        if (date >= start && date <= through) keys.push(`${year}-Q${quarter}`);
      }
    } else {
      const anniversary = `${year}-${employee.joinedOn.slice(5)}`;
      if (anniversary >= start && anniversary <= through) keys.push(`${year}`);
    }
  }
  return keys;
}

function addMonths(value: string, months: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

async function ensureLeaveAccruals(companyId: string, through = TODAY) {
  const [employees, policies] = await Promise.all([
    db
      .select({ id: employeesTable.id, joinedOn: employeesTable.joinedOn })
      .from(employeesTable)
      .where(eq(employeesTable.companyId, companyId)),
    db
      .select()
      .from(leavePoliciesTable)
      .where(
        and(
          eq(leavePoliciesTable.companyId, companyId),
          eq(leavePoliciesTable.status, "active"),
        ),
      ),
  ]);
  for (const policy of policies) {
    const periodsPerYear =
      policy.accrualFrequency === "monthly"
        ? 12
        : policy.accrualFrequency === "quarterly"
          ? 4
          : 1;
    const amount = policy.annualEntitlement / periodsPerYear;
    for (const employee of employees) {
      await db
        .insert(leaveBalancesTable)
        .values({
          companyId,
          employeeId: employee.id,
          type: policy.leaveType,
        })
        .onConflictDoNothing();
      const [balance] = await db
        .select()
        .from(leaveBalancesTable)
        .where(
          and(
            eq(leaveBalancesTable.companyId, companyId),
            eq(leaveBalancesTable.employeeId, employee.id),
            eq(leaveBalancesTable.type, policy.leaveType),
          ),
        )
        .limit(1);
      if (!balance) continue;
      for (const period of accrualPeriodKeys(policy, employee, through)) {
        const transactionKey = `accrual:${policy.id}:${employee.id}:${period}`;
        const [existing] = await db
          .select({ id: leaveBalanceTransactionsTable.id })
          .from(leaveBalanceTransactionsTable)
          .where(
            eq(leaveBalanceTransactionsTable.transactionKey, transactionKey),
          )
          .limit(1);
        if (existing) continue;
        const before = balance.allocated - balance.used;
        const after = before + amount;
        const [transaction] = await db
          .insert(leaveBalanceTransactionsTable)
          .values({
            companyId,
            employeeId: employee.id,
            leaveType: policy.leaveType,
            amount,
            transactionType: "accrual",
            beforeBalance: before,
            afterBalance: after,
            actorId: "system",
            reason: `Automatic ${policy.accrualFrequency} accrual`,
            transactionKey,
          })
          .onConflictDoNothing()
          .returning();
        if (transaction) {
          await db
            .update(leaveBalancesTable)
            .set({
              allocated: sql`${leaveBalancesTable.allocated} + ${amount}`,
            })
            .where(eq(leaveBalancesTable.id, balance.id));
          balance.allocated += amount;
        }
      }
      // Carry-forward is recorded once at the start of each calendar year.
      if (policy.carryForwardAllowed && policy.carryForwardDays > 0) {
        const year = Number(through.slice(0, 4));
        const yearStart = `${year}-01-01`;
        if (policy.effectiveFrom <= yearStart && through >= yearStart) {
          const transactionKey = `carry_forward:${policy.id}:${employee.id}:${year}`;
          const [existing] = await db
            .select({ id: leaveBalanceTransactionsTable.id })
            .from(leaveBalanceTransactionsTable)
            .where(
              eq(leaveBalanceTransactionsTable.transactionKey, transactionKey),
            )
            .limit(1);
          if (!existing) {
            const amountToCarry = Math.min(
              policy.carryForwardDays,
              Math.max(0, balance.allocated - balance.used - balance.pending),
            );
            if (amountToCarry > 0) {
              const before = balance.allocated - balance.used;
              const [transaction] = await db
                .insert(leaveBalanceTransactionsTable)
                .values({
                  companyId,
                  employeeId: employee.id,
                  leaveType: policy.leaveType,
                  amount: amountToCarry,
                  transactionType: "carry_forward",
                  beforeBalance: before,
                  afterBalance: before + amountToCarry,
                  actorId: "system",
                  reason: "Automatic carry-forward",
                  transactionKey,
                })
                .onConflictDoNothing()
                .returning();
              if (transaction) {
                await db
                  .update(leaveBalancesTable)
                  .set({
                    allocated: sql`${leaveBalancesTable.allocated} + ${amountToCarry}`,
                  })
                  .where(eq(leaveBalancesTable.id, balance.id));
                balance.allocated += amountToCarry;
              }
            }
          }
        }
      }
      if (
        policy.carryForwardExpiryMonths &&
        policy.carryForwardExpiryMonths > 0
      ) {
        const year = Number(through.slice(0, 4));
        const priorYear = year - 1;
        const expiryDate = addMonths(
          `${priorYear}-01-01`,
          policy.carryForwardExpiryMonths,
        );
        if (through >= expiryDate) {
          const carryKey = `carry_forward:${policy.id}:${employee.id}:${priorYear}`;
          const [carry] = await db
            .select({ amount: leaveBalanceTransactionsTable.amount })
            .from(leaveBalanceTransactionsTable)
            .where(eq(leaveBalanceTransactionsTable.transactionKey, carryKey))
            .limit(1);
          const expiryKey = `expiry:${policy.id}:${employee.id}:${priorYear}`;
          const [expired] = await db
            .select({ id: leaveBalanceTransactionsTable.id })
            .from(leaveBalanceTransactionsTable)
            .where(eq(leaveBalanceTransactionsTable.transactionKey, expiryKey))
            .limit(1);
          if (carry && carry.amount > 0 && !expired) {
            const before = balance.allocated - balance.used;
            const amount = -Math.min(carry.amount, Math.max(0, before));
            if (amount < 0) {
              const [transaction] = await db
                .insert(leaveBalanceTransactionsTable)
                .values({
                  companyId,
                  employeeId: employee.id,
                  leaveType: policy.leaveType,
                  amount,
                  transactionType: "expiry",
                  beforeBalance: before,
                  afterBalance: before + amount,
                  actorId: "system",
                  reason: `Carry-forward expired on ${expiryDate}`,
                  transactionKey: expiryKey,
                })
                .onConflictDoNothing()
                .returning();
              if (transaction) {
                await db
                  .update(leaveBalancesTable)
                  .set({
                    allocated: sql`${leaveBalancesTable.allocated} + ${amount}`,
                  })
                  .where(eq(leaveBalancesTable.id, balance.id));
                balance.allocated += amount;
              }
            }
          }
        }
      }
    }
  }
}

router.get("/leave/policies", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "leave.view")) {
    denyCapability(res, req, "leave.view");
    return;
  }
  await ensureLeaveAccruals(context.companyId);
  const policies = await db
    .select()
    .from(leavePoliciesTable)
    .where(
      and(
        eq(leavePoliciesTable.companyId, context.companyId),
        eq(leavePoliciesTable.status, "active"),
        lte(leavePoliciesTable.effectiveFrom, TODAY),
      ),
    )
    .orderBy(
      asc(leavePoliciesTable.leaveType),
      desc(leavePoliciesTable.version),
    );
  const current = policies.filter(
    (policy) =>
      !policies.some(
        (other) =>
          other.leaveType === policy.leaveType &&
          other.version > policy.version,
      ),
  );
  res.json(ListLeavePoliciesResponse.parse(current.map(leavePolicyResponse)));
});

router.post("/leave/policies", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "leave.manage")) {
    denyCapability(res, req, "leave.manage");
    return;
  }
  const parsed = CreateLeavePolicyBody.safeParse(req.body ?? {});
  if (
    !parsed.success ||
    (parsed.data.carryForwardAllowed && parsed.data.carryForwardDays < 0)
  ) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const previous = await db
    .select()
    .from(leavePoliciesTable)
    .where(
      and(
        eq(leavePoliciesTable.companyId, context.companyId),
        eq(leavePoliciesTable.leaveType, parsed.data.leaveType),
        eq(leavePoliciesTable.status, "active"),
      ),
    );
  const version = Math.max(0, ...previous.map((item) => item.version)) + 1;
  const prior = previous
    .filter(
      (item) =>
        item.effectiveTo === null &&
        item.effectiveFrom < parsed.data.effectiveFrom,
    )
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
  if (
    previous.some((item) => item.effectiveFrom === parsed.data.effectiveFrom)
  ) {
    res.status(409).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (prior)
    await db
      .update(leavePoliciesTable)
      .set({ effectiveTo: dateOffset(parsed.data.effectiveFrom, -1) })
      .where(eq(leavePoliciesTable.id, prior.id));
  const [policy] = await db
    .insert(leavePoliciesTable)
    .values({
      companyId: context.companyId,
      leaveType: parsed.data.leaveType,
      version,
      annualEntitlement: parsed.data.annualEntitlement,
      accrualFrequency: parsed.data.accrualFrequency,
      deductionMode: parsed.data.deductionMode,
      carryForwardAllowed: parsed.data.carryForwardAllowed,
      carryForwardDays: parsed.data.carryForwardDays,
      carryForwardExpiryMonths: parsed.data.carryForwardExpiryMonths ?? null,
      allowNegative: parsed.data.allowNegative,
      effectiveFrom: parsed.data.effectiveFrom,
      createdBy: context.accountId,
    })
    .returning();
  const employees = await db
    .select({ id: employeesTable.id })
    .from(employeesTable)
    .where(eq(employeesTable.companyId, context.companyId));
  for (const employee of employees) {
    await db
      .insert(leaveBalancesTable)
      .values({
        companyId: context.companyId,
        employeeId: employee.id,
        type: policy.leaveType,
        allocated: 0,
      })
      .onConflictDoNothing();
  }
  await recordAudit(
    context.companyId,
    "created",
    "leave_policy",
    policy.id,
    policy,
  );
  res
    .status(201)
    .json(CreateLeavePolicyResponse.parse(leavePolicyResponse(policy)));
});

router.get("/leave/balances/ledger", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "leave.view", true)) {
    denyCapability(res, req, "leave.view");
    return;
  }
  await ensureLeaveAccruals(context.companyId);
  const rows = await db
    .select({
      transaction: leaveBalanceTransactionsTable,
      employee: employeesTable,
      department: departmentsTable,
    })
    .from(leaveBalanceTransactionsTable)
    .innerJoin(
      employeesTable,
      eq(leaveBalanceTransactionsTable.employeeId, employeesTable.id),
    )
    .innerJoin(
      departmentsTable,
      eq(employeesTable.departmentId, departmentsTable.id),
    )
    .where(
      and(
        eq(leaveBalanceTransactionsTable.companyId, context.companyId),
        employeeScopeCondition(context),
      ),
    )
    .orderBy(desc(leaveBalanceTransactionsTable.createdAt));
  res.json(
    ListLeaveBalanceTransactionsResponse.parse(
      rows.map(({ transaction, employee, department }) => ({
        id: transaction.id,
        employee: employeeReference(employee, department.name),
        leaveType: transaction.leaveType,
        amount: transaction.amount,
        transactionType: transaction.transactionType,
        beforeBalance: transaction.beforeBalance,
        afterBalance: transaction.afterBalance,
        sourceRequestId: transaction.sourceRequestId,
        actorId: transaction.actorId,
        reason: transaction.reason,
        createdAt: transaction.createdAt.toISOString(),
      })),
    ),
  );
});

router.post(
  "/leave/balances/:balanceId/adjust",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canUseCapability(context, "leave.manage")) {
      denyCapability(res, req, "leave.manage");
      return;
    }
    const params = AdjustLeaveBalanceParams.safeParse(req.params);
    const parsed = AdjustLeaveBalanceBody.safeParse(req.body ?? {});
    if (
      !params.success ||
      !parsed.success ||
      !isUuid(params.data.balanceId) ||
      !parsed.data.reason.trim() ||
      parsed.data.amount === 0
    ) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const [balance] = await db
      .select()
      .from(leaveBalancesTable)
      .where(
        and(
          eq(leaveBalancesTable.id, params.data.balanceId),
          eq(leaveBalancesTable.companyId, context.companyId),
        ),
      )
      .limit(1);
    if (!balance) {
      res.status(404).json({ error: message(req, "invalidRequest") });
      return;
    }
    const policy = await effectiveLeavePolicy(context.companyId, balance.type);
    const before = balance.allocated - balance.used;
    const after = before + parsed.data.amount;
    if (policy && !policy.allowNegative && after - balance.pending < 0) {
      res.status(409).json({
        error: message(req, "leaveExceedsBalance", { type: balance.type }),
      });
      return;
    }
    const [updated] = await db
      .update(leaveBalancesTable)
      .set({
        allocated: sql`${leaveBalancesTable.allocated} + ${parsed.data.amount}`,
      })
      .where(
        and(
          eq(leaveBalancesTable.id, balance.id),
          eq(leaveBalancesTable.companyId, context.companyId),
        ),
      )
      .returning();
    await db.insert(leaveBalanceTransactionsTable).values({
      companyId: context.companyId,
      employeeId: balance.employeeId,
      leaveType: balance.type,
      amount: parsed.data.amount,
      transactionType: "manual_adjustment",
      beforeBalance: before,
      afterBalance: after,
      actorId: context.accountId,
      reason: parsed.data.reason.trim(),
    });
    await recordAudit(
      context.companyId,
      "manual_adjustment",
      "leave_balance",
      balance.id,
      parsed.data,
      balance,
    );
    const [employee] = await db
      .select({ employee: employeesTable, department: departmentsTable })
      .from(employeesTable)
      .innerJoin(
        departmentsTable,
        eq(employeesTable.departmentId, departmentsTable.id),
      )
      .where(eq(employeesTable.id, updated.employeeId))
      .limit(1);
    res.json(
      AdjustLeaveBalanceResponse.parse({
        id: updated.id,
        employee: employeeReference(
          employee.employee,
          employee.department.name,
        ),
        type: updated.type,
        allocated: updated.allocated,
        used: updated.used,
        pending: updated.pending,
        remaining: updated.allocated - updated.used - updated.pending,
      }),
    );
  },
);

router.get("/leave/balances", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "leave.view", true)) {
    denyCapability(res, req, "leave.view");
    return;
  }
  await ensureLeaveAccruals(context.companyId);
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
        remaining: balance.allocated - balance.used - balance.pending,
      })),
    ),
  );
});

router.get("/leave/requests", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "leave.view", true)) {
    denyCapability(res, req, "leave.view");
    return;
  }
  await ensureLeaveAccruals(context.companyId);
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
  await ensureLeaveAccruals(context.companyId);
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
  const requestPolicy = await effectiveLeavePolicy(
    context.companyId,
    parsed.data.type,
    calendarDate(parsed.data.from) ?? TODAY,
  );
  if (
    !requestPolicy?.allowNegative &&
    balance.allocated - balance.used - balance.pending < days
  ) {
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
    .where(
      and(
        eq(leaveBalancesTable.id, balance.id),
        eq(leaveBalancesTable.companyId, context.companyId),
      ),
    );
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
    const [balance] = await db
      .select()
      .from(leaveBalancesTable)
      .where(
        and(
          eq(leaveBalancesTable.companyId, context.companyId),
          eq(leaveBalancesTable.employeeId, request.employeeId),
          eq(leaveBalancesTable.type, request.type),
        ),
      )
      .limit(1);
    if (!balance) {
      res.status(409).json({
        error: message(req, "leaveBalanceMissing", { type: request.type }),
      });
      return;
    }
    const policy = await effectiveLeavePolicy(
      context.companyId,
      request.type,
      request.from,
    );
    const balanceUpdate =
      parsed.data.decision === "approved"
        ? policy?.deductionMode === "manual"
          ? { pending: sql`${leaveBalancesTable.pending} - ${request.days}` }
          : {
              pending: sql`${leaveBalancesTable.pending} - ${request.days}`,
              used: sql`${leaveBalancesTable.used} + ${request.days}`,
            }
        : { pending: sql`${leaveBalancesTable.pending} - ${request.days}` };
    const beforeBalance = balance.allocated - balance.used;
    const afterBalance =
      parsed.data.decision === "approved" && policy?.deductionMode !== "manual"
        ? beforeBalance - request.days
        : beforeBalance;
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
    await db
      .insert(leaveBalanceTransactionsTable)
      .values({
        companyId: context.companyId,
        employeeId: request.employeeId,
        leaveType: request.type,
        amount:
          parsed.data.decision === "approved" &&
          policy?.deductionMode !== "manual"
            ? -request.days
            : 0,
        transactionType:
          parsed.data.decision === "approved" &&
          policy?.deductionMode !== "manual"
            ? "deduction"
            : "restoration",
        beforeBalance,
        afterBalance,
        sourceRequestId: request.id,
        actorId: context.accountId,
        reason:
          parsed.data.reason?.trim() || `Leave request ${parsed.data.decision}`,
        transactionKey: `request:${request.id}:${parsed.data.decision}`,
      })
      .onConflictDoNothing();
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

router.post(
  "/leave/requests/:requestId/cancel",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    const params = CancelLeaveRequestParams.safeParse(req.params);
    const parsed = CancelLeaveRequestBody.safeParse(req.body ?? {});
    if (!params.success || !parsed.success || !parsed.data.reason.trim()) {
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
    const isApprover = canApprove(context);
    if (
      !isApprover &&
      scopedRequest.request.employeeId !== context.employeeId
    ) {
      res.status(403).json({ error: message(req, "noPermissionDecideLeave") });
      return;
    }
    if (!["pending", "approved"].includes(scopedRequest.request.status)) {
      res.status(409).json({ error: message(req, "invalidRequest") });
      return;
    }
    const request = scopedRequest.request;
    const policy = await effectiveLeavePolicy(
      context.companyId,
      request.type,
      request.from,
    );
    const [balance] = await db
      .select()
      .from(leaveBalancesTable)
      .where(
        and(
          eq(leaveBalancesTable.companyId, context.companyId),
          eq(leaveBalancesTable.employeeId, request.employeeId),
          eq(leaveBalancesTable.type, request.type),
        ),
      )
      .limit(1);
    if (!balance) {
      res.status(409).json({
        error: message(req, "leaveBalanceMissing", { type: request.type }),
      });
      return;
    }
    const wasApproved = request.status === "approved";
    const shouldRestoreUsed = wasApproved && policy?.deductionMode !== "manual";
    const [updatedRequest] = await db
      .update(leaveRequestsTable)
      .set({
        status: "cancelled",
        decidedBy: context.accountId,
        decisionReason: parsed.data.reason.trim(),
        decidedAt: new Date(),
      })
      .where(
        and(
          eq(leaveRequestsTable.id, request.id),
          eq(leaveRequestsTable.companyId, context.companyId),
          or(
            eq(leaveRequestsTable.status, "pending"),
            eq(leaveRequestsTable.status, "approved"),
          ),
        ),
      )
      .returning();
    if (!updatedRequest) {
      res.status(409).json({ error: message(req, "invalidRequest") });
      return;
    }
    await db
      .update(leaveBalancesTable)
      .set({
        ...(request.status === "pending"
          ? { pending: sql`${leaveBalancesTable.pending} - ${request.days}` }
          : {}),
        ...(shouldRestoreUsed
          ? { used: sql`${leaveBalancesTable.used} - ${request.days}` }
          : {}),
      })
      .where(
        and(
          eq(leaveBalancesTable.id, balance.id),
          eq(leaveBalancesTable.companyId, context.companyId),
        ),
      );
    const beforeBalance = balance.allocated - balance.used;
    await db
      .insert(leaveBalanceTransactionsTable)
      .values({
        companyId: context.companyId,
        employeeId: request.employeeId,
        leaveType: request.type,
        amount: shouldRestoreUsed ? request.days : 0,
        transactionType: "restoration",
        beforeBalance,
        afterBalance: shouldRestoreUsed
          ? beforeBalance + request.days
          : beforeBalance,
        sourceRequestId: request.id,
        actorId: context.accountId,
        reason: parsed.data.reason.trim(),
        transactionKey: `request:${request.id}:cancelled`,
      })
      .onConflictDoNothing();
    await recordAudit(
      context.companyId,
      "cancelled",
      "leave_request",
      request.id,
      updatedRequest,
      request,
    );
    const rows = await leaveRows(context);
    const row = rows.find((item) => item.request.id === request.id)!;
    res.json(
      DecideLeaveRequestResponse.parse({
        id: updatedRequest.id,
        employee: requestEmployeeReference(row.employee, row.department.name),
        type: updatedRequest.type,
        from: updatedRequest.from,
        to: updatedRequest.to,
        days: updatedRequest.days,
        reason: updatedRequest.reason,
        status: "cancelled",
        submittedAt: updatedRequest.submittedAt.toISOString(),
        decidedBy: updatedRequest.decidedBy,
        decisionReason: updatedRequest.decisionReason,
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
  if (
    !isValidClockTime(parsed.data.startTime) ||
    !isValidClockTime(parsed.data.endTime) ||
    parsed.data.startTime >= parsed.data.endTime
  ) {
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
  if (!canUseCapability(context, "attendance.rules.view")) {
    res.status(403).json({ error: message(req, "attendanceRulesAccess") });
    return;
  }
  const response = await attendanceRulesFor(context.companyId, TODAY);
  res.json(GetAttendanceRulesResponse.parse(response));
});

function ruleVersionResponse(
  row: typeof attendanceRuleVersionsTable.$inferSelect,
) {
  return {
    id: row.id,
    version: row.version,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    status: row.status,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    configuration: row.configuration,
  };
}

router.get("/rules/versions", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "attendance.rules.view")) {
    res.status(403).json({ error: message(req, "attendanceRulesAccess") });
    return;
  }
  await ensureInitialRuleVersion(context.companyId);
  const versions = await db
    .select()
    .from(attendanceRuleVersionsTable)
    .where(eq(attendanceRuleVersionsTable.companyId, context.companyId))
    .orderBy(desc(attendanceRuleVersionsTable.version));
  res.json(
    ListAttendanceRuleVersionsResponse.parse(versions.map(ruleVersionResponse)),
  );
});

router.post("/rules/versions", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "attendance.rules.manage")) {
    res.status(403).json({ error: message(req, "attendanceRulesUpdate") });
    return;
  }
  const parsed = CreateAttendanceRuleVersionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  await ensureInitialRuleVersion(context.companyId);
  const { effectiveFrom, ...configurationInput } = parsed.data;
  const existing = await db
    .select()
    .from(attendanceRuleVersionsTable)
    .where(
      and(
        eq(attendanceRuleVersionsTable.companyId, context.companyId),
        eq(attendanceRuleVersionsTable.status, "active"),
      ),
    );
  const covering = existing.filter(
    (row) =>
      row.effectiveFrom <= effectiveFrom &&
      (row.effectiveTo === null || row.effectiveTo >= effectiveFrom),
  );
  const prior = covering
    .filter((row) => row.effectiveFrom < effectiveFrom)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
  const next = existing
    .filter((row) => row.effectiveFrom > effectiveFrom)
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom))[0];
  if (covering.length > 1) {
    res.status(409).json({
      error:
        "The effective date is covered by multiple attendance rule versions; resolve the existing conflict first.",
    });
    return;
  }
  const superseded = covering.find(
    (row) => row.effectiveFrom === effectiveFrom,
  );
  const nextVersion = Math.max(0, ...existing.map((row) => row.version)) + 1;
  const created = await db.transaction(async (tx) => {
    if (prior) {
      await tx
        .update(attendanceRuleVersionsTable)
        .set({ effectiveTo: dateOffset(effectiveFrom, -1) })
        .where(eq(attendanceRuleVersionsTable.id, prior.id));
    }
    if (superseded) {
      await tx
        .update(attendanceRuleVersionsTable)
        .set({ status: "archived" })
        .where(eq(attendanceRuleVersionsTable.id, superseded.id));
    }
    const [inserted] = await tx
      .insert(attendanceRuleVersionsTable)
      .values({
        companyId: context.companyId,
        version: nextVersion,
        effectiveFrom,
        effectiveTo: next ? dateOffset(next.effectiveFrom, -1) : null,
        status: "active",
        createdBy: context.accountId,
        configuration: {
          ...configurationInput,
          version: nextVersion,
          effectiveFrom,
        },
      })
      .returning();
    return inserted;
  });
  await recordAudit(
    context.companyId,
    "created",
    "attendance_rule_version",
    created.id,
    created,
    superseded
      ? {
          action: "retroactive_replacement",
          replacedVersionId: superseded.id,
          replacedVersion: superseded.version,
          effectiveFrom,
          retroactive: effectiveFrom < TODAY,
        }
      : null,
  );
  if (superseded) {
    await recordAudit(
      context.companyId,
      "superseded",
      "attendance_rule_version",
      superseded.id,
      {
        status: "archived",
        replacedByVersionId: created.id,
        replacedByVersion: created.version,
        effectiveFrom,
        retroactive: effectiveFrom < TODAY,
      },
      superseded,
    );
  }
  res
    .status(201)
    .json(
      CreateAttendanceRuleVersionResponse.parse(ruleVersionResponse(created)),
    );
});

router.put("/rules", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "attendance.rules.manage")) {
    res.status(403).json({ error: message(req, "attendanceRulesUpdate") });
    return;
  }
  const parsed = UpdateAttendanceRulesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const current = await attendanceRulesFor(context.companyId, TODAY);
  const [rules] = await db
    .insert(attendanceRuleVersionsTable)
    .values({
      companyId: context.companyId,
      version: current.version + 1,
      effectiveFrom: TODAY,
      status: "active",
      createdBy: context.accountId,
      configuration: {
        ...parsed.data,
        version: current.version + 1,
        effectiveFrom: TODAY,
      },
    })
    .returning();
  if (current.id) {
    await db
      .update(attendanceRuleVersionsTable)
      .set({ effectiveTo: dateOffset(TODAY, -1) })
      .where(eq(attendanceRuleVersionsTable.id, current.id));
  }
  await recordAudit(
    context.companyId,
    "created",
    "attendance_rule_version",
    rules.id,
    rules,
    current,
  );
  res.json(
    UpdateAttendanceRulesResponse.parse(
      await attendanceRulesFor(context.companyId, TODAY),
    ),
  );
});

router.get("/schedules", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "schedules.view", false)) {
    res.status(403).json({ error: message(req, "attendanceRulesAccess") });
    return;
  }
  const [company] = await db
    .select({ defaultScheduleId: companiesTable.defaultScheduleId })
    .from(companiesTable)
    .where(eq(companiesTable.id, context.companyId))
    .limit(1);
  const schedules = await db
    .select()
    .from(workSchedulesTable)
    .where(eq(workSchedulesTable.companyId, context.companyId))
    .orderBy(asc(workSchedulesTable.name));
  res.json(
    ListWorkSchedulesResponse.parse(
      schedules.map((schedule) =>
        mapWorkSchedule(schedule, schedule.id === company?.defaultScheduleId),
      ),
    ),
  );
});

router.post("/schedules", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "schedules.manage")) {
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
      nameAr: parsed.data.nameAr,
      workingDays: parsed.data.workingDays,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      overnight: parsed.data.overnight,
      requiredHours: parsed.data.requiredHours,
      breakDurationMinutes: parsed.data.breakDurationMinutes,
      breakPaid: parsed.data.breakPaid,
      graceMinutes: parsed.data.graceMinutes,
      earlyCheckoutGraceMinutes: parsed.data.earlyCheckoutGraceMinutes,
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
  if (!canUseCapability(context, "schedules.manage")) {
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
      nameAr: parsed.data.nameAr,
      workingDays: parsed.data.workingDays,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      overnight: parsed.data.overnight,
      requiredHours: parsed.data.requiredHours,
      breakDurationMinutes: parsed.data.breakDurationMinutes,
      breakPaid: parsed.data.breakPaid,
      graceMinutes: parsed.data.graceMinutes,
      earlyCheckoutGraceMinutes: parsed.data.earlyCheckoutGraceMinutes,
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

router.put(
  "/schedules/:scheduleId/default",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canUseCapability(context, "schedules.manage")) {
      res.status(403).json({ error: message(req, "attendanceRulesUpdate") });
      return;
    }
    const params = z.object({ scheduleId: z.string() }).safeParse(req.params);
    if (!params.success || !isUuid(params.data.scheduleId)) {
      res.status(400).json({ error: message(req, "invalidRequest") });
      return;
    }
    const [schedule] = await db
      .select()
      .from(workSchedulesTable)
      .where(
        and(
          eq(workSchedulesTable.id, params.data.scheduleId),
          eq(workSchedulesTable.companyId, context.companyId),
          eq(workSchedulesTable.active, true),
        ),
      )
      .limit(1);
    if (!schedule) {
      res.status(404).json({ error: message(req, "invalidRequest") });
      return;
    }
    await db
      .update(companiesTable)
      .set({ defaultScheduleId: schedule.id })
      .where(eq(companiesTable.id, context.companyId));
    await recordAudit(
      context.companyId,
      "updated",
      "company_default_schedule",
      schedule.id,
      {
        scheduleId: schedule.id,
      },
    );
    res.json(
      SetDefaultWorkScheduleResponse.parse(mapWorkSchedule(schedule, true)),
    );
  },
);

function historyRow(
  assignment: typeof employeeScheduleAssignmentsTable.$inferSelect,
  employee: typeof employeesTable.$inferSelect,
  schedule: typeof workSchedulesTable.$inferSelect,
) {
  return {
    ...mapScheduleAssignment(assignment),
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    scheduleName: schedule.name,
    createdAt: assignment.createdAt.toISOString(),
  };
}

router.get("/schedule-assignments", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "schedules.view", false)) {
    res.status(403).json({ error: message(req, "attendanceRulesAccess") });
    return;
  }
  const rows = await db
    .select({
      assignment: employeeScheduleAssignmentsTable,
      employee: employeesTable,
      schedule: workSchedulesTable,
    })
    .from(employeeScheduleAssignmentsTable)
    .innerJoin(
      employeesTable,
      eq(employeeScheduleAssignmentsTable.employeeId, employeesTable.id),
    )
    .innerJoin(
      workSchedulesTable,
      eq(employeeScheduleAssignmentsTable.scheduleId, workSchedulesTable.id),
    )
    .where(eq(employeeScheduleAssignmentsTable.companyId, context.companyId))
    .orderBy(desc(employeeScheduleAssignmentsTable.effectiveFrom));
  res.json(
    ListScheduleAssignmentsResponse.parse(
      rows.map((row) => historyRow(row.assignment, row.employee, row.schedule)),
    ),
  );
});

router.post("/schedule-assignments", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "schedules.manage")) {
    res.status(403).json({ error: message(req, "attendanceRulesUpdate") });
    return;
  }
  const parsed = BulkAssignEmployeeSchedulesBody.safeParse(req.body ?? {});
  if (
    !parsed.success ||
    parsed.data.employeeIds.some((id) => !isUuid(id)) ||
    !isUuid(parsed.data.scheduleId)
  ) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  if (
    parsed.data.effectiveTo &&
    parsed.data.effectiveTo < parsed.data.effectiveFrom
  ) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
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
  const employees = await db
    .select()
    .from(employeesTable)
    .where(
      and(
        eq(employeesTable.companyId, context.companyId),
        sql`${employeesTable.id} = ANY(${parsed.data.employeeIds})`,
      ),
    );
  if (!schedule || employees.length !== parsed.data.employeeIds.length) {
    res.status(404).json({ error: message(req, "invalidRequest") });
    return;
  }
  const created = [];
  for (const employee of employees) {
    const existing = await db
      .select()
      .from(employeeScheduleAssignmentsTable)
      .where(
        and(
          eq(employeeScheduleAssignmentsTable.companyId, context.companyId),
          eq(employeeScheduleAssignmentsTable.employeeId, employee.id),
        ),
      );
    const newEnd = parsed.data.effectiveTo ?? "9999-12-31";
    const overlaps = existing.some(
      (item) =>
        item.effectiveFrom !== parsed.data.effectiveFrom &&
        item.effectiveFrom <= newEnd &&
        (item.effectiveTo ?? "9999-12-31") >= parsed.data.effectiveFrom,
    );
    if (overlaps) {
      res.status(409).json({ error: message(req, "invalidRequest") });
      return;
    }
    const sameStart = existing.find(
      (item) => item.effectiveFrom === parsed.data.effectiveFrom,
    );
    const assignment = sameStart
      ? (
          await db
            .update(employeeScheduleAssignmentsTable)
            .set({
              scheduleId: schedule.id,
              effectiveTo: parsed.data.effectiveTo ?? null,
            })
            .where(eq(employeeScheduleAssignmentsTable.id, sameStart.id))
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
    created.push(historyRow(assignment, employee, schedule));
    await recordAudit(
      context.companyId,
      sameStart ? "updated" : "created",
      "employee_schedule_assignment",
      assignment.id,
      assignment,
    );
  }
  res.status(201).json(
    BulkAssignEmployeeSchedulesResponse.parse({
      assigned: created.length,
      assignments: created,
    }),
  );
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
      !canUseCapability(context, "schedules.view", true) &&
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
    let effectiveSchedule = effective?.schedule ?? null;
    let effectiveAssignment = effective?.assignment ?? null;
    if (!effectiveSchedule) {
      const [company] = await db
        .select({ defaultScheduleId: companiesTable.defaultScheduleId })
        .from(companiesTable)
        .where(eq(companiesTable.id, context.companyId))
        .limit(1);
      if (company?.defaultScheduleId) {
        [effectiveSchedule] = await db
          .select()
          .from(workSchedulesTable)
          .where(
            and(
              eq(workSchedulesTable.id, company.defaultScheduleId),
              eq(workSchedulesTable.companyId, context.companyId),
              eq(workSchedulesTable.active, true),
            ),
          )
          .limit(1);
        effectiveAssignment = null;
      }
    }
    res.json(
      GetEmployeeScheduleResponse.parse(
        effectiveScheduleResponse(
          access.employee.id,
          effectiveSchedule,
          effectiveAssignment,
        ),
      ),
    );
  },
);

router.put(
  "/employees/:employeeId/schedule",
  async (req, res): Promise<void> => {
    const context = await getTenantContext(req);
    if (!canUseCapability(context, "schedules.manage")) {
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
  if (!canUseCapability(context, "holidays.view", true)) {
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
  if (!canUseCapability(context, "holidays.manage")) {
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
  if (!canUseCapability(context, "holidays.manage")) {
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
  if (!canUseCapability(context, "holidays.manage")) {
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
    if (!canUseCapability(context, "employees.edit")) {
      denyCapability(res, req, "employees.edit");
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
  if (!canUseCapability(context, "employees.create")) {
    denyCapability(res, req, "employees.create");
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
    let sequence = 1;
    let candidate = String(sequence);
    while (
      existingNumbers.has(candidate.toLowerCase()) ||
      seenNumbers.has(candidate.toLowerCase())
    ) {
      sequence += 1;
      candidate = String(sequence);
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
        !/^[1-9][0-9]*$/.test(employeeNumber) ||
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
          actorType: "system",
          actorId: "system",
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
  if (!canUseCapability(context, "payroll.view")) {
    denyCapability(res, req, "payroll.view");
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
  if (!canUseCapability(context, "payroll.manage")) {
    denyCapability(res, req, "payroll.manage");
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
    leaveDays: Number(
      (row.calculation.inputsSnapshot as { leaveDays?: number }).leaveDays ?? 0,
    ),
    leaveBalances:
      (
        row.calculation.inputsSnapshot as {
          leaveBalances?: Array<{
            type: string;
            allocated: number;
            used: number;
            pending: number;
            remaining: number;
          }>;
        }
      ).leaveBalances ?? [],
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
  const rows = (await employeeRows(context)).filter(
    (row) => row.employee.status === "active",
  );
  const attendance = await getAttendanceRows(context, period.from, period.to);
  const storedAttendanceCalculations = await db
    .select()
    .from(attendanceCalculationsTable)
    .where(
      and(
        eq(attendanceCalculationsTable.companyId, context.companyId),
        gte(attendanceCalculationsTable.attendanceDate, period.from),
        lte(attendanceCalculationsTable.attendanceDate, period.to),
      ),
    );
  const calculationsByEmployee = new Map<
    string,
    typeof storedAttendanceCalculations
  >();
  for (const calculation of storedAttendanceCalculations) {
    const employeeCalculations =
      calculationsByEmployee.get(calculation.employeeId) ?? [];
    employeeCalculations.push(calculation);
    calculationsByEmployee.set(calculation.employeeId, employeeCalculations);
  }
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
  const periodRules = await attendanceRulesFor(context.companyId, period.from);
  const holidays = await holidaysForCompany(context.companyId);
  const scheduleRows = await scheduleRowsForCompany(context.companyId);
  const leaveBalances = await db
    .select()
    .from(leaveBalancesTable)
    .where(eq(leaveBalancesTable.companyId, context.companyId));
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
    const employeeCalculations =
      calculationsByEmployee.get(row.employee.id) ?? [];
    const attendanceDates = new Set(
      employeeAttendance.map((item) => item.attendance.date),
    );
    const employeeLeaveRows = approvedLeaves.filter(
      (leave) =>
        leave.employeeId === row.employee.id &&
        leave.from <= period.to &&
        leave.to >= period.from,
    );
    const leaveDates = new Set(
      employeeLeaveRows.flatMap((leave) =>
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
    const employeeLeaveBalances = leaveBalances
      .filter((balance) => balance.employeeId === row.employee.id)
      .map((balance) => ({
        type: balance.type,
        allocated: balance.allocated,
        used: balance.used,
        pending: balance.pending,
        remaining: moneyValue(balance.allocated - balance.used),
      }));
    const leaveDays = employeeLeaveRows.reduce(
      (total, leave) => total + leave.days,
      0,
    );
    const scheduledDates = dates.filter((dateValue) => {
      const schedule = effectiveScheduleFromRows(
        row.employee.id,
        dateValue,
        periodRules,
        scheduleRows,
      );
      return (
        isWorkingScheduleDay(schedule, dateValue) &&
        !isHolidayDate(dateValue, periodRules, holidays)
      );
    });
    const scheduledDayCount = Math.max(1, scheduledDates.length);
    const absentDays = scheduledDates.filter(
      (dateValue) =>
        !attendanceDates.has(dateValue) &&
        !leaveDates.has(dateValue) &&
        !permissionDates.has(dateValue),
    ).length;
    const regularHours = moneyValue(
      employeeCalculations.reduce(
        (total, calculation) =>
          total +
          Math.max(
            0,
            calculation.finalWorkedMinutes - calculation.finalOvertimeMinutes,
          ) /
            60,
        0,
      ),
    );
    const overtimeHours = moneyValue(
      employeeCalculations.reduce(
        (total, calculation) => total + calculation.finalOvertimeMinutes / 60,
        0,
      ),
    );
    const lateMinutes = employeeCalculations.reduce(
      (total, calculation) => total + calculation.effectiveLateMinutes,
      0,
    );
    const earlyCheckoutMinutes = employeeCalculations.reduce(
      (total, calculation) =>
        total + calculation.effectiveEarlyDepartureMinutes,
      0,
    );
    const missingHours = employeeAttendance.reduce(
      (total, item) => total + item.attendance.missingMinutes / 60,
      0,
    );
    const rules = employeeCalculations[0]
      ? await attendanceRulesFor(
          context.companyId,
          employeeCalculations[0].ruleEffectiveFrom,
        )
      : await attendanceRulesFor(context.companyId, period.from);
    const hourlyRate =
      row.employee.salary / Math.max(1, rules.hourlyRateDivisor);
    const overtime = moneyValue(
      overtimeHours *
        hourlyRate *
        (rules.overtimeMethod === "multiplier" ? rules.overtimeMultiplier : 1),
    );
    const latePenaltyMinutes = employeeCalculations.reduce(
      (total, calculation) => total + calculation.latePenaltyMinutes,
      0,
    );
    const earlyPenaltyMinutes = employeeCalculations.reduce(
      (total, calculation) => total + calculation.earlyDeparturePenaltyMinutes,
      0,
    );
    const lateDeduction =
      (rules.lateDeductionMethod as string) === "none"
        ? 0
        : (rules.lateDeductionMethod as string) === "fixed_per_minute"
          ? moneyValue(latePenaltyMinutes * rules.lateDeductionFactor)
          : moneyValue(
              (latePenaltyMinutes / 60) *
                hourlyRate *
                rules.lateDeductionFactor,
            );
    const earlyDeduction = moneyValue(
      (earlyPenaltyMinutes / 60) *
        hourlyRate *
        rules.earlyCheckoutDeductionFactor,
    );
    const calculatedAbsenceDays = Math.max(
      employeeCalculations.filter(
        (calculation) =>
          calculation.attendanceState === "unexcused_absence" ||
          calculation.attendanceState === "missing_attendance",
      ).length,
      absentDays,
    );
    const dailyRate = row.employee.salary / scheduledDayCount;
    const absenceDeduction =
      (rules.absenceDeductionMethod as string) === "none"
        ? 0
        : (rules.absenceDeductionMethod as string) === "fixed_per_day"
          ? moneyValue(calculatedAbsenceDays * rules.absenceDeductionFactor)
          : moneyValue(
              calculatedAbsenceDays * dailyRate * rules.absenceDeductionFactor,
            );
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
                { minutes: latePenaltyMinutes },
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
                minutes: earlyPenaltyMinutes,
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
                days: calculatedAbsenceDays,
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
          absentDays: calculatedAbsenceDays,
        },
        attendanceCalculations: employeeCalculations,
        approvedLeaveRequests: employeeLeaveRows,
        leaveDays,
        leaveBalances: employeeLeaveBalances,
        adjustments: employeeAdjustments,
        calculatedValues: {
          overtime,
          additions,
          attendanceDeductions,
          otherDeductions,
          netSalary,
        },
      },
      attendanceRuleVersionId: rules.id,
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
    if (!canUseCapability(context, "payroll.manage")) {
      denyCapability(res, req, "payroll.manage");
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
    if (!canUseCapability(context, "payroll.view") && !context.employeeId) {
      denyCapability(res, req, "payroll.view");
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
    if (!canUseCapability(context, "payroll.manage")) {
      denyCapability(res, req, "payroll.manage");
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
  if (!canUseCapability(context, "payroll.view")) {
    denyCapability(res, req, "payroll.view");
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
  if (!canUseCapability(context, "payroll.manage")) {
    denyCapability(res, req, "payroll.manage");
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
    if (!canUseCapability(context, "payroll.manage")) {
      denyCapability(res, req, "payroll.manage");
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
  if (!canUseCapability(context, "devices.view")) {
    res.status(403).json({ error: message(req, "deviceAdmin") });
    return;
  }
  res.json(
    ListDevicesResponse.parse((await deviceRows(context)).map(mapDeviceRow)),
  );
});

router.post("/devices", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "devices.manage")) {
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
  const registrationKey =
    parsed.data.adapterKey === "zkteco-adms" &&
    parsed.data.manufacturer.trim().toLowerCase() === "zkteco"
      ? randomBytes(32).toString("base64url")
      : null;
  const registrationKeyHash = registrationKey
    ? createHash("sha256").update(registrationKey).digest("hex")
    : null;
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
        registrationKeyHash,
        registrationKeyLast4: registrationKey?.slice(-4) ?? null,
        status: "not_configured",
        integrationState: "adapter_pending",
        note: message(req, "hardwareConnectorNote"),
      })
      .returning();
  });
  await recordAudit(
    context.companyId,
    registrationKey ? "registration" : "created",
    "device",
    device.id,
    device,
  );
  const row = (await deviceRows(context)).find(
    (item) => item.device.id === device.id,
  );
  res.status(201).json(
    CreateDeviceResponse.parse({
      ...mapDeviceRow(row!),
      ...(registrationKey ? { registrationKey } : {}),
    }),
  );
});

router.patch("/devices/:deviceId", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "devices.manage")) {
    denyCapability(res, req, "devices.manage");
    return;
  }
  const deviceId = String(req.params.deviceId);
  const parsed = UpdateDeviceBody.safeParse(req.body);
  if (!isUuid(deviceId) || !parsed.success || !isUuid(parsed.data.branchId)) {
    res.status(400).json({ error: message(req, "invalidRequest") });
    return;
  }
  const [branch] = await db
    .select({ id: branchesTable.id })
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
  const [before] = await db
    .select()
    .from(devicesTable)
    .where(
      and(
        eq(devicesTable.id, deviceId),
        eq(devicesTable.companyId, context.companyId),
      ),
    )
    .limit(1);
  if (!before) {
    res.status(404).json({ error: message(req, "deviceNotFound") });
    return;
  }
  const [device] = await db
    .update(devicesTable)
    .set({ branchId: branch.id })
    .where(
      and(
        eq(devicesTable.id, before.id),
        eq(devicesTable.companyId, context.companyId),
      ),
    )
    .returning();
  await recordAudit(context.companyId, "updated", "device", device.id, device, before);
  const row = (await deviceRows(context)).find((item) => item.device.id === device.id);
  res.json(UpdateDeviceResponse.parse(mapDeviceRow(row!)));
});

router.get("/devices/providers", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "devices.view")) {
    denyCapability(res, req, "devices.view");
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
    if (!canUseCapability(context, "sync-history.view")) {
      denyCapability(res, req, "sync-history.view");
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
  if (!canUseCapability(context, "devices.manage")) {
    denyCapability(res, req, "devices.manage");
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
    if (!canUseCapability(context, "devices.manage")) {
      denyCapability(res, req, "devices.manage");
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
  if (!canUseCapability(context, "devices.view")) {
    denyCapability(res, req, "devices.view");
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
  if (!canUseCapability(context, "devices.manage")) {
    denyCapability(res, req, "devices.manage");
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
  const [existingAccount] = await db
    .select()
    .from(userAccountsTable)
    .where(eq(userAccountsTable.employeeId, employee.employee.id))
    .limit(1);
  const identityAccountMismatch =
    (existingIdentity && !existingAccount) ||
    (!existingIdentity && existingAccount) ||
    (existingIdentity &&
      existingAccount &&
      (existingAccount.companyId !== context.companyId ||
        existingIdentity.accountId !== existingAccount.id ||
        existingIdentity.companyId !== context.companyId));
  if (identityAccountMismatch) {
    res.status(409).json({
      error: "The employee biometric identity and account are inconsistent.",
      code: "EMPLOYEE_IDENTITY_ACCOUNT_MISMATCH",
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
  const additionalDeviceMapping = Boolean(existingIdentity && existingAccount);
  const temporaryPassword = additionalDeviceMapping
    ? null
    : generateNumericPassword();
  const username = `${biometricCode}-${parsed.data.deviceEmployeeId}`;
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
      const createdIdentity =
        existingIdentity ??
        (
          await tx
            .insert(employeeIdentitiesTable)
            .values({
              companyId: context.companyId,
              employeeId: employee.employee.id,
              deviceId: device.id,
              biometricEmployeeNumber: parsed.data.deviceEmployeeId,
              username: createdAccount.username,
              accountId: createdAccount.id,
            })
            .returning()
        )[0];
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
    action: additionalDeviceMapping
      ? "employee_device_mapping_created"
      : "employee_identity_created",
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
    if (!canUseCapability(context, "devices.manage")) {
      denyCapability(res, req, "devices.manage");
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

router.get("/devices/:deviceId/events", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "devices.view")) {
    denyCapability(res, req, "devices.view");
    return;
  }
  const params = IngestBiometricEventParams.safeParse(req.params);
  if (!params.success || !isUuid(params.data.deviceId)) {
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
  const events = await db
    .select()
    .from(biometricEventsTable)
    .where(
      and(
        eq(biometricEventsTable.deviceId, device.id),
        eq(biometricEventsTable.companyId, context.companyId),
      ),
    )
    .orderBy(desc(biometricEventsTable.occurredAt))
    .limit(100);
  res.json(
    ListBiometricDeviceEventsResponse.parse(
      events.map((event) => ({
        id: event.id,
        deviceId: event.deviceId,
        deviceEmployeeId: event.deviceEmployeeId,
        employeeId: event.employeeId,
        occurredAt: event.occurredAt.toISOString(),
        eventType: event.eventType,
        direction: event.direction,
        processingStatus: event.processingStatus,
        rawPayload: event.rawPayload,
      })),
    ),
  );
});

router.post("/devices/:deviceId/events", async (req, res): Promise<void> => {
  const context = await getTenantContext(req);
  if (!canUseCapability(context, "devices.manage")) {
    denyCapability(res, req, "devices.manage");
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
  if (!canUseCapability(context, "locations.view", true)) {
    denyCapability(res, req, "locations.view");
    return;
  }
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
  if (!canUseCapability(context, "locations.manage")) {
    denyCapability(res, req, "locations.manage");
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
    if (!canUseCapability(context, "locations.manage")) {
      denyCapability(res, req, "locations.manage");
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
  if (!canUseCapability(context, "company.settings")) {
    denyCapability(res, req, "company.settings");
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
      employeeLimit:
        row?.subscription.employeeLimit ?? row?.plan.employeeLimit ?? 0,
      features: row?.plan.features ?? [],
    }),
  );
});

router.get("/platform/companies", async (req, res): Promise<void> => {
  await requirePlatformOwner(req);
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
      status: company.active
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
  await requirePlatformOwner(req);

  const [companies, employees, accounts, subscriptions, activity] =
    await Promise.all([
      db.select().from(companiesTable).orderBy(desc(companiesTable.createdAt)),
      db
        .select({
          id: employeesTable.id,
          companyId: employeesTable.companyId,
          status: employeesTable.status,
        })
        .from(employeesTable),
      db
        .select({
          id: userAccountsTable.id,
          username: userAccountsTable.username,
          displayRole: userAccountsTable.displayRole,
          companyId: userAccountsTable.companyId,
          active: userAccountsTable.active,
          accountType: userAccountsTable.accountType,
        })
        .from(userAccountsTable),
      db
        .select({
          companyId: subscriptionsTable.companyId,
          status: subscriptionsTable.status,
          planName: plansTable.name,
          employeeLimit: subscriptionsTable.employeeLimit,
          planEmployeeLimit: plansTable.employeeLimit,
          monthlyPrice: subscriptionsTable.monthlyPrice,
          annualPrice: subscriptionsTable.annualPrice,
        })
        .from(subscriptionsTable)
        .innerJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id)),
      db
        .select({
          id: authAuditEventsTable.id,
          action: authAuditEventsTable.action,
          entityType: authAuditEventsTable.entityType,
          entityId: authAuditEventsTable.entityId,
          accountId: authAuditEventsTable.accountId,
          companyId: authAuditEventsTable.companyId,
          metadata: authAuditEventsTable.metadata,
          createdAt: authAuditEventsTable.createdAt,
        })
        .from(authAuditEventsTable)
        .orderBy(desc(authAuditEventsTable.createdAt))
        .limit(12),
    ]);

  const employeesByCompany = new Map<
    string,
    { total: number; active: number }
  >();
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
      .filter(
        (account) =>
          account.accountType === "company_owner" && account.companyId,
      )
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
        const company = companies.find(
          (item) => item.id === subscription.companyId,
        );
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
            : (subscription?.status ?? "trial")
          : "suspended",
        planName: subscription?.planName ?? "Unconfigured",
        subscriptionStatus: subscription?.status ?? "trial",
        employeeCount: companyEmployees.total,
        activeEmployees: companyEmployees.active,
        userCount: companyAccounts.length,
        activeUsers: companyAccounts.filter((account) => account.active).length,
        employeeLimit:
          subscription?.employeeLimit ?? subscription?.planEmployeeLimit ?? 0,
        ownerCount: companyAccounts.filter(
          (account) => account.accountType === "company_owner",
        ).length,
        monthlyPrice: subscription?.monthlyPrice ?? 0,
        annualPrice: subscription?.annualPrice ?? 0,
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
