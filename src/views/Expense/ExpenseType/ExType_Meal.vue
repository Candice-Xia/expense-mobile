<template>
  <v-form>
    <v-select
      v-if="DisplayCurrencyCountry"
      v-model="Model.CurrencyCountryCode"
      :items="CurrencyCountryList"
      :menu-props="{ maxHeight: '400' }"
      item-title="text"
      item-value="value"
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
    <v-subheader
      v-if="Model.ShowCityLevel"
      class="subtitle"
    >
      Select Major or Minor city
    </v-subheader>
    <v-radio-group
      v-if="Model.ShowCityLevel"
      v-model="Model.CityLevel"
      class="radiogroup"
      row
      :disabled="IsReadOnly"
      @change="onPerAmountChanged()"
    >
      <v-row>
        <v-col
          v-for="clitem in CityLevelLst"
          :key="clitem.ID"
          cols="6"
        >
          <v-radio
            :label="clitem.Text"
            :value="clitem.ID"
          />
        </v-col>
      </v-row>
    </v-radio-group>
    <v-text-field
      v-model.number="Model.MealNumber"
      label="Number of Kingston employees"
      class="Required"
      counter
      type="number"
      :readonly="IsReadOnly"
      :error-messages="MealNumberError"
      @change="onPerAmountChanged()"
      @input="v$.Model.MealNumber.$touch()"
      @blur="v$.Model.MealNumber.$touch()"
    />
    <v-text-field
      v-if="Model.MealNumber>1"
      v-model="Model.MealPersonNames"
      label="Name of Kingston employees"
      counter
      :readonly="IsReadOnly"
    />
    <v-textarea
      v-show="Model.ExplannationLabel"
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
      v-model="Model.Vendor"
      label="Vendor"
      class="Required"
      counter
      :readonly="IsReadOnly"
      :error-messages="VendorError"
      @input="v$.Model.Vendor.$touch()"
      @blur="v$.Model.Vendor.$touch()"
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
          class="Required"
          label="Date of meal"
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
            CLOSE
          </v-btn>
          <v-spacer />
        </template>
      </v-date-picker>
    </v-menu>
    <v-select
      v-model="Model.MealReason"
      label="Reason for Meal"
      class="Required"
      item-title="text"
      item-value="value"
      :items="ReasonforMealLst"
      :readonly="IsReadOnly"
      :error-messages="MealReasonError"
      @input="v$.Model.MealReason.$touch()"
      @blur="v$.Model.MealReason.$touch()"
    />
    <v-textarea
      v-model="Model.DiscussionTopic"
      label="Purpose/Topic of Discussion"
      :class="Model.MealReason != 6 && Model.MealReason != 7?'':'Required'"
      counter
      :readonly="IsReadOnly"
      rows="3"
      :error-messages="DiscussionTopicError"
      @input="v$.Model.DiscussionTopic.$touch()"
      @blur="v$.Model.DiscussionTopic.$touch()"
    />
    <v-text-field
      v-model="Model.Subledger"
      label="Subledger"
      counter
      :readonly="IsReadOnly"
      @change="FormatSubledger"
      @input="FormatSubledger"
    />
  </v-form>
</template>
<script>
import tools from "../../../plugins/tools";
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import Vue from "vue";
import nowDate from "../../../Scripts/GetToday";
import ChangeAmountExRate from "../../../components/ChangeAmountExRate";

export default {
  name: "ExTypeLunch",
  components: {
    ChangeAmountExRate
  },
  props: {
    expenseTypeID: Number,
    IsReadOnly: Boolean,
    expenseReportID: Number,
    expenseItemID: Number,
    costCenterID: Number
  },
  setup() {
    return { v$: useVuelidate() }
  },
  validations() {
    return {
      Model: {
        TotalCost: { required },
        AmountClaimed: { required },
        Vendor: { required },
        MealDate: { required },
        MealNumber: {
          required(value) {
            if (value != "") {
              if (/[^\d]/g.test(value)) {
                return false;
              }
              return true;
            } else return false;
          }
        },
        MealReason: {
          required(value) {
            return !!value;
          }
        },
        Explanation: {
          required(value) {
            if (!this.Model.ExplannationLabel) return true;
            return !!value;
          }
        },
        DiscussionTopic: {
          required(value) {
            if (this.Model.MealReason != 6 && this.Model.MealReason != 7)
              return true;
            return !!value;
          }
        },
        CurrencyCountryCode: {
          required(value) {
            if (!this.TravelAbroad) return true;
            return !!value;
          }
        }
      }
    };
  },
  data: function() {
    return {
      Model: {},
      dialog: false,
      ReasonforMealLst: [],
      CityLevelLst: [],
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
    MealNumberError() {
      const errors = [];
      if (!this.v$.Model.MealNumber.$dirty) return errors;
      this.v$.Model.MealNumber.required.$invalid &&
        errors.push("Number of Kingston employees must be positive integer.");
      return errors;
    },    
    MealReasonError() {
      const errors = [];
      if (!this.v$.Model.MealReason.$dirty) return errors;
      this.v$.Model.MealReason.required.$invalid &&
        errors.push("Reason for Meal is required.");
      return errors;
    },    
    ExplanationError() {
      const errors = [];
      if (!this.v$.Model.Explanation.$dirty) return errors;
      this.v$.Model.Explanation.required.$invalid &&
        errors.push(this.Model.ExplannationLabel);
      return errors;
    },    
    DiscussionTopicError() {
      const errors = [];
      if (!this.v$.Model.DiscussionTopic.$dirty) return errors;
      this.v$.Model.DiscussionTopic.required.$invalid &&
        errors.push("Purpose/Topic of Discussion is required.");
      return errors;
    },    
    CurrencyCountryCodeError() {
      const errors = [];
      if (!this.v$.Model.CurrencyCountryCode.$dirty) return errors;
      this.v$.Model.CurrencyCountryCode.required.$invalid &&
        errors.push("CurrencyCountryCode is required.");
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

    this.Today = nowDate;
    this.LocalCurrencyMoney = parseFloat(this.LocalCurrencyMoney).toFixed(2);
    this.TargetCurrencyMoney = parseFloat(this.TargetCurrencyMoney).toFixed(2);
    tools.getReasonForMeal(result => {
      this.ReasonforMealLst = result;
    });

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
    tools.getCityType(value => {
      if (this.CityLevelLst.length > 0) {
        this.CityLevelLst.splice(0, this.CityLevelLst.length);
      }
      this.CityLevelLst = value;
    });

    var url = this.expenseItemID > 0 ? "/Meal/GetMeal" : "/Meal/CreateNewMeal";
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
        if (this.Model.ExpenseItemID == 0) {
          this.Model.TotalCost = null;
          this.Model.AmountClaimed = null;
          this.Model.MealNumber = null;
          this.Model.MealDate = null;
          this.Model.ExchangeRate = 1;
        }
        if(this.Model.MealReason===0)
          this.Model.MealReason = null;
        this.$emit("loadExpenseItem", this.Model.ExpenseItem);
        this.TravelAbroad = this.Model.MyReport.TravelAbroad;
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  },
  methods: {
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
      if (this.Model.TotalCost && this.Model.MealNumber) {
        this.$axios
          .post("/Meal/GetExplation", this.Model)
          .then(response => {
            this.Model.ExplannationLabel = response.data.ExplannationLabel;
            this.Model.ShowExplanation = response.data.ShowExplanation;
            console.log(response);
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
          })
          .catch(error => {
            console.log(error);
          });
      }else{
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
      this.$axios
        .post("/Meal/SaveMeal", this.Model)
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