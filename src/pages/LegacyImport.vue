<template>
  <q-page>
    <q-input
      filled
      type="textarea"
      label="Paste CSV data here"
      v-model="csvData"
    />
    <q-input
      filled
      type="textarea"
      label="Paste second set of CSV data here"
      v-model="csvData2"
    />
    <q-input
      filled
      type="text"
      label="Username"
      v-model="username"
    />
    <q-input
      filled
      type="password"
      label="Password"
      v-model="password"
    />
    <q-btn @click="handleCsvInput" label="Import CSV Data" />
    <q-btn @click="handleCsvInput2" label="Import Second CSV Data" />
    <q-spinner v-if="loading" />
  </q-page>
</template>

<script>
import { PB_People, PB_Punches, PB } from 'src/state';
import { defineComponent } from 'vue';

export default defineComponent({
  name: "LegacyImport",
  data() {
    return {
      csvData: '',
      csvData2: '',
      username: '',
      password: '',
      loading: false
    }
  },
  methods: {
    async handleCsvInput() {
      this.loading = true;

      // Authenticate as superuser
      const authenticated = await this.authenticateSuperuser(this.username, this.password);
      if (!authenticated) {
        this.loading = false;
        alert('Authentication failed');
        return;
      }

      const lines = this.csvData.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index].trim();
          return obj;
        }, {});
      });

      for (const row of data) {
        let my_email = row.email;
        if (row.email != null && row.email.length === 0) my_email = null;
        const person = {
          person_id: row.user_id,
          first_name: row.first_name,
          last_name: row.last_name,
          email: my_email,
        };
        await PB_People.create(person);
      }

      this.loading = false;
      console.log('Data import complete');
    },
    async handleCsvInput2() {
      this.loading = true;

      // Authenticate as superuser
      const authenticated = await this.authenticateSuperuser(this.username, this.password);
      if (!authenticated) {
        this.loading = false;
        alert('Authentication failed');
        return;
      }

      const lines = this.csvData2.split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index].trim();
          return obj;
        }, {});
      });

      for (const row of data) {
        // Look up the PocketBase ID of the user
        const personRecord = await PB_People.getFirstListItem(PB.filter("person_id = {:person_id}", {person_id: row.user_id}));
        if (personRecord) {
          const punch = {
            person: personRecord.id, // Use the PocketBase ID
            legacy_time: new Date(row.datetime)
          };
          await PB_Punches.create(punch);
        } else {
          console.error(`User with ID ${row.user_id} not found`);
        }
      }

      this.loading = false;
      console.log('Second data import complete');
    },
    async authenticateSuperuser(username, password) {
      try {
        await PB.collection("_superusers").authWithPassword(username, password);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    }
  }
})
</script>