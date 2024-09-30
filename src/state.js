import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbzraCSOANKZ9TXsLdKp0GK7X50DqUQnfnF97nCKsDzpfcK2QOdCgOvI5Ho5Pb6CoG3R/exec"
});

export default state;