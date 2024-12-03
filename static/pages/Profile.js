const Profile = {
    template: `
        <div class="profile-container">
            <h2>Welcome, {{ profile.email }}</h2>
            <h3>Your role: {{ role }}</h3>
            <div v-if="loading">Loading profile...</div>
            <div v-if="error">{{ error }}</div>
            <div v-if="profile" class="profile-details">
                <div v-if="!isEditing">
                    <div v-if="role === 'admin'">
                        <p><strong>Email:</strong> {{ profile.email }}</p>
                        <p><strong>Role:</strong> {{ profile.roles }}</p>
                    </div>
                    <div v-if="role === 'sponsor'">
                        <p><strong>Email:</strong> {{ profile.email }}</p>
                        <p><strong>Name:</strong> {{ profile.name }}</p>
                        <p><strong>Industry:</strong> {{ profile.industry }}</p>
                        <p><strong>Annual Revenue:</strong> {{ profile.annual_revenue }}</p>
                        <p><strong>Is your account active?:</strong> {{ profile.active }}</p>
                    </div>
                    <div v-if="role === 'influencer'">
                        <p><strong>Email:</strong> {{ profile.email }}</p>
                        <p><strong>Name:</strong> {{ profile.name }}</p>
                        <p><strong>Category:</strong> {{ profile.category }}</p>
                        <p><strong>Niche:</strong> {{ profile.niche }}</p>
                        <p><strong>Followers:</strong> {{ profile.followers }}</p>
                        <p><strong>Is your account active?:</strong> {{ profile.active }}</p>
                    </div>
                    <button class="btn btn-primary" @click="editProfile">Edit</button>
                </div>
                <div v-else>
                    <form @submit.prevent="updateProfile">
                        <div class="form-group mb-3">
                            <label for="email">Email:</label>
                            <input v-model="profile.email" type="email" class="form-control" required />
                        </div>
                        <div class="form-group mb-3">
                            <label for="password">Password:</label>
                            <input v-model="password" type="password" class="form-control" placeholder="Enter new password" />
                        </div>
                        <div v-if="role === 'sponsor'">
                            <div class="form-group mb-3">
                                <label for="name">Name:</label>
                                <input v-model="profile.name" type="text" class="form-control" required />
                            </div>
                            <div class="form-group mb-3">
                                <label for="industry">Industry:</label>
                                <input v-model="profile.industry" type="text" class="form-control" required />
                            </div>
                            <div class="form-group mb-3">
                                <label for="annual_revenue">Annual Revenue:</label>
                                <input v-model="profile.annual_revenue" type="number" class="form-control" required />
                            </div>
                        </div>
                        <div v-if="role === 'influencer'">
                            <div class="form-group mb-3">
                                <label for="name">Name:</label>
                                <input v-model="profile.name" type="text" class="form-control" required />
                            </div>
                            <div class="form-group mb-3">
                                <label for="category">Category:</label>
                                <input v-model="profile.category" type="text" class="form-control" required />
                            </div>
                            <div class="form-group mb-3">
                                <label for="niche">Niche:</label>
                                <input v-model="profile.niche" type="text" class="form-control" required />
                            </div>
                            <div class="form-group mb-3">
                                <label for="followers">Followers:</label>
                                <input v-model="profile.followers" type="number" class="form-control" required />
                            </div>
                        </div>
                        <button type="submit" class="btn btn-primary">Save</button>
                        <button type="button" class="btn btn-secondary" @click="cancelEdit">Cancel</button>
                    </form>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            email: localStorage.getItem("email"),
            role: localStorage.getItem("role"),
            id: localStorage.getItem("id"),
            profile: null,
            isEditing: false,
            loading: false,
            error: null,
            password: ""
        };
    },

    methods: {
        async fetchProfile() {
            this.loading = true;
            this.error = null;

            try {
                const response = await fetch(`${window.location.origin}/api/users/${this.id}`, {
                    headers: {
                        'Authentication-Token': localStorage.getItem("token"),
                    },
                });

                if (response.ok) {
                    this.profile = await response.json();
                    console.log(this.profile);
                } else {
                    this.error = 'Failed to load profile information.';
                }
            } catch (error) {
                console.error(error);
                this.error = 'An error occurred while fetching profile information.';
            } finally {
                this.loading = false;
            }
        },

        editProfile() {
            this.isEditing = true;
        },

        async updateProfile() {
            this.loading = true;
            this.error = null;

            const updatedProfile = { ...this.profile };

            if (this.password) {
                updatedProfile.password = this.password;
            }

            try {
                const response = await fetch(`${window.location.origin}/api/users/${this.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem("token"),
                    },
                    body: JSON.stringify(updatedProfile),
                });

                if (response.ok) {
                    const updatedData = await response.json();
                    this.profile = { ...updatedProfile, ...updatedData };  // Merge updated profile data
                    this.isEditing = false;
                } else {
                    this.error = 'Failed to update profile information.';
                }
            } catch (error) {
                console.error(error);
                this.error = 'An error occurred while updating profile information.';
            } finally {
                this.loading = false;
            }
        },

        cancelEdit() {
            this.isEditing = false;
            this.password = ""; // Clear the password field
            this.fetchProfile(); // Reset the profile data
        }
    },

    async mounted() {
        this.fetchProfile();

        const style = document.createElement('style');
        style.innerHTML = `
        .profile-container {
            max-width: 600px;
            margin: auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            background-color: #f9f9f9;
        }

        .profile-container h2 {
            font-size: 24px;
            margin-bottom: 10px;
        }

        .profile-container h3 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #555;
        }

        .profile-details p {
            font-size: 16px;
            margin: 5px 0;
        }

        .profile-details p strong {
            font-weight: bold;
        }

        .loading,
        .error {
            font-size: 18px;
            color: red;
            text-align: center;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .btn {
            margin-right: 10px;
        }
        `;
        document.head.appendChild(style);
    }
};

export default Profile;
