Vue.use(Vuex);

const vuexStore = new Vuex.Store({
    state: {
        isLoggedIn: false,
        role: null,
    },
    mutations: {
        setLogin(state, status) {
            state.isLoggedIn = status;
        },
        setLogout(state) {
            state.isLoggedIn = false;
            state.role = null;
        },
        setRole(state, role) {
            state.role = role;
        },
    },
});

export default vuexStore;