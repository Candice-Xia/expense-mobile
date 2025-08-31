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
        @click="goback()"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-toolbar-title>{{ expenseTypeName }}</v-toolbar-title>
    </v-toolbar>
    <v-container fluid>
      <component
        :is="componentName"
        ref="form"
        :expense-type-i-d="expenseTypeID"
        :expense-item-i-d="ExpenseItemID"
        :expense-report-i-d="ExpenseReportID"
        :cost-center-i-d="CostCenterID"
        :is-read-only="IsReadOnly"
        @load-expense-item="loadExpenseItem"
      />      
      <v-expansion-panels
        accordion
        class="my-2"
      >
        <v-expansion-panel>
          <template #title>
            <div class="btnright">
              Attachments ({{ attachmentsForDisplay.length }})
            </div>
          </template>
          <template #text>
            <v-list>
              <v-list-item-group>
                <template
                  v-for="(item,index) in attachmentsForDisplay"
                  :key="item.url"
                >
                  <v-divider v-if="index!=0" />
                  <SlideToDelete
                    :disable="IsReadOnly"
                    class="pb-1 pt-1"
                    @delete-line="delAttachments(item)"
                  >
                    <v-list-item>
                      <v-list-item-content @click="ViewAttachments(item)">
                        <v-list-item-title v-if="item.FileName">
                          <v-icon>
                            mdi-file-outline
                          </v-icon>
                          {{ item.FileName }}
                        </v-list-item-title>
                        <v-list-item-subtitle v-if="item.UploadedDate">
                          {{ item.UploadedDate }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </SlideToDelete>
                </template>
              </v-list-item-group>
            </v-list>
            <ImageViewAndUpload
              v-if="!IsReadOnly"
              :expense-item-i-d="ExpenseItemID"
              :expense-report-i-d="ExpenseReportID"
              @upload-success="uploadSuccess"
            />
            <ViewImage ref="refViewImage" />
          </template>
        </v-expansion-panel>
      </v-expansion-panels>
      <div
        v-if="!IsReadOnly"
        class="btnright"
      >
        <v-btn
          class="text-none mr-2"
          color="primary"
          elevation="2"
          min-width="100"
          @click="save"
        >
          Save
          <v-icon end>
            mdi-content-save-outline
          </v-icon>
        </v-btn>
        <v-btn
          v-if="ExpenseItemID>0"
          class="text-none"
          color="error"
          elevation="2"
          min-width="100"
          @click="DelExpenseItem"
        >
          Delete
          <v-icon end>
            mdi-delete-outline
          </v-icon>
        </v-btn>
      </div>
      <div
        v-if="CanReview"
        class="btnright"
      >
        <v-btn
          class="text-none mr-2"
          color="primary"
          elevation="2"
          min-width="100"
          @click="approve"
        >
          Approve
          <v-icon end>
            mdi-check-circle-outline
          </v-icon>
        </v-btn>
        <v-btn
          class="text-none"
          color="error"
          elevation="2"
          min-width="100"
          @click="reject"
        >
          Reject
          <v-icon end>
            mdi-close-circle-outline
          </v-icon>
        </v-btn>
      </div>
      <div class="PlaceHolder" />
    </v-container>
  </div>
</template>
<script>
import { defineAsyncComponent } from 'vue';
import baseUrl from "../../baseUrl";
import ImageViewAndUpload from "../../components/ImageViewAndUpload";
import ViewImage from "../../components/ViewImage";
import SlideToDelete from "../../components/SlideToDelete";
import tools from "../../plugins/tools";
export default {
  name: "EditItem",
  components: {
    ImageViewAndUpload,
    ViewImage,
    SlideToDelete,
    ExType_Meal: defineAsyncComponent(() =>
      import(/* webpackChunkName: "ExType_Meal" */ "./ExpenseType/ExType_Meal")),
    ExType_CommonPage: defineAsyncComponent(() =>
      import(
        /* webpackChunkName: "ExType_CommonPage" */ "./ExpenseType/ExType_CommonPage"
      )),
    ExType_MileageRunzheimerRate: defineAsyncComponent(() =>
      import(
        /* webpackChunkName: "ExType_MileageRunzheimerRate" */ "./ExpenseType/ExType_MileageRunzheimerRate"
      )),
    ExType_MealsEntertainment: defineAsyncComponent(() =>
      import(
        /* webpackChunkName: "ExType_MealsEntertainment" */ "./ExpenseType/ExType_MealsEntertainment"
      )),
    ExType_RentalCarAirTravel: defineAsyncComponent(() =>
      import(
        /* webpackChunkName: "ExType_RentalCarAirTravel" */ "./ExpenseType/ExType_RentalCarAirTravel"
      ))
  },
  // 在路由更新时也检查联系人数据
  beforeRouteUpdate(to, from, next) {
    next();
    this.$nextTick(() => {
      this.updateContactsFromQuery();
    });
  },
  data: function() {
    return {
      ExpenseItemID: 0,
      ExpenseReportID: 0,
      IsReview: false,
      ReportStatus: null,
      expenseTypeID: 0,
      expenseTypeName: "",
      componentName: "",
      CostCenterID: 0,
      ApprovedByManager: false,
      Rejected: false,
      attachments: [],
      EnabledExpenseTypes: true,
      IsDisabledBtn: false
    };
  },
  computed: {
    IsReadOnly() {
      return this.IsReview || !tools.isEditable(this.ReportStatus);
    },
    CanReview() {
      return (
        this.IsReview &&
        tools.canReview(this.ReportStatus) &&
        !this.Rejected &&
        !this.ApprovedByManager
      );
    },
    attachmentsForDisplay() {
      return this.attachments.filter(function(item) {
        return !item.IsDeleted;
      });
    },
    attachmentsForSave() {
      return this.attachments.filter(function(item) {
        return (
          (item.AttachmentID > 0 && item.IsDeleted) ||
          (item.AttachmentID == 0 && !item.IsDeleted)
        );
      });
    }
  },
  watch: {
    "$route.query.expenseItemId"() {
      this.loadData();
    }
  },
  mounted() {
    // 在组件挂载完成后处理联系人数据
    this.$nextTick(() => {
      this.updateContactsFromQuery();
    });
  },
  created: function() {
    this.loadData();
  },
  methods: {
    // 添加一个方法，用于从URL参数获取联系人数据并更新组件
    updateContactsFromQuery() {
      // 检查全局状态，优先使用全局状态
      if (window.contactsPageData && this.$refs.form && this.$refs.form.updateBusinessContacts) {
        try {
          console.log("从全局状态获取联系人数据");
          const { businessContactList, tempBusinessContactList } = window.contactsPageData;
          // 调用组件的更新方法
          this.$refs.form.updateBusinessContacts(businessContactList, tempBusinessContactList);
          
          // 清除全局状态，避免重复处理
          window.contactsPageData = null;
          return;
        } catch (error) {
          console.error("处理全局联系人数据出错:", error);
        }
      }
      
      // 回退到URL参数模式
      if (this.$route.query.updateContacts && this.$refs.form && 
          this.$refs.form.updateBusinessContacts) {
        try {
          console.log("检查全局状态中的联系人数据");
          // 只需要检查路由参数中的时间戳，实际数据从全局状态中获取
          this.$router.replace({ 
            query: Object.assign({}, this.$route.query, {
              updateContacts: undefined
            })
          });
        } catch (error) {
          console.error("处理URL联系人数据出错:", error);
        }
      }
    },
    loadData() {
      if (
        this.$route.query &&
        this.$route.query.expenseItemId &&
        this.$route.query.expenseItemId != "null"
      ) {
        this.ExpenseItemID = parseInt(this.$route.query.expenseItemId);
      } else {
        this.ExpenseItemID = 0;
      }
      if (
        this.$route.query &&
        this.$route.query.expenseReportId &&
        this.$route.query.expenseReportId != "null"
      ) {
        this.ExpenseReportID = parseInt(this.$route.query.expenseReportId);
      } else {
        this.ExpenseReportID = 0;
      }
      if (
        this.$route.query &&
        this.$route.query.IsReview &&
        this.$route.query.IsReview == "true"
      ) {
        this.IsReview = true;
      } else {
        this.IsReview = false;
      }
      if (
        this.$route.query &&
        this.$route.query.expenseTypeId &&
        this.$route.query.expenseTypeId != "null"
      ) {
        this.expenseTypeID = parseInt(this.$route.query.expenseTypeId);
      } else {
        this.expenseTypeID = 0;
      }
      if (
        this.$route.query &&
        this.$route.query.typeName &&
        this.$route.query.typeName != "null"
      ) {
        this.expenseTypeName = this.$route.query.typeName;
      } else {
        this.expenseTypeName = "";
      }
      if (
        this.$route.query &&
        this.$route.query.CostCenterID &&
        this.$route.query.CostCenterID != "null"
      ) {
        this.CostCenterID = parseInt(this.$route.query.CostCenterID);
      } else {
        this.CostCenterID = 0;
      }
      this.loadExpenseTypesList();
      this.loadAttachmentsList();
    },
    loadExpenseTypesList() {
      if (this.expenseTypeID == 0) return;
      if (this.expenseTypeID == 3) {
        this.componentName = "ExType_Meal";
      } else if (this.expenseTypeID == 4) {
        this.componentName = "ExType_RentalCarAirTravel";
      } else if (this.expenseTypeID == 5) {
        this.componentName = "ExType_MealsEntertainment";
      } else if (this.expenseTypeID == 8) {
        this.componentName = "ExType_MileageRunzheimerRate";
      } else if (
        this.expenseTypeID == 1 ||
        this.expenseTypeID == 2 ||
        this.expenseTypeID == 6 ||
        this.expenseTypeID == 7 ||
        this.expenseTypeID == 9 ||
        this.expenseTypeID == 10 ||
        this.expenseTypeID == 11 ||
        this.expenseTypeID == 12 ||
        this.expenseTypeID == 13 ||
        this.expenseTypeID == 14 ||
        this.expenseTypeID == 15 ||
        this.expenseTypeID == 16 ||
        this.expenseTypeID == 17
      ) {
        this.componentName = "ExType_CommonPage";
      }
    },
    loadExpenseItem(data) {
      this.ApprovedByManager = data.ApprovedByManager;
      this.Rejected = data.Rejected;
      this.ReportStatus = data.ReportStatus;
    },
    loadAttachmentsList() {
      if (this.ExpenseItemID == 0) {
        this.attachments = [];
      } else {
        this.$axios
          .get("/Attachments/GetAttachmentsList", {
            params: {
              expenseItemID: this.ExpenseItemID
            }
          })
          .then(response => {
            response.data.forEach(element => {
              element.IsDeleted = false;
              element.url = baseUrl.imageUri + element.ImageGUID;
            });
            this.attachments = response.data;
          });
      }
    },
    goback() {
      this.$router.push({
        name: "NewStep2",
        query: {
          expenseReportID: this.ExpenseReportID,
          status: this.ReportStatus,
          IsReview: this.IsReview
        }
      });
    },
    save() {
      this.IsDisabledBtn = true;
      try {
        this.$refs.form.save(this.attachmentsForSave);
      } catch {
        this.IsDisabledBtn = false;
      }
    },
    DelExpenseItem() {
      tools.confirm("Are you sure you want to delete this expense?").then(result => {
        if (result) {
          this.$axios
            .get("/ExpenseItem/DelExpenseItem", {
              params: {
                expenseItemID: this.ExpenseItemID
              }
            })
            .then(response => {
              if (response.data == "Success") {
                tools.alert("Delete successfully.", 2000, "black", true, false);
                this.goback();
              } else {
                tools.alert(response.data, 3000, "red", true, false);
              }
            });
        }
      });
    },
    delAttachments(item) {
      if (item.AttachmentID > 0) {
        tools.confirm("Are you sure you want to delete this file?").then(result => {
          if (result) {
            if (this.ExpenseItemID > 0) {
              this.attachments.forEach(element => {
                if (element.AttachmentID == item.AttachmentID) {
                  element.IsDeleted = true;
                }
              });
            } else {
              this.attachments.forEach((element, index) => {
                if (element.AttachmentID == item.AttachmentID) {
                  this.attachments.splice(index, 1);
                }
              });
            }
          }
        });
      } else {
        this.attachments.forEach((element, index) => {
          if (element.ImageGUID == item.ImageGUID) {
            this.attachments.splice(index, 1);
          }
        });
      }
    },
    ViewAttachments(item) {
      this.$refs.refViewImage.show(item.url);
    },
    uploadSuccess(data) {
      this.attachments.push({
        AttachmentID: 0,
        FileName: data.name,
        UploadedDate: data.date,
        ImageGUID: data.guid,
        IsDeleted: false,
        url: baseUrl.imageUri + data.guid
      });
    },
    approve() {
      tools.confirm("Are you sure you want to approve this expense?").then(result => {
        if (result) {
          this.$axios
            .get("/ExpenseItem/ApproveExpense", {
              params: {
                expenseItemID: this.ExpenseItemID
              }
            })
            .then(response => {
              if (response.data == "Success") {
                tools.alert("Approve successfully.", 2000, "black", true, false);
                this.ApprovedByManager = true;
                this.Rejected = false;
              } else {
                tools.alert(response.data, 3000, "red", true, false);
              }
            });
        }
      });
    },
    reject() {
      tools.confirm("Are you sure you want to reject this expense?").then(result => {
        if (result) {
          this.$axios
            .get("/ExpenseItem/RejectExpense", {
              params: {
                expenseItemID: this.ExpenseItemID
              }
            })
            .then(response => {
              if (response.data == "Success") {
                tools.alert("Reject successfully.", 2000, "black", true, false);
                this.ApprovedByManager = false;
                this.Rejected = true;
              } else {
                tools.alert(response.data, 3000, "red", true, false);
              }
            });
        }
      });
    }
  }
};
</script>

<style scoped>
.btnright {
  display: flex;
  justify-content: flex-end;
}
.PlaceHolder {
  height: 50px;
}
</style>
