<template>
  <v-card class="app_body">
    <v-toolbar
      color="primary"
      height="56"
      dark
      flat
    >
      <div style="margin-left: 8px;">
        <v-img
          width="30px"
          height="30px"
          :src="logImgUrl"
        />
      </div>

      <v-toolbar-title style="margin-top: 5px; margin-left: auto; font-size: larger;">
        <span style="font-size: x-large;">Expense Manager </span>
        <span style="margin-left: 10px; font-size:small;">{{ version }}</span>
      </v-toolbar-title>
      <span class="extra-title1">{{ ExtraTitle }}</span>
      <div>
        <div class="smalltext">
          <v-avatar
            v-if="hasThumbnail"
            size="40"
            style="margin-right: 10px;"
          >
            <v-img :src="avatarsURL" />
          </v-avatar>
          <v-avatar
            v-if="!hasThumbnail"
            color="white"
            size="40"
            style="margin-right: 10px;"
          >
            <span style="font-weight: 1000; font-size: large; color:rgb(24, 103, 192)">{{ shortName }}</span>
          </v-avatar>
        </div>
      </div>
    </v-toolbar>
    <v-bottom-navigation
      v-model="tab"
      bg-color="primary accent-4"
      height="56"
    >
      <v-btn to="/NewStep1">
        <v-icon size="large">
          mdi-plus-box-outline
        </v-icon>
        <span>New</span>
      </v-btn>
      <v-btn
        v-if="IsDisplayMyExpense"
        value="tab-1"
      >
        <v-icon size="large">
          mdi-currency-usd
        </v-icon>
        <span>Expense</span>
      </v-btn>
      <v-btn
        v-if="IsManager"
        value="tab-2"
      >
        <v-icon size="large">
          mdi-account-multiple-check
        </v-icon>
        <span>Approval</span>
      </v-btn>

      <v-menu
        location="top"
        transition="scale-transition"
      >
        <template #activator="{ props }">
          <v-btn
            icon="mdi-dots-vertical"
            variant="text"
            v-bind="props"
          />
        </template>

        <v-list>
          <v-list-item>
            <template #append>
              <v-btn
                variant="text"
                @click="Help(true)"
              >
                <v-icon>mdi-help</v-icon>
                Help
              </v-btn>
            </template>
          </v-list-item>
          <v-divider />
          <v-list-item>
            <template #append>
              <v-btn
                variant="text"
                @click="logout()"
              >
                <v-icon>mdi-logout</v-icon>
                Logout
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-bottom-navigation>
    <v-window
      v-model="tab"
      :touch="{ left: null, right: null }"
    >
      <v-window-item :value="'tab-1'">
        <v-card
          v-if="showRefreshBtn"
          flat
          class="floatbtn1"
        >
          <v-card-actions>
            <v-btn
              to="#"
              class="mx-2 floatbtnColor"
              icon="mdi-refresh"
              size="large"
              variant="elevated"
              @click="RefreshPage"
            />
          </v-card-actions>
        </v-card>
        <v-card
          v-if="showTopBtn"
          flat
          class="floatbtn1"
        >
          <v-card-actions>
            <v-btn
              to="#"
              class="mx-2 floatbtnColor"
              icon="mdi-arrow-collapse-up"
              size="large"
              variant="elevated"
              @click="SkipTopOne"
            />
          </v-card-actions>
        </v-card>
        <transition name="fade">
          <Swiper
            id="swiperBox"
            ref="mySwiper"
            :modules="modules"
            :direction="'vertical'"
            :grab-cursor="true"
            :set-wrapper-size="true"
            :auto-height="true"
            :slides-per-view="1"
            :mousewheel="false"
            :height="getWindowHeight()"
            :resistance-ratio="0"
            :observer="true"
            :observe-parents="true"
            :pagination="{
              type: 'progressbar'
            }"
            class="swiper-container"
            @swiper="onSwiper"
            @slide-change="onSlideChange"
            @slide-prev-transition-start="onSlidePrevTransitionStart"
            @slide-next-transition-start="onSlideNextTransitionStart"
          >
            <SwiperSlide
              v-for="index in pageQty"
              :key="index"
            >
              <v-list two-line>
                <v-list-item-group>
                  <template
                    v-for="(item) in myList(index)"
                    :key="item.id"
                  >
                    <v-divider />
                    <SlideToDelete
                      :disable="!item.isEditable"
                      @delete-line="deleteReport(item.id)"
                    >
                      <v-list-item @click="$router.push(`/Edit/${item.id}`)">
                        <v-list-item-title v-text="item.desc" />
                        <v-list-item-subtitle
                          :class="item.statusClass"
                          v-text="item.status"
                        />
                        <template #append>
                          <v-icon
                            v-if="item.RedFlag_Count > 0"
                            color="red"
                            class="me-2"
                          >
                            mdi-flag-variant
                          </v-icon>
                          <div class="d-flex flex-column align-end">
                            <span v-text="item.date" />
                            <span v-text="item.total" />
                          </div>
                        </template>
                      </v-list-item>
                    </SlideToDelete>
                  </template>
                </v-list-item-group>
              </v-list>
            </SwiperSlide>
          </Swiper>
        </transition>
      </v-window-item>
      <v-window-item :value="'tab-2'">
        <v-card
          v-if="showRefreshBtnForPending"
          flat
          class="floatbtn"
        >
          <v-card-actions>
            <v-btn
              to="#"
              class="mx-2 floatbtnColor"
              icon="mdi-refresh"
              size="large"
              variant="elevated"
              @click="RefreshPage"
            />
          </v-card-actions>
        </v-card>
        <v-card
          v-if="showTopBtnForPending"
          flat
          class="floatbtn"
        >
          <v-card-actions>
            <v-btn
              to="#"
              class="mx-2 floatbtnColor"
              icon="mdi-arrow-collapse-up"
              size="large"
              variant="elevated"
              @click="SkipTopOne"
            />
          </v-card-actions>
        </v-card>
        <transition name="fade">
          <Swiper
            id="swiperBox1"
            ref="mySwiper1"
            :modules="modules"
            :direction="'vertical'"
            :grab-cursor="true"
            :set-wrapper-size="true"
            :auto-height="true"
            :slides-per-view="1"
            :mousewheel="false"
            :height="getWindowHeight()"
            :resistance-ratio="0"
            :observer="true"
            :observe-parents="true"
            :pagination="{
              type: 'progressbar'
            }"
            class="swiper-container"
            @swiper="onSwiper2"
            @slide-change="onSlideChange"
            @slide-prev-transition-start="onSlidePrevTransitionStart"
            @slide-next-transition-start="onSlideNextTransitionStart"
          >
            <SwiperSlide
              v-for="index in pageQtyForPending"
              :key="index"
            >
              <v-list three-line>
                <v-list-item-group>
                  <template
                    v-for="(item) in myList(index)"
                    :key="item.id"
                  >
                    <v-divider />
                    <v-list-item
                      class="v-list-item_List2"
                      @click="$router.push(`/Review/${item.id}`)"
                    >
                      <v-list-item-title v-text="item.desc" />
                      <v-list-item-subtitle
                        class="text--primary"
                        v-text="item.user"
                      />
                      <v-list-item-subtitle
                        :class="item.statusClass"
                        v-text="item.status"
                      />
                      <template #append>
                        <v-icon
                          v-if="item.RedFlag_Count > 0"
                          color="red"
                          class="me-2"
                        >
                          mdi-flag-variant
                        </v-icon>
                        <div class="d-flex flex-column align-end">
                          <span v-text="item.date" />
                          <span v-text="item.total" />
                        </div>
                      </template>
                    </v-list-item>
                  </template>
                </v-list-item-group>
              </v-list>
            </SwiperSlide>
          </Swiper>
        </transition>
      </v-window-item>
    </v-window>

    <v-dialog
      v-model="dialog"
      fullscreen
      :scrim="false"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar
          dark
          height="56"
          color="primary"
        >
          <v-btn
            icon
            dark
            @click="Help(false)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>{{ helpContent }}</v-toolbar-title>
          <v-spacer />
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn
                dark
                icon
                v-bind="props"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(item, i) in items"
                :key="i"
                @click="helpContentID = i"
              >
                <v-list-item-title><span style="font-size: 15px;">{{ item.title }}</span></v-list-item-title>&nbsp;
                <v-icon
                  v-if="i == 0"
                  color="red"
                >
                  mdi-thumb-up
                </v-icon>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
        <component
          :is="componentName"
          ref="form"
        />
      </v-card>
    </v-dialog>
  </v-card>
</template>
<script>
import tools from "../plugins/tools";
import { defineAsyncComponent } from 'vue';
import baseURL from "../baseUrl";
import SlideToDelete from "../components/SlideToDelete";
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Virtual } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import ViewImage from '../components/ViewImage.vue';
var routerBaseUrl = baseURL;
if (process.env.NODE_ENV === "production") {
  routerBaseUrl += "Mobile/";
}

export default {
  name: "Home",
  components: {
    SlideToDelete,
    Swiper,
    SwiperSlide,
    AddToHome: defineAsyncComponent(() =>
      import(/* webpackChunkName: "AddToHome" */ "./Help/AddToHome")),
    AddToFavorites: defineAsyncComponent(() =>
      import(/* webpackChunkName: "AddToFavorites" */ "./Help/AddToFavorites"))
  },
  data: function () {
    return {
      dialog: false,
      helpContentID: 0,
      swiperInstance: null,
      swiperInstance2: null,
      IsManager: false,
      hasThumbnail: false,
      shortName: "",
      baseUrl: routerBaseUrl,
      avatarsURL: "",
      pageQty: 10,
      pageQtyForPending: 10,
      currentPageIndexForMyList: 1,
      currentPageIndexForPending: 1,
      pageSize: 12,
      pageSizeForPending: 8,
      logImgUrl: "",
      list: [],
      pendingList: [],
      tab: "tab-1",
      showPlusBtn: true,
      showTopBtn: false,
      showTopBtnCache: false,
      showTopBtnForPending: false,
      showTopBtnForPendingCache: false,
      showRefreshBtnCache: true,
      showRefreshBtn: true,
      showRefreshBtnForPending: true,
      showRefreshBtnForPendingCache: true,
      IsDisplayMyExpense: false,
      ExtraTitle: "",
      version: "",
      currentSwiper: Object,
      currentSwiperForPending: Object,
      sessionKeyMyList: "Home_MyList_ActivePageIndex",
      sessionKeyPending: "Home_MyPeindingList_ActivePageIndex",      // 添加 Swiper 模块
      modules: [Pagination, Virtual],
      items: [
        {
          id: 0,
          title: "Add To Home Screen",
          url: "AddToHome",

        },
        {
          id: 1,
          title:
            tools.mobileType() == 0 ? "Add To Favorites" : "Add To Bookmarks",
          url: "AddToFavorites",
        }
      ]
    };
  },
  computed: {
    componentName() {
      return this.items[this.helpContentID].url;
    },
    helpContent() {
      return this.items[this.helpContentID].title;
    },
  },

  mounted: function () {
    this.logImgUrl = this.baseUrl + "img/kingstonlogo.svg";
    var currentSwiper =
      this.tab == "tab-1"
        ? this.swiperInstance
        : this.swiperInstance2;
    var currentActivePageIndex =
      this.tab == "tab-1"
        ? sessionStorage.getItem(this.sessionKeyMyList) != null &&
          sessionStorage.getItem(this.sessionKeyMyList) != "undefined"
          ? parseInt(sessionStorage.getItem(this.sessionKeyMyList))
          : 0
        : sessionStorage.getItem(this.sessionKeyPending) != null &&
          sessionStorage.getItem(this.sessionKeyPending) != "undefined"
          ? parseInt(sessionStorage.getItem(this.sessionKeyPending))
          : 0;
    currentActivePageIndex > 0
      ? currentSwiper.slideTo(currentActivePageIndex)
      : null;
    this.pageSize = parseInt(this.getWindowHeight() / 56);
    this.pageSizeForPending = parseInt(this.getWindowHeight() / 88);
    tools.getVersion(value => {
      this.version = value;
    });
    tools.getCurrentUser(value => {
      this.IsManager = value.IsManager;
      this.hasThumbnail = value.HasThumbnail;
      this.shortName = value.FirstName.substring(0, 1).toUpperCase() + value.LastName.substring(0, 1).toUpperCase();

      this.avatarsURL =
        this.baseUrl +
        "img/Avatars/" +
        value.EmailAddress +
        ".jpg";
      var myListAcitveIndex = sessionStorage.getItem(this.sessionKeyMyList);
      var pendingListActiveIndex = sessionStorage.getItem(
        this.sessionKeyPending
      );
      if (this.IsManager) {
        if (this.$route.query.fromReview || this.$route.query.fromReview >= 0) {
          this.tab = this.$route.query.fromReview == 2 ? "tab-2" : "tab-1";
        }
        else {
          this.tab = "tab-1";
        }
        pendingListActiveIndex =
          pendingListActiveIndex == null ||
            pendingListActiveIndex == "undefined"
            ? 1
            : parseInt(pendingListActiveIndex) + 1;

        this.loadPendingList(pendingListActiveIndex);
      }
      else {
        this.tab = "tab-1";
      }

      myListAcitveIndex =
        myListAcitveIndex == null || myListAcitveIndex == "undefined"
          ? 1
          : parseInt(myListAcitveIndex) + 1;
      tools.getIsDisplayMyExpense(result => {
        this.IsDisplayMyExpense = result.toLowerCase() == "true";
        if (this.IsDisplayMyExpense) this.loadMyExpenseList(myListAcitveIndex);
      });
    });

    tools.getExtraTitle(result => {
      this.ExtraTitle = result;
    });

    if (tools.isFirstLogin()) {
      this.Help(true);
    }
  },
  created: function () {
  },
  methods: {
    helpOrLogout(title) {
      if (title == "Help") {
        this.Help(true);
      } else {
        this.logout();
      }
    },
    onSwiper(swiper) {
      this.swiperInstance = swiper;
    },
    onSwiper2(swiper) {
      this.swiperInstance2 = swiper;
    },
    onSlideChange() {
      if (this.tab == "tab-1") {
        let swiper = this.swiperInstance;
        this.loadMyExpenseList(swiper.realIndex + 1);
        sessionStorage.setItem(this.sessionKeyMyList, swiper.realIndex);
      }
      if (this.tab == "tab-2") {
        let swiper = this.swiperInstance2;
        this.loadPendingList(swiper.realIndex + 1);
        sessionStorage.setItem(
          this.sessionKeyPending,
          swiper.realIndex
        );
      }
    },
    onSlidePrevTransitionStart() {
      if (this.tab == "tab-1") {
        this.currentSwiper = this.swiperInstance;
        if (this.currentSwiper.realIndex > 0) this.showTopBtn = true;
        else {
          this.showTopBtn = false;
          this.showRefreshBtn = true;
        }
      } else {
        this.currentSwiperForPending = this.swiperInstance2;
        if (this.currentSwiperForPending.realIndex > 0)
          this.showTopBtnForPending = true;
        else {
          this.showTopBtnForPending = false;
          this.showRefreshBtnForPending = true;
        }
      }
    },
    onSlideNextTransitionStart() {
      if (this.tab == "tab-1") {
        this.currentSwiper = this.swiperInstance;
        this.showTopBtn = true;
        this.showRefreshBtn = false;
      } else {
        this.currentSwiperForPending = this.swiperInstance2;
        this.showTopBtnForPending = true;
        this.showRefreshBtnForPending = false;
      }
    },
    Help(isHelp) {
      this.dialog = isHelp;
      this.showPlusBtn = !isHelp;
      if (isHelp) {
        this.showRefreshBtnCache = this.showRefreshBtn;
        this.showRefreshBtnForPendingCache = this.showRefreshBtnForPending;
        this.showTopBtnCache = this.showTopBtn;
        this.showTopBtnForPendingCache = this.showTopBtnForPending;

        this.showTopBtn = false;
        this.showTopBtnForPending = false;
        this.showRefreshBtn = false;
        this.showRefreshBtnForPending = false;
      }
      if (!isHelp) {
        this.tab = "tab-1";
        this.showTopBtn = this.showTopBtnCache;
        this.showTopBtnForPending = this.showTopBtnForPendingCache;
        this.showRefreshBtn = this.showRefreshBtnCache;
        this.showRefreshBtnForPending = this.showRefreshBtnForPendingCache;
      }
    },
    RefreshPage() {
      if (this.tab == "tab-1") {
        tools.clearExpenseReportList(1);

        this.loadMyExpenseList(1);
      } else {
        tools.clearExpenseReportList(2);

        this.loadPendingList(1);
      }
    },

    SkipTopOne() {
      if (this.tab == "tab-1") {
        this.currentSwiper.slideTo(0, 1000, false);
        this.showTopBtn = false;
        this.showRefreshBtn = true;
      } else {
        this.currentSwiperForPending.slideTo(0, 1000, false);
        this.showTopBtnForPending = false;
        this.showRefreshBtnForPending = true;
      }
    },
    myList(pageIndex) {
      var targetList = [];
      var targetIndex = -1;
      var currentIndex =
        this.tab == "tab-1"
          ? this.currentPageIndexForMyList
          : this.currentPageIndexForPending;
      var pageCount =
        this.tab == "tab-1" ? this.pageQty : this.pageQtyForPending;
      var currentList = this.tab == "tab-1" ? this.list : this.pendingList;

      if (currentIndex == 1 && pageIndex <= 2) targetIndex = pageIndex - 1;
      else if (currentIndex == pageCount && pageIndex >= pageCount - 1)
        targetIndex = pageIndex - (pageCount - 1);
      else if (
        currentIndex < pageCount &&
        pageIndex >= currentIndex - 1 && pageIndex <= currentIndex + 1
      )
        targetIndex = pageIndex - (currentIndex - 1);
      if (targetIndex != -1) targetList = currentList[targetIndex];
      return targetList;
    },

    loadMyExpenseList(pageIndex) {
      tools.getPagedExpenseReportList(1, this.pageSize, pageIndex, response => {
        if (pageIndex > response.PageQty) {
          this.list = [];
          return;
        }
        if (this.list.length > 0) {
          this.list.splice(0, this.list.length);
        }
        this.pageQty = response.PageQty;
        this.currentPageIndexForMyList = pageIndex;
        response.Items.forEach(item1 => {
          var subList = [];
          item1.forEach(item => {
            var isEditable = tools.isEditable(item.Status);
            subList.push({
              id: item.ExpenseReportID,
              desc: item.Description,
              date: tools.formatDateAsLocal(item.CreationDate),
              status: item.Status,
              isEditable: isEditable,
              statusClass: isEditable ? "nosubmit" : "text--primary",
              total: tools.formatAmount(item.NetTotal),
              RedFlag_Count: item.RedFlag_Count
            });
          });
          this.list.push(subList);
        });
      });
    },

    async deleteReport(id) {
      if (await tools.confirm("Are you sure to delete it?")) {
        this.$axios
          .get("/ExpenseReport/DeleteReport/" + id)
          .then(response => {
            var msg =
              response.data > 0 ? "Deleted Successfully!" : "Deleted Failed!";
            if (response.data > 0) {
              //tools.clearExpenseReportList(1);
              tools.deleteExpseReport(id, 1);
              this.loadMyExpenseList(this.currentPageIndexForMyList);
            }
            tools.alert(msg);
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    loadPendingList(pageIndex) {
      tools.getPagedExpenseReportList(
        2,
        this.pageSizeForPending,
        pageIndex,
        response => {
          if (pageIndex > response.PageQty) return;
          if (this.pendingList.length > 0) {
            this.pendingList.splice(0, this.pendingList.length);
          }

          this.pageQtyForPending = response.PageQty;
          this.currentPageIndexForPending = pageIndex;
          response.Items.forEach(item1 => {
            var subList = [];
            item1.forEach(item => {
              var isEditable = tools.canReview(item.Status);
              subList.push({
                id: item.ExpenseReportID,
                desc: item.Description,
                date: tools.formatDateAsLocal(item.CreationDate),
                status: item.Status,
                isEditable: isEditable,
                user: item.FirstName + " " + item.LastName,
                statusClass: isEditable ? "nosubmit" : "text--primary",
                total: tools.formatAmount(item.NetTotal),
                RedFlag_Count: item.RedFlag_Count
              });
            });
            this.pendingList.push(subList);
          });
        }
      );
    },
    async logout() {
      if (await tools.confirm("Are you sure to logout?")) {
        sessionStorage.clear();
        var mobileIndex = this.baseUrl.toLowerCase().lastIndexOf('/mobile/');
        window.location.href = (mobileIndex > 0 ?
          this.baseUrl.substring(0, mobileIndex) + '/' : this.baseUrl) + "Home/Logout";
      }
    },
    getWindowHeight() {
      return typeof window !== 'undefined' ? window.innerHeight - 56 : 500;
    }
  }
};
</script>
<style scoped>
.floatbtn1 {
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 500;
  background-color: rgba(0, 0, 0, 0) !important;
}

.floatbtn {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 500;
  background-color: rgba(0, 0, 0, 0) !important;
}

.floatbtnColor {
  background-color: rgb(204, 204, 204) !important;
  color: white !important;
}
.app_title {
  position: fixed;
  z-index: 100;
  top: 0px;
  left: 0px;
  right: 0px;
}

.app_footer {
  position: fixed;
  z-index: 100;
  bottom: 0px;
  left: 0px;
  right: 0px;
}
.app_body {
  padding-top: 0px;
}

.v-list-item_List2 {
  height: 80px;
  ;
}

.v-list-item__icon {
  margin-right: 5px !important;
}

.nosubmit {
  color: green !important;
}

.mytoolbar {
  height: 56px !important;
}

.extra-title {
  color: lightgrey;
  opacity: 1;
  font: 17px/30px 'Microsoft yahei';
  transform: translate(15px, -5px);
  display: inline;
  margin: 0 auto;
  position: relative;
  top: 23%;
  margin-left: 5px;
}
.extra-title1 {
  color: lightgrey;
  opacity: 1;
  font: 17px/30px 'Microsoft yahei';
  transform: translate(15px, -5px);
  display: inline;
  margin: 0 auto;
  position: relative;
  top: 7px;
  right: 20px;
  margin-right: 10px;
}

:deep(.v-tab:not(.v-tab--selected)) {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}
</style>

