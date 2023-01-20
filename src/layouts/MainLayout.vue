<template>
	<q-layout view="lHh Lpr lFf">
		<q-header elevated>
			<q-toolbar>
				<q-btn
					flat
					dense
					round
					icon="menu"
					aria-label="Menu"
					@click="toggleLeftDrawer"
					v-if="state.user != null"
				/>

				<q-toolbar-title>
					Punchcard
				</q-toolbar-title>

				<div>Quasar v{{ $q.version }}</div>
			</q-toolbar>
		</q-header>
			
		<q-drawer
			v-model="leftDrawerOpen"
			bordered
			v-if="state.user != null"
		>
			<div id="drawer">
				<h5 style="text-align: center; margin: 0;">{{state.user.display_name}}</h5>
				<p style="color: gray; text-align: center; margin-bottom: 0;">User ID: {{state.user.user_id}}</p>
				<p style="color: gray; text-align: center;">
					Total Time: 
					{{state.user.total_hours}} Hours, 
					{{Math.floor((state.user.total_seconds - (state.user.total_hours * 3600)) / 60)}} Minutes, 
					{{state.user.total_seconds - (state.user.total_hours * 3600) - (Math.floor((state.user.total_seconds - (state.user.total_hours * 3600)) / 60) * 60)}} Seconds
				</p>
				<q-btn color="red" @click="logout">log out</q-btn>	
				<template v-if="state.user.is_coach" >
					<h6 style="margin: 1em">Coach &amp; Mentor Settings</h6>
					<a style="margin-bottom: 16px;" href="https://script.google.com/home/projects/15PbQQR0Ac9YbxxnsoQcv2ly1muj_BP14BZTdmXTI_mBFT1iB922V23eq">Backend Analytics</a>
					<q-btn @click="get_checkedin" color="primary" :loading="loading_handle > 0">See Checkin-In Users</q-btn>
					<span style="color:red" v-if="get_checkin_error != null">{{get_checkin_error}}</span>
					<q-btn style="margin-top: 16px" @click="end_practice"  color="primary" :loading="loading_handle > 0">End Practice</q-btn>
					<span style="color:red" v-if="end_practice_error != null">{{end_practice_error}}</span>
				</template>
			</div>

		</q-drawer>

		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<style scoped>
#drawer {
	padding: 1em;
	display: flex;
	flex-flow: column nowrap;
	align-items: center;
}

</style>

<script>
import { defineComponent, ref } from 'vue'
import state from "../state.js";
import { Dialog } from "quasar";

export default defineComponent({
	name: 'MainLayout',
	
	computed: {
		state() { return state; }
	},

	data() { return {
		loading_handle: 0,
		end_practice_error: null,
		get_checkin_error: null,
	} },

	methods: {
		async logout() {
			this.state.user = null;
			this.state.logged_in = false;
			localStorage.clear();
		},

		async end_practice() {
			this.clear_errors();
			this.loading_handle++;
			try {
				const op = await fetch(state.endpoint + `?action=end_practice&user_id=${encodeURIComponent(state.user_id)}`).then(res => res.json());
				if (op.success) {
					for (const user of op.result) {
						if (user.user_id === state.user.user_id) state.user = user;
					}
					Dialog.create({
						title: "Practice ended",
						message: op.result.length == 0 ? "Nobody was checked out" : ("The following students were signed out: " + op.result.map(user => user.full_name).join("; ")),
					});
				} else {
					this.end_practice_error = op.error;
				}
			} catch(e) {
				console.log(e);
				this.error = e.toString() + "\n" + e.stack;
			} finally {
				this.loading_handle--;
			}
		},

		async get_checkedin() {
			this.clear_errors()
			this.loading_handle++;
			try {
				const op = await fetch(state.endpoint + `?action=get_checkedin&user_id=${encodeURIComponent(state.user_id)}`).then(res => res.json());
				if (op.success) {
					Dialog.create({
						title: "Checked-In Users",
						message: op.result.length == 0 ? "No one is signed in." : ("The following students are signed in: " + op.result.map(user => user.full_name).join("; ")),
					});
				} else {
					this.get_checkin_error = op.error;
				} 
			} catch(e) {
				console.log(e);
				this.error = e.toString() + "\n" + e.stack;
			} finally {
				this.loading_handle--;
			}
		},

		clear_errors() {
			this.end_practice_error = null;
			this.get_checkin_error = null;
		}
	},

	setup () {
		const leftDrawerOpen = ref(false)

		return {
			leftDrawerOpen,
			toggleLeftDrawer () {
				leftDrawerOpen.value = !leftDrawerOpen.value
			}
		}
	}
})
</script>
