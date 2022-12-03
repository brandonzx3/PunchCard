import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycby1upfsDFH_cHdGqW0z2kF3pJ1eSgpxWo5bLXWokn4Q6Tk3Q5hKLMa2zppuPPwtwrxd/exec"
});

export default state;