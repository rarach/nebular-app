describe('Configuration page', () => {
  it('should display title "Nebular - Configuration" and cookie agreement prompt', () => {
    cy.visit('/configuration');
    cy.title().should('eq', 'Nebular - Configuration');

    const cookieButton = cy.get('button#agreeCookie');
    cookieButton.click();

    const assetCodeInput = cy.get('input#newAssetCode');
    assetCodeInput.should('be.visible');
  });

  it('finds and adds two new custom assets (BTC anchors)', () => {
    //Trick: go to invalid page to load the web without calling the dependent services, setup a cookie
    cy.visit('/no-such-page');
    cy.setCookie('agr', 'true');
    //Actual page being tested
    cy.visit('/configuration');
  
    //Fill the asset input with "BTC"
    const assetCodeInput = cy.get('input#newAssetCode');
    assetCodeInput.type('BTC');

    cy.get('button#findAssetCodeBtn').click();

    const resultsTable = () => cy.get('table#foundAssetsTable', { timeout: 5000 });

    //Check for most common BTC anchors
    const anchorRow1 = () => resultsTable().find('tr#BTC-GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF');    
    anchorRow1().should('have.text', 'BTC-dead.apay.io' + 'Add');

    const anchorImage1 = anchorRow1().find('img.asset-icon');
    anchorImage1.invoke('attr', 'src').should('contain', 'apay.io');    //They wouldn't outsource the icons, right?

    const anchorRow2 = () => resultsTable().find('tr#BTC-GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5');
    anchorRow2().should('have.text', 'BTC-stellarport.io' + 'Add');

    const anchorImage2 = anchorRow2().find('img.asset-icon');
    anchorImage2.invoke('attr', 'src').should('contain', 'stellarport.io');

    //Verify that the two BTC anchors are not among user's custom assets already
    const assetsTable = () => cy.get('table#customAssetsTable');
    assetsTable().find('tr#BTC-GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF').should('not.exist'); //apay.io
    assetsTable().find('tr#BTC-GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5').should('not.exist'); //stellarport.io

    const addButton1 = anchorRow1().find('button.addButton');
    addButton1.click();
    //Verify it's been removed from the first list and added to the second
    anchorRow1().should('not.exist');
    assetsTable().find('tr#BTC-GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF').should('exist');

    const addButton2 = anchorRow2().find('button.addButton');
    addButton2.click();
    //Removed from available, added among stored
    anchorRow2().should('not.exist');
    assetsTable().find('tr#BTC-GBVOL67TMUQBGL4TZYNMY3ZQ5WGQYFPFD5VJRWXR72VA33VFNL225PL5').should('exist');
  });

  it("contains list of custom assets saved by user", () => {     //TODO: "... and removes one of them"
    //Trick: go to invalid page to load the web without calling the dependent services
    cy.visit("/no-such-page");
    cy.setCookie("agr", "true");
    cy.setCookie("ass",
                 "RUB|GUBERNIA2929292929292929|noSuch.ru|https://noSuch.ru/rub.ico,"+
                 "UHH|GBEDEDEDEDE|GBE...DEDEDE|,"+
                 "BTC|GBSTRONGHODL455519K7YY|GBSTR...K7YY|null,"+
                 "zzzzz|GCCP|example.org|./assets/images/asset_icons/unknown.png");
    cy.visit("/configuration");

    cy.get('tr.asset-item').should('have.length', 4);
    cy.get('tr.asset-item').eq(0).should('have.text', 'RUB-noSuch.ru' + 'Remove');
    cy.get('tr.asset-item').eq(1).should('have.text', 'UHH-GBE...DEDEDE' + 'Remove');
    cy.get('tr.asset-item').eq(2).should('have.text', 'BTC-GBSTR...K7YY' + 'Remove');
    cy.get('tr.asset-item').eq(3).should('have.text', 'zzzzz-example.org' + 'Remove');
  });
});
