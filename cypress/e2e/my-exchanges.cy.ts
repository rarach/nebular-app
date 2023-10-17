describe('My Exchanges', () => {
  it('Offers adding new custom pair', () => {
    //Trick: go to invalid page to load the web without calling the dependent services, setup a cookie
    cy.visit("/no-such-page");
    cy.setCookie('agr', 'true');
    //WHEN user goes to the page My Exchanges
    cy.visit('/myExchanges');

    //THEN the page title in browser must be "My Exchanges"
    cy.title().should('eq', 'My Exchanges');
    //AND there should be empty placeholder to add new market
    cy.get('div.exchange-link').should('have.length', 1)
      .eq(0).should('contain.text', '(add)');
  });

  it("Show 3 exchanges saved by a user, remove one", () => {
    //Trick: go to invalid page to load the web without calling the dependent services
    cy.visit("/no-such-page");
    cy.setCookie('agr', 'true');
    cy.setCookie('ass',
                 'XCN|GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY|fchain.io|,' +
                 'HKDT|GABSZVZBYEO5F4V5LZKV7GR4SAJ5IKJGGOF43BIN42FNDUG7QPH6IMRQ|mover.scam|null');
    //GIVEN three custom exchanges were previously set up: BTC/BTC, XLM/EURT, XCN/HKDT
    cy.setCookie('exc',
                 "1234567#" +
                 "BTC-GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH/" +        //BTC-NaoBTC
                 "BTC-GCNSGHUCG5VMGLT5RIYYZSO7VQULQKAJ62QA33DBC5PPBSO57LFWVV6P" +         //BTC-interstellar.exchange
                 ",333000444#" +
                 "XLM/EURT-GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S" +    //Euro
                 ",88888888#" +
                 "XCN-GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY/" +        //CNY by fchain.io
                 "HKDT-GABSZVZBYEO5F4V5LZKV7GR4SAJ5IKJGGOF43BIN42FNDUG7QPH6IMRQ");
    //WHEN user goes to My Exchanges page
    cy.visit("/myExchanges");

    //THEN 3 custom exchanges and a placeholder for new one are shown
    cy.get('div.exchange-link').should('have.length', 3 + 1);   //+1 for the trailing (add) button

    //xchange 1
    let dropDowns = () => cy.get("div#customExchange1234567 mat-select.selectedAssetOption");
    dropDowns().eq(0).invoke('attr', 'title').should('eq', 'BTC-GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH');
    dropDowns().eq(0).should('have.text', 'BTC-GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH');
    dropDowns().eq(1).invoke('attr', 'title').should('eq', 'Bitcoin');
    dropDowns().eq(1).should('have.text', 'BTC-interstellar.exchange');

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

    //WHEN user moves cursor over the 2nd exchange
    cy.get('div#customExchange333000444').trigger('mouseover');
    const xIcon =  () => cy.get("div#customExchange333000444 div.removeExchButton");
    //THEN an option to remove the underlying exchange is offered
    xIcon().should('be.visible');
    //WHEN user clicks the button to remove exchange
    xIcon().click();
    //THEN the exchange is removed and only the other 2 remain displayed
    const exchangePanel = () => cy.get('div.customExchange');
    exchangePanel().should('have.length', 2);
    exchangePanel().eq(0).find('div mat-select.selectedAssetOption').eq(0).should('have.text', 'BTC-GATEMHCCKCY67ZUCKTROYN24ZYT5GK4EQZ65JJLDHKHRUZI3EUEKMTCH');
    exchangePanel().eq(0).find('div mat-select.selectedAssetOption').eq(1).should('have.text', 'BTC-interstellar.exchange');
    exchangePanel().eq(1).find('div mat-select.selectedAssetOption').eq(0).should('have.text', 'XCN-fchain.io');
    exchangePanel().eq(1).find('div mat-select.selectedAssetOption').eq(1).should('have.text', 'HKDT-mover.scam');
  });

  it("Add 2 custom exchanges", () => {
    cy.intercept({ method: 'GET', url: '**/trade_aggregations**' }).as('loadTradesReq');
    //GIVEN assets USDC, XCN and TZS are available
    cy.visit("/no-such-page");
    cy.setCookie('agr', 'true');
    cy.setCookie('ass',
                  'USDC|GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN|centre.io|https://www.centre.io/images/usdc/usdc-icon-86074d9d49.png,' +
                  'XCN|GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY|fchain.io|,' +
                  'TZS|GA2MSSZKJOU6RNL3EJKH3S5TB5CDYTFQFWRYFGUJVIN5I6AOIRTLUHTO|connect.clickpesa.com|https://res.cloudinary.com/clickpesa/image/upload/v1603170740/assets/clickpesa-icon.png');
    //WHEN user goes to the page My Exchanges
    cy.visit('/myExchanges');

    //THEN there are No exchanges present by default
    cy.get('div.exchange-link').should('have.length', 1);

    //WHEN user clicks on the (add) button
    cy.get('div.exchange-link').click();

    //THEN new custom exchanges is added to the page
    const exchangePanel = () => cy.get('div.customExchange');
    exchangePanel().should('have.length', 1);

    //WHEN user selects USDC as base currency
    exchangePanel().find('div mat-select.selectedAssetOption').eq(0).click();
    cy.get('mat-option').contains('USDC-centre.io').should('be.visible');
    cy.get('mat-option').contains('USDC-centre.io').click();

    //AND they select TZS as counter currency
    exchangePanel().find('div mat-select.selectedAssetOption').eq(1).click();
    cy.get('mat-option').contains('TZS-connect.clickpesa.com').should('be.visible');
    cy.get('mat-option').contains('TZS-connect.clickpesa.com').click();

    //THEN the first custom exchange starts loading market info
    exchangePanel().find('div.chartWarning').should('be.visible');

    //WHEN the market data is retrieved
    cy.wait('@loadTradesReq').wait('@loadTradesReq');   //wait twice to skip over USDC/XLM too

    //THEN the exchange shows trade history for market USDC/TZS
    exchangePanel().find('div.lastPrice').invoke('text').then(parseFloat).should('be.gte', 0.0);

    //AND the exchange indicate daily gain/loss percentage
    exchangePanel().find('div.dailyChangePercent').should(($div) => {
      const text = $div.text().replace('%', '');
      const dailyDiffPercentage = parseFloat(text);

      if (dailyDiffPercentage >= 0) {
        expect($div).to.have.class('green');
      }
      else {
        expect($div).to.have.class('red');
      }
    });

    //WHEN user adds another very rare exchange pair TZS/XCN
    cy.get('div.exchange-link').eq(1).click();
    exchangePanel().should('have.length', 2);

    cy.wait(2000);  //sucks but works :-( Too fast clicking derails loading a chart. Only acceptable as the fast clicking isn't very realistic.
    exchangePanel().eq(1).find('div mat-select.selectedAssetOption').eq(0).click();
    cy.get('mat-option').contains('TZS-connect.clickpesa.com').should('be.visible');
    cy.get('mat-option').contains('TZS-connect.clickpesa.com').click();

    cy.wait(2000);  //sucks but works :-(
    exchangePanel().eq(1).find('div mat-select.selectedAssetOption').eq(1).click();
    cy.get('mat-option').contains('XCN-fchain.io').should('be.visible');
    cy.get('mat-option').contains('XCN-fchain.io').click();

    //THEN the exchange only shows warning about no recent trades
    cy.wait('@loadTradesReq').wait('@loadTradesReq');
    exchangePanel().eq(1).find('div.dailyChangePercent').should('have.text', '0.00%');
    exchangePanel().find('div.chartWarning').should('be.visible').and('have.text', 'No trades in last 24 hours');

    //WHEN user goes to another page and back to My Exchanges
    cy.visit('/');
    cy.visit('/myExchanges');

    //THEN the page shows the 2 previously configured custom exchanges
    cy.get('div.exchange-link').should('have.length', 2 + 1);
    exchangePanel().eq(0).find('div mat-select.selectedAssetOption').eq(0).should('have.text', 'USDC-centre.io');
    exchangePanel().eq(0).find('div mat-select.selectedAssetOption').eq(1).should('have.text', 'TZS-connect.clickpesa.com');
    exchangePanel().eq(1).find('div mat-select.selectedAssetOption').eq(0).should('have.text', 'TZS-connect.clickpesa.com');
    exchangePanel().eq(1).find('div mat-select.selectedAssetOption').eq(1).should('have.text', 'XCN-fchain.io');
  });
});
