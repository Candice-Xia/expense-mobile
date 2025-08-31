<template>
  <div>
    <v-toolbar
      color="primary"
      dark
      flat
      height="56"
    >
      <v-btn
        icon
        goback
        @click="previousStep"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>New Expense Report - Step 1</v-toolbar-title>
    </v-toolbar>
    <v-container fluid>
      <v-form>
        <v-text-field
          v-model="Description"
          counter
          :error-messages="DescErrors"
          label="Brief Desciption Of Expense Report"
          class="Required"
          @input="v$.Description.$touch()"
          @blur="v$.Description.$touch()"
        />
        <v-text-field
          v-model="Company"
          label="What company are you in ?"
          disabled
        />
        <v-autocomplete
          v-model="CostCenterID"
          label="What cost center are you in ?"
          :items="costCenterLst"
          item-title="text"
          item-value="value"
          clearable
          class="Required"
          :error-messages="CostCenterErrors"
          @input="v$.CostCenterID.$touch()"
          @blur="v$.CostCenterID.$touch()"
        />
        <v-autocomplete
          v-model="ClaimCountryCode"
          :items="countryLst"
          item-title="text"
          item-value="value"
          label="Reimbursed Currency Country"
        />
        <v-autocomplete
          v-model="ResidencyCountryCode"
          :items="countryLst"
          item-title="text"
          item-value="value"
          label="Residented Country"
        />
        <v-text-field
          v-model="Subledger"
          label="Subledger Number"
          counter
          @change="FormatSubledger"
          @input="FormatSubledger"
        />
        <div class="longButton">
          <v-btn
            color="primary"
            class="mr-2 mb-4 no-uppercase"
            :disabled="IsDisabledBtn"
            @click="WithTravel"
          >
            <span>With Travel </span>
            
            <v-icon end>mdi-airplane</v-icon>
          </v-btn>
          <v-btn
            color="primary"
            class="mb-4 no-uppercase"
            :disabled="IsDisabledBtn"
            @click="NonTravel"
          >            
            No Travel
          </v-btn>
        </div>
      </v-form>
    </v-container>
  </div>
</template>
<script>
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import tools from "../../plugins/tools";
export default {
  name: "NewStep1",
  setup() {
    return { v$: useVuelidate() }
  },
  validations(){ 
  return  {
    Description: { required },
    CostCenterID: { required }
  }},
  data: function() {
    return {
      ClaimCountryCode: "US",
      ResidencyCountryCode: "US",
      Description: "",
      CostCenterID: null,
      Subledger: "",
      Company: "KTC USA",
      countryLst: [],
      costCenterLst: [],
      IsDisabledBtn:false
    };
  },
  computed: {
    DescErrors() {
      const errors = [];
      if (!this.v$.Description.$dirty) return errors;
      this.v$.Description.required.$invalid && errors.push("Description is required.");
      return errors;
    },
    CostCenterErrors() {
      const errors = [];
      if (!this.v$.CostCenterID.$dirty) return errors;
      this.v$.CostCenterID.required.$invalid && errors.push("Cost Center is required.");
      return errors;
    }
  },
  created: function() {
    this.initData();

    tools.getCountries(value => {
      if (this.countryLst.length > 0) {
        this.countryLst.splice(0, this.countryLst.length);
      }
      this.countryLst = value;
    });
    tools.getCostCenter(value => {
      if (this.costCenterLst.length > 0) {
        this.costCenterLst.splice(0, this.costCenterLst.length);
      }
      this.costCenterLst = value;
    });
  },
  methods: {
    previousStep() {
      tools.clearStep1Session();
      var query = {};
      query.fromReview = 1;
      this.$router.push({
        path: "/",
        query: query
      });
    },
    initData() {
      this.Description =
        sessionStorage.getItem(tools.data.sessionKey_Description) != null
          ? sessionStorage.getItem(tools.data.sessionKey_Description)
          : "";
      this.CostCenterID =
        sessionStorage.getItem(tools.data.sessionKey_CostCenterID) != null
          ? parseInt(sessionStorage.getItem(tools.data.sessionKey_CostCenterID))
          : null;
      this.ClaimCountryCode =
        sessionStorage.getItem(tools.data.sessionKey_ClaimCountryCode) != null
          ? sessionStorage.getItem(tools.data.sessionKey_ClaimCountryCode)
          : "US";
      this.ResidencyCountryCode =
        sessionStorage.getItem(tools.data.sessionKey_ResidencyCountryCode) !=
        null
          ? sessionStorage.getItem(tools.data.sessionKey_ResidencyCountryCode)
          : "US";
      this.Subledger =
        sessionStorage.getItem(tools.data.sessionKey_Subledger) != null
          ? sessionStorage.getItem(tools.data.sessionKey_Subledger)
          : "";
    },
    FormatSubledger(){
      if(this.Subledger!=null && this.Subledger!=''){
        this.Subledger=tools.PositiveInt(this.Subledger);
      }else{
        this.Subledger=null
      }
    },
    NonTravel() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      }
      this.IsDisabledBtn=true;
      this.$axios
        .post("/ExpenseReport/NewExpenseReport", {
          Description: this.Description,
          CostCenterID: this.CostCenterID,
          ClaimCountryCode: this.ClaimCountryCode,
          ResidencyCountryCode: this.ResidencyCountryCode,
          Subledger: this.Subledger,
          IsTravel: false
        })
        .then(response => {
          console.log(response);
          if (response.data.ExpenseReportID > 0) {
            tools.addExpenseReport(response.data);
            this.$router.push({
              path: "/NewCashAdvance/" + response.data.ExpenseReportID
            });
          }else{
            this.IsDisabledBtn=false;
            tools.alert("Failed To Add Report.", 2000, 'error', false);
          }
        })
        .catch(error => {
          this.IsDisabledBtn=false;
          tools.alert(error, 2000, 'error', false);
          console.log(error);
        });
    },
    WithTravel() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      }
      sessionStorage.setItem(
        tools.data.sessionKey_Description,
        this.Description
      );
      sessionStorage.setItem(
        tools.data.sessionKey_CostCenterID,
        this.CostCenterID
      );
      sessionStorage.setItem(
        tools.data.sessionKey_ClaimCountryCode,
        this.ClaimCountryCode
      );
      sessionStorage.setItem(
        tools.data.sessionKey_ResidencyCountryCode,
        this.ResidencyCountryCode
      );
      sessionStorage.setItem(tools.data.sessionKey_Subledger, this.Subledger);
      this.IsDisabledBtn=true;
      this.$router.push({
        path: "/NewStep2"
      });
      if (this.v$.$invalid) {
        return;
      }
    }
  }
};
</script>

<style scoped>
.no-uppercase {
  text-transform: none;
}
</style>
