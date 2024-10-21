import DeleteConfirmation from "../components/DeleteConfirmation.js";

const CampaignDetails = {
    template: `
    <div class="campaign-details">
    <h1>{{ name }}</h1>
    <p><strong>Description:</strong> {{ description }}</p>
    <p><strong>Start Date:</strong> {{ start_date }}</p>
    <p><strong>End Date:</strong> {{ end_date }}</p>
    <p><strong>Budget:</strong> {{ budget }}</p>
    <p><strong>Visibility:</strong> {{ visibility }}</p>
    <p><strong>Goals:</strong> {{ goals }}</p>

    <h2>Ad Requests</h2>
    <div v-if="ad_requests && ad_requests.length > 0">
        <div v-for="(ad, index) in ad_requests" :key="ad.id" class="ad-request">
            <p><strong>Message:</strong> {{ ad.message }}</p>
            <p><strong>Requirements:</strong> {{ ad.requirements }}</p>
            <p><strong>Payment Amount:</strong> {{ ad.payment_amount }}</p>
            <p><strong>Status:</strong> {{ ad.status }}</p>
            <div class="icons">
                <i class="fas fa-edit" @click.stop="editAd(ad.id)"></i>
                <i class="fas fa-trash" @click.stop="showConfirmation(ad.id)"></i>
            </div>
        </div>
    </div>
    <div v-else>
        <p>No ad requests created for this campaign yet.</p>
    </div>

    <DeleteConfirmation
            :show="showConfirmationComponent"
            message="Are you sure you want to delete this ad?"
            @confirm="deleteAd"
            @cancel="hideConfirmation"
        />
</div>

    `,

    data() {
        return {
            name: '',
            description: '',
            start_date: '',
            end_date: '',
            budget: '',
            visibility: '',
            goals: '',
            ad_requests: [],
            showConfirmationComponent: false,
            adToDelete: null,
        };
    },

    components: {
        DeleteConfirmation,
    },

    async mounted() {
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
            this.goals = data.goals;
            this.ad_requests = data.ad_requests;
        }
        else {
            console.error("API Error:",await res.text());
        }
    },

    methods: {
        editAd(id) {
            // console.log(`Edit ad request with ID ${id}`);
            this.$router.push(`/ad-request/edit/${id}`);
        },

        showConfirmation(id) {
            this.adToDelete = id;
            this.showConfirmationComponent = true;
        },

        hideConfirmation() {
            this.showConfirmationComponent = false;
        },

        deleteAd() {
            // console.log(`Delete ad request with ID ${id}`);
            const id = this.adToDelete;
            const backendUrl = `${window.location.origin}/api/ad-requests/${id}`;
            fetch(backendUrl, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token"),
                },
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                if (this.ad_requests) {
                    this.ad_requests = data.ad_requests;
                }
            }).catch(error => {
                console.error("Error deleting Ad:", error);
            });
            this.hideConfirmation();
        },
    }
};

export default CampaignDetails;