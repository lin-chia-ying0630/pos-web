import type { Preview } from '@storybook/vue3-vite'
import { createPinia } from 'pinia'
import '../src/style.css'

const preview: Preview = {
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
