<template>
  <div class="pager-demo">
    <h2 class="title">
      Swiper 分页演示 (静态数据)
    </h2>
    <Swiper
      :modules="modules"
      :pagination="{ type: 'progressbar' }"
      :space-between="16"
      :loop="false"
      direction="vertical"
      class="data-swiper"
      @progress="handleProgress"
    >
      <SwiperSlide
        v-for="(page, pIndex) in pages"
        :key="pIndex"
      >
        <div class="page">
          <h3 class="page-title">
            第 {{ pIndex + 1 }} 页
          </h3>
          <ul class="item-list">
            <li
              v-for="item in page"
              :key="item.id"
              class="item"
            >
              <span class="item-id">#{{ item.id }}</span>
              <span class="item-name">{{ item.name }}</span>
              <span class="item-value">{{ item.value }}</span>
            </li>
          </ul>
        </div>
      </SwiperSlide>
    </Swiper>

    <!-- 自定义垂直进度条 -->
    <div class="vertical-progress">
      <div
        class="vertical-progress-fill"
        :style="{ height: progressPercent + '%' }"
      />
      <div class="vertical-progress-text">
        {{ currentIndex + 1 }}/{{ totalPages }}
      </div>
    </div>
  </div>
</template>

<script setup>
/*
  官方集成 (Swiper 8+/9+):
  npm i swiper
*/
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { ref } from 'vue'

// 静态数据 (示例数据可替换为真实业务字段)
const rawData = [
  { id: 1, name: '餐饮', value: '¥120.50' },
  { id: 2, name: '出行', value: '¥38.00' },
  { id: 3, name: '娱乐', value: '¥89.90' },
  { id: 4, name: '购物', value: '¥560.00' },
  { id: 5, name: '住房', value: '¥1800.00' },
  { id: 6, name: '通讯', value: '¥59.00' },
  { id: 7, name: '学习', value: '¥230.00' },
  { id: 8, name: '医疗', value: '¥45.30' },
  { id: 9, name: '礼物', value: '¥120.00' },
  { id: 10, name: '其它', value: '¥15.00' }
]

// 简单分页（每页显示 4 条，可调节）
const pageSize = 4
const pages = []
for (let i = 0; i < rawData.length; i += pageSize) {
  pages.push(rawData.slice(i, i + pageSize))
}

// 需要注册的模块
const modules = [Pagination]

const progressPercent = ref(0)
const currentIndex = ref(0)
const totalPages = pages.length

function handleProgress(swiper, progress) {
  progressPercent.value = Math.min(100, Math.max(0, progress * 100))
  currentIndex.value = swiper.activeIndex
}
</script>

<style scoped>
.pager-demo {
  padding: 16px;
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial;
}
.title {
  margin: 0 0 12px;
  text-align: center;
  font-size: 20px;
}
.data-swiper {
  background: #f8f9fb;
  border-radius: 12px;
  padding: 12px 4px 28px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  height: 420px; /* 使垂直方向能滚动 */
}
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.page-title {
  margin: 4px 0 12px;
  font-size: 16px;
  text-align: center;
  letter-spacing: 1px;
}
.item-list {
  list-style: none;
  margin: 0;
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item {
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.item-id {
  width: 40px;
  font-weight: 600;
  color: #57606a;
}
.item-name {
  flex: 1;
  font-weight: 500;
  color: #222;
}
.item-value {
  font-weight: 600;
  color: #1a7f37;
}
:deep(.swiper-pagination) {
  display: none;
}

/* 自定义竖向进度条 */
.vertical-progress {
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 80%;
  background: rgba(0,0,0,0.08);
  border-radius: 6px;
  overflow: hidden;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
}
.vertical-progress-fill {
  width: 100%;
  background: linear-gradient(180deg,#2563eb,#4f46e5);
  transition: height .25s ease;
  border-radius: 6px 6px 0 0;
}
.vertical-progress-text {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: #2563eb;
  font-weight: 600;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  user-select: none;
}
</style>
