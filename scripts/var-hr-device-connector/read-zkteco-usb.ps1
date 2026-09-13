param(
  [int]$MachineNumber = 1,
  [string]$TimeZoneId = "Egypt Standard Time"
)

$ErrorActionPreference = "Stop"
$zk = $null

try {
  try {
    $deviceTimeZone = [TimeZoneInfo]::FindSystemTimeZoneById($TimeZoneId)
  } catch {
    throw "The configured device timezone '$TimeZoneId' was not found on Windows."
  }

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
       $localDateTime = [DateTime]::SpecifyKind(
         (Get-Date -Year $year -Month $month -Day $day -Hour $hour -Minute $minute -Second $second).DateTime,
         [DateTimeKind]::Unspecified
       )
       $occurredAt = [TimeZoneInfo]::ConvertTimeToUtc($localDateTime, $deviceTimeZone)
       $occurredAtText = $occurredAt.ToString("o", [Globalization.CultureInfo]::InvariantCulture)
      $events += [ordered]@{
        deviceEmployeeId = $enrollNumber.Trim()
         occurredAt = $occurredAtText
        direction = $direction
         idempotencyKey = "zkteco-usb:$enrollNumber:$occurredAtText:$verifyMode:$inOutMode:$workCode"
        rawPayload = [ordered]@{
          protocol = "zkteco-usb"
           deviceTimeZone = $TimeZoneId
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