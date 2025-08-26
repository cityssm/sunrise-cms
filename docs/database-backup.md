# Database Backup Background Task

The Sunrise CMS includes an automated database backup background task that can create regular backups of your SQLite database.

## Configuration

The backup task is controlled by configuration settings in your `config.js` file:

```javascript
{
  settings: {
    databaseBackup: {
      taskIsEnabled: false,    // Enable/disable the backup task (default: false)
      intervalHours: 24        // Backup interval in hours (default: 24)
    }
  }
}
```

## Features

- **Automatic Scheduling**: Runs at 2 AM daily by default, with respect to minimum interval
- **Configurable Interval**: Set custom backup frequency via `intervalHours` setting
- **Safe Operation**: Uses SQLite's built-in backup API for consistent backups
- **Timestamped Files**: Backup files include timestamps for easy identification
- **Debug Logging**: Uses the same debug system as other Sunrise components

## Backup Location

Backups are stored in the `data/backups/` directory with the format:
- `sunrise.db.{timestamp}` (production)
- `sunrise-testing.db.{timestamp}` (test environments)

## Enabling the Task

To enable database backups:

1. Edit your `config.js` file
2. Set `settings.databaseBackup.taskIsEnabled` to `true`
3. Optionally adjust `settings.databaseBackup.intervalHours`
4. Restart the Sunrise CMS application

## Example Configuration

```javascript
export const config = {
  // ... other settings
  settings: {
    databaseBackup: {
      taskIsEnabled: true,
      intervalHours: 12  // Backup every 12 hours
    }
  }
}
```

## Monitoring

The backup task logs its activity using the `sunrise:database:backupDatabase.task` debug namespace. To see backup logs:

```bash
DEBUG=sunrise:database:backupDatabase* node ./bin/www.js
```

## Implementation Details

The backup task follows the same pattern as other Sunrise background tasks (like the Consigno Cloud integration) and uses the `@cityssm/scheduled-task` library for reliable scheduling.