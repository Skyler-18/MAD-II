const EditAd = {
    template: `
        <div>
            <h2>Add Ad</h2>
            <form @submit.prevent="saveChanges">
                <label for="content">Message:</label>        
                <textarea id="message" v-model="message" required></textarea><br><br> 

                <label for="content">Requirements:</label>        
                <textarea id="requirements" v-model="requirements" required></textarea><br><br>

                <label for="creatorId">Payment Amount:</label>        
                <input type="number" id="paymentAmount" v-model="payment_amount" required><br><br>

                <button type="submit">Update Ad</button> 
            </form>
        </div>
    `,

    data() {
        return {
            message: '',
            requirements: '',
            payment_amount: '',
            campaign_id: '',
        };
    },

    async created() {
        const res = await fetch(`${window.location.origin}/api/ad-requests/${this.$route.params.id}`, {
            headers: {
                "Authentication-Token": localStorage.getItem("token"),
            },
        });
        if (res.ok) {
            const data = await res.json();
            this.message = data.message;
            this.requirements = data.requirements;
            this.payment_amount = data.payment_amount;
            this.campaign_id = data.campaign_id;
        }
        else {
            console.error("API ERROR: ", await res.text());
        }
    },

    methods: {
        async saveChanges() {
            const backendUrl = `${window.location.origin}/api/ad-requests/${this.$route.params.id}`;

            const postData = {
                message: this.message,
                requirements: this.requirements,
                payment_amount: this.payment_amount,
                campaign_id: this.campaign_id,
            };
            try {
                const res = await fetch(backendUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify(postData),
                });
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await res.json();
                console.log("Ad Request Updated:", data);
                this.$router.push(`/campaign/${this.campaign_id}`);
            }
            catch(error) {
                console.error("Error editing ad:", error);
            }
        },
    },
};

export default EditAd;