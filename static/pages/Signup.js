import router from "../utils/router.js";

const Signup = {
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div class="card shadow p-4">
        <h3 class="card-title text-center mb-4">Sign Up</h3>

        <!-- Step 1: Basic Info -->
        <form v-if="step === 1" @submit.prevent="nextStep">
          <div class="form-group mb-3">
            <input v-model="email" type="email" class="form-control" placeholder="Email" required />
          </div>

          <div class="form-group mb-4">
            <input v-model="password" type="password" class="form-control" placeholder="Password" required />
          </div>

          <div class="form-group mb-4">
            <select v-model="role" class="form-control" required>
              <option value="" disabled>Select Role</option>
              <option value="sponsor">Sponsor</option>
              <option value="influencer">Influencer</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary w-100">Next</button>
        </form>

        <!-- Step 2: Role-Specific Info -->
        <form v-else-if="step === 2" @submit.prevent="submitInfo">
          <div v-if="role === 'sponsor'">
            <div class="form-group mb-3">
              <input v-model="name" type="text" class="form-control" placeholder="Company Name" required />
            </div>
            <div class="form-group mb-3">
              <input v-model="industry" type="text" class="form-control" placeholder="Industry" required />
            </div>
            <div class="form-group mb-3">
              <input v-model="annual_revenue" type="number" class="form-control" placeholder="Annual Revenue" required />
            </div>
          </div>

          <div v-else-if="role === 'influencer'">
            <div class="form-group mb-3">
              <input v-model="name" type="text" class="form-control" placeholder="Name" required />
            </div>
            <div class="form-group mb-3">
              <input v-model="category" type="text" class="form-control" placeholder="Category" required />
            </div>
            <div class="form-group mb-3">
              <input v-model="niche" type="text" class="form-control" placeholder="Niche" required />
            </div>
            <div class="form-group mb-3">
              <input v-model="followers" type="number" class="form-control" placeholder="Followers" required />
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100">Submit</button>
        </form>
      </div>
    </div>
  `,

  data() {
    return {
      email: "",
      password: "",
      role: "",
      step: 1,
      // Sponsor fields
      name: "",
      industry: "",
      annual_revenue: null,
      // Influencer fields
      category: "",
      niche: "",
      followers: null,
    };
  },

  methods: {
    nextStep() {
      if (this.role) {
        this.step = 2;
      } else {
        alert("Please select a role to continue.");
      }
    },

    async submitInfo() {
      const user = {
        email: this.email,
        password: this.password,
        role: this.role,
      };

      // Data based on role
      if (this.role === "sponsor") {
        user.name = this.name;
        user.industry = this.industry;
        user.annual_revenue = this.annual_revenue;
      } else if (this.role === "influencer") {
        user.name = this.name;
        user.category = this.category;
        user.niche = this.niche;
        user.followers = this.followers;
      }

      const signup = await fetch(`${window.location.origin}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (signup.ok) {
        const data = await signup.json();
        console.log(data);
        router.push("/login");
      } else {
        const errorText = await signup.json();
        if (errorText.message && errorText.message.includes("Email already registered")) {
          alert("This email already exists.");
        } else {
          console.error("SignUp Failed:", errorText);
        }
      }
    },
  },
};

export default Signup;
