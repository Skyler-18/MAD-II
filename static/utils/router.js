import Home from '../pages/Home.js'
import Login from '../pages/Login.js'
import Signup from '../pages/Signup.js'
import Logout from '../pages/Logout.js'
import Profile from '../pages/Profile.js'
import SponsorDashboard from '../pages/SponsorDashboard.js'
import InfluencerDashboard from '../pages/InfluencerDashboard.js'
import AdminDashboard from '../pages/AdminDashboard.js'
import Invalid from '../components/Invalid.js'
import AddCampaign from '../pages/AddCampaign.js'

import vuexStore from '../store/vuex-store.js'

Vue.use(VueRouter);

const routes = [
    {path: '/', component: Home},

    {path: '/login', component: Login},
    {path: '/signup', component: Signup},
    {path: '/logout', component: Logout},

    {path: "/dashboard/admin", component: AdminDashboard, meta: {requiresLogin: true, role: "admin"},},

    {path: "/dashboard/sponsor", component: SponsorDashboard, meta: {requiresLogin: true, role: "sponsor"},},
    {path: "/campaign/add", component: AddCampaign, meta: {requiresLogin: true, role: "sponsor"},},

    {path: "/dashboard/influencer", component: InfluencerDashboard, meta: {requiresLogin: true, role: "influencer"},},

    {path: '/profile', component: Profile, meta: {requiresLogin: true}},
    
    {path: '*', component: Invalid}
];

const router = new VueRouter({
    routes,
});

router.beforeEach((destination, origin, proceed) => {
    if (destination.matched.some((record) => record.meta.requiresLogin)) {
        if (! vuexStore.state.isLoggedIn) {
            proceed({path: "/login"});
        }
        else if (destination.meta.role && vuexStore.state.role !== destination.meta.role) {
            proceed({path: "/"});
        }
        else {
            proceed();
        }
    }
    else {
        proceed();
    }
});

export default router;