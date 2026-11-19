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
})
