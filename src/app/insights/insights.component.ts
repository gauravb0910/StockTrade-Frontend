import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.css'
})
export class InsightsComponent {

  @Input() insider_sentiment_data: any;
  @Input() recommendation_trends: any;
  @Input() company_earnings: any;
  @Input() stock_company_name: any;

  total_mspr: any;
  positive_mspr: any;
  negative_mspr: any;
  total_change: any;
  positive_change: any;
  negative_change: any;

  recommendation_trends_series_data: any;
  company_earnings_series_actual_data: any;
  company_earnings_series_estimate_data: any;

  Highcharts: typeof Highcharts = Highcharts;
  chartConstructor: string = 'chart';
  recommendation_trend_chart_options: Highcharts.Options = {};
  company_earnings_chart_options: Highcharts.Options = {};

  updateFlag: boolean = false;
  oneToOneFlag: boolean = true;
  runOutsideAngular: boolean = false;

  ngOnChanges() {
    if (this.insider_sentiment_data && this.recommendation_trends && this.company_earnings) {
      this.total_mspr = this.insider_sentiment_data.reduce((acc: any, obj: any) => acc + obj.mspr, 0) / this.insider_sentiment_data.length;
      var positive_mspr_objs = this.insider_sentiment_data.filter((obj: any) => obj.mspr > 0);
      var negative_mspr_objs = this.insider_sentiment_data.filter((obj: any) => obj.mspr < 0);
      this.positive_mspr = positive_mspr_objs.reduce((acc: any, obj: any) => acc + obj.mspr, 0) / positive_mspr_objs.length;
      this.negative_mspr = negative_mspr_objs.reduce((acc: any, obj: any) => acc + obj.mspr, 0) / negative_mspr_objs.length;
      this.total_change = this.insider_sentiment_data.reduce((acc: any, obj: any) => acc + obj.change, 0) / this.insider_sentiment_data.length;
      var positive_change_objs = this.insider_sentiment_data.filter((obj: any) => obj.change > 0);
      var negative_change_objs = this.insider_sentiment_data.filter((obj: any) => obj.change < 0);
      this.positive_change = positive_change_objs.reduce((acc: any, obj: any) => acc + obj.change, 0) / positive_change_objs.length;
      this.negative_change = negative_change_objs.reduce((acc: any, obj: any) => acc + obj.change, 0) / negative_change_objs.length;

      const recommendation_trends_categories =  this.recommendation_trends.map((obj: { period: any; }) => obj.period.slice(0,7));

      this.recommendation_trends_series_data = [
        { name: 'Strong Buy'
        , data: this.recommendation_trends?.map((obj: { strongBuy: any; }) => obj.strongBuy)
        , color: '#177b3f'
        },
        { name: 'Buy'
        , data: this.recommendation_trends?.map((obj: { buy: any; }) => obj.buy)
        , color: '#21c15e'
        },
        { name: 'Hold'
        , data: this.recommendation_trends?.map((obj: { hold: any; }) => obj.hold)
        , color: '#c2951f'
        },
        { name: 'Sell'
        , data: this.recommendation_trends?.map((obj: { sell: any; }) => obj.sell)
        , color: '#f76667'
        },
        { name: 'Strong Sell'
        , data: this.recommendation_trends?.map((obj: { strongSell: any; }) => obj.strongSell)
        , color: '#8c3938'
        },
      ];

      this.recommendation_trend_chart_options = {
        chart: {
          type: 'column'
        , backgroundColor: '#f8f8f8'
        },
        title: {
          text: 'Recommendation Trends'
        , align: 'center'
        , style: {
            fontFamily: '"Barlow", sans-serif'
          , fontWeight: '600'
          , fontSize: '18px'
          }
        },
        plotOptions: {
          column: {
            stacking: 'normal'
          , dataLabels: {
              enabled: true
            }
          }
        },
        xAxis: {
          categories: recommendation_trends_categories
        },
        yAxis: {
          min: 0
        , title: {
            text: '#Analysis'
          }
        , stackLabels: {
            enabled: false
          }
        },
        legend: {
          enabled: true
        },
        series: this.recommendation_trends_series_data
      };

      const company_earnings_series_categories = this.company_earnings?.map((item: { period: string | number | Date; surprise: any; }) => {
        return Highcharts.dateFormat('%Y-%m-%d', new Date(item.period).getTime()) + `<br>Surprise: ${item.surprise}`;
      });

      this.company_earnings_series_actual_data = this.company_earnings.map((item: { actual: any; }) => item.actual);
      this.company_earnings_series_estimate_data = this.company_earnings?.map((item: { estimate: any; }) => item.estimate);

      this.company_earnings_chart_options = {
        chart: {
          animation: true
        , backgroundColor: '#f8f8f8'
        },
        exporting: {
          enabled: false
        },
        accessibility: {
          enabled: false
        },
        title: {
          text: 'Historical EPS Surprises'
        , align: 'center'
        , style: {
            fontFamily: '"Barlow", sans-serif'
          , fontWeight: '600'
          , fontSize: '18px'
          }
        },
        xAxis: {
          categories: company_earnings_series_categories
        , labels: {
            style: {
              textAlign: 'center'
            }
          }
        },
        yAxis: {
          title: {
            text: 'Quarterly EPS'
          }
        },
        legend: {
          enabled: true
        },
        tooltip: {
          formatter: function(this: Highcharts.TooltipFormatterContextObject) {
            if (this.series && this.series.chart && this.series.chart.series) {
              const seriesIndex = this.series.index;
              const seriesOptions = this.series.chart.series[seriesIndex].options;
              if (seriesOptions && (seriesOptions as any).data) {
                const dataPointIndex = this.point.index;
                const dataPoint = (seriesOptions as any).data[dataPointIndex];
                if (dataPoint && company_earnings_series_categories[dataPointIndex]) {
                  const period = company_earnings_series_categories[dataPointIndex].slice(0,10);
                  return `<span style="font-size: 0.8em">${period}</span><br/><span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${dataPoint}</b><br/> `;
                }
              }
            }
            return '';
          },
          useHTML: true
        },
        series: [{
          name: 'Actual',
          type: 'spline',
          data: this.company_earnings_series_actual_data,
          tooltip: {
            valueDecimals: 2
          }
        }, {
          name: 'Estimate',
          type: 'spline',
          data: this.company_earnings_series_estimate_data,
          tooltip: {
            valueDecimals: 2
          }
        }]
      };
    }
  }
}
