<!--
include expense types:
    18 Taxi/Shuttle/Train/Bus/Toll, 
    14 Parking
    22 Travel Other (not listed) 
    9  Rental Car Gas
    26 Office Supplies/Exp.
    15 Phone
    8 Exchange Currency Fees
    135 R & D Project Material
    27 Internet Service
    101	Rental Car Gas
    112	Other (not listed)
    115	Office Supplies/Exp.
    148	All Other Supplies
    149	Equipment Rental
    150	Small Furn & Fixtures
    151	Maintenance Contract
    152	Freight Out
    153	Security Expense
    154	License & Permit Fee
    155	Small Tools/Equip
    156	Warehouse Supplies
    157	Repair & Maintenance
    158	Repair & Maintenance-Building
    159	Janitorial/Cleaning
    169	Auto Expenses
    171	Recruiting
    177	Legal Fees
    144	Other Marketing Expense
    160	Creative/Messaging Agency-Memory
    162	Creative/Messaging Agency-HyperX
    163	Creative/Messaging Agency-Other
    164	Marketing Research-Other
    168	Creative/Messaging Agency - HX Perip.
    170	Media Advertising
    173	Channel Ads
-->
<template>
  <v-form>
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
    <v-card
      v-if="Model.ShowExchangeRate&&DisplayCurrencyCountry"
      class="mb-4"
    >
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
            :label="CostAmountLabel"
            counter
            :error-messages="AmountClaimedError"
            class="Required"
            :readonly="IsReadOnly"
            @input="v$.Model.AmountClaimed.$touch();AmountClaimedChange();"
            @blur="v$.Model.AmountClaimed.$touch()"
            @change="AmountClaimedtoFixed"
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
          label="Date"
          class="Required"
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
      v-if="IsDisplayProjectNumber"
      v-model="Model.ProjectNumber"
      label="Project number"
      counter
      :class="IsDisplayProjectNumber?'Required':''"
      :readonly="IsReadOnly"
      :error-messages="ProjectNumberError"
      @input="v$.Model.ProjectNumber.$touch()"
      @blur="v$.Model.ProjectNumber.$touch()"
    />
    <v-text-field
      v-if="IsDisplayDesc"
      v-model="Model.Describe"
      :label="DescLabel"
      counter
      :class="IsDisplayDesc?'Required':''"
      :error-messages="DescError"
      :readonly="IsReadOnly"
      @input="v$.Model.Describe.$touch()"
      @blur="v$.Model.Describe.$touch()"
    />
    <v-text-field
      v-if="IsDisplayVendor"
      v-model="Model.Vendor"
      label="Vendor"
      counter
      class="Required"
      :error-messages="VendorError"
      :readonly="IsReadOnly"
      @input="v$.Model.Vendor.$touch()"
      @blur="v$.Model.Vendor.$touch()"
    />
    <v-textarea
      v-if="IsDisplayComments"
      v-model="Model.Comment"
      label="Comments (max. 200 characters)"
      counter
      rows="3"
      :readonly="IsReadOnly"
    />
    <v-text-field
      v-model="Model.Subledger"
      label="Subledger"
      counter
      :readonly="IsReadOnly"
      @input="FormatSubledger"
      @change="FormatSubledger"
    />
    <v-text-field
      v-if="IsDisplayMBCNO"
      v-model="Model.MBCNo"
      label="MBC #"
      counter
      :readonly="IsReadOnly"
      @change="FormatMBCNO"
      @input="FormatMBCNO"
    />
  </v-form>
</template>
<script>
import tools from "../../../plugins/tools";
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Vue from "vue";
import nowDate from "../../../Scripts/GetToday";
import ChangeAmountExRate from "../../../components/ChangeAmountExRate";

export default {
  name: "ExTypeMultiItem",
  components: {
    ChangeAmountExRate
  },
  props: {
    expenseTypeID: Number,
    IsReadOnly: Boolean,
    expenseReportID: Number,
    expenseItemID: Number,
    costCenterID: Number,
    IsReview: Boolean
  },
  setup() {
    return { v$: useVuelidate() }
  },
  validations(){ 
  return {
    Model: {
      AmountClaimed: { required },
      Vendor: {
        required(value) {
          if (!this.IsDisplayVendor) return true;
          return !!value;
        }
      },
      MealDate: { required },
      Describe: {
        required(value) {
          if (!this.IsDisplayDesc) return true;
          return !!value;
        }
      },
      CurrencyCountryCode: {
        required(value) {
          if (!this.TravelAbroad) return true;
          return !!value;
        }
      },
      ProjectNumber: {
        required(value) {
          if (!this.IsDisplayProjectNumber) return true;
          return !!value;
        }
      }
    }
  }},
  data: function() {
    return {
      Model: {},
      dialog: false,
      Today: "",
      TravelAbroad: false,
      CurrencyCountryList: [],
      LocalCurrencyMoney: 1,
      TargetCurrencyMoney: 1,
      ExchangeRateText: "1.0000000000",
      IsDisplayVendor: true,
      IsDisplayComments: true,
      IsDisplayDesc: false,
      IsDisplayProjectNumber: false,
      DescLabel: "",
      CostAmountLabel: "",
      canEditMoney: false,
      isEditMoney: false,
      Claim_Amount_Old: null,
      ExchangeRate_Old: 0,
      ChangeAmountClaimedModel: {},
      LocalCurrencyMoney_Old: null,
      IsDisplayMBCNO:false
    };
  },
  computed: {
    msgExchange() {
      return this.Model.CurrencyCountryCode + " Currency";
    },
    msgExchangeTo() {
      return this.Model.MyReport.ClaimCountryCode + " Currency";
    },
    AmountClaimedError() {
      const errors = [];
      if (!this.v$.Model.AmountClaimed.$dirty) return errors;
      this.v$.Model.AmountClaimed.required.$invalid &&
        errors.push("Amount Claimed is required.");
      return errors;
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
    MealDateError() {
      const errors = [];
      if (!this.v$.Model.MealDate.$dirty) return errors;
      this.v$.Model.MealDate.required.$invalid && errors.push("Date is required.");
      return errors;
    },
    DescError() {
      var errorMsg = "Description is required.";
      if (this.expenseTypeID == 18) {
        errorMsg = "Describe is required.";
      }
      const errors = [];
      if (!this.v$.Model.Describe.$dirty) return errors;
      this.v$.Model.Describe.required.$invalid && errors.push(errorMsg);
      return errors;
    },
    VendorError() {
      const errors = [];
      if (!this.v$.Model.Vendor.$dirty) return errors;
      this.v$.Model.Vendor.required.$invalid && errors.push("Vendor is required.");
      return errors;
    },
    CurrencyCountryCodeError() {
      const errors = [];
      if (!this.v$.Model.CurrencyCountryCode.$dirty) return errors;
      this.v$.Model.CurrencyCountryCode.required.$invalid &&
        errors.push("CurrencyCountryCode is required.");
      return errors;
    },
    ProjectNumberError() {
      const errors = [];
      if (!this.v$.Model.ProjectNumber.$dirty) return errors;
      this.v$.Model.ProjectNumber.required.$invalid &&
        errors.push("Project number is required.");
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
  created: function() {
    this.resetExchange();

    this.LocalCurrencyMoney = parseFloat(this.LocalCurrencyMoney).toFixed(2);
    this.TargetCurrencyMoney = parseFloat(this.TargetCurrencyMoney).toFixed(2);

    this.Today = nowDate;

    this.DisplayHideFiledsByExpenseType();

    this.LoadDataList();
    this.$axios
      .get("/ExpenseReport/GetCountries", {
        params: {
          expenseReportID: this.expenseReportID
        }
      })
      .then(response => {
        if (this.CurrencyCountryList.length > 0) {
          this.CurrencyCountryList.splice(0, this.CurrencyCountryList.length);
        }
        response.data.forEach(item => {
          this.CurrencyCountryList.push({
            text: item.Text,
            value: item.Key
          });
        });
      });
  },
  methods: {
    LoadDataList() {
      var url =
        this.expenseItemID > 0
          ? "/MultiItems/GetItem"
          : "/MultiItems/CreateNewItem";
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
            response.data.AmountClaimed = response.data.AmountClaimed.toFixed(
              2
            );
          } else {
            response.data.AmountClaimed = null;
          }
          this.Model = response.data;
          if (this.Model.ExchangeRate > 0) {
            this.ExchangeRate_Old = this.Model.ExchangeRate;
            this.Claim_Amount_Old = (
              this.Model.AmountClaimed * this.ExchangeRate_Old
            ).toFixed(2);

            this.LocalCurrencyMoney = this.Model.AmountClaimed;
            this.TargetCurrencyMoney = (
              this.LocalCurrencyMoney * this.Model.ExchangeRate
            ).toFixed(2);
            this.ExchangeRateText = this.Model.ExchangeRate.toFixed(10);
            this.LocalCurrencyMoney_Old = this.LocalCurrencyMoney;
            this.Model.AmountClaimed=tools.formatAmount(this.Model.AmountClaimed);
            this.LocalCurrencyMoney=tools.formatAmount(this.LocalCurrencyMoney);
            this.TargetCurrencyMoney=tools.formatAmount(this.TargetCurrencyMoney);
          }
          if (this.Model.ExpenseItemID == 0) {
            this.Model.AmountClaimed = null;
            this.Model.MealDate = null;
            this.Model.ExchangeRate = 1;
            this.Model.Describe = null;
            this.Model.Subledger = this.Model.MyReport.Subledger;
          }
          this.$emit("loadExpenseItem", this.Model.ExpenseItem);
          this.TravelAbroad = this.Model.MyReport.TravelAbroad;
          console.log(response);
        })
        .catch(error => {
          console.log(error);
        });
    },
    DisplayHideFiledsByExpenseType() {
      var expensetypes=[22,112,26,115,135,27,143,148,149,150,151,152,153,154,155,156,157,158,159,169,171,177,144,160,162,163,164,168,170,173];
      if (this.expenseTypeID == 18) {
          this.IsDisplayDesc = true;
          this.DescLabel = "Describe";
      }else if(expensetypes.indexOf(this.expenseTypeID)!=-1){
          this.IsDisplayDesc = true;
          this.DescLabel = "Description";
      }
      var displayMBCNOTypes=[144,160,162,163,164,168,170,173];
      if(displayMBCNOTypes.indexOf(this.expenseTypeID)!=-1){
        this.IsDisplayMBCNO=true;
      }
      this.CostAmountLabel = "Amount claimed (local currency)";
      if (
        this.expenseTypeID == 9 ||
        this.expenseTypeID == 101 ||
        this.expenseTypeID == 26 ||
        this.expenseTypeID == 115 ||
        this.expenseTypeID == 8
      ) {
        this.CostAmountLabel = "Total Cost";
      }
      if (this.expenseTypeID == 9||this.expenseTypeID == 101) {
        this.IsDisplayComments = false;
      }
      if (this.expenseTypeID == 15 || this.expenseTypeID == 8) {
        this.IsDisplayVendor = false;
      }
      if (this.expenseTypeID == 135) {
        this.IsDisplayProjectNumber = true;
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
            this.LocalCurrencyMoney =parseFloat(this.Model.AmountClaimed).toFixed(2);
            this.TargetCurrencyMoney = (
              this.LocalCurrencyMoney * this.Model.ExchangeRate
            ).toFixed(2);
            this.LocalCurrencyMoney =tools.formatAmount(this.LocalCurrencyMoney);
            this.TargetCurrencyMoney =tools.formatAmount(this.TargetCurrencyMoney);
          }
        }else{
          this.Model.AmountClaimed=null;
        }
      }else
        this.Model.AmountClaimed=null;
    },
    AmountClaimedtoFixed() {
      if (this.Model.AmountClaimed != null && this.Model.AmountClaimed !='') {
        this.Model.AmountClaimed =parseFloat(tools.clearNoNum(this.Model.AmountClaimed));
        if(this.Model.AmountClaimed<=0){
          this.Model.AmountClaimed=null;
        }else{
          if (this.Model.ShowExchangeRate) {
            this.LocalCurrencyMoney = this.Model.AmountClaimed;
            this.TargetCurrencyMoney = (
              this.LocalCurrencyMoney * this.Model.ExchangeRate
            ).toFixed(2);
            this.LocalCurrencyMoney =tools.formatAmount(this.LocalCurrencyMoney);
            this.TargetCurrencyMoney =tools.formatAmount(this.TargetCurrencyMoney);
          }
          this.Model.AmountClaimed =tools.formatAmount(this.Model.AmountClaimed);
        }
      } else {
        this.Model.AmountClaimed = null;
      }
    },
    resetExchange() {
      this.LocalCurrencyMoney = 1;
      this.TargetCurrencyMoney = 1;
      this.Model.ExchangeRate = 1;
      this.LocalCurrencyMoney = this.LocalCurrencyMoney.toFixed(2);
      this.TargetCurrencyMoney = this.TargetCurrencyMoney.toFixed(2);
      this.ExchangeRateText = this.Model.ExchangeRate.toFixed(10);
    },
    onChangeCurrencyCode() {
      this.Model.ShowExchangeRate = !(
        this.Model.CurrencyCountryCode == this.Model.MyReport.ClaimCountryCode
      );
      if (!this.Model.ShowExchangeRate) this.resetExchange();
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
      }
       else this.resetExchange();
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
      this.ChangeAmountClaimedModel.Amount_QuestionID = 1;
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
    FormatSubledger(){
      if(this.Model.Subledger!=null && this.Model.Subledger!=''){
        this.Model.Subledger=tools.PositiveInt(this.Model.Subledger);
      }else{
        this.Model.Subledger=null;
      }
    },
    FormatMBCNO(){
      if(this.Model.MBCNo!=null && this.Model.MBCNo!=''){
        this.Model.MBCNo=tools.PositiveInt(this.Model.MBCNo);
      }else{
        this.Model.MBCNo=null;
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
      if(this.Model.AmountClaimed!=null && this.Model.AmountClaimed!='')
        this.Model.AmountClaimed=tools.clearNoNum(this.Model.AmountClaimed);
      this.$axios
        .post("/MultiItems/SaveItem", this.Model)
        .then(response => {
          if (response.data.ExpenseItemID > 0) {
            tools.alert("Save Successfully.");
            goback(true, response.data, this.Model.ExpenseItemID > 0);
          } else {
            updateIsDisabledBtn(false);
            tools.alert("Failed to save!", 2000, 'error', false);
          }
        })
        .catch(error => {
          updateIsDisabledBtn(false);
          tools.alert(error, 2000, 'error', false);
          console.log(error);
        });
    }
  }
};
</script>
<style>
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
.icon-position {
  margin-left: 25%;
}
</style>
