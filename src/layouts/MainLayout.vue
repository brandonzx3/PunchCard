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
				<p style="color: gray; text-align: center;">User ID: {{state.user.user_id}}</p>
				<q-btn color="red" @click="logout">log out</q-btn>
				<template v-if="state.user.is_coach" >
					<h6 style="margin: 1em">Coach &amp; Mentor Settings</h6>
					<q-btn @click="end_practice" color="primary" :loading="end_practice_loading_handle > 0">End Practace</q-btn>
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
		end_practice_loading_handle: 0,
		end_practice_error: null,
	} },

	methods: {
		async logout() {
			this.state.user = null;
			this.state.logged_in = false;
			localStorage.clear();
		},

		async end_practice() {
			this.end_practice_loading_handle++;
			try {
				const op = await fetch(state.endpoint + `?action=end_practice&user_id=${encodeURIComponent(state.user_id)}`).then(res => res.json());
				if (op.success) {
					for (const user of op.result) {
						if (user.user_id === state.user.user_id) state.user = user;
					}
					Dialog.create({
						title: "Practice ended",
						message: op.result.length == 0 ? undefined : ("The following students were signed out: " + op.result.map(user => user.full_name).join("; ")),
					});
				} else {
					this.end_practice_error = op.error;
				}
			} catch(e) {
				console.log(e);
				this.end_practice_error = e.toString() + "\n" + e.stack;
			} finally {
				this.end_practice_loading_handle--;
			}
		},

		clear_errors() {
			end_practice_error = null;
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
