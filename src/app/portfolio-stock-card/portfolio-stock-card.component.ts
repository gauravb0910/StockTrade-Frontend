import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BackendService } from '../backend.service';
import { Subscription, interval } from 'rxjs';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';
import { StockTradeModalComponent } from '../stock-trade-modal/stock-trade-modal.component';
import { PortfolioElement } from '../portfolio-element';

@Component({
  selector: 'app-portfolio-stock-card',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './portfolio-stock-card.component.html',
  styleUrl: './portfolio-stock-card.component.css'
})
export class PortfolioStockCardComponent implements OnInit{
  @Input() stock_ticker : any;
  @Input() stock_company : any;
  @Input() quantity: number = 0;
  @Input() total_cost: number = 0;
  @Input() wallet_balance: number | undefined = 0;
  @Input() portfolio_element_object?: PortfolioElement;

  @Output() refreshPage: EventEmitter<void> = new EventEmitter<void>();

  average_cost_per_share!: number;
  current_price!: number;
  latest_price: any;
  isStockBought: boolean = true;
  isChangeZero: boolean = true;
  isChangePositive: boolean = false;
  subscription: Subscription = new Subscription;
  modalRef: MdbModalRef<StockTradeModalComponent> | null = null;

  constructor (private service : BackendService, private modalService: MdbModalService) {}

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
          this.average_cost_per_share = this.total_cost/this.quantity;
          this.current_price = this.latest_price.c;
          this.isChangeZero = Number((this.average_cost_per_share - this.current_price).toFixed(2)) == 0;
          this.isChangePositive = Number((this.average_cost_per_share - this.current_price).toFixed(2)) > 0;
        },
        error: (err: any) => {
          console.error('Error in API call', err);
        }
      });
  }

  openModal(option: string) {
    this.isStockBought = option === 'buy';
    this.modalRef = this.modalService.open(StockTradeModalComponent, {
      data:
        { stock_display_symbol: this.stock_ticker
        , wallet_balance: this.wallet_balance
        , current_price: this.current_price
        , bought_stock_quantity: this.quantity
        , buy_option_selected: option === 'buy'
        , portfolio_element_object: this.portfolio_element_object
        }
    });
    this.modalRef.component.modalClosed.subscribe(() => {
      this.refreshPage.emit();
    });
  }

}
