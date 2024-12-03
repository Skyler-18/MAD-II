const Users = {
    template: `
    <div>
        <h2>Sponsors</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Email</th>
                    <th>Company Name</th>
                    <th>Industry</th>
                    <th>Annual Revenue</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(sponsor, index) in activeSponsors" :key="sponsor.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ sponsor.email }}</td>
                    <td>{{ sponsor.name }}</td>
                    <td>{{ sponsor.industry }}</td>
                    <td>Rs. {{ sponsor.annual_revenue }}</td>
                    <td>
                        <button class="btn btn-warning" @click="flagUser(sponsor.id)">Flag</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <h2>Influencers</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Niche</th>
                    <th>Followers</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(influencer, index) in activeInfluencers" :key="influencer.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ influencer.email }}</td>
                    <td>{{ influencer.name }}</td>
                    <td>{{ influencer.category }}</td>
                    <td>{{ influencer.niche }}</td>
                    <td>{{ influencer.followers }}</td>
                    <td>
                        <button class="btn btn-warning" @click="flagUser(influencer.id)">Flag</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <h2>Inactive Users</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(user, index) in inactiveUsers" :key="user.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.roles }}</td>
                    <td>
                        <button class="btn btn-success" @click="unflagUser(user.id)">Unflag</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `,
    data() {
        return {
            activeSponsors: [],
            activeInfluencers: [],
            inactiveUsers: [],
        };
    },
    methods: {
        async flagUser(id) {
            const res = await fetch(window.location.origin + "/flag-user/" + id, {
                // method: 'POST',
                headers: {
                    'Authentication-Token': localStorage.getItem("token"),
                },
            });

            if (res.ok) {
                alert("User flagged successfully");
                this.fetchUsers();
            }
        },
        async unflagUser(id) {
            const res = await fetch(window.location.origin + "/unflag-user/" + id, {
                // method: 'POST',
                headers: {
                    'Authentication-Token': localStorage.getItem("token"),
                },
            });

            if (res.ok) {
                alert("User unflagged successfully");
                this.fetchUsers();
            }
        },

        async fetchUsers() {
            try {
                const res = await fetch(window.location.origin + "/api/users", {
                    headers: {
                        'Authentication-Token': localStorage.getItem("token"),
                    },
                });
    
                if (res.ok) {
                    const users = await res.json();
                    this.activeSponsors = users.filter(user => user.active && user.roles.includes('sponsor'));
                    this.activeInfluencers = users.filter(user => user.active && user.roles.includes('influencer'));
                    this.inactiveUsers = users.filter(user => !user.active);
                }
            } 
            catch (error) {
                console.error(error);
            }
        },
    },
    async mounted() {
        this.fetchUsers();
    },
};

export default Users;