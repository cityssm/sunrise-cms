/*
 * All types related to the application, such as messages sent to workers, etc.
 */

export type CacheBurialSiteIdsWorkerMessage = WorkerMessage & {
  messageType: 'cacheBurialSiteIds'

  burialSiteId: number
  nextBurialSiteId: number
}

export type ClearCacheWorkerMessage = WorkerMessage & {
  messageType: 'clearCache'

  tableName: string
}

export type ClearNextPreviousBurialSiteIdsCacheWorkerMessage = WorkerMessage & {
  messageType: 'clearNextPreviousBurialSiteIdCache'

  burialSiteId: number
}

export type WorkerMessage = {
  messageType: string
  pid: number
  timeMillis: number
}
