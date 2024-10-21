const AddAd = {
    template: `
        <div>
            <h2>Add Ad</h2>
            <form @submit.prevent="submitForm">
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
            campaign_id: '',
            message: '',
            requirements: '',
            payment_amount: '',
        };
    },

    methods: {
        submitForm() {
            const backendUrl = window.location.origin + "/api/ad-requests";
            const postData = {
                campaign_id: this.$route.params.id,
                message: this.message,
                requirements: this.requirements,
                payment_amount: this.payment_amount,
            };

            fetch(backendUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token"),
                },
                body: JSON.stringify(postData),
            })
            .then((response) => {
                if (!response.ok) {
                    if (response.status === 401) {
                        throw new Error("Unauthorized: Invalid authentication token");
                    }
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                console.log("Resourced added:", data);
                this.$router.push('/sponsor/campaigns');
            })
            .catch((error) => {
                console.error("Error adding resource:", error);
            });
        },
    },
};

export default AddAd;