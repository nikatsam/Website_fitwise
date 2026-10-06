# Error Log

## 2026-10-06 — `npm ci` fails on locked Astro native binding

- **Severity:** Medium; clean-install verification blocked.
- **Command:** `npm ci`
- **Error:** Windows returned `EPERM` (`unlink`) for `node_modules/@astrojs/compiler-binding-win32-x64-msvc/astro.win32-x64-msvc.node` because the native file was in use.
- **Impact:** The lockfile-based clean install could not complete, so T019's clean-install acceptance criterion remains unverified. No user process was terminated.
- **Recovery:** After re-verifying and stopping the user-authorized Astro CLI process (PID 42356), `npm ci` completed successfully (389 packages, 0 vulnerabilities). A subsequent `npm run verify` passed: 130/130 tests, static build, dataset validation, SEO, internal-link, and route smoke checks.
- **Status:** Resolved 2026-10-06.
