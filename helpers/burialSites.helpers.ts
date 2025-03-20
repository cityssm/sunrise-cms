// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/strict-boolean-expressions, security/detect-object-injection */

import cluster from 'node:cluster'

import { minutesToSeconds } from '@cityssm/to-millis'
import Debug from 'debug'
import NodeCache from 'node-cache'

import getNextBurialSiteIdFromDatabase from '../database/getNextBurialSiteId.js'
import getPreviousBurialSiteIdFromDatabase from '../database/getPreviousBurialSiteId.js'
import { DEBUG_NAMESPACE } from '../debug.config.js'
import type {
  CacheBurialSiteIdsWorkerMessage,
  ClearNextPreviousBurialSiteIdsCacheWorkerMessage
} from '../types/applicationTypes.js'

import { getConfigProperty } from './config.helpers.js'

const debug = Debug(`${DEBUG_NAMESPACE}:burialSites.helpers:${process.pid}`)

const cacheOptions: NodeCache.Options = {
  stdTTL: minutesToSeconds(2),
  useClones: false
}

const previousBurialSiteIdCache = new NodeCache(cacheOptions)

const nextBurialSiteIdCache = new NodeCache(cacheOptions)

function cacheBurialSiteIds(
  burialSiteId: number,
  nextBurialSiteId: number,
  relayMessage = true
): void {
  previousBurialSiteIdCache.set(nextBurialSiteId, burialSiteId)
  nextBurialSiteIdCache.set(burialSiteId, nextBurialSiteId)

  try {
    if (relayMessage && cluster.isWorker && process.send !== undefined) {
      const workerMessage: CacheBurialSiteIdsWorkerMessage = {
        messageType: 'cacheBurialSiteIds',
        burialSiteId,
        nextBurialSiteId,
        timeMillis: Date.now(),
        pid: process.pid
      }

      debug(
        `Sending cache burial site ids from worker: (${burialSiteId}, ${nextBurialSiteId})`
      )

      process.send(workerMessage)
    }
  } catch {
    // Ignore
  }
}

export async function getNextBurialSiteId(
  burialSiteId: number
): Promise<number | undefined> {
  let nextBurialSiteId: number | undefined =
    nextBurialSiteIdCache.get(burialSiteId)

  if (nextBurialSiteId === undefined) {
    nextBurialSiteId = await getNextBurialSiteIdFromDatabase(burialSiteId)

    if (nextBurialSiteId !== undefined) {
      cacheBurialSiteIds(burialSiteId, nextBurialSiteId)
    }
  }

  return nextBurialSiteId
}

export async function getPreviousBurialSiteId(
  burialSiteId: number
): Promise<number | undefined> {
  let previousBurialSiteId: number | undefined =
    previousBurialSiteIdCache.get(burialSiteId)

  if (previousBurialSiteId === undefined) {
    previousBurialSiteId = await getPreviousBurialSiteIdFromDatabase(burialSiteId)

    if (previousBurialSiteId !== undefined) {
      cacheBurialSiteIds(previousBurialSiteId, burialSiteId)
    }
  }

  return previousBurialSiteId
}

export function clearNextPreviousBurialSiteIdCache(
  burialSiteId = -1,
  relayMessage = true
): void {
  if (burialSiteId === -1) {
    previousBurialSiteIdCache.flushAll()
    nextBurialSiteIdCache.flushAll()
    return
  }

  const previousBurialSiteId: number | undefined =
    previousBurialSiteIdCache.get(burialSiteId)

  if (previousBurialSiteId !== undefined) {
    nextBurialSiteIdCache.del(previousBurialSiteId)
    previousBurialSiteIdCache.del(burialSiteId)
  }

  const nextBurialSiteId: number | undefined =
    nextBurialSiteIdCache.get(burialSiteId)

  if (nextBurialSiteId !== undefined) {
    previousBurialSiteIdCache.del(nextBurialSiteId)
    nextBurialSiteIdCache.del(burialSiteId)
  }

  try {
    if (relayMessage && cluster.isWorker && process.send !== undefined) {
      const workerMessage: ClearNextPreviousBurialSiteIdsCacheWorkerMessage = {
        // eslint-disable-next-line no-secrets/no-secrets
        messageType: 'clearNextPreviousBurialSiteIdCache',
        burialSiteId,
        timeMillis: Date.now(),
        pid: process.pid
      }

      debug(
        `Sending clear next/previous burial site cache from worker: ${burialSiteId}`
      )

      process.send(workerMessage)
    }
  } catch {
    // Ignore
  }
}

const segmentConfig = getConfigProperty(
  'settings.burialSites.burialSiteNameSegments'
)

export function buildBurialSiteName(cemeteryKey: string | undefined, segments: {
  burialSiteNameSegment1?: string
  burialSiteNameSegment2?: string
  burialSiteNameSegment3?: string
  burialSiteNameSegment4?: string
  burialSiteNameSegment5?: string
}): string {
  const segmentPieces: string[] = []

  if (segmentConfig.includeCemeteryKey && cemeteryKey !== undefined) {
    segmentPieces.push(cemeteryKey)
  }

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  for (let segmentIndex = 1; segmentIndex <= 5; segmentIndex++) {
    const segmentIndexString = segmentIndex.toString()

    if (
      (segmentConfig.segments[segmentIndexString]?.isAvailable ?? false) &&
      ((segmentConfig.segments[segmentIndexString]?.isRequired ?? false) ||
        (segments[`burialSiteNameSegment${segmentIndexString}`] ?? '') !== '')
    ) {
      segmentPieces.push(
        (segmentConfig.segments[segmentIndexString]?.prefix ?? '') +
          (segments[`burialSiteNameSegment${segmentIndexString}`] ?? '') +
          (segmentConfig.segments[segmentIndexString]?.suffix ?? '')
      )
    }
  }

  return segmentPieces.join(segmentConfig.separator ?? '-')
}

process.on(
  'message',
  (
    message:
      | ClearNextPreviousBurialSiteIdsCacheWorkerMessage
      | CacheBurialSiteIdsWorkerMessage
  ) => {
    if (message.pid !== process.pid) {
      switch (message.messageType) {
        case 'cacheBurialSiteIds': {
          debug(
            `Caching burial site ids: (${message.burialSiteId}, ${message.nextBurialSiteId})`
          )
          cacheBurialSiteIds(
            message.burialSiteId,
            message.nextBurialSiteId,
            false
          )
          break
        }
        // eslint-disable-next-line no-secrets/no-secrets
        case 'clearNextPreviousBurialSiteIdCache': {
          debug(
            `Clearing next/previous burial site cache: ${message.burialSiteId}`
          )
          clearNextPreviousBurialSiteIdCache(message.burialSiteId, false)
          break
        }
      }
    }
  }
)
