<template>
  <div style="display:inline;">
    <v-dialog
      ref="dialog"
      v-model="imgModal"
      fullscreen
      persistent
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
          flat
        >
          <v-toolbar-title>{{ modalTitel }}</v-toolbar-title>
        </v-toolbar>
        <v-img
          v-show="fileIsImg"
          ref="dialogImg"
          class="mt-2"
          :src="imageUrl"
          :max-width="maxWidth"
          :max-height="maxHeight"
          contain
        />
        <v-card-text v-show="!fileIsImg">
          File Name : {{ file?file.name:"" }}
        </v-card-text>
        <v-text-field
          v-if="!IsViewImg"
          v-model="fileName"
          label="Rename"
          :class="!IsViewImg?'mt-2 ml-1 mr-1 Required':'mt-2 ml-1 mr-1'"
          :error-messages="fileNameError"
          @input="v$.fileName.$touch()"
          @blur="v$.fileName.$touch()"
        />
        <v-card-actions style="margin-top:0px;">
          <div
            class="longButton"
            style="width:100%;margin-top:0px;"
          >
            <v-btn
              v-if="!IsViewImg"
              color="primary"
              class="no-uppercase mr-2 mb-2"
              @click="imgModal = false"
            >
              Cancel
            </v-btn>
            <v-btn
              v-if="!IsViewImg"
              color="primary"
              class="no-uppercase mr-2 mb-2"
              @click="uploadFile()"
            >
              Upload
            </v-btn>
            <v-btn
              v-if="IsViewImg"
              color="primary"
              class="no-uppercase mr-2 mb-2"
              @click="downloadImg()"
            >
              Download
            </v-btn>
            <v-btn
              v-if="IsViewImg"
              color="primary"
              class="no-uppercase mb-2"
              @click="imgModal = false"
            >
              Close
            </v-btn>
          </div>
          <div class="flex-grow-1" />
        </v-card-actions>
      </v-card>
    </v-dialog>
    <slot />
    <v-file-input
      v-show="false"
      ref="inputUpload"
      v-model="file"
      accept="image/*"
      @change="filechanged"
    />
  </div>
</template>
<script>
import { useVuelidate } from '@vuelidate/core'
import { required } from "@vuelidate/validators"
import tools from "../plugins/tools";
import canvasResize from "../plugins/canvasResize";
export default {
  name: "ImageViewAndUpload",
  setup() {
    return { v$: useVuelidate() }
  },
  validations() {
    return {
      fileName: { required }
    }
  },
  data: function() {
    return {
      imgModal: false,
      modalTitel: "",
      imageUrl: "",
      maxWidth: 290,
      maxHeight: 400,
      fileIsImg: false,
      file: null,
      isCompressing: false,
      isCompressed: false,
      IsViewImg: false,
      fileName: ""
    };
  },
  computed: {
    fileNameError() {
      const errors = [];
      if (!this.v$.fileName.$dirty) return errors;
      this.v$.fileName.required.$invalid && errors.push("File name is required.");
      return errors;
    },
    computedDateFormatted() {
      return "";
    }
  },
  mounted() {
    this.maxWidth = window.innerWidth;
    this.maxHeight = window.innerHeight - 200;
  },
  methods: {
    fireSelectFile() {
      this.$refs.inputUpload.$el.getElementsByTagName("input")[0].click();
    },
    filechanged() {
      this.imageUrl = "";
      if (this.file) {
        this.imgModal = true;
        this.IsViewImg = false;
        this.modalTitel = "Are you sure to upload?";
        var filefullname = this.file.name;
        var index1 = filefullname.lastIndexOf(".");
        this.fileName = filefullname.substring(0, index1);
        this.isCompressed = false;
        this.isCompressing = false;
        this.fileIsImg = this.file.type.indexOf("image") >= 0;
        if (this.fileIsImg) {
          var originalObject = this;
          originalObject.isCompressing = true;
          tools.getImageSize(ImageSize => {
            canvasResize(originalObject.file, {
              maxSize: ImageSize.ImageMaxHeight,
              height: 0,
              crop: false,
              quality: ImageSize.ImageMaxQuality,
              callback: function(data, width, height) {
                originalObject.isCompressing = false;
                originalObject.isCompressed = true;
                originalObject.imageUrl = data;
              }
            });
          });
        }
      }
    },
    downloadImg() {
      var a = document.createElement("a");
      var event = new MouseEvent("click");
      a.download = this.modalTitel;
      a.href = this.imageUrl;
      a.dispatchEvent(event);
    },
    viewAttachment(url, isImg, filename) {
      if (isImg) {
        this.fileIsImg = true;
        this.imgModal = true;
        this.IsViewImg = true;
        this.imageUrl = url;
        this.modalTitel = filename;
        var filefullname = filename;
        var index1 = filefullname.lastIndexOf(".");
        this.fileName = filefullname.substring(0, index1);
      } else {
        window.open(url);
      }
    },
    uploadFile() {
      this.v$.$touch();
      if (this.v$.$error) {
        return;
      }
      if (this.isCompressing) {
        tools.alert("The system is processing the picture, please wait.");
        return;
      }
      let formdata = new FormData();
      var newFilename = "";
      if (this.fileName != "") {
        var originalname = this.file.name;
        var index1 = originalname.lastIndexOf(".");
        var index2 = originalname.length;
        var suffix = originalname.substring(index1, index2);
        newFilename = this.fileName + suffix;
      } else {
        newFilename = this.file.name;
      }
      formdata.append("fileName", this.file.name);
      if (this.isCompressed) {
        var f = canvasResize("dataURLtoBlob", this.imageUrl);
        f.name = this.file.name;
        formdata.append("file", f);
      } else {
        formdata.append("file", this.file);
      }
      this.$axios({
        url: "/Attachment/post",
        method: "post",
        data: formdata,
        headers: {
          "Content-Type": "multipart/form-data;charset=UTF-8"
        }
      })
        .then(response => {
          tools.alert("Upload Successfully.");
          this.$emit("fileUploaded", {
            fileName: newFilename,
            SaveFileName: response.data.SaveFileName,
            SaveThumbName: response.data.SaveThumbName,
            isImg: response.data.IsImg
          });
          this.imgModal = false;
        })
        .catch(error => {
          tools.alert(error.response.data.error_description);
        });
    }
  }
};
</script>