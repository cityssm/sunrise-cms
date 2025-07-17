import assert from 'node:assert'
import { describe, it } from 'node:test'

import * as burialSitesHelpers from '../helpers/burialSites.helpers.js'
import { getConfigProperty } from '../helpers/config.helpers.js'

await describe('helpers.burialSites', async () => {
  await describe('buildBurialSiteName', async () => {
    const segmentConfig = getConfigProperty(
      'settings.burialSites.burialSiteNameSegments'
    )

    await it('returns a burial site name with all available segments', () => {
      const burialSiteName = burialSitesHelpers.buildBurialSiteName('CEM', {
        burialSiteNameSegment1: 'S1',
        burialSiteNameSegment2: 'S2',
        burialSiteNameSegment3: 'S3',
        burialSiteNameSegment4: 'S4',
        burialSiteNameSegment5: 'S5'
      })

      if (segmentConfig.includeCemeteryKey ?? false) {
        assert.ok(
          burialSiteName.startsWith('CEM'),
          `Burial site name should start with cemetery key: ${burialSiteName}`
        )
      } else {
        assert.ok(
          !burialSiteName.startsWith('CEM'),
          `Burial site name should not start with cemetery key: ${burialSiteName}`
        )
      }

      if (segmentConfig.segments['1']?.isAvailable ?? false) {
        assert.ok(
          burialSiteName.includes('S1'),
          `Burial site name should include segment 1: ${burialSiteName}`
        )
      }

      if (segmentConfig.segments['2']?.isAvailable ?? false) {
        assert.ok(
          burialSiteName.includes('S2'),
          `Burial site name should include segment 2: ${burialSiteName}`
        )
      }

      if (segmentConfig.segments['3']?.isAvailable ?? false) {
        assert.ok(
          burialSiteName.includes('S3'),
          `Burial site name should include segment 3: ${burialSiteName}`
        )
      }

      if (segmentConfig.segments['4']?.isAvailable ?? false) {
        assert.ok(
          burialSiteName.includes('S4'),
          `Burial site name should include segment 4: ${burialSiteName}`
        )
      }

      if (segmentConfig.segments['5']?.isAvailable ?? false) {
        assert.ok(
          burialSiteName.includes('S5'),
          `Burial site name should include segment 5: ${burialSiteName}`
        )
      }
    })
  })
})
