const Navbar = {
    template: `
    <nav>
        <router-link to='/'>Home</router-link>
        <router-link to='/login'>Log In</router-link>
        <router-link to='/signup'>Sign Up</router-link>
        <a v-bind:href="url">Log Out </a>
    </nav>
    `,
    data() {
        return{
            url: window.location.origin + "/logout"
        };
    },
};

export default Navbar;