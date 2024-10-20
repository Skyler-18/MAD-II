import Navbar from './components/Navbar.js'
import router from './utils/router.js'
import vuexStore from './store/vuex-store.js'

Vue.config.devtools = true;

new Vue({
    el: "#app",
    template: `
    <div>
        <Navbar/>
        <router-view/>
    </div>
    `,
    components: {
        Navbar,
    },
    router,
    store: vuexStore,
    created() {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (token && role) {
            // Validate token with backend if necessary
            this.$store.commit("setLogin", true);
            this.$store.commit("setRole", role);
        } else {
            this.$store.commit("setLogin", false);
            this.$store.commit("setRole", null);
        }
    },
});