import { externalPageLoadTimeoutMillis, useLongerTimeouts } from './timeouts.js';
const testedLinks = new Set([
    'https://cityssm.github.io/sunrise-cms',
    'https://cityssm.github.io/sunrise-cms/',
    'https://cityssm.github.io/sunrise-cms/docs',
    'https://cityssm.github.io/sunrise-cms/docs/',
    'https://github.com/cityssm/sunrise-cms',
    'https://github.com/cityssm/sunrise-cms/releases'
]);
function isGitHubLink(href) {
    return href.includes('github');
}
export function checkDeadLinks() {
    if (useLongerTimeouts) {
        cy.log('Using longer timeouts, skipping dead link checks to save time');
    }
    else {
        cy.get('a[href^="https://"]').each(($link) => {
            const href = $link.attr('href');
            if (href === undefined) {
                return;
            }
            if (testedLinks.has(href) ||
                testedLinks.has(`${href}/`) ||
                !isGitHubLink(href)) {
                cy.log(`Skipping link: ${href}`);
                return;
            }
            testedLinks.add(href);
            cy.log(`Checking link: ${href}`);
            cy.request({
                url: href,
                failOnStatusCode: false,
                timeout: externalPageLoadTimeoutMillis
            })
                .its('status')
                .should('be.lessThan', 400);
        });
    }
}
