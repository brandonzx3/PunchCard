import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbxrHqTO1ad3k7r1rP12eWwB0_60Ju0VMSiYTpVKdD0LTMQ5DpUC41wb8HdTLJD26wvi/exec"
});

export default state;