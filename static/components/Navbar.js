const Navbar = {
    template: `
    <nav class="navbar">
        <router-link class="navbar-brand" to='/'>SpIn</router-link>
        <div class="navbar-links">
            <router-link v-if="!state.isLoggedIn" to='/login' class="nav-button">Log In</router-link>
            <router-link v-if="!state.isLoggedIn" to='/signup' class="nav-button">Sign Up</router-link>
            <router-link v-if="state.isLoggedIn && state.role === 'admin'" to='/dashboard/admin' class="nav-link">Admin Dashboard</router-link>
            <router-link v-if="state.isLoggedIn && state.role === 'sponsor'" to='/dashboard/sponsor' class="nav-link">Sponsor Dashboard</router-link>
            <router-link v-if="state.isLoggedIn && state.role === 'influencer'" to='/dashboard/influencer' class="nav-link">Influencer Dashboard</router-link>
            <router-link v-if="state.isLoggedIn" to='/profile' class="nav-link">Profile</router-link>
            <button class="btn-logout" v-if="state.isLoggedIn" @click="logout">LogOut</button>
        </div>
    </nav>
    `,
    methods: {
        logout() {
            sessionStorage.clear();
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
    mounted() {
        const style = document.createElement('style');
        style.innerHTML = `
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.8rem 2rem;
            background-color: #e9daf7; /* Darker background color */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-bottom: 1px solid #ccc; /* Line at the bottom */
        }
        .navbar-brand {
            font-family: 'Pacifico', cursive; /* Example of a stylish font */
            font-size: 2rem; /* Increased font size */
            color: #333;
            text-decoration: none;
        }
        .navbar-links {
            display: flex;
            align-items: center;
        }
        .nav-link, .nav-button {
            margin-left: 1rem;
            padding: 0.75rem 1.5rem; /* Increased size */
            color: #333;
            text-decoration: none;
            border-radius: 4px;
            font-size: 1.2rem; /* Increased font size */
        }
        .nav-button {
            background-color: #D6CFFF; /* Darker than F4EEFF */
            color: #333;
            transition: background-color 0.3s, transform 0.3s;
        }
        .nav-button:hover {
            background-color: #B39CFF; /* Darker shade for hover effect */
            transform: translateY(-2px);
            color: #333;
            text-decoration: none;
        }
        .nav-link:hover {
            text-decoration: none; /* Remove underline on hover */
        }
        .btn-logout {
            margin-left: 1rem;
            padding: 0.75rem 1.5rem; /* Increased size */
            color: #333;
            background-color: #FFC107; /* Similar to btn-warning */
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.3s;
            font-size: 1rem; /* Increased font size */
        }
        .btn-logout:hover {
            background-color: #E0A800; /* Darker shade for hover effect */
            transform: translateY(-2px);
        }
        .navbar-hr {
            width: 100%;
            border: none;
            border-bottom: 1px solid #ccc;
            margin: 0;
        }
        `;
        document.head.appendChild(style);
    }
};

export default Navbar;
