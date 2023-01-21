import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbyRLMUt10NbvLjq93uJghV6VXZYL6EqOyG04kOpwNqU_xb-_Qc0Lf1ZBvDyLat6IVq_/exec"
});

export default state;