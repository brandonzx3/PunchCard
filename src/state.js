import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbwepSTQTTjrAa1E1WSL9WqP5x0U-LdVxTrxlQvKPwIHlSkmKiZMAb5PQhcB4M2Y-9EP/exec"
});

export default state;