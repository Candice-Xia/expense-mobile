<!--
include expense types:
    12	Mileage
    25	Runzheimer Rate
-->
<template>
  <v-form>
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
    <v-card>
      <v-row class="row-margin">
        <v-col class="card-background">
          <v-subheader class="subtitle">
            <span>If applicable select one</span>
          </v-subheader>
          <v-radio-group
            v-model="SelectedOriginDestMiles"
            class="radiogroup"
            column
          >
            <v-row>
              <v-col
                v-for="originDestMiles in OriginDestMilesLst"
                :key="originDestMiles.ID"
                cols="12"
              >
                <v-radio
                  :label="originDestMiles.Text"
                  :value="originDestMiles.ID"
                  @click="FillOriginDestMiles(originDestMiles.ID)"
                />
              </v-col>
            </v-row>
          </v-radio-group>
          <v-radio-group 
            v-if="!IsDisplayRunzheimerRate"
            v-model="SelectedOneWayOrRoundTrip"
            class="radiogroup2 ml-8"
            row
          >
            <v-row>
              <v-col
                v-for="oneWayOrRoundTrip in OneWayOrRoundTripLst"
                :key="oneWayOrRoundTrip.ID"
                cols="6"
              >
                <v-radio 
                  :label="oneWayOrRoundTrip.Text"
                  :value="oneWayOrRoundTrip.ID"
                  @click="CalcOriginDestMiles(oneWayOrRoundTrip.ID)"
                />
              </v-col>
            </v-row>
          </v-radio-group>
        </v-col>
      </v-row>
    </v-card>
    <v-text-field 
      v-model="Model.Origin" 
      label="Origin"
      class="Required"
      :readonly="IsReadOnly"
      counter
      :error-messages="OriginError"
      @input="v$.Model.Origin.$touch()"
      @blur="v$.Model.Origin.$touch()"
    />
    <v-text-field 
      v-model="Model.Dest" 
      label="Where did you go?"
      class="Required"
      :readonly="IsReadOnly"
      counter
      :error-messages="DestError"
      @input="v$.Model.Dest.$touch()"
      @blur="v$.Model.Dest.$touch()"
    />
    <v-text-field 
      v-model="Model.NumberOfMiles" 
      label="Number of miles"
      class="Required"
      :readonly="IsReadOnly"
      counter
      :error-messages="NumberOfMilesError"
      @input="v$.Model.NumberOfMiles.$touch();iptNumberOfMiles();"
      @blur="v$.Model.NumberOfMiles.$touch()"
      @change="changeNumberOfMiles"
    />
    <v-text-field 
      v-if="IsDisplayRunzheimerRate"
      v-model="Model.RunzheimerRate" 
      label="Runzheimer Rate (US Sales Only)"
      :class="IsDisplayRunzheimerRate?'Required':''"
      :readonly="IsReadOnly"
      counter
      :error-messages="RunzheimerRateError"
      @input="v$.Model.RunzheimerRate.$touch();iptRunzheimerRate();"
      @blur="v$.Model.RunzheimerRate.$touch()"
      @change="changeRunzheimerRate"
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
            :readonly="true"
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
    <v-textarea
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
  </v-form>
</template>
<script>
import tools from "../../../plugins/tools";
import { useVuelidate } from '@vuelidate/core';
import { required } from "@vuelidate/validators";
import nowDate from "../../../Scripts/GetToday";
import ChangeAmountExRate from "../../../components/ChangeAmountExRate";

export default {
  name: "ExTypeMileageRunzheimerRate",
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
  return  {
    Model: {
      MealDate: { required },
      AmountClaimed: { required },
      Origin: { required },
      Dest: { required },
      NumberOfMiles: { required },
      RunzheimerRate: { 
        required(value) {
          if (!this.IsDisplayRunzheimerRate) return true;
          else if(parseFloat(value)<=0 || parseFloat(value)>=1) return false;
          return !!value;
        }
       },
    }
  }},
  data: function() {
    return {
      Model: {},
      dialog: false,
      Today: "",
      TravelAbroad: false,
      LocalCurrencyMoney: 1,
      TargetCurrencyMoney: 1,
      ExchangeRateText: "1.0000000000",
      DescLabel: "",
      CostAmountLabel: "",
      canEditMoney: false,
      isEditMoney: false,
      Claim_Amount_Old: null,
      ExchangeRate_Old: 0,
      ChangeAmountClaimedModel: {},
      LocalCurrencyMoney_Old: null,
      OriginDestMilesLst:[],
      OneWayOrRoundTripLst:[],
      SelectedOriginDestMiles:null,
      SelectedOneWayOrRoundTrip:null,
      IsDisplayRunzheimerRate:false,
      LngRate:0,
      OriginNumberOfMiles:0
    };
  },
  computed: {
    OriginError() {
      const errors = [];
      if (!this.v$.Model.Origin.$dirty) return errors;
      this.v$.Model.Origin.required.$invalid &&
        errors.push("Origin is required.");
      return errors;
    },
    DestError() {
      const errors = [];
      if (!this.v$.Model.Dest.$dirty) return errors;
      this.v$.Model.Dest.required.$invalid &&
        errors.push("Where did you go is required.");
      return errors;
    },
    NumberOfMilesError() {
      const errors = [];
      if (!this.v$.Model.NumberOfMiles.$dirty) return errors;
      this.v$.Model.NumberOfMiles.required.$invalid &&
        errors.push("Number of miles is required.");
      return errors;
    },
    RunzheimerRateError() {
      const errors = [];
      if (!this.v$.Model.RunzheimerRate.$dirty) return errors;
      this.v$.Model.RunzheimerRate.required.$invalid &&
        errors.push("This field is required. (0 < Runzheimer Rate < 1)");
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
    }
  },
  created: function() {
    this.OriginDestMilesLst.push({ ID: 1, Text: "Office to Orange County airport (7 miles)\xa0\xa0\xa0" });
    this.OriginDestMilesLst.push({ ID: 2, Text: "Office to Long Beach airport (17 miles)" });
    this.OriginDestMilesLst.push({ ID: 3, Text: "Office to LAX (37 miles)" });

    this.OneWayOrRoundTripLst.push({ID:1,Text:"One Way"});
    this.OneWayOrRoundTripLst.push({ID:2,Text:"Round Trip"});

    this.resetExchange();

    this.LocalCurrencyMoney = parseFloat(this.LocalCurrencyMoney).toFixed(2);
    this.TargetCurrencyMoney = parseFloat(this.TargetCurrencyMoney).toFixed(2);

    this.Today = nowDate;

    this.DisplayHideFiledsByExpenseType();

    this.LoadDataList();
  },
  methods: {
    FillOriginDestMiles(id){
        console.log(id);
        this.SelectedOriginDestMiles=id;
        this.Model.Origin="Office";
        if(id==1){
            this.Model.Dest="Orange County Airport";
            this.Model.NumberOfMiles=7;
        }
        else if(id==2){
            this.Model.Dest="Long Beach Airport";
            this.Model.NumberOfMiles=17;
        }
        else if(id==3){
            this.Model.Dest="LAX";
            this.Model.NumberOfMiles=37;
        }
        this.OriginNumberOfMiles=this.Model.NumberOfMiles;
        var oneWayOrRoundTrip=1;
        if(this.SelectedOneWayOrRoundTrip!=null&&parseInt(this.SelectedOneWayOrRoundTrip)>0){
           oneWayOrRoundTrip=this.SelectedOneWayOrRoundTrip;
           this.Model.NumberOfMiles=this.Model.NumberOfMiles*oneWayOrRoundTrip;
        }
        if(this.LngRate!=null&&this.LngRate!=''&&parseFloat(this.LngRate)>0){
            this.Model.AmountClaimed=tools.formatAmount(this.LngRate*this.Model.NumberOfMiles);
        }
        this.Model.NumberOfMiles=tools.formatAmount(this.Model.NumberOfMiles);
    },
    CalcOriginDestMiles(id){
        if(this.Model.NumberOfMiles!=null&&this.Model.NumberOfMiles!=''&&parseFloat(this.Model.NumberOfMiles)>0){
            if(id==1){
                this.Model.NumberOfMiles=this.OriginNumberOfMiles;
            }
            else if(id==2){
                this.Model.NumberOfMiles=this.OriginNumberOfMiles*2;
            }
            this.Model.AmountClaimed=tools.formatAmount(this.Model.NumberOfMiles*this.LngRate)
            this.Model.NumberOfMiles=tools.formatAmount(this.Model.NumberOfMiles);
        }
        this.SelectedOneWayOrRoundTrip=id;
    },
    iptNumberOfMiles(){
        if(this.Model.NumberOfMiles!=null&&this.Model.NumberOfMiles!=''&&parseFloat(this.Model.NumberOfMiles)>0)
        {
            this.Model.NumberOfMiles=tools.clearNoNum(this.Model.NumberOfMiles);
        }
    },
    changeNumberOfMiles(){
        if(this.Model.NumberOfMiles!=null&&this.Model.NumberOfMiles!=''&&parseFloat(this.Model.NumberOfMiles)>0)
        {
          if(this.LngRate>0){
            this.Model.AmountClaimed=tools.formatAmount(parseFloat(this.Model.NumberOfMiles)*this.LngRate);
          }
            this.OriginNumberOfMiles=parseFloat(this.Model.NumberOfMiles);
        }else this.Model.NumberOfMiles=null;
    },
    iptRunzheimerRate(){
        if(this.Model.RunzheimerRate!=null&&this.Model.RunzheimerRate!=''&&parseFloat(this.Model.RunzheimerRate)>0)
        {
            this.Model.RunzheimerRate=tools.clearNoNum(this.Model.RunzheimerRate);
        }
    },
    changeRunzheimerRate(){
        if(this.Model.RunzheimerRate!=null&&this.Model.RunzheimerRate!=''&&parseFloat(this.Model.RunzheimerRate)>0&&parseFloat(this.Model.RunzheimerRate)<1)
        {
            this.Model.RunzheimerRate=tools.clearNoNum(this.Model.RunzheimerRate);
            this.LngRate=parseFloat(this.Model.RunzheimerRate);
            if(this.Model.NumberOfMiles!=null && this.Model.NumberOfMiles!=''){
              this.Model.AmountClaimed=tools.formatAmount(parseFloat(tools.clearNoNum(this.Model.NumberOfMiles))*this.LngRate);
            }
        }else this.Model.RunzheimerRate=null;
    },
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
          if(this.Model.AmountClaimed!=null &&this.Model.AmountClaimed!=''){
            this.Claim_Amount_Old =parseFloat(this.Model.AmountClaimed).toFixed(2);
            this.Model.AmountClaimed=tools.formatAmount(this.Model.AmountClaimed);
          }
          if(this.Model.ExpenseTypeID==25 && this.Model.RunzheimerRate!=null &&this.Model.RunzheimerRate!='' &&parseFloat(this.Model.RunzheimerRate)>0){
                this.LngRate=parseFloat(tools.clearNoNum(this.Model.RunzheimerRate));
          }
          this.OriginNumberOfMiles=parseFloat(tools.clearNoNum(this.Model.NumberOfMiles));
          if (this.Model.ExpenseItemID == 0) {
            this.Model.AmountClaimed = null;
            this.Model.MealDate = null;
            this.Model.NumberOfMiles=null;
            this.Model.RunzheimerRate=null;
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
        if(this.expenseTypeID==25){
            this.IsDisplayRunzheimerRate=true;
        }else if(this.expenseTypeID==12){
            this.IsDisplayRunzheimerRate=false;
            var url ="/Data/GetMileageRuleLimit";
            this.$axios.get(url, {
                params: {
                    expenseTypeID: this.expenseTypeID
                }
            })
            .then(response => {
                this.LngRate=response.data;
            })
            .catch(error => {
                console.log(error);
            });
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
<style scope>
.card-background .v-subheader{
  padding: 0px;
  font-size: 18px;
  height: 10px;
  font-weight: bold;
  margin-bottom: 5px !important;
}
.subtitle span,.v-subheader span{
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 0px !important;
}
.radiogroup,.radiogroup2 {
  margin-top: 0px;
}
.radiogroup .v-input__slot,.radiogroup .v-label.theme--light,
.radiogroup .v-input--selection-controls__input{
  margin-bottom: 3px !important;
  font-weight: bold;
  font-size: 15px;
}
.radiogroup2 .v-input__slot,.radiogroup2 .v-label.theme--light,
.radiogroup2 .v-input--selection-controls__input {
  margin-top: -8px;
  margin-bottom: 0px !important;
  font-weight: bold;
  font-size: 15px;
}
/* .radiogroup .v-input--radio-group__input .v-radio.theme--light:nth-child(odd){
    background-color:rgb(219, 219, 219);
} */
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
.card-background{
    background-color:rgb(245, 245, 245);
}
.row-margin{
    margin: 0.1px;
}
</style>