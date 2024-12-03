const AddAd = {
    template: `
        <div>
            <h2>Add Ad</h2>
            <form @submit.prevent="addAd">
                <label for="content">Message:</label>        
                <textarea id="message" v-model="message" required></textarea><br><br> 

                <label for="content">Requirements:</label>        
                <textarea id="requirements" v-model="requirements" required></textarea><br><br>

                <label for="paymentAmount">Payment Amount:</label>        
                <input type="number" id="paymentAmount" v-model="payment_amount" required><br><br>

                <button type="submit">Add Ad</button> 
            </form>
        </div>
    `,

    data() {
        return {
            message: '',
            requirements: '',
            payment_amount: '',
        };
    },

    methods: {
        async addAd() {
            if (isNaN(this.payment_amount) || this.payment_amount < 0) {
                alert("Please enter a valid payment amount.");
                return;
            }

            try {
                const adsResource = await fetch(window.location.origin + "/api/ad-requests", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify({
                        campaign_id: this.$route.params.id,
                        message: this.message,
                        requirements: this.requirements,
                        payment_amount: this.payment_amount,
                    }),
                });

                if (!adsResource.ok) {
                    const errorText = await adsResource.text();
                    alert(`Error adding ad: ${errorText}`);
                    return;
                }

                const data = await adsResource.json();
                console.log("Ad added:", data);
                this.$router.push(`/sponsor/campaign/${this.$route.params.id}`);
            } 
            catch(error) {
                alert("Error adding ad: " + error.message);
                console.error("Error adding ad:", error);
            }
        },
    },
};

export default AddAd;
