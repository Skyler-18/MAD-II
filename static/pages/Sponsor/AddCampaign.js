const AddCampaign = {
    template: `<div>
    <h2>Add Campaign</h2>
    <form @submit.prevent="addCampaign">
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

        <button type="submit">Add Campaign</button>
    </form>
    </div>`,
    data() {
        return {
            name: "",
            description: "",
            start_date: "",
            end_date: "",
            budget: "",
            visibility: "",
            goals: "",
        };
    },
    methods: {
        async addCampaign() {
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
                const campaignsResource = await fetch(window.location.origin + "/api/campaigns", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
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

                if (!campaignsResource.ok) {
                    const errorText = await campaignsResource.text();
                    console.error(`Error adding campaign: ${errorText}`);
                }

                const data = await campaignsResource.json();
                console.log("Campaign added:", data);
                this.$router.push(`/sponsor/campaigns/${localStorage.getItem("id")}`);
            }
            catch(error) {
                console.error("Error adding campaign:", error);
            }
        },
    },
};

export default AddCampaign;
