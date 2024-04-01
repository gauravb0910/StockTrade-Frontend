import { Component, OnInit } from '@angular/core';
import { WatchlistStockCardComponent } from '../watchlist-stock-card/watchlist-stock-card.component';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WatchlistElement } from '../watchlist-element';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [WatchlistStockCardComponent, CommonModule, MatProgressSpinnerModule],
  templateUrl: './watchlist.component.html',
  styleUrl: './watchlist.component.css'
})

export class WatchlistComponent implements OnInit{
  loading: boolean = true;
  watchlisted_stocks: WatchlistElement[] = [];

  constructor (private service : BackendService) {}

  async ngOnInit(){
    this.getAllWatchlistedStocks();
  }

  getAllWatchlistedStocks() {
    this.loading = true;
    this.service.findAllEntriesInWatchlist()
      .subscribe({
        next: (data: any) => {
          this.watchlisted_stocks = data;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error in API call', err);
          this.loading = false;
        }
      });
  }

  refreshWL() {
    this.ngOnInit();
  }
}
