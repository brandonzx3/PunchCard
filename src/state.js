import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbzykDWgpJM662dFE3vnprM38bSMRqCuye1ZuGksVRUhMNq6SdcKedq5wOaAEKPqV6el/exec"
});

export default state;