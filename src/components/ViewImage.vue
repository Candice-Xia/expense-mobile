<template>
  <div style="display:inline;">
    <v-dialog
      ref="dialog"
      v-model="imgModal"
      fullscreen
      persistent
    >
      <v-card>
        <v-carousel
          v-model="model"
          :show-arrows="false"
          :height="carouselHeight"
        >
          <v-carousel-item
            v-for="(item,i) in attachmentList"
            :key="i"
            reverse-transition="fade-transition"
            transition="fade-transition"
          >
            <v-toolbar
              color="primary"
              dark
              flat
            >
              <v-toolbar-title>{{ item.AttachmentID>0?item.AttachmentName:item.AttachmentFileName }}</v-toolbar-title>
            </v-toolbar>
            <v-img
              :height="imgHeight"
              :src="GetImgUrl(item)"
              :lazy-src="GetThumbnail(item)"
              class="grey darken-1"
              contain
            >
              <template #placeholder>
                <v-row
                  class="fill-height ma-0"
                  align="center"
                  justify="center"
                >
                  <v-progress-circular
                    indeterminate
                    color="grey lighten-5"
                  />
                </v-row>
              </template>
            </v-img>
          </v-carousel-item>
        </v-carousel>
        <v-card-actions style="margin-top:0px;">
          <div
            class="longButton"
            style="width:100%;margin-top:0px;"
          >
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
            <v-btn
              v-if="IsViewImg&&page=='item'&&displayDeleteBtn"
              color="primary"
              class="no-uppercase mb-2"
              @click="deleteImg"
            >
              Delete
            </v-btn>
          </div>
          <div class="flex-grow-1" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { required } from "vuelidate/lib/validators";
import tools from "../plugins/tools";
import baseUrl from "../baseUrl";
export default {
  name: "ViewImage",
  props: {
    page: String,
    displayDeleteBtn: Boolean
  },
  data: function() {
    return {
      imgModal: false,
      model: 0,
      modalTitel: "",
      imageUrl: "",
      IsViewImg: false,
      fileName: "",
      attachmentList: []
    };
  },
  computed: {
    imgHeight() {
      return window.innerHeight - 166;
    },
    carouselHeight() {
      return window.innerHeight - 60;
    },
    imgWidth() {
      return window.innerWidth;
    }
  },
  methods: {
    async deleteImg() {
      if (
        await tools.confirm(
          "Are you sure to delete this picture: " +
            this.attachmentList[this.model].AttachmentName +
            "?"
        )
      ) {
        this.$emit("deleteImg", this.attachmentList[this.model]);
        this.attachmentList.splice(this.model, 1);
        if (this.attachmentList.length < 1) {
          this.imgModal = false;
        }
      }
    },
    GetImgUrl(item) {
      if (item.AttachmentID > 0) {
        return `${baseUrl}Attachment/GetImg?id=${item.AttachmentID}&filename=${item.AttachmentName}`;
      } else {
        return `${baseUrl}TempFile/${item.AttachmentFileName}`;
      }
    },
    GetThumbnail(item) {
      if (item.AttachmentID > 0) {
        return `${baseUrl}Attachment/GetThumbnail?id=${item.AttachmentID}&filename=${item.AttachmentName}`;
      } else {
        return `${baseUrl}TempFile/${item.AttachmentThumbName}`;
      }
    },
    downloadImg() {
      var item = this.attachmentList[this.model];
      var url = this.GetImgUrl(item);
      var title =
        item.AttachmentID > 0 ? item.AttachmentName : item.AttachmentFileName;
      var a = document.createElement("a");
      var event = new MouseEvent("click");
      a.download = title;
      a.href = url;
      a.dispatchEvent(event);
    },
    viewAttachment(url, isImg, attachmentID, AttachmentList) {
      if (!isImg) {
        window.open(url);
        return;
      }
      if (AttachmentList && AttachmentList.length > 0) {
        if (this.attachmentList.length > 0) {
          this.attachmentList.splice(0, this.attachmentList.length);
        }
        var newIndex = 0;
        AttachmentList.forEach(a => {
          if (a.AllowPreview) {
            this.imgModal = true;
            this.IsViewImg = true;
            this.attachmentList.push(a);
            if (a.AttachmentID == attachmentID) {
              this.model = newIndex;
            }

            newIndex++;
          }
        });
      }
    }
  }
};
</script>
<style scoped>
.longButton button {
  width: 30%;
}
</style>