describe('Keep Alive', () => {
    it('Returns true', () => {
        cy.request('/keepAlive').then((response) => {
            expect(response.body).eq(true);
        });
    });
});
export {};
