import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycby1XRNWGmvFIf-g_p9leZz_eJ_yx9bidrsbOYA7PkD6SzBOYWoeemGkiDRqUSQHHy2C/exec"
});

export default state;