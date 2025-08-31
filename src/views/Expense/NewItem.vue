<template>
  <div>
    <!-- 顶部导航栏 -->
    <v-toolbar
      color="primary"
      dark
      flat
    >
      <v-btn
        icon
        @click="goback"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>New Expense Item</v-toolbar-title>
    </v-toolbar>

    <!-- 主要内容区域 -->
    <v-container fluid>
      <v-form>
        <!-- 成本中心选择器 (改为Autocomplete方式) -->
        <v-autocomplete
          v-model="CostCenterID"
          :items="costCenterLst"
          item-title="text"
          item-value="value"
          label="Cost Center"
          clearable
          class="Required"
          :error-messages="CostCenterErrors"
          @blur="v$.CostCenterID.$touch()"
          @update:model-value="onCostCenterChange"
        />
        
        <!-- 费用类型选择器 -->
        <v-text-field
          v-model="ExpenseTypeDisplayText"
          clearable
          label="Expense Type"
          readonly
          class="Required"
          :error-messages="ExpenseTypeErrors"
          @click="openExpenseTypeDialog"
          @blur="v$.ExpenseTypeID.$touch()"
        />

        <!-- 下一步按钮 -->
        <div class="longButton">
          <v-btn
            color="primary"
            class="no-uppercase"
            @click="nextpage"
          >
            Next
            <v-icon
              size="large"
              end
            >
              mdi-skip-next-outline
            </v-icon>
          </v-btn>
        </div>
      </v-form>
    </v-container>

    <!-- 成本中心现在使用自动完成组件，不再需要对话框 -->
    
    <!-- 费用类型选择对话框 -->
    <SearchableSelector
      v-model="showExpenseTypeDialog"
      :search-text="expenseTypeSearch"
      :items="ExpenseTypeList"
      :search-placeholder="'Search Expense Type'"
      @update:search-text="expenseTypeSearch = $event"
      @select="chooseExpenseType"
      @cancel="cancelExpenseType"
    />
  </div>
</template>
<script>
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import tools from "../../plugins/tools";
import SearchableSelector from "../../components/SearchableSelector.vue";

export default {
  name: "NewItem",
  
  components: {
    SearchableSelector
  },
  
  setup() {
    return { v$: useVuelidate() };
  },
  
  validations() { 
    return {
      ExpenseTypeID: { required },
      CostCenterID: { required }
    };
  },
  
  data() {
    return {
      // 路由参数
      id: this.$route.params.id,
      
      // 数据模型
      CostCenterID: null,
      ExpenseTypeID: null,
      
      // 选项列表
      costCenterLst: [],
      ExpenseTypeList: [],
      
      // 对话框状态
      showExpenseTypeDialog: false,
      
      // 搜索文本
      expenseTypeSearch: "",
      
      // 临时存储值
      tempExpenseTypeValue: null
    };
  },
  
  computed: {
    
    /**
     * 获取当前选中的费用类型名称
     */
    ExpenseTypeDisplayText() {
      return this.ExpenseTypeID ? this.ExpenseTypeID.text : "";
    },
    
    /**
     * 费用类型验证错误信息
     */
    ExpenseTypeErrors() {
      const errors = [];
      if (!this.v$.ExpenseTypeID.$dirty) return errors;
      if (this.v$.ExpenseTypeID.required.$invalid) {
        errors.push("Expense Type is required.");
      }
      return errors;
    },
    
    /**
     * 成本中心验证错误信息
     */
    CostCenterErrors() {
      const errors = [];
      if (!this.v$.CostCenterID.$dirty) return errors;
      if (this.v$.CostCenterID.required.$invalid) { 
        errors.push("Cost Center is required.");
      }
      return errors;
    }
  },
  
  // 移除watch监听，由SearchableSelector组件内部处理搜索框状态
  
  created() {
    // 从会话存储恢复数据
    this.CostCenterID =
      sessionStorage.getItem(tools.data.sessionKey_ItemCostCenterID) == null
        ? parseInt(sessionStorage.getItem(tools.data.sessionKey_CostCenterID))
        : parseInt(sessionStorage.getItem(tools.data.sessionKey_ItemCostCenterID));
    
    this.ExpenseTypeID =
      sessionStorage.getItem(tools.data.sessionKey_ItemTypeID) != null
        ? {
            text: sessionStorage.getItem(tools.data.sessionKey_ItemTypeName),
            value: parseInt(sessionStorage.getItem(tools.data.sessionKey_ItemTypeID))
          }
        : null;
    
    // 加载数据
    this.loadCostCenter();
    this.loadExpenseType();
  },
  
  mounted() {
    window.addEventListener('resize', this.handleResize);
  },
  
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  
  methods: {
    /**
     * 加载成本中心列表
     */
    loadCostCenter() {
      tools.getCostCenter(value => {
        this.costCenterLst = value;
      });
    },
    
    /**
     * 加载费用类型列表
     */
    loadExpenseType() {
      tools.getExpenseType(this.CostCenterID, value => {
        this.ExpenseTypeList = value;
        
        // 验证现有选择是否仍然有效
        if (this.ExpenseTypeID && this.ExpenseTypeID.value) {
          const found = value.find(v => v.value === this.ExpenseTypeID.value);
          if (!found) {
            // 选择不再有效
            this.ExpenseTypeID = null;
          }
        }
      });
    },
    
    /**
     * 返回上一页
     */
    goback() {
      tools.clearItemSession();
      this.$router.push({
        path: `/Edit/${this.id}`
      });
    },
    
    /**
     * 进入下一页
     */
    nextpage() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      }
      
      // 保存数据到会话存储
      sessionStorage.setItem(
        tools.data.sessionKey_ItemTypeID,
        this.ExpenseTypeID.value
      );
      sessionStorage.setItem(
        tools.data.sessionKey_ItemTypeName,
        this.ExpenseTypeID.text
      );
      sessionStorage.setItem(
        tools.data.sessionKey_ItemCostCenterID,
        this.CostCenterID
      );
      
      // 导航到下一页
      this.$router.push({
        path: "/EditItem/"
      });
    },
    
    /**
     * 处理窗口调整大小（主要用于移动设备虚拟键盘）
     */
    handleResize() {
      const activeElement = document.activeElement;
      
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    },
    
    /**
     * 将指定元素滚动到可见区域
     */
    scrollInputIntoView(elementSelector) {
      const element = elementSelector 
        ? document.querySelector(elementSelector) 
        : document.activeElement;
        
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    },
    
    /**
     * 打开费用类型选择对话框
     */
    openExpenseTypeDialog() {
      this.tempExpenseTypeValue = this.ExpenseTypeID ? this.ExpenseTypeID.value : null;
      // 不再需要清空搜索框，由SearchableSelector内部处理
      this.showExpenseTypeDialog = true;
    },
    
    /**
     * 选择费用类型
     */
    chooseExpenseType(item) {
      this.ExpenseTypeID = item;
      this.v$.ExpenseTypeID.$touch();
      this.showExpenseTypeDialog = false;
    },
    
    /**
     * 取消费用类型选择
     */
    cancelExpenseType() {
      this.showExpenseTypeDialog = false;
      // 不再需要清空搜索框，由SearchableSelector内部处理
    },
    
    /**
     * 处理成本中心变更
     */
    onCostCenterChange(value) {
      if (value !== null) {
        // 触发验证
        this.v$.CostCenterID.$touch();
        
        // 重新加载费用类型列表
        this.loadExpenseType();
      }
    }
  }
};
</script>

<style scoped>
.no-uppercase {
  text-transform: none;
}

.v-text-field {
  margin-top: 2px;
  padding-top: 2px;
}

.longButton {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
