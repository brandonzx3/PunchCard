import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbzR8BKLt8OzpetvLpn-jWkelgkIbfUIqDUSCwXP16gWFjoQJE0641sONsGbgE2zZxeq/exec"
});

export default state;