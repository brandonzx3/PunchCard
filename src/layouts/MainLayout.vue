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
					v-if="person != null"
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
			v-if="person != null"
		>
			<div id="drawer">
				<h5 style="text-align: center; margin: 0;">{{person.first_name}}</h5>
				<p style="color: gray; text-align: center; margin-bottom: 0;">User ID: {{person.person_id}}</p>
				<p style="color: gray; text-align: center; white-space: pre-line;">
					Total Time: {{ total_time }}
				</p>
				<q-btn color="red" @click="logout">Log Out</q-btn>
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
import { person_id, person, login_status, PB_Punches, i_am_checked_in, total_ms } from "../state.js";
import { Dialog } from "quasar";

export default defineComponent({
	name: 'MainLayout',
	
	computed: {
		total_time() {
			const seconds = Math.floor(this.total_ms / 1000);
			const minutes = Math.floor(seconds / 60);
			const hours = Math.floor(minutes / 60);
			const remainingSeconds = seconds % 60;
			const remainingMinutes = minutes % 60;
			return `\nHours: ${hours}\nMinutes: ${remainingMinutes}\nSeconds: ${remainingSeconds}`;			
		}
	},

	data() { return {
		loading_handle: 0,
		end_practice_error: null,
		get_checkin_error: null,
		get_student_error: null,
		person,
		person_id,
		total_ms,
	} },

	methods: {
		async logout() {
			this.person_id = null;
		},

		async end_practice() {
			this.clear_errors();
			this.loading_handle++;
			try {
				const op = await fetch(state.endpoint + `?action=end_practice&user_id=${encodeURIComponent(state.user.user_id)}`).then(res => res.json());
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
				const op = await fetch(state.endpoint + `?action=get_checkedin&user_id=${encodeURIComponent(state.user.user_id)}`).then(res => res.json());
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

		async get_students() {
			this.clear_errors()
			this.loading_handle++;
			try {
				const op = await fetch(state.endpoint + `?action=get_students&user_id=${encodeURIComponent(state.user.user_id)}`).then(res => res.json());
				if (op.success) {
					let sorted = op.result.sort((a, b) => {
						return b.total_hours - a.total_hours
					});
					Dialog.create({
						title: "Student Data",
						html: true,
						fullWidth: true,
						message: op.result.length == 0 ? "somehting went wrong" :`Number of Students: ${sorted.length}` + 
							`<div style="display: flex; display: flex; flex-flow: row wrap; gap: 1.4em; overflow: hidden auto; width: 100%; justify-content: center;">` +
							sorted.map(user => `
							<div style="background-color:#eaecee; font-size: large; border-radius: 25px; padding: 10px 2em; width: 20%;">
								<p style="text-align: center; margin: 0px; font-weight: bold;">${user.full_name}</p>
								<p style="text-align: center; margin: 0px;">Total Hours: ${user.total_hours}</p>
								<p style="text-align: center; margin: 0px;">Total Check-ins: ${user.num_checkins}</p>
								<p style="text-align: center; margin: 0px;">Average Time Per Check-in: ${Math.floor(user.total_hours / user.num_checkins)} Hours</p>
							</div>
							`).join("") + `</div>`,
					});
				} else {
					this.get_student_error = op.error;
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
			this.get_student_error = null;
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
