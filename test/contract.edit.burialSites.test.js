import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

await describe('contract burial site selector', async () => {
  await it('includes the search filters and contract status labels', async () => {
    const html = await readFile(
      './public/html/contract-selectBurialSite.html',
      'utf8'
    )

    assert.match(html, /placeholder="Search by burial site name\.\.\."/)
    assert.match(html, /name="cemeteryId"/)
    assert.match(html, /name="burialSiteTypeId"/)
    assert.match(html, /\(No Contract Filter Applied\)/)
    assert.match(html, />\s*No Contracts\s*</)
    assert.match(html, />\s*Has Contracts\s*</)
  })

  await it('renders type, limit message, and separate result actions', async () => {
    const script = await readFile(
      './public/javascripts/contract.edit.ts',
      'utf8'
    )

    assert.match(script, /burialSite\.burialSiteType/)
    assert.match(script, /search result limit has been reached/)
    assert.match(script, /target="_blank"/)
    assert.match(script, />\s*Select\s*</)
  })

  await it('shows burial site type under name and capacity columns', async () => {
    const script = await readFile(
      './public/javascripts/burialSite.search.ts',
      'utf8'
    )

    assert.match(script, /burialSite\.burialSiteType/)
    assert.match(script, /<th>Set Capacity<\/th>/)
    assert.match(script, /<th>Used Capacity<\/th>/)
    assert.match(script, /burialSite\.bodyCapacityUsed/)
    assert.match(script, /burialSite\.crematedCapacityUsed/)
    assert.match(script, /burialSite\.setBodyCapacity/)
    assert.match(script, /burialSite\.setCrematedCapacity/)
  })

  await it('resolves set capacity through burial site, type, and settings', async () => {
    const handler = await readFile(
      './handlers/burialSitesPost/doSearchBurialSites.ts',
      'utf8'
    )

    assert.match(handler, /burialSiteTypes\.bodyCapacityMaxDefault/)
    assert.match(handler, /burialSiteTypes\.crematedCapacityMaxDefault/)
    assert.match(handler, /burialSite\.bodyCapacity\s*\?\?/)
    assert.match(handler, /burialSite\.bodyCapacityMax\s*\?\?/)
    assert.match(handler, /burialSite\.crematedCapacity\s*\?\?/)
    assert.match(handler, /burialSite\.crematedCapacityMax\s*\?\?/)
  })
})
