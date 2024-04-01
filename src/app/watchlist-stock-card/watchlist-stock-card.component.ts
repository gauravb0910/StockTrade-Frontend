import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { BackendService } from '../backend.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-watchlist-stock-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './watchlist-stock-card.component.html',
  styleUrl: './watchlist-stock-card.component.css'
})
export class WatchlistStockCardComponent implements OnInit{
  @Input() stock_ticker : any;
  @Input() stock_company : any;

  @Output() refreshWatchlist: EventEmitter<void> = new EventEmitter<void>();

  latest_price: any;
  subscription: Subscription = new Subscription;
  isChangeZero: boolean = true;
  isChangePositive: boolean = false;

  constructor (private service : BackendService, private router: Router) {}

  async ngOnInit(){
    this.getStockPriceDetails();
    this.subscription = interval(15000).subscribe(() => {
      this.getStockPriceDetails();
    });
  }

  getStockPriceDetails() {
    this.service.getLatestPrice(this.stock_ticker)
      .subscribe({
        next: (data: any) => {
          this.latest_price = data;
          this.isChangeZero = this.latest_price.d == 0;
          this.isChangePositive = this.latest_price.d >= 0;
        },
        error: (err: any) => {
          console.error('Error in API call', err);
        }
      });
  }

  removeFromWatchList() {
    this.service.deleteOneInWatchlist(this.stock_ticker)
      .subscribe({
        next: (data: any) => {
          if (data.deletedCount===1) {
            var state_data = this.service.getStateData();
            var new_state_data = state_data;
            new_state_data.isInWatchList = false;
            this.service.setStateData(new_state_data);
            this.refreshWatchlist.emit();
          }
        },
        error: (err: any) => {
          console.error('Error in API call', err);
        }
      });
  }
}
