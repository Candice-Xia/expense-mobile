<template>
  <div>
    <div
      v-for="(item,index) in ItemFieldsList"
      :key="index"
    >
      <div
        v-if="(item.DropDownType==null)&&(item.BusinessContactList.length<=0)&&(item.PersonalExpenseList.length<=0)&&(item.Label!=null&& item.Value!=null)"
      >
        <div>
          <v-textarea
            v-if="item.isMultiLineText"
            v-model="item.Value"
            :label="item.Label"
            :readonly="true"
            rows="3"
            counter
          />
          <v-text-field
            v-if="!item.isMultiLineText"
            v-model="item.Value"
            :label="item.Label"
            :readonly="true"
            :v-once="GetTotalAmount(item.ColumnName,item.Value)"
            counter
          />
        </div>
      </div>
      <div
        v-else-if="(item.DropDownType!=null)&&(item.BusinessContactList.length<=0)&&(item.PersonalExpenseList.length<=0)"
      >
        <div v-if="item.DropDownType=='YesOrNo'">
          <v-subheader class="subtitle">
            {{ item.Label }}
          </v-subheader>
          <v-radio-group
            v-if="item.IntValue==1||item.IntValue==2"
            v-model="item.IntValue"
            class="radiogroup"
            :readonly="true"
            row
          >
            <v-row>
              <v-col
                v-for="yesNo in YesOrNoLst"
                :key="yesNo.ID"
                cols="6"
              >
                <v-radio
                  :label="yesNo.Text"
                  :value="yesNo.ID"
                />
              </v-col>
            </v-row>
          </v-radio-group>
          <v-radio-group
            v-else-if="item.IntValue==3||item.IntValue==4"
            v-model="item.IntValue"
            class="radiogroup"
            :readonly="true"
            row
          >
            <v-row>
              <v-col
                v-for="yesNo in YesOrNoLst1"
                :key="yesNo.ID"
                cols="6"
              >
                <v-radio
                  :label="yesNo.Text"
                  :value="yesNo.ID"
                />
              </v-col>
            </v-row>
          </v-radio-group>
        </div>
        <div v-if="item.DropDownType=='MajorOrMinor'">
          <v-subheader class="subtitle">
            {{ item.Label }}
          </v-subheader>
          <v-radio-group
            v-model="item.IntValue"
            class="radiogroup"
            :readonly="true"
            row
          >
            <v-row>
              <v-col
                v-for="majorMinor in MajorOrMinorLst"
                :key="majorMinor.ID"
                cols="6"
              >
                <v-radio
                  :label="majorMinor.Text"
                  :value="majorMinor.ID"
                />
              </v-col>
            </v-row>
          </v-radio-group>
        </div>
        <div
          v-if="item.DropDownType=='SpecifyMeal'"
          class="SpecifyMeal"
        >
          <v-subheader class="subtitle">
            {{ item.Label }}
          </v-subheader>
          <v-radio-group
            v-model="item.IntValue"
            class="radiogroup"
            :readonly="true"
            row
          >
            <v-row>
              <v-col
                v-for="specifyMeal in SpecifyMealLst"
                :key="specifyMeal.ID"
                cols="6"
                sm="3"
              >
                <v-radio
                  :label="specifyMeal.Text"
                  :value="specifyMeal.ID"
                />
              </v-col>
            </v-row>
          </v-radio-group>
        </div>
      </div>
      <div
        v-else-if="(item.DropDownType==null)&&(item.BusinessContactList.length>0)&&(item.PersonalExpenseList.length<=0)"
        class="BusinessContact"
      >
        <v-subheader class="subtitle">
          {{ item.Label }}
        </v-subheader>
        <transition name="fade">
          <Swiper
            id="swiperBox"
            ref="mySwiper"
            :modules="swiperModules"
            class="swiper-container"
            :direction="'horizontal'"
            :grab-cursor="true"
            :set-wrapper-size="true"
            :auto-height="true"
            :slides-per-view="1"
            :mousewheel="false"
            :resistance-ratio="0"
            :observer="true"
            :observe-parents="true"
            :pagination="{
              clickable: true,
              type: 'bullets'
            }"
            :style="{height: (window.innerHeight > 576 ? window.innerHeight : 576) - 320 + 'px'}"
            @transition-start="onSwiperTransitionStart"
          >
            <SwiperSlide
              v-for="index in pageQty(item.BusinessContactList)"
              :key="index"
            >
              <v-simple-table>
                <template #default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        Name
                      </th>
                      <th class="text-left">
                        Company
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(bc,index1) in MyList(item.BusinessContactList,index,'BusinessContact')"
                      :key="index1"
                    >
                      <td>{{ bc.FullName }}</td>
                      <td>{{ bc.Company }}</td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </SwiperSlide>
          </Swiper>
        </transition>
      </div>
      <div
        v-else-if="(item.DropDownType==null)&&(item.BusinessContactList.length<=0)&&(item.PersonalExpenseList.length>0)"
        class="PersonalExpense"
      >
        <v-subheader class="subtitle">
          {{ item.Label }}
        </v-subheader>
        <transition name="fade">
          <Swiper
            id="swiperBox"
            ref="mySwiper"
            :modules="swiperModules"
            class="swiper-container"
            :direction="'horizontal'"
            :grab-cursor="true"
            :set-wrapper-size="true"
            :auto-height="true"
            :slides-per-view="1"
            :mousewheel="false"
            :resistance-ratio="0"
            :observer="true"
            :observe-parents="true"
            :pagination="{
              clickable: true,
              type: 'bullets'
            }"
            :style="{height: (window.innerHeight > 576 ? window.innerHeight : 576) - 320 + 'px'}"
            @transition-start="onSwiperTransitionStart"
          >
            <SwiperSlide
              v-for="index in pageQty(item.PersonalExpenseList)"
              :key="index"
            >
              <v-simple-table>
                <template #default>
                  <thead>
                    <tr>
                      <th class="text-left">
                        Description
                      </th>
                      <th class="text-right">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(pe,index1) in MyList(item.PersonalExpenseList,index,'PersonalExpense')"
                      :key="index1"
                    >
                      <td>{{ pe.Description }}</td>
                      <td class="text-right">
                        {{ parseFloat(pe.Amount).toFixed(2)>0?formatAmount(parseFloat(pe.Amount).toFixed(2),2):'' }}
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </SwiperSlide>
          </Swiper>
        </transition>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import tools from "../plugins/tools";

export default {
  components: {
    Swiper,
    SwiperSlide
  },
  props: {
    expenseReportID: Number,
    expenseTypeID: Number,
    expenseItemID: Number
  },  data: function() {
    return {
      swiperModules: [Pagination],
      ItemFieldsList: {},
      YesOrNoLst: [],
      YesOrNoLst1: [],
      MajorOrMinorLst: [],
      SpecifyMealLst: [],

      headersBusinessContact: [
        { text: "Name", value: "FullName" },
        { text: "Company", value: "Company" }
      ],
      pageSize: 4,      // 保留swiperOption以便参考旧的配置
      swiperOption: {
        // swiper configs 所有的配置同swiper官方api配置
        notNextTick: true, //notNextTick是一个组件自有属性，如果notNextTick设置为true，组件则不会通过NextTick来实例化swiper，也就意味着你可以在第一时间获取到swiper对象，假如你需要刚加载遍使用获取swiper对象来做什么事，那么这个属性一定要是true
        direction: "horizontal", //水平方向移动
        grabCursor: true, //鼠标覆盖Swiper时指针会变成手掌形状，拖动时指针会变成抓手形状
        setWrapperSize: true, //Swiper使用flexbox布局(display: flex)，开启这个设定会在Wrapper上添加等于slides相加的宽或高，在对flexbox布局的支持不是很好的浏览器中可能需要用到。
        autoHeight: true, //自动高度。设置为true时，wrapper和container会随着当前slide的高度而发生变化
        slidesPerView: 1, //设置slider容器能够同时显示的slides数量(carousel模式)。可以设置为数字（可为小数，小数不可loop），或者 'auto'则自动根据slides的宽度来设定数量。loop模式下如果设置为'auto'还需要设置另外一个参数loopedSlides。
        mousewheel: false, //开启鼠标滚轮控制Swiper切换。可设置鼠标选项，默认值false
        mousewheelControl: false, //同上
        resistanceRatio: 0, //抵抗率。边缘抵抗力的大小比例。值越小抵抗越大越难将slide拖离边缘，0时完全无法拖离。本业务需要
        height: (window.innerHeight > 576 ? window.innerHeight : 576) - 320, // 高度设置，占满设备高度
        observer: true,
        observeParents: true, //将observe应用于Swiper的父元素。当Swiper的父元素变化时，例如window.resize，Swiper更新
        // 如果自行设计了插件，那么插件的一些配置相关参数，也应该出现在这个对象中，如下debugger
        debugger: true,
        pagination: {
          type: "bullets"
        }
      }
    };
  },
  computed: {},
  created: function() {
    this.LoadItemFieldsList();
    this.InitLst();
  },
  methods: {
    InitLst() {
      this.YesOrNoLst1.push({ ID: 3, Text: "Yes" });
      this.YesOrNoLst1.push({ ID: 4, Text: "No" });

      this.YesOrNoLst.push({ ID: 1, Text: "Yes" });
      this.YesOrNoLst.push({ ID: 2, Text: "No" });

      this.MajorOrMinorLst.push({ ID: 1, Text: "Major" });
      this.MajorOrMinorLst.push({ ID: 2, Text: "Minor" });
      this.SpecifyMealLst.push({ ID: 1, Text: "Breakfast" });
      this.SpecifyMealLst.push({ ID: 2, Text: "Lunch" });
      this.SpecifyMealLst.push({ ID: 3, Text: "Dinner" });
      this.SpecifyMealLst.push({ ID: 4, Text: "Other" });
    },
    DisplayNameAndCompany(list) {
      var DisplayNameAndCompanyFlag = false;
      if (list.length > 0) {
        list.forEach(b => {
          if (b.FullName != "") {
            DisplayNameAndCompanyFlag = true;
          }
          if (b.Company != "") {
            DisplayNameAndCompanyFlag = true;
          }
        });
      }
      return DisplayNameAndCompanyFlag;
    },
    DisplayTitleAndCityState(list) {
      var displayFlag = false;
      if (list.length > 0) {
        list.forEach(b => {
          if (b.Title != "") {
            displayflag = true;
          }
          if (b.CityState != "") {
            displayflag = true;
          }
        });
      }
      return displayFlag;
    },
    LoadItemFieldsList() {
      var url = "/MultiItems/GetItemFields";
      this.$axios
        .get(url, {
          params: {
            expenseReportID: this.expenseReportID,
            expenseTypeID: this.expenseTypeID,
            expenseItemID: this.expenseItemID
          }
        })
        .then(response => {
          this.ItemFieldsList = response.data;
          console.log(this.ItemFieldsList);
        })
        .catch(error => {
          console.log(error);
        });
    },
    pageQty(list) {
      if (list.length > 0) {
        return parseInt(Math.ceil(list.length / this.pageSize));
      } else return 1;
    },
    MyList(list, index, listType) {
      return this.pagingList(list, index - 1, this.pageSize, listType);
    },
    pagingList(list, skipPageIndex, pageSize, listType) {
      var resultList = [];
      for (
        var i = skipPageIndex * pageSize;
        i < list.length && i < skipPageIndex * pageSize + pageSize;
        i++
      ) {
        resultList.push(list[i]);
      }
      if (listType == "PersonalExpense") {
        var total = 0;
        list.forEach(l => {
          total += parseFloat(l.Amount);
        });

        resultList.push({ Amount: total.toFixed(2), Description: "Total" });
      }
      resultList.push({});
      return resultList;
    },    
    GetTotalAmount(columnName, text) {
      if (columnName.indexOf("AmountClaimed") != -1) {
        var list = [];
        list.push({ ColumnName: columnName, Text: text });
        this.$emit("GetTotalAmount", list);
      }
    },
    onSwiperTransitionStart(swiper) {
      console.log(swiper);
    },
    formatAmount:tools.formatAmount
  }
};
</script>
<style>
.subtitle {
  padding-left: 0px;
  font-size: 12px;
  height: 24px;
}
.radiogroup {
  margin-top: 0px;
}
.radiogroup .v-input__slot {
  margin-bottom: 0px !important;
}
.PersonalExpense tr:nth-last-child(2) {
  font-weight: bold;
  margin-bottom: 20px;
}
.SpecifyMeal .v-radio.theme--light {
  width: 30%;
}
</style>