import assert from 'node:assert'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

await describe('dashboard today services', async () => {
  await it('renders a collapsible list of contracts with services today', async () => {
    const template = await readFile(
      new URL('../views/dashboard/dashboard.ejs', import.meta.url),
      'utf8'
    )

    assert.match(template, /<details class="panel-block is-block">/)
    assert.match(template, /contracts\.length === 1/)
    assert.match(template, /with service\(s\) today/)
    assert.match(template, /\/contracts\/<%= contract\.contractId %>/)
  })
})
