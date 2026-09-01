import {
  createContext,
  Fragment,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type FormEvent,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Link,
  Redirect,
  Route,
  Switch,
  useParams,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import {
  AlertCircle,
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Coins,
  Copy,
  Database,
  Download,
  Eye,
  EyeOff,
  Fingerprint,
  Globe2,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Network,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserPlus,
  UserRound,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import squareLogo from "@assets/file_0000000078f881f495d25f8c9a2bd674_1787187714141.png";
import shortLogo from "@assets/file_000000003b5881f4b4050da0a1da0ebf_1787187714190.png";
import horizontalLogo from "@assets/file_0000000052c481f4a6f60006dda3c286_1787188042959.png";
import arabicLoginLogo from "@assets/file_000000001fc4820a8874d7fbcbaf001b_1787189698147.png";
import {
  ErrorBoundary,
  type ErrorFallbackProps,
} from "@/components/error-boundary";
import { useIsMobile } from "@/hooks/use-mobile";
import NotFound from "@/pages/not-found";
import {
  useGetWorkspace,
  useGetDashboardSummary,
  useListDepartments,
  useCreateDepartment,
  useGetDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  useListBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
  useListEmployees,
  useCreateEmployee,
  useGetEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useGetAttendanceToday,
  useListAttendanceHistory,
  useCheckIn,
  useCheckOut,
  useCorrectAttendance,
  usePreviewAttendanceCalculation,
  useListAttendanceTimeAdjustments,
  useCreateAttendanceTimeAdjustment,
  useDecideAttendanceTimeAdjustment,
  useReverseAttendanceTimeAdjustment,
  useListLeaveBalances,
  useListLeaveBalanceTransactions,
  useAdjustLeaveBalance,
  useListLeaveRequests,
  useListLeavePolicies,
  useCreateLeavePolicy,
  useCreateLeaveRequest,
  useDecideLeaveRequest,
  useCancelLeaveRequest,
  useListPermissionRequests,
  useCreatePermissionRequest,
  useDecidePermissionRequest,
  useGetAttendanceRules,
  useUpdateAttendanceRules,
  useListAttendanceRuleChanges,
  useGetAttendanceReport,
  useGetReport,
  useImportEmployees,
  useListPayrollPeriods,
  useGetMyPayroll,
  useCreatePayrollPeriod,
  useDeletePayrollPeriod,
  useCalculatePayroll,
  useGetPayrollCalculation,
  useFinalizePayroll,
  useListPayrollAdjustments,
  useCreatePayrollAdjustment,
  useDeletePayrollAdjustment,
  useListDevices,
  useCreateDevice,
  useUpdateDevice,
  useSyncDevice,
  useTestDeviceConnection,
  useListWorkSchedules,
  useCreateWorkSchedule,
  useUpdateWorkSchedule,
  useGetEmployeeSchedule,
  useAssignEmployeeSchedule,
  useSetDefaultWorkSchedule,
  useListScheduleAssignments,
  useBulkAssignEmployeeSchedules,
  useListHolidays,
  useCreateHoliday,
  useUpdateHoliday,
  useDeleteHoliday,
  useListBiometricProviders,
  useListDeviceSyncHistory,
  useListBiometricDeviceEvents,
  useListDeviceMappings,
  useCreateDeviceMapping,
  useDeleteDeviceMapping,
  useListAttendanceLocations,
  useCreateAttendanceLocation,
  useUpdateAttendanceLocation,
  useGetEmployeeHrRecord,
  useUpdateEmployeeHrRecord,
  useGetSubscription,
  useListPlatformCompanies,
  getGetWorkspaceQueryKey,
  getGetDashboardSummaryQueryKey,
  getListDepartmentsQueryKey,
  getGetDepartmentQueryKey,
  getListBranchesQueryKey,
  getGetBranchQueryKey,
  getListEmployeesQueryKey,
  getGetEmployeeQueryKey,
  getGetAttendanceTodayQueryKey,
  getListAttendanceHistoryQueryKey,
  getPreviewAttendanceCalculationQueryKey,
  getListAttendanceTimeAdjustmentsQueryKey,
  getListLeaveBalancesQueryKey,
  getListLeaveBalanceTransactionsQueryKey,
  getListLeaveRequestsQueryKey,
  getListLeavePoliciesQueryKey,
  getListPermissionRequestsQueryKey,
  getGetAttendanceRulesQueryKey,
  getListAttendanceRuleChangesQueryKey,
  getGetAttendanceReportQueryKey,
  getGetReportQueryKey,
  getListPayrollPeriodsQueryKey,
  getGetMyPayrollQueryKey,
  getGetPayrollCalculationQueryKey,
  getListPayrollAdjustmentsQueryKey,
  getListDevicesQueryKey,
  getListDeviceMappingsQueryKey,
  getListWorkSchedulesQueryKey,
  getGetEmployeeScheduleQueryKey,
  getListScheduleAssignmentsQueryKey,
  getListHolidaysQueryKey,
  getListDeviceSyncHistoryQueryKey,
  getListBiometricDeviceEventsQueryKey,
  getListAttendanceLocationsQueryKey,
  getGetEmployeeHrRecordQueryKey,
  getGetSubscriptionQueryKey,
  getListPlatformCompaniesQueryKey,
} from "@workspace/api-client-react";

const queryClient = new QueryClient();

function invalidateAttendanceRuleDependents(qc: QueryClient) {
  const queryKeys = [
    getGetAttendanceRulesQueryKey(),
    getListAttendanceRuleChangesQueryKey(),
    getGetDashboardSummaryQueryKey(),
    getGetAttendanceTodayQueryKey(),
    getListAttendanceHistoryQueryKey(),
    getGetAttendanceReportQueryKey(),
    getGetReportQueryKey(),
    getListLeaveBalancesQueryKey(),
    getListLeaveBalanceTransactionsQueryKey(),
    getListLeavePoliciesQueryKey(),
    getListLeaveRequestsQueryKey(),
    getListPermissionRequestsQueryKey(),
    getListPayrollPeriodsQueryKey(),
    getGetMyPayrollQueryKey(),
  ];

  const invalidations = queryKeys.map((queryKey) =>
    qc.invalidateQueries({ queryKey }),
  );
  invalidations.push(
    qc.invalidateQueries({
      predicate: ({ queryKey }) => {
        const root = queryKey[0];
        return (
          typeof root === "string" &&
          (root.startsWith("/api/attendance/") ||
            root.startsWith("/api/payroll/periods/"))
        );
      },
    }),
  );
  return Promise.all(invalidations);
}

type Locale = "en" | "ar" | "fr" | "de";
type WorkspaceRole =
  "platform_owner" | "company_owner" | "manager" | "employee";
type AuthAccount = {
  id: string;
  username: string;
  accountType: "platform_owner" | "company_owner" | "staff" | "employee";
  displayRole: string;
  companyId: string | null;
  employeeId: string | null;
  active: boolean;
  permissions: string[];
  fullName: string;
  primaryPhone: string;
  backupPhones: string[];
  email: string;
  backupEmails: string[];
};
type PlatformCompanyDetail = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  address?: string;
  currency: string;
  active: boolean;
  status: string;
  planName: string;
  subscriptionStatus: string;
  employeeCount: number;
  activeEmployees: number;
  userCount: number;
  activeUsers: number;
  employeeLimit: number;
  ownerCount: number;
  monthlyPrice: number;
  annualPrice: number;
  owner: {
    id: string;
    username: string;
    displayRole: string;
    active: boolean;
  } | null;
  createdAt: string;
};
type PlatformCompanyDetails = {
  company: {
    name: string;
    slug: string;
    address: string;
    timezone: string;
    currency: string;
    active: boolean;
    createdAt: string;
  };
  subscription: {
    status: string;
    monthlyPrice: number;
    annualPrice: number;
    employeeLimit: number;
    planName: string;
  } | null;
  owners: AuthAccount[];
  staff: AuthAccount[];
  administrativeAccounts: AuthAccount[];
  roleGroups: {
    managers: AuthAccount[];
    supervisors: AuthAccount[];
    hr: AuthAccount[];
  };
  employees: Array<Record<string, unknown>>;
  devices: Array<Record<string, unknown>>;
  organization: {
    departments: Array<{
      id: string;
      name: string;
      nameAr: string;
      active: boolean;
      managerId: string | null;
      employeeCount: number;
    }>;
    branchCount: number;
  };
  configuration: {
    defaultScheduleId: string | null;
    attendanceRules: number;
    workSchedules: number;
    leavePolicies: number;
    payrollPeriods: number;
    integrations: number;
  };
  activity: PlatformActivity[];
  operationalData: Record<string, Array<Record<string, unknown>>>;
  tableCounts: Record<string, number>;
  integrity: { algorithm: string; checksum: string };
};
type PlatformActivity = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  accountId: string | null;
  companyId: string | null;
  metadata: Record<string, unknown>;
  actorType?: string;
  actorName?: string | null;
  createdAt: string;
};
type PlatformSummary = {
  metrics: {
    totalCompanies: number;
    activeCompanies: number;
    suspendedCompanies: number;
    totalEmployees: number;
    totalPlatformUsers: number;
    activeSubscriptions: number;
  };
  subscriptionStatus: Record<
    "trial" | "active" | "past_due" | "cancelled",
    number
  >;
  companies: PlatformCompanyDetail[];
  activity: PlatformActivity[];
  alerts: Array<{
    id: string;
    severity: "info" | "warning" | "critical";
    title: string;
    detail: string;
  }>;
};
type NewCompanyOwner = {
  fullName: string;
  username: string;
  password: string;
  primaryPhone: string;
  backupPhones: string;
  email: string;
  backupEmails: string;
};
type AuthContextValue = { account: AuthAccount; signOut: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("Auth context is unavailable.");
  return value;
}
type NavItem = {
  href: string;
  key: keyof typeof copy.en;
  icon: typeof LayoutDashboard;
  roles: WorkspaceRole[];
  capability?: string;
};

const nav: NavItem[] = [
  {
    href: "/",
    key: "overview",
    icon: LayoutDashboard,
    roles: ["platform_owner", "company_owner", "manager", "employee"],
  },
  {
    href: "/profile",
    key: "hrProfile",
    icon: BriefcaseBusiness,
    roles: ["platform_owner", "company_owner", "manager", "employee"],
  },
  {
    href: "/employees",
    key: "employees",
    icon: Users,
    roles: ["platform_owner", "company_owner", "manager"],
    capability: "employees.view",
  },
  {
    href: "/departments",
    key: "departments",
    icon: Building2,
    roles: ["company_owner", "manager"],
    capability: "departments.view",
  },
  {
    href: "/branches",
    key: "branches",
    icon: Network,
    roles: ["company_owner", "manager"],
    capability: "branches.view",
  },
  {
    href: "/attendance",
    key: "attendance",
    icon: Clock3,
    roles: ["platform_owner", "company_owner", "manager", "employee"],
    capability: "attendance.view",
  },
  {
    href: "/requests",
    key: "requests",
    icon: CalendarDays,
    roles: ["platform_owner", "company_owner", "manager", "employee"],
  },
  {
    href: "/rules",
    key: "rules",
    icon: SlidersHorizontal,
    roles: ["platform_owner", "company_owner", "manager"],
    capability: "attendance.rules.view",
  },
  {
    href: "/reports",
    key: "reports",
    icon: BarChart3,
    roles: ["platform_owner", "company_owner", "manager"],
    capability: "reports.view",
  },
  {
    href: "/payroll",
    key: "payroll",
    icon: Coins,
    roles: ["platform_owner", "company_owner"],
    capability: "payroll.view",
  },
  {
    href: "/payroll",
    key: "payroll",
    icon: Coins,
    roles: ["employee"],
  },
  {
    href: "/holidays",
    key: "holidays",
    icon: CalendarDays,
    roles: ["platform_owner", "company_owner", "manager"],
    capability: "holidays.view",
  },
  {
    href: "/devices",
    key: "devices",
    icon: Fingerprint,
    roles: ["platform_owner", "company_owner", "manager"],
    capability: "devices.view",
  },
  {
    href: "/sync-history",
    key: "syncHistory",
    icon: RefreshCw,
    roles: ["platform_owner", "company_owner", "manager"],
    capability: "sync-history.view",
  },
  {
    href: "/backups",
    key: "backupRestore",
    icon: Database,
    roles: ["platform_owner", "company_owner", "manager"],
    capability: "backups.view",
  },
  {
    href: "/accounts",
    key: "accountManagement",
    icon: UserPlus,
    roles: ["company_owner"],
    capability: "organization.manage",
  },
];
const secondaryNav: NavItem[] = [
  {
    href: "/subscription",
    key: "subscription",
    icon: Zap,
    roles: ["platform_owner", "company_owner"],
    capability: "payroll.view",
  },
  {
    href: "/platform",
    key: "platformOwner",
    icon: Network,
    roles: ["platform_owner"],
    capability: "platform.view",
  },
];
const companyAdminNav: NavItem[] = [
  {
    href: "/",
    key: "companyNavOverview",
    icon: LayoutDashboard,
    roles: ["company_owner"],
  },
  {
    href: "/profile",
    key: "companyNavAccount",
    icon: BriefcaseBusiness,
    roles: ["company_owner"],
  },
  {
    href: "/branches",
    key: "companyNavBranches",
    icon: Network,
    roles: ["company_owner"],
    capability: "branches.view",
  },
  {
    href: "/departments",
    key: "companyNavDepartments",
    icon: Building2,
    roles: ["company_owner"],
    capability: "departments.view",
  },
  {
    href: "/schedules",
    key: "companyNavSchedules",
    icon: Clock3,
    roles: ["company_owner"],
    capability: "schedules.view",
  },
  {
    href: "/rules",
    key: "companyNavRules",
    icon: SlidersHorizontal,
    roles: ["company_owner"],
    capability: "attendance.rules.view",
  },
  {
    href: "/employees",
    key: "companyNavEmployees",
    icon: Users,
    roles: ["company_owner"],
    capability: "employees.view",
  },
  {
    href: "/requests",
    key: "companyNavRequests",
    icon: CalendarDays,
    roles: ["company_owner"],
  },
  {
    href: "/reports",
    key: "companyNavReports",
    icon: BarChart3,
    roles: ["company_owner"],
    capability: "reports.view",
  },
  {
    href: "/payroll",
    key: "companyNavPayroll",
    icon: Coins,
    roles: ["company_owner"],
    capability: "payroll.view",
  },
  {
    href: "/holidays",
    key: "companyNavHolidays",
    icon: CalendarDays,
    roles: ["company_owner"],
    capability: "holidays.view",
  },
  {
    href: "/devices",
    key: "companyNavDevices",
    icon: Fingerprint,
    roles: ["company_owner"],
    capability: "devices.view",
  },
  {
    href: "/sync-history",
    key: "companyNavSyncHistory",
    icon: RefreshCw,
    roles: ["company_owner"],
    capability: "sync-history.view",
  },
  {
    href: "/backups",
    key: "companyNavBackup",
    icon: Database,
    roles: ["company_owner"],
    capability: "backups.view",
  },
  {
    href: "/accounts",
    key: "companyNavAccountManagement",
    icon: UserPlus,
    roles: ["company_owner"],
    capability: "organization.manage",
  },
  {
    href: "/subscription",
    key: "companyNavSubscription",
    icon: Zap,
    roles: ["company_owner"],
    capability: "payroll.view",
  },
];
const platformNav: NavItem[] = [
  {
    href: "/platform",
    key: "platformOwner",
    icon: Network,
    roles: ["platform_owner"],
    capability: "platform.view",
  },
  {
    href: "/backups",
    key: "backupRestore",
    icon: Database,
    roles: ["platform_owner"],
  },
  {
    href: "/platform/database",
    key: "databaseAdministration",
    icon: ShieldCheck,
    roles: ["platform_owner"],
  },
  {
    href: "/platform/account-settings",
    key: "accountSettings",
    icon: Settings,
    roles: ["platform_owner"],
  },
];

const copy = {
  en: {
    overview: "Overview",
    employees: "Employees",
    departments: "Departments",
    branches: "Branches",
    attendance: "Attendance",
    requests: "Requests",
    rules: "Attendance Rules",
    reports: "Reports",
    payroll: "Payroll",
    devices: "Devices",
    schedules: "Shift organization",
    holidays: "Holidays",
    syncHistory: "Sync history",
    backupRestore: "Backup & restore",
    subscription: "Subscription",
    platformOwner: "Platform owner",
    accountManagement: "Account management",
    companyNavOverview: "Overview",
    companyNavAccount: "My account",
    companyNavBranches: "Branches",
    companyNavDepartments: "Departments",
    companyNavSchedules: "Shift organization",
    companyNavRules: "Attendance rules",
    companyNavEmployees: "Employees",
    companyNavRequests: "Requests",
    companyNavReports: "Reports",
    companyNavPayroll: "Payroll",
    companyNavHolidays: "Holidays",
    companyNavDevices: "Devices",
    companyNavSyncHistory: "Sync history",
    companyNavBackup: "Backup",
    companyNavAccountManagement: "Account management",
    companyNavSubscription: "Subscription",
    databaseAdministration: "Database Administration",
    accountSettings: "Account Settings",
    platformOwnerOnly: "Platform Owner only",
    databaseAdminDetail:
      "Controlled emergency access to safe application data. Authentication secrets and backup payloads are excluded.",
    databaseEntity: "Data entity",
    databaseCoreOrganization: "Core organization",
    databaseSchedulingAttendance: "Scheduling and attendance",
    databaseLeavePayrollSupport: "Leave, payroll and platform support",
    dataExplorer: "Data explorer",
    companyContext: "Company context",
    allCompanies: "All companies",
    filterRecords: "Filter records",
    searchValues: "Search values",
    refresh: "Refresh",
    emergencyDestructiveOperations: "Emergency destructive operations",
    deleteSelected: "Delete selected",
    deleteRecord: "Delete record",
    clearEntityData: "Clear filtered/entity data",
    actions: "Actions",
    viewDetails: "View Details",
    history: "History",
    archive: "Archive",
    recordDetails: "Record details",
    supportEdit: "Support edit",
    supportEditHint:
      "Only approved operational fields are editable. Company ownership and authentication fields are locked.",
    databaseEditHint:
      "Only fields approved for this data type are editable. Record IDs, company ownership, and authentication fields stay locked.",
    inspectionOnly:
      "Platform owner support access — record deletions are permanent and audited.",
    beforeValue: "Before value",
    afterValue: "After value",
    changedFields: "Changed fields",
    noHistoryDetail: "This record has no recorded changes yet.",
    unknownCompany: "Unknown company",
    archiveConfirmation: "Archive this record?",
    deleteRecordConfirmation:
      "Delete this record permanently? This cannot be undone.",
    recordDeleted: "Record deleted successfully.",
    recordCouldNotBeDeleted: "This record could not be deleted.",
    couldNotSaveSupportedChanges: "Could not save the supported changes.",
    recordCouldNotBeArchived: "This record could not be archived.",
    couldNotLoadRecordHistory: "Could not load record history.",
    databaseCompanies: "Companies",
    databaseActiveCompanies: "Active companies",
    databaseVisibleRecords: "Visible records",
    databaseUsers: "Users and accounts",
    databaseEmployees: "Employees",
    databaseDepartments: "Departments",
    databaseBranches: "Branches",
    databaseShifts: "Work schedules",
    databaseShiftAssignments: "Employee schedule assignments",
    databaseAttendanceRules: "Attendance rules",
    databaseAttendanceCalculations: "Attendance calculations",
    databaseAttendance: "Attendance",
    databaseHolidays: "Holidays",
    databaseLeaveRequests: "Leave requests",
    databasePermissionRequests: "Permission requests",
    databasePayrollPeriods: "Payroll periods",
    databasePayrollCalculations: "Payroll calculations",
    databaseDevices: "Devices",
    databaseSubscriptions: "Subscriptions",
    databasePermissions: "Permissions",
    databaseAuditLogs: "Audit logs",
    databaseBackups: "Backups",
    databaseId: "ID",
    databaseCompanyId: "Company ID",
    databaseCompanyName: "Company name",
    databaseName: "Name",
    databaseArabicName: "Arabic name",
    databaseDescription: "Description",
    databaseManager: "Manager",
    databaseDefaultSchedule: "Default schedule",
    databaseCreatedAt: "Created at",
    databaseUpdatedAt: "Updated at",
    databaseEmployeeNumber: "Employee number",
    databaseFirstName: "First name",
    databaseLastName: "Last name",
    databaseEmail: "Email",
    databasePhone: "Phone",
    databaseDepartment: "Department",
    databaseBranch: "Branch",
    databaseStatus: "Status",
    databaseRole: "Role",
    databaseJoinedOn: "Joined on",
    databaseCity: "City",
    databaseGpsEnabled: "GPS enabled",
    databaseLatitude: "Latitude",
    databaseLongitude: "Longitude",
    databaseRadiusMeters: "Radius (meters)",
    databaseAction: "Action",
    databaseActor: "Actor",
    databaseActorRole: "Actor role",
    databaseSystem: "System",
    databasePlatformOwner: "Platform Owner",
    databaseUnknownAction: "Recorded action",
    databaseDataField: "Data field",
    databaseRolePlatformOwner: "Platform Owner",
    databaseYes: "Yes",
    databaseNo: "No",
    databaseStatusActive: "Active",
    databaseStatusInactive: "Inactive",
    databaseStatusArchived: "Archived",
    databaseStatusPending: "Pending",
    databaseStatusFinalized: "Finalized",
    databaseStatusDraft: "Draft",
    databaseStatusConnected: "Connected",
    databaseStatusDisconnected: "Disconnected",
    databaseActionCreated: "Created",
    databaseActionUpdated: "Updated",
    databaseActionSupport_updated: "Support updated",
    databaseActionArchived: "Archived",
    databaseActionDatabase_view: "Viewed",
    databaseActionDatabase_export: "Exported",
    databaseActionDatabase_support_updated: "Support update",
    databaseActionDatabase_deleted: "Deleted",
    edit: "Edit",
    noRecordsFound: "No records found",
    tryAnotherEntityOrFilter: "Try another entity or filter.",
    editRecord: "Edit record",
    saveChanges: "Save changes",
    loadingData: "Loading data…",
    couldNotLoadDatabaseEntities: "Could not load database entities.",
    couldNotLoadData: "Could not load data.",
    couldNotSaveRecord: "Could not save record.",
    deleteFailed:
      "Delete failed. Relationships may prevent this record from being removed.",
    clearFailed: "Clear failed.",
    exportFailed: "Export failed.",
    deleteRecordsConfirmation:
      "This will permanently delete {count} record(s). Type {phrase} to continue.",
    clearEntityConfirmation:
      "This emergency operation will delete all matching records. Type {phrase} to continue.",
    accountSettingsDetail:
      "Update only your currently authenticated Platform Owner account.",
    fullName: "Full name",
    phoneLoginUsername: "Phone number / login username",
    changePassword: "Change password",
    passwordChangeHint:
      "Enter your current password to set a new password (minimum 6 characters).",
    currentPassword: "Current password",
    newPassword: "New password",
    saveAccountSettings: "Save account settings",
    accountSettingsUpdated: "Account settings updated.",
    couldNotUpdateAccountSettings: "Could not update account settings.",
    workspace: "Workspace",
    departmentOperations: "Operations",
    departmentPeopleCulture: "People & Culture",
    branchAlexandriaHub: "Alexandria Hub",
    branchCairoHq: "Cairo HQ",
    cityAlexandria: "Alexandria",
    cityCairo: "Cairo",
    planBusiness: "Business",
    deviceCairoEntranceReader: "Cairo entrance reader",
    manufacturerGenericBiometricReader: "Generic biometric reader",
    modelAdapterPending: "Adapter pending",
    account: "Account",
    operationsDesk: "operations desk",
    activeWorkspace: "Active workspace",
    support: "Support",
    language: "Language",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    back: "Back",
    goBack: "Go back",
    languageEnglish: "English",
    languageArabic: "Arabic",
    languageFrench: "French",
    languageGerman: "German",
    roleEmployee: "Employee",
    roleManager: "Manager",
    roleCompanyOwner: "Company owner",
    rolePlatformOwner: "Platform owner",
    fallbackWorkspaceName: "VAR HR workspace",
    errorTitle: "Something went wrong",
    errorDetail:
      "This part of the app hit an error. The rest of the app is still running.",
    tryAgain: "Try again",
    authNotConnected:
      "Authentication is not connected. Data remains scoped to the active API workspace.",
    retry: "Retry",
    closeDialog: "Close dialog",
    operationalFeedLoadFailed: "The operational feed could not be loaded.",
    checkWorkspace: "Check the workspace connection and try again.",
    notAvailable: "Not available",
    statusActive: "Active",
    statusInactive: "Inactive",
    statusLocked: "Locked",
    statusConnected: "Connected",
    statusApproved: "Approved",
    statusPresent: "Present",
    statusLate: "Late",
    statusCalculated: "Calculated",
    statusFinalized: "Finalized",
    statusConfigured: "Configured",
    statusCompleted: "Completed",
    statusAttention: "Attention",
    statusPending: "Pending",
    statusTrial: "Trial",
    statusDraft: "Draft",
    statusSyncing: "Syncing",
    statusIncomplete: "Incomplete",
    statusRejected: "Rejected",
    statusOffline: "Offline",
    statusSuspended: "Suspended",
    statusPastDue: "Past due",
    statusAbsent: "Absent",
    statusOutsideGeofence: "Outside geofence",
    statusNotConfigured: "Not configured",
    statusAdapterPending: "Adapter pending",
    statusUnavailable: "Unavailable",
    statusCancelled: "Cancelled",
    statusOnLeave: "On leave",
    statusHoliday: "Holiday",
    severityInfo: "Info",
    severityWarning: "Warning",
    severityCritical: "Critical",
    present: "Present",
    late: "Late",
    absent: "Absent",
    mondayOperationalOverview: "Monday · operational overview",
    decisionSurfaceReviewExceptions:
      "Decision surface for {date}. Review the exceptions first.",
    liveWorkspace: "Live workspace",
    todayAtAGlance: "Today at a glance",
    peopleAccountedFor: "people accounted for",
    lateAbsent: "{late} late · {absent} absent",
    presencePercent: "{percent}% presence",
    requestsToDecide: "Requests to decide",
    openQueue: "Open queue →",
    payrollPosture: "Payroll posture",
    inspectCalculation: "Inspect calculation →",
    signalsRequiringAttention: "Signals requiring attention",
    exceptionsSurfaced: "Exceptions are intentionally surfaced, not buried.",
    noAlertsInQueue: "No alerts in the queue",
    operatingPictureClean: "The operating picture is clean right now.",
    operatingFootprint: "Operating footprint",
    activeTenantStructured: "How the active tenant is structured.",
    branchesDepartmentsDevicesConnected:
      "{branches} branches · {departments} departments · {connected}/{total} devices connected",
    workforceRegistry: "Workforce registry",
    searchReviewMaintainPeople:
      "Search, review, and maintain the people behind the operating picture.",
    addEmployee: "Add employee",
    searchByNameNumberEmail: "Search by name or number",
    allStatuses: "All statuses",
    employee: "Employee",
    department: "Department",
    branch: "Branch",
    role: "Role",
    joined: "Joined",
    noEmployeesMatch: "No employees match this view",
    adjustSearchOrAddFirstEmployee:
      "Adjust the search or add the first employee to this tenant.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    monthlySalary: "Monthly salary",
    select: "Select",
    createDepartment: "Create department",
    departmentName: "Department name",
    createBranch: "Create branch",
    branchName: "Branch name",
    branchCity: "Branch city",
    noBranches: "No branches yet",
    gpsEnabled: "GPS attendance enabled",
    cancel: "Cancel",
    saving: "Saving…",
    createEmployee: "Create employee",
    employeeProfile: "Employee profile",
    hrProfile: "My HR profile",
    profileCompanyOwner: "My account & company profile",
    profileStaff: "My account & HR profile",
    profileEmployee: "My HR profile",
    companyProfileDetail:
      "Review your account, company workspace, role, and account status.",
    staffProfileDetail:
      "Review your account information and linked employee HR information.",
    hrProfileDetail:
      "Review the employee and HR information available to your signed-in workspace identity.",
    hrRecord: "HR record",
    jobTitle: "Job title",
    employmentType: "Employment type",
    manager: "Manager",
    address: "Address",
    emergencyContactName: "Emergency contact",
    emergencyContactPhone: "Emergency phone",
    notes: "HR notes",
    hrRecordNotFound: "No HR record has been created for this employee yet.",
    hrRecordUnauthorized: "You are not authorized to view this HR record.",
    hrRecordLoadFailed: "The HR record could not be loaded.",
    hrRecordCreateHint:
      "Complete the fields below to create the employee HR record.",
    saveHrRecord: "Save HR record",
    hrRecordSaved: "HR record saved",
    hrRecordSaveFailed: "Could not save the HR record",
    employeeProfileLoadFailed: "The employee profile could not be loaded.",
    ownProfileOnly: "Employees can only view their own HR profile.",
    noEmployeeContextDetail:
      "The workspace has not attached an employee identity to this session.",
    employeeNumber: "Employee number",
    employeeNumberEditHint:
      "You can change this number manually. Login, attendance history, payroll, and biometric links stay attached to this employee.",
    deleteSuccessful: "Deleted successfully",
    activateDepartment: "Activate department",
    deactivateDepartment: "Deactivate department",
    salary: "Salary",
    basicSalary: "Basic salary",
    markInactive: "Mark inactive",
    reactivateEmployee: "Reactivate employee",
    employeeAddedToWorkspace: "Employee added to the workspace",
    couldNotCreateEmployee: "Could not create employee",
    departmentCreated: "Department created",
    departmentsEyebrow: "Organization",
    departmentsTitle: "Departments",
    departmentsDetail: "Create and manage your company's departments.",
    addDepartment: "Add department",
    englishName: "English name",
    arabicName: "Arabic name",
    departmentDescription: "Description",
    selectManager: "Select manager",
    noDepartments: "No departments yet",
    noDepartmentsDetail: "Create the first department for this company.",
    departmentEmployees: "Department employees",
    departmentSaved: "Department saved",
    branchesEyebrow: "Organization",
    branchesTitle: "Branches",
    branchesDetail: "Manage your company locations and their biometric devices.",
    addBranch: "Add branch",
    branchSaved: "Branch saved",
    branchDetails: "Branch details",
    branchDevices: "Biometric devices",
    branchEmployees: "Employees",
    branchStatus: "Branch status",
    branchActive: "Active",
    branchInactive: "Inactive",
    deactivateBranch: "Deactivate branch",
    activateBranch: "Activate branch",
    couldNotSaveBranch: "Could not save the branch.",
    editBranch: "Change branch",
    departmentDeactivated: "Department status updated",
    branchCreated: "Branch created",
    employeeSaved: "Employee saved",
    employeeStatusUpdated: "Employee status updated",
    currentEmployeeContext: "Current employee context",
    noEmployeeContext: "No employee context",
    apiWillIdentifySignedInEmployee:
      "The API will identify the signed-in employee.",
    status: "Status",
    scheduledStart: "Scheduled start",
    checkInNow: "Check in now",
    checkOutNow: "Check out now",
    webEventLocationPolicy:
      "Web event · location policy is evaluated by the API",
    todayRegister: "Today’s register",
    loadingOperationalDate: "Loading operational date",
    noAttendanceRecordsYet: "No attendance records yet",
    whenDayStartsEventsAppearHere:
      "When the day starts, events will appear here.",
    date: "Date",
    day: "Day",
    checkIn: "Check in",
    checkOut: "Check out",
    hours: "Hours",
    noHistoryFound: "No history found",
    attendanceHistoryWillPopulate:
      "Attendance history will populate once events are recorded.",
    requestSubmitted: "Request submitted",
    couldNotSubmitRequest: "Could not submit request",
    requestApproved: "Request approved",
    requestRejected: "Request rejected",
    leaveBalances: "Leave balances",
    daysRemaining: "days remaining",
    allocatedDays: "Allocated days",
    usedDays: "Used days",
    queueHygiene: "Queue hygiene",
    pendingDecisionsAcrossBothRequestTypes:
      "pending decisions across both request types",
    leave: "Leave",
    permission: "Permission",
    records: "records",
    theDecisionQueueIsClear: "The decision queue is clear",
    newLeaveAndPermissionRequestsWillAppearHere:
      "New leave and permission requests will appear here.",
    createRequest: "Create request",
    newRequest: "New {kind} request",
    type: "Type",
    reason: "Reason",
    from: "From",
    to: "To",
    start: "Start",
    end: "End",
    submitRequest: "Submit request",
    annualLeave: "Annual leave",
    reviewedInOperationsQueue: "Reviewed in operations queue",
    notApprovedAtThisTime: "Not approved at this time",
    workingHours: "Working hours",
    workStarts: "Work starts",
    workEnds: "Work ends",
    gracePeriodMinutes: "Grace period (minutes)",
    overtimeAfterMinutes: "Overtime after (minutes)",
    locationVerification: "Location verification",
    gpsPolicy: "GPS policy",
    disabled: "Disabled",
    optional: "Optional",
    required: "Required",
    locationRadiusMeters: "Location radius (meters)",
    explainabilityByDefault: "Explainability by default",
    attendanceExceptionsRecorded:
      "Attendance exceptions record their source, location posture, and a human-readable explanation for review.",
    saveAttendancePolicy: "Save attendance policy",
    attendancePolicyUpdated: "Attendance policy updated",
    attendancePolicyRecalculateHint:
      "Policy saved. Recalculate any non-finalized payroll period to apply the change.",
    savingPolicy: "Saving policy…",
    evidenceAnalysis: "Evidence & analysis",
    attendanceReports: "Attendance reports",
    previewSelectedPeriod:
      "Preview the selected period before exporting through your connected workflow.",
    refreshPreview: "Refresh preview",
    previewReport: "Preview report",
    overtimeHours: "Overtime hours",
    employeeDetail: "Employee detail",
    chooseReportingWindow: "Choose a reporting window",
    setDatesAbovePreview: "Set the dates above to preview attendance evidence.",
    generalPayrollOperations: "General payroll operations",
    explainableCalculationHistory:
      "Explainable calculation history using configured workforce inputs. This is not statutory tax advice.",
    periods: "Periods",
    selectAPeriodToInspectOrRecalculate:
      "Select a period to inspect or recalculate.",
    noPayrollPeriods: "No payroll periods",
    periodsSuppliedByApi: "Periods are supplied by the operational API.",
    calculationHistory: "Calculation history",
    calculated: "Calculated",
    calculationExplanation: "Calculation explanation",
    selectPeriodToCreatePreview:
      "Choose Calculate to create an explainable calculation preview.",
    payrollCalculationReady: "Payroll calculation ready",
    calculationCouldNotBeCompleted: "Calculation could not be completed",
    calculate: "Calculate",
    recalculatePayroll: "Recalculate",
    calculating: "Calculating…",
    deviceConfigurationAdded: "Device configuration added",
    couldNotAddDevice: "Could not add device",
    connectedOperations: "Connected operations",
    biometricDevices: "Biometric devices",
    configurationVisibleAdapterHonest:
      "Configuration is visible here; adapter availability is reported honestly.",
    addDevice: "Add device",
    noBiometricDevicesConfigured: "No biometric devices configured",
    addDeviceToMakeAdapterStateVisible:
      "Add a device to make its adapter state visible.",
    addConfiguration: "Add configuration",
    sync: "Sync",
    syncRequested: "Sync requested",
    syncRequestUnavailable: "Sync request unavailable",
    addBiometricDevice: "Add biometric device",
    deviceName: "Device name",
    manufacturer: "Manufacturer",
    model: "Model",
    branchSelect: "Branch",
    selectBranch: "Select branch",
    planCapacity: "Plan & capacity",
    usageAndEntitlements: "Usage and entitlements for the active workspace.",
    currentPlan: "Current plan",
    activeEmployees: "Active employees",
    seatsRemaining: "seats remaining",
    includedCapabilities: "Included capabilities",
    planChangesManaged:
      "Plan changes are managed through your account team. No billing action is simulated here.",
    separateAdministrationSurface: "Separate administration surface",
    crossTenantVisibility:
      "Cross-tenant visibility for platform operations. Company actions are intentionally read-only in this surface.",
    platformScope: "Platform scope",
    company: "Company",
    plan: "Plan",
    seats: "Seats",
    lastActivity: "Last activity",
    noCompaniesInPlatformScope: "No companies in platform scope",
    platformApiReturnedNoTenants:
      "The platform API returned no tenants for this workspace.",
    notFoundTitle: "404 Page Not Found",
    notFoundDetail: "Did you forget to add the page to the router?",
  },
  ar: {
    overview: "نظرة عامة",
    employees: "الموظفون",
    departments: "الأقسام",
    branches: "الفروع",
    attendance: "الحضور",
    requests: "الطلبات",
    rules: "قواعد الحضور",
    reports: "التقارير",
    payroll: "الرواتب",
    devices: "الأجهزة",
    schedules: "تنظيم الشيفتات",
    holidays: "العطلات",
    syncHistory: "سجل المزامنة",
    backupRestore: "النسخ الاحتياطي والاستعادة",
    subscription: "الاشتراك",
    platformOwner: "مالك المنصة",
    companyNavOverview: "نظرة عامة",
    companyNavAccount: "حسابي",
    companyNavBranches: "الفروع",
    companyNavDepartments: "الاقسام",
    companyNavSchedules: "تنظيم الشيفتات",
    companyNavRules: "قواعد الحضور",
    companyNavEmployees: "الموظفون",
    companyNavRequests: "الطلبات",
    companyNavReports: "التقارير",
    companyNavPayroll: "الرواتب",
    companyNavHolidays: "العطلات",
    companyNavDevices: "الاجهزه",
    companyNavSyncHistory: "سجل المزامنه",
    companyNavBackup: "النسخ الاحتياطي",
    companyNavAccountManagement: "ادارة الحسابات",
    companyNavSubscription: "الاشتراك",
    workspace: "مساحة العمل",
    departmentOperations: "العمليات",
    departmentPeopleCulture: "الأفراد والثقافة",
    branchAlexandriaHub: "مركز الإسكندرية",
    branchCairoHq: "المقر الرئيسي بالقاهرة",
    cityAlexandria: "الإسكندرية",
    cityCairo: "القاهرة",
    planBusiness: "الأعمال",
    deviceCairoEntranceReader: "قارئ مدخل القاهرة",
    manufacturerGenericBiometricReader: "قارئ بصمة عام",
    modelAdapterPending: "الموصل قيد الإعداد",
    account: "الحساب",
    operationsDesk: "مكتب العمليات",
    activeWorkspace: "مساحة العمل النشطة",
    support: "الدعم",
    language: "اللغة",
    openNavigation: "فتح التنقل",
    closeNavigation: "إغلاق التنقل",
    back: "رجوع",
    goBack: "العودة",
    languageEnglish: "الإنجليزية",
    languageArabic: "العربية",
    languageFrench: "الفرنسية",
    languageGerman: "الألمانية",
    roleEmployee: "الموظف",
    roleManager: "المدير",
    roleCompanyOwner: "مالك الشركة",
    rolePlatformOwner: "مالك المنصة",
    fallbackWorkspaceName: "مساحة عمل VAR HR",
    errorTitle: "حدث خطأ ما",
    errorDetail:
      "حدث خطأ في هذا الجزء من التطبيق. لا يزال باقي التطبيق قيد التشغيل.",
    tryAgain: "حاول مرة أخرى",
    notFoundTitle: "404 الصفحة غير موجودة",
    notFoundDetail: "هل نسيت إضافة الصفحة إلى الموجّه؟",
    authNotConnected:
      "المصادقة غير متصلة. تظل البيانات محصورة في مساحة عمل API النشطة.",
    retry: "إعادة المحاولة",
    closeDialog: "إغلاق النافذة",
    operationalFeedLoadFailed: "تعذر تحميل موجز العمليات.",
    checkWorkspace: "تحقق من اتصال مساحة العمل وحاول مرة أخرى.",
    notAvailable: "غير متاح",
    statusActive: "نشط",
    statusInactive: "غير نشط",
    statusLocked: "مقفل",
    statusConnected: "متصل",
    statusApproved: "موافق عليه",
    statusPresent: "حاضر",
    statusLate: "متأخر",
    statusCalculated: "تم الحساب",
    statusFinalized: "معتمد نهائياً",
    statusConfigured: "مُعد",
    statusCompleted: "مكتمل",
    statusAttention: "يحتاج إلى انتباه",
    statusPending: "قيد الانتظار",
    statusTrial: "تجريبي",
    statusDraft: "مسودة",
    statusSyncing: "جارٍ المزامنة",
    statusIncomplete: "غير مكتمل",
    statusRejected: "مرفوض",
    statusOffline: "غير متصل",
    statusSuspended: "موقوف",
    statusPastDue: "متأخر السداد",
    statusAbsent: "غائب",
    statusOutsideGeofence: "خارج النطاق الجغرافي",
    statusNotConfigured: "غير مُعد",
    statusAdapterPending: "الموصل قيد الانتظار",
    statusUnavailable: "غير متاح",
    statusCancelled: "ملغى",
    statusOnLeave: "في إجازة",
    statusHoliday: "عطلة",
    severityInfo: "معلومة",
    severityWarning: "تحذير",
    severityCritical: "حرج",
    present: "حاضر",
    late: "متأخر",
    absent: "غائب",
    activeEmployees: "الموظفون النشطون",
    activeTenantStructured: "هيكل مساحة العمل النشطة.",
    addBiometricDevice: "إضافة جهاز بصمة",
    addConfiguration: "إضافة إعداد",
    addDevice: "إضافة جهاز",
    addEmployee: "إضافة موظف",
    address: "العنوان",
    allStatuses: "كل الحالات",
    annualLeave: "إجازة سنوية",
    attendancePolicyUpdated: "تم تحديث سياسة الحضور",
    attendancePolicyRecalculateHint:
      "تم حفظ القاعدة. أعد حساب أي فترة راتب غير نهائية لتطبيق التغيير.",
    biometricDevices: "أجهزة البصمة",
    branch: "الفرع",
    branchCreated: "تم إنشاء الفرع",
    calculate: "حساب",
    recalculatePayroll: "إعادة الحساب",
    calculating: "جارٍ الحساب…",
    calculationExplanation: "شرح الحساب",
    calculationHistory: "سجل الحسابات",
    cancel: "إلغاء",
    checkIn: "تسجيل الحضور",
    checkInNow: "تسجيل الحضور الآن",
    checkOut: "تسجيل الانصراف",
    checkOutNow: "تسجيل الانصراف الآن",
    company: "الشركة",
    connectedOperations: "العمليات المتصلة",
    couldNotCreateEmployee: "تعذر إنشاء الموظف",
    couldNotSubmitRequest: "تعذر إرسال الطلب",
    createEmployee: "إنشاء موظف",
    createRequest: "إنشاء طلب",
    currentEmployeeContext: "سياق الموظف الحالي",
    currentPlan: "الخطة الحالية",
    date: "التاريخ",
    daysRemaining: "الأيام المتبقية",
    allocatedDays: "الأيام المخصصة",
    usedDays: "الأيام المستخدمة",
    department: "القسم",
    departmentCreated: "تم إنشاء القسم",
    departmentsEyebrow: "الهيكل التنظيمي",
    departmentsTitle: "الأقسام",
    departmentsDetail: "أنشئ أقسام شركتك وأدرها بوضوح.",
    addDepartment: "إضافة قسم",
    englishName: "الاسم بالإنجليزية",
    arabicName: "الاسم بالعربية",
    departmentDescription: "الوصف",
    selectManager: "اختر المدير",
    noDepartments: "لا توجد أقسام بعد",
    noDepartmentsDetail: "أنشئ أول قسم لهذه الشركة.",
    departmentEmployees: "موظفو القسم",
    departmentSaved: "تم حفظ القسم",
    branchesEyebrow: "التنظيم",
    branchesTitle: "الفروع",
    branchesDetail: "إدارة مواقع شركتك وأجهزة البصمة المرتبطة بها.",
    addBranch: "إضافة فرع",
    branchSaved: "تم حفظ الفرع",
    branchDetails: "تفاصيل الفرع",
    branchDevices: "أجهزة البصمة",
    branchEmployees: "الموظفون",
    branchStatus: "حالة الفرع",
    branchActive: "نشط",
    branchInactive: "غير نشط",
    deactivateBranch: "تعطيل الفرع",
    activateBranch: "تفعيل الفرع",
    couldNotSaveBranch: "تعذر حفظ الفرع.",
    editBranch: "تغيير الفرع",
    departmentDeactivated: "تم تحديث حالة القسم",
    employeeSaved: "تم حفظ الموظف",
    disabled: "معطل",
    email: "البريد الإلكتروني",
    emergencyContactName: "اسم جهة اتصال الطوارئ",
    emergencyContactPhone: "هاتف الطوارئ",
    employee: "الموظف",
    employeeNumber: "رقم الموظف",
    employeeNumberEditHint:
      "يمكنك تغيير الرقم يدويًا. يظل تسجيل الدخول وسجل الحضور والرواتب وروابط البصمة مرتبطة بهذا الموظف.",
    deleteSuccessful: "تم الحذف بنجاح",
    activateDepartment: "تفعيل القسم",
    deactivateDepartment: "تعطيل القسم",
    employeeProfile: "ملف الموظف",
    employeeProfileLoadFailed: "تعذر تحميل ملف الموظف.",
    employeeStatusUpdated: "تم تحديث حالة الموظف",
    employmentType: "نوع التوظيف",
    end: "النهاية",
    evidenceAnalysis: "الأدلة والتحليل",
    exceptionsSurfaced: "يتم عرض الاستثناءات بوضوح.",
    from: "من",
    gpsPolicy: "سياسة GPS",
    hours: "الساعات",
    hrProfile: "ملفي في الموارد البشرية",
    profileCompanyOwner: "حسابي وبيانات الشركة",
    profileStaff: "حسابي والملف الوظيفي",
    profileEmployee: "ملفي الوظيفي",
    companyProfileDetail: "راجع بيانات حسابك ومساحة الشركة ودورك وحالة الحساب.",
    staffProfileDetail:
      "راجع معلومات حسابك وبياناتك الوظيفية المرتبطة عند توفرها.",
    hrProfileDetail:
      "راجع معلومات الموظف والموارد البشرية المتاحة لهويتك المسجلة في مساحة العمل.",
    hrRecord: "سجل الموارد البشرية",
    hrRecordCreateHint: "أكمل الحقول أدناه لإنشاء سجل الموارد البشرية للموظف.",
    hrRecordLoadFailed: "تعذر تحميل سجل الموارد البشرية.",
    hrRecordNotFound: "لم يتم إنشاء سجل موارد بشرية لهذا الموظف بعد.",
    hrRecordSaveFailed: "تعذر حفظ سجل الموارد البشرية",
    hrRecordSaved: "تم حفظ سجل الموارد البشرية",
    hrRecordUnauthorized: "غير مصرح لك بعرض سجل الموارد البشرية هذا.",
    includedCapabilities: "الإمكانات المضمنة",
    inspectCalculation: "فحص الحساب ←",
    jobTitle: "المسمى الوظيفي",
    joined: "تاريخ الانضمام",
    leave: "الإجازة",
    leaveBalances: "أرصدة الإجازات",
    liveWorkspace: "مساحة العمل المباشرة",
    loadingOperationalDate: "جارٍ تحميل التاريخ التشغيلي…",
    locationVerification: "التحقق من الموقع",
    manager: "المدير",
    markInactive: "تعيين كغير نشط",
    mondayOperationalOverview: "نظرة تشغيلية ليوم الاثنين",
    newRequest: "طلب جديد",
    noAlertsInQueue: "لا توجد تنبيهات في قائمة الانتظار",
    noEmployeeContext: "لا يوجد سياق موظف",
    noEmployeeContextDetail: "لم تربط مساحة العمل هوية موظف بهذه الجلسة.",
    noEmployeesMatch: "لا يوجد موظفون يطابقون هذا العرض",
    noPayrollPeriods: "لا توجد فترات رواتب",
    notes: "ملاحظات",
    openQueue: "فتح قائمة الانتظار",
    operatingFootprint: "النطاق التشغيلي",
    operatingPictureClean: "الصورة التشغيلية واضحة حالياً.",
    optional: "اختياري",
    overtimeAfterMinutes: "العمل الإضافي بعد (بالدقائق)",
    overtimeHours: "ساعات العمل الإضافي",
    ownProfileOnly: "يمكن للموظفين عرض ملف الموارد البشرية الخاص بهم فقط.",
    payrollPosture: "حالة الرواتب",
    peopleAccountedFor: "الأشخاص المشمولون",
    periods: "الفترات",
    permission: "الإذن",
    planCapacity: "الخطة والسعة",
    queueHygiene: "نظافة قائمة الانتظار",
    reactivateEmployee: "إعادة تنشيط الموظف",
    reason: "السبب",
    records: "السجلات",
    requestApproved: "تمت الموافقة على الطلب",
    requestRejected: "تم رفض الطلب",
    requestSubmitted: "تم إرسال الطلب",
    requestsToDecide: "طلبات بانتظار القرار",
    required: "مطلوب",
    role: "الدور",
    salary: "الراتب",
    basicSalary: "الراتب الأساسي",
    saveAttendancePolicy: "حفظ سياسة الحضور",
    saveHrRecord: "حفظ سجل الموارد البشرية",
    saving: "جارٍ الحفظ…",
    savingPolicy: "جارٍ حفظ السياسة…",
    scheduledStart: "بدء مجدول",
    seatsRemaining: "المقاعد المتبقية",
    selectBranch: "اختر الفرع",
    signalsRequiringAttention: "مؤشرات تتطلب الانتباه",
    start: "البداية",
    status: "الحالة",
    submitRequest: "إرسال الطلب",
    sync: "مزامنة",
    syncRequested: "تم طلب المزامنة",
    to: "إلى",
    todayAtAGlance: "لمحة عن اليوم",
    todayRegister: "سجل اليوم",
    type: "النوع",
    workEnds: "ينتهي العمل",
    workStarts: "يبدأ العمل",
    workingHours: "ساعات العمل",
  },
  fr: {
    overview: "Vue d’ensemble",
    employees: "Employés",
    attendance: "Présence",
    requests: "Demandes",
    rules: "Règles",
    reports: "Rapports",
    payroll: "Paie",
    devices: "Appareils",
    syncHistory: "Historique de synchronisation",
    backupRestore: "Sauvegarde et restauration",
    subscription: "Abonnement",
    platformOwner: "Propriétaire de la plateforme",
    companyNavOverview: "Vue d’ensemble",
    companyNavAccount: "Mon compte",
    companyNavBranches: "Succursales",
    companyNavDepartments: "Départements",
    companyNavSchedules: "Organisation des équipes",
    companyNavRules: "Règles de présence",
    companyNavEmployees: "Employés",
    companyNavRequests: "Demandes",
    companyNavReports: "Rapports",
    companyNavPayroll: "Paie",
    companyNavHolidays: "Jours fériés",
    companyNavDevices: "Appareils",
    companyNavSyncHistory: "Historique de synchronisation",
    companyNavBackup: "Sauvegarde",
    companyNavAccountManagement: "Gestion des comptes",
    companyNavSubscription: "Abonnement",
    workspace: "Espace de travail",
    departmentOperations: "Opérations",
    departmentPeopleCulture: "People & Culture",
    branchAlexandriaHub: "Centre d’Alexandrie",
    branchCairoHq: "Siège du Caire",
    cityAlexandria: "Alexandrie",
    cityCairo: "Le Caire",
    planBusiness: "Business",
    deviceCairoEntranceReader: "Lecteur d’entrée du Caire",
    manufacturerGenericBiometricReader: "Lecteur biométrique générique",
    modelAdapterPending: "Adaptateur en attente",
    account: "Compte",
    operationsDesk: "bureau des opérations",
    activeWorkspace: "Espace actif",
    support: "Assistance",
    language: "Langue",
    openNavigation: "Ouvrir la navigation",
    closeNavigation: "Fermer la navigation",
    languageEnglish: "Anglais",
    languageArabic: "Arabe",
    languageFrench: "Français",
    languageGerman: "Allemand",
    roleEmployee: "Employé",
    roleManager: "Manager",
    roleCompanyOwner: "Propriétaire de l’entreprise",
    rolePlatformOwner: "Propriétaire de la plateforme",
    fallbackWorkspaceName: "Espace de travail VAR HR",
    errorTitle: "Une erreur est survenue",
    errorDetail:
      "Cette partie de l’application a rencontré une erreur. Le reste de l’application fonctionne toujours.",
    tryAgain: "Réessayer",
    authNotConnected:
      "L’authentification n’est pas connectée. Les données restent liées à l’espace API actif.",
    retry: "Réessayer",
    closeDialog: "Fermer la boîte de dialogue",
    operationalFeedLoadFailed: "Le flux opérationnel n’a pas pu être chargé.",
    checkWorkspace:
      "Vérifiez la connexion à l’espace de travail puis réessayez.",
    notAvailable: "Indisponible",
    statusActive: "Actif",
    statusInactive: "Inactif",
    statusLocked: "Verrouillé",
    statusConnected: "Connecté",
    statusApproved: "Approuvé",
    statusPresent: "Présent",
    statusLate: "En retard",
    statusCalculated: "Calculé",
    statusFinalized: "Finalisé",
    statusConfigured: "Configuré",
    statusCompleted: "Terminé",
    statusAttention: "Attention",
    statusPending: "En attente",
    statusTrial: "Essai",
    statusDraft: "Brouillon",
    statusSyncing: "Synchronisation",
    statusIncomplete: "Incomplet",
    statusRejected: "Refusé",
    statusOffline: "Hors ligne",
    statusSuspended: "Suspendu",
    statusPastDue: "Impayé",
    statusAbsent: "Absent",
    statusOutsideGeofence: "Hors périmètre",
    statusNotConfigured: "Non configuré",
    statusAdapterPending: "Adaptateur en attente",
    statusUnavailable: "Indisponible",
    statusCancelled: "Annulé",
    statusOnLeave: "En congé",
    statusHoliday: "Jour férié",
    severityInfo: "Info",
    severityWarning: "Avertissement",
    severityCritical: "Critique",
    present: "Présent",
    late: "En retard",
    absent: "Absent",
  },
  de: {
    overview: "Übersicht",
    employees: "Mitarbeitende",
    attendance: "Anwesenheit",
    requests: "Anfragen",
    rules: "Regeln",
    reports: "Berichte",
    payroll: "Lohnabrechnung",
    devices: "Geräte",
    syncHistory: "Synchronisationsverlauf",
    backupRestore: "Sicherung und Wiederherstellung",
    subscription: "Abonnement",
    platformOwner: "Plattforminhaber",
    companyNavOverview: "Übersicht",
    companyNavAccount: "Mein Konto",
    companyNavBranches: "Standorte",
    companyNavDepartments: "Abteilungen",
    companyNavSchedules: "Schichtorganisation",
    companyNavRules: "Anwesenheitsregeln",
    companyNavEmployees: "Mitarbeitende",
    companyNavRequests: "Anfragen",
    companyNavReports: "Berichte",
    companyNavPayroll: "Lohnabrechnung",
    companyNavHolidays: "Feiertage",
    companyNavDevices: "Geräte",
    companyNavSyncHistory: "Synchronisationsverlauf",
    companyNavBackup: "Sicherung",
    companyNavAccountManagement: "Kontoverwaltung",
    companyNavSubscription: "Abonnement",
    workspace: "Arbeitsbereich",
    departmentOperations: "Operations",
    departmentPeopleCulture: "People & Culture",
    branchAlexandriaHub: "Standort Alexandria",
    branchCairoHq: "Hauptsitz Kairo",
    cityAlexandria: "Alexandria",
    cityCairo: "Kairo",
    planBusiness: "Business",
    deviceCairoEntranceReader: "Lesegerät am Eingang Kairo",
    manufacturerGenericBiometricReader: "Generisches biometrisches Lesegerät",
    modelAdapterPending: "Adapter steht aus",
    account: "Konto",
    operationsDesk: "Operationsbereich",
    activeWorkspace: "Aktiver Arbeitsbereich",
    support: "Support",
    language: "Sprache",
    openNavigation: "Navigation öffnen",
    closeNavigation: "Navigation schließen",
    languageEnglish: "Englisch",
    languageArabic: "Arabisch",
    languageFrench: "Französisch",
    languageGerman: "Deutsch",
    roleEmployee: "Mitarbeitender",
    roleManager: "Manager",
    roleCompanyOwner: "Unternehmensinhaber",
    rolePlatformOwner: "Plattforminhaber",
    fallbackWorkspaceName: "VAR HR-Arbeitsbereich",
    errorTitle: "Ein Fehler ist aufgetreten",
    errorDetail:
      "In diesem Teil der Anwendung ist ein Fehler aufgetreten. Der Rest der Anwendung läuft weiter.",
    tryAgain: "Erneut versuchen",
    authNotConnected:
      "Die Authentifizierung ist nicht verbunden. Daten bleiben auf den aktiven API-Arbeitsbereich begrenzt.",
    retry: "Erneut versuchen",
    closeDialog: "Dialog schließen",
    operationalFeedLoadFailed:
      "Der operative Feed konnte nicht geladen werden.",
    checkWorkspace:
      "Prüfen Sie die Arbeitsbereichsverbindung und versuchen Sie es erneut.",
    notAvailable: "Nicht verfügbar",
    statusActive: "Aktiv",
    statusInactive: "Inaktiv",
    statusLocked: "Gesperrt",
    statusConnected: "Verbunden",
    statusApproved: "Genehmigt",
    statusPresent: "Anwesend",
    statusLate: "Verspätet",
    statusCalculated: "Berechnet",
    statusFinalized: "Finalisiert",
    statusConfigured: "Konfiguriert",
    statusCompleted: "Abgeschlossen",
    statusAttention: "Achtung",
    statusPending: "Ausstehend",
    statusTrial: "Testphase",
    statusDraft: "Entwurf",
    statusSyncing: "Synchronisierung",
    statusIncomplete: "Unvollständig",
    statusRejected: "Abgelehnt",
    statusOffline: "Offline",
    statusSuspended: "Gesperrt",
    statusPastDue: "Überfällig",
    statusAbsent: "Abwesend",
    statusOutsideGeofence: "Außerhalb des Bereichs",
    statusNotConfigured: "Nicht konfiguriert",
    statusAdapterPending: "Adapter steht aus",
    statusUnavailable: "Nicht verfügbar",
    statusCancelled: "Abgebrochen",
    statusOnLeave: "Im Urlaub",
    statusHoliday: "Feiertag",
    severityInfo: "Info",
    severityWarning: "Warnung",
    severityCritical: "Kritisch",
    present: "Anwesend",
    late: "Verspätet",
    absent: "Abwesend",
  },
} as const;

const pageCopy = {
  en: {
    employeesEyebrow: "Workforce registry",
    employeesTitle: "Employees",
    employeesDetail:
      "Search, review, and maintain the people behind the operating picture.",
    searchEmployees: "Search by name or number",
    allStatuses: "All statuses",
    active: "Active",
    inactive: "Inactive",
    addEmployee: "Add employee",
    employeeFormDetail:
      "Create a complete employee record with the essentials your team needs.",
    employeeIdentitySection: "Identity & contact",
    employeeIdentityDetail:
      "Keep personal and device identifiers together for confident attendance operations.",
    employeeName: "Employee name",
    employeeNameHint: "Enter the employee’s full name.",
    nationalId: "National ID",
    nationalIdHint: "Use the official identity number for this employee.",
    phoneNumber: "Phone number",
    biometricCode: "Biometric / fingerprint code",
    biometricCodeHint:
      "The employee code or number used to identify them on the fingerprint device.",
    employeeEmploymentSection: "Employment details",
    employeeEmploymentDetail:
      "Set the working terms that will guide attendance and payroll calculations.",
    workingHours: "Working hours",
    workingHoursHint: "Hours per working day.",
    employmentStartDate: "Employment start date",
    employeePlacementSection: "Workplace placement",
    employeePlacementDetail:
      "Connect the employee to the right department, branch, and shift.",
    shift: "Shift",
    noShifts: "No shifts available",
    shiftsLoadFailed: "Shifts could not be loaded.",
    selectShiftHint: "Select an existing shift for this employee.",
    salaryHint: "Monthly amount in the company currency.",
    noEmployeesMatch: "No employees match this view",
    adjustEmployeeSearch:
      "Adjust the search or add the first employee to this tenant.",
    selectOption: "Select",
    loading: "Loading…",
    createDepartmentPrompt: "Department name",
    departmentNameHint:
      "This name is stored exactly as entered and is not translated.",
    createBranchPrompt: "Branch name",
    branchCityPrompt: "Branch city",
    employeeStatusUpdated: "Employee status updated",
    employeeAdded: "Employee added to the workspace",
    couldNotCreateEmployee: "Could not create employee",
    departmentCreated: "Department created",
    branchCreated: "Branch created",
    save: "Save",
    saving: "Saving…",
    createEmployee: "Create employee",
    employeeProfile: "Employee profile",
    employeeNumber: "Employee number",
    salary: "Salary",
    markInactive: "Mark inactive",
    reactivateEmployee: "Reactivate employee",
    currentEmployeeContext: "Current employee context",
    noEmployeeContext: "No employee context",
    identifyEmployee: "The API will identify the signed-in employee.",
    scheduledStart: "Scheduled start",
    checkInNow: "Check in now",
    checkOutNow: "Check out now",
    webEventPolicy: "Web event · location policy is evaluated by the API",
    today: "Today",
    history: "History",
    todayRegister: "Today’s register",
    loadingOperationalDate: "Loading operational date",
    noAttendanceRecords: "No attendance records yet",
    attendanceWillAppear: "When the day starts, events will appear here.",
    noHistory: "No history found",
    historyWillAppear:
      "Attendance history will populate once events are recorded.",
    companyAttendanceView: "Company attendance view",
    attendanceFilters: "Filter attendance history",
    filterFrom: "From date",
    filterTo: "To date",
    allEmployees: "All employees",
    clearFilters: "Clear filters",
    missing: "Missing",
    correctAttendance: "Correct attendance",
    correctionReason: "Correction reason",
    correctionReasonPlaceholder: "Explain the correction for the audit trail",
    saveCorrection: "Save correction",
    attendanceCorrectionUpdated: "Attendance correction saved",
    attendanceCorrectionFailed: "Could not save attendance correction",
    checkInRecorded: "Check-in recorded",
    checkOutRecorded: "Check-out recorded",
    attendanceNotAccepted: "Attendance event was not accepted",
    decisionQueue: "Decision queue",
    requestsTitle: "Requests",
    requestsDetail:
      "Approve with context. Every decision stays attached to the request.",
    newRequest: "New request",
    leaveBalances: "Leave balances",
    daysRemaining: "days remaining",
    allocatedDays: "Allocated days",
    usedDays: "Used days",
    queueHygiene: "Queue hygiene",
    pendingDecisions: "pending decisions across both request types",
    leave: "Leave",
    permission: "Permission",
    records: "records",
    queueClear: "The decision queue is clear",
    requestsAppear: "New leave and permission requests will appear here.",
    createRequest: "Create request",
    requestSubmitted: "Request submitted",
    couldNotSubmitRequest: "Could not submit request",
    requestApproved: "Request approved",
    requestRejected: "Request rejected",
    decisionReason: "Decision reason",
    decisionReasonPlaceholder: "Add context for this decision",
    confirmDecision: "Confirm decision",
    decisionReasonRequired: "A rejection reason is required.",
    approve: "Approve",
    reject: "Reject",
    newKindRequest: "New {kind} request",
    type: "Type",
    reason: "Reason",
    from: "From",
    to: "To",
    start: "Start",
    end: "End",
    submitRequest: "Submit request",
    annualLeave: "Annual leave",
    sickLeave: "Sick leave",
    shortAbsence: "Short absence",
    lateArrival: "Late arrival",
    earlyDeparture: "Early departure",
    remoteWork: "Remote work",
    personalErrand: "Personal errand",
    reviewedQueue: "Reviewed in operations queue",
    notApproved: "Not approved at this time",
    policyControl: "Policy control",
    attendanceRulesTitle: "Attendance rules",
    attendanceRulesDetail:
      "Current company settings for time, overtime, leave balance, and location verification.",
    workStarts: "Work starts",
    workEnds: "Work ends",
    gracePeriod: "Grace period (minutes)",
    lateArrivalGrace: "Late arrival grace period (minutes)",
    earlyDepartureGrace: "Early departure grace period (minutes)",
    overtimeStartsAfter: "Overtime starts after (minutes)",
    overtimeAfter: "Overtime after (minutes)",
    locationVerification: "Location verification",
    gpsPolicy: "GPS policy",
    disabled: "Disabled",
    optional: "Optional",
    required: "Required",
    locationRadius: "Location radius (meters)",
    explainability: "Explainability by default",
    attendanceExceptionsNote:
      "Attendance exceptions record their source, location posture, and a human-readable explanation for review.",
    saveAttendancePolicy: "Save attendance policy",
    savingPolicy: "Saving policy…",
    attendancePolicyUpdated: "Attendance policy updated",
    attendanceRulesChangeHistory: "Attendance rules change history",
    attendanceRulesChangeHistoryDetail:
      "Review who changed each attendance rule, what changed, and when it takes effect.",
    attendanceRulesHistoryField: "Field",
    attendanceRulesHistoryPreviousValue: "Previous value",
    attendanceRulesHistoryNewValue: "New value",
    attendanceRulesHistoryEffectiveFrom: "Applies from",
    attendanceRulesHistoryActorReason: "Actor / reason",
    noAttendanceRulesHistory: "No saved changes yet.",
    historyOvertimeMethod: "Overtime method",
    historyOvertimeMultiplier: "Overtime multiplier",
    historyHourlyRateDivisor: "Hourly rate divisor",
    historyLateDeductionMethod: "Late deduction method",
    historyLateDeductionFactor: "Late deduction factor",
    historyEarlyCheckoutDeductionFactor: "Early checkout deduction factor",
    historyAbsenceDeductionMethod: "Absence deduction method",
    historyAbsenceDeductionFactor: "Absence deduction factor",
    historyHolidayDates: "Holiday dates",
    historyHolidayPeriods: "Holiday periods",
    historyWeeklyMultipliers: "Weekly multipliers",
    historyAnnualLeaveAllowedMonths: "Annual leave balance months",
    historyLatePenaltyMultiplier: "Late penalty multiplier",
    historyEarlyDeparturePenaltyMultiplier: "Early departure penalty multiplier",
    historyAbsencePenaltyMultiplier: "Absence penalty multiplier",
    historyPermissionCoveredMinutesMultiplier:
      "Permission-covered minutes multiplier",
    historyFullDayPermissionMultiplier: "Full-day permission multiplier",
    historyAbsenceLeaveDeductionTrigger: "Absence deduction trigger",
    historyAbsenceLeaveDeductionDays: "Leave days per absence",
    historyAbsenceDeductsAnnualLeave: "Deduct annual leave for absence",
    historyValueMultiplier: "Multiplier",
    historyValueHourlyRate: "Hourly rate",
    historyValueDailyRate: "Daily rate",
    historyValueStandard: "Standard",
    attendanceThresholdsTitle: "Attendance and overtime thresholds",
    attendanceThresholdsDetail:
      "Set the policy tolerances before late arrival, early departure, or overtime is recorded.",
    weeklyHolidayRulesTitle: "Specific day multipliers",
    weeklyHolidayRulesDetail:
      "Configure weekly-day and holiday multipliers. When rules overlap, only the highest applicable multiplier is applied.",
    addWeeklyMultiplier: "Add weekly multiplier",
    addHolidayMultiplier: "Add holiday multiplier",
    holidayPeriodName: "Holiday name",
    holidayPeriodFrom: "Start date",
    holidayPeriodTo: "End date",
    holidayPeriodMultiplier: "Extra-pay multiplier",
    noHolidayMultipliers: "No holiday multipliers configured.",
    attendancePenaltiesTitle: "Attendance penalties & permissions",
    attendancePenaltiesDetail:
      "Set late, early-departure, and absence multipliers, including approved permission coverage.",
    annualLeaveSettings: "Annual leave system",
    annualLeaveSettingsDetail:
      "These current settings are used by annual balances, attendance, permissions, payroll, and self-service.",
    annualLeaveBalances: "Annual leave balances",
    annualEntitlementDays: "Annual entitlement (days)",
    leaveYearStartsIn: "Leave year starts in",
    absenceDeductionWhen: "When should absence deduct leave?",
    unapprovedAbsencesOnly: "Unapproved absences only",
    anyAbsenceMissing: "Any absence or missing attendance",
    leaveDaysPerAbsence: "Leave days deducted per absence",
    deductAnnualLeaveForUnapproved:
      "Deduct an annual-leave day for an unapproved absence",
    absenceDeductionDetail:
      "Off by default; absences never silently consume annual leave.",
    policyEnabled: "Policy enabled",
    accrualFrequency: "Accrual frequency",
    deductionMode: "Deduction mode",
    automatic: "Automatic",
    manual: "Manual",
    carryForwardDays: "Carry-forward days",
    carryForwardExpiry: "Carry-forward expiry (months)",
    monthlyMaximumDeduction: "Monthly maximum deduction",
    balanceDeductionMonths: "Balance deduction months",
    selectMultipleMonths: "Hold Ctrl/Cmd to select multiple months.",
    allowCarryForward: "Allow carry-forward",
    allowNegativeBalance: "Allow negative balance",
    leaveControls: "Leave controls",
    policiesBalanceLedger: "Policies & balance ledger",
    policies: "Policies",
    ledger: "Ledger",
    absenceMultiplier: "Absence multiplier",
    lateArrivalMultiplier: "Late arrival multiplier",
    earlyDepartureMultiplier: "Early departure multiplier",
    permissionCoveredMinutes: "Permission-covered minutes",
    fullDayPermission: "Full-day permission",
    permissionCoversLate: "Permission covers late arrival",
    permissionCoversEarly: "Permission covers early departure",
    evidenceAnalysis: "Evidence & analysis",
    attendanceReportsTitle: "Attendance reports",
    reportsDetail:
      "Preview the selected period before exporting through your connected workflow.",
    refreshPreview: "Refresh preview",
    previewReport: "Preview report",
    chooseReportingWindow: "Choose a reporting window",
    setDatesAbove: "Set the dates above to preview attendance evidence.",
    overtimeHours: "Overtime hours",
    employeeDetail: "Employee detail",
    generalPayroll: "General payroll operations",
    payrollTitle: "Payroll",
    payrollDetail:
      "Explainable calculation history using configured workforce inputs. This is not statutory tax advice.",
    periods: "Periods",
    selectPeriod: "Select a period to inspect or recalculate.",
    noPayrollPeriods: "No payroll periods",
    periodsFromApi: "Periods are supplied by the operational API.",
    calculationHistory: "Calculation history",
    explainable: "Explainable",
    calculatedOn: "Calculated",
    calculationExplanation: "Calculation explanation",
    calculate: "Calculate",
    calculating: "Calculating…",
    selectPeriodToCalculate:
      "Choose Calculate to create an explainable calculation preview.",
    payrollReady: "Payroll calculation ready",
    calculationFailed: "Calculation could not be completed",
    payrollFoundationExplanation:
      "This general payroll foundation intentionally excludes country-specific tax, insurance, and statutory calculations.",
    basic: "Basic",
    additions: "Additions",
    netSalary: "Net salary",
    createPeriod: "Create period",
    periodLabel: "Period label",
    startDate: "Start date",
    endDate: "End date",
    createPayrollPeriod: "Create payroll period",
    periodCreated: "Payroll period created",
    periodCreateFailed: "Could not create payroll period",
    periodDateRangeInvalid: "The end date must be after the start date.",
    viewPeriod: "View period",
    deletePeriod: "Delete period",
    deletePeriodConfirmation:
      "Delete this payroll period? Its calculations and adjustments will also be deleted.",
    finalize: "Finalize",
    finalized: "Finalized",
    finalizePayroll: "Finalize payroll",
    payrollFinalized: "Payroll period finalized",
    finalizeFailed: "Could not finalize payroll",
    mustCalculateFirst: "Calculate the period before finalizing it.",
    employeeCount: "Employees",
    employeeDetails: "Employee payroll details",
    details: "Details",
    closeDetails: "Close details",
    regularHours: "Regular hours",
    lateMinutes: "Late minutes",
    earlyCheckoutMinutes: "Early checkout minutes",
    minutes: "minutes",
    missingHours: "Missing hours",
    absentDays: "Absent days",
    attendanceDeductions: "Attendance deductions",
    otherDeductions: "Other deductions",
    lineItems: "Calculation breakdown",
    noLineItems: "No calculation lines",
    selectEmployee: "Select an employee to inspect the calculation.",
    adjustments: "Adjustments",
    adjustment: "Adjustment",
    addAdjustment: "Add adjustment",
    adjustmentType: "Adjustment type",
    addition: "Addition",
    deduction: "Deduction",
    category: "Category",
    fixed: "Fixed",
    variable: "Variable",
    amount: "Amount",
    employeeTarget: "Employee",
    selectEmployeeForAdjustment: "Select an employee",
    adjustmentCreated: "Adjustment added",
    adjustmentCreateFailed: "Could not add adjustment",
    adjustmentDeleted: "Adjustment removed",
    adjustmentDeleteFailed: "Could not remove adjustment",
    remove: "Remove",
    noAdjustments: "No adjustments for this period",
    recalculateAfterAdjustment:
      "The payroll total is recalculated automatically after an adjustment.",
    connectedOperations: "Connected operations",
    biometricDevices: "Biometric devices",
    devicesDetail:
      "Configuration is visible here; adapter availability is reported honestly.",
    addDevice: "Add device",
    deviceAdded: "Device configuration added",
    deviceAddFailed: "Could not add device",
    noDevices: "No biometric devices configured",
    addDeviceNote: "Add a device to make its adapter state visible.",
    addConfiguration: "Add configuration",
    sync: "Sync",
    syncRequested: "Sync requested",
    syncUnavailable: "Sync request unavailable",
    addBiometricDevice: "Add biometric device",
    deviceName: "Device name",
    manufacturer: "Manufacturer",
    model: "Model",
    selectBranch: "Select branch",
    planCapacity: "Plan & capacity",
    subscriptionTitle: "Subscription",
    subscriptionDetail: "Usage and entitlements for the active workspace.",
    currentPlan: "Current plan",
    activeEmployees: "Active employees",
    seatsRemaining: "seats remaining",
    includedCapabilities: "Included capabilities",
    planChanges:
      "Plan changes are managed through your account team. No billing action is simulated here.",
    overtime: "Overtime",
    adapterPendingNote: "Connector adapter is not configured yet.",
    hardwareConnectorNote:
      "Hardware connector is not configured. No attendance sync is being simulated.",
    lastSync: "Last sync",
    never: "Never",
    alertBiometricTitle: "Biometric connector pending",
    alertBiometricDetail:
      "Device sync is unavailable until a manufacturer adapter is configured.",
    alertPlanTitle: "Plan usage is approaching its limit",
    alertPlanDetail:
      "Review active employee usage before your next onboarding batch.",
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
    featureGpsAttendance: "GPS attendance",
    featurePayrollFoundation: "Payroll foundation",
    featureAdvancedReports: "Advanced reports",
    separateAdmin: "Separate administration surface",
    platformTitle: "Platform owner",
    platformDetail:
      "Cross-tenant visibility for platform operations. Company actions are intentionally read-only in this surface.",
    platformScope: "Platform scope",
    noCompanies: "No companies in platform scope",
    noTenants: "The platform API returned no tenants for this workspace.",
    company: "Company",
    plan: "Plan",
    seats: "Seats",
    lastActivity: "Last activity",
    cancel: "Cancel",
    closeDialog: "Close dialog",
  },
  ar: {
    employeesEyebrow: "سجل القوى العاملة",
    employeesTitle: "الموظفون",
    employeesDetail: "ابحث عن فريق العمل وراجعه وأدره بوضوح.",
    searchEmployees: "البحث بالاسم أو الرقم",
    allStatuses: "كل الحالات",
    active: "نشط",
    inactive: "غير نشط",
    addEmployee: "إضافة موظف",
    employeeFormDetail:
      "أنشئ سجلاً متكاملاً للموظف بالبيانات الأساسية التي يحتاجها فريقك.",
    employeeIdentitySection: "الهوية وبيانات التواصل",
    employeeIdentityDetail:
      "اجمع بيانات الهوية ومعرّف الجهاز لدعم عمليات الحضور بثقة.",
    employeeName: "اسم الموظف",
    employeeNameHint: "أدخل اسم الموظف بالكامل.",
    nationalId: "الرقم القومي",
    nationalIdHint: "استخدم رقم الهوية الرسمي لهذا الموظف.",
    phoneNumber: "رقم الهاتف",
    biometricCode: "كود البصمة / المعرّف الحيوي",
    biometricCodeHint:
      "الكود أو الرقم المستخدم للتعرّف على الموظف في جهاز البصمة.",
    employeeEmploymentSection: "بيانات التوظيف",
    employeeEmploymentDetail:
      "حدد شروط العمل التي ستوجّه حسابات الحضور والرواتب.",
    workingHours: "ساعات العمل",
    workingHoursHint: "عدد الساعات في يوم العمل.",
    employmentStartDate: "تاريخ بدء العمل",
    employeePlacementSection: "التوزيع الوظيفي",
    employeePlacementDetail:
      "اربط الموظف بالقسم والفرع والشيفت المناسب.",
    shift: "الشيفت",
    noShifts: "لا توجد شيفتات متاحة",
    shiftsLoadFailed: "تعذر تحميل الشيفتات.",
    selectShiftHint: "اختر شيفتاً موجوداً لهذا الموظف.",
    salaryHint: "المبلغ الشهري بعملة الشركة.",
    noEmployeesMatch: "لا يوجد موظفون يطابقون هذا العرض",
    adjustEmployeeSearch: "عدّل البحث أو أضف أول موظف إلى مساحة العمل.",
    selectOption: "اختر",
    loading: "جارٍ التحميل…",
    createDepartmentPrompt: "اسم القسم",
    departmentNameHint:
      "يُحفظ هذا الاسم كما تم إدخاله تمامًا ولا تتم ترجمته.",
    createBranchPrompt: "اسم الفرع",
    branchCityPrompt: "مدينة الفرع",
    employeeStatusUpdated: "تم تحديث حالة الموظف",
    employeeAdded: "تمت إضافة الموظف إلى مساحة العمل",
    couldNotCreateEmployee: "تعذر إنشاء الموظف",
    departmentCreated: "تم إنشاء القسم",
    branchCreated: "تم إنشاء الفرع",
    save: "حفظ",
    saving: "جارٍ الحفظ…",
    createEmployee: "إنشاء موظف",
    employeeProfile: "ملف الموظف",
    hrProfile: "ملفي الوظيفي",
    hrProfileDetail:
      "راجع معلومات الموظف وسجل الموارد البشرية المتاح لهوية مساحة العمل المسجلة.",
    hrRecord: "سجل الموارد البشرية",
    jobTitle: "المسمى الوظيفي",
    employmentType: "نوع التوظيف",
    manager: "المدير",
    address: "العنوان",
    emergencyContactName: "جهة اتصال الطوارئ",
    emergencyContactPhone: "هاتف الطوارئ",
    notes: "ملاحظات الموارد البشرية",
    hrRecordNotFound: "لم يتم إنشاء سجل موارد بشرية لهذا الموظف بعد.",
    hrRecordUnauthorized: "ليس لديك صلاحية لعرض سجل الموارد البشرية هذا.",
    hrRecordLoadFailed: "تعذر تحميل سجل الموارد البشرية.",
    hrRecordCreateHint: "أكمل الحقول أدناه لإنشاء سجل الموارد البشرية للموظف.",
    saveHrRecord: "حفظ سجل الموارد البشرية",
    hrRecordSaved: "تم حفظ سجل الموارد البشرية",
    hrRecordSaveFailed: "تعذر حفظ سجل الموارد البشرية",
    employeeProfileLoadFailed: "تعذر تحميل ملف الموظف.",
    ownProfileOnly: "يمكن للموظف عرض ملفه الوظيفي فقط.",
    noEmployeeContextDetail: "لم تربط مساحة العمل هوية موظف بهذه الجلسة بعد.",
    employeeNumber: "رقم الموظف",
    salary: "الراتب",
    markInactive: "تعيين كغير نشط",
    reactivateEmployee: "إعادة تفعيل الموظف",
    currentEmployeeContext: "سياق الموظف الحالي",
    noEmployeeContext: "لا يوجد سياق موظف",
    identifyEmployee: "ستحدد واجهة API الموظف الذي سجّل الدخول.",
    scheduledStart: "بداية الدوام المجدولة",
    checkInNow: "تسجيل الحضور الآن",
    checkOutNow: "تسجيل الانصراف الآن",
    webEventPolicy: "حدث ويب · يقيّم API سياسة الموقع",
    today: "اليوم",
    todayRegister: "سجل اليوم",
    loadingOperationalDate: "جارٍ تحميل تاريخ التشغيل",
    noAttendanceRecords: "لا توجد سجلات حضور بعد",
    attendanceWillAppear: "ستظهر الأحداث هنا عند بدء اليوم.",
    noHistory: "لا يوجد سجل",
    historyWillAppear: "سيظهر سجل الحضور بعد تسجيل الأحداث.",
    companyAttendanceView: "عرض حضور الشركة",
    attendanceFilters: "تصفية سجل الحضور",
    filterFrom: "من تاريخ",
    filterTo: "إلى تاريخ",
    allEmployees: "كل الموظفين",
    clearFilters: "مسح عوامل التصفية",
    missing: "مفقود",
    correctAttendance: "تصحيح الحضور",
    correctionReason: "سبب التصحيح",
    correctionReasonPlaceholder: "اشرح التصحيح لسجل التدقيق",
    saveCorrection: "حفظ التصحيح",
    attendanceCorrectionUpdated: "تم حفظ تصحيح الحضور",
    attendanceCorrectionFailed: "تعذر حفظ تصحيح الحضور",
    checkInRecorded: "تم تسجيل الحضور",
    checkOutRecorded: "تم تسجيل الانصراف",
    attendanceNotAccepted: "لم يتم قبول حدث الحضور",
    decisionQueue: "قائمة القرارات",
    requestsTitle: "الطلبات",
    requestsDetail: "اتخذ القرار مع السياق واحتفظ به مرتبطاً بالطلب.",
    newRequest: "طلب جديد",
    leaveBalances: "أرصدة الإجازات",
    daysRemaining: "أيام متبقية",
    allocatedDays: "الأيام المخصصة",
    usedDays: "الأيام المستخدمة",
    queueHygiene: "حالة قائمة الانتظار",
    pendingDecisions: "قرارات معلقة من نوعي الطلبات",
    leave: "إجازة",
    permission: "استئذان",
    records: "سجلات",
    queueClear: "قائمة القرارات فارغة",
    requestsAppear: "ستظهر طلبات الإجازة والاستئذان الجديدة هنا.",
    createRequest: "إنشاء طلب",
    requestSubmitted: "تم إرسال الطلب",
    couldNotSubmitRequest: "تعذر إرسال الطلب",
    requestApproved: "تمت الموافقة على الطلب",
    requestRejected: "تم رفض الطلب",
    decisionReason: "سبب القرار",
    decisionReasonPlaceholder: "أضف سياقاً لهذا القرار",
    confirmDecision: "تأكيد القرار",
    decisionReasonRequired: "سبب الرفض مطلوب.",
    approve: "موافقة",
    reject: "رفض",
    newKindRequest: "طلب {kind} جديد",
    type: "النوع",
    reason: "السبب",
    from: "من",
    to: "إلى",
    start: "البداية",
    end: "النهاية",
    submitRequest: "إرسال الطلب",
    annualLeave: "إجازة سنوية",
    sickLeave: "إجازة مرضية",
    shortAbsence: "غياب قصير",
    lateArrival: "وصول متأخر",
    earlyDeparture: "انصراف مبكر",
    remoteWork: "عمل عن بُعد",
    personalErrand: "شأن شخصي",
    reviewedQueue: "تمت مراجعته في قائمة العمليات",
    notApproved: "لم تتم الموافقة في الوقت الحالي",
    policyControl: "التحكم في السياسة",
    attendanceRulesTitle: "قواعد الحضور",
    attendanceRulesDetail:
      "إعدادات الشركة الحالية للدوام والعمل الإضافي والرصيد السنوي والتحقق من الموقع.",
    workStarts: "بداية العمل",
    workEnds: "نهاية العمل",
    gracePeriod: "فترة السماح (بالدقائق)",
    lateArrivalGrace: "فترة السماح للوصول المتأخر (بالدقائق)",
    earlyDepartureGrace: "فترة السماح للانصراف المبكر (بالدقائق)",
    overtimeStartsAfter: "يبدأ العمل الإضافي بعد (بالدقائق)",
    overtimeAfter: "العمل الإضافي بعد (بالدقائق)",
    locationVerification: "التحقق من الموقع",
    gpsPolicy: "سياسة GPS",
    disabled: "معطل",
    optional: "اختياري",
    required: "مطلوب",
    locationRadius: "نطاق الموقع (بالمتر)",
    explainability: "قابلية التفسير افتراضياً",
    attendanceExceptionsNote:
      "تسجل استثناءات الحضور مصدرها وحالة الموقع وشرحاً واضحاً للمراجعة.",
    saveAttendancePolicy: "حفظ سياسة الحضور",
    savingPolicy: "جارٍ حفظ السياسة…",
    attendancePolicyUpdated: "تم تحديث سياسة الحضور",
    attendanceRulesChangeHistory: "سجل تغييرات قواعد الحضور",
    attendanceRulesChangeHistoryDetail:
      "راجع من غيّر كل قاعدة حضور، وما الذي تغيّر، ومتى يبدأ تطبيقه.",
    attendanceRulesHistoryField: "الحقل",
    attendanceRulesHistoryPreviousValue: "القيمة السابقة",
    attendanceRulesHistoryNewValue: "القيمة الجديدة",
    attendanceRulesHistoryEffectiveFrom: "يطبق من",
    attendanceRulesHistoryActorReason: "المنفذ / السبب",
    noAttendanceRulesHistory: "لا توجد تغييرات محفوظة بعد.",
    historyOvertimeMethod: "طريقة العمل الإضافي",
    historyOvertimeMultiplier: "مضاعف العمل الإضافي",
    historyHourlyRateDivisor: "مقسّم أجر الساعة",
    historyLateDeductionMethod: "طريقة خصم التأخير",
    historyLateDeductionFactor: "معامل خصم التأخير",
    historyEarlyCheckoutDeductionFactor: "معامل خصم الانصراف المبكر",
    historyAbsenceDeductionMethod: "طريقة خصم الغياب",
    historyAbsenceDeductionFactor: "معامل خصم الغياب",
    historyHolidayDates: "تواريخ العطلات",
    historyHolidayPeriods: "فترات العطلات",
    historyWeeklyMultipliers: "المضاعفات الأسبوعية",
    historyAnnualLeaveAllowedMonths: "أشهر خصم الرصيد السنوي",
    historyLatePenaltyMultiplier: "مضاعف جزاء التأخير",
    historyEarlyDeparturePenaltyMultiplier: "مضاعف جزاء الانصراف المبكر",
    historyAbsencePenaltyMultiplier: "مضاعف جزاء الغياب",
    historyPermissionCoveredMinutesMultiplier:
      "مضاعف دقائق الإذن المغطاة",
    historyFullDayPermissionMultiplier: "مضاعف الإذن ليوم كامل",
    historyAbsenceLeaveDeductionTrigger: "مسبب خصم الغياب",
    historyAbsenceLeaveDeductionDays: "أيام الإجازة لكل غياب",
    historyAbsenceDeductsAnnualLeave: "خصم الإجازة السنوية بسبب الغياب",
    historyValueMultiplier: "مضاعف",
    historyValueHourlyRate: "أجر الساعة",
    historyValueDailyRate: "الأجر اليومي",
    historyValueStandard: "قياسي",
    attendanceThresholdsTitle: "حدود الحضور والعمل الإضافي",
    attendanceThresholdsDetail:
      "حدد فترات السماح التي تطبقها سياسة الحضور قبل تسجيل التأخير أو الانصراف المبكر أو العمل الإضافي.",
    weeklyHolidayRulesTitle: "مضاعفات يوم معين",
    weeklyHolidayRulesDetail:
      "حدد مضاعفات أيام الأسبوع والعطلات. عند تداخل القواعد يطبق أعلى مضاعف فقط.",
    addWeeklyMultiplier: "إضافة مضاعف أسبوعي",
    addHolidayMultiplier: "إضافة مضاعف عطلة",
    holidayPeriodName: "اسم العطلة",
    holidayPeriodFrom: "تاريخ البداية",
    holidayPeriodTo: "تاريخ النهاية",
    holidayPeriodMultiplier: "مضاعف الأجر الإضافي",
    noHolidayMultipliers: "لا توجد مضاعفات عطلات معدة.",
    attendancePenaltiesTitle: "جزاءات الحضور والإذن",
    attendancePenaltiesDetail:
      "حدد مضاعفات التأخير والانصراف والغياب، وكيفية احتساب الدقائق المغطاة بإذن معتمد.",
    annualLeaveSettings: "نظام الرصيد السنوي",
    annualLeaveSettingsDetail:
      "تستخدم هذه الإعدادات الحالية في الرصيد السنوي والحضور والإذن والرواتب والخدمة الذاتية.",
    annualLeaveBalances: "أرصدة الإجازة السنوية",
    annualEntitlementDays: "أيام الإجازة السنوية",
    leaveYearStartsIn: "بداية سنة الإجازة",
    absenceDeductionWhen: "متى يخصم الغياب من الإجازة؟",
    unapprovedAbsencesOnly: "الغياب غير المعتمد فقط",
    anyAbsenceMissing: "كل غياب أو عدم تسجيل حضور",
    leaveDaysPerAbsence: "أيام الخصم لكل غياب",
    deductAnnualLeaveForUnapproved:
      "خصم يوم غياب من رصيد الإجازة السنوية",
    absenceDeductionDetail:
      "مغلق افتراضياً؛ لن يخصم الغياب من الإجازة السنوية دون تفعيل صريح.",
    policyEnabled: "السياسة مفعلة",
    accrualFrequency: "وتيرة الاستحقاق",
    deductionMode: "طريقة الخصم",
    automatic: "تلقائي",
    manual: "يدوي",
    carryForwardDays: "أيام الترحيل",
    carryForwardExpiry: "انتهاء الترحيل (بالأشهر)",
    monthlyMaximumDeduction: "الحد الأقصى للخصم الشهري",
    balanceDeductionMonths: "أشهر خصم الرصيد",
    selectMultipleMonths: "اضغط Ctrl/Cmd لاختيار عدة أشهر.",
    allowCarryForward: "السماح بترحيل الرصيد",
    allowNegativeBalance: "السماح برصيد سالب",
    leaveControls: "إعدادات الإجازات",
    policiesBalanceLedger: "السياسات وسجل الرصيد",
    policies: "السياسات",
    ledger: "السجل",
    absenceMultiplier: "مضاعف الغياب",
    lateArrivalMultiplier: "مضاعف التأخير",
    earlyDepartureMultiplier: "مضاعف الانصراف المبكر",
    permissionCoveredMinutes: "دقائق الإذن المغطاة",
    fullDayPermission: "إذن ليوم كامل",
    permissionCoversLate: "الإذن يغطي التأخير",
    permissionCoversEarly: "الإذن يغطي الانصراف المبكر",
    evidenceAnalysis: "الأدلة والتحليل",
    attendanceReportsTitle: "تقارير الحضور",
    reportsDetail: "عاين الفترة المحددة قبل التصدير عبر سير العمل المتصل.",
    setDatesAbove: "حدد التواريخ أعلاه لمعاينة بيانات الحضور.",
    overtimeHours: "ساعات إضافية",
    employeeDetail: "تفاصيل الموظف",
    generalPayroll: "عمليات الرواتب العامة",
    payrollTitle: "الرواتب",
    payrollDetail:
      "سجل حسابات قابل للتفسير باستخدام مدخلات القوى العاملة. لا يمثل استشارة ضريبية نظامية.",
    periods: "الفترات",
    selectPeriod: "اختر فترة لفحصها أو إعادة حسابها.",
    noPayrollPeriods: "لا توجد فترات رواتب",
    periodsFromApi: "يتم توفير الفترات من واجهة العمليات.",
    calculationHistory: "سجل الحساب",
    explainable: "قابل للتفسير",
    calculatedOn: "تم الحساب في",
    calculationExplanation: "شرح الحساب",
    calculate: "حساب",
    calculating: "جارٍ الحساب…",
    selectPeriodToCalculate: "اختر حساباً لإنشاء معاينة حساب قابلة للتفسير.",
    payrollReady: "حساب الرواتب جاهز",
    calculationFailed: "تعذر إكمال الحساب",
    payrollFoundationExplanation:
      "تستبعد قاعدة الرواتب العامة هذه الضرائب والتأمين والحسابات النظامية الخاصة بكل دولة.",
    basic: "الأساسي",
    additions: "الإضافات",
    netSalary: "صافي الراتب",
    createPeriod: "إنشاء فترة",
    periodLabel: "اسم الفترة",
    startDate: "تاريخ البداية",
    endDate: "تاريخ النهاية",
    createPayrollPeriod: "إنشاء فترة رواتب",
    periodCreated: "تم إنشاء فترة الرواتب",
    periodCreateFailed: "تعذر إنشاء فترة الرواتب",
    periodDateRangeInvalid: "يجب أن يكون تاريخ النهاية بعد تاريخ البداية.",
    viewPeriod: "عرض الفترة",
    deletePeriod: "حذف الفترة",
    deletePeriodConfirmation:
      "هل تريد حذف فترة الرواتب؟ سيتم حذف الحسابات والتعديلات الخاصة بها أيضاً.",
    finalize: "اعتماد نهائي",
    finalized: "معتمد نهائياً",
    finalizePayroll: "اعتماد فترة الرواتب نهائياً",
    payrollFinalized: "تم اعتماد فترة الرواتب نهائياً",
    finalizeFailed: "تعذر اعتماد الرواتب نهائياً",
    mustCalculateFirst: "احسب الفترة قبل اعتمادها نهائياً.",
    employeeCount: "الموظفون",
    employeeDetails: "تفاصيل رواتب الموظف",
    details: "التفاصيل",
    closeDetails: "إغلاق التفاصيل",
    regularHours: "الساعات العادية",
    lateMinutes: "دقائق التأخير",
    earlyCheckoutMinutes: "دقائق الانصراف المبكر",
    missingHours: "الساعات المفقودة",
    absentDays: "أيام الغياب",
    attendanceDeductions: "خصومات الحضور",
    otherDeductions: "خصومات أخرى",
    lineItems: "تفصيل الحساب",
    noLineItems: "لا توجد بنود حساب",
    selectEmployee: "اختر موظفاً لفحص الحساب.",
    adjustments: "التعديلات",
    adjustment: "تعديل",
    addAdjustment: "إضافة تعديل",
    adjustmentType: "نوع التعديل",
    addition: "إضافة",
    deduction: "خصم",
    category: "الفئة",
    fixed: "ثابت",
    variable: "متغير",
    amount: "المبلغ",
    employeeTarget: "الموظف",
    selectEmployeeForAdjustment: "اختر موظفاً",
    adjustmentCreated: "تمت إضافة التعديل",
    adjustmentCreateFailed: "تعذر إضافة التعديل",
    adjustmentDeleted: "تمت إزالة التعديل",
    adjustmentDeleteFailed: "تعذر إزالة التعديل",
    remove: "إزالة",
    noAdjustments: "لا توجد تعديلات لهذه الفترة",
    recalculateAfterAdjustment:
      "سيُعاد حساب إجمالي الرواتب تلقائياً بعد إضافة التعديل أو حذفه.",
    connectedOperations: "العمليات المتصلة",
    biometricDevices: "أجهزة البصمة",
    devicesDetail: "يظهر الإعداد هنا وتُعرض حالة الموصل بصدق.",
    addDevice: "إضافة جهاز",
    deviceAdded: "تمت إضافة إعداد الجهاز",
    deviceAddFailed: "تعذر إضافة الجهاز",
    noDevices: "لا توجد أجهزة بصمة مُعدة",
    addDeviceNote: "أضف جهازاً لعرض حالة الموصل.",
    addConfiguration: "إضافة إعداد",
    sync: "مزامنة",
    syncRequested: "تم طلب المزامنة",
    syncUnavailable: "طلب المزامنة غير متاح",
    addBiometricDevice: "إضافة جهاز بصمة",
    selectBranch: "اختر الفرع",
    planCapacity: "الخطة والسعة",
    subscriptionTitle: "الاشتراك",
    subscriptionDetail: "الاستخدام والاستحقاقات لمساحة العمل النشطة.",
    currentPlan: "الخطة الحالية",
    activeEmployees: "الموظفون النشطون",
    seatsRemaining: "مقاعد متبقية",
    includedCapabilities: "الإمكانات المشمولة",
    planChanges:
      "تُدار تغييرات الخطة عبر فريق حسابك. لا تتم محاكاة أي إجراء فوترة هنا.",
    overtime: "العمل الإضافي",
    adapterPendingNote: "لم يتم إعداد موصل الجهاز بعد.",
    hardwareConnectorNote:
      "لم يتم إعداد موصل الأجهزة. لا تتم محاكاة مزامنة الحضور.",
    lastSync: "آخر مزامنة",
    never: "لم تتم بعد",
    alertBiometricTitle: "موصل البصمة قيد الانتظار",
    alertBiometricDetail:
      "المزامنة غير متاحة حتى يتم إعداد موصل الشركة المصنعة.",
    alertPlanTitle: "استخدام الخطة يقترب من الحد",
    alertPlanDetail: "راجع استخدام الموظفين النشطين قبل دفعة التعيين التالية.",
    monday: "الاثنين",
    tuesday: "الثلاثاء",
    wednesday: "الأربعاء",
    thursday: "الخميس",
    friday: "الجمعة",
    saturday: "السبت",
    sunday: "الأحد",
    featureGpsAttendance: "حضور عبر GPS",
    featurePayrollFoundation: "قاعدة الرواتب",
    featureAdvancedReports: "تقارير متقدمة",
    separateAdmin: "سطح إدارة منفصل",
    platformTitle: "مالك المنصة",
    platformDetail:
      "رؤية عبر مساحات العمل لعمليات المنصة. إجراءات الشركات للقراءة فقط هنا.",
    platformScope: "نطاق المنصة",
    noCompanies: "لا توجد شركات في نطاق المنصة",
    noTenants: "لم تُعد واجهة المنصة أي مستأجرين لمساحة العمل هذه.",
    company: "الشركة",
    plan: "الخطة",
    seats: "المقاعد",
    lastActivity: "آخر نشاط",
    cancel: "إلغاء",
    closeDialog: "إغلاق النافذة",
    workforceRegistry: "سجل القوى العاملة",
    searchReviewMaintainPeople:
      "ابحث عن الأشخاص الذين يدعمون العمليات وراجعهم وأدر بياناتهم.",
    searchByNameNumberEmail: "البحث بالاسم أو الرقم",
    adjustSearchOrAddFirstEmployee:
      "عدّل البحث أو أضف أول موظف إلى مساحة العمل.",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    monthlySalary: "الراتب الشهري",
    select: "اختر",
    departmentName: "اسم القسم",
    createDepartment: "إنشاء قسم",
    branchName: "اسم الفرع",
    createBranch: "إنشاء فرع",
    branchCity: "مدينة الفرع",
    noBranches: "لا توجد فروع بعد",
    gpsEnabled: "تم تفعيل الحضور عبر GPS",
    employeeAddedToWorkspace: "تمت إضافة الموظف إلى مساحة العمل",
    apiWillIdentifySignedInEmployee: "ستحدد واجهة API الموظف الذي سجّل الدخول.",
    webEventLocationPolicy: "حدث ويب · تقيّم واجهة API سياسة الموقع",
    noAttendanceRecordsYet: "لا توجد سجلات حضور بعد",
    whenDayStartsEventsAppearHere: "ستظهر الأحداث هنا عند بدء اليوم.",
    attendanceHistoryWillPopulate: "سيظهر سجل الحضور بعد تسجيل الأحداث.",
    newLeaveAndPermissionRequestsWillAppearHere:
      "ستظهر طلبات الإجازة والاستئذان الجديدة هنا.",
    pendingDecisionsAcrossBothRequestTypes: "قرارات معلقة من نوعي الطلبات",
    theDecisionQueueIsClear: "قائمة القرارات فارغة",
    notApprovedAtThisTime: "لم تتم الموافقة في الوقت الحالي",
    reviewedInOperationsQueue: "تمت مراجعته في قائمة العمليات",
    gracePeriodMinutes: "فترة السماح (بالدقائق)",
    overtimeAfterMinutes: "العمل الإضافي بعد (بالدقائق)",
    locationRadiusMeters: "نطاق الموقع (بالمتر)",
    explainabilityByDefault: "قابلية التفسير افتراضياً",
    attendanceExceptionsRecorded:
      "تسجل استثناءات الحضور مصدرها وحالة الموقع وشرحاً واضحاً للمراجعة.",
    attendanceReports: "تقارير الحضور",
    previewSelectedPeriod:
      "عاين الفترة المحددة قبل التصدير عبر سير العمل المتصل.",
    refreshPreview: "تحديث المعاينة",
    previewReport: "معاينة التقرير",
    chooseReportingWindow: "اختر نطاق التقرير",
    setDatesAbovePreview: "حدد التواريخ أعلاه لمعاينة أدلة الحضور.",
    generalPayrollOperations: "عمليات الرواتب العامة",
    explainableCalculationHistory:
      "سجل حسابات قابل للتفسير باستخدام مدخلات القوى العاملة المُعدة. هذه ليست استشارة ضريبية نظامية.",
    selectAPeriodToInspectOrRecalculate: "اختر فترة لفحصها أو إعادة حسابها.",
    periodsSuppliedByApi: "توفر واجهة API الفترات التشغيلية.",
    calculated: "تم الحساب",
    calculationCouldNotBeCompleted: "تعذر إكمال الحساب",
    payrollCalculationReady: "حساب الرواتب جاهز",
    selectPeriodToCreatePreview: "اختر حساب لإنشاء معاينة حساب قابلة للتفسير.",
    couldNotAddDevice: "تعذر إضافة الجهاز",
    deviceConfigurationAdded: "تمت إضافة إعداد الجهاز",
    noBiometricDevicesConfigured: "لا توجد أجهزة بصمة مُعدة",
    addDeviceToMakeAdapterStateVisible: "أضف جهازاً لعرض حالة موصله.",
    deviceName: "اسم الجهاز",
    manufacturer: "الشركة المصنعة",
    model: "الطراز",
    branchSelect: "الفرع",
    configurationVisibleAdapterHonest:
      "يظهر الإعداد هنا، وتُعرض حالة الموصل بوضوح.",
    syncRequestUnavailable: "طلب المزامنة غير متاح",
    usageAndEntitlements: "الاستخدام والاستحقاقات لمساحة العمل النشطة.",
    planChangesManaged:
      "تُدار تغييرات الخطة عبر فريق حسابك. لا تتم محاكاة أي إجراء فوترة هنا.",
    separateAdministrationSurface: "سطح إدارة منفصل",
    crossTenantVisibility:
      "رؤية عبر مساحات العمل لعمليات المنصة. إجراءات الشركات للقراءة فقط هنا.",
    noCompaniesInPlatformScope: "لا توجد شركات في نطاق المنصة",
    platformApiReturnedNoTenants:
      "لم تُعد واجهة المنصة أي مستأجرين لمساحة العمل هذه.",
    branchesDepartmentsDevicesConnected:
      "{branches} فروع · {departments} أقسام · {connected}/{total} أجهزة متصلة",
    presencePercent: "{percent}% حضور",
    lateAbsent: "{late} متأخر · {absent} غائب",
    accountManagement: "إدارة الحسابات",
    databaseAdministration: "إدارة قاعدة البيانات",
    accountSettings: "إعدادات الحساب",
    platformOwnerOnly: "للمالك فقط",
    databaseAdminDetail:
      "وصول طارئ مضبوط إلى بيانات التطبيق الآمنة. يتم استبعاد أسرار المصادقة وملفات النسخ الاحتياطية.",
    databaseEntity: "كيان البيانات",
    databaseCoreOrganization: "الهيكل الأساسي",
    databaseSchedulingAttendance: "الجدولة والحضور",
    databaseLeavePayrollSupport: "الإجازات والرواتب ودعم المنصة",
    dataExplorer: "مستكشف البيانات",
    companyContext: "سياق الشركة",
    allCompanies: "كل الشركات",
    filterRecords: "تصفية السجلات",
    searchValues: "ابحث في القيم",
    refresh: "تحديث",
    emergencyDestructiveOperations: "عمليات طارئة مدمرة",
    deleteSelected: "حذف المحدد",
    deleteRecord: "حذف السجل",
    clearEntityData: "تنظيف البيانات المصفاة/الكيان",
    actions: "الإجراءات",
    viewDetails: "عرض التفاصيل",
    history: "السجل",
    archive: "أرشفة",
    recordDetails: "تفاصيل السجل",
    supportEdit: "تعديل الدعم",
    supportEditHint:
      "يمكن تعديل الحقول التشغيلية المعتمدة فقط. ملكية الشركة وحقول المصادقة مقفلة.",
    databaseEditHint:
      "يمكن تعديل الحقول المسموح بها لهذا النوع فقط. المعرّفات وملكية الشركة وحقول المصادقة مقفلة.",
    inspectionOnly:
      "وصول دعم لمالك المنصة — حذف السجلات نهائي ويتم تسجيله في سجل التدقيق.",
    beforeValue: "القيمة قبل التغيير",
    afterValue: "القيمة بعد التغيير",
    changedFields: "الحقول التي تغيرت",
    noHistoryFound: "لا يوجد سجل",
    noHistoryDetail: "لا توجد تغييرات مسجلة لهذا السجل بعد.",
    unknownCompany: "شركة غير معروفة",
    archiveConfirmation: "هل تريد أرشفة هذا السجل؟",
    deleteRecordConfirmation:
      "هل تريد حذف هذا السجل نهائياً؟ لا يمكن التراجع عن هذا الإجراء.",
    recordDeleted: "تم حذف السجل بنجاح.",
    recordCouldNotBeDeleted: "تعذر حذف هذا السجل.",
    couldNotSaveSupportedChanges: "تعذر حفظ التغييرات المدعومة.",
    recordCouldNotBeArchived: "تعذر أرشفة هذا السجل.",
    couldNotLoadRecordHistory: "تعذر تحميل سجل التغييرات.",
    databaseCompanies: "الشركات",
    databaseActiveCompanies: "الشركات النشطة",
    databaseVisibleRecords: "السجلات الظاهرة",
    databaseUsers: "المستخدمون والحسابات",
    databaseEmployees: "الموظفون",
    databaseDepartments: "الأقسام",
    databaseBranches: "الفروع",
    databaseShifts: "جداول العمل",
    databaseShiftAssignments: "ربط الموظفين بالجداول",
    databaseAttendanceRules: "قواعد الحضور",
    databaseAttendanceCalculations: "حسابات الحضور",
    databaseAttendance: "الحضور",
    databaseHolidays: "العطلات",
    databaseLeaveRequests: "طلبات الإجازات",
    databasePermissionRequests: "طلبات الأذونات",
    databasePayrollPeriods: "فترات الرواتب",
    databasePayrollCalculations: "حسابات الرواتب",
    databaseDevices: "الأجهزة",
    databaseSubscriptions: "الاشتراكات",
    databasePermissions: "الصلاحيات",
    databaseAuditLogs: "سجلات التدقيق",
    databaseBackups: "النسخ الاحتياطية",
    databaseId: "المعرّف",
    databaseCompanyId: "معرّف الشركة",
    databaseCompanyName: "اسم الشركة",
    databaseName: "الاسم",
    databaseArabicName: "الاسم بالعربية",
    databaseDescription: "الوصف",
    databaseManager: "المدير",
    databaseDefaultSchedule: "جدول العمل الافتراضي",
    databaseCreatedAt: "تاريخ الإنشاء",
    databaseUpdatedAt: "تاريخ التحديث",
    databaseEmployeeNumber: "الرقم الوظيفي",
    databaseFirstName: "الاسم الأول",
    databaseLastName: "اسم العائلة",
    databaseEmail: "البريد الإلكتروني",
    databasePhone: "الهاتف",
    databaseDepartment: "القسم",
    databaseBranch: "الفرع",
    databaseStatus: "الحالة",
    databaseRole: "الدور",
    databaseJoinedOn: "تاريخ الانضمام",
    databaseCity: "المدينة",
    databaseGpsEnabled: "تفعيل GPS",
    databaseLatitude: "خط العرض",
    databaseLongitude: "خط الطول",
    databaseRadiusMeters: "النطاق (بالمتر)",
    databaseAction: "الإجراء",
    databaseActor: "المنفّذ",
    databaseActorRole: "دور المنفّذ",
    databaseSystem: "النظام",
    databasePlatformOwner: "مالك المنصة",
    databaseUnknownAction: "إجراء مسجل",
    databaseDataField: "حقل بيانات",
    databaseRolePlatformOwner: "مالك المنصة",
    databaseYes: "نعم",
    databaseNo: "لا",
    databaseStatusActive: "نشط",
    databaseStatusInactive: "غير نشط",
    databaseStatusArchived: "مؤرشف",
    databaseStatusPending: "معلّق",
    databaseStatusFinalized: "نهائي",
    databaseStatusDraft: "مسودة",
    databaseStatusConnected: "متصل",
    databaseStatusDisconnected: "غير متصل",
    databaseActionCreated: "إنشاء",
    databaseActionUpdated: "تحديث",
    databaseActionSupport_updated: "تحديث دعم",
    databaseActionArchived: "أرشفة",
    databaseActionDatabase_view: "عرض",
    databaseActionDatabase_export: "تصدير",
    databaseActionDatabase_support_updated: "تحديث دعم",
    databaseActionDatabase_deleted: "حذف",
    edit: "تعديل",
    noRecordsFound: "لا توجد سجلات",
    tryAnotherEntityOrFilter: "جرّب كياناً أو تصفية أخرى.",
    editRecord: "تعديل السجل",
    saveChanges: "حفظ التغييرات",
    loadingData: "جارٍ تحميل البيانات…",
    couldNotLoadDatabaseEntities: "تعذر تحميل كيانات قاعدة البيانات.",
    couldNotLoadData: "تعذر تحميل البيانات.",
    couldNotSaveRecord: "تعذر حفظ السجل.",
    deleteFailed: "فشل الحذف. قد تمنع العلاقات حذف هذا السجل.",
    clearFailed: "فشل تنظيف البيانات.",
    exportFailed: "فشل التصدير.",
    deleteRecordsConfirmation:
      "سيتم حذف {count} سجل نهائياً. اكتب {phrase} للمتابعة.",
    clearEntityConfirmation:
      "سيحذف هذا الإجراء الطارئ كل السجلات المطابقة. اكتب {phrase} للمتابعة.",
    accountSettingsDetail: "حدّث حساب مالك المنصة المصادق عليه حالياً فقط.",
    fullName: "الاسم الكامل",
    phoneLoginUsername: "رقم الهاتف / اسم تسجيل الدخول",
    changePassword: "تغيير كلمة المرور",
    passwordChangeHint:
      "أدخل كلمة المرور الحالية لتعيين كلمة مرور جديدة (6 أحرف على الأقل).",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    saveAccountSettings: "حفظ إعدادات الحساب",
    accountSettingsUpdated: "تم تحديث إعدادات الحساب.",
    couldNotUpdateAccountSettings: "تعذر تحديث إعدادات الحساب.",
  },
  fr: {
    employeesEyebrow: "Registre des effectifs",
    employeesTitle: "Employés",
    employeesDetail:
      "Recherchez, examinez et gérez les personnes qui font fonctionner l’activité.",
    searchEmployees: "Rechercher par nom ou numéro",
    allStatuses: "Tous les statuts",
    active: "Actif",
    inactive: "Inactif",
    addEmployee: "Ajouter un employé",
    employeeFormDetail:
      "Créez un dossier employé complet avec les informations essentielles pour votre équipe.",
    employeeIdentitySection: "Identité et contact",
    employeeIdentityDetail:
      "Regroupez les identifiants personnels et appareil pour fiabiliser le suivi des présences.",
    employeeName: "Nom de l’employé",
    employeeNameHint: "Saisissez le nom complet de l’employé.",
    nationalId: "Identifiant national",
    nationalIdHint:
      "Utilisez le numéro officiel d’identité de cet employé.",
    phoneNumber: "Numéro de téléphone",
    biometricCode: "Code biométrique / empreinte",
    biometricCodeHint:
      "Le code ou numéro utilisé pour identifier l’employé sur le terminal d’empreinte.",
    employeeEmploymentSection: "Détails de l’emploi",
    employeeEmploymentDetail:
      "Définissez les conditions qui guideront les calculs de présence et de paie.",
    workingHours: "Heures de travail",
    workingHoursHint: "Heures par jour travaillé.",
    employmentStartDate: "Date de début d’emploi",
    employeePlacementSection: "Affectation professionnelle",
    employeePlacementDetail:
      "Rattachez l’employé au bon département, à l’agence et à l’équipe.",
    shift: "Équipe",
    noShifts: "Aucune équipe disponible",
    shiftsLoadFailed: "Les équipes n’ont pas pu être chargées.",
    selectShiftHint: "Sélectionnez une équipe existante pour cet employé.",
    salaryHint: "Montant mensuel dans la devise de l’entreprise.",
    noEmployeesMatch: "Aucun employé ne correspond à cette vue",
    adjustEmployeeSearch:
      "Modifiez la recherche ou ajoutez le premier employé à cet espace.",
    selectOption: "Sélectionner",
    loading: "Chargement…",
    createDepartmentPrompt: "Nom du département",
    departmentNameHint:
      "Ce nom est enregistré exactement tel qu’il est saisi et n’est pas traduit.",
    createBranchPrompt: "Nom de l’agence",
    branchCityPrompt: "Ville de l’agence",
    employeeStatusUpdated: "Statut de l’employé mis à jour",
    employeeAdded: "Employé ajouté à l’espace de travail",
    couldNotCreateEmployee: "Impossible de créer l’employé",
    departmentCreated: "Département créé",
    branchCreated: "Agence créée",
    employeeSaved: "Employé enregistré",
    save: "Enregistrer",
    saving: "Enregistrement…",
    createEmployee: "Créer l’employé",
    employeeProfile: "Profil de l’employé",
    employeeNumber: "Numéro d’employé",
    employeeNumberEditHint:
      "Vous pouvez modifier ce numéro. La connexion, l’historique, la paie et les liens biométriques restent liés à cet employé.",
    basicSalary: "Salaire de base",
    deleteSuccessful: "Suppression réussie",
    activateDepartment: "Activer le département",
    deactivateDepartment: "Désactiver le département",
    salary: "Salaire",
    markInactive: "Désactiver",
    reactivateEmployee: "Réactiver l’employé",
    currentEmployeeContext: "Contexte de l’employé actuel",
    noEmployeeContext: "Aucun contexte employé",
    identifyEmployee: "L’API identifiera l’employé connecté.",
    scheduledStart: "Début planifié",
    checkInNow: "Pointer maintenant",
    checkOutNow: "Sortir maintenant",
    webEventPolicy:
      "Événement web · la politique de localisation est évaluée par l’API",
    today: "Aujourd’hui",
    history: "Historique",
    todayRegister: "Registre du jour",
    loadingOperationalDate: "Chargement de la date opérationnelle",
    noAttendanceRecords: "Aucun enregistrement de présence",
    attendanceWillAppear:
      "Les événements apparaîtront ici au début de la journée.",
    noHistory: "Aucun historique",
    historyWillAppear:
      "L’historique apparaîtra une fois les événements enregistrés.",
    companyAttendanceView: "Vue de présence de l’entreprise",
    attendanceFilters: "Filtrer l’historique",
    filterFrom: "Date de début",
    filterTo: "Date de fin",
    allEmployees: "Tous les employés",
    clearFilters: "Effacer les filtres",
    missing: "Manquant",
    correctAttendance: "Corriger la présence",
    correctionReason: "Motif de correction",
    correctionReasonPlaceholder: "Expliquez la correction pour l’audit",
    saveCorrection: "Enregistrer la correction",
    attendanceCorrectionUpdated: "Correction de présence enregistrée",
    attendanceCorrectionFailed: "Impossible d’enregistrer la correction",
    checkInRecorded: "Pointage d’arrivée enregistré",
    checkOutRecorded: "Pointage de sortie enregistré",
    attendanceNotAccepted: "L’événement de présence a été refusé",
    decisionQueue: "File de décision",
    requestsTitle: "Demandes",
    requestsDetail:
      "Décidez avec le contexte ; chaque décision reste liée à la demande.",
    newRequest: "Nouvelle demande",
    leaveBalances: "Soldes de congés",
    daysRemaining: "jours restants",
    allocatedDays: "Jours alloués",
    usedDays: "Jours utilisés",
    queueHygiene: "État de la file",
    pendingDecisions: "décisions en attente pour les deux types de demandes",
    leave: "Congé",
    permission: "Autorisation",
    records: "enregistrements",
    queueClear: "La file de décision est vide",
    requestsAppear:
      "Les nouvelles demandes de congé et d’autorisation apparaîtront ici.",
    createRequest: "Créer une demande",
    requestSubmitted: "Demande envoyée",
    couldNotSubmitRequest: "Impossible d’envoyer la demande",
    requestApproved: "Demande approuvée",
    requestRejected: "Demande refusée",
    decisionReason: "Motif de décision",
    decisionReasonPlaceholder: "Ajoutez le contexte de cette décision",
    confirmDecision: "Confirmer la décision",
    decisionReasonRequired: "Un motif de refus est requis.",
    approve: "Approuver",
    reject: "Refuser",
    newKindRequest: "Nouvelle demande de {kind}",
    type: "Type",
    reason: "Motif",
    from: "Du",
    to: "Au",
    start: "Début",
    end: "Fin",
    submitRequest: "Envoyer la demande",
    annualLeave: "Congé annuel",
    sickLeave: "Congé maladie",
    shortAbsence: "Absence courte",
    lateArrival: "Arrivée tardive",
    earlyDeparture: "Départ anticipé",
    remoteWork: "Travail à distance",
    personalErrand: "Affaire personnelle",
    reviewedQueue: "Examinée dans la file des opérations",
    notApproved: "Non approuvée pour le moment",
    policyControl: "Contrôle de la politique",
    attendanceRulesTitle: "Règles de présence",
    attendanceRulesDetail:
      "Paramètres actuels de l’entreprise pour les horaires, les heures supplémentaires, le solde annuel et la localisation.",
    weeklyHolidayRulesTitle: "Multiplicateurs d’un jour précis",
    weeklyHolidayRulesDetail:
      "Configurez les multiplicateurs des jours de la semaine et des jours fériés. En cas de chevauchement, seul le multiplicateur le plus élevé s’applique.",
    addWeeklyMultiplier: "Ajouter un multiplicateur hebdomadaire",
    addHolidayMultiplier: "Ajouter un multiplicateur de jour férié",
    holidayPeriodName: "Nom du jour férié",
    holidayPeriodFrom: "Date de début",
    holidayPeriodTo: "Date de fin",
    holidayPeriodMultiplier: "Multiplicateur de rémunération supplémentaire",
    noHolidayMultipliers: "Aucun multiplicateur de jour férié configuré.",
    workStarts: "Début du travail",
    workEnds: "Fin du travail",
    gracePeriod: "Délai de grâce (minutes)",
    lateArrivalGrace: "Délai de grâce pour arrivée tardive (minutes)",
    earlyDepartureGrace: "Délai de grâce pour départ anticipé (minutes)",
    overtimeStartsAfter: "Les heures supplémentaires commencent après (minutes)",
    overtimeAfter: "Heures supplémentaires après (minutes)",
    locationVerification: "Vérification de localisation",
    gpsPolicy: "Politique GPS",
    disabled: "Désactivé",
    optional: "Facultatif",
    required: "Obligatoire",
    locationRadius: "Rayon de localisation (mètres)",
    explainability: "Explicabilité par défaut",
    attendanceExceptionsNote:
      "Les exceptions de présence enregistrent leur source, la situation de localisation et une explication lisible.",
    saveAttendancePolicy: "Enregistrer la politique",
    savingPolicy: "Enregistrement de la politique…",
    attendancePolicyUpdated: "Politique de présence mise à jour",
    attendancePolicyRecalculateHint:
      "Règle enregistrée. Recalculez toute période de paie non finalisée pour appliquer la modification.",
    attendanceRulesChangeHistory: "Historique des modifications des règles de présence",
    attendanceRulesChangeHistoryDetail:
      "Consultez l’auteur, les changements et leur date d’application pour chaque règle.",
    attendanceRulesHistoryField: "Champ",
    attendanceRulesHistoryPreviousValue: "Valeur précédente",
    attendanceRulesHistoryNewValue: "Nouvelle valeur",
    attendanceRulesHistoryEffectiveFrom: "S’applique à partir du",
    attendanceRulesHistoryActorReason: "Auteur / motif",
    noAttendanceRulesHistory: "Aucune modification enregistrée pour le moment.",
    historyOvertimeMethod: "Méthode des heures supplémentaires",
    historyOvertimeMultiplier: "Multiplicateur des heures supplémentaires",
    historyHourlyRateDivisor: "Diviseur du taux horaire",
    historyLateDeductionMethod: "Méthode de déduction du retard",
    historyLateDeductionFactor: "Facteur de déduction du retard",
    historyEarlyCheckoutDeductionFactor:
      "Facteur de déduction du départ anticipé",
    historyAbsenceDeductionMethod: "Méthode de déduction de l’absence",
    historyAbsenceDeductionFactor: "Facteur de déduction de l’absence",
    historyHolidayDates: "Dates des jours fériés",
    historyHolidayPeriods: "Périodes de jours fériés",
    historyWeeklyMultipliers: "Multiplicateurs hebdomadaires",
    historyAnnualLeaveAllowedMonths:
      "Mois de déduction du solde annuel",
    historyLatePenaltyMultiplier: "Multiplicateur de pénalité de retard",
    historyEarlyDeparturePenaltyMultiplier:
      "Multiplicateur de pénalité de départ anticipé",
    historyAbsencePenaltyMultiplier:
      "Multiplicateur de pénalité d’absence",
    historyPermissionCoveredMinutesMultiplier:
      "Multiplicateur des minutes couvertes par l’autorisation",
    historyFullDayPermissionMultiplier:
      "Multiplicateur de l’autorisation d’une journée complète",
    historyAbsenceLeaveDeductionTrigger:
      "Déclencheur de déduction pour absence",
    historyAbsenceLeaveDeductionDays:
      "Jours de congé par absence",
    historyAbsenceDeductsAnnualLeave:
      "Déduire le congé annuel pour absence",
    historyValueMultiplier: "Multiplicateur",
    historyValueHourlyRate: "Taux horaire",
    historyValueDailyRate: "Taux journalier",
    historyValueStandard: "Standard",
    evidenceAnalysis: "Preuves et analyse",
    attendanceReportsTitle: "Rapports de présence",
    reportsDetail:
      "Prévisualisez la période avant l’export via votre flux connecté.",
    refreshPreview: "Actualiser l’aperçu",
    previewReport: "Prévisualiser le rapport",
    chooseReportingWindow: "Choisir une période",
    setDatesAbove:
      "Définissez les dates ci-dessus pour prévisualiser les données.",
    overtimeHours: "Heures supplémentaires",
    employeeDetail: "Détail de l’employé",
    generalPayroll: "Opérations générales de paie",
    payrollTitle: "Paie",
    payrollDetail:
      "Historique de calcul explicable basé sur les données configurées. Ceci ne constitue pas un conseil fiscal.",
    periods: "Périodes",
    selectPeriod: "Sélectionnez une période à examiner ou recalculer.",
    noPayrollPeriods: "Aucune période de paie",
    periodsFromApi: "Les périodes sont fournies par l’API opérationnelle.",
    calculationHistory: "Historique des calculs",
    explainable: "Explicable",
    calculatedOn: "Calculé le",
    calculationExplanation: "Explication du calcul",
    calculate: "Calculer",
    recalculatePayroll: "Recalculer",
    calculating: "Calcul…",
    selectPeriodToCalculate:
      "Choisissez Calculer pour créer un aperçu explicable.",
    payrollReady: "Calcul de paie prêt",
    calculationFailed: "Le calcul n’a pas pu aboutir",
    payrollFoundationExplanation:
      "Cette base de paie générale exclut les calculs fiscaux, d’assurance et réglementaires propres à chaque pays.",
    basic: "Base",
    additions: "Compléments",
    netSalary: "Salaire net",
    createPeriod: "Créer une période",
    periodLabel: "Libellé de période",
    startDate: "Date de début",
    endDate: "Date de fin",
    createPayrollPeriod: "Créer une période de paie",
    periodCreated: "Période de paie créée",
    periodCreateFailed: "Impossible de créer la période de paie",
    periodDateRangeInvalid:
      "La date de fin doit être postérieure à la date de début.",
    viewPeriod: "Voir la période",
    deletePeriod: "Supprimer la période",
    deletePeriodConfirmation:
      "Supprimer cette période de paie ? Ses calculs et ajustements seront également supprimés.",
    finalize: "Finaliser",
    finalized: "Finalisée",
    finalizePayroll: "Finaliser la période de paie",
    payrollFinalized: "Période de paie finalisée",
    finalizeFailed: "Impossible de finaliser la paie",
    mustCalculateFirst: "Calculez la période avant de la finaliser.",
    employeeCount: "Employés",
    employeeDetails: "Détail de paie de l’employé",
    details: "Détails",
    closeDetails: "Fermer les détails",
    regularHours: "Heures normales",
    lateMinutes: "Minutes de retard",
    earlyCheckoutMinutes: "Minutes de départ anticipé",
    missingHours: "Heures manquantes",
    absentDays: "Jours d’absence",
    attendanceDeductions: "Retenues de présence",
    otherDeductions: "Autres retenues",
    lineItems: "Détail du calcul",
    noLineItems: "Aucune ligne de calcul",
    selectEmployee: "Sélectionnez un employé pour examiner le calcul.",
    adjustments: "Ajustements",
    adjustment: "Ajustement",
    addAdjustment: "Ajouter un ajustement",
    adjustmentType: "Type d’ajustement",
    addition: "Complément",
    deduction: "Retenue",
    category: "Catégorie",
    fixed: "Fixe",
    variable: "Variable",
    amount: "Montant",
    employeeTarget: "Employé",
    selectEmployeeForAdjustment: "Sélectionner un employé",
    adjustmentCreated: "Ajustement ajouté",
    adjustmentCreateFailed: "Impossible d’ajouter l’ajustement",
    adjustmentDeleted: "Ajustement supprimé",
    adjustmentDeleteFailed: "Impossible de supprimer l’ajustement",
    remove: "Supprimer",
    noAdjustments: "Aucun ajustement pour cette période",
    recalculateAfterAdjustment:
      "Le total de la paie est recalculé automatiquement après un ajustement.",
    connectedOperations: "Opérations connectées",
    biometricDevices: "Appareils biométriques",
    devicesDetail:
      "La configuration est visible ; la disponibilité du connecteur est présentée honnêtement.",
    addDevice: "Ajouter un appareil",
    deviceAdded: "Configuration de l’appareil ajoutée",
    deviceAddFailed: "Impossible d’ajouter l’appareil",
    noDevices: "Aucun appareil biométrique configuré",
    addDeviceNote: "Ajoutez un appareil pour afficher son état de connecteur.",
    addConfiguration: "Ajouter la configuration",
    sync: "Synchroniser",
    syncRequested: "Synchronisation demandée",
    syncUnavailable: "Synchronisation indisponible",
    addBiometricDevice: "Ajouter un appareil biométrique",
    deviceName: "Nom de l’appareil",
    manufacturer: "Fabricant",
    model: "Modèle",
    selectBranch: "Sélectionner une agence",
    planCapacity: "Plan et capacité",
    subscriptionTitle: "Abonnement",
    subscriptionDetail: "Utilisation et droits de l’espace de travail actif.",
    currentPlan: "Plan actuel",
    activeEmployees: "Employés actifs",
    seatsRemaining: "places restantes",
    includedCapabilities: "Fonctionnalités incluses",
    planChanges:
      "Les changements de plan sont gérés par votre équipe de compte. Aucune facturation n’est simulée ici.",
    overtime: "Heures supplémentaires",
    adapterPendingNote:
      "Le connecteur de l’appareil n’est pas encore configuré.",
    hardwareConnectorNote:
      "Le connecteur matériel n’est pas configuré. Aucune synchronisation de présence n’est simulée.",
    lastSync: "Dernière synchronisation",
    never: "Jamais",
    alertBiometricTitle: "Connecteur biométrique en attente",
    alertBiometricDetail:
      "La synchronisation est indisponible tant qu’un adaptateur fabricant n’est pas configuré.",
    alertPlanTitle: "La consommation du plan approche sa limite",
    alertPlanDetail:
      "Vérifiez l’utilisation des employés actifs avant votre prochaine vague d’intégration.",
    monday: "Lun",
    tuesday: "Mar",
    wednesday: "Mer",
    thursday: "Jeu",
    friday: "Ven",
    saturday: "Sam",
    sunday: "Dim",
    featureGpsAttendance: "Présence GPS",
    featurePayrollFoundation: "Base de paie",
    featureAdvancedReports: "Rapports avancés",
    separateAdmin: "Surface d’administration séparée",
    platformTitle: "Propriétaire de la plateforme",
    platformDetail:
      "Visibilité inter-espaces pour les opérations de plateforme. Les actions sur les entreprises sont en lecture seule.",
    platformScope: "Périmètre plateforme",
    noCompanies: "Aucune entreprise dans le périmètre",
    noTenants: "L’API plateforme n’a renvoyé aucun espace pour ce contexte.",
    company: "Entreprise",
    plan: "Plan",
    seats: "Places",
    lastActivity: "Dernière activité",
    cancel: "Annuler",
    closeDialog: "Fermer la boîte de dialogue",
  },
  de: {
    employeesEyebrow: "Personalverzeichnis",
    employeesTitle: "Mitarbeitende",
    employeesDetail:
      "Suchen, prüfen und verwalten Sie die Menschen hinter dem operativen Überblick.",
    searchEmployees: "Nach Name oder Nummer suchen",
    allStatuses: "Alle Status",
    active: "Aktiv",
    inactive: "Inaktiv",
    addEmployee: "Mitarbeitenden hinzufügen",
    employeeFormDetail:
      "Erstellen Sie einen vollständigen Mitarbeitendensatz mit den wichtigsten Angaben für Ihr Team.",
    employeeIdentitySection: "Identität und Kontakt",
    employeeIdentityDetail:
      "Bündeln Sie persönliche und Gerätekennungen für eine verlässliche Anwesenheitsverwaltung.",
    employeeName: "Name des Mitarbeitenden",
    employeeNameHint: "Geben Sie den vollständigen Namen ein.",
    nationalId: "Nationale ID",
    nationalIdHint:
      "Verwenden Sie die offizielle Identitätsnummer dieser Person.",
    phoneNumber: "Telefonnummer",
    biometricCode: "Biometrischer / Fingerabdruck-Code",
    biometricCodeHint:
      "Der Code oder die Nummer, mit der die Person am Fingerabdruckgerät erkannt wird.",
    employeeEmploymentSection: "Beschäftigungsdetails",
    employeeEmploymentDetail:
      "Legen Sie die Angaben fest, die Anwesenheits- und Abrechnungen steuern.",
    workingHours: "Arbeitsstunden",
    workingHoursHint: "Stunden pro Arbeitstag.",
    employmentStartDate: "Beschäftigungsbeginn",
    employeePlacementSection: "Arbeitszuordnung",
    employeePlacementDetail:
      "Ordnen Sie die Person der richtigen Abteilung, Niederlassung und Schicht zu.",
    shift: "Schicht",
    noShifts: "Keine Schichten verfügbar",
    shiftsLoadFailed: "Schichten konnten nicht geladen werden.",
    selectShiftHint: "Wählen Sie eine vorhandene Schicht für diese Person.",
    salaryHint: "Monatlicher Betrag in der Unternehmenswährung.",
    noEmployeesMatch: "Keine Mitarbeitenden für diese Ansicht",
    adjustEmployeeSearch:
      "Passen Sie die Suche an oder fügen Sie den ersten Mitarbeitenden hinzu.",
    selectOption: "Auswählen",
    loading: "Wird geladen…",
    createDepartmentPrompt: "Abteilungsname",
    departmentNameHint:
      "Dieser Name wird genau wie eingegeben gespeichert und nicht übersetzt.",
    createBranchPrompt: "Name der Niederlassung",
    branchCityPrompt: "Stadt der Niederlassung",
    employeeStatusUpdated: "Mitarbeiterstatus aktualisiert",
    employeeAdded: "Mitarbeitender zum Arbeitsbereich hinzugefügt",
    couldNotCreateEmployee: "Mitarbeitender konnte nicht erstellt werden",
    departmentCreated: "Abteilung erstellt",
    branchCreated: "Niederlassung erstellt",
    employeeSaved: "Mitarbeitender gespeichert",
    save: "Speichern",
    saving: "Speichern…",
    createEmployee: "Mitarbeitenden erstellen",
    employeeProfile: "Mitarbeiterprofil",
    employeeNumber: "Mitarbeiternummer",
    employeeNumberEditHint:
      "Diese Nummer kann manuell geändert werden. Login, Verlauf, Lohnabrechnung und biometrische Verknüpfungen bleiben diesem Mitarbeitenden zugeordnet.",
    basicSalary: "Grundgehalt",
    deleteSuccessful: "Erfolgreich gelöscht",
    activateDepartment: "Abteilung aktivieren",
    deactivateDepartment: "Abteilung deaktivieren",
    salary: "Gehalt",
    markInactive: "Deaktivieren",
    reactivateEmployee: "Mitarbeitenden reaktivieren",
    currentEmployeeContext: "Aktueller Mitarbeiterkontext",
    noEmployeeContext: "Kein Mitarbeiterkontext",
    identifyEmployee: "Die API identifiziert den angemeldeten Mitarbeitenden.",
    scheduledStart: "Geplanter Beginn",
    checkInNow: "Jetzt einchecken",
    checkOutNow: "Jetzt auschecken",
    webEventPolicy: "Webereignis · die Standortregel wird von der API geprüft",
    today: "Heute",
    history: "Verlauf",
    todayRegister: "Tagesregister",
    loadingOperationalDate: "Betriebsdatum wird geladen",
    noAttendanceRecords: "Noch keine Anwesenheitsdaten",
    attendanceWillAppear:
      "Beim Start des Tages erscheinen die Ereignisse hier.",
    noHistory: "Kein Verlauf gefunden",
    historyWillAppear:
      "Der Anwesenheitsverlauf wird nach der Erfassung von Ereignissen angezeigt.",
    companyAttendanceView: "Unternehmensansicht Anwesenheit",
    attendanceFilters: "Anwesenheitsverlauf filtern",
    filterFrom: "Startdatum",
    filterTo: "Enddatum",
    allEmployees: "Alle Mitarbeitenden",
    clearFilters: "Filter löschen",
    missing: "Fehlt",
    correctAttendance: "Anwesenheit korrigieren",
    correctionReason: "Korrekturgrund",
    correctionReasonPlaceholder: "Erklären Sie die Korrektur für das Audit",
    saveCorrection: "Korrektur speichern",
    attendanceCorrectionUpdated: "Anwesenheitskorrektur gespeichert",
    attendanceCorrectionFailed:
      "Anwesenheitskorrektur konnte nicht gespeichert werden",
    checkInRecorded: "Einchecken erfasst",
    checkOutRecorded: "Auschecken erfasst",
    attendanceNotAccepted: "Anwesenheitsereignis wurde nicht angenommen",
    decisionQueue: "Entscheidungswarteschlange",
    requestsTitle: "Anfragen",
    requestsDetail:
      "Entscheiden Sie mit Kontext; jede Entscheidung bleibt mit der Anfrage verbunden.",
    newRequest: "Neue Anfrage",
    leaveBalances: "Urlaubssalden",
    daysRemaining: "Tage verbleibend",
    allocatedDays: "Zugewiesene Tage",
    usedDays: "Verwendete Tage",
    queueHygiene: "Warteschlangenstatus",
    pendingDecisions: "offene Entscheidungen über beide Anfragearten",
    leave: "Urlaub",
    permission: "Genehmigung",
    records: "Einträge",
    queueClear: "Die Entscheidungswarteschlange ist leer",
    requestsAppear: "Neue Urlaubs- und Genehmigungsanfragen erscheinen hier.",
    createRequest: "Anfrage erstellen",
    requestSubmitted: "Anfrage gesendet",
    couldNotSubmitRequest: "Anfrage konnte nicht gesendet werden",
    requestApproved: "Anfrage genehmigt",
    requestRejected: "Anfrage abgelehnt",
    decisionReason: "Entscheidungsgrund",
    decisionReasonPlaceholder: "Kontext für diese Entscheidung hinzufügen",
    confirmDecision: "Entscheidung bestätigen",
    decisionReasonRequired: "Ein Ablehnungsgrund ist erforderlich.",
    approve: "Genehmigen",
    reject: "Ablehnen",
    newKindRequest: "Neue {kind}-Anfrage",
    type: "Typ",
    reason: "Grund",
    from: "Von",
    to: "Bis",
    start: "Beginn",
    end: "Ende",
    submitRequest: "Anfrage senden",
    annualLeave: "Jahresurlaub",
    sickLeave: "Krankheitsurlaub",
    shortAbsence: "Kurze Abwesenheit",
    lateArrival: "Verspätete Ankunft",
    earlyDeparture: "Früher Feierabend",
    remoteWork: "Remote-Arbeit",
    personalErrand: "Persönliche Angelegenheit",
    reviewedQueue: "In der Operationswarteschlange geprüft",
    notApproved: "Derzeit nicht genehmigt",
    policyControl: "Richtliniensteuerung",
    attendanceRulesTitle: "Anwesenheitsregeln",
    attendanceRulesDetail:
      "Aktuelle Unternehmenseinstellungen für Arbeitszeit, Überstunden, Jahresurlaub und Standortprüfung.",
    weeklyHolidayRulesTitle: "Multiplikatoren für einen bestimmten Tag",
    weeklyHolidayRulesDetail:
      "Konfigurieren Sie Multiplikatoren für Wochentage und Feiertage. Bei Überschneidungen gilt nur der höchste Multiplikator.",
    addWeeklyMultiplier: "Wöchentlichen Multiplikator hinzufügen",
    addHolidayMultiplier: "Feiertagsmultiplikator hinzufügen",
    holidayPeriodName: "Feiertagsname",
    holidayPeriodFrom: "Startdatum",
    holidayPeriodTo: "Enddatum",
    holidayPeriodMultiplier: "Multiplikator für Überstundenvergütung",
    noHolidayMultipliers: "Keine Feiertagsmultiplikatoren konfiguriert.",
    workStarts: "Arbeitsbeginn",
    workEnds: "Arbeitsende",
    gracePeriod: "Kulanzzeit (Minuten)",
    lateArrivalGrace: "Kulanzzeit bei verspäteter Ankunft (Minuten)",
    earlyDepartureGrace: "Kulanzzeit bei frühem Feierabend (Minuten)",
    overtimeStartsAfter: "Überstunden beginnen nach (Minuten)",
    overtimeAfter: "Überstunden ab (Minuten)",
    locationVerification: "Standortprüfung",
    gpsPolicy: "GPS-Richtlinie",
    disabled: "Deaktiviert",
    optional: "Optional",
    required: "Erforderlich",
    locationRadius: "Standortradius (Meter)",
    explainability: "Erklärbarkeit als Standard",
    attendanceExceptionsNote:
      "Anwesenheitsausnahmen speichern Quelle, Standortstatus und eine verständliche Erklärung zur Prüfung.",
    saveAttendancePolicy: "Anwesenheitsrichtlinie speichern",
    savingPolicy: "Richtlinie wird gespeichert…",
    attendancePolicyUpdated: "Anwesenheitsrichtlinie aktualisiert",
    attendancePolicyRecalculateHint:
      "Regel gespeichert. Berechnen Sie nicht abgeschlossene Lohnzeiträume neu, um die Änderung anzuwenden.",
    attendanceRulesChangeHistory: "Änderungsverlauf der Anwesenheitsregeln",
    attendanceRulesChangeHistoryDetail:
      "Prüfen Sie für jede Anwesenheitsregel den Bearbeiter, die Änderung und den Beginn der Anwendung.",
    attendanceRulesHistoryField: "Feld",
    attendanceRulesHistoryPreviousValue: "Vorheriger Wert",
    attendanceRulesHistoryNewValue: "Neuer Wert",
    attendanceRulesHistoryEffectiveFrom: "Gültig ab",
    attendanceRulesHistoryActorReason: "Bearbeiter / Grund",
    noAttendanceRulesHistory: "Noch keine Änderungen gespeichert.",
    historyOvertimeMethod: "Methode für Überstunden",
    historyOvertimeMultiplier: "Überstundenmultiplikator",
    historyHourlyRateDivisor: "Teiler für Stundenlohn",
    historyLateDeductionMethod: "Methode für Verspätungsabzug",
    historyLateDeductionFactor: "Faktor für Verspätungsabzug",
    historyEarlyCheckoutDeductionFactor:
      "Faktor für Abzug bei frühem Feierabend",
    historyAbsenceDeductionMethod: "Methode für Abwesenheitsabzug",
    historyAbsenceDeductionFactor: "Faktor für Abwesenheitsabzug",
    historyHolidayDates: "Feiertagsdaten",
    historyHolidayPeriods: "Feiertagszeiträume",
    historyWeeklyMultipliers: "Wöchentliche Multiplikatoren",
    historyAnnualLeaveAllowedMonths:
      "Monate für den Abzug vom Jahresurlaub",
    historyLatePenaltyMultiplier: "Multiplikator für Verspätungsstrafe",
    historyEarlyDeparturePenaltyMultiplier:
      "Multiplikator für Strafe bei frühem Feierabend",
    historyAbsencePenaltyMultiplier:
      "Multiplikator für Abwesenheitsstrafe",
    historyPermissionCoveredMinutesMultiplier:
      "Multiplikator für abgedeckte Genehmigungsminuten",
    historyFullDayPermissionMultiplier:
      "Multiplikator für ganztägige Genehmigung",
    historyAbsenceLeaveDeductionTrigger:
      "Auslöser für Abwesenheitsabzug",
    historyAbsenceLeaveDeductionDays:
      "Urlaubstage pro Abwesenheit",
    historyAbsenceDeductsAnnualLeave:
      "Jahresurlaub wegen Abwesenheit abziehen",
    historyValueMultiplier: "Multiplikator",
    historyValueHourlyRate: "Stundenlohn",
    historyValueDailyRate: "Tageslohn",
    historyValueStandard: "Standard",
    evidenceAnalysis: "Belege und Analyse",
    attendanceReportsTitle: "Anwesenheitsberichte",
    reportsDetail:
      "Zeigen Sie den Zeitraum vor dem Export über Ihren verbundenen Workflow in der Vorschau an.",
    refreshPreview: "Vorschau aktualisieren",
    previewReport: "Bericht vorschauen",
    chooseReportingWindow: "Berichtszeitraum auswählen",
    setDatesAbove:
      "Legen Sie oben die Daten fest, um die Anwesenheitsdaten anzuzeigen.",
    overtimeHours: "Überstunden",
    employeeDetail: "Mitarbeiterdetails",
    generalPayroll: "Allgemeine Lohnabrechnung",
    payrollTitle: "Lohnabrechnung",
    payrollDetail:
      "Erklärbarer Berechnungsverlauf mit konfigurierten Personaldaten. Keine gesetzliche Steuerberatung.",
    periods: "Zeiträume",
    selectPeriod: "Zeitraum zum Prüfen oder Neuberechnen auswählen.",
    noPayrollPeriods: "Keine Abrechnungszeiträume",
    periodsFromApi: "Zeiträume werden von der Betriebs-API bereitgestellt.",
    calculationHistory: "Berechnungsverlauf",
    explainable: "Erklärbar",
    calculatedOn: "Berechnet am",
    calculationExplanation: "Berechnungserklärung",
    calculate: "Berechnen",
    recalculatePayroll: "Neu berechnen",
    calculating: "Wird berechnet…",
    selectPeriodToCalculate:
      "Wählen Sie Berechnen, um eine erklärbare Vorschau zu erstellen.",
    payrollReady: "Lohnabrechnung ist bereit",
    calculationFailed: "Berechnung konnte nicht abgeschlossen werden",
    payrollFoundationExplanation:
      "Diese allgemeine Abrechnungsgrundlage schließt länderspezifische Steuer-, Versicherungs- und gesetzliche Berechnungen aus.",
    basic: "Basis",
    additions: "Zuschläge",
    netSalary: "Nettogehalt",
    createPeriod: "Zeitraum erstellen",
    periodLabel: "Zeitraumbezeichnung",
    startDate: "Startdatum",
    endDate: "Enddatum",
    createPayrollPeriod: "Abrechnungszeitraum erstellen",
    periodCreated: "Abrechnungszeitraum erstellt",
    periodCreateFailed: "Abrechnungszeitraum konnte nicht erstellt werden",
    periodDateRangeInvalid: "Das Enddatum muss nach dem Startdatum liegen.",
    viewPeriod: "Zeitraum anzeigen",
    deletePeriod: "Zeitraum löschen",
    deletePeriodConfirmation:
      "Diesen Abrechnungszeitraum löschen? Die zugehörigen Berechnungen und Anpassungen werden ebenfalls gelöscht.",
    finalize: "Finalisieren",
    finalized: "Finalisiert",
    finalizePayroll: "Abrechnungszeitraum finalisieren",
    payrollFinalized: "Abrechnungszeitraum finalisiert",
    finalizeFailed: "Abrechnung konnte nicht finalisiert werden",
    mustCalculateFirst: "Berechnen Sie den Zeitraum vor der Finalisierung.",
    employeeCount: "Mitarbeitende",
    employeeDetails: "Mitarbeiterabrechnungsdetails",
    details: "Details",
    closeDetails: "Details schließen",
    regularHours: "Reguläre Stunden",
    lateMinutes: "Verspätungsminuten",
    earlyCheckoutMinutes: "Minuten vorzeitiger Abmeldung",
    missingHours: "Fehlende Stunden",
    absentDays: "Abwesenheitstage",
    attendanceDeductions: "Anwesenheitsabzüge",
    otherDeductions: "Sonstige Abzüge",
    lineItems: "Berechnungsdetails",
    noLineItems: "Keine Berechnungszeilen",
    selectEmployee: "Wählen Sie einen Mitarbeitenden zur Prüfung aus.",
    adjustments: "Anpassungen",
    adjustment: "Anpassung",
    addAdjustment: "Anpassung hinzufügen",
    adjustmentType: "Anpassungstyp",
    addition: "Zuschlag",
    deduction: "Abzug",
    category: "Kategorie",
    fixed: "Fest",
    variable: "Variabel",
    amount: "Betrag",
    employeeTarget: "Mitarbeitender",
    selectEmployeeForAdjustment: "Mitarbeitenden auswählen",
    adjustmentCreated: "Anpassung hinzugefügt",
    adjustmentCreateFailed: "Anpassung konnte nicht hinzugefügt werden",
    adjustmentDeleted: "Anpassung entfernt",
    adjustmentDeleteFailed: "Anpassung konnte nicht entfernt werden",
    remove: "Entfernen",
    noAdjustments: "Keine Anpassungen für diesen Zeitraum",
    recalculateAfterAdjustment:
      "Die Abrechnungssumme wird nach einer Anpassung automatisch neu berechnet.",
    connectedOperations: "Verbundene Abläufe",
    biometricDevices: "Biometrische Geräte",
    devicesDetail:
      "Die Konfiguration ist sichtbar; die Verfügbarkeit des Adapters wird ehrlich angezeigt.",
    addDevice: "Gerät hinzufügen",
    deviceAdded: "Gerätekonfiguration hinzugefügt",
    deviceAddFailed: "Gerät konnte nicht hinzugefügt werden",
    noDevices: "Keine biometrischen Geräte konfiguriert",
    addDeviceNote:
      "Fügen Sie ein Gerät hinzu, um seinen Adapterstatus anzuzeigen.",
    addConfiguration: "Konfiguration hinzufügen",
    sync: "Synchronisieren",
    syncRequested: "Synchronisierung angefordert",
    syncUnavailable: "Synchronisierung nicht verfügbar",
    addBiometricDevice: "Biometrisches Gerät hinzufügen",
    deviceName: "Gerätename",
    manufacturer: "Hersteller",
    model: "Modell",
    selectBranch: "Niederlassung auswählen",
    planCapacity: "Plan und Kapazität",
    subscriptionTitle: "Abonnement",
    subscriptionDetail:
      "Nutzung und Berechtigungen für den aktiven Arbeitsbereich.",
    currentPlan: "Aktueller Plan",
    activeEmployees: "Aktive Mitarbeitende",
    seatsRemaining: "Plätze verbleibend",
    includedCapabilities: "Enthaltene Funktionen",
    planChanges:
      "Planänderungen werden von Ihrem Account-Team verwaltet. Es wird keine Abrechnung simuliert.",
    overtime: "Überstunden",
    adapterPendingNote: "Der Geräteadapter ist noch nicht konfiguriert.",
    hardwareConnectorNote:
      "Der Hardware-Connector ist nicht konfiguriert. Es wird keine Anwesenheitssynchronisierung simuliert.",
    lastSync: "Letzte Synchronisierung",
    never: "Nie",
    alertBiometricTitle: "Biometrischer Connector steht aus",
    alertBiometricDetail:
      "Die Gerätesynchronisierung ist nicht verfügbar, bis ein Herstelleradapter konfiguriert ist.",
    alertPlanTitle: "Die Plannutzung nähert sich dem Limit",
    alertPlanDetail:
      "Prüfen Sie die Nutzung aktiver Mitarbeitender vor der nächsten Onboarding-Welle.",
    monday: "Mo",
    tuesday: "Di",
    wednesday: "Mi",
    thursday: "Do",
    friday: "Fr",
    saturday: "Sa",
    sunday: "So",
    featureGpsAttendance: "GPS-Anwesenheit",
    featurePayrollFoundation: "Abrechnungsgrundlage",
    featureAdvancedReports: "Erweiterte Berichte",
    separateAdmin: "Separate Administrationsoberfläche",
    platformTitle: "Plattforminhaber",
    platformDetail:
      "Mandantenübergreifende Sicht für Plattformabläufe. Unternehmensaktionen sind hier absichtlich schreibgeschützt.",
    platformScope: "Plattformbereich",
    noCompanies: "Keine Unternehmen im Plattformbereich",
    noTenants:
      "Die Plattform-API hat für diesen Arbeitsbereich keine Mandanten geliefert.",
    company: "Unternehmen",
    plan: "Plan",
    seats: "Plätze",
    lastActivity: "Letzte Aktivität",
    cancel: "Abbrechen",
    closeDialog: "Dialog schließen",
  },
} as const;

const commonCopy = {
  en: {
    operationsDesk: "operations desk",
    workspace: "Workspace",
    account: "Account",
    activeWorkspace: "Active workspace",
    support: "Support",
    language: "Language",
    authNotConnected:
      "Authentication is not connected. Data remains scoped to the active API workspace.",
    authLoading: "Loading the secure workspace…",
    authRequired: "Sign-in is required to access this workspace.",
    authError: "The workspace could not be initialized.",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    retry: "Retry",
    mondayOperationalOverview: "Monday · operational overview",
    goodMorning: "Good morning",
    goodMorningNoName: "Good morning",
    decisionSurfaceReviewExceptions:
      "Decision surface for {date}. Review the exceptions first.",
    liveWorkspace: "Live workspace",
    todayAtAGlance: "Today at a glance",
    peopleAccountedFor: "people accounted for",
    lateAbsent: "{late} late · {absent} absent",
    presencePercent: "{percent}% presence",
    requestsToDecide: "Requests to decide",
    openQueue: "Open queue →",
    payrollPosture: "Payroll posture",
    inspectCalculation: "Inspect calculation →",
    signalsRequiringAttention: "Signals requiring attention",
    exceptionsSurfaced: "Exceptions are intentionally surfaced, not buried.",
    noAlertsInQueue: "No alerts in the queue",
    operatingPictureClean: "The operating picture is clean right now.",
    operatingFootprint: "Operating footprint",
    activeTenantStructured: "How the active tenant is structured.",
    branchesDepartmentsDevicesConnected:
      "{branches} branches · {departments} departments · {connected}/{total} devices connected",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    monthlySalary: "Monthly salary",
    employee: "Employee",
    department: "Department",
    branch: "Branch",
    role: "Role",
    status: "Status",
    joined: "Joined",
    date: "Date",
    checkIn: "Check in",
    checkOut: "Check out",
    hours: "Hours",
  },
  ar: {
    operationsDesk: "مكتب العمليات",
    workspace: "مساحة العمل",
    account: "الحساب",
    activeWorkspace: "مساحة العمل النشطة",
    support: "الدعم",
    language: "اللغة",
    authNotConnected:
      "المصادقة غير متصلة. تظل البيانات محصورة في مساحة عمل API النشطة.",
    authLoading: "جارٍ تحميل مساحة العمل الآمنة…",
    authRequired: "يلزم تسجيل الدخول للوصول إلى مساحة العمل هذه.",
    authError: "تعذر تهيئة مساحة العمل.",
    openNavigation: "فتح التنقل",
    closeNavigation: "إغلاق التنقل",
    retry: "إعادة المحاولة",
    mondayOperationalOverview: "نظرة تشغيلية ليوم الاثنين",
    goodMorning: "صباح الخير",
    goodMorningNoName: "صباح الخير",
    decisionSurfaceReviewExceptions:
      "سطح قرار بتاريخ {date}. راجع الاستثناءات أولاً.",
    liveWorkspace: "مساحة عمل مباشرة",
    todayAtAGlance: "ملخص اليوم",
    peopleAccountedFor: "أشخاص تم حصرهم",
    lateAbsent: "{late} متأخر · {absent} غائب",
    presencePercent: "{percent}% حضور",
    requestsToDecide: "طلبات تحتاج قراراً",
    openQueue: "فتح القائمة ←",
    payrollPosture: "حالة الرواتب",
    inspectCalculation: "فحص الحساب ←",
    signalsRequiringAttention: "إشارات تحتاج إلى انتباه",
    exceptionsSurfaced: "تظهر الاستثناءات بوضوح ولا تُخفى.",
    noAlertsInQueue: "لا توجد تنبيهات في القائمة",
    operatingPictureClean: "الصورة التشغيلية واضحة حالياً.",
    operatingFootprint: "البصمة التشغيلية",
    activeTenantStructured: "هيكل مساحة العمل النشطة.",
    branchesDepartmentsDevicesConnected:
      "{branches} فروع · {departments} أقسام · {connected}/{total} أجهزة متصلة",
    firstName: "الاسم الأول",
    lastName: "اسم العائلة",
    email: "البريد الإلكتروني",
    monthlySalary: "الراتب الشهري",
    employee: "الموظف",
    department: "القسم",
    branch: "الفرع",
    role: "الدور",
    status: "الحالة",
    joined: "تاريخ الانضمام",
    date: "التاريخ",
    day: "اليوم",
    checkIn: "الحضور",
    checkOut: "الانصراف",
    hours: "الساعات",
  },
  fr: {
    operationsDesk: "bureau des opérations",
    workspace: "Espace de travail",
    account: "Compte",
    activeWorkspace: "Espace actif",
    support: "Assistance",
    language: "Langue",
    authNotConnected:
      "L’authentification n’est pas connectée. Les données restent liées à l’espace API actif.",
    authLoading: "Chargement de l’espace de travail sécurisé…",
    authRequired: "La connexion est requise pour accéder à cet espace.",
    authError: "L’espace de travail n’a pas pu être initialisé.",
    openNavigation: "Ouvrir la navigation",
    closeNavigation: "Fermer la navigation",
    retry: "Réessayer",
    mondayOperationalOverview: "vue opérationnelle du lundi",
    goodMorning: "Bonjour",
    goodMorningNoName: "Bonjour",
    decisionSurfaceReviewExceptions:
      "Surface de décision du {date}. Examinez d’abord les exceptions.",
    liveWorkspace: "Espace actif",
    todayAtAGlance: "En bref aujourd’hui",
    peopleAccountedFor: "personnes comptabilisées",
    lateAbsent: "{late} en retard · {absent} absentes",
    presencePercent: "{percent}% de présence",
    requestsToDecide: "Demandes à décider",
    openQueue: "Ouvrir la file →",
    payrollPosture: "État de la paie",
    inspectCalculation: "Inspecter le calcul →",
    signalsRequiringAttention: "Signaux nécessitant une attention",
    exceptionsSurfaced: "Les exceptions sont exposées, jamais masquées.",
    noAlertsInQueue: "Aucune alerte dans la file",
    operatingPictureClean: "La situation opérationnelle est claire.",
    operatingFootprint: "Empreinte opérationnelle",
    activeTenantStructured: "Structure de l’espace actif.",
    branchesDepartmentsDevicesConnected:
      "{branches} agences · {departments} départements · {connected}/{total} appareils connectés",
    firstName: "Prénom",
    lastName: "Nom",
    email: "E-mail",
    monthlySalary: "Salaire mensuel",
    employee: "Employé",
    department: "Département",
    branch: "Agence",
    role: "Rôle",
    status: "Statut",
    joined: "Arrivée",
    date: "Date",
    checkIn: "Arrivée",
    checkOut: "Départ",
    hours: "Heures",
  },
  de: {
    operationsDesk: "Operationsbereich",
    workspace: "Arbeitsbereich",
    account: "Konto",
    activeWorkspace: "Aktiver Arbeitsbereich",
    support: "Support",
    language: "Sprache",
    authNotConnected:
      "Die Authentifizierung ist nicht verbunden. Daten bleiben auf den aktiven API-Arbeitsbereich begrenzt.",
    authLoading: "Sicherer Arbeitsbereich wird geladen…",
    authRequired:
      "Für den Zugriff auf diesen Arbeitsbereich ist eine Anmeldung erforderlich.",
    authError: "Der Arbeitsbereich konnte nicht initialisiert werden.",
    openNavigation: "Navigation öffnen",
    closeNavigation: "Navigation schließen",
    retry: "Erneut versuchen",
    mondayOperationalOverview: "operative Übersicht am Montag",
    goodMorning: "Guten Morgen",
    goodMorningNoName: "Guten Morgen",
    decisionSurfaceReviewExceptions:
      "Entscheidungsansicht für {date}. Prüfen Sie zuerst die Ausnahmen.",
    liveWorkspace: "Aktiver Arbeitsbereich",
    todayAtAGlance: "Heute auf einen Blick",
    peopleAccountedFor: "Personen erfasst",
    lateAbsent: "{late} verspätet · {absent} abwesend",
    presencePercent: "{percent}% Anwesenheit",
    requestsToDecide: "Zu entscheidende Anfragen",
    openQueue: "Warteschlange öffnen →",
    payrollPosture: "Abrechnungsstatus",
    inspectCalculation: "Berechnung prüfen →",
    signalsRequiringAttention: "Signale mit Handlungsbedarf",
    exceptionsSurfaced: "Ausnahmen werden sichtbar gemacht, nicht verborgen.",
    noAlertsInQueue: "Keine Warnungen in der Warteschlange",
    operatingPictureClean: "Das operative Bild ist derzeit sauber.",
    operatingFootprint: "Operativer Fußabdruck",
    activeTenantStructured: "Struktur des aktiven Mandanten.",
    branchesDepartmentsDevicesConnected:
      "{branches} Niederlassungen · {departments} Abteilungen · {connected}/{total} Geräte verbunden",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail",
    monthlySalary: "Monatsgehalt",
    employee: "Mitarbeitender",
    department: "Abteilung",
    branch: "Niederlassung",
    role: "Rolle",
    status: "Status",
    joined: "Beitritt",
    date: "Datum",
    checkIn: "Einchecken",
    checkOut: "Auschecken",
    hours: "Stunden",
  },
} as const;

const part4Copy = {
  en: {
    deviceMetadata: "Device metadata",
    connection: "Connection",
    connectionType: "Connection type",
    networkAddress: "Network address",
    identifier: "Device identifier",
    adapter: "Adapter",
    lastHealthCheck: "Last health check",
    notRecorded: "Not recorded",
    testConnection: "Test connection",
    testingConnection: "Testing connection…",
    connectionTested: "Connection test completed",
    connectionTestFailed: "Connection test failed",
    testResult: "Connection test result",
    testedAt: "Tested at",
    deviceMappings: "Employee mappings",
    mappingDetail: "Device-specific employee IDs used by this reader.",
    noDeviceMappings: "No employee mappings",
    noDeviceMappingsDetail:
      "Map an employee when this device returns a device-specific identifier.",
    mapEmployee: "Map employee",
    deviceEmployeeId: "Device employee ID",
    employeeMapped: "Employee mapped to device",
    mappingFailed: "Could not map employee",
    selectEmployee: "Select employee",
    activeMapping: "Active mapping",
    attendanceLocations: "Attendance locations",
    attendanceLocationsDetail:
      "Company geofences used to evaluate GPS attendance events.",
    addLocation: "Add location",
    editLocation: "Edit location",
    locationName: "Location name",
    latitude: "Latitude",
    longitude: "Longitude",
    radiusMeters: "Radius (meters)",
    activeLocation: "Active location",
    inactiveLocation: "Inactive location",
    locationCreated: "Attendance location created",
    locationUpdated: "Attendance location updated",
    locationSaveFailed: "Could not save attendance location",
    noAttendanceLocations: "No attendance locations configured",
    noAttendanceLocationsDetail:
      "Add a location before requiring GPS attendance.",
    saveLocation: "Save location",
    locationState: "GPS attendance state",
    locationNotRequired: "Location not required",
    locationVerified: "Inside geofence",
    locationOutside: "Outside geofence",
    locationLowAccuracy: "Low GPS accuracy",
    locationPending: "Checking GPS position",
    locationUnavailable: "GPS unavailable",
    locationAccuracy: "Accuracy",
    locationCoordinates: "Coordinates",
    gpsPermissionDenied:
      "Browser location permission was denied. Attendance was not sent.",
    gpsUnavailable: "Browser location is unavailable. Attendance was not sent.",
    gpsRequesting: "Requesting a GPS position…",
    attendanceOutsideGeofence:
      "Attendance was not accepted because the position is outside the company geofence.",
    attendanceLocationRejected:
      "The attendance location could not be verified.",
    attendanceLocationCaptured: "GPS position captured",
    accuracyMeters: "Accuracy (meters)",
    insideGeofenceHint: "Inside the configured attendance area.",
    outsideGeofenceHint: "Outside every active configured attendance area.",
    lowAccuracyHint:
      "The browser reported a low-accuracy position. Review the GPS policy and try again.",
    noCoordinatesHint:
      "No coordinates were returned for this attendance event.",
    deviceConnectionLan: "LAN",
    deviceConnectionHttp: "HTTP",
    deviceConnectionCloud: "Cloud",
    deviceConnectionUnknown: "Unknown",
    connectionStateUnreachable: "Unreachable",
    connectionStateAuthFailure: "Authentication failure",
    connectionStateUnsupported: "Unsupported",
    connectionStateConfigError: "Configuration error",
    connectionStateUnknown: "Unknown",
    metadataUnavailable: "No metadata returned by the API.",
    syncResult: "Sync result",
    syncCompleted: "Sync completed",
    syncQueued: "Sync queued",
    syncUnavailableResult: "Sync unavailable",
    syncMessage: "Message",
  },
  ar: {
    deviceMetadata: "بيانات الجهاز",
    connection: "الاتصال",
    connectionType: "نوع الاتصال",
    networkAddress: "عنوان الشبكة",
    identifier: "معرّف الجهاز",
    adapter: "الموصل",
    lastHealthCheck: "آخر فحص للصحة",
    notRecorded: "غير مسجل",
    testConnection: "اختبار الاتصال",
    testingConnection: "جارٍ اختبار الاتصال…",
    connectionTested: "اكتمل اختبار الاتصال",
    connectionTestFailed: "فشل اختبار الاتصال",
    testResult: "نتيجة اختبار الاتصال",
    testedAt: "وقت الاختبار",
    deviceMappings: "ربط الموظفين",
    mappingDetail: "معرّفات الموظفين الخاصة بهذا الجهاز كما يعيدها القارئ.",
    noDeviceMappings: "لا توجد عمليات ربط",
    noDeviceMappingsDetail: "اربط موظفاً عند استخدام معرّف خاص بالجهاز.",
    mapEmployee: "ربط موظف",
    deviceEmployeeId: "معرّف الموظف على الجهاز",
    employeeMapped: "تم ربط الموظف بالجهاز",
    mappingFailed: "تعذر ربط الموظف",
    selectEmployee: "اختر موظفاً",
    activeMapping: "ربط نشط",
    attendanceLocations: "مواقع الحضور",
    attendanceLocationsDetail:
      "النطاقات الجغرافية للشركة لتقييم أحداث الحضور عبر GPS.",
    addLocation: "إضافة موقع",
    editLocation: "تعديل الموقع",
    locationName: "اسم الموقع",
    latitude: "خط العرض",
    longitude: "خط الطول",
    radiusMeters: "النطاق (بالمتر)",
    activeLocation: "موقع نشط",
    inactiveLocation: "موقع غير نشط",
    locationCreated: "تم إنشاء موقع الحضور",
    locationUpdated: "تم تحديث موقع الحضور",
    locationSaveFailed: "تعذر حفظ موقع الحضور",
    noAttendanceLocations: "لا توجد مواقع حضور مُعدة",
    noAttendanceLocationsDetail: "أضف موقعاً قبل إلزام الحضور عبر GPS.",
    saveLocation: "حفظ الموقع",
    locationState: "حالة الحضور عبر GPS",
    locationNotRequired: "الموقع غير مطلوب",
    locationVerified: "داخل النطاق الجغرافي",
    locationOutside: "خارج النطاق الجغرافي",
    locationLowAccuracy: "دقة GPS منخفضة",
    locationPending: "جارٍ التحقق من الموقع",
    locationUnavailable: "GPS غير متاح",
    locationAccuracy: "الدقة",
    locationCoordinates: "الإحداثيات",
    gpsPermissionDenied: "تم رفض إذن الموقع في المتصفح. لم يتم إرسال الحضور.",
    gpsUnavailable: "موقع المتصفح غير متاح. لم يتم إرسال الحضور.",
    gpsRequesting: "جارٍ طلب الموقع…",
    attendanceOutsideGeofence:
      "لم يُقبل الحضور لأن الموقع خارج النطاق الجغرافي للشركة.",
    attendanceLocationRejected: "تعذر التحقق من موقع الحضور.",
    attendanceLocationCaptured: "تم التقاط موقع GPS",
    accuracyMeters: "الدقة (بالمتر)",
    insideGeofenceHint: "داخل منطقة الحضور المُعدة.",
    outsideGeofenceHint: "خارج جميع مناطق الحضور النشطة.",
    lowAccuracyHint:
      "أبلغ المتصفح عن موقع منخفض الدقة. راجع سياسة GPS وحاول مرة أخرى.",
    noCoordinatesHint: "لم تُرجع إحداثيات لهذا الحدث.",
    deviceConnectionLan: "شبكة محلية",
    deviceConnectionHttp: "HTTP",
    deviceConnectionCloud: "سحابي",
    deviceConnectionUnknown: "غير معروف",
    connectionStateUnreachable: "لا يمكن الوصول إليه",
    connectionStateAuthFailure: "فشل المصادقة",
    connectionStateUnsupported: "غير مدعوم",
    connectionStateConfigError: "خطأ في الإعداد",
    connectionStateUnknown: "غير معروف",
    metadataUnavailable: "لم تُرجع الواجهة بيانات وصفية.",
    syncResult: "نتيجة المزامنة",
    syncCompleted: "اكتملت المزامنة",
    syncQueued: "وُضعت المزامنة في قائمة الانتظار",
    syncUnavailableResult: "المزامنة غير متاحة",
    syncMessage: "الرسالة",
  },
  fr: {
    deviceMetadata: "Métadonnées de l’appareil",
    connection: "Connexion",
    connectionType: "Type de connexion",
    networkAddress: "Adresse réseau",
    identifier: "Identifiant de l’appareil",
    adapter: "Adaptateur",
    lastHealthCheck: "Dernier contrôle",
    notRecorded: "Non enregistré",
    testConnection: "Tester la connexion",
    testingConnection: "Test de connexion…",
    connectionTested: "Test de connexion terminé",
    connectionTestFailed: "Échec du test de connexion",
    testResult: "Résultat du test",
    testedAt: "Testé le",
    deviceMappings: "Associations employés",
    mappingDetail: "Identifiants employés propres à cet appareil.",
    noDeviceMappings: "Aucune association",
    noDeviceMappingsDetail:
      "Associez un employé avec l’identifiant renvoyé par cet appareil.",
    mapEmployee: "Associer un employé",
    deviceEmployeeId: "Identifiant employé appareil",
    employeeMapped: "Employé associé",
    mappingFailed: "Impossible d’associer l’employé",
    selectEmployee: "Sélectionner un employé",
    activeMapping: "Association active",
    attendanceLocations: "Lieux de présence",
    attendanceLocationsDetail:
      "Périmètres de l’entreprise utilisés pour les événements GPS.",
    addLocation: "Ajouter un lieu",
    editLocation: "Modifier le lieu",
    locationName: "Nom du lieu",
    latitude: "Latitude",
    longitude: "Longitude",
    radiusMeters: "Rayon (mètres)",
    activeLocation: "Lieu actif",
    inactiveLocation: "Lieu inactif",
    locationCreated: "Lieu de présence créé",
    locationUpdated: "Lieu de présence mis à jour",
    locationSaveFailed: "Impossible d’enregistrer le lieu",
    noAttendanceLocations: "Aucun lieu de présence configuré",
    noAttendanceLocationsDetail: "Ajoutez un lieu avant d’exiger le GPS.",
    saveLocation: "Enregistrer le lieu",
    locationState: "État GPS de la présence",
    locationNotRequired: "Localisation non requise",
    locationVerified: "Dans le périmètre",
    locationOutside: "Hors périmètre",
    locationLowAccuracy: "Précision GPS faible",
    locationPending: "Vérification GPS",
    locationUnavailable: "GPS indisponible",
    locationAccuracy: "Précision",
    locationCoordinates: "Coordonnées",
    gpsPermissionDenied:
      "La permission de localisation a été refusée. La présence n’a pas été envoyée.",
    gpsUnavailable:
      "La localisation du navigateur est indisponible. La présence n’a pas été envoyée.",
    gpsRequesting: "Demande de position GPS…",
    attendanceOutsideGeofence:
      "Présence refusée : la position est hors du périmètre de l’entreprise.",
    attendanceLocationRejected:
      "La localisation de la présence n’a pas pu être vérifiée.",
    attendanceLocationCaptured: "Position GPS capturée",
    accuracyMeters: "Précision (mètres)",
    insideGeofenceHint: "Dans la zone de présence configurée.",
    outsideGeofenceHint: "Hors de toutes les zones actives.",
    lowAccuracyHint:
      "Le navigateur a fourni une position peu précise. Vérifiez la politique GPS puis réessayez.",
    noCoordinatesHint: "Aucune coordonnée n’a été renvoyée.",
    deviceConnectionLan: "LAN",
    deviceConnectionHttp: "HTTP",
    deviceConnectionCloud: "Cloud",
    deviceConnectionUnknown: "Inconnu",
    connectionStateUnreachable: "Injoignable",
    connectionStateAuthFailure: "Échec d’authentification",
    connectionStateUnsupported: "Non pris en charge",
    connectionStateConfigError: "Erreur de configuration",
    connectionStateUnknown: "Inconnu",
    metadataUnavailable: "Aucune métadonnée renvoyée par l’API.",
    syncResult: "Résultat de synchronisation",
    syncCompleted: "Synchronisation terminée",
    syncQueued: "Synchronisation en file",
    syncUnavailableResult: "Synchronisation indisponible",
    syncMessage: "Message",
  },
  de: {
    deviceMetadata: "Gerätemetadaten",
    connection: "Verbindung",
    connectionType: "Verbindungstyp",
    networkAddress: "Netzwerkadresse",
    identifier: "Gerätekennung",
    adapter: "Adapter",
    lastHealthCheck: "Letzte Gesundheitsprüfung",
    notRecorded: "Nicht erfasst",
    testConnection: "Verbindung testen",
    testingConnection: "Verbindung wird getestet…",
    connectionTested: "Verbindungstest abgeschlossen",
    connectionTestFailed: "Verbindungstest fehlgeschlagen",
    testResult: "Verbindungstestergebnis",
    testedAt: "Getestet am",
    deviceMappings: "Mitarbeiterzuordnungen",
    mappingDetail: "Gerätespezifische Mitarbeiter-IDs dieses Lesegeräts.",
    noDeviceMappings: "Keine Zuordnungen",
    noDeviceMappingsDetail:
      "Ordnen Sie einen Mitarbeitenden mit der gerätespezifischen ID zu.",
    mapEmployee: "Mitarbeitenden zuordnen",
    deviceEmployeeId: "Gerätespezifische Mitarbeiter-ID",
    employeeMapped: "Mitarbeitender zugeordnet",
    mappingFailed: "Mitarbeitender konnte nicht zugeordnet werden",
    selectEmployee: "Mitarbeitenden auswählen",
    activeMapping: "Aktive Zuordnung",
    attendanceLocations: "Anwesenheitsstandorte",
    attendanceLocationsDetail:
      "Unternehmens-Geofences zur Bewertung von GPS-Anwesenheitsereignissen.",
    addLocation: "Standort hinzufügen",
    editLocation: "Standort bearbeiten",
    locationName: "Standortname",
    latitude: "Breitengrad",
    longitude: "Längengrad",
    radiusMeters: "Radius (Meter)",
    activeLocation: "Aktiver Standort",
    inactiveLocation: "Inaktiver Standort",
    locationCreated: "Anwesenheitsstandort erstellt",
    locationUpdated: "Anwesenheitsstandort aktualisiert",
    locationSaveFailed: "Anwesenheitsstandort konnte nicht gespeichert werden",
    noAttendanceLocations: "Keine Anwesenheitsstandorte konfiguriert",
    noAttendanceLocationsDetail:
      "Fügen Sie einen Standort hinzu, bevor GPS-Anwesenheit erforderlich ist.",
    saveLocation: "Standort speichern",
    locationState: "GPS-Anwesenheitsstatus",
    locationNotRequired: "Standort nicht erforderlich",
    locationVerified: "Innerhalb des Geofences",
    locationOutside: "Außerhalb des Geofences",
    locationLowAccuracy: "Niedrige GPS-Genauigkeit",
    locationPending: "GPS-Standort wird geprüft",
    locationUnavailable: "GPS nicht verfügbar",
    locationAccuracy: "Genauigkeit",
    locationCoordinates: "Koordinaten",
    gpsPermissionDenied:
      "Die Browser-Standortberechtigung wurde verweigert. Anwesenheit wurde nicht gesendet.",
    gpsUnavailable:
      "Browser-Standort ist nicht verfügbar. Anwesenheit wurde nicht gesendet.",
    gpsRequesting: "GPS-Position wird angefordert…",
    attendanceOutsideGeofence:
      "Anwesenheit abgelehnt: Die Position liegt außerhalb des Unternehmens-Geofences.",
    attendanceLocationRejected:
      "Der Anwesenheitsstandort konnte nicht geprüft werden.",
    attendanceLocationCaptured: "GPS-Position erfasst",
    accuracyMeters: "Genauigkeit (Meter)",
    insideGeofenceHint: "Innerhalb des konfigurierten Anwesenheitsbereichs.",
    outsideGeofenceHint: "Außerhalb aller aktiven Bereiche.",
    lowAccuracyHint:
      "Der Browser meldete eine ungenaue Position. Prüfen Sie die GPS-Richtlinie und versuchen Sie es erneut.",
    noCoordinatesHint:
      "Für dieses Ereignis wurden keine Koordinaten zurückgegeben.",
    deviceConnectionLan: "LAN",
    deviceConnectionHttp: "HTTP",
    deviceConnectionCloud: "Cloud",
    deviceConnectionUnknown: "Unbekannt",
    connectionStateUnreachable: "Nicht erreichbar",
    connectionStateAuthFailure: "Authentifizierungsfehler",
    connectionStateUnsupported: "Nicht unterstützt",
    connectionStateConfigError: "Konfigurationsfehler",
    connectionStateUnknown: "Unbekannt",
    metadataUnavailable: "Die API hat keine Metadaten geliefert.",
    syncResult: "Synchronisierungsergebnis",
    syncCompleted: "Synchronisierung abgeschlossen",
    syncQueued: "Synchronisierung eingereiht",
    syncUnavailableResult: "Synchronisierung nicht verfügbar",
    syncMessage: "Nachricht",
  },
} as const;

type CopyKey = keyof typeof copy.en;
type AppCopyKey =
  | CopyKey
  | keyof typeof pageCopy.en
  | keyof typeof commonCopy.en
  | keyof typeof part4Copy.en
  | keyof typeof reportCopy.en
  | keyof typeof importCopy.en
  | keyof typeof task5Copy.en;
const reportCopy = {
  en: {
    reportsWorkspace: "Reports workspace",
    reportsWorkspaceDetail:
      "Build evidence across workforce, time, requests, and payroll.",
    reportType: "Report type",
    reportEmployees: "Employees",
    reportAttendance: "Attendance",
    reportLeave: "Leave",
    reportPermission: "Permission",
    reportOvertime: "Overtime",
    reportPayroll: "Payroll",
    filters: "Filters",
    applyFilters: "Apply filters",
    resetFilters: "Reset",
    filterSummary: "Selected filters",
    allDepartments: "All departments",
    allEmployees: "All employees",
    allStatuses: "All statuses",
    statusActive: "Active",
    statusInactive: "Inactive",
    leaveType: "Leave type",
    permissionType: "Permission type",
    payrollPeriod: "Payroll period",
    reportPreview: "Report preview",
    noReportRows: "No records for these filters",
    noReportRowsDetail:
      "Try a wider reporting window or remove one of the filters.",
    records: "records",
    workedHours: "Worked hours",
    presentDays: "Present days",
    lateDays: "Late days",
    absentDays: "Absent days",
    leaveDays: "Leave days",
    gross: "Gross",
    additions: "Additions",
    deductions: "Deductions",
    net: "Net",
    exportCsv: "Export CSV",
    exportExcel: "Export Excel",
    printReport: "Print report",
    importEmployees: "Import employees",
    importDetail: "Upload a CSV or TSV file. The server validates each row.",
    chooseFile: "Choose CSV or TSV file",
    previewImport: "Import preview",
    confirmImport: "Confirm import",
    imported: "Imported",
    failed: "Failed",
    validRows: "Rows ready",
    invalidRows: "Rows with structural issues",
    importResults: "Import results",
    row: "Row",
    result: "Result",
    success: "Success",
    error: "Error",
    emptyFile: "The file is empty.",
    emptyRows: "No data rows were found.",
    invalidStructure:
      "This row has a different number of cells than the header.",
    importComplete: "Employee import completed",
    close: "Close",
    refresh: "Refresh",
    dateFrom: "From date",
    dateTo: "To date",
    department: "Department",
    employee: "Employee",
    branch: "Branch",
    email: "Email",
    joinedOn: "Joined",
    date: "Date",
    type: "Type",
    status: "Status",
    reason: "Reason",
    days: "Days",
    checkIn: "Check in",
    checkOut: "Check out",
    overtimeHours: "Overtime hours",
    overtimeAmount: "Overtime amount",
    payrollStatus: "Payroll status",
    period: "Period",
    salary: "Salary",
    attendanceStatus: "Attendance status",
    lateMinutes: "Late minutes",
    earlyCheckoutMinutes: "Early checkout minutes",
    attendanceMovementTitle: "Employee movement record",
    attendanceMovementDetail:
      "Full monthly attendance, fingerprint, deductions, and overtime details.",
    showAttendanceMovement: "View movement record",
    hideAttendanceMovement: "Hide movement record",
    backToEmployeeProfile: "Back to employee profile",
    printAttendanceMovement: "Print movement record",
    attendanceMonth: "Month",
    scheduledEnd: "Scheduled end",
    deductedMinutes: "Deducted minutes",
    doublePay: "2× pay",
    multiplier: "Multiplier",
    fingerprintSource: "Fingerprint / source",
    noAttendanceMovement: "No movement records for this month",
    yes: "Yes",
    no: "No",
    company: "Company",
    periodLabel: "Period",
    fromTo: "Reporting window",
  },
  ar: {
    reportsWorkspace: "مساحة التقارير",
    reportsWorkspaceDetail:
      "أنشئ أدلة عبر القوى العاملة والوقت والطلبات والرواتب.",
    reportType: "نوع التقرير",
    reportEmployees: "الموظفون",
    reportAttendance: "الحضور",
    reportLeave: "الإجازات",
    reportPermission: "الأذونات",
    reportOvertime: "العمل الإضافي",
    reportPayroll: "الرواتب",
    filters: "الفلاتر",
    applyFilters: "تطبيق الفلاتر",
    resetFilters: "إعادة ضبط",
    filterSummary: "الفلاتر المحددة",
    allDepartments: "كل الأقسام",
    allEmployees: "كل الموظفين",
    allStatuses: "كل الحالات",
    statusActive: "نشط",
    statusInactive: "غير نشط",
    leaveType: "نوع الإجازة",
    permissionType: "نوع الإذن",
    payrollPeriod: "فترة الرواتب",
    reportPreview: "معاينة التقرير",
    noReportRows: "لا توجد سجلات لهذه الفلاتر",
    noReportRowsDetail: "جرّب نطاقاً أوسع أو أزل أحد الفلاتر.",
    records: "سجلات",
    workedHours: "ساعات العمل",
    presentDays: "أيام الحضور",
    lateDays: "أيام التأخر",
    absentDays: "أيام الغياب",
    leaveDays: "أيام الإجازة",
    gross: "الإجمالي",
    additions: "الإضافات",
    deductions: "الخصومات",
    net: "الصافي",
    exportCsv: "تصدير CSV",
    exportExcel: "تصدير Excel",
    printReport: "طباعة التقرير",
    importEmployees: "استيراد الموظفين",
    importDetail: "ارفع ملف CSV أو TSV. يتحقق الخادم من كل صف.",
    chooseFile: "اختر ملف CSV أو TSV",
    previewImport: "معاينة الاستيراد",
    confirmImport: "تأكيد الاستيراد",
    imported: "تم الاستيراد",
    failed: "فشل",
    validRows: "صفوف جاهزة",
    invalidRows: "صفوف بها مشاكل بنيوية",
    importResults: "نتائج الاستيراد",
    row: "الصف",
    result: "النتيجة",
    success: "نجاح",
    error: "خطأ",
    emptyFile: "الملف فارغ.",
    emptyRows: "لم يتم العثور على صفوف بيانات.",
    invalidStructure: "يختلف عدد الخلايا في هذا الصف عن العنوان.",
    importComplete: "اكتمل استيراد الموظفين",
    close: "إغلاق",
    refresh: "تحديث",
    dateFrom: "من تاريخ",
    dateTo: "إلى تاريخ",
    department: "القسم",
    employee: "الموظف",
    branch: "الفرع",
    email: "البريد الإلكتروني",
    joinedOn: "تاريخ الانضمام",
    date: "التاريخ",
    type: "النوع",
    status: "الحالة",
    reason: "السبب",
    days: "الأيام",
    checkIn: "الدخول",
    checkOut: "الخروج",
    overtimeHours: "ساعات إضافية",
    overtimeAmount: "قيمة إضافية",
    payrollStatus: "حالة الرواتب",
    period: "الفترة",
    salary: "الراتب",
    attendanceStatus: "حالة الحضور",
    lateMinutes: "دقائق التأخر",
    earlyCheckoutMinutes: "دقائق الانصراف المبكر",
    minutes: "دقيقة",
    attendanceMovementTitle: "سجل حركة الموظف",
    attendanceMovementDetail:
      "تقرير شهري كامل للحضور والبصمة والخصومات والعمل الإضافي.",
    showAttendanceMovement: "عرض سجل الحركة",
    hideAttendanceMovement: "إخفاء سجل الحركة",
    backToEmployeeProfile: "العودة إلى ملف الموظف",
    printAttendanceMovement: "طباعة سجل الحركة",
    attendanceMonth: "الشهر",
    scheduledEnd: "نهاية الدوام المجدولة",
    deductedMinutes: "دقائق الخصم",
    doublePay: "مضاعف ٢×",
    multiplier: "المضاعف",
    fingerprintSource: "البصمة / المصدر",
    noAttendanceMovement: "لا توجد حركة مسجلة لهذا الشهر",
    yes: "نعم",
    no: "لا",
    company: "الشركة",
    periodLabel: "الفترة",
    fromTo: "نطاق التقرير",
  },
  fr: {
    reportsWorkspace: "Espace rapports",
    reportsWorkspaceDetail:
      "Construisez des preuves sur les effectifs, le temps, les demandes et la paie.",
    reportType: "Type de rapport",
    reportEmployees: "Employés",
    reportAttendance: "Présence",
    reportLeave: "Congés",
    reportPermission: "Permission",
    reportOvertime: "Heures supplémentaires",
    reportPayroll: "Paie",
    filters: "Filtres",
    applyFilters: "Appliquer",
    resetFilters: "Réinitialiser",
    filterSummary: "Filtres sélectionnés",
    allDepartments: "Tous les services",
    allEmployees: "Tous les employés",
    allStatuses: "Tous les statuts",
    statusActive: "Actif",
    statusInactive: "Inactif",
    leaveType: "Type de congé",
    permissionType: "Type de permission",
    payrollPeriod: "Période de paie",
    reportPreview: "Aperçu du rapport",
    noReportRows: "Aucun enregistrement pour ces filtres",
    noReportRowsDetail: "Élargissez la période ou retirez un filtre.",
    records: "enregistrements",
    workedHours: "Heures travaillées",
    presentDays: "Jours présents",
    lateDays: "Jours en retard",
    absentDays: "Jours absents",
    leaveDays: "Jours de congé",
    gross: "Brut",
    additions: "Ajouts",
    deductions: "Déductions",
    net: "Net",
    exportCsv: "Exporter CSV",
    exportExcel: "Exporter Excel",
    printReport: "Imprimer",
    importEmployees: "Importer des employés",
    importDetail:
      "Déposez un fichier CSV ou TSV. Le serveur valide chaque ligne.",
    chooseFile: "Choisir un fichier CSV ou TSV",
    previewImport: "Aperçu de l’import",
    confirmImport: "Confirmer l’import",
    imported: "Importés",
    failed: "Échecs",
    validRows: "Lignes prêtes",
    invalidRows: "Lignes avec problèmes structurels",
    importResults: "Résultats de l’import",
    row: "Ligne",
    result: "Résultat",
    success: "Succès",
    error: "Erreur",
    emptyFile: "Le fichier est vide.",
    emptyRows: "Aucune ligne de données.",
    invalidStructure:
      "Cette ligne ne correspond pas au nombre de cellules attendu.",
    importComplete: "Import des employés terminé",
    close: "Fermer",
    refresh: "Actualiser",
    dateFrom: "Du",
    dateTo: "Au",
    department: "Service",
    employee: "Employé",
    branch: "Agence",
    email: "E-mail",
    joinedOn: "Arrivée",
    date: "Date",
    day: "Jour",
    type: "Type",
    status: "Statut",
    reason: "Motif",
    days: "Jours",
    checkIn: "Arrivée",
    checkOut: "Départ",
    overtimeHours: "Heures sup.",
    overtimeAmount: "Montant sup.",
    payrollStatus: "Statut paie",
    period: "Période",
    salary: "Salaire",
    attendanceStatus: "Statut présence",
    lateMinutes: "Minutes de retard",
    earlyCheckoutMinutes: "Minutes de départ anticipé",
    minutes: "minutes",
    attendanceMovementTitle: "Registre de mouvement de l’employé",
    attendanceMovementDetail:
      "Présence mensuelle complète, empreinte, retenues et heures supplémentaires.",
    showAttendanceMovement: "Voir le registre de mouvement",
    hideAttendanceMovement: "Masquer le registre de mouvement",
    backToEmployeeProfile: "Retour au profil de l’employé",
    printAttendanceMovement: "Imprimer le registre de mouvement",
    attendanceMonth: "Mois",
    scheduledEnd: "Fin planifiée",
    deductedMinutes: "Minutes déduites",
    doublePay: "Paie 2×",
    multiplier: "Multiplicateur",
    fingerprintSource: "Empreinte / source",
    noAttendanceMovement: "Aucun mouvement pour ce mois",
    yes: "Oui",
    no: "Non",
    company: "Entreprise",
    periodLabel: "Période",
    fromTo: "Période du rapport",
  },
  de: {
    reportsWorkspace: "Berichtsbereich",
    reportsWorkspaceDetail:
      "Belege für Belegschaft, Zeit, Anfragen und Lohnabrechnung.",
    reportType: "Berichtstyp",
    reportEmployees: "Mitarbeitende",
    reportAttendance: "Anwesenheit",
    reportLeave: "Urlaub",
    reportPermission: "Berechtigung",
    reportOvertime: "Überstunden",
    reportPayroll: "Lohnabrechnung",
    filters: "Filter",
    applyFilters: "Filter anwenden",
    resetFilters: "Zurücksetzen",
    filterSummary: "Ausgewählte Filter",
    allDepartments: "Alle Abteilungen",
    allEmployees: "Alle Mitarbeitenden",
    allStatuses: "Alle Status",
    statusActive: "Aktiv",
    statusInactive: "Inaktiv",
    leaveType: "Urlaubsart",
    permissionType: "Berechtigungsart",
    payrollPeriod: "Abrechnungszeitraum",
    reportPreview: "Berichtsvorschau",
    noReportRows: "Keine Datensätze für diese Filter",
    noReportRowsDetail:
      "Erweitern Sie den Zeitraum oder entfernen Sie einen Filter.",
    records: "Datensätze",
    workedHours: "Arbeitsstunden",
    presentDays: "Anwesenheitstage",
    lateDays: "Verspätete Tage",
    absentDays: "Abwesende Tage",
    leaveDays: "Urlaubstage",
    gross: "Brutto",
    additions: "Zuschläge",
    deductions: "Abzüge",
    net: "Netto",
    exportCsv: "CSV exportieren",
    exportExcel: "Excel exportieren",
    printReport: "Bericht drucken",
    importEmployees: "Mitarbeitende importieren",
    importDetail: "CSV- oder TSV-Datei hochladen. Der Server prüft jede Zeile.",
    chooseFile: "CSV- oder TSV-Datei wählen",
    previewImport: "Importvorschau",
    confirmImport: "Import bestätigen",
    imported: "Importiert",
    failed: "Fehlgeschlagen",
    validRows: "Bereite Zeilen",
    invalidRows: "Zeilen mit Strukturproblemen",
    importResults: "Importergebnisse",
    row: "Zeile",
    result: "Ergebnis",
    success: "Erfolg",
    error: "Fehler",
    emptyFile: "Die Datei ist leer.",
    emptyRows: "Keine Datenzeilen gefunden.",
    invalidStructure:
      "Diese Zeile hat eine andere Zellanzahl als die Kopfzeile.",
    importComplete: "Mitarbeitendenimport abgeschlossen",
    close: "Schließen",
    refresh: "Aktualisieren",
    dateFrom: "Von",
    dateTo: "Bis",
    department: "Abteilung",
    employee: "Mitarbeitende",
    branch: "Standort",
    email: "E-Mail",
    joinedOn: "Beigetreten",
    date: "Datum",
    day: "Tag",
    type: "Typ",
    status: "Status",
    reason: "Grund",
    days: "Tage",
    checkIn: "Arbeitsbeginn",
    checkOut: "Arbeitsende",
    overtimeHours: "Überstunden",
    overtimeAmount: "Überstundenbetrag",
    payrollStatus: "Abrechnungsstatus",
    period: "Zeitraum",
    salary: "Gehalt",
    attendanceStatus: "Anwesenheitsstatus",
    lateMinutes: "Verspätungsminuten",
    earlyCheckoutMinutes: "Frühe Abgangsminuten",
    minutes: "Minuten",
    attendanceMovementTitle: "Mitarbeiter-Bewegungsprotokoll",
    attendanceMovementDetail:
      "Vollständige monatliche Anwesenheits-, Fingerabdruck-, Abzugs- und Überstundenübersicht.",
    showAttendanceMovement: "Bewegungsprotokoll anzeigen",
    hideAttendanceMovement: "Bewegungsprotokoll ausblenden",
    backToEmployeeProfile: "Zurück zum Mitarbeiterprofil",
    printAttendanceMovement: "Bewegungsprotokoll drucken",
    attendanceMonth: "Monat",
    scheduledEnd: "Geplantes Ende",
    deductedMinutes: "Abgezogene Minuten",
    doublePay: "2×-Vergütung",
    multiplier: "Multiplikator",
    fingerprintSource: "Fingerabdruck / Quelle",
    noAttendanceMovement: "Keine Bewegungsdaten für diesen Monat",
    yes: "Ja",
    no: "Nein",
    company: "Unternehmen",
    periodLabel: "Zeitraum",
    fromTo: "Berichtszeitraum",
  },
} as const;
const importCopy = {
  en: {
    downloadTemplate: "Download template",
    invalidHeaders:
      "The file headers are not supported or are missing required fields.",
    invalidRow: "This row contains a missing or invalid value.",
    duplicateFileRow: "This value is duplicated in the file.",
    referenceMissing:
      "The department or branch ID does not exist in this company.",
    fileReady: "File ready for validation",
    noValidRows: "Fix the highlighted rows before confirming the import.",
  },
  ar: {
    downloadTemplate: "تنزيل القالب",
    invalidHeaders: "عناوين الملف غير مدعومة أو تفتقد إلى حقول مطلوبة.",
    invalidRow: "يحتوي هذا الصف على قيمة ناقصة أو غير صالحة.",
    duplicateFileRow: "هذه القيمة مكررة في الملف.",
    referenceMissing: "معرّف القسم أو الفرع غير موجود في هذه الشركة.",
    fileReady: "الملف جاهز للتحقق",
    noValidRows: "أصلح الصفوف المحددة قبل تأكيد الاستيراد.",
  },
  fr: {
    downloadTemplate: "Télécharger le modèle",
    invalidHeaders:
      "Les en-têtes ne sont pas pris en charge ou des champs obligatoires manquent.",
    invalidRow: "Cette ligne contient une valeur manquante ou invalide.",
    duplicateFileRow: "Cette valeur est dupliquée dans le fichier.",
    referenceMissing:
      "Le service ou l’agence indiqué n’existe pas dans cette entreprise.",
    fileReady: "Fichier prêt à être validé",
    noValidRows: "Corrigez les lignes signalées avant de confirmer l’import.",
  },
  de: {
    downloadTemplate: "Vorlage herunterladen",
    invalidHeaders:
      "Die Dateikopfzeilen werden nicht unterstützt oder Pflichtfelder fehlen.",
    invalidRow: "Diese Zeile enthält einen fehlenden oder ungültigen Wert.",
    duplicateFileRow: "Dieser Wert ist in der Datei doppelt vorhanden.",
    referenceMissing:
      "Die Abteilungs- oder Standort-ID existiert in diesem Unternehmen nicht.",
    fileReady: "Datei zur Prüfung bereit",
    noValidRows: "Beheben Sie die markierten Zeilen vor der Importbestätigung.",
  },
} as const;
const task5Copy = {
  en: {
    scheduleManagement: "Shift organization",
    scheduleManagementDetail:
      "Build reusable shifts and assign the effective shift to each employee.",
    createSchedule: "Create shift",
    editSchedule: "Edit shift",
    scheduleName: "Shift name",
    scheduleNameAr: "Arabic name",
    workingDays: "Working days",
    startTime: "Start time",
    endTime: "End time",
    requiredHours: "Required hours",
    graceMinutes: "Grace minutes",
    earlyCheckoutGraceMinutes: "Early checkout grace (minutes)",
    breakDurationMinutes: "Break duration (minutes)",
    breakPaid: "Paid break",
    defaultSchedule: "Company default shift",
    setDefaultSchedule: "Set as default shift",
    assignmentHistory: "Assignment history",
    bulkAssignment: "Bulk assign shifts",
    selectEmployees: "Select employees",
    bulkAssigned: "Employees assigned",
    overtimeAfterMinutes: "Overtime after (minutes)",
    overtimeEligible: "Overtime eligible",
    activeSchedule: "Active shift",
    daySun: "Sun",
    dayMon: "Mon",
    dayTue: "Tue",
    dayWed: "Wed",
    dayThu: "Thu",
    dayFri: "Fri",
    daySat: "Sat",
    overnightSchedule: "Overnight shift",
    overnightScheduleDetail: "The end time is on the following day.",
    noSchedules: "No shifts configured",
    noSchedulesDetail:
      "Create a shift before assigning it to employees.",
    scheduleCreated: "Shift created",
    scheduleUpdated: "Shift updated",
    scheduleSaveFailed: "The shift could not be saved.",
    scheduleValidation:
      "Provide a shift name and a valid time range.",
    workingDaysTitle: "Working days",
    workingDaysDetail:
      "Choose the company workdays used by attendance and absence calculations. This setting is separate from shifts.",
    workingDaysRequired: "Choose at least one working day before saving.",
    employeeSchedule: "Employee shift assignment",
    assignSchedule: "Assign shift",
    effectiveSchedule: "Effective shift",
    selectEmployee: "Select employee",
    selectSchedule: "Select shift",
    effectiveFrom: "Effective from",
    effectiveTo: "Effective to",
    scheduleAssigned: "Shift assigned",
    scheduleAssignmentFailed: "The shift assignment could not be saved.",
    noEffectiveSchedule: "No effective shift",
    noEffectiveScheduleDetail:
      "This employee does not have an active shift assignment.",
    shiftOrganization: "Shift organization",
    shiftOrganizationDetail:
      "Create and manage reusable shifts, working days, breaks, grace periods, overtime, and the company default shift.",
    employeeShiftAssignment: "Employee shift assignment",
    employeeShiftAssignmentDetail:
      "Assign shifts to employees, set effective dates, bulk assign, and review assignment history.",
    automaticOvertimeCalculation: "Automatic Overtime Calculation",
    automaticOvertimeCalculationDetail:
      "When disabled, extra worked minutes do not automatically become overtime.",
    automaticOvertime: "Automatic Overtime",
    useCompanyDefault: "Use company default",
    enabled: "Enabled",
    disabledSetting: "Disabled",
    holidaysTitle: "Company holidays",
    holidaysDetail:
      "Keep tenant-scoped non-working dates in one place for attendance calculations.",
    addHoliday: "Add holiday",
    editHoliday: "Edit holiday",
    holidayName: "Holiday name",
    holidayDate: "Date",
    recurringHoliday: "Repeats every year",
    noHolidays: "No company holidays",
    noHolidaysDetail:
      "Add the dates your company observes as non-working days.",
    holidayCreated: "Holiday created",
    holidayUpdated: "Holiday updated",
    holidayDeleted: "Holiday deleted",
    holidaySaveFailed: "The holiday could not be saved.",
    holidayDeleteFailed: "The holiday could not be deleted.",
    holidayDateConflict: "A holiday already exists on this date.",
    confirmDeleteHoliday: "Delete this holiday?",
    biometricProviders: "Biometric providers",
    biometricProvidersDetail:
      "Available provider adapters for this workspace. No credentials are shown here.",
    providerAvailable: "Available",
    providerUnavailable: "Unavailable",
    providerMockNote:
      "The deterministic mock provider is for local verification; it does not represent physical hardware.",
    syncHistory: "Synchronization history",
    syncHistoryDetail:
      "Review non-sensitive provider activity and synchronization results.",
    noSyncHistory: "No synchronization history",
    noSyncHistoryDetail:
      "Run a supported synchronization operation to see results here.",
    chooseDeviceForHistory: "Choose a device to view its history.",
    operation: "Operation",
    eventsReceived: "Events received",
    eventsProcessed: "Events processed",
    errorCount: "Errors",
    startedAt: "Started",
    completedAt: "Completed",
    provider: "Provider",
    employeeSync: "Employee sync",
    attendanceSync: "Attendance sync",
    fullSync: "Full sync",
    sync: "Sync",
    syncEmployees: "Sync employees",
    syncAttendance: "Sync attendance",
    syncing: "Syncing…",
    syncStarted: "Synchronization requested",
    syncFailed: "Synchronization failed",
    connectionStatus: "Connection status",
    integrationStatus: "Integration status",
    mappedEmployees: "Mapped employees",
    lastSync: "Last sync",
    deviceStatus: "Device status",
    refreshHistory: "Refresh history",
    connectionTestResult: "Connection test result",
  },
  ar: {
    scheduleManagement: "تنظيم الشيفتات",
    scheduleManagementDetail:
      "أنشئ شيفتات قابلة لإعادة الاستخدام واربط الشيفت الفعّال بكل موظف.",
    createSchedule: "إنشاء شيفت",
    editSchedule: "تعديل الشيفت",
    scheduleName: "اسم الشيفت",
    scheduleNameAr: "الاسم بالعربية",
    workingDays: "أيام العمل",
    startTime: "وقت البدء",
    endTime: "وقت الانتهاء",
    requiredHours: "الساعات المطلوبة",
    graceMinutes: "دقائق السماح",
    earlyCheckoutGraceMinutes: "سماح الانصراف المبكر (بالدقائق)",
    breakDurationMinutes: "مدة الاستراحة (بالدقائق)",
    breakPaid: "استراحة مدفوعة",
    defaultSchedule: "الشيفت الافتراضي للشركة",
    setDefaultSchedule: "تعيين كشيفت افتراضي",
    assignmentHistory: "سجل التعيينات",
    bulkAssignment: "تعيين جماعي",
    selectEmployees: "اختر الموظفين",
    bulkAssigned: "تم تعيين الموظفين",
    overtimeAfterMinutes: "العمل الإضافي بعد (دقائق)",
    overtimeEligible: "مؤهل للعمل الإضافي",
    activeSchedule: "شيفت نشط",
    daySun: "الأحد",
    dayMon: "الاثنين",
    dayTue: "الثلاثاء",
    dayWed: "الأربعاء",
    dayThu: "الخميس",
    dayFri: "الجمعة",
    daySat: "السبت",
    overnightSchedule: "شيفت ليلي",
    overnightScheduleDetail: "وقت الانتهاء في اليوم التالي.",
    noSchedules: "لا توجد شيفتات",
    noSchedulesDetail: "أنشئ شيفتاً قبل ربطه بالموظفين.",
    scheduleCreated: "تم إنشاء الشيفت",
    scheduleUpdated: "تم تحديث الشيفت",
    scheduleSaveFailed: "تعذر حفظ الشيفت.",
    scheduleValidation: "أدخل اسم الشيفت ونطاق وقت صالحاً.",
    workingDaysTitle: "تحديد أيام العمل",
    workingDaysDetail:
      "اختر أيام العمل التي تستخدمها قواعد الحضور واحتساب الغياب. هذا الإعداد منفصل عن الشيفتات.",
    workingDaysRequired: "اختر يوم عمل واحداً على الأقل قبل الحفظ.",
    employeeSchedule: "ربط الموظف بالشيفت",
    assignSchedule: "ربط الشيفت",
    effectiveSchedule: "الشيفت الفعّال",
    selectEmployee: "اختر موظفاً",
    selectSchedule: "اختر شيفتاً",
    effectiveFrom: "ساري من",
    effectiveTo: "ساري حتى",
    scheduleAssigned: "تم ربط الشيفت",
    scheduleAssignmentFailed: "تعذر حفظ ربط الشيفت.",
    noEffectiveSchedule: "لا يوجد شيفت فعّال",
    noEffectiveScheduleDetail: "لا يوجد ربط شيفت نشط لهذا الموظف.",
    shiftOrganization: "تنظيم الشيفتات",
    shiftOrganizationDetail:
      "أنشئ وأدر الشيفتات ومواعيدها والاستراحات وفترات السماح والإضافي والشيفت الافتراضي للشركة.",
    employeeShiftAssignment: "ربط الموظفين بالشيفتات",
    employeeShiftAssignmentDetail:
      "اربط الشيفتات بالموظفين وحدد تواريخ السريان والربط الجماعي وراجع سجل التعيينات.",
    automaticOvertimeCalculation: "احتساب الإضافي تلقائيًا",
    automaticOvertimeCalculationDetail:
      "عند التعطيل، لا تتحول الدقائق الإضافية تلقائيًا إلى إضافي.",
    automaticOvertime: "الإضافي تلقائيًا",
    useCompanyDefault: "استخدام إعداد الشركة",
    enabled: "مفعّل",
    disabledSetting: "معطّل",
    holidaysTitle: "عطلات الشركة",
    holidaysDetail:
      "أدر تواريخ عدم العمل الخاصة بالمستأجر في مكان واحد لاستخدامها في حسابات الحضور.",
    addHoliday: "إضافة عطلة",
    editHoliday: "تعديل العطلة",
    holidayName: "اسم العطلة",
    holidayDate: "التاريخ",
    recurringHoliday: "تتكرر سنوياً",
    noHolidays: "لا توجد عطلات للشركة",
    noHolidaysDetail: "أضف التواريخ التي تعتمدها الشركة كأيام غير عمل.",
    holidayCreated: "تم إنشاء العطلة",
    holidayUpdated: "تم تحديث العطلة",
    holidayDeleted: "تم حذف العطلة",
    holidaySaveFailed: "تعذر حفظ العطلة.",
    holidayDeleteFailed: "تعذر حذف العطلة.",
    holidayDateConflict: "توجد عطلة بالفعل في هذا التاريخ.",
    confirmDeleteHoliday: "حذف هذه العطلة؟",
    biometricProviders: "موفرو البصمة",
    biometricProvidersDetail:
      "موصلات موفري الخدمة المتاحة لمساحة العمل. لا تظهر بيانات الاعتماد هنا.",
    providerAvailable: "متاح",
    providerUnavailable: "غير متاح",
    providerMockNote:
      "موفر الاختبار الحتمي للتحقق المحلي ولا يمثل أجهزة فعلية.",
    syncHistory: "سجل المزامنة",
    syncHistoryDetail: "راجع نشاط الموفر ونتائج المزامنة غير الحساسة.",
    noSyncHistory: "لا يوجد سجل مزامنة",
    noSyncHistoryDetail: "شغّل عملية مزامنة مدعومة لعرض النتائج هنا.",
    chooseDeviceForHistory: "اختر جهازاً لعرض سجله.",
    operation: "العملية",
    eventsReceived: "الأحداث المستلمة",
    eventsProcessed: "الأحداث المعالجة",
    errorCount: "الأخطاء",
    startedAt: "بدأت",
    completedAt: "اكتملت",
    provider: "الموفر",
    employeeSync: "مزامنة الموظفين",
    attendanceSync: "مزامنة الحضور",
    fullSync: "مزامنة كاملة",
    sync: "مزامنة",
    syncEmployees: "مزامنة الموظفين",
    syncAttendance: "مزامنة الحضور",
    syncing: "جارٍ المزامنة…",
    syncStarted: "تم طلب المزامنة",
    syncFailed: "فشلت المزامنة",
    connectionStatus: "حالة الاتصال",
    integrationStatus: "حالة التكامل",
    mappedEmployees: "الموظفون المرتبطون",
    lastSync: "آخر مزامنة",
    deviceStatus: "حالة الجهاز",
    refreshHistory: "تحديث السجل",
    connectionTestResult: "نتيجة اختبار الاتصال",
  },
} as const;
type Task5CopyKey = keyof typeof task5Copy.en;
const dictionaries: Record<Locale, Partial<Record<AppCopyKey, string>>> = {
  en: {
    ...copy.en,
    ...pageCopy.en,
    ...commonCopy.en,
    ...part4Copy.en,
    ...reportCopy.en,
    ...importCopy.en,
    ...task5Copy.en,
  },
  ar: {
    ...copy.en,
    ...copy.ar,
    ...pageCopy.ar,
    ...commonCopy.ar,
    ...part4Copy.ar,
    ...reportCopy.ar,
    ...importCopy.ar,
    ...task5Copy.ar,
  },
  fr: {
    ...copy.en,
    ...copy.fr,
    ...pageCopy.fr,
    ...commonCopy.fr,
    ...part4Copy.fr,
    ...reportCopy.fr,
    ...importCopy.fr,
    ...task5Copy.en,
  },
  de: {
    ...copy.en,
    ...copy.de,
    ...pageCopy.de,
    ...commonCopy.de,
    ...part4Copy.de,
    ...reportCopy.de,
    ...importCopy.de,
    ...task5Copy.en,
  },
};
const I18nContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: AppCopyKey) => string;
}>({
  locale: "en",
  setLocale: () => undefined,
  t: (key) => dictionaries.en[key] ?? key,
});
function useI18n() {
  return useContext(I18nContext);
}

const attendanceRuleFieldCopyKeys: Partial<Record<string, AppCopyKey>> = {
  workStart: "workStarts",
  workEnd: "workEnds",
  scheduleName: "scheduleName",
  requiredHours: "requiredHours",
  graceMinutes: "gracePeriod",
  earlyCheckoutGraceMinutes: "earlyDepartureGrace",
  overtimeAfterMinutes: "overtimeAfter",
  overtimeEligible: "overtimeEligible",
  overtimeMethod: "historyOvertimeMethod",
  overtimeMultiplier: "historyOvertimeMultiplier",
  hourlyRateDivisor: "historyHourlyRateDivisor",
  lateDeductionMethod: "historyLateDeductionMethod",
  lateDeductionFactor: "historyLateDeductionFactor",
  earlyCheckoutDeductionFactor: "historyEarlyCheckoutDeductionFactor",
  absenceDeductionMethod: "historyAbsenceDeductionMethod",
  absenceDeductionFactor: "historyAbsenceDeductionFactor",
  latePenaltyMultiplier: "historyLatePenaltyMultiplier",
  earlyDeparturePenaltyMultiplier: "historyEarlyDeparturePenaltyMultiplier",
  absencePenaltyMultiplier: "historyAbsencePenaltyMultiplier",
  permissionCoversLate: "permissionCoversLate",
  permissionCoversEarly: "permissionCoversEarly",
  permissionCoveredMinutesMultiplier:
    "historyPermissionCoveredMinutesMultiplier",
  fullDayPermissionMultiplier: "historyFullDayPermissionMultiplier",
  holidayDates: "historyHolidayDates",
  holidayPeriods: "historyHolidayPeriods",
  weeklyMultipliers: "historyWeeklyMultipliers",
  absenceDeductsAnnualLeave: "historyAbsenceDeductsAnnualLeave",
  absenceLeaveDeductionTrigger: "historyAbsenceLeaveDeductionTrigger",
  absenceLeaveDeductionDays: "historyAbsenceLeaveDeductionDays",
  workingDays: "workingDays",
  gpsPolicy: "gpsPolicy",
  locationRadiusMeters: "locationRadius",
  annualLeaveEntitlement: "annualEntitlementDays",
  annualLeavePeriodStartMonth: "leaveYearStartsIn",
  annualLeaveAllowedMonths: "historyAnnualLeaveAllowedMonths",
  annualLeaveMonthlyDeductionLimit: "monthlyMaximumDeduction",
};

const attendanceRuleValueCopyKeys: Record<
  string,
  Partial<Record<string, AppCopyKey>>
> = {
  gpsPolicy: {
    disabled: "disabled",
    optional: "optional",
    required: "required",
  },
  absenceLeaveDeductionTrigger: {
    unexcused_absence: "unapprovedAbsencesOnly",
    any_absence: "anyAbsenceMissing",
  },
  overtimeMethod: {
    multiplier: "historyValueMultiplier",
  },
  lateDeductionMethod: {
    hourly_rate: "historyValueHourlyRate",
  },
  absenceDeductionMethod: {
    daily_rate: "historyValueDailyRate",
  },
  multiplierSource: {
    standard: "historyValueStandard",
  },
};

const attendanceRuleDayCopyKeys: Record<string, AppCopyKey> = {
  Sun: "daySun",
  Mon: "dayMon",
  Tue: "dayTue",
  Wed: "dayWed",
  Thu: "dayThu",
  Fri: "dayFri",
  Sat: "daySat",
};

function localizedAttendanceRuleField(
  fieldName: string,
  t: (key: AppCopyKey) => string,
) {
  const copyKey = attendanceRuleFieldCopyKeys[fieldName];
  return copyKey ? t(copyKey) : fieldName;
}

function localizedAttendanceRuleValue(
  fieldName: string,
  value: unknown,
  locale: Locale,
  t: (key: AppCopyKey) => string,
): string {
  if (value === null || value === undefined) return t("notAvailable");
  if (typeof value === "boolean") {
    return value ? t("enabled") : t("disabledSetting");
  }
  if (Array.isArray(value)) {
    if (
      value.some(
        (item) => item !== null && typeof item === "object",
      )
    ) {
      return JSON.stringify(value);
    }
    return value
      .map((item) => {
        if (fieldName === "workingDays" && typeof item === "string") {
          return t(attendanceRuleDayCopyKeys[item] ?? "notAvailable");
        }
        if (
          (fieldName === "holidayDates" || fieldName === "holidayPeriods") &&
          typeof item === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(item)
        ) {
          return localizedAttendanceRuleDate(item, locale);
        }
        return String(item);
      })
      .join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  const copyKey = attendanceRuleValueCopyKeys[fieldName]?.[String(value)];
  return copyKey ? t(copyKey) : String(value);
}

function localizedAttendanceRuleDate(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
function queryStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : null;
}
function apiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;
  const data = (error as { data?: unknown }).data;
  if (
    data &&
    typeof data === "object" &&
    typeof (data as { error?: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return fallback;
}
function activeIntlLocale() {
  const locale = document.documentElement.lang || "en";
  return locale === "ar" ? "ar-EG" : locale;
}
function money(value: number | undefined, currency = "EGP") {
  return new Intl.NumberFormat(activeIntlLocale(), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}
function date(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(activeIntlLocale(), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
function time(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(activeIntlLocale(), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
function periodLabel(value?: string) {
  if (!value) return "—";
  const match = /^([A-Za-z]+)\s+(\d{4})$/.exec(value.trim());
  if (!match) return value;
  const month = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ].indexOf(match[1].toLowerCase());
  if (month < 0) return value;
  return new Intl.DateTimeFormat(activeIntlLocale(), {
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(Number(match[2]), month, 1)));
}

function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "quiet" | "outline" | "danger";
}) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:brightness-110",
        variant === "quiet" &&
          "text-muted-foreground hover:bg-muted hover:text-foreground",
        variant === "outline" &&
          "border border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/40",
        variant === "danger" &&
          "border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15",
        className,
      )}
    >
      {children}
    </button>
  );
}
function Card({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      {...props}
      className={cn(
        "min-w-0 rounded-xl border border-border bg-card shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {children}
    </section>
  );
}
function Badge({
  children,
  tone = "neutral",
  ...props
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "accent";
}) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-[.08em]",
        tone === "good" && "bg-primary/10 text-primary",
        tone === "warn" && "bg-accent/15 text-primary-dark",
        tone === "bad" && "bg-destructive/10 text-destructive",
        tone === "accent" && "bg-secondary/10 text-secondary",
        tone === "neutral" && "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}
function Empty({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center p-8 text-center">
      <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
        <Database size={18} />
      </div>
      <h3 className="font-display font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{detail}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
function ErrorState({ retry }: { retry: () => void }) {
  const { locale, t } = useI18n();
  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-2 p-6 text-center">
      <AlertCircle className="text-destructive" size={22} />
      <p className="text-sm font-semibold">{t("operationalFeedLoadFailed")}</p>
      <p className="text-xs text-muted-foreground">{t("checkWorkspace")}</p>
      <Button variant="outline" onClick={retry}>
        {t("retry")}
      </Button>
    </div>
  );
}
function SectionTitle({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow?: string;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mobile-section-title mb-6 flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[.16em] text-primary">
          {eyebrow}
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {detail && (
          <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
        )}
      </div>
      {action}
    </div>
  );
}
function Status({ value }: { value: string }) {
  const { t } = useI18n();
  const tone = [
    "active",
    "connected",
    "approved",
    "present",
    "calculated",
    "finalized",
    "configured",
    "completed",
  ].includes(value)
    ? "good"
    : [
          "attention",
          "pending",
          "trial",
          "draft",
          "syncing",
          "incomplete",
          "late",
          "not_configured",
          "adapter_pending",
          "unavailable",
        ].includes(value)
      ? "warn"
      : [
            "rejected",
            "offline",
            "suspended",
            "past_due",
            "absent",
            "outside_geofence",
            "cancelled",
            "inactive",
          ].includes(value)
        ? "bad"
        : "neutral";
  const statusKey: Record<string, AppCopyKey> = {
    active: "statusActive",
    inactive: "statusInactive",
    locked: "statusLocked",
    connected: "statusConnected",
    approved: "statusApproved",
    present: "statusPresent",
    late: "statusLate",
    calculated: "statusCalculated",
    finalized: "statusFinalized",
    configured: "statusConfigured",
    completed: "statusCompleted",
    attention: "statusAttention",
    pending: "statusPending",
    trial: "statusTrial",
    draft: "statusDraft",
    syncing: "statusSyncing",
    incomplete: "statusIncomplete",
    rejected: "statusRejected",
    offline: "statusOffline",
    suspended: "statusSuspended",
    past_due: "statusPastDue",
    absent: "statusAbsent",
    outside_geofence: "statusOutsideGeofence",
    not_configured: "statusNotConfigured",
    adapter_pending: "statusAdapterPending",
    unavailable: "statusUnavailable",
    cancelled: "statusCancelled",
    on_leave: "statusOnLeave",
    holiday: "statusHoliday",
  };
  return (
    <Badge tone={tone as any}>
      {statusKey[value] ? t(statusKey[value]) : value.replaceAll("_", " ")}
    </Badge>
  );
}

function statusLabel(value: string, t: (key: AppCopyKey) => string) {
  const keys: Record<string, AppCopyKey> = {
    active: "statusActive",
    inactive: "statusInactive",
    present: "statusPresent",
    late: "statusLate",
    absent: "statusAbsent",
    on_leave: "statusOnLeave",
    incomplete: "statusIncomplete",
    holiday: "statusHoliday",
    pending: "statusPending",
    approved: "statusApproved",
    rejected: "statusRejected",
    cancelled: "statusCancelled",
    draft: "statusDraft",
    calculated: "calculated",
    finalized: "statusFinalized",
    locked: "statusLocked",
  };
  return keys[value] ? t(keys[value]) : value.replaceAll("_", " ");
}

function severityLabel(value: string) {
  const { t } = useI18n();
  const key: Record<string, AppCopyKey> = {
    info: "severityInfo",
    warning: "severityWarning",
    critical: "severityCritical",
  };
  return key[value] ? t(key[value]) : value;
}

function featureLabel(value: string) {
  const { t } = useI18n();
  const key: Record<string, AppCopyKey> = {
    gps_attendance: "featureGpsAttendance",
    payroll_foundation: "featurePayrollFoundation",
    advanced_reports: "featureAdvancedReports",
  };
  return key[value] ? t(key[value]) : value.replaceAll("_", " ");
}

function roleLabel(value: string, t: (key: AppCopyKey) => string) {
  const key: Record<string, AppCopyKey> = {
    employee: "roleEmployee",
    manager: "roleManager",
    company_owner: "roleCompanyOwner",
    platform_owner: "rolePlatformOwner",
  };
  return key[value] ? t(key[value]) : value.replaceAll("_", " ");
}

function requestTypeLabel(value: string, t: (key: AppCopyKey) => string) {
  const key: Record<string, AppCopyKey> = {
    annual: "annualLeave",
    sick: "sickLeave",
    short_absence: "shortAbsence",
    late_arrival: "lateArrival",
    early_departure: "earlyDeparture",
    remote_work: "remoteWork",
    personal_errand: "personalErrand",
    "Annual leave": "annualLeave",
    "Sick leave": "sickLeave",
    "Short absence": "shortAbsence",
    "Late arrival": "lateArrival",
    "Early departure": "earlyDeparture",
    "Remote work": "remoteWork",
    "Personal errand": "personalErrand",
  };
  return key[value] ? t(key[value]) : value;
}

function localizedValue(
  value: string | undefined,
  keys: Record<string, AppCopyKey>,
  t: (key: AppCopyKey) => string,
) {
  return value && keys[value] ? t(keys[value]) : value || "—";
}

function departmentLabel(
  value: string | undefined,
  _t: (key: AppCopyKey) => string,
) {
  return value || "—";
}

function branchLabel(
  value: string | undefined,
  t: (key: AppCopyKey) => string,
) {
  return localizedValue(
    value,
    {
      "Alexandria Hub": "branchAlexandriaHub",
      "Cairo HQ": "branchCairoHq",
    },
    t,
  );
}

function effectiveScheduleName(
  assignments:
    | Array<{
        employeeId: string;
        scheduleName: string;
        effectiveFrom: string;
        effectiveTo: string | null;
      }>
    | undefined,
  schedules:
    | Array<{
        name: string;
        isDefault?: boolean;
      }>
    | undefined,
  employeeId: string,
) {
  const today = new Date().toISOString().slice(0, 10);
  const assignment = (assignments ?? [])
    .filter(
      (item) =>
        item.employeeId === employeeId &&
        item.effectiveFrom <= today &&
        (!item.effectiveTo || item.effectiveTo >= today),
    )
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0];
  return (
    assignment?.scheduleName ||
    schedules?.find((schedule) => schedule.isDefault)?.name ||
    ""
  );
}

function cityLabel(value: string | undefined, t: (key: AppCopyKey) => string) {
  return localizedValue(
    value,
    {
      Alexandria: "cityAlexandria",
      Cairo: "cityCairo",
    },
    t,
  );
}

function planLabel(value: string | undefined, t: (key: AppCopyKey) => string) {
  return localizedValue(value, { Business: "planBusiness" }, t);
}

function deviceNameLabel(
  value: string | undefined,
  t: (key: AppCopyKey) => string,
) {
  return localizedValue(
    value,
    { "Cairo entrance reader": "deviceCairoEntranceReader" },
    t,
  );
}

function manufacturerLabel(
  value: string | undefined,
  t: (key: AppCopyKey) => string,
) {
  return localizedValue(
    value,
    { "Generic biometric reader": "manufacturerGenericBiometricReader" },
    t,
  );
}

function modelLabel(value: string | undefined, t: (key: AppCopyKey) => string) {
  return localizedValue(value, { "Adapter pending": "modelAdapterPending" }, t);
}

function deviceNoteLabel(
  value: string | undefined,
  t: (key: AppCopyKey) => string,
) {
  return value ===
    "Hardware connector is not configured. No attendance sync is being simulated."
    ? t("hardwareConnectorNote")
    : value || "";
}

function authLabel(
  locale: Locale,
  key:
    | "title"
    | "detail"
    | "mobileNumber"
    | "mobilePlaceholder"
    | "passwordPlaceholder"
    | "username"
    | "password"
    | "login"
    | "signingIn"
    | "invalid"
    | "language"
    | "switchToEnglish"
    | "switchToArabic"
    | "secureAccess"
    | "brandHeading"
    | "brandDetail"
    | "brandName"
    | "sessionProtected"
    | "showPassword"
    | "hidePassword"
    | "logout"
    | "accountCreated"
    | "temporaryPassword"
    | "copyPassword"
    | "copied"
    | "loading"
    | "accountsCount"
    | "shownOnce"
    | "optional"
    | "inactive"
    | "permissionsCount"
    | "loadFailed"
    | "createFailed"
    | "usernameInvalid"
    | "passwordTooShort"
    | "resetFailed"
    | "createStaff"
    | "staffAccounts"
    | "employeeName"
    | "employeeNameInvalid"
    | "phoneNumber"
    | "phoneInvalid"
    | "role"
    | "permissions"
    | "selectAll"
    | "deselectAll"
    | "active"
    | "save"
    | "resetPassword"
    | "editPermissions"
    | "savePermissions"
    | "viewAccount"
    | "editAccount"
    | "newPassword"
    | "saveAccount"
    | "accountUpdated"
    | "accountUpdateFailed"
    | "loginUsername"
    | "accountStatus"
    | "permissionsUpdated"
    | "permissionsUpdateFailed"
    | "managementDetail"
    | "accountManagement",
) {
  const labels: Record<"en" | "ar", Record<string, string>> = {
    en: {
      title: "Sign in to VAR HR",
      detail: "Use your account credentials to access the right workspace.",
      mobileNumber: "Mobile number",
      mobilePlaceholder: "Enter your phone number",
      passwordPlaceholder: "Enter your password",
      username: "Username",
      password: "Password",
      login: "Sign in",
      signingIn: "Signing in…",
      invalid: "Invalid username or password.",
      language: "Language",
      switchToEnglish: "English",
      switchToArabic: "Arabic",
      secureAccess: "Secure access",
      brandHeading: "A clearer way to run your people operations.",
      brandDetail: "People operations, made precise.",
      brandName: "VAR HR",
      sessionProtected: "Secure login session",
      showPassword: "Show password",
      hidePassword: "Hide password",
      logout: "Sign out",
      accountCreated: "Account created",
      temporaryPassword: "Temporary password",
      copyPassword: "Copy password",
      copied: "Copied",
      loading: "Loading…",
      accountsCount: "{count} accounts",
      shownOnce: "This value is shown once. It is not stored in plaintext.",
      optional: "optional",
      inactive: "Inactive",
      permissionsCount: "permissions",
      loadFailed: "Could not load account management.",
      createFailed: "Could not create account.",
      usernameInvalid: "Please enter a valid name using at least 3 characters.",
      passwordTooShort: "Password must contain at least 6 characters.",
      resetFailed: "Could not reset password.",
      createStaff: "Create staff account",
      staffAccounts: "Staff accounts",
      employeeName: "Employee Name",
      employeeNameInvalid: "Please enter an employee name.",
      phoneNumber: "Phone number",
      phoneInvalid: "Please enter a valid phone number.",
      role: "Job title",
      permissions: "Permissions",
      selectAll: "Select all",
      deselectAll: "Deselect all",
      active: "Active",
      save: "Save",
      resetPassword: "Reset password",
      editPermissions: "Manage permissions",
      savePermissions: "Save permissions",
      viewAccount: "View account",
      editAccount: "Edit account",
      newPassword: "New password",
      saveAccount: "Save changes",
      accountUpdated: "Account updated",
      accountUpdateFailed: "Could not update account.",
      loginUsername: "Login username",
      accountStatus: "Account status",
      permissionsUpdated: "Permissions updated",
      permissionsUpdateFailed: "Could not update permissions.",
      managementDetail:
        "Create staff accounts and grant only the access they need.",
      accountManagement: "Account management",
    },
    ar: {
      title: "تسجيل الدخول إلى VAR HR",
      detail: "استخدم بيانات حسابك للوصول إلى مساحة العمل المناسبة.",
      mobileNumber: "رقم الهاتف المحمول",
      mobilePlaceholder: "ادخل رقم هاتفك",
      passwordPlaceholder: "ادخل رقمك السري",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      login: "تسجيل الدخول",
      signingIn: "جارٍ تسجيل الدخول…",
      invalid: "اسم المستخدم أو كلمة المرور غير صحيحة.",
      language: "اللغة",
      switchToEnglish: "الإنجليزية",
      switchToArabic: "العربية",
      secureAccess: "وصول آمن",
      brandHeading: "إدارة موظفيك بطريقة أوضح.",
      brandDetail: "إدارة الأفراد بدقة.",
      brandName: "VAR HR",
      sessionProtected: "جلسة تسجيل دخول آمنة",
      showPassword: "إظهار كلمة المرور",
      hidePassword: "إخفاء كلمة المرور",
      logout: "تسجيل الخروج",
      accountCreated: "تم إنشاء الحساب",
      temporaryPassword: "كلمة المرور المؤقتة",
      copyPassword: "نسخ كلمة المرور",
      copied: "تم النسخ",
      loading: "جارٍ التحميل…",
      accountsCount: "{count} حسابات",
      shownOnce: "تظهر هذه القيمة مرة واحدة فقط ولا يتم تخزينها كنص صريح.",
      optional: "اختياري",
      inactive: "غير نشط",
      permissionsCount: "صلاحيات",
      loadFailed: "تعذر تحميل إدارة الحسابات.",
      createFailed: "تعذر إنشاء الحساب.",
      usernameInvalid: "يرجى إدخال اسم صحيح مكوّن من 3 أحرف على الأقل",
      passwordTooShort: "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل",
      resetFailed: "تعذر إعادة تعيين كلمة المرور.",
      createStaff: "إنشاء حساب موظف",
      staffAccounts: "حسابات الموظفين",
      employeeName: "اسم الموظف",
      employeeNameInvalid: "يرجى إدخال اسم الموظف.",
      phoneNumber: "رقم الهاتف",
      phoneInvalid: "يرجى إدخال رقم هاتف صحيح.",
      role: "المسمى الوظيفي",
      permissions: "الصلاحيات",
      selectAll: "تحديد الكل",
      deselectAll: "إلغاء تحديد الكل",
      active: "نشط",
      save: "حفظ",
      resetPassword: "إعادة تعيين كلمة المرور",
      editPermissions: "إدارة الصلاحيات",
      savePermissions: "حفظ الصلاحيات",
      viewAccount: "عرض الحساب",
      editAccount: "تعديل الحساب",
      newPassword: "كلمة المرور الجديدة",
      saveAccount: "حفظ التعديلات",
      accountUpdated: "تم تحديث الحساب",
      accountUpdateFailed: "تعذر تحديث الحساب.",
      loginUsername: "اسم المستخدم لتسجيل الدخول",
      accountStatus: "حالة الحساب",
      permissionsUpdated: "تم تحديث الصلاحيات",
      permissionsUpdateFailed: "تعذر تحديث الصلاحيات.",
      managementDetail:
        "أنشئ حسابات الموظفين وامنح كل حساب الصلاحيات التي يحتاجها فقط.",
      accountManagement: "إدارة الحسابات",
    },
  };
  return labels[locale === "ar" ? "ar" : "en"][key];
}

function permissionLabel(
  locale: Locale,
  permission: { key: string; label: string },
): string {
  if (locale !== "ar") return permission.label;
  const labels: Record<string, string> = {
    "employees.view": "عرض الموظفين",
    "employees.manage": "إدارة الموظفين",
    "employees.credentials": "بيانات اعتماد الموظفين",
    "attendance.view": "عرض الحضور",
    "attendance.correct": "تصحيح الحضور",
    "leave.approve": "اعتماد الإجازات",
    "leave.create": "إنشاء طلبات الإجازات",
    "permissions.create": "إنشاء طلبات الأذونات",
    "permissions.approve": "اعتماد الأذونات",
    "payroll.view": "عرض الرواتب",
    "reports.view": "عرض التقارير",
    "reports.export": "تصدير التقارير",
    devices: "الأجهزة",
    "sync-history": "سجل المزامنة",
     schedules: "تنظيم الشيفتات",
    holidays: "العطلات",
    "organization.manage": "إدارة الهيكل التنظيمي",
    "dashboard.view": "عرض لوحة المعلومات",
    "employees.create": "إنشاء الموظفين",
    "employees.edit": "تعديل الموظفين",
    "employees.archive": "أرشفة الموظفين",
    "departments.view": "عرض الأقسام",
    "departments.manage": "إدارة الأقسام",
    "branches.view": "عرض الفروع",
    "branches.manage": "إدارة الفروع",
    "attendance.rules.view": "عرض قواعد الحضور",
    "attendance.rules.manage": "إدارة قواعد الحضور",
    "schedules.view": "عرض تنظيم الشيفتات",
    "schedules.manage": "إدارة تنظيم الشيفتات",
    "holidays.view": "عرض العطلات",
    "holidays.manage": "إدارة العطلات",
    "leave.view": "عرض الإجازات",
    "leave.manage": "إدارة إعدادات الإجازات",
    "payroll.manage": "إدارة الرواتب",
    "devices.view": "عرض الأجهزة",
    "devices.manage": "إدارة الأجهزة",
    "sync-history.view": "عرض سجل المزامنة",
    "locations.view": "عرض المواقع",
    "locations.manage": "إدارة المواقع",
    "backups.view": "عرض النسخ الاحتياطية",
    "backups.manage": "إدارة النسخ الاحتياطية",
    "company.settings": "إعدادات الشركة",
    "audit.view": "عرض سجل التدقيق",
  };
  return labels[permission.key] ?? permission.label;
}

function permissionDescription(
  locale: Locale,
  permission: { key: string; description?: string },
): string {
  if (locale !== "ar") return permission.description ?? "";
  const descriptions: Record<string, string> = {
    "employees.view": "عرض بيانات الموظفين.",
    "employees.manage": "إضافة الموظفين وتعديلهم وإدارتهم.",
    "employees.credentials": "إدارة بيانات اعتماد الموظفين.",
    "attendance.view": "عرض سجلات الحضور والانصراف.",
    "attendance.correct": "تصحيح سجلات الحضور.",
    "leave.create": "إرسال طلبات الإجازات.",
    "leave.approve": "اعتماد طلبات الإجازات.",
    "permissions.create": "إرسال طلبات الأذونات.",
    "permissions.approve": "اعتماد طلبات الأذونات.",
    "payroll.view": "عرض بيانات وحسابات الرواتب.",
    "reports.view": "عرض التقارير.",
    "reports.export": "تصدير التقارير.",
    devices: "إدارة إعدادات الأجهزة.",
    "sync-history": "عرض سجل المزامنة.",
    schedules: "إدارة تنظيم الشيفتات.",
    holidays: "إدارة عطلات الشركة.",
    "organization.manage": "إدارة الأقسام والفروع والهيكل التنظيمي.",
    "dashboard.view": "عرض لوحة معلومات الشركة.",
    "employees.create": "إنشاء سجلات الموظفين.",
    "employees.edit": "تعديل سجلات الموظفين.",
    "employees.archive": "أرشفة سجلات الموظفين.",
    "departments.view": "عرض الأقسام وسجلاتها.",
    "departments.manage": "إنشاء الأقسام وتعديلها وأرشفتها.",
    "branches.view": "عرض الفروع وسجلاتها.",
    "branches.manage": "إنشاء الفروع وتعديلها وأرشفتها.",
    "attendance.rules.view": "عرض قواعد الحضور وسجل التغييرات.",
    "attendance.rules.manage": "إنشاء قواعد الحضور وتعديلها.",
    "schedules.view": "عرض تنظيم الشيفتات والتعيينات.",
    "schedules.manage": "إنشاء الجداول والتعيينات وتعديلها.",
    "holidays.view": "عرض عطلات الشركة.",
    "holidays.manage": "إنشاء عطلات الشركة وتعديلها وحذفها.",
    "leave.view": "عرض طلبات وأرصدة الإجازات.",
    "leave.manage": "إدارة سياسات وإعدادات الإجازات.",
    "payroll.manage": "إجراء وإدارة سجلات الرواتب.",
    "devices.view": "عرض الأجهزة وحالتها.",
    "devices.manage": "إدارة الأجهزة والربط الحيوي.",
    "sync-history.view": "عرض سجل مزامنة الأجهزة.",
    "locations.view": "عرض مواقع الحضور عبر GPS.",
    "locations.manage": "إنشاء مواقع الحضور وتعديلها.",
    "backups.view": "عرض سجلات النسخ الاحتياطية.",
    "backups.manage": "إنشاء النسخ الاحتياطية واستعادتها.",
    "company.settings": "إدارة إعدادات الشركة.",
    "audit.view": "عرض سجل التدقيق وتاريخ الحسابات.",
  };
  return descriptions[permission.key] ?? permission.description ?? "";
}

function PermissionChecklist({
  permissions,
  selected,
  locale,
  onChange,
  idPrefix = "",
}: {
  permissions: Array<{ key: string; label: string; description?: string }>;
  selected: string[];
  locale: Locale;
  onChange: (key: string, enabled: boolean) => void;
  idPrefix?: string;
}) {
  const grouped = permissions.reduce<Record<string, typeof permissions>>(
    (groups, permission) => {
      const group = permission.key.split(".")[0];
      (groups[group] ??= []).push(permission);
      return groups;
    },
    {},
  );
  const groupLabels: Record<string, [string, string]> = {
    employees: ["Employees", "الموظفون"],
    attendance: ["Attendance", "الحضور"],
    schedules: ["Schedules & assignments", "الجداول والتعيينات"],
    organization: ["Organization", "الهيكل التنظيمي"],
    company: ["Company", "الشركة"],
    sync: ["Synchronization", "المزامنة"],
  };
  return (
    <div className="mt-2 max-h-72 space-y-4 overflow-auto rounded-lg border border-border p-3">
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          <p className="mb-2 text-xs font-bold uppercase tracking-[.08em] text-muted-foreground">
            {groupLabels[group]?.[locale === "ar" ? 1 : 0] ??
              group.charAt(0).toUpperCase() + group.slice(1)}
          </p>
          <div className="space-y-2">
            {items.map((permission) => (
              <label
                className="flex items-start gap-2 text-sm"
                key={`${idPrefix}${permission.key}`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(permission.key)}
                  onChange={(event) =>
                    onChange(permission.key, event.target.checked)
                  }
                />
                <span>
                  {permissionLabel(locale, permission)}
                  {permissionDescription(locale, permission) && (
                    <span className="block text-xs text-muted-foreground">
                      {permissionDescription(locale, permission)}
                    </span>
                  )}
                  <span className="block text-xs text-muted-foreground">
                    {permission.key}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function accountValidationError(
  locale: Locale,
  error: unknown,
): { field: "fullName" | "primaryPhone" | "password"; message: string } | null {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("fullName")) {
    return {
      field: "fullName",
      message: authLabel(locale, "employeeNameInvalid"),
    };
  }
  if (message.includes("primaryPhone") || message.includes("phone number")) {
    return {
      field: "primaryPhone",
      message: authLabel(locale, "phoneInvalid"),
    };
  }
  if (message.includes("password") && message.includes("6")) {
    return {
      field: "password",
      message: authLabel(locale, "passwordTooShort"),
    };
  }
  return null;
}

function BrandLogo({
  variant,
  source: sourceOverride,
  className = "",
  alt,
}: {
  variant: "square" | "short" | "horizontal";
  source?: string;
  className?: string;
  alt?: string;
}) {
  const source =
    sourceOverride ||
    (variant === "square"
      ? squareLogo
      : variant === "short"
        ? shortLogo
        : horizontalLogo);
  return (
    <img
      src={source}
      alt={alt || "VAR HR"}
      className={`block h-auto max-w-full object-contain ${className}`}
    />
  );
}

async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "Request failed.");
  return data as T;
}

type EmployeeCredential = {
  username: string;
  generatedPassword: string;
};

function employeeAccountCopy(locale: Locale) {
  const labels = {
    en: {
      credentialsTitle: "Employee login credentials",
      credentialsDetail:
        "Save or share these credentials now. This newly generated password will not be shown again.",
      varHrCredentials: "VAR HR login credentials",
      companyName: "Company",
      employeeName: "Employee",
      loginUsername: "Phone / login username",
      generatedPassword: "Generated password",
      newlyGeneratedPassword: "Newly generated password",
      currentPassword: "Current password",
      copyCredentials: "Copy credentials",
      copyPassword: "Copy password",
      copied: "Copied",
      showPassword: "Show password",
      hidePassword: "Hide password",
      shareWhatsApp: "Share via WhatsApp",
      invalidPhone: "WhatsApp sharing needs a valid employee phone number.",
      close: "Close",
      changePassword: "Change employee password",
      passwordHint:
        "Use your current password and choose a new password of at least 6 characters.",
      confirmPassword: "Confirm new password",
      savePassword: "Save new password",
      passwordUpdated: "Password updated.",
      passwordFailed: "Could not update your password.",
      currentPasswordInvalid: "The current password is incorrect.",
      passwordMismatch: "Passwords do not match.",
      passwordTooShort: "Password must contain at least 6 characters.",
      payroll: "My payroll",
      payrollDetail: "Your latest calculated or finalized payroll statement.",
      noPayroll: "No payroll statement is available yet.",
      period: "Payroll period",
      calculatedAt: "Calculated",
      gross: "Gross salary",
      additions: "Additions",
      deductions: "Deductions",
      net: "Net salary",
      resetPassword: "Reset password",
      accountStatus: "Account status",
      active: "Active",
      inactive: "Inactive",
      accountNotFound: "No linked login account was found.",
      regenerated: "A new password was generated.",
    },
    ar: {
      credentialsTitle: "بيانات دخول الموظف",
      credentialsDetail:
        "احفظ أو شارك البيانات الآن. لن تظهر كلمة المرور الجديدة المولدة مرة أخرى.",
      varHrCredentials: "بيانات تسجيل الدخول إلى VAR HR",
      companyName: "الشركة",
      employeeName: "الموظف",
      loginUsername: "الهاتف / اسم تسجيل الدخول",
      generatedPassword: "كلمة المرور المولدة",
      newlyGeneratedPassword: "كلمة المرور الجديدة المولدة",
      currentPassword: "كلمة المرور الحالية",
      copyCredentials: "نسخ بيانات الدخول",
      copyPassword: "نسخ كلمة المرور",
      copied: "تم النسخ",
      showPassword: "إظهار كلمة المرور",
      hidePassword: "إخفاء كلمة المرور",
      shareWhatsApp: "المشاركة عبر واتساب",
      invalidPhone: "تحتاج مشاركة واتساب إلى رقم هاتف موظف صحيح.",
      close: "إغلاق",
      changePassword: "تغيير كلمة مرور الموظف",
      passwordHint:
        "استخدم كلمة المرور الحالية واختر كلمة جديدة من 6 أحرف على الأقل.",
      confirmPassword: "تأكيد كلمة المرور الجديدة",
      savePassword: "حفظ كلمة المرور الجديدة",
      passwordUpdated: "تم تحديث كلمة المرور.",
      passwordFailed: "تعذر تحديث كلمة المرور.",
      currentPasswordInvalid: "كلمة المرور الحالية غير صحيحة.",
      passwordMismatch: "كلمتا المرور غير متطابقتين.",
      passwordTooShort: "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل.",
      payroll: "راتبي",
      payrollDetail: "آخر كشف راتب تم احتسابه أو اعتماده.",
      noPayroll: "لا يوجد كشف راتب متاح حتى الآن.",
      period: "فترة الراتب",
      calculatedAt: "تاريخ الاحتساب",
      gross: "الراتب الإجمالي",
      additions: "الإضافات",
      deductions: "الخصومات",
      net: "صافي الراتب",
      resetPassword: "إعادة تعيين كلمة المرور",
      accountStatus: "حالة الحساب",
      active: "نشط",
      inactive: "غير نشط",
      accountNotFound: "لم يتم العثور على حساب دخول مرتبط.",
      regenerated: "تم توليد كلمة مرور جديدة.",
    },
    fr: {
      credentialsTitle: "Identifiants de connexion de l’employé",
      credentialsDetail:
        "Enregistrez ou partagez ces identifiants maintenant. Ce nouveau mot de passe généré ne sera plus affiché.",
      varHrCredentials: "Identifiants de connexion VAR HR",
      companyName: "Entreprise",
      employeeName: "Employé",
      loginUsername: "Téléphone / identifiant",
      generatedPassword: "Mot de passe généré",
      newlyGeneratedPassword: "Nouveau mot de passe généré",
      currentPassword: "Mot de passe actuel",
      copyCredentials: "Copier les identifiants",
      copyPassword: "Copier le mot de passe",
      copied: "Copié",
      showPassword: "Afficher le mot de passe",
      hidePassword: "Masquer le mot de passe",
      shareWhatsApp: "Partager sur WhatsApp",
      invalidPhone: "Le partage WhatsApp nécessite un numéro valide.",
      close: "Fermer",
      changePassword: "Changer le mot de passe de l’employé",
      passwordHint:
        "Utilisez le mot de passe actuel et choisissez-en un nouveau de 6 caractères minimum.",
      confirmPassword: "Confirmer le nouveau mot de passe",
      savePassword: "Enregistrer le nouveau mot de passe",
      passwordUpdated: "Mot de passe mis à jour.",
      passwordFailed: "Impossible de mettre à jour le mot de passe.",
      currentPasswordInvalid: "Le mot de passe actuel est incorrect.",
      passwordMismatch: "Les mots de passe ne correspondent pas.",
      passwordTooShort: "Le mot de passe doit contenir au moins 6 caractères.",
      payroll: "Ma paie",
      payrollDetail: "Votre dernier bulletin calculé ou finalisé.",
      noPayroll: "Aucun bulletin de paie n’est encore disponible.",
      period: "Période de paie",
      calculatedAt: "Calculé",
      gross: "Salaire brut",
      additions: "Ajouts",
      deductions: "Retenues",
      net: "Salaire net",
      resetPassword: "Réinitialiser le mot de passe",
      accountStatus: "État du compte",
      active: "Actif",
      inactive: "Inactif",
      accountNotFound: "Aucun compte de connexion associé trouvé.",
      regenerated: "Un nouveau mot de passe a été généré.",
    },
    de: {
      credentialsTitle: "Anmeldedaten des Mitarbeitenden",
      credentialsDetail:
        "Speichern oder teilen Sie diese Daten jetzt. Das neu generierte Passwort wird nicht erneut angezeigt.",
      varHrCredentials: "VAR HR-Anmeldedaten",
      companyName: "Unternehmen",
      employeeName: "Mitarbeitende",
      loginUsername: "Telefon / Login-Benutzername",
      generatedPassword: "Generiertes Passwort",
      newlyGeneratedPassword: "Neu generiertes Passwort",
      currentPassword: "Aktuelles Passwort",
      copyCredentials: "Anmeldedaten kopieren",
      copyPassword: "Passwort kopieren",
      copied: "Kopiert",
      showPassword: "Passwort anzeigen",
      hidePassword: "Passwort ausblenden",
      shareWhatsApp: "Über WhatsApp teilen",
      invalidPhone: "Für die WhatsApp-Freigabe ist eine gültige Telefonnummer erforderlich.",
      close: "Schließen",
      changePassword: "Passwort des Mitarbeitenden ändern",
      passwordHint:
        "Geben Sie Ihr aktuelles Passwort ein und wählen Sie ein neues mit mindestens 6 Zeichen.",
      confirmPassword: "Neues Passwort bestätigen",
      savePassword: "Neues Passwort speichern",
      passwordUpdated: "Passwort aktualisiert.",
      passwordFailed: "Das Passwort konnte nicht aktualisiert werden.",
      currentPasswordInvalid: "Das aktuelle Passwort ist falsch.",
      passwordMismatch: "Die Passwörter stimmen nicht überein.",
      passwordTooShort: "Das Passwort muss mindestens 6 Zeichen enthalten.",
      payroll: "Meine Gehaltsabrechnung",
      payrollDetail: "Ihre letzte berechnete oder abgeschlossene Abrechnung.",
      noPayroll: "Noch keine Gehaltsabrechnung verfügbar.",
      period: "Abrechnungszeitraum",
      calculatedAt: "Berechnet",
      gross: "Bruttogehalt",
      additions: "Zuschläge",
      deductions: "Abzüge",
      net: "Nettogehalt",
      resetPassword: "Passwort zurücksetzen",
      accountStatus: "Kontostatus",
      active: "Aktiv",
      inactive: "Inaktiv",
      accountNotFound: "Kein verknüpftes Login-Konto gefunden.",
      regenerated: "Ein neues Passwort wurde generiert.",
    },
  } as const;
  return labels[locale];
}

function normalizeEgyptianWhatsAppPhone(phone?: string | null): string | null {
  const rawPhone = (phone ?? "").trim();
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return null;

  const hadInternationalPrefix =
    rawPhone.startsWith("+") || digits.startsWith("00");
  const normalizedInput = digits.startsWith("00") ? digits.slice(2) : digits;
  if (/^01[0125]\d{8}$/.test(normalizedInput)) {
    return `20${normalizedInput.slice(1)}`;
  }
  if (/^201[0125]\d{8}$/.test(normalizedInput)) {
    return normalizedInput;
  }

  // Preserve valid non-Egyptian numbers only when they were saved with an
  // explicit international prefix.
  return hadInternationalPrefix && /^\d{8,15}$/.test(normalizedInput)
    ? normalizedInput
    : null;
}

function CredentialReveal({
  credential,
  phone,
  companyName,
  employeeName,
  locale,
  onClose,
}: {
  credential: EmployeeCredential;
  phone?: string | null;
  companyName: string;
  employeeName: string;
  locale: Locale;
  onClose: () => void;
}) {
  const c = employeeAccountCopy(locale);
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const text = [
    c.varHrCredentials,
    `${c.companyName}: ${companyName}`,
    `${c.employeeName}: ${employeeName}`,
    `${c.loginUsername}: ${credential.username}`,
    `${c.newlyGeneratedPassword}: ${credential.generatedPassword}`,
  ].join("\n");
  const whatsappPhone = normalizeEgyptianWhatsAppPhone(phone);
  const copyCredentials = async () => {
    await navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    window.setTimeout(() => setCopiedCredentials(false), 1800);
  };
  const copyPassword = async () => {
    await navigator.clipboard.writeText(credential.generatedPassword);
    setCopiedPassword(true);
    window.setTimeout(() => setCopiedPassword(false), 1800);
  };
  return (
    <Modal title={c.credentialsTitle} onClose={onClose}>
      <div className="space-y-4" dir={locale === "ar" ? "rtl" : "ltr"}>
        <p className="text-sm leading-6 text-muted-foreground">
          {c.credentialsDetail}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label={c.loginUsername} value={credential.username} />
          <div className="rounded-lg bg-muted/60 p-3">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {c.newlyGeneratedPassword}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="min-w-0 flex-1 break-all font-medium">
                {passwordVisible
                  ? credential.generatedPassword
                  : "•".repeat(credential.generatedPassword.length)}
              </span>
              <Button
                type="button"
                variant="quiet"
                className="shrink-0 p-1.5"
                onClick={() => setPasswordVisible((visible) => !visible)}
                aria-label={
                  passwordVisible ? c.hidePassword : c.showPassword
                }
                title={passwordVisible ? c.hidePassword : c.showPassword}
              >
                {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button variant="quiet" onClick={onClose}>{c.close}</Button>
          <Button variant="outline" onClick={() => void copyCredentials()}>
            <Check size={16} />
            {copiedCredentials ? c.copied : c.copyCredentials}
          </Button>
          <Button variant="outline" onClick={() => void copyPassword()}>
            <Copy size={16} />
            {copiedPassword ? c.copied : c.copyPassword}
          </Button>
          <Button
            variant="outline"
            disabled={!whatsappPhone}
            title={!whatsappPhone ? c.invalidPhone : undefined}
            onClick={() => {
              if (!whatsappPhone) return;
              window.open(
                `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`,
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            {c.shareWhatsApp}
          </Button>
        </div>
        {!whatsappPhone && (
          <p role="alert" className="text-xs text-destructive">
            {c.invalidPhone}
          </p>
        )}
      </div>
    </Modal>
  );
}

function EmployeePasswordChange() {
  const auth = useAuth();
  const { locale } = useI18n();
  const c = employeeAccountCopy(locale);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 6) {
      toast.error(c.passwordTooShort);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(c.passwordMismatch);
      return;
    }
    setPending(true);
    try {
      await authRequest("/api/auth/employee/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(c.passwordUpdated);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(
        message.includes("current password") ? c.currentPasswordInvalid : c.passwordFailed,
      );
    } finally {
      setPending(false);
    }
  };
  return (
    <Card className="mt-6 border-primary/15 p-5">
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <KeyRound size={18} />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">{c.changePassword}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{c.passwordHint}</p>
        </div>
      </div>
      <form onSubmit={save} className="mt-4 grid gap-3 sm:grid-cols-3">
        <Field label={c.currentPassword} type="password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" required />
        <Field label={c.generatedPassword} type="password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" required min={6} />
        <Field label={c.confirmPassword} type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" required min={6} />
        <div className="sm:col-span-3 flex justify-end">
          <Button type="submit" disabled={pending}>{pending ? "…" : c.savePassword}</Button>
        </div>
      </form>
    </Card>
  );
}

function EmployeeCredentialManager({
  employeeId,
  phone,
  companyName,
  employeeName,
  canManage,
}: {
  employeeId: string;
  phone?: string | null;
  companyName: string;
  employeeName: string;
  canManage: boolean;
}) {
  const { locale } = useI18n();
  const c = employeeAccountCopy(locale);
  const [account, setAccount] = useState<AuthAccount | null>(null);
  const [credentials, setCredentials] = useState<EmployeeCredential | null>(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (!canManage) return;
    void authRequest<AuthAccount[]>("/api/auth/accounts")
      .then((accounts) =>
        setAccount(accounts.find((item) => item.employeeId === employeeId) ?? null),
      )
      .catch(() => setAccount(null));
  }, [canManage, employeeId]);
  if (!canManage) return null;
  const regenerate = async () => {
    if (!account) return;
    setPending(true);
    try {
      const result = await authRequest<EmployeeCredential>(
        `/api/auth/accounts/${account.id}/reset-password`,
        { method: "POST" },
      );
      setCredentials(result);
      toast.success(c.regenerated);
    } catch {
      toast.error(c.passwordFailed);
    } finally {
      setPending(false);
    }
  };
  return (
    <>
      <Card className="border-primary/15 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <KeyRound size={17} className="text-primary" />
              <h2 className="font-display text-lg font-semibold">{c.credentialsTitle}</h2>
            </div>
            {account ? (
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>{c.loginUsername}: <span className="font-medium text-foreground">{account.username}</span></p>
                <p>{c.accountStatus}: {account.active ? c.active : c.inactive}</p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">{c.accountNotFound}</p>
            )}
          </div>
          <Button
            variant="outline"
            disabled={!account || pending}
            onClick={() => void regenerate()}
          >
            <KeyRound size={16} />
            {pending ? "…" : c.resetPassword}
          </Button>
        </div>
      </Card>
      {credentials && (
        <CredentialReveal
          credential={credentials}
          phone={phone}
          companyName={companyName}
          employeeName={employeeName}
          locale={locale}
          onClose={() => setCredentials(null)}
        />
      )}
    </>
  );
}

function Login({
  onSignedIn,
  setupAvailable,
}: {
  onSignedIn: (account: AuthAccount) => void;
  setupAvailable: boolean;
}) {
  const { locale, setLocale } = useI18n();
  const loginLogo = locale === "ar" ? arabicLoginLogo : horizontalLogo;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = await authRequest<{ user: AuthAccount }>(
        "/api/auth/login",
        { method: "POST", body: JSON.stringify({ username, password }) },
      );
      onSignedIn(result.user);
    } catch {
      setError(authLabel(locale, "invalid"));
    } finally {
      setPending(false);
    }
  };
  const otherLocale = locale === "ar" ? "en" : "ar";
  return (
    <div
      className="login-shell min-h-[100dvh] bg-secondary px-4 py-5 text-sidebar-foreground sm:px-8 sm:py-8"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <div className="mx-auto grid min-h-[calc(100dvh-2.5rem)] max-w-5xl items-center gap-8 lg:min-h-[calc(100dvh-4rem)] lg:gap-10 lg:grid-cols-[1fr_440px]">
        <div className="hidden lg:block">
          <div className="w-full max-w-[300px] overflow-hidden rounded-xl bg-white p-2 shadow-sm">
            <BrandLogo
              variant="horizontal"
              source={loginLogo}
              className="w-full"
              alt={authLabel(locale, "brandName")}
            />
          </div>
          <div className="mt-12 max-w-md">
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05]">
              {authLabel(locale, "brandHeading")}
            </h1>
            <p className="mt-6 text-base leading-7 text-sidebar-foreground/60">
              {authLabel(locale, "brandDetail")}
            </p>
          </div>
        </div>
        <Card className="border-white/10 bg-card p-6 shadow-2xl sm:p-9">
          <div
            className="flex flex-row items-center justify-between"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <div className="lg:hidden">
              <BrandLogo
                variant="horizontal"
                source={loginLogo}
                className="w-[168px]"
                alt={authLabel(locale, "brandName")}
              />
            </div>
            <button
              type="button"
              className="ms-auto shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              onClick={() => setLocale(otherLocale as Locale)}
            >
              {locale === "ar"
                ? authLabel(locale, "switchToEnglish")
                : authLabel(locale, "switchToArabic")}
            </button>
          </div>
          <div className="mt-9">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
              {authLabel(locale, "secureAccess")}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
              {authLabel(locale, "title")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {authLabel(locale, "detail")}
            </p>
          </div>
          <form onSubmit={submit} className="mt-7 space-y-[18px]">
            <Field
              label={authLabel(locale, "mobileNumber")}
              name="username"
              value={username}
              onChange={setUsername}
              required
              autoComplete="username"
              placeholder={authLabel(locale, "mobilePlaceholder")}
              placeholderAlign={locale === "ar" ? "right" : undefined}
              authStyle
            />
            <Field
              label={authLabel(locale, "password")}
              name="password"
              type="password"
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
              placeholder={authLabel(locale, "passwordPlaceholder")}
              placeholderAlign={locale === "ar" ? "right" : undefined}
              showPasswordToggle
              showPasswordLabel={authLabel(locale, "showPassword")}
              hidePasswordLabel={authLabel(locale, "hidePassword")}
              authStyle
            />
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="h-12 w-full justify-center rounded-xl text-[15px]"
              disabled={pending}
            >
              {pending
                ? authLabel(locale, "signingIn")
                : authLabel(locale, "login")}
              <ArrowUpRight className="rtl:-scale-x-100" size={16} />
            </Button>
          </form>
          {setupAvailable && (
            <Link
              href="/setup"
              className="mt-5 block text-center text-xs font-semibold text-primary hover:underline"
            >
              {locale === "ar"
                ? "إعداد حساب المؤسس الأول"
                : "Initial Founder Setup"}
            </Link>
          )}
          <p className="mt-6 text-center text-[11px] leading-5 text-muted-foreground">
            {authLabel(locale, "sessionProtected")}
          </p>
        </Card>
      </div>
    </div>
  );
}

function InitialFounderSetup({ onComplete }: { onComplete: () => void }) {
  const { locale } = useI18n();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isArabic = locale === "ar";
  const copy = isArabic
    ? {
        eyebrow: "إعداد أولي آمن",
        title: "إنشاء حساب المؤسس",
        detail: "أنشئ أول حساب مالك للمنصة لبدء استخدام VAR HR.",
        fullName: "الاسم الكامل",
        username: "اسم المستخدم",
        password: "كلمة المرور",
        confirmPassword: "تأكيد كلمة المرور",
        create: "إنشاء حساب المؤسس",
        creating: "جارٍ إنشاء الحساب…",
        mismatch: "كلمتا المرور غير متطابقتين.",
        tooShort: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
        failed: "تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.",
      }
    : {
        eyebrow: "Secure first-time setup",
        title: "Create the initial Founder",
        detail:
          "Create the first Platform Owner account to start using VAR HR.",
        fullName: "Founder full name",
        username: "Username",
        password: "Password",
        confirmPassword: "Confirm password",
        create: "Create Founder account",
        creating: "Creating account…",
        mismatch: "Passwords do not match.",
        tooShort: "Password must be at least 6 characters.",
        failed: "Could not create the account. Please try again.",
      };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < 6) {
      setError(copy.tooShort);
      return;
    }
    if (password !== confirmPassword) {
      setError(copy.mismatch);
      return;
    }
    setPending(true);
    try {
      await authRequest("/api/auth/provision/platform-owner", {
        method: "POST",
        body: JSON.stringify({ fullName, username, password }),
      });
      onComplete();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.failed);
    } finally {
      setPending(false);
    }
  };
  return (
    <div
      className="login-shell min-h-[100dvh] bg-secondary px-4 py-5 text-sidebar-foreground sm:px-8 sm:py-8"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-md items-center lg:min-h-[calc(100dvh-4rem)]">
        <Card className="w-full border-white/10 bg-card p-6 shadow-2xl sm:p-9">
          <BrandLogo variant="horizontal" className="w-[168px]" />
          <div className="mt-9">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {copy.detail}
            </p>
          </div>
          <form onSubmit={submit} className="mt-7 space-y-[18px]">
            <Field
              label={copy.fullName}
              value={fullName}
              onChange={setFullName}
              required
              autoComplete="name"
            />
            <Field
              label={copy.username}
              value={username}
              onChange={setUsername}
              required
              autoComplete="username"
            />
            <Field
              label={copy.password}
              value={password}
              onChange={setPassword}
              required
              type="password"
              min={6}
              autoComplete="new-password"
              showPasswordToggle
              showPasswordLabel={authLabel(locale, "showPassword")}
              hidePasswordLabel={authLabel(locale, "hidePassword")}
            />
            <Field
              label={copy.confirmPassword}
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
              type="password"
              min={6}
              autoComplete="new-password"
              showPasswordToggle
              showPasswordLabel={authLabel(locale, "showPassword")}
              hidePasswordLabel={authLabel(locale, "hidePassword")}
            />
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="h-12 w-full justify-center rounded-xl text-[15px]"
              disabled={pending}
            >
              {pending ? copy.creating : copy.create}
              <ArrowUpRight className="rtl:-scale-x-100" size={16} />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

function AuthGate() {
  const [account, setAccount] = useState<AuthAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupAvailable, setSetupAvailable] = useState(false);
  const [location, setLocation] = useLocation();
  const signOut = async () => {
    await authRequest("/api/auth/logout", { method: "POST" }).catch(
      () => undefined,
    );
    queryClient.clear();
    setAccount(null);
    setLocation("/login");
  };
  useEffect(() => {
    void Promise.all([
      authRequest<{ user: AuthAccount }>("/api/auth/me"),
      authRequest<{ setupAvailable: boolean }>(
        "/api/auth/provision/platform-owner/status",
      ),
    ])
      .then(([session, setup]) => {
        setAccount(session.user);
        setSetupAvailable(setup.setupAvailable);
      })
      .catch(async () => {
        setAccount(null);
        await authRequest<{ setupAvailable: boolean }>(
          "/api/auth/provision/platform-owner/status",
        )
          .then((setup) => setSetupAvailable(setup.setupAvailable))
          .catch(() => setSetupAvailable(false));
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (!account) return;
    if (location === "/login") {
      setLocation(account.accountType === "platform_owner" ? "/platform" : "/");
    } else if (account.accountType === "platform_owner" && location === "/") {
      setLocation("/platform");
    }
  }, [account, location, setLocation]);
  if (loading) return <WorkspaceState kind="loading" />;
  if (!account)
    if (setupAvailable && location === "/setup")
      return <InitialFounderSetup onComplete={() => setLocation("/login")} />;
  if (!account)
    return (
      <Login
        setupAvailable={setupAvailable}
        onSignedIn={(next) => {
          setAccount(next);
          setLocation(
            next.accountType === "platform_owner" ? "/platform" : "/",
          );
        }}
      />
    );
  return (
    <AuthContext.Provider value={{ account, signOut }}>
      <Router />
    </AuthContext.Provider>
  );
}

function WorkspaceState({
  kind,
  retry,
}: {
  kind: "loading" | "unauthorized" | "error";
  retry?: () => void;
}) {
  const { t } = useI18n();
  const title =
    kind === "loading"
      ? t("authLoading")
      : kind === "unauthorized"
        ? t("authRequired")
        : t("authError");
  const detail =
    kind === "loading"
      ? t("checkWorkspace")
      : kind === "unauthorized"
        ? t("authNotConnected")
        : t("checkWorkspace");
  return (
    <div className="min-h-[100dvh] bg-background px-4 py-10 sm:px-8">
      <div className="mx-auto flex min-h-[70dvh] max-w-xl items-center justify-center">
        <Card className="w-full p-7 text-center sm:p-10">
          <div className="mx-auto grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-secondary">
            {kind === "loading" ? (
              <BrandLogo variant="square" className="h-full w-full" />
            ) : (
              <ShieldCheck size={22} className="text-primary" />
            )}
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold">{title}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            {detail}
          </p>
          {kind !== "loading" && retry ? (
            <Button className="mt-6" onClick={retry}>
              {t("retry")}
            </Button>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const pointerStart = useRef<{ id: number; x: number } | null>(null);
  const { locale, setLocale, t } = useI18n();
  const auth = useAuth();
  const isArabic = locale === "ar";
  const isMobile = useIsMobile();
  const workspaceQuery = useGetWorkspace();
  const summaryQuery = useGetDashboardSummary({
    query: {
      queryKey: getGetDashboardSummaryQueryKey(),
      enabled: Boolean(workspaceQuery.data),
    },
  });
  const workspaceStatus = queryStatus(workspaceQuery.error);
  useEffect(() => {
    if (workspaceStatus === 401) void auth.signOut();
  }, [auth.signOut, workspaceStatus]);
  useEffect(() => {
    setOpen(false);
  }, [location]);
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isMobile || event.pointerType !== "touch") return;
    pointerStart.current = { id: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (
      !start ||
      start.id !== event.pointerId ||
      !isMobile ||
      event.pointerType !== "touch"
    ) {
      return;
    }
    const deltaX = event.clientX - start.x;
    if (Math.abs(deltaX) < 48) return;
    if (open) {
      const swipedTowardClosedEdge = isArabic ? deltaX > 0 : deltaX < 0;
      if (swipedTowardClosedEdge) setOpen(false);
    } else if (isArabic ? deltaX < 0 : deltaX > 0) {
      setOpen(true);
    }
  };
  const handlePointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStart.current?.id === event.pointerId) {
      pointerStart.current = null;
    }
  };
  if (workspaceQuery.isLoading) return <WorkspaceState kind="loading" />;
  if (workspaceQuery.isError || !workspaceQuery.data) {
    return (
      <WorkspaceState
        kind={workspaceStatus === 403 ? "error" : "unauthorized"}
        retry={() => void workspaceQuery.refetch()}
      />
    );
  }
  const workspace = workspaceQuery.data;
  const labels: Record<Locale, string> = {
    en: t("languageEnglish"),
    ar: t("languageArabic"),
    fr: t("languageFrench"),
    de: t("languageGerman"),
  };
  const capabilities = workspace.capabilities || [];
  const canSee = (item: NavItem) =>
    item.roles.includes(workspace.role as WorkspaceRole) &&
    (!item.capability || capabilities.includes(item.capability));
  const isPlatformOwner = workspace.role === "platform_owner";
  const visibleNav = (
    isPlatformOwner
      ? platformNav
      : workspace.role === "company_owner"
        ? companyAdminNav
        : nav
  ).filter(canSee);
  const visibleSecondaryNav =
    isPlatformOwner || workspace.role === "company_owner"
      ? []
      : secondaryNav.filter(canSee);
  const pendingRequests =
    (summaryQuery.data?.requests.pendingLeave ?? 0) +
    (summaryQuery.data?.requests.pendingPermissions ?? 0);
  return (
    <div
      className="app-noise min-h-[100dvh] bg-background"
      dir={isArabic ? "rtl" : "ltr"}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{
        touchAction: isMobile ? "pan-y" : undefined,
      }}
    >
      <aside
        id="workspace-navigation"
        className={cn(
          "fixed inset-y-0 z-50 flex w-[min(248px,calc(100vw-1rem))] flex-col bg-secondary px-4 py-5 text-sidebar-foreground shadow-2xl transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "translate-x-[var(--nav-closed-transform)]",
        )}
        style={{
          insetInlineStart: 0,
          insetInlineEnd: "auto",
          ["--nav-closed-transform" as string]: isArabic ? "100%" : "-100%",
        }}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="flex items-center gap-3 px-3 pb-8">
          <div className="w-full">
            <div className="w-full max-w-[176px] overflow-hidden rounded-lg bg-white p-1.5">
              <BrandLogo variant="horizontal" className="w-full" />
            </div>
            <div className="mt-3 lg:hidden">
              {isPlatformOwner ? (
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {auth.account.fullName}
                </p>
              ) : (
                <>
                  <p className="truncate text-sm font-semibold text-sidebar-foreground">
                    {workspace.company?.name ?? ""}
                  </p>
                  <p className="mt-1 truncate text-xs text-sidebar-foreground/60">
                    {auth.account.fullName}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="quiet"
          className={cn(
            "absolute top-4 min-h-10 min-w-10 p-2 text-sidebar-foreground/70 hover:bg-white/10 hover:text-sidebar-foreground lg:hidden",
            isArabic ? "left-4" : "right-4",
          )}
          onClick={() => setOpen(false)}
          aria-label={t("closeNavigation")}
          data-testid="button-close-navigation"
        >
          <X size={18} />
        </Button>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-3 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.15em] text-sidebar-foreground/45">
            {t("workspace")}
          </div>
          <nav className="space-y-1">
            {visibleNav.map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                data-testid={`link-nav-${key}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  location === href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground",
                )}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>
                  {key === "hrProfile"
                    ? auth.account.accountType === "company_owner"
                      ? t("profileCompanyOwner")
                      : auth.account.accountType === "staff"
                        ? t("profileStaff")
                        : t("profileEmployee")
                    : t(key)}
                </span>
                {href === "/requests" && pendingRequests > 0 && (
                  <span className="ms-auto rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-secondary">
                    {pendingRequests}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="my-5 border-t border-sidebar-border" />
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.15em] text-sidebar-foreground/45">
            {t("account")}
          </div>
          <nav className="space-y-1">
            {visibleSecondaryNav.map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                data-testid={`link-nav-${key}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  location === href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground",
                )}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{t(key)}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/55">
            {t("authNotConnected")}
          </p>
        </div>
      </aside>
      <button
        aria-label={t("closeNavigation")}
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-secondary/45 backdrop-blur-[1px] transition-opacity duration-300 lg:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />
      <div className={isArabic ? "lg:pr-[248px]" : "lg:pl-[248px]"}>
        <header className="relative sticky top-0 z-30 grid h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border/80 bg-background/90 px-4 sm:flex sm:gap-0 sm:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:flex-1 sm:gap-3">
            <Button
              variant="outline"
              className="min-h-10 min-w-10 p-2 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label={t("openNavigation")}
              aria-controls="workspace-navigation"
              aria-expanded={open}
              data-testid="button-open-navigation"
            >
              <span aria-hidden="true" className="flex w-5 flex-col gap-1">
                <span className="h-0.5 w-full rounded-full bg-foreground" />
                <span className="h-0.5 w-full rounded-full bg-foreground" />
                <span className="h-0.5 w-full rounded-full bg-foreground" />
              </span>
            </Button>
            <span className="flex h-9 w-[clamp(42px,14vw,56px)] items-center justify-center overflow-hidden sm:absolute sm:left-1/2 sm:top-1/2 sm:h-9 sm:w-[120px] sm:-translate-x-1/2 sm:-translate-y-1/2">
              <BrandLogo
                variant="short"
                className="!h-full !w-full !max-w-none object-contain sm:hidden"
              />
              <BrandLogo
                variant="horizontal"
                className="hidden !h-full !w-full !max-w-none object-contain sm:block"
              />
            </span>
            <div className="hidden text-xs text-muted-foreground sm:block">
              {t("activeWorkspace")}
            </div>
            <div className="hidden min-w-0 flex-1 items-center gap-2 whitespace-nowrap font-semibold lg:flex">
              <Building2 size={16} className="shrink-0 text-primary" />
              <span className="min-w-0 truncate">
                {isPlatformOwner
                  ? locale === "ar"
                    ? "إدارة المنصة"
                    : "Platform administration"
                  : (workspace.company?.name ?? "")}
              </span>
              <ChevronDown
                size={14}
                className="shrink-0 text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex min-w-0 items-center justify-end gap-1 sm:flex-1 sm:gap-2">
            <div className="hidden text-xs font-medium text-muted-foreground lg:block">
              {auth.account.username} · {roleLabel(workspace.role, t)}
            </div>
            <div className="flex min-h-10 shrink-0 items-center gap-1 rounded-lg border border-border bg-card px-2 py-1.5 text-xs text-muted-foreground sm:gap-2 sm:px-3 sm:py-2">
              <Globe2 size={14} className="shrink-0" />{" "}
              <select
                aria-label={t("language")}
                data-testid="select-language"
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
                className="min-w-0 max-w-[76px] bg-transparent font-medium outline-none sm:max-w-none"
              >
                {Object.entries(labels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="quiet"
              className="hidden p-2 sm:inline-flex"
              title={authLabel(locale, "logout")}
              aria-label={authLabel(locale, "logout")}
              onClick={() => void auth.signOut()}
            >
              <LogOut size={18} />
            </Button>
            <Button
              variant="quiet"
              className="hidden p-2 sm:inline-flex"
              title={t("support")}
              aria-label={t("support")}
              data-testid="button-support"
            >
              <LifeBuoy size={18} />
            </Button>
          </div>
        </header>
        <main className="mobile-main mx-auto max-w-[1500px] min-w-0 px-3 py-5 sm:px-8 sm:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}

function tr(key: AppCopyKey, vars: Record<string, string | number> = {}) {
  const { t } = useI18n();
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    t(key),
  );
}
function Overview() {
  const { locale, t } = useI18n();
  const auth = useAuth();
  const q = useGetDashboardSummary();
  const d = q.data;
  const departments = useListDepartments();
  const branches = useListBranches();
  const workspace = useGetWorkspace();
  const currency = workspace.data?.company?.currency ?? "EGP";
  const fullName = auth.account.fullName.trim();
  const greeting = fullName
    ? locale === "ar"
      ? `${t("goodMorning")}، ${fullName}`
      : `${t("goodMorning")}, ${fullName}.`
    : t("goodMorningNoName");
  const localizedAlerts = d?.alerts?.map((alert: any) =>
    alert.id === "device-adapter"
      ? {
          ...alert,
          title: t("alertBiometricTitle"),
          detail: t("alertBiometricDetail"),
        }
      : alert.id === "employee-limit"
        ? { ...alert, title: t("alertPlanTitle"), detail: t("alertPlanDetail") }
        : alert,
  );
  if (q.isLoading)
    return (
      <>
        <Skeleton className="h-10 w-64" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </>
    );
  if (q.isError || !d) return <ErrorState retry={() => q.refetch()} />;
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("mondayOperationalOverview")}
        title={greeting}
        detail={tr("decisionSurfaceReviewExceptions", { date: date(d.date) })}
        action={
          <div className="flex items-center gap-2">
            <Badge tone="good">
              <span className="me-1 h-1.5 w-1.5 rounded-full bg-primary" />
              {t("liveWorkspace")}
            </Badge>
            <Button variant="outline" onClick={() => q.refetch()}>
              <RefreshCw size={15} />
              {t("retry")}
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr_1fr]">
        <Card className="overflow-hidden bg-secondary p-5 text-sidebar-foreground sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[.16em] text-sidebar-foreground/55">
                {t("todayAtAGlance")}
              </p>
              <h2 className="mt-3 font-display text-4xl font-semibold">
                {d.attendance.present}
                <span className="text-lg text-sidebar-foreground/45">
                  {" "}
                  / {d.workforce.activeEmployees}
                </span>
              </h2>
              <p className="mt-1 text-sm text-sidebar-foreground/65">
                {t("peopleAccountedFor")}
              </p>
            </div>
            <div className="rounded-lg bg-primary/20 p-2 text-primary">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${Math.min(100, (d.attendance.present / Math.max(1, d.workforce.activeEmployees)) * 100)}%`,
              }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs text-sidebar-foreground/55">
            <span>
              {tr("lateAbsent", {
                late: d.attendance.late,
                absent: d.attendance.absent,
              })}
            </span>
            <span>
              {tr("presencePercent", {
                percent: Math.round(
                  (d.attendance.present /
                    Math.max(1, d.workforce.activeEmployees)) *
                    100,
                ),
              })}
            </span>
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[.16em] text-muted-foreground">
            {t("requestsToDecide")}
          </p>
          <div className="mt-4 flex items-end justify-between">
            <div className="font-display text-4xl font-semibold">
              {d.requests.pendingLeave + d.requests.pendingPermissions}
            </div>
            <ArrowUpRight className="text-accent" size={20} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {d.requests.pendingLeave} {t("leave")} ·{" "}
            {d.requests.pendingPermissions} {t("permission")}
          </p>
          <Link
            href="/requests"
            className="mt-6 inline-flex text-sm font-bold text-primary hover:underline"
          >
            {t("openQueue")}
          </Link>
        </Card>
        <Card className="p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[.16em] text-muted-foreground">
            {t("payrollPosture")}
          </p>
          <div className="mt-4 font-display text-2xl font-semibold">
            {periodLabel(d.payroll.periodLabel)}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Status value={d.payroll.status} />
            <span className="text-sm text-muted-foreground">
              {money(d.payroll.totalNet, currency)}
            </span>
          </div>
          <Link
            href="/payroll"
            className="mt-6 inline-flex text-sm font-bold text-primary hover:underline"
          >
            {t("inspectCalculation")}
          </Link>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-display text-lg font-semibold">
                {t("signalsRequiringAttention")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("exceptionsSurfaced")}
              </p>
            </div>
            <AlertCircle size={18} className="text-accent" />
          </div>
          {localizedAlerts?.length ? (
            <div className="divide-y divide-border">
              {localizedAlerts.map((a: any) => (
                <div
                  key={a.id}
                  className="flex gap-4 p-5"
                  data-testid={`alert-${a.id}`}
                >
                  <div
                    className={cn(
                      "mt-1 h-2 w-2 shrink-0 rounded-full",
                      a.severity === "critical"
                        ? "bg-destructive"
                        : a.severity === "warning"
                          ? "bg-accent"
                          : "bg-primary",
                    )}
                  />
                  <div>
                    <div className="font-semibold">{a.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {a.detail}
                    </p>
                  </div>
                  <Badge
                    tone={
                      a.severity === "critical"
                        ? "bad"
                        : a.severity === "warning"
                          ? "warn"
                          : "neutral"
                    }
                  >
                    {severityLabel(a.severity)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title={t("noAlertsInQueue")}
              detail={t("operatingPictureClean")}
            />
          )}
        </Card>
        <Card>
          <div className="border-b border-border p-5">
            <h2 className="font-display text-lg font-semibold">
              {t("operatingFootprint")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("activeTenantStructured")}
            </p>
          </div>
          <div className="space-y-1 p-3">
            {departments.data?.slice(0, 4).map((item: any) => (
              <div
                className="flex items-center justify-between rounded-lg px-3 py-3 hover:bg-muted/60"
                key={item.id}
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                    <BriefcaseBusiness size={15} />
                  </div>
                  <span className="text-sm font-semibold">
                    {departmentLabel(item.name, t)}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {item.employeeCount}
                </span>
              </div>
            )) || <Skeleton className="h-32" />}
          </div>
          <div className="border-t border-border p-4 text-xs text-muted-foreground">
            {tr("branchesDepartmentsDevicesConnected", {
              branches: branches.data?.length || 0,
              departments: d.workforce.departments,
              connected: d.devices.connected,
              total: d.devices.total,
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

type ImportPreviewRow = {
  rowNumber: number;
  values: Record<string, string>;
  error?: AppCopyKey;
};

type ImportDraft = {
  fileName: string;
  headers: string[];
  rows: ImportPreviewRow[];
  headerError?: AppCopyKey;
};

const importHeaderAliases: Record<string, string> = {
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

const importRequiredHeaders = [
  "firstName",
  "lastName",
  "email",
  "departmentId",
  "branchId",
  "joinedOn",
  "salary",
];

function parseDelimitedText(text: string) {
  const delimiter = (
    text.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] || ""
  ).includes("\t")
    ? "\t"
    : ",";
  const records: string[][] = [];
  let record: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (!quoted && character === delimiter) {
      record.push(cell);
      cell = "";
    } else if (!quoted && character === "\n") {
      record.push(cell);
      if (record.some((value) => value.trim())) records.push(record);
      record = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  if (cell || record.length) {
    record.push(cell);
    if (record.some((value) => value.trim())) records.push(record);
  }
  return records;
}

function makeImportDraft(
  text: string,
  fileName: string,
  departmentIds: Set<string>,
  branchIds: Set<string>,
): ImportDraft {
  const records = parseDelimitedText(text);
  const headers = (records.shift() || []).map((value) => value.trim());
  if (!headers.length)
    return { fileName, headers, rows: [], headerError: "emptyFile" };
  const canonicalHeaders = headers.map(
    (header) =>
      importHeaderAliases[header.toLowerCase().replace(/[\s_-]+/g, "")] || "",
  );
  const hasDuplicate = canonicalHeaders.some(
    (header, index) => !header || canonicalHeaders.indexOf(header) !== index,
  );
  const hasRequired = importRequiredHeaders.every((header) =>
    canonicalHeaders.includes(header),
  );
  const headerError =
    hasDuplicate || !hasRequired ? "invalidHeaders" : undefined;
  const seenEmails = new Set<string>();
  const seenNumbers = new Set<string>();
  const rows = records.map((cells, index) => {
    const values = Object.fromEntries(
      headers.map((header, cellIndex) => [
        header,
        (cells[cellIndex] || "").trim(),
      ]),
    );
    let error: AppCopyKey | undefined;
    if (cells.length !== headers.length) {
      error = "invalidStructure";
    } else if (
      !importRequiredHeaders.every((header) =>
        String(values[headers[canonicalHeaders.indexOf(header)]] || "").trim(),
      )
    ) {
      error = "invalidRow";
    } else {
      const firstName = values[headers[canonicalHeaders.indexOf("firstName")]];
      const lastName = values[headers[canonicalHeaders.indexOf("lastName")]];
      const email =
        values[headers[canonicalHeaders.indexOf("email")]].toLowerCase();
      const departmentId =
        values[headers[canonicalHeaders.indexOf("departmentId")]];
      const branchId = values[headers[canonicalHeaders.indexOf("branchId")]];
      const joinedOn = values[headers[canonicalHeaders.indexOf("joinedOn")]];
      const salary = values[headers[canonicalHeaders.indexOf("salary")]];
      const employeeNumberIndex = canonicalHeaders.indexOf("employeeNumber");
      const statusIndex = canonicalHeaders.indexOf("status");
      const roleIndex = canonicalHeaders.indexOf("role");
      const employeeNumber =
        employeeNumberIndex === -1
          ? ""
          : values[headers[employeeNumberIndex]].toLowerCase();
      const status =
        statusIndex === -1
          ? "active"
          : values[headers[statusIndex]] || "active";
      const role =
        roleIndex === -1
          ? "employee"
          : values[headers[roleIndex]] || "employee";
      if (
        !firstName ||
        !lastName ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(joinedOn) ||
        Number.isNaN(Date.parse(`${joinedOn}T00:00:00Z`)) ||
        Number.isNaN(Number(salary)) ||
        Number(salary) < 0 ||
        !["active", "inactive"].includes(status) ||
        !["employee", "manager"].includes(role)
      ) {
        error = "invalidRow";
      } else if (!departmentIds.has(departmentId) || !branchIds.has(branchId)) {
        error = "referenceMissing";
      } else if (
        seenEmails.has(email) ||
        (employeeNumber && seenNumbers.has(employeeNumber))
      ) {
        error = "duplicateFileRow";
      } else {
        seenEmails.add(email);
        if (employeeNumber) seenNumbers.add(employeeNumber);
      }
    }
    return { rowNumber: index + 2, values, error };
  });
  return { fileName, headers, rows, headerError };
}

type HrRecordForm = {
  jobTitle: string;
  employmentType: string;
  managerId: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes: string;
};

const emptyHrRecordForm: HrRecordForm = {
  jobTitle: "",
  employmentType: "",
  managerId: "",
  address: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  notes: "",
};

function EmployeeHrPanel({
  employeeId,
  canEdit,
}: {
  employeeId: string;
  canEdit: boolean;
}) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const hr = useGetEmployeeHrRecord(employeeId, {
    query: {
      enabled: Boolean(employeeId),
      queryKey: getGetEmployeeHrRecordQueryKey(employeeId),
      // A missing HR record is a valid first-time state (404), not a
      // transient failure. Avoid waiting through React Query retries before
      // showing the create form / empty state.
      retry: false,
    },
  });
  const managers = useListEmployees({ status: "active" });
  const update = useUpdateEmployeeHrRecord();
  const [form, setForm] = useState<HrRecordForm>(emptyHrRecordForm);

  useEffect(() => {
    if (!hr.data) return;
    setForm({
      jobTitle: hr.data.jobTitle ?? "",
      employmentType: hr.data.employmentType ?? "",
      managerId: hr.data.managerId ?? "",
      address: hr.data.address ?? "",
      emergencyContactName: hr.data.emergencyContactName ?? "",
      emergencyContactPhone: hr.data.emergencyContactPhone ?? "",
      notes: hr.data.notes ?? "",
    });
  }, [hr.data]);

  if (!employeeId) return null;
  if (hr.isLoading)
    return (
      <div className="mt-7 border-t border-border pt-6">
        <Skeleton className="h-40" />
      </div>
    );

  const status = queryStatus(hr.error);
  if (hr.isError && status === 403) {
    return (
      <div className="mt-7 border-t border-border pt-6">
        <Empty title={t("hrRecordUnauthorized")} detail={t("ownProfileOnly")} />
      </div>
    );
  }
  if (hr.isError && status !== 404) {
    return (
      <div className="mt-7 border-t border-border pt-6">
        <Empty
          title={t("hrRecordLoadFailed")}
          detail={t("checkWorkspace")}
          action={
            <Button variant="outline" onClick={() => hr.refetch()}>
              {t("retry")}
            </Button>
          }
        />
      </div>
    );
  }
  if (hr.isError && !canEdit) {
    return (
      <div className="mt-7 border-t border-border pt-6">
        <Empty title={t("hrRecordNotFound")} detail={t("hrProfileDetail")} />
      </div>
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    update.mutate(
      {
        employeeId,
        data: {
          jobTitle: form.jobTitle || null,
          employmentType: form.employmentType || null,
          managerId: form.managerId || null,
          address: form.address || null,
          emergencyContactName: form.emergencyContactName || null,
          emergencyContactPhone: form.emergencyContactPhone || null,
          notes: form.notes || null,
        } as any,
      },
      {
        onSuccess: (record: any) => {
          setForm({
            jobTitle: record.jobTitle ?? "",
            employmentType: record.employmentType ?? "",
            managerId: record.managerId ?? "",
            address: record.address ?? "",
            emergencyContactName: record.emergencyContactName ?? "",
            emergencyContactPhone: record.emergencyContactPhone ?? "",
            notes: record.notes ?? "",
          });
          qc.setQueryData(getGetEmployeeHrRecordQueryKey(employeeId), record);
          toast.success(t("hrRecordSaved"));
        },
        onError: (error: any) =>
          toast.error(apiErrorMessage(error, t("hrRecordSaveFailed"))),
      },
    );
  }

  const managerOptions = (managers.data || []).filter(
    (item: any) => item.role === "manager" && item.id !== employeeId,
  );
  const selectedManager = managerOptions.find(
    (item: any) => item.id === form.managerId,
  );
  return (
    <div className="mt-7 border-t border-border pt-6">
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold">{t("hrRecord")}</h3>
        {!hr.data && (
          <p className="mt-1 text-sm text-muted-foreground">
            {t("hrRecordCreateHint")}
          </p>
        )}
      </div>
      {canEdit ? (
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("jobTitle")}
              value={form.jobTitle}
              onChange={(value) => setForm({ ...form, jobTitle: value })}
            />
            <Field
              label={t("employmentType")}
              value={form.employmentType}
              onChange={(value) => setForm({ ...form, employmentType: value })}
            />
          </div>
          <label className="block text-sm font-semibold">
            {t("manager")}
            <select
              value={form.managerId}
              onChange={(event) =>
                setForm({ ...form, managerId: event.target.value })
              }
              className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
            >
              <option value="">{t("notAvailable")}</option>
              {managerOptions.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.firstName} {item.lastName}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("address")}
              value={form.address}
              onChange={(value) => setForm({ ...form, address: value })}
            />
            <Field
              label={t("emergencyContactName")}
              value={form.emergencyContactName}
              onChange={(value) =>
                setForm({ ...form, emergencyContactName: value })
              }
            />
          </div>
          <Field
            label={t("emergencyContactPhone")}
            value={form.emergencyContactPhone}
            onChange={(value) =>
              setForm({ ...form, emergencyContactPhone: value })
            }
          />
          <label className="block text-sm font-semibold">
            {t("notes")}
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm({ ...form, notes: event.target.value })
              }
              className="mt-1 min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal outline-none focus:border-primary"
            />
          </label>
          <div className="flex justify-end">
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? t("saving") : t("saveHrRecord")}
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <Info
            label={t("jobTitle")}
            value={form.jobTitle || t("notAvailable")}
          />
          <Info
            label={t("employmentType")}
            value={form.employmentType || t("notAvailable")}
          />
          <Info
            label={t("manager")}
            value={
              selectedManager
                ? `${selectedManager.firstName} ${selectedManager.lastName}`
                : t("notAvailable")
            }
          />
          <Info
            label={t("address")}
            value={form.address || t("notAvailable")}
          />
          <Info
            label={t("emergencyContactName")}
            value={form.emergencyContactName || t("notAvailable")}
          />
          <Info
            label={t("emergencyContactPhone")}
            value={form.emergencyContactPhone || t("notAvailable")}
          />
          <div className="sm:col-span-2">
            <Info label={t("notes")} value={form.notes || t("notAvailable")} />
          </div>
        </div>
      )}
    </div>
  );
}

function EmployeeHrProfile({
  employeeIdOverride,
}: {
  employeeIdOverride?: string | null;
} = {}) {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const workspace = useGetWorkspace();
  const employeeId = employeeIdOverride ?? workspace.data?.employeeId ?? "";
  const currency = workspace.data?.company?.currency ?? "EGP";
  const employee = useGetEmployee(employeeId, {
    query: {
      enabled: Boolean(employeeId),
      queryKey: getGetEmployeeQueryKey(employeeId),
    },
  });
  // Start loading the HR record with the employee profile instead of waiting
  // for the profile request to finish before mounting EmployeeHrPanel.
  useGetEmployeeHrRecord(employeeId, {
    query: {
      enabled: Boolean(employeeId),
      queryKey: getGetEmployeeHrRecordQueryKey(employeeId),
      retry: false,
    },
  });
  const employeeSchedule = useGetEmployeeSchedule(employeeId, {
    query: {
      enabled: Boolean(employeeId),
      queryKey: getGetEmployeeScheduleQueryKey(employeeId),
    },
  });
  const selfService = workspace.data?.role === "employee" && !employeeIdOverride;
  const leaveBalances = useListLeaveBalances({
    query: {
      enabled: Boolean(employeeId),
      queryKey: getListLeaveBalancesQueryKey(),
    },
  });
  const leaveRequests = useListLeaveRequests({
    query: {
      enabled: selfService,
      queryKey: getListLeaveRequestsQueryKey(),
    },
  });
  const attendanceHistory = useListAttendanceHistory(undefined, {
    query: {
      enabled: selfService,
      queryKey: getListAttendanceHistoryQueryKey(),
    },
  });
  const annualLeaveBalance = ((leaveBalances.data || []) as Array<{
    type: string;
    employee?: { id?: string };
    total: number;
    used: number;
    remaining: number;
  }>).find(
    (balance) =>
      balance.employee?.id === employeeId &&
      balance.type.toLowerCase().includes("annual"),
  );
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("hrRecord")}
        title={t("hrProfile")}
        detail={t("hrProfileDetail")}
      />
      {!employeeId ? (
        <Empty
          title={t("noEmployeeContext")}
          detail={t("noEmployeeContextDetail")}
        />
      ) : employee.isLoading ? (
        <Card className="p-6">
          <Skeleton className="h-40" />
        </Card>
      ) : employee.isError ? (
        <Card>
          <Empty
            title={t("employeeProfileLoadFailed")}
            detail={t("checkWorkspace")}
            action={
              <Button variant="outline" onClick={() => employee.refetch()}>
                {t("retry")}
              </Button>
            }
          />
        </Card>
      ) : employee.data ? (
        <Card className="p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                {employee.data.avatarInitials}
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-display text-xl font-semibold">
                  {employee.data.firstName} {employee.data.lastName}
                </h2>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation(`/employees/${employee.data.id}/movement`)}
              className="w-full shrink-0 sm:w-auto"
              data-testid={`button-open-attendance-movement-${employee.data.id}`}
            >
              <Activity size={16} />
              {t("showAttendanceMovement")}
            </Button>
          </div>
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="font-display text-lg font-semibold">
              {t("employeeProfile")}
            </h3>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <Info
                label={t("employeeNumber")}
                value={employee.data.employeeNumber}
              />
              <Info
                label={t("nationalId")}
                value={employee.data.nationalId || t("notAvailable")}
              />
              <Info
                label={t("phoneNumber")}
                value={employee.data.phone || t("notAvailable")}
              />
              <Info
                label={t("basicSalary")}
                value={money(employee.data.salary, currency)}
              />
              <Info
                label={t("workingHours")}
                value={
                  employee.data.workingHours != null
                    ? `${employee.data.workingHours} ${t("hours").toLowerCase()}`
                    : t("notAvailable")
                }
              />
              <Info
                label={t("employmentStartDate")}
                value={date(employee.data.joinedOn)}
              />
              <Info
                label={t("department")}
                value={departmentLabel(employee.data.department?.name, t)}
              />
              <Info
                label={t("branch")}
                value={
                  employee.data.branch
                    ? `${branchLabel(employee.data.branch.name, t)} · ${employee.data.branch.city}`
                    : t("notAvailable")
                }
              />
              <Info
                label={t("shift")}
                value={
                  employeeSchedule.data?.schedule?.name ||
                  t("notAvailable")
                }
              />
              <Info
                label={t("biometricCode")}
                value={employee.data.biometricCode || t("notAvailable")}
              />
            </div>
          </div>
          <EmployeeHrPanel employeeId={employee.data.id} canEdit={false} />
          <div className="mt-6 border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <CalendarDays size={17} className="text-primary" />
              <h3 className="font-display text-lg font-semibold">
                {t("annualLeaveBalances")}
              </h3>
            </div>
            {leaveBalances.isLoading ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : annualLeaveBalance ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Info
                  label={t("allocatedDays")}
                  value={`${annualLeaveBalance.total} ${t("days")}`}
                />
                <Info
                  label={t("usedDays")}
                  value={`${annualLeaveBalance.used ?? 0} ${t("days")}`}
                />
                <Info
                  label={t("daysRemaining")}
                  value={`${Math.max(0, annualLeaveBalance.remaining ?? 0)} ${t("days")}`}
                />
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                {t("notAvailable")}
              </p>
            )}
          </div>
          {selfService && (
            <div className="mt-6 border-t border-border pt-6">
              <h3 className="font-display text-lg font-semibold">
                Leave & attendance summary
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(
                  (leaveBalances.data || []) as Array<{
                    type: string;
                    total: number;
                    used: number;
                    absenceDeducted: number;
                    pending: number;
                    remaining: number;
                    allowedBalanceMonths: number[];
                    monthlyDeductionLimit: number;
                    deductedThisMonth: number;
                    unauthorizedAbsenceDays: number;
                  }>
                )
                  .filter((balance) =>
                    balance.type.toLowerCase().includes("annual"),
                  )
                  .map((balance) => (
                    <Fragment key={balance.type}>
                      <Info
                        label="Annual balance"
                        value={`${balance.total} days`}
                      />
                      <Info
                        label="Used leave"
                        value={`${balance.used} days`}
                      />
                      <Info
                        label="Deducted for absence"
                        value={`${balance.absenceDeducted} days`}
                      />
                      <Info label="Pending" value={`${balance.pending} days`} />
                      <Info
                        label="Remaining"
                        value={`${Math.max(0, balance.remaining)} days`}
                      />
                      <Info
                        label="Deduction months"
                        value={balance.allowedBalanceMonths.join(", ")}
                      />
                      <Info
                        label="Monthly maximum"
                        value={`${balance.monthlyDeductionLimit} days`}
                      />
                      <Info
                        label="Deducted this month"
                        value={`${balance.deductedThisMonth} days`}
                      />
                      <Info
                        label="Unauthorized absence"
                        value={`${balance.unauthorizedAbsenceDays} days`}
                      />
                    </Fragment>
                  ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Info
                  label="Absence days"
                  value={
                    (attendanceHistory.data || []).filter((item: any) =>
                      ["absent", "unexcused_absence", "missing_attendance"].includes(
                        item.status,
                      ),
                    ).length
                  }
                />
                <Info
                  label="Approved leave days"
                  value={(leaveRequests.data || [])
                    .filter((item: any) => item.status === "approved")
                    .reduce((sum: number, item: any) => sum + Number(item.days), 0)}
                />
                <Info
                  label="Extra-pay days"
                  value={(attendanceHistory.data || []).filter(
                    (item: any) =>
                      item.status === "holiday" ||
                      Number(item.overtimeHours || 0) > 0,
                  ).length}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Extra pay is calculated from the effective attendance rules and
                the highest applicable holiday or weekly multiplier.
              </p>
            </div>
          )}
          <EmployeePasswordChange />
        </Card>
      ) : (
        <Empty
          title={t("employeeProfileLoadFailed")}
          detail={t("checkWorkspace")}
        />
      )}
    </div>
  );
}

function EmployeeAttendanceMovement({
  employeeId,
  employeeName,
  biometricCode,
  canPrint,
  fullPage = false,
}: {
  employeeId: string;
  employeeName: string;
  biometricCode?: string | null;
  canPrint: boolean;
  fullPage?: boolean;
}) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(fullPage);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [year, monthNumber] = month.split("-").map(Number);
  const from = `${month}-01`;
  const to = new Date(Date.UTC(year, monthNumber, 0))
    .toISOString()
    .slice(0, 10);
  const reportParams = useMemo(
    () => ({
      type: "attendance" as const,
      from,
      to,
      employeeId,
    }),
    [employeeId, from, to],
  );
  const report = useGetReport(reportParams, {
    query: {
      enabled: open && Boolean(employeeId),
      queryKey: getGetReportQueryKey(reportParams),
    },
  });

  const rows = report.data?.rows ?? [];
  const weekday = (value?: string | null) =>
    value
      ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : locale, {
          weekday: "long",
          timeZone: "UTC",
        }).format(new Date(`${value}T00:00:00Z`))
      : "—";
  const sourceLabel = (row: (typeof rows)[number]) => {
    if (row.source === "biometric") {
      return `${t("biometricCode")}: ${row.biometricCode || biometricCode || "—"}`;
    }
    return row.source || "—";
  };
  const hours = (value?: number) =>
    `${Number(value ?? 0).toFixed(2)} ${t("hours").toLowerCase()}`;
  const minutes = (value?: number) => `${Number(value ?? 0)} ${t("minutes")}`;

  function printMovement() {
    if (!report.data) return;
    const escapeHtml = (value: unknown) =>
      String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    const header = [
      t("date"),
      t("day"),
      t("fingerprintSource"),
      t("scheduledStart"),
      t("scheduledEnd"),
      t("checkIn"),
      t("checkOut"),
      t("deductedMinutes"),
      t("doublePay"),
      t("workedHours"),
      t("attendanceStatus"),
    ]
      .map((item) => `<th>${escapeHtml(item)}</th>`)
      .join("");
    const body = rows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(date(row.date ?? undefined))}</td>
            <td>${escapeHtml(weekday(row.date))}</td>
            <td>${escapeHtml(sourceLabel(row))}</td>
            <td>${escapeHtml(row.scheduledStart || "—")}</td>
            <td>${escapeHtml(row.scheduledEnd || "—")}</td>
            <td>${escapeHtml(time(row.checkIn))}</td>
            <td>${escapeHtml(time(row.checkOut))}</td>
            <td>${escapeHtml(minutes(row.deductedMinutes))}</td>
            <td>${escapeHtml(row.doublePay ? t("yes") : t("no"))}</td>
            <td>${escapeHtml(hours(row.workedHours))}</td>
            <td>${escapeHtml(row.attendanceStatus || "—")}</td>
          </tr>`,
      )
      .join("");
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(
      `<html dir="${document.documentElement.dir || "ltr"}"><head><title>${escapeHtml(t("attendanceMovementTitle"))}</title><style>body{font-family:Arial,sans-serif;color:#152638;padding:28px}h1{margin:0 0 6px}p{color:#607080}.summary{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.chip{background:#edf4f4;border-radius:999px;padding:6px 10px;font-size:12px}table{border-collapse:collapse;width:100%;font-size:10px}th,td{border:1px solid #d8e0e4;padding:7px;text-align:start}th{background:#edf4f4}@media print{body{padding:0}}</style></head><body><h1>${escapeHtml(t("attendanceMovementTitle"))}</h1><p>${escapeHtml(employeeName)} · ${escapeHtml(t("attendanceMonth"))}: ${escapeHtml(periodLabel(month))}</p><div class="summary"><span class="chip">${escapeHtml(t("records"))}: ${rows.length}</span><span class="chip">${escapeHtml(t("workedHours"))}: ${escapeHtml(hours(rows.reduce((sum, row) => sum + Number(row.workedHours || 0), 0)))}</span><span class="chip">${escapeHtml(t("overtimeHours"))}: ${escapeHtml(hours(rows.reduce((sum, row) => sum + Number(row.overtimeHours || 0), 0)))}</span></div><table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table><script>window.onload=()=>{window.print();window.close()}</script></body></html>`,
    );
    printWindow.document.close();
  }

  return (
    <div
      className={cn(
        fullPage ? "space-y-5" : "mt-6 border-t border-border pt-6",
      )}
      data-testid={`employee-attendance-movement-${employeeId}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold">
            {t("attendanceMovementTitle")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("attendanceMovementDetail")}
          </p>
        </div>
        {!fullPage && (
          <Button
            variant={open ? "outline" : "primary"}
            onClick={() => setOpen((value) => !value)}
            data-testid={`button-toggle-attendance-movement-${employeeId}`}
          >
            <Activity size={16} />
            {open ? t("hideAttendanceMovement") : t("showAttendanceMovement")}
          </Button>
        )}
      </div>
      {open && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
            <Field
              label={t("attendanceMonth")}
              type="month"
              value={month}
              onChange={setMonth}
            />
            {canPrint && (
              <Button
                variant="outline"
                onClick={printMovement}
                disabled={!report.data || report.isLoading}
                data-testid={`button-print-attendance-movement-${employeeId}`}
              >
                <Printer size={16} />
                {t("printAttendanceMovement")}
              </Button>
            )}
          </div>
          {report.isLoading ? (
            <Skeleton className="h-56" />
          ) : report.isError ? (
            <ErrorState retry={() => report.refetch()} />
          ) : rows.length ? (
            <Card className="overflow-hidden">
              <div className="grid gap-3 border-b border-border bg-muted/30 p-4 sm:grid-cols-3">
                <Info
                  label={t("records")}
                  value={rows.length}
                  testId={`text-attendance-movement-records-${employeeId}`}
                />
                <Info
                  label={t("workedHours")}
                  value={hours(
                    rows.reduce(
                      (sum, row) => sum + Number(row.workedHours || 0),
                      0,
                    ),
                  )}
                />
                <Info
                  label={t("deductedMinutes")}
                  value={minutes(
                    rows.reduce(
                      (sum, row) => sum + Number(row.deductedMinutes || 0),
                      0,
                    ),
                  )}
                />
              </div>
              <div className="divide-y divide-border md:hidden">
                {rows.map((row) => (
                  <article
                    className="space-y-3 p-4"
                    key={`mobile-${row.date}-${row.employee.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          {date(row.date ?? undefined)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {weekday(row.date)}
                        </p>
                      </div>
                      <Status value={row.attendanceStatus || "—"} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <Info label={t("checkIn")} value={time(row.checkIn)} />
                      <Info label={t("checkOut")} value={time(row.checkOut)} />
                      <Info
                        label={t("workedHours")}
                        value={hours(row.workedHours)}
                      />
                      <Info
                        label={t("deductedMinutes")}
                        value={minutes(row.deductedMinutes)}
                      />
                    </div>
                    <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
                      <p>{sourceLabel(row)}</p>
                      <p>
                        {row.lateMinutes || 0} {t("lateMinutes").toLowerCase()} ·{" "}
                        {row.earlyCheckoutMinutes || 0}{" "}
                        {t("earlyCheckoutMinutes").toLowerCase()}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1250px] text-sm">
                  <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">{t("date")}</th>
                      <th className="px-4 py-3">{t("day")}</th>
                      <th className="px-4 py-3">{t("fingerprintSource")}</th>
                      <th className="px-4 py-3">{t("scheduledStart")}</th>
                      <th className="px-4 py-3">{t("scheduledEnd")}</th>
                      <th className="px-4 py-3">{t("checkIn")}</th>
                      <th className="px-4 py-3">{t("checkOut")}</th>
                      <th className="px-4 py-3">{t("deductedMinutes")}</th>
                      <th className="px-4 py-3">{t("doublePay")}</th>
                      <th className="px-4 py-3">{t("workedHours")}</th>
                      <th className="px-4 py-3">{t("attendanceStatus")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rows.map((row) => (
                      <tr key={`${row.date}-${row.employee.id}`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {date(row.date ?? undefined)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {weekday(row.date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div>{sourceLabel(row)}</div>
                          <div className="text-xs text-muted-foreground">
                            {row.lateMinutes || 0} {t("lateMinutes").toLowerCase()} ·{" "}
                            {row.earlyCheckoutMinutes || 0}{" "}
                            {t("earlyCheckoutMinutes").toLowerCase()}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {row.scheduledStart || "—"}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {row.scheduledEnd || "—"}
                        </td>
                        <td className="px-4 py-3">{time(row.checkIn)}</td>
                        <td className="px-4 py-3">{time(row.checkOut)}</td>
                        <td className="px-4 py-3 font-mono">
                          {minutes(row.deductedMinutes)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={row.doublePay ? "good" : "neutral"}>
                            {row.doublePay ? t("yes") : t("no")}
                            {row.overtimeMultiplier
                              ? ` · ${row.overtimeMultiplier}×`
                              : ""}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {hours(row.workedHours)}
                        </td>
                        <td className="px-4 py-3">
                          <Status value={row.attendanceStatus || "—"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Empty
              title={t("noAttendanceMovement")}
              detail={t("historyWillAppear")}
            />
          )}
        </div>
      )}
    </div>
  );
}

function AccountProfileSummary({
  includeEmployeeProfile,
}: {
  includeEmployeeProfile: boolean;
}) {
  const { locale, t } = useI18n();
  const auth = useAuth();
  const workspace = useGetWorkspace();
  const isCompanyOwner = auth.account.accountType === "company_owner";
  const detail = isCompanyOwner
    ? t("companyProfileDetail")
    : t("staffProfileDetail");
  const role = isCompanyOwner
    ? t("roleCompanyOwner")
    : auth.account.displayRole ||
      roleLabel(workspace.data?.role ?? "manager", t);
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("account")}
        title={isCompanyOwner ? t("profileCompanyOwner") : t("profileStaff")}
        detail={detail}
      />
      <Card className="p-6">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <Info label={t("fullName")} value={auth.account.fullName} />
          <Info
            label={t("phoneLoginUsername")}
            value={auth.account.primaryPhone || auth.account.username}
          />
          <Info
            label={t("company")}
            value={workspace.data?.company?.name || t("notAvailable")}
          />
          <Info label={t("role")} value={role} />
          <Info
            label={authLabel(locale, "accountStatus")}
            value={
              auth.account.active ? t("statusActive") : t("statusInactive")
            }
          />
        </div>
        {includeEmployeeProfile && auth.account.employeeId ? (
          <div className="mt-6 border-t border-border pt-6">
            <EmployeeHrProfile employeeIdOverride={auth.account.employeeId} />
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function Profile() {
  const auth = useAuth();
  if (auth.account.accountType === "platform_owner") {
    return <PlatformAccountSettings />;
  }
  if (auth.account.accountType === "employee") {
    return <EmployeeHrProfile />;
  }
  return (
    <AccountProfileSummary
      includeEmployeeProfile={auth.account.accountType === "staff"}
    />
  );
}

function Branches() {
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const workspace = useGetWorkspace();
  const canManage =
    workspace.data?.capabilities?.includes("branches.manage") ?? false;
  const branches = useListBranches();
  const create = useCreateBranch();
  const update = useUpdateBranch();
  const remove = useDeleteBranch();
  const [selected, setSelected] = useState<any | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "",
    gpsEnabled: false,
    active: true,
  });
  function openCreate() {
    setSelected(null);
    setForm({ name: "", city: "", gpsEnabled: false, active: true });
    setEditing(true);
  }
  function openEdit(branch: any) {
    setSelected(branch);
    setForm({
      name: branch.name ?? "",
      city: branch.city ?? "",
      gpsEnabled: branch.gpsEnabled === true,
      active: branch.active !== false,
    });
    setEditing(true);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    const data = {
      name: form.name.trim(),
      city: form.city.trim(),
      gpsEnabled: form.gpsEnabled,
      ...(selected ? { active: form.active } : {}),
    };
    if (!data.name || !data.city) {
      toast.error(t("couldNotSaveBranch"));
      return;
    }
    const options = {
      onSuccess: (result: any) => {
        toast.success(t("branchSaved"));
        setEditing(false);
        setSelected(result);
        qc.invalidateQueries({ queryKey: getListBranchesQueryKey() });
      },
      onError: (error: any) =>
        toast.error(apiErrorMessage(error, t("couldNotSaveBranch"))),
    };
    if (selected) {
      update.mutate({ branchId: selected.id, data } as any, options);
    } else {
      create.mutate({ data } as any, options);
    }
  }
  function deleteBranch() {
    if (!selected || !window.confirm(`${t("remove")}: ${selected.name}?`)) return;
    remove.mutate(
      { branchId: selected.id },
      {
        onSuccess: () => {
          toast.success(t("deleteSuccessful"));
          setSelected(null);
          setEditing(false);
          qc.invalidateQueries({ queryKey: getListBranchesQueryKey() });
        },
        onError: (error: unknown) =>
          toast.error(apiErrorMessage(error, t("deleteFailed"))),
      },
    );
  }
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("branchesEyebrow")}
        title={t("branchesTitle")}
        detail={t("branchesDetail")}
        action={canManage ? <Button onClick={openCreate}><Plus size={16} />{t("addBranch")}</Button> : undefined}
      />
      {branches.isLoading ? (
        <div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      ) : branches.isError ? (
        <ErrorState retry={() => branches.refetch()} />
      ) : branches.data?.length ? (
        <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
          <div className="space-y-3">
            {branches.data.map((branch: any) => (
              <Card
                key={branch.id}
                className={`cursor-pointer p-5 transition-colors hover:border-primary/40 ${selected?.id === branch.id ? "border-primary bg-primary/5" : ""}`}
                onClick={() => setSelected(branch)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-lg font-semibold">
                      {branch.name}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{branch.city}</div>
                  </div>
                  <Status value={branch.active ? "active" : "inactive"} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Info label={t("branchEmployees")} value={branch.employeeCount} />
                  <Info label={t("branchDevices")} value={branch.deviceCount} />
                </div>
              </Card>
            ))}
          </div>
          {selected ? (
            <Card className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("branchDetails")}</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">{selected.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{selected.city}</p>
                </div>
                {canManage && <Button variant="outline" onClick={() => openEdit(selected)}>{t("edit")}</Button>}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Info label={t("branchStatus")} value={selected.active ? t("branchActive") : t("branchInactive")} />
                <Info label={t("branchEmployees")} value={selected.employeeCount} />
                <Info label={t("branchDevices")} value={selected.deviceCount} />
                <Info label={t("databaseCreatedAt")} value={date(selected.createdAt)} />
              </div>
              {selected.gpsEnabled && (
                <p className="mt-5 rounded-lg bg-primary/5 p-3 text-sm text-muted-foreground">{t("gpsEnabled")}</p>
              )}
            </Card>
          ) : (
            <Empty title={t("branchDetails")} detail={t("selectOption")} />
          )}
        </div>
      ) : (
        <Empty title={t("noBranches")} detail={t("branchesDetail")} action={canManage ? <Button onClick={openCreate}><Plus size={15} />{t("addBranch")}</Button> : undefined} />
      )}
      {editing && (
        <Modal title={selected ? t("edit") : t("addBranch")} onClose={() => setEditing(false)}>
          <form onSubmit={save} className="space-y-4">
            <Field label={t("branchName")} required value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <Field label={t("branchCity")} required value={form.city} onChange={(value) => setForm({ ...form, city: value })} />
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={form.gpsEnabled} onChange={(event) => setForm({ ...form, gpsEnabled: event.target.checked })} />
              {t("gpsEnabled")}
            </label>
            {selected && (
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                {form.active ? t("activateBranch") : t("deactivateBranch")}
              </label>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="quiet" onClick={() => setEditing(false)}>{t("cancel")}</Button>
              {selected && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={deleteBranch}
                  disabled={remove.isPending}
                >
                  {t("remove")}
                </Button>
              )}
              <Button type="submit" disabled={create.isPending || update.isPending || remove.isPending}>{t("saveChanges")}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Departments() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const workspace = useGetWorkspace();
  const canManage =
    workspace.data?.capabilities?.includes("departments.manage") ?? false;
  const departments = useListDepartments();
  const create = useCreateDepartment();
  const update = useUpdateDepartment();
  const remove = useDeleteDepartment();
  const updateEmployee = useUpdateEmployee();
  const [selected, setSelected] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    active: true,
  });
  const detail = useGetDepartment(selected || "", undefined, {
    query: {
      enabled: Boolean(selected),
      queryKey: getGetDepartmentQueryKey(selected || ""),
    },
  });
  function resetForm() {
    setForm({
      name: "",
      active: true,
    });
  }
  function openCreate() {
    resetForm();
    setSelected(null);
    setShowCreate(true);
  }
  function openEdit(item: any) {
    setSelected(item.id);
    setForm({
      name: item.name ?? "",
      active: item.active !== false,
    });
    setShowCreate(true);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    const data = {
      name: form.name,
      ...(selected ? { active: form.active } : {}),
    };
    const options = {
      onSuccess: () => {
        toast.success(t("departmentSaved"));
        setShowCreate(false);
        setSelected(null);
        qc.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
      },
      onError: () => toast.error(t("couldNotSaveRecord")),
    };
    if (selected) {
      update.mutate({ departmentId: selected, data } as any, options);
    } else {
      create.mutate({ data }, options);
    }
  }
  function setMembership(employeeId: string, departmentId: string) {
    updateEmployee.mutate(
      { employeeId, data: { departmentId: departmentId || null } } as any,
      {
        onSuccess: () => {
          toast.success(t("departmentSaved"));
          qc.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
          qc.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
          if (selected) {
            qc.invalidateQueries({ queryKey: getGetDepartmentQueryKey(selected) });
          }
        },
        onError: () => toast.error(t("couldNotSaveRecord")),
      },
    );
  }
  function deleteDepartment() {
    if (!selected || !window.confirm(`${t("remove")}: ${form.name}?`)) return;
    remove.mutate(
      { departmentId: selected },
      {
        onSuccess: () => {
          toast.success(t("departmentSaved"));
          setShowCreate(false);
          setSelected(null);
          resetForm();
          qc.invalidateQueries({ queryKey: getListDepartmentsQueryKey() });
        },
        onError: (error: any) =>
          toast.error(apiErrorMessage(error, t("deleteFailed"))),
      },
    );
  }
  const activeDetail = detail.data as any;
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("departmentsEyebrow")}
        title={t("departmentsTitle")}
        detail={t("departmentsDetail")}
        action={
          canManage ? (
            <Button onClick={openCreate}>
              <Plus size={16} />
              {t("addDepartment")}
            </Button>
          ) : undefined
        }
      />
      {departments.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : departments.isError ? (
        <ErrorState retry={() => departments.refetch()} />
      ) : departments.data?.length ? (
        <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <div className="space-y-3">
            {departments.data.map((item: any) => (
              <Card
                key={item.id}
                className={`cursor-pointer p-5 transition-colors hover:border-primary/40 ${
                  selected === item.id ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setSelected(item.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-lg font-semibold">
                      {item.name}
                    </div>
                  </div>
                  <Status value={item.active ? "active" : "inactive"} />
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>{item.employeeCount} {t("employees").toLowerCase()}</span>
                  {canManage && (
                    <Button
                      variant="outline"
                      className="h-8 px-3"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEdit(item);
                      }}
                    >
                      {t("edit")}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <Card className="min-h-[360px] p-6">
            {activeDetail ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {t("department")}
                    </div>
                    <h2 className="mt-1 font-display text-2xl font-semibold">
                      {activeDetail.name}
                    </h2>
                    {activeDetail.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {activeDetail.description}
                      </p>
                    )}
                  </div>
                  <Status value={activeDetail.active ? "active" : "inactive"} />
                </div>
                <div className="mt-6 rounded-xl border border-border p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("manager")}
                  </div>
                  <div className="mt-1 font-medium">
                    {activeDetail.manager?.name ?? "—"}
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="font-display text-lg font-semibold">
                    {t("departmentEmployees")}
                  </h3>
                  <div className="mt-3 space-y-2">
                    {activeDetail.employees?.map((employee: any) => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                      >
                        <div className="min-w-0">
                           <div className="truncate font-medium">
                             {employee.name}
                           </div>
                           <div className="text-xs text-muted-foreground">
                             {employee.department}
                           </div>
                        </div>
                        {canManage && (
                           <select
                             value={selected ?? ""}
                            onChange={(event) =>
                              setMembership(employee.id, event.target.value)
                            }
                            className="h-9 max-w-[180px] rounded-lg border border-input bg-background px-2 text-xs"
                          >
                            <option value="">{t("selectOption")}</option>
                            {departments.data.map((department: any) => (
                              <option key={department.id} value={department.id}>
                                {department.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                     {!activeDetail.employees?.length && (
                      <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                        {t("noEmployeesMatch")}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <Empty
                title={t("departmentEmployees")}
                detail={t("noDepartmentsDetail")}
                action={canManage ? <Button onClick={openCreate}>{t("addDepartment")}</Button> : undefined}
              />
            )}
          </Card>
        </div>
      ) : (
        <Empty
          title={t("noDepartments")}
          detail={t("noDepartmentsDetail")}
          action={canManage ? <Button onClick={openCreate}>{t("addDepartment")}</Button> : undefined}
        />
      )}
      {showCreate && (
        <Modal
          title={selected ? t("edit") : t("addDepartment")}
          onClose={() => {
            setShowCreate(false);
            setSelected(null);
          }}
        >
          <form onSubmit={save} className="space-y-6">
            <div className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-4 sm:p-5">
              <div className="mb-5 flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 size={19} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-primary">
                    {t("department")}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {t("departmentNameHint")}
                  </p>
                </div>
              </div>
              <Field
                label={t("departmentName")}
                name="departmentName"
                required
                autoComplete="organization"
                value={form.name}
                onChange={(value) => setForm({ ...form, name: value })}
              />
              {selected && (
                <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      setForm({ ...form, active: event.target.checked })
                    }
                  />
                  {form.active ? t("activateDepartment") : t("deactivateDepartment")}
                </label>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                {t("cancel")}
              </Button>
               {selected && (
                 <Button
                   type="button"
                   variant="danger"
                   onClick={deleteDepartment}
                   disabled={remove.isPending}
                 >
                   {t("remove")}
                 </Button>
               )}
                <Button type="submit" disabled={create.isPending || update.isPending || remove.isPending}>
                 {t("saveChanges")}
               </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function AddEmployeePage() {
  const { t, locale } = useI18n();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();
  const workspaceQuery = useGetWorkspace();
  const depts = useListDepartments();
  const branches = useListBranches();
  const schedules = useListWorkSchedules();
  const create = useCreateEmployee();
  const [credentials, setCredentials] = useState<
    (EmployeeCredential & {
      phone: string;
      companyName: string;
      employeeName: string;
    }) | null
  >(null);
  const canCreateEmployees =
    workspaceQuery.data?.capabilities?.includes("employees.create") ?? false;
  const canManageCredentials =
    workspaceQuery.data?.capabilities?.includes("employees.credentials") ?? false;
  const [form, setForm] = useState({
    employeeName: "",
    nationalId: "",
    phone: "",
    biometricCode: "",
    workingHours: "8",
    departmentId: "",
    branchId: "",
    joinedOn: new Date().toISOString().slice(0, 10),
    salary: "0",
    scheduleId: "",
  });

  useEffect(() => {
    if (workspaceQuery.data && !canCreateEmployees) {
      setLocation("/employees");
    }
  }, [canCreateEmployees, setLocation, workspaceQuery.data]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const employeeName = form.employeeName.trim();
    const nameParts = employeeName.split(/\s+/).filter(Boolean);
    if (
      nameParts.length === 0 ||
      !form.nationalId.trim() ||
      !form.phone.trim() ||
      !form.biometricCode.trim() ||
      !form.departmentId ||
      !form.branchId ||
      !form.scheduleId ||
      !form.joinedOn ||
      !Number.isFinite(Number(form.salary)) ||
      Number(form.salary) < 0 ||
      !Number.isFinite(Number(form.workingHours)) ||
      Number(form.workingHours) < 0 ||
      Number(form.workingHours) > 24
    ) {
      toast.error(t("required"));
      return;
    }
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || firstName;
    create.mutate(
      {
        data: {
          firstName,
          lastName,
          phone: form.phone.trim(),
          nationalId: form.nationalId.trim(),
          biometricCode: form.biometricCode.trim(),
          workingHours: Number(form.workingHours),
          salary: Number(form.salary),
          departmentId: form.departmentId,
          branchId: form.branchId,
          joinedOn: form.joinedOn,
          scheduleId: form.scheduleId,
        },
      },
      {
        onSuccess: (result: any) => {
          toast.success(t("employeeAdded"));
          qc.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
          const generated = result?.accountCredentials?.generatedPassword;
          const username = result?.accountCredentials?.username;
          if (generated && username) {
            setCredentials({
              username,
              generatedPassword: generated,
              phone: form.phone.trim(),
              companyName: workspaceQuery.data?.company?.name ?? "",
              employeeName: `${firstName} ${lastName}`,
            });
          } else {
            setLocation("/employees");
          }
        },
        onError: (error: unknown) =>
          toast.error(apiErrorMessage(error, t("couldNotCreateEmployee"))),
      },
    );
  }

  if (workspaceQuery.data && !canCreateEmployees) return null;

  return (
    <div className="animate-in w-full">
      <SectionTitle
        eyebrow={t("employeesEyebrow")}
        title={t("addEmployee")}
        detail={t("employeeFormDetail")}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/employees")}
            data-testid="button-back-employees"
          >
            <ArrowLeft className="rtl:-scale-x-100" size={16} />
            {t("cancel")}
          </Button>
        }
      />

      <div className="rounded-2xl border border-primary/15 bg-primary/[0.035] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <UserPlus size={19} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-primary">
              {t("addEmployee")}
            </p>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              {t("employeeFormDetail")}
            </p>
          </div>
        </div>
      </div>

      <form
        id="employee-create-form"
        onSubmit={submit}
        className="mt-5 space-y-5"
      >
        <Card className="p-4 sm:p-5 lg:p-6">
          <div className="mb-5">
            <h3 className="font-display text-base font-semibold">
              {t("employeeIdentitySection")}
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t("employeeIdentityDetail")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field
                label={t("employeeName")}
                name="employeeName"
                required
                autoComplete="name"
                placeholder={t("employeeNameHint")}
                value={form.employeeName}
                onChange={(value) =>
                  setForm({ ...form, employeeName: value })
                }
              />
            </div>
            <Field
              label={t("nationalId")}
              name="nationalId"
              required
              placeholder={t("nationalIdHint")}
              value={form.nationalId}
              onChange={(value) => setForm({ ...form, nationalId: value })}
            />
            <Field
              label={t("phoneNumber")}
              name="phone"
              required
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(value) => setForm({ ...form, phone: value })}
            />
            <div className="sm:col-span-2">
              <Field
                label={t("biometricCode")}
                name="biometricCode"
                required
                placeholder={t("biometricCodeHint")}
                value={form.biometricCode}
                onChange={(value) =>
                  setForm({ ...form, biometricCode: value })
                }
              />
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                {t("biometricCodeHint")}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 lg:p-6">
          <div className="mb-5">
            <h3 className="font-display text-base font-semibold">
              {t("employeeEmploymentSection")}
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t("employeeEmploymentDetail")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Field
                label={t("monthlySalary")}
                name="salary"
                required
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.salary}
                onChange={(value) => setForm({ ...form, salary: value })}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t("salaryHint")}
              </p>
            </div>
            <div>
              <Field
                label={t("workingHours")}
                name="workingHours"
                required
                type="number"
                min="0"
                max="24"
                step="0.5"
                inputMode="decimal"
                value={form.workingHours}
                onChange={(value) =>
                  setForm({ ...form, workingHours: value })
                }
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t("workingHoursHint")}
              </p>
            </div>
            <Field
              label={t("employmentStartDate")}
              name="joinedOn"
              required
              type="date"
              value={form.joinedOn}
              onChange={(value) => setForm({ ...form, joinedOn: value })}
            />
            <label className="block text-sm font-semibold">
              <span className="block">{t("shift")}</span>
              <select
                required
                name="scheduleId"
                data-testid="select-employee-shift"
                value={form.scheduleId}
                disabled={schedules.isLoading || !schedules.data?.length}
                onChange={(e) =>
                  setForm({ ...form, scheduleId: e.target.value })
                }
                className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {schedules.isLoading
                    ? t("loading")
                    : schedules.data?.length
                      ? t("selectOption")
                      : t("noShifts")}
                </option>
                {schedules.data?.map((schedule: any) => (
                  <option
                    key={schedule.id}
                    value={schedule.id}
                    data-testid={`option-employee-shift-${schedule.id}`}
                  >
                    {schedule.name} · {schedule.startTime}–{schedule.endTime}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                {schedules.isError
                  ? t("shiftsLoadFailed")
                  : t("selectShiftHint")}
              </p>
            </label>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 lg:p-6">
          <div className="mb-5">
            <h3 className="font-display text-base font-semibold">
              {t("employeePlacementSection")}
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {t("employeePlacementDetail")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              <span className="block">{t("department")}</span>
              <select
                required
                name="departmentId"
                data-testid="select-employee-department"
                value={form.departmentId}
                onChange={(e) =>
                  setForm({ ...form, departmentId: e.target.value })
                }
                className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-primary"
              >
                <option value="">{t("selectOption")}</option>
                {depts.data?.map((x: any) => (
                  <option
                    key={x.id}
                    value={x.id}
                    data-testid={`option-employee-department-${x.id}`}
                  >
                    {departmentLabel(x.name, t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              <span className="block">{t("branch")}</span>
              <select
                required
                name="branchId"
                data-testid="select-employee-branch"
                value={form.branchId}
                onChange={(e) =>
                  setForm({ ...form, branchId: e.target.value })
                }
                className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal outline-none transition-colors focus:border-primary"
              >
                <option value="">{t("selectOption")}</option>
                {branches.data?.map((x: any) => (
                  <option
                    key={x.id}
                    value={x.id}
                    data-testid={`option-employee-branch-${x.id}`}
                  >
                    {branchLabel(x.name, t)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="quiet"
            className="w-full sm:w-auto"
            onClick={() => setLocation("/employees")}
            data-testid="button-cancel-add-employee"
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={create.isPending}
            data-testid="button-save-employee"
          >
            {create.isPending
              ? t("saving")
              : t("createEmployee")}
          </Button>
        </div>
      </form>
      {credentials && (
        <CredentialReveal
          credential={credentials}
          phone={credentials.phone}
          companyName={credentials.companyName}
          employeeName={credentials.employeeName}
          locale={locale}
          onClose={() => {
            setCredentials(null);
            setLocation("/employees");
          }}
        />
      )}
    </div>
  );
}

function EmployeeProfilePage() {
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const { employeeId = "" } = useParams<{ employeeId: string }>();
  const workspaceQuery = useGetWorkspace();
  const canEditEmployees =
    workspaceQuery.data?.capabilities?.includes("employees.edit") ?? false;
  const canDeleteEmployees =
    workspaceQuery.data?.capabilities?.includes("employees.manage") ?? false;
  const canManageCredentials =
    workspaceQuery.data?.capabilities?.includes("employees.credentials") ?? false;
  const currency = workspaceQuery.data?.company?.currency ?? "EGP";
  const employee = useGetEmployee(employeeId, {
    query: {
      enabled: Boolean(employeeId),
      queryKey: getGetEmployeeQueryKey(employeeId),
    },
  });
  const employeeSchedule = useGetEmployeeSchedule(employeeId, {
    query: {
      enabled: Boolean(employeeId),
      queryKey: getGetEmployeeScheduleQueryKey(employeeId),
    },
  });
  const leaveBalances = useListLeaveBalances({
    query: {
      enabled: Boolean(employeeId),
      queryKey: getListLeaveBalancesQueryKey(),
    },
  });
  const annualLeaveBalance = ((leaveBalances.data || []) as Array<{
    type: string;
    employee?: { id?: string };
    total: number;
    used: number;
    remaining: number;
  }>).find(
    (balance) =>
      balance.employee?.id === employeeId &&
      balance.type.toLowerCase().includes("annual"),
  );
  const update = useUpdateEmployee();
  const remove = useDeleteEmployee();
  const departments = useListDepartments();
  const branches = useListBranches();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    employeeNumber: "",
    firstName: "",
    lastName: "",
    phone: "",
    nationalId: "",
    biometricCode: "",
    workingHours: "8",
    salary: "0",
    departmentId: "",
    branchId: "",
    status: "active",
  });
  function openEdit() {
    if (!employee.data) return;
    setEditForm({
      employeeNumber: employee.data.employeeNumber,
      firstName: employee.data.firstName,
      lastName: employee.data.lastName,
      phone: employee.data.phone ?? "",
      nationalId: employee.data.nationalId ?? "",
      biometricCode: employee.data.biometricCode ?? "",
      workingHours: String(employee.data.workingHours ?? 8),
      salary: String(employee.data.salary ?? 0),
      departmentId: employee.data.department?.id ?? "",
      branchId: employee.data.branch?.id ?? "",
      status: employee.data.status,
    });
    setEditing(true);
  }
  function saveEdit(event: FormEvent) {
    event.preventDefault();
    const employeeNumber = editForm.employeeNumber.trim();
    if (
      !employeeNumber.match(/^[1-9][0-9]*$/) ||
      !editForm.firstName.trim() ||
      !editForm.lastName.trim() ||
      !editForm.branchId
    ) {
      toast.error(t("couldNotSaveRecord"));
      return;
    }
    update.mutate(
      {
        employeeId,
        data: {
          employeeNumber,
          firstName: editForm.firstName.trim(),
          lastName: editForm.lastName.trim(),
          phone: editForm.phone.trim(),
          nationalId: editForm.nationalId.trim(),
          biometricCode: editForm.biometricCode.trim(),
          workingHours: Number(editForm.workingHours),
          salary: Number(editForm.salary),
          departmentId: editForm.departmentId || null,
          branchId: editForm.branchId,
          status: editForm.status,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success(t("employeeSaved"));
          setEditing(false);
          qc.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
          qc.invalidateQueries({ queryKey: getGetEmployeeQueryKey(employeeId) });
        },
        onError: (error: unknown) =>
          toast.error(apiErrorMessage(error, t("couldNotSaveRecord"))),
      },
    );
  }
  function deleteEmployee() {
    if (
      !employee.data ||
      !window.confirm(
        `${t("remove")}: ${employee.data.firstName} ${employee.data.lastName}?`,
      )
    ) {
      return;
    }
    remove.mutate(
      { employeeId: employee.data.id },
      {
        onSuccess: () => {
          toast.success(t("deleteSuccessful"));
          qc.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
          setLocation("/employees");
        },
        onError: (error: unknown) =>
          toast.error(apiErrorMessage(error, t("deleteFailed"))),
      },
    );
  }

  return (
    <div className="animate-in">
      <div className="mb-5">
        <Button
          variant="quiet"
          className="px-0 hover:bg-transparent"
          onClick={() => setLocation("/employees")}
          data-testid="button-back-to-employees"
        >
          <ArrowLeft size={16} />
          {t("employees")}
        </Button>
      </div>
      <SectionTitle
        eyebrow={t("employeeProfile")}
        title={
          employee.data
            ? `${employee.data.firstName} ${employee.data.lastName}`
            : t("employeeProfile")
        }
        detail={t("employeeDetail")}
      />
      {!employeeId ? (
        <Empty
          title={t("employeeProfileLoadFailed")}
          detail={t("checkWorkspace")}
          action={
            <Button variant="outline" onClick={() => setLocation("/employees")}>
              {t("employees")}
            </Button>
          }
        />
      ) : employee.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-52" />
            <Skeleton className="h-52" />
          </div>
          <Skeleton className="h-52" />
        </div>
      ) : employee.isError ? (
        <Card>
          <Empty
            title={t("employeeProfileLoadFailed")}
            detail={t("checkWorkspace")}
            action={
              <Button variant="outline" onClick={() => employee.refetch()}>
                {t("retry")}
              </Button>
            }
          />
        </Card>
      ) : employee.data ? (
        <div className="space-y-4">
          <Card className="relative overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.12] via-primary/[0.045] to-card p-4 sm:p-6">
            <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-card text-lg font-bold text-primary shadow-sm ring-1 ring-primary/15"
                  data-testid={`img-employee-avatar-${employee.data.id}`}
                >
                  {employee.data.avatarInitials ||
                    `${employee.data.firstName[0]}${employee.data.lastName[0]}`}
                </div>
                <div className="min-w-0">
                  <h2
                    className="truncate font-display text-2xl font-semibold sm:text-3xl"
                    data-testid={`text-employee-name-${employee.data.id}`}
                  >
                    {employee.data.firstName} {employee.data.lastName}
                  </h2>
                  <p
                    className="mt-1 truncate text-sm text-muted-foreground"
                    data-testid={`text-employee-phone-${employee.data.id}`}
                  >
                    {employee.data.phone || t("notAvailable")}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <Badge tone="accent">{roleLabel(employee.data.role, t)}</Badge>
                <Status value={employee.data.status} />
                <Button
                  variant="outline"
                  onClick={() =>
                    setLocation(`/employees/${employee.data.id}/movement`)
                  }
                  data-testid={`button-open-attendance-movement-${employee.data.id}`}
                >
                  <Activity size={16} />
                  {t("showAttendanceMovement")}
                </Button>
                {(canEditEmployees || canDeleteEmployees) && (
                  <>
                    {canEditEmployees && (
                      <Button variant="outline" onClick={openEdit}>
                        {t("edit")}
                      </Button>
                    )}
                    {canDeleteEmployees && (
                      <Button
                        variant="danger"
                        onClick={deleteEmployee}
                        disabled={remove.isPending}
                      >
                        {t("remove")}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="relative mt-6 grid gap-2 border-t border-primary/10 pt-4 sm:grid-cols-3">
              <Info
                label={t("employeeNumber")}
                value={employee.data.employeeNumber}
                testId={`text-employee-number-${employee.data.id}`}
              />
              <Info
                label={t("branch")}
                value={branchLabel(employee.data.branch?.name, t)}
              />
              <Info
                label={t("employmentStartDate")}
                value={date(employee.data.joinedOn)}
              />
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <EmployeeProfileSection
              title={t("employeeIdentitySection")}
              detail={t("employeeIdentityDetail")}
              icon={<UserRound size={17} />}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Info
                  label={t("phoneNumber")}
                  value={employee.data.phone || t("notAvailable")}
                  testId={`text-profile-phone-${employee.data.id}`}
                />
                <Info
                  label={t("nationalId")}
                  value={employee.data.nationalId || t("notAvailable")}
                  testId={`text-profile-national-id-${employee.data.id}`}
                />
              </div>
            </EmployeeProfileSection>

            <EmployeeProfileSection
              title={t("employeeEmploymentSection")}
              detail={t("employeeEmploymentDetail")}
              icon={<BriefcaseBusiness size={17} />}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Info
                  label={t("role")}
                  value={roleLabel(employee.data.role, t)}
                  testId={`text-profile-role-${employee.data.id}`}
                />
                <div
                  className="rounded-lg bg-muted/60 p-3"
                  data-testid={`status-profile-employee-${employee.data.id}`}
                >
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t("status")}
                  </div>
                  <div className="mt-2">
                    <Status value={employee.data.status} />
                  </div>
                </div>
                <Info
                  label={t("employmentStartDate")}
                  value={date(employee.data.joinedOn)}
                  testId={`text-profile-start-date-${employee.data.id}`}
                />
              </div>
            </EmployeeProfileSection>
          </div>

          <EmployeeProfileSection
            title={t("employeePlacementSection")}
            detail={t("employeePlacementDetail")}
            icon={<Building2 size={17} />}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Info
                label={t("department")}
                value={departmentLabel(employee.data.department?.name, t)}
                testId={`text-profile-department-${employee.data.id}`}
              />
              <Info
                label={t("branch")}
                value={
                  employee.data.branch
                    ? `${branchLabel(employee.data.branch.name, t)} · ${employee.data.branch.city}`
                    : t("notAvailable")
                }
                testId={`text-profile-branch-${employee.data.id}`}
              />
              <Info
                label={t("shift")}
                value={
                  employeeSchedule.data?.schedule?.name ||
                  t("notAvailable")
                }
                testId={`text-profile-shift-${employee.data.id}`}
              />
              <Info
                label={t("effectiveFrom")}
                value={
                  employeeSchedule.data?.assignment?.effectiveFrom
                    ? date(employeeSchedule.data.assignment.effectiveFrom)
                    : t("notAvailable")
                }
                testId={`text-profile-shift-effective-${employee.data.id}`}
              />
              {employeeSchedule.data?.schedule && (
                <div
                  className="rounded-lg bg-muted/60 p-3 sm:col-span-2"
                  data-testid={`text-profile-shift-hours-${employee.data.id}`}
                >
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {t("workingHours")}
                  </div>
                  <div className="mt-1 font-medium">
                    {employeeSchedule.data.schedule.startTime}–{" "}
                    {employeeSchedule.data.schedule.endTime}
                  </div>
                </div>
              )}
            </div>
          </EmployeeProfileSection>

          <div className="grid gap-4 lg:grid-cols-2">
            <EmployeeProfileSection
              title={t("monthlySalary")}
              detail={t("salaryHint")}
              icon={<Coins size={17} />}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Info
                  label={t("monthlySalary")}
                  value={money(employee.data.salary, currency)}
                  testId={`text-profile-salary-${employee.data.id}`}
                />
                <Info
                  label={t("workingHours")}
                  value={
                    employee.data.workingHours != null
                      ? `${employee.data.workingHours} ${t("hours").toLowerCase()}`
                      : t("notAvailable")
                  }
                  testId={`text-profile-working-hours-${employee.data.id}`}
                />
              </div>
            </EmployeeProfileSection>

            <EmployeeProfileSection
              title={t("biometricCode")}
              detail={t("biometricCodeHint")}
              icon={<Fingerprint size={17} />}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Info
                  label={t("biometricCode")}
                  value={employee.data.biometricCode || t("notAvailable")}
                  testId={`text-profile-biometric-code-${employee.data.id}`}
                />
                {canEditEmployees ? (
                  <label className="rounded-lg bg-muted/60 p-3 text-sm font-semibold">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t("automaticOvertime")}
                    </span>
                    <select
                      value={employee.data.automaticOvertime ?? "default"}
                      onChange={(event) =>
                        update.mutate(
                          {
                            employeeId: employee.data.id,
                            data: {
                              automaticOvertime: event.target.value as
                                | "default"
                                | "enabled"
                                | "disabled",
                            } as any,
                          },
                          {
                            onSuccess: () => {
                              toast.success(t("employeeStatusUpdated"));
                              qc.invalidateQueries({
                                queryKey: getListEmployeesQueryKey(),
                              });
                              qc.invalidateQueries({
                                queryKey: getGetEmployeeQueryKey(
                                  employee.data.id,
                                ),
                              });
                            },
                            onError: (error: unknown) =>
                              toast.error(
                                apiErrorMessage(
                                  error,
                                  t("couldNotSaveRecord"),
                                ),
                              ),
                          },
                        )
                      }
                      className="mt-2 h-9 w-full rounded-lg border border-input bg-background px-2 text-sm font-normal"
                      data-testid={`select-profile-automatic-overtime-${employee.data.id}`}
                    >
                      <option value="default">
                        {locale === "ar"
                          ? "استخدام إعداد الشركة"
                          : "Use company default"}
                      </option>
                      <option value="enabled">
                        {locale === "ar" ? "مفعّل" : "Enabled"}
                      </option>
                      <option value="disabled">
                        {locale === "ar" ? "معطّل" : "Disabled"}
                      </option>
                    </select>
                  </label>
                ) : (
                  <Info
                    label={t("automaticOvertime")}
                    value={
                      employee.data.automaticOvertime === "enabled"
                        ? t("enabled")
                        : employee.data.automaticOvertime === "disabled"
                          ? t("disabled")
                          : locale === "ar"
                            ? "الإعداد الافتراضي"
                            : locale === "fr"
                              ? "Par défaut"
                              : locale === "de"
                                ? "Standard"
                                : "Default"
                    }
                    testId={`text-profile-automatic-overtime-${employee.data.id}`}
                  />
                )}
              </div>
            </EmployeeProfileSection>
          </div>

          <div className="border-t border-border pt-1">
            <EmployeeHrPanel
              employeeId={employee.data.id}
              canEdit={canEditEmployees}
            />
          </div>

          <EmployeeProfileSection
            title={t("annualLeaveBalances")}
            icon={<CalendarDays size={17} />}
          >
            {leaveBalances.isLoading ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </div>
            ) : annualLeaveBalance ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <Info
                  label={t("allocatedDays")}
                  value={`${annualLeaveBalance.total} ${t("days")}`}
                  testId={`text-profile-annual-total-${employee.data.id}`}
                />
                <Info
                  label={t("usedDays")}
                  value={`${annualLeaveBalance.used} ${t("days")}`}
                  testId={`text-profile-annual-used-${employee.data.id}`}
                />
                <Info
                  label={t("daysRemaining")}
                  value={`${Math.max(0, annualLeaveBalance.remaining)} ${t("days")}`}
                  testId={`text-profile-annual-remaining-${employee.data.id}`}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("notAvailable")}
              </p>
            )}
          </EmployeeProfileSection>

          <EmployeeCredentialManager
            employeeId={employee.data.id}
            phone={employee.data.phone}
            companyName={workspaceQuery.data?.company?.name ?? ""}
            employeeName={`${employee.data.firstName} ${employee.data.lastName}`}
            canManage={canManageCredentials}
          />

          {canEditEmployees && (
            <div className="flex justify-end border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() =>
                  update.mutate(
                    {
                      employeeId: employee.data.id,
                      data: {
                        status:
                          employee.data.status === "active"
                            ? "inactive"
                            : "active",
                      } as any,
                    },
                    {
                      onSuccess: () => {
                        toast.success(t("employeeStatusUpdated"));
                        qc.invalidateQueries({
                          queryKey: getListEmployeesQueryKey(),
                        });
                        qc.invalidateQueries({
                          queryKey: getGetEmployeeQueryKey(employee.data.id),
                        });
                      },
                    },
                  )
                }
                data-testid={`button-toggle-employee-status-${employee.data.id}`}
              >
                {employee.data.status === "active"
                  ? t("markInactive")
                  : t("reactivateEmployee")}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <ErrorState retry={() => employee.refetch()} />
      )}
      {editing && employee.data && (
        <Modal
          title={t("edit")}
          onClose={() => setEditing(false)}
          className="max-w-2xl"
        >
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("employeeNumber")}
                value={editForm.employeeNumber}
                name="employeeNumber"
                inputMode="numeric"
                required
                onChange={(value) => setEditForm({ ...editForm, employeeNumber: value })}
              />
              <p className="sm:col-span-2 -mt-2 text-xs text-muted-foreground">
                {t("employeeNumberEditHint")}
              </p>
              <Field
                label={t("firstName")}
                value={editForm.firstName}
                required
                onChange={(value) => setEditForm({ ...editForm, firstName: value })}
              />
              <Field
                label={t("lastName")}
                value={editForm.lastName}
                required
                onChange={(value) => setEditForm({ ...editForm, lastName: value })}
              />
              <Field
                label={t("phoneNumber")}
                value={editForm.phone}
                inputMode="tel"
                onChange={(value) => setEditForm({ ...editForm, phone: value })}
              />
              <Field
                label={t("nationalId")}
                value={editForm.nationalId}
                onChange={(value) => setEditForm({ ...editForm, nationalId: value })}
              />
              <Field
                label={t("biometricCode")}
                value={editForm.biometricCode}
                onChange={(value) => setEditForm({ ...editForm, biometricCode: value })}
              />
              <Field
                label={t("workingHours")}
                type="number"
                min={0}
                max={24}
                step={0.25}
                value={editForm.workingHours}
                onChange={(value) => setEditForm({ ...editForm, workingHours: value })}
              />
              <Field
                label={t("salary")}
                type="number"
                min={0}
                step={0.01}
                value={editForm.salary}
                onChange={(value) => setEditForm({ ...editForm, salary: value })}
              />
              <label className="block text-sm font-semibold">
                <span className="mb-2 block">{t("department")}</span>
                <select
                  value={editForm.departmentId}
                  onChange={(event) =>
                    setEditForm({ ...editForm, departmentId: event.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                >
                  <option value="">—</option>
                  {departments.data?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                <span className="mb-2 block">{t("branch")}</span>
                <select
                  value={editForm.branchId}
                  onChange={(event) =>
                    setEditForm({ ...editForm, branchId: event.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                >
                  {branches.data?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                <span className="mb-2 block">{t("status")}</span>
                <select
                  value={editForm.status}
                  onChange={(event) =>
                    setEditForm({ ...editForm, status: event.target.value })
                  }
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                >
                  <option value="active">{t("active")}</option>
                  <option value="inactive">{t("inactive")}</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="quiet" onClick={() => setEditing(false)}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {t("saveChanges")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Employees() {
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const workspaceQuery = useGetWorkspace();
  const canCreateEmployees =
    workspaceQuery.data?.capabilities?.includes("employees.create") ?? false;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const currency = workspaceQuery.data?.company?.currency ?? "EGP";
  const params = useMemo(
    () => ({ search: search || undefined, status: status as any }),
    [search, status],
  );
  const q = useListEmployees(params);
  const depts = useListDepartments();
  const branches = useListBranches();
  const scheduleAssignments = useListScheduleAssignments();
  const schedules = useListWorkSchedules();
  const importMutation = useImportEmployees();
  const [showImport, setShowImport] = useState(false);
  const [importDraft, setImportDraft] = useState<ImportDraft | null>(null);
  const [importResult, setImportResult] = useState<any | null>(null);
  function selectImportFile(file: File | undefined) {
    if (!file) return;
    file
      .text()
      .then((text) => {
        setImportResult(null);
        setImportDraft(
          makeImportDraft(
            text,
            file.name,
            new Set((depts.data || []).map((item: any) => item.id)),
            new Set((branches.data || []).map((item: any) => item.id)),
          ),
        );
      })
      .catch(() => toast.error(t("error")));
  }
  function downloadImportTemplate() {
    const headers = [
      "employeeNumber",
      "firstName",
      "lastName",
      "email",
      "phone",
      "departmentId",
      "branchId",
      "status",
      "role",
      "joinedOn",
      "salary",
    ];
    downloadReport(
      "var-hr-employee-import-template.csv",
      `${headers.join(",")}\n`,
      "text/csv;charset=utf-8",
    );
  }
  function confirmImport() {
    if (
      !importDraft ||
      importDraft.headerError ||
      importDraft.rows.some((row) => row.error)
    ) {
      toast.error(t("noValidRows"));
      return;
    }
    importMutation.mutate(
      {
        data: {
          headers: importDraft.headers,
          rows: importDraft.rows.map((row) => row.values),
        } as any,
      },
      {
        onSuccess: (result: any) => {
          setImportResult(result);
          toast.success(t("importComplete"));
          qc.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
        },
        onError: (error: any) => {
          if (error?.data?.rows) setImportResult(error.data);
          toast.error(error?.data?.error || apiErrorMessage(error, t("error")));
        },
      },
    );
  }
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("employeesEyebrow")}
        title={t("employeesTitle")}
        detail={t("employeesDetail")}
        action={
          canCreateEmployees ? (
            <Button
              onClick={() => setLocation("/employees/new")}
              data-testid="button-create-employee"
            >
              <Plus size={16} />
              {t("addEmployee")}
            </Button>
          ) : undefined
        }
      />
      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute start-3 top-2.5 text-muted-foreground"
              size={16}
            />
            <input
              data-testid="input-employee-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchEmployees")}
              className="h-10 w-full rounded-lg border border-input bg-background ps-9 pe-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <select
            data-testid="select-employee-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="all">{t("allStatuses")}</option>
            <option value="active">{t("active")}</option>
            <option value="inactive">{t("inactive")}</option>
          </select>
        </div>
        {q.isLoading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : q.isError ? (
          <ErrorState retry={() => q.refetch()} />
        ) : q.data?.length ? (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1450px] text-left text-sm rtl:text-right">
              <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">{t("employeeNumber")}</th>
                  <th className="px-4 py-4">{t("employee")}</th>
                  <th className="px-4 py-4">{t("nationalId")}</th>
                  <th className="px-4 py-4">{t("phoneNumber")}</th>
                  <th className="px-4 py-4">{t("department")}</th>
                  <th className="px-4 py-4">{t("branch")}</th>
                  <th className="px-4 py-4">{t("shift")}</th>
                  <th className="px-4 py-4">{t("monthlySalary")}</th>
                  <th className="px-4 py-4">{t("workingHours")}</th>
                  <th className="px-4 py-4">{t("biometricCode")}</th>
                  <th className="px-4 py-4">{t("employmentStartDate")}</th>
                  <th className="px-5 py-4">{t("status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {q.data.map((item: any) => (
                  <tr
                    key={item.id}
                    onClick={() => setLocation(`/employees/${item.id}`)}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    data-testid={`row-employee-${item.id}`}
                  >
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex rounded-lg bg-secondary/5 px-2.5 py-1 font-mono text-xs font-bold tracking-wide text-secondary"
                        data-testid={`text-list-employee-number-${item.id}`}
                      >
                        {item.employeeNumber}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                          {item.avatarInitials ||
                            `${item.firstName[0]}${item.lastName[0]}`}
                        </div>
                        <div className="min-w-0">
                          <div className="whitespace-nowrap font-semibold">
                            {item.firstName} {item.lastName}
                          </div>
                          <div className="max-w-[190px] truncate text-xs text-muted-foreground">
                            {item.phone || t("notAvailable")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">
                      {item.nationalId || t("notAvailable")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {item.phone || t("notAvailable")}
                    </td>
                    <td className="px-4 py-4">
                      {departmentLabel(item.department?.name, t)}
                    </td>
                    <td className="px-4 py-4">{branchLabel(item.branch?.name, t)}</td>
                    <td className="px-4 py-4">
                      {effectiveScheduleName(
                        scheduleAssignments.data,
                        schedules.data,
                        item.id,
                      ) || t("notAvailable")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold">
                      {money(item.salary, currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {item.workingHours ?? t("notAvailable")}
                      {item.workingHours != null && ` ${t("hours").toLowerCase()}`}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">
                      {item.biometricCode || t("notAvailable")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                      {date(item.joinedOn)}
                    </td>
                    <td className="px-5 py-4">
                      <Status value={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
            <div className="grid gap-3 p-3 lg:hidden sm:grid-cols-2 sm:p-4">
              {q.data.map((item: any) => {
                const shift =
                  effectiveScheduleName(
                    scheduleAssignments.data,
                    schedules.data,
                    item.id,
                  ) || t("notAvailable");
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setLocation(`/employees/${item.id}`)}
                    className="group rounded-2xl border border-border bg-background p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-sm)] rtl:text-right"
                    data-testid={`card-employee-${item.id}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                          {item.avatarInitials ||
                            `${item.firstName[0]}${item.lastName[0]}`}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-semibold">
                            {item.firstName} {item.lastName}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {item.phone || t("notAvailable")}
                          </div>
                        </div>
                      </div>
                      <Status value={item.status} />
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                      <span className="font-mono text-xs font-bold tracking-wide text-secondary">
                        {item.employeeNumber}
                      </span>
                      <ArrowUpRight
                        size={16}
                        className="text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <Info label={t("nationalId")} value={item.nationalId || t("notAvailable")} />
                      <Info label={t("phoneNumber")} value={item.phone || t("notAvailable")} />
                      <Info
                        label={t("department")}
                        value={departmentLabel(item.department?.name, t)}
                      />
                      <Info label={t("branch")} value={branchLabel(item.branch?.name, t)} />
                      <Info label={t("shift")} value={shift} />
                      <Info label={t("monthlySalary")} value={money(item.salary, currency)} />
                      <Info
                        label={t("workingHours")}
                        value={
                          item.workingHours != null
                            ? `${item.workingHours} ${t("hours").toLowerCase()}`
                            : t("notAvailable")
                        }
                      />
                      <Info
                        label={t("biometricCode")}
                        value={item.biometricCode || t("notAvailable")}
                      />
                      <Info
                        label={t("employmentStartDate")}
                        value={date(item.joinedOn)}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <Empty
            title={t("noEmployeesMatch")}
            detail={t("adjustEmployeeSearch")}
            action={
              canCreateEmployees ? (
                <Button
                  onClick={() => setLocation("/employees/new")}
                  data-testid="button-empty-create-employee"
                >
                  <Plus size={15} />
                  {t("addEmployee")}
                </Button>
              ) : undefined
            }
          />
        )}
      </Card>
    </div>
  );
}

function Attendance() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const workspace = useGetWorkspace();
  const [tab, setTab] = useState<"today" | "history">("today");
  const [filters, setFilters] = useState({ from: "", to: "", employeeId: "" });
  const [correction, setCorrection] = useState<any | null>(null);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState("");
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    minutes: "",
    adjustmentType: "time",
    reason: "",
  });
  const [gpsState, setGpsState] = useState("not_required");
  const today = useGetAttendanceToday();
  const employees = useListEmployees({ status: "active" });
  const history = useListAttendanceHistory({
    from: filters.from || undefined,
    to: filters.to || undefined,
    employeeId: filters.employeeId || undefined,
  });
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const correct = useCorrectAttendance();
  const calculation = usePreviewAttendanceCalculation(selectedAttendanceId, {
    query: {
      enabled: Boolean(selectedAttendanceId),
      queryKey: getPreviewAttendanceCalculationQueryKey(selectedAttendanceId),
    },
  });
  const timeAdjustments = useListAttendanceTimeAdjustments(
    selectedAttendanceId,
    {
      query: {
        enabled: Boolean(selectedAttendanceId),
        queryKey:
          getListAttendanceTimeAdjustmentsQueryKey(selectedAttendanceId),
      },
    },
  );
  const createAdjustment = useCreateAttendanceTimeAdjustment();
  const decideAdjustment = useDecideAttendanceTimeAdjustment();
  const reverseAdjustment = useReverseAttendanceTimeAdjustment();
  const isScoped =
    workspace.data?.role === "employee" || workspace.data?.role === "manager";
  const canCorrect =
    workspace.data?.capabilities?.includes("attendance.correct") ?? false;
  const canAdjust =
    workspace.data?.capabilities?.includes("attendance.adjust") ?? false;
  const record = today.data?.records?.find(
    (item: any) => item.employee.id === workspace.data?.employeeId,
  );
  const action = record?.checkIn && !record.checkOut ? "out" : "in";
  const employeeDepartment = record?.employee?.department
    ? departmentLabel(record.employee.department, t)
    : t("companyAttendanceView");
  const toDateTimeInput = (value?: string | null) =>
    value ? new Date(value).toISOString().slice(0, 16) : "";
  const displayTime = (value?: string | null) =>
    value ? time(value) : t("missing");
  function locationLabel(value?: string | null) {
    return value === "verified"
      ? t("locationVerified")
      : value === "outside_geofence"
        ? t("locationOutside")
        : value === "low_accuracy"
          ? t("locationLowAccuracy")
          : value === "pending"
            ? t("locationPending")
            : value === "unavailable"
              ? t("locationUnavailable")
              : value === "requesting"
                ? t("gpsRequesting")
                : value === "captured"
                  ? t("attendanceLocationCaptured")
                  : t("locationNotRequired");
  }
  async function event(kind: "in" | "out") {
    setGpsState("requesting");
    let location: {
      latitude: number;
      longitude: number;
      accuracyMeters: number;
      capturedAt: string;
    } | null = null;
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 30000,
            }),
        );
        location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          capturedAt: new Date().toISOString(),
        };
      } catch (error) {
        setGpsState("unavailable");
        toast.warning(
          (error as GeolocationPositionError)?.code === 1
            ? t("gpsPermissionDenied")
            : t("gpsUnavailable"),
        );
      }
    } else {
      setGpsState("unavailable");
      toast.warning(t("gpsUnavailable"));
    }
    const data = location ? { source: "web", ...location } : { source: "web" };
    (kind === "in" ? checkIn : checkOut).mutate({ data } as any, {
      onSuccess: () => {
        setGpsState(location ? "captured" : "unavailable");
        toast.success(
          t(kind === "in" ? "checkInRecorded" : "checkOutRecorded"),
        );
        qc.invalidateQueries({ queryKey: getGetAttendanceTodayQueryKey() });
        qc.invalidateQueries({ queryKey: getListAttendanceHistoryQueryKey() });
      },
      onError: (error: unknown) =>
        toast.error(apiErrorMessage(error, t("attendanceNotAccepted"))),
    });
  }
  function openCorrection(item: any) {
    setCorrection({
      id: item.id,
      checkIn: toDateTimeInput(item.checkIn),
      checkOut: toDateTimeInput(item.checkOut),
      status: item.status,
      reason: "",
    });
  }
  function submitCorrection(event: FormEvent) {
    event.preventDefault();
    if (!correction?.reason.trim()) return;
    correct.mutate(
      {
        attendanceId: correction.id,
        data: {
          checkIn: correction.checkIn
            ? new Date(correction.checkIn).toISOString()
            : null,
          checkOut: correction.checkOut
            ? new Date(correction.checkOut).toISOString()
            : null,
          status: correction.status,
          reason: correction.reason.trim(),
        } as any,
      },
      {
        onSuccess: () => {
          toast.success(t("attendanceCorrectionUpdated"));
          setCorrection(null);
          qc.invalidateQueries({ queryKey: getGetAttendanceTodayQueryKey() });
          qc.invalidateQueries({
            queryKey: getListAttendanceHistoryQueryKey(),
          });
        },
        onError: () => toast.error(t("attendanceCorrectionFailed")),
      },
    );
  }
  function submitAdjustment(event: FormEvent) {
    event.preventDefault();
    const minutes = Number(adjustmentForm.minutes);
    if (
      !selectedAttendanceId ||
      !Number.isInteger(minutes) ||
      minutes === 0 ||
      !adjustmentForm.reason.trim()
    ) {
      return;
    }
    if (adjustmentForm.adjustmentType === "overtime" && minutes < 1) return;
    createAdjustment.mutate(
      {
        attendanceId: selectedAttendanceId,
        data: {
          minutes,
          adjustmentType: adjustmentForm.adjustmentType as
            "time" | "overtime" | "permission",
          reason: adjustmentForm.reason.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success("Attendance adjustment submitted for approval.");
          setShowAdjustmentForm(false);
          setAdjustmentForm({
            minutes: "",
            adjustmentType: "time",
            reason: "",
          });
          qc.invalidateQueries({
            queryKey:
              getListAttendanceTimeAdjustmentsQueryKey(selectedAttendanceId),
          });
          qc.invalidateQueries({
            queryKey:
              getPreviewAttendanceCalculationQueryKey(selectedAttendanceId),
          });
        },
        onError: (error: unknown) =>
          toast.error(apiErrorMessage(error, "Could not submit adjustment.")),
      },
    );
  }
  function decideAdjustmentById(id: string, decision: "approved" | "rejected") {
    decideAdjustment.mutate(
      { adjustmentId: id, data: { decision } },
      {
        onSuccess: () => {
          toast.success(`Adjustment ${decision}.`);
          qc.invalidateQueries({
            queryKey:
              getListAttendanceTimeAdjustmentsQueryKey(selectedAttendanceId),
          });
          qc.invalidateQueries({
            queryKey:
              getPreviewAttendanceCalculationQueryKey(selectedAttendanceId),
          });
        },
        onError: (error: unknown) =>
          toast.error(apiErrorMessage(error, "Could not update adjustment.")),
      },
    );
  }
  function reverseAdjustmentById(id: string) {
    const reason = window.prompt("Reason for reversing this adjustment:");
    if (!reason?.trim()) return;
    reverseAdjustment.mutate(
      { adjustmentId: id, data: { reason: reason.trim() } },
      {
        onSuccess: () => {
          toast.success("Adjustment reversed.");
          qc.invalidateQueries({
            queryKey:
              getListAttendanceTimeAdjustmentsQueryKey(selectedAttendanceId),
          });
          qc.invalidateQueries({
            queryKey:
              getPreviewAttendanceCalculationQueryKey(selectedAttendanceId),
          });
        },
        onError: (error: unknown) =>
          toast.error(apiErrorMessage(error, "Could not reverse adjustment.")),
      },
    );
  }
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("attendance")}
        title={t("attendance")}
        detail={t("attendanceRulesDetail")}
        action={
          <div className="flex gap-2">
            <Button
              variant={tab === "today" ? "primary" : "outline"}
              onClick={() => setTab("today")}
            >
              {t("today")}
            </Button>
            <Button
              variant={tab === "history" ? "primary" : "outline"}
              onClick={() => setTab("history")}
            >
              {t("history")}
            </Button>
          </div>
        }
      />
      {tab === "today" ? (
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <Card className="bg-secondary p-6 text-sidebar-foreground">
            <p className="text-xs uppercase tracking-[.16em] text-sidebar-foreground/55">
              {isScoped
                ? t("currentEmployeeContext")
                : t("companyAttendanceView")}
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              {record?.employee?.name || t("companyAttendanceView")}
            </h2>
            <p className="mt-1 text-sm text-sidebar-foreground/60">
              {employeeDepartment}
            </p>
            <div className="my-8 h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-sidebar-foreground/50">
                  {t("status")}
                </p>
                <div className="mt-1">
                  {record ? (
                    <Status value={record.status} />
                  ) : (
                    <Badge>{t("notAvailable")}</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-sidebar-foreground/50">
                  {t("scheduledStart")}
                </p>
                <p className="mt-1 font-mono text-lg">
                  {record?.scheduledStart || "—"}
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
              <span className="text-xs text-sidebar-foreground/55">
                {t("locationState")}
              </span>
              <Badge
                tone={
                  gpsState === "verified" || gpsState === "captured"
                    ? "good"
                    : gpsState === "outside_geofence" ||
                        gpsState === "low_accuracy"
                      ? "warn"
                      : "neutral"
                }
              >
                {locationLabel(gpsState)}
              </Badge>
            </div>
            {isScoped ? (
              <>
                <Button
                  disabled={
                    !record ||
                    (action === "in"
                      ? checkIn.isPending
                      : checkOut.isPending) ||
                    gpsState === "requesting"
                  }
                  onClick={() => void event(action)}
                  className="mt-7 w-full bg-accent text-secondary hover:bg-accent/90"
                >
                  {gpsState === "requesting"
                    ? t("gpsRequesting")
                    : action === "in"
                      ? t("checkInNow")
                      : t("checkOutNow")}{" "}
                  <ArrowUpRight size={16} />
                </Button>
                <p className="mt-3 text-center text-[11px] text-sidebar-foreground/45">
                  {t("webEventPolicy")}
                </p>
              </>
            ) : (
              <p className="mt-7 text-center text-xs text-sidebar-foreground/55">
                {t("attendanceFilters")}
              </p>
            )}
          </Card>
          <Card>
            <div className="border-b border-border p-5">
              <h2 className="font-display text-lg font-semibold">
                {t("todayRegister")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {today.data?.date
                  ? date(today.data.date)
                  : t("loadingOperationalDate")}
              </p>
            </div>
            {today.isLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : today.isError ? (
              <ErrorState retry={() => today.refetch()} />
            ) : today.data?.records?.length ? (
              <div className="divide-y divide-border">
                {today.data.records.slice(0, 12).map((x: any) => (
                  <div
                    className="flex items-center justify-between gap-4 p-4"
                    key={x.id}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-muted text-xs font-bold">
                        {x.employee.initials}
                      </div>
                      <div>
                        <div className="font-semibold">{x.employee.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {displayTime(x.checkIn)} → {displayTime(x.checkOut)} ·{" "}
                          {x.workedHours}h
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Status value={x.status} />
                      <span className="text-[10px] text-muted-foreground">
                        {locationLabel(x.locationStatus)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                title={t("noAttendanceRecords")}
                detail={t("attendanceWillAppear")}
              />
            )}
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Search size={16} className="text-primary" />
              {t("attendanceFilters")}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field
                label={t("filterFrom")}
                type="date"
                value={filters.from}
                onChange={(value) => setFilters({ ...filters, from: value })}
              />
              <Field
                label={t("filterTo")}
                type="date"
                value={filters.to}
                onChange={(value) => setFilters({ ...filters, to: value })}
              />
              {workspace.data?.role !== "employee" ? (
                <label className="block text-sm font-semibold">
                  {t("employee")}
                  <select
                    value={filters.employeeId}
                    onChange={(event) =>
                      setFilters({ ...filters, employeeId: event.target.value })
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                  >
                    <option value="">{t("allEmployees")}</option>
                    {employees.data?.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.firstName} {item.lastName}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <div />
              )}
            </div>
            <div className="mt-3 flex justify-end">
              <Button
                variant="quiet"
                onClick={() => setFilters({ from: "", to: "", employeeId: "" })}
              >
                {t("clearFilters")}
              </Button>
            </div>
          </Card>
          <Card>
            {history.isLoading ? (
              <Skeleton className="m-5 h-48" />
            ) : history.isError ? (
              <ErrorState retry={() => history.refetch()} />
            ) : history.data?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">{t("date")}</th>
                      <th className="px-4 py-3">{t("employee")}</th>
                      <th className="px-4 py-3">{t("checkIn")}</th>
                      <th className="px-4 py-3">{t("checkOut")}</th>
                      <th className="px-4 py-3">{t("hours")}</th>
                      <th className="px-5 py-3">{t("status")}</th>
                      {(canCorrect || canAdjust) && (
                        <th className="px-5 py-3 text-right">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {history.data.map((x: any) => (
                      <tr key={x.id}>
                        <td className="px-5 py-4">{date(x.date)}</td>
                        <td className="px-4 py-4 font-semibold">
                          {x.employee.name}
                        </td>
                        <td className="px-4 py-4">{displayTime(x.checkIn)}</td>
                        <td className="px-4 py-4">{displayTime(x.checkOut)}</td>
                        <td className="px-4 py-4 font-mono">{x.workedHours}</td>
                        <td className="px-5 py-4">
                          <Status value={x.status} />
                        </td>
                        {(canCorrect || canAdjust) && (
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                className="text-xs"
                                onClick={() => setSelectedAttendanceId(x.id)}
                              >
                                Calculation
                              </Button>
                              {canAdjust && (
                                <Button
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => {
                                    setSelectedAttendanceId(x.id);
                                    setShowAdjustmentForm(true);
                                  }}
                                >
                                  Adjust
                                </Button>
                              )}
                              {canCorrect && (
                                <Button
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => openCorrection(x)}
                                >
                                  {t("correctAttendance")}
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty title={t("noHistory")} detail={t("historyWillAppear")} />
            )}
          </Card>
        </div>
      )}
      {correction && (
        <Modal
          title={t("correctAttendance")}
          onClose={() => setCorrection(null)}
        >
          <form onSubmit={submitCorrection} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label={t("checkIn")}
                type="datetime-local"
                value={correction.checkIn}
                onChange={(value) =>
                  setCorrection({ ...correction, checkIn: value })
                }
              />
              <Field
                label={t("checkOut")}
                type="datetime-local"
                value={correction.checkOut}
                onChange={(value) =>
                  setCorrection({ ...correction, checkOut: value })
                }
              />
            </div>
            <label className="block text-sm font-semibold">
              {t("status")}
              <select
                value={correction.status}
                onChange={(event) =>
                  setCorrection({ ...correction, status: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
              >
                {[
                  "present",
                  "late",
                  "absent",
                  "on_leave",
                  "incomplete",
                  "holiday",
                ].map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status, t)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold">
              {t("correctionReason")}
              <textarea
                required
                minLength={1}
                value={correction.reason}
                onChange={(event) =>
                  setCorrection({ ...correction, reason: event.target.value })
                }
                placeholder={t("correctionReasonPlaceholder")}
                className="mt-1 min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="quiet"
                onClick={() => setCorrection(null)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={correct.isPending}>
                {correct.isPending ? t("saving") : t("saveCorrection")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {selectedAttendanceId && (
        <Modal
          title="Attendance calculation and adjustments"
          onClose={() => {
            setSelectedAttendanceId("");
            setShowAdjustmentForm(false);
          }}
        >
          {calculation.isLoading ? (
            <Skeleton className="h-32" />
          ) : calculation.isError ? (
            <ErrorState retry={() => calculation.refetch()} />
          ) : calculation.data ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Original</p>
                  <p className="mt-1 font-mono">
                    {calculation.data.originalWorkedMinutes}m worked
                  </p>
                  <p className="font-mono">
                    {calculation.data.originalOvertimeMinutes}m overtime
                  </p>
                </Card>
                <Card className="bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">
                    Manual approved
                  </p>
                  <p className="mt-1 font-mono">
                    {calculation.data.manualMinutes}m time
                  </p>
                  <p className="font-mono">
                    {calculation.data.manualOvertimeMinutes}m overtime
                  </p>
                </Card>
                <Card className="bg-primary/5 p-3">
                  <p className="text-xs text-muted-foreground">Final</p>
                  <p className="mt-1 font-mono">
                    {calculation.data.finalWorkedMinutes}m worked
                  </p>
                  <p className="font-mono">
                    {calculation.data.finalOvertimeMinutes}m overtime
                  </p>
                  <p className="font-mono">
                    {calculation.data.finalPenaltyMinutes}m penalties
                  </p>
                </Card>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Adjustment history</h3>
                {canAdjust && (
                  <Button
                    variant="outline"
                    onClick={() => setShowAdjustmentForm((value) => !value)}
                  >
                    {showAdjustmentForm ? "Close form" : "Add adjustment"}
                  </Button>
                )}
              </div>
              {showAdjustmentForm && (
                <form
                  onSubmit={submitAdjustment}
                  className="space-y-3 rounded-lg border border-border p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Minutes (negative reduces time)"
                      type="number"
                      value={adjustmentForm.minutes}
                      onChange={(value) =>
                        setAdjustmentForm({ ...adjustmentForm, minutes: value })
                      }
                    />
                    <label className="block text-sm font-semibold">
                      Type
                      <select
                        value={adjustmentForm.adjustmentType}
                        onChange={(event) =>
                          setAdjustmentForm({
                            ...adjustmentForm,
                            adjustmentType: event.target.value,
                          })
                        }
                        className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                      >
                        <option value="time">Worked time</option>
                        <option value="overtime">Manual overtime</option>
                        <option value="permission">Emergency permission</option>
                      </select>
                    </label>
                  </div>
                  <textarea
                    required
                    minLength={1}
                    value={adjustmentForm.reason}
                    onChange={(event) =>
                      setAdjustmentForm({
                        ...adjustmentForm,
                        reason: event.target.value,
                      })
                    }
                    placeholder="Mandatory reason"
                    className="min-h-20 w-full rounded-lg border border-input bg-background p-3 text-sm"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={createAdjustment.isPending}>
                      {createAdjustment.isPending
                        ? "Submitting…"
                        : "Submit for approval"}
                    </Button>
                  </div>
                </form>
              )}
              {timeAdjustments.isLoading ? (
                <Skeleton className="h-24" />
              ) : timeAdjustments.data?.length ? (
                <div className="space-y-2">
                  {timeAdjustments.data.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold">
                          {item.adjustmentType} · {item.minutes > 0 ? "+" : ""}
                          {item.minutes} minutes
                        </p>
                        <p className="text-muted-foreground">{item.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.status} · created by {item.createdBy} ·{" "}
                          {date(item.createdAt)}
                          {item.approvedAt
                            ? ` · approved ${date(item.approvedAt)}`
                            : ""}
                          {item.rejectedAt
                            ? ` · rejected ${date(item.rejectedAt)}`
                            : ""}
                          {item.reversedAt
                            ? ` · reversed ${date(item.reversedAt)}`
                            : ""}
                        </p>
                      </div>
                      {canAdjust && item.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="text-xs"
                            onClick={() =>
                              decideAdjustmentById(item.id, "approved")
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="text-xs"
                            onClick={() =>
                              decideAdjustmentById(item.id, "rejected")
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {canAdjust && item.status === "approved" && (
                        <Button
                          variant="outline"
                          className="text-xs"
                          onClick={() => reverseAdjustmentById(item.id)}
                        >
                          Reverse
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No attendance adjustments.
                </p>
              )}
              <details>
                <summary className="cursor-pointer text-sm font-semibold">
                  Calculation explanation
                </summary>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                  {calculation.data.explanation.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </details>
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
}

function Requests() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const workspaceQuery = useGetWorkspace();
  const capabilities = workspaceQuery.data?.capabilities || [];
  const canCreateLeave = capabilities.includes("leave.create");
  const canCreatePermissions = capabilities.includes("permissions.create");
  const canApproveLeave = capabilities.includes("leave.approve");
  const canApprovePermissions = capabilities.includes("permissions.approve");
  const currentEmployeeId = workspaceQuery.data?.employeeId;
  const [kind, setKind] = useState<"leave" | "permission">("leave");
  const [show, setShow] = useState(false);
  const [decision, setDecision] = useState<{
    id: string;
    approved: boolean;
    type: "leave" | "permission";
  } | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const balances = useListLeaveBalances();
  const leaves = useListLeaveRequests();
  const permissions = useListPermissionRequests();
  const createLeave = useCreateLeaveRequest();
  const createPermission = useCreatePermissionRequest();
  const decideLeave = useDecideLeaveRequest();
  const cancelLeave = useCancelLeaveRequest();
  const decidePermission = useDecidePermissionRequest();
  const [form, setForm] = useState<any>({
    type: "Annual leave",
    from: "",
    to: "",
    reason: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const leaveTypes = Array.from(
    new Set((balances.data || []).map((balance: any) => balance.type)),
  ) as string[];
  const canCreateCurrent =
    kind === "leave" ? canCreateLeave : canCreatePermissions;
  function openRequest() {
    setForm({
      type:
        kind === "leave" ? leaveTypes[0] || "Annual leave" : "Short absence",
      from: "",
      to: "",
      reason: "",
      date: "",
      startTime: "",
      endTime: "",
    });
    setShow(true);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const mutation = kind === "leave" ? createLeave : createPermission;
    const data =
      kind === "leave"
        ? { type: form.type, from: form.from, to: form.to, reason: form.reason }
        : {
            type: form.type,
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
            reason: form.reason,
          };
    mutation.mutate({ data } as any, {
      onSuccess: () => {
        toast.success(t("requestSubmitted"));
        setShow(false);
        qc.invalidateQueries({
          queryKey:
            kind === "leave"
              ? getListLeaveRequestsQueryKey()
              : getListPermissionRequestsQueryKey(),
        });
        qc.invalidateQueries({ queryKey: getListLeaveBalancesQueryKey() });
      },
      onError: () => toast.error(t("couldNotSubmitRequest")),
    });
  }
  function openDecision(
    id: string,
    approved: boolean,
    type: "leave" | "permission",
  ) {
    setDecision({ id, approved, type });
    setDecisionReason("");
  }
  function confirmDecision(event: FormEvent) {
    event.preventDefault();
    if (decision && !decision.approved && !decisionReason.trim()) {
      toast.error(t("decisionReasonRequired"));
      return;
    }
    if (!decision) return;
    const mutation = decision.type === "leave" ? decideLeave : decidePermission;
    mutation.mutate(
      {
        requestId: decision.id,
        data: {
          decision: decision.approved ? "approved" : "rejected",
          reason: decisionReason.trim() || undefined,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success(
            decision.approved ? t("requestApproved") : t("requestRejected"),
          );
          setDecision(null);
          qc.invalidateQueries({
            queryKey:
              decision.type === "leave"
                ? getListLeaveRequestsQueryKey()
                : getListPermissionRequestsQueryKey(),
          });
          qc.invalidateQueries({ queryKey: getListLeaveBalancesQueryKey() });
        },
        onError: () =>
          toast.error(
            decision.approved
              ? t("couldNotSubmitRequest")
              : t("couldNotSubmitRequest"),
          ),
      },
    );
  }
  function cancelRequest(id: string) {
    cancelLeave.mutate(
      { requestId: id, data: { reason: "Cancelled by requester" } },
      {
        onSuccess: () => {
          toast.success("Leave request cancelled");
          qc.invalidateQueries({ queryKey: getListLeaveRequestsQueryKey() });
          qc.invalidateQueries({ queryKey: getListLeaveBalancesQueryKey() });
          qc.invalidateQueries({
            queryKey: getListLeaveBalanceTransactionsQueryKey(),
          });
        },
        onError: () => toast.error("Could not cancel leave request"),
      },
    );
  }
  const rows: any[] =
    kind === "leave" ? leaves.data || [] : permissions.data || [];
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("decisionQueue")}
        title={t("requestsTitle")}
        detail={t("requestsDetail")}
        action={
          canCreateCurrent ? (
            <Button onClick={openRequest} data-testid="button-create-request">
              <Plus size={16} />
              {t("newRequest")}
            </Button>
          ) : undefined
        }
      />
      <div className="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-[.16em] text-muted-foreground">
              {t("queueHygiene")}
            </p>
            <p className="mt-2 text-3xl font-display font-semibold">
              {(leaves.data || []).filter((x: any) => x.status === "pending")
                .length +
                (permissions.data || []).filter(
                  (x: any) => x.status === "pending",
                ).length}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("pendingDecisions")}
            </p>
          </Card>
        </div>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              <Button
                className="px-3 py-1.5 text-xs"
                variant={kind === "leave" ? "primary" : "quiet"}
                onClick={() => setKind("leave")}
              >
                {t("leave")}
              </Button>
              <Button
                className="px-3 py-1.5 text-xs"
                variant={kind === "permission" ? "primary" : "quiet"}
                onClick={() => setKind("permission")}
              >
                {t("permission")}
              </Button>
            </div>
            <span className="text-xs text-muted-foreground">
              {rows.length} {t("records")}
            </span>
          </div>
          {rows.length ? (
            <div className="divide-y divide-border">
              {rows.map((r: any) => (
                <div className="p-5" key={r.id}>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{r.employee.name}</span>
                        <Status value={r.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {requestTypeLabel(r.type, t)} ·{" "}
                        {kind === "leave"
                          ? `${date(r.from)} – ${date(r.to)} · ${r.days} ${t("daysRemaining")}`
                          : `${date(r.date)} · ${r.startTime} – ${r.endTime}`}
                      </p>
                      <p className="mt-3 text-sm">{r.reason}</p>
                      {r.decisionReason && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {t("decisionReason")}: {r.decisionReason}
                        </p>
                      )}
                    </div>
                    {r.status === "pending" &&
                      r.employee.id !== currentEmployeeId &&
                      ((kind === "leave" && canApproveLeave) ||
                        (kind === "permission" && canApprovePermissions)) && (
                        <div className="flex shrink-0 gap-2">
                          <Button
                            variant="outline"
                            className="text-primary"
                            onClick={() => openDecision(r.id, true, kind)}
                          >
                            <Check size={15} />
                            {t("approve")}
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => openDecision(r.id, false, kind)}
                          >
                            <X size={15} />
                            {t("reject")}
                          </Button>
                        </div>
                      )}
                    {kind === "leave" &&
                      currentEmployeeId === r.employee?.id &&
                      (r.status === "pending" || r.status === "approved") && (
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="quiet"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => cancelRequest(r.id)}
                            disabled={cancelLeave.isPending}
                          >
                            Cancel request
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title={t("queueClear")}
              detail={t("requestsAppear")}
              action={
                canCreateCurrent ? (
                  <Button onClick={openRequest}>
                    <Plus size={15} />
                    {t("createRequest")}
                  </Button>
                ) : undefined
              }
            />
          )}
        </Card>
      </div>
      {show && (
        <Modal
          title={tr("newKindRequest", { kind: t(kind) })}
          onClose={() => setShow(false)}
        >
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold">
              {t("type")}
              {kind === "leave" && leaveTypes.length ? (
                <select
                  required
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                >
                  {leaveTypes.map((type) => (
                    <option key={type} value={type}>
                      {requestTypeLabel(type, t)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                />
              )}
            </label>
            {kind === "leave" ? (
              <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
                <Field
                  label={t("from")}
                  type="date"
                  value={form.from}
                  onChange={(value) => setForm({ ...form, from: value })}
                  required
                />
                <Field
                  label={t("to")}
                  type="date"
                  value={form.to}
                  onChange={(value) => setForm({ ...form, to: value })}
                  required
                />
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                <Field
                  label={t("date")}
                  type="date"
                  value={form.date}
                  onChange={(value) => setForm({ ...form, date: value })}
                  required
                />
                <Field
                  label={t("start")}
                  type="time"
                  value={form.startTime}
                  onChange={(value) => setForm({ ...form, startTime: value })}
                  required
                />
                <Field
                  label={t("end")}
                  type="time"
                  value={form.endTime}
                  onChange={(value) => setForm({ ...form, endTime: value })}
                  required
                />
              </div>
            )}
            <label className="block text-sm font-semibold">
              {t("reason")}
              <textarea
                required
                value={form.reason}
                onChange={(event) =>
                  setForm({ ...form, reason: event.target.value })
                }
                className="mt-1 min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="quiet"
                onClick={() => setShow(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={
                  kind === "leave"
                    ? createLeave.isPending
                    : createPermission.isPending
                }
              >
                {t("submitRequest")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {decision && (
        <Modal title={t("confirmDecision")} onClose={() => setDecision(null)}>
          <form onSubmit={confirmDecision} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {decision.approved ? t("requestApproved") : t("requestRejected")}
            </p>
            <label className="block text-sm font-semibold">
              {t("decisionReason")}
              <textarea
                required={!decision.approved}
                value={decisionReason}
                onChange={(event) => setDecisionReason(event.target.value)}
                placeholder={t("decisionReasonPlaceholder")}
                className="mt-1 min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="quiet"
                onClick={() => setDecision(null)}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                variant={decision.approved ? "primary" : "danger"}
                disabled={decideLeave.isPending || decidePermission.isPending}
              >
                {t("confirmDecision")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/*
type AnnualLeaveControlsContextValue = {
  attendanceForm: any;
  setAttendanceForm: (value: any) => void;
};

const AnnualLeaveControlsContext =
  createContext<AnnualLeaveControlsContextValue | null>(null);

function AnnualLeaveControls() {
  const annualLeaveContext = useContext(AnnualLeaveControlsContext);
  if (!annualLeaveContext) {
    throw new Error("Annual leave controls require Attendance Rules context.");
  }
  const { attendanceForm, setAttendanceForm } = annualLeaveContext;
  const { t, locale } = useI18n();
  const qc = useQueryClient();
  const balances = useListLeaveBalances();
  const policies = useListLeavePolicies();
  const ledger = useListLeaveBalanceTransactions();
  const createPolicy = useCreateLeavePolicy();
  const adjustBalance = useAdjustLeaveBalance();
  const [policyForm, setPolicyForm] = useState<any>({
    leaveType: "Annual leave",
    annualEntitlement: Number(attendanceForm.annualLeaveEntitlement ?? 21),
    accrualFrequency: "monthly",
    deductionMode: "automatic",
    carryForwardAllowed: false,
    carryForwardDays: 0,
    carryForwardExpiryMonths: "",
    allowNegative: false,
    periodStartMonth: Number(attendanceForm.annualLeavePeriodStartMonth ?? 1),
    allowedBalanceMonths: Array.from({ length: 12 }, (_, index) => index + 1),
    monthlyDeductionLimit: 1,
    enabled: true,
    effectiveFrom: new Date().toISOString().slice(0, 10),
  });
  const [adjustment, setAdjustment] = useState<{
    id: string;
    amount: string;
    reason: string;
  } | null>(null);

  function policyFrequency(value: string) {
    return (
      {
        monthly: locale === "ar" ? "شهري" : "Monthly",
        quarterly: locale === "ar" ? "ربع سنوي" : "Quarterly",
        annual: locale === "ar" ? "سنوي" : "Annual",
        hire_date: locale === "ar" ? "تاريخ التعيين" : "Hire date",
      }[value] || value
    );
  }

  function deductionMode(value: string) {
    return value === "automatic" ? t("automatic") : t("manual");
  }

  function transactionType(value: string) {
    return (
      {
        accrual: locale === "ar" ? "استحقاق" : "Accrual",
        deduction: locale === "ar" ? "خصم" : "Deduction",
        restoration: locale === "ar" ? "إعادة" : "Restoration",
        adjustment: locale === "ar" ? "تعديل" : "Adjustment",
      }[value] || value
    );
  }

  function submitPolicy(event: FormEvent) {
    event.preventDefault();
    createPolicy.mutate(
      {
        data: {
          ...policyForm,
          annualEntitlement: Number(policyForm.annualEntitlement),
          carryForwardDays: Number(policyForm.carryForwardDays),
          allowedBalanceMonths: policyForm.allowedBalanceMonths.map(Number),
          monthlyDeductionLimit: Number(policyForm.monthlyDeductionLimit),
          carryForwardExpiryMonths:
            policyForm.carryForwardExpiryMonths === ""
              ? null
              : Number(policyForm.carryForwardExpiryMonths),
        },
      } as any,
      {
        onSuccess: () => {
          toast.success(t("leavePolicyVersionCreated"));
          qc.invalidateQueries({ queryKey: getListLeavePoliciesQueryKey() });
          qc.invalidateQueries({ queryKey: getListLeaveBalancesQueryKey() });
        },
        onError: (error) =>
          toast.error(apiErrorMessage(error, t("couldNotCreateLeavePolicy"))),
      },
    );
  }

  function submitAdjustment(event: FormEvent) {
    event.preventDefault();
    if (
      !adjustment ||
      !adjustment.reason.trim() ||
      Number(adjustment.amount) === 0
    )
      return;
    adjustBalance.mutate(
      {
        balanceId: adjustment.id,
        data: {
          amount: Number(adjustment.amount),
          reason: adjustment.reason.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success(t("balanceAdjusted"));
          setAdjustment(null);
          qc.invalidateQueries({ queryKey: getListLeaveBalancesQueryKey() });
          qc.invalidateQueries({
            queryKey: getListLeaveBalanceTransactionsQueryKey(),
          });
        },
        onError: (error) =>
          toast.error(apiErrorMessage(error, t("couldNotAdjustBalance"))),
      },
    );
  }

  return (
    <div className="mt-5 border-t border-border pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[.16em] text-muted-foreground">
              {t("leaveControls")}
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold">
              {t("policiesBalanceLedger")}
            </h2>
          </div>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
            <div className="space-y-3">
              {(policies.data || []).map((policy: any) => (
                <div
                  key={policy.id}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold">
                      {requestTypeLabel(policy.leaveType, t)} · v
                      {policy.version}
                    </span>
                    <Status value={policy.status} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {policy.annualEntitlement} {t("days")} /{" "}
                    {locale === "ar" ? "سنة" : "year"} ·{" "}
                    {policyFrequency(policy.accrualFrequency)} ·{" "}
                    {deductionMode(policy.deductionMode)} ·{" "}
                    {locale === "ar" ? "ساري من" : "effective"}{" "}
                    {policy.effectiveFrom}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {locale === "ar" ? "الترحيل" : "Carry-forward"}:{" "}
                    {policy.carryForwardAllowed
                      ? `${policy.carryForwardDays} ${t("days")}`
                      : locale === "ar"
                        ? "متوقف"
                        : "off"}{" "}
                    · {locale === "ar" ? "الرصيد السالب" : "Negative balance"}:{" "}
                    {policy.allowNegative
                      ? locale === "ar"
                        ? "مسموح"
                        : "allowed"
                      : locale === "ar"
                        ? "محظور"
                        : "blocked"}{" "}
                    · {t("leaveYearStartsMonth")}{" "}
                    {policy.periodStartMonth || 1} · {t("deductionMonths")}:{" "}
                    {(policy.allowedBalanceMonths || []).join(", ")} ·{" "}
                    {t("monthlyMaximum")}: {policy.monthlyDeductionLimit}
                    {!policy.enabled && ` · ${t("disabled")}`}
                  </p>
                </div>
              ))}
              {!policies.isLoading && !policies.data?.length && (
                <Empty
                  title={t("noLeavePolicies")}
                  detail={t("createFirstEffectivePolicy")}
                />
              )}
            </div>
            <form
              onSubmit={submitPolicy}
              className="space-y-3 rounded-xl bg-muted/40 p-4"
            >
              <h3 className="font-semibold">{t("createPolicyVersion")}</h3>
              <Field
                label={t("leaveType")}
                value={policyForm.leaveType}
                onChange={(value) =>
                  setPolicyForm({ ...policyForm, leaveType: value })
                }
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={t("annualEntitlementDays")}
                  type="number"
                  min={0}
                  value={policyForm.annualEntitlement}
                  onChange={(value) => {
                    setPolicyForm({ ...policyForm, annualEntitlement: value });
                    setAttendanceForm({
                      ...attendanceForm,
                      annualLeaveEntitlement: value,
                    });
                  }}
                  required
                />
                <Field
                  label={t("effectiveFrom")}
                  type="date"
                  value={policyForm.effectiveFrom}
                  onChange={(value) =>
                    setPolicyForm({ ...policyForm, effectiveFrom: value })
                  }
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  {t("leaveYearStartsIn")}
                  <select
                    className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                    value={policyForm.periodStartMonth}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setPolicyForm({
                        ...policyForm,
                        periodStartMonth: value,
                      });
                      setAttendanceForm({
                        ...attendanceForm,
                        annualLeavePeriodStartMonth: value,
                      });
                    }}
                  >
                    {Array.from({ length: 12 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {new Date(2020, index, 1).toLocaleString(
                          locale === "ar" ? "ar-EG" : "en-US",
                          { month: "long" },
                        )}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 self-end pb-2 text-sm">
                  <input
                    type="checkbox"
                    checked={policyForm.enabled}
                    onChange={(event) =>
                      setPolicyForm({
                        ...policyForm,
                        enabled: event.target.checked,
                      })
                    }
                  />
                  {t("policyEnabled")}
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  {t("accrualFrequency")}
                  <select
                    className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                    value={policyForm.accrualFrequency}
                    onChange={(event) =>
                      setPolicyForm({
                        ...policyForm,
                        accrualFrequency: event.target.value,
                      })
                    }
                  >
                    <option value="monthly">{policyFrequency("monthly")}</option>
                    <option value="quarterly">
                      {policyFrequency("quarterly")}
                    </option>
                    <option value="annual">{policyFrequency("annual")}</option>
                    <option value="hire_date">
                      {policyFrequency("hire_date")}
                    </option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  {t("deductionMode")}
                  <select
                    className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                    value={policyForm.deductionMode}
                    onChange={(event) =>
                      setPolicyForm({
                        ...policyForm,
                        deductionMode: event.target.value,
                      })
                    }
                  >
                    <option value="automatic">{t("automatic")}</option>
                    <option value="manual">{t("manual")}</option>
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={t("carryForwardDays")}
                  type="number"
                  min={0}
                  value={policyForm.carryForwardDays}
                  onChange={(value) =>
                    setPolicyForm({ ...policyForm, carryForwardDays: value })
                  }
                />
                <Field
                  label={t("carryForwardExpiry")}
                  type="number"
                  min={0}
                  value={policyForm.carryForwardExpiryMonths}
                  onChange={(value) =>
                    setPolicyForm({
                      ...policyForm,
                      carryForwardExpiryMonths: value,
                    })
                  }
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={t("monthlyMaximumDeduction")}
                  type="number"
                  min={0}
                  step={0.25}
                  value={policyForm.monthlyDeductionLimit}
                  onChange={(value) =>
                    setPolicyForm({
                      ...policyForm,
                      monthlyDeductionLimit: value,
                    })
                  }
                  required
                />
                <label className="text-sm font-semibold">
                  {t("balanceDeductionMonths")}
                  <select
                    multiple
                    className="mt-1 min-h-24 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal"
                    value={policyForm.allowedBalanceMonths.map(String)}
                    onChange={(event) =>
                      setPolicyForm({
                        ...policyForm,
                        allowedBalanceMonths: Array.from(
                          event.target.selectedOptions,
                          (option) => Number(option.value),
                        ),
                      })
                    }
                    required
                  >
                    {Array.from({ length: 12 }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {new Date(2020, index, 1).toLocaleString(
                          locale === "ar" ? "ar-EG" : "en-US",
                          { month: "long" },
                        )}
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">
                    {t("selectMultipleMonths")}
                  </span>
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={policyForm.carryForwardAllowed}
                  onChange={(event) =>
                    setPolicyForm({
                      ...policyForm,
                      carryForwardAllowed: event.target.checked,
                    })
                  }
                />
                {t("allowCarryForward")}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={policyForm.allowNegative}
                  onChange={(event) =>
                    setPolicyForm({
                      ...policyForm,
                      allowNegative: event.target.checked,
                    })
                  }
                />
                {t("allowNegativeBalance")}
              </label>
              <Button type="submit" disabled={createPolicy.isPending}>
                {createPolicy.isPending
                  ? t("savingPolicy")
                  : t("createPolicyVersion")}
              </Button>
            </form>
          </div>
          <div className="mt-6 border-t border-border pt-5">
            <h3 className="font-semibold">{t("ledger")}</h3>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-3">{t("employee")}</th>
                  <th className="p-3">{t("type")}</th>
                  <th className="p-3">{locale === "ar" ? "الحدث" : "Event"}</th>
                  <th className="p-3">{locale === "ar" ? "المقدار" : "Amount"}</th>
                  <th className="p-3">{t("leaveBalances")}</th>
                  <th className="p-3">{t("reason")}</th>
                </tr>
              </thead>
              <tbody>
                {(ledger.data || []).map((item: any) => (
                  <tr key={item.id} className="border-b border-border/60">
                    <td className="p-3 font-medium">{item.employee.name}</td>
                    <td className="p-3">
                      {requestTypeLabel(item.leaveType, t)}
                    </td>
                    <td className="p-3">{transactionType(item.transactionType)}</td>
                    <td className="p-3 font-mono">
                      {item.amount > 0 ? "+" : ""}
                      {item.amount}
                    </td>
                    <td className="p-3 font-mono">{item.afterBalance}</td>
                    <td className="max-w-[240px] p-3 text-muted-foreground">
                      {item.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!ledger.isLoading && !ledger.data?.length && (
              <Empty
                title={t("balanceLedgerEmpty")}
                detail={t("balanceLedgerDetail")}
              />
            )}
          </div>
        <div className="mt-6 border-t border-border pt-5">
          <div className="flex items-center gap-2">
          <CalendarDays size={17} className="text-primary" />
            <h3 className="font-semibold">{t("leaveBalances")}</h3>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {balances.isLoading ? (
            <Skeleton className="h-24" />
          ) : balances.data?.length ? (
            balances.data.map((balance: any) => (
              <div key={balance.id} className="rounded-xl border border-border p-4">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="font-semibold">
                    {requestTypeLabel(balance.type, t)}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {balance.employee?.name}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {balance.remaining} {t("daysRemaining")}
                  </span>
                </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>
                      {t("allocatedDays")}: {balance.allocated}
                    </span>
                    <span>
                      {t("usedDays")}: {balance.used}
                    </span>
                  </div>
                <Button
                  variant="quiet"
                  className="mt-2 px-2 py-1 text-xs"
                  onClick={() =>
                    setAdjustment({ id: balance.id, amount: "", reason: "" })
                  }
                >
                  {t("adjustLeaveBalance")}
                </Button>
                <div className="mt-2 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(100, (balance.used / Math.max(1, balance.allocated)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <Empty title={t("notAvailable")} detail={t("requestsAppear")} />
          )}
          </div>
        </div>
      {adjustment && (
        <Modal
          title={t("adjustLeaveBalance")}
          onClose={() => setAdjustment(null)}
        >
          <form onSubmit={submitAdjustment} className="space-y-4">
            <Field
              label={t("adjustmentAmount")}
              type="number"
              value={adjustment.amount}
              onChange={(value) =>
                setAdjustment({ ...adjustment, amount: value })
              }
              placeholder={t("negativeAdjustmentHint")}
              required
            />
            <label className="block text-sm font-semibold">
              {t("reasonRequired")}
              <textarea
                required
                value={adjustment.reason}
                onChange={(event) =>
                  setAdjustment({ ...adjustment, reason: event.target.value })
                }
                className="mt-1 min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="quiet"
                onClick={() => setAdjustment(null)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={adjustBalance.isPending}>
                {adjustBalance.isPending
                  ? t("savingPolicy")
                  : t("applyAdjustment")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

*/

function Rules() {
  const { t, locale } = useI18n();
  const { account } = useAuth();
  const qc = useQueryClient();
  const q = useGetAttendanceRules();
  const update = useUpdateAttendanceRules();
  const canViewRuleHistory = account.accountType === "company_owner";
  const changes = useListAttendanceRuleChanges({
    query: { enabled: canViewRuleHistory },
  });
  const balances = useListLeaveBalances();
  const [form, setForm] = useState<any>(null);
  useEffect(() => {
    if (q.data && !form)
      setForm({
        ...q.data,
        holidayPeriods: q.data.holidayPeriods || [],
        weeklyMultipliers: q.data.weeklyMultipliers || [],
        absenceDeductsAnnualLeave: Boolean(
          q.data.absenceDeductsAnnualLeave,
        ),
        absenceLeaveDeductionTrigger:
          q.data.absenceLeaveDeductionTrigger || "unexcused_absence",
        absenceLeaveDeductionDays: Number(
          q.data.absenceLeaveDeductionDays ?? 1,
        ),
        workingDays: Array.isArray(q.data.workingDays)
          ? q.data.workingDays
          : ["Sun", "Mon", "Tue", "Wed", "Thu"],
        annualLeaveEntitlement: Number(q.data.annualLeaveEntitlement ?? 21),
        annualLeavePeriodStartMonth: Number(
          q.data.annualLeavePeriodStartMonth ?? 1,
        ),
      });
  }, [q.data, form]);
  if (q.isLoading || !form) return <Skeleton className="h-64" />;
  if (q.isError) return <ErrorState retry={() => q.refetch()} />;
  function save() {
    if (!form.workingDays?.length) {
      toast.error(t("workingDaysRequired"));
      return;
    }
    const ruleInput = { ...form };
    for (const field of ["id", "companyId", "createdAt", "updatedAt"]) {
      delete ruleInput[field];
    }
    update.mutate(
      {
        data: {
          ...ruleInput,
          requiredHours: Number(form.requiredHours),
          graceMinutes: Number(form.graceMinutes),
          earlyCheckoutGraceMinutes: Number(form.earlyCheckoutGraceMinutes),
          overtimeAfterMinutes: Number(form.overtimeAfterMinutes),
          overtimeMultiplier: Number(form.overtimeMultiplier),
          hourlyRateDivisor: Number(form.hourlyRateDivisor),
          lateDeductionFactor: Number(form.lateDeductionFactor),
          earlyCheckoutDeductionFactor: Number(form.earlyCheckoutDeductionFactor),
          absenceDeductionFactor: Number(form.absenceDeductionFactor),
          absenceLeaveDeductionDays: Number(form.absenceLeaveDeductionDays),
          annualLeaveEntitlement: Number(form.annualLeaveEntitlement),
          annualLeavePeriodStartMonth: Number(form.annualLeavePeriodStartMonth),
          annualLeaveMonthlyDeductionLimit: Number(
            form.annualLeaveMonthlyDeductionLimit ?? 1,
          ),
          latePenaltyMultiplier: Number(form.latePenaltyMultiplier) as 1 | 2 | 3,
          earlyDeparturePenaltyMultiplier: Number(
            form.earlyDeparturePenaltyMultiplier,
          ) as 1 | 2 | 3,
          absencePenaltyMultiplier: Number(form.absencePenaltyMultiplier) as
            | 1
            | 2
            | 3,
          permissionCoveredMinutesMultiplier: Number(
            form.permissionCoveredMinutesMultiplier,
          ) as 0 | 1 | 2 | 3,
          fullDayPermissionMultiplier: Number(form.fullDayPermissionMultiplier) as
            | 0
            | 1
            | 2
            | 3,
          locationRadiusMeters: Number(form.locationRadiusMeters),
          reason: form.reason?.trim() || t("attendancePolicyUpdated"),
        },
      },
      {
        onSuccess: () => {
          toast.success(t("attendancePolicyRecalculateHint"));
          void invalidateAttendanceRuleDependents(qc);
        },
        onError: (error) =>
          toast.error(apiErrorMessage(error, t("couldNotSaveRecord"))),
      },
    );
  }
  const rules = q.data as any;
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("policyControl")}
        title={t("attendanceRulesTitle")}
        detail={t("attendanceRulesDetail")}
        action={
          <Badge tone="accent">
            {locale === "ar" ? "إعدادات الشركة الحالية" : "Current company settings"}
          </Badge>
        }
      />
      <div className="flex flex-col gap-6">
        <div className="contents">
          <Card className="order-1 p-6">
            <h2 className="font-display text-lg font-semibold">
              {t("attendanceThresholdsTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("attendanceThresholdsDetail")}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Field
                label={t("lateArrivalGrace")}
                type="number"
                min={0}
                required
                value={form.graceMinutes}
                onChange={(value) => setForm({ ...form, graceMinutes: value })}
              />
              <Field
                label={t("earlyDepartureGrace")}
                type="number"
                min={0}
                required
                value={form.earlyCheckoutGraceMinutes}
                onChange={(value) =>
                  setForm({ ...form, earlyCheckoutGraceMinutes: value })
                }
              />
              <Field
                label={t("overtimeStartsAfter")}
                type="number"
                min={0}
                required
                value={form.overtimeAfterMinutes}
                onChange={(value) =>
                  setForm({ ...form, overtimeAfterMinutes: value })
                }
              />
            </div>
            <label className="mt-5 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm font-semibold">
              <input
                type="checkbox"
                checked={Boolean(form.overtimeEligible)}
                onChange={(event) =>
                  setForm({ ...form, overtimeEligible: event.target.checked })
                }
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
              />
              <span>
                {t("automaticOvertimeCalculation")}
                <span className="mt-1 block text-xs font-normal text-muted-foreground">
                  {t("automaticOvertimeCalculationDetail")}
                </span>
              </span>
            </label>
          </Card>
          <Card className="order-2 p-6">
            <h2 className="font-display text-lg font-semibold">
              {t("workingDaysTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("workingDaysDetail")}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {scheduleDayOptions.map(([day, key]) => (
                <label
                  className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm font-semibold"
                  key={day}
                >
                  <input
                    type="checkbox"
                    checked={(form.workingDays || []).includes(day)}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        workingDays: event.target.checked
                          ? [...(form.workingDays || []), day]
                          : (form.workingDays || []).filter(
                              (value: string) => value !== day,
                            ),
                      })
                    }
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  {t(key)}
                </label>
              ))}
            </div>
          </Card>
          <Card className="order-3 p-6">
            <h2 className="font-display text-lg font-semibold">
              {t("weeklyHolidayRulesTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("weeklyHolidayRulesDetail")}
            </p>
            <div className="mt-5 space-y-3">
              {(form.weeklyMultipliers || []).map(
                (item: any, index: number) => (
                  <div
                    key={`${item.weekday}-${index}`}
                    className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <select
                      value={item.weekday}
                      onChange={(event) => {
                        const next = [...form.weeklyMultipliers];
                        next[index] = { ...item, weekday: event.target.value };
                        setForm({ ...form, weeklyMultipliers: next });
                      }}
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    >
                      {scheduleDayOptions.map(([value, label]) => (
                        <option key={value} value={value}>
                          {t(label)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={item.multiplier}
                      onChange={(event) => {
                        const next = [...form.weeklyMultipliers];
                        next[index] = {
                          ...item,
                          multiplier: Number(event.target.value),
                        };
                        setForm({ ...form, weeklyMultipliers: next });
                      }}
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    >
                      <option value={1}>1×</option>
                      <option value={1.5}>1.5×</option>
                      <option value={2}>2×</option>
                      <option value={3}>3×</option>
                    </select>
                    <Button
                      type="button"
                      variant="quiet"
                      onClick={() =>
                        setForm({
                          ...form,
                          weeklyMultipliers: form.weeklyMultipliers.filter(
                            (_: any, i: number) => i !== index,
                          ),
                        })
                      }
                    >
                      {t("remove")}
                    </Button>
                  </div>
                ),
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setForm({
                    ...form,
                    weeklyMultipliers: [
                      ...(form.weeklyMultipliers || []),
                      { weekday: "Fri", multiplier: 1.5, enabled: true },
                    ],
                  })
                }
              >
                <Plus size={15} /> {t("addWeeklyMultiplier")}
              </Button>
            </div>
            <div className="mt-6 space-y-3 border-t border-border pt-5">
              {(form.holidayPeriods || []).map((item: any, index: number) => (
                <div
                  key={`${item.name}-${index}`}
                  className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
                >
                  <Field
                    label={t("holidayPeriodName")}
                    value={item.name}
                    onChange={(value) => {
                      const next = [...(form.holidayPeriods || [])];
                      next[index] = { ...item, name: value };
                      setForm({ ...form, holidayPeriods: next });
                    }}
                  />
                  <Field
                    label={t("holidayPeriodFrom")}
                    type="date"
                    value={item.from}
                    onChange={(value) => {
                      const next = [...(form.holidayPeriods || [])];
                      next[index] = { ...item, from: value };
                      setForm({ ...form, holidayPeriods: next });
                    }}
                  />
                  <Field
                    label={t("holidayPeriodTo")}
                    type="date"
                    value={item.to}
                    onChange={(value) => {
                      const next = [...(form.holidayPeriods || [])];
                      next[index] = { ...item, to: value };
                      setForm({ ...form, holidayPeriods: next });
                    }}
                  />
                  <label className="block text-sm font-semibold">
                    {t("holidayPeriodMultiplier")}
                    <select
                      value={item.multiplier}
                      onChange={(event) => {
                        const next = [...(form.holidayPeriods || [])];
                        next[index] = {
                          ...item,
                          multiplier: Number(event.target.value),
                        };
                        setForm({ ...form, holidayPeriods: next });
                      }}
                      className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                    >
                      <option value={1}>1x</option>
                      <option value={2}>2x</option>
                      <option value={3}>3x</option>
                    </select>
                  </label>
                  <Button
                    type="button"
                    variant="quiet"
                    onClick={() =>
                      setForm({
                        ...form,
                        holidayPeriods: (form.holidayPeriods || []).filter(
                          (_: any, i: number) => i !== index,
                        ),
                      })
                    }
                  >
                    {t("remove")}
                  </Button>
                </div>
              ))}
              {!(form.holidayPeriods || []).length && (
                <p className="text-sm text-muted-foreground">
                  {t("noHolidayMultipliers")}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setForm({
                    ...form,
                    holidayPeriods: [
                      ...(form.holidayPeriods || []),
                      {
                        name: "",
                        from: "",
                        to: "",
                        multiplier: 2,
                        enabled: true,
                      },
                    ],
                  })
                }
              >
                <Plus size={15} /> {t("addHolidayMultiplier")}
              </Button>
            </div>
          </Card>
          <Card className="order-3 p-6">
            <h2 className="font-display text-lg font-semibold">
              {t("attendancePenaltiesTitle")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("attendancePenaltiesDetail")}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                [
                  "latePenaltyMultiplier",
                  t("lateArrivalMultiplier"),
                ],
                [
                  "earlyDeparturePenaltyMultiplier",
                  t("earlyDepartureMultiplier"),
                ],
                [
                  "absencePenaltyMultiplier",
                  t("absenceMultiplier"),
                ],
                [
                  "permissionCoveredMinutesMultiplier",
                  t("permissionCoveredMinutes"),
                ],
                [
                  "fullDayPermissionMultiplier",
                  t("fullDayPermission"),
                ],
              ].map(([key, label]) => (
                <label key={key} className="block text-sm font-semibold">
                  {label}
                  <select
                    value={form[key]}
                    onChange={(event) =>
                      setForm({ ...form, [key]: Number(event.target.value) })
                    }
                    className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                  >
                    {(key === "permissionCoveredMinutesMultiplier" ||
                      key === "fullDayPermissionMultiplier") && (
                      <option value={0}>0x</option>
                    )}
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                    <option value={3}>3x</option>
                  </select>
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                [
                  "permissionCoversLate",
                  t("permissionCoversLate"),
                ],
                [
                  "permissionCoversEarly",
                  t("permissionCoversEarly"),
                ],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(form[key])}
                    onChange={(event) =>
                      setForm({ ...form, [key]: event.target.checked })
                    }
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  {label}
                </label>
              ))}
            </div>
          </Card>
          <Card className="order-5 p-6">
            <h2 className="font-display text-lg font-semibold">
              {t("locationVerification")}
            </h2>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-semibold">
                {t("gpsPolicy")}
                <select
                  value={form.gpsPolicy}
                  onChange={(e) =>
                    setForm({ ...form, gpsPolicy: e.target.value })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                >
                  <option value="disabled">{t("disabled")}</option>
                  <option value="optional">{t("optional")}</option>
                  <option value="required">{t("required")}</option>
                </select>
              </label>
              <Field
                label={t("locationRadius")}
                type="number"
                value={form.locationRadiusMeters}
                onChange={(v) => setForm({ ...form, locationRadiusMeters: v })}
              />
            </div>
          </Card>
          <Card className="order-6 bg-muted/50 p-5">
            <div className="flex gap-3">
              <CircleHelp size={17} className="mt-0.5 text-primary" />
              <div>
                <h3 className="text-sm font-semibold">{t("explainability")}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t("attendanceExceptionsNote")}
                </p>
              </div>
            </div>
          </Card>
          <label className="order-7 block text-sm font-semibold">
            {locale === "ar" ? "سبب التغيير (مطلوب للسجل)" : "Change reason (required for history)"}
            <textarea
              value={form.reason || ""}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
              required
              className="mt-1 min-h-20 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal"
            />
          </label>
        </div>
      </div>
      <Card className="order-4 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold">
            {t("annualLeaveSettings")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("annualLeaveSettingsDetail")}
          </p>
        </div>
        <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
          <label className="flex items-start gap-3 rounded-xl border border-amber-300/50 bg-amber-50/60 p-4 text-sm font-semibold text-amber-950">
            <input
              type="checkbox"
              checked={Boolean(form.absenceDeductsAnnualLeave)}
              onChange={(event) =>
                setForm({
                  ...form,
                  absenceDeductsAnnualLeave: event.target.checked,
                })
              }
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span>
              {t("deductAnnualLeaveForUnapproved")}
              <span className="mt-1 block text-xs font-normal">
                {t("absenceDeductionDetail")}
              </span>
            </span>
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              {t("absenceDeductionWhen")}
              <select
                value={form.absenceLeaveDeductionTrigger}
                onChange={(event) =>
                  setForm({
                    ...form,
                    absenceLeaveDeductionTrigger: event.target.value,
                  })
                }
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
              >
                <option value="unexcused_absence">
                  {t("unapprovedAbsencesOnly")}
                </option>
                <option value="any_absence">{t("anyAbsenceMissing")}</option>
              </select>
            </label>
            <Field
              label={t("leaveDaysPerAbsence")}
              type="number"
              min={0}
              required
              value={form.absenceLeaveDeductionDays}
              onChange={(value) =>
                setForm({ ...form, absenceLeaveDeductionDays: value })
              }
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field
              label={t("annualEntitlementDays")}
              type="number"
              min={0}
              value={form.annualLeaveEntitlement}
              onChange={(value) =>
                setForm({ ...form, annualLeaveEntitlement: value })
              }
            />
            <label className="block text-sm font-semibold">
              {t("leaveYearStartsIn")}
              <select
                value={form.annualLeavePeriodStartMonth}
                onChange={(event) =>
                  setForm({
                    ...form,
                    annualLeavePeriodStartMonth: Number(event.target.value),
                  })
                }
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
              >
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ),
                )}
              </select>
            </label>
            <Field
              label={t("monthlyMaximumDeduction")}
              type="number"
              min={0}
              value={form.annualLeaveMonthlyDeductionLimit ?? 1}
              onChange={(value) =>
                setForm({
                  ...form,
                  annualLeaveMonthlyDeductionLimit: value,
                })
              }
            />
          </div>
          <div className="mt-4">
            <span className="text-sm font-semibold">
              {t("balanceDeductionMonths")}
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {Array.from({ length: 12 }, (_, index) => index + 1).map(
                (month) => {
                  const selectedMonths = form.annualLeaveAllowedMonths || [];
                  return (
                    <label
                      key={month}
                      className="flex items-center gap-2 rounded-lg border border-border p-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMonths.includes(month)}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            annualLeaveAllowedMonths: event.target.checked
                              ? [...selectedMonths, month].sort(
                                  (a: number, b: number) => a - b,
                                )
                              : selectedMonths.filter(
                                  (item: number) => item !== month,
                                ),
                          })
                        }
                        className="h-4 w-4 accent-primary"
                      />
                      {month}
                    </label>
                  );
                },
              )}
            </div>
          </div>
        </div>
        <h3 className="mt-6 font-semibold">{t("annualLeaveBalances")}</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {balances.isLoading ? (
            <Skeleton className="h-24" />
          ) : balances.data?.length ? (
            balances.data
              .filter((balance: any) =>
                ["annual", "annual leave"].includes(
                  String(balance.type).trim().toLowerCase(),
                ),
              )
              .map((balance: any) => (
                <div key={balance.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="font-semibold">{balance.employee?.name}</span>
                    <span className="font-mono text-xs">
                      {balance.remaining} {locale === "ar" ? "يوم متبقٍ" : "days left"}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span>{locale === "ar" ? "المخصص" : "Allocated"}: {balance.allocated}</span>
                    <span>{locale === "ar" ? "المستخدم" : "Used"}: {balance.used}</span>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-sm text-muted-foreground">
              {locale === "ar" ? "لا توجد أرصدة بعد." : "No balances yet."}
            </p>
          )}
        </div>
        <Button
          type="button"
          onClick={save}
          disabled={update.isPending}
          className="mt-6 w-full"
        >
          {update.isPending ? t("savingPolicy") : t("saveAttendancePolicy")}
        </Button>
      </Card>
      {canViewRuleHistory && (
        <Card className="order-9 p-6">
        <div>
          <h2 className="font-display text-lg font-semibold">
            {t("attendanceRulesChangeHistory")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("attendanceRulesChangeHistoryDetail")}
          </p>
        </div>
        <div className="mt-5 grid gap-3">
          {(changes.data || []).map((change: any) => (
            <div
              key={change.id}
              className="grid gap-3 rounded-xl border border-border p-4 text-sm sm:grid-cols-2 lg:grid-cols-5"
            >
              <div>
                <span className="block text-xs text-muted-foreground">
                  {t("attendanceRulesHistoryField")}
                </span>
                <strong>
                  {localizedAttendanceRuleField(change.field, t)}
                </strong>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">
                  {t("attendanceRulesHistoryPreviousValue")}
                </span>
                <span>
                  {localizedAttendanceRuleValue(
                    change.field,
                    change.oldValue,
                    locale,
                    t,
                  )}
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">
                  {t("attendanceRulesHistoryNewValue")}
                </span>
                <span>
                  {localizedAttendanceRuleValue(
                    change.field,
                    change.newValue,
                    locale,
                    t,
                  )}
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">
                  {t("attendanceRulesHistoryEffectiveFrom")}
                </span>
                <span>
                  {localizedAttendanceRuleDate(
                    change.appliesFromMonth,
                    locale,
                  )}
                </span>
              </div>
              <div>
                <span className="block text-xs text-muted-foreground">
                  {t("attendanceRulesHistoryActorReason")}
                </span>
                <span>
                  {change.changedBy?.name} · {change.reason}
                </span>
              </div>
            </div>
          ))}
          {!changes.data?.length && (
            <p className="text-sm text-muted-foreground">
              {t("noAttendanceRulesHistory")}
            </p>
          )}
        </div>
        </Card>
      )}
    </div>
  );
}

type ReportKind =
  "employees" | "attendance" | "leave" | "permission" | "overtime" | "payroll";
type ReportColumn = { key: string; label: string };

function reportKindLabel(kind: ReportKind, t: (key: AppCopyKey) => string) {
  const keys: Record<ReportKind, AppCopyKey> = {
    employees: "reportEmployees",
    attendance: "reportAttendance",
    leave: "reportLeave",
    permission: "reportPermission",
    overtime: "reportOvertime",
    payroll: "reportPayroll",
  };
  return t(keys[kind]);
}

function reportColumns(
  kind: ReportKind,
  t: (key: AppCopyKey) => string,
): ReportColumn[] {
  const employee = { key: "employee", label: t("employee") };
  if (kind === "employees")
    return [
      employee,
      { key: "department", label: t("department") },
      { key: "branch", label: t("branch") },
      { key: "joinedOn", label: t("joinedOn") },
      { key: "salary", label: t("salary") },
      { key: "status", label: t("status") },
    ];
  if (kind === "attendance")
    return [
      { key: "date", label: t("date") },
      employee,
      { key: "checkIn", label: t("checkIn") },
      { key: "checkOut", label: t("checkOut") },
      { key: "workedHours", label: t("workedHours") },
      { key: "lateMinutes", label: t("lateMinutes") },
      { key: "earlyCheckoutMinutes", label: t("earlyCheckoutMinutes") },
      { key: "overtimeHours", label: t("overtimeHours") },
      { key: "attendanceStatus", label: t("attendanceStatus") },
      { key: "locationStatus", label: t("locationState") },
    ];
  if (kind === "leave")
    return [
      employee,
      { key: "type", label: t("leaveType") },
      { key: "from", label: t("dateFrom") },
      { key: "to", label: t("dateTo") },
      { key: "days", label: t("days") },
      { key: "status", label: t("status") },
      { key: "reason", label: t("reason") },
    ];
  if (kind === "permission")
    return [
      employee,
      { key: "type", label: t("permissionType") },
      { key: "date", label: t("date") },
      { key: "startTime", label: t("start") },
      { key: "endTime", label: t("end") },
      { key: "durationHours", label: t("hours") },
      { key: "status", label: t("status") },
      { key: "reason", label: t("reason") },
    ];
  if (kind === "overtime")
    return [
      { key: "date", label: t("date") },
      employee,
      { key: "workedHours", label: t("workedHours") },
      { key: "lateMinutes", label: t("lateMinutes") },
      { key: "earlyCheckoutMinutes", label: t("earlyCheckoutMinutes") },
      { key: "overtimeHours", label: t("overtimeHours") },
      { key: "attendanceStatus", label: t("attendanceStatus") },
    ];
  return [
    employee,
    { key: "periodLabel", label: t("periodLabel") },
    { key: "payrollStatus", label: t("payrollStatus") },
    { key: "gross", label: t("gross") },
    { key: "additions", label: t("additions") },
    { key: "deductions", label: t("deductions") },
    { key: "net", label: t("net") },
    { key: "overtimeHours", label: t("overtimeHours") },
    { key: "overtimeAmount", label: t("overtimeAmount") },
  ];
}

function reportCell(
  row: any,
  key: string,
  kind: ReportKind,
  currency: string,
  t: (key: AppCopyKey) => string,
) {
  if (key === "employee") return row.employee?.name || "—";
  if (["date", "from", "to", "joinedOn"].includes(key)) return date(row[key]);
  if (key === "checkIn" || key === "checkOut") return time(row[key]);
  if (key === "startTime" || key === "endTime") return row[key] || "—";
  if (
    [
      "salary",
      "gross",
      "additions",
      "deductions",
      "net",
      "overtimeAmount",
    ].includes(key)
  )
    return money(Number(row[key] ?? 0), currency);
  if (
    key === "workedHours" ||
    key === "overtimeHours" ||
    key === "durationHours"
  )
    return `${Number(row[key] ?? 0).toFixed(2)}h`;
  if (key === "status" || key === "attendanceStatus" || key === "payrollStatus")
    return statusLabel(String(row[key] ?? "—"), t);
  if (key === "type") return requestTypeLabel(String(row[key] ?? "—"), t);
  if (key === "locationStatus")
    return row[key] ? statusLabel(String(row[key]), t) : "—";
  return row[key] ?? "—";
}

function reportRawValue(row: any, key: string) {
  if (key === "employee") return row.employee?.name || "";
  if (key === "checkIn" || key === "checkOut") return row[key] || "";
  return row[key] ?? "";
}

function downloadReport(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function reportTotals(
  data: any,
  kind: ReportKind,
  currency: string,
  t: (key: AppCopyKey) => string,
): Array<[string, string]> {
  const totals = data.totals;
  const result: Array<[string, string]> = [
    [t("records"), String(totals.records)],
  ];
  if (kind === "attendance" || kind === "overtime") {
    result.push(
      [t("workedHours"), `${Number(totals.workedHours ?? 0).toFixed(2)}h`],
      [t("overtimeHours"), `${Number(totals.overtimeHours ?? 0).toFixed(2)}h`],
    );
  }
  if (kind === "attendance") {
    result.push(
      [t("presentDays"), String(totals.presentDays ?? 0)],
      [t("lateDays"), String(totals.lateDays ?? 0)],
      [t("absentDays"), String(totals.absentDays ?? 0)],
    );
  }
  if (kind === "leave")
    result.push([t("leaveDays"), String(totals.leaveDays ?? 0)]);
  if (kind === "payroll") {
    result.push(
      [t("gross"), money(Number(totals.gross ?? 0), currency)],
      [t("additions"), money(Number(totals.additions ?? 0), currency)],
      [t("deductions"), money(Number(totals.deductions ?? 0), currency)],
      [t("net"), money(Number(totals.net ?? 0), currency)],
      [t("overtimeHours"), `${Number(totals.overtimeHours ?? 0).toFixed(2)}h`],
      [
        t("overtimeAmount"),
        money(Number(totals.overtimeAmount ?? 0), currency),
      ],
    );
  }
  return result;
}

function escapeXml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concatBytes(parts: Uint8Array[]) {
  const result = new Uint8Array(
    parts.reduce((total, part) => total + part.length, 0),
  );
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function createStoredZip(files: Array<[string, string]>) {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;
  for (const [name, content] of files) {
    const nameBytes = encoder.encode(name);
    const contentBytes = encoder.encode(content);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(8, 0, true);
    localView.setUint32(14, crc32(contentBytes), true);
    localView.setUint32(18, contentBytes.length, true);
    localView.setUint32(22, contentBytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localHeader.set(nameBytes, 30);
    localParts.push(localHeader, contentBytes);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint32(16, crc32(contentBytes), true);
    centralView.setUint32(20, contentBytes.length, true);
    centralView.setUint32(24, contentBytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);
    offset += localHeader.length + contentBytes.length;
  }
  const centralDirectory = concatBytes(centralParts);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralDirectory.length, true);
  endView.setUint32(16, offset, true);
  return concatBytes([...localParts, centralDirectory, end]);
}

function downloadXlsx(
  filename: string,
  title: string,
  company: string,
  from: string,
  to: string,
  columns: ReportColumn[],
  rows: any[],
  totals: Array<[string, string]>,
  kind: ReportKind,
  currency: string,
  t: (key: AppCopyKey) => string,
) {
  const encoder = new TextEncoder();
  const columnName = (index: number) => {
    let value = "";
    let current = index;
    do {
      value = String.fromCharCode(65 + (current % 26)) + value;
      current = Math.floor(current / 26) - 1;
    } while (current >= 0);
    return value;
  };
  const cell = (rowNumber: number, columnNumber: number, value: unknown) => {
    const reference = `${columnName(columnNumber)}${rowNumber}`;
    return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
  };
  const sheetRows: string[] = [];
  sheetRows.push(`<row r="1">${cell(1, 0, title)}</row>`);
  sheetRows.push(
    `<row r="2">${cell(2, 0, `${company} · ${t("fromTo")}: ${date(from)} – ${date(to)}`)}</row>`,
  );
  sheetRows.push(
    `<row r="4">${columns.map((column, index) => cell(4, index, column.label)).join("")}</row>`,
  );
  rows.forEach((row, rowIndex) => {
    const rowNumber = rowIndex + 5;
    sheetRows.push(
      `<row r="${rowNumber}">${columns.map((column, columnIndex) => cell(rowNumber, columnIndex, reportCell(row, column.key, kind, currency, t))).join("")}</row>`,
    );
  });
  const totalsStart = rows.length + 6;
  sheetRows.push(
    `<row r="${totalsStart}">${cell(totalsStart, 0, t("records"))}${cell(totalsStart, 1, String(rows.length))}</row>`,
  );
  totals.slice(1).forEach(([label, value], index) => {
    const rowNumber = totalsStart + index + 1;
    sheetRows.push(
      `<row r="${rowNumber}">${cell(rowNumber, 0, label)}${cell(rowNumber, 1, value)}</row>`,
    );
  });
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows.join("")}</sheetData></worksheet>`;
  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(title.slice(0, 31))}" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const files: Array<[string, string]> = [
    [
      "[Content_Types].xml",
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>',
    ],
    [
      "_rels/.rels",
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>',
    ],
    ["xl/workbook.xml", workbook],
    [
      "xl/_rels/workbook.xml.rels",
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    ],
    ["xl/worksheets/sheet1.xml", sheet],
    [
      "docProps/core.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${escapeXml(title)}</dc:title><dc:subject>VAR HR ${escapeXml(kind)} report</dc:subject></cp:coreProperties>`,
    ],
  ];
  const zip = createStoredZip(files);
  const blob = new Blob([zip.buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Reports() {
  const { t } = useI18n();
  const workspace = useGetWorkspace();
  const departments = useListDepartments();
  const employees = useListEmployees({ status: "active" });
  const periods = useListPayrollPeriods({
    query: { queryKey: getListPayrollPeriodsQueryKey(), enabled: true },
  });
  const [kind, setKind] = useState<ReportKind>("attendance");
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    employeeId: "",
    departmentId: "",
    status: "",
    attendanceStatus: "",
    leaveStatus: "",
    permissionStatus: "",
    payrollStatus: "",
    leaveType: "",
    permissionType: "",
    periodId: "",
  });
  const params = useMemo(
    () =>
      ({
        type: kind,
        from: filters.from || undefined,
        to: filters.to || undefined,
        employeeId: filters.employeeId || undefined,
        departmentId: filters.departmentId || undefined,
        status: kind === "employees" ? filters.status || undefined : undefined,
        attendanceStatus:
          kind === "attendance" || kind === "overtime"
            ? filters.attendanceStatus || undefined
            : undefined,
        leaveStatus:
          kind === "leave" ? filters.leaveStatus || undefined : undefined,
        permissionStatus:
          kind === "permission"
            ? filters.permissionStatus || undefined
            : undefined,
        payrollStatus:
          kind === "payroll" ? filters.payrollStatus || undefined : undefined,
        leaveType:
          kind === "leave" ? filters.leaveType || undefined : undefined,
        permissionType:
          kind === "permission"
            ? filters.permissionType || undefined
            : undefined,
        periodId:
          kind === "payroll" ? filters.periodId || undefined : undefined,
      }) as any,
    [kind, filters],
  );
  const q = useGetReport(params);
  const currency = workspace.data?.company?.currency ?? "EGP";
  const columns = reportColumns(kind, t);
  const data = q.data;
  const setFilter = (key: keyof typeof filters, value: string) =>
    setFilters((current) => ({ ...current, [key]: value }));
  const statusOptions =
    kind === "employees"
      ? ["active", "inactive"]
      : kind === "attendance" || kind === "overtime"
        ? ["present", "late", "absent", "on_leave", "incomplete", "holiday"]
        : kind === "payroll"
          ? ["draft", "calculated", "finalized", "approved", "locked"]
          : ["pending", "approved", "rejected", "cancelled"];
  const statusFilterKey:
    | "status"
    | "attendanceStatus"
    | "leaveStatus"
    | "permissionStatus"
    | "payrollStatus" =
    kind === "employees"
      ? "status"
      : kind === "attendance" || kind === "overtime"
        ? "attendanceStatus"
        : kind === "leave"
          ? "leaveStatus"
          : kind === "permission"
            ? "permissionStatus"
            : "payrollStatus";
  const selectedStatus = filters[statusFilterKey];
  const reportTitle = reportKindLabel(kind, t);
  const filterSummary = [
    `${t("fromTo")}: ${date(data?.from || filters.from)} – ${date(data?.to || filters.to)}`,
    filters.employeeId
      ? `${t("employee")}: ${employees.data?.find((item: any) => item.id === filters.employeeId)?.firstName ?? ""} ${employees.data?.find((item: any) => item.id === filters.employeeId)?.lastName ?? ""}`
      : t("allEmployees"),
    filters.departmentId
      ? `${t("department")}: ${departments.data?.find((item: any) => item.id === filters.departmentId)?.name ?? ""}`
      : t("allDepartments"),
    selectedStatus
      ? `${t("status")}: ${statusLabel(selectedStatus, t)}`
      : t("allStatuses"),
    kind === "leave" && filters.leaveType
      ? `${t("leaveType")}: ${filters.leaveType}`
      : "",
    kind === "permission" && filters.permissionType
      ? `${t("permissionType")}: ${filters.permissionType}`
      : "",
    kind === "payroll" && (data?.periodLabel || filters.periodId)
      ? `${t("period")}: ${data?.periodLabel || periods.data?.find((item: any) => item.id === filters.periodId)?.label || ""}`
      : "",
  ].filter(Boolean);
  function exportCsv() {
    if (!data) return;
    const escape = (value: unknown) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;
    const lines = [columns.map((column) => escape(column.label)).join(",")];
    for (const row of data.rows)
      lines.push(
        columns
          .map((column) =>
            escape(reportCell(row, column.key, kind, currency, t)),
          )
          .join(","),
      );
    downloadReport(
      `var-hr-${kind}.csv`,
      `\uFEFF${lines.join("\n")}`,
      "text/csv;charset=utf-8",
    );
  }
  function exportExcel() {
    if (!data) return;
    downloadXlsx(
      `var-hr-${kind}.xlsx`,
      reportTitle,
      data.company.name,
      data.from,
      data.to,
      columns,
      data.rows,
      reportTotals(data, kind, currency, t),
      kind,
      currency,
      t,
    );
  }
  function printReport() {
    if (!data) return;
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) return;
    const header = columns.map((column) => `<th>${column.label}</th>`).join("");
    const rows = data.rows
      .map(
        (row: any) =>
          `<tr>${columns
            .map(
              (column) =>
                `<td>${String(reportCell(row, column.key, kind, currency, t))
                  .replaceAll("&", "&amp;")
                  .replaceAll("<", "&lt;")}</td>`,
            )
            .join("")}</tr>`,
      )
      .join("");
    const totals = reportTotals(data, kind, currency, t);
    const totalMarkup = totals
      .map(
        ([label, value]) =>
          `<span class="total"><strong>${label}</strong><span>${value}</span></span>`,
      )
      .join("");
    printWindow.document.write(
      `<html dir="${document.documentElement.dir || "ltr"}"><head><title>${reportTitle}</title><style>body{font-family:Arial,sans-serif;color:#152638;padding:28px}h1{margin:0 0 6px}p{color:#607080}.summary{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.chip{background:#edf4f4;border-radius:999px;padding:6px 10px;font-size:12px}.totals{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:18px 0}.total{border:1px solid #d8e0e4;border-radius:8px;padding:8px;font-size:12px}.total strong{display:block;font-size:10px;text-transform:uppercase;color:#607080;margin-bottom:4px}table{border-collapse:collapse;width:100%;font-size:11px}th,td{border:1px solid #d8e0e4;padding:7px;text-align:start}th{background:#edf4f4} @media print{body{padding:0}}</style></head><body><h1>${reportTitle}</h1><p>${t("company")}: ${data.company.name} · ${t("fromTo")}: ${date(data.from)} – ${date(data.to)}</p><div class="summary">${filterSummary.map((item) => `<span class="chip">${item}</span>`).join("")}</div><div class="totals">${totalMarkup}</div><table><thead>${header}</thead><tbody>${rows}</tbody></table><script>window.onload=()=>{window.print();window.close()}</script></body></html>`,
    );
    printWindow.document.close();
  }
  return (
    <div className="animate-in" id="report-print-area">
      <SectionTitle
        eyebrow={t("evidenceAnalysis")}
        title={t("reportsWorkspace")}
        detail={t("reportsWorkspaceDetail")}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => q.refetch()}>
              <RefreshCw size={15} />
              {t("refresh")}
            </Button>
            <Button variant="outline" disabled={!data} onClick={exportCsv}>
              <Download size={15} />
              {t("exportCsv")}
            </Button>
            <Button variant="outline" disabled={!data} onClick={exportExcel}>
              <Download size={15} />
              {t("exportExcel")}
            </Button>
            <Button disabled={!data} onClick={printReport}>
              <Printer size={15} />
              {t("printReport")}
            </Button>
          </div>
        }
      />
      <Card className="mb-6 p-4">
        <div
          className="mb-4 flex flex-wrap gap-2"
          role="tablist"
          aria-label={t("reportType")}
        >
          {(
            [
              "employees",
              "attendance",
              "leave",
              "permission",
              "overtime",
              "payroll",
            ] as ReportKind[]
          ).map((item) => (
            <Button
              key={item}
              variant={kind === item ? "primary" : "outline"}
              onClick={() => {
                setKind(item);
                setFilter("status", "");
                setFilter("attendanceStatus", "");
                setFilter("leaveStatus", "");
                setFilter("permissionStatus", "");
                setFilter("payrollStatus", "");
              }}
              role="tab"
              aria-selected={kind === item}
            >
              {reportKindLabel(item, t)}
            </Button>
          ))}
        </div>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal size={16} className="text-primary" />
          {t("filters")}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label={t("dateFrom")}
            type="date"
            value={filters.from}
            onChange={(value) => setFilter("from", value)}
          />
          <Field
            label={t("dateTo")}
            type="date"
            value={filters.to}
            onChange={(value) => setFilter("to", value)}
          />
          <label className="block text-sm font-semibold">
            {t("employee")}
            <select
              value={filters.employeeId}
              onChange={(event) => setFilter("employeeId", event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
            >
              <option value="">{t("allEmployees")}</option>
              {employees.data?.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.firstName} {item.lastName}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            {t("department")}
            <select
              value={filters.departmentId}
              onChange={(event) =>
                setFilter("departmentId", event.target.value)
              }
              className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
            >
              <option value="">{t("allDepartments")}</option>
              {departments.data?.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            {t("status")}
            <select
              value={selectedStatus}
              onChange={(event) =>
                setFilter(statusFilterKey, event.target.value)
              }
              className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
            >
              <option value="">{t("allStatuses")}</option>
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {statusLabel(item, t)}
                </option>
              ))}
            </select>
          </label>
          {kind === "leave" && (
            <label className="block text-sm font-semibold">
              {t("leaveType")}
              <select
                value={filters.leaveType}
                onChange={(event) => setFilter("leaveType", event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
              >
                <option value="">—</option>
                <option value="Annual leave">{t("annualLeave")}</option>
                <option value="Sick leave">{t("sickLeave")}</option>
              </select>
            </label>
          )}
          {kind === "permission" && (
            <label className="block text-sm font-semibold">
              {t("permissionType")}
              <select
                value={filters.permissionType}
                onChange={(event) =>
                  setFilter("permissionType", event.target.value)
                }
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
              >
                <option value="">—</option>
                <option value="Short absence">{t("shortAbsence")}</option>
                <option value="Late arrival">{t("lateArrival")}</option>
                <option value="Early departure">{t("earlyDeparture")}</option>
                <option value="Remote work">{t("remoteWork")}</option>
                <option value="Personal errand">{t("personalErrand")}</option>
              </select>
            </label>
          )}
          {kind === "payroll" && (
            <label className="block text-sm font-semibold">
              {t("payrollPeriod")}
              <select
                value={filters.periodId}
                onChange={(event) => setFilter("periodId", event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
              >
                <option value="">—</option>
                {periods.data?.map((item: any) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="quiet"
            onClick={() =>
              setFilters({
                from: "",
                to: "",
                employeeId: "",
                departmentId: "",
                status: "",
                attendanceStatus: "",
                leaveStatus: "",
                permissionStatus: "",
                payrollStatus: "",
                leaveType: "",
                permissionType: "",
                periodId: "",
              })
            }
          >
            {t("resetFilters")}
          </Button>
          <Button onClick={() => q.refetch()}>
            <BarChart3 size={15} />
            {t("applyFilters")}
          </Button>
        </div>
      </Card>
      <Card className="mb-6 p-4">
        <div className="text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">
          {t("filterSummary")}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {filterSummary.map((item) => (
            <span
              className="rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground"
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
      </Card>
      {q.isLoading ? (
        <Card className="p-5">
          <div className="space-y-3">
            <Skeleton className="h-8" />
            <Skeleton className="h-48" />
          </div>
        </Card>
      ) : q.isError ? (
        <Card>
          <ErrorState retry={() => q.refetch()} />
        </Card>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [t("records"), data.totals.records],
              [t("workedHours"), `${data.totals.workedHours.toFixed(2)}h`],
              [t("overtimeHours"), `${data.totals.overtimeHours.toFixed(2)}h`],
              [
                kind === "payroll" ? t("net") : t("leaveDays"),
                kind === "payroll"
                  ? money(data.totals.net, currency)
                  : data.totals.leaveDays,
              ],
            ].map(([label, value]) => (
              <Card key={String(label)} className="p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {label}
                </div>
                <div className="mt-2 font-display text-2xl font-semibold">
                  {value}
                </div>
              </Card>
            ))}
          </div>
          <Card className="mt-6 overflow-hidden">
            <div className="border-b border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    {t("reportPreview")} · {reportTitle}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.company.name} · {date(data.from)} – {date(data.to)}
                    {data.periodLabel
                      ? ` · ${periodLabel(data.periodLabel)}`
                      : ""}
                  </p>
                </div>
                <Badge tone="neutral">
                  {data.rows.length} {t("records")}
                </Badge>
              </div>
            </div>
            {data.rows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground rtl:text-right">
                    <tr>
                      {columns.map((column) => (
                        <th
                          className="whitespace-nowrap px-4 py-3 first:ps-5 last:pe-5"
                          key={column.key}
                        >
                          {column.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.rows.map((row: any, index: number) => (
                      <tr
                        key={`${row.employee?.id ?? "row"}-${index}`}
                        className="hover:bg-muted/30"
                      >
                        {columns.map((column) => (
                          <td
                            className="whitespace-nowrap px-4 py-3 first:ps-5 last:pe-5"
                            key={column.key}
                          >
                            {column.key === "employee" ? (
                              <span className="font-semibold">
                                {reportCell(row, column.key, kind, currency, t)}
                              </span>
                            ) : (
                              reportCell(row, column.key, kind, currency, t)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                title={t("noReportRows")}
                detail={t("noReportRowsDetail")}
              />
            )}
          </Card>
        </>
      ) : (
        <Card>
          <Empty
            title={t("reportPreview")}
            detail={t("chooseReportingWindow")}
          />
        </Card>
      )}
    </div>
  );
}

function EmployeePayrollStatement({
  query,
}: {
  query: {
    isLoading: boolean;
    isError: boolean;
    data?: any;
    refetch: () => unknown;
  };
}) {
  const { locale } = useI18n();
  const c = employeeAccountCopy(locale);
  const workspace = useGetWorkspace();
  const currency = workspace.data?.company?.currency ?? "EGP";
  const item = query.data?.items?.[0];
  return (
    <div className="animate-in">
      <SectionTitle eyebrow={c.payroll} title={c.payroll} detail={c.payrollDetail} />
      {query.isLoading ? (
        <Card className="p-6"><Skeleton className="h-48" /></Card>
      ) : query.isError ? (
        <Card><ErrorState retry={() => query.refetch()} /></Card>
      ) : query.data && item ? (
        <Card className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.period}</p>
              <h2 className="mt-1 font-display text-2xl font-semibold">
                {query.data.period?.label}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {c.calculatedAt}: {date(query.data.calculatedAt)}
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Info label={c.gross} value={money(item.grossSalary ?? item.gross ?? 0, currency)} />
            <Info label={c.additions} value={money(item.additions ?? item.overtime ?? 0, currency)} />
            <Info label={c.deductions} value={money(item.deductions ?? 0, currency)} />
            <Info label={c.net} value={money(item.netSalary ?? item.net ?? 0, currency)} />
            <Info label={c.period} value={`${query.data.period?.from} – ${query.data.period?.to}`} />
          </div>
          {query.data.explanation && (
            <p className="mt-5 rounded-lg bg-muted/60 p-3 text-sm leading-6 text-muted-foreground">
              {query.data.explanation}
            </p>
          )}
        </Card>
      ) : (
        <Card><Empty title={c.noPayroll} detail={c.payrollDetail} /></Card>
      )}
    </div>
  );
}

function Payroll() {
  const { t } = useI18n();
  const auth = useAuth();
  const isEmployee = auth.account.accountType === "employee";
  const qc = useQueryClient();
  const q = useListPayrollPeriods({
    query: { queryKey: getListPayrollPeriodsQueryKey(), enabled: !isEmployee },
  });
  const myPayroll = useGetMyPayroll(undefined, {
    query: { queryKey: getGetMyPayrollQueryKey(), enabled: isEmployee },
  });
  const employees = useListEmployees(
    { status: "active" },
    {
      query: {
        queryKey: getListEmployeesQueryKey({ status: "active" }),
        enabled: !isEmployee,
      },
    },
  );
  const createPeriod = useCreatePayrollPeriod();
  const deletePeriod = useDeletePayrollPeriod();
  const calc = useCalculatePayroll();
  const finalize = useFinalizePayroll();
  const createAdjustment = useCreatePayrollAdjustment();
  const deleteAdjustment = useDeletePayrollAdjustment();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [showPeriod, setShowPeriod] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [periodForm, setPeriodForm] = useState({ label: "", from: "", to: "" });
  const [adjustmentForm, setAdjustmentForm] = useState({
    employeeId: "",
    type: "addition",
    category: "fixed",
    amount: "",
    reason: "",
  });
  const selectedPeriod = q.data?.find(
    (period: any) => period.id === selectedPeriodId,
  );
  const calculation = useGetPayrollCalculation(selectedPeriodId || "", {
    query: {
      enabled: Boolean(selectedPeriodId),
      queryKey: getGetPayrollCalculationQueryKey(selectedPeriodId || ""),
    },
  });
  const adjustments = useListPayrollAdjustments(
    selectedPeriodId ? { periodId: selectedPeriodId } : undefined,
    {
      query: {
        enabled: Boolean(selectedPeriodId),
        queryKey: getListPayrollAdjustmentsQueryKey(
          selectedPeriodId ? { periodId: selectedPeriodId } : undefined,
        ),
      },
    },
  );
  function calculate(id: string) {
    calc.mutate(
      { periodId: id },
      {
        onSuccess: () => {
          toast.success(t("payrollReady"));
          setSelectedPeriodId(id);
          setSelectedEmployeeId(null);
          qc.invalidateQueries({ queryKey: getListPayrollPeriodsQueryKey() });
          qc.invalidateQueries({
            queryKey: getGetPayrollCalculationQueryKey(id),
          });
          qc.invalidateQueries({
            queryKey: getListPayrollAdjustmentsQueryKey({ periodId: id }),
          });
        },
        onError: () => toast.error(t("calculationFailed")),
      },
    );
  }
  function selectPeriod(id: string) {
    setSelectedPeriodId(id);
    setSelectedEmployeeId(null);
  }
  function removePeriod(id: string) {
    if (!window.confirm(t("deletePeriodConfirmation"))) return;
    deletePeriod.mutate(
      { periodId: id },
      {
        onSuccess: () => {
          toast.success(t("deleteSuccessful"));
          if (selectedPeriodId === id) {
            setSelectedPeriodId(null);
            setSelectedEmployeeId(null);
          }
          qc.invalidateQueries({ queryKey: getListPayrollPeriodsQueryKey() });
          qc.removeQueries({
            queryKey: getGetPayrollCalculationQueryKey(id),
          });
          qc.removeQueries({
            queryKey: getListPayrollAdjustmentsQueryKey({ periodId: id }),
          });
        },
        onError: (error: unknown) =>
          toast.error(apiErrorMessage(error, t("deleteFailed"))),
      },
    );
  }
  function submitPeriod(event: FormEvent) {
    event.preventDefault();
    if (
      !periodForm.label.trim() ||
      !periodForm.from ||
      !periodForm.to ||
      periodForm.from > periodForm.to
    ) {
      toast.error(t("periodDateRangeInvalid"));
      return;
    }
    createPeriod.mutate(
      {
        data: {
          label: periodForm.label.trim(),
          from: periodForm.from,
          to: periodForm.to,
        },
      },
      {
        onSuccess: (period: any) => {
          toast.success(t("periodCreated"));
          setShowPeriod(false);
          setPeriodForm({ label: "", from: "", to: "" });
          selectPeriod(period.id);
          qc.invalidateQueries({ queryKey: getListPayrollPeriodsQueryKey() });
        },
        onError: () => toast.error(t("periodCreateFailed")),
      },
    );
  }
  function finalizePeriod() {
    if (!selectedPeriodId) return;
    finalize.mutate(
      { periodId: selectedPeriodId },
      {
        onSuccess: () => {
          toast.success(t("payrollFinalized"));
          qc.invalidateQueries({ queryKey: getListPayrollPeriodsQueryKey() });
          qc.invalidateQueries({
            queryKey: getGetPayrollCalculationQueryKey(selectedPeriodId),
          });
        },
        onError: () => toast.error(t("finalizeFailed")),
      },
    );
  }
  function submitAdjustment(event: FormEvent) {
    event.preventDefault();
    if (
      !selectedPeriodId ||
      !adjustmentForm.employeeId ||
      !adjustmentForm.amount ||
      Number(adjustmentForm.amount) < 0 ||
      !adjustmentForm.reason.trim()
    )
      return;
    createAdjustment.mutate(
      {
        data: {
          periodId: selectedPeriodId,
          employeeId: adjustmentForm.employeeId,
          type: adjustmentForm.type as "addition" | "deduction",
          category: adjustmentForm.category as "fixed" | "variable",
          amount: Number(adjustmentForm.amount),
          reason: adjustmentForm.reason.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success(t("adjustmentCreated"));
          setShowAdjustment(false);
          setAdjustmentForm({
            employeeId: "",
            type: "addition",
            category: "fixed",
            amount: "",
            reason: "",
          });
          qc.invalidateQueries({
            queryKey: getListPayrollAdjustmentsQueryKey({
              periodId: selectedPeriodId,
            }),
          });
           calculate(selectedPeriodId);
        },
        onError: () => toast.error(t("adjustmentCreateFailed")),
      },
    );
  }
  function removeAdjustment(id: string) {
    deleteAdjustment.mutate(
      { adjustmentId: id },
      {
        onSuccess: () => {
          toast.success(t("adjustmentDeleted"));
          qc.invalidateQueries({
            queryKey: getListPayrollAdjustmentsQueryKey({
              periodId: selectedPeriodId || undefined,
            }),
          });
          if (selectedPeriodId) calculate(selectedPeriodId);
        },
        onError: () => toast.error(t("adjustmentDeleteFailed")),
      },
    );
  }
  const selectedEmployee = calculation.data?.items.find(
    (item: any) => item.employee.id === selectedEmployeeId,
  );
  if (isEmployee) {
    return <EmployeePayrollStatement query={myPayroll} />;
  }
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("generalPayroll")}
        title={t("payrollTitle")}
        detail={t("payrollDetail")}
        action={
          <Button onClick={() => setShowPeriod(true)}>
            <Plus size={16} />
            {t("createPeriod")}
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <Card>
          <div className="border-b border-border p-5">
            <h2 className="font-display text-lg font-semibold">
              {t("periods")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("selectPeriod")}</p>
          </div>
          {q.isLoading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : q.isError ? (
            <ErrorState retry={() => q.refetch()} />
          ) : q.data?.length ? (
            <div className="divide-y divide-border">
              {q.data.map((p: any) => (
                <div
                  key={p.id}
                  className={cn(
                    "p-5 transition-colors hover:bg-muted/40",
                    selectedPeriodId === p.id && "bg-primary/5",
                  )}
                >
                  <button
                    aria-label={`${t("selectPeriod")}: ${periodLabel(p.label)}`}
                    className="block w-full text-left"
                    onClick={() => selectPeriod(p.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold">
                          {periodLabel(p.label)}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {date(p.from)} – {date(p.to)} · {p.employeeCount}{" "}
                          {t("employeeCount")}
                        </div>
                      </div>
                      <Status value={p.status} />
                    </div>
                    <div className="mt-3 text-sm font-mono">
                      {money(p.totalNet)}
                    </div>
                  </button>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="px-2 py-1 text-xs"
                      onClick={() => selectPeriod(p.id)}
                    >
                      {t("viewPeriod")}
                    </Button>
                    {p.status !== "finalized" && p.status !== "locked" && (
                      <Button
                        type="button"
                        variant="outline"
                        className="px-2 py-1 text-xs"
                        onClick={() => calculate(p.id)}
                        disabled={calc.isPending}
                      >
                        {calc.isPending
                          ? t("calculating")
                          : p.status === "calculated"
                            ? t("recalculatePayroll")
                            : t("calculate")}
                      </Button>
                    )}
                    {p.status !== "finalized" && p.status !== "locked" && (
                      <Button
                        type="button"
                        variant="danger"
                        className="px-2 py-1 text-xs"
                        onClick={() => removePeriod(p.id)}
                        disabled={deletePeriod.isPending}
                      >
                        {t("deletePeriod")}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty title={t("noPayrollPeriods")} detail={t("periodsFromApi")} />
          )}
        </Card>
        <Card>
          {!selectedPeriodId ? (
            <Empty
              title={t("selectPeriod")}
              detail={t("selectPeriodToCalculate")}
            />
          ) : calculation.isLoading ? (
            <div className="space-y-4 p-5">
              <Skeleton className="h-16" />
              <Skeleton className="h-32" />
              <Skeleton className="h-48" />
            </div>
          ) : calculation.isError || !calculation.data ? (
            <Empty
              title={t("selectPeriod")}
              detail={
                selectedPeriod?.status === "draft"
                  ? t("selectPeriodToCalculate")
                  : t("periodsFromApi")
              }
              action={
                selectedPeriod?.status === "draft" ? (
                  <Button
                    onClick={() => calculate(selectedPeriodId)}
                    disabled={calc.isPending}
                  >
                    {calc.isPending ? t("calculating") : t("calculate")}
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div>
              <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary">
                    {t("calculationHistory")}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-semibold">
                    {periodLabel(calculation.data.period.label)}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("calculatedOn")} {date(calculation.data.calculatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Status value={calculation.data.period.status} />
                  {calculation.data.period.status === "calculated" && (
                    <Button
                      className="px-2 py-1 text-xs"
                      onClick={finalizePeriod}
                      disabled={finalize.isPending}
                    >
                      {t("finalize")}
                    </Button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 p-5 min-[360px]:grid-cols-2 sm:grid-cols-4">
                {[
                  [t("basic"), calculation.data.totals.basicSalary],
                  [t("additions"), calculation.data.totals.additions],
                  [t("overtime"), calculation.data.totals.overtime],
                  [t("netSalary"), calculation.data.totals.netSalary],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-lg bg-muted/60 p-3"
                  >
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {label}
                    </div>
                    <div className="mt-1 font-mono text-sm font-semibold">
                      {money(Number(value))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">
                      {t("calculationExplanation")}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {calculation.data.explanation ||
                        t("payrollFoundationExplanation")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowAdjustment(true)}
                    disabled={
                      calculation.data.period.status === "finalized" ||
                      calculation.data.period.status === "locked"
                    }
                  >
                    <Plus size={15} />
                    {t("addAdjustment")}
                  </Button>
                </div>
              </div>
              <div className="border-t border-border p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">
                    {t("employeeDetails")}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {calculation.data.items.length} {t("employeeCount")}
                  </span>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[700px] text-sm">
                    <thead className="bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-3 py-3">{t("employee")}</th>
                        <th className="px-3 py-3">{t("basic")}</th>
                        <th className="px-3 py-3">
                          {t("attendanceDeductions")}
                        </th>
                        <th className="px-3 py-3">{t("otherDeductions")}</th>
                        <th className="px-3 py-3">{t("netSalary")}</th>
                        <th className="px-3 py-3">{t("details")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {calculation.data.items.map((item: any) => (
                        <tr key={item.employee.id}>
                          <td className="px-3 py-3 font-semibold">
                            {item.employee.name}
                            <span className="block text-xs font-normal text-muted-foreground">
                              {item.employee.department}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-mono">
                            {money(item.basicSalary)}
                          </td>
                          <td className="px-3 py-3 font-mono">
                            {money(item.attendanceDeductions)}
                          </td>
                          <td className="px-3 py-3 font-mono">
                            {money(item.otherDeductions)}
                          </td>
                          <td className="px-3 py-3 font-mono font-semibold">
                            {money(item.netSalary)}
                          </td>
                          <td className="px-3 py-3">
                            <Button
                              variant="quiet"
                              className="px-2 py-1 text-xs"
                              onClick={() =>
                                setSelectedEmployeeId(item.employee.id)
                              }
                            >
                              {t("details")}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {selectedEmployee && (
                <div className="border-t border-border bg-muted/20 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display font-semibold">
                      {selectedEmployee.employee.name}
                    </h3>
                    <Button
                      variant="quiet"
                      className="px-2 py-1 text-xs"
                      onClick={() => setSelectedEmployeeId(null)}
                    >
                      {t("closeDetails")}
                    </Button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {[
                      [t("regularHours"), selectedEmployee.regularHours],
                      [t("overtimeHours"), selectedEmployee.overtimeHours],
                      [t("lateMinutes"), selectedEmployee.lateMinutes],
                      [
                        t("earlyCheckoutMinutes"),
                        selectedEmployee.earlyCheckoutMinutes,
                      ],
                      [t("missingHours"), selectedEmployee.missingHours],
                      [t("absentDays"), selectedEmployee.absentDays],
                      [t("leaveDays"), selectedEmployee.leaveDays],
                    ].map(([label, value]) => (
                      <div
                        key={String(label)}
                        className="rounded-lg bg-card p-3"
                      >
                        <div className="text-[11px] text-muted-foreground">
                          {label}
                        </div>
                        <div className="mt-1 font-mono text-sm font-semibold">
                          {String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedEmployee.leaveBalances?.length ? (
                    <div className="mt-5">
                      <h4 className="text-sm font-semibold">
                        {t("leaveBalances")}
                      </h4>
                      <div className="mt-2 divide-y divide-border rounded-lg border border-border bg-card">
                        {selectedEmployee.leaveBalances.map((balance: any) => (
                          <div
                            key={balance.type}
                            className="flex items-center justify-between gap-3 p-3 text-sm"
                          >
                            <span className="font-medium">{balance.type}</span>
                            <span className="font-mono text-xs text-muted-foreground">
                              {balance.remaining} / {balance.allocated}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <h4 className="mt-5 text-sm font-semibold">
                    {t("lineItems")}
                  </h4>
                  <div className="mt-2 divide-y divide-border rounded-lg border border-border bg-card">
                    {selectedEmployee.lineItems?.length ? (
                      selectedEmployee.lineItems.map(
                        (line: any, index: number) => (
                          <div
                            className="flex flex-col gap-1 p-3 sm:flex-row sm:items-center sm:justify-between"
                            key={`${line.label}-${index}`}
                          >
                            <span className="font-medium">
                              {line.label}
                              <span className="block text-xs font-normal text-muted-foreground">
                                {line.explanation}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "font-mono text-sm",
                                line.amount < 0
                                  ? "text-destructive"
                                  : "text-primary",
                              )}
                            >
                              {money(line.amount)}
                            </span>
                          </div>
                        ),
                      )
                    ) : (
                      <p className="p-3 text-sm text-muted-foreground">
                        {t("noLineItems")}
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="border-t border-border p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold">{t("adjustments")}</h3>
                  <span className="text-xs text-muted-foreground">
                    {t("recalculateAfterAdjustment")}
                  </span>
                </div>
                {adjustments.isLoading ? (
                  <Skeleton className="mt-4 h-16" />
                ) : adjustments.data?.length ? (
                  <div className="mt-4 divide-y divide-border rounded-lg border border-border">
                    {adjustments.data.map((item: any) => (
                      <div
                          className="flex items-start gap-3 p-3 sm:items-center"
                        key={item.id}
                      >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="font-semibold">
                                {item.employee.name}
                              </span>
                              <span className="break-words text-xs text-muted-foreground">
                                {item.reason}
                              </span>
                            </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {item.category === "fixed"
                              ? t("fixed")
                              : t("variable")}{" "}
                            ·{" "}
                            {item.type === "addition"
                              ? t("addition")
                              : t("deduction")}
                          </div>
                        </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="whitespace-nowrap font-mono">
                            {money(
                              item.type === "deduction"
                                ? -item.amount
                                : item.amount,
                            )}
                          </span>
                          {calculation.data.period.status !== "finalized" &&
                            calculation.data.period.status !== "locked" && (
                              <Button
                                variant="danger"
                                className="px-2 py-1 text-xs"
                                onClick={() => removeAdjustment(item.id)}
                                disabled={deleteAdjustment.isPending}
                              >
                                {t("remove")}
                              </Button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {t("noAdjustments")}
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
      {showPeriod && (
        <Modal
          title={t("createPayrollPeriod")}
          onClose={() => setShowPeriod(false)}
        >
          <form onSubmit={submitPeriod} className="space-y-4">
            <Field
              label={t("periodLabel")}
              value={periodForm.label}
              onChange={(value) =>
                setPeriodForm({ ...periodForm, label: value })
              }
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label={t("startDate")}
                type="date"
                value={periodForm.from}
                onChange={(value) =>
                  setPeriodForm({ ...periodForm, from: value })
                }
                required
              />
              <Field
                label={t("endDate")}
                type="date"
                value={periodForm.to}
                onChange={(value) =>
                  setPeriodForm({ ...periodForm, to: value })
                }
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="quiet"
                onClick={() => setShowPeriod(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createPeriod.isPending}>
                {createPeriod.isPending ? t("saving") : t("createPeriod")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {showAdjustment && (
        <Modal
          title={t("addAdjustment")}
          onClose={() => setShowAdjustment(false)}
        >
          <form onSubmit={submitAdjustment} className="space-y-4">
            <label className="block text-sm font-semibold">
              {t("employeeTarget")}
              <select
                required
                value={adjustmentForm.employeeId}
                onChange={(event) =>
                  setAdjustmentForm({
                    ...adjustmentForm,
                    employeeId: event.target.value,
                  })
                }
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
              >
                <option value="">{t("selectEmployeeForAdjustment")}</option>
                {employees.data?.map((employee: any) => (
                  <option value={employee.id} key={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                {t("adjustmentType")}
                <select
                  value={adjustmentForm.type}
                  onChange={(event) =>
                    setAdjustmentForm({
                      ...adjustmentForm,
                      type: event.target.value,
                    })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                >
                  <option value="addition">{t("addition")}</option>
                  <option value="deduction">{t("deduction")}</option>
                </select>
              </label>
              <label className="block text-sm font-semibold">
                {t("category")}
                <select
                  value={adjustmentForm.category}
                  onChange={(event) =>
                    setAdjustmentForm({
                      ...adjustmentForm,
                      category: event.target.value,
                    })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                >
                  <option value="fixed">{t("fixed")}</option>
                  <option value="variable">{t("variable")}</option>
                </select>
              </label>
            </div>
            <Field
              label={t("amount")}
              type="number"
              value={adjustmentForm.amount}
              onChange={(value) =>
                setAdjustmentForm({ ...adjustmentForm, amount: value })
              }
              required
            />
            <label className="block text-sm font-semibold">
              {t("reason")}
              <textarea
                required
                value={adjustmentForm.reason}
                onChange={(event) =>
                  setAdjustmentForm({
                    ...adjustmentForm,
                    reason: event.target.value,
                  })
                }
                className="mt-1 min-h-24 w-full rounded-lg border border-input bg-background p-3 text-sm font-normal"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="quiet"
                onClick={() => setShowAdjustment(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createAdjustment.isPending}>
                {createAdjustment.isPending ? t("saving") : t("addAdjustment")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

const scheduleDayOptions: Array<[string, AppCopyKey]> = [
  ["Sun", "daySun"],
  ["Mon", "dayMon"],
  ["Tue", "dayTue"],
  ["Wed", "dayWed"],
  ["Thu", "dayThu"],
  ["Fri", "dayFri"],
  ["Sat", "daySat"],
];

function Schedules({ embedded = false }: { embedded?: boolean }) {
  const { t } = useI18n();
  const qc = useQueryClient();
  const workspace = useGetWorkspace();
  const role = workspace.data?.role as WorkspaceRole | undefined;
  const canAdminister = role === "company_owner" || role === "platform_owner";
  const schedules = useListWorkSchedules({
    query: {
      enabled: canAdminister || role === "manager",
      queryKey: getListWorkSchedulesQueryKey(),
    },
  });
  const employees = useListEmployees(
    { status: "active" },
    {
      query: {
        enabled: canAdminister || role === "manager",
        queryKey: getListEmployeesQueryKey({ status: "active" }),
      },
    },
  );
  const selectedEmployeeId =
    canAdminister || role === "manager"
      ? employees.data?.[0]?.id || ""
      : workspace.data?.employeeId || "";
  const [employeeId, setEmployeeId] = useState("");
  const activeEmployeeId = employeeId || selectedEmployeeId;
  const effective = useGetEmployeeSchedule(activeEmployeeId, {
    query: {
      enabled: Boolean(activeEmployeeId),
      queryKey: getGetEmployeeScheduleQueryKey(activeEmployeeId),
    },
  });
  const create = useCreateWorkSchedule();
  const update = useUpdateWorkSchedule();
  const assign = useAssignEmployeeSchedule();
  const setDefault = useSetDefaultWorkSchedule();
  const history = useListScheduleAssignments({
    query: {
      enabled: canAdminister || role === "manager",
      queryKey: getListScheduleAssignmentsQueryKey(),
    },
  });
  const bulkAssign = useBulkAssignEmployeeSchedules();
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [draft, setDraft] = useState<any>({
    name: "",
    nameAr: "",
    workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
    startTime: "09:00",
    endTime: "17:00",
    overnight: false,
    requiredHours: "8",
    breakDurationMinutes: "0",
    breakPaid: true,
    graceMinutes: "15",
    earlyCheckoutGraceMinutes: "0",
    overtimeAfterMinutes: "30",
    overtimeEligible: true,
    active: true,
  });
  function openEditor(schedule?: any) {
    setEditing(schedule || null);
    setDraft(
      schedule
        ? {
            ...schedule,
            nameAr: schedule.nameAr || "",
            requiredHours: String(schedule.requiredHours),
            breakDurationMinutes: String(schedule.breakDurationMinutes),
            earlyCheckoutGraceMinutes: String(
              schedule.earlyCheckoutGraceMinutes,
            ),
            graceMinutes: String(schedule.graceMinutes),
            overtimeAfterMinutes: String(schedule.overtimeAfterMinutes),
          }
        : {
            name: "",
            nameAr: "",
            workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
            startTime: "09:00",
            endTime: "17:00",
            overnight: false,
            requiredHours: "8",
            breakDurationMinutes: "0",
            breakPaid: true,
            graceMinutes: "15",
            earlyCheckoutGraceMinutes: "0",
            overtimeAfterMinutes: "30",
            overtimeEligible: true,
            active: true,
          },
    );
    setShowEditor(true);
  }
  function submitSchedule(event: FormEvent) {
    event.preventDefault();
    if (
      !draft.name.trim() ||
      !draft.startTime ||
      !draft.endTime
    ) {
      toast.error(t("scheduleValidation"));
      return;
    }
    const data = {
      ...draft,
      name: draft.name.trim(),
      nameAr: draft.nameAr.trim(),
      requiredHours: Number(draft.requiredHours),
      breakDurationMinutes: Number(draft.breakDurationMinutes),
      breakPaid: Boolean(draft.breakPaid),
      graceMinutes: Number(draft.graceMinutes),
      earlyCheckoutGraceMinutes: Number(draft.earlyCheckoutGraceMinutes),
      overtimeAfterMinutes: Number(draft.overtimeAfterMinutes),
      active: Boolean(draft.active),
    };
    const options = {
      onSuccess: () => {
        toast.success(t(editing ? "scheduleUpdated" : "scheduleCreated"));
        setShowEditor(false);
        qc.invalidateQueries({ queryKey: getListWorkSchedulesQueryKey() });
      },
      onError: (error: unknown) =>
        toast.error(apiErrorMessage(error, t("scheduleSaveFailed"))),
    };
    if (editing) update.mutate({ scheduleId: editing.id, data }, options);
    else create.mutate({ data }, options);
  }
  function submitAssignment(event: FormEvent) {
    event.preventDefault();
    if (
      !activeEmployeeId ||
      !draft.assignmentScheduleId ||
      !draft.effectiveFrom
    )
      return;
    assign.mutate(
      {
        employeeId: activeEmployeeId,
        data: {
          scheduleId: draft.assignmentScheduleId,
          effectiveFrom: draft.effectiveFrom,
          effectiveTo: draft.effectiveTo || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("scheduleAssigned"));
          qc.invalidateQueries({
            queryKey: getGetEmployeeScheduleQueryKey(activeEmployeeId),
          });
        },
        onError: (error: unknown) =>
          toast.error(apiErrorMessage(error, t("scheduleAssignmentFailed"))),
      },
    );
  }
  function beginAssignment() {
    setDraft((value: any) => ({
      ...value,
      assignmentScheduleId:
        effective.data?.schedule?.id || schedules.data?.[0]?.id || "",
      effectiveFrom:
        effective.data?.assignment?.effectiveFrom ||
        new Date().toISOString().slice(0, 10),
      effectiveTo: effective.data?.assignment?.effectiveTo || "",
    }));
  }
  function makeDefault(scheduleId: string) {
    setDefault.mutate(
      { scheduleId },
      {
        onSuccess: () => {
          toast.success(t("defaultSchedule"));
          qc.invalidateQueries({ queryKey: getListWorkSchedulesQueryKey() });
        },
        onError: (error: unknown) =>
          toast.error(apiErrorMessage(error, t("scheduleSaveFailed"))),
      },
    );
  }
  function submitBulkAssignment(event: FormEvent) {
    event.preventDefault();
    const selected = draft.bulkEmployeeIds || [];
    if (!selected.length || !draft.bulkScheduleId || !draft.bulkEffectiveFrom)
      return;
    bulkAssign.mutate(
      {
        data: {
          employeeIds: selected,
          scheduleId: draft.bulkScheduleId,
          effectiveFrom: draft.bulkEffectiveFrom,
          effectiveTo: draft.bulkEffectiveTo || null,
        },
      },
      {
        onSuccess: (result: any) => {
          toast.success(`${result.assigned} ${t("bulkAssigned")}`);
          setDraft((value: any) => ({ ...value, bulkEmployeeIds: [] }));
          qc.invalidateQueries({
            queryKey: getListScheduleAssignmentsQueryKey(),
          });
          qc.invalidateQueries({ queryKey: getListWorkSchedulesQueryKey() });
        },
        onError: (error: unknown) =>
          toast.error(apiErrorMessage(error, t("scheduleAssignmentFailed"))),
      },
    );
  }
  const effectiveSchedule = effective.data?.schedule;
  return (
    <div className="animate-in">
      {!embedded && (
        <SectionTitle
          eyebrow={t("rules")}
          title={t("shiftOrganization")}
          detail={t("shiftOrganizationDetail")}
          action={
            canAdminister ? (
              <Button onClick={() => openEditor()}>
                <Plus size={16} />
                {t("createSchedule")}
              </Button>
            ) : undefined
          }
        />
      )}
      {embedded && canAdminister && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">
              {t("shiftOrganization")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("shiftOrganizationDetail")}
            </p>
          </div>
          <Button onClick={() => openEditor()}>
            <Plus size={16} />
            {t("createSchedule")}
          </Button>
        </div>
      )}
      {canAdminister || role === "manager" ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <Card>
            <div className="border-b border-border p-5">
              <h2 className="font-display text-lg font-semibold">
                {t("schedules")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("startTime")} → {t("endTime")}
              </p>
            </div>
            {schedules.isLoading ? (
              <div className="space-y-3 p-5">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : schedules.isError ? (
              <ErrorState retry={() => schedules.refetch()} />
            ) : schedules.data?.length ? (
              <div className="divide-y divide-border">
                {schedules.data.map((schedule: any) => (
                  <div className="p-5" key={schedule.id}>
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex items-center gap-2 font-semibold">
                          {schedule.name}
                          {schedule.isDefault && (
                            <Badge tone="accent">{t("defaultSchedule")}</Badge>
                          )}
                          <Badge tone={schedule.active ? "good" : "neutral"}>
                            {schedule.active
                              ? t("activeSchedule")
                              : t("statusInactive")}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!schedule.isDefault && (
                          <Button
                            variant="outline"
                            onClick={() => makeDefault(schedule.id)}
                            disabled={setDefault.isPending}
                          >
                            {t("setDefaultSchedule")}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => openEditor(schedule)}
                        >
                          {t("editSchedule")}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <Info label={t("startTime")} value={schedule.startTime} />
                      <Info
                        label={t("endTime")}
                        value={`${schedule.endTime}${schedule.endTime <= schedule.startTime ? ` · ${t("overnightSchedule")}` : ""}`}
                      />
                      <Info
                        label={t("requiredHours")}
                        value={`${schedule.requiredHours}h`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                title={t("noSchedules")}
                detail={t("noSchedulesDetail")}
                action={
                  <Button onClick={() => openEditor()}>
                    <Plus size={15} />
                    {t("createSchedule")}
                  </Button>
                }
              />
            )}
          </Card>
          <Card>
            <div className="border-b border-border p-5">
              <h2 className="font-display text-lg font-semibold">
                {t("employeeShiftAssignment")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("employeeShiftAssignmentDetail")}
              </p>
            </div>
            <div className="space-y-4 p-5">
              <label className="block text-sm font-semibold">
                {t("selectEmployee")}
                <select
                  value={activeEmployeeId}
                  onChange={(event) => {
                    setEmployeeId(event.target.value);
                    setDraft((value: any) => ({
                      ...value,
                      assignmentScheduleId: "",
                      effectiveFrom: new Date().toISOString().slice(0, 10),
                      effectiveTo: "",
                    }));
                  }}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-2 text-sm font-normal"
                >
                  <option value="">{t("selectEmployee")}</option>
                  {employees.data?.map((employee: any) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
              </label>
              {effective.isLoading ? (
                <Skeleton className="h-28" />
              ) : effective.isError ? (
                <ErrorState retry={() => effective.refetch()} />
              ) : effectiveSchedule ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="font-semibold">{effectiveSchedule.name}</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {effectiveSchedule.startTime} → {effectiveSchedule.endTime}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t("effectiveFrom")}:{" "}
                    {date(effective.data?.assignment?.effectiveFrom)}
                  </p>
                </div>
              ) : (
                <Empty
                  title={t("noEffectiveSchedule")}
                  detail={t("noEffectiveScheduleDetail")}
                />
              )}
              {activeEmployeeId && (
                <form
                  onSubmit={submitAssignment}
                  className="space-y-4 border-t border-border pt-4"
                >
                  <label className="block text-sm font-semibold">
                    {t("selectSchedule")}
                    <select
                      required
                      value={draft.assignmentScheduleId || ""}
                      onFocus={beginAssignment}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          assignmentScheduleId: event.target.value,
                        })
                      }
                      className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-2 text-sm font-normal"
                    >
                      <option value="">{t("selectSchedule")}</option>
                      {schedules.data
                        ?.filter((schedule: any) => schedule.active)
                        .map((schedule: any) => (
                          <option key={schedule.id} value={schedule.id}>
                            {schedule.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label={t("effectiveFrom")}
                      type="date"
                      required
                      value={draft.effectiveFrom || ""}
                      onChange={(value) =>
                        setDraft({ ...draft, effectiveFrom: value })
                      }
                    />
                    <Field
                      label={t("effectiveTo")}
                      type="date"
                      value={draft.effectiveTo || ""}
                      onChange={(value) =>
                        setDraft({ ...draft, effectiveTo: value })
                      }
                    />
                  </div>
                  <Button type="submit" disabled={assign.isPending}>
                    {assign.isPending ? t("saving") : t("assignSchedule")}
                  </Button>
                </form>
              )}
            </div>
          </Card>
          <Card className="xl:col-span-2">
            <div className="border-b border-border p-5">
              <h2 className="font-display text-lg font-semibold">
                {t("bulkAssignment")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("effectiveSchedule")}
              </p>
            </div>
            <form
              onSubmit={submitBulkAssignment}
              className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <label className="block text-sm font-semibold">
                {t("selectEmployees")}
                <select
                  multiple
                  value={draft.bulkEmployeeIds || []}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      bulkEmployeeIds: Array.from(
                        event.target.selectedOptions,
                        (option) => option.value,
                      ),
                    })
                  }
                  className="mt-1 min-h-28 w-full rounded-lg border border-input bg-background px-2 py-2 text-sm font-normal"
                >
                  {employees.data?.map((employee: any) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                {t("selectSchedule")}
                <select
                  required
                  value={draft.bulkScheduleId || ""}
                  onChange={(event) =>
                    setDraft({ ...draft, bulkScheduleId: event.target.value })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-2 text-sm font-normal"
                >
                  <option value="">{t("selectSchedule")}</option>
                  {schedules.data
                    ?.filter((schedule: any) => schedule.active)
                    .map((schedule: any) => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.name}
                      </option>
                    ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Field
                  label={t("effectiveFrom")}
                  type="date"
                  required
                  value={draft.bulkEffectiveFrom || ""}
                  onChange={(value) =>
                    setDraft({ ...draft, bulkEffectiveFrom: value })
                  }
                />
                <Field
                  label={t("effectiveTo")}
                  type="date"
                  value={draft.bulkEffectiveTo || ""}
                  onChange={(value) =>
                    setDraft({ ...draft, bulkEffectiveTo: value })
                  }
                />
              </div>
              <Button
                type="submit"
                disabled={bulkAssign.isPending}
                className="self-end"
              >
                {bulkAssign.isPending ? t("saving") : t("bulkAssignment")}
              </Button>
            </form>
          </Card>
          <Card className="xl:col-span-2">
            <div className="border-b border-border p-5">
              <h2 className="font-display text-lg font-semibold">
                {t("assignmentHistory")}
              </h2>
            </div>
            {history.isLoading ? (
              <Skeleton className="m-5 h-24" />
            ) : history.isError ? (
              <ErrorState retry={() => history.refetch()} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="px-5 py-3 text-start">{t("employee")}</th>
                      <th className="px-5 py-3 text-start">
                        {t("scheduleName")}
                      </th>
                      <th className="px-5 py-3 text-start">
                        {t("effectiveFrom")}
                      </th>
                      <th className="px-5 py-3 text-start">
                        {t("effectiveTo")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.data?.map((item: any) => (
                      <tr className="border-b border-border/60" key={item.id}>
                        <td className="px-5 py-3">{item.employeeName}</td>
                        <td className="px-5 py-3">{item.scheduleName}</td>
                        <td className="px-5 py-3">
                          {date(item.effectiveFrom)}
                        </td>
                        <td className="px-5 py-3">{date(item.effectiveTo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <Card>
          {effective.isLoading ? (
            <Skeleton className="h-40 m-5" />
          ) : effective.isError ? (
            <ErrorState retry={() => effective.refetch()} />
          ) : effectiveSchedule ? (
            <div className="p-6">
              <h2 className="font-display text-lg font-semibold">
                {t("effectiveSchedule")}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Info
                  label={t("scheduleName")}
                  value={effectiveSchedule.name}
                />
                <Info
                  label={t("startTime")}
                  value={`${effectiveSchedule.startTime} → ${effectiveSchedule.endTime}`}
                />
              </div>
            </div>
          ) : (
            <Empty
              title={t("noEffectiveSchedule")}
              detail={t("noEffectiveScheduleDetail")}
            />
          )}
        </Card>
      )}
      {showEditor && (
        <Modal
          title={t(editing ? "editSchedule" : "createSchedule")}
          onClose={() => setShowEditor(false)}
        >
          <form onSubmit={submitSchedule} className="space-y-4">
            <Field
              label={t("scheduleName")}
              required
              value={draft.name}
              onChange={(value) => setDraft({ ...draft, name: value })}
            />
            <Field
              label={t("scheduleNameAr")}
              value={draft.nameAr}
              onChange={(value) => setDraft({ ...draft, nameAr: value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("startTime")}
                required
                type="time"
                value={draft.startTime}
                onChange={(value) => setDraft({ ...draft, startTime: value })}
              />
              <Field
                label={t("endTime")}
                required
                type="time"
                value={draft.endTime}
                onChange={(value) => setDraft({ ...draft, endTime: value })}
              />
            </div>
            {draft.startTime &&
            draft.endTime &&
            draft.endTime <= draft.startTime ? (
              <p className="rounded-lg bg-accent/10 p-3 text-sm text-primary-dark">
                <strong>{t("overnightSchedule")}</strong> —{" "}
                {t("overnightScheduleDetail")}
              </p>
            ) : null}
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={draft.overnight}
                onChange={(event) =>
                  setDraft({ ...draft, overnight: event.target.checked })
                }
              />
              {t("overnightSchedule")}
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label={t("requiredHours")}
                required
                type="number"
                value={draft.requiredHours}
                onChange={(value) =>
                  setDraft({ ...draft, requiredHours: value })
                }
              />
              <Field
                label={t("graceMinutes")}
                required
                type="number"
                value={draft.graceMinutes}
                onChange={(value) =>
                  setDraft({ ...draft, graceMinutes: value })
                }
              />
              <Field
                label={t("earlyCheckoutGraceMinutes")}
                required
                type="number"
                value={draft.earlyCheckoutGraceMinutes}
                onChange={(value) =>
                  setDraft({ ...draft, earlyCheckoutGraceMinutes: value })
                }
              />
              <Field
                label={t("breakDurationMinutes")}
                required
                type="number"
                value={draft.breakDurationMinutes}
                onChange={(value) =>
                  setDraft({ ...draft, breakDurationMinutes: value })
                }
              />
              <Field
                label={t("overtimeAfterMinutes")}
                required
                type="number"
                value={draft.overtimeAfterMinutes}
                onChange={(value) =>
                  setDraft({ ...draft, overtimeAfterMinutes: value })
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={draft.breakPaid}
                onChange={(event) =>
                  setDraft({ ...draft, breakPaid: event.target.checked })
                }
              />
              {t("breakPaid")}
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={draft.overtimeEligible}
                onChange={(event) =>
                  setDraft({ ...draft, overtimeEligible: event.target.checked })
                }
              />
              {t("overtimeEligible")}
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(event) =>
                  setDraft({ ...draft, active: event.target.checked })
                }
              />
              {t("activeSchedule")}
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="quiet"
                onClick={() => setShowEditor(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={create.isPending || update.isPending}
              >
                {create.isPending || update.isPending
                  ? t("saving")
                  : t("saveLocation")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function SchedulesRoute() {
  return <Schedules />;
}

function Holidays() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const workspace = useGetWorkspace();
  const capabilities = workspace.data?.capabilities || [];
  const canAdminister =
    workspace.data?.role === "company_owner" ||
    workspace.data?.role === "platform_owner";
  const canManageHolidays =
    canAdminister || capabilities.includes("holidays.manage");
  const q = useListHolidays({ query: { queryKey: getListHolidaysQueryKey() } });
  const create = useCreateHoliday();
  const update = useUpdateHoliday();
  const remove = useDeleteHoliday();
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    date: "",
    endDate: "",
    recurring: false,
    multiplier: 1,
    enabled: true,
  });
  function openEditor(holiday?: any) {
    setEditing(holiday || null);
    setDraft(
      holiday
        ? {
            name: holiday.name,
            date: holiday.date,
            endDate: holiday.endDate || "",
            recurring: Boolean(holiday.recurring),
            multiplier: holiday.multiplier || 1,
            enabled: holiday.enabled !== false,
          }
        : {
            name: "",
            date: "",
            endDate: "",
            recurring: false,
            multiplier: 1,
            enabled: true,
          },
    );
    setShowEditor(true);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const data = {
      name: draft.name.trim(),
      date: draft.date,
      endDate: draft.endDate || null,
      recurring: draft.recurring,
      multiplier: Number(draft.multiplier) as 1 | 2 | 3,
      enabled: draft.enabled,
    };
    const options = {
      onSuccess: () => {
        toast.success(t(editing ? "holidayUpdated" : "holidayCreated"));
        setShowEditor(false);
        qc.invalidateQueries({ queryKey: getListHolidaysQueryKey() });
      },
      onError: (error: unknown) =>
        toast.error(apiErrorMessage(error, t("holidaySaveFailed"))),
    };
    if (editing) update.mutate({ holidayId: editing.id, data }, options);
    else create.mutate({ data }, options);
  }
  function removeHoliday(id: string) {
    if (!window.confirm(t("confirmDeleteHoliday"))) return;
    remove.mutate(
      { holidayId: id },
      {
        onSuccess: () => {
          toast.success(t("holidayDeleted"));
          qc.invalidateQueries({ queryKey: getListHolidaysQueryKey() });
        },
        onError: (error: unknown) =>
          toast.error(apiErrorMessage(error, t("holidayDeleteFailed"))),
      },
    );
  }
  if (!canAdminister && workspace.data?.role !== "manager")
    return <WorkspaceState kind="unauthorized" />;
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("holidays")}
        title={t("holidaysTitle")}
        detail={t("holidaysDetail")}
        action={
          canManageHolidays ? (
            <Button onClick={() => openEditor()}>
              <Plus size={16} />
              {t("addHoliday")}
            </Button>
          ) : undefined
        }
      />
      <Card>
        {q.isLoading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : q.isError ? (
          <ErrorState retry={() => q.refetch()} />
        ) : q.data?.length ? (
          <div className="divide-y divide-border">
            {q.data.map((holiday: any) => (
              <div
                className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
                key={holiday.id}
              >
                <div>
                  <div className="font-semibold">{holiday.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {date(holiday.date)}
                    {holiday.endDate ? ` – ${date(holiday.endDate)}` : ""}{" "}
                    {holiday.recurring ? `· ${t("recurringHoliday")}` : ""}
                    {` · ${holiday.multiplier}×`}
                    {!holiday.enabled ? " · disabled" : ""}
                  </div>
                </div>
                {canManageHolidays && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => openEditor(holiday)}
                    >
                      {t("editHoliday")}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => removeHoliday(holiday.id)}
                      disabled={remove.isPending}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title={t("noHolidays")}
            detail={t("noHolidaysDetail")}
            action={
              canManageHolidays ? (
                <Button onClick={() => openEditor()}>
                  <Plus size={15} />
                  {t("addHoliday")}
                </Button>
              ) : undefined
            }
          />
        )}
      </Card>
      {showEditor && (
        <Modal
          title={t(editing ? "editHoliday" : "addHoliday")}
          onClose={() => setShowEditor(false)}
        >
          <form onSubmit={submit} className="space-y-4">
            <Field
              label={t("holidayName")}
              required
              value={draft.name}
              onChange={(value) => setDraft({ ...draft, name: value })}
            />
            <Field
              label={t("holidayDate")}
              required
              type="date"
              value={draft.date}
              onChange={(value) => setDraft({ ...draft, date: value })}
            />
            <Field
              label="End date (optional)"
              type="date"
              value={draft.endDate}
              onChange={(value) => setDraft({ ...draft, endDate: value })}
            />
            <label className="block text-sm font-semibold">
              Extra-pay multiplier
              <select
                value={draft.multiplier}
                onChange={(event) =>
                  setDraft({ ...draft, multiplier: Number(event.target.value) })
                }
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
              >
                <option value={1}>1×</option>
                <option value={2}>2×</option>
                <option value={3}>3×</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={draft.recurring}
                onChange={(event) =>
                  setDraft({ ...draft, recurring: event.target.checked })
                }
              />
              {t("recurringHoliday")}
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(event) =>
                  setDraft({ ...draft, enabled: event.target.checked })
                }
              />
              Enabled
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="quiet"
                onClick={() => setShowEditor(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={create.isPending || update.isPending}
              >
                {create.isPending || update.isPending
                  ? t("saving")
                  : t("saveLocation")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function SyncHistory() {
  const { t } = useI18n();
  const workspace = useGetWorkspace();
  const canAdminister =
    workspace.data?.role === "company_owner" ||
    workspace.data?.role === "platform_owner";
  const embeddedDeviceId: string | undefined = undefined;
  const devices = useListDevices();
  const [selectedDeviceId, setSelectedDeviceId] = useState(
    embeddedDeviceId || "",
  );
  const deviceId = embeddedDeviceId || selectedDeviceId;
  const history = useListDeviceSyncHistory(deviceId, {
    query: {
      enabled: Boolean(deviceId),
      queryKey: getListDeviceSyncHistoryQueryKey(deviceId),
    },
  });
  useEffect(() => {
    if (!embeddedDeviceId && !selectedDeviceId && devices.data?.[0]?.id)
      setSelectedDeviceId(devices.data[0].id);
  }, [devices.data, embeddedDeviceId, selectedDeviceId]);
  const labelOperation = (value: string) =>
    value === "employee_sync"
      ? t("employeeSync")
      : value === "attendance_sync"
        ? t("attendanceSync")
        : t("fullSync");
  if (!canAdminister) return <WorkspaceState kind="unauthorized" />;
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("syncHistory")}
        title={t("syncHistory")}
        detail={t("syncHistoryDetail")}
        action={
          deviceId ? (
            <Button variant="outline" onClick={() => history.refetch()}>
              <RefreshCw size={15} />
              {t("refreshHistory")}
            </Button>
          ) : undefined
        }
      />
      <Card>
        <div className="border-b border-border p-5">
          {embeddedDeviceId ? (
            <p className="text-sm font-semibold">
              {devices.data?.find(
                (device: any) => device.id === embeddedDeviceId,
              )?.name || embeddedDeviceId}
            </p>
          ) : (
            <label className="block max-w-md text-sm font-semibold">
              {t("chooseDeviceForHistory")}
              <select
                value={selectedDeviceId}
                onChange={(event) => setSelectedDeviceId(event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-2 text-sm font-normal"
              >
                <option value="">{t("chooseDeviceForHistory")}</option>
                {devices.data?.map((device: any) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        {!deviceId ? (
          <Empty
            title={t("chooseDeviceForHistory")}
            detail={t("noSyncHistoryDetail")}
          />
        ) : history.isLoading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : history.isError ? (
          <ErrorState retry={() => history.refetch()} />
        ) : history.data?.length ? (
          <div className="divide-y divide-border">
            {history.data.map((entry: any) => (
              <div className="p-5" key={entry.id}>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      {labelOperation(entry.operation)}
                      <Status value={entry.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {entry.message}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {date(entry.startedAt)} · {time(entry.startedAt)}
                  </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <Info label={t("provider")} value={entry.providerKey} />
                  <Info
                    label={t("eventsReceived")}
                    value={entry.eventsReceived}
                  />
                  <Info
                    label={t("eventsProcessed")}
                    value={entry.eventsProcessed}
                  />
                  <Info label={t("errorCount")} value={entry.errorCount} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty title={t("noSyncHistory")} detail={t("noSyncHistoryDetail")} />
        )}
      </Card>
    </div>
  );
}

type BackupSummary = {
  id: string;
  scope: "platform" | "company";
  companyId: string | null;
  status: string;
  sizeBytes: number;
  checksum: string;
  metadata: {
    schemaVersion?: string;
    tableCounts?: Record<string, number>;
    includesExternalFiles?: boolean;
    sourceChecksum?: string;
  };
  createdAt: string;
};

function BackupRestore() {
  const { locale, t } = useI18n();
  const workspace = useGetWorkspace();
  const [backups, setBackups] = useState<BackupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const uploadInput = useRef<HTMLInputElement>(null);
  const [uploadedBackup, setUploadedBackup] = useState<BackupSummary | null>(
    null,
  );
  const [selectedFilename, setSelectedFilename] = useState("");
  const isArabic = locale === "ar";
  const role = workspace.data?.role;
  const isPlatformOwner = role === "platform_owner";
  const labels = isArabic
    ? {
        title: "النسخ الاحتياطي والاستعادة",
        detail: isPlatformOwner
          ? "أنشئ نسخة كاملة من المنصة أو استعدها بأمان."
          : "احمِ بيانات شركتك واستعدها داخل نطاقها فقط.",
        create: isPlatformOwner ? "نسخة منصة جديدة" : "نسخة شركة جديدة",
        platform: "نسخة المنصة",
        company: "نسخة الشركة",
        safety: "نسخة أمان",
        downloadSection: "النسخ الاحتياطية / التنزيل",
        restoreSection: "استعادة من الجهاز",
        generatedDetail: "نسخ أنشأها نظام VAR HR ويمكن تنزيلها.",
        restoreDetail:
          "اختر ملف نسخة احتياطية من جهازك للتحقق منه ثم استعادته.",
        selectedFile: "الملف المحدد من الجهاز",
        chooseFile: "اختيار ملف النسخة الاحتياطية",
        noFileSelected: "لم يتم اختيار ملف بعد.",
        download: "تنزيل",
        upload: "رفع نسخة احتياطية",
        uploadHint:
          "اختر ملف JSON تم تنزيله مسبقاً للتحقق منه وتجهيزه للاستعادة.",
        invalidFile: "الملف المحدد ليس JSON صالحاً.",
        uploaded: "تم التحقق من النسخة وأصبحت جاهزة للاستعادة.",
        restore: "استعادة",
        delete: "حذف",
        empty: "لا توجد نسخ احتياطية",
        loading: "جارٍ تحميل النسخ الاحتياطية…",
        failed: "تعذر تحميل النسخ الاحتياطية.",
        created: "تم إنشاء النسخة الاحتياطية.",
        restored: "تمت الاستعادة بنجاح.",
        confirm:
          "الاستعادة تستبدل بيانات هذا النطاق بالكامل. سيتم إنشاء نسخة أمان أولاً. هل تريد المتابعة؟",
        confirmDelete: "هل تريد حذف هذه النسخة؟",
        external:
          "لا توجد ملفات خارجية في هذا النظام حالياً؛ النسخ تغطي بيانات قاعدة البيانات.",
        integrity: "سلامة SHA-256",
        records: "سجلات البيانات",
        size: "الحجم",
      }
    : {
        title: "Backup & restore",
        detail: isPlatformOwner
          ? "Create or safely restore a complete platform snapshot."
          : "Protect and restore your company data within its tenant boundary.",
        create: isPlatformOwner ? "New platform backup" : "New company backup",
        platform: "Platform backup",
        company: "Company backup",
        safety: "Safety backup",
        downloadSection: "Backup / Download",
        restoreSection: "Restore from device",
        generatedDetail:
          "Backups generated by VAR HR and available to download.",
        restoreDetail:
          "Choose a backup file from your device to validate and restore.",
        selectedFile: "Selected file from device",
        chooseFile: "Choose backup file",
        noFileSelected: "No file selected yet.",
        download: "Download",
        upload: "Upload Backup",
        uploadHint:
          "Choose a previously downloaded JSON backup to validate and stage for restore.",
        invalidFile: "The selected file is not valid JSON.",
        uploaded: "Backup validated and ready to restore.",
        restore: "Restore",
        delete: "Delete",
        empty: "No backups yet",
        loading: "Loading backups…",
        failed: "Backups could not be loaded.",
        created: "Backup created.",
        restored: "Restore completed.",
        confirm:
          "Restore replaces all data in this scope. A safety backup will be created first. Continue?",
        confirmDelete: "Delete this backup?",
        external:
          "There is no external file storage in this system currently; backups cover database data.",
        integrity: "SHA-256 integrity",
        records: "Data records",
        size: "Size",
      };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setBackups(await authRequest<BackupSummary[]>("/api/backups"));
    } catch {
      setError(labels.failed);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (role === "platform_owner" || role === "company_owner") void load();
  }, [role]);

  const create = async () => {
    setPending("create");
    setError("");
    try {
      await authRequest("/api/backups", {
        method: "POST",
        body: JSON.stringify({
          scope: isPlatformOwner ? "platform" : "company",
        }),
      });
      toast.success(labels.created);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : labels.failed);
    } finally {
      setPending("");
    }
  };
  const restore = async (backup: BackupSummary) => {
    if (!window.confirm(labels.confirm)) return;
    setPending(backup.id);
    setError("");
    try {
      await authRequest(`/api/backups/${backup.id}/restore`, {
        method: "POST",
        body: JSON.stringify({ confirmation: "RESTORE" }),
      });
      toast.success(labels.restored);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : labels.failed);
    } finally {
      setPending("");
    }
  };
  const download = async (backup: BackupSummary) => {
    setPending(`download-${backup.id}`);
    try {
      const response = await fetch(`/api/backups/${backup.id}/download`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Download failed.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `var-hr-${backup.scope}-backup-${backup.id.slice(0, 8)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : labels.failed);
    } finally {
      setPending("");
    }
  };
  const remove = async (backup: BackupSummary) => {
    if (!window.confirm(labels.confirmDelete)) return;
    setPending(`delete-${backup.id}`);
    try {
      await authRequest(`/api/backups/${backup.id}`, { method: "DELETE" });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : labels.failed);
    } finally {
      setPending("");
    }
  };
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setSelectedFilename(file.name);
    setUploadedBackup(null);
    setPending("upload");
    setError("");
    try {
      let backup: unknown;
      try {
        backup = JSON.parse(await file.text());
      } catch {
        throw new Error(labels.invalidFile);
      }
      const imported = await authRequest<BackupSummary>("/api/backups/upload", {
        method: "POST",
        body: JSON.stringify({ backup }),
      });
      setUploadedBackup(imported);
      toast.success(labels.uploaded);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : labels.failed);
    } finally {
      setPending("");
    }
  };

  if (!role || (role !== "platform_owner" && role !== "company_owner")) {
    return <WorkspaceState kind="unauthorized" />;
  }
  const generatedBackups = backups.filter(
    (backup) => !backup.metadata.sourceChecksum,
  );
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("backupRestore")}
        title={labels.title}
        detail={labels.detail}
      />
      <Card>
        <div className="border-b border-border p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">
                {labels.downloadSection}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {labels.generatedDetail}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Download className="text-primary" size={20} />
              <Button onClick={create} disabled={pending !== ""}>
                <Database size={15} />
                {pending === "create" ? "…" : labels.create}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-b border-border p-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{labels.external}</span>
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            v1 · PostgreSQL
          </span>
        </div>
        {error && (
          <div className="m-5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {loading ? (
          <div className="space-y-3 p-5">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : generatedBackups.length === 0 ? (
          <Empty title={labels.empty} detail={labels.generatedDetail} />
        ) : (
          <div className="divide-y divide-border">
            {generatedBackups.map((backup) => (
              <div className="p-5" key={backup.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {backup.scope === "platform"
                          ? labels.platform
                          : labels.company}
                      </span>
                      <Status
                        value={
                          backup.status === "safety" ? "completed" : "active"
                        }
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(backup.createdAt).toLocaleString(
                        isArabic ? "ar-EG" : "en-GB",
                      )}
                    </p>
                    <p className="mt-3 break-all font-mono text-[11px] text-muted-foreground">
                      {labels.integrity}: {backup.checksum}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 lg:min-w-[360px]">
                    <Info
                      label={labels.size}
                      value={`${Math.ceil(backup.sizeBytes / 1024)} KB`}
                    />
                    <Info
                      label={labels.records}
                      value={Object.values(
                        backup.metadata.tableCounts ?? {},
                      ).reduce((sum, count) => sum + count, 0)}
                    />
                    <Info
                      label="Schema"
                      value={backup.metadata.schemaVersion ?? "v1"}
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => void download(backup)}
                    disabled={pending !== ""}
                  >
                    <Download size={14} />
                    {labels.download}
                  </Button>
                  <Button
                    variant="quiet"
                    onClick={() => void remove(backup)}
                    disabled={pending !== ""}
                  >
                    <X size={14} />
                    {labels.delete}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card className="mt-5 overflow-hidden">
        <div className="border-b border-border p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">
                {labels.restoreSection}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {labels.restoreDetail}
              </p>
            </div>
            <Upload className="shrink-0 text-primary" size={20} />
          </div>
        </div>
        <div className="space-y-4 p-5">
          <input
            ref={uploadInput}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={(event) => void upload(event)}
          />
          <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{labels.selectedFile}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {selectedFilename || labels.noFileSelected}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => uploadInput.current?.click()}
                disabled={pending !== ""}
              >
                <Upload size={14} />
                {pending === "upload" ? "…" : labels.chooseFile}
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {labels.uploadHint}
            </p>
          </div>
          {uploadedBackup && (
            <div className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2 text-sm">
                <ShieldCheck
                  className="mt-0.5 shrink-0 text-primary"
                  size={16}
                />
                <span>{labels.uploaded}</span>
              </div>
              <Button
                onClick={() => void restore(uploadedBackup)}
                disabled={pending !== ""}
              >
                <Database size={14} />
                {pending === uploadedBackup.id ? "…" : labels.restore}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

type AdminEntity = {
  key: string;
  label: string;
  columns: string[];
  editable: string[];
  supportEditable?: string[];
  canArchive?: boolean;
  canDelete?: boolean;
};
type AdminData = AdminEntity & { rows: Array<Record<string, unknown>> };
type AdminDataResponse = AdminData & { entity?: string };
type DatabaseCompany = { id: string; name: string; slug: string; active: boolean };
type AdminHistoryEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorType: string;
  actorId: string | null;
  actor: { fullName: string; displayRole: string } | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
};
const supportedDatabaseActions = new Set(["employees", "departments", "branches"]);
const sensitiveDatabaseFields = new Set([
  "password",
  "password_hash",
  "token",
  "secret",
  "credential",
  "credentials",
  "salary",
  "bank_account",
  "national_id",
  "ssn",
]);
const isSensitiveDatabaseField = (key: string) =>
  sensitiveDatabaseFields.has(key.toLowerCase()) ||
  /(password|token|secret|credential|salary|national.?id|ssn)/i.test(key);
const safeDatabaseColumns = (columns: string[]) =>
  columns.filter((column) => !isSensitiveDatabaseField(column));
const safeHistoryDisplayValue = (
  value: Record<string, unknown> | null | undefined,
): Record<string, unknown> =>
  value
    ? Object.fromEntries(
        Object.entries(value)
          .filter(([key]) => !isSensitiveDatabaseField(key))
          .map(([key, entry]) => [
            key,
            entry && typeof entry === "object" && !Array.isArray(entry)
              ? safeHistoryDisplayValue(entry as Record<string, unknown>)
              : entry,
          ]),
      )
    : {};
const entityLabels: Record<string, string> = {
  companies: "Companies",
  departments: "Departments",
  branches: "Branches",
  employees: "Employees",
  attendance: "Attendance",
  devices: "Devices",
  holidays: "Holidays",
  payrollPeriods: "Payroll periods",
};
const entityLabelsArabic: Record<string, string> = {
  companies: "الشركات",
  departments: "الأقسام",
  branches: "الفروع",
  employees: "الموظفون",
  attendance: "الحضور",
  devices: "الأجهزة",
  holidays: "العطلات",
  payrollPeriods: "فترات الرواتب",
  users: "المستخدمون والحسابات",
  shifts: "الشيفتات",
  shift_assignments: "ربط الموظفين بالشيفتات",
  attendance_rules: "قواعد الحضور",
  attendance_calculations: "حسابات الحضور",
  leave_requests: "طلبات الإجازات",
  permission_requests: "طلبات الأذونات",
  payroll_calculations: "حسابات الرواتب",
  subscriptions: "الاشتراكات",
  audit_logs: "سجلات التدقيق",
  backups: "النسخ الاحتياطية",
};
const databaseEntityTranslationKeys: Record<string, AppCopyKey> = {
  companies: "databaseCompanies",
  users: "databaseUsers",
  employees: "databaseEmployees",
  departments: "databaseDepartments",
  branches: "databaseBranches",
  shifts: "databaseShifts",
  shift_assignments: "databaseShiftAssignments",
  attendance_rules: "databaseAttendanceRules",
  attendance_calculations: "databaseAttendanceCalculations",
  attendance: "databaseAttendance",
  holidays: "databaseHolidays",
  leave_requests: "databaseLeaveRequests",
  permission_requests: "databasePermissionRequests",
  payroll_periods: "databasePayrollPeriods",
  payroll_calculations: "databasePayrollCalculations",
  devices: "databaseDevices",
  subscriptions: "databaseSubscriptions",
  permissions: "databasePermissions",
  audit_logs: "databaseAuditLogs",
  backups: "databaseBackups",
};
const databaseGroupTranslationKeys: Record<string, AppCopyKey> = {
  "Core organization": "databaseCoreOrganization",
  "Scheduling and attendance": "databaseSchedulingAttendance",
  "Leave, payroll and platform support": "databaseLeavePayrollSupport",
};
const databaseColumnTranslationKeys: Record<string, AppCopyKey> = {
  id: "databaseId",
  company_id: "databaseCompanyId",
  company_name: "databaseCompanyName",
  name: "databaseName",
  name_ar: "databaseArabicName",
  description: "databaseDescription",
  manager_id: "databaseManager",
  default_schedule_id: "databaseDefaultSchedule",
  active: "databaseStatus",
  created_at: "databaseCreatedAt",
  updated_at: "databaseUpdatedAt",
  employee_number: "databaseEmployeeNumber",
  first_name: "databaseFirstName",
  last_name: "databaseLastName",
  email: "databaseEmail",
  phone: "databasePhone",
  department_id: "databaseDepartment",
  branch_id: "databaseBranch",
  status: "databaseStatus",
  role: "databaseRole",
  joined_on: "databaseJoinedOn",
  city: "databaseCity",
  gps_enabled: "databaseGpsEnabled",
  latitude: "databaseLatitude",
  longitude: "databaseLongitude",
  radius_meters: "databaseRadiusMeters",
};
const databaseStatusValues = new Set([
  "active",
  "inactive",
  "archived",
  "pending",
  "finalized",
  "draft",
  "connected",
  "disconnected",
]);
const databaseActionValues = new Set([
  "created",
  "updated",
  "support_updated",
  "archived",
  "database_view",
  "database_export",
  "database_support_updated",
]);
const databaseStatusTranslationKeys: Record<string, AppCopyKey> = {
  active: "databaseStatusActive",
  inactive: "databaseStatusInactive",
  archived: "databaseStatusArchived",
  pending: "databaseStatusPending",
  finalized: "databaseStatusFinalized",
  draft: "databaseStatusDraft",
  connected: "databaseStatusConnected",
  disconnected: "databaseStatusDisconnected",
};
const databaseActionTranslationKeys: Record<string, AppCopyKey> = {
  created: "databaseActionCreated",
  updated: "databaseActionUpdated",
  support_updated: "databaseActionSupport_updated",
  archived: "databaseActionArchived",
  database_view: "databaseActionDatabase_view",
  database_export: "databaseActionDatabase_export",
  database_support_updated: "databaseActionDatabase_support_updated",
  database_deleted: "databaseActionDatabase_deleted",
};
const databaseGroups = [
  {
    label: "Core organization",
    keys: ["companies", "users", "employees", "departments", "branches"],
  },
  {
    label: "Scheduling and attendance",
    keys: [
      "shifts",
      "shift_assignments",
      "attendance_rules",
      "attendance_calculations",
      "attendance",
      "holidays",
    ],
  },
  {
    label: "Leave, payroll and platform support",
    keys: [
      "leave_requests",
      "permission_requests",
      "payroll_periods",
      "payroll_calculations",
      "devices",
      "subscriptions",
      "permissions",
      "audit_logs",
      "backups",
    ],
  },
];

function DatabaseAdministration() {
  const { locale, t } = useI18n();
  const auth = useAuth();
  const [location, setLocation] = useLocation();
  const [entities, setEntities] = useState<AdminEntity[]>([]);
  const [entity, setEntity] = useState(() => {
    const query = new URLSearchParams(location.split("?")[1] ?? "");
    return query.get("entity") ?? "";
  });
  const [companyFilter, setCompanyFilter] = useState("");
  const [companies, setCompanies] = useState<DatabaseCompany[]>([]);
  const [data, setData] = useState<AdminData | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [editValues, setEditValues] = useState<Record<string, unknown>>({});
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<AdminHistoryEntry[] | null>(null);
  const [historyTitle, setHistoryTitle] = useState("");
  if (auth.account.accountType !== "platform_owner") {
    return <WorkspaceState kind="unauthorized" />;
  }
  const loadEntities = async () => {
    const [result, summary] = await Promise.all([
      authRequest<AdminEntity[]>("/api/platform/database/entities"),
      authRequest<PlatformSummary>("/api/platform/summary"),
    ]);
    setEntities(result);
    setCompanies(
      summary.companies.map((company) => ({
        id: company.id,
        name: company.name,
        slug: company.slug,
        active: company.active,
      })),
    );
    if (!entity && result[0]) setEntity(result[0].key);
  };
  const load = async () => {
    if (!entity) return;
    setLoading(true);
    setError("");
    try {
      setData(
        await (() => {
          const entityDefinition = entities.find((item) => item.key === entity);
          return authRequest<AdminDataResponse>(
          `/api/platform/database/${entity}?search=${encodeURIComponent(search)}&companyId=${encodeURIComponent(companyFilter)}`,
          ).then((result) => ({
            ...result,
            key: result.key ?? result.entity ?? entity,
            supportEditable:
              result.supportEditable ?? entityDefinition?.supportEditable ?? [],
            canArchive:
              result.canArchive ?? entityDefinition?.canArchive ?? false,
            canDelete:
              result.canDelete ?? entityDefinition?.canDelete ?? false,
          }));
        })(),
      );
    } catch (cause) {
      setError(t("couldNotLoadData"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void loadEntities().catch(() =>
      setError(t("couldNotLoadDatabaseEntities")),
    );
  }, []);
  useEffect(() => {
    if (entity) void load();
  }, [entity, companyFilter]);
  const usesSupportEditor =
    Boolean(data?.supportEditable?.length) &&
    supportedDatabaseActions.has(data?.key ?? "");
  const editFields = data
    ? usesSupportEditor
      ? data.supportEditable ?? []
      : data.editable ?? []
    : [];
  const exportData = async () => {
    setPending("export");
    try {
      const response = await fetch(
        `/api/platform/database/${entity}/export?companyId=${encodeURIComponent(companyFilter)}`,
        {
        credentials: "include",
        },
      );
      if (!response.ok) throw new Error(t("exportFailed"));
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${entity}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(t("exportFailed"));
    } finally {
      setPending("");
    }
  };
  const openEdit = (row: Record<string, unknown>) => {
    setEditing(row);
    setEditValues(
      Object.fromEntries(
        editFields.map((key) => [key, row[key] ?? ""]),
      ),
    );
  };
  const saveEdit = async () => {
    if (!editing || !data) return;
    setPending("save");
    try {
      const endpoint = usesSupportEditor
        ? `/api/platform/database/${data.key}/${editing.id}/support`
        : `/api/platform/database/${data.key}/${editing.id}`;
      await authRequest(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ values: editValues }),
      });
      setEditing(null);
      await load();
    } catch (cause) {
      setError(
        t(
          usesSupportEditor
            ? "couldNotSaveSupportedChanges"
            : "couldNotSaveRecord",
        ),
      );
    } finally {
      setPending("");
    }
  };
  const archive = async (row: Record<string, unknown>) => {
    if (!data || !window.confirm(t("archiveConfirmation"))) {
      return;
    }
    setPending("archive");
    try {
      await authRequest(`/api/platform/database/${data.key}/${row.id}/archive`, {
        method: "POST",
      });
      await load();
    } catch (cause) {
      setError(t("recordCouldNotBeArchived"));
    } finally {
      setPending("");
    }
  };
  const deleteRecord = async (row: Record<string, unknown>) => {
    if (
      !data ||
      !window.confirm(
        `${t("deleteRecordConfirmation")}\n\n${t(
          databaseEntityTranslationKeys[data.key] ?? "databaseEntity",
        )}: ${String(row.name ?? row.full_name ?? row.first_name ?? row.id)}`,
      )
    ) {
      return;
    }
    setPending("delete");
    setError("");
    try {
      await authRequest(`/api/platform/database/${data.key}/${row.id}`, {
        method: "DELETE",
      });
      toast.success(t("recordDeleted"));
      await load();
    } catch (cause) {
      setError(apiErrorMessage(cause, t("recordCouldNotBeDeleted")));
    } finally {
      setPending("");
    }
  };
  const openHistory = async (row: Record<string, unknown>) => {
    if (!data) return;
    setPending("history");
    try {
      const result = await authRequest<{ history: AdminHistoryEntry[]; label: string }>(
        `/api/platform/database/${data.key}/${row.id}/history`,
      );
      setHistory(result.history);
      setHistoryTitle(
        `${t(databaseEntityTranslationKeys[data.key] ?? "databaseEntity")} · ${String(row.name ?? row.first_name ?? row.id)}`,
      );
    } catch (cause) {
      setError(t("couldNotLoadRecordHistory"));
    } finally {
      setPending("");
    }
  };
  const visibleColumns = data ? safeDatabaseColumns(data.columns) : [];
  const supportsDatabaseActions = data
    ? supportedDatabaseActions.has(data.key)
    : false;
  const databaseValue = (key: string, value: unknown) => {
    if (typeof value === "boolean") return value ? t("databaseYes") : t("databaseNo");
    if (typeof value === "string" && databaseStatusTranslationKeys[value]) {
      return t(databaseStatusTranslationKeys[value]);
    }
    return String(value ?? "—");
  };
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("platformOwnerOnly")}
        title={t("databaseAdministration")}
         detail={t("databaseAdminDetail")}
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {[
           [t("databaseCompanies"), companies.length],
           [t("databaseActiveCompanies"), companies.filter((company) => company.active).length],
           [t("databaseVisibleRecords"), data?.rows.length ?? 0],
        ].map(([label, value]) => (
          <Card className="p-4" key={String(label)}>
            <p className="text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
          </Card>
        ))}
      </div>
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {databaseGroups.map((group) => {
           const available = group.keys.filter((key) =>
            entities.some((item) => item.key === key),
          );
          if (!available.length) return null;
          return (
             <Card className="p-4" key={group.label}>
               <p className="text-sm font-semibold">
                 {t(databaseGroupTranslationKeys[group.label])}
               </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {available.map((key) => (
                  <button
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-primary hover:text-primary",
                      entity === key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground",
                    )}
                    key={key}
                    onClick={() => setEntity(key)}
                  >
                     {databaseEntityTranslationKeys[key]
                       ? t(databaseEntityTranslationKeys[key])
                       : entities.find((item) => item.key === key)?.label ?? key}
                  </button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
      <Card className="overflow-hidden">
        <div className="border-b border-border p-5">
           <p className="text-xs font-bold uppercase tracking-[.14em] text-primary">
             {t("dataExplorer")}
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_1.25fr_auto_auto] lg:items-end">
            <label className="text-sm font-semibold">
              {t("databaseEntity")}
              <select
                className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
                value={entity}
                onChange={(event) => setEntity(event.target.value)}
              >
                {entities.map((item) => (
                  <option key={item.key} value={item.key}>
                     {databaseEntityTranslationKeys[item.key]
                       ? t(databaseEntityTranslationKeys[item.key])
                       : item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
               {t("companyContext")}
              <select
                className="mt-2 h-11 w-full rounded-lg border border-input bg-background px-3 font-normal"
                value={companyFilter}
                onChange={(event) => setCompanyFilter(event.target.value)}
              >
                 <option value="">{t("allCompanies")}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              {t("filterRecords")}
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 text-muted-foreground rtl:left-auto rtl:right-3" size={16} />
                <input
                  className="h-11 w-full rounded-lg border border-input bg-background px-9 font-normal"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void load();
                  }}
                  placeholder={t("searchValues")}
                />
              </div>
            </label>
          <Button
            variant="outline"
            onClick={() => void load()}
            disabled={pending !== "" || loading}
          >
            {t("refresh")}
          </Button>
          <Button
            variant="outline"
            onClick={() => void exportData()}
            disabled={pending !== "" || !data}
          >
            <Download size={14} />
            {pending === "export" ? "…" : t("exportExcel")}
          </Button>
          </div>
        </div>
        {error && (
          <div className="m-5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-5 py-3 text-xs text-muted-foreground">
          <Eye size={14} />
          {t("inspectionOnly")}
        </div>
        {loading ? (
          <div className="p-5">
            <Skeleton className="h-64" />
            <p className="mt-3 text-center text-sm text-muted-foreground">
              {t("loadingData")}
            </p>
          </div>
        ) : data && data.rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm rtl:text-right">
              <thead className="bg-muted/60">
                <tr>
                   {visibleColumns.map((column) => (
                     <th className="p-3 font-semibold" key={column}>
                       {databaseColumnTranslationKeys[column]
                         ? t(databaseColumnTranslationKeys[column])
                         : locale === "ar"
                           ? t("databaseDataField")
                           : column.replaceAll("_", " ")}
                    </th>
                  ))}
                    {(supportsDatabaseActions ||
                      editFields.length ||
                      data.canArchive ||
                      data.canDelete) && (
                    <th className="p-3 font-semibold">{t("actions")}</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.rows.map((row) => (
                  <tr key={String(row.id)}>
                     {visibleColumns.map((column) => (
                      <td
                        className="max-w-[240px] truncate p-3 align-top"
                        key={column}
                      >
                        {column === "company_name" && row.company_id ? (
                          <button
                            className="font-semibold text-primary hover:underline"
                            onClick={() =>
                              setLocation(
                                `/platform/companies/${encodeURIComponent(String(row.company_id))}`,
                              )
                            }
                          >
                           {String(row[column] ?? t("unknownCompany"))}
                          </button>
                        ) : typeof row[column] === "object"
                          ? JSON.stringify(row[column])
                          : databaseValue(column, row[column])}
                      </td>
                    ))}
                      {(supportsDatabaseActions ||
                        editFields.length ||
                        data.canArchive ||
                        data.canDelete) && (
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                           {supportsDatabaseActions ? (
                             <>
                               <Button variant="outline" onClick={() => setDetails(row)}>
                                  {t("viewDetails")}
                               </Button>
                               <Button variant="outline" onClick={() => void openHistory(row)}>
                                 {t("history")}
                               </Button>
                             </>
                           ) : null}
                          {editFields.length ? (
                            <Button variant="outline" onClick={() => openEdit(row)}>
                              {t("edit")}
                            </Button>
                          ) : null}
                          {data.canArchive ? (
                            <Button
                              variant="quiet"
                              disabled={pending !== ""}
                              onClick={() => void archive(row)}
                            >
                               {t("archive")}
                            </Button>
                          ) : null}
                          {data.canDelete ? (
                            <Button
                              variant="danger"
                              disabled={pending !== ""}
                              onClick={() => void deleteRecord(row)}
                            >
                              <Trash2 size={14} />
                              {pending === "delete" ? "…" : t("deleteRecord")}
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={t("noRecordsFound")}
            detail={t("tryAnotherEntityOrFilter")}
          />
        )}
      </Card>
      {editing && data && (
        <Modal
           title={`${t("editRecord")} · ${t(databaseEntityTranslationKeys[data.key] ?? "databaseEntity")}`}
          onClose={() => setEditing(null)}
          className="max-w-2xl"
        >
          <p className="mb-4 text-sm text-muted-foreground">
             {t(usesSupportEditor ? "supportEditHint" : "databaseEditHint")}
          </p>
          <div className="space-y-3">
            {editFields.map((key) => (
              <Field
                key={key}
                 label={databaseColumnTranslationKeys[key] ? t(databaseColumnTranslationKeys[key]) : key.replaceAll("_", " ")}
                value={String(editValues[key] ?? "")}
                onChange={(value) =>
                  setEditValues((current) => ({ ...current, [key]: value }))
                }
              />
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="quiet" onClick={() => setEditing(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={() => void saveEdit()} disabled={pending !== ""}>
              {pending === "save" ? "…" : t("saveChanges")}
            </Button>
          </div>
        </Modal>
      )}
      {details && data && (
        <Modal
           title={`${t("recordDetails")} · ${t(databaseEntityTranslationKeys[data.key] ?? "databaseEntity")}`}
          onClose={() => setDetails(null)}
          className="max-w-2xl"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleColumns.map((key) => (
              <div className="rounded-lg border border-border p-3" key={key}>
                <p className="text-xs font-bold uppercase tracking-[.08em] text-muted-foreground">
                {databaseColumnTranslationKeys[key]
                  ? t(databaseColumnTranslationKeys[key])
                  : locale === "ar"
                    ? t("databaseDataField")
                    : key.replaceAll("_", " ")}
                </p>
                <p className="mt-1 break-words text-sm">
                  {details[key] && typeof details[key] === "object"
                    ? JSON.stringify(details[key])
                    : databaseValue(key, details[key])}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <Button variant="quiet" onClick={() => setDetails(null)}>
              {t("closeDialog")}
            </Button>
          </div>
        </Modal>
      )}
      {history && (
        <Modal title={historyTitle} onClose={() => setHistory(null)} className="max-w-3xl">
          <div className="space-y-4">
            {history.length ? history.map((entry) => (
              <div className="rounded-lg border border-border p-4" key={entry.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {databaseActionTranslationKeys[entry.action]
                        ? t(databaseActionTranslationKeys[entry.action])
                        : t("databaseUnknownAction")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.actor?.fullName ??
                        (entry.actorType === "platform_owner"
                          ? t("databasePlatformOwner")
                          : t("databaseSystem"))}
                      {" · "}
                      {entry.actor?.displayRole === "platform_owner"
                        ? t("databaseRolePlatformOwner")
                        : entry.actor?.displayRole ?? t("databaseSystem")}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{date(entry.createdAt)}</p>
                </div>
                {(entry.before || entry.after) && (
                  <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                     <div>
                       <p className="mb-1 font-semibold text-muted-foreground">{t("beforeValue")}</p>
                       <pre className="overflow-auto rounded-md bg-muted p-3">{JSON.stringify(safeHistoryDisplayValue(entry.before), null, 2)}</pre>
                     </div>
                     <div>
                       <p className="mb-1 font-semibold text-muted-foreground">{t("afterValue")}</p>
                       <pre className="overflow-auto rounded-md bg-primary/5 p-3">{JSON.stringify(safeHistoryDisplayValue(entry.after), null, 2)}</pre>
                     </div>
                  </div>
                )}
                {entry.metadata && (
                  <p className="mt-2 text-xs text-muted-foreground">
                     {t("changedFields")}: {String(entry.metadata.fields ?? "—")}
                  </p>
                )}
              </div>
            )) : <Empty title={t("noHistoryFound")} detail={t("noHistoryDetail")} />}
          </div>
        </Modal>
      )}
    </div>
  );
}

function PlatformAccountSettings() {
  const { t } = useI18n();
  const auth = useAuth();
  const [fullName, setFullName] = useState(auth.account.fullName);
  const [username, setUsername] = useState(auth.account.username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);
  if (auth.account.accountType !== "platform_owner")
    return <WorkspaceState kind="unauthorized" />;
  const save = async () => {
    setPending(true);
    try {
      await authRequest("/api/platform/account", {
        method: "PATCH",
        body: JSON.stringify({
          fullName,
          username,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      setCurrentPassword("");
      setNewPassword("");
      toast.success(t("accountSettingsUpdated"));
    } catch (cause) {
      toast.error(t("couldNotUpdateAccountSettings"));
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("platformOwnerOnly")}
        title={t("accountSettings")}
        detail={t("accountSettingsDetail")}
      />
      <Card className="max-w-2xl p-5">
        <div className="space-y-4">
          <Field
            label={t("fullName")}
            value={fullName}
            onChange={setFullName}
          />
          <Field
            label={t("phoneLoginUsername")}
            value={username}
            onChange={setUsername}
          />
          <div className="border-t border-border pt-4">
            <h2 className="font-semibold">{t("changePassword")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("passwordChangeHint")}
            </p>
            <div className="mt-3 space-y-3">
              <Field
                label={t("currentPassword")}
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
              />
              <Field
                label={t("newPassword")}
                type="password"
                value={newPassword}
                onChange={setNewPassword}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => void save()} disabled={pending}>
              {pending ? "…" : t("saveAccountSettings")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Accounts() {
  const { locale } = useI18n();
  const workspace = useGetWorkspace();
  const [accounts, setAccounts] = useState<AuthAccount[]>([]);
  const [permissions, setPermissions] = useState<
    Array<{ key: string; label: string; description?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    primaryPhone?: string;
    password?: string;
  }>({});
  const [form, setForm] = useState({
    fullName: "",
    primaryPhone: "",
    displayRole: "HR",
    password: "",
    permissions: [] as string[],
  });
  const [editingAccount, setEditingAccount] = useState<AuthAccount | null>(
    null,
  );
  const [editForm, setEditForm] = useState({
    fullName: "",
    primaryPhone: "",
    displayRole: "",
    password: "",
    active: true,
    permissions: [] as string[],
  });
  const load = async () => {
    setLoading(true);
    try {
      const [accountResult, permissionResult] = await Promise.all([
        authRequest<AuthAccount[]>("/api/auth/accounts"),
        authRequest<
          Array<{ key: string; label: string; description?: string }>
        >("/api/auth/permissions"),
      ]);
      setAccounts(accountResult);
      setPermissions(permissionResult);
    } catch {
      toast.error(authLabel(locale, "loadFailed"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldErrors({});
    if (form.fullName.trim().length < 1) {
      setFieldErrors({ fullName: authLabel(locale, "employeeNameInvalid") });
      return;
    }
    if (!/^\+?[0-9 ()-]{7,20}$/.test(form.primaryPhone.trim())) {
      setFieldErrors({ primaryPhone: authLabel(locale, "phoneInvalid") });
      return;
    }
    if (form.password && form.password.length < 6) {
      setFieldErrors({ password: authLabel(locale, "passwordTooShort") });
      return;
    }
    setSaving(true);
    try {
      const result = await authRequest<{
        account: AuthAccount;
      }>("/api/auth/accounts/staff", {
        method: "POST",
        body: JSON.stringify({ ...form, password: form.password || undefined }),
      });
      setAccounts((current) => [...current, result.account]);
      setForm({
        fullName: "",
        primaryPhone: "",
        displayRole: "HR",
        password: "",
        permissions: [],
      });
      setFieldErrors({});
      toast.success(authLabel(locale, "accountCreated"));
    } catch (error) {
      const validationError = accountValidationError(locale, error);
      if (validationError) {
        setFieldErrors({ [validationError.field]: validationError.message });
        return;
      }
      toast.error(authLabel(locale, "createFailed"));
    } finally {
      setSaving(false);
    }
  };
  const selectAccount = (account: AuthAccount) => {
    setEditingAccount(account);
    setEditForm({
      fullName: account.fullName,
      primaryPhone: account.primaryPhone || account.username,
      displayRole: account.displayRole,
      password: "",
      active: account.active,
      permissions: [...account.permissions],
    });
  };
  const saveAccount = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingAccount) return;
    setFieldErrors({});
    if (editForm.fullName.trim().length < 1) {
      setFieldErrors({ fullName: authLabel(locale, "employeeNameInvalid") });
      return;
    }
    if (!/^\+?[0-9 ()-]{7,20}$/.test(editForm.primaryPhone.trim())) {
      setFieldErrors({ primaryPhone: authLabel(locale, "phoneInvalid") });
      return;
    }
    if (editForm.password && editForm.password.length < 6) {
      setFieldErrors({ password: authLabel(locale, "passwordTooShort") });
      return;
    }
    setSaving(true);
    try {
      const result = await authRequest<{ account: AuthAccount }>(
        `/api/auth/accounts/${editingAccount.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            fullName: editForm.fullName,
            primaryPhone: editForm.primaryPhone,
            displayRole: editForm.displayRole,
            active: editForm.active,
            permissions: editForm.permissions,
            ...(editForm.password ? { password: editForm.password } : {}),
          }),
        },
      );
      setAccounts((current) =>
        current.map((account) =>
          account.id === result.account.id ? result.account : account,
        ),
      );
      setEditingAccount(null);
      setFieldErrors({});
      toast.success(authLabel(locale, "accountUpdated"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : authLabel(locale, "accountUpdateFailed"),
      );
    } finally {
      setSaving(false);
    }
  };
  const allPermissionsSelected =
    permissions.length > 0 &&
    permissions.every((permission) =>
      form.permissions.includes(permission.key),
    );
  const allEditPermissionsSelected =
    permissions.length > 0 &&
    permissions.every((permission) =>
      editForm.permissions.includes(permission.key),
    );
  if (workspace.data?.role !== "company_owner")
    return <WorkspaceState kind="unauthorized" />;
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={authLabel(locale, "staffAccounts")}
        title={authLabel(locale, "accountManagement")}
        detail={authLabel(locale, "managementDetail")}
        action={
          <Button variant="outline" onClick={() => void load()}>
            <RefreshCw size={15} />
            {tSafe(locale, "refresh")}
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <Card>
          <div className="border-b border-border p-5">
            <h2 className="font-display text-lg font-semibold">
              {authLabel(locale, "createStaff")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {authLabel(locale, "managementDetail")}
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4 p-5">
            <Field
              label={authLabel(locale, "employeeName")}
              value={form.fullName}
              onChange={(value) => {
                setFieldErrors((current) => ({
                  ...current,
                  fullName: undefined,
                }));
                setForm({ ...form, fullName: value });
              }}
              error={fieldErrors.fullName}
              required
            />
            <Field
              label={authLabel(locale, "phoneNumber")}
              type="tel"
              value={form.primaryPhone}
              onChange={(value) => {
                setFieldErrors((current) => ({
                  ...current,
                  primaryPhone: undefined,
                }));
                setForm({ ...form, primaryPhone: value });
              }}
              error={fieldErrors.primaryPhone}
              required
            />
            <Field
              label={authLabel(locale, "role")}
              value={form.displayRole}
              onChange={(value) => setForm({ ...form, displayRole: value })}
              required
            />
            <Field
              label={authLabel(locale, "password")}
              type="password"
              value={form.password}
              onChange={(value) => {
                setFieldErrors((current) => ({
                  ...current,
                  password: undefined,
                }));
                setForm({ ...form, password: value });
              }}
              error={fieldErrors.password}
              required
            />
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">
                  {authLabel(locale, "permissions")}
                </p>
                <Button
                  type="button"
                  variant="quiet"
                  className="px-2 py-1 text-xs"
                  disabled={permissions.length === 0}
                  onClick={() =>
                    setForm({
                      ...form,
                      permissions: allPermissionsSelected
                        ? []
                        : permissions.map((permission) => permission.key),
                    })
                  }
                >
                  {authLabel(
                    locale,
                    allPermissionsSelected ? "deselectAll" : "selectAll",
                  )}
                </Button>
              </div>
              <div className="mt-2 max-h-56 space-y-2 overflow-auto rounded-lg border border-border p-3">
                {permissions.map((permission) => (
                  <label
                    className="flex items-start gap-2 text-sm"
                    key={permission.key}
                  >
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(permission.key)}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          permissions: event.target.checked
                            ? [...form.permissions, permission.key]
                            : form.permissions.filter(
                                (key) => key !== permission.key,
                              ),
                        })
                      }
                    />
                    <span>
                      {permissionLabel(locale, permission)}
                      {permissionDescription(locale, permission) && (
                        <span className="block text-xs text-muted-foreground">
                          {permissionDescription(locale, permission)}
                        </span>
                      )}
                      <span className="block text-xs text-muted-foreground">
                        {permission.key}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              <UserPlus size={15} />
              {saving
                ? authLabel(locale, "signingIn")
                : authLabel(locale, "createStaff")}
            </Button>
          </form>
        </Card>
        <Card>
          <div className="border-b border-border p-5">
            <h2 className="font-display text-lg font-semibold">
              {authLabel(locale, "staffAccounts")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading
                ? authLabel(locale, "loading")
                : authLabel(locale, "accountsCount").replace(
                    "{count}",
                    String(accounts.length),
                  )}
            </p>
          </div>
          {loading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : accounts.length ? (
            <div className="divide-y divide-border">
              {accounts.map((account) => (
                <div
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                  key={account.id}
                >
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      {account.fullName || account.username}
                      <Badge tone={account.active ? "good" : "neutral"}>
                        {account.active
                          ? authLabel(locale, "active")
                          : authLabel(locale, "inactive")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {account.primaryPhone || account.username} ·{" "}
                      {account.displayRole} · {account.permissions.length}{" "}
                      {authLabel(locale, "permissionsCount")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => selectAccount(account)}
                    >
                      <Eye size={15} />
                      {authLabel(locale, "viewAccount")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => selectAccount(account)}
                    >
                      <ShieldCheck size={15} />
                      {authLabel(locale, "editAccount")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title={authLabel(locale, "staffAccounts")}
              detail={
                locale === "ar"
                  ? "لا توجد حسابات موظفين بعد."
                  : "No staff accounts yet."
              }
            />
          )}
        </Card>
      </div>
      {editingAccount && (
        <Modal
          title={authLabel(locale, "editAccount")}
          onClose={() => {
            setEditingAccount(null);
            setFieldErrors({});
          }}
          className="max-w-2xl"
        >
          <form onSubmit={saveAccount} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={authLabel(locale, "employeeName")}
                value={editForm.fullName}
                onChange={(value) =>
                  setEditForm({ ...editForm, fullName: value })
                }
                error={fieldErrors.fullName}
                required
              />
              <Field
                label={authLabel(locale, "phoneNumber")}
                type="tel"
                value={editForm.primaryPhone}
                onChange={(value) =>
                  setEditForm({ ...editForm, primaryPhone: value })
                }
                error={fieldErrors.primaryPhone}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {authLabel(locale, "loginUsername")}:{" "}
              {editForm.primaryPhone || editingAccount.username}
            </p>
            <Field
              label={authLabel(locale, "role")}
              value={editForm.displayRole}
              onChange={(value) =>
                setEditForm({ ...editForm, displayRole: value })
              }
              required
            />
            <Field
              label={authLabel(locale, "newPassword")}
              type="password"
              value={editForm.password}
              onChange={(value) =>
                setEditForm({ ...editForm, password: value })
              }
              error={fieldErrors.password}
              placeholder={authLabel(locale, "optional")}
            />
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={editForm.active}
                onChange={(event) =>
                  setEditForm({ ...editForm, active: event.target.checked })
                }
              />
              {authLabel(locale, "accountStatus")}:{" "}
              {editForm.active
                ? authLabel(locale, "active")
                : authLabel(locale, "inactive")}
            </label>
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">
                  {authLabel(locale, "permissions")}
                </p>
                <Button
                  type="button"
                  variant="quiet"
                  className="px-2 py-1 text-xs"
                  disabled={permissions.length === 0}
                  onClick={() =>
                    setEditForm({
                      ...editForm,
                      permissions: allEditPermissionsSelected
                        ? []
                        : permissions.map((permission) => permission.key),
                    })
                  }
                >
                  {authLabel(
                    locale,
                    allEditPermissionsSelected ? "deselectAll" : "selectAll",
                  )}
                </Button>
              </div>
              <div className="mt-2 max-h-56 space-y-2 overflow-auto rounded-lg border border-border p-3">
                {permissions.map((permission) => (
                  <label
                    className="flex items-start gap-2 text-sm"
                    key={`edit-${permission.key}`}
                  >
                    <input
                      type="checkbox"
                      checked={editForm.permissions.includes(permission.key)}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          permissions: event.target.checked
                            ? [...editForm.permissions, permission.key]
                            : editForm.permissions.filter(
                                (key) => key !== permission.key,
                              ),
                        })
                      }
                    />
                    <span>
                      {permissionLabel(locale, permission)}
                      {permissionDescription(locale, permission) && (
                        <span className="block text-xs text-muted-foreground">
                          {permissionDescription(locale, permission)}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="quiet"
                onClick={() => setEditingAccount(null)}
              >
                {tSafe(locale, "refresh") === "Refresh" ? "Cancel" : "إلغاء"}
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "…" : authLabel(locale, "saveAccount")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function tSafe(locale: Locale, key: "refresh") {
  return locale === "ar" ? "تحديث" : "Refresh";
}

function Devices() {
  const { t } = useI18n();
  const workspace = useGetWorkspace();
  const canAdminister =
    workspace.data?.role === "company_owner" ||
    workspace.data?.role === "platform_owner";
  const qc = useQueryClient();
  const q = useListDevices();
  const providers = useListBiometricProviders();
  const branches = useListBranches();
  const employees = useListEmployees({ status: "active" });
  const locations = useListAttendanceLocations();
  const create = useCreateDevice();
  const updateDevice = useUpdateDevice();
  const sync = useSyncDevice();
  const testConnection = useTestDeviceConnection();
  const createMapping = useCreateDeviceMapping();
  const deleteMapping = useDeleteDeviceMapping();
  const createLocation = useCreateAttendanceLocation();
  const updateLocation = useUpdateAttendanceLocation();
  const [show, setShow] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [registrationKey, setRegistrationKey] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [form, setForm] = useState({
    name: "",
    manufacturer: "",
    model: "",
    branchId: "",
    adapterKey: "",
    connectionType: "unknown",
    host: "",
    port: "",
    deviceIdentifier: "",
  });
  const [mappingForm, setMappingForm] = useState({
    employeeId: "",
    deviceEmployeeId: "",
  });
  const [locationForm, setLocationForm] = useState({
    id: "",
    name: "",
    latitude: "",
    longitude: "",
    radiusMeters: "100",
    active: true,
  });
  const [showLocation, setShowLocation] = useState(false);
  const activeDevice = q.data?.find(
    (device: any) => device.id === selectedDeviceId,
  );
  const selectedMappings = useListDeviceMappings(selectedDeviceId, {
    query: {
      enabled: Boolean(selectedDeviceId),
      queryKey: getListDeviceMappingsQueryKey(selectedDeviceId),
    },
  });
  const selectedEvents = useListBiometricDeviceEvents(selectedDeviceId, {
    query: {
      enabled: Boolean(selectedDeviceId),
      queryKey: getListBiometricDeviceEventsQueryKey(selectedDeviceId),
    },
  });
  function submit(e: FormEvent) {
    e.preventDefault();
    const data = {
      ...form,
      connectionType: form.connectionType as any,
      port: form.port ? Number(form.port) : undefined,
      host: form.host || undefined,
      adapterKey: form.adapterKey || undefined,
      deviceIdentifier: form.deviceIdentifier || undefined,
    };
    create.mutate(
      { data: data as any },
      {
        onSuccess: (createdDevice: any) => {
          toast.success(t("deviceAdded"));
          setShow(false);
          if (createdDevice.registrationKey) {
            setRegistrationKey(createdDevice.registrationKey);
          }
          setForm({
            name: "",
            manufacturer: "",
            model: "",
            branchId: "",
            adapterKey: "",
            connectionType: "unknown",
            host: "",
            port: "",
            deviceIdentifier: "",
          });
          qc.invalidateQueries({ queryKey: getListDevicesQueryKey() });
        },
        onError: () => toast.error(t("deviceAddFailed")),
      },
    );
  }
  function submitMapping(e: FormEvent) {
    e.preventDefault();
    if (!selectedDeviceId) return;
    createMapping.mutate(
      { deviceId: selectedDeviceId, data: mappingForm },
      {
        onSuccess: () => {
          toast.success(t("employeeMapped"));
          setMappingForm({ employeeId: "", deviceEmployeeId: "" });
          qc.invalidateQueries({
            queryKey: getListDeviceMappingsQueryKey(selectedDeviceId),
          });
          qc.invalidateQueries({ queryKey: getListDevicesQueryKey() });
        },
        onError: () => toast.error(t("mappingFailed")),
      },
    );
  }
  function openLocation(location?: any) {
    setLocationForm(
      location
        ? {
            id: location.id,
            name: location.name,
            latitude: String(location.latitude),
            longitude: String(location.longitude),
            radiusMeters: String(location.radiusMeters),
            active: location.active,
          }
        : {
            id: "",
            name: "",
            latitude: "",
            longitude: "",
            radiusMeters: "100",
            active: true,
          },
    );
    setShowLocation(true);
  }
  function submitLocation(e: FormEvent) {
    e.preventDefault();
    const data = {
      name: locationForm.name.trim(),
      latitude: Number(locationForm.latitude),
      longitude: Number(locationForm.longitude),
      radiusMeters: Number(locationForm.radiusMeters),
      active: locationForm.active,
    };
    const options = {
      onSuccess: () => {
        toast.success(
          t(locationForm.id ? "locationUpdated" : "locationCreated"),
        );
        setShowLocation(false);
        qc.invalidateQueries({
          queryKey: getListAttendanceLocationsQueryKey(),
        });
      },
      onError: () => toast.error(t("locationSaveFailed")),
    };
    if (locationForm.id)
      updateLocation.mutate({ locationId: locationForm.id, data }, options);
    else createLocation.mutate({ data }, options);
  }
  if (!canAdminister) return <WorkspaceState kind="unauthorized" />;
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("connectedOperations")}
        title={t("biometricDevices")}
        detail={t("devicesDetail")}
        action={
          <Button onClick={() => setShow(true)}>
            <Plus size={16} />
            {t("addDevice")}
          </Button>
        }
      />
      <div className="space-y-6">
        <Card>
          <div className="border-b border-border p-5">
            <h2 className="font-display text-lg font-semibold">
              {t("biometricProviders")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("biometricProvidersDetail")}
            </p>
          </div>
          {providers.isLoading ? (
            <div className="space-y-3 p-5">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : providers.isError ? (
            <ErrorState retry={() => providers.refetch()} />
          ) : providers.data?.length ? (
            <div className="divide-y divide-border">
              {providers.data.map((provider: any) => (
                <div
                  className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
                  key={provider.key}
                >
                  <div>
                    <div className="font-semibold">{provider.name}</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {provider.description}
                    </p>
                    {provider.key === "mock" && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("providerMockNote")}
                      </p>
                    )}
                  </div>
                  <Badge tone={provider.available ? "good" : "neutral"}>
                    {provider.available
                      ? t("providerAvailable")
                      : t("providerUnavailable")}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title={t("providerUnavailable")}
              detail={t("biometricProvidersDetail")}
            />
          )}
        </Card>
        <Card>
          {q.isLoading ? (
            <Skeleton className="m-5 h-48" />
          ) : q.isError ? (
            <ErrorState retry={() => q.refetch()} />
          ) : q.data?.length ? (
            <div className="divide-y divide-border">
              {q.data.map((d: any) => (
                <div className="p-5" key={d.id}>
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex items-center gap-4">
                      <div className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
                        <Fingerprint size={21} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-semibold">
                          {deviceNameLabel(d.name, t)}
                          <Status value={d.status} />
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {manufacturerLabel(d.manufacturer, t)}{" "}
                          {modelLabel(d.model, t)} · {branchLabel(d.branch, t)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {d.integrationState === "adapter_pending"
                            ? t("adapterPendingNote")
                            : deviceNoteLabel(d.note, t) ||
                              `${t("lastSync")}: ${d.lastSync ? date(d.lastSync) : t("never")}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Status value={d.integrationState} />
                      <Button
                        variant="outline"
                        onClick={() => setEditingBranch(d)}
                      >
                        {t("editBranch")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          testConnection.mutate(
                            { deviceId: d.id },
                            {
                              onSuccess: () => {
                                toast.success(t("connectionTested"));
                                qc.invalidateQueries({
                                  queryKey: getListDevicesQueryKey(),
                                });
                              },
                              onError: () =>
                                toast.error(t("connectionTestFailed")),
                            },
                          )
                        }
                      >
                        {t("testConnection")}
                      </Button>
                      <Button
                        variant="outline"
                        aria-label={`${t("sync")} ${deviceNameLabel(d.name, t)}`}
                        disabled={
                          d.integrationState === "adapter_pending" ||
                          sync.isPending
                        }
                        onClick={() =>
                          sync.mutate(
                            { deviceId: d.id },
                            {
                              onSuccess: () => {
                                toast.success(t("syncRequested"));
                                qc.invalidateQueries({
                                  queryKey: getListDevicesQueryKey(),
                                });
                              },
                              onError: () => toast.error(t("syncUnavailable")),
                            },
                          )
                        }
                      >
                        <RefreshCw size={15} />
                        {t("sync")}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Info
                      label={t("deviceMetadata")}
                      value={`${d.manufacturer} ${d.model}`}
                    />
                    <Info
                      label={t("connection")}
                      value={`${d.connectionType || t("deviceConnectionUnknown")} · ${d.connectionState || t("connectionStateUnknown")}`}
                    />
                    <Info
                      label={t("identifier")}
                      value={d.deviceIdentifier || t("notRecorded")}
                    />
                    <Info
                      label={t("networkAddress")}
                      value={
                        d.host
                          ? `${d.host}${d.port ? `:${d.port}` : ""}`
                          : t("notRecorded")
                      }
                    />
                    <Info
                      label={t("adapter")}
                      value={d.adapterKey || t("notRecorded")}
                    />
                    <Info
                      label={t("lastHealthCheck")}
                      value={
                        d.lastHealthCheck
                          ? date(d.lastHealthCheck)
                          : t("notRecorded")
                      }
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground">
                      {d.mappedEmployeeCount || 0} {t("deviceMappings")}
                    </span>
                    <Button
                      variant="quiet"
                      onClick={() =>
                        setSelectedDeviceId(
                          selectedDeviceId === d.id ? "" : d.id,
                        )
                      }
                    >
                      {t("deviceMappings")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title={t("noDevices")}
              detail={t("addDeviceNote")}
              action={
                <Button onClick={() => setShow(true)}>
                  <Plus size={15} />
                  {t("addDevice")}
                </Button>
              }
            />
          )}
        </Card>
        {selectedDeviceId && activeDevice && (
          <Card>
            <div className="border-b border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    {t("deviceMappings")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("mappingDetail")}
                  </p>
                </div>
                <Badge>{deviceNameLabel(activeDevice.name, t)}</Badge>
              </div>
            </div>
            <form
              onSubmit={submitMapping}
              className="grid gap-3 border-b border-border p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            >
              <label className="block text-sm font-semibold">
                {t("selectEmployee")}
                <select
                  required
                  value={mappingForm.employeeId}
                  onChange={(e) =>
                    setMappingForm({
                      ...mappingForm,
                      employeeId: e.target.value,
                    })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-2 text-sm font-normal"
                >
                  <option value="">{t("selectEmployee")}</option>
                  {employees.data?.map((employee: any) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </option>
                  ))}
                </select>
              </label>
              <Field
                label={t("deviceEmployeeId")}
                required
                value={mappingForm.deviceEmployeeId}
                onChange={(value) =>
                  setMappingForm({ ...mappingForm, deviceEmployeeId: value })
                }
              />
              <Button type="submit" disabled={createMapping.isPending}>
                {createMapping.isPending ? t("saving") : t("mapEmployee")}
              </Button>
            </form>
            {selectedMappings.isLoading ? (
              <Skeleton className="m-5 h-16" />
            ) : selectedMappings.isError ? (
              <ErrorState retry={() => selectedMappings.refetch()} />
            ) : selectedMappings.data?.length ? (
              <div className="divide-y divide-border">
                {selectedMappings.data.map((mapping: any) => (
                  <div
                    className="flex items-center justify-between gap-3 p-4"
                    key={mapping.id}
                  >
                    <div>
                      <div className="font-semibold">
                        {mapping.employee.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {mapping.deviceEmployeeId}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={mapping.active ? "good" : "neutral"}>
                        {mapping.active
                          ? t("activeMapping")
                          : t("inactiveLocation")}
                      </Badge>
                      <Button
                        variant="quiet"
                        onClick={() =>
                          deleteMapping.mutate(
                            {
                              deviceId: selectedDeviceId,
                              mappingId: mapping.id,
                            },
                            {
                              onSuccess: () => {
                                toast.success(t("employeeMapped"));
                                qc.invalidateQueries({
                                  queryKey:
                                    getListDeviceMappingsQueryKey(
                                      selectedDeviceId,
                                    ),
                                });
                                qc.invalidateQueries({
                                  queryKey: getListDevicesQueryKey(),
                                });
                              },
                            },
                          )
                        }
                      >
                        {t("cancel")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                title={t("noDeviceMappings")}
                detail={t("noDeviceMappingsDetail")}
              />
            )}
          </Card>
        )}
        {selectedDeviceId && activeDevice && (
          <Card>
            <div className="border-b border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-semibold">
                    Imported punches
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Raw events received from this device, kept separate from calculated attendance.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => selectedEvents.refetch()}
                  disabled={selectedEvents.isFetching}
                >
                  <RefreshCw size={15} />
                  {t("refresh")}
                </Button>
              </div>
            </div>
            {selectedEvents.isLoading ? (
              <Skeleton className="m-5 h-20" />
            ) : selectedEvents.isError ? (
              <ErrorState retry={() => selectedEvents.refetch()} />
            ) : selectedEvents.data?.length ? (
              <div className="divide-y divide-border">
                {selectedEvents.data.map((event: any) => {
                  const mapping = selectedMappings.data?.find(
                    (item: any) => item.deviceEmployeeId === event.deviceEmployeeId,
                  );
                  return (
                    <div className="p-4" key={event.id}>
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div>
                          <div className="font-semibold">
                            {mapping?.employee?.name || `Device user ${event.deviceEmployeeId}`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {event.deviceEmployeeId} · {event.direction} · {event.eventType}
                          </div>
                        </div>
                        <div className="text-end text-xs text-muted-foreground">
                          {date(event.occurredAt)} · {time(event.occurredAt)}
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge tone={event.processingStatus === "mapped" ? "good" : "warn"}>
                          {event.processingStatus}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty
                title="No imported punches"
                detail="A real ADMS upload will appear here after the device sends attendance data."
              />
            )}
          </Card>
        )}
        <Card>
          <div className="flex items-start justify-between border-b border-border p-5">
            <div>
              <h2 className="font-display text-lg font-semibold">
                {t("attendanceLocations")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("attendanceLocationsDetail")}
              </p>
            </div>
            <Button onClick={() => openLocation()}>
              <Plus size={15} />
              {t("addLocation")}
            </Button>
          </div>
          {locations.isLoading ? (
            <Skeleton className="m-5 h-20" />
          ) : locations.isError ? (
            <ErrorState retry={() => locations.refetch()} />
          ) : locations.data?.length ? (
            <div className="divide-y divide-border">
              {locations.data.map((location: any) => (
                <div
                  className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
                  key={location.id}
                >
                  <div>
                    <div className="font-semibold">{location.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {location.latitude}, {location.longitude} ·{" "}
                      {location.radiusMeters}m
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={location.active ? "good" : "neutral"}>
                      {location.active
                        ? t("activeLocation")
                        : t("inactiveLocation")}
                    </Badge>
                    <Button
                      variant="outline"
                      onClick={() => openLocation(location)}
                    >
                      {t("editLocation")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title={t("noAttendanceLocations")}
              detail={t("noAttendanceLocationsDetail")}
              action={
                <Button onClick={() => openLocation()}>
                  <Plus size={15} />
                  {t("addLocation")}
                </Button>
              }
            />
          )}
        </Card>
      </div>
      {show && (
        <Modal title={t("addBiometricDevice")} onClose={() => setShow(false)}>
          <form onSubmit={submit} className="space-y-4">
            {[
              ["name", "deviceName"],
              ["manufacturer", "manufacturer"],
              ["model", "model"],
              ["adapterKey", "adapter"],
            ].map(([key, label]) => (
              <label key={key} className="block text-sm font-semibold">
                {t(label as AppCopyKey)}
                <input
                  required={key !== "adapterKey"}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal"
                />
              </label>
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">
                {t("connectionType")}
                <select
                  value={form.connectionType}
                  onChange={(e) =>
                    setForm({ ...form, connectionType: e.target.value })
                  }
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-2 text-sm font-normal"
                >
                  <option value="unknown">
                    {t("deviceConnectionUnknown")}
                  </option>
                  <option value="lan">{t("deviceConnectionLan")}</option>
                  <option value="http">{t("deviceConnectionHttp")}</option>
                  <option value="cloud">{t("deviceConnectionCloud")}</option>
                </select>
              </label>
              <Field
                label={t("networkAddress")}
                value={form.host}
                onChange={(value) => setForm({ ...form, host: value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("connection")}
                value={form.port}
                onChange={(value) => setForm({ ...form, port: value })}
              />
              <Field
                label={t("identifier")}
                value={form.deviceIdentifier}
                onChange={(value) =>
                  setForm({ ...form, deviceIdentifier: value })
                }
              />
            </div>
            <label className="block text-sm font-semibold">
              {t("branch")}
              <select
                required
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-2 text-sm font-normal"
              >
                <option value="">{t("selectBranch")}</option>
                {branches.data?.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {branchLabel(b.name, t)}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="quiet"
                onClick={() => setShow(false)}
              >
                {t("cancel")}
              </Button>
              <Button disabled={create.isPending} type="submit">
                {create.isPending ? t("saving") : t("addConfiguration")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {editingBranch && (
        <Modal title={t("editBranch")} onClose={() => setEditingBranch(null)}>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              updateDevice.mutate(
                {
                  deviceId: editingBranch.id,
                  data: { branchId: editingBranch.branchId },
                },
                {
                  onSuccess: () => {
                    toast.success(t("branchSaved"));
                    setEditingBranch(null);
                    qc.invalidateQueries({ queryKey: getListDevicesQueryKey() });
                  },
                  onError: (error: any) =>
                    toast.error(apiErrorMessage(error, t("couldNotSaveBranch"))),
                },
              );
            }}
          >
            <label className="block text-sm font-semibold">
              {t("branch")}
              <select
                required
                defaultValue={editingBranch.branchId}
                onChange={(event) =>
                  setEditingBranch({ ...editingBranch, branchId: event.target.value })
                }
                className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-2 text-sm font-normal"
              >
                <option value="">{t("selectBranch")}</option>
                {branches.data?.map((branch: any) => (
                  <option key={branch.id} value={branch.id}>
                    {branchLabel(branch.name, t)}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="quiet" onClick={() => setEditingBranch(null)}>{t("cancel")}</Button>
              <Button type="submit" disabled={updateDevice.isPending}>{t("saveChanges")}</Button>
            </div>
          </form>
        </Modal>
      )}
      {registrationKey && (
        <Modal
          title="ZKTeco ADMS registration key"
          onClose={() => setRegistrationKey(null)}
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm">
              Save this key now. It is shown only once and is used as the device Comm Key.
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
              <code className="min-w-0 flex-1 break-all text-sm">{registrationKey}</code>
              <Button
                variant="outline"
                onClick={() => void navigator.clipboard?.writeText(registrationKey)}
              >
                Copy
              </Button>
            </div>
            <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
              Configure the K50 Pro to use your published HTTPS host with ADMS path
              <code className="mx-1 font-semibold text-foreground">/iclock</code>.
              Keep the device ID equal to its Serial Number.
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setRegistrationKey(null)}>Done</Button>
            </div>
          </div>
        </Modal>
      )}
      {showLocation && (
        <Modal
          title={t(locationForm.id ? "editLocation" : "addLocation")}
          onClose={() => setShowLocation(false)}
        >
          <form onSubmit={submitLocation} className="space-y-4">
            <Field
              label={t("locationName")}
              required
              value={locationForm.name}
              onChange={(value) =>
                setLocationForm({ ...locationForm, name: value })
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t("latitude")}
                required
                type="number"
                value={locationForm.latitude}
                onChange={(value) =>
                  setLocationForm({ ...locationForm, latitude: value })
                }
              />
              <Field
                label={t("longitude")}
                required
                type="number"
                value={locationForm.longitude}
                onChange={(value) =>
                  setLocationForm({ ...locationForm, longitude: value })
                }
              />
            </div>
            <Field
              label={t("radiusMeters")}
              required
              type="number"
              value={locationForm.radiusMeters}
              onChange={(value) =>
                setLocationForm({ ...locationForm, radiusMeters: value })
              }
            />
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={locationForm.active}
                onChange={(e) =>
                  setLocationForm({ ...locationForm, active: e.target.checked })
                }
              />
              {locationForm.active
                ? t("activeLocation")
                : t("inactiveLocation")}
            </label>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="quiet"
                onClick={() => setShowLocation(false)}
              >
                {t("cancel")}
              </Button>
              <Button
                disabled={createLocation.isPending || updateLocation.isPending}
                type="submit"
              >
                {createLocation.isPending || updateLocation.isPending
                  ? t("saving")
                  : t("saveLocation")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Subscription() {
  const { t } = useI18n();
  const q = useGetSubscription();
  if (q.isLoading) return <Skeleton className="h-64" />;
  if (q.isError) return <ErrorState retry={() => q.refetch()} />;
  const d = q.data!;
  const pct = Math.min(
    100,
    d.employeeLimit ? (d.activeEmployees / d.employeeLimit) * 100 : 0,
  );
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("planCapacity")}
        title={t("subscriptionTitle")}
        detail={t("subscriptionDetail")}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="bg-secondary p-6 text-sidebar-foreground">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[.16em] text-sidebar-foreground/55">
                {t("currentPlan")}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold">
                {planLabel(d.planName, t)}
              </h2>
            </div>
            <Status value={d.status} />
          </div>
          <div className="mt-10 flex items-end justify-between">
            <span className="text-sm text-sidebar-foreground/60">
              {t("activeEmployees")}
            </span>
            <span className="font-mono text-sm">
              {d.activeEmployees} / {d.employeeLimit}
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-accent"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-sidebar-foreground/55">
            {Math.max(0, d.employeeLimit - d.activeEmployees)}{" "}
            {t("seatsRemaining")}
          </p>
        </Card>
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold">
            {t("includedCapabilities")}
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {d.features.map((x: string) => (
              <div
                className="flex items-center gap-2 rounded-lg bg-muted/60 p-3 text-sm"
                key={x}
              >
                <Check size={15} className="text-primary" />
                {featureLabel(x)}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-accent/25 bg-accent/10 p-4 text-sm text-primary-dark">
            {t("planChanges")}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Platform() {
  const { t, locale, setLocale } = useI18n();
  const auth = useAuth();
  const [location, setLocation] = useLocation();
  const [summary, setSummary] = useState<PlatformSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCompany, setSelectedCompany] =
    useState<PlatformCompanyDetail | null>(null);
  const [employeeLimit, setEmployeeLimit] = useState("");
  const [companyForm, setCompanyForm] = useState({
    name: "",
    address: "",
    timezone: "",
    currency: "",
  });
  const [ownerAccounts, setOwnerAccounts] = useState<AuthAccount[]>([]);
  const [companyDetails, setCompanyDetails] =
    useState<PlatformCompanyDetails | null>(null);
  const [companyBackups, setCompanyBackups] = useState<BackupSummary[]>([]);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [audit, setAudit] = useState<PlatformActivity[]>([]);
  const [saving, setSaving] = useState(false);
  if (auth.account.accountType !== "platform_owner")
    return <WorkspaceState kind="unauthorized" />;
  const companyStatusFilter = new URLSearchParams(
    location.split("?")[1]?.split("#")[0] ?? "",
  ).get("status");
  const visibleCompanies = summary?.companies.filter(
    (company) =>
      !companyStatusFilter || company.status === companyStatusFilter,
  );
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [nextSummary, nextAudit] = await Promise.all([
        authRequest<PlatformSummary>("/api/platform/summary"),
        authRequest<PlatformActivity[]>("/api/auth/audit"),
      ]);
      setSummary(nextSummary);
      setAudit(nextAudit);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load platform data.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    const hash = location.split("#")[1];
    if (!hash) return;
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [location, summary]);
  const openCompany = (company: PlatformCompanyDetail) => {
    setLocation(`/platform/companies/${encodeURIComponent(company.id)}`);
  };
  const updateCompany = async (next: {
    name?: string;
    address?: string;
    timezone?: string;
    currency?: string;
    status?: "active" | "suspended";
    employeeLimit?: number;
  }) => {
    if (!selectedCompany) return;
    setSaving(true);
    try {
      await authRequest(`/api/platform/companies/${selectedCompany.id}`, {
        method: "PATCH",
        body: JSON.stringify(next),
      });
      await load();
      const refreshed = summary?.companies.find(
        (company) => company.id === selectedCompany.id,
      );
      if (refreshed) {
        setSelectedCompany({
          ...refreshed,
          ...next,
          active: next.status ? next.status === "active" : refreshed.active,
        });
      }
      toast.success(locale === "ar" ? "تم تحديث الشركة" : "Company updated");
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not update company.",
      );
    } finally {
      setSaving(false);
    }
  };
  const updateOwner = async (account: AuthAccount, active: boolean) => {
    try {
      const result = await authRequest<{ account: AuthAccount }>(
        `/api/auth/accounts/${account.id}`,
        { method: "PATCH", body: JSON.stringify({ active }) },
      );
      setOwnerAccounts((current) =>
        current.map((item) =>
          item.id === result.account.id ? result.account : item,
        ),
      );
      await load();
      toast.success(
        locale === "ar" ? "تم تحديث حالة المالك" : "Owner status updated",
      );
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not update owner",
      );
    }
  };
  const updateOwnerDetails = async (
    account: AuthAccount,
    changes: Partial<AuthAccount>,
  ) => {
    setSaving(true);
    try {
      const result = await authRequest<{ account: AuthAccount }>(
        `/api/auth/accounts/${account.id}`,
        { method: "PATCH", body: JSON.stringify(changes) },
      );
      setOwnerAccounts((current) =>
        current.map((item) =>
          item.id === result.account.id ? result.account : item,
        ),
      );
      toast.success(
        locale === "ar" ? "تم تحديث بيانات المالك" : "Owner details updated",
      );
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : "Could not update owner details",
      );
    } finally {
      setSaving(false);
    }
  };
  const setOwnerPermanentPassword = async (account: AuthAccount) => {
    if (ownerPassword.length < 10) {
      toast.error(
        locale === "ar"
          ? "استخدم كلمة مرور من 10 أحرف على الأقل"
          : "Use at least 10 characters",
      );
      return;
    }
    setSaving(true);
    try {
      await authRequest(`/api/auth/accounts/${account.id}/set-password`, {
        method: "POST",
        body: JSON.stringify({ password: ownerPassword }),
      });
      setOwnerPassword("");
      toast.success(
        locale === "ar"
          ? "تم تعيين كلمة المرور الدائمة"
          : "Permanent password set",
      );
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not set password",
      );
    } finally {
      setSaving(false);
    }
  };
  const restoreCompanyBackup = async (backup: BackupSummary) => {
    if (
      !window.confirm(
        text(
          "Restore this company backup? A safety backup will be created first.",
          "استعادة نسخة الشركة؟ سيتم إنشاء نسخة أمان أولاً.",
        ),
      )
    )
      return;
    setSaving(true);
    try {
      await authRequest(`/api/backups/${backup.id}/restore`, {
        method: "POST",
        body: JSON.stringify({ confirmation: "RESTORE" }),
      });
      await load();
      toast.success(
        locale === "ar" ? "تمت استعادة بيانات الشركة" : "Company data restored",
      );
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Could not restore backup",
      );
    } finally {
      setSaving(false);
    }
  };
  const createCompanyBackup = async () => {
    if (!selectedCompany) return;
    setSaving(true);
    try {
      const backup = await authRequest<BackupSummary>("/api/backups", {
        method: "POST",
        body: JSON.stringify({
          scope: "company",
          companyId: selectedCompany.id,
        }),
      });
      setCompanyBackups((current) => [backup, ...current]);
      toast.success(
        text("Company backup created", "تم إنشاء نسخة احتياطية للشركة"),
      );
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : text("Could not create company backup.", "تعذر إنشاء نسخة الشركة."),
      );
    } finally {
      setSaving(false);
    }
  };
  const text = (en: string, ar: string) => (locale === "ar" ? ar : en);
  if (loading && !summary) return <Skeleton className="h-[520px]" />;
  if (error && !summary) return <ErrorState retry={() => void load()} />;
  const metrics = summary!.metrics;
  const statusLabels: Record<string, string> = {
    active: text("Active", "نشطة"),
    trial: text("Trial", "تجريبية"),
    past_due: text("Past due", "متأخرة"),
    cancelled: text("Cancelled", "ملغاة"),
    suspended: text("Suspended", "موقوفة"),
  };
  const platformActivityCopy = {
    title: {
      en: "Recent platform activity",
      ar: "نشاط المنصة الأخير",
      fr: "Activité récente de la plateforme",
      de: "Letzte Plattformaktivitäten",
    }[locale],
    noRecent: {
      en: "No recent activity",
      ar: "لا يوجد نشاط حديث",
      fr: "Aucune activité récente",
      de: "Keine aktuellen Aktivitäten",
    }[locale],
    detail: {
      en: "Platform events will appear here.",
      ar: "ستظهر أحداث المنصة هنا.",
      fr: "Les événements de la plateforme apparaîtront ici.",
      de: "Plattformereignisse werden hier angezeigt.",
    }[locale],
    viewAll: {
      en: "View platform activity",
      ar: "عرض نشاط المنصة",
      fr: "Voir l’activité de la plateforme",
      de: "Plattformaktivitäten anzeigen",
    }[locale],
  };
  const subscriptionPrice = (company: PlatformCompanyDetail) => {
    const prices = [
      company.monthlyPrice > 0
        ? `${text("Monthly", "شهري")}: ${company.monthlyPrice} ${company.currency}`
        : null,
      company.annualPrice > 0
        ? `${text("Annual", "سنوي")}: ${company.annualPrice} ${company.currency}`
        : null,
    ].filter(Boolean);
    return prices.length ? prices.join(" · ") : text("Not set", "غير محدد");
  };
  const metricCards: Array<{
    icon: typeof Building2;
    label: string;
    value: number;
    href: string;
  }> = [
    {
      icon: Building2,
      label: text("Total companies", "إجمالي الشركات"),
      value: metrics.totalCompanies,
      href: "/platform/companies",
    },
    {
      icon: Check,
      label: text("Active companies", "الشركات النشطة"),
      value: metrics.activeCompanies,
      href: "/platform/companies/active",
    },
    {
      icon: Bell,
      label: text("Suspended companies", "الشركات الموقوفة"),
      value: metrics.suspendedCompanies,
      href: "/platform/companies/suspended",
    },
    {
      icon: Users,
      label: text("Total employees", "إجمالي الموظفين"),
      value: metrics.totalEmployees,
      href: "/platform/employees",
    },
    {
      icon: UserRound,
      label: text("Platform users", "مستخدمو المنصة"),
      value: metrics.totalPlatformUsers,
      href: "/platform/users",
    },
    {
      icon: Zap,
      label: text("Active subscriptions", "الاشتراكات النشطة"),
      value: metrics.activeSubscriptions,
      href: "/platform/subscriptions",
    },
  ];
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={text("Platform administration", "إدارة المنصة")}
        title={text("Platform control center", "مركز تحكم المنصة")}
        detail={text(
          "Operate the entire VAR HR platform from one cross-company administration surface.",
          "أدر منصة VAR HR بالكامل من مساحة واحدة عبر جميع الشركات.",
        )}
        action={
          <div className="flex items-center gap-2">
            <Badge tone="accent">{text("Platform scope", "نطاق المنصة")}</Badge>
            <Button onClick={() => setLocation("/platform/companies/new")}>
              <Plus size={15} />
              {text("Add Company", "إضافة شركة")}
            </Button>
            <Button
              variant="outline"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw size={15} />
              {text("Refresh", "تحديث")}
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {metricCards.map(({ icon: Icon, label, value, href }) => (
          <Link
            className="block h-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href={href}
            key={label}
          >
            <Card className="h-full cursor-pointer p-4 transition-colors hover:border-primary/50 hover:bg-muted/40 sm:p-5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-[.12em]">
                  {label}
                </span>
                <span className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon size={16} />
                </span>
              </div>
              <div className="mt-5 font-display text-3xl font-semibold">
                {value}
              </div>
            </Card>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-display text-lg font-semibold">
                {text("Platform alerts", "تنبيهات المنصة")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {text(
                  "Important issues across the platform.",
                  "أهم المشكلات عبر المنصة.",
                )}
              </p>
            </div>
            <Bell size={18} className="text-accent" />
          </div>
          {summary!.alerts.length ? (
            <div className="divide-y divide-border">
              {summary!.alerts.map((alert) => (
                <div className="flex gap-3 p-5" key={alert.id}>
                  <AlertCircle
                    className={cn(
                      "mt-0.5 shrink-0",
                      alert.severity === "critical"
                        ? "text-destructive"
                        : "text-accent",
                    )}
                    size={17}
                  />
                  <div>
                    <div className="font-semibold">{alert.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {alert.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title={text("No platform alerts", "لا توجد تنبيهات")}
              detail={text(
                "The platform currently has no recorded alerts.",
                "لا توجد تنبيهات مسجلة حالياً.",
              )}
            />
          )}
        </Card>
        <Card className="p-5" id="platform-subscriptions">
          <div className="flex items-center gap-2">
            <Zap size={17} className="text-primary" />
            <h2 className="font-display text-lg font-semibold">
              {text("Subscription posture", "حالة الاشتراكات")}
            </h2>
          </div>
          <div className="mt-5 space-y-3">
            {Object.entries(summary!.subscriptionStatus).map(
              ([status, count]) => (
                <div
                  className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-3 text-sm"
                  key={status}
                >
                  <span>{statusLabels[status] ?? status}</span>
                  <span className="font-mono font-semibold">{count}</span>
                </div>
              ),
            )}
          </div>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">
            {text(
              "Expiration tracking is not shown because the current subscription data has no expiration date.",
              "لا يتم عرض انتهاء الاشتراك لأن بيانات الاشتراك الحالية لا تحتوي على تاريخ انتهاء.",
            )}
          </p>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card id="platform-companies">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-display text-lg font-semibold">
                {text("Companies", "الشركات")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {text(
                  "Manage company status, owners, limits, and subscription posture.",
                  "إدارة حالة الشركات والمالكين والحدود والاشتراكات.",
                )}
              </p>
            </div>
            <Badge tone="neutral">
              {visibleCompanies!.length} {text("registered", "مسجلة")}
            </Badge>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {visibleCompanies!.length ? (
              visibleCompanies!.map((company) => (
              <button
                className="rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/40"
                key={company.id}
                onClick={() => openCompany(company)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{company.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {company.slug}
                    </div>
                  </div>
                  <Status value={company.status} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <Info
                    label={text("Company Owners", "مالكو الشركة")}
                    value={company.ownerCount}
                  />
                  <Info
                    label={text("Subscription price", "سعر الاشتراك")}
                    value={subscriptionPrice(company)}
                  />
                  <Info
                    label={text("Employees", "الموظفون")}
                    value={`${company.activeEmployees}/${company.employeeLimit}`}
                  />
                  <Info
                    label={text("Registered", "تاريخ التسجيل")}
                    value={date(company.createdAt)}
                  />
                </div>
                <div className="mt-3 text-xs text-primary">
                  {text("Open details", "فتح التفاصيل")}{" "}
                  <ArrowUpRight className="inline" size={13} />
                </div>
              </button>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground">
                {text(
                  "No companies match this status.",
                  "لا توجد شركات بهذه الحالة.",
                )}
              </div>
            )}
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 border-b border-border p-5">
              <Activity size={17} className="text-primary" />
              <h2 className="font-display text-lg font-semibold">
                {platformActivityCopy.title}
              </h2>
            </div>
            <div className="divide-y divide-border">
              {summary!.activity.length ? (
                summary!.activity.slice(0, 6).map((event) => (
                  <div className="p-4" key={event.id}>
                    <div className="font-semibold text-sm">
                      {platformActivityLabel(locale, "action", event.action)}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {platformActivityLabel(
                        locale,
                        "entity",
                        event.entityType,
                      )}{" "}
                      · {date(event.createdAt)}{" "}
                      {time(event.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                <Empty
                  title={platformActivityCopy.noRecent}
                  detail={platformActivityCopy.detail}
                />
              )}
            </div>
            <div className="border-t border-border p-4">
              <Link
                href="/platform/activity"
                className="text-sm font-bold text-primary"
              >
                {platformActivityCopy.viewAll}
              </Link>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Settings size={17} className="text-primary" />
              <h2 className="font-display text-lg font-semibold">
                {text("Platform settings", "إعدادات المنصة")}
              </h2>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {text("Administration language", "لغة الإدارة")}
                </span>
                <select
                  className="h-10 w-full rounded-lg border border-input bg-background px-3"
                  value={locale}
                  onChange={(event) => setLocale(event.target.value as Locale)}
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </label>
              <div className="rounded-lg bg-muted/60 p-3">
                <div className="font-medium">
                  {text("Backup scope", "نطاق النسخ الاحتياطي")}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {text(
                    "Complete platform backups are available in Backup & restore.",
                    "النسخ الكاملة للمنصة متاحة في النسخ الاحتياطي والاستعادة.",
                  )}
                </div>
              </div>
              <Link
                href="/backups"
                className="inline-flex text-sm font-bold text-primary"
              >
                {text(
                  "Open Backup & restore",
                  "فتح النسخ الاحتياطي والاستعادة",
                )}{" "}
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </Card>
        </div>
      </div>
      <Card className="mt-6">
        <div className="flex items-center gap-2 border-b border-border p-5">
          <LifeBuoy size={17} className="text-primary" />
          <div>
            <h2 className="font-display text-lg font-semibold">
              {text("Support & admin tools", "أدوات الدعم والإدارة")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {text(
                "Manage Company Owners, company settings, backups, and platform audit history.",
                "إدارة مالكي الشركات وإعداداتها ونسخها الاحتياطية وسجل المنصة.",
              )}
            </p>
          </div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          <Info
            label={text("Company Owner accounts", "حسابات مالكي الشركات")}
            value={summary!.companies.filter((company) => company.owner).length}
          />
          <Info
            label={text("Audit events available", "أحداث التدقيق المتاحة")}
            value={audit.length}
          />
          <Link
            href="/backups"
            className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-sm font-semibold text-primary"
          >
            {text("Open backup administration", "فتح إدارة النسخ الاحتياطية")}{" "}
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </Card>
      {selectedCompany && (
        <Modal
          title={selectedCompany.name}
          onClose={() => setSelectedCompany(null)}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">
                  {selectedCompany.slug}
                </div>
                <div className="mt-1 font-semibold">
                  {selectedCompany.planName}
                </div>
              </div>
              <Status value={selectedCompany.status} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info
                label={text("Company Owner", "مالك الشركة")}
                value={
                  selectedCompany.owner?.username ??
                  text("Not assigned", "غير معين")
                }
              />
              <Info
                label={text("Owner status", "حالة المالك")}
                value={
                  selectedCompany.owner
                    ? selectedCompany.owner.active
                      ? text("Active", "نشط")
                      : text("Inactive", "غير نشط")
                    : "—"
                }
              />
              <Info
                label={text("Employees", "الموظفون")}
                value={`${selectedCompany.activeEmployees} active / ${selectedCompany.employeeCount} total`}
              />
              <Info
                label={text("Users", "المستخدمون")}
                value={`${selectedCompany.activeUsers} active / ${selectedCompany.userCount} total`}
              />
              <Info
                label={text("Subscription", "الاشتراك")}
                value={
                  statusLabels[selectedCompany.subscriptionStatus] ??
                  selectedCompany.subscriptionStatus
                }
              />
              <Info
                label={text("Registered", "تاريخ التسجيل")}
                value={date(selectedCompany.createdAt)}
              />
            </div>
            {companyDetails ? (
              <>
                <div className="border-t border-border pt-5">
                  <h3 className="font-semibold">
                    {text(
                      "Company information entered by Platform Owner",
                      "بيانات الشركة التي أدخلها مالك المنصة",
                    )}
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Info
                      label={text("Company name", "اسم الشركة")}
                      value={companyDetails.company.name}
                    />
                    <Info
                      label={text("Address", "العنوان")}
                      value={companyDetails.company.address}
                    />
                    <Info
                      label={text("Currency", "العملة")}
                      value={companyDetails.company.currency}
                    />
                    <Info
                      label={text("Employee limit", "حد الموظفين")}
                      value={
                        companyDetails.subscription?.employeeLimit ??
                        selectedCompany.employeeLimit
                      }
                    />
                    <Info
                      label={text(
                        "Monthly subscription price",
                        "سعر الاشتراك الشهري",
                      )}
                      value={
                        companyDetails.subscription?.monthlyPrice
                          ? `${companyDetails.subscription.monthlyPrice} ${companyDetails.company.currency}`
                          : text("Not set", "غير محدد")
                      }
                    />
                    <Info
                      label={text(
                        "Annual subscription price",
                        "سعر الاشتراك السنوي",
                      )}
                      value={
                        companyDetails.subscription?.annualPrice
                          ? `${companyDetails.subscription.annualPrice} ${companyDetails.company.currency}`
                          : text("Not set", "غير محدد")
                      }
                    />
                    <Info
                      label={text("Registration date", "تاريخ التسجيل")}
                      value={date(companyDetails.company.createdAt)}
                    />
                    <Info
                      label={text("Company Owners", "مالكو الشركة")}
                      value={companyDetails.owners.length}
                    />
                  </div>
                </div>
                <div className="border-t border-border pt-5">
                  <h3 className="font-semibold">
                    {text("Company Owner accounts", "حسابات مالكي الشركة")}
                  </h3>
                  <div className="mt-3 space-y-3">
                    {companyDetails.owners.length ? (
                      companyDetails.owners.map((account) => (
                        <div
                          className="rounded-lg border border-border p-3"
                          key={account.id}
                        >
                          <div className="font-semibold">
                            {account.fullName || account.username}
                          </div>
                          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                            <Info
                              label={text("Username", "اسم المستخدم")}
                              value={account.username}
                            />
                            <Info
                              label={text("Phone", "الهاتف")}
                              value={account.primaryPhone}
                            />
                            <Info
                              label={text(
                                "Backup phones",
                                "الهواتف الاحتياطية",
                              )}
                              value={account.backupPhones.join(", ")}
                            />
                            <Info
                              label={text("Email", "البريد الإلكتروني")}
                              value={account.email}
                            />
                            <Info
                              label={text("Backup emails", "البريد الاحتياطي")}
                              value={account.backupEmails.join(", ")}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {text(
                          "No Company Owner accounts found.",
                          "لم يتم العثور على حسابات مالكي الشركة.",
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-t border-border pt-5">
                  <h3 className="font-semibold">
                    {text("Live company data", "بيانات الشركة الحالية")}
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Info
                      label={text("Employees", "الموظفون")}
                      value={companyDetails.employees.length}
                    />
                    <Info
                      label={text(
                        "HR/Admin/Manager accounts",
                        "حسابات HR/Admin/Manager",
                      )}
                      value={companyDetails.staff.length}
                    />
                    <Info
                      label={text("Connected devices", "الأجهزة المتصلة")}
                      value={companyDetails.devices.length}
                    />
                    <Info
                      label={text("Subscription", "الاشتراك")}
                      value={
                        companyDetails.subscription
                          ? `${companyDetails.subscription.planName} · ${companyDetails.subscription.status}`
                          : text("Not configured", "غير مهيأ")
                      }
                    />
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {text("Employees", "الموظفون")}
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        {companyDetails.employees.length ? (
                          companyDetails.employees.map((employee) => (
                            <div key={String(employee.id)}>
                              {String(employee.first_name ?? "")}{" "}
                              {String(employee.last_name ?? "")}
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {text(
                          "HR/Admin/Manager accounts",
                          "حسابات HR/Admin/Manager",
                        )}
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        {companyDetails.staff.length ? (
                          companyDetails.staff.map((account) => (
                            <div key={account.id}>
                              {account.fullName || account.username}{" "}
                              <span className="text-muted-foreground">
                                · {account.username}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {text("Devices", "الأجهزة")}
                      </div>
                      <div className="mt-2 space-y-1 text-sm">
                        {companyDetails.devices.length ? (
                          companyDetails.devices.map((device) => (
                            <div key={String(device.id)}>
                              {String(device.name ?? "Unnamed")}{" "}
                              <span className="text-muted-foreground">
                                · {String(device.status ?? "unknown")}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </div>
                    <div className="rounded-lg border border-border p-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {text(
                          "Operational data records",
                          "سجلات البيانات التشغيلية",
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-1 text-sm">
                        {Object.entries(companyDetails.tableCounts)
                          .filter(
                            ([table]) =>
                              table !== "var_hr_companies" &&
                              table !== "var_hr_user_accounts",
                          )
                          .map(([table, count]) => (
                            <div key={table}>
                              <span className="text-muted-foreground">
                                {table.replace("var_hr_", "")}
                              </span>
                              : {count}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                  <details className="mt-3 rounded-lg border border-border p-3">
                    <summary className="cursor-pointer text-sm font-semibold">
                      {text(
                        "View all company-owned operational records",
                        "عرض جميع سجلات الشركة التشغيلية",
                      )}
                    </summary>
                    <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">
                      {JSON.stringify(companyDetails.operationalData, null, 2)}
                    </pre>
                  </details>
                </div>
              </>
            ) : (
              <div className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
                {text(
                  "Loading complete company details…",
                  "جارٍ تحميل تفاصيل الشركة الكاملة…",
                )}
              </div>
            )}
            <div className="border-t border-border pt-5">
              <h3 className="font-semibold">
                {text("Company information", "معلومات الشركة")}
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  {text("Company name", "اسم الشركة")}
                  <input
                    className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 font-normal"
                    value={companyForm.name}
                    onChange={(event) =>
                      setCompanyForm({
                        ...companyForm,
                        name: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-semibold">
                  {text("Timezone", "المنطقة الزمنية")}
                  <input
                    className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 font-normal"
                    value={companyForm.timezone}
                    onChange={(event) =>
                      setCompanyForm({
                        ...companyForm,
                        timezone: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-semibold">
                  {text("Company address", "عنوان الشركة")}
                  <textarea
                    className="mt-2 min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 font-normal"
                    value={companyForm.address ?? ""}
                    onChange={(event) =>
                      setCompanyForm({
                        ...companyForm,
                        address: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="text-sm font-semibold">
                  {text("Currency", "العملة")}
                  <input
                    className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 font-normal"
                    maxLength={3}
                    value={companyForm.currency}
                    onChange={(event) =>
                      setCompanyForm({
                        ...companyForm,
                        currency: event.target.value.toUpperCase(),
                      })
                    }
                  />
                </label>
                <label className="text-sm font-semibold">
                  {text("Employee limit", "حد الموظفين")}
                  <input
                    className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 font-normal"
                    type="number"
                    min="0"
                    value={employeeLimit}
                    onChange={(event) => setEmployeeLimit(event.target.value)}
                  />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={saving}
                  onClick={() =>
                    void updateCompany({
                      name: companyForm.name,
                      address: companyForm.address,
                      timezone: companyForm.timezone,
                      currency: companyForm.currency,
                      employeeLimit: Number(employeeLimit),
                    })
                  }
                >
                  {text("Save company settings", "حفظ إعدادات الشركة")}
                </Button>
                <Button
                  variant={selectedCompany.active ? "quiet" : "primary"}
                  disabled={saving}
                  onClick={() =>
                    void updateCompany({
                      status: selectedCompany.active ? "suspended" : "active",
                    })
                  }
                >
                  {selectedCompany.active
                    ? text("Suspend company", "إيقاف الشركة")
                    : text("Activate company", "تفعيل الشركة")}
                </Button>
              </div>
            </div>
            <div className="border-t border-border pt-5">
              <h3 className="font-semibold">
                {text("Company Owner access", "وصول مالك الشركة")}
              </h3>
              <div className="mt-3 space-y-3">
                {ownerAccounts.length ? (
                  ownerAccounts.map((account) => (
                    <div
                      className="rounded-lg border border-border p-3"
                      key={account.id}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold">
                            {account.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {account.active
                              ? text("Active", "نشط")
                              : text("Inactive", "غير نشط")}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          disabled={saving}
                          onClick={() =>
                            void updateOwner(account, !account.active)
                          }
                        >
                          {account.active
                            ? text("Deactivate", "تعطيل")
                            : text("Activate", "تفعيل")}
                        </Button>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <Field
                          label={text("Full name", "الاسم الكامل")}
                          value={account.fullName}
                          onChange={(value) =>
                            setOwnerAccounts((current) =>
                              current.map((item) =>
                                item.id === account.id
                                  ? { ...item, fullName: value }
                                  : item,
                              ),
                            )
                          }
                        />
                        <Field
                          label={text("Primary phone", "الهاتف الأساسي")}
                          value={account.primaryPhone}
                          onChange={(value) =>
                            setOwnerAccounts((current) =>
                              current.map((item) =>
                                item.id === account.id
                                  ? { ...item, primaryPhone: value }
                                  : item,
                              ),
                            )
                          }
                        />
                        <Field
                          label={text("Email", "البريد الإلكتروني")}
                          type="email"
                          value={account.email}
                          onChange={(value) =>
                            setOwnerAccounts((current) =>
                              current.map((item) =>
                                item.id === account.id
                                  ? { ...item, email: value }
                                  : item,
                              ),
                            )
                          }
                        />
                        <Field
                          label={text(
                            "Backup phones (comma separated)",
                            "هواتف احتياطية",
                          )}
                          value={account.backupPhones.join(", ")}
                          onChange={(value) =>
                            setOwnerAccounts((current) =>
                              current.map((item) =>
                                item.id === account.id
                                  ? {
                                      ...item,
                                      backupPhones: value
                                        .split(",")
                                        .map((entry) => entry.trim())
                                        .filter(Boolean),
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                        <Field
                          label={text(
                            "Backup emails (comma separated)",
                            "بريد احتياطي",
                          )}
                          type="email"
                          value={account.backupEmails.join(", ")}
                          onChange={(value) =>
                            setOwnerAccounts((current) =>
                              current.map((item) =>
                                item.id === account.id
                                  ? {
                                      ...item,
                                      backupEmails: value
                                        .split(",")
                                        .map((entry) => entry.trim())
                                        .filter(Boolean),
                                    }
                                  : item,
                              ),
                            )
                          }
                        />
                      </div>
                      <Button
                        className="mt-3 w-full"
                        variant="outline"
                        disabled={saving}
                        onClick={() =>
                          void updateOwnerDetails(account, {
                            fullName: account.fullName,
                            primaryPhone: account.primaryPhone,
                            backupPhones: account.backupPhones,
                            email: account.email,
                            backupEmails: account.backupEmails,
                          })
                        }
                      >
                        {text("Save owner details", "حفظ بيانات المالك")}
                      </Button>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <input
                          className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
                          type="password"
                          placeholder={text(
                            "New permanent password",
                            "كلمة مرور دائمة جديدة",
                          )}
                          value={ownerPassword}
                          onChange={(event) =>
                            setOwnerPassword(event.target.value)
                          }
                        />
                        <Button
                          disabled={saving || ownerPassword.length < 10}
                          onClick={() =>
                            void setOwnerPermanentPassword(account)
                          }
                        >
                          {text("Set password", "تعيين كلمة المرور")}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {text(
                      "No Company Owner account found.",
                      "لم يتم العثور على مالك للشركة.",
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="border-t border-border pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">
                  {text("Company backups", "نسخ الشركة الاحتياطية")}
                </h3>
                <Button
                  variant="outline"
                  disabled={saving || !companyDetails}
                  onClick={() => void createCompanyBackup()}
                >
                  {text("Create Company Backup", "إنشاء نسخة احتياطية للشركة")}
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {companyBackups.length ? (
                  companyBackups.map((backup) => (
                    <div
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 p-3 text-sm"
                      key={backup.id}
                    >
                      <span>
                        {new Date(backup.createdAt).toLocaleString(
                          locale === "ar" ? "ar-EG" : "en-GB",
                        )}
                      </span>
                      <Button
                        variant="outline"
                        disabled={saving}
                        onClick={() => void restoreCompanyBackup(backup)}
                      >
                        {text("Restore", "استعادة")}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {text(
                      "No company backups available.",
                      "لا توجد نسخ للشركة.",
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function BackButton({ fallback = "/platform" }: { fallback?: string }) {
  const { locale, t } = useI18n();
  const [, setLocation] = useLocation();
  const isArabic = locale === "ar";
  return (
    <Button
      variant="outline"
      onClick={() => {
        if (window.history.length > 1) window.history.back();
        else setLocation(fallback);
      }}
      aria-label={t("goBack")}
    >
      {isArabic ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
      {t("back")}
    </Button>
  );
}

const platformActivityActionLabels: Record<Locale, Record<string, string>> = {
  en: {
    created: "Created",
    updated: "Updated",
    deleted: "Deleted",
    reversed: "Reversed",
    checked_in: "Checked in",
    checked_out: "Checked out",
    corrected: "Corrected",
    approved: "Approved",
    rejected: "Rejected",
    manual_adjustment: "Manual adjustment",
    view: "View",
    database_view: "Database view",
    login: "Signed in",
    logout: "Signed out",
    password_reset: "Password reset",
    company_created: "Company created",
    company_updated: "Company updated",
    company_owner_account_created: "Company owner account created",
    company_owner_account_deactivated: "Company owner account deactivated",
    company_owner_password_set: "Company owner password set",
    company_owner_updated: "Company owner updated",
    employee_password_changed: "Employee password changed",
    platform_owner_provisioned: "Platform owner provisioned",
    staff_account_created: "Staff account created",
    backup_created: "Backup created",
    backup_deleted: "Backup deleted",
    backup_restored: "Backup restored",
    backup_uploaded: "Backup uploaded",
    archived: "Archived",
    database_support_updated: "Database support updated",
    support_updated: "Support access updated",
    subscription_pricing_changed: "Subscription pricing changed",
    subscription_limit_changed: "Subscription limit changed",
    company_status_changed: "Company status changed",
  },
  ar: {
    created: "تم الإنشاء",
    updated: "تم التحديث",
    deleted: "تم الحذف",
    reversed: "تم العكس",
    checked_in: "تسجيل حضور",
    checked_out: "تسجيل انصراف",
    corrected: "تم التصحيح",
    approved: "تمت الموافقة",
    rejected: "تم الرفض",
    manual_adjustment: "تعديل يدوي",
    view: "عرض",
    database_view: "عرض قاعدة البيانات",
    login: "تسجيل دخول",
    logout: "تسجيل خروج",
    password_reset: "إعادة تعيين كلمة المرور",
    company_created: "تم إنشاء الشركة",
    company_updated: "تم تحديث الشركة",
    company_owner_account_created: "تم إنشاء حساب مالك الشركة",
    company_owner_account_deactivated: "تم تعطيل حساب مالك الشركة",
    company_owner_password_set: "تم تعيين كلمة مرور مالك الشركة",
    company_owner_updated: "تم تحديث بيانات مالك الشركة",
    employee_password_changed: "تم تغيير كلمة مرور الموظف",
    platform_owner_provisioned: "تم تجهيز حساب مالك المنصة",
    staff_account_created: "تم إنشاء حساب موظف",
    backup_created: "تم إنشاء نسخة احتياطية",
    backup_deleted: "تم حذف النسخة الاحتياطية",
    backup_restored: "تمت استعادة النسخة الاحتياطية",
    backup_uploaded: "تم رفع النسخة الاحتياطية",
    archived: "تمت الأرشفة",
    database_support_updated: "تم تحديث دعم قاعدة البيانات",
    support_updated: "تم تحديث صلاحيات الدعم",
    subscription_pricing_changed: "تم تغيير أسعار الاشتراك",
    subscription_limit_changed: "تم تغيير حد الاشتراك",
    company_status_changed: "تم تغيير حالة الشركة",
  },
  fr: {
    created: "Créé",
    updated: "Mis à jour",
    deleted: "Supprimé",
    reversed: "Inversé",
    checked_in: "Pointage d’arrivée",
    checked_out: "Pointage de départ",
    corrected: "Corrigé",
    approved: "Approuvé",
    rejected: "Rejeté",
    manual_adjustment: "Ajustement manuel",
    view: "Voir",
    database_view: "Consultation de la base de données",
    login: "Connexion",
    logout: "Déconnexion",
    password_reset: "Mot de passe réinitialisé",
    company_created: "Entreprise créée",
    company_updated: "Entreprise mise à jour",
    company_owner_account_created: "Compte du propriétaire créé",
    company_owner_account_deactivated: "Compte du propriétaire désactivé",
    company_owner_password_set: "Mot de passe du propriétaire défini",
    company_owner_updated: "Propriétaire mis à jour",
    employee_password_changed: "Mot de passe de l’employé modifié",
    platform_owner_provisioned: "Propriétaire de plateforme configuré",
    staff_account_created: "Compte du personnel créé",
    backup_created: "Sauvegarde créée",
    backup_deleted: "Sauvegarde supprimée",
    backup_restored: "Sauvegarde restaurée",
    backup_uploaded: "Sauvegarde importée",
    archived: "Archivé",
    database_support_updated: "Support de base de données mis à jour",
    support_updated: "Accès au support mis à jour",
    subscription_pricing_changed: "Tarifs d’abonnement modifiés",
    subscription_limit_changed: "Limite d’abonnement modifiée",
    company_status_changed: "Statut de l’entreprise modifié",
  },
  de: {
    created: "Erstellt",
    updated: "Aktualisiert",
    deleted: "Gelöscht",
    reversed: "Rückgängig gemacht",
    checked_in: "Eingestempelt",
    checked_out: "Ausgestempelt",
    corrected: "Korrigiert",
    approved: "Genehmigt",
    rejected: "Abgelehnt",
    manual_adjustment: "Manuelle Anpassung",
    view: "Anzeigen",
    database_view: "Datenbankansicht",
    login: "Angemeldet",
    logout: "Abgemeldet",
    password_reset: "Passwort zurückgesetzt",
    company_created: "Unternehmen erstellt",
    company_updated: "Unternehmen aktualisiert",
    company_owner_account_created: "Unternehmenskonto erstellt",
    company_owner_account_deactivated: "Unternehmenskonto deaktiviert",
    company_owner_password_set: "Passwort des Unternehmensinhabers festgelegt",
    company_owner_updated: "Unternehmensinhaber aktualisiert",
    employee_password_changed: "Mitarbeiterpasswort geändert",
    platform_owner_provisioned: "Plattforminhaber eingerichtet",
    staff_account_created: "Mitarbeiterkonto erstellt",
    backup_created: "Sicherung erstellt",
    backup_deleted: "Sicherung gelöscht",
    backup_restored: "Sicherung wiederhergestellt",
    backup_uploaded: "Sicherung hochgeladen",
    archived: "Archiviert",
    database_support_updated: "Datenbank-Support aktualisiert",
    support_updated: "Supportzugriff aktualisiert",
    subscription_pricing_changed: "Abonnementpreise geändert",
    subscription_limit_changed: "Abonnementlimit geändert",
    company_status_changed: "Unternehmensstatus geändert",
  },
};

const platformActivityEntityLabels: Record<Locale, Record<string, string>> = {
  en: {
    company: "Company",
    account: "Account",
    department: "Department",
    branch: "Branch",
    employee: "Employee",
    employee_schedule_assignment: "Employee schedule",
    attendance: "Attendance",
    attendance_time_adjustment: "Attendance adjustment",
    attendance_rule: "Attendance rule",
    leave_policy: "Leave policy",
    leave_balance: "Leave balance",
    leave_request: "Leave request",
    permission_request: "Permission request",
    payroll_period: "Payroll period",
    payroll_run: "Payroll run",
    device: "Device",
    holiday: "Holiday",
    schedule: "Work schedule",
    backup: "Backup",
    database: "Database",
  },
  ar: {
    company: "الشركة",
    account: "الحساب",
    department: "القسم",
    branch: "الفرع",
    employee: "الموظف",
    employee_schedule_assignment: "جدول الموظف",
    attendance: "الحضور",
    attendance_time_adjustment: "تعديل الحضور",
    attendance_rule: "قاعدة الحضور",
    leave_policy: "سياسة الإجازات",
    leave_balance: "رصيد الإجازات",
    leave_request: "طلب الإجازة",
    permission_request: "طلب الاستئذان",
    payroll_period: "فترة الرواتب",
    payroll_run: "تشغيل الرواتب",
    device: "الجهاز",
    holiday: "العطلة",
    schedule: "جدول العمل",
    backup: "النسخة الاحتياطية",
    database: "قاعدة البيانات",
  },
  fr: {
    company: "Entreprise",
    account: "Compte",
    department: "Département",
    branch: "Agence",
    employee: "Employé",
    employee_schedule_assignment: "Planning de l’employé",
    attendance: "Présence",
    attendance_time_adjustment: "Correction de présence",
    attendance_rule: "Règle de présence",
    leave_policy: "Politique de congés",
    leave_balance: "Solde de congés",
    leave_request: "Demande de congé",
    permission_request: "Demande d’autorisation",
    payroll_period: "Période de paie",
    payroll_run: "Traitement de paie",
    device: "Appareil",
    holiday: "Jour férié",
    schedule: "Planning de travail",
    backup: "Sauvegarde",
    database: "Base de données",
  },
  de: {
    company: "Unternehmen",
    account: "Konto",
    department: "Abteilung",
    branch: "Niederlassung",
    employee: "Mitarbeiter",
    employee_schedule_assignment: "Mitarbeiterplan",
    attendance: "Anwesenheit",
    attendance_time_adjustment: "Anwesenheitskorrektur",
    attendance_rule: "Anwesenheitsregel",
    leave_policy: "Urlaubsrichtlinie",
    leave_balance: "Urlaubssaldo",
    leave_request: "Urlaubsantrag",
    permission_request: "Genehmigungsanfrage",
    payroll_period: "Abrechnungszeitraum",
    payroll_run: "Abrechnungslauf",
    device: "Gerät",
    holiday: "Feiertag",
    schedule: "Arbeitsplan",
    backup: "Sicherung",
    database: "Datenbank",
  },
};

const platformActivityActorLabels: Record<Locale, Record<string, string>> = {
  en: { system: "System", account: "Account" },
  ar: { system: "النظام", account: "حساب مستخدم" },
  fr: { system: "Système", account: "Compte" },
  de: { system: "System", account: "Konto" },
};

const platformDatabaseEntityLabels: Record<Locale, Record<string, string>> = {
  en: {
    companies: "Companies",
    user_accounts: "User accounts",
    permissions: "Permissions",
    plans: "Plans",
    subscriptions: "Subscriptions",
    employees: "Employees",
    departments: "Departments",
    branches: "Branches",
    devices: "Devices",
    attendance: "Attendance",
    attendance_locations: "Attendance locations",
    attendance_rules: "Attendance rules",
    work_schedules: "Work schedules",
    leave_balances: "Leave balances",
    leave_requests: "Leave requests",
    permission_requests: "Permission requests",
    payroll_periods: "Payroll periods",
    payroll_calculations: "Payroll calculations",
    audit_logs: "Audit logs",
    backups: "Backups",
  },
  ar: {
    companies: "الشركات",
    user_accounts: "حسابات المستخدمين",
    permissions: "الصلاحيات",
    plans: "الخطط",
    subscriptions: "الاشتراكات",
    employees: "الموظفون",
    departments: "الأقسام",
    branches: "الفروع",
    devices: "الأجهزة",
    attendance: "الحضور",
    attendance_locations: "مواقع الحضور",
    attendance_rules: "قواعد الحضور",
    work_schedules: "جداول العمل",
    leave_balances: "أرصدة الإجازات",
    leave_requests: "طلبات الإجازات",
    permission_requests: "طلبات الاستئذان",
    payroll_periods: "فترات الرواتب",
    payroll_calculations: "حسابات الرواتب",
    audit_logs: "سجلات التدقيق",
    backups: "النسخ الاحتياطية",
  },
  fr: {
    companies: "Entreprises",
    user_accounts: "Comptes utilisateurs",
    permissions: "Autorisations",
    plans: "Forfaits",
    subscriptions: "Abonnements",
    employees: "Employés",
    departments: "Départements",
    branches: "Agences",
    devices: "Appareils",
    attendance: "Présence",
    attendance_locations: "Lieux de présence",
    attendance_rules: "Règles de présence",
    work_schedules: "Plannings de travail",
    leave_balances: "Soldes de congés",
    leave_requests: "Demandes de congé",
    permission_requests: "Demandes d’autorisation",
    payroll_periods: "Périodes de paie",
    payroll_calculations: "Calculs de paie",
    audit_logs: "Journaux d’audit",
    backups: "Sauvegardes",
  },
  de: {
    companies: "Unternehmen",
    user_accounts: "Benutzerkonten",
    permissions: "Berechtigungen",
    plans: "Pläne",
    subscriptions: "Abonnements",
    employees: "Mitarbeiter",
    departments: "Abteilungen",
    branches: "Niederlassungen",
    devices: "Geräte",
    attendance: "Anwesenheit",
    attendance_locations: "Anwesenheitsorte",
    attendance_rules: "Anwesenheitsregeln",
    work_schedules: "Arbeitspläne",
    leave_balances: "Urlaubssalden",
    leave_requests: "Urlaubsanträge",
    permission_requests: "Genehmigungsanfragen",
    payroll_periods: "Abrechnungszeiträume",
    payroll_calculations: "Abrechnungsberechnungen",
    audit_logs: "Auditprotokolle",
    backups: "Sicherungen",
  },
};

function platformActivityLabel(
  locale: Locale,
  kind: "action" | "entity" | "actor",
  value: string | null | undefined,
) {
  if (!value) return "";
  if (kind === "entity" && value.startsWith("database:")) {
    const entity = value.slice("database:".length);
    const label = platformDatabaseEntityLabels[locale][entity];
    return label
      ? `${platformActivityEntityLabels[locale].database}: ${label}`
      : `${platformActivityEntityLabels[locale].database}: ${entity.replaceAll("_", " ")}`;
  }
  const labels =
    kind === "action"
      ? platformActivityActionLabels
      : kind === "entity"
        ? platformActivityEntityLabels
        : platformActivityActorLabels;
  const normalizedValue = value.replaceAll(" ", "_");
  return (
    labels[locale][value] ??
    labels[locale][normalizedValue] ??
    value.replaceAll("_", " ")
  );
}

type PlatformCompaniesMetricFilter = "all" | "active" | "suspended";

const platformCompaniesMetricCopy: Record<
  Locale,
  Record<
    PlatformCompaniesMetricFilter,
    {
      title: string;
      detail: string;
    }
  > & {
    eyebrow: string;
    back: string;
    registered: string;
    employees: string;
    users: string;
    open: string;
    noCompanies: string;
  }
> = {
  en: {
    eyebrow: "Platform administration",
    all: {
      title: "All companies",
      detail: "Review every company registered on the VAR HR platform.",
    },
    active: {
      title: "Active companies",
      detail: "Review companies that are currently active on the platform.",
    },
    suspended: {
      title: "Suspended companies",
      detail: "Review companies that are currently suspended.",
    },
    back: "Back to platform control center",
    registered: "registered",
    employees: "employees",
    users: "users",
    open: "Open company details",
    noCompanies: "No companies found in this category.",
  },
  ar: {
    eyebrow: "إدارة المنصة",
    all: {
      title: "كل الشركات",
      detail: "راجع جميع الشركات المسجلة على منصة VAR HR.",
    },
    active: {
      title: "الشركات النشطة",
      detail: "راجع الشركات النشطة حاليًا على المنصة.",
    },
    suspended: {
      title: "الشركات الموقوفة",
      detail: "راجع الشركات الموقوفة حاليًا.",
    },
    back: "العودة إلى مركز تحكم المنصة",
    registered: "مسجلة",
    employees: "موظف",
    users: "مستخدم",
    open: "فتح تفاصيل الشركة",
    noCompanies: "لا توجد شركات في هذه الفئة.",
  },
  fr: {
    eyebrow: "Administration de la plateforme",
    all: {
      title: "Toutes les entreprises",
      detail: "Consultez toutes les entreprises enregistrées sur la plateforme VAR HR.",
    },
    active: {
      title: "Entreprises actives",
      detail: "Consultez les entreprises actuellement actives sur la plateforme.",
    },
    suspended: {
      title: "Entreprises suspendues",
      detail: "Consultez les entreprises actuellement suspendues.",
    },
    back: "Retour au centre de contrôle",
    registered: "enregistrées",
    employees: "employés",
    users: "utilisateurs",
    open: "Ouvrir les détails",
    noCompanies: "Aucune entreprise dans cette catégorie.",
  },
  de: {
    eyebrow: "Plattformverwaltung",
    all: {
      title: "Alle Unternehmen",
      detail: "Prüfen Sie alle auf der VAR-HR-Plattform registrierten Unternehmen.",
    },
    active: {
      title: "Aktive Unternehmen",
      detail: "Prüfen Sie die derzeit aktiven Unternehmen der Plattform.",
    },
    suspended: {
      title: "Gesperrte Unternehmen",
      detail: "Prüfen Sie die derzeit gesperrten Unternehmen.",
    },
    back: "Zurück zum Plattform-Kontrollzentrum",
    registered: "registriert",
    employees: "Mitarbeiter",
    users: "Benutzer",
    open: "Unternehmensdetails öffnen",
    noCompanies: "Keine Unternehmen in dieser Kategorie.",
  },
};

function PlatformCompaniesPage({
  filter,
}: {
  filter: PlatformCompaniesMetricFilter;
}) {
  const { locale } = useI18n();
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const copy = platformCompaniesMetricCopy[locale];
  const [summary, setSummary] = useState<PlatformSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setSummary(await authRequest<PlatformSummary>("/api/platform/summary"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.noCompanies);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (auth.account.accountType !== "platform_owner") {
    return <WorkspaceState kind="unauthorized" />;
  }
  if (loading) return <Skeleton className="h-[520px]" />;
  if (error) return <ErrorState retry={() => void load()} />;

  const companies =
    summary?.companies.filter((company) => {
      if (filter === "all") return true;
      return company.status === filter;
    }) ?? [];

  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={copy.eyebrow}
        title={copy[filter].title}
        detail={copy[filter].detail}
        action={
          <Button variant="outline" onClick={() => setLocation("/platform")}>
            <ArrowLeft className="rtl:-scale-x-100" size={16} />
            {copy.back}
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-primary" />
            <h2 className="font-display text-lg font-semibold">
              {copy[filter].title}
            </h2>
          </div>
          <Badge tone="neutral">
            {companies.length} {copy.registered}
          </Badge>
        </div>
        {companies.length ? (
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {companies.map((company) => (
              <button
                className="rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/50 hover:bg-muted/40"
                key={company.id}
                onClick={() =>
                  setLocation(
                    `/platform/companies/${encodeURIComponent(company.id)}`,
                  )
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{company.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {company.slug}
                    </div>
                  </div>
                  <Status value={company.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <Info
                    label={copy.employees}
                    value={`${company.activeEmployees}/${company.employeeLimit}`}
                  />
                  <Info label={copy.users} value={company.userCount} />
                </div>
                <div className="mt-3 text-xs font-semibold text-primary">
                  {copy.open} <ArrowUpRight className="inline" size={13} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-6 text-sm text-muted-foreground">
            {copy.noCompanies}
          </div>
        )}
      </Card>
    </div>
  );
}

type PlatformTableMetricEntity = "employees" | "users" | "subscriptions";

const platformTableMetricCopy: Record<
  Locale,
  Record<
    PlatformTableMetricEntity,
    { title: string; detail: string }
  > & { eyebrow: string; back: string; records: string; noRecords: string }
> = {
  en: {
    eyebrow: "Platform administration",
    employees: {
      title: "All employees",
      detail: "Review employees across every company on the platform.",
    },
    users: {
      title: "Platform users",
      detail: "Review user accounts across every company on the platform.",
    },
    subscriptions: {
      title: "Active subscriptions",
      detail: "Review subscription records across the platform.",
    },
    back: "Back to platform control center",
    records: "records",
    noRecords: "No records found.",
  },
  ar: {
    eyebrow: "إدارة المنصة",
    employees: {
      title: "كل الموظفين",
      detail: "راجع الموظفين في جميع شركات المنصة.",
    },
    users: {
      title: "مستخدمو المنصة",
      detail: "راجع حسابات المستخدمين في جميع شركات المنصة.",
    },
    subscriptions: {
      title: "الاشتراكات النشطة",
      detail: "راجع سجلات الاشتراكات عبر المنصة.",
    },
    back: "العودة إلى مركز تحكم المنصة",
    records: "سجل",
    noRecords: "لا توجد سجلات.",
  },
  fr: {
    eyebrow: "Administration de la plateforme",
    employees: {
      title: "Tous les employés",
      detail: "Consultez les employés de toutes les entreprises de la plateforme.",
    },
    users: {
      title: "Utilisateurs de la plateforme",
      detail: "Consultez les comptes utilisateurs de toutes les entreprises.",
    },
    subscriptions: {
      title: "Abonnements actifs",
      detail: "Consultez les abonnements enregistrés sur la plateforme.",
    },
    back: "Retour au centre de contrôle",
    records: "enregistrements",
    noRecords: "Aucun enregistrement trouvé.",
  },
  de: {
    eyebrow: "Plattformverwaltung",
    employees: {
      title: "Alle Mitarbeiter",
      detail: "Prüfen Sie Mitarbeiter aus allen Unternehmen der Plattform.",
    },
    users: {
      title: "Plattformbenutzer",
      detail: "Prüfen Sie Benutzerkonten aus allen Unternehmen.",
    },
    subscriptions: {
      title: "Aktive Abonnements",
      detail: "Prüfen Sie die auf der Plattform erfassten Abonnements.",
    },
    back: "Zurück zum Plattform-Kontrollzentrum",
    records: "Datensätze",
    noRecords: "Keine Datensätze gefunden.",
  },
};

function PlatformTableMetricPage({
  entity,
}: {
  entity: PlatformTableMetricEntity;
}) {
  const { locale, t } = useI18n();
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const copy = platformTableMetricCopy[locale];
  const [data, setData] = useState<AdminDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setData(
        await authRequest<AdminDataResponse>(
          `/api/platform/database/${entity}`,
        ),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.noRecords);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [entity]);

  if (auth.account.accountType !== "platform_owner") {
    return <WorkspaceState kind="unauthorized" />;
  }
  if (loading) return <Skeleton className="h-[620px]" />;
  if (error) return <ErrorState retry={() => void load()} />;

  const columns = data ? safeDatabaseColumns(data.columns) : [];
  const databaseValue = (key: string, value: unknown) => {
    if (typeof value === "boolean") return value ? t("databaseYes") : t("databaseNo");
    if (typeof value === "string" && databaseStatusTranslationKeys[value]) {
      return t(databaseStatusTranslationKeys[value]);
    }
    return String(value ?? "—");
  };

  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={copy.eyebrow}
        title={copy[entity].title}
        detail={copy[entity].detail}
        action={
          <Button variant="outline" onClick={() => setLocation("/platform")}>
            <ArrowLeft className="rtl:-scale-x-100" size={16} />
            {copy.back}
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-primary" />
            <h2 className="font-display text-lg font-semibold">
              {copy[entity].title}
            </h2>
          </div>
          <Badge tone="neutral">
            {data?.rows.length ?? 0} {copy.records}
          </Badge>
        </div>
        {data?.rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm rtl:text-right">
              <thead className="bg-muted/60">
                <tr>
                  {columns.map((column) => (
                    <th className="p-3 font-semibold" key={column}>
                      {databaseColumnTranslationKeys[column]
                        ? t(databaseColumnTranslationKeys[column])
                        : locale === "ar"
                          ? t("databaseDataField")
                          : column.replaceAll("_", " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.rows.map((row) => (
                  <tr key={String(row.id)}>
                    {columns.map((column) => (
                      <td className="max-w-[260px] truncate p-3 align-top" key={column}>
                        {typeof row[column] === "object"
                          ? JSON.stringify(row[column])
                          : databaseValue(column, row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-sm text-muted-foreground">
            {copy.noRecords}
          </div>
        )}
      </Card>
    </div>
  );
}

function PlatformAllCompaniesPage() {
  return <PlatformCompaniesPage filter="all" />;
}

function PlatformActiveCompaniesPage() {
  return <PlatformCompaniesPage filter="active" />;
}

function PlatformSuspendedCompaniesPage() {
  return <PlatformCompaniesPage filter="suspended" />;
}

function PlatformEmployeesPage() {
  return <PlatformTableMetricPage entity="employees" />;
}

function PlatformUsersPage() {
  return <PlatformTableMetricPage entity="users" />;
}

function PlatformSubscriptionsPage() {
  return <PlatformTableMetricPage entity="subscriptions" />;
}

const platformActivityPageCopy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    detail: string;
    back: string;
    actor: string;
    company: string;
    target: string;
    noActivity: string;
  }
> = {
  en: {
    eyebrow: "Platform administration",
    title: "All platform activity",
    detail: "Review every recorded administrative event across the platform.",
    back: "Back to platform control center",
    actor: "By",
    company: "Company",
    target: "Target",
    noActivity: "No platform activity recorded.",
  },
  ar: {
    eyebrow: "إدارة المنصة",
    title: "كل أنشطة المنصة",
    detail: "راجع جميع الأحداث الإدارية المسجلة عبر المنصة.",
    back: "العودة إلى مركز تحكم المنصة",
    actor: "بواسطة",
    company: "الشركة",
    target: "العنصر المتأثر",
    noActivity: "لا يوجد نشاط مسجل للمنصة.",
  },
  fr: {
    eyebrow: "Administration de la plateforme",
    title: "Toutes les activités de la plateforme",
    detail: "Consultez chaque événement administratif enregistré sur la plateforme.",
    back: "Retour au centre de contrôle",
    actor: "Par",
    company: "Entreprise",
    target: "Cible",
    noActivity: "Aucune activité de plateforme enregistrée.",
  },
  de: {
    eyebrow: "Plattformverwaltung",
    title: "Alle Plattformaktivitäten",
    detail: "Prüfen Sie alle aufgezeichneten Verwaltungsereignisse der Plattform.",
    back: "Zurück zum Plattform-Kontrollzentrum",
    actor: "Durch",
    company: "Unternehmen",
    target: "Ziel",
    noActivity: "Keine Plattformaktivitäten erfasst.",
  },
};

function PlatformActivityPage() {
  const { locale } = useI18n();
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const copy = platformActivityPageCopy[locale];
  const [activity, setActivity] = useState<PlatformActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setActivity(await authRequest<PlatformActivity[]>("/api/auth/audit"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.noActivity);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (auth.account.accountType !== "platform_owner") {
    return <WorkspaceState kind="unauthorized" />;
  }
  if (loading) return <Skeleton className="h-[620px]" />;
  if (error) return <ErrorState retry={() => void load()} />;

  return (
    <div className="min-h-[100dvh] bg-background px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {copy.eyebrow}
            </div>
            <h1 className="mt-2 font-display text-3xl font-semibold">
              {copy.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{copy.detail}</p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/platform")}>
            <ArrowLeft className="rtl:-scale-x-100" size={16} />
            {copy.back}
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border p-5">
            <Activity size={18} className="text-primary" />
            <h2 className="font-display text-lg font-semibold">{copy.title}</h2>
          </div>
          {activity.length ? (
            <div className="divide-y divide-border">
              {activity.map((event) => {
                const actor =
                  event.actorName ||
                  platformActivityLabel(locale, "actor", event.actorType) ||
                  platformActivityLabel(locale, "actor", "account");
                return (
                  <div
                    className="flex flex-wrap items-center justify-between gap-4 p-5"
                    key={event.id}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold">
                        {platformActivityLabel(locale, "action", event.action)}
                      </div>
                      <div className="mt-1 break-words text-sm text-muted-foreground">
                        {copy.target}:{" "}
                        {platformActivityLabel(
                          locale,
                          "entity",
                          event.entityType,
                        )}
                        {event.entityId ? ` · ${event.entityId}` : ""}
                        {event.companyId
                          ? ` · ${copy.company}: ${event.companyId}`
                          : ""}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {copy.actor}: {actor}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-muted-foreground">
                      {date(event.createdAt)} · {time(event.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">
              {copy.noActivity}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function PlatformCompanyDetailsPage() {
  const { locale } = useI18n();
  const auth = useAuth();
  const params = useParams<{ companyId: string }>();
  const text = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const activityText = {
    performedBy: { en: "By", ar: "بواسطة", fr: "Par", de: "Durch" }[locale],
    targetId: { en: "ID", ar: "المعرّف", fr: "ID", de: "ID" }[locale],
  };
  const activityTitle = {
    en: "All company activity",
    ar: "كل أنشطة الشركة",
    fr: "Toute l’activité de l’entreprise",
    de: "Alle Unternehmensaktivitäten",
  }[locale];
  const noActivityText = {
    en: "No company activity recorded.",
    ar: "لا يوجد نشاط مسجل للشركة.",
    fr: "Aucune activité d’entreprise enregistrée.",
    de: "Keine Unternehmensaktivitäten erfasst.",
  }[locale];
  const [details, setDetails] = useState<PlatformCompanyDetails | null>(null);
  const [backups, setBackups] = useState<BackupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerCount, setOwnerCount] = useState(0);
  const [newOwners, setNewOwners] = useState<NewCompanyOwner[]>([]);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    address: "",
    timezone: "",
    currency: "",
    employeeLimit: "",
    monthlyPrice: "",
    annualPrice: "",
  });
  const [, setLocation] = useLocation();

  const load = async () => {
    if (!params.companyId) return;
    setLoading(true);
    setError("");
    try {
      const [nextDetails, nextBackups] = await Promise.all([
        authRequest<PlatformCompanyDetails>(
          `/api/platform/companies/${encodeURIComponent(params.companyId)}/details`,
        ),
        authRequest<BackupSummary[]>(
          `/api/backups?scope=company&companyId=${encodeURIComponent(params.companyId)}`,
        ),
      ]);
      setDetails(nextDetails);
      setBackups(nextBackups);
      setCompanyForm({
        name: nextDetails.company.name,
        address: nextDetails.company.address,
        timezone: nextDetails.company.timezone,
        currency: nextDetails.company.currency,
        employeeLimit: String(nextDetails.subscription?.employeeLimit ?? 0),
        monthlyPrice: nextDetails.subscription?.monthlyPrice
          ? String(nextDetails.subscription.monthlyPrice)
          : "",
        annualPrice: nextDetails.subscription?.annualPrice
          ? String(nextDetails.subscription.annualPrice)
          : "",
      });
      setOwnerCount(nextDetails.owners.length);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : text(
              "Could not load company details.",
              "تعذر تحميل تفاصيل الشركة.",
            ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [params.companyId]);

  if (auth.account.accountType !== "platform_owner") {
    return <WorkspaceState kind="unauthorized" />;
  }
  if (loading && !details) return <Skeleton className="h-[620px]" />;
  if (error && !details) return <ErrorState retry={() => void load()} />;
  if (!details) return <WorkspaceState kind="error" />;

  const updateCompany = async () => {
    setSaving(true);
    try {
      await authRequest(
        `/api/platform/companies/${encodeURIComponent(params.companyId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name: companyForm.name,
            address: companyForm.address,
            timezone: companyForm.timezone,
            currency: companyForm.currency,
            employeeLimit: Number(companyForm.employeeLimit),
            monthlyPrice:
              companyForm.monthlyPrice === ""
                ? 0
                : Number(companyForm.monthlyPrice),
            annualPrice:
              companyForm.annualPrice === ""
                ? 0
                : Number(companyForm.annualPrice),
          }),
        },
      );
      await load();
      toast.success(text("Company updated", "تم تحديث الشركة"));
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : text("Could not update company.", "تعذر تحديث الشركة."),
      );
    } finally {
      setSaving(false);
    }
  };
  const updateOwner = async (account: AuthAccount, active: boolean) => {
    setSaving(true);
    try {
      await authRequest(`/api/auth/accounts/${account.id}`, {
        method: "PATCH",
        body: JSON.stringify({ active }),
      });
      await load();
      toast.success(text("Owner status updated", "تم تحديث حالة المالك"));
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : text("Could not update owner.", "تعذر تحديث المالك"),
      );
    } finally {
      setSaving(false);
    }
  };
  const updateOwnerDetails = async (account: AuthAccount) => {
    setSaving(true);
    try {
      await authRequest(`/api/auth/accounts/${account.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          username: account.username,
          fullName: account.fullName,
          primaryPhone: account.primaryPhone,
          backupPhones: account.backupPhones,
          email: account.email,
          backupEmails: account.backupEmails,
        }),
      });
      await load();
      toast.success(text("Owner details updated", "تم تحديث بيانات المالك"));
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : text("Could not update owner details.", "تعذر تحديث بيانات المالك"),
      );
    } finally {
      setSaving(false);
    }
  };
  const emptyOwner = (): NewCompanyOwner => ({
    fullName: "",
    username: "",
    password: "",
    primaryPhone: "",
    backupPhones: "",
    email: "",
    backupEmails: "",
  });
  const updateOwnerCount = (value: string) => {
    const count = Math.max(0, Math.min(20, Number(value) || 0));
    setOwnerCount(count);
    const additionalCount = Math.max(0, count - details.owners.length);
    setNewOwners((current) =>
      Array.from(
        { length: additionalCount },
        (_, index) => current[index] ?? emptyOwner(),
      ),
    );
  };
  const saveOwnerAccounts = async () => {
    if (
      ownerCount < details.owners.length &&
      !window.confirm(
        text(
          "The extra owner accounts will be deactivated and retained safely; they will not be deleted. Continue?",
          "سيتم تعطيل حسابات المالكين الزائدة والاحتفاظ بها بأمان، ولن يتم حذفها. هل تريد المتابعة؟",
        ),
      )
    ) {
      return;
    }
    if (newOwners.length < Math.max(0, ownerCount - details.owners.length)) {
      toast.error(
        text(
          "Complete the additional owner account fields before saving.",
          "أكمل بيانات حسابات المالكين الإضافية قبل الحفظ.",
        ),
      );
      return;
    }
    setSaving(true);
    try {
      await authRequest(
        `/api/platform/companies/${encodeURIComponent(params.companyId)}/owners`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ownerCount,
            owners: [
              ...details.owners.map((account) => ({
                id: account.id,
                username: account.username,
                fullName: account.fullName,
                primaryPhone: account.primaryPhone,
                backupPhones: account.backupPhones,
                email: account.email,
                backupEmails: account.backupEmails,
              })),
              ...newOwners.map((owner) => ({
                username: owner.username,
                fullName: owner.fullName,
                password: owner.password,
                primaryPhone: owner.primaryPhone,
                backupPhones: owner.backupPhones
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
                email: owner.email,
                backupEmails: owner.backupEmails
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })),
            ],
          }),
        },
      );
      setNewOwners([]);
      await load();
      toast.success(text("Company Owners updated", "تم تحديث مالكي الشركة"));
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : text(
              "Could not update Company Owners.",
              "تعذر تحديث مالكي الشركة.",
            ),
      );
    } finally {
      setSaving(false);
    }
  };
  const setOwnerPermanentPassword = async (account: AuthAccount) => {
    if (ownerPassword.length < 10) return;
    setSaving(true);
    try {
      await authRequest(`/api/auth/accounts/${account.id}/set-password`, {
        method: "POST",
        body: JSON.stringify({ password: ownerPassword }),
      });
      setOwnerPassword("");
      toast.success(
        text("Permanent password set", "تم تعيين كلمة المرور الدائمة"),
      );
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : text("Could not set password.", "تعذر تعيين كلمة المرور"),
      );
    } finally {
      setSaving(false);
    }
  };
  const createBackup = async () => {
    setSaving(true);
    try {
      const backup = await authRequest<BackupSummary>("/api/backups", {
        method: "POST",
        body: JSON.stringify({ scope: "company", companyId: params.companyId }),
      });
      setBackups((current) => [backup, ...current]);
      toast.success(
        text("Company backup created", "تم إنشاء نسخة احتياطية للشركة"),
      );
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : text("Could not create company backup.", "تعذر إنشاء نسخة الشركة"),
      );
    } finally {
      setSaving(false);
    }
  };
  const restoreBackupForCompany = async (backup: BackupSummary) => {
    if (
      !window.confirm(
        text(
          "Restore this company backup? A safety backup will be created first.",
          "استعادة نسخة الشركة؟ سيتم إنشاء نسخة أمان أولاً.",
        ),
      )
    )
      return;
    setSaving(true);
    try {
      await authRequest(`/api/backups/${backup.id}/restore`, {
        method: "POST",
        body: JSON.stringify({ confirmation: "RESTORE" }),
      });
      await load();
      toast.success(text("Company data restored", "تمت استعادة بيانات الشركة"));
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : text("Could not restore backup.", "تعذر استعادة النسخة"),
      );
    } finally {
      setSaving(false);
    }
  };
  const status = details.company.active
    ? text("Active", "نشطة")
    : text("Suspended", "موقوفة");
  const operationalGroups = [
    [
      "Payroll",
      [
        "var_hr_payroll_periods",
        "var_hr_payroll_calculations",
        "var_hr_payroll_adjustments",
      ],
    ],
    [
      "Attendance",
      [
        "var_hr_attendance",
        "var_hr_attendance_locations",
        "var_hr_biometric_events",
        "var_hr_biometric_sync_history",
      ],
    ],
    [
      "People & structure",
      [
        "var_hr_departments",
        "var_hr_branches",
        "var_hr_employees",
        "var_hr_employee_hr_records",
        "var_hr_employee_identities",
      ],
    ],
    [
      "Attendance rules & shift organization",
      [
        "var_hr_attendance_rules",
        "var_hr_work_schedules",
        "var_hr_holidays",
        "var_hr_leave_balances",
        "var_hr_leave_requests",
        "var_hr_permission_requests",
      ],
    ],
  ] as const;
  const operationalTableLabels: Record<string, string> = {
    var_hr_payroll_periods: "فترات الرواتب",
    var_hr_payroll_calculations: "حسابات الرواتب",
    var_hr_payroll_adjustments: "تسويات الرواتب",
    var_hr_attendance: "سجلات الحضور والانصراف",
    var_hr_attendance_locations: "مواقع الحضور",
    var_hr_biometric_events: "أحداث البصمة",
    var_hr_biometric_sync_history: "سجل مزامنة البصمة",
    var_hr_departments: "الأقسام",
    var_hr_branches: "الفروع",
    var_hr_employees: "الموظفون",
    var_hr_employee_hr_records: "سجلات الموارد البشرية للموظفين",
    var_hr_employee_identities: "هويات الموظفين",
    var_hr_attendance_rules: "قواعد الحضور والانصراف",
    var_hr_work_schedules: "تنظيم الشيفتات",
    var_hr_holidays: "العطلات",
    var_hr_leave_balances: "أرصدة الإجازات",
    var_hr_leave_requests: "طلبات الإجازات",
    var_hr_permission_requests: "طلبات الأذونات",
  };
  return (
    <div className="company-details-page min-w-0 max-w-full animate-in space-y-6 overflow-x-clip break-words">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton />
        <Badge tone={details.company.active ? "accent" : "neutral"}>
          {status}
        </Badge>
      </div>
      <SectionTitle
        eyebrow={text("Platform administration", "إدارة المنصة")}
        title={details.company.name}
        detail={text(
          "Company details and support controls",
          "تفاصيل الشركة وأدوات الدعم",
        )}
        action={
          <Button
            variant="outline"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw size={15} />
            {text("Refresh", "تحديث")}
          </Button>
        }
      />

      <Card className="border-primary/20 bg-primary/[.04] p-5">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-primary" />
          <h2 className="font-display text-lg font-semibold">
            {text(
              "Platform Owner-entered company information",
              "بيانات الشركة التي أدخلها مالك المنصة",
            )}
          </h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Info
            label={text("Company name", "اسم الشركة")}
            value={details.company.name}
          />
          <Info
            label={text("Address", "العنوان")}
            value={details.company.address || "—"}
          />
          <Info label={text("Slug", "المعرّف")} value={details.company.slug} />
          <Info
            label={text("Timezone", "المنطقة الزمنية")}
            value={details.company.timezone}
          />
          <Info
            label={text("Currency", "العملة")}
            value={details.company.currency}
          />
          <Info
            label={text("Registration date", "تاريخ التسجيل")}
            value={date(details.company.createdAt)}
          />
          <Info
            label={text("Subscription", "الاشتراك")}
            value={
              details.subscription
                ? `${details.subscription.planName} · ${details.subscription.status}`
                : text("Not configured", "غير مهيأ")
            }
          />
          <Info
            label={text("Employee limit", "حد الموظفين")}
            value={details.subscription?.employeeLimit ?? "—"}
          />
          <Info
            label={text("Monthly price", "السعر الشهري")}
            value={
              details.subscription?.monthlyPrice
                ? `${details.subscription.monthlyPrice} ${details.company.currency}`
                : "—"
            }
          />
          <Info
            label={text("Annual price", "السعر السنوي")}
            value={
              details.subscription?.annualPrice
                ? `${details.subscription.annualPrice} ${details.company.currency}`
                : "—"
            }
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserRound size={18} className="text-primary" />
              <div>
                <h2 className="font-display text-lg font-semibold">
                  {text("Company Owners", "مالكو الشركة")}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {text(
                    "Edit owner details or adjust the number of owner accounts.",
                    "عدّل بيانات المالكين أو غيّر عدد حسابات مالكي الشركة.",
                  )}
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-end">
              <Field
                label={text("Number of Company Owners", "عدد مالكي الشركة")}
                type="number"
                min="0"
                value={String(ownerCount)}
                onChange={updateOwnerCount}
              />
              <Button
                variant="outline"
                disabled={saving}
                onClick={() => void saveOwnerAccounts()}
              >
                {text("Save owner changes", "حفظ تغييرات المالكين")}
              </Button>
            </div>
          </div>
          {ownerCount < details.owners.length && (
            <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 p-3 text-xs leading-relaxed text-primary-dark">
              {text(
                "Reducing the count will deactivate the extra owner accounts and retain them for audit and recovery. No accounts will be deleted.",
                "سيؤدي تقليل العدد إلى تعطيل حسابات المالكين الزائدة والاحتفاظ بها للتدقيق والاسترداد. لن يتم حذف أي حساب.",
              )}
            </div>
          )}
          <div className="mt-4 space-y-4">
            {details.owners.length ? (
              details.owners.map((account) => (
                <div
                  className="rounded-xl border border-border p-4"
                  key={account.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold">
                        {account.fullName || account.username}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {account.username} ·{" "}
                        {account.active
                          ? text("Active", "نشط")
                          : text("Inactive", "غير نشط")}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      disabled={saving}
                      onClick={() => void updateOwner(account, !account.active)}
                    >
                      {account.active
                        ? text("Deactivate", "تعطيل")
                        : text("Activate", "تفعيل")}
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field
                      label={text("Owner full name", "الاسم الكامل للمالك")}
                      value={account.fullName}
                      onChange={(value) =>
                        setDetails((current) =>
                          current
                            ? {
                                ...current,
                                owners: current.owners.map((item) =>
                                  item.id === account.id
                                    ? { ...item, fullName: value }
                                    : item,
                                ),
                              }
                            : current,
                        )
                      }
                    />
                    <Field
                      label={text("Username", "اسم المستخدم")}
                      value={account.username}
                      onChange={(value) =>
                        setDetails((current) =>
                          current
                            ? {
                                ...current,
                                owners: current.owners.map((item) =>
                                  item.id === account.id
                                    ? { ...item, username: value }
                                    : item,
                                ),
                              }
                            : current,
                        )
                      }
                    />
                    <Field
                      label={text("Primary phone", "الهاتف الأساسي")}
                      value={account.primaryPhone}
                      onChange={(value) =>
                        setDetails((current) =>
                          current
                            ? {
                                ...current,
                                owners: current.owners.map((item) =>
                                  item.id === account.id
                                    ? { ...item, primaryPhone: value }
                                    : item,
                                ),
                              }
                            : current,
                        )
                      }
                    />
                    <Field
                      label={text(
                        "Backup phone numbers",
                        "أرقام الهواتف الاحتياطية",
                      )}
                      value={account.backupPhones.join(", ")}
                      onChange={(value) =>
                        setDetails((current) =>
                          current
                            ? {
                                ...current,
                                owners: current.owners.map((item) =>
                                  item.id === account.id
                                    ? {
                                        ...item,
                                        backupPhones: value
                                          .split(",")
                                          .map((entry) => entry.trim())
                                          .filter(Boolean),
                                      }
                                    : item,
                                ),
                              }
                            : current,
                        )
                      }
                    />
                    <Field
                      label={text("Email", "البريد الإلكتروني")}
                      type="email"
                      value={account.email}
                      onChange={(value) =>
                        setDetails((current) =>
                          current
                            ? {
                                ...current,
                                owners: current.owners.map((item) =>
                                  item.id === account.id
                                    ? { ...item, email: value }
                                    : item,
                                ),
                              }
                            : current,
                        )
                      }
                    />
                    <Field
                      label={text(
                        "Backup emails",
                        "البريد الإلكتروني الاحتياطي",
                      )}
                      type="email"
                      value={account.backupEmails.join(", ")}
                      onChange={(value) =>
                        setDetails((current) =>
                          current
                            ? {
                                ...current,
                                owners: current.owners.map((item) =>
                                  item.id === account.id
                                    ? {
                                        ...item,
                                        backupEmails: value
                                          .split(",")
                                          .map((entry) => entry.trim())
                                          .filter(Boolean),
                                      }
                                    : item,
                                ),
                              }
                            : current,
                        )
                      }
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      disabled={saving}
                      onClick={() => void updateOwnerDetails(account)}
                    >
                      {text("Save owner details", "حفظ بيانات المالك")}
                    </Button>
                    <input
                      className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
                      type="password"
                      placeholder={text(
                        "New permanent password",
                        "كلمة مرور دائمة جديدة",
                      )}
                      value={ownerPassword}
                      onChange={(event) => setOwnerPassword(event.target.value)}
                    />
                    <Button
                      disabled={saving || ownerPassword.length < 10}
                      onClick={() => void setOwnerPermanentPassword(account)}
                    >
                      {text("Set password", "تعيين كلمة المرور")}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <Empty
                title={text(
                  "No Company Owner accounts found.",
                  "لم يتم العثور على حسابات مالكي الشركة.",
                )}
                detail=""
              />
            )}
          </div>
        </Card>
        {newOwners.length > 0 && (
          <Card className="p-5 lg:col-span-2">
            <div className="mb-3 flex items-center gap-2">
              <UserPlus size={16} className="text-primary" />
              <h2 className="font-display text-lg font-semibold">
                {text("Additional owner accounts", "حسابات المالكين الإضافية")}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {newOwners.map((owner, index) => (
                <div
                  className="rounded-xl border border-primary/30 bg-primary/[.03] p-4"
                  key={`new-owner-${index}`}
                >
                  <div className="mb-3 font-semibold">
                    {text("New owner account", "حساب مالك جديد")} {index + 1}
                  </div>
                  <div className="space-y-3">
                    <Field
                      label={text("Owner full name", "الاسم الكامل للمالك")}
                      value={owner.fullName}
                      onChange={(value) =>
                        setNewOwners((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, fullName: value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Field
                      label={text("Username", "اسم المستخدم")}
                      required
                      value={owner.username}
                      onChange={(value) =>
                        setNewOwners((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, username: value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Field
                      label={text("Permanent password", "كلمة المرور الدائمة")}
                      type="password"
                      required
                      value={owner.password}
                      onChange={(value) =>
                        setNewOwners((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, password: value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Field
                      label={text("Primary phone", "الهاتف الأساسي")}
                      value={owner.primaryPhone}
                      onChange={(value) =>
                        setNewOwners((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, primaryPhone: value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Field
                      label={text(
                        "Backup phone numbers",
                        "أرقام الهواتف الاحتياطية",
                      )}
                      value={owner.backupPhones}
                      onChange={(value) =>
                        setNewOwners((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, backupPhones: value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Field
                      label={text("Email", "البريد الإلكتروني")}
                      type="email"
                      value={owner.email}
                      onChange={(value) =>
                        setNewOwners((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, email: value }
                              : item,
                          ),
                        )
                      }
                    />
                    <Field
                      label={text(
                        "Backup emails",
                        "البريد الإلكتروني الاحتياطي",
                      )}
                      value={owner.backupEmails}
                      onChange={(value) =>
                        setNewOwners((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, backupEmails: value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            <h2 className="font-display text-lg font-semibold">
              {text(
                "Live operational overview",
                "نظرة على البيانات التشغيلية الحالية",
              )}
            </h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Info
              label={text("Employees", "الموظفون")}
              value={details.employees.length}
            />
             <Info
               label={text("Administrative accounts", "الحسابات الإدارية")}
               value={details.administrativeAccounts.length}
             />
             <Info
               label={text("Managers / Supervisors / HR", "مديرون / مشرفون / HR")}
               value={`${details.roleGroups.managers.length} / ${details.roleGroups.supervisors.length} / ${details.roleGroups.hr.length}`}
             />
            <Info
              label={text("Biometric devices", "أجهزة البصمة")}
              value={details.devices.length}
            />
            <Info
              label={text("Integrity checksum", "بصمة التكامل")}
              value={details.integrity.checksum.slice(0, 16) + "…"}
            />
          </div>
          <div className="mt-4 space-y-3">
            {operationalGroups.map(([label, tables]) => (
              <div className="rounded-lg bg-muted/60 p-3" key={label}>
                <div className="text-sm font-semibold">
                  {text(
                    label,
                    label === "Payroll"
                      ? "الرواتب"
                      : label === "Attendance"
                        ? "الحضور والانصراف"
                        : label === "People & structure"
                          ? "الموظفون"
                          : "القواعد",
                  )}
                </div>
                <div className="mt-2 grid min-w-0 grid-cols-2 gap-1 text-xs text-muted-foreground">
                  {tables.map((table) => (
                    <span className="min-w-0 break-words" key={table}>
                      {operationalTableLabels[table]}:{" "}
                      {details.tableCounts[table] ?? 0}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-primary" />
          <h2 className="font-display text-lg font-semibold">
            {text("People and biometric devices", "الأفراد وأجهزة البصمة")}
          </h2>
        </div>
        <div className="mt-4 grid min-w-0 gap-6 lg:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold">
              {text("Staff accounts", "حسابات الموظفين الإداريين")}
            </h3>
            <div className="mt-2 space-y-1 text-sm">
              {details.staff.length ? (
                details.staff.map((account) => (
                  <div key={account.id}>
                    {account.fullName || account.username}{" "}
                    <span className="text-muted-foreground">
                      · {account.displayRole}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              {text("Employees", "الموظفون")}
            </h3>
            <div className="mt-2 space-y-1 text-sm">
              {details.employees.length ? (
                details.employees.map((employee) => (
                  <div key={String(employee.id)}>
                    {String(employee.first_name ?? "")}{" "}
                    {String(employee.last_name ?? "")}
                  </div>
                ))
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              {text("Biometric devices", "أجهزة البصمة")}
            </h3>
            <div className="mt-2 space-y-1 text-sm">
              {details.devices.length ? (
                details.devices.map((device) => (
                  <div key={String(device.id)}>
                    {String(device.name ?? "Unnamed")}{" "}
                    <span className="text-muted-foreground">
                      · {String(device.status ?? "unknown")}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-primary" />
            <h2 className="font-display text-lg font-semibold">
              {text("Administrative accounts by role", "الحسابات الإدارية حسب الدور")}
            </h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { label: text("Managers", "المديرون"), accounts: details.roleGroups.managers },
              { label: text("Supervisors", "المشرفون"), accounts: details.roleGroups.supervisors },
              { label: text("HR", "الموارد البشرية"), accounts: details.roleGroups.hr },
            ].map(({ label, accounts }) => (
              <div className="rounded-lg border border-border p-3" key={String(label)}>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  {accounts.length ? (
                    accounts.map((account) => (
                      <div key={account.id}>
                        {account.fullName || account.username}
                        <span className="text-muted-foreground">
                          {" "}· {account.displayRole} ·{" "}
                          {account.active
                            ? text("Active", "نشط")
                            : text("Inactive", "غير نشط")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Network size={18} className="text-primary" />
            <h2 className="font-display text-lg font-semibold">
              {text("Organization and configuration", "التنظيم والإعدادات")}
            </h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Info label={text("Branches", "الفروع")} value={details.organization.branchCount} />
            <Info label={text("Departments", "الأقسام")} value={details.organization.departments.length} />
            <Info label={text("Attendance rules", "قواعد الحضور")} value={details.configuration.attendanceRules} />
            <Info label={text("Work schedules", "جداول العمل")} value={details.configuration.workSchedules} />
            <Info label={text("Leave records", "سجلات الإجازات")} value={details.configuration.leavePolicies} />
            <Info label={text("Payroll periods", "فترات الرواتب")} value={details.configuration.payrollPeriods} />
          </div>
          <div className="mt-4 space-y-2">
            {details.organization.departments.length ? (
              details.organization.departments.map((department) => (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 p-3 text-sm" key={department.id}>
                  <span>{department.name}</span>
                  <span className="text-muted-foreground">
                    {department.employeeCount} {text("employees", "موظف")}
                    {department.managerId ? ` · ${text("manager assigned", "يوجد مدير")}` : ""}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          <h2 className="font-display text-lg font-semibold">
            {activityTitle}
          </h2>
        </div>
        <div className="mt-4 max-h-[680px] space-y-2 overflow-y-auto pr-1">
          {details.activity.length ? (
            details.activity.map((event) => {
              const actor =
                event.actorName ||
                platformActivityLabel(locale, "actor", event.actorType) ||
                platformActivityLabel(locale, "actor", "system");
              return (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 p-3 text-sm"
                  key={event.id}
                >
                  <div className="min-w-0">
                    <div className="font-semibold">
                      {platformActivityLabel(locale, "action", event.action)}
                    </div>
                    <div className="mt-1 break-words text-xs text-muted-foreground">
                      {platformActivityLabel(
                        locale,
                        "entity",
                        event.entityType,
                      )}
                      {event.entityId
                        ? ` · ${activityText.targetId}: ${event.entityId}`
                        : ""}
                      {` · ${activityText.performedBy}: ${actor}`}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {date(event.createdAt)} · {time(event.createdAt)}
                  </span>
                </div>
              );
            })
          ) : (
            <span className="text-sm text-muted-foreground">{noActivityText}</span>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-primary" />
          <h2 className="font-display text-lg font-semibold">
            {text("Company settings", "إعدادات الشركة")}
          </h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Field
            label={text("Company name", "اسم الشركة")}
            value={companyForm.name}
            onChange={(value) =>
              setCompanyForm({ ...companyForm, name: value })
            }
          />
          <Field
            label={text("Address", "العنوان")}
            value={companyForm.address}
            onChange={(value) =>
              setCompanyForm({ ...companyForm, address: value })
            }
          />
          <Field
            label={text("Timezone", "المنطقة الزمنية")}
            value={companyForm.timezone}
            onChange={(value) =>
              setCompanyForm({ ...companyForm, timezone: value })
            }
          />
          <Field
            label={text("Currency", "العملة")}
            value={companyForm.currency}
            onChange={(value) =>
              setCompanyForm({ ...companyForm, currency: value.toUpperCase() })
            }
          />
          <Field
            label={text("Employee limit", "حد الموظفين")}
            value={companyForm.employeeLimit}
            onChange={(value) =>
              setCompanyForm({ ...companyForm, employeeLimit: value })
            }
            type="number"
          />
          <Field
            label={text("Monthly subscription price", "سعر الاشتراك الشهري")}
            value={companyForm.monthlyPrice}
            onChange={(value) =>
              setCompanyForm({ ...companyForm, monthlyPrice: value })
            }
            type="number"
            min="0"
          />
          <Field
            label={text("Annual subscription price", "سعر الاشتراك السنوي")}
            value={companyForm.annualPrice}
            onChange={(value) =>
              setCompanyForm({ ...companyForm, annualPrice: value })
            }
            type="number"
            min="0"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button disabled={saving} onClick={() => void updateCompany()}>
            {text("Save company settings", "حفظ إعدادات الشركة")}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-primary" />
            <h2 className="font-display text-lg font-semibold">
              {text("Company backups", "نسخ الشركة الاحتياطية")}
            </h2>
          </div>
          <Button disabled={saving} onClick={() => void createBackup()}>
            <Database size={15} />
            {text("Create Company Backup", "إنشاء نسخة احتياطية للشركة")}
          </Button>
        </div>
        <div className="mt-4 space-y-2">
          {backups.length ? (
            backups.map((backup) => (
              <div
                className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/60 p-3 text-sm"
                key={backup.id}
              >
                <div className="min-w-0 flex-1">
                  <div>
                    {new Date(backup.createdAt).toLocaleString(
                      locale === "ar" ? "ar-EG" : "en-GB",
                    )}
                  </div>
                  <div className="break-all text-xs text-muted-foreground">
                    {backup.checksum}
                  </div>
                </div>
                <Button
                  variant="outline"
                  disabled={saving}
                  onClick={() => void restoreBackupForCompany(backup)}
                >
                  {text("Restore", "استعادة")}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              {text("No company backups available.", "لا توجد نسخ للشركة.")}
            </p>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <details>
          <summary className="cursor-pointer font-semibold">
            {text(
              "View all company-owned operational records",
              "عرض جميع سجلات الشركة التشغيلية",
            )}
          </summary>
          <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-muted/60 p-4 text-xs text-muted-foreground">
            {JSON.stringify(details.operationalData, null, 2)}
          </pre>
        </details>
      </Card>
      <div className="flex justify-start">
        <Button variant="outline" onClick={() => setLocation("/platform")}>
          <Network size={15} />
          {text(
            "Back to Platform control center",
            "العودة إلى مركز تحكم المنصة",
          )}
        </Button>
      </div>
    </div>
  );
}

function AddCompanyPage() {
  const { locale } = useI18n();
  const [, setLocation] = useLocation();
  const text = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const emptyOwner = (): NewCompanyOwner => ({
    fullName: "",
    username: "",
    password: "",
    primaryPhone: "",
    backupPhones: "",
    email: "",
    backupEmails: "",
  });
  const [company, setCompany] = useState({
    name: "",
    address: "",
    currency: "",
    employeeLimit: "",
    monthlyPrice: "",
    annualPrice: "",
    ownerCount: "0",
  });
  const [owners, setOwners] = useState<NewCompanyOwner[]>([]);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{
    name: string;
    usernames: string[];
  } | null>(null);

  const updateOwnerCount = (value: string) => {
    const count = Math.max(0, Math.min(20, Number(value) || 0));
    setCompany((current) => ({ ...current, ownerCount: String(count) }));
    setOwners((current) =>
      Array.from(
        { length: count },
        (_, index) => current[index] ?? emptyOwner(),
      ),
    );
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await authRequest<{
        company: { name: string };
        owners: AuthAccount[];
      }>("/api/platform/companies", {
        method: "POST",
        body: JSON.stringify({
          name: company.name,
          address: company.address,
          ...(company.currency
            ? { currency: company.currency.toUpperCase() }
            : {}),
          ...(company.employeeLimit
            ? { employeeLimit: Number(company.employeeLimit) }
            : {}),
          ownerCount: Number(company.ownerCount),
          ...(company.monthlyPrice
            ? { monthlyPrice: Number(company.monthlyPrice) }
            : {}),
          ...(company.annualPrice
            ? { annualPrice: Number(company.annualPrice) }
            : {}),
          owners: owners.map((owner) => ({
            ...owner,
            backupPhones: owner.backupPhones
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            backupEmails: owner.backupEmails
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          })),
          active: true,
        }),
      });
      setResult({
        name: response.company.name,
        usernames: response.owners.map((owner) => owner.username),
      });
      toast.success(
        text(
          "Company and owner accounts created",
          "تم إنشاء الشركة وحسابات المالكين",
        ),
      );
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : text("Could not create company.", "تعذر إنشاء الشركة."),
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={text("Platform administration", "إدارة المنصة")}
        title={text("Add Company", "إضافة شركة")}
        detail={text(
          "Create a company workspace and its owner accounts.",
          "أنشئ مساحة عمل للشركة وحسابات مالكيها.",
        )}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/platform")}
          >
            {locale === "ar" ? (
              <ArrowRight size={15} />
            ) : (
              <ArrowLeft size={15} />
            )}
            {text("Back to companies", "العودة إلى الشركات")}
          </Button>
        }
      />
      {result ? (
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="font-semibold">
              {text("Company created successfully", "تم إنشاء الشركة بنجاح")}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {result.name}
            </div>
          </div>
          <div className="rounded-xl bg-muted/60 p-4">
            <div className="text-sm font-semibold">
              {text(
                "Created owner usernames",
                "أسماء مستخدمي المالكين المنشأة",
              )}
            </div>
            <div className="mt-2 space-y-1 font-mono text-sm">
              {result.usernames.map((username) => (
                <div key={username}>{username}</div>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={() => setLocation("/platform")}>
            {text("Done", "تم")}
          </Button>
        </div>
      ) : (
        <form
          className="mx-auto max-w-2xl space-y-4 sm:space-y-5"
          onSubmit={(event) => void submit(event)}
        >
          <section className="rounded-2xl border border-border bg-muted/25 p-4 sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary shadow-sm">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  {text("Company information", "معلومات الشركة")}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {text(
                    "Set the identity and operating defaults for this workspace.",
                    "أدخل هوية مساحة العمل وإعداداتها التشغيلية الأساسية.",
                  )}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label={text("Company name", "اسم الشركة")}
                required
                value={company.name}
                onChange={(value) => setCompany({ ...company, name: value })}
              />
              <Field
                label={text("Currency", "العملة")}
                value={company.currency}
                onChange={(value) =>
                  setCompany({ ...company, currency: value })
                }
              />
              <label className="text-sm font-semibold sm:col-span-2">
                {text("Company address", "عنوان الشركة")}
                <textarea
                  className="mt-2 min-h-20 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm font-normal"
                  value={company.address}
                  onChange={(event) =>
                    setCompany({ ...company, address: event.target.value })
                  }
                />
              </label>
              <Field
                label={text("Employee limit", "حد الموظفين")}
                type="number"
                value={company.employeeLimit}
                onChange={(value) =>
                  setCompany({ ...company, employeeLimit: value })
                }
              />
              <Field
                label={text("Number of company owners", "عدد مالكي الشركة")}
                type="number"
                min="0"
                value={company.ownerCount}
                onChange={updateOwnerCount}
              />
            </div>
          </section>
          <section className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 sm:p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-dark">
                <Coins size={18} />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  {text("Subscription pricing", "أسعار الاشتراك")}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {text(
                    "Define the pricing reference for this company subscription.",
                    "حدد مرجع التسعير لاشتراك هذه الشركة.",
                  )}
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label={text("Monthly price", "السعر الشهري")}
                type="number"
                value={company.monthlyPrice}
                onChange={(value) =>
                  setCompany({ ...company, monthlyPrice: value })
                }
              />
              <Field
                label={text("Annual price", "السعر السنوي")}
                type="number"
                value={company.annualPrice}
                onChange={(value) =>
                  setCompany({ ...company, annualPrice: value })
                }
              />
            </div>
          </section>
          <section className="rounded-2xl border border-secondary/15 bg-secondary/[0.03] p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {text("Company owner accounts", "حسابات مالكي الشركة")}
                  </h3>
                  <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
                    {text(
                      "Create secure sign-in accounts for the people who will manage this company.",
                      "أنشئ حسابات دخول آمنة للأشخاص الذين سيديرون هذه الشركة.",
                    )}
                  </p>
                </div>
              </div>
              <div className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary-dark">
                {company.ownerCount} {text("owner accounts", "حسابات مالك")}
              </div>
            </div>
            <div className="space-y-3">
              {owners.map((owner, index) => (
                <div
                  className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"
                  key={index}
                >
                  <div className="mb-4 flex items-center gap-2 border-b border-border/70 pb-3">
                    <div className="grid size-7 place-items-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">
                        {text("Owner account", "حساب المالك")} {index + 1}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {text(
                          "Account details and recovery contacts",
                          "بيانات الحساب ووسائل الاسترداد",
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        ["fullName", text("Full name", "الاسم الكامل")],
                        ["username", text("Username", "اسم المستخدم")],
                        [
                          "password",
                          text("Permanent password", "كلمة المرور الدائمة"),
                        ],
                        [
                          "primaryPhone",
                          text("Primary phone", "الهاتف الأساسي"),
                        ],
                        [
                          "backupPhones",
                          text(
                            "Backup phones (comma separated)",
                            "هواتف احتياطية (مفصولة بفواصل)",
                          ),
                        ],
                        ["email", text("Email address", "البريد الإلكتروني")],
                        [
                          "backupEmails",
                          text(
                            "Backup emails (comma separated)",
                            "بريد احتياطي (مفصول بفواصل)",
                          ),
                        ],
                      ] as const
                    ).map(([key, label]) => (
                      <Field
                        key={key}
                        label={label}
                        type={
                          key === "password"
                            ? "password"
                            : key === "email" || key === "backupEmails"
                              ? "email"
                              : "text"
                        }
                        required={["username", "password"].includes(key)}
                        value={owner[key]}
                        onChange={(value) =>
                          setOwners((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, [key]: value }
                                : item,
                            ),
                          )
                        }
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="quiet"
              className="w-full sm:w-auto"
              onClick={() => setLocation("/platform")}
            >
              {text("Cancel", "إلغاء")}
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={saving}
            >
              {saving
                ? text("Creating…", "جارٍ الإنشاء…")
                : text("Create company", "إنشاء الشركة")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  className = "",
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-secondary/45 p-4">
      <div className="flex min-h-full items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-md)] animate-in sm:p-6",
            className,
          )}
        >
          <div className="mb-5 flex shrink-0 items-center justify-between">
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            <Button
              variant="quiet"
              className="p-2"
              onClick={onClose}
              aria-label={t("closeDialog")}
            >
              <X size={18} />
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer}
        </div>
      </div>
    </div>
  );
}
function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  min,
  max,
  step,
  inputMode,
  required = false,
  autoComplete,
  placeholder,
  showPasswordToggle = false,
  showPasswordLabel = "",
  hidePasswordLabel = "",
  error,
  placeholderAlign,
  authStyle = false,
}: {
  label: string;
  name?: string;
  value: any;
  onChange: (value: string) => void;
  type?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  inputMode?:
    | "none"
    | "text"
    | "decimal"
    | "numeric"
    | "tel"
    | "search"
    | "email"
    | "url";
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  showPasswordToggle?: boolean;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  error?: string;
  placeholderAlign?: "left" | "right";
  authStyle?: boolean;
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const inputType =
    showPasswordToggle && type === "password"
      ? passwordVisible
        ? "text"
        : "password"
      : type;
  return (
    <label
      className={`block text-sm font-semibold ${
        authStyle ? "text-foreground" : ""
      }`}
    >
      <span className="block">{label}</span>
      <div className="relative">
        <input
          name={name}
          data-testid={name ? `input-${name}` : undefined}
          required={required}
          type={inputType}
          min={min}
          max={max}
          step={step}
          inputMode={
            inputMode ?? (authStyle && type === "text" ? "tel" : undefined)
          }
          dir={authStyle ? "ltr" : undefined}
          spellCheck={false}
          autoCapitalize={authStyle ? "none" : undefined}
          autoCorrect={authStyle ? "off" : undefined}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`mt-2 h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15 ${
            showPasswordToggle ? "pe-11" : ""
          } ${authStyle ? "text-foreground" : ""} ${
            placeholderAlign === "right" ? "placeholder:text-right" : ""
          } ${error ? "border-destructive focus:border-destructive focus:ring-destructive/15" : ""}`}
          aria-invalid={Boolean(error)}
        />
        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            className="absolute end-3 top-1/2 -translate-y-[calc(50%-1px)] rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={passwordVisible ? hidePasswordLabel : showPasswordLabel}
            title={passwordVisible ? hidePasswordLabel : showPasswordLabel}
          >
            {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error && (
        <span className="mt-1 block text-xs font-normal text-destructive">
          {error}
        </span>
      )}
    </label>
  );
}
function EmployeeProfileSection({
  title,
  detail,
  icon,
  children,
}: {
  title: string;
  detail?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <h4 className="font-display text-base font-semibold">{title}</h4>
          {detail && (
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              {detail}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

function EmployeeMovementPage() {
  const { t } = useI18n();
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const { employeeId = "" } = useParams<{ employeeId: string }>();
  const workspace = useGetWorkspace();
  const employee = useGetEmployee(employeeId, {
    query: {
      enabled: Boolean(employeeId),
      queryKey: getGetEmployeeQueryKey(employeeId),
    },
  });
  const isSelf = auth.account.accountType === "employee";
  const canPrint = !isSelf;

  if (isSelf && auth.account.employeeId !== employeeId) {
    return <Redirect to="/profile" />;
  }

  const returnPath = isSelf ? "/profile" : `/employees/${employeeId}`;
  if (employee.isLoading || workspace.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-32" />
        <Skeleton className="h-56" />
      </div>
    );
  }
  if (employee.isError || !employee.data) {
    return (
      <div className="space-y-5">
        <Button
          variant="quiet"
          onClick={() => setLocation(returnPath)}
          data-testid="button-back-from-attendance-movement"
        >
          <ArrowLeft size={16} />
          {t("backToEmployeeProfile")}
        </Button>
        <Card>
          <Empty
            title={t("employeeProfileLoadFailed")}
            detail={t("checkWorkspace")}
            action={
              <Button variant="outline" onClick={() => employee.refetch()}>
                {t("retry")}
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-in space-y-5">
      <Button
        variant="quiet"
        onClick={() => setLocation(returnPath)}
        data-testid="button-back-from-attendance-movement"
      >
        <ArrowLeft size={16} />
        {t("backToEmployeeProfile")}
      </Button>
      <Card className="relative overflow-hidden border-primary/15 bg-gradient-to-br from-primary/[0.12] via-primary/[0.045] to-card p-5 sm:p-6">
        <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-card text-lg font-bold text-primary shadow-sm ring-1 ring-primary/15">
              {employee.data.avatarInitials ||
                `${employee.data.firstName[0]}${employee.data.lastName[0]}`}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
                {t("employeeProfile")}
              </p>
              <h1 className="mt-1 truncate font-display text-2xl font-semibold sm:text-3xl">
                {employee.data.firstName} {employee.data.lastName}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("employeeNumber")}: {employee.data.employeeNumber}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Badge tone="accent">{roleLabel(employee.data.role, t)}</Badge>
            <Status value={employee.data.status} />
          </div>
        </div>
      </Card>
      <EmployeeAttendanceMovement
        employeeId={employee.data.id}
        employeeName={`${employee.data.firstName} ${employee.data.lastName}`}
        biometricCode={employee.data.biometricCode}
        canPrint={canPrint}
        fullPage
      />
    </div>
  );
}

function scheduleDayLabel(
  value: string,
  t: (key: AppCopyKey) => string,
) {
  const key: Record<string, AppCopyKey> = {
    Sun: "daySun",
    Mon: "dayMon",
    Tue: "dayTue",
    Wed: "dayWed",
    Thu: "dayThu",
    Fri: "dayFri",
    Sat: "daySat",
  };
  return key[value] ? t(key[value]) : value;
}

function Info({
  label,
  value,
  testId,
}: {
  label: string;
  value: any;
  testId?: string;
}) {
  return (
    <div
      className="rounded-lg bg-muted/60 p-3"
      data-testid={testId}
    >
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-medium">{value || "—"}</div>
    </div>
  );
}

function LocalizedErrorFallback({ resetError }: ErrorFallbackProps) {
  const { t } = useI18n();
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6"
      dir="inherit"
    >
      <div className="max-w-lg w-full text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          {t("errorTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-600">{t("errorDetail")}</p>
        <button
          type="button"
          onClick={resetError}
          className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          {t("tryAgain")}
        </button>
      </div>
    </div>
  );
}

function NotFoundRoute() {
  const { t } = useI18n();
  return <NotFound title={t("notFoundTitle")} detail={t("notFoundDetail")} />;
}

function I18nProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem("var-hr-locale");
    return saved === "ar" || saved === "fr" || saved === "de" ? saved : "en";
  });
  useEffect(() => {
    localStorage.setItem("var-hr-locale", locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    queryClient.invalidateQueries();
  }, [locale, queryClient]);
  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: AppCopyKey) =>
        dictionaries[locale][key] ?? dictionaries.en[key] ?? key,
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
function Router() {
  const auth = useAuth();
  const [location] = useLocation();
  const employeeAllowedPaths = ["/", "/profile", "/attendance", "/requests", "/payroll"];
  const isOwnMovementPath =
    /^\/employees\/[^/]+\/movement$/.test(location) &&
    location.split("/")[2] === auth.account.employeeId;
  if (
    auth.account.accountType === "employee" &&
    !employeeAllowedPaths.includes(location) &&
    !isOwnMovementPath
  ) {
    return <Redirect to="/" />;
  }
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Overview} />
        <Route path="/profile" component={Profile} />
        <Route path="/employees/new" component={AddEmployeePage} />
        <Route
          path="/employees/:employeeId/movement"
          component={EmployeeMovementPage}
        />
        <Route path="/employees/:employeeId" component={EmployeeProfilePage} />
        <Route path="/employees" component={Employees} />
        <Route path="/departments" component={Departments} />
        <Route path="/branches" component={Branches} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/requests" component={Requests} />
        <Route path="/rules" component={Rules} />
        <Route path="/reports" component={Reports} />
        <Route path="/payroll" component={Payroll} />
        <Route path="/schedules" component={SchedulesRoute} />
        <Route path="/holidays" component={Holidays} />
        <Route path="/devices" component={Devices} />
        <Route path="/sync-history" component={SyncHistory} />
        <Route path="/backups" component={BackupRestore} />
        <Route path="/platform/database" component={DatabaseAdministration} />
        <Route path="/platform/activity" component={PlatformActivityPage} />
        <Route
          path="/platform/account-settings"
          component={PlatformAccountSettings}
        />
        <Route path="/accounts" component={Accounts} />
        <Route path="/subscription" component={Subscription} />
        <Route path="/platform/companies/new" component={AddCompanyPage} />
        <Route
          path="/platform/companies/active"
          component={PlatformActiveCompaniesPage}
        />
        <Route
          path="/platform/companies/suspended"
          component={PlatformSuspendedCompaniesPage}
        />
        <Route path="/platform/companies" component={PlatformAllCompaniesPage} />
        <Route path="/platform/employees" component={PlatformEmployeesPage} />
        <Route path="/platform/users" component={PlatformUsersPage} />
        <Route
          path="/platform/subscriptions"
          component={PlatformSubscriptionsPage}
        />
        <Route
          path="/platform/companies/:companyId"
          component={PlatformCompanyDetailsPage}
        />
        <Route path="/platform" component={Platform} />
        <Route component={NotFoundRoute} />
      </Switch>
    </Shell>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ErrorBoundary FallbackComponent={LocalizedErrorFallback}>
            <AuthGate />
          </ErrorBoundary>
        </WouterRouter>
      </I18nProvider>
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  );
}
export default App;
