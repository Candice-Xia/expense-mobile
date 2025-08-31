<template>
  <div>
    <slot />
    <v-card
      v-if="isEditMoney"
      class="mt-0"
    >
      <v-row>
        <v-col class="ml-2 mr-2 mb-2">          
          <v-text-field
            v-model="datas.NewAmountClaimed"
            label="New Amount claimed (US currency)"
            :error-messages="NewAmountClaimedError"
            class="Required changeLabelColor"
            counter
            @input="v$.datas.NewAmountClaimed.$touch(); EditNewAmountClaimed()"
            @blur="v$.datas.NewAmountClaimed.$touch();"
            @change="onNewAmountClaimedChange"
          />
          <v-textarea
            v-model="datas.Reasonforchanging"
            label="Reason for changing:"
            rows="2"
            class="mb-0 mt-0 changeLabelColor"
            counter
          />
          <v-icon
            color="primary"
            class="no-uppercase mb-0 mt-0 mdi-36px icon-position"
            @click="SaveNewMoneyInfo"
          >
            mdi-check-circle
          </v-icon>
          <v-icon
            color="gray"
            class="no-uppercase mb-0 mt-0 mdi-36px icon-position"
            @click="CancelEditMoney"
          >
            mdi-close-circle
          </v-icon>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>
<script>
import { useVuelidate } from '@vuelidate/core';
import { helpers } from '@vuelidate/validators';
import tools from "../plugins/tools";

export default {
  name: "ChangeAmountExRate",
  props: {
    isEditMoney: Boolean
  },  
  emits: [
    'SaveNewAmountClaimed', 
    'HideEdit', 
    'EditNewAmountClaimed'
  ],
  setup(props) {
    return {
      rules: {
        datas: {
          NewAmountClaimed: {
            required: helpers.withMessage(
              "New Amount Claimed is required and greater than 0.", 
              (value) => {
                if (!props.isEditMoney) return true;
                var res = !!value;
                if (res) {
                  if (value <= 0) {
                    res = false;
                  }
                }
                return res;
              }
            )
          }
        }
      }
    };
  },  
  data() {
    return {
      datas:{NewAmountClaimed:null, Reasonforchanging:''},
      v$: null
    };
  },
  computed: {
    NewAmountClaimedError() {
      const errors = [];
      if (!this.v$.datas.NewAmountClaimed.$dirty) return errors;
      this.v$.datas.NewAmountClaimed.required.$invalid &&
        errors.push("New Amount Claimed is required and greater than 0.");
      return errors;
    }
  },
  created() {
    this.v$ = useVuelidate(this.$options.setup(this).rules, this);
  },
  methods: {
    OldClaimAmount(value,isClearReason){
      this.datas.NewAmountClaimed=tools.formatAmount(value);
      if(isClearReason){
        this.datas.Reasonforchanging='';
      }
    },
    onNewAmountClaimedChange(){
      if(this.datas.NewAmountClaimed!=null && this.datas.NewAmountClaimed!='')
        this.datas.NewAmountClaimed=tools.formatAmount(this.datas.NewAmountClaimed);
      else {
        this.datas.NewAmountClaimed=null; 
      }
    },
    EditNewAmountClaimed(){
      var data=0;
      this.datas.NewAmountClaimed=tools.clearNoNum(this.datas.NewAmountClaimed);
      if(this.datas.NewAmountClaimed!=null && this.datas.NewAmountClaimed!=''){
        data=tools.clearNoNum(this.datas.NewAmountClaimed);
        if(parseFloat(this.datas.NewAmountClaimed)<=0){
          this.datas.NewAmountClaimed=null;
        }
      }else{
        this.datas.NewAmountClaimed=null;
      }
      this.$emit("EditNewAmountClaimed",data);
    },
    CancelEditMoney() {
      this.$emit("HideEdit");
    },    
    SaveNewMoneyInfo() {
      this.v$.datas.NewAmountClaimed.$touch();
      if (this.v$.$error) {
        return false;
      }
      this.$emit("SaveNewAmountClaimed",this.datas);
    }
  }
};
</script>
<style>
.changeLabelColor .theme--light.v-label,.changeLabelColor .v-label.v-label--active.theme--light{
  color: green;
}
.icon-position{
  margin-left:25%;
}
</style>