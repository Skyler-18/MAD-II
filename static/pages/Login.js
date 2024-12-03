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
          <button class="custom-btn-primary" @click="userLogin">Login</button>
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
        async userLogin() {
            const login = await fetch(`${window.location.origin}/user-login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    email: this.email, 
                    password: this.password 
                }),
            });
            if (login.ok) {
                const user = await login.json();
                console.log("Login Success: ", user);

                localStorage.setItem("token", user.token);

                const userRes = await fetch(`${window.location.origin}/api/users/${user.id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                });

                // if (userRes.ok) {
                    const userDetails = await userRes.json();

                if (!userDetails.active) {
                    alert("Your account is currently inactive. Contact admin for more details.");
                    return;
                }
                // }

                localStorage.setItem("id", user.id);
                localStorage.setItem("email", user.email);
                localStorage.setItem("role", user.role);

                this.$store.commit("setRole", user.role);
                this.$store.commit("setLogin", true);
                // this.$store.commit("setUserId", user.id);

                switch(user.role) {
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
            } else {
                const errorText = await login.json();
                alert("Incorrect email or password. Please try again.");
                console.error("Login Failed: ", errorText);
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
