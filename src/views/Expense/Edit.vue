<template>
  <div>
    <v-toolbar
      color="primary"
      height="56"
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
      <v-toolbar-title>({{ id }}) {{ Description }}</v-toolbar-title>      
      <div>
        <div class="smalltext">
          <v-avatar
            v-if="hasThumbnail"
            size="40"
            style="margin-right: 5px;"     
          >
            <v-img :src="avatarsURL" />
          </v-avatar>
          <v-avatar
            v-if="!hasThumbnail"
            color="white"
            size="40"
            style="margin-right: 5px;"            
          >
            <span style="font-weight: 1000; font-size: large; color:rgb(24, 103, 192)">{{ shortName }}</span>
          </v-avatar>
        </div>
      </div>
    </v-toolbar>
    <v-container fluid>
      <v-form>
        <v-toolbar
          flat
          tile
          color="grey-lighten-3"
          class="mb-1 myHeightClass"
          @click="changeSummaryStatus"
        >
          <v-toolbar-title>Summary</v-toolbar-title>
          <div class="flex-grow-1" />
          <div class="flex-grow-1" />
          <v-icon class="me-4">
            {{ ShowSummary ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down' }}
          </v-icon>
        </v-toolbar>
        <div
          v-if="ShowSummary"
          id="divSummary"
          class="mt-4"
        >
          <v-autocomplete
            v-model="CostCenterID"
            label="Cost Center"
            class="Required"
            item-title="text"
            item-value="value"
            :items="costCenterLst"
            :readonly="IsReadOnly"
            :error-messages="CostCenterErrors"
            @input="v$.CostCenterID.$touch()"
            @blur="v$.CostCenterID.$touch()"
          />
          <v-text-field
            v-model="Description"
            label="Expense Description"
            class="Required"
            :readonly="IsReadOnly"
            counter
            :error-messages="DescErrors"
            @input="v$.Description.$touch()"
            @blur="v$.Description.$touch()"
          />

          <v-text-field
            v-if="IsReview"
            v-model="CreationDate"
            label="Creation Date"
            readonly
          />
          <v-text-field
            v-model="Status"
            label="Status"
            readonly
          />
          <v-text-field
            v-model="ClaimCountry"
            label="Reimburse Currency"
            readonly
          />
          <v-text-field
            v-if="IsTravel"
            v-model="TravelLocation"
            label="Travel Location And Date"
            readonly
          />
        </div>
        <v-toolbar
          flat
          color="grey-lighten-3"
          class="mb-2 myHeightClass"
        >
          <v-toolbar-title>Items</v-toolbar-title>
          <v-spacer />
          <v-btn
            v-if="!IsReadOnly"
            size="smaller"
            icon="mdi-refresh"            
            class="me-2"
            @click="RefreshPage"
          />
          <v-btn
            v-if="!IsReadOnly"            
            size="smaller"
            icon="mdi-plus"            
            class="me-4"
            @click="AddItem"
          />
        </v-toolbar>
        <transition name="fade">
          <swiper
            id="swiperBox"
            ref="mySwiper"
            :modules="swiperModules"
            class="swiper-container" 
            :direction="'vertical'"
            :grab-cursor="true"
            :set-wrapper-size="true"
            :slides-per-view="1"
            :mousewheel="false"
            :resistance-ratio="0"
            :height="fixedSwiperHeight"
            :observer="true"
            :observe-parents="true"
            :pagination="{
              type: 'progressbar'
            }"
            @swiper="onSwiper"
            @slide-change="onSlideChange"
            @slide-prev-transition-start="onSlidePrevTransitionStart"
            @slide-next-transition-start="onSlideNextTransitionStart"
          >
            <!-- 第一页 -->
            <swiper-slide
              v-for="pageIndex in pageQty"
              :key="pageIndex"
            >
              <v-list
                id="itemlist"
                two-line
              >
                <v-list-item-group>
                  <template
                    v-for="(item,index) in myList(pageIndex)"
                    :key="item.ExpenseItemID"
                  >
                    <v-divider v-if="index!=0" />
                    <SlideToDelete
                      :disable="IsReadOnly"
                      @delete-line="deleteItem(item.ExpenseItemID)"
                    >
                      <v-list-item class="d-flex align-start">
                        <!-- 左侧内容区域 -->
                        <template #prepend>
                          <div
                            style="min-width: 0; flex: 1 1 auto; overflow: hidden;"
                            @click="editItem(item)"
                          >
                            <v-list-item-title class="expense-type-name">
                              {{ item.ExpenseTypeName }}
                            </v-list-item-title>
                            <v-list-item-subtitle class="text--primary">
                              {{ item.ExpenseDate }}
                            </v-list-item-subtitle>
                          </div>
                        </template>
                        
                        <!-- 右侧图标区域 -->
                        <template #append>
                          <div class="d-flex align-center">
                            <v-icon
                              v-if="item.IsDuplicated"
                              color="red"
                              class="me-1"
                              @click="DisplayMsg(item.DuplicatedMsg,1)"
                            >
                              mdi-exclamation
                            </v-icon>
                            
                            <v-icon 
                              v-if="item.Rejected"
                              color="red" 
                              class="me-1"
                              @click="DisplayMsg(item.RejectedReason,2)"
                            >
                              mdi-close
                            </v-icon>
                            
                            <v-icon 
                              v-if="!item.Rejected&&(item.ApprovedByManager)"
                              color="red" 
                              class="me-1"
                              @click="editItem(item)"
                            >
                              mdi-check
                            </v-icon>
                            
                            <v-icon 
                              v-if="item.RedFlagCount>0"
                              color="red" 
                              class="me-1"
                              @click="editItem(item)"
                            >
                              mdi-flag-variant
                            </v-icon>
                            
                            <v-icon
                              v-if="item.ShowImageEye"
                              class="me-1"
                              @click="$refs.imgView.viewAttachment(`${baseUrl}Attachment/GetImg?id=${item.AttachmentID}&filename=${item.AttachmentName}`,1,item.AttachmentID,item.AttchmentList)"
                            >
                              mdi-image-multiple
                            </v-icon>
                            
                            <v-icon 
                              v-if="item.IsMultiAttchment"
                              class="me-1"
                              @click="editItem(item)"
                            >
                              mdi-paperclip
                            </v-icon>
                            
                            <span 
                              class="ml-1 amount-text"
                              @click="editItem(item)"
                            >
                              {{ formatAmount(item.Amount) }}
                            </span>
                          </div>
                        </template>
                      </v-list-item>
                    </SlideToDelete>
                  </template>
                </v-list-item-group>
              </v-list>
            </swiper-slide>
          </swiper>
        </transition>        
        <v-expansion-panels
          v-model="showTotalDetail"
          accordion
          class="my-2 reverse-panel"
          multiple
        >
          <v-expansion-panel
            readonly
            hide-actions
          >
            <template #title>
              <div class="btnright">
                Grand Total : {{ formatAmount(GrandTotal) }}
              </div>
            </template>
          </v-expansion-panel>
          <v-expansion-panel hide-actions>
            <template #title>
              <div class="btnright">
                <v-icon>{{ showTotalDetail.includes(1) ? "mdi-chevron-double-up" : "mdi-chevron-double-down" }}</v-icon>
                Net Total : {{ formatAmount(netTotal) }}
              </div>
            </template>
            <template #text>
              <div class="Expense_EDIT_totaldetail">
                <v-row>
                  <v-col cols="8">
                    <div class="textright smalltext2">
                      Less: Expenses Paid by KTC:
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="textright">
                      - {{ formatAmount(PaidByKTC) }}
                    </div>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="8">
                    <div class="textright smalltext2 mt-2">
                      Less: Cash Advanced:
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="CashAdvanced"
                      :readonly="IsReadOnly"
                      density="compact"
                      prefix="-"  
                      @focus="onfocus($event)"
                      @input="ValidateNoNumTotalCashRecieved"
                      @change="MoneyTo2DecimalPlaces"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="8">
                    <div class="textright smalltext2 mt-2">
                      Less: Credit Card Refund:
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <v-text-field
                      v-model="CreditCardRefund"
                      :readonly="IsReadOnly"
                      density="compact"
                      prefix="-"  
                      @focus="onfocus($event)"
                      @input="ValidateNoNumTotalCashReturned"
                      @change="MoneyTo2DecimalPlaces"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="8">
                    <div class="textright smalltext2 mt-2">
                      Add: Cash Returned:
                    </div>
                  </v-col>
                  <v-col cols="4">                    
                    <v-text-field
                      v-model="CashReturned"
                      :readonly="IsReadOnly"
                      density="compact"
                      prefix="+"  
                      @focus="onfocus($event)"
                      @input="ValidateNoNumCreditCardRefund"
                      @change="MoneyTo2DecimalPlaces"
                    />
                  </v-col>
                </v-row>
              </div>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>        
        <v-expansion-panels
          v-if="IsReview&&attachmentsForDisplay!=null&&attachmentsForDisplay.length>0"
          class="my-2"
        >
          <v-expansion-panel>
            <template #title>
              Attachments({{ attachmentsForDisplay==null?0:attachmentsForDisplay.length }})
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
                      @delete-line="deleteAttachment(item)"
                    >
                      <v-list-item
                        @click="$refs.imgView.viewAttachment(getAttachmentUrl(item),item.AllowPreview,item.AttachmentID,attachmentsForDisplay)"
                      >
                        <template #prepend>
                          <v-icon>mdi-attachment</v-icon>
                        </template>
                        <v-list-item-title v-text="item.AttachmentName" />
                      </v-list-item>
                    </SlideToDelete>
                  </template>
                </v-list-item-group>
              </v-list>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
        <div class="longButton">
          <v-btn
            v-if="!IsReadOnly"
            color="primary"
            :disabled="IsDisabledBtn"
            class="no-uppercase mr-2 mb-2"
            @click="save(false)"
          >
            Save
            <v-icon end>
              mdi-content-save-outline
            </v-icon>            
          </v-btn>
          <v-btn
            v-if="!IsReadOnly"
            color="primary"
            :disabled="(items.length==0)||IsDisabledBtn"
            class="no-uppercase mr-2 mb-2"
            @click="save(true)"
          >
            Submit
            <v-icon end>
              mdi-publish
            </v-icon>
          </v-btn>
          <v-btn
            v-if="IsReview"
            color="primary"
            :disabled="!(canApprove&&CanReview)"
            class="no-uppercase mr-2 mb-2"
            @click="approve(0)"
          >
            Approve
            <v-icon end>
              mdi-checkbox-marked-circle-outline
            </v-icon>
          </v-btn>
          <v-btn
            v-if="IsReview"
            color="primary"
            :disabled="!CanReview"
            class="no-uppercase mb-2"
            @click="approve(1)"
          >
            Disapprove
            <v-icon end>
              mdi-close-circle-outline
            </v-icon>
          </v-btn>
        </div>
      </v-form>
      <ViewImage
        ref="imgView"
        page="summary"
      />
    </v-container>
  </div>
</template>
<script>
import { useVuelidate } from "@vuelidate/core";
import { required } from "@vuelidate/validators";
import tools from "../../plugins/tools";
import ViewImage from "../../components/ViewImage";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination, Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import SlideToDelete from "../../components/SlideToDelete";
import baseURL from "../../baseUrl";
var routerBaseUrl = baseURL;
if (process.env.NODE_ENV === "production") {
  routerBaseUrl += "Mobile/";
}

export default {
  name: "Edit",
  components: {
    ViewImage,
    SlideToDelete,
    Swiper,
    SwiperSlide
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  validations() {
    return {
      Description: { required },
      CostCenterID: { required }
    }
  },
  data: function() {
    return {
      id: this.$route.params.id,
      employeeName: "",
      baseUrl: routerBaseUrl,
      hasThumbnail: false,      
      shortName:"",
      IsReadOnly: true,
      IsReview: false,
      CanReview: false,
      Status: "",
      Description: null,
      CreationDate: null,
      CostCenterID: 0,
      GrandTotal: 0,
      PaidByKTC: 0,
      CreditCardRefund: 0,
      CashAdvanced: 0,
      CashReturned: 0,
      items: [],
      showTotalDetail: [], // For v-expansion-panels v-model
      costCenterLst: [],
      TripLocation: "",
      TripStartDay: "",
      TripEndDay: "",      ClaimCountry: "",
      IsTravel: false,
      ShowSummary: false,
      showRefreshBtn: true,
      AttachmentList: [],
      canApprove: false,
      IsDisabledBtn:false,
      swiperModules: [Pagination, Virtual],
      FixedRemoveHeight: 370,
      ScalableHeight: 275,
      pageQty: 10,
      itemHeight: 57,
      currentPageIndexForMyList: 1,
      showTopBtn: false,
      sessionKey_CashAdvanced: "CashAdvanced",
      sessionKey_CashReturned: "CashReturned",
      sessionKey_CreditCardFund: "CreditCardFund",
      avatarsURL: "",
      swiperInstance: null,
      swiperHeight: window.innerHeight - 600
    };
  },
  computed: {
    attachmentsForDisplay() {
      if (this.AttachmentList && this.AttachmentList.length > 0) {
        return this.AttachmentList.filter(function(item) {
          return !item.IsDeleted;
        });
      }
      return null;
    },
    fixedSwiperHeight() {
      var result=this.swiperHeight>200?this.swiperHeight:200;
      if(result%this.itemHeight!=0){
        result= Math.ceil(result / this.itemHeight) * this.itemHeight;
      }
      return result+12;
    },
    pageSize() {
      var result=parseInt(this.fixedSwiperHeight / this.itemHeight);
      return result > 3 ? result : 3;
    },
    swiper() {
      return this.$refs.mySwiper.swiper;
    },
    computeHeight() {
      var myStyle = "height:250px; overflow:auto;";
      return myStyle;
    },
    TravelLocation() {
      return (
        this.TripLocation + ", " + this.TripStartDay + " To " + this.TripEndDay
      );
    },
    netTotal: {
      get: function() {
        function strip(num, precision = 12) {
          return +parseFloat(num.toPrecision(precision));
        }
        return strip(
          this.GrandTotal -
            this.PaidByKTC -
            parseFloat(tools.clearNoNum(this.CreditCardRefund) || 0) -
            parseFloat(tools.clearNoNum(this.CashAdvanced) || 0) +
            parseFloat(tools.clearNoNum(this.CashReturned) || 0)
        );
      }
    },
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
  mounted: function() {
    this.InitApproveBtn();
  },
  created: function() {
    if (sessionStorage.getItem(tools.data.sessionKey_swiperOptionHeight) != null){
      this.swiperHeight=parseInt(sessionStorage.getItem(tools.data.sessionKey_swiperOptionHeight));
    }else{
      sessionStorage.setItem(tools.data.sessionKey_swiperOptionHeight,this.swiperHeight);
    }
    this.IsReview = this.$route.path.toLowerCase().indexOf("/review") >= 0;

    tools.getCostCenter(value => {
      if (this.costCenterLst.length > 0) {
        this.costCenterLst.splice(0, this.costCenterLst.length);
      }
      this.costCenterLst = value;
    });

    this.loadReport(this.id);
    this.currentPageIndexForMyList =
      sessionStorage.getItem(tools.data.sessionKey_ActivePage) == null ||
      sessionStorage.getItem(tools.data.sessionKey_ActivePage) == "undefined"
        ? 1
        : parseInt(sessionStorage.getItem(tools.data.sessionKey_ActivePage)) +
          1;
    var originalObject = this;
    this.loadExpenseItemList(this.currentPageIndexForMyList, function() {
      originalObject.AlertMsg(1);
    });
  },
  methods: {
    onSwiper(swiper) {
      this.swiperInstance = swiper;
      this.swiperInstance.el.style.height = `${this.fixedSwiperHeight}px`;
    },
    onSlideChange() {
      this.loadExpenseItemList(this.swiperInstance.realIndex + 1);
      this.currentPageIndexForMyList = this.swiperInstance.realIndex + 1;
      sessionStorage.setItem(
        tools.data.sessionKey_ActivePage,
        this.swiperInstance.realIndex
      );
      this.AlertMsg(this.swiperInstance.realIndex + 1);
    },
    onSlidePrevTransitionStart() {
      if (this.swiperInstance.realIndex > 0) this.showTopBtn = true;
      else {
        this.showTopBtn = false;
        this.showRefreshBtn = true;
      }
    },
    onSlideNextTransitionStart() {
      this.showTopBtn = true;
      this.showRefreshBtn = false;
    },
    IsHasImg(pathImg) {
      var ImgObj = new Image();
      ImgObj.src = pathImg;
      if (ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0))
        return true;
      else return false;
    },
    InitApproveBtn() {
      var res = true;
      var originalObject = this;
      tools.getExpenseItemList(this.id, response => {
        console.log(response);
        if (response && response.length > 0) {
          for (let i = 0; i < response.length; i++) {
            const item = response[i];
            if (
              item.RedFlagCount > 0 &&
              !item.ApprovedByManager &&
              !item.Rejected
            ) {
              res = false;
              break;
            }
          }
        }
        originalObject.canApprove = res;
      });
    },
    async deleteAttachment(item) {
      if (
        await tools.confirm(
          "Are you sure to delete this file: " + item.AttachmentName + "?"
        )
      ) {
        item.IsDeleted = true;
      }
    },
    getAttachmentUrl(item) {
      if (item.AttachmentID > 0) {
        return `${baseUrl}Attachment/GetImg?id=${item.AttachmentID}&filename=${item.AttachmentName}`;
      } else {
        return `${baseUrl}TempFile/${item.AttachmentFileName}`;
      }
    },
    initSessinData() {
      if (sessionStorage.getItem(tools.data.sessionKey_CostCenterID) != null)
        this.CostCenterID = parseInt(
          sessionStorage.getItem(tools.data.sessionKey_CostCenterID)
        );
      if (sessionStorage.getItem(tools.data.sessionKey_Description) != null)
        this.Description = sessionStorage.getItem(
          tools.data.sessionKey_Description
        );
      if (sessionStorage.getItem(tools.data.sessionKey_ShowSummary) != null)
        this.ShowSummary =
          sessionStorage.getItem(tools.data.sessionKey_ShowSummary) == "true";

      if (sessionStorage.getItem(tools.data.sessionKey_CashAdvanced) != null)
        this.CashAdvanced = sessionStorage.getItem(
          tools.data.sessionKey_CashAdvanced
        );
      if (sessionStorage.getItem(tools.data.sessionKey_CashReturned) != null)
        this.CashReturned = sessionStorage.getItem(
          tools.data.sessionKey_CashReturned
        );
      if (sessionStorage.getItem(tools.data.sessionKey_CreditCardFund) != null)
        this.CreditCardRefund = sessionStorage.getItem(
          tools.data.sessionKey_CreditCardFund
        );
    },
    RefreshPage() {
      tools.clearExpenseReport(this.id);
      tools.clearExpenseItemList(this.id);
      this.loadReport(this.id);
      var originalObject = this;
      this.loadExpenseItemList(this.currentPageIndexForMyList, function() {
        originalObject.AlertMsg(1);
      });
    },
    SkipTopOne() {
      if (this.swiper) {
        this.swiper.slideTo(0, 1000, false);
        this.showTopBtn = false;
      }
    },
    myList(pageIndex) {
      var targetList = [];
      var targetIndex = -1;
      var currentIndex = this.currentPageIndexForMyList;
      var pageCount = this.pageQty;
      var currentList = this.items;

      if (currentIndex == 1 && pageIndex <= 2) targetIndex = pageIndex - 1;
      else if (currentIndex == pageCount && pageIndex >= pageCount - 1)
        targetIndex = pageIndex - (pageCount - 1);
      else if (
        currentIndex < pageCount &&
        pageIndex >= currentIndex - 1 &&
        pageIndex <= currentIndex + 1
      )
        targetIndex = pageIndex - (currentIndex - 1);
      if (targetIndex != -1) targetList = currentList[targetIndex];

      return targetList;
    },
    AlertMsg(activeIndex) {
      var activeList = this.myList(activeIndex);
      if (activeList) {
        var index = 0;
        var message = "";
        var listCount = activeList.length;
        var isFullPage = this.pageSize == listCount - 1;
        activeList.forEach(t => {
          index++;

          var msg = "";
          if ((listCount != index && isFullPage) || !isFullPage) {
            msg = this.GetMsgList(t.DuplicatedMsg, t.RejectedReason, index);
          }
          if (msg != "") message += msg;
        });
        if (message != "") {
          tools.alertWarning(message, 5000, "yellow darken-3", true, true);
        }
      }
    },
    loadReport(reportID) {
      tools.getExpenseReport(reportID, response => {
        this.CostCenterID = response.CostCenterID;
        this.Description = response.Description;        
        this.employeeName =
          response.ReportOwner.FirstName + " " + response.ReportOwner.LastName;
        this.shortName = response.ReportOwner.FirstName.substring(0,1).toUpperCase()+response.ReportOwner.LastName.substring(0,1).toUpperCase();
        this.avatarsURL =
          this.baseUrl +
          "img/Avatars/" +
          response.ReportOwner.EmailAddress +
          ".jpg";        
        this.hasThumbnail = response.ReportOwner.HasThumbnail;        
        var ReportAccount = response.ReportAccount;
        this.GrandTotal = ReportAccount.GrandTotal;
        this.CreationDate = tools.formatDateAsLocal(response.CreationDate);
        this.PaidByKTC = ReportAccount.PaidByKTC;
        this.CreditCardRefund = tools.formatAmount(
          ReportAccount.CreditCardRefund
        );
        this.CashAdvanced = tools.formatAmount(ReportAccount.CashAdvanced);
        this.CashReturned = tools.formatAmount(ReportAccount.CashReturned);
        this.Status = response.ReportStatus.Status;
        this.IsReadOnly =
          this.IsReview || !tools.isEditable(response.ReportStatus);
        this.CanReview =
          this.IsReview && tools.canReview(response.ReportStatus);
        this.IsTravel = response.IsTravel;
        this.ClaimCountry = response.ClaimCountry;
        this.TripLocation = response.TripLocation;
        this.TripStartDay = tools.formatDateAsOriginalForUS(
          response.TripStartDay
        );
        this.AttachmentList = response.AttachmentList;
        this.TripEndDay = tools.formatDateAsOriginalForUS(response.TripEndDay);
        this.initSessinData();
      });
    },
    loadExpenseItemList(pageIndex, callback) {
      tools.getPagedExpenseItemList(
        this.id,
        this.pageSize,
        pageIndex,
        response => {
          //if (pageIndex > response.PageQty && response.PageQty > 0) return;
          if (this.items.length > 0) {
            this.items.splice(0, this.items.length);
          }
          this.pageQty = response.PageQty;
          this.currentPageIndexForMyList = pageIndex;
          if (this.pageQty > 0) {
            response.Items.forEach(item1 => {
              var subList = [];
              item1.forEach(item => {
                subList.push({
                  ExpenseItemID: item.ExpenseItemID,
                  ExpenseTypeID: item.ExpenseTypeID,
                  ExpenseTypeName: item.GLCodeDescription,
                  //ExpenseDate: tools.formatDateAsOriginalForUS(item.ExpenseDate),
                  ExpenseDate: tools.formatDateAsOriginalForUS(
                    item.ExpenseDate
                  ),
                  CostCenterID: item.CostCenterID,
                  ShowImageEye: item.ShowImageEye,
                  RedFlagCount: item.RedFlagCount,
                  AttachmentID:
                    item.AttchmentList && item.AttchmentList.length > 0
                      ? item.AttchmentList[0].AttachmentID
                      : null,
                  AttchmentList: item.AttchmentList,
                  AttachmentName:
                    item.AttchmentList && item.AttchmentList.length > 0
                      ? item.AttchmentList[0].AttachmentName
                      : null,
                  Amount: item.ClaimAmountReimburseCurr,
                  Rejected: item.Rejected,
                  ApprovedByManager: item.ApprovedByManager,
                  ApprovedByAP: item.ApprovedByAP,
                  IsDuplicated: item.IsDuplicated,
                  DuplicatedMsg: item.DuplicatedMsg,
                  RejectedReason: item.RejectedReason,
                  IsMultiAttchment: item.IsMultiAttchment
                });
              });
              this.items.push(subList);
            });
          }
          if (this.swiperInstance) {
            this.swiperInstance.el.style.height = `${this.fixedSwiperHeight}px`;
            this.swiperInstance.update();
          }
          if (callback) {
            callback();
          }
        }
      );
    },
    goback() {
      tools.clearReportSession();
      var query = {};
      if (this.IsReview) {
        query.fromReview = 2;
      } else {
        query.fromReview = 1;
      }
      this.$router.push({
        path: "/",
        query: query
      });
    },
    changeSummaryStatus() {
      this.ShowSummary = !this.ShowSummary;
      this.swiperHeight = this.ShowSummary
        ? this.swiperHeight - this.ScalableHeight
        : this.swiperHeight + this.ScalableHeight;
      this.loadExpenseItemList(this.currentPageIndexForMyList);
      
    },
    async deleteItem(expenseItemID) {
      if (await tools.confirm("Are you sure to delete it?")) {
        this.$axios
          .post("/ExpenseReport/DeleteExpenseItem", {
            expenseReportID: this.id,
            expenseItemID: expenseItemID
          })
          .then(response => {
            console.log(response);
            var msg = !response.data
              ? "Deleted Item Successfully!"
              : response.data;
            if (!response.data) {
              //tools.clearExpenseReport(this.id);
              //tools.clearExpenseItemList(this.id);
              tools.deleExpenseItem(this.id, expenseItemID);
              //tools.clearExpenseReportList(1);
              this.loadReport(this.id);

              this.loadExpenseItemList(this.currentPageIndexForMyList);
              tools.alert(msg);
            }
          });
      }
    },
    DisplayMsg(msg, type) {
      var messages = "";
      if (type == 2) messages = "Reason for rejection: " + msg;
      else messages = msg;

      if (messages != "")
        tools.alertWarning(messages, 5000, "yellow darken-3", true, true);
    },
    GetMsgList(duplicatedMsg, rejectedReason, index) {
      var msg = "";
      if (duplicatedMsg != null && duplicatedMsg != "") {
        msg += "Item " + index + ": " + duplicatedMsg + "<br />";
      }
      if (rejectedReason != null && rejectedReason != "") {
        msg +=
          "Item " +
          index +
          ": Reason for rejection: " +
          rejectedReason +
          "<br />";
      }
      return msg;
    },
    async save(isSubmit) {
      this.v$.$touch();
      if (this.v$.$invalid) {
        return;
      }
      this.IsDisabledBtn=true;
      if (isSubmit) {
        var IsDuplicatedFlag = false;
        this.items.forEach(item => {
          item.forEach(i => {
            if (i.IsDuplicated) {
              IsDuplicatedFlag = true;
            }
          });
        });
        if (IsDuplicatedFlag) {
          if (
            !(await tools.confirm(
              "There are some duplicate items, are you sure to continue?"
            ))
          ) {
            return false;
          }
        }
      }
      this.CreditCardRefund=tools.clearNoNum(this.CreditCardRefund);
      this.CashAdvanced=tools.clearNoNum(this.CashAdvanced);
      this.CashReturned=tools.clearNoNum(this.CashReturned);

      this.$axios
        .post("/ExpenseReport/UpdateExpenseReport", {
          ExpenseReportID: this.id,
          Description: this.Description,
          CostCenterID: this.CostCenterID,
          ReportAccount: {
            CreditCardRefund: this.CreditCardRefund,
            CashAdvanced: this.CashAdvanced,
            CashReturned: this.CashReturned
          }
        })
        .then(response => {
          console.log(response);
          if (isSubmit) {
            this.saveSession(null);
            this.$router.push(`/Submit/${this.id}`);
          } else {
            if (response.data.ExpenseReportID > 0) {
              tools.updateExpenseReport(response.data);
              tools.alert("Save Report successfully.");
              this.goback();
            }else{
              this.IsDisabledBtn=false;
              tools.alert("Failed To Update Report", 2000, 'error', false);
            }
            //tools.clearExpenseReport(this.id);
            //tools.updateExpenseReport(this.id, 0, this.CostCenterID, this.Description, this.Status, this.CashAdvanced, this.CashReturned, this.CreditCardRefund, 0);
            //tools.clearExpenseItemList(this.id);
            //tools.clearExpenseReportList(1);
          }
        })
        .catch(error => {
          this.IsDisabledBtn=false;
          tools.alert(error, 2000, 'error', false);
          console.log(error);
        });
    },
    async approve(isReject) {
      if (isReject == 0) {
        var IsDuplicatedFlag = false;
        this.items.forEach(item => {
          item.forEach(i => {
            if (i.IsDuplicated) {
              IsDuplicatedFlag = true;
            }
          });
        });
        if (IsDuplicatedFlag) {
          if (
            !(await tools.confirm(
              "There are some duplicate items, are you sure to continue?"
            ))
          ) {
            return false;
          }
        }
      }
      this.$router.push({
        path: "/Approve",
        query: {
          expenseReportID: this.id,
          IsReject: isReject
        }
      });
    },
    AddItem() {
      this.saveSession(null);
      this.$router.push({
        path: "/NewItem/" + this.id
      });
    },
    editItem(item) {
      this.saveSession(item);
      this.$router.push({
        path:
          (this.IsReview ? "/ReviewItem/" : "/EditItem/") + item.ExpenseItemID
      });
    },
    saveSession(item) {
      sessionStorage.setItem(tools.data.sessionKey_ReportID, this.id);
      sessionStorage.setItem(
        tools.data.sessionKey_CostCenterID,
        this.CostCenterID
      );
      sessionStorage.setItem(
        tools.data.sessionKey_Description,
        this.Description
      );
      sessionStorage.setItem(
        tools.data.sessionKey_ShowSummary,
        this.ShowSummary
      );
      sessionStorage.setItem(
        tools.data.sessionKey_CashAdvanced,
        this.CashAdvanced
      );
      sessionStorage.setItem(
        tools.data.sessionKey_CashReturned,
        this.CashReturned
      );
      sessionStorage.setItem(
        tools.data.sessionKey_CreditCardFund,
        this.CreditCardRefund
      );
      if (item != null) {
        sessionStorage.setItem(
          tools.data.sessionKey_ItemTypeID,
          item.ExpenseTypeID
        );
        sessionStorage.setItem(
          tools.data.sessionKey_ItemTypeName,
          item.ExpenseTypeName
        );
      }
    },
    onfocus(e) {
      e.currentTarget.select();
    },
    MoneyTo2DecimalPlaces() {
      if (this.CashAdvanced != null && this.CashAdvanced != "")
        this.CashAdvanced = this.formatAmount(this.CashAdvanced);
      else this.CashAdvanced = (0.0).toFixed(2);

      if (this.CreditCardRefund != null && this.CreditCardRefund != "")
        this.CreditCardRefund = this.formatAmount(this.CreditCardRefund);
      else this.CreditCardRefund = (0.0).toFixed(2);

      if (this.CashReturned != null && this.CashReturned != "")
        this.CashReturned = this.formatAmount(this.CashReturned);
      else this.CashReturned = (0.0).toFixed(2);
    },
    ValidateNoNumTotalCashRecieved() {
      if (this.CashAdvanced != null && this.CashAdvanced != "") {
        this.CashAdvanced = tools.clearNoNum(this.CashAdvanced);
      } else this.CashAdvanced = null;
    },
    ValidateNoNumTotalCashReturned() {
      if (this.CreditCardRefund != null && this.CreditCardRefund != "") {
        this.CreditCardRefund = tools.clearNoNum(this.CreditCardRefund);
      } else this.CreditCardRefund = null;
    },
    ValidateNoNumCreditCardRefund() {
      if (this.CashReturned != null && this.CashReturned != "") {
        this.CashReturned = tools.clearNoNum(this.CashReturned);
      } else this.CashReturned = null;
    },
    formatAmount: tools.formatAmount
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
.smalltext2 {
  font-size: 14px;
}
.avatatext {
  font-size: 20px;
}
.totalpanel {
  line-height: 35px;
  color: #000;
  background-color: gray;
}
.btnright {
  text-align: right;
  display: table-cell;
  width: 100%;
}
.btncenter {
  text-align: center;
  display: table-cell;
}
.textright {
  text-align: right;
}
.WarningMsg .v-card__text {
  color: black;
  background: rgba(255, 183, 183, 0.699);
  font-size: 12px;
  width: 100%;
  padding: 2px;
  padding-top: 25px;
}
.WarningMsg .v-card__text .v-icon {
  color: rgb(145, 129, 129);
  float: right;
  position: absolute;
  top: 0px;
  right: 0px;
  font-size: 36px;
}
.Expense_EDIT_totaldetail {
  margin-top: 10px;;
}
.Expense_EDIT_totaldetail .v-col{
  padding: 0px;
}
.v-expansion-panel--active:not(:first-child), .v-expansion-panel--active + .v-expansion-panel {
    margin-top: 1px;
}
#divSummary > div.v-input{
  height: 56px;
}
</style>

<style>
#itemlist .v-list-item__title {
  white-space: normal;
  text-overflow: clip;
}
#itemlist .v-list-item__content {
  padding: 0px;
}
#itemlist .v-list-item {
  display: flex;
  justify-content: space-between;
}
#itemlist .v-list-item__prepend {
  flex: 1;
}
#itemlist .v-list-item__append {
  margin-left: 8px;
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}
.expense-type-name {
  overflow: visible !important;
  text-overflow: initial !important;
  white-space: normal !important;
  flex: 1 1 auto !important;
  min-width: 0;
}
.amount-text {
  white-space: nowrap;
  min-width: 60px;
  text-align: right;
}
.Expense_EDIT_totaldetail {
  padding-bottom: 0px;
}
.myHeightClass {
  height: 40px !important;
}
.myHeightClass .v-toolbar__content {
  height: 40px !important;
}
.myHeightClass .v-toolbar__title {
  font-size: 1.1rem;
}

.reverse-panel .v-expansion-panel-text {
  order: 1;
}

.reverse-panel .v-expansion-panel-title {
  order: 2;
  border-top: thin solid rgba(0, 0, 0, 0.12);
  border-bottom: none !important;
}

/* 如果需要移除默认边框 */
.reverse-panel .v-expansion-panel {
  display: flex;
  flex-direction: column;
}
.v-expansion-panel-title__overlay {
    background-color: #fff;
}
</style>
