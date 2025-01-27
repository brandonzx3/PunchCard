<template>
  <q-page v-if="cheeky_screen_delay"></q-page>
  <q-page style="text-align: center;" class="flex flex-center column" v-else-if="person != null">
    <h4>Welcome Back {{person.first_name}}!</h4>
    <h4 style="margin-bottom: 10px;">{{i_am_checked_in ? "Currently Checked In." : "Currently Checked Out."}}</h4>
    <h5 style="margin-top: 0;">you have {{total_hours}} total hours</h5>
    <q-btn size="3.5em" :loading="loading_handle > 0" color="primary" @click="checkin">{{ i_am_checked_in ? "Check Out" : "Check In" }}</q-btn>
    <span style="color:red" v-if="checkin_error != null">{{checkin_error}}</span>
  </q-page>

  <q-page class="flex flex-center column" v-else>
    <h4>Ironclad Attendance</h4>
    <q-input :error="input_id_error != null" :error-message="input_id_error" :disable="loading_handle > 0" style="width: 13em;" :label="is_full_login ? 'Email' : 'Student ID (last 4 Digits)'" v-model="input_id" />
    <q-input type="password" v-if="is_full_login" :disable="loading_handle > 0" style="width: 13em;" label="Password" v-model="input_password" />
    <q-btn :loading="login_busy" style="margin-top: 1em;" color="primary" @click="login">Log In</q-btn>
    <span style="color:red" v-if="real_login_error != null">{{real_login_error}}</span>
  </q-page>

  <audio :src="checkin_sound_url" ref="checkin_sound" />
  <audio :src="checkout_sound_url" ref="checkout_sound" />
</template>

<script>
import { defineComponent } from 'vue';
import { PB, EMAIL_REGEX, person_id, my_person, login_status, PB_Punches, i_am_checked_in, total_ms, FULL_LOGIN_PREFIX, i_am_administrator } from "../state.js";
import checkin_sound_url from "../assets/touchswitch.mp3";
import checkout_sound_url from "../assets/gate_close.mp3";
import { Dialog, Notify } from 'quasar';

export default defineComponent({
    name: "IndexPage",
    data() {
        return {
            input_id: "",
            input_password: "",
            input_id_error: null,
            loading_handle: 0,
            login_error: null,
            checkin_error: null,
            checkin_sound_url,
            checkout_sound_url,
            person_id,
            person: my_person,
            login_status,
            cheeky_startup_delay_finished: false,
            i_am_checked_in,
            total_ms,
        }
    },

    created() {
        setTimeout(() => this.cheeky_startup_delay_finished = true, 150);
    },

    computed: {
        cheeky_screen_delay() { return this.person == null && !this.cheeky_startup_delay_finished; },
        login_busy() { return this.login_status === 'logging-in' },
        real_login_error() { return this.login_error ?? (login_status.value === "error" ? "There was an error singin in" : null); },
        total_hours() { return Math.floor(this.total_ms / 1000 / 60 / 60); },
        is_full_login() { return this.input_id.match(EMAIL_REGEX) !== null; }
    },

    methods: {
        async login() {
            this.clear_errors();
            const id = this.input_id.trim();
            if (id.length === 0) {
                this.input_id_error = "Please enter an ID";
                return;
            }
            if (this.is_full_login) {
                try {
                    const auth = await PB.collection("users").authWithPassword(this.input_id, this.input_password);
                    this.person_id = FULL_LOGIN_PREFIX + PB.authStore.exportToCookie();
                } catch (e) {
                    this.input_id_error = "Invalid username or password or something went wrong";
                    console.error(e);
                }
            } else {
                this.person_id = id;
            }
        },

        async checkin() {
            this.clear_errors();
            this.loading_handle++;
            this.$refs.checkin_sound.volume = 0.1;
            this.$refs.checkout_sound.volume = 0.1;
            try {
                await PB_Punches.create({
                    "person": this.person.id
                });
            } catch (e) {
                this.checkin_error = e.toString() + "\n" + e.stack;
            } finally {
                this.loading_handle--;
            }
        },

        clear_errors() {
            this.login_error = null;
            this.checkin_error = null;
            this.input_id_error = null;
        },

        check_email() {
            if (this.person_id != null) {
                console.log(this.person.first_name)
                Dialog.create({
                    title: 'Email Needed!',
                    message: 'Please provide your <b>personal</b> email below',
                    html: true,
                    prompt: {
                        model: '',
                        isValid: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
                        type: 'text'
                    },
                    cancel: false,
                    persistent: true
                }).onOk(data => {
                    console.log(data);
                })
            }
        }
    },
})
</script>
