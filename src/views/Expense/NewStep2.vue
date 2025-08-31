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
      <v-toolbar-title>New Expense Report - Step 2</v-toolbar-title>
    </v-toolbar>
    <v-container fluid>
      <v-form>
        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <v-menu
              v-model="dialogFrom"
              :close-on-content-click="false"
              :disabled="IsReadOnly"
              transition="scale-transition"
              min-width="auto"
            >
              <template #activator="{ props }">
                <v-text-field
                  v-model="TripStartDayForDisplay"
                  class="Required"
                  label="When did you start trip?"
                  append-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                  :error-messages="TripStartDayError"
                  @blur="v$.Model.TripStartDay.$touch()"
                />
              </template>
              <v-date-picker
                v-model="TripStartDayForPicker"
                :max="Today"
                @update:model-value="dialogFrom = false"
              />
            </v-menu>
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-menu
              v-model="dialogTo"
              :close-on-content-click="false"
              :disabled="IsReadOnly"
              transition="scale-transition"
              min-width="auto"
            >
              <template #activator="{ props }">
                <v-text-field
                  v-model="TripEndDayForDisplay"
                  class="Required"
                  label="When did you end trip?"
                  append-icon="mdi-calendar"
                  readonly
                  v-bind="props"
                  :error-messages="TripEndDayError"
                  @blur="v$.Model.TripEndDay.$touch()"
                />
              </template>
              <v-date-picker
                v-model="TripEndDayForPicker"
                :max="Today"
                @update:model-value="dialogTo = false"
              />
            </v-menu>
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="Model.TripLocation"
              label="What city did you travel to?"
              :error-messages="CityError"
              @blur="v$.Model.TripLocation.$touch()"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-radio-group
              v-model="Model.TripCityTypeId"
              class="radiogroup"
              label="City Level:"
              :error-messages="CityLevelError"
              row
              @blur="v$.Model.TripCityTypeId.$touch()"
            >
              <v-row>
                <v-col
                  v-for="clitem in CityLevelLst"
                  :key="clitem.ID"
                  cols="auto"
                >
                  <v-radio
                    :label="clitem.Text"
                    :value="clitem.ID"
                  />
                </v-col>
              </v-row>
            </v-radio-group>
            <div
              v-if="ShowCityLevelError"
              style="color:red;font-size:12px;"
            >
              {{ CityLevelErrorMsg }}
            </div>
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-select
              v-model="Model.TripCountryCodes"
              :items="CurrencyCountryList"
              :menu-props="{ maxHeight: '400' }"
              label="Select"
              multiple
              hint="Pick your used currency countries"
              item-title="text"
              item-value="value"
              persistent-hint
              :error-messages="UsedCurrencyError"
              @blur="v$.Model.TripCountryCodes.$touch()"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <div class="longButton">
              <v-btn
                color="primary"
                class="mr-4 mb-4 no-uppercase"
                :disabled="IsDisabledBtn"
                @click="Continue"
              >
                Continue
                <v-icon end>
                  mdi-skip-next-outline
                </v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-form>
    </v-container>
  </div>
</template>
<script>
import tools from "../../plugins/tools";
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import nowDate from "../../Scripts/GetToday";
export default {
  name: "NewStep2",
  props: {
    IsReadOnly: Boolean
  },
  setup() {
    return { v$: useVuelidate() }
  },
  validations(){ 
  return {
    Model: {
      TripStartDay: {
        required,
        rangeComparedFrom(value) {
          if (!this.Model.TripEndDay) return true;
          if (value > this.Model.TripEndDay) return false;
          return true;
        }
      },
      TripEndDay: {
        required,
        rangeCompared(value) {
          if (value > this.Model.TripStartDay) return true;
          else return false;
        }
      },
      TripLocation: {
        required(value) {
          if (
            (!value && this.Model.TripCountryCodes.length > 0) ||
            (value && this.Model.TripCountryCodes.length <= 0)
          )
            return true;
          return false;
        }
      },
      TripCityTypeId: {
        required(value) {
          if (
            this.Model.TripLocation &&
            !value &&
            this.Model.TripCountryCodes.length <= 0
          ) {
            this.ShowCityLevelError = true;
            return false;
          }
          this.ShowCityLevelError = false;
          return true;
        }
      },
      TripCountryCodes: {
        required(value) {
          if (
            (!this.Model.TripLocation && value.length > 0) ||
            (this.Model.TripLocation && value.length <= 0)
          )
            return true;
          return false;
        }
      }
    }
  }},
  data: function() {
    return {
      Model: {
        Description: "",
        CostCenterID: 0,
        ClaimCountryCode: "",
        ResidencyCountryCode: "",
        Subledger: "",
        IsTravel: true,
        TripStartDay: "",
        TripEndDay: "",
        TripCityTypeId: "",
        TripLocation: "",
        TripCountryCodes: null,
        Today: ""
      },
      CityLevelLst: [],
      CurrencyCountryList: [],
      ShowCityLevelError: false,
      CityLevelErrorMsg: "",
      dialogFrom: false,
      dialogTo: false,
      Today: "",
      IsDisabledBtn:false
    };
  },
  computed: {
    TripStartDayForDisplay() {
      return tools.formatDateAsOriginalForUS(this.Model.TripStartDay);
    },
    TripStartDayForPicker: {
      get: function() {
        return tools.formatDateAsOriginal(this.Model.TripStartDay);
      },
      set: function(value) {
        this.Model.TripStartDay = value;
      }
    },
    TripEndDayForDisplay() {
      return tools.formatDateAsOriginalForUS(this.Model.TripEndDay);
    },
    TripEndDayForPicker: {
      get: function() {
        return tools.formatDateAsOriginal(this.Model.TripEndDay);
      },
      set: function(value) {
        this.Model.TripEndDay = value;
      }
    },
    TripStartDayError() {
      const errors = [];
      if (!this.v$.Model.TripStartDay.$dirty) return errors;
      this.v$.Model.TripStartDay.required.$invalid &&
        errors.push("Trip Start Date Is Required.");
      this.v$.Model.TripStartDay.rangeComparedFrom.$invalid &&
        errors.push("Trip End Date Must > Start Date");
      return errors;
    },
    TripEndDayError() {
      const errors = [];
      if (!this.v$.Model.TripEndDay.$dirty) return errors;
      this.v$.Model.TripEndDay.required.$invalid &&
        errors.push("Trip End Date Is Required.");
      this.v$.Model.TripEndDay.rangeCompared.$invalid &&
        errors.push("Trip End Date Must > Start Date");
      return errors;
    },
    CityError() {
      const errors = [];
      if (!this.v$.Model.TripLocation.$dirty) return errors;
      this.v$.Model.TripLocation.required.$invalid &&
        errors.push("Please select either a city or country(s).");
      return errors;
    },
    UsedCurrencyError() {
      const errors = [];
      if (!this.v$.Model.TripCountryCodes.$dirty) return errors;
      this.v$.Model.TripCountryCodes.required.$invalid &&
        errors.push("Please select either country(s) or a city.");
      return errors;
    },
    CityLevelError() {
      const errors = [];
      if (this.v$.Model.TripCityTypeId.required.$invalid){
        this.CityLevelErrorMsg = "The city level is required.";
      }else {
        this.CityLevelErrorMsg = "";
      }
      return errors;
    }
  },
  created: function() {
    this.initData();
    this.Today = nowDate;
    tools.getCityType(value => {
      if (this.CityLevelLst.length > 0) {
        this.CityLevelLst.splice(0, this.CityLevelLst.length);
      }
      this.CityLevelLst = value;
    });

    tools.getCountries(value => {
      if (this.CurrencyCountryList.length > 0) {
        this.CurrencyCountryList.splice(0, this.CurrencyCountryList.length);
      }
      this.CurrencyCountryList = value;
    });
  },
  methods: {
    initData() {
      this.Model.Description =
        sessionStorage.getItem(tools.data.sessionKey_Description) != null
          ? sessionStorage.getItem(tools.data.sessionKey_Description)
          : "";
      this.Model.CostCenterID =
        sessionStorage.getItem(tools.data.sessionKey_CostCenterID) != null
          ? parseInt(sessionStorage.getItem(tools.data.sessionKey_CostCenterID))
          : 0;
      this.Model.ClaimCountryCode =
        sessionStorage.getItem(tools.data.sessionKey_ClaimCountryCode) != null
          ? sessionStorage.getItem(tools.data.sessionKey_ClaimCountryCode)
          : "";
      this.Model.ResidencyCountryCode =
        sessionStorage.getItem(tools.data.sessionKey_ResidencyCountryCode) !=
        null
          ? sessionStorage.getItem(tools.data.sessionKey_ResidencyCountryCode)
          : "";
      this.Model.Subledger =
        sessionStorage.getItem(tools.data.sessionKey_Subledger) != null
          ? sessionStorage.getItem(tools.data.sessionKey_Subledger)
          : "";
    },
    previousStep() {
      this.$router.push({
        path: "/NewStep1/"
      });
    },
    Continue() {
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      }
      this.IsDisabledBtn=true;
      this.$axios
        .post("/ExpenseReport/NewExpenseReport", this.Model)
        .then(response => {
          console.log(response);
          tools.clearStep1Session();
          //tools.clearExpenseReportList(1);
          if (response.data.ExpenseReportID > 0){
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
    }
  }
};
</script>
<style scoped>
.clsClose .v-btn__content{
    font-size: 18px;
}
</style>
