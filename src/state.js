import { reactive } from "vue";

const state = reactive({
    user: null,
    logged_in: false,
    endpoint: "https://script.google.com/macros/s/AKfycbyPJ5Fa7OdMLAxng3wcGul9I6JinNVLs-I9j6mZI1RUvTfA49Ue9LFXHjLZSWkgjXJi/exec"
});

export default state;