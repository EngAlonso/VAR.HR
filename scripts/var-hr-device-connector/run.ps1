param(
  [string]$ConfigPath = (Join-Path $PSScriptRoot "config.json")
)

$ErrorActionPreference = "Stop"
$config = Get-Content -Raw -Path $ConfigPath | ConvertFrom-Json
$readScript = Join-Path $PSScriptRoot "read-zkteco-usb.ps1"
$configuredInterval = if ($null -eq $config.pollIntervalSeconds) { 30 } else { [int]$config.pollIntervalSeconds }
$machineNumber = if ($null -eq $config.machineNumber) { 1 } else { [int]$config.machineNumber }
$interval = [Math]::Max($configuredInterval, 10)
$endpoint = "$($config.apiBaseUrl.TrimEnd('/'))/api/connector/v1/devices/$($config.deviceId)/events"

if ([string]::IsNullOrWhiteSpace($config.apiBaseUrl) -or
    [string]::IsNullOrWhiteSpace($config.deviceId) -or
    [string]::IsNullOrWhiteSpace($config.registrationKey)) {
  throw "apiBaseUrl, deviceId, and registrationKey are required in config.json."
}

while ($true) {
  try {
    $raw = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $readScript -MachineNumber $machineNumber
    $rawJson = $raw -join ""
    if (-not [string]::IsNullOrWhiteSpace($rawJson)) {
      $events = @($rawJson | ConvertFrom-Json)
      $body = @{ events = $events } | ConvertTo-Json -Depth 8 -Compress
      $result = Invoke-RestMethod `
        -Uri $endpoint `
        -Method Post `
        -Headers @{ "x-var-hr-registration-key" = [string]$config.registrationKey } `
        -ContentType "application/json" `
        -Body $body
      Write-Output "$(Get-Date -Format o) uploaded $($result.received) events; accepted=$($result.accepted), duplicates=$($result.duplicates), rejected=$($result.rejected)"
    }
  } catch {
    Write-Error "$(Get-Date -Format o) connector cycle failed: $($_.Exception.Message)"
  }
  Start-Sleep -Seconds $interval
}