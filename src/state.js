import { computed, reactive, ref, watchEffect } from "vue";
import PocketBase from "pocketbase";

export const PB = new PocketBase(window.location.hostname === "localhost" ? "http://localhost:8090/" : new URL("/", window.location.href).href);
window.PB = PB;
export const PB_People = PB.collection("people");
export const PB_Punches = PB.collection("punches");

const PERSON_ID_KEY = "user";
export const FULL_LOGIN_PREFIX = "FULL_LOGIN:";
export const person_id = ref(localStorage.getItem(PERSON_ID_KEY));
export const my_person = ref(null);
//"logged-out" | "logging-in" | "logged-in" | "error";
export const login_status = ref(person_id.value === null ? "logging-in" : "logged-out");
export const i_am_administrator = ref(false);
watchEffect(registerCleanup => {
    i_am_administrator.value = false;
    if (person_id.value == null) {
        my_person.value = null;
        login_status.value = "logged-out";
        localStorage.removeItem(PERSON_ID_KEY);
    } else {
        login_status.value = "logging-in";
        localStorage.setItem(PERSON_ID_KEY, person_id.value)
        const abort = new AbortController();
        registerCleanup(() => abort.abort());
        const signal = abort.signal;
        (async function() {
            try {
                if (person_id.value.startsWith(FULL_LOGIN_PREFIX)) {
                    PB.authStore.loadFromCookie(person_id.value.substring(FULL_LOGIN_PREFIX.length));
                    const userResponse = await PB.collection("users").authRefresh({
                        expand: "person",
                        signal,
                    });
                    my_person.value = userResponse.record.expand.person;
                    i_am_administrator.value = true;
                } else {
                    const personRecord = await PB_People.getFirstListItem(
                        PB.filter("person_id = {:person_id}", { person_id: person_id.value }),
                        { signal, }
                    );
                    my_person.value = personRecord;
                }
                login_status.value = "logged-in";
                return PB_People.subscribe(my_person.value.id, person_event => my_person.value = person_event.record, { signal });
            } catch (e) {
                PB.authStore.clear();
                console.warn(e);
                login_status.value = "error";
            }
        })()
    }
});

export class AdminPunchPuller {
    trackers = reactive(new Map());
    abort = new AbortController();
    initial_load_finished = ref(false);

    route_punch(punch) {
        if(!this.trackers.has(punch.person)) {
            const new_tracker = new PunchTracker();
            this.trackers.set(punch.person, new_tracker);
        }
        this.trackers.get(punch.person).handle_next_punch(punch);
    }

    async start() {
        const signal = this.abort.signal;
        const punches = await PB_Punches.getFullList({signal});

        PB_Punches.subscribe("*", punch_event => {
            this.route_punch(punch_event.record)
        }, { signal });

        for (const punch of punches) {
            this.route_punch(punch);
        }
        this.initial_load_finished = true;
    }
}

class BasicPunchPuller {
    tracker = reactive(new PunchTracker());
    abort = new AbortController();

    constructor(pocketbase_id) {
        this.pocketbase_id = pocketbase_id;
    }

    async start() {
        const signal = this.abort.signal;
        const punches = await PB_Punches.getFullList({
            filter: PB.filter("person = {:person}", {person: this.pocketbase_id}),
            signal,
        });

        PB_Punches.subscribe("*", punch_event => {
            if(punch_event.record.person === this.pocketbase_id) {
                this.tracker.handle_next_punch(punch_event.record)
            }
        }, { signal });

        for (const punch of punches) {
            this.tracker.handle_next_punch(punch);
        }
    }
}

class PunchTracker {
    checked_in = false;
    elapsed_ms = 0;
    previous_datetime = null;
    total_checkins = 0;

    handle_next_punch(punch) {
        this.checked_in = !this.checked_in;
        var punch_time = punch.legacy_time;
        if (punch_time == null || punch_time === "") punch_time = punch.created;
        if(this.checked_in) {
            this.previous_datetime = new Date(punch_time);
            this.total_checkins += 1;
        } else {
            var delta = Math.min(new Date(punch_time).valueOf() - this.previous_datetime.valueOf(), 7 * 60 * 60 * 1000);
            this.elapsed_ms += delta;
            this.previous_datetime = null;
        }
    }
}

const person_pocketbase_id = computed(() => {
    if (my_person.value == null) return null;
    return my_person.value.id;
});

const my_punch_polller = computed(() => {
    if (person_pocketbase_id.value == null) return null;
    return new BasicPunchPuller(person_pocketbase_id.value);
});
watchEffect(registerCleanup => {
    const poller = my_punch_polller.value;
    if (poller == null) return;
    poller.start();
    registerCleanup(() => poller.abort.abort());
});

export const total_ms = computed(() => my_punch_polller.value?.tracker.elapsed_ms);
export const i_am_checked_in = computed(() => my_punch_polller.value?.tracker.checked_in);

export const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;