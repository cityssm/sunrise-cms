import { testView } from '../../../test/_globals.js';
import { login, logout } from '../../support/index.js';
describe('SVG map highlighting', () => {
    beforeEach(() => {
        logout();
        login(testView);
    });
    afterEach(logout);
    for (const mapKey of ['1SWS-09-01', '2SWS-1A-01', 'DON-9C-01', 'site:1.2']) {
        it(`Highlights the exact ID ${mapKey}`, () => {
            cy.window().then((window) => {
                const sunrise = window
                    .exports.sunrise;
                const container = window.document.createElement('div');
                container.innerHTML =
                    '<svg><g style="fill: red"><path style="fill: blue" /></g><path id="other" style="fill: green" /></svg>';
                const highlighted = container.querySelector('g');
                highlighted.id = mapKey;
                sunrise.highlightMap(container, mapKey, 'success');
                expect(highlighted.classList.contains('highlight')).to.equal(true);
                expect(highlighted.classList.contains('is-success')).to.equal(true);
                expect(highlighted.style.fill).to.equal('');
                expect(highlighted.querySelector('path').style.fill).to.equal('');
                expect(container.querySelector('#other')?.getAttribute('style')).to.equal('fill: green');
            });
        });
    }
    it('Falls back to a numeric-leading parent ID', () => {
        cy.window().then((window) => {
            const sunrise = window
                .exports.sunrise;
            const container = window.document.createElement('div');
            container.innerHTML = '<svg><path id="2SWS" /></svg>';
            sunrise.highlightMap(container, '2SWS-1A-01', 'danger');
            expect(container.querySelector('path')?.classList.contains('highlight')).to.equal(true);
            expect(container.querySelector('path')?.classList.contains('is-danger')).to.equal(true);
        });
    });
    it('Leaves the map unchanged for missing or empty IDs', () => {
        cy.window().then((window) => {
            const sunrise = window
                .exports.sunrise;
            const container = window.document.createElement('div');
            container.innerHTML = '<svg><path id="other" style="fill: green" /></svg>';
            const original = container.outerHTML;
            sunrise.highlightMap(container, '3MISSING-01', 'danger');
            sunrise.highlightMap(container, '', 'success');
            expect(container.outerHTML).to.equal(original);
        });
    });
});
