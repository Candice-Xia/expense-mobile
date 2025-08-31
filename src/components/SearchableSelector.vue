<template>
  <v-dialog
    v-model="show"
    fullscreen
    class="searchable-selector-dialog"
    :scrim="true"
    transition="dialog-bottom-transition"
    :retain-focus="false"
  >
    <div class="selector-wrapper">
      <div class="selector-placeholder" />
      <v-card class="selector-dialog">
        <div class="selector-header">
          <v-text-field
            v-model="internalSearchText"
            class="flex-1 search-input"
            :placeholder="searchPlaceholder"
            clearable
            density="comfortable"
            hide-details
            autocomplete="off"
            autofocus
            @click="$event.target.select()"
            @click:clear="handleClearInput"
          />
          <v-btn
            variant="text"
            class="cancel-btn"
            @click="onCancel"
          >
            Cancel
          </v-btn>
        </div>
        <v-divider />
        <div class="dialog-list">
          <v-list
            density="compact"
            class="pt-0"
          >
            <v-list-item
              v-for="item in filteredItems"
              :key="item.value"
              :title="item.text"
              :value="item.value"
              class="selector-item"
              @click="onSelect(item)"
            />
          </v-list>
        </div>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
export default {
  name: "SearchableSelector",
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    searchText: {
      type: String,
      default: ""
    },
    searchPlaceholder: {
      type: String,
      default: "Search"
    }
  },
  emits: ['update:modelValue', 'update:search-text', 'select', 'cancel'],
  data() {
    return {
      internalSearchText: this.searchText || ""
    };
  },
  
  computed: {
    show: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
    
    filteredItems() {
      // 确保 internalSearchText 不是 null 或 undefined
      const input = (this.internalSearchText || "").trim().toLowerCase();
      if (!input) return this.items;
      
      const tokens = input.split(/\s+/).filter(Boolean);
      return this.items.filter(item => {
        const txt = (item.text || "").toLowerCase();
        return tokens.every(token => txt.includes(token));
      });
    }
  },
  
  watch: {
    // 监听内部搜索文本变化，通知父组件
    internalSearchText(value) {
      this.$emit('update:search-text', value);
    },
    
    // 监听外部搜索文本变化，更新内部状态
    searchText(value) {
      this.internalSearchText = value || "";
    }
  },
  methods: {
    onSelect(item) {
      this.internalSearchText = ''; // 在选择后清空搜索文本
      this.$emit('select', item);
    },
    onCancel() {
      this.internalSearchText = ''; // 清空搜索文本
      this.$emit('cancel');
    },
    
    handleClearInput() {
      // 确保清除按钮将值设为空字符串而不是null
      this.internalSearchText = '';
    }
  }
};
</script>

<style scoped>
.selector-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.selector-placeholder {
  height: calc(56px + 10vh); /* 工具栏高度(56px) + 10%视窗高度的间距 */
  min-height: calc(56px + 10vh);
  background-color: transparent;
  width: 100%;
  flex: 0 0 auto;
}

.selector-dialog { 
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.12);
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 56px - 10vh); /* 减去工具栏高度和10%的间距 */
}

.selector-header { 
  display: flex; 
  align-items: center; 
  padding: 12px 8px 4px 12px; 
  position: sticky; 
  top: 0; 
  background: #fff; 
  z-index: 5;
}

.selector-header .search-input { 
  flex: 1; 
  margin-right: 4px; 
}

.dialog-list { 
  flex: 1 1 auto; 
  overflow-y: auto; 
  -webkit-overflow-scrolling: touch; 
  padding: 0 8px 12px;
}

.cancel-btn { 
  min-width: 60px;
  margin-left: 0;
  padding-left: 4px;
  padding-right: 4px;
  text-transform: none;
}

.selector-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  min-height: 44px;
}

.selector-item:last-child {
  border-bottom: none;
}

.searchable-selector-dialog :deep(.v-overlay__content) {
  width: 100% !important;
  max-width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
}

.searchable-selector-dialog :deep(.v-overlay__scrim) {
  opacity: 0.6 !important;
  background-color: rgba(0, 0, 0, 0.5) !important;
}
</style>
