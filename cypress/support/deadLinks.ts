import { externalPageLoadTimeoutMillis } from './timeouts.js'

// Initialize with links to ignore because they are on almost every page
const testedLinks = new Set<string>([
  'https://cityssm.github.io/sunrise-cms',
  'https://cityssm.github.io/sunrise-cms/',
  'https://cityssm.github.io/sunrise-cms/docs',
  'https://cityssm.github.io/sunrise-cms/docs/',
  'https://github.com/cityssm/sunrise-cms',
  'https://github.com/cityssm/sunrise-cms/releases'
])

// Limit check to GitHub-hosted links to keep this test focused and fast.
function isGitHubLink(href: string): boolean {
  return href.includes('github')
}

export function checkDeadLinks(): void {
  cy.get('a[href^="https://"]').each(($link) => {
    const href = $link.attr('href')

    if (href === undefined) {
      return
    }

    // Check if this link has already been tested
    if (
      testedLinks.has(href) ||
      testedLinks.has(`${href}/`) ||
      !isGitHubLink(href)
    ) {
      cy.log(`Skipping link: ${href}`)
      return
    }

    testedLinks.add(href)

    cy.log(`Checking link: ${href}`)

    cy.request({
      url: href,

      failOnStatusCode: false,
      timeout: externalPageLoadTimeoutMillis
    })
      .its('status')
      .should('be.lessThan', 400)
  })
}
