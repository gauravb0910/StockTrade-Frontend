import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MdbModalRef } from 'mdb-angular-ui-kit/modal';
import { MatDialogModule} from '@angular/material/dialog';

@Component({
  selector: 'app-news-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './news-modal.component.html',
  styleUrl: './news-modal.component.css'
})
export class NewsModalComponent {
  source: string | null = null;
  datetime: any;
  title: string | null = null;
  summary: string | null = null;
  url: string | null = null;
  tweet_link: string | null = null;
  facebook_link: string | null = null;

  constructor(public modalRef: MdbModalRef<NewsModalComponent>) {}
}