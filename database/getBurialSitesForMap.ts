import { dateToInteger } from '@cityssm/utils-datetime'
import sqlite from 'better-sqlite3'

import { sunriseDB } from '../helpers/database.helpers.js'

export interface BurialSiteMapContract {
  contractId: number
  contractType: string
  isPreneed: boolean

  contractStartDate: number
  contractEndDate: number | null

  deceasedNames: string[]
}

export interface BurialSiteForMap {
  burialSiteId: number
  burialSiteName: string

  burialSiteLatitude: number | null
  burialSiteLongitude: number | null
  
  cemeteryId: number | null
  cemeteryName: string | null
  contracts: BurialSiteMapContract[]
}

export interface BurialSiteMapResult {
  burialSites: BurialSiteForMap[]
  totalBurialSites: number

  cemeteryLatitude: number | null
  cemeteryLongitude: number | null
}

export default function getBurialSitesForMap(
  cemeteryId: number | string,
  connectedDatabase?: sqlite.Database
): BurialSiteMapResult {
  const database = connectedDatabase ?? sqlite(sunriseDB, { readonly: true })
  
  const currentDate = dateToInteger(new Date())

  // Get cemetery info and total burial site count
  const cemeteryInfo = database
    .prepare(/* sql */ `select 
        c.cemeteryLatitude,
        c.cemeteryLongitude,
        (select count(*) from BurialSites where cemeteryId = ? and recordDelete_timeMillis is null) as totalBurialSites
      from Cemeteries c
      where c.cemeteryId = ?
        and c.recordDelete_timeMillis is null`
    )
    .get(cemeteryId, cemeteryId) as {
      cemeteryLatitude: number | null
      cemeteryLongitude: number | null
      totalBurialSites: number
    } | undefined

  // Get all burial sites with coordinates for the cemetery
  const burialSites = database
    .prepare(/* sql */ `select b.burialSiteId,
        b.burialSiteName,
        b.burialSiteLatitude,
        b.burialSiteLongitude,
        b.cemeteryId,
        cem.cemeteryName
      from BurialSites b
      left join Cemeteries cem on b.cemeteryId = cem.cemeteryId
      where b.recordDelete_timeMillis is null
        and b.cemeteryId = ?
        and b.burialSiteLatitude is not null
        and b.burialSiteLongitude is not null
      order by b.burialSiteName`
    )
    .all(cemeteryId) as BurialSiteForMap[]

  // Get active and future contracts for these burial sites
  const contracts = database
    .prepare(/* sql */ `select c.contractId,
        c.burialSiteId,
        c.contractStartDate,
        c.contractEndDate,
        t.contractType,
        t.isPreneed,
        group_concat(i.deceasedName, ', ') as deceasedNames
      from Contracts c
      left join ContractTypes t on c.contractTypeId = t.contractTypeId
      left join ContractInterments i on c.contractId = i.contractId
      where c.recordDelete_timeMillis is null
        and c.burialSiteId in (select burialSiteId from BurialSites where cemeteryId = ?)
        and (c.contractEndDate is null or c.contractEndDate >= ?)
      group by c.contractId, c.burialSiteId, c.contractStartDate, c.contractEndDate, t.contractType, t.isPreneed
      order by c.contractStartDate`
    )
    .all(cemeteryId, currentDate) as Array<{
      contractId: number
      burialSiteId: number
      contractStartDate: number
      contractEndDate: number | null
      contractType: string
      isPreneed: boolean
      deceasedNames: string | null
    }>

  // Group contracts by burial site
  const contractsByBurialSite = new Map<number, BurialSiteMapContract[]>()
  
  for (const contract of contracts) {
    if (!contractsByBurialSite.has(contract.burialSiteId)) {
      contractsByBurialSite.set(contract.burialSiteId, [])
    }
    
    contractsByBurialSite.get(contract.burialSiteId)!.push({
      contractId: contract.contractId,
      contractType: contract.contractType,
      isPreneed: contract.isPreneed,
      contractStartDate: contract.contractStartDate,
      contractEndDate: contract.contractEndDate,
      deceasedNames: contract.deceasedNames ? contract.deceasedNames.split(', ') : []
    })
  }

  // Attach contracts to burial sites
  for (const site of burialSites) {
    site.contracts = contractsByBurialSite.get(site.burialSiteId) ?? []
  }

  return {
    burialSites,
    totalBurialSites: cemeteryInfo?.totalBurialSites ?? 0,

    // eslint-disable-next-line unicorn/no-null
    cemeteryLatitude: cemeteryInfo?.cemeteryLatitude ?? null,
    
    // eslint-disable-next-line unicorn/no-null
    cemeteryLongitude: cemeteryInfo?.cemeteryLongitude ?? null
  }
}
