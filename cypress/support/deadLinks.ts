const testedLinks = new Set<string>()

export function checkDeadLinks(): void {
  cy.get('a[href^="https://"]').each(($link) => {
    const href = $link.attr('href') as string

    // Check if this link has already been tested
    if (testedLinks.has(href)) {
      cy.log(`Skipping already tested link: ${href}`)
      return
    }

    testedLinks.add(href)

    cy.log(`Checking link: ${href}`)

    cy.request({
      url: href,
      failOnStatusCode: false,
      timeout: 10_000
    })
      .its('status')
      .should('be.lessThan', 400)
  })
}
