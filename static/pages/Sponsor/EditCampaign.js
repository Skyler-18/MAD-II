const EditCampaign = {
    template: `
    <div>
        <div>
            <form @submit.prevent="editCampaign">
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
        const campaignResource = await fetch(`${window.location.origin}/api/campaigns/${this.$route.params.id}?include_details=false`, {
            headers: {
                "Authentication-Token": localStorage.getItem("token"),
            },
        });
        if (campaignResource.ok) {
            const campaignDetails = await campaignResource.json();
            this.name = campaignDetails.name;
            this.description = campaignDetails.description;
            this.start_date = campaignDetails.start_date;
            this.end_date = campaignDetails.end_date;
            this.budget = campaignDetails.budget;
            this.visibility = campaignDetails.visibility;
            this.sponsor_id = campaignDetails.sponsor_id;
            this.goals = campaignDetails.goals;
        }
        else {
            console.error("API Error: ", await campaignResource.text());
        }
    },
    methods: {
        async editCampaign() {
            const startDate = new Date(this.start_date);
            const endDate = new Date(this.end_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (endDate <= startDate) {
                alert("End date must be after the start date.");
                return;
            }

            if (endDate <= today) {
                alert("End date must be after today.");
                return;
            }
            try {
                const campaignResource = await fetch(`${window.location.origin}/api/campaigns/${this.$route.params.id}`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': "application/json",
                        'Authentication-Token': localStorage.getItem("token"),
                    },
                    body: JSON.stringify({
                        name: this.name,
                        description: this.description,
                        start_date: this.start_date,
                        end_date: this.end_date,
                        budget: this.budget,
                        visibility: this.visibility,
                        sponsor_id: localStorage.getItem("id"),
                        goals: this.goals,
                    }),
                });

                if (!campaignResource.ok) {
                    const errorText = await campaignResource.text();
                    console.error(`Error editing campaign:`, errorText);
                }

                const data = await campaignResource.json();
                console.log("Campaign updated:", data);
                this.$router.push(`/sponsor/campaigns/${localStorage.getItem("id")}`);
            } 
            catch (error) {
                console.error("Error saving campaign:", error);
            }
        }
    },
};

export default EditCampaign;
