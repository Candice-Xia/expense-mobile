<template>
  <v-container
    class="fill-height"
    fluid
  >
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        sm="8"
        md="4"
      >
        <v-card class="elevation-12">
          <v-toolbar
            color="primary"
            dark
            flat
          >
            <v-img
              :src="baseUrl + 'logo.svg'"
              max-width="32px"
              class="mr-2 ml-4"
            />
            <v-toolbar-title>Expense Manager</v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <v-form>
              <v-select
                v-model="company"        
                :items="companylist"
                item-title="text"
                item-value="value" 
                label="Company"
              />

              <v-text-field
                v-model="uid"
                label="Login ID"
                :error-messages="uidErrors"
                counter
                @input="v$.uid.$touch()"
                @blur="v$.uid.$touch()"
              />
              <v-text-field
                v-model="pwd"
                :error-messages="pwdErrors"
                label="Password"
                :type="show2 ? 'text' : 'password'"
                :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                counter
                @click:append="show2 = !show2"
                @input="v$.pwd.$touch()"
                @blur="v$.pwd.$touch()"
                @keyup.enter="submit"
              />

              <v-btn
                color="primary"
                class="mr-4 mt-2"
                @click="submit"
              >
                Login
              </v-btn>
              <v-btn
                color="primary"
                class="mt-2"
                @click="clear"
              >
                Clear
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import baseUrl from '../baseUrl';
import tools from '../plugins/tools';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

let routerBaseUrl = baseUrl;
if (process.env.NODE_ENV === 'production') {
  routerBaseUrl += 'Mobile/';
}

const uid = ref('');
const pwd = ref('');
const company = ref(100);
const companylist = ref([]);
const show2 = ref(false);
const baseUrlRef = ref(routerBaseUrl);

const rules = {
  uid: { required },
  pwd: { required }
};

const v$ = useVuelidate(rules, { uid, pwd });

const uidErrors = computed(() => {
  const errors = [];
  if (!v$.value.uid.$dirty) return errors;
  if (v$.value.uid.required.$invalid) errors.push('Login ID is required.');
  return errors;
});

const pwdErrors = computed(() => {
  const errors = [];
  if (!v$.value.pwd.$dirty) return errors;
  if (v$.value.pwd.required.$invalid) errors.push('Password is required.');
  return errors;
});

onMounted(() => {
  tools.getCompany((value) => {
    companylist.value = value;
  });
});

function submit() {
  v$.value.$touch();
  if (v$.value.$error) return;

  axios({
    url: '/Vue/Login',
    method: 'post',
    data: {
      deptmartID: company.value,
      userName: uid.value,
      password: pwd.value
    }
  })
    .then((response) => {
      if (response.data.errMsg) {
        tools.alert(response.data.errMsg, 5000, 'error', false,false);
      } else {
        const returnUrl = route.query.ReturnUrl;
        if (returnUrl) {
          const url = window.location.href;
          const domain = url.substr(0, url.indexOf('/', 9));
          window.location.href = domain + returnUrl;
        } else {
          router.push({ name: 'home' });
        }
      }
    })
    .catch((error) => {
      tools.alert(error.response.data.error_description, 2000, 'error', false);
    });

}

function clear() {
  v$.value.$reset();
  uid.value = '';
  pwd.value = '';
}
</script>
