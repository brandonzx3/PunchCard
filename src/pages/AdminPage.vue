<template>
    <!--
        add / remove / edit users
        get user data
        see all currently checked in users
        check out all users
        check email
    -->
    
    <div style="margin: 1em; display: flex; flex: row wrap; gap: 1em;">
        <q-btn color="red" @click="end_practice" :loading="!admin_puller.initial_load_finished">End Practice</q-btn>
        <q-btn label="Add New User" @click="adduser = true" color="primary"/>
    </div>
    <q-table :loading="!admin_puller.initial_load_finished" title="Statistics" :columns=statistics_columns :rows=statistics_rows v-model:pagination="pagination">
        <template v-slot:top-right>
            <q-btn color="primary" icon-right="archive" label="Export to csv" no-caps @click="export_table" />
      </template>
    </q-table>
    
    <q-dialog v-model="adduser">
        <q-card style="width: 600px; max-width: 90vw;">
            <q-card-section>
                <div class="text-h6">User Information</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-form @submit.prevent="add_new_user" ref="userForm">
                    <q-input
                        v-model="new_user_id"
                        type="number"
                        label="User ID"
                        class="q-mb-md"
                        :rules="[val => !!val || 'User ID is required']"
                    />
                    <q-input
                        v-model="new_user_first_name"
                        label="First Name"
                        class="q-mb-md"
                        :rules="[val => !!val || 'First name is required']"
                    />
                    <q-input
                        v-model="new_user_last_name"
                        label="Last Name"
                        class="q-mb-md"
                        :rules="[val => !!val || 'Last name is required']"
                    />

                    <q-card-actions align="right">
                        <q-btn flat label="Cancel" color="primary" @click="adduser = false" />
                        <q-btn flat label="Add User" color="primary" type="submit"/>
                    </q-card-actions>
                </q-form>
            </q-card-section>
        </q-card>
    </q-dialog>

</template>

<script>
    import { defineComponent, reactive, ref } from 'vue';
    import { AdminPunchPuller, PB_People, PB_Punches } from "../state.js";
    import { exportFile, Dialog, Notify } from 'quasar'

    const userForm = ref(null)

    export default defineComponent ({
        name: "Admin Panel",

        async mounted() {
            this.admin_puller.start();

            const people = await PB_People.getFullList();
            for(const person of people) {
                this.people.set(person.id, person);
            }
        },
        
        unmounted() {
            this.admin_puller.abort.abort();
        },

        computed: {
            statistics_rows() {
                this.people;
                const rows = reactive(Array.from(this.admin_puller.trackers.entries())).map(([person, tracker]) => {
                    console.log("rerender");
                    return {
                        name: (`${this.people.get(person)?.first_name} ${this.people.get(person)?.last_name}`) ?? "...",
                        checkedin: tracker.checked_in,
                        hours: Math.floor(tracker.elapsed_ms / 1000 / 60 / 60),
                        checkins: tracker.total_checkins,
                        average: Math.floor((tracker.elapsed_ms / tracker.total_checkins) / 1000 / 60 / 60 * 100) / 100,
                    }
                });
                return rows;
            }
        },

        data() { return {
            admin_puller: new AdminPunchPuller(),
            adduser: false,
            new_user_id: null,
            new_user_first_name: '',
            new_user_last_name: '',

            people: reactive(new Map()),

            pagination: {
                rowsPerPage: 10,
                sortBy: 'hours',
                descending: true,
            },

            test_rows: [
                {
                    name: "Christian erm",
                    hours: 10,
                    checkins: "hello??",
                    average: 10,
                }
            ],

            statistics_columns: [
                {
                    name: "name",
                    label: "Student",
                    field: "name",
                    required: true,
                    align: "left",
                    sortable: true,
                },
                {
                    name: "checkedin",
                    label: "Checked In?",
                    field: "checkedin",
                    required: true,
                    align: "left",
                    sortable: true,
                },
                {
                    name: "hours",
                    label: "Total Hours",
                    field: "hours",
                    required: true,
                    align: "right",
                    sortable: true,
                    sortOrder: "da",
                },
                {
                    name: "checkins",
                    label: "Total Checkins",
                    field: "checkins",
                    required: true,
                    align: "right",
                    sortable: true,
                },
                {
                    name: "average",
                    label: "Average Hours Per Checkin",
                    field: "average",
                    required: true,
                    align: "right",
                    sortable: true,
                }
            ]
        } },

        methods: {
            async end_practice() {
                Dialog.create({
                    title: "Are You Sure!",
                    message: "This Action Will Check Everyone Out. This Action Is Not Reversible",
                    cancel: true,
                }).onOk(async () => {
                    for (const [person_id, tracker] of this.admin_puller.trackers.entries()) {
                    if(tracker.checked_in) {
                        await PB_Punches.create({
                            "person": person_id
                        });
                    }
                }
                })
            },

            async add_new_user() {
                const data = {
                    "person_id": this.new_user_id,
                    "first_name": this.new_user_first_name.trim(),
                    "last_name": this.new_user_last_name.trim()
                }

                try {
                    const record = await PB_People.create(data);
                } catch(e) {
                    console.log(e);

                    Notify.create({
                        message: 'Failed to add user to DB',
                        color: 'negative',
                        icon: 'warning'
                    });
                    return;
                }
                
                this.new_user_id = null;
                this.new_user_first_name = '';
                this.new_user_last_name = '';

                this.adduser = false;
            },

            
            wrapCsvValue (val, formatFn, row) {
                let formatted = formatFn !== void 0 ? formatFn(val, row) : val
                formatted = formatted === void 0 || formatted === null ? '' : String(formatted)
                formatted = formatted.split('"').join('""')
                return `"${formatted}"`
            },

            export_table() {
                const content = [this.statistics_columns.map(col => this.wrapCsvValue(col.label))].concat(
                this.statistics_rows.map(row => this.statistics_columns.map(col => this.wrapCsvValue(
                    typeof col.field === 'function'
                    ? col.field(row)
                    : row[ col.field === void 0 ? col.name : col.field ],
                    col.format,
                    row
                )).join(','))).join('\r\n');

                const status = exportFile(
                    'table-export.csv',
                    content,
                    'text/csv'
                );

                if(status !== true) {
                    Notify.create({
                        message: 'Browser denied file download...',
                        color: 'negative',
                        icon: 'warning'
                    });
                }
            }
        }
    })
</script>
