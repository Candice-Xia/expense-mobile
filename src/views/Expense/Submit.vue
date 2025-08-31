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
        @click="$router.push(`/Edit/${expenseReportID}`)"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>Submit</v-toolbar-title>
      <div class="flex-grow-1" />
      <div>
        <div class="smalltext">
          {{ employeeName }}
        </div>
        <div class="smalltext">
          {{ expenseReportID }}
        </div>
      </div>
    </v-toolbar>
    <v-container fluid>
      <v-form>
        <v-subheader class="subtitle">
          Check List
        </v-subheader>
        <div class="ml-4 checkout">
          <ul>
            <li>
              Copy of credit card statement
              <br>(if travel was international)
            </li>
            <li>
              Exchange rate documentation
              <br>(if travel was international)
            </li>
            <li>Receipts,Upload Receipts</li>
            <li>Hotel Bill Detailed</li>
            <li>Car Rental Bill Detailed</li>
            <li>
              Cash Advance Form
              <br>(if cash was advanced)
            </li>
            <li>
              Spiff Form (for Sales promotions)
              <br>Include MBC#
            </li>
          </ul>
        </div>
        <v-textarea
          v-model="comments"
          label="Additional Comments"
          counter
        />
        <v-autocomplete
          v-model="managerEmployeeID"
          label="Manager"
          class="Required"
          location="top"
          :items="ManagerList"
          item-title="text"
          item-value="value"
          :error-messages="ManagerErrors"
          @input="v$.managerEmployeeID.$touch()"
          @blur="v$.managerEmployeeID.$touch()"
        />
        <v-btn
          color="primary"
          class="mb-4 no-uppercase"
          :disabled="IsReadOnly||IsDisabledBtn"
          @click="submit()"
        >
          Submit
          <v-icon end>mdi-publish</v-icon>
        </v-btn>
      </v-form>
    </v-container>
  </div>
</template>
<script>
import { useVuelidate } from '@vuelidate/core';
import { required, maxLength, email } from '@vuelidate/validators';
import tools from "../../plugins/tools";
export default {
  name: "Submit",
  setup() {
    return { v$: useVuelidate() }
  },
  validations(){ 
  return {
    managerEmployeeID: { required }
  }},
  data: function() {
    return {
      expenseReportID: this.$route.params.id,
      managerEmployeeID: null,
      comments: "",
      employeeName: "",
      IsReadOnly: "",
      Status: "",
      ManagerList: [],
      IsDisabledBtn:false
    };
  },
  computed: {
    ManagerErrors() {
      const errors = [];
      if (!this.v$.managerEmployeeID.$dirty) return errors;
      this.v$.managerEmployeeID.required.$invalid &&
        errors.push("Manager is required.");
      return errors;
    }
  },
  created: function() {
    tools.getCurrentUserManager(value => {
      if (this.ManagerList.length > 0) {
        this.ManagerList.splice(0, this.ManagerList.length);
      }
      this.ManagerList = value;
    });
    this.$axios
      .get("/ExpenseReport/GetExpenseReport", {
        params: { id: this.expenseReportID }
      })
      .then(response => {
        this.employeeName =
          response.data.ReportOwner.FirstName +
          " " +
          response.data.ReportOwner.LastName;
        this.Status = response.data.ReportStatus.Status;
        this.IsReadOnly = !tools.isEditable(response.data.ReportStatus);
        console.log(response);
      })
      .catch(error => {
        console.log(error);
      });
  },
  methods: {
    submit() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      }
      this.IsDisabledBtn=true;
      this.$axios
        .post("/ExpenseReport/SendToManager", {
          expenseReportID: this.expenseReportID,
          comments: this.comments,
          managerEmployeeID: this.managerEmployeeID
        })
        .then(response => {
          console.log(response);
          if (response.data.ExpenseReportID > 0) {
            tools.updateExpenseReport(response.data);
            //tools.clearExpenseItemList(this.id);
            tools.clearReportSession();
            tools.alert("Submit successfully.");
            var query = {};
            query.fromReview = 0;
            this.$router.push({
              path: "/",
              query: query
            });            
          } else {
            this.IsDisabledBtn=false;
            tools.alert(response.data);
          }
        })
        .catch(error => {
          this.IsDisabledBtn=false;
          tools.alert(error, 2000, 'error', false);
          console.log(error);
        });
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
.smalltext {
  font-size: 12px;
}
.subtitle {
  padding-left: 0px;
  font-size: 16px;
}
.checkout li {
  margin-bottom: 10px;
}
</style>
