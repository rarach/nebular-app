import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { Account } from "../model/account.model";
import { AssetService } from '../asset.service';
import { ExchangePair } from '../model/exchange-pair.model';

declare var jQuery: any;  //Supporting jQuery's plugin ddSlick


@Component({
    selector: 'app-custom-exchange',
    templateUrl: './custom-exchange.component.html',
    styleUrls: ['./custom-exchange.component.css']
})
export class CustomExchangeComponent implements OnInit, AfterViewInit {
    private _baseAssetCodeDropDownId: string;
    private _baseAnchorDropDownId: string;
    private _counterAssetCodeDropDownId: string;
    private _counterAnchorDropDownId: string;

    @Input() exchange: ExchangePair;


    constructor(private assetService: AssetService) { }

    ngOnInit() {
        this._baseAssetCodeDropDownId = "baseAssetCodeDropDown" + this.exchange.id;
        this._baseAnchorDropDownId = "baseAssetAnchorDropDown" + this.exchange.id;
        this._counterAssetCodeDropDownId = "counterAssetCodeDropDown" + this.exchange.id;
        this._counterAnchorDropDownId = "counterAssetAnchorDropDown" + this.exchange.id;
    }
    
    ngAfterViewInit() {
        this.setupAssetCodesDropDown(this._baseAssetCodeDropDownId, this._baseAnchorDropDownId, this.exchange.baseAsset.code);
        this.setupAnchorDropDown(this._baseAnchorDropDownId, this.exchange.baseAsset.code, this.exchange.baseAsset.issuer);
        this.setupAssetCodesDropDown(this._counterAssetCodeDropDownId, this._counterAnchorDropDownId, this.exchange.counterAsset.code);
        this.setupAnchorDropDown(this._counterAnchorDropDownId, this.exchange.counterAsset.code, this.exchange.counterAsset.issuer);
    }

    private setupAssetCodesDropDown(dropDownId: string, anchorDropDownId: string, selectedAssetCode: string) {
        const assetList = new Array();
        this.assetService.getAssetCodesForExchange().forEach(function(assetCode) {
            assetList.push({
                text: assetCode,
                value: assetCode,
                selected: assetCode === selectedAssetCode
            });
        });

        const that = this;
        jQuery("#" + dropDownId).ddslick({
            data: assetList,
            width: 100,
            onSelected: function (data) {
                that.setupAnchorDropDown(anchorDropDownId, data.selectedData.value, null);
            }
        });
    }

    private setupAnchorDropDown(dropDownId: string, assetCode: string, assetIssuer: Account) {
        //In case this is re-init after asset code change, destroy previous instance
        jQuery('div[id^="' + dropDownId + '"]').ddslick('destroy');

        const issuersArray = this.assetService.GetIssuersByAssetCode(assetCode);
        const issuerAccount = assetIssuer != null ? this.assetService.GetIssuerByAddress(assetIssuer.address) : null;
        const assetIssuersDdData = new Array();
        for (let i=0; i<issuersArray.length; i++) {
            assetIssuersDdData.push({
                text: issuersArray[i].shortName,
                description: issuersArray[i].domain,
                value: issuersArray[i].address,
                selected: null != issuerAccount && issuersArray[i].address === issuerAccount.address
            });
        }

        const that = this;
        jQuery("#" + dropDownId).ddslick({
            data: assetIssuersDdData,
            width: "calc(50% - 100px)",
            onSelected: function (data) {
                that.updateExchange();
            }
        });

        if (null == issuerAccount) {
            jQuery('div[id^="' + dropDownId + '"]').ddslick('select', {index: 0 });
        }
    }

    private updateExchange() {
        const baseAssetCodeData = $('div[id^="' + this._baseAssetCodeDropDownId + '"]').data("ddslick");
        const baseIssuerData = $('div[id^="' + this._baseAnchorDropDownId + '"]').data("ddslick");
        const counterAssetCodeData = $('div[id^="' + this._counterAssetCodeDropDownId + '"]').data("ddslick");
        const counterIssuerData = $('div[id^="' + this._counterAnchorDropDownId + '"]').data("ddslick");

        if (!counterAssetCodeData || !counterIssuerData) {
            //Happens when change is fired during drop-downs setup
            return;
        }
        const exchange = this.assetService.UpdateCustomExchange(this.exchange.id,
                                                                baseAssetCodeData.selectedData.value, baseIssuerData.selectedData.value,
                                                                counterAssetCodeData.selectedData.value, counterIssuerData.selectedData.value);
    }

    removeExchange() {
        this.assetService.RemoveCustomExchange(this.exchange.id);
    }
}
