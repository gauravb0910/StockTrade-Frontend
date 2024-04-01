import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts/highstock';

import IndicatorsCore from "highcharts/indicators/indicators";
import IndicatorVBP from "highcharts/indicators/volume-by-price";
IndicatorsCore(Highcharts);
IndicatorVBP(Highcharts);

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.css'
})
export class ChartsComponent implements OnChanges {
  @Input() stock_ticker: any;
  @Input() chart_data: any;

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor: string = 'chart';
  chartOptions: Highcharts.Options = {};

  updateFlag: boolean = false;
  oneToOneFlag: boolean = true;
  runOutsideAngular: boolean = false;

  ngOnChanges() {
    if (this.stock_ticker && this.chart_data) {
      const ohlc_hart = this.chart_data.map((obj: { t: any; o: any; h: any; l: any; c: any; }) => [ obj.t, obj.o, obj.h, obj.l, obj.c ])
      const volume_chart = this.chart_data.map((obj: { v: any, t: any; }) => [obj.t, obj.v]);
      this.chartOptions = {
        chart: {
          backgroundColor: '#f8f8f8'
        },
        title: {
          text: `${this.stock_ticker} Historical`
        },
        subtitle: {
          text: 'With SMA and Volume by Price technical indicators'
        },
        legend: {
          enabled: false
        },
        rangeSelector: {
          enabled: true
        , selected: 2
        , inputEnabled: true
        , allButtonsEnabled: true
        },
        tooltip: {
          split: true
        },
        navigator: {
          enabled: true
        },
        credits: {
          enabled: true
        , href: 'https://polygon.io/'
        , text: 'Source: Polygon.io'
        },
        xAxis: {
          maxRange: 2 * 365 * 24 * 3600 * 1000
        , type: 'datetime'
        , dateTimeLabelFormats: {
            hour: '%M:%Y'
        , }
        },
        yAxis: [
          { startOnTick: false
          , endOnTick: false
          , labels: {
              align: 'right'
            , x: -3
            }
          , title: {
              text: 'OHLC'
            }
          , height: '60%'
          , lineWidth: 2
          , opposite: true
          , resize: {
              enabled: true
            }
          },
          { labels: {
              align: 'right'
            , x: -3
            }
          , title: {
              text: 'Volume'
            }
          , top: '65%'
          , height: '35%'
          , offset: 0
          , opposite: true
          , lineWidth: 2
          }
        ],
        series: [
          { type: 'candlestick'
          , name: this.stock_ticker
          , id: this.stock_ticker
          , zIndex: 2
          , data: ohlc_hart
          },
          { type: 'column'
          , name: 'Volume'
          , id: 'volume'
          , data: volume_chart
          , yAxis: 1
          },
          { type: 'vbp'
          , linkedTo: this.stock_ticker
          , params: {
              volumeSeriesID: 'volume'
            }
          , dataLabels: {
              enabled: false
            }
          , zoneLines: {
              enabled: false
            }
          },
          { type: 'sma'
          , linkedTo: this.stock_ticker
          , zIndex: 1
          , marker: {
              enabled: false
            }
          }
        ]
      }
    }
  }
}
