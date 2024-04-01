import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent {
  @Input() price_details : any;
  @Input() company_details : any;
  @Input() peers : any;
  @Input() stock_ticker : any;
  @Input() graph_data : any;
  @Input() isChangeZero: boolean = false;
  @Input() isChangePositive: boolean = false;

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor: string = 'chart';
  chartOptions: Highcharts.Options = {};

  updateFlag: boolean = false;
  oneToOneFlag: boolean = true;
  runOutsideAngular: boolean = false;

  ngOnChanges() {
    if (this.stock_ticker && this.graph_data) {
      var max_timestamp = this.graph_data.results[this.graph_data.count - 1].t;
      var filteredData = this.graph_data.results.filter((obj: { t: any; }) => max_timestamp - obj.t <= 3600*6*1000 );
      var data = filteredData.map((obj: { c: any, t: any; }) => [obj.t, obj.c]);
      this.chartOptions = {
        chart: {
          backgroundColor: '#f8f8f8'
        },
        title: {
          text: `${this.stock_ticker} Hourly Price Variation`
        , style: {
            color: '#9898a1'
          , fontFamily: '"Barlow", sans-serif'
          , fontWeight: '600'
          , fontSize: '16px'
          }
        },
        plotOptions: {
          series: {
            color: this.isChangeZero? 'black' : (this.isChangePositive? '#058b03' : '#fd0214')
          }
        },
        tooltip: {
          animation: true
        , split: true
        },
        xAxis: [
          { type: 'datetime'
          , crosshair: true
          , endOnTick: true
          }
        ],
        yAxis: {
          opposite: true
        , showLastLabel: false
        , title: {
            text: ''
          }
        , labels: {
            align: 'right'
          , x: 0
          , y: -2
          }
        },
        series: [{
          data: data
			  , showInLegend: false
        , type: 'line'
        , name:`${this.stock_ticker}`
        , marker: {
            enabled: false
          }
        }]
      };
    }
  }
}
