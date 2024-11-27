const Negotiation = {
    template: `
    <div class="negotiation-modal">
    <h3>Negotiate Ad Request</h3>
    <input
        v-model="negotiatedAmount"
        type="number"
        placeholder="Enter new amount"
    />
    <button @click="confirmNegotiation(negotiatedAmount)">Confirm</button>
    <button @click="$emit('close')">Cancel</button>
</div>

    `,
    props: {
    id: {
        type: Number,
        required: true,
    },
    adId: {
        type: Number,
        required: true,
    },
    influencerId: {
        type: Number,
        required: true,
    },
},

methods: {
    async confirmNegotiation(newAmount) {
        let postData;
        if (!newAmount) {
            this.$emit('close');
            return;
        }
        else {
            postData = {
                ad_id: this.adId,
                influencer_id: this.influencerId, // Include influencer_id
                negotiated_amount: newAmount,
                status: "Negotiation",
            };
        }
        
        try {
            const response = await fetch(`${window.location.origin}/api/requests/${this.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token"),
                },
                body: JSON.stringify(postData),
            });

            console.log(postData);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Error during negotiation update:", errorText);
                return;
            }

            this.$emit("confirmed");
            alert("Negotiation request sent successfully");

        } catch (error) {
            console.error("Error during negotiation request:", error);
        }
    },
    },
};

export default Negotiation;
