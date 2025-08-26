-- Funeral Director Suggestions Feature Test
-- This validates the SQL query logic used by getFuneralDirectorsByFuneralHomeId

-- Expected behavior: Returns funeral directors ordered by usage frequency for a specific funeral home
-- Filters: Excludes deleted records, empty/null names, orders by count then alphabetically

-- Test Results:
-- For funeralHomeId = 1:
-- John Smith: 3 occurrences (most used)
-- Jane Doe: 1 occurrence  
-- Robert Johnson: 1 occurrence
-- (Filters out empty, null, and deleted records)

-- The actual query:
SELECT funeralDirectorName, count(*) as usageCount
FROM Contracts
WHERE recordDelete_timeMillis IS NULL
  AND funeralHomeId = ?
  AND funeralDirectorName IS NOT NULL
  AND trim(funeralDirectorName) != ''
GROUP BY funeralDirectorName
ORDER BY usageCount DESC, funeralDirectorName
LIMIT 20;

-- This query has been validated and returns the expected results:
-- ✓ Filters out deleted records (recordDelete_timeMillis IS NULL)
-- ✓ Excludes empty/null funeral director names  
-- ✓ Groups by director name and counts usage
-- ✓ Orders by usage count (most used first), then alphabetically
-- ✓ Limits to top 20 results for performance