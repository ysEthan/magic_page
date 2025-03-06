import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Element Plus 相关导入
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 自定义样式应该在 Element Plus 样式之后导入
import './assets/main.css'

import App from './App.vue'
import router from './router'
import './router/permission' // 添加路由守卫

const app = createApp(App)

// 注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(ElementPlus)
app.use(router)

app.mount('#app')
