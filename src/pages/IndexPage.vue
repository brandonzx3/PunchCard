<template>
  <q-page style="text-align: center;" class="flex flex-center column" v-if="state.user != null">
    <h4>Welcome Back {{state.user.first_name}}!</h4>
    <h4 style="margin-bottom: 10px;">{{state.user?.checked_in === true ? "Currently Checked In." : "Currently Checked Out."}}</h4>
    <h5 style="margin-top: 0;">you have {{state.user.total_hours}} total hours</h5>
    <q-btn size="3.5em" :loading="loading_handle > 0" color="primary" @click="checkin">{{ state.user?.checked_in === true ? "Check Out" : "Check In" }}</q-btn>
    <span style="color:red" v-if="checkin_error != null">{{checkin_error}}</span>
  </q-page>

  <q-page class="flex flex-center column" v-if="state.user == null">
    <h4>Ironclad Attendance</h4>
    <q-input :error="input_id_error != null" :error-message="input_id_error" :disable="loading_handle > 0" style="width: 13em;" label="Student ID (last 4 Digits)" v-model="input_id" />
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
import { Dialog } from 'quasar';

async function poll_user() {
  console.log("polling user");
  if(state.user != null) {
    try {
      const login = await fetch(state.endpoint + `?action=get_user&user_id=${encodeURIComponent(state.user.user_id)}`).then(res => res.json());
      if(login.success && state.logged_in) {
        state.user = login.result;
      }
    } catch(e) {
      console.log(e);
    }
  }
}

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
    state() { return state; },
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
          this.state.logged_in = true;
          localStorage.setItem("user", id);
          this.input_id = "";
        } else {
          this.login_error = login.error;
        }
      } catch(e) {
        this.login_error = e.toString() + "\n" + e.stack;
      }
      finally {
        this.loading_handle--;
        console.log(this.state.user);
		this.check_email();
      }
    },

    async checkin() {
      this.clear_errors();
      this.loading_handle++;
      try {
        const checkin = await fetch(state.endpoint + `?action=toggle_checkin&user_id=${encodeURIComponent(state.user.user_id)}`).then(res => res.json());
        if (checkin.success) {
          this.state.user = checkin.result;
          poll_user();
          if (this.state.user.checked_in) {
            this.$refs.checkin_sound.volume = 0.1;
            this.$refs.checkin_sound.play();
          } else {
            this.$refs.checkout_sound.volume = 0.1;
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

	check_email() {
		if(state.user != null && state.user.email == "") {
			Dialog.create({
				title: 'Email Needed!',
				message: 'Please provide your personal email below',
				prompt: {
					model: '',
					isValid: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
					type: 'text'
				},
				cancel: false,
				persistent: true
			}).onOk(data => {
        		fetch(state.endpoint + `?action=set_email&user_id=${encodeURIComponent(state.user.user_id)}&email=${encodeURIComponent(data)}`).then(res => res.json());
			})
		}
	}
  },
  
  async created () {
    if(localStorage.getItem("user") != null) {
      this.loading_handle++;
      try {
        const login = await fetch(state.endpoint + `?action=get_user&user_id=${encodeURIComponent(localStorage.getItem("user"))}`).then(res => res.json());
        if (login.success) {
          this.state.user = login.result;
          this.state.logged_in = true;
        } else {
          this.login_error = login.error;
        }
      } catch(e) {
        this.login_error = e.toString() + "\n" + e.stack;
      }
      finally {
        this.loading_handle--;
		console.log(this.state.user);
		this.check_email();
      }
    }
    setInterval(poll_user, 1000 * 60);
  }
})
</script>
