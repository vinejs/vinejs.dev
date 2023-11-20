import { defineConfig } from 'vite'
import Adonis from '@adonisjs/vite/client'

export default defineConfig({
  plugins: [Adonis({
    entrypoints: ['./assets/app.js', './assets/app.css'],
    reload: ['content/**/*', 'templates/**/*.edge']
  })]
})
