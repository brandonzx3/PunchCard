import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbwIEG2STq6_o8zMS9SM8VC-OVujqdXF4SqHWEDimWUtpf0yOAueUF5q4AXDN6Yk5att/exec"
});

export default state;