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
    activeIndex: 0,
    benchmarks: [
      {
        title: 'Flat object',
        categories: [
          {
            name: 'VineJS',
            color: '#ca5bf2',
          },
          {
            name: 'Zod',
            color: '#408aff',
          },
          {
            name: 'Yup',
            color: '#6f6dff',
          },
          {
            name: 'Valibot',
            color: '#334155',
          },
          {
            name: 'Joi',
            color: '#ed7d31',
          },
        ],
        numbers: [13_072_620, 7_420_116, 746_769, 6_558_725, 2_252_419],
      },
      {
        title: 'Nested objects',
        categories: [
          {
            name: 'VineJS',
            color: '#ca5bf2',
          },
          {
            name: 'Zod',
            color: '#408aff',
          },
          {
            name: 'Yup',
            color: '#6f6dff',
          },
          {
            name: 'Valibot',
            color: '#334155',
          },
          {
            name: 'Joi',
            color: '#ed7d31',
          },
        ],
        numbers: [9_445_152, 3_628_979, 344_506, 3_363_940, 1_137_401],
      },
      {
        title: 'Arrays',
        categories: [
          {
            name: 'VineJS',
            color: '#ca5bf2',
          },
          {
            name: 'Zod',
            color: '#408aff',
          },
          {
            name: 'Yup',
            color: '#6f6dff',
          },
          {
            name: 'Valibot',
            color: '#334155',
          },
          {
            name: 'Joi',
            color: '#ed7d31',
          },
        ],
        numbers: [6_810_515, 3_254_923, 202_143, 3_064_924, 795_110],
      },
      {
        title: 'Unions',
        categories: [
          {
            name: 'VineJS',
            color: '#ca5bf2',
          },
          {
            name: 'Zod',
            color: '#408aff',
          },
          {
            name: 'Valibot',
            color: '#334155',
          },
          {
            name: 'Joi',
            color: '#ed7d31',
          },
        ],
        numbers: [9_949_804, 2_106_060, 1_124_721, 957_252],
      },
    ],

    render(index) {
      this.activeIndex = index
      const benchmark = this.benchmarks[index]
      highcharts.chart(this.$refs.chart, {
        colors: benchmark.categories.map((c) => c.color),
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
          categories: benchmark.categories.map((c) => c.name),
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
            data: benchmark.numbers,
            dataLabels: {
              formatter: function () {
                return humanFormat(this.y)
              },
            },
          },
        ],
      })
    },

    init() {
      this.render(0)
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
    },
  }
})

Alpine.start()
