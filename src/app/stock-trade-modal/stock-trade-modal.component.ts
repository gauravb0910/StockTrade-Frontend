import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { FormsModule } from '@angular/forms';
import { BackendService } from '../backend.service';
import { PortfolioElement } from '../portfolio-element';
import { Router } from '@angular/router';
import { WalletAccount } from '../wallet-account';

@Component({
  selector: 'app-stock-trade-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-trade-modal.component.html',
  styleUrl: './stock-trade-modal.component.css'
})
export class StockTradeModalComponent {

  @Output() modalClosed: EventEmitter<void> = new EventEmitter<void>();

  stock_display_symbol: any;
  wallet_balance!: number;
  buy_option_selected: boolean = true;
  current_price: number = 0;
  bought_stock_quantity: number = 0;
  portfolio_element_object ?: PortfolioElement;

  default_wallet_account : WalletAccount= {
    amount: 0
  }

  stockQuantity: number = 0;

  constructor(public modalRef: MdbModalRef<StockTradeModalComponent>, private service : BackendService, private router: Router) {}

  updateQuantity(newQuantity: string) {
    var alertContainer = document.getElementById("not-enough-money-alert");
    if (alertContainer) {
      if (!(/^[-+]?[0-9]*$/.test(newQuantity))) {
        alertContainer.innerHTML = 'Please enter a valid amount';
      } else if (this.buy_option_selected) {
        this.stockQuantity = Number(newQuantity);
        if (this.wallet_balance < this.stockQuantity * this.current_price) {
          alertContainer.innerHTML = 'Not enough money in wallet!';
        } else if (this.stockQuantity <= 0) {
          alertContainer.innerHTML = 'Cannot buy non-positive shares';
        } else {
          alertContainer.innerHTML = '';
        }
      } else {
        this.stockQuantity = Number(newQuantity);
        if (this.bought_stock_quantity < this.stockQuantity) {
          alertContainer.innerHTML = "You cannot sell the stocks that you don't have";
        } else if (this.stockQuantity <= 0) {
          alertContainer.innerHTML = "Cannot sell non-positive shares";
        } else {
          alertContainer.innerHTML = '';
        }
      }
    }
  }

  isBuyDisabled() : boolean {
    return this.stockQuantity <= 0 || this.wallet_balance < this.stockQuantity * this.current_price;
  }

  isSellDisabled() : boolean {
    return this.stockQuantity <= 0 || this.bought_stock_quantity < this.stockQuantity;
  }

  buy() {
    if (this.portfolio_element_object) {
      this.portfolio_element_object.quantity = this.stockQuantity + Number(this.portfolio_element_object.quantity);
      this.portfolio_element_object.total_cost = Number(this.portfolio_element_object.total_cost) + this.stockQuantity * this.current_price;
      this.service.updateOneInPortFolio(this.stock_display_symbol, this.portfolio_element_object)
        .subscribe({
          next: (data: any) => {
            if (data.modifiedCount===1 || data.upsertedCount===1) {
              this.default_wallet_account.amount = this.wallet_balance - (this.stockQuantity * this.current_price);
              this.service.updateWalletAccount( this.default_wallet_account )
                .subscribe({
                  next: (wallet_data: any) => {
                    if (wallet_data.modifiedCount===1 || wallet_data.upsertedCount===1) {
                      var state_data = this.service.getStateData();
                      var new_state_data = state_data;
                      new_state_data.wallet_account = this.default_wallet_account;
                      new_state_data.portfolio_element_object = this.portfolio_element_object;
                      new_state_data.enableSellButton = true;
                      this.service.setStateData(new_state_data);
                      this.modalRef.close();
                      this.modalClosed.emit();
                      this.showBoughtOrSoldAlert();
                    }
                  },
                  error: (err: any) => {
                    console.error('Error in API call', err);
                  }
                });
            }
          },
          error: (err: any) => {
            console.error('Error in API call', err);
          }
        });
    }
  }

  sell() {
    if (this.portfolio_element_object) {
      if (this.portfolio_element_object.quantity === this.stockQuantity) {
        this.service.deleteOneInPortFolio(this.stock_display_symbol)
        .subscribe({
          next: (data: any) => {
            if (data.deletedCount===1) {
              this.default_wallet_account.amount = this.wallet_balance + (this.stockQuantity * this.current_price);
              this.service.updateWalletAccount( this.default_wallet_account )
                .subscribe({
                  next: (wallet_data: any) => {
                    if (wallet_data.modifiedCount===1 || wallet_data.upsertedCount===1) {
                      var state_data = this.service.getStateData();
                      var new_state_data = state_data;
                      new_state_data.enableSellButton = false;
                      new_state_data.portfolio_element_object.quantity = 0;
                      new_state_data.portfolio_element_object.total_cost = 0.0;
                      new_state_data.wallet_account = this.default_wallet_account;
                      this.service.setStateData(new_state_data);
                      this.modalRef.close();
                      this.modalClosed.emit();
                      this.showBoughtOrSoldAlert();
                    }
                  },
                  error: (err: any) => {
                    console.error('Error in API call', err);
                  }
                });
            }
          },
          error: (err: any) => {
            console.error('Error in API call', err);
          }
        });
      } else {
        this.portfolio_element_object.quantity = Number(this.portfolio_element_object.quantity) - this.stockQuantity;
        this.portfolio_element_object.total_cost = Number(this.portfolio_element_object.total_cost) - this.stockQuantity * this.current_price;
        this.service.updateOneInPortFolio(this.stock_display_symbol, this.portfolio_element_object)
        .subscribe({
          next: (data: any) => {
            if (data.modifiedCount===1 || data.upsertedCount===1) {
              this.default_wallet_account.amount = this.wallet_balance + (this.stockQuantity * this.current_price);
              this.service.updateWalletAccount( this.default_wallet_account )
                .subscribe({
                  next: (wallet_data: any) => {
                    if (wallet_data.modifiedCount===1 || wallet_data.upsertedCount===1) {
                      var state_data = this.service.getStateData();
                      var new_state_data = state_data;
                      new_state_data.enableSellButton = true;
                      new_state_data.portfolio_element_object = this.portfolio_element_object;
                      new_state_data.wallet_account = this.default_wallet_account;
                      this.service.setStateData(new_state_data);
                      this.modalRef.close();
                      this.modalClosed.emit();
                      this.showBoughtOrSoldAlert();
                    }
                  },
                  error: (err: any) => {
                    console.error('Error in API call', err);
                  }
                });
            }
          },
          error: (err: any) => {
            console.error('Error in API call', err);
          }
        });
      }
    }
  }

  showBoughtOrSoldAlert() {
    var alertContainer = document.getElementById('portfolio-notification-alert');
    var boughtOrSoldDataAlert = document.getElementById('bought-or-sold-alert-box');
    if (alertContainer) {
      if (boughtOrSoldDataAlert === null) {
        boughtOrSoldDataAlert = document.createElement('div');
        boughtOrSoldDataAlert.setAttribute("id", "bought-or-sold-alert-box");
        boughtOrSoldDataAlert.setAttribute("class", "container-fluid");
      }
      boughtOrSoldDataAlert.innerHTML += ' \
      <div class="row"> \
        <div class="col"> \
          <div class="alert alert-sm-12 alert-lg-10 alert-' + (this.buy_option_selected ? 'success' : 'danger') + ' alert-dismissible fade show" role="alert"> \
            ' + this.stock_display_symbol + ' ' + (this.buy_option_selected ? 'bought' : 'sold') + ' successfully. \
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button> \
          </div> \
        </div> \
      </div>';
      alertContainer.appendChild(boughtOrSoldDataAlert);
      setTimeout(() => {
        if (boughtOrSoldDataAlert)
          boughtOrSoldDataAlert.remove();
      }, 3000)
    };
  }

}
