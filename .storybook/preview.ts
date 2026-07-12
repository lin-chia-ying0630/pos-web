import type { Preview } from '@storybook/vue3-vite'
import { createPinia } from 'pinia'
import { initialize, mswLoader } from 'msw-storybook-addon'
import { handlers } from '../src/mocks/handlers'
import '../src/style.scss'

// Storybook 使用 MSW 顯示穩定假資料，不需要啟動後端也能檢查元件狀態。
initialize()

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    msw: {
      handlers
    }
  },
  decorators: [
    (story, context) => ({
      components: { story },
      setup() {
        return { context }
      },
      template: '<story v-bind="context.args" />'
    })
  ],
  setup(app) {
    app.use(createPinia())
  }
}

export default preview
