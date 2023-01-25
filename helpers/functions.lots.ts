import NodeCache from 'node-cache'

import getPreviousLotIdFromDatabase from './lotOccupancyDB/getPreviousLotId.js'
import getNextLotIdFromDatabase from './lotOccupancyDB/getNextLotId.js'

const timeToLiveMinutes = 2

const previousLotIdCache = new NodeCache({
  stdTTL: timeToLiveMinutes * 60,
  useClones: false
})

const nextLotIdCache = new NodeCache({
  stdTTL: timeToLiveMinutes * 60
})

function cacheLotIds(lotId: number, nextLotId: number): void {
  previousLotIdCache.set(nextLotId, lotId)
  nextLotIdCache.set(lotId, nextLotId)
}

export async function getNextLotId(lotId: number): Promise<number | undefined> {
  let nextLotId: number | undefined = nextLotIdCache.get(lotId)

  if (nextLotId === undefined) {
    nextLotId = await getNextLotIdFromDatabase(lotId)

    if (nextLotId !== undefined) {
      cacheLotIds(lotId, nextLotId)
    }
  }

  return nextLotId
}

export async function getPreviousLotId(
  lotId: number
): Promise<number | undefined> {
  let previousLotId: number | undefined = previousLotIdCache.get(lotId)

  if (previousLotId === undefined) {
    previousLotId = await getPreviousLotIdFromDatabase(lotId)

    if (previousLotId !== undefined) {
      cacheLotIds(previousLotId, lotId)
    }
  }

  return previousLotId
}

export function clearNextPreviousLotIdCache(lotId?: number): void {
  if (lotId === undefined) {
    previousLotIdCache.flushAll()
    nextLotIdCache.flushAll()
    return
  }

  const previousLotId: number | undefined = previousLotIdCache.get(lotId)

  if (previousLotId !== undefined) {
    nextLotIdCache.del(previousLotId)
    previousLotIdCache.del(lotId)
  }

  const nextLotId: number | undefined = nextLotIdCache.get(lotId)

  if (nextLotId !== undefined) {
    previousLotIdCache.del(nextLotId)
    nextLotIdCache.del(lotId)
  }
}
