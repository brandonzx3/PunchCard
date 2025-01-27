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
				<q-btn style="margin-top: 1em" color="primary" v-if="i_am_administrator" @click="openAdminPanel">Admin Panel</q-btn>
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
import { person_id, my_person, login_status, PB_Punches, i_am_checked_in, total_ms, i_am_administrator } from "../state.js";
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
			return `${hours} Hours ${remainingMinutes} minutes ${remainingSeconds} seconds`;			
		}
	},

	data() { return {
		loading_handle: 0,
		end_practice_error: null,
		get_checkin_error: null,
		get_student_error: null,
		person: my_person,
		person_id,
		total_ms,
		i_am_administrator,
	} },

	methods: {
		logout() {
			this.person_id = null;
			this.$router.push("/");
		},

		openAdminPanel() {
			this.$router.push("admin");
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
