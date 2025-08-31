<template>
  <div>
    <v-app-bar
      color="primary"
      dark
      app
    >
      <v-btn
        icon
        @click="goBack"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>All people entertained</v-toolbar-title>
    </v-app-bar>

    <v-container class="pt-4 pb-4">
      <div 
        v-if="!isReadOnly && showAddForm" 
        class="mb-4"
      >
        <v-text-field
          v-model="fullName"
          label="Name"
          class="Required mb-2"
          counter
          :error-messages="fullNameError"
          clearable
          @input="v$.fullName.$touch()"
          @blur="v$.fullName.$touch()"
        />
        <v-text-field
          v-model="company"
          label="Company"
          class="Required"
          counter
          :error-messages="companyError"
          clearable
          @input="v$.company.$touch()"
          @blur="v$.company.$touch()"
        />
        <v-btn
          color="primary"
          block
          class="mt-3"
          @click="addPeople"
        >
          Add Person
        </v-btn>
      </div>

      <v-card 
        v-if="businessContactList.length > 0" 
        class="mb-4" 
        elevation="2"
      >
        <v-list two-line>
          <v-list-item-group>
            <template
              v-for="(item, index) in businessContactList"
              :key="item.ID"
            >
              <v-divider v-if="index > 0" />
              <SlideToDelete
                class="pb-1 pt-1"
                :disable="isReadOnly"
                @delete-line="delPeople(item.ID)"
              >
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>{{ item.FullName }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.Company }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </SlideToDelete>
            </template>
          </v-list-item-group>
        </v-list>
      </v-card>

      <v-btn
        v-if="!isReadOnly && !showAddForm"
        color="primary"
        block
        prepend-icon="mdi-plus"
        @click="showAddForm = true"
      >
        Add New Person
      </v-btn>

      <v-card 
        v-if="businessContactList.length === 0 && !showAddForm" 
        class="mt-4 text-center pa-4" 
        elevation="1"
      >
        <v-icon 
          size="50" 
          color="grey"
        >
          mdi-account-group-outline
        </v-icon>
        <div class="text-body-1 mt-2 grey--text">
          No people added yet
        </div>
        <v-btn
          v-if="!isReadOnly"
          color="primary"
          class="mt-3"
          @click="showAddForm = true"
        >
          Add People
        </v-btn>
      </v-card>

      <v-btn
        color="success"
        block
        class="mt-6"
        @click="saveAndReturn"
      >
        Done
      </v-btn>
    </v-container>
  </div>
</template>

<script>
import SlideToDelete from "../../components/SlideToDelete";
import { useVuelidate } from '@vuelidate/core';
import tools from "../../plugins/tools";

export default {
  name: "ContactsPage",
  components: {
    SlideToDelete
  },
  setup() {
    return { v$: useVuelidate() }
  },
  data() {
    return {
      businessContactList: [],
      tempBusinessContactList: [],
      fullName: null,
      company: null,
      isSave: false,
      showAddForm: false,
      isReadOnly: false,
      fromExpenseId: 0
    };
  },
  validations() {
    return {
      fullName: {
        required(value) {
          return !!value;
        }
      },
      company: {
        required(value) {
          return !!value;
        }
      }
    }
  },
  computed: {
    fullNameError() {
      const errors = [];
      if (!this.v$.fullName.$dirty) return errors;
      this.v$.fullName.required.$invalid && errors.push("Name is required.");
      return errors;
    },
    companyError() {
      const errors = [];
      if (!this.v$.company.$dirty) return errors;
      this.v$.company.required.$invalid && errors.push("Company is required.");
      return errors;
    }
  },
  created() {
    this.loadDataFromParams();
  },
  methods: {
    loadDataFromParams() {
      if (this.$route.query.businessContactList) {
        this.businessContactList = JSON.parse(this.$route.query.businessContactList);
      }
      if (this.$route.query.tempBusinessContactList) {
        this.tempBusinessContactList = JSON.parse(this.$route.query.tempBusinessContactList);
      }
      if (this.$route.query.isReadOnly) {
        this.isReadOnly = this.$route.query.isReadOnly === "true";
      }
      if (this.$route.query.fromExpenseId) {
        this.fromExpenseId = parseInt(this.$route.query.fromExpenseId);
      }
      // 如果没有联系人，默认显示添加表单
      if (this.businessContactList.length === 0 && !this.isReadOnly) {
        this.showAddForm = true;
      }
    },
    addPeople() {
      this.isSave = true;
      this.v$.fullName.$touch();
      this.v$.company.$touch();
      if (this.v$.fullName.$invalid || this.v$.company.$invalid) {
        return;
      }
      
      this.tempBusinessContactList.push({
        FullName: this.fullName,
        Company: this.company
      });
      
      this.rebuildContactList();
      
      this.isSave = false;
      this.fullName = null;
      this.company = null;
      this.showAddForm = false;
      
      tools.alert("Person added successfully", 2000, "black", true, false);
    },
    async delPeople(id) {
      if (await tools.confirm("Are you sure you want to delete this person?")) {
        const tempList = [...this.businessContactList];
        this.businessContactList = [];
        this.tempBusinessContactList = [];
        
        tempList.forEach(t => {
          if (t.ID !== id) {
            this.tempBusinessContactList.push({
              FullName: t.FullName,
              Company: t.Company
            });
          }
        });
        
        this.rebuildContactList();
        tools.alert("Person deleted successfully", 2000, "black", true, false);
      }
    },
    rebuildContactList() {
      this.businessContactList = [];
      let id = 0;
      this.tempBusinessContactList.forEach(t => {
        id++;
        this.businessContactList.push({
          ID: id,
          FullName: t.FullName,
          Company: t.Company,
          IsChanged: true
        });
      });
    },
    saveAndReturn() {
      // 获取返回页面的路由
      const routeName = this.fromExpenseId > 0 ? 'EditItem' : 'EditItem';
      
      // 将数据作为全局状态保存，以便在返回后使用
      window.contactsPageData = {
        businessContactList: this.businessContactList,
        tempBusinessContactList: this.tempBusinessContactList,
        fromContactsPage: true,
        timestamp: Date.now() // 添加时间戳确保数据的唯一性
      };
      
      console.log("保存联系人数据到全局状态", window.contactsPageData);
      
      // 返回到上一页面
      this.$router.push({
        name: routeName,
        query: {
          expenseItemId: this.fromExpenseId,
          updateContacts: Date.now() // 添加时间戳确保URL变化触发检测
        }
      });
    },
    goBack() {
      this.saveAndReturn();
    }
  }
};
</script>

<style scoped>
.v-list-item {
  min-height: 64px;
}
</style>
