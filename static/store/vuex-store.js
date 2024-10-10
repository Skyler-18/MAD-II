Vue.use(Vuex);

const vuexStore = new Vuex.Store({
    state: {
        isLoggedIn: false,
        role: "",
    },
    mutations: {
        setLogin(state) {
            state.isLoggedIn = true;
        },
        setLogout(state) {
            state.isLoggedIn = false;
            // state.role = null;
        },
        setRole(state, role) {
            state.role = role;
        },
    },
});

export default vuexStore;