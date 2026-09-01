# VAR HR USB Device Connector

This is the automatic Windows connector for USB-only ZKTeco attendance devices
such as the LX15. It runs in the background, reads attendance records through
the ZKTeco `ZKEMKeeper` SDK, and uploads them to VAR HR every few seconds.

## One-time setup

1. Install the ZKTeco Windows SDK that provides and registers
   `zkemkeeper.dll` / the `zkemkeeper.ZKEM.1` COM component.
2. Add the LX15 in VAR HR:
   - connection type: `USB connector`
   - adapter: `zkteco-usb`
3. Save the one-time registration key shown after the device is created.
4. Copy `config.example.json` to `config.json` and fill in:
   - the published VAR HR URL
   - the device UUID
   - the one-time registration key
5. Open PowerShell as Administrator in this directory and run:

```powershell
.\install.ps1
```

The connector is installed as a Windows startup task and retries automatically
when the device or the internet connection is temporarily unavailable.

## Employee mapping

The number used by the employee in the LX15 must be mapped to the employee in
VAR HR under the device's employee mappings. Events from unmapped numbers are
kept as rejected/pending and are never assigned to another employee.