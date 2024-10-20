import Home from '../pages/Home.js';
import Login from '../pages/Login.js';
import Signup from '../pages/Signup.js';
import Logout from '../pages/Logout.js';
import Profile from '../pages/Profile.js';
import SponsorDashboard from '../pages/SponsorDashboard.js';
import InfluencerDashboard from '../pages/InfluencerDashboard.js';
import AdminDashboard from '../pages/AdminDashboard.js'; // Ensure you have this import
import Invalid from '../components/Invalid.js';
import vuexStore from '../store/vuex-store.js';
import AddCampaign from '../pages/AddCampaign.js';
import EditCampaign from '../pages/EditCampaign.js';

Vue.use(VueRouter);

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/signup', component: Signup },
    { path: '/logout', component: Logout },
    { path: '/profile', component: Profile, meta: { requiresAuth: true } },
    { path: '/dashboard/admin', component: AdminDashboard, meta: { requiresAuth: true } },
    { path: '/dashboard/sponsor', component: SponsorDashboard, meta: { requiresAuth: true } },
    { path: '/dashboard/influencer', component: InfluencerDashboard, meta: { requiresAuth: true } },
    { path: '*', component: Invalid },
    {path: '/campaign/add', component: AddCampaign, meta: { requiresAuth: true }},
    {path: '/campaign/edit/:id', component: EditCampaign, meta: { requiresAuth: true }}
];

const router = new VueRouter({
    routes,
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = localStorage.getItem("token") !== null;
    if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
        next('/login');
    } else {
        next();
    }
});

export default router;
