import { Component, OnInit } from '@angular/core';
import { PortfolioStockCardComponent } from '../portfolio-stock-card/portfolio-stock-card.component';
import { BackendService } from '../backend.service';
import { PortfolioElement } from '../portfolio-element';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WalletAccount } from '../wallet-account';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [PortfolioStockCardComponent, CommonModule, MatProgressSpinnerModule],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent implements OnInit {
  wallet_account!: WalletAccount;
  loading: boolean = true;
  stocks_list: PortfolioElement[] = [];

  constructor (private service : BackendService) {}

  async ngOnInit(){
    this.getAllStockInPortFolio();
  }

  getAllStockInPortFolio() {
    this.loading = true;
    this.service.findAllEntriesInPortfolio()
      .subscribe({
        next: (data: any) => {
          this.stocks_list = data.portfolio_data;
          this.wallet_account = data.wallet_account;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Error in API call', err);
          this.loading = false;
        }
      })
  }

  refreshPortFolio() {
    this.ngOnInit();
  }
}
