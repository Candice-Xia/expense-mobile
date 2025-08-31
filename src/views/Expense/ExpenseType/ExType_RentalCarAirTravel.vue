<!--
include expense types:

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
    <v-text-field
      v-if="!displayIsRefuel"
      v-model="Model.TotalCost"
      label="Total cost"
      counter
      :error-messages="TotalCostError"
      class="Required"
      :readonly="IsReadOnly"
      @input="v$.Model.TotalCost.$touch();onTotalInput();"
      @change="onTotalChanged()"
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
            label="Amount Claimed"
            counter
            :error-messages="AmountClaimedError"
            class="Required"
            :readonly="IsReadOnly||!displayIsRefuel"
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
    <v-subheader class="subtitle">
      Does the cost match your itinerary?
    </v-subheader>
    <v-radio-group
      v-model="Model.IsMatchItinerary"
      class="radiogroup"
      row
      :disabled="IsReadOnly"
    >
      <v-row>
        <v-col
          v-for="yesorno in YesOrNoLst"
          :key="yesorno.ID"
          cols="6"
        >
          <v-radio
            :label="yesorno.Text"
            :value="yesorno.ID"
            @click="SelectIsMatchItinerary(yesorno.ID)"
          />
        </v-col>
      </v-row>
    </v-radio-group>
    <v-textarea
      v-show="isMatchItinerary"
      ref="Explanation"
      v-model="Model.Explanation"
      label="Explanation"
      class="Required"
      counter
      :readonly="IsReadOnly"
      rows="3"
      :error-messages="ExplanationError"
      @input="v$.Model.Explanation.$touch()"
      @blur="v$.Model.Explanation.$touch()"
    />
    <v-text-field
      v-if="!displayIsRefuel"
      v-model="Model.CityDepartingFrom"
      label="City departing from"
      counter
      class="Required"
      :error-messages="CityDepartingFromError"
      :readonly="IsReadOnly"
      @input="v$.Model.CityDepartingFrom.$touch()"
      @blur="v$.Model.CityDepartingFrom.$touch()"
    />
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
    <v-subheader
      v-if="displayIsRefuel"
      class="subtitle"
    >
      Did you refuel the car before returning it?
    </v-subheader>
    <v-radio-group
      v-if="displayIsRefuel"
      v-model="Model.IsRefuel"
      class="radiogroup"
      row
      :disabled="IsReadOnly"
    >
      <v-row>
        <v-col
          v-for="yesorno in YesOrNoLst"
          :key="yesorno.ID"
          cols="6"
        >
          <v-radio
            :label="yesorno.Text"
            :value="yesorno.ID"
            @click="SelectIsRefuel(yesorno.ID)"
          />
        </v-col>
      </v-row>
    </v-radio-group>
    <v-textarea
      v-if="displayIsRefuel"
      v-show="isRefuel"
      ref="Explanation2"
      v-model="Model.Explanation2"
      label="Explanation"
      class="Required"
      counter
      :readonly="IsReadOnly"
      rows="3"
      :error-messages="Explanation2Error"
      @input="v$.Model.Explanation2.$touch()"
      @blur="v$.Model.Explanation2.$touch()"
    />
    <v-text-field
      v-if="displayIsRefuel"
      v-show="isRefuel"
      v-model="Model.TotalFuelCharge"
      label="Total fuel charge billed by agency"
      counter
      class="Required"
      :error-messages="TotalFuelChargeError"
      :readonly="IsReadOnly"
      @input="v$.Model.TotalFuelCharge.$touch();TotalFuelChargeChange();"
      @blur="v$.Model.TotalFuelCharge.$touch()"
      @change="TotalFuelChargeFixed"
    />
    <v-subheader
      v-if="!displayIsRefuel"
      class="subtitle"
    >
      Was any personal travel?
    </v-subheader>
    <v-radio-group
      v-if="!displayIsRefuel"
      v-model="Model.IsPersonalTravel"
      class="radiogroup"
      row
      :disabled="IsReadOnly"
    >
      <v-row>
        <v-col
          v-for="yesorno in YesOrNoLst2"
          :key="yesorno.ID"
          cols="6"
        >
          <v-radio
            :label="yesorno.Text"
            :value="yesorno.ID"
            @click="SelectIsPersonal(yesorno.ID)"
          />
        </v-col>
      </v-row>
    </v-radio-group>
    <v-text-field
      v-if="isPersonalTravel&&!displayIsRefuel"
      v-model="Model.PersonalExpense"
      label="Personal travel amount (local currency)?"
      counter
      class="Required"
      :error-messages="PersonalExpenseError"
      :readonly="IsReadOnly"
      @input="v$.Model.PersonalExpense.$touch();PersonalExpenseChange();"
      @blur="v$.Model.PersonalExpense.$touch()"
      @change="PersonalExpenseFixed"
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
    TotalCost: { 
        required(value){
            if(this.displayIsRefuel) return true;
            return !!value;
        } 
    },
    AmountClaimed: {  
        required(value){
            if(!this.displayIsRefuel) return true;
            return !!value;
        } 
    },
    Explanation: {
        required(value) {
          if (!this.isMatchItinerary) return true;
          return !!value;
        }
      },
    Explanation2: {
        required(value) {
          if (!this.isRefuel) return true;
          return !!value;
        }
      },
    TotalFuelCharge:{
        required(value) {
          if (!this.isRefuel) return true;
          return !!value;
        }
      },
    PersonalExpense:{
        required(value){
            if(!this.isPersonalTravel) return true;
            return !!value;
        }
    },
    CityDepartingFrom:{
        required(value){
            if(this.displayIsRefuel) return true;
            return !!value;
        }
    },
      MealDate: { required },
      CurrencyCountryCode: {
        required(value) {
          if (!this.TravelAbroad) return true;
          return !!value;
        }
      }
    }
  }},
  data: function() {
    return {
      Model: {},
      YesOrNoLst: [],
      YesOrNoLst2:[],
      dialog: false,
      Today: "",
      TravelAbroad: false,
      CurrencyCountryList: [],
      LocalCurrencyMoney: 1,
      TargetCurrencyMoney: 1,
      ExchangeRateText: "1.0000000000",
      isMatchItinerary:false,
      isRefuel:false,
      displayIsRefuel:true,
      IsDisplayComments: true,
      isPersonalTravel:false,
      DescLabel: "",
      CostAmountLabel: "",
      canEditMoney: false,
      isEditMoney: false,
      Claim_Amount_Old: null,
      ExchangeRate_Old: 0,
      ChangeAmountClaimedModel: {},
      LocalCurrencyMoney_Old: null
    };
  },
  computed: {
    msgExchange() {
      return this.Model.CurrencyCountryCode + " Currency";
    },
    msgExchangeTo() {
      return this.Model.MyReport.ClaimCountryCode + " Currency";
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
    CurrencyCountryCodeError() {
      const errors = [];
      if (!this.v$.Model.CurrencyCountryCode.$dirty) return errors;
      this.v$.Model.CurrencyCountryCode.required.$invalid &&
        errors.push("CurrencyCountryCode is required.");
      return errors;
    },
    ExplanationError() {
      const errors = [];
      if (!this.v$.Model.Explanation.$dirty) return errors;
      this.v$.Model.Explanation.required.$invalid &&
        errors.push("Required when your itinerary doesn't match.");
      return errors;
    },
    CityDepartingFromError() {
      const errors = [];
      if (!this.v$.Model.CityDepartingFrom.$dirty) return errors;
      this.v$.Model.CityDepartingFrom.required.$invalid &&
        errors.push("This field is required.");
      return errors;
    },
    Explanation2Error() {
      const errors = [];
      if (!this.v$.Model.Explanation2.$dirty) return errors;
      this.v$.Model.Explanation2.required.$invalid &&
        errors.push("Required when you didn't refuel the car.");
      return errors;
    },
    TotalFuelChargeError(){
      const errors = [];
      if (!this.v$.Model.TotalFuelCharge.$dirty) return errors;
      this.v$.Model.TotalFuelCharge.required.$invalid &&
        errors.push("Required when you didn't refuel the car.");
      return errors;
    },
    PersonalExpenseError(){
      const errors = [];
      if (!this.v$.Model.PersonalExpense.$dirty) return errors;
      this.v$.Model.PersonalExpense.required.$invalid &&
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
  created: function() {
    this.YesOrNoLst.push({ ID: 1, Text: "Yes" });
    this.YesOrNoLst.push({ ID: 2, Text: "No" });
    this.YesOrNoLst2.push({ ID: 3, Text: "Yes" });
    this.YesOrNoLst2.push({ ID: 4, Text: "No" });
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
            response.data.AmountClaimed != 0&&response.data.AmountClaimed != ''
          ) {
            response.data.AmountClaimed = response.data.AmountClaimed.toFixed(
              2
            );
          } else {
            response.data.AmountClaimed = null;
          }
        if (response.data.TotalCost != null && response.data.TotalCost > 0) {
            response.data.TotalCost = response.data.TotalCost.toFixed(2);
        } else {
            response.data.TotalCost = null;
        }
          this.Model = response.data;
          if (this.Model.ExchangeRate > 0 &&this.Model.AmountClaimed!=0) {
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
            this.Model.TotalCost=tools.formatAmount(this.Model.TotalCost);
            this.LocalCurrencyMoney=tools.formatAmount(this.LocalCurrencyMoney);
            this.TargetCurrencyMoney=tools.formatAmount(this.TargetCurrencyMoney);
          }
          if (this.Model.ExpenseItemID == 0) {
            this.Model.TotalCost = null;
            this.Model.AmountClaimed = null;
            this.Model.MealDate = null;
            this.Model.ExchangeRate = 1;
            this.Model.Subledger = this.Model.MyReport.Subledger;
            this.Model.IsMatchItinerary=1;
            this.Model.IsRefuel=1;
            this.Model.TotalFuelCharge=null;
            this.Model.IsPersonalTravel=4;
          }else{
              if(this.Model.IsMatchItinerary==2){
                this.isMatchItinerary=true;
              }
              if(this.Model.IsRefuel==2){
                this.isRefuel=true;
              }
              if(this.Model.IsPersonalTravel==3){
                  this.isPersonalTravel=true;
                  if(this.Model.PersonalExpense!=null&&this.Model.PersonalExpense!=0&&this.Model.PersonalExpense!=''){
                      this.Model.PersonalExpense=tools.formatAmount(this.Model.PersonalExpense);
                  }
              }
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
      if (this.expenseTypeID == 2) {
        this.displayIsRefuel = false;
      }
    },
    onTotalInput() {
      if (this.Model.TotalCost != null && this.Model.TotalCost !='') {
        this.Model.TotalCost=parseFloat(tools.clearNoNum(this.Model.TotalCost));
        var personal=0;
        if(this.Model.PersonalExpense!=''&&this.Model.PersonalExpense!=null){
            personal=parseFloat(tools.clearNoNum(this.Model.PersonalExpense));
        }
        this.Model.AmountClaimed =tools.formatAmount(this.Model.TotalCost-personal);
        if(this.Model.TotalCost>0){
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
    onTotalChanged(){
        if (this.Model.TotalCost != null && this.Model.TotalCost !='') {
            if(parseFloat(tools.clearNoNum(this.Model.TotalCost))>0){
             this.Model.TotalCost=tools.formatAmount(this.Model.TotalCost);
            }else this.Model.TotalCost=null;

        }else this.Model.TotalCost=null;
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
          var personal=0;
          if(this.Model.PersonalExpense!=''&&this.Model.PersonalExpense!=null){
            personal=parseFloat(tools.clearNoNum(this.Model.PersonalExpense));
          }
          var amountClaimed=this.LocalCurrencyMoney-personal;
          if(amountClaimed!=0)
            this.Model.AmountClaimed =tools.formatAmount(amountClaimed);
          else
            this.Model.AmountClaimed=null;
          this.Model.TotalCost =tools.formatAmount(this.LocalCurrencyMoney);
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
    TotalFuelChargeChange(){
      if(this.Model.TotalFuelCharge!=null && this.Model.TotalFuelCharge!=''){
        this.Model.TotalFuelCharge=tools.clearNoNum(this.Model.TotalFuelCharge);
      }else
        this.Model.TotalFuelCharge=null;
    },
    TotalFuelChargeFixed(){
      if(this.Model.TotalFuelCharge!=null && this.Model.TotalFuelCharge!=''){
        if(parseFloat(this.Model.TotalFuelCharge)>0)
            this.Model.TotalFuelCharge=tools.formatAmount(this.Model.TotalFuelCharge);
        else
            this.Model.TotalFuelCharge=null;
      }else
        this.Model.TotalFuelCharge=null;        
    },
    PersonalExpenseChange(){
      if(this.Model.PersonalExpense!=null && this.Model.PersonalExpense!=''){
        this.Model.PersonalExpense=tools.clearNoNum(this.Model.PersonalExpense);
      }else
        this.Model.PersonalExpense=null;
    },
    PersonalExpenseFixed(){
      if(this.Model.PersonalExpense!=null && this.Model.PersonalExpense!=''){
        if(parseFloat(this.Model.PersonalExpense)>0){
            this.Model.AmountClaimed=parseFloat(tools.clearNoNum(this.Model.TotalCost))-parseFloat(this.Model.PersonalExpense);
            this.Model.PersonalExpense=tools.formatAmount(this.Model.PersonalExpense);
            this.Model.AmountClaimed=tools.formatAmount(this.Model.AmountClaimed);
        }
        else
            this.Model.PersonalExpense=null;
      }else
        this.Model.PersonalExpense=null;        
    },
    SelectIsMatchItinerary(id){
        this.Model.IsMatchItinerary=id;
        if(id==2)
            this.isMatchItinerary=true;
        else
            this.isMatchItinerary=false;
    },
    SelectIsRefuel(id){
        this.Model.IsRefuel=id;
        if(id==2)
            this.isRefuel=true;
        else
            this.isRefuel=false;
    },
    SelectIsPersonal(id){
        this.Model.IsPersonalTravel=id;
        if(id==3){
            this.isPersonalTravel=true;
            this.PersonalExpenseChange();
            this.PersonalExpenseFixed();
        }
        else
            this.isPersonalTravel=false;
    },
    FormatSubledger(){
      if(this.Model.Subledger!=null && this.Model.Subledger!=''){
        this.Model.Subledger=tools.PositiveInt(this.Model.Subledger);
      }else{
        this.Model.Subledger=null;
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
      if(this.Model.TotalFuelCharge!=null && this.Model.TotalFuelCharge!='')
        this.Model.TotalFuelCharge=tools.clearNoNum(this.Model.TotalFuelCharge);
      if(this.Model.TotalCost!=null && this.Model.TotalCost!='')
        this.Model.TotalCost=tools.clearNoNum(this.Model.TotalCost);
      if(this.Model.PersonalExpense!=null && this.Model.PersonalExpense!='')
        this.Model.PersonalExpense=tools.clearNoNum(this.Model.PersonalExpense);
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
