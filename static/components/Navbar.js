const Navbar = {
    template: `
    <nav>
        <router-link to='/'>Home</router-link>

        <router-link v-if="!state.isLoggedIn" to='/login'>Log In</router-link>
        <router-link v-if="!state.isLoggedIn" to='/signup'>Sign Up</router-link>

        <router-link v-if="state.isLoggedIn && state.role === 'admin'" to='/dashboard/admin'>Admin Dashboard</router-link>
        <router-link v-if="state.isLoggedIn && state.role === 'sponsor'" to='/dashboard/sponsor'>Sponsor Dashboard</router-link>
        <router-link v-if="state.isLoggedIn && state.role === 'influencer'" to='/dashboard/influencer'>Influencer Dashboard</router-link>

        <router-link v-if="state.isLoggedIn" to='/profile'>Profile</router-link>

        <button class="btn btn-warning text-xl" v-if="state.isLoggedIn" @click="logout">LogOut</button>
    </nav>
    `,
    methods: {
        logout() {
            sessionStorage.clear();
            // vuexStore.setLogout();
            this.$store.commit("setLogout");
            this.$store.commit("setRole", null);

            this.$router.push("/");
        },
    },
    computed: {
        state() {
            return this.$store.state;
        },
    },
};

export default Navbar;