// Simple test to verify the funeral director functionality
const sqlite = require('better-sqlite3')
const getFuneralDirectorsByFuneralHomeId = require('./database/getFuneralDirectorsByFuneralHomeId.js').default

// Create a test database in memory
const db = sqlite(':memory:')

// Create the Contracts table
db.exec(`
CREATE TABLE Contracts (
  contractId INTEGER PRIMARY KEY,
  funeralHomeId INTEGER,
  funeralDirectorName TEXT,
  recordDelete_timeMillis INTEGER
)
`)

// Insert test data
const insertContract = db.prepare(`
INSERT INTO Contracts (contractId, funeralHomeId, funeralDirectorName, recordDelete_timeMillis)
VALUES (?, ?, ?, ?)
`)

// Insert test contracts with funeral directors
insertContract.run(1, 1, 'John Smith', null)
insertContract.run(2, 1, 'Jane Doe', null)
insertContract.run(3, 1, 'John Smith', null) // Duplicate for count test
insertContract.run(4, 2, 'Bob Johnson', null) // Different funeral home
insertContract.run(5, 1, '', null) // Empty name should be ignored
insertContract.run(6, 1, 'Alice Brown', 123456) // Deleted record should be ignored

// Test the function
console.log('Testing getFuneralDirectorsByFuneralHomeId...')

const results1 = getFuneralDirectorsByFuneralHomeId(1, db)
console.log('Funeral Home 1 directors:', results1)

const results2 = getFuneralDirectorsByFuneralHomeId(2, db)
console.log('Funeral Home 2 directors:', results2)

const results3 = getFuneralDirectorsByFuneralHomeId(999, db)
console.log('Non-existent Funeral Home directors:', results3)

db.close()
console.log('Test completed successfully!')