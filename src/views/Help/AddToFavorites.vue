<template>
  <v-form>
    <v-carousel
      v-model="model"
      :show-arrows="false"
      :height="imgHeight"
    >
      <v-carousel-item
        v-for="(step, i) in steps"
        :key="i"
        reverse-transition="fade-transition"
        transition="fade-transition"
      >
        <v-img
          :height="imgHeight"
          :src="MyStep(step.url)"
          class="grey darken-1"
          contain
        >
          <div class="fill-height repeating-gradient" />
        </v-img>
      </v-carousel-item>
    </v-carousel>
  </v-form>
</template>
<script>
import baseURL from "../../baseUrl";
import tools from "../../plugins/tools";
var routerBaseUrl = baseURL;
if (process.env.NODE_ENV === "production") {
  routerBaseUrl += "Mobile/";
}
export default {
  name: "AddToFavorites",
  data() {
    return {
      baseUrl: routerBaseUrl,
      mobileType: tools.mobileType(),
      colors: ["primary", "secondary", "yellow darken-2", "red", "orange"],
      model: 0,
      steps: [
        {
          id: 1,
          text: "Log on mobile site",
          url: "AddToFavorites_1.jpg"
        },
        {
          id: 2,
          text: "Click this icon",
          url: "AddToFavorites_2.jpg"
        },
        {
          id: 3,
          text: 'Choose "Add to Home Screen"',
          url: "AddToFavorites_3.jpg"
        },
        {
          id: 4,
          text: "Give it a name",
          url: "AddToFavorites_4.jpg"
        },
        {
          id: 5,
          text: "Click this button",
          url: "AddToFavorites_5.jpg"
        }
      ]
    };
  },
  computed: {
    imgHeight() {
      return window.innerHeight - 56;
    },
    imgWidth() {
      return window.innerWidth;
    }
  },
  created: function() {
    if (this.mobileType == 1 && this.steps.length > 0)
      this.steps.splice(this.steps.length - 1, 1);
  },
  methods: {
    MyStep(url) {
      var middlePath = this.mobileType == 0 ? "iPhone" : "android";
      return this.baseUrl + "img/help/" + middlePath + "/" + url;
    }
  }
};
</script>