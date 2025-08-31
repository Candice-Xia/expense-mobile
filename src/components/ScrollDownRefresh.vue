<template lang="html">
  <div
    class="refresh-moudle"
    :style="{transform: 'translate3d(0,' + top + 'px, 0)'}"
    @touchstart="touchStart($event)"
    @touchmove="touchMove($event)"
    @touchend="touchEnd($event)"
  >
    <header class="pull-refresh">
      <slot name="pull-refresh">
        <div
          v-if="ScrollDownState==1"
          class="down-tip"
        >
          <span class="down-text">{{ ScrollDownInfo.downText }}</span>
        </div>
        <div
          v-if="ScrollDownState==2"
          class="up-tip"
        >
          <span class="up-text">{{ ScrollDownInfo.upText }}</span>
        </div>
        <div
          v-if="ScrollDownState==3"
          class="refresh-tip"
        >
          <span class="refresh-text">{{ ScrollDownInfo.refreshText }}</span>
        </div>
      </slot>
    </header>
    <slot />
  </div>
</template>
<script>
export default {
  props: {
    onRefresh: {
      type: Function,
      required: false
    }
  },
  data () {
    return {
      defaultOffset:40, // 默认高度, 相应的修改.releshMoudle的margin-top和.down-tip, .up-tip, .refresh-tip的height
      top: 0,
      scrollIsToTop: 0,
      startY: 0,
      isScrollDown: false, // 是否下拉
      isRefreshing: false, // 是否正在刷新
      ScrollDownState: 1, // 显示1:下拉可以刷新, 2:松开立即刷新, 3:正在刷新数据中...
      ScrollDownInfo: {
        downText: 'Pull down to refresh',
        upText: 'Pull out to refresh',
        refreshText: 'Refreshing...'
      }
    }
  },
  created () {
    if (document.querySelector('.down-tip')) {
      // 获取不同手机的物理像素（dpr）,以便适配rem
      this.defaultOffset = document.querySelector('.down-tip').clientHeight || this.defaultOffset
    }
  },
  methods: {
    /**
     * 触摸开始，手指点击屏幕时
     * @param {object} e Touch 对象包含的属性
     */
    touchStart (e) {
      this.startY = e.targetTouches[0].pageY
    },

    /**
     * 接触点改变，滑动时
     * @param {object} e Touch 对象包含的属性
     */
    touchMove (e) {
      this.scrollIsToTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop // safari 获取scrollTop用window.pageYOffset
      if (e.targetTouches[0].pageY > this.startY) {
        // 下拉
        this.isScrollDown = true
        if (this.scrollIsToTop === 0 && !this.isRefreshing) {
          // 拉动的距离
          let diff = e.targetTouches[0].pageY - this.startY - this.scrollIsToTop
          this.top = Math.pow(diff, 0.8) + (this.ScrollDownState === 3 ? this.defaultOffset : 0)
          if (this.top >= this.defaultOffset) {
            this.ScrollDownState = 2
            e.preventDefault()
          } else {
            this.ScrollDownState = 1
            // 去掉会导致ios无法刷新
            e.preventDefault()
          }
        }
      } else {
        this.isScrollDown = false
        this.ScrollDownState = 1
      }
    },

    /**
     * 触摸结束，手指离开屏幕时
     * @param {object} e Touch 对象包含的属性
     */
    touchEnd (e) {
      if (this.isScrollDown && !this.isRefreshing) {
        if (this.top >= this.defaultOffset) {
          // do refresh
          this.refresh()
          this.isRefreshing = true
        } else {
          // cancel refresh
          this.isRefreshing = false
          this.isScrollDown = false
          this.ScrollDownState = 1
          this.top = 0
        }
      }
    },

    /**
     * 刷新
     */
    refresh () {
      this.ScrollDownState = 3
      this.top = this.defaultOffset
      setTimeout(() => {
        //this.onRefresh(this.refreshDone)
        this.$emit("refresh");
        this.refreshDone();
      }, 1000);
    },

    /**
     * 刷新完成
     */
    refreshDone () {
      this.isRefreshing = false
      this.isScrollDown = false
      this.ScrollDownState = 1
      this.top = 0
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.refresh-moudle {
  width: 100%;
  margin-top: -60px;
  -webkit-overflow-scrolling: touch; /* ios5+ */
}

.pull-refresh {
  width: 100%;
  color: #999;
  transition-duration: 200ms;
  font-size: 16px;
}

.refresh-moudle .down-tip,
.up-tip,
.refresh-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
}


@keyframes anticlockwise {
  0% {
    transform: rotate(-180deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes clockwise {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-180deg);
  }
}

@keyframes rotating {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(1turn);
  }
}
</style>