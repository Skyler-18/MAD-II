const Login = {
    template:`
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div class="card shadow p-4 border rounded-3 ">
        <h3 class="card-title text-center mb-4">Login</h3>

        <div class="form-group mb-3">
          <input v-model="email" type="text" class="form-control" placeholder="Email/Username" required/>
        </div>

        <div class="form-group mb-4">
          <input v-model="password" type="password" class="form-control" placeholder="Password" required/>
        </div>

        <button class="btn btn-primary w-100" @click="submitInfo">Submit</button>
      </div>
    </div>
  `,
  data() {
    return {
        email: "",
        password: "",
    };
  },
  methods: {
    async submitInfo() {
        const origin = window.location.origin;
        // const url = `${origin}/login`;
        const res = await fetch(origin + "/user-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: this.email, password: this.password }),
          credentials: "same-origin",
        });
  
        if (res.ok) {
            // vuexStore.commit("setLogin");
            const mssg = await res.json();
            // console.log(vuexStore.state.loggedIn);

            sessionStorage.setItem("token", mssg.token);
            sessionStorage.setItem("id", mssg.id);
            sessionStorage.setItem("email", mssg.email);
            sessionStorage.setItem("role", mssg.role);

            console.log(sessionStorage.getItem("role"));

            this.$store.commit("setRole", mssg.role);
            this.$store.commit("setLogin", true);

            switch(mssg.role) {
              case "admin":
                this.$router.push("/dashboard/admin");
                break;
              case "sponsor":
                this.$router.push("/dashboard/sponsor");
                break;
              case "influencer":
                this.$router.push("/dashboard/influencer");
                break;
            }
            // else {
            //   console.error("Login Failed");
            // }
            
            // router.push("/profile");
        } else {
            const errorMssg = await res.json();
            console.error("Login Failed: ", errorMssg);
        }
    },
    },
};

export default Login;