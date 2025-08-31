<template>
  <div class="delete">
    <div class="slider">
      <div
        ref="content"
        class="content"
        :style="deleteSlider"
        @touchstart="touchStart"
        @touchmove="touchMove"
        @touchend="touchEnd"
      >
        <slot />
      </div>
      <div
        ref="remove"
        class="remove"
        :style="deleteSlider"
        @click="deleteLine"
      >
        <v-icon color="white">
          mdi-delete
        </v-icon>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    disable: Boolean
  },
  data() {
    return {
      startX: 0, //触摸位置
      startY: 0,
      endX: 0, //结束位置
      moveX: 0, //滑动时的位置
      moveY: 0,
      disX: 0, //移动距离
      disY: 0,
      deleteSlider: "" //滑动时的效果,使用v-bind:style="deleteSlider"
    };
  },
  methods: {
    touchStart(ev) {
      if (this.disable) return;
      ev = ev || event;
      if (ev.touches.length == 1) {
        this.startX = ev.touches[0].clientX;
        this.startY = ev.touches[0].clientY;
      }
    },
    touchMove(ev) {
      if (this.disable) return;
      ev = ev || event;
      let wd = this.$refs.remove.offsetWidth;
      if (ev.touches.length == 1) {
        this.moveX = ev.touches[0].clientX;
        this.moveY = ev.touches[0].clientY;
        this.disX = this.startX - this.moveX;
        this.disY = this.startY - this.moveY;
        if (this.disX <= 10) {
          this.deleteSlider = "transform:translateX(0px)";
        } else if (this.disX > Math.abs(this.disY) * 4) {
          this.deleteSlider = "transform:translateX(-" + this.disX + "px)";
          if (this.disX >= wd) {
            this.deleteSlider = "transform:translateX(-" + wd + "px)";
          }
        }
      }
    },
    touchEnd(ev) {
      if (this.disable) return;
      ev = ev || event;
      let wd = this.$refs.remove.offsetWidth;
      if (ev.changedTouches.length == 1) {
        let endX = ev.changedTouches[0].clientX;
        this.disX = this.startX - endX;
        this.disY = this.startY - ev.changedTouches[0].clientY;
        if (this.disX > Math.abs(this.disY) * 4) {
          if (this.disX < (wd * 4) / 3) {
            this.deleteSlider = "transform:translateX(0px)";
          } else {
            this.deleteSlider = "transform:translateX(-" + wd + "px)";
          }
        }
      }
    },
    deleteLine() {
      this.deleteSlider = "transform:translateX(0px)";
      this.$emit("deleteLine");
    }
  }
};
</script>
<style scoped>
.slider {
  width: 100%;
  overflow: hidden;
  position: relative;
}
.content {
  transition: 0.3s;
  background-color: #fff;
}
.remove {
  position: absolute;
  transition: 0.3s;
  width: 60px;
  background-color: #f60;
  right: -60px;
  top: 0;
  bottom: 0;
  color: #fff;
  text-align: center;
  font-size: 32px;
}
.remove * {
  color: #fff;
  display: inline-block;
  position: relative;
  font-size: 24px;
  line-height: 24px;
  top: 50%;
  margin-top: -12px;
  vertical-align: top;
}
</style>