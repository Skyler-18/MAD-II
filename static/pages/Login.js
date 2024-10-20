const Login = {
    template: `
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div class="card shadow p-4 border rounded-3 login-card">

        <h2 class="card-title text-center mb-4">Login</h2>

        <div class="form-group mb-3">
          <label class="form-label">Username:</label>
          <input v-model="email" type="text" class="form-control" required/>
        </div>

        <div class="form-group mb-4">
          <label class="form-label">Password:</label>
          <input v-model="password" type="password" class="form-control" required/>
        </div>

        <div class="text-center">
          <button class="custom-btn-primary" @click="submitInfo">Login</button>
        </div>
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
            const res = await fetch(origin + "/user-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: this.email, password: this.password }),
                credentials: "same-origin",
            });
            if (res.ok) {
                const mssg = await res.json();
                localStorage.setItem("token", mssg.token);
                localStorage.setItem("id", mssg.id);
                localStorage.setItem("email", mssg.email);
                localStorage.setItem("role", mssg.role);
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
            }
            else {
                const errorMssg = await res.json();
                console.error("Login Failed: ", errorMssg);
            }
        },
    },
    mounted() {
        const style = document.createElement('style');
        style.innerHTML = `
        .login-card {
            max-width: 50vh;
            width: 100%;
            max-height: 60vh;
            height: 100%;
            background-color: #A6B1E1;
        }
        .form-label {
            font-weight: bold;
            display: block;
            margin-bottom: 0.5rem;
        }
        .form-control {
            margin-bottom: 1.5rem;
        }
        .custom-btn-primary {
            background-color: #ffffff;
            border-color: #d6deff;
            color: #333;
            transition: background-color 0.3s, transform 0.3s;
            width: 70%;
            height: 3rem;
            display: inline-block;
            border: none;
        }
        .custom-btn-primary:hover {
            background-color: #606c9c;
            color: #fff;
            transform: translateY(-2px);
        }
        .custom-btn-primary:focus {
            box-shadow: none;
            background-color: #606c9c;
            color: #fff;
        }
        .custom-btn-primary:active {
            box-shadow: none;
            background-color: #2b324d;
            color: #fff;
            border: none;
        }
        .text-center {
            text-align: center;
        }
        `;
        document.head.appendChild(style);
    }
};

export default Login;
