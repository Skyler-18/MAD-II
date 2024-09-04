import Navbar from './components/Navbar.js'
import router from './utils/router.js'

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
});