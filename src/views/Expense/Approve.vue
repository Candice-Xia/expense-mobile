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
        @click="goback()"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ Title }}</v-toolbar-title>
      <div class="flex-grow-1" />
    </v-toolbar>
    <v-container fluid>
      <v-form>
        <v-textarea
          v-model="comments"
          :label="FieldName"
          :error-messages="CommentsErrors"
          counter
          @input="v$.comments.$touch()"
          @blur="v$.comments.$touch()"
        />
        <v-btn
          color="primary"
          class="mb-4 no-uppercase"
          :disabled="IsDisabledBtn"
          @click="submit()"
        >
          Continue
          <v-icon end>mdi-skip-next-outline</v-icon>
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
  return  {
    comments: {
      required(value) {
        if (!this.IsReject) return true;
        else {
          if (!this.IsApproveItem) return true;
        }
        return !!value;
      }
    }
  }},
  data: function() {
    return {
      comments: "",
      expenseReportID: this.$route.query.expenseReportID,
      expenseItemID: this.$route.query.expenseItemID,
      expenseTypeID: this.$route.query.expenseTypeID,
      expenseTypeName: this.$route.query.expenseTypeName,
      IsApproveItem: this.$route.query.IsApproveItem == 1,
      IsReject: this.$route.query.IsReject == 1,
      Title:
        this.$route.query.IsReject == 1
          ? this.$route.query.IsApproveItem == 1
            ? "Reject"
            : "Disapprove"
          : "Approve",
      FieldName:
        this.$route.query.IsApproveItem == 1 ? "Reason for denial" : "Comments",
      IsDisabledBtn:false
    };
  },
  computed: {
    CommentsErrors() {
      const errors = [];
      if (!this.v$.comments.$dirty) return errors;
      this.v$.comments.required.$invalid &&
        errors.push(this.FieldName + " is required.");
      return errors;
    }
  },
  methods: {
    goback() {
      if (this.expenseItemID) {
        this.$router.push({
          path: "/ReviewItem/"+this.expenseItemID
        });
      } else {
        this.$router.push({
          path: "/Review/" + this.expenseReportID
        });
      }
    },
    submit() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      }
      var url = "/ExpenseReport/";
      url += this.IsApproveItem
        ? "RejectItemByManager"
        : this.IsReject
        ? "RejectReportByManager"
        : "ApproveReportByManager";

      this.IsDisabledBtn=true;
      this.$axios
        .post(url, {
          expenseReportID: this.expenseReportID,
          comments: this.comments,
          expenseItemID: this.expenseItemID
        })
        .then(response => {
          console.log(response);
          if (this.IsApproveItem && response.data.ExpenseItemID > 0) {
            tools.alert("Reject Item successfully.");
            tools.updateExpenseItem(response.data, true);
            this.$router.push({
              path: "/Review/" + this.expenseReportID
            });
          } else if (response.data.ExpenseReportID > 0) {
            tools.updateExpenseReport(response.data);
            tools.alert(this.Title + " successfully.");
            //tools.clearExpenseItemList(this.expenseReportID);
            this.$router.push({
              path: "/",
              query: {
                fromReview: 1
              }
            });
          } else {
            this.IsDisabledBtn=false;
            tools.alert(response.data, 2000, 'error', false);
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
</style>
