import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbzOv_jwGFLx9wmGwmXSv17hnFaDTRWfu_NlfvYoDG9eSj-QAQF5r6H7Nj7BtjI2A-Y/exec"
});

export default state;