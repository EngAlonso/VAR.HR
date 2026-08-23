import {
  createContext,
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
  useListBranches,
  useCreateBranch,
  useListEmployees,
  useCreateEmployee,
  useGetEmployee,
  useUpdateEmployee,
  useGetAttendanceToday,
  useListAttendanceHistory,
  useCheckIn,
  useCheckOut,
  useCorrectAttendance,
  useListLeaveBalances,
  useListLeaveRequests,
  useCreateLeaveRequest,
  useDecideLeaveRequest,
  useListPermissionRequests,
  useCreatePermissionRequest,
  useDecidePermissionRequest,
  useGetAttendanceRules,
  useUpdateAttendanceRules,
  useGetAttendanceReport,
  useGetReport,
  useImportEmployees,
  useListPayrollPeriods,
  useCreatePayrollPeriod,
  useCalculatePayroll,
  useGetPayrollCalculation,
  useFinalizePayroll,
  useListPayrollAdjustments,
  useCreatePayrollAdjustment,
  useDeletePayrollAdjustment,
  useListDevices,
  useCreateDevice,
  useSyncDevice,
  useTestDeviceConnection,
  useListWorkSchedules,
  useCreateWorkSchedule,
  useUpdateWorkSchedule,
  useGetEmployeeSchedule,
  useAssignEmployeeSchedule,
  useListHolidays,
  useCreateHoliday,
  useUpdateHoliday,
  useDeleteHoliday,
  useListBiometricProviders,
  useListDeviceSyncHistory,
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
  getListBranchesQueryKey,
  getListEmployeesQueryKey,
  getGetEmployeeQueryKey,
  getGetAttendanceTodayQueryKey,
  getListAttendanceHistoryQueryKey,
  getListLeaveBalancesQueryKey,
  getListLeaveRequestsQueryKey,
  getListPermissionRequestsQueryKey,
  getGetAttendanceRulesQueryKey,
  getGetAttendanceReportQueryKey,
  getListPayrollPeriodsQueryKey,
  getGetPayrollCalculationQueryKey,
  getListPayrollAdjustmentsQueryKey,
  getListDevicesQueryKey,
  getListDeviceMappingsQueryKey,
  getListWorkSchedulesQueryKey,
  getGetEmployeeScheduleQueryKey,
  getListHolidaysQueryKey,
  getListDeviceSyncHistoryQueryKey,
  getListAttendanceLocationsQueryKey,
  getGetEmployeeHrRecordQueryKey,
  getGetSubscriptionQueryKey,
  getListPlatformCompaniesQueryKey,
} from "@workspace/api-client-react";

const queryClient = new QueryClient();

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
  employees: Array<Record<string, unknown>>;
  devices: Array<Record<string, unknown>>;
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
    roles: ["platform_owner", "company_owner"],
    capability: "attendance.correct",
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
    href: "/schedules",
    key: "schedules",
    icon: Clock3,
    roles: ["platform_owner", "company_owner", "manager", "employee"],
  },
  {
    href: "/holidays",
    key: "holidays",
    icon: CalendarDays,
    roles: ["platform_owner", "company_owner", "manager"],
  },
  {
    href: "/devices",
    key: "devices",
    icon: Fingerprint,
    roles: ["platform_owner", "company_owner"],
  },
  {
    href: "/sync-history",
    key: "syncHistory",
    icon: RefreshCw,
    roles: ["platform_owner", "company_owner"],
  },
  {
    href: "/backups",
    key: "backupRestore",
    icon: Database,
    roles: ["platform_owner", "company_owner"],
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
];

const copy = {
  en: {
    overview: "Overview",
    employees: "Employees",
    attendance: "Attendance",
    requests: "Requests",
    rules: "Rules",
    reports: "Reports",
    payroll: "Payroll",
    devices: "Devices",
    schedules: "Schedules",
    holidays: "Holidays",
    syncHistory: "Sync history",
    backupRestore: "Backup & restore",
    subscription: "Subscription",
    platformOwner: "Platform owner",
    accountManagement: "Account management",
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
    goodMorningAmina: "Good morning, Amina.",
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
    searchByNameNumberEmail: "Search by name, number, or email",
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
    cancel: "Cancel",
    saving: "Saving…",
    createEmployee: "Create employee",
    employeeProfile: "Employee profile",
    hrProfile: "My HR profile",
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
    salary: "Salary",
    markInactive: "Mark inactive",
    reactivateEmployee: "Reactivate employee",
    employeeAddedToWorkspace: "Employee added to the workspace",
    couldNotCreateEmployee: "Could not create employee",
    departmentCreated: "Department created",
    branchCreated: "Branch created",
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
    changesApplyEffectiveDate:
      "Changes apply from the effective date. No legal or statutory interpretation is implied.",
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
    attendance: "الحضور",
    requests: "الطلبات",
    rules: "القواعد",
    reports: "التقارير",
    payroll: "الرواتب",
    devices: "الأجهزة",
    schedules: "الجداول",
    holidays: "العطلات",
    syncHistory: "سجل المزامنة",
    backupRestore: "النسخ الاحتياطي والاستعادة",
    subscription: "الاشتراك",
    platformOwner: "مالك المنصة",
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
    biometricDevices: "أجهزة البصمة",
    branch: "الفرع",
    branchCreated: "تم إنشاء الفرع",
    calculate: "حساب",
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
    department: "القسم",
    departmentCreated: "تم إنشاء القسم",
    disabled: "معطل",
    email: "البريد الإلكتروني",
    emergencyContactName: "اسم جهة اتصال الطوارئ",
    emergencyContactPhone: "هاتف الطوارئ",
    employee: "الموظف",
    employeeNumber: "رقم الموظف",
    employeeProfile: "ملف الموظف",
    employeeProfileLoadFailed: "تعذر تحميل ملف الموظف.",
    employeeStatusUpdated: "تم تحديث حالة الموظف",
    employmentType: "نوع التوظيف",
    end: "النهاية",
    evidenceAnalysis: "الأدلة والتحليل",
    exceptionsSurfaced: "يتم عرض الاستثناءات بوضوح.",
    from: "من",
    goodMorningAmina: "صباح الخير، أمينة",
    gpsPolicy: "سياسة GPS",
    hours: "الساعات",
    hrProfile: "ملفي في الموارد البشرية",
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
    searchEmployees: "Search by name, number, or email",
    allStatuses: "All statuses",
    active: "Active",
    inactive: "Inactive",
    addEmployee: "Add employee",
    noEmployeesMatch: "No employees match this view",
    adjustEmployeeSearch:
      "Adjust the search or add the first employee to this tenant.",
    selectOption: "Select",
    createDepartmentPrompt: "Department name",
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
      "Versioned operating policy for time, overtime, and location verification.",
    version: "Version",
    workingHours: "Working hours",
    rulesEffectiveNote:
      "Changes apply from the effective date. No legal or statutory interpretation is implied.",
    workStarts: "Work starts",
    workEnds: "Work ends",
    gracePeriod: "Grace period (minutes)",
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
    recalculateAfterAdjustment: "Recalculate after changing adjustments.",
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
    searchEmployees: "البحث بالاسم أو الرقم أو البريد الإلكتروني",
    allStatuses: "كل الحالات",
    active: "نشط",
    inactive: "غير نشط",
    addEmployee: "إضافة موظف",
    noEmployeesMatch: "لا يوجد موظفون يطابقون هذا العرض",
    adjustEmployeeSearch: "عدّل البحث أو أضف أول موظف إلى مساحة العمل.",
    selectOption: "اختر",
    createDepartmentPrompt: "اسم القسم",
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
    history: "السجل",
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
      "سياسة تشغيل بإصدارات للدوام والعمل الإضافي والتحقق من الموقع.",
    version: "الإصدار",
    workingHours: "ساعات العمل",
    rulesEffectiveNote:
      "تسري التغييرات من تاريخ النفاذ ولا تمثل تفسيراً قانونياً أو نظامياً.",
    workStarts: "بداية العمل",
    workEnds: "نهاية العمل",
    gracePeriod: "فترة السماح (بالدقائق)",
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
    recalculateAfterAdjustment: "أعد الحساب بعد تغيير التعديلات.",
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
    searchByNameNumberEmail: "البحث بالاسم أو الرقم أو البريد الإلكتروني",
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
    employeeAddedToWorkspace: "تمت إضافة الموظف إلى مساحة العمل",
    apiWillIdentifySignedInEmployee: "ستحدد واجهة API الموظف الذي سجّل الدخول.",
    webEventLocationPolicy: "حدث ويب · تقيّم واجهة API سياسة الموقع",
    noAttendanceRecordsYet: "لا توجد سجلات حضور بعد",
    whenDayStartsEventsAppearHere: "ستظهر الأحداث هنا عند بدء اليوم.",
    noHistoryFound: "لا يوجد سجل",
    attendanceHistoryWillPopulate: "سيظهر سجل الحضور بعد تسجيل الأحداث.",
    newLeaveAndPermissionRequestsWillAppearHere:
      "ستظهر طلبات الإجازة والاستئذان الجديدة هنا.",
    pendingDecisionsAcrossBothRequestTypes: "قرارات معلقة من نوعي الطلبات",
    theDecisionQueueIsClear: "قائمة القرارات فارغة",
    notApprovedAtThisTime: "لم تتم الموافقة في الوقت الحالي",
    reviewedInOperationsQueue: "تمت مراجعته في قائمة العمليات",
    changesApplyEffectiveDate:
      "تسري التغييرات من تاريخ النفاذ ولا تمثل تفسيراً قانونياً أو نظامياً.",
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
  },
  fr: {
    employeesEyebrow: "Registre des effectifs",
    employeesTitle: "Employés",
    employeesDetail:
      "Recherchez, examinez et gérez les personnes qui font fonctionner l’activité.",
    searchEmployees: "Rechercher par nom, numéro ou e-mail",
    allStatuses: "Tous les statuts",
    active: "Actif",
    inactive: "Inactif",
    addEmployee: "Ajouter un employé",
    noEmployeesMatch: "Aucun employé ne correspond à cette vue",
    adjustEmployeeSearch:
      "Modifiez la recherche ou ajoutez le premier employé à cet espace.",
    selectOption: "Sélectionner",
    createDepartmentPrompt: "Nom du département",
    createBranchPrompt: "Nom de l’agence",
    branchCityPrompt: "Ville de l’agence",
    employeeStatusUpdated: "Statut de l’employé mis à jour",
    employeeAdded: "Employé ajouté à l’espace de travail",
    couldNotCreateEmployee: "Impossible de créer l’employé",
    departmentCreated: "Département créé",
    branchCreated: "Agence créée",
    save: "Enregistrer",
    saving: "Enregistrement…",
    createEmployee: "Créer l’employé",
    employeeProfile: "Profil de l’employé",
    employeeNumber: "Numéro d’employé",
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
      "Politique versionnée pour les horaires, les heures supplémentaires et la localisation.",
    version: "Version",
    workingHours: "Heures de travail",
    rulesEffectiveNote:
      "Les changements s’appliquent à la date d’effet. Aucune interprétation légale ou réglementaire n’est implicite.",
    workStarts: "Début du travail",
    workEnds: "Fin du travail",
    gracePeriod: "Délai de grâce (minutes)",
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
      "Recalculez après avoir modifié les ajustements.",
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
    searchEmployees: "Nach Name, Nummer oder E-Mail suchen",
    allStatuses: "Alle Status",
    active: "Aktiv",
    inactive: "Inaktiv",
    addEmployee: "Mitarbeitenden hinzufügen",
    noEmployeesMatch: "Keine Mitarbeitenden für diese Ansicht",
    adjustEmployeeSearch:
      "Passen Sie die Suche an oder fügen Sie den ersten Mitarbeitenden hinzu.",
    selectOption: "Auswählen",
    createDepartmentPrompt: "Abteilungsname",
    createBranchPrompt: "Name der Niederlassung",
    branchCityPrompt: "Stadt der Niederlassung",
    employeeStatusUpdated: "Mitarbeiterstatus aktualisiert",
    employeeAdded: "Mitarbeitender zum Arbeitsbereich hinzugefügt",
    couldNotCreateEmployee: "Mitarbeitender konnte nicht erstellt werden",
    departmentCreated: "Abteilung erstellt",
    branchCreated: "Niederlassung erstellt",
    save: "Speichern",
    saving: "Speichern…",
    createEmployee: "Mitarbeitenden erstellen",
    employeeProfile: "Mitarbeiterprofil",
    employeeNumber: "Mitarbeiternummer",
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
      "Versionierte Richtlinie für Zeit, Überstunden und Standortprüfung.",
    version: "Version",
    workingHours: "Arbeitszeit",
    rulesEffectiveNote:
      "Änderungen gelten ab dem Wirksamkeitsdatum. Keine rechtliche oder gesetzliche Auslegung ist enthalten.",
    workStarts: "Arbeitsbeginn",
    workEnds: "Arbeitsende",
    gracePeriod: "Kulanzzeit (Minuten)",
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
      "Nach Änderungen an den Anpassungen neu berechnen.",
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
    goodMorningAmina: "Good morning, Amina.",
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
    goodMorningAmina: "صباح الخير، أمينة.",
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
    goodMorningAmina: "Bonjour, Amina.",
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
    goodMorningAmina: "Guten Morgen, Amina.",
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
    scheduleManagement: "Schedule management",
    scheduleManagementDetail:
      "Build reusable work patterns and assign the effective schedule to each employee.",
    createSchedule: "Create schedule",
    editSchedule: "Edit schedule",
    scheduleName: "Schedule name",
    workingDays: "Working days",
    startTime: "Start time",
    endTime: "End time",
    requiredHours: "Required hours",
    graceMinutes: "Grace minutes",
    overtimeAfterMinutes: "Overtime after (minutes)",
    overtimeEligible: "Overtime eligible",
    activeSchedule: "Active schedule",
    daySun: "Sun",
    dayMon: "Mon",
    dayTue: "Tue",
    dayWed: "Wed",
    dayThu: "Thu",
    dayFri: "Fri",
    daySat: "Sat",
    overnightSchedule: "Overnight schedule",
    overnightScheduleDetail: "The end time is on the following day.",
    noSchedules: "No schedules configured",
    noSchedulesDetail:
      "Create a work pattern before assigning it to employees.",
    scheduleCreated: "Schedule created",
    scheduleUpdated: "Schedule updated",
    scheduleSaveFailed: "The schedule could not be saved.",
    scheduleValidation:
      "Choose at least one working day and provide a valid time range.",
    employeeSchedule: "Employee schedule",
    assignSchedule: "Assign schedule",
    effectiveSchedule: "Effective schedule",
    selectEmployee: "Select employee",
    selectSchedule: "Select schedule",
    effectiveFrom: "Effective from",
    effectiveTo: "Effective to",
    scheduleAssigned: "Schedule assigned",
    scheduleAssignmentFailed: "The schedule assignment could not be saved.",
    noEffectiveSchedule: "No effective schedule",
    noEffectiveScheduleDetail:
      "This employee does not have an active schedule assignment.",
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
    scheduleManagement: "إدارة الجداول",
    scheduleManagementDetail:
      "أنشئ أنماط عمل قابلة لإعادة الاستخدام وعيّن الجدول الفعّال لكل موظف.",
    createSchedule: "إنشاء جدول",
    editSchedule: "تعديل الجدول",
    scheduleName: "اسم الجدول",
    workingDays: "أيام العمل",
    startTime: "وقت البدء",
    endTime: "وقت الانتهاء",
    requiredHours: "الساعات المطلوبة",
    graceMinutes: "دقائق السماح",
    overtimeAfterMinutes: "العمل الإضافي بعد (دقائق)",
    overtimeEligible: "مؤهل للعمل الإضافي",
    activeSchedule: "جدول نشط",
    daySun: "الأحد",
    dayMon: "الاثنين",
    dayTue: "الثلاثاء",
    dayWed: "الأربعاء",
    dayThu: "الخميس",
    dayFri: "الجمعة",
    daySat: "السبت",
    overnightSchedule: "جدول ليلي",
    overnightScheduleDetail: "وقت الانتهاء في اليوم التالي.",
    noSchedules: "لا توجد جداول",
    noSchedulesDetail: "أنشئ نمط عمل قبل تعيينه للموظفين.",
    scheduleCreated: "تم إنشاء الجدول",
    scheduleUpdated: "تم تحديث الجدول",
    scheduleSaveFailed: "تعذر حفظ الجدول.",
    scheduleValidation: "اختر يوم عمل واحداً على الأقل وأدخل نطاق وقت صالحاً.",
    employeeSchedule: "جدول الموظف",
    assignSchedule: "تعيين جدول",
    effectiveSchedule: "الجدول الفعّال",
    selectEmployee: "اختر موظفاً",
    selectSchedule: "اختر جدولاً",
    effectiveFrom: "ساري من",
    effectiveTo: "ساري حتى",
    scheduleAssigned: "تم تعيين الجدول",
    scheduleAssignmentFailed: "تعذر حفظ تعيين الجدول.",
    noEffectiveSchedule: "لا يوجد جدول فعّال",
    noEffectiveScheduleDetail: "لا يوجد تعيين جدول نشط لهذا الموظف.",
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
  const { t } = useI18n();
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
  t: (key: AppCopyKey) => string,
) {
  return localizedValue(
    value,
    {
      Operations: "departmentOperations",
      "People & Culture": "departmentPeopleCulture",
    },
    t,
  );
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
    | "resetFailed"
    | "createStaff"
    | "staffAccounts"
    | "role"
    | "permissions"
    | "active"
    | "save"
    | "resetPassword"
    | "editPermissions"
    | "savePermissions"
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
      resetFailed: "Could not reset password.",
      createStaff: "Create staff account",
      staffAccounts: "Staff accounts",
      role: "Display role",
      permissions: "Permissions",
      active: "Active",
      save: "Save",
      resetPassword: "Reset password",
      editPermissions: "Manage permissions",
      savePermissions: "Save permissions",
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
      resetFailed: "تعذر إعادة تعيين كلمة المرور.",
      createStaff: "إنشاء حساب موظف",
      staffAccounts: "حسابات الموظفين",
      role: "المسمى الوظيفي",
      permissions: "الصلاحيات",
      active: "نشط",
      save: "حفظ",
      resetPassword: "إعادة تعيين كلمة المرور",
      editPermissions: "إدارة الصلاحيات",
      savePermissions: "حفظ الصلاحيات",
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
    "permissions.approve": "اعتماد الأذونات",
    "payroll.view": "عرض الرواتب",
    "reports.view": "عرض التقارير",
    "reports.export": "تصدير التقارير",
    devices: "الأجهزة",
    "sync-history": "سجل المزامنة",
    schedules: "الجداول",
    holidays: "العطلات",
    "organization.manage": "إدارة الهيكل التنظيمي",
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
    "leave.approve": "اعتماد طلبات الإجازات.",
    "permissions.approve": "اعتماد طلبات الأذونات.",
    "payroll.view": "عرض بيانات وحسابات الرواتب.",
    "reports.view": "عرض التقارير.",
    "reports.export": "تصدير التقارير.",
    devices: "إدارة إعدادات الأجهزة.",
    "sync-history": "عرض سجل المزامنة.",
    schedules: "إدارة جداول العمل.",
    holidays: "إدارة عطلات الشركة.",
    "organization.manage": "إدارة الأقسام والفروع والهيكل التنظيمي.",
  };
  return descriptions[permission.key] ?? permission.description ?? "";
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
    if (!isArabic || !isMobile || event.pointerType !== "touch") return;
    pointerStart.current = { id: event.pointerId, x: event.clientX };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (
      !start ||
      start.id !== event.pointerId ||
      !isArabic ||
      !isMobile ||
      event.pointerType !== "touch"
    ) {
      return;
    }
    const deltaX = event.clientX - start.x;
    if (Math.abs(deltaX) < 48) return;
    if (open) {
      if (deltaX > 0) setOpen(false);
    } else if (deltaX < 0) {
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
  const visibleNav = (isPlatformOwner ? platformNav : nav).filter(canSee);
  const visibleSecondaryNav = isPlatformOwner
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
        touchAction: isArabic && isMobile ? "pan-y" : undefined,
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
              <span>{t(key)}</span>
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
  const { t } = useI18n();
  const q = useGetDashboardSummary();
  const d = q.data;
  const departments = useListDepartments();
  const branches = useListBranches();
  const workspace = useGetWorkspace();
  const currency = workspace.data?.company?.currency ?? "EGP";
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
        title={t("goodMorningAmina")}
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

function EmployeeProfile() {
  const { t } = useI18n();
  const workspace = useGetWorkspace();
  const employeeId = workspace.data?.employeeId ?? "";
  const employee = useGetEmployee(employeeId, {
    query: {
      enabled: Boolean(employeeId),
      queryKey: getGetEmployeeQueryKey(employeeId),
    },
  });
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
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 font-bold text-primary">
              {employee.data.avatarInitials}
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">
                {employee.data.firstName} {employee.data.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {employee.data.email}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <Info
              label={t("employeeNumber")}
              value={employee.data.employeeNumber}
            />
            <Info
              label={t("department")}
              value={departmentLabel(employee.data.department?.name, t)}
            />
            <Info
              label={t("branch")}
              value={branchLabel(employee.data.branch?.name, t)}
            />
          </div>
          <EmployeeHrPanel employeeId={employee.data.id} canEdit={false} />
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

function Employees() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const workspaceQuery = useGetWorkspace();
  const canManageEmployees =
    workspaceQuery.data?.capabilities?.includes("employees.manage") ?? false;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const currency = workspaceQuery.data?.company?.currency ?? "EGP";
  const params = useMemo(
    () => ({ search: search || undefined, status: status as any }),
    [search, status],
  );
  const q = useListEmployees(params);
  const depts = useListDepartments();
  const branches = useListBranches();
  const create = useCreateEmployee();
  const createDepartment = useCreateDepartment();
  const createBranch = useCreateBranch();
  const employee = useGetEmployee(selected || "", {
    query: {
      enabled: !!selected,
      queryKey: getGetEmployeeQueryKey(selected || ""),
    },
  });
  const update = useUpdateEmployee();
  const importMutation = useImportEmployees();
  const [showImport, setShowImport] = useState(false);
  const [importDraft, setImportDraft] = useState<ImportDraft | null>(null);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    departmentId: "",
    branchId: "",
    joinedOn: new Date().toISOString().slice(0, 10),
    salary: "0",
    role: "employee",
  });
  function submit(e: FormEvent) {
    e.preventDefault();
    create.mutate(
      {
        data: {
          ...form,
          salary: Number(form.salary),
          departmentId: form.departmentId,
          branchId: form.branchId,
          role: form.role as any,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success(t("employeeAdded"));
          setShowCreate(false);
          qc.invalidateQueries({ queryKey: getListEmployeesQueryKey() });
        },
        onError: () => toast.error(t("couldNotCreateEmployee")),
      },
    );
  }
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
          canManageEmployees ? (
            <Button
              onClick={() => setShowCreate(true)}
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm rtl:text-right">
              <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">{t("employee")}</th>
                  <th className="px-4 py-3">{t("department")}</th>
                  <th className="px-4 py-3">{t("branch")}</th>
                  <th className="px-4 py-3">{t("role")}</th>
                  <th className="px-4 py-3">{t("status")}</th>
                  <th className="px-5 py-3 text-right rtl:text-left">
                    {t("joined")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {q.data.map((item: any) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelected(item.id)}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    data-testid={`row-employee-${item.id}`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {item.avatarInitials ||
                            `${item.firstName[0]}${item.lastName[0]}`}
                        </div>
                        <div>
                          <div className="font-semibold">
                            {item.firstName} {item.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.employeeNumber} · {item.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {departmentLabel(item.department?.name, t)}
                    </td>
                    <td className="px-4 py-4">
                      {branchLabel(item.branch?.name, t)}
                    </td>
                    <td className="px-4 py-4">{roleLabel(item.role, t)}</td>
                    <td className="px-4 py-4">
                      <Status value={item.status} />
                    </td>
                    <td className="px-5 py-4 text-right text-muted-foreground rtl:text-left">
                      {date(item.joinedOn)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title={t("noEmployeesMatch")}
            detail={t("adjustEmployeeSearch")}
            action={
              canManageEmployees ? (
                <Button onClick={() => setShowCreate(true)}>
                  <Plus size={15} />
                  {t("addEmployee")}
                </Button>
              ) : undefined
            }
          />
        )}
      </Card>
      {showCreate && (
        <Modal title={t("addEmployee")} onClose={() => setShowCreate(false)}>
          <form onSubmit={submit} className="space-y-4">
            {[
              ["firstName", "firstName"],
              ["lastName", "lastName"],
              ["email", "email"],
              ["salary", "monthlySalary"],
            ].map(([key, label]) => (
              <label key={key} className="block text-sm font-semibold">
                {t(label as AppCopyKey)}
                <input
                  required={key !== "salary"}
                  type={
                    key === "salary"
                      ? "number"
                      : key === "email"
                        ? "email"
                        : "text"
                  }
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="mt-1 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus:border-primary"
                />
              </label>
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">
                {t("department")}
                <div className="mt-1 flex gap-2">
                  <select
                    required
                    value={form.departmentId}
                    onChange={(e) =>
                      setForm({ ...form, departmentId: e.target.value })
                    }
                    className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-2 text-sm font-normal"
                  >
                    <option value="">{t("selectOption")}</option>
                    {depts.data?.map((x: any) => (
                      <option key={x.id} value={x.id}>
                        {departmentLabel(x.name, t)}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-2"
                    title={t("createDepartmentPrompt")}
                    onClick={() => {
                      const name = window.prompt(t("createDepartmentPrompt"));
                      if (name)
                        createDepartment.mutate(
                          { data: { name } },
                          {
                            onSuccess: () => {
                              toast.success(t("departmentCreated"));
                              qc.invalidateQueries({
                                queryKey: getListDepartmentsQueryKey(),
                              });
                            },
                          },
                        );
                    }}
                  >
                    <Plus size={15} />
                  </Button>
                </div>
              </label>
              <label className="text-sm font-semibold">
                {t("branch")}
                <div className="mt-1 flex gap-2">
                  <select
                    required
                    value={form.branchId}
                    onChange={(e) =>
                      setForm({ ...form, branchId: e.target.value })
                    }
                    className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-2 text-sm font-normal"
                  >
                    <option value="">{t("selectOption")}</option>
                    {branches.data?.map((x: any) => (
                      <option key={x.id} value={x.id}>
                        {branchLabel(x.name, t)}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-2"
                    title={t("createBranchPrompt")}
                    onClick={() => {
                      const name = window.prompt(t("createBranchPrompt"));
                      const city = window.prompt(t("branchCityPrompt"));
                      if (name && city)
                        createBranch.mutate(
                          { data: { name, city, gpsEnabled: false } },
                          {
                            onSuccess: () => {
                              toast.success(t("branchCreated"));
                              qc.invalidateQueries({
                                queryKey: getListBranchesQueryKey(),
                              });
                            },
                          },
                        );
                    }}
                  >
                    <Plus size={15} />
                  </Button>
                </div>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="quiet"
                onClick={() => setShowCreate(false)}
              >
                {t("cancel")}
              </Button>
              <Button disabled={create.isPending} type="submit">
                {create.isPending ? t("saving") : t("createEmployee")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {selected && (
        <Modal title={t("employeeProfile")} onClose={() => setSelected(null)}>
          {employee.isLoading ? (
            <Skeleton className="h-40" />
          ) : employee.data ? (
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 font-bold text-primary">
                  {employee.data.avatarInitials}
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">
                    {employee.data.firstName} {employee.data.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {employee.data.email}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3 text-sm min-[360px]:grid-cols-2">
                <Info
                  label={t("employeeNumber")}
                  value={employee.data.employeeNumber}
                />
                <Info
                  label={t("department")}
                  value={departmentLabel(employee.data.department?.name, t)}
                />
                <Info
                  label={t("branch")}
                  value={branchLabel(employee.data.branch?.name, t)}
                />
                <Info
                  label={t("salary")}
                  value={money(employee.data.salary, currency)}
                />
              </div>
              {canManageEmployees && (
                <Button
                  className="mt-6"
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
                >
                  {employee.data.status === "active"
                    ? t("markInactive")
                    : t("reactivateEmployee")}
                </Button>
              )}
              <EmployeeHrPanel
                employeeId={employee.data.id}
                canEdit={canManageEmployees}
              />
            </div>
          ) : (
            <ErrorState retry={() => employee.refetch()} />
          )}
        </Modal>
      )}
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
  const isScoped =
    workspace.data?.role === "employee" || workspace.data?.role === "manager";
  const canCorrect =
    workspace.data?.capabilities?.includes("attendance.correct") ?? false;
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
                      {canCorrect && (
                        <th className="px-5 py-3 text-right">
                          {t("correctAttendance")}
                        </th>
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
                        {canCorrect && (
                          <td className="px-5 py-4 text-right">
                            <Button
                              variant="outline"
                              className="text-xs"
                              onClick={() => openCorrection(x)}
                            >
                              {t("correctAttendance")}
                            </Button>
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
            <div className="flex items-center gap-2">
              <CalendarDays size={17} className="text-primary" />
              <h2 className="font-display font-semibold">
                {t("leaveBalances")}
              </h2>
            </div>
            <div className="mt-4 space-y-3">
              {balances.isLoading ? (
                <Skeleton className="h-24" />
              ) : balances.data?.length ? (
                balances.data.map((b: any) => (
                  <div key={b.id}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="font-semibold">
                        {requestTypeLabel(b.type, t)}
                        <span className="block text-xs font-normal text-muted-foreground">
                          {b.employee?.name}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {b.remaining} {t("daysRemaining")}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(100, (b.used / Math.max(1, b.allocated)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <Empty title={t("notAvailable")} detail={t("requestsAppear")} />
              )}
            </div>
          </Card>
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

function Rules() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const q = useGetAttendanceRules();
  const update = useUpdateAttendanceRules();
  const [form, setForm] = useState<any>(null);
  useEffect(() => {
    if (q.data && !form) setForm({ ...q.data });
  }, [q.data, form]);
  if (q.isLoading || !form) return <Skeleton className="h-64" />;
  if (q.isError) return <ErrorState retry={() => q.refetch()} />;
  function save(e: FormEvent) {
    e.preventDefault();
    update.mutate(
      {
        data: {
          ...form,
          graceMinutes: Number(form.graceMinutes),
          overtimeAfterMinutes: Number(form.overtimeAfterMinutes),
          locationRadiusMeters: Number(form.locationRadiusMeters),
        } as any,
      },
      {
        onSuccess: () => {
          toast.success(t("attendancePolicyUpdated"));
          qc.invalidateQueries({ queryKey: getGetAttendanceRulesQueryKey() });
        },
      },
    );
  }
  const rules = q.data as any;
  const weekdays: Array<{ value: string; key: AppCopyKey }> = [
    { value: "Mon", key: "monday" },
    { value: "Tue", key: "tuesday" },
    { value: "Wed", key: "wednesday" },
    { value: "Thu", key: "thursday" },
    { value: "Fri", key: "friday" },
    { value: "Sat", key: "saturday" },
    { value: "Sun", key: "sunday" },
  ];
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("policyControl")}
        title={t("attendanceRulesTitle")}
        detail={t("attendanceRulesDetail")}
        action={
          <Badge tone="accent">
            {t("version")} {rules.version || 1}
          </Badge>
        }
      />
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="p-6">
          <h2 className="font-display text-lg font-semibold">
            {t("workingHours")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("rulesEffectiveNote")}
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field
              label={t("workStarts")}
              type="time"
              value={form.workStart}
              onChange={(v) => setForm({ ...form, workStart: v })}
            />
            <Field
              label={t("workEnds")}
              type="time"
              value={form.workEnd}
              onChange={(v) => setForm({ ...form, workEnd: v })}
            />
            <Field
              label={t("gracePeriod")}
              type="number"
              value={form.graceMinutes}
              onChange={(v) => setForm({ ...form, graceMinutes: v })}
            />
            <Field
              label={t("overtimeAfter")}
              type="number"
              value={form.overtimeAfterMinutes}
              onChange={(v) => setForm({ ...form, overtimeAfterMinutes: v })}
            />
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {weekdays.map(({ value, key }) => (
              <button
                type="button"
                key={value}
                onClick={() => {
                  const days = form.workingDays || [];
                  setForm({
                    ...form,
                    workingDays: days.includes(value)
                      ? days.filter((x: string) => x !== value)
                      : [...days, value],
                  });
                }}
                className={cn(
                  "rounded-lg border px-3 py-2 text-xs font-bold",
                  (form.workingDays || []).includes(value)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                {t(key)}
              </button>
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card className="p-6">
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
          <Card className="bg-muted/50 p-5">
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
          <Button type="submit" disabled={update.isPending} className="w-full">
            {update.isPending ? t("savingPolicy") : t("saveAttendancePolicy")}
          </Button>
        </div>
      </form>
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
      { key: "email", label: t("email") },
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

function Payroll() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const q = useListPayrollPeriods();
  const employees = useListEmployees({ status: "active" });
  const createPeriod = useCreatePayrollPeriod();
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
        },
        onError: () => toast.error(t("adjustmentDeleteFailed")),
      },
    );
  }
  const selectedEmployee = calculation.data?.items.find(
    (item: any) => item.employee.id === selectedEmployeeId,
  );
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
                        {calc.isPending ? t("calculating") : t("calculate")}
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
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {[
                      [t("regularHours"), selectedEmployee.regularHours],
                      [t("overtimeHours"), selectedEmployee.overtimeHours],
                      [t("lateMinutes"), selectedEmployee.lateMinutes],
                      [
                        t("earlyCheckoutMinutes"),
                        selectedEmployee.earlyCheckoutMinutes,
                      ],
                      [t("absentDays"), selectedEmployee.absentDays],
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
                        className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
                        key={item.id}
                      >
                        <div>
                          <span className="font-semibold">
                            {item.employee.name}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {item.reason}
                          </span>
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
                        <div className="flex items-center gap-3">
                          <span className="font-mono">
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

function Schedules() {
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
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [draft, setDraft] = useState<any>({
    name: "",
    workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
    startTime: "09:00",
    endTime: "17:00",
    requiredHours: "8",
    graceMinutes: "15",
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
            requiredHours: String(schedule.requiredHours),
            graceMinutes: String(schedule.graceMinutes),
            overtimeAfterMinutes: String(schedule.overtimeAfterMinutes),
          }
        : {
            name: "",
            workingDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
            startTime: "09:00",
            endTime: "17:00",
            requiredHours: "8",
            graceMinutes: "15",
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
      !draft.workingDays.length ||
      !draft.startTime ||
      !draft.endTime
    ) {
      toast.error(t("scheduleValidation"));
      return;
    }
    const data = {
      ...draft,
      name: draft.name.trim(),
      requiredHours: Number(draft.requiredHours),
      graceMinutes: Number(draft.graceMinutes),
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
  const effectiveSchedule = effective.data?.schedule;
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("scheduleManagement")}
        title={t("schedules")}
        detail={t("scheduleManagementDetail")}
        action={
          canAdminister ? (
            <Button onClick={() => openEditor()}>
              <Plus size={16} />
              {t("createSchedule")}
            </Button>
          ) : undefined
        }
      />
      {canAdminister || role === "manager" ? (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <Card>
            <div className="border-b border-border p-5">
              <h2 className="font-display text-lg font-semibold">
                {t("schedules")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("workingDays")} · {t("startTime")} → {t("endTime")}
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
                          <Badge tone={schedule.active ? "good" : "neutral"}>
                            {schedule.active
                              ? t("activeSchedule")
                              : t("statusInactive")}
                          </Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {schedule.workingDays
                            .map((day: string) =>
                              t(
                                scheduleDayOptions.find(
                                  ([key]) => key === day,
                                )?.[1] || "workingDays",
                              ),
                            )
                            .join(" · ")}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => openEditor(schedule)}
                      >
                        {t("editSchedule")}
                      </Button>
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
                {t("employeeSchedule")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("effectiveSchedule")}
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
                    {effectiveSchedule.startTime} → {effectiveSchedule.endTime}{" "}
                    · {effectiveSchedule.workingDays.join(", ")}
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
                  label={t("workingDays")}
                  value={effectiveSchedule.workingDays.join(", ")}
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
            <div>
              <p className="text-sm font-semibold">{t("workingDays")}</p>
              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
                {scheduleDayOptions.map(([day, key]) => (
                  <label
                    className="flex items-center gap-1.5 rounded-lg border border-border p-2 text-xs"
                    key={day}
                  >
                    <input
                      type="checkbox"
                      checked={draft.workingDays.includes(day)}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          workingDays: event.target.checked
                            ? [...draft.workingDays, day]
                            : draft.workingDays.filter(
                                (value: string) => value !== day,
                              ),
                        })
                      }
                    />
                    {t(key)}
                  </label>
                ))}
              </div>
            </div>
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

function Holidays() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const workspace = useGetWorkspace();
  const canAdminister =
    workspace.data?.role === "company_owner" ||
    workspace.data?.role === "platform_owner";
  const q = useListHolidays({ query: { queryKey: getListHolidaysQueryKey() } });
  const create = useCreateHoliday();
  const update = useUpdateHoliday();
  const remove = useDeleteHoliday();
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [draft, setDraft] = useState({ name: "", date: "", recurring: false });
  function openEditor(holiday?: any) {
    setEditing(holiday || null);
    setDraft(
      holiday
        ? {
            name: holiday.name,
            date: holiday.date,
            recurring: Boolean(holiday.recurring),
          }
        : { name: "", date: "", recurring: false },
    );
    setShowEditor(true);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const data = {
      name: draft.name.trim(),
      date: draft.date,
      recurring: draft.recurring,
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
          canAdminister ? (
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
                    {date(holiday.date)}{" "}
                    {holiday.recurring ? `· ${t("recurringHoliday")}` : ""}
                  </div>
                </div>
                {canAdminister && (
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
              canAdminister ? (
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
      setBackups((current) => [imported, ...current]);
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
  return (
    <div className="animate-in">
      <SectionTitle
        eyebrow={t("backupRestore")}
        title={labels.title}
        detail={labels.detail}
        action={
          <div className="flex flex-wrap justify-end gap-2">
            <input
              ref={uploadInput}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(event) => void upload(event)}
            />
            <Button
              variant="outline"
              onClick={() => uploadInput.current?.click()}
              disabled={pending !== ""}
              title={labels.uploadHint}
            >
              <Upload size={15} />
              {pending === "upload" ? "…" : labels.upload}
            </Button>
            <Button onClick={create} disabled={pending !== ""}>
              <Database size={15} />
              {pending === "create" ? "…" : labels.create}
            </Button>
          </div>
        }
      />
      <Card>
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
        ) : backups.length === 0 ? (
          <Empty title={labels.empty} detail={labels.detail} />
        ) : (
          <div className="divide-y divide-border">
            {backups.map((backup) => (
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
                    variant="outline"
                    onClick={() => void restore(backup)}
                    disabled={pending !== ""}
                  >
                    <RefreshCw size={14} />
                    {pending === backup.id ? "…" : labels.restore}
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
  const [form, setForm] = useState({
    username: "",
    displayRole: "HR",
    password: "",
    permissions: [] as string[],
  });
  const [oneTimePassword, setOneTimePassword] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
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
    setSaving(true);
    try {
      const result = await authRequest<{
        account: AuthAccount;
        temporaryPassword: string;
      }>("/api/auth/accounts/staff", {
        method: "POST",
        body: JSON.stringify({ ...form, password: form.password || undefined }),
      });
      setAccounts((current) => [...current, result.account]);
      setOneTimePassword(result.temporaryPassword);
      setForm({
        username: "",
        displayRole: "HR",
        password: "",
        permissions: [],
      });
      toast.success(authLabel(locale, "accountCreated"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : authLabel(locale, "createFailed"),
      );
    } finally {
      setSaving(false);
    }
  };
  const reset = async (accountId: string) => {
    try {
      const result = await authRequest<{ temporaryPassword: string }>(
        `/api/auth/accounts/${accountId}/reset-password`,
        { method: "POST", body: "{}" },
      );
      setOneTimePassword(result.temporaryPassword);
      toast.success(authLabel(locale, "temporaryPassword"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : authLabel(locale, "resetFailed"),
      );
    }
  };
  const selectAccount = (account: AuthAccount) => {
    setSelectedAccountId(account.id);
    setSelectedPermissions(account.permissions);
  };
  const savePermissions = async () => {
    if (!selectedAccountId) return;
    setSaving(true);
    try {
      const result = await authRequest<{ account: AuthAccount }>(
        `/api/auth/accounts/${selectedAccountId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ permissions: selectedPermissions }),
        },
      );
      setAccounts((current) =>
        current.map((account) =>
          account.id === result.account.id ? result.account : account,
        ),
      );
      setSelectedPermissions(result.account.permissions);
      toast.success(authLabel(locale, "permissionsUpdated"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : authLabel(locale, "permissionsUpdateFailed"),
      );
    } finally {
      setSaving(false);
    }
  };
  const selectedAccount = accounts.find(
    (account) => account.id === selectedAccountId,
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
              label={authLabel(locale, "username")}
              value={form.username}
              onChange={(value) => setForm({ ...form, username: value })}
              required
            />
            <Field
              label={authLabel(locale, "role")}
              value={form.displayRole}
              onChange={(value) => setForm({ ...form, displayRole: value })}
              required
            />
            <Field
              label={`${authLabel(locale, "password")} (${authLabel(locale, "optional")})`}
              type="password"
              value={form.password}
              onChange={(value) => setForm({ ...form, password: value })}
            />
            <div>
              <p className="text-sm font-semibold">
                {authLabel(locale, "permissions")}
              </p>
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
          {oneTimePassword && (
            <div className="m-5 rounded-xl border border-accent/30 bg-accent/10 p-4">
              <div className="flex items-center gap-2 font-semibold text-primary-dark">
                <KeyRound size={16} />
                {authLabel(locale, "temporaryPassword")}
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <code className="rounded bg-background px-3 py-2 font-mono text-lg tracking-widest">
                  {oneTimePassword}
                </code>
                <Button
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard?.writeText(oneTimePassword);
                    toast.success(authLabel(locale, "copied"));
                  }}
                >
                  {authLabel(locale, "copyPassword")}
                </Button>
              </div>
              <p className="mt-2 text-xs text-primary-dark">
                {authLabel(locale, "shownOnce")}
              </p>
            </div>
          )}
          {selectedAccount && (
            <div className="m-5 rounded-xl border border-primary/20 bg-primary/[.04] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">
                    {authLabel(locale, "editPermissions")}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedAccount.username} · {selectedAccount.displayRole}
                  </p>
                </div>
                <Button
                  disabled={saving}
                  onClick={() => void savePermissions()}
                >
                  {authLabel(locale, "savePermissions")}
                </Button>
              </div>
              <div className="mt-3 max-h-64 space-y-2 overflow-auto rounded-lg border border-border bg-background p-3">
                {permissions.map((permission) => (
                  <label
                    className="flex items-start gap-2 text-sm"
                    key={`edit-${permission.key}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.key)}
                      onChange={(event) =>
                        setSelectedPermissions((current) =>
                          event.target.checked
                            ? [...current, permission.key]
                            : current.filter((key) => key !== permission.key),
                        )
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
          )}
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
                      {account.username}
                      <Badge tone={account.active ? "good" : "neutral"}>
                        {account.active
                          ? authLabel(locale, "active")
                          : authLabel(locale, "inactive")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {account.displayRole} · {account.permissions.length}{" "}
                      {authLabel(locale, "permissionsCount")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => selectAccount(account)}
                  >
                    <ShieldCheck size={15} />
                    {authLabel(locale, "editPermissions")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void reset(account.id)}
                  >
                    <KeyRound size={15} />
                    {authLabel(locale, "resetPassword")}
                  </Button>
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
  const sync = useSyncDevice();
  const testConnection = useTestDeviceConnection();
  const createMapping = useCreateDeviceMapping();
  const deleteMapping = useDeleteDeviceMapping();
  const createLocation = useCreateAttendanceLocation();
  const updateLocation = useUpdateAttendanceLocation();
  const [show, setShow] = useState(false);
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
        onSuccess: () => {
          toast.success(t("deviceAdded"));
          setShow(false);
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
  const [, setLocation] = useLocation();
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
  const activityLabel = (action: string) =>
    action
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
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
  }> = [
    {
      icon: Building2,
      label: text("Total companies", "إجمالي الشركات"),
      value: metrics.totalCompanies,
    },
    {
      icon: Check,
      label: text("Active companies", "الشركات النشطة"),
      value: metrics.activeCompanies,
    },
    {
      icon: Bell,
      label: text("Suspended companies", "الشركات الموقوفة"),
      value: metrics.suspendedCompanies,
    },
    {
      icon: Users,
      label: text("Total employees", "إجمالي الموظفين"),
      value: metrics.totalEmployees,
    },
    {
      icon: UserRound,
      label: text("Platform users", "مستخدمو المنصة"),
      value: metrics.totalPlatformUsers,
    },
    {
      icon: Zap,
      label: text("Active subscriptions", "الاشتراكات النشطة"),
      value: metrics.activeSubscriptions,
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
        {metricCards.map(({ icon: Icon, label, value }) => (
          <Card className="p-4 sm:p-5" key={label}>
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
        <Card className="p-5">
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
        <Card>
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
              {summary!.companies.length} {text("registered", "مسجلة")}
            </Badge>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {summary!.companies.map((company) => (
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
            ))}
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 border-b border-border p-5">
              <Activity size={17} className="text-primary" />
              <h2 className="font-display text-lg font-semibold">
                {text("Recent platform activity", "نشاط المنصة الأخير")}
              </h2>
            </div>
            <div className="divide-y divide-border">
              {summary!.activity.length ? (
                summary!.activity.slice(0, 6).map((event) => (
                  <div className="p-4" key={event.id}>
                    <div className="font-semibold text-sm">
                      {activityLabel(event.action)}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {event.entityType} · {date(event.createdAt)}{" "}
                      {time(event.createdAt)}
                    </div>
                  </div>
                ))
              ) : (
                <Empty
                  title={text("No recent activity", "لا يوجد نشاط حديث")}
                  detail={text(
                    "Platform events will appear here.",
                    "ستظهر أحداث المنصة هنا.",
                  )}
                />
              )}
            </div>
            <div className="border-t border-border p-4">
              <Link href="/platform" className="text-sm font-bold text-primary">
                {text("View platform activity", "عرض نشاط المنصة")}
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

function PlatformCompanyDetailsPage() {
  const { locale } = useI18n();
  const auth = useAuth();
  const params = useParams<{ companyId: string }>();
  const text = (en: string, ar: string) => (locale === "ar" ? ar : en);
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
      "Rules & schedules",
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
    var_hr_work_schedules: "جداول العمل",
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
              label={text(
                "HR/Admin/Manager accounts",
                "حسابات HR/Admin/Manager",
              )}
              value={details.staff.length}
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
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-secondary/45 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-md)] animate-in sm:p-6",
          className,
        )}
      >
        <div className="mb-5 flex items-center justify-between">
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
        {children}
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
  required = false,
  autoComplete,
  placeholder,
  showPasswordToggle = false,
  showPasswordLabel = "",
  hidePasswordLabel = "",
  placeholderAlign,
  authStyle = false,
}: {
  label: string;
  name?: string;
  value: any;
  onChange: (value: string) => void;
  type?: string;
  min?: string | number;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  showPasswordToggle?: boolean;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
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
          required={required}
          type={inputType}
          min={min}
          inputMode={authStyle && type === "text" ? "tel" : undefined}
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
          }`}
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
    </label>
  );
}
function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
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
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Overview} />
        <Route path="/profile" component={EmployeeProfile} />
        <Route path="/employees" component={Employees} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/requests" component={Requests} />
        <Route path="/rules" component={Rules} />
        <Route path="/reports" component={Reports} />
        <Route path="/payroll" component={Payroll} />
        <Route path="/schedules" component={Schedules} />
        <Route path="/holidays" component={Holidays} />
        <Route path="/devices" component={Devices} />
        <Route path="/sync-history" component={SyncHistory} />
        <Route path="/backups" component={BackupRestore} />
        <Route path="/accounts" component={Accounts} />
        <Route path="/subscription" component={Subscription} />
        <Route path="/platform/companies/new" component={AddCompanyPage} />
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
