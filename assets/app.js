import 'unpoly'
import Alpine from 'alpinejs'
import highcharts from 'highcharts'
import mediumZoom from 'medium-zoom'
import docsearch from '@docsearch/js'
import humanFormat from 'human-format'
import { tabs } from 'edge-uikit/tabs'
import Persist from '@alpinejs/persist'
import {
  initZoomComponent,
  initBaseComponents,
  initSearchComponent,
} from '@dimerapp/docs-theme/scripts'

import.meta.glob(['../content/**/*.png', '../content/**/*.jpeg', '../content/**/*.jpg'])

Alpine.plugin(tabs)
Alpine.plugin(Persist)
Alpine.plugin(initBaseComponents)
Alpine.plugin(initSearchComponent(docsearch))
Alpine.plugin(initZoomComponent(mediumZoom))

Alpine.data('barChart', function (data) {
  return {
    init() {
      highcharts.chart(this.$root, {
        colors: ['#b335dd', '#9231ef', '#6f6dff'],
        title: {
          text: '',
        },
        subtitle: {
          text: '',
        },
        chart: {
          type: 'bar',
        },
        xAxis: {
          categories: ['Yup', 'Zod', 'VineJS'],
          gridLineWidth: 1,
          lineWidth: 0,
        },
        yAxis: {
          min: 0,
          title: {
            text: '',
            align: 'high',
          },
          labels: {
            overflow: 'justify',
          },
        },
        plotOptions: {
          bar: {
            dataLabels: {
              enabled: true,
            },
            colorByPoint: true,
          },
        },
        legend: {
          enabled: false,
        },
        credits: {
          enabled: false,
        },
        series: [
          {
            data: data,
            dataLabels: {
              formatter: function () {
                return humanFormat(this.y)
              },
            },
          },
        ],
      })
    },
  }
})

Alpine.data('notification', function (version) {
  return {
    isVisible: false,
    init() {
      const notificationKey = localStorage.getItem('_x_notificationKey')
      if (!notificationKey || notificationKey !== version) {
        this.isVisible = true
      }
    },
    hide() {
      localStorage.setItem('_x_notificationKey', version)
      this.isVisible = false
    }
  }
})

Alpine.start()
