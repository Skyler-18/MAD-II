import DeleteConfirmation from "../../components/DeleteConfirmation.js";

const SponsorCampaignDetails = {
    template: `
    <div class="campaign-details">
    <!-- Existing Campaign Details Section -->
    <h1>{{ name }}</h1>
    <p><strong>Description:</strong> {{ description }}</p>
    <p><strong>Start Date:</strong> {{ start_date }}</p>
    <p><strong>End Date:</strong> {{ end_date }}</p>
    <p><strong>Budget:</strong> {{ budget }}</p>
    <p><strong>Visibility:</strong> {{ visibility }}</p>
    <p><strong>Goals:</strong> {{ goals }}</p>

    <!-- Conditionally Render Add Ads Button -->
    <button 
        class="btn-add-ads" 
        v-if="isCampaignActive" 
        @click.stop="addAds(campaignID)"
    >
        Add Ads
    </button>

    <h2>Ad Requests</h2>
    <div v-if="ad_requests && ad_requests.length > 0">
        <div v-for="(ad, index) in ad_requests" :key="ad.id" class="ad-request">
            <p><strong>Message:</strong> {{ ad.message }}</p>
            <p><strong>Requirements:</strong> {{ ad.requirements }}</p>
            <p><strong>Payment Amount:</strong> {{ ad.payment_amount }}</p>

            <!-- Conditionally Render Edit and Delete Icons -->
            <div class="icons" v-if="isCampaignActive">
                <i class="fas fa-edit" @click.stop="editAd(ad.id)"></i>
                <i class="fas fa-trash" @click.stop="showConfirmation(ad.id)"></i>
            </div>

            <!-- Conditionally Render Send Request Button -->
            <button 
                class="btn btn-primary" 
                v-if="isCampaignActive"
                :disabled="requestButtonDisabled(ad.id)"
                @click.stop="sendRequest(ad.id)"
            >
                {{ buttonText(ad.id) }}
            </button>
        </div>
    </div>
    <div v-else>
        <p>No ad requests created for this campaign yet.</p>
    </div>

    <!-- Delete Confirmation Popup -->
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
            campaignID: this.$route.params.id,
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
            requestStatuses: {},
            isCampaignActive: true,
        };
    },

    components: {
        DeleteConfirmation,
    },

    methods: {
        showConfirmation(id) {
            this.adToDelete = id;
            this.showConfirmationComponent = true;
        },

        hideConfirmation() {
            this.showConfirmationComponent = false;
        },

        editAd(id) {
            this.$router.push(`/ad-request/edit/${id}`);
        },

        addAds(id) {
            this.$router.push(`/${id}/ads/add`);
        },

        async sendRequest(id) {
            this.$router.push(`/${id}/search/influencers`);
        },

        requestButtonDisabled(ad_id) {
            const status = this.requestStatuses[ad_id]?.isAccepted;
            if (status) {
                return true;
            }
            return false;
        },

        async checkRequestStatus(ad_id) {
            try {
                const checkRequestResource = await fetch(`${window.location.origin}/api/check-request?ad_id=${ad_id}`, {
                    headers: {
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                });
                // console.log(ad_id);
    
                if (checkRequestResource.ok) {
                    const data = await checkRequestResource.json();
                    console.log(data);
                    return data.exists;
                } 
                else {
                    const errorText = await checkRequestResource.text();
                    console.error("API Error:", errorText);
                    return null;
                }
            }
            catch(error) {
                console.error("Error checking status", error);
            }
        },

        buttonText(ad_id) {
            const status = this.requestStatuses[ad_id]?.isAccepted; 
            if (status) {
                return 'Request Accepted';
            } 
            else {
                return 'Send Request';
            }
        },

        async deleteAd() {
            try{
                const id = this.adToDelete;
                const adRequestResource = await fetch(`${window.location.origin}/api/ad-requests/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                });

                if (!adRequestResource.ok) {
                    const errorText = await adRequestResource.text();
                    console.error(`Error deleting ad: ${errorText}`);
                }

                const data = await adRequestResource.json();
                console.log(data);

                this.ad_requests = this.ad_requests.filter(ad => ad.id !== id);
                this.hideConfirmation();
            }
            catch(error) {
                console.error("Error deleting ad", error);
            }
        },             
    },

    async mounted() {
        try {
            const res = await fetch(`${window.location.origin}/api/campaigns/${this.$route.params.id}?include_details=false`, {
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
                this.ad_requests = data.ad_requests || [];

                const today = new Date();
                today.setHours(0,0,0,0);
                this.isCampaignActive = new Date(this.end_date) >= today;
                // console.log(this.isCampaignActive);
                // console.log(this.end_date);
                // console.log(today);

                for (const ad of this.ad_requests) {
                    const status = await this.checkRequestStatus(ad.id);
                    this.$set(this.requestStatuses, ad.id, {
                        isAccepted: status,
                        statusText: this.buttonText(ad.id) 
                    });

                }
            } 
            else {
                console.error("API Error:", await res.text());
            }
        } 
        catch (error) {
            console.error("Fetch error:", error);
        }

        const style = document.createElement('style');
        style.innerHTML = `
            .popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    z-index: 1000;
}

.popup p {
    margin-bottom: 10px;
}

.popup .btn {
    margin: 5px;
}
        `;
        document.head.appendChild(style);
    },
};

export default SponsorCampaignDetails;
