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
    </div>
    <q-table :loading="!admin_puller.initial_load_finished" title="Statistics" :columns=statistics_columns :rows=statistics_rows v-model:pagination="pagination" />
    
</template>

<script>
    import { defineComponent, reactive, ref } from 'vue';
    import { AdminPunchPuller, PB_People, PB_Punches } from "../state.js";

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
                for (const [person_id, tracker] of this.admin_puller.trackers.entries()) {
                    if(tracker.checked_in) {
                        await PB_Punches.create({
                            "person": person_id
                        });
                    }
                }
            }
        }
    })
</script>
