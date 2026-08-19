# Preview/runtime root-cause investigation

## Scope

Investigate why VAR HR Preview repeatedly disappears or requires recovery,
tracing artifact registration, managed workflows, artifact TOML, startup
commands, ports, base paths, API startup, and normal workflow reload.

## Root cause

The recurring Preview loss is not caused by VAR HR code or its checked-in
runtime configuration.

The imported workspace can retain the three existing
`.replit-artifact/artifact.toml` files while the Replit-managed artifact and
workflow registry is empty. This was reproduced in the current session:

- `listArtifacts()` returned an empty list.
- `listWorkflows()` returned an empty list.
- All three existing artifact TOML files were present on disk.

Artifact registration and managed workflow records are runtime state outside
the repository. The generated root `.replit` file only contains the project
run-button selection; it is not an artifact-registration manifest. There is no
project-side startup hook exposed here that can durably reconstruct the
managed registry after a fresh import/resumed session.

Creating a conventional replacement workflow would not solve that root cause.
It would omit artifact-owned routing/environment behavior and could conflict
with the real artifact preview path. Therefore no duplicate or replacement
workflow was created.

This is a Replit import/runtime limitation outside the project. A future fresh
import may require the existing TOML metadata to be refreshed through Replit's
supported artifact registration operation again. That is platform recovery,
not a project workaround.

## Configuration audit

The existing configuration was inspected without changing its contents:

- `artifacts/var-hr/.replit-artifact/artifact.toml`
  - kind `web`
  - preview path `/`
  - service `web`
  - path `/`
  - managed local port `22077`
  - command `pnpm --filter @workspace/var-hr run dev`
- `artifacts/api-server/.replit-artifact/artifact.toml`
  - kind `api`
  - preview path `/api`
  - service `API Server`
  - path `/api`
  - managed local port `8080`
  - command `pnpm --filter @workspace/api-server run dev`
- `artifacts/mockup-sandbox/.replit-artifact/artifact.toml`
  - existing Canvas component-preview service; registration was preserved
- `artifacts/var-hr/vite.config.ts`
  - requires managed `PORT` and `BASE_PATH`
  - uses `base: BASE_PATH`
  - uses strict port binding
  - binds `0.0.0.0`
  - allows proxied hosts
- `artifacts/api-server/src/index.ts`
  - requires managed `PORT`
  - listens on that port

The startup commands, service paths, base-path handling, and port handling are
therefore not the source of the recurring registration loss.

## Recovery performed

The three existing TOML files were refreshed through the supported artifact
metadata verifier, using their current full contents. This restored the
original artifacts and workflow names:

- `artifacts/api-server: API Server`
- `artifacts/var-hr: web`
- `artifacts/mockup-sandbox: Component Preview Server`

No new artifact ID, service, workflow, preview path, or command was created.

## Separate API initialization issue

After registration, the existing API workflow initially failed before opening
port 8080 because the imported development database did not contain the
existing `var_hr_companies` table. The existing Drizzle schema was applied
non-destructively:

```text
pnpm --filter @workspace/db run push
```

This was a development setup issue separate from Preview registration. No
drop, truncate, reset, or data erasure was performed. The schema now persists
across normal workflow restarts. The existing `scripts/post-merge.sh` already
applies the development schema after merges, but it cannot register artifacts
because artifact registration is external Replit runtime state.

## Verification

### Initial start

- Existing VAR HR workflow started on port `22077`: PASS
- Existing API workflow first failed on missing database table: diagnosed
- Schema push completed successfully: PASS
- Existing API workflow restarted on port `8080`: PASS

### Frontend and API

- `GET http://127.0.0.1:22077/`: HTTP 200: PASS
- Frontend title `VAR HR`: PASS
- `GET http://127.0.0.1:8080/api/healthz`: HTTP 200 with
  `{"status":"ok"}`: PASS
- Arabic workspace request returned `locale: "ar"` and `direction: "rtl"`:
  PASS
- Proxied Preview screenshot rendered the dashboard: PASS

### Restart/reload path

The same existing managed workflows were restarted:

- `artifacts/var-hr: web`: PASS
- `artifacts/api-server: API Server`: PASS

After restart:

- Both workflows reported `running`: PASS
- Ports remained `22077` and `8080`: PASS
- Artifact registry still contained all three existing artifacts: PASS
- Workflow registry still contained all three original workflows: PASS
- Frontend remained HTTP 200 and rendered the dashboard: PASS
- API health remained HTTP 200 with `{"status":"ok"}`: PASS
- Post-restart Preview screenshot rendered the dashboard: PASS

## Remaining external limitation

Normal workflow restart/reload is healthy and was verified. A new imported
session may still require supported artifact registration refresh because the
Replit-managed registry is outside the repository. There is no permanent
project configuration change available to eliminate that platform behavior,
and adding a duplicate workflow would be the wrong mitigation.

The browser console also retains an unrelated existing React hook-order warning
in `Overview`; it does not block Preview or API health and was intentionally
left outside this runtime fix.