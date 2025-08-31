<template>
  <div>
    <v-toolbar
      color="primary"
      dark
      flat
    >
      <v-btn
        icon
        goback
        @click="$router.push('/')"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>Cash Advance</v-toolbar-title>
    </v-toolbar>
    <v-container fluid>
      <v-form>
        <v-text-field
          v-model="TotalCashRecieved"
          label="How much cash advance did you receive"
          counter
          @input="ValidateNoNumTotalCashRecieved"
          @change="MoneyTo2DecimalPlaces"
        />
        <v-text-field
          v-model="TotalCashReturned"
          counter
          label="How much cash advance did you return"
          @input="ValidateNoNumTotalCashReturned"
          @change="MoneyTo2DecimalPlaces"
        />
        <v-text-field
          v-model="CreditCardRefund"
          counter
          label="Less : Credit Card Refund"
          @input="ValidateNoNumCreditCardRefund"
          @change="MoneyTo2DecimalPlaces"
        />
        <v-text-field
          v-model="TypeCashReturned"
          label="Returned Cash Form (i.e. Travelers Check)"
          counter
        />
        <div class="longButton">
          <v-btn
            color="primary"
            class="no-uppercase"
            :disabled="IsDisabledBtn"
            @click="submit()"
          >
            Continue
            <v-icon end>mdi-skip-next-outline</v-icon>
          </v-btn>
        </div>
      </v-form>
    </v-container>
  </div>
</template>
<script>
import tools from "../../plugins/tools";
export default {
  name: "NewCashAdvance",
  data: function() {
    return {
      ReportNo: this.$route.params.id,
      TotalCashRecieved: null,
      CreditCardRefund: null,
      TotalCashReturned: null,
      TypeCashReturned: null,
      IsDisabledBtn:false
    };
  },
  methods: {
    submit() {
      if(this.TotalCashRecieved!=null&&this.TotalCashRecieved!='')
        this.TotalCashRecieved=tools.clearNoNum(this.TotalCashRecieved);
      if(this.CreditCardRefund!=null&&this.CreditCardRefund!='')
        this.CreditCardRefund=tools.clearNoNum(this.CreditCardRefund);
      if(this.TotalCashReturned!=null&&this.TotalCashReturned!='')
        this.TotalCashReturned=tools.clearNoNum(this.TotalCashReturned);

      this.IsDisabledBtn=true;
      this.$axios
        .post("/ExpenseReport/UpdateCash", this.$data)
        .then(response => {
        if (response.data.ExpenseReportID > 0){
            tools.addExpenseReport(response.data);
          this.$router.push({
            path: "/Edit/" + this.ReportNo
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
    MoneyTo2DecimalPlaces() {
      if (this.TotalCashRecieved != null && this.TotalCashRecieved != ""){
        this.TotalCashRecieved = tools.formatAmount(this.TotalCashRecieved);
      }
      else this.TotalCashRecieved = null;

      if (this.TotalCashReturned != null && this.TotalCashReturned != "")
        this.TotalCashReturned = tools.formatAmount(this.TotalCashReturned);
      else this.TotalCashReturned = null;

      if (this.CreditCardRefund != null && this.CreditCardRefund != "")
        this.CreditCardRefund = tools.formatAmount(this.CreditCardRefund);
      else this.CreditCardRefund = null;
    },
    ValidateNoNumTotalCashRecieved() {
      if (this.TotalCashRecieved != null && this.TotalCashRecieved != ""){
        this.TotalCashRecieved=tools.clearNoNum(this.TotalCashRecieved);
      }
      else this.TotalCashRecieved = null;
    },
    ValidateNoNumTotalCashReturned() {
      if (this.TotalCashReturned != null && this.TotalCashReturned != "")
        {
          this.TotalCashReturned=tools.clearNoNum(this.TotalCashReturned);
        }
      else this.TotalCashReturned = null;
    },
    ValidateNoNumCreditCardRefund() {
      if (this.CreditCardRefund != null && this.CreditCardRefund != "")
        {
          this.CreditCardRefund=tools.clearNoNum(this.CreditCardRefund);
        }
      else 
      this.CreditCardRefund = null;
    }
  }
};
</script>
<style scoped>
.no-uppercase {
  text-transform: none;
}
</style>
