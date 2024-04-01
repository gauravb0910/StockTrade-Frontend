import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  ticker: string | undefined = undefined;

  constructor (private service: BackendService) {
    this.service.eventEmitter.subscribe((data: string) => {
      this.ticker = data;
    });
  }

}
