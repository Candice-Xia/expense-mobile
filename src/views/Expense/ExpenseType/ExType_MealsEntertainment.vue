<!--
include expense types:
    87,88 Customer Meals 
    3	Vendor Meal/Entertainment (off-site)
    7	Entertainment
    139	Meals with Customer/Vendor
--><template>
  <v-form style="overflow-x:hidden;">
    <v-select
      v-if="DisplayCurrencyCountry"
      v-model="Model.CurrencyCountryCode"
      :items="CurrencyCountryList"
      item-title="text"
      item-value="value"
      :menu-props="{ maxHeight: '400' }"
      label="Which country's currency was used?"
      persistent-hint
      :error-messages="CurrencyCountryCodeError"
      class="Required"
      :readonly="IsReadOnly"
      @blur="v$.Model.CurrencyCountryCode.$touch()"
      @update:model-value="onChangeCurrencyCode"
    />
    <v-card v-if="Model.ShowExchangeRate&&DisplayCurrencyCountry">
      <v-row>
        <v-col class="ml-1">
          <v-text-field
            v-model="LocalCurrencyMoney"
            :label="msgExchange"
            :class="isEditMoney?'changeLabelColor':''"
            :readonly="isEditMoney?false:IsReadOnly"
            @change="onChangeMoney"
            @input="ValidateNoNumLocalCurrencyMoney"
          />
        </v-col>
        <v-col>
          <v-text-field
            v-model="TargetCurrencyMoney"
            :label="msgExchangeTo"
            :class="isEditMoney?'changeLabelColor':''"
            :readonly="isEditMoney?false:IsReadOnly"
            @change="onChangeMoney"
            @input="ValidateNoNumTargetCurrencyMoney"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="ml-1 lblExchangeRate">
          <v-label>Exchange Rate:{{ ExchangeRateText }}</v-label>
        </v-col>
      </v-row>
    </v-card>
    <v-text-field
      v-model="Model.TotalCost"
      label="Total cost of meal (local currency)"
      counter
      :error-messages="TotalCostError"
      class="Required"
      :readonly="IsReadOnly"
      @input="v$.Model.TotalCost.$touch();onTotalChange();"
      @change="onPerAmountChanged()"
      @blur="v$.Model.TotalCost.$touch()"
    />
    <ChangeAmountExRate
      ref="ChangeAmountExRate"
      :is-edit-money="isEditMoney"
      @save-new-amount-claimed="SaveNewMoneyInfo"
      @hide-edit="EditMoney"
      @edit-new-amount-claimed="EditNewAmountClaimed"
    >
      <v-row>
        <v-col :cols="canEditMoney?'11':'12'">
          <v-text-field
            v-model="Model.AmountClaimed"
            label="Amount claimed (local currency)"
            counter
            :error-messages="AmountClaimedError"
            class="Required"
            :readonly="IsReadOnly"
            @change="onPerAmountChanged()"
            @input="v$.Model.AmountClaimed.$touch();AmountClaimedChange();"
            @blur="v$.Model.AmountClaimed.$touch()"
          />
        </v-col>
        <v-col
          v-if="canEditMoney"
          cols="1"
          class="edit-money"
        >
          <v-icon
            color="primary"
            @click="EditMoney"
          >
            mdi-pencil-box
          </v-icon>
        </v-col>
      </v-row>
    </ChangeAmountExRate>
    <v-menu
      v-model="dialog"
      :close-on-content-click="false"
      :disabled="IsReadOnly"
      transition="scale-transition"
      min-width="auto"
    >
      <template #activator="{ props }">
        <v-text-field
          v-model="MealDateForDisplay"
          class="Required"
          label="Date"
          append-icon="mdi-calendar"
          readonly
          v-bind="props"
          :error-messages="MealDateError"
        />
      </template>
      <v-date-picker
        v-model="MealDateForPicker"
        scrollable
        :max="Today"
        @update:model-value="dialog=false"
      >
        <template #actions>
          <v-spacer />
          <v-btn
            variant="text"
            color="primary"
            class="clsClose"
            @click="dialog=false"
          >
            Close
          </v-btn>
          <v-spacer />
        </template>
      </v-date-picker>
    </v-menu>
    <v-text-field
      v-if="isNonMeal"
      v-model="Model.TypeOfEvent"
      label="Type of event"
      :class="isNonMeal?'Required':''"
      counter
      :readonly="isReadOnly"
      :error-messages="TypeOfEventError"
      @input="v$.Model.TypeOfEvent.$touch()"
      @blur="v$.Model.TypeOfEvent.$touch()"
    />
    <v-combobox
      v-model="displayBusinessContactList"
      :items="items"
      chips
      class="Required mt-4"
      label="Enter all people entertained"
      multiple
      scrollable
      :counter-value="() => TotalBusinessContacts"
      :error-messages="displayBusinessContactListError"
      placeholder="Please click here to add attendants"
      readonly
      item-title="FullName"
      item-value="ID"
      @click="goToContactsPage"
    >
      <template #chip="{ props, item }">
        <v-chip v-bind="props">
          <span>{{ item.raw.FullName }}&nbsp;({{ item.raw.Company }})</span>
        </v-chip>
      </template>
    </v-combobox>
    <v-text-field
      v-if="!isNonMeal"
      v-model="Model.TotalAttendants"
      label="Total Number of Attendants including Self"
      class="Required"
      counter
      :readonly="IsReadOnly"
      :error-messages="TotalAttendantsError"
      @input="v$.Model.TotalAttendants.$touch();FormatTotalAttendants();"
      @blur="v$.Model.TotalAttendants.$touch()"
      @change="FormatTotalAttendants"
    />
    <v-select
      v-if="!isNonMeal"
      v-model="Model.SpecifyMeal"
      :items="SpecifyMealList"
      item-title="text"
      item-value="value"
      :menu-props="{ maxHeight: '400' }"
      label="Specify meal"
      persistent-hint
      :error-messages="SpecifyMealError"
      class="Required"
      :readonly="IsReadOnly"
      @blur="v$.Model.SpecifyMeal.$touch()"
      @update:model-value="selectedSpecifyMeal"
    />
    <v-text-field
      v-if="Model.SpecifyMeal==4 && !isNonMeal"
      v-model="Model.SpecifyOther"
      label="Please specify other"
      :class="Model.SpecifyMeal==4 && !isNonMeal?'Required':''"
      counter
      :readonly="IsReadOnly"
      :error-messages="SpecifyOtherError"
      @input="v$.Model.SpecifyOther.$touch()"
      @blur="v$.Model.SpecifyOther.$touch()"
    />
    <v-text-field
      v-model="Model.Vendor"
      label="Vendor"
      class="Required"
      counter
      :readonly="IsReadOnly"
      :error-messages="VendorError"
      @input="v$.Model.Vendor.$touch()"
      @blur="v$.Model.Vendor.$touch()"
    />
    <v-textarea
      v-model="Model.BusinessDiscussed"
      label="Business discussed (Please be specific)"
      class="Required"
      counter
      :readonly="IsReadOnly"
      rows="3"
      :error-messages="BusinessDiscussedError"
      @input="v$.Model.BusinessDiscussed.$touch()"
      @blur="v$.Model.BusinessDiscussed.$touch()"
    />
    <v-text-field
      v-if="isDisplayMBCNO"
      v-model="Model.MBCNo"
      label="MBC #"
      counter
      :readonly="IsReadOnly"
      @change="FormatMBCNO"
      @input="FormatMBCNO"
    />
    <v-textarea
      v-model="Model.Comment"
      label="Comments (Optional)"
      counter
      rows="3"
      :readonly="IsReadOnly"
    />
    <v-text-field
      v-model="Model.Subledger"
      label="Subledger"
      counter
      :readonly="IsReadOnly"
      @change="FormatSubledger"
      @input="FormatSubledger" 
    />
    <v-text-field
      v-if="Model.ShowTravelRquistionNo"
      v-model="Model.TravelRquisitionNo"
      label="Travel Requisition #"
      counter
      :readonly="IsReadOnly"
    />
  </v-form>
</template>
<script>
import tools from "../../../plugins/tools";
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import nowDate from "../../../Scripts/GetToday";
import ChangeAmountExRate from "../../../components/ChangeAmountExRate";
export default {
  name: "ExTypeMealsEntertainment",
  components: {
    ChangeAmountExRate
  },
  props: {
    expenseTypeID: {
      type: Number,
      default: 0
    },
    isReadOnly: {
      type: Boolean,
      default: false
    },
    expenseReportID: {
      type: Number,
      default: 0
    },
    expenseItemID: {
      type: Number,
      default: 0
    },
    costCenterID: {
      type: Number,
      default: 0
    }
  },
  emits: ["loadExpenseItem"],
  setup() {
    return { v$: useVuelidate() }
  },
  validations(){ 
    return {
      Model: {
        TotalCost: { required },
        AmountClaimed: { required },
        MealDate: { required },
        TypeOfEvent:{
          required(){
            if(!this.isNonMeal)return true;
            return !!this.Model.TypeOfEvent;
          }
        },
        SpecifyMeal: { required(){
          if(this.isNonMeal)return true;
          return !!this.Model.SpecifyMeal;
        } },
        SpecifyOther:{
            required(){
              if(this.SpecifyMeal!=4||this.isNonMeal) return true;
              return !!this.Model.SpecifyOther;
          }
        },
        Vendor: { required },
        TotalAttendants: {
          required() {
            if(this.isNonMeal) return true;
            if (this.Model.TotalAttendants != "") {
              if (/[^\d]/g.test(this.Model.TotalAttendants)) {
                return false;
              }
              else if(parseInt(this.Model.TotalAttendants)<this.BusinessContactList.length){
                return false;
              }
              return true;
            } else return false;
          }
        },
        BusinessDiscussed: { required },
        CurrencyCountryCode: {
          required() {
            if (!this.TravelAbroad) return true;
            return !!this.Model.CurrencyCountryCode;
          }
        }
      },
      FullName:{
          required(){
            if(!this.dialogBusinessContacts) return true;
            if(!this.IsSave)return true;
            return !!this.FullName;
          }
        },
      Company:{
          required(){
            if(!this.dialogBusinessContacts) return true;
            if(!this.IsSave)return true;
            return !!this.Company;
          }
      },
      displayBusinessContactList:{
        required(){
          if(this.displayBusinessContactList.length>0) 
            return true;
          else 
            return false;
        }
      }
    }
  },
  data: function() {
    return {
      Model: {},
      dialog: false,
      TravelAbroad: false,
      CurrencyCountryList: [],
      LocalCurrencyMoney: 1.0,
      TargetCurrencyMoney: 1.0,
      ExchangeRateText: "1.0000000000",
      Today: "",
      canEditMoney: false,
      isEditMoney: false,
      Claim_Amount_Old: null,
      ExchangeRate_Old: 0,
      ChangeAmountClaimedModel: {},
      LocalCurrencyMoney_Old: null,
      SpecifyMealList:[],
      SpecifyMeal:0,
      dialogBusinessContacts:false,
      tempBusinessContactList:[],
      BusinessContactList:[],
      displayBusinessContactList:[],
      TotalBusinessContacts:0,
      items:[],
      FullName:null,
      Company:null,
      IsSave:false,
      CardTextHeight:'height:300px;',
      pageSize: 6,
      OriginalHeight:(window.innerHeight > 576 ? window.innerHeight : 576)-320,
      isDisplayMBCNO:true,
      isNonMeal:false,
      displayAnimation:true,
      isAdd:false,
      isResize:true,
      swiperOption: {
        // swiper configs 所有的配置同swiper官方api配置
        notNextTick: true, //notNextTick是一个组件自有属性，如果notNextTick设置为true，组件则不会通过NextTick来实例化swiper，也就意味着你可以在第一时间获取到swiper对象，假如你需要刚加载遍使用获取swiper对象来做什么事，那么这个属性一定要是true
        direction: "vertical", //水平方向移动
        grabCursor: true, //鼠标覆盖Swiper时指针会变成手掌形状，拖动时指针会变成抓手形状
        setWrapperSize: true, //Swiper使用flexbox布局(display: flex)，开启这个设定会在Wrapper上添加等于slides相加的宽或高，在对flexbox布局的支持不是很好的浏览器中可能需要用到。
        autoHeight: true, //自动高度。设置为true时，wrapper和container会随着当前slide的高度而发生变化
        slidesPerView: 1, //设置slider容器能够同时显示的slides数量(carousel模式)。可以设置为数字（可为小数，小数不可loop），或者 'auto'则自动根据slides的宽度来设定数量。loop模式下如果设置为'auto'还需要设置另外一个参数loopedSlides。
        mousewheel: false, //开启鼠标滚轮控制Swiper切换。可设置鼠标选项，默认值false
        mousewheelControl: false, //同上
        resistanceRatio: 0, //抵抗率。边缘抵抗力的大小比例。值越小抵抗越大越难将slide拖离边缘，0时完全无法拖离。本业务需要
        height: (window.innerHeight > 576 ? window.innerHeight : 576)-320, // 高度设置，占满设备高度
        observer: true,
        observeParents: true, //将observe应用于Swiper的父元素。当Swiper的父元素变化时，例如window.resize，Swiper更新
        // 如果自行设计了插件，那么插件的一些配置相关参数，也应该出现在这个对象中，如下debugger
        debugger: true,
        pagination: {
          type: "progressbar"
        },
        // swiper的各种回调函数也可以出现在这个对象中，和swiper官方一样
        onTransitionStart(swiper) {
          console.log(swiper);
        }
      }
    };
  },

  computed: {
    msgExchange() {
      return this.Model.CurrencyCountryCode + " Currency";
    },
    msgExchangeTo() {
      return this.Model.MyReport.ClaimCountryCode + " Currency";
    },
    MealDateForDisplay() {
      return tools.formatDateAsOriginalForUS(this.Model.MealDate);
    },
    MealDateForPicker: {
      get: function() {
        return tools.formatDateAsOriginal(this.Model.MealDate);
      },
      set: function(value) {
        this.Model.MealDate = value;
      }
    },
    TotalCostError() {
      const errors = [];
      if (!this.v$.Model.TotalCost.$dirty) return errors;
      this.v$.Model.TotalCost.required.$invalid &&
        errors.push("Total Cost is required.");
      return errors;
    },
    AmountClaimedError() {
      const errors = [];
      if (!this.v$.Model.AmountClaimed.$dirty) return errors;
      this.v$.Model.AmountClaimed.required.$invalid &&
        errors.push("Amount Claimed is required.");
      return errors;
    },
    SpecifyMealError(){
      const errors = [];
      if (!this.v$.Model.SpecifyMeal.$dirty) return errors;
      this.v$.Model.SpecifyMeal.required.$invalid && errors.push("Specify meal is required.");
      return errors;
    },
    SpecifyOtherError(){
      const errors = [];
      if (!this.v$.Model.SpecifyOther.$dirty) return errors;
      this.v$.Model.SpecifyOther.required.$invalid && errors.push("This field is required.");
      return errors;
    },
    VendorError() {
      const errors = [];
      if (!this.v$.Model.Vendor.$dirty) return errors;
      this.v$.Model.Vendor.required.$invalid && errors.push("Vendor is required.");
      return errors;
    },
    MealDateError() {
      const errors = [];
      if (!this.v$.Model.MealDate.$dirty) return errors;
      this.v$.Model.MealDate.required.$invalid &&
        errors.push("Date of meal is required.");
      return errors;
    },
    TypeOfEventError(){
      const errors = [];
      if (!this.v$.Model.TypeOfEvent.$dirty) return errors;
      this.v$.Model.TypeOfEvent.required.$invalid &&
        errors.push("Type of event is required.");
      return errors;
    },
    TotalAttendantsError() {
      const errors = [];
      var errorMsg="Total Attendants is required and must be positive integer.";
      if(parseInt(this.Model.TotalAttendants)<this.BusinessContactList.length){
        errorMsg="Not less than the number of attendants added.";
      }
      if (!this.v$.Model.TotalAttendants.$dirty) return errors;
      this.v$.Model.TotalAttendants.required.$invalid &&
        errors.push(errorMsg);
      return errors;
    },
    BusinessDiscussedError() {
      const errors = [];
      if (!this.v$.Model.BusinessDiscussed.$dirty) return errors;
      this.v$.Model.BusinessDiscussed.required.$invalid &&
        errors.push("Business discussed is required.");
      return errors;
    },
    CurrencyCountryCodeError() {
      const errors = [];
      if (!this.v$.Model.CurrencyCountryCode.$dirty) return errors;
      this.v$.Model.CurrencyCountryCode.required.$invalid &&
        errors.push("CurrencyCountryCode is required.");
      return errors;
    },
    FullNameError(){
      const errors = [];
      if (!this.v$.FullName.$dirty) return errors;
      this.v$.FullName.required.$invalid &&
        errors.push("Name is required.");
      return errors;
    },
    CompanyError(){
      const errors = [];
      if (!this.v$.Company.$dirty) return errors;
      this.v$.Company.required.$invalid &&
        errors.push("Company is required.");
      return errors;
    },
    displayBusinessContactListError(){
      const errors = [];
      if (!this.v$.displayBusinessContactList.$dirty) return errors;
      this.v$.displayBusinessContactList.required.$invalid &&
        errors.push("This field is required.");
      return errors;
    },
    DisplayCurrencyCountry() {
      if (
        this.Model.ExpenseItem &&
        this.Model.ExpenseItem.ParentExpenseItemID > 0
      ) {
        return false;
      }
      var hideType=[12,25,91,93];
      if (hideType.indexOf(this.expenseTypeID)!=-1) {
        return false;
      }
      return this.TravelAbroad;
    }
  },
  beforeUpdate() {
    // 在组件更新前检查全局状态
    if (window.contactsPageData) {
      console.log("在beforeUpdate钩子中检测到联系人数据，将应用更新", window.contactsPageData);
      const { businessContactList, tempBusinessContactList } = window.contactsPageData;
      if (businessContactList && tempBusinessContactList) {
        this.updateBusinessContacts(businessContactList, tempBusinessContactList);
        // 清除全局状态
        window.contactsPageData = null;
      }
    }
  },
  mounted() {
    // 在组件挂载后再次检查全局状态，确保表单已经完全加载
    this.$nextTick(() => {
      if (window.contactsPageData) {
        console.log("在mounted钩子中检测到联系人数据，将应用更新", window.contactsPageData);
        const { businessContactList, tempBusinessContactList } = window.contactsPageData;
        if (businessContactList && tempBusinessContactList) {
          this.updateBusinessContacts(businessContactList, tempBusinessContactList);
          // 清除全局状态
          window.contactsPageData = null;
        }
      }
    });
  },
  created: function() {
    this.InitPage();
    this.resetExchange();
    this.Today = nowDate;
    this.LocalCurrencyMoney = parseFloat(this.LocalCurrencyMoney).toFixed(2);
    this.TargetCurrencyMoney = parseFloat(this.TargetCurrencyMoney).toFixed(2);
    
    // 检查是否有从联系人页面返回的数据
    if (window.contactsPageData) {
      console.log("检测到联系人数据，将应用更新", window.contactsPageData);
      const { businessContactList, tempBusinessContactList } = window.contactsPageData;
      if (businessContactList && tempBusinessContactList) {
        this.updateBusinessContacts(businessContactList, tempBusinessContactList);
        // 清除全局状态
        window.contactsPageData = null;
      }
    }

    this.SpecifyMealList.push({text: "Breakfast",value: 1},{text: "Lunch",value: 2},{text: "Dinner",value: 3},{text: "Other",value: 4});
    this.$axios
      .get("/ExpenseReport/GetCountries", {
        params: {
          expenseReportID: this.expenseReportID
        }
      })
      .then(response => {
        response.data.forEach(item => {
          this.CurrencyCountryList.push({
            text: item.Text,
            value: item.Key
          });
        });
      });

    var url = this.expenseItemID > 0 ? "/MultiItems/GetItem" : "/MultiItems/CreateNewItem";
    this.$axios
      .get(url, {
        params: {
          expenseReportID: this.expenseReportID,
          expenseTypeID: this.expenseTypeID,
          expenseItemID: this.expenseItemID,
          costCenterID: this.costCenterID
        }
      })
      .then(response => {
          tools.getCurrentUser(value=>{
            var canReview = tools.canReview(response.data.MyReport.ReportStatus)&&response.data.MyReport.EmployeeID!=value.EmployeeID;
            this.canEditMoney =canReview && !response.data.ExpenseItem.ApprovedByManager && !response.data.ExpenseItem.Rejected;
          });
        if (
          response.data.AmountClaimed != null &&
          response.data.AmountClaimed > 0
        ) {
          response.data.AmountClaimed = response.data.AmountClaimed.toFixed(2);
        } else {
          response.data.AmountClaimed = null;
        }
        if (response.data.TotalCost != null && response.data.TotalCost > 0) {
          response.data.TotalCost = response.data.TotalCost.toFixed(2);
        } else {
          response.data.TotalCost = null;
        }
        this.Model = response.data;
        if (this.Model.ExchangeRate > 0 && this.Model.TotalCost > 0) {
          this.ExchangeRate_Old = this.Model.ExchangeRate;
          this.Claim_Amount_Old = (
            this.Model.AmountClaimed * this.ExchangeRate_Old
          ).toFixed(2);
          this.LocalCurrencyMoney = this.Model.TotalCost;
          this.TargetCurrencyMoney = (
            this.LocalCurrencyMoney * this.Model.ExchangeRate
          ).toFixed(2);
          this.ExchangeRateText = this.Model.ExchangeRate.toFixed(10);
          this.LocalCurrencyMoney_Old = this.LocalCurrencyMoney;
          this.Model.AmountClaimed=tools.formatAmount(this.Model.AmountClaimed);
          this.Model.TotalCost=tools.formatAmount(this.Model.TotalCost);
          this.LocalCurrencyMoney=tools.formatAmount(this.LocalCurrencyMoney);
          this.TargetCurrencyMoney=tools.formatAmount(this.TargetCurrencyMoney);
        }
        if(this.Model.BusinessContactList!=null && this.Model.BusinessContactList.length>0){
          this.BusinessContactList=[];
          this.displayBusinessContactList=[];
          this.tempBusinessContactList=[];
          var id=0;
         this.Model.BusinessContactList.forEach(t=>{
            id++;
            this.BusinessContactList.push({ID:id,FullName:t.FullName,Company:t.Company,IsChanged:false});
            this.tempBusinessContactList.push({FullName:t.FullName,Company:t.Company});
          });
          this.BusinessContactList.sort(this.objectArraySort('ID'));
          var displayID=0;
          this.BusinessContactList.forEach(t=>{
            displayID++;
            if(displayID<=3){
              this.displayBusinessContactList.push({ID:t.ID,FullName:t.FullName,Company:t.Company});
            }
          });
          this.TotalBusinessContacts=displayID;
        }else{
          this.isAdd=true;
        }
        if (this.Model.ExpenseItemID == 0) {
          this.Model.TotalCost = null;
          this.Model.AmountClaimed = null;
          this.Model.TotalAttendants = null;
          this.Model.MealDate = null;
          this.Model.ExchangeRate = 1;
        }
        this.$emit("loadExpenseItem", this.Model.ExpenseItem);
        this.TravelAbroad = this.Model.MyReport.TravelAbroad;
        console.log('this.Model');
        console.log(this.Model);
      })
      .catch(error => {
        console.log(error);
      });
  },
  methods: {
    InitPage(){
      if(this.expenseTypeID==3||this.expenseTypeID==7){
        this.isDisplayMBCNO=false;
        if(this.expenseTypeID==7)
        {
          this.isNonMeal=true;
        }
      }
    },
    goToContactsPage() {
      // 将当前联系人数据存储到路由状态中
      // 在vue-router 4中，params不能与path一起使用，需要使用name或使用query参数
      this.$router.push({
        name: 'ContactsPage',
        query: {
          businessContactList: JSON.stringify(this.BusinessContactList),
          tempBusinessContactList: JSON.stringify(this.tempBusinessContactList),
          isReadOnly: this.isReadOnly,
          fromExpenseId: this.expenseItemID
        }
      });
    },
    // 用于从外部更新联系人数据（从ContactsPage返回时）
    updateBusinessContacts(businessContactList, tempBusinessContactList) {
      if (!businessContactList || !tempBusinessContactList) {
        console.error("传入的联系人数据无效", businessContactList, tempBusinessContactList);
        return;
      }
      
      console.log("正在更新联系人数据", businessContactList, tempBusinessContactList);
      
      // 清空现有数据
      this.BusinessContactList = [];
      this.tempBusinessContactList = [];
      this.displayBusinessContactList = [];
      
      // 复制新数据
      businessContactList.forEach(contact => {
        this.BusinessContactList.push({...contact});
      });
      
      tempBusinessContactList.forEach(contact => {
        this.tempBusinessContactList.push({...contact});
      });
      
      // 重建显示列表
      let displayID = 0;
      this.BusinessContactList.forEach(t => {
        displayID++;
        if (displayID <= 3) {
          this.displayBusinessContactList.push({
            ID: t.ID,
            FullName: t.FullName,
            Company: t.Company
          });
        }
      });
      
      this.TotalBusinessContacts = this.BusinessContactList.length;
      
      // 更新总人数，如果当前值小于联系人数
      if (parseInt(this.Model.TotalAttendants) < this.TotalBusinessContacts) {
        this.Model.TotalAttendants = String(this.TotalBusinessContacts);
      }
      
      // 标记表单已修改
      this.isDirty = true;
      
      // 强制更新UI
      this.$forceUpdate();
      
      console.log("联系人数据更新完成", 
        this.BusinessContactList.length, 
        this.tempBusinessContactList.length,
        this.displayBusinessContactList.length
      );
      
      // 调试日志
      console.log("联系人数据已更新:", {
        businessList: this.BusinessContactList,
        tempList: this.tempBusinessContactList,
        displayList: this.displayBusinessContactList,
        total: this.TotalBusinessContacts
      });
    },
    resetExchange() {
      this.LocalCurrencyMoney = 1.0;
      this.TargetCurrencyMoney = 1.0;
      this.Model.ExchangeRate = 1.0;
      this.LocalCurrencyMoney = this.LocalCurrencyMoney.toFixed(2);
      this.TargetCurrencyMoney = this.TargetCurrencyMoney.toFixed(2);
      this.ExchangeRateText = this.Model.ExchangeRate.toFixed(10);
    },
    onTotalChange() {
      if (this.Model.TotalCost != null && this.Model.TotalCost !='') {
        this.Model.TotalCost=tools.clearNoNum(this.Model.TotalCost);
        this.Model.AmountClaimed =tools.formatAmount(this.Model.TotalCost);
        if(parseFloat(this.Model.TotalCost)>0){
          if (this.Model.ShowExchangeRate) {
            this.LocalCurrencyMoney =tools.formatAmount(this.Model.TotalCost);
            this.TargetCurrencyMoney = tools.formatAmount(parseFloat(this.Model.TotalCost) * this.Model.ExchangeRate);
          }
        }else{
          this.Model.TotalCost=null;
          this.Model.AmountClaimed = null;          
        } 
      }else {
        this.Model.TotalCost=null;
        this.Model.AmountClaimed = null;
      }
    },
    AmountClaimedChange() {
      if(this.Model.AmountClaimed!=null && this.Model.AmountClaimed!=''){
        this.Model.AmountClaimed=tools.clearNoNum(this.Model.AmountClaimed);
        if(parseFloat(this.Model.AmountClaimed)>0){
          if (this.Model.ShowExchangeRate) {
            if(this.LocalCurrencyMoney!=null&&this.LocalCurrencyMoney!='')
              this.LocalCurrencyMoney=tools.clearNoNum(this.LocalCurrencyMoney);
            if(this.TargetCurrencyMoney!=null&&this.TargetCurrencyMoney!='')
              this.TargetCurrencyMoney=tools.clearNoNum(this.TargetCurrencyMoney);
            if(this.Model.AmountClaimed!=null && this.Model.AmountClaimed!=''){
              this.LocalCurrencyMoney = tools.clearNoNum(this.Model.AmountClaimed);
              this.TargetCurrencyMoney = (
                this.LocalCurrencyMoney * this.Model.ExchangeRate
              ).toFixed(2);
              this.Model.AmountClaimed=tools.clearNoNum(this.Model.AmountClaimed);
              this.LocalCurrencyMoney =tools.formatAmount(this.LocalCurrencyMoney);
              this.TargetCurrencyMoney =tools.formatAmount(this.TargetCurrencyMoney);
            }
          }
        }
        else
          this.Model.AmountClaimed=null;
      }else
        this.Model.AmountClaimed=null;
    },
    onChangeMoney() {
      if (this.LocalCurrencyMoney !=null &&this.LocalCurrencyMoney!='') {
        this.LocalCurrencyMoney = parseFloat(tools.clearNoNum(this.LocalCurrencyMoney)).toFixed(
          2
        );
        if(this.TargetCurrencyMoney !=null &&this.TargetCurrencyMoney!=''){
          this.TargetCurrencyMoney = parseFloat(tools.clearNoNum(this.TargetCurrencyMoney)).toFixed(
          2
        );
        }else{
          this.TargetCurrencyMoney=1;
        }
        if(parseFloat(this.LocalCurrencyMoney)>0){
          this.Model.ExchangeRate =this.TargetCurrencyMoney / this.LocalCurrencyMoney;
          this.ExchangeRateText = this.Model.ExchangeRate.toFixed(10);
          this.Model.AmountClaimed =tools.formatAmount(this.LocalCurrencyMoney);
          if (!this.isEditMoney) {
            this.Model.TotalCost = tools.formatAmount(this.LocalCurrencyMoney);
          }
          this.LocalCurrencyMoney =tools.formatAmount(this.LocalCurrencyMoney);
          this.TargetCurrencyMoney =tools.formatAmount(this.TargetCurrencyMoney);
        }else this.resetExchange();
      } else this.resetExchange();

      if (this.isEditMoney) {
        this.$refs.ChangeAmountExRate.OldClaimAmount(
          this.TargetCurrencyMoney,
          false
        );
      }
    },
    onChangeCurrencyCode() {
      this.Model.ShowExchangeRate = !(
        this.Model.CurrencyCountryCode == this.Model.MyReport.ClaimCountryCode
      );
      if (!this.Model.ShowExchangeRate) this.resetExchange();
    },
    onPerAmountChanged() {
      if (this.Model.AmountClaimed != null && this.Model.AmountClaimed !='') 
        this.Model.AmountClaimed =tools.clearNoNum(this.Model.AmountClaimed);
      if (this.Model.TotalCost != null && this.Model.TotalCost!='') 
        this.Model.TotalCost = tools.clearNoNum(this.Model.TotalCost);

      // 处理金额格式化
      if (this.Model.AmountClaimed != null && this.Model.AmountClaimed !='') {
        this.Model.AmountClaimed = tools.formatAmount(this.Model.AmountClaimed);
      } else {
        this.Model.AmountClaimed = null;
      }
      if (this.Model.TotalCost != null && this.Model.TotalCost!='') {
        this.Model.TotalCost = tools.formatAmount(this.Model.TotalCost);
      } else {
        this.Model.TotalCost = null;
      }
    },
    EditMoney() {
      if (this.isEditMoney) {
        this.ExchangeRateText = parseFloat(this.ExchangeRate_Old).toFixed(10);
        this.LocalCurrencyMoney = this.LocalCurrencyMoney_Old;
        this.Model.AmountClaimed = this.LocalCurrencyMoney_Old;
        this.TargetCurrencyMoney = parseFloat(this.Claim_Amount_Old).toFixed(2);

        this.LocalCurrencyMoney=tools.formatAmount(this.LocalCurrencyMoney);
        this.Model.AmountClaimed=tools.formatAmount(this.Model.AmountClaimed);
        this.TargetCurrencyMoney=tools.formatAmount(this.TargetCurrencyMoney);

        this.isEditMoney = false;
      } else {
        this.isEditMoney = true;
        this.$refs.ChangeAmountExRate.OldClaimAmount(
          this.Claim_Amount_Old,
          true
        );
      }
    },
    EditNewAmountClaimed(newvalue) {
      if (this.Model.ShowExchangeRate) {
        if(parseFloat(newvalue)>0){
          this.TargetCurrencyMoney = newvalue;
          this.LocalCurrencyMoney = (newvalue / this.Model.ExchangeRate).toFixed(
            2
          );
          this.TargetCurrencyMoney=tools.formatAmount(this.TargetCurrencyMoney);
          this.LocalCurrencyMoney=tools.formatAmount(this.LocalCurrencyMoney);
        }
      } else this.resetExchange();
    },
    SaveNewMoneyInfo(datas) {
      var newAmountClaimed=datas.NewAmountClaimed;
      if(datas.NewAmountClaimed!=''&&datas.NewAmountClaimed!=null)
        newAmountClaimed=tools.clearNoNum(datas.NewAmountClaimed);
      this.ChangeAmountClaimedModel.Claim_Amount_Old = this.Claim_Amount_Old;
      this.ChangeAmountClaimedModel.AmountClaimed = newAmountClaimed;
      this.ChangeAmountClaimedModel.ExchangeRate_Old = this.ExchangeRate_Old;
      this.ChangeAmountClaimedModel.ExchangeRate = this.Model.ExchangeRate;
      this.ChangeAmountClaimedModel.ExpenseItemID = this.expenseItemID;
      this.ChangeAmountClaimedModel.Reasonforchanging = datas.Reasonforchanging;
      this.ChangeAmountClaimedModel.Amount_QuestionID = 2;
      this.$axios
        .post("/MultiItems/SaveNewAmountClaimed", this.ChangeAmountClaimedModel)
        .then(response => {
          if (response.data) {
            tools.alert(response.data);
          } else {
            tools.alert("Save Successfully.");
            this.isEditMoney = false;
            this.Model.AmountClaimed = (
              newAmountClaimed / this.Model.ExchangeRate
            ).toFixed(2);
            this.Model.AmountClaimed=tools.formatAmount(this.Model.AmountClaimed);
            this.Claim_Amount_Old = newAmountClaimed;
            this.LocalCurrencyMoney_Old = this.Model.AmountClaimed;
            this.ExchangeRate_Old = this.Model.ExchangeRate;
            tools.clearExpenseItemList(this.expenseReportID);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    selectedSpecifyMeal(){
        this.SpecifyMeal=this.Model.SpecifyMeal;
    },
    FocusBusinessContacts(){
      this.dialogBusinessContacts=true;
      if(this.BusinessContactList.length==0)
        this.isAdd=true;
      this.displayAnimation=true;
      var soHeight=this.OriginalHeight*0.9;
      this.swiperOption.height=soHeight;
      this.CardTextHeight="height:"+soHeight+"px;";
      this.pageSize = parseInt(soHeight / 50);
      var mo=soHeight%50;
      if(mo>0)this.CardTextHeight="height:"+parseFloat(soHeight-mo)+"px;";
      if(this.pageSize<3)this.pageSize=3;
      if(!this.isAdd)
        this.RePaging(0);
    },
    RePaging(isAdd){
      if(isAdd==0){
        this.isAdd=false;
        var soHeight=this.OriginalHeight*0.9+200;
        this.swiperOption.height=soHeight;
        this.CardTextHeight="height:"+soHeight+"px;";
        this.pageSize = parseInt(soHeight / 50);
        var mo=soHeight%50;
        if(mo>0)this.CardTextHeight="height:"+parseFloat(soHeight-mo-8)+"px;";
        if(this.pageSize<3)this.pageSize=3;
      }else{
        this.isAdd=true;
        this.FocusBusinessContacts();
      }
      this.isResize=false;
      setTimeout(() => {
        this.isResize=true;
      }, 10);
      
    },
    objectArraySort(keyName){
      return function (objectN, objectM) {
        var valueN = objectN[keyName];
        var valueM = objectM[keyName];
        if (valueN < valueM) return 1;
        else if (valueN > valueM) return -1;
        else return 0;
      }
    },
    AddPeople(){
      this.IsSave=true;
      this.v$.FullName.$touch();
      this.v$.Company.$touch();
      if (this.v$.FullName.$invalid||this.v$.Company.$invalid) {
        return;
      }
      this.tempBusinessContactList.push({FullName:this.FullName,Company:this.Company});
      this.BusinessContactList=[];
      this.displayBusinessContactList=[];
      var id=0;
      this.tempBusinessContactList.forEach(t=>{
        id++;
        this.BusinessContactList.push({ID:id,FullName:t.FullName,Company:t.Company,IsChanged:true});
      });
      this.TotalBusinessContacts=id;
      this.BusinessContactList.sort(this.objectArraySort('ID'));
      var displayID=0;
      this.BusinessContactList.forEach(t=>{
        displayID++;
        if(displayID<=3){
          this.displayBusinessContactList.push({ID:t.ID,FullName:t.FullName,Company:t.Company});
        }
      });
      if(parseInt(this.Model.TotalAttendants)<displayID){
        this.Model.TotalAttendants=null;
      }
      this.displayAnimation=false;
      if(this.BusinessContactList.length==1){
        this.displayAnimation=true;
      }
      this.IsSave=false;
      this.FullName=null;
      //this.Company=null;
      tools.alert("Add Successfully.",2000,"black",true,false);
      console.log(this.BusinessContactList);
    },
    async DelPeople(id){
       if (
        await tools.confirm(
          "Are you sure to delete this item?"
        )){
          var tempList=this.BusinessContactList;
          this.BusinessContactList=[];
          this.tempBusinessContactList=[];
          this.displayBusinessContactList=[];
          var newid=tempList.length;
          tempList.forEach(t=>{
            if(t.ID!=id){
              newid--;
              this.BusinessContactList.push({ID:newid,FullName:t.FullName,Company:t.Company,IsChanged:true});
              this.tempBusinessContactList.push({FullName:t.FullName,Company:t.Company});
            }
          });
      this.BusinessContactList.sort(this.objectArraySort('ID'));
      var displayID=0;
      this.BusinessContactList.forEach(t=>{
        displayID++;
        if(displayID<=3){
          this.displayBusinessContactList.push({ID:t.ID,FullName:t.FullName,Company:t.Company});
        }
      });
      this.TotalBusinessContacts=displayID;
      if(parseInt(this.Model.TotalAttendants)<displayID){
        this.Model.TotalAttendants=null;
      }
      this.displayAnimation=false;
      tools.alert("Delete Successfully.",2000,"black",true,false);
      }
    },
    pageQty(list) {
      if (list.length > 0) {
        return parseInt(Math.ceil(list.length / this.pageSize));
      } else return 1;
    },
    MyList(list, index) {
      return this.pagingList(list, index - 1, this.pageSize);
    },
    pagingList(list, skipPageIndex, pageSize) {
      var resultList = [];
      for (
        var i = skipPageIndex * pageSize;
        i < list.length && i < skipPageIndex * pageSize + pageSize;
        i++
      ) {
        resultList.push(list[i]);
      }
      return resultList;
    },
    IsNullOrEmpty(val){
      if(val==null||val=='')
        return false;
      return true;
    },
    FormatTotalAttendants(){
      if(this.Model.TotalAttendants!=null && this.Model.TotalAttendants!=''){
        this.Model.TotalAttendants=tools.PositiveInt(this.Model.TotalAttendants);
      }else{
        this.Model.TotalAttendants=null;
      }  
    },
    FormatMBCNO(){
      if(this.Model.MBCNo!=null && this.Model.MBCNo!=''){
        this.Model.MBCNo=tools.PositiveInt(this.Model.MBCNo);
      }else{
        this.Model.MBCNo=null;
      }      
    },
    FormatSubledger(){
      if(this.Model.Subledger!=null && this.Model.Subledger!=''){
        this.Model.Subledger=tools.PositiveInt(this.Model.Subledger);
      }else{
        this.Model.Subledger=null
      }
    },
    ValidateNoNumLocalCurrencyMoney() {
      if (this.LocalCurrencyMoney != null && this.LocalCurrencyMoney != ""){
        this.LocalCurrencyMoney=tools.clearNoNum(this.LocalCurrencyMoney);
      }
      else this.LocalCurrencyMoney = null;
    },
    ValidateNoNumTargetCurrencyMoney() {
      if (this.TargetCurrencyMoney != null && this.TargetCurrencyMoney != ""){
        this.TargetCurrencyMoney=tools.clearNoNum(this.TargetCurrencyMoney);
      }
      else this.TargetCurrencyMoney = null;
    },
    save(goback, attachments,updateIsDisabledBtn) {
      this.isEditMoney = false;
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      }
      updateIsDisabledBtn(true);
      if (!this.Model.ExpenseItem) this.Model.ExpenseItem = {};
      this.Model.ExpenseItem.AttchmentList = attachments;
      this.Model.MealDate = tools.formatDateAsOriginal(this.Model.MealDate);
      if(this.Model.TotalCost!=null && this.Model.TotalCost!='')
        this.Model.TotalCost=tools.clearNoNum(this.Model.TotalCost);
      if(this.Model.AmountClaimed!=null && this.Model.AmountClaimed!='')
        this.Model.AmountClaimed=tools.clearNoNum(this.Model.AmountClaimed);
      this.Model.BusinessContactList=[];
      this.Model.BusinessContactList=this.BusinessContactList;
      this.$axios
        .post("/MultiItems/SaveItem", this.Model)
        .then(response => {          
          if (response.data.ExpenseItemID > 0) {
            tools.alert("Save Successfully.");
            goback(true, response.data, this.Model.ExpenseItemID > 0);
          } else {
            updateIsDisabledBtn(false);
            tools.alert("Failed to save meal!", 0, 'error', false);
          }
        })
        .catch(error => {
          updateIsDisabledBtn(false);
          tools.alert("error", 0, 'error', false);
          console.log(error);
        });
    }
  }
};
</script>
<style scoped>
.subtitle {
  padding-left: 0px;
  font-size: 12px;
  height: 24px;
}
.radiogroup {
  margin-top: 0px;
}
.radiogroup .v-input__slot {
  margin-bottom: 0px !important;
}
.lblExchangeRate {
  margin-top: -25px;
}
.edit-money {
  margin-top: 27px;
  margin-left: -20px;
}
.row.SpecifyMeal .col:nth-child(3),
.row.SpecifyMeal .col:nth-child(4){
  margin-top: -30px;
}
.cls-name,.cls-company{
  margin-left: 5px;
  height: 50px;
}
.btn-add{
  position:absolute;
  bottom: 15%;
  left: 70%;
  z-index: 500;
  background-color: rgba(0, 0, 0, 0) !important;
  box-shadow: none !important;
}
.btn-close{
  position: relative;
  top: 0px;
  left:30%;
}
.delete .v-list-item.v-list-item--link.theme--light{
  min-height: 40px;
  max-height: 40px;
}
.v-list{
  padding: 0;
}
.cls-swipe-left
{
	position:relative;
	animation:mymove 2s 2;
	-webkit-animation:mymove 2s 2;
  opacity:0;
}

@keyframes mymove
{
	from {right:0px;opacity:0;}
	to {right:50px;opacity:1;}
}

@-webkit-keyframes mymove
{
	from {right:0px;opacity:0;}
	to {right:50px;opacity:1;}
}

#btnAddPeople{
  width: 100px;
}
</style>
