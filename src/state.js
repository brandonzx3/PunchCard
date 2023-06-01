import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbwNFcNH6P9zSkZD3EWA17Ow4rXTsQ3EkqQg8fxGDg1Qj8ZHf-R83DTiMDleAqW874UY/exec"
});

export default state;