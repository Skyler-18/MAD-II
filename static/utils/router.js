import Home from '../pages/Home.js';
import Login from '../pages/Login.js';
import Signup from '../pages/Signup.js';
import Logout from '../pages/Logout.js';
import Profile from '../pages/Profile.js';
import SponsorCampaignPage from '../pages/Sponsor/SponsorCampaignPage.js';
import InfluencerDashboard from '../pages/Influencer/InfluencerDashboard.js';
import SponsorDashboard from '../pages/Sponsor/SponsorDashboard.js';
import AdminDashboard from '../pages/Admin/AdminDashboard.js'; // Ensure you have this import
import Invalid from '../components/Invalid.js';
import vuexStore from '../store/vuex-store.js';
import AddCampaign from '../pages/Sponsor/AddCampaign.js';
import EditCampaign from '../pages/Sponsor/EditCampaign.js';
import AddAd from '../pages/Sponsor/AddAd.js';
import SponsorCampaignDetails from '../pages/Sponsor/SponsorCampaignDetails.js';
import InfluencerCampaignDetails from '../pages/Influencer/InfluencerCampaignDetails.js';
import EditAd from '../pages/Sponsor/EditAd.js'
import InfluencerCampaignPage from '../pages/Influencer/InfluencerCampaignPage.js';
import SponsorRequests from '../pages/Sponsor/SponsorRequests.js';
import InfluencerRequests from '../pages/Influencer/InfluencerRequests.js';
import SearchInfluencers from '../pages/Sponsor/SearchInfluencers.js';
import AllUsers from '../pages/Admin/AllUsers.js'
import AllCampaigns from '../pages/Admin/AllCampaigns.js'

Vue.use(VueRouter);

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/signup', component: Signup },
    { path: '/logout', component: Logout },
    { path: '/profile', component: Profile, meta: { requiresAuth: true } },

    { path: '/dashboard/admin', component: AdminDashboard, meta: { requiresAuth: true } },
    { path: '/dashboard/sponsor', component: SponsorDashboard, meta: { requiresAuth: true } },
    // {path: '/sponsor/campaigns', component: CampaignPage, meta: { requiresAuth: true } },
    { path: '/sponsor/campaigns/:id', component: SponsorCampaignPage, meta: { requiresAuth: true } },

    { path: '/dashboard/influencer', component: InfluencerDashboard, meta: { requiresAuth: true } },
    { path: '*', component: Invalid },

    {path: '/campaign/add', component: AddCampaign, meta: { requiresAuth: true }},
    {path: '/campaign/edit/:id', component: EditCampaign, meta: { requiresAuth: true }},

    {path: '/:id/ads/add', component: AddAd, meta: { requiresAuth: true }},
    // {path: '/campaign/:id', component: CampaignDetails, meta: { requiresAuth: true }},
    {path: '/sponsor/campaign/:id', component: SponsorCampaignDetails, meta: { requiresAuth: true }},
    {path: '/influencer/campaign/:id', component: InfluencerCampaignDetails, meta: { requiresAuth: true }},


    {path: '/ad-request/edit/:id', component: EditAd, meta: { requiresAuth: true }},

    {path: '/sponsor/requests', component: SponsorRequests, meta: { requiresAuth: true }},
    {path: '/influencer/requests', component: InfluencerRequests, meta: { requiresAuth: true }},

    {path: '/:id/search/influencers', component: SearchInfluencers, meta: { requiresAuth: true }},

    {path: '/influencer/campaigns/:id', component: InfluencerCampaignPage, meta: { requiresAuth: true }},

    {path: '/users/all', component: AllUsers, meta: { requiresAuth: true }},
    {path: '/campaigns/all', component: AllCampaigns, meta: { requiresAuth: true }}
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
