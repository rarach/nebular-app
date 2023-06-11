describe('My Exchanges', () => {
  it('should offer adding new custom pair', () => {
    //Trick: go to invalid page to load the web without calling the dependent services, setup a cookie
    cy.visit("/no-such-page");
    cy.setCookie('agr', 'true');
    cy.visit('/myExchanges');

    cy.title().should('eq', 'My Exchanges');
    cy.get('div.exchange-link').should('have.length', 1)
      .eq(0).should('contain.text', '(add)');
  });

  it("show 3 exchanges saved by a user, remove one", () => {
    //Trick: go to invalid page to load the web without calling the dependent services
    cy.visit("/no-such-page");
    cy.setCookie('agr', 'true');
    cy.setCookie('ass',
                 'XCN|GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY|fchain.io|,' +
                 'HKDT|GABSZVZBYEO5F4V5LZKV7GR4SAJ5IKJGGOF43BIN42FNDUG7QPH6IMRQ|mover.scam|null');
    cy.setCookie('exc',
                 "1234567#" +
                 "BTC-GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH/" +        //BTC-NaoBTC
                 "BTC-GAUTUYY2THLF7SGITDFMXJVYH3LHDSMGEAKSBU267M2K7A3W543CKUEF" +         //BTC-apay.io
                 ",333000444#" +
                 "XLM/EURT-GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S" +    //Euro
                 ",88888888#" +
                 "XCN-GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY/" +        //CNY by fchain.io
                 "HKDT-GABSZVZBYEO5F4V5LZKV7GR4SAJ5IKJGGOF43BIN42FNDUG7QPH6IMRQ");
    cy.visit("/myExchanges");

    cy.get('div.exchange-link').should('have.length', 1 + 3);   //+1 for the trailing (add) button

    //Exchange 1
    let dropDowns = () => cy.get("div#customExchange1234567 mat-select.selectedAssetOption");
    dropDowns().eq(0).invoke('attr', 'title').should('eq', 'BTC-GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH');
    dropDowns().eq(0).should('have.text', 'BTC-GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH');
    dropDowns().eq(1).invoke('attr', 'title').should('eq', 'Bitcoin');
    dropDowns().eq(1).should('have.text', 'BTC-apay.io');

    //Exchange 2
    dropDowns = () => cy.get("div#customExchange333000444 mat-select.selectedAssetOption");
    dropDowns().eq(0).invoke('attr', 'title').should('eq', 'Lumen');
    dropDowns().eq(0).should('have.text', 'XLM');
    dropDowns().eq(1).invoke('attr', 'title').should('eq', 'Euro');
    dropDowns().eq(1).should('have.text', 'EURT-tempo.eu.com');

    //Exchange 3
    dropDowns = () => cy.get("div#customExchange88888888 mat-select.selectedAssetOption");
    dropDowns().eq(0).invoke('attr', 'title').should('eq', 'XCN');
    dropDowns().eq(0).should('have.text', 'XCN-fchain.io');
    dropDowns().eq(1).invoke('attr', 'title').should('eq', 'HKDT');
    dropDowns().eq(1).should('have.text', 'HKDT-mover.scam');

    //Hover over the 2nd exchange to make the (X) icon appear, then click it
    cy.get('div#customExchange333000444').trigger('mouseover');
    const xIcon =  () => cy.get("div#customExchange333000444 div.removeExchButton");
    xIcon().should('be.visible');
    xIcon().click();
    cy.get('div.customExchange').should('have.length', 2);
  });

  it("TODO: adding new custom exchange saves it in cookie", () => {
      //TODO: add 2 exchanges, refresh page, verify cookie. Also merge this with the first 2 tiny tests
  });
});
