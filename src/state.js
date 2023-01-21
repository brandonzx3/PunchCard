import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbwQz6HrQIoZfXm5fpbbtoB9yguVG7LtXgNLseLfzIxNnVMwBi1N_BKKuMhw7Z9Tpph8/exec"
});

export default state;