import type { Device, DeviceEmployeeMapping, Employee } from "@workspace/db";

export type ProviderAttendanceEvent = {
  deviceEmployeeId: string;
  occurredAt: Date;
  eventType: "attendance";
  direction: "in" | "out";
  idempotencyKey: string;
  rawPayload: Record<string, unknown>;
};

export type ProviderConnectionResult = {
  status:
    | "connected"
    | "unreachable"
    | "authentication_failure"
    | "unsupported"
    | "configuration_error"
    | "unknown";
  message: string;
};

export type ProviderEmployeeSyncResult = {
  synchronized: number;
  message: string;
};

export class BiometricProviderError extends Error {
  readonly operation: "connection" | "employee_sync" | "attendance_sync";

  constructor(
    operation: BiometricProviderError["operation"],
    message: string,
  ) {
    super(message);
    this.name = "BiometricProviderError";
    this.operation = operation;
  }
}

export type BiometricProviderAdapter = {
  key: string;
  name: string;
  available: boolean;
  description: string;
  connect: (device: Device) => Promise<ProviderConnectionResult>;
  syncEmployees: (
    device: Device,
    employees: Employee[],
    mappings: DeviceEmployeeMapping[],
  ) => Promise<ProviderEmployeeSyncResult>;
  syncAttendance: (
    device: Device,
    mappings: DeviceEmployeeMapping[],
    date: string,
  ) => Promise<ProviderAttendanceEvent[]>;
};

function mockFailureMode(device: Device): string | null {
  const identifier = device.deviceIdentifier?.trim().toLowerCase();
  if (!identifier) return null;
  if (identifier === "mock-failure") return "all";
  if (identifier.startsWith("mock:fail:")) return identifier.slice("mock:fail:".length);
  return null;
}

const mockProvider: BiometricProviderAdapter = {
  key: "mock",
  name: "Deterministic mock provider",
  available: true,
  description: "Generates repeatable attendance events for automated verification without hardware.",
  async connect(device) {
    const failure = mockFailureMode(device);
    if (failure === "all" || failure === "connection") {
      return {
        status: "unreachable",
        message: "The deterministic mock provider was configured to fail connection checks.",
      };
    }
    return {
      status: "connected",
      message: "Mock provider is available; no physical hardware was contacted.",
    };
  },
  async syncEmployees(device, employees, mappings) {
    const failure = mockFailureMode(device);
    if (failure === "all" || failure === "employees" || failure === "employee_sync") {
      throw new BiometricProviderError(
        "employee_sync",
        "The deterministic mock provider was configured to fail employee synchronization.",
      );
    }
    const employeeIds = new Set(employees.map((employee) => employee.id));
    const synchronized = mappings.filter(
      (mapping) => mapping.active && employeeIds.has(mapping.employeeId),
    ).length;
    return {
      synchronized,
      message: `Mock provider synchronized ${synchronized} employee mapping${synchronized === 1 ? "" : "s"}.`,
    };
  },
  async syncAttendance(device, mappings, date) {
    const failure = mockFailureMode(device);
    if (failure === "all" || failure === "attendance" || failure === "attendance_sync") {
      throw new BiometricProviderError(
        "attendance_sync",
        "The deterministic mock provider was configured to fail attendance synchronization.",
      );
    }
    return mappings
      .filter((mapping) => mapping.active)
      .sort((a, b) => a.deviceEmployeeId.localeCompare(b.deviceEmployeeId))
      .map((mapping) => ({
        deviceEmployeeId: mapping.deviceEmployeeId,
        occurredAt: new Date(`${date}T09:00:00.000Z`),
        eventType: "attendance" as const,
        direction: "in" as const,
        idempotencyKey: `mock:${device.id}:${mapping.deviceEmployeeId}:${date}:in`,
        rawPayload: {
          provider: "mock",
          deviceId: device.id,
          deviceEmployeeId: mapping.deviceEmployeeId,
          date,
          deterministic: true,
        },
      }));
  },
};

const unavailableProvider: BiometricProviderAdapter = {
  key: "generic",
  name: "Generic adapter",
  available: false,
  description: "Reserved for a manufacturer adapter supplied by the deployment.",
  async connect() {
    return {
      status: "unsupported",
      message: "No provider adapter is configured for this device.",
    };
  },
  async syncEmployees() {
    throw new BiometricProviderError(
      "employee_sync",
      "No provider adapter is configured for this device.",
    );
  },
  async syncAttendance() {
    throw new BiometricProviderError(
      "attendance_sync",
      "No provider adapter is configured for this device.",
    );
  },
};

// ADMS devices push events to the server; they cannot be queried over TCP by this adapter.
const zktecoAdmsProvider: BiometricProviderAdapter = {
  key: "zkteco-adms",
  name: "ZKTeco ADMS",
  available: true,
  description: "Inbound-only ZKTeco ADMS protocol receiver.",
  async connect() {
    return { status: "unsupported", message: "ZKTeco ADMS is inbound-only; the device must push to /iclock." };
  },
  async syncEmployees() {
    throw new BiometricProviderError("employee_sync", "ZKTeco ADMS does not support outbound employee synchronization.");
  },
  async syncAttendance() {
    throw new BiometricProviderError("attendance_sync", "ZKTeco ADMS does not support outbound attendance synchronization.");
  },
};

const zktecoUsbProvider: BiometricProviderAdapter = {
  key: "zkteco-usb",
  name: "ZKTeco USB Connector",
  available: true,
  description: "Attendance is synchronized by the VAR HR Windows USB Connector.",
  async connect() {
    return {
      status: "unsupported",
      message:
        "USB devices are connected through the VAR HR Windows USB Connector.",
    };
  },
  async syncEmployees() {
    throw new BiometricProviderError(
      "employee_sync",
      "The USB Connector is configured for attendance synchronization only.",
    );
  },
  async syncAttendance() {
    throw new BiometricProviderError(
      "attendance_sync",
      "The VAR HR Windows USB Connector must be running on the company computer.",
    );
  },
};

const providers = new Map<string, BiometricProviderAdapter>([
  [mockProvider.key, mockProvider],
  [zktecoAdmsProvider.key, zktecoAdmsProvider],
  [zktecoUsbProvider.key, zktecoUsbProvider],
  [unavailableProvider.key, unavailableProvider],
]);

export function listBiometricProviders() {
  return [...providers.values()];
}

export function getBiometricProvider(adapterKey: string): BiometricProviderAdapter | null {
  return providers.get(adapterKey) ?? null;
}