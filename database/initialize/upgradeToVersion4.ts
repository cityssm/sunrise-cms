import type { DatabaseSync } from 'node:sqlite'

export default function upgradeToVersion4(database: DatabaseSync): 4 {
  database.exec(
    'CREATE INDEX IF NOT EXISTS idx_WorkOrderMilestones_date ON WorkOrderMilestones (workOrderMilestoneDate, recordDelete_timeMillis)'
  )

  return 4
}
