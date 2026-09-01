param(
  [string]$ConnectorPath = $PSScriptRoot,
  [string]$TaskName = "VAR HR USB Device Connector"
)

$ErrorActionPreference = "Stop"
$configPath = Join-Path $ConnectorPath "config.json"
$runScript = Join-Path $ConnectorPath "run.ps1"

if (-not (Test-Path $configPath)) {
  throw "Create config.json from config.example.json before installing the connector."
}
if (-not (Test-Path $runScript)) {
  throw "run.ps1 was not found."
}

$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$runScript`" -ConfigPath `"$configPath`""
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Force | Out-Null

Start-ScheduledTask -TaskName $TaskName
Write-Output "Installed and started $TaskName."