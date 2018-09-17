import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { Asset } from '../model/asset.model';
import { AssetService } from '../asset.service';
import { HorizonRestService } from '../horizon-rest.service';
import { Utils } from '../utils';


@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit, OnDestroy {
  private _routeSubscriber: Subscription;
  private _getParamsSubscriber: Subscription;
  private _chartInterval: number = 900000;    //15min candles by default
  private readonly _baseAssetDdId = "baseAssetDd_";
  private readonly _baseAnchorDdId = "baseIssuerDd_";
  private readonly _counterAssetDdId = "counterAssetDd_";
  private readonly _counterAnchorDdId = "counterIssuerDd_";

  //View-model properties
  baseAsset: Asset = null;
  counterAsset: Asset = null;


  constructor(private route: ActivatedRoute, private router: Router, private assetService: AssetService, private horizonService: HorizonRestService) { }


  ngOnInit() {
    this._routeSubscriber = this.route.paramMap.subscribe(params => {
      //'Parse' the route
      const baseAssetString = params.get('baseAssetId');
      const counterAssetString = params.get('counterAssetId');

      if ((baseAssetString || "").length <= 0) {
        throw new Error("Invalid URL parameters");
      }
      if ((counterAssetString || "").length <= 0) {
        throw new Error("Invalid URL parameters (missing counter asset): ");
      }
      this.baseAsset = Asset.ParseFromUrlParam(baseAssetString, this.assetService/*TODO: this dependency feels wrong*/);
      this.counterAsset = Asset.ParseFromUrlParam(counterAssetString, this.assetService);
    });
    //Handle GET parameter 'interval'
    this._getParamsSubscriber = this.route.queryParamMap.subscribe(params => {
      const intParam = params.get('interval');
      this._chartInterval = Utils.intervalAsMilliseconds(intParam);
    });
  }

  ngOnDestroy() {
    this._routeSubscriber.unsubscribe();
  }

  swapAssets() {
    const url = "exchange/" + this.counterAsset.ToExchangeUrlParameter() + "/" + this.baseAsset.ToExchangeUrlParameter() + "?interval=" + this._chartInterval;
    this.router.navigateByUrl(url);
  }
}
