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
});