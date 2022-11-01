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
			<div style="padding: 1em">
				<h5 style="text-align: center; margin: 0;">Welcome {{state.user.display_name}}!</h5>
				<p style="color: gray; text-align: center">User ID: {{state.user.user_id}}</p>
				<q-btn color="red" @click="logout">log out</q-btn>
			</div>

			<div v-if="state.user.is_coach" style="padding: 1em;">
				awd
			</div>
		</q-drawer>

		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import state from "../state.js";

export default defineComponent({
	name: 'MainLayout',
	
	computed: {
		state() { return state; }
	},

	methods: {
		async logout() {
			state.user = null;
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
