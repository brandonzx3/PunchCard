import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbwO50wa3GXQ2dy5jJaet_lo8sAIireHrWdHR5codUJB-Dax5MfuaN3MJCWM_N8htObP/exec"
});

export default state;