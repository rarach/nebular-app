import { Component, OnInit, Input } from '@angular/core';
import { AssetService } from '../services/asset.service';
import { DropdownOption } from '../model/dropdown-option';
import { ExchangePair } from '../model/exchange-pair.model';
import { KnownAssets } from '../model/asset.model';


@Component({
    selector: 'app-custom-exchange',
    templateUrl: './custom-exchange.component.html',
    styleUrls: ['./custom-exchange.component.css']
})
export class CustomExchangeComponent implements OnInit {
    @Input() exchange: ExchangePair;

    assetCodeOptions: DropdownOption[] = [];            
    selectedBaseAssetCode: DropdownOption = null;
    selectedCounterAssetCode: DropdownOption = null;
    baseIssuerOptions: DropdownOption[] = [];       //TODO: could be directly Account[] ?
    counterIssuerOptions: DropdownOption[] = []
    selectedBaseIssuer: DropdownOption = null;
    selectedCounterIssuer: DropdownOption = null;


    constructor(private assetService: AssetService) {
        this.loadAssetCodes();
    }

    ngOnInit() {
        this.setupUi();
    }


    private setupUi(){
        //Set selected option in base asset code drop-down
        let baseCodeDdOption: DropdownOption = null;
        for (let option of this.assetCodeOptions) {
            if (option.value === this.exchange.baseAsset.code) {
                baseCodeDdOption = option;
                break;
            }
        }
        this.selectedBaseAssetCode = baseCodeDdOption;
        //and counter code drop-down
        let counCodeDdOption: DropdownOption = null;
        for (let option of this.assetCodeOptions) {
            if (option.value === this.exchange.counterAsset.code) {
                counCodeDdOption = option;
                break;
            }
        }
        this.selectedCounterAssetCode = counCodeDdOption;

        this.loadBaseIssuers();
        this.loadCounterIssuers();
    }

    private updateExchange() {
        const baseAssetCode = this.selectedBaseAssetCode.value;
        const baseIssuerAddress = this.selectedBaseIssuer.value;
        const counterAssetCode = this.selectedCounterAssetCode.value;
        const counterIssuerAddress = this.selectedCounterIssuer.value;

        this.assetService.UpdateCustomExchange(this.exchange.id, baseAssetCode, baseIssuerAddress, counterAssetCode, counterIssuerAddress);
    }

    removeExchange() {
        this.assetService.RemoveCustomExchange(this.exchange.id);
    }


    /*********************************** Asset code/issuer drop-downs ***********************************/

    /** Load available asset codes for the drop-downs */
    private loadAssetCodes() {
        for (let assetCode of this.assetService.getAssetCodesForExchange()) {
            //Search for asset full name among know assets
            let assetFullName: string = assetCode + " (custom)";
            for (let asset in KnownAssets) {
                if (KnownAssets[asset].code === assetCode) {
                    assetFullName = KnownAssets[asset].fullName;
                    break;
                }
            }

            this.assetCodeOptions.push(new DropdownOption(assetCode, assetCode, assetFullName));
        }
    }

    /** Load list of valid anchors for selected base/counter asset codes */
    private loadBaseIssuers() {
        this.baseIssuerOptions = [];
        const issuersArray = this.assetService.GetIssuersByAssetCode(/*DEL? this.exchange.baseAsset.code*/this.selectedBaseAssetCode.value);
        const issuerAccount = this.assetService.GetIssuerByAddress(this.exchange.baseAsset.issuer.address);

        for (let i=0; i<issuersArray.length; i++) {
            const ddOption = new DropdownOption(issuersArray[i].address, issuersArray[i].domain, issuersArray[i].shortName);
            this.baseIssuerOptions.push(ddOption);
            //By default, pre-select the first option
            if (0 === i) {
                this.selectedBaseIssuer = ddOption;
            }
            if (null != issuerAccount && issuersArray[i].address === issuerAccount.address) {
                this.selectedBaseIssuer = ddOption;
            }
        }
    }

    private loadCounterIssuers() {
        this.counterIssuerOptions = [];
        const issuersArray = this.assetService.GetIssuersByAssetCode(/*DEL? this.exchange.counterAsset.code*/ this.selectedCounterAssetCode.value);
        const issuerAccount = this.assetService.GetIssuerByAddress(this.exchange.counterAsset.issuer.address);

        for (let i=0; i<issuersArray.length; i++) {
            const ddOption = new DropdownOption(issuersArray[i].address, issuersArray[i].domain, issuersArray[i].shortName);
            this.counterIssuerOptions.push(ddOption);
            //By default, pre-select the first option
            if (0 === i) {
                this.selectedCounterIssuer = ddOption;
            }
            if (null != issuerAccount && issuersArray[i].address === issuerAccount.address) {
                this.selectedCounterIssuer = ddOption;
            }
        }
    }

    baseAssetCodeChanged(event) {
        this.loadBaseIssuers();
        this.updateExchange();
    }

    counterAssetCodeChanged(event) {
        this.loadCounterIssuers();
        this.updateExchange();
    }

    issuerChanged(event)
    {
        this.updateExchange();
    }
}
