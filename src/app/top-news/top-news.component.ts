import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { NewsModalComponent } from '../news-modal/news-modal.component';
import { MdbModalRef, MdbModalService } from 'mdb-angular-ui-kit/modal';

@Component({
  selector: 'app-top-news',
  standalone: true,
  imports: [ MatCardModule, MatButtonModule, CommonModule],
  templateUrl: './top-news.component.html',
  styleUrl: './top-news.component.css'
})
export class TopNewsComponent {
  @Input() top_news_data : any;

  modalRef: MdbModalRef<NewsModalComponent> | null = null;
  news_data: any[] = [];

  constructor(private modalService: MdbModalService) {}

  ngOnChanges() {
    if (this.top_news_data) {
      this.top_news_data = this.top_news_data.slice(0,20);
    }
  }

  openModal(selectedNewsItem : any) {
    var tweet_url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(selectedNewsItem.headline + " " + selectedNewsItem.url);
    var facebook_link = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(selectedNewsItem.url) + '&amp;src=sdkpreparse';
    this.modalRef = this.modalService.open(NewsModalComponent, {
      data:
        { source: selectedNewsItem.source
        , datetime: selectedNewsItem.datetime
        , title: selectedNewsItem.headline
        , summary: selectedNewsItem.summary
        , url: selectedNewsItem.url
        , tweet_link: tweet_url
        , facebook_link: facebook_link
        }
    });
  }
}
