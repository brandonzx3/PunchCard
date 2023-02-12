import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbwleC8UbWVbZClr1_U4xRSZEF88FXxlKmbWjl_w39qi44xmHQ7polXZ338onb2LUonW/exec"
});

export default state;