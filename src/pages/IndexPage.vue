<template>
  <q-page class="flex flex-center column" v-if="state.user != null">
    <q-btn size="10em" :loading="loading_handle > 0" color="primary" @click="checkin">{{ state.user?.checked_in === true ? "Check Out" : "Check In" }}</q-btn>
    <span style="color:red" v-if="checkin_error != null">{{checkin_error}}</span>
  </q-page>

  <q-page class="flex flex-center column" v-if="state.user == null">
    <h3>Ironclad Attendance</h3>
    <q-input :error="input_id_error != null" :error-message="input_id_error" :disable="loading_handle > 0" label="Student ID" v-model="input_id" />
    <q-btn :loading="loading_handle > 0" style="margin-top: 1em;" color="primary" @click="login">Log In</q-btn>
    <span style="color:red" v-if="login_error != null">{{login_error}}</span>
  </q-page>

  <audio :src="checkin_sound_url" ref="checkin_sound" />
  <audio :src="checkout_sound_url" ref="checkout_sound" />
</template>

<script>
import { defineComponent } from 'vue';
import state from "../state.js";
import checkin_sound_url from "../assets/touchswitch.mp3";
import checkout_sound_url from "../assets/gate_close.mp3";

export default defineComponent({
  name: "IndexPage",
  data() { return {
    input_id: "",
    input_id_error: null,
    loading_handle: 0,
    login_error: null,
    checkin_error: null,
    checkin_sound_url,
    checkout_sound_url,
  } },

  computed: {
    state() { return state; }
  },

  methods: {
    async login() {
      this.clear_errors();
      const id = this.input_id.trim();
      if (id.length === 0) {
        this.input_id_error = "Please enter an ID";
        return;
      }
      this.loading_handle++;

      try {
        const login = await fetch(state.endpoint + `?action=get_user&user_id=${encodeURIComponent(id)}`).then(res => res.json());
        if (login.success) {
          this.state.user = login.result;
        } else {
          this.login_error = login.error;
        }
      } catch(e) {
        this.login_error = e.toString() + "\n" + e.stack;
      }
      finally {
        this.loading_handle--;
      }
    },

    async checkin() {
      this.clear_errors();
      this.loading_handle++;
      try {
        const checkin = await fetch(state.endpoint + `?action=toggle_checkin&user_id=${encodeURIComponent(state.user.user_id)}`).then(res => res.json());
        if (checkin.success) {
          this.state.user = checkin.result;
          if (this.state.user.checked_in) {
            this.$refs.checkin_sound.play();
          } else {
            this.$refs.checkout_sound.play();
          }
        } else {
          this.checkin_error = checkin.error;
        }
      } catch (e) {
          this.checkin_error = e.toString() + "\n" + e.stack;
      }
      finally {
        this.loading_handle--;
      }
    },

    clear_errors() {
      this.login_error = null;
      this.checkin_error = null;
      this.input_id_error = null;
    },
  },
})
</script>
