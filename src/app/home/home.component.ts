import { Component } from '@angular/core';
import { StockSearchBarComponent } from '../stock-search-bar/stock-search-bar.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [StockSearchBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent{
}
