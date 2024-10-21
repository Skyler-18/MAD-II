const EditCampaign = {
    template: `
    <div>
        <div>
            <form @submit.prevent="saveChanges">
                <label for="topic">Name:</label>
                <input type="text" id="name" v-model="name" required><br><br>
                <label for="content">Description:</label>
                <textarea id="description" v-model="description" required></textarea><br><br>
                <label for="content">Start Date:</label>
                <input type="date" id="startDate" v-model="start_date" required><br><br>
                <label for="content">End Date:</label>
                <input type="date" id="endDate" v-model="end_date" required><br><br>
                <label for="content">Budget:</label>
                <textarea id="budget" v-model="budget" required></textarea><br><br>
                <label for="content">Visibility:</label>       
        <select id="visibility" v-model="visibility" required>
            <option value='public'>Public</option>
            <option value='private'>Private</option>
        </select><br><br> 
                <label for="creatorId">Sponsor ID:</label>
                <input type="integer" id="sponsorID" v-model="sponsor_id" required><br><br>
                <label for="content">Goals:</label>
                <textarea id="goals" v-model="goals" required></textarea><br><br>
                <button type="submit">Save Changes</button>
            </form>
        </div>
    </div>
    `,
    data() {
        return {
            name: "",
            description: "",
            start_date: "",
            end_date: "",
            budget: "",
            visibility: "",
            sponsor_id: "",
            goals: "",
        };
    },
    async created() {
        // const id = this.$route.params.id;
        const res = await fetch(`${window.location.origin}/api/campaigns/${this.$route.params.id}`, {
            headers: {
                "Authentication-Token": localStorage.getItem("token"),
            },
        });
        if (res.ok) {
            const data = await res.json();
            this.name = data.name;
            this.description = data.description;
            this.start_date = data.start_date;
            this.end_date = data.end_date;
            this.budget = data.budget;
            this.visibility = data.visibility;
            this.sponsor_id = data.sponsor_id;
            this.goals = data.goals;
        } else {
            console.error("API Error: ", await res.text());
        }
    },
    methods: {
        async saveChanges() {
            // const id = this.$route.params.id;
            const backendUrl = `${window.location.origin}/api/campaigns/${this.$route.params.id}`;

            const postData = {
                name: this.name,
                description: this.description,
                start_date: this.start_date,
                end_date: this.end_date,
                budget: this.budget,
                visibility: this.visibility,
                sponsor_id: this.sponsor_id,
                goals: this.goals,
            };
            try {
                const res = await fetch(backendUrl, {
                    method: "PUT",
                    headers: {
                        'Content-Type': "application/json",
                        'Authentication-Token': localStorage.getItem("token"),
                    },
                    body: JSON.stringify(postData),
                });
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await res.json();
                console.log("Campaign updated:", data);
                this.$router.push('/sponsor/campaigns');
            } catch (error) {
                console.error("Error saving campaign:", error);
            }
        }
    },
};

export default EditCampaign;
