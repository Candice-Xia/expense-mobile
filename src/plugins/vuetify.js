// vuetify.js
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    themes: {
      light: {
        colors: {
          background: '#FFFFFF',
          surface: '#FFFFFF',
          // 其他颜色...
        }
      }
    }
  },
  defaults: {
    VTextField: {
      color: 'primary',
      bgColor: 'white', // 设置背景色
    },
    VSelect: {
      bgColor: 'white',
    },
    VTextarea: {
      bgColor: 'white',
    }
  }
})

export default vuetify
