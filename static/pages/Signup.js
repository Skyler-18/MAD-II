import router from "../utils/router.js";

const Signup = {
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div class="card shadow p-4">
        <h3 class="card-title text-center mb-4">Sign Up</h3>

        <div class="form-group mb-3">
          <input v-model="email" type="email" class="form-control" placeholder="Email" required/>
        </div>

        <div class="form-group mb-3">
          <input v-model="username" type="text" class="form-control" placeholder="Username" required/>
        </div>

        <div class="form-group mb-4">
          <input v-model="password" type="password" class="form-control" placeholder="Password" required/>
        </div>

        <div class="form-group mb-4">
          <select v-model="role" class="form-control">
            <option value="sponsor">Sponsor</option>
            <option value="influencer">Influencer</option>
          </select>
        </div>

        <button class="btn btn-primary w-100" @click="submitInfo">Submit</button>
      </div>
    </div>
  `,
  data() {
    return {
      email: "",
      username: "",
      password: "",
      role: "",
    };
  },
  methods: {
    async submitInfo() {
      const origin = window.location.origin;
      const url = `${origin}/signup`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: this.email,
          username: this.username,
          password: this.password,
          role: this.role,
        }),
        credentials: "same-origin",
      });

      if (res.ok) {
        const mssg = await res.json();
        console.log(mssg);
        // Handle successful sign up, e.g., redirect or store token
        router.push("/login");
      } else {
        const errorMssg = await res.json();
        console.error("SignUp Failed:", errorMssg);
        // Handle sign up error
      }
    },
  },
};

export default Signup;