Vue.use(Vuex);

const vuexStore = new Vuex.Store({
    state: {
        isLoggedIn: false,
        role: null,
        // userId: null,
    },
    mutations: {
        setLogin(state, status) {
            state.isLoggedIn = status;
        },
        setLogout(state) {
            state.isLoggedIn = false;
            state.role = null;
            state.userId = null;
        },
        setRole(state, role) {
            state.role = role;
        },
        // setUserId(state, id) {
        //     state.userId = id;
        // },
    },
});

export default vuexStore;