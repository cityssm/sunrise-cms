import type { DatabaseSync } from 'node:sqlite'

const sqlStatements = [
  /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_WorkOrderMilestones_workOrderId ON WorkOrderMilestones (workOrderId, recordDelete_timeMillis)
  `,
  /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_WorkOrderBurialSites_workOrderId ON WorkOrderBurialSites (workOrderId, recordDelete_timeMillis)
  `,
  /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_WorkOrderContracts_workOrderId ON WorkOrderContracts (workOrderId, recordDelete_timeMillis)
  `,
  /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_BurialSites_cemeteryId_parentId ON BurialSites (cemeteryId, recordDelete_timeMillis)
  `,
  /* sql */ `
    CREATE INDEX IF NOT EXISTS idx_Cemeteries_parentCemeteryId ON Cemeteries (parentCemeteryId, recordDelete_timeMillis)
  `
]

export default function upgradeToVersion3(database: DatabaseSync): 3 {
  for (const sql of sqlStatements) {
    database.exec(sql)
  }

  return 3
}
