import Negotiation from "../../components/Negotiation.js";

const InfluencerCampaignDetails = {
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
            
            <button  
                v-if="!isCampaignExpired"
                :disabled="requestButtonDisabled(ad.id)"
                class="btn btn-primary" 
                @click.stop="confirmRequest(ad)">
                {{ buttonText(ad.id) }}
            </button>
        </div>
    </div>
    <div v-else>
        <p>No ad requests created for this campaign yet.</p>
    </div>

    <!-- Negotiation Component -->
    <Negotiation
        v-if="showNegotiationWindow"
        :adId="negotiationRequestData.ad_id"
        :id="negotiationRequestData.id"
        :influencerId="negotiationRequestData.influencer_id"
        @close="cancelNegotiation"
        @confirmed="confirmedNegotiation"
    />

    <!-- Confirmation Popup -->
    <div v-if="showConfirmationPopup" class="popup">
        <p>Do you want to negotiate?</p>
        <button class="btn btn-yes" @click="proceedWithNegotiation">Yes</button>
        <button class="btn btn-no" @click="proceedWithoutNegotiation">No</button>
    </div>
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
            isCampaignExpired: false,
            requestStatuses: {},
            showNegotiationWindow: false,
            negotiationRequestData: {},
            showConfirmationPopup: false,
            selectedRequest: null,
        };
    },

    components: {
        Negotiation,
    },

    methods: {
        confirmRequest(ad) {
            this.selectedRequest = ad;
            this.showConfirmationPopup = true;
        },
    
        async proceedWithNegotiation() {
            const ad = this.selectedRequest;
            const influencer_id = localStorage.getItem("id");
        
            try {
                const requestsResource = await fetch(`${window.location.origin}/api/requests`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify({
                        ad_id: ad.id,
                        influencer_id: influencer_id,
                        status: "Pending_S",
                    }),
                });
                // console.log(new Date().toISOString());
        
                if (requestsResource.ok) {
                    const requestsData = await requestsResource.json();
                    console.log(requestsData);

                    const requestResource = await fetch(`${window.location.origin}/api/requests/${ad.id}`, {
                        headers: {
                            "Content-Type": "application/json",
                            "Authentication-Token": localStorage.getItem("token"),
                        },
                    });
        
                    if (requestResource.ok) {
                        const requestData = await requestResource.json();
                        this.negotiationRequestData = {
                            id: requestData[requestData.length - 1].id, // ID from the most recent request
                            ad_id: ad.id,
                            influencer_id: influencer_id,
                            // currentAmount: ad.payment_amount,
                        };

                        console.log(this.negotiationRequestData);

                        // this.requestStatuses[ad.id] = "Negotiation";
                        this.$set(this.requestStatuses, ad.id, "Negotiation");
        
                        // this.$set(this.requestStatuses, ad.id, {
                        //     // isPending: true,
                        //     status: "Negotiation",
                            // statusText: "Negotiation in Progress",
                        // });
        
                        this.showNegotiationWindow = true;
                    }
                } 
                else {
                    const errorText = await requestsResource.text();
                    console.error("Error creating ad request:", errorText);
                }
            } 
            catch (error) {
                console.error("Fetch error while creating request:", error);
            }
        
            this.showConfirmationPopup = false;
        },               
    
        async proceedWithoutNegotiation() {
            const ad = this.selectedRequest;
            this.sendRequest(ad);
    
            this.showConfirmationPopup = false;
        },

        confirmedNegotiation() {
            const ad = this.selectedRequest;

            // this.$set(this.requestStatuses, ad.id, {
            //     // isPending: true,
            //     status: "Negotiation",
            //     // statusText: "Negotiation in Progress",
            // });

            // this.requestStatuses[ad.id] = "Negotiation";
            this.$set(this.requestStatuses, ad.id, "Negotiation");


            this.showNegotiationWindow = false;
            this.negotiationRequestData = {};
        },
    
        cancelNegotiation() {
            const ad = this.selectedRequest;

            // this.$set(this.requestStatuses, ad.id, {
            //     // isPending: true,
            //     status: "Pending_S",
            //     // statusText: "Request Pending",
            // });
            // this.requestStatuses[ad.id] = "Pending_S";
            this.$set(this.requestStatuses, ad.id, "Pending_S");
            // console.log(ad);
            // console.log(ad.id);
            this.showNegotiationWindow = false;
            this.negotiationRequestData = {};
        },

        async checkRequestStatus(ad_ids, influencer_id) {
            try {
                const url = new URL(`${window.location.origin}/api/requests`);
                ad_ids.forEach(ad_id => url.searchParams.append('ad_ids', ad_id));
                url.searchParams.append('influencer_id', influencer_id);

                const checkRequestResource = await fetch(url, {
                    headers: {
                        // "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                });
    
                if (checkRequestResource.ok) {
                    const data = await checkRequestResource.json();
                    console.log(data);
                    // return data.exists ? data.status : null;
                    return data;
                } 
                else {
                    const errorText = await checkRequestResource.text();
                    console.error("API Error:", errorText);
                    return null;
                }
            }
            catch(error) {
                console.error("Error checking request status", error);
            }
        },

        requestButtonDisabled(ad_id) {
            const status = this.requestStatuses[ad_id];
            return (
                status === 'Pending_I' ||
                status === 'Pending_S' ||
                status === 'Accepted_I' ||
                status === 'Accepted_S' ||
                status === 'Negotiation' ||
                status === 'Already Accepted' // Ensure this condition disables the button
            );
        },              

        buttonText(ad_id) {
            const status = this.requestStatuses[ad_id];
            if (status === 'Pending_I' || status === 'Pending_S') {
                return 'Request Pending';
            } else if (status === 'Accepted_I' || status === 'Accepted_S') {
                return 'Request Accepted';
            } else if (status === 'Negotiation') {
                return 'Negotiation In Progress';
            } else if (status === 'Already Accepted') {
                return 'Already Accepted';
            } else {
                return 'Send Request';
            }
        },

        async sendRequest(ad) {
            // const ad_id = ad.id;
            const userId = localStorage.getItem("id");
            // const existingStatus = await this.checkRequestStatus(ad_id, userId);

            // if (existingStatus) {
            //     alert('Request already pending or accepted.');
            //     return;
            // }

            try {
                const requestsResource = await fetch(`${window.location.origin}/api/requests`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify({
                        ad_id: ad.id,
                        influencer_id: userId,
                        status: "Pending_S",
                    }),
                });

                if (requestsResource.ok) {
                    console.log(this.requestStatuses);
                    // requestsData = await requestsResource.json();
                    // console.log("Ad Request Sent:", requestsData);

                    // this.$set(this.requestStatuses, ad.id, {
                    //     // isPending: true,
                    //     status: "Pending_S",
                    //     // statusText: "Request Pending",
                    // });
                    this.requestStatuses[ad.id] = "Pending_S";

                    console.log(this.requestStatuses);
                } 
                else {
                    const errorText = await requestsResource.text();
                    console.error("Error sending ad request:", errorText);
                }
            } 
            catch (error) {
                console.error("Fetch error:", error);
            }
        },    
        
        async checkAdStatus(ad_id) {
            try {
                const response = await fetch(`${window.location.origin}/api/check-request?ad_id=${ad_id}`, {
                    headers: {
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                });
        
                if (response.ok) {
                    const data = await response.json();
                    // console.log(data);
                    return data.exists; // Assume the API returns an `isAccepted` boolean
                } else {
                    const errorText = await response.text();
                    console.error("Error fetching ad status:", errorText);
                    return false; // Default to not accepted
                }
            } catch (error) {
                console.error("Error checking ad status:", error);
                return false; // Default to not accepted
            }
        }, 
    },      

        async mounted() {
            try {
                const campaignsResource = await fetch(`${window.location.origin}/api/campaigns/${this.$route.params.id}?include_details=false`, {
                    headers: {
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                });
        
                if (campaignsResource.ok) {
                    const data = await campaignsResource.json();
                    this.name = data.name;
                    this.description = data.description;
                    this.start_date = data.start_date;
                    this.end_date = data.end_date;
                    this.budget = data.budget;
                    this.visibility = data.visibility;
                    this.goals = data.goals;
                    this.ad_requests = data.ad_requests || [];
        
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    this.isCampaignActive = new Date(this.end_date) >= today;
        
                    const userId = localStorage.getItem("id");
        
                    for (const ad of this.ad_requests) {
                        // Fetch the existing status for the influencer
                        const statusData = await this.checkRequestStatus([ad.id], userId);
                        const influencerStatus = statusData[ad.id] || 'No Request';
        
                        // Fetch the ad's general acceptance status
                        const isAccepted = await this.checkAdStatus(ad.id);
        
                        // Update the button's state in requestStatuses
                        const finalStatus = isAccepted ? 'Already Accepted' : influencerStatus;
                        this.$set(this.requestStatuses, ad.id, finalStatus);
                    }
                } else {
                    const errorText = await campaignsResource.text();
                    console.error("API Error:", errorText);
                }
            } catch (error) {
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


export default InfluencerCampaignDetails;