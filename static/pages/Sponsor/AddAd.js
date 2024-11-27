const AddAd = {
    template: `
        <div>
            <h2>Add Ad</h2>
            <form @submit.prevent="addAd">
                <label for="content">Message:</label>        
                <textarea id="message" v-model="message" required></textarea><br><br> 

                <label for="content">Requirements:</label>        
                <textarea id="requirements" v-model="requirements" required></textarea><br><br>

                <label for="creatorId">Payment Amount:</label>        
                <input type="integer" id="paymentAmount" v-model="payment_amount" required><br><br>

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
                    // if (adsResource.status === 401) {
                    //     // throw new Error("Unauthorized: Invalid authentication token");
                    //     console.error()
                    // }
                    // throw new Error("Network response was not ok");
                    const errorText = await adsResource.text();
                    console.error(`Error adding ad: ${errorText}`);
                }

                const data = await adsResource.json();
                console.log("Ad added:", data);
                this.$router.push(`/sponsor/campaign/${this.$route.params.id}`);
            } 
            catch(error) {
                console.error("Error adding ad:", error);
            }
        },
    },
};

export default AddAd;