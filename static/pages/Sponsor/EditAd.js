const EditAd = {
    template: `
        <div>
            <h2>Edit Ad</h2>
            <form @submit.prevent="saveChanges">
                <label for="content">Message:</label>        
                <textarea id="message" v-model="message" required></textarea><br><br> 

                <label for="content">Requirements:</label>        
                <textarea id="requirements" v-model="requirements" required></textarea><br><br>

                <label for="paymentAmount">Payment Amount:</label>        
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
        const adResource = await fetch(`${window.location.origin}/api/ad-requests/${this.$route.params.id}`, {
            headers: {
                "Authentication-Token": localStorage.getItem("token"),
            },
        });
        if (adResource.ok) {
            const adDetails = await adResource.json();
            this.message = adDetails.message;
            this.requirements = adDetails.requirements;
            this.payment_amount = adDetails.payment_amount;
            this.campaign_id = adDetails.campaign_id;
        } else {
            const errorText = await adResource.text();
            console.error("API ERROR: ", errorText);
        }
    },

    methods: {
        async saveChanges() {
            if (isNaN(this.payment_amount) || this.payment_amount < 0) {
                alert("Please enter a valid payment amount.");
                return;
            }

            try {
                const adResource = await fetch(`${window.location.origin}/api/ad-requests/${this.$route.params.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify({
                        message: this.message,
                        requirements: this.requirements,
                        payment_amount: this.payment_amount,
                        campaign_id: this.campaign_id,
                    }),
                });

                if (!adResource.ok) {
                    const errorText = await adResource.text();
                    alert(`Error editing ad: ${errorText}`);
                    return;
                }

                const data = await adResource.json();
                console.log("Ad Edited:", data);
                this.$router.push(`/sponsor/campaign/${this.campaign_id}`);
            } catch (error) {
                alert("Error editing ad: " + error.message);
                console.error("Error editing ad:", error);
            }
        },
    },
};

export default EditAd;
