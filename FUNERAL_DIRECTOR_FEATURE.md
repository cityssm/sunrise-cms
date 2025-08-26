# Funeral Director Suggestions Feature

This feature adds funeral director suggestions when editing contracts in the Sunrise CMS application.

## Feature Description

When a funeral home is selected on a contract form, the system uses AJAX to retrieve a list of recently used funeral directors from other contracts with the same funeral home, offering them as suggestions using a HTML5 datalist element.

## Implementation Details

### Database Function

- **File**: `database/getFuneralDirectorsByFuneralHomeId.ts`
- **Function**: `getFuneralDirectorsByFuneralHomeId(funeralHomeId, connectedDatabase?)`
- **Query**: Returns top 20 most frequently used funeral directors for a given funeral home
- **Filtering**: Excludes empty/null names and deleted records
- **Ordering**: By usage count (descending), then alphabetically

### AJAX Endpoint

- **Route**: `POST /contracts/doGetFuneralDirectors`
- **Handler**: `handlers/contracts-post/doGetFuneralDirectors.ts`
- **Input**: `{ funeralHomeId: string }`
- **Output**: `{ success: boolean, funeralDirectors: Array<{funeralDirectorName: string, usageCount: number}> }`

### Frontend Changes

#### Template Modifications (`views/contract-edit.ejs`)

1. **Datalist Element**: Added `list="datalist--funeralDirectors"` to the funeral director input field
2. **Dynamic Datalist**: Added `<datalist id="datalist--funeralDirectors">` element that gets populated dynamically
3. **JavaScript**: Added event handler for funeral home selection changes that triggers AJAX calls

#### Handler Updates

1. **Edit Handler**: Updated to pre-load funeral director suggestions for existing contracts
2. **New Handler**: Updated to provide empty suggestions array for new contracts

## Key Features

1. **Performance Optimization**: For existing contracts, suggestions are pre-loaded to avoid AJAX calls
2. **Error Handling**: Proper error handling in AJAX endpoint and JavaScript
3. **Data Validation**: Validates funeral home ID and filters out invalid records
4. **User Experience**: Non-blocking suggestions that enhance but don't interfere with manual entry

## Test Coverage

The implementation includes:
- Input validation (empty/null funeral home IDs)
- Database filtering (deleted records, empty names)
- Usage-based ordering (most frequently used directors first)
- Cross-browser compatible HTML5 datalist implementation

## Usage

1. Navigate to contract edit page
2. Select a funeral home from the dropdown
3. Click or focus on the "Funeral Director's Name" field
4. View the autocomplete suggestions based on historical data for that funeral home
5. Select a suggestion or type manually

The feature seamlessly integrates with the existing contract management workflow without requiring any changes to the database schema or breaking existing functionality.