import Home from '../pages/Home.js'
import Login from '../pages/Login.js'
import Signup from '../pages/Signup.js'
// import Logout from '../pages/Logout.js'
import Profile from '../pages/Profile.js'
import SponsorDashboard from '../pages/SponsorDashboard.js'
import InfluencerDashboard from '../pages/InfluencerDashboard.js'

const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/signup', component: Signup},
    // {path: '/logout', component: Logout},
    {path: '/profile', component: Profile},
    {path: '/dashboard/sponsor', component: SponsorDashboard},
    {path: '/dashboard/influencer', component: InfluencerDashboard},
]

const router = new VueRouter({
    routes,
});

export default router;