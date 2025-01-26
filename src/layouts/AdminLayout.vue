<template>
  <router-view v-if="i_am_administrator" />
  <q-spinner v-else-if="login_status === 'logging-in'" />
  <div v-else>
    Forbidden<br />
  <q-btn @click="logout">Logout</q-btn>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { person_id, login_status, i_am_administrator } from "../state.js";

export default defineComponent({
  name: "AdminLayout",
  data() {
    return {
      login_status,
      i_am_administrator,
    }
  },

  methods: {
    logout() {
      person_id.value = null;
      this.$router.push('/');
    }
  }
});
</script>