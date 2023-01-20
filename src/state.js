import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbzpavJFnwlJdQDqhc3C7frgJzvEfp5IW-c6G04SqOqq2JM4D2pI4iCud8DQ-h57Kks/exec"
});

export default state;