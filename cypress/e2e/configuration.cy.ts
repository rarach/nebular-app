describe('Configuration page', () => {
  it('should display title "Nebular - Configuration" and cookie agreement prompt', () => {
    cy.visit('/configuration');
    cy.title().should('eq', 'Nebular - Configuration');

    const cookieButton = cy.get('button#agreeCookie');
    cookieButton.click();

    const assetCodeInput = cy.get('input#newAssetCode');
    assetCodeInput.should('be.visible');
  })
})