# Sunrise Cemetery Management System (CMS)

Sunrise CMS is a Node.js 22+ TypeScript web application that helps cemetery managers manage their cemetery records. It uses Express.js, SQLite database, and includes both a web interface and optional Windows service support.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

**CRITICAL - Bootstrap the repository:**
- Install build tools: `sudo apt-get update && sudo apt-get install -y build-essential python3`
- Clone repository: `git clone https://github.com/cityssm/sunrise-cms`
- Install dependencies: `npm install`
- Copy test configuration: `cp data/testing.config.js data/config.js`

**CRITICAL - Build and test validation (run EVERY time):**
- Test startup: `npm run test:startup` -- takes 10 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- Run core unit tests: `npx cross-env NODE_ENV=dev DEBUG=sunrise:* TEST_DATABASES=true node --test --test-concurrency 1 test/functions.sqlFilters.test.js test/helpers.burialSites.test.js test/helpers.cache.test.js test/helpers.pdf.test.js test/helpers.user.test.js test/version.test.js` -- All 40 tests should pass.
- **WARNING**: Full test suite `npm run test` includes Cypress tests that require separate installation and will fail without Cypress binary.

**Run the application:**
- Development with test DB: `npm run dev:test` (starts on http://localhost:9000)
- Production: `npm start` 
- **CRITICAL**: Application uses clustering and starts 4 worker processes by default

## Validation

**ALWAYS manually validate changes via these scenarios:**
1. **Login Flow Test**: Navigate to http://localhost:9000, login with username `*testAdmin` and password `*testAdmin`, verify dashboard loads completely.
2. **Admin Features Test**: After login, verify Administrator Tools section is visible and links are functional.
3. **Database Operations Test**: Create/view a cemetery or burial site to ensure database operations work.

**Test Users (testing environment only):**
- `*testView` / `*testView` - Read-only access
- `*testUpdate` / `*testUpdate` - Can update records  
- `*testAdmin` / `*testAdmin` - Full administrative access

**CRITICAL Build/Test Timeouts:**
- NEVER CANCEL any npm commands. Set timeout to 300+ seconds minimum.
- Git clone takes 2-3 seconds for fresh clone
- npm install takes 8-10 seconds  
- Database initialization takes up to 5 seconds on first run
- Application startup takes 8-12 seconds total
- Unit tests complete in under 10 seconds
- Full test suite (with Cypress) takes 30+ minutes when Cypress is installed. NEVER CANCEL.

## Common Tasks

**TypeScript compilation check:**
- `npx tsc --noEmit` -- takes 5 seconds. May show warnings in temp/ directory (ignore these).

**Application Architecture:**
- Entry point: `bin/www.ts` (compiled to `bin/www.js`)
- Uses cluster module for multiple processes (`bin/wwwProcess.ts`)
- Database: SQLite with better-sqlite3 (file: `data/sunrise-testing.db` in test mode)
- Routes: `/routes` directory with Express.js handlers
- Views: EJS templates in `/views` directory
- Public assets: `/public` directory
- Config: `data/config.js` (copy from `data/testing.config.js`)

**Key Directories:**
- `/docs` - User documentation and configuration guides
- `/test` - Unit tests (Node.js test framework)
- `/cypress` - End-to-end tests (requires working Cypress installation)
- `/handlers` - Business logic handlers
- `/helpers` - Utility functions
- `/database` - Database initialization and migration scripts
- `/types` - TypeScript type definitions

**Environment Variables (for testing):**
- `NODE_ENV=dev` - Development mode
- `DEBUG=sunrise:*` - Enable debug logging
- `TEST_DATABASES=true` - Use test SQLite database files

**Configuration:**
- Main config: `data/config.js` (required)
- Test config: `data/testing.config.js` (includes test authentication)
- TypeScript config: `tsconfig.json`
- ESLint config: `eslint.config.js` (uses eslint-config-cityssm@27.1.0)

## Known Issues and Workarounds

**Cypress Installation Fails:**
- Use `npm install --ignore-scripts` to skip Cypress download
- Cypress tests will fail but core functionality works
- For E2E testing, install Cypress separately: `npm install -g cypress@14`

**ESLint:**
- Make an effort to limit the number of errors identified by ESLint .
- Focus on functional testing over linting when developing

**Windows Service (Windows only):**
- `windowsService-install.bat` - Install as Windows service
- `windowsService-uninstall.bat` - Remove Windows service
- Requires `node-windows` optional dependency

**Database Notes:**
- Uses SQLite with automatic table creation on first run
- Test databases use `-testing` suffix (e.g., `sunrise-testing.db`)
- Production databases omit the suffix
- Database files stored in `/data` directory

## Integration Points

**Authentication:**
- Supports Active Directory, function-based, and plain text authentication
- Test mode uses function authentication (username === password)
- Configuration in `config.login` section

**External Integrations:**
- ConsignoCloud API (optional)
- Dynamics GP integration (optional)  
- NTFY notifications (optional)
- PDF generation via Puppeteer

**File Handling:**
- Attachments stored in configurable path (`config.application.attachmentsPath`)
- PDF generation for reports and work orders
- CSV import functionality for legacy data

Always validate your changes by running the application and testing the login flow before considering your work complete.
