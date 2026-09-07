param(
  [int]$MachineNumber = 1
)

$ErrorActionPreference = "Stop"
$zk = $null

try {
  try {
    $zk = New-Object -ComObject "zkemkeeper.ZKEM.1"
  } catch {
    throw "ZKTeco SDK is not installed or zkemkeeper.dll is not registered."
  }

  if (-not $zk.Connect_USB($MachineNumber)) {
    throw "Could not connect to a ZKTeco device over USB."
  }

  [void]$zk.EnableDevice($MachineNumber, 0)
  try {
    if (-not $zk.ReadGeneralLogData($MachineNumber)) {
      throw "The device did not make its attendance logs available."
    }

    $events = @()
    while ($true) {
      [string]$enrollNumber = ""
      [int]$verifyMode = 0
      [int]$inOutMode = 0
      [int]$year = 0
      [int]$month = 0
      [int]$day = 0
      [int]$hour = 0
      [int]$minute = 0
      [int]$second = 0
      [int]$workCode = 0

      $hasLog = $zk.SSR_GetGeneralLogData(
        $MachineNumber,
        [ref]$enrollNumber,
        [ref]$verifyMode,
        [ref]$inOutMode,
        [ref]$year,
        [ref]$month,
        [ref]$day,
        [ref]$hour,
        [ref]$minute,
        [ref]$second,
        [ref]$workCode
      )
      if (-not $hasLog) {
        break
      }

      $direction = if (@(0, 4, 5) -contains $inOutMode) { "in" } else { "out" }
      $occurredAt = Get-Date -Year $year -Month $month -Day $day -Hour $hour -Minute $minute -Second $second
      $events += [ordered]@{
        deviceEmployeeId = $enrollNumber.Trim()
        occurredAt = $occurredAt.ToUniversalTime().ToString("o")
        direction = $direction
        idempotencyKey = "zkteco-usb:$enrollNumber:$($occurredAt.ToUniversalTime().ToString("o")):$verifyMode:$inOutMode:$workCode"
        rawPayload = [ordered]@{
          protocol = "zkteco-usb"
          verifyMode = $verifyMode
          inOutMode = $inOutMode
          workCode = $workCode
        }
      }
    }

    if ($events.Count -gt 0) {
      $events | ConvertTo-Json -Depth 6 -Compress
    }
  } finally {
    [void]$zk.EnableDevice($MachineNumber, 1)
  }
} finally {
  if ($null -ne $zk) {
    [void]$zk.Disconnect()
  }
}