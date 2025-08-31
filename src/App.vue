<template>
  <v-app>
    <v-main>
      <router-view />
      <v-overlay  
        v-model="overlay" 
        :z-index="999999" 
        class="align-center justify-center"
      >
        <v-progress-circular
          indeterminate
          size="64"
        />
      </v-overlay>
      <v-dialog
        v-model="alertDialog.show"
        persistent
        max-width="auto"
      >
        <v-card>
          <v-card-title>{{ alertDialog.title }}</v-card-title>
          <v-card-text>{{ alertDialog.msg }}</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="green-darken-1"
              variant="text"
              @click="alertDialogClick(1)"
            >
              {{ alertDialog.button1 }}
            </v-btn>
            <v-btn
              v-if="alertDialog.button2"
              color="green-darken-1"
              variant="text"
              @click="alertDialogClick(2)"
            >
              {{ alertDialog.button2 }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-snackbar
        v-model="snackbar.show"
        :timeout="snackbar.timeout"
        :color="snackbar.color"        
        :top="snackbar.top"    
        :multi-line="snackbar.multiline"    
      >
        <div class="d-flex align-center w-100">
          <div v-html="snackbar.text" />        
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            class="ms-3"
            density="comfortable"
            @click="snackbar.show = false"
          />
        </div>
      </v-snackbar>
      <v-snackbar
        v-model="alertSnackbar.show"
        :timeout="alertSnackbar.timeout"
        :color="alertSnackbar.color"        
        :top="alertSnackbar.top"    
        :multi-line="alertSnackbar.multiline"    
      >
        <div class="d-flex align-center w-100">
          <div v-html="alertSnackbar.text" />        
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="text"
            class="ms-3"
            density="comfortable"
            @click="alertSnackbar.show = false"
          />
        </div>
      </v-snackbar>
    </v-main>
  </v-app>
</template>
<script>
export default {
  data() {
    return {
      overlay: false,
      alertDialog: {
        show: false,
        title: "System Message",
        msg: "",
        button1: "Ok",
        button2: "Cancel",
        callback: null
      },
      snackbar: {
        color: "",
        top: false,
        show: false,        
        timeout: 2000,
        text: "",
        multiline: false,
      },
      alertSnackbar: {
        color: "",
        top: false,
        show: false,        
        timeout: 2000,
        text: "",
        multiline: false,
      }
    };
  },
  watch: {
    $route(to, from) {
      history.pushState(null, null, document.URL);
    }
  },
  created() {
    window.VueContent = this;
    window.showLoading = () => {
      this.overlay = true;
    };
    window.hideLoading = () => {
      this.overlay = false;
    };
    window.ShowError = (msg, timeout, color, top, multiline) => {
      this.snackbar.text = msg;
      this.snackbar.timeout = (!timeout) ? 2000 : timeout;
      this.snackbar.color = (!color) ? '' : color;
      this.snackbar.top = top === true;
      this.snackbar.multiline = multiline;
      this.snackbar.show = true;
    };
    window.ShowWarning = (msg, timeout, color, top, multiline) => {
      this.alertSnackbar.text = msg;
      this.alertSnackbar.timeout = (!timeout) ? 2000 : timeout;
      this.alertSnackbar.color = (!color) ? '' : color;
      this.alertSnackbar.top = top === true;
      this.alertSnackbar.multiline = multiline;
      this.alertSnackbar.show = true;
    };
    window.customAlert = (msg, title, button1, button2, callback) => {
        this.alertDialog.title = title;
        this.alertDialog.msg = msg;
        this.alertDialog.callback = callback;
        this.alertDialog.button1 = button1;
        this.alertDialog.button2 = button2;
        this.alertDialog.show = true;
    };
  },
  mounted() {
    if (window.history && window.history.pushState) {
      window.addEventListener("popstate", this.goBack, false);
    }
  },
  unmounted() {
    window.removeEventListener("popstate", this.goBack, false);
  },
  methods: {
    alertDialogClick(btn) {
      this.alertDialog.show = false;
      if (this.alertDialog.callback) {
        this.alertDialog.callback(btn);
      }
    },
    goBack() {
      //prevent the back button in android
      //change to click the goback button in current page (if exists)
      history.pushState(null, null, document.URL);
      var btns = document.getElementsByTagName("button");
      for (let index = 0; index < btns.length; index++) {
        const btn = btns[index];
        if (btn.hasAttribute("goback")) {
          btn.click();
        }
      }
    }
  }
};
</script>
<style>
button.v-btn.v-btn--contained {
  min-width: 100px !important;
}
.container {
  padding: 8px !important;
}
.Required label::after {
  content: "*";
  color: red;
}

.longButton {
  text-align: center;
  margin-top: 10px;
}
.longButton button {
  width: 45%;
}
</style>