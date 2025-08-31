<template>
  <v-form>
    <v-select
      v-if="DisplayCurrencyCountry"
      v-model="Model.CurrencyCountryCode"
      :items="CurrencyCountryList"
      :menu-props="{ maxHeight: '400' }"
      label="Which country's currency was used?"
      item-title="text"
      item-value="value"
      persistent-hint
      :readonly="true"
    />
    <v-card
      v-if="Model.ShowExchangeRate&&DisplayCurrencyCountry"
      class="mb-4"
    >
      <v-row>
        <v-col class="ml-1">
          <v-text-field
            v-model="LocalCurrencyMoneyStr"
            :label="msgExchange"
            :readonly="true"
          />
        </v-col>
        <v-col>
          <v-text-field
            v-model="TargetCurrencyMoneyStr"
            :label="msgExchangeTo"
            :readonly="true"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col class="ml-1 lblExchangeRate">
          <v-label>Exchange Rate:{{ ExchangeRateText }}</v-label>
        </v-col>
      </v-row>
    </v-card>
    <CommonPageFields
      :expense-report-i-d="expenseReportID"
      :expense-item-i-d="expenseItemID"
      :expense-type-i-d="expenseTypeID"
      @get-total-amount="GetTotalAmount"
    />
  </v-form>
</template>
<script>
import tools from "../../../plugins/tools";
import Vue from "vue";
import CommonPageFields from "../../../components/CommonPageFields";

export default {
  components: {
    CommonPageFields
  },
  props: {
    expenseTypeID: Number,
    expenseReportID: Number,
    expenseItemID: Number,
    costCenterID: Number
  },
  data: function() {
    return {
      Model: {},
      TravelAbroad: false,
      CurrencyCountryList: [],
      LocalCurrencyMoney: 1,
      TargetCurrencyMoney: 1,
      LocalCurrencyMoneyStr: "",
      TargetCurrencyMoneyStr: "",
      ExchangeRateText: "1.0000000000"
    };
  },
  computed: {
    msgExchange() {
      return this.Model.CurrencyCountryCode + " Currency";
    },
    msgExchangeTo() {
      return this.Model.MyReport.ClaimCountryCode + " Currency";
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
          this.Model = response.data;
          if (this.Model.ExchangeRate > 0) {
            this.LocalCurrencyMoney = this.Model.ExpenseItem.ClaimAmountSpendCurr;
            this.TargetCurrencyMoney = (
              this.LocalCurrencyMoney * this.Model.ExchangeRate
            ).toFixed(2);
            var reg = new RegExp(",", "g");
            this.LocalCurrencyMoneyStr = tools.formatAmount(
              this.LocalCurrencyMoney
            );
            this.TargetCurrencyMoneyStr = tools.formatAmount(
              this.TargetCurrencyMoney
            );
            this.ExchangeRateText = this.Model.ExchangeRate.toFixed(10);
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
        })
        .catch(error => {
          console.log(error);
        });
    },
    GetTotalAmount(list) {
      list.forEach(l => {
        if (l.ColumnName.indexOf("AmountClaimed") != -1) {
          var reg = new RegExp(",", "g");
          var val = l.Text.replace(reg, "");
          this.LocalCurrencyMoney = parseFloat(val).toFixed(2);
          this.TargetCurrencyMoney = (
            this.LocalCurrencyMoney * this.Model.ExchangeRate
          ).toFixed(2);
          this.LocalCurrencyMoneyStr = tools.formatAmount(
            this.LocalCurrencyMoney
          );
          this.TargetCurrencyMoneyStr = tools.formatAmount(
            this.TargetCurrencyMoney
          );
        }
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
</style>