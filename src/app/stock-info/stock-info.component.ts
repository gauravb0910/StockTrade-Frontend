import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../backend.service';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HomeComponent } from '../home/home.component';
import { Subscription, forkJoin, interval } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { SummaryComponent } from '../summary/summary.component';
import { TopNewsComponent } from '../top-news/top-news.component';
import { InsightsComponent } from '../insights/insights.component';
import { StockTradeModalComponent } from '../stock-trade-modal/stock-trade-modal.component';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { PortfolioElement } from '../portfolio-element';
import { WatchlistElement } from '../watchlist-element';
import { ChartsComponent } from '../charts/charts.component';
import { WalletAccount } from '../wallet-account';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-stock-info',
  standalone: true,
  imports:
    [ CommonModule
    , MatProgressSpinnerModule
    , HomeComponent
    , MatTabsModule
    , SummaryComponent
    , TopNewsComponent
    , ChartsComponent
    , InsightsComponent
    , FooterComponent
    ],
  templateUrl: './stock-info.component.html',
  styleUrl: './stock-info.component.css'
})
export class StockInfoComponent implements OnInit{
  stock_ticker : string = "";
  company_info : any;
  latest_price : any;
  peers_list : any;
  historical_data_for_charts : any;
  hourly_price_data : any;
  company_top_news : any;
  insider_sentiment: any;
  stock_recommendation_trends: any;
  company_earnings_data: any;
  stock_info_in_portfolio: any;
  wallet_account!: WalletAccount;
  watchlist_element_object: WatchlistElement | undefined;
  portfolio_element_object: PortfolioElement | undefined;
  enableSellButton: boolean = false;
  loading: boolean = true;
  shouldDisplayInfo: boolean = true;
  subscription: Subscription = new Subscription;
  modalRef: MdbModalRef<StockTradeModalComponent> | null = null;

  isInWatchList: boolean | Error = false;
  isChangePositive: boolean = false;
  isChangeZero: boolean = true;
  isMarketOpen: boolean = false;

  default_stock_info_component: any;

  constructor (private route : ActivatedRoute, private service : BackendService, private modalService: MdbModalService) {}

  async ngOnInit(){
    const state_data = this.service.getStateData();
    const path_param = this.route.snapshot.paramMap.get('stock_ticker');
    this.stock_ticker = path_param !== null ? path_param : "";
    if (!state_data.stock_ticker || this.stock_ticker !== state_data.stock_ticker) {
      this.getAllData();
    } else {
      this.stock_ticker = state_data.stock_ticker;
      this.company_info = state_data.company_info;
      this.latest_price = state_data.latest_price;
      this.peers_list = state_data.peers_list;
      this.historical_data_for_charts = state_data.historical_data_for_charts;
      this.hourly_price_data = state_data.hourly_price_data;
      this.company_top_news = state_data.company_top_news;
      this.insider_sentiment = state_data.insider_sentiment;
      this.stock_recommendation_trends = state_data.stock_recommendation_trends;
      this.company_earnings_data = state_data.company_earnings_data;
      this.wallet_account = state_data.wallet_account;
      this.stock_info_in_portfolio = state_data.stock_info_in_portfolio;
      this.watchlist_element_object = state_data.watchlist_element_object;
      this.portfolio_element_object = state_data.portfolio_element_object;
      this.enableSellButton = state_data.enableSellButton;
      this.loading = state_data.loading;
      this.isInWatchList = state_data.isInWatchList;
      this.isChangePositive = state_data.isChangePositive;
      this.isChangeZero = state_data.isChangeZero;
      this.isMarketOpen = state_data.isMarketOpen;
      this.default_stock_info_component = state_data.default_stock_info_component;
    }
    this.subscription = interval(15000).subscribe(() => {
      this.getLatestPrice();
    });
  }

  getLatestPrice() {
    this.service.getLatestPrice(this.stock_ticker)
      .subscribe({
        next: (data: any) => {
          const state_data = this.service.getStateData();
          this.latest_price = data;
          this.isChangeZero = this.latest_price.d == 0;
          this.isChangePositive = this.latest_price.d > 0;
          this.isMarketOpen = Date.now() - this.latest_price.t*1000 <= 300000;
          const new_state_data = state_data;
          new_state_data.latest_price = this.latest_price;
          new_state_data.isChangeZero = this.isChangeZero;
          new_state_data.isChangePositive = this.isChangePositive;
          new_state_data.isMarketOpen = this.isMarketOpen;
          this.service.setStateData(new_state_data);
        },
        error: (err: any) => {
          console.error('Error in API call', err);
        }
      });
  }

  getAllData() {
    this.loading = true;

    forkJoin({
      company_info: this.service.getCompanyInfo(this.stock_ticker)
    , latest_price: this.service.getLatestPrice(this.stock_ticker)
    , peers_list: this.service.getCompanyPeers(this.stock_ticker)
    , historical_data_for_charts: this.service.getHistoricalData(this.stock_ticker)
    , hourly_price_data: this.service.getHourlyStockPriceData(this.stock_ticker)
    , company_top_news: this.service.getCompanyNews(this.stock_ticker)
    , insider_sentiment: this.service.getInsiderSentiment(this.stock_ticker)
    , stock_info_in_portfolio: this.service.findOneEntryInPortfolio(this.stock_ticker)
    , stock_recommendation_trends: this.service.getRecommendations(this.stock_ticker)
    , company_earnings_data: this.service.getEarnings(this.stock_ticker)
    }).subscribe({
      next: (data: any) => {
        try{
          const curr_time = Date.now();
          if ('Error' in data.company_info || data.company_info===null || data.company_info===undefined) { throw new Error(data.company_info); } else { this.company_info = data.company_info; }
          if ('Error' in data.latest_price || data.latest_price===null || data.latest_price===undefined) { throw new Error(data.latest_price) } else { this.latest_price = data.latest_price; }
          this.isChangeZero = this.latest_price.d == 0;
          this.isChangePositive = this.latest_price.d >= 0;
          this.isMarketOpen = curr_time - this.latest_price.t*1000 <= 300000;
          if ('Error' in data.peers_list || data.peers_list===null || data.peers_list===undefined) { throw new Error(data.peers_list) } else { this.peers_list = [...new Set(data.peers_list)].filter((element: any) => !(element as string).includes(".")); }
          if ('Error' in data.historical_data_for_charts || data.historical_data_for_charts===null || data.historical_data_for_charts===undefined) { throw new Error(data.historical_data_for_charts) } else { this.historical_data_for_charts = data.historical_data_for_charts.results; }
          if ('Error' in data.hourly_price_data || data.hourly_price_data===null || data.hourly_price_data===undefined) { throw new Error(data.hourly_price_data) } else { this.hourly_price_data = data.hourly_price_data; }
          if ('Error' in data.company_top_news || data.company_top_news===null || data.company_top_news===undefined) { throw new Error(data.company_top_news) } else { this.company_top_news = data.company_top_news; }
          if ('Error' in data.insider_sentiment || data.insider_sentiment===null || data.insider_sentiment===undefined) { throw new Error(data.insider_sentiment) } else { this.insider_sentiment = data.insider_sentiment.data; }
          if ('Error' in data.stock_recommendation_trends || data.stock_recommendation_trends===null || data.stock_recommendation_trends===undefined) { throw new Error(data.stock_recommendation_trends) } else { this.stock_recommendation_trends = data.stock_recommendation_trends; }
          if ('Error' in data.company_earnings_data || data.company_earnings_data===null || data.company_earnings_data===undefined) { throw new Error(data.company_earnings_data) } else { this.company_earnings_data = data.company_earnings_data; }
          this.default_stock_info_component = {
            stock_ticker: this.company_info.ticker
          , stock_company: this.company_info.name
          , quantity : 0
          , total_cost: 0.0
          }
          if (data.stock_info_in_portfolio.portfolio_data === null) { this.stock_info_in_portfolio = this.default_stock_info_component; } else if ('Error' in data.stock_info_in_portfolio.portfolio_data) { throw new Error(data.stock_info_in_portfolio.portfolio_data); } else { this.stock_info_in_portfolio = data.stock_info_in_portfolio.portfolio_data; }
          if (data.stock_info_in_portfolio.wallet_account === null) { this.wallet_account = { amount : 0 }; } else if ('Error' in data.stock_info_in_portfolio.wallet_account) { throw new Error(data.stock_info_in_portfolio.wallet_account); } else { this.wallet_account = data.stock_info_in_portfolio.wallet_account; }
          this.enableSellButton = this.stock_info_in_portfolio.quantity > 0;
          this.portfolio_element_object = {
            stock_ticker: this.stock_info_in_portfolio.stock_ticker
          , stock_company: this.stock_info_in_portfolio.stock_company
          , quantity : this.stock_info_in_portfolio.quantity
          , total_cost: this.stock_info_in_portfolio.total_cost
          }
          this.watchlist_element_object = {
            stock_ticker: this.company_info.ticker
          , stock_company: this.company_info.name
          }
          this.service.findOneEntryInWatchlist(this.stock_ticker)
          .subscribe({
            next: (data_watchlist: any) => {
              if (data_watchlist) {
                if (Object.keys(data_watchlist).includes('Error')) { throw new Error(data_watchlist) } else { this.isInWatchList = Object.keys(data_watchlist).includes('stock_ticker'); }
              }
              var new_state_data = {
                stock_ticker: this.stock_ticker
              , company_info: this.company_info
              , latest_price: this.latest_price
              , peers_list: this.peers_list
              , historical_data_for_charts: this.historical_data_for_charts
              , hourly_price_data: this.hourly_price_data
              , company_top_news: this.company_top_news
              , insider_sentiment: this.insider_sentiment
              , stock_recommendation_trends: this.stock_recommendation_trends
              , company_earnings_data: this.company_earnings_data
              , stock_info_in_portfolio: this.stock_info_in_portfolio
              , watchlist_element_object: this.watchlist_element_object
              , portfolio_element_object: this.portfolio_element_object
              , enableSellButton: this.enableSellButton
              , loading: this.loading
              , isInWatchList: this.isInWatchList
              , isChangeZero: this.isChangeZero
              , isChangePositive: this.isChangePositive
              , isMarketOpen: this.isMarketOpen
              , default_stock_info_component: this.default_stock_info_component
              , wallet_account: this.wallet_account
              };
              this.service.setStateData(new_state_data);
            },
            error: (err: any) => {
              console.error('Error in API call', err);
            }
          });
          this.loading = false;
          this.service.eventEmitter.emit(this.stock_ticker);
        } catch (err : any) {
          this.displayErrorWithApiCalls(err);
        }
      },
      error: (err: any) => {
        this.displayErrorWithApiCalls(err);
      }
    });
  }

  displayErrorWithApiCalls (err : any) {
    console.error('Error in API call', err);
    this.loading = false;
    this.shouldDisplayInfo = false;
    var alertContainer = document.getElementById('notification-alert');
    var noDataAlert = document.getElementById('no-data-alert-box');
    if (alertContainer && !noDataAlert) {
      noDataAlert = document.createElement('div');
      noDataAlert.innerHTML += ' \
      <div class="container-fluid" id="no-data-alert-box"> \
        <div class="row"> \
          <div class="col-lg-8 col-md-10 col-s-12 mx-auto"> \
            <div class="alert alert-sm alert-sm-12 alert-lg-10 alert-danger alert-dismissible fade show" role="alert"> \
              No data found. Please enter a valid ticker \
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button> \
            </div> \
          </div> \
        </div> \
      </div>';
      alertContainer.appendChild(noDataAlert);
      setTimeout(() => {
        if (noDataAlert)
          noDataAlert.remove();
      }, 3000)
    }
  }

  addToOrRemoveFromWatchlist() {
    if (this.isInWatchList) {
      this.service.deleteOneInWatchlist(this.stock_ticker)
      .subscribe({
        next: (data: any) => {
          if (data.deletedCount===1) {
            this.isInWatchList = false;
            var state_data = this.service.getStateData();
            var new_state_data = state_data;
            new_state_data.isInWatchList = this.isInWatchList;
            this.service.setStateData(new_state_data);
            this.showAddedToOrRemovedFromWatchlistAlert();
          }
        },
        error: (err: any) => {
          console.error('Error in API call', err);
        }
      });
    } else if (!this.isInWatchList && this.watchlist_element_object){
      this.service.insertOneEntryinWatchlist(this.watchlist_element_object)
      .subscribe({
        next: (data: any) => {
          if (data && Object.keys(data).includes('insertedId')) {
            this.isInWatchList = true;
            var state_data = this.service.getStateData();
            var new_state_data = state_data;
            new_state_data.isInWatchList = this.isInWatchList;
            this.service.setStateData(new_state_data);
            this.showAddedToOrRemovedFromWatchlistAlert();
          }
        },
        error: (err: any) => {
          console.error('Error in API call', err);
        }
      });
    }
  }

  showAddedToOrRemovedFromWatchlistAlert() {
    var alertContainer = document.getElementById('notification-alert');
    var addedToOrRemovedFromWatchlistAlert = document.getElementById('added-to-or-removed-from-watchlist-alert-box');
    if (alertContainer) {
      if (addedToOrRemovedFromWatchlistAlert === null) {
        addedToOrRemovedFromWatchlistAlert = document.createElement('div');
        addedToOrRemovedFromWatchlistAlert.setAttribute("id", "added-to-or-removed-from-watchlist-alert-box");
        addedToOrRemovedFromWatchlistAlert.setAttribute("class", "container-fluid");
      }
      addedToOrRemovedFromWatchlistAlert.innerHTML = ' \
      <div class="row"> \
        <div class="col-lg-8 col-md-10 col-s-12 mx-auto"> \
          <div class="alert alert-sm alert-' + (this.isInWatchList ? 'success' : 'danger') + ' alert-dismissible fade show" role="alert"> \
            ' + this.company_info.ticker + ' ' + (this.isInWatchList ? 'added to' : 'removed from') + ' Watchlist. \
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button> \
          </div> \
        </div> \
      </div>';
      alertContainer.appendChild(addedToOrRemovedFromWatchlistAlert);
      setTimeout(() => {
        if (addedToOrRemovedFromWatchlistAlert)
        addedToOrRemovedFromWatchlistAlert.remove();
      }, 3000)
    };
  }

  buyOrSellNotificationAlert(option: string) {
    var alertContainer = document.getElementById('notification-alert');
    var boughtOrSoldStockAlert = document.getElementById('bought-or-sold-stock-alert-box');
    if (alertContainer) {
      if (boughtOrSoldStockAlert === null) {
        boughtOrSoldStockAlert = document.createElement('div');
        boughtOrSoldStockAlert.setAttribute("id", "bought-or-sold-stock-alert-box");
        boughtOrSoldStockAlert.setAttribute("class", "container-fluid");
      }
      boughtOrSoldStockAlert.innerHTML = ' \
      <div class="row"> \
        <div class="col-lg-8 col-md-10 col-s-12 mx-auto"> \
          <div class="alert alert-sm alert-' + (option === 'buy' ? 'success' : 'danger') + ' alert-dismissible fade show" role="alert"> \
            ' + this.company_info.ticker + ' ' + (option === 'buy' ? 'bought successfully.' : 'sold successfully.') +
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button> \
          </div> \
        </div> \
      </div>';
      alertContainer.appendChild(boughtOrSoldStockAlert);
      setTimeout(() => {
        if (boughtOrSoldStockAlert)
        boughtOrSoldStockAlert.remove();
      }, 3000)
    };
  }

  openModal(option: string) {
    var stateData =  this.service.getStateData();
    this.modalRef = this.modalService.open(StockTradeModalComponent, {
      data:
        { stock_display_symbol: this.company_info.ticker
        , wallet_balance: stateData.wallet_account.amount ? stateData.wallet_account.amount : this.wallet_account.amount
        , current_price: this.latest_price.c
        , bought_stock_quantity: this.portfolio_element_object?.quantity
        , buy_option_selected: option === 'buy'
        , portfolio_element_object: (this.portfolio_element_object !== undefined) ? this.portfolio_element_object : this.default_stock_info_component
        }
    });
    this.modalRef.component.modalClosed.subscribe(() => {
      this.service.findOneEntryInPortfolio(this.stock_ticker)
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.stock_info_in_portfolio = data.portfolio_data === null ? this.default_stock_info_component : ('Error' in data.portfolio_data ? new Error(data.portfolio_data) : data.portfolio_data);
            this.enableSellButton = this.stock_info_in_portfolio.quantity > 0;
          } else {
            this.stock_info_in_portfolio = this.default_stock_info_component;
            this.enableSellButton = false;
          }
          this.buyOrSellNotificationAlert(option);
          this.portfolio_element_object = {
            stock_ticker: this.stock_info_in_portfolio.stock_ticker,
            stock_company: this.stock_info_in_portfolio.stock_company,
            quantity : this.stock_info_in_portfolio.quantity,
            total_cost: this.stock_info_in_portfolio.total_cost
          }
        },
        error: (err: any) => {
          console.error('Error in API call', err);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
