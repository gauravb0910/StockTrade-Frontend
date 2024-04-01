import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-stock-search-bar',
  standalone: true,
  imports: [MatAutocompleteModule, CommonModule, FormsModule, ReactiveFormsModule, MatProgressSpinnerModule, RouterModule],
  templateUrl: './stock-search-bar.component.html',
  styleUrl: './stock-search-bar.component.css'
})
export class StockSearchBarComponent implements OnInit{

  searchControl = new FormControl('');
  stock_ticker : string = "";
  options: any[] = [];
  loading: boolean = false;

  constructor( private router: Router, private service : BackendService, private route : ActivatedRoute ){}

  ngOnInit() {
    const path_param = this.route.snapshot.paramMap.get('stock_ticker');
    this.stock_ticker = path_param !== null ? path_param : "";
    this.searchControl.setValue(this.stock_ticker);
    this.searchControl.valueChanges
      .pipe(
        debounceTime(200)
      , distinctUntilChanged()
      , tap(() => {this.loading = (true && this.searchControl.value!=""), this.options = []})
      , switchMap(value => ((value === null || value == "") ? [] : this.service.getStockSymbols(value)))
      , tap(() => this.loading = false)
      )
      .subscribe(res => this.options = res);
  }

  loadStockData (stock_ticker : any) {
    if (stock_ticker == '' || stock_ticker === null) {
      var alertContainer = document.getElementById('notification-alert');
      var invalidDataAlert = document.getElementById('invalid-data-alert-box');
      if (alertContainer && !invalidDataAlert) {
        invalidDataAlert = document.createElement('div');
        invalidDataAlert.innerHTML += ' \
        <div class="container-fluid" id="invalid-data-alert-box"> \
          <div class="row"> \
            <div class="col-lg-8 col-md-10 col-s-12 mx-auto"> \
              <div class="alert alert-sm alert-danger alert-dismissible fade show" role="alert"> \
                Please enter a valid ticker \
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button> \
              </div> \
            </div> \
          </div> \
        </div>';
        alertContainer.appendChild(invalidDataAlert);
        setTimeout(() => {
          if (invalidDataAlert)
            invalidDataAlert.remove();
        }, 3000)
      }
    } else {
      this.router.navigate([('/search/'+stock_ticker.toUpperCase())]);
    }
  }

  clear() {
    this.options = [];
    this.searchControl.reset();
    this.router.navigate(['/search/home']);
  }

}
