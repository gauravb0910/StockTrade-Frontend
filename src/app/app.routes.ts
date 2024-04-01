import { Routes } from '@angular/router';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { StockInfoComponent } from './stock-info/stock-info.component';

export const routes: Routes = [
  {'path': 'watchlist', 'title': 'StockTrade | Watchlist', component:WatchlistComponent}
, {'path': 'portfolio', 'title': 'StockTrade | PortFolio',component:PortfolioComponent}
, {'path': 'search/home', 'title': 'StockTrade | Home', component:HomeComponent}
, {'path': 'search/:stock_ticker', 'title': `StockTrade`, component:StockInfoComponent}
, {'path': '', redirectTo: 'search/home', pathMatch: 'full'}
, {'path': 'search', redirectTo: 'search/home', pathMatch: 'full'}
, {'path': 'port', redirectTo: 'portfolio', pathMatch: 'full'}
, {'path': '**', component: PageNotFoundComponent}
];
