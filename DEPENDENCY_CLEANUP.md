# Dependencies Cleanup

Remove unused dependencies from package.json that are not being used in the codebase.

## Analysis

Conducted a comprehensive dependency analysis using automated scanning and manual verification:

1. **Automated scan** of 1,561 TypeScript/JavaScript files for import statements
2. **Manual verification** using grep searches to catch special usage patterns
3. **Testing validation** to ensure safe removal

## Changes

**Removed unused dependencies:**
- `@cityssm/date-diff@^2.2.3` - Date utility not used in codebase  
- `@cityssm/mssql-multi-pool@^5.1.0` - MSSQL pooling library not used

**Verified as used (initially flagged but actually needed):**
- `@cityssm/fill-block-range` - Used in database/getBurialSiteNamesByRange.ts
- `axe-core` - Used in Cypress accessibility tests
- `ical-generator` - Used in handlers/api-get/milestoneICS.ts
- Frontend libraries served as static assets via Express

## Testing

✅ All tests pass after removal:
- Startup test (4 worker processes start correctly)  
- Unit tests (40/40 passed)
- TypeScript compilation (no errors)

## Impact

- Reduced dependencies from 67 to 65 (-3.0%)
- Smaller attack surface and fewer packages to maintain
- No functional impact on the application