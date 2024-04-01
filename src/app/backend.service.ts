import { HttpClient, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { PortfolioElement } from './portfolio-element';
import { WatchlistElement } from './watchlist-element';
import { WalletAccount } from './wallet-account';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  private stateData: any = {};

  constructor(private http:HttpClient) { }

  public eventEmitter: EventEmitter<string> = new EventEmitter<string>();

  getStateData() {
    return this.stateData;
  }

  setStateData(data: any) {
    this.stateData = data;
  }

  getStockSymbols(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/getStockSymbols/${searchTerm}`;
    return this.http.get<any[]>(url);
  };

  getCompanyInfo(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/getStockDetails/${searchTerm}`;
    return this.http.get<any[]>(url);
  };

  getLatestPrice(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/getStockLatestPrice/${searchTerm}`;
    return this.http.get<any[]>(url);
  };

  getCompanyNews(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/getCompanyNews/${searchTerm}`;
    return this.http.get<any[]>(url);
  };

  getHistoricalData(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/getStockHistoricalData/${searchTerm}`;
    return this.http.get<any[]>(url);
  };

  getHourlyStockPriceData(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/getStockPriceOnHourlyBasis/${searchTerm}`;
    return this.http.get<any[]>(url);
  };

  getRecommendations(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/getStockRecommendation/${searchTerm}`;
    return this.http.get<any[]>(url);
  };

  getInsiderSentiment(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/getStockInsiderSentiment/${searchTerm}`;
    return this.http.get<any[]>(url);
  };

  getCompanyPeers(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/getCompanyPeers/${searchTerm}`;
    return this.http.get<any[]>(url);
  };

  getEarnings(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/getStockEarnings/${searchTerm}`;
    return this.http.get<any[]>(url);
  };

  findAllEntriesInPortfolio() {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/portfolio/findAll`;
    return this.http.get<any[]>(url);
  }

  findOneEntryInPortfolio(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/portfolio/findOne/${searchTerm}`;
    return this.http.get<any[]>(url);
  }

  updateOneInPortFolio(searchTerm: string, object: PortfolioElement) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/portfolio/updateOne/${searchTerm}`;
    return this.http.post<any[]>(url, object);
  }

  deleteOneInPortFolio(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/portfolio/deleteOne/${searchTerm}`;
    return this.http.get<any[]>(url);
  }

  findAllEntriesInWatchlist() {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/watchlist/findAll`;
    return this.http.get<any[]>(url);
  }

  findOneEntryInWatchlist(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/watchlist/findOne/${searchTerm}`;
    return this.http.get<any[]>(url);
  }

  insertOneEntryinWatchlist(object: WatchlistElement) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/watchlist/insertOne`;
    return this.http.post<any[]>(url, object);
  }

  deleteOneInWatchlist(searchTerm: string) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/watchlist/deleteOne/${searchTerm}`;
    return this.http.get<any[]>(url);
  }

  findWalletAccount() {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/wallet/get`;
    return this.http.get<any[]>(url);
  }

  updateWalletAccount(object: WalletAccount) {
    const url = `https://gauravb0910-webtech-assign-3.wl.r.appspot.com/wallet/update`;
    return this.http.post<any[]>(url, object);
  }

}
