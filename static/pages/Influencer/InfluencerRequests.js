import Negotiation from "../../components/Negotiation.js";

const InfluencerRequests = {
    template: `
    <div>
        <table class="table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Campaign Name</th>
                    <th>Company Name</th>
                    <th>Industry</th>
                    <th>Annual Revenue</th>
                    <th>Created At</th>
                    <th>Action</th>
                    <th>Details</th>
                </tr>
            </thead>

            <tbody>
                <template v-for="(request, index) in sortedSponsorRequests" :key="request.id">
                    <!-- Main Row -->
                    <tr>
                        <td>{{ index + 1 }}</td>
                        <td>{{ request.campaign_name }}</td>
                        <td>{{ request.name }}</td>
                        <td>{{ request.industry }}</td>
                        <td>{{ request.annual_revenue }}</td>
                        <td>{{ formatDate(request.created_at) }}</td>
                        <td>
                            <button class="btn btn-success" @click="acceptRequest(request)">Accept</button>
                            <button class="btn btn-danger" @click="rejectRequest(request)">Reject</button>
                            <button class="btn btn-warning" @click="openNegotiation(request)">Negotiate</button>
                        </td>
                        <td>
                            <button class="btn btn-info" @click="toggleDetails(request)">Toggle Details</button>
                        </td>
                    </tr>

                    <!-- Details Row -->
                    <tr v-if="request.showDetails">
                        <td colspan="8">
                            <p><strong>Message:</strong> {{ request.message }}</p>
                            <p><strong>Requirements:</strong> {{ request.requirements }}</p>
                            <p><strong>Payment Amount:</strong> {{ request.payment_amount }}</p>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>

        <!-- Negotiation Modal -->
        <Negotiation
    v-if="showNegotiationBox"
    :ad-id="negotiationRequestData.ad_id"
    :influencer-id="negotiationRequestData.influencer_id"
    :id="negotiationRequestData.id"
    @close="closeNegotiation()"
    @confirmed="confirmedNegotiation()"
/>

        <!-- New Table for Influencer Request Status -->
        <h3>My Requests Status</h3>
        <table class="table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Campaign Name</th>
                    <th>Company Name</th>
                    <th>Industry</th>
                    <th>Annual Revenue</th>
                    <th>Created At</th>
                    <th>Status</th>
                    <th>Details</th>
                </tr>
            </thead>

            <tbody>
                <template v-for="(myRequest, index) in sortedMyRequests" :key="myRequest.id">
                    <!-- Main Row -->
                    <tr>
                        <td>{{ index + 1 }}</td>
                        <td>{{ myRequest.campaign_name }}</td>
                        <td>{{ myRequest.name }}</td>
                        <td>{{ myRequest.industry }}</td>
                        <td>{{ myRequest.annual_revenue }}</td>
                        <td>{{ formatDate(myRequest.created_at) }}</td>
                        <td>{{ formatStatus(myRequest.status) }}</td>
                        <td>
                            <button class="btn btn-info" @click="toggleDetails(myRequest)">Toggle Details</button>
                        </td>
                    </tr>
                    <!-- Details Row -->
                    <tr v-if="myRequest.showDetails">
                        <td colspan="8">
                            <p><strong>Message:</strong> {{ myRequest.message }}</p>
                            <p><strong>Requirements:</strong> {{ myRequest.requirements }}</p>
                            <p><strong>Payment Amount:</strong> {{ myRequest.payment_amount }}</p>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>

        <!-- New Table for Accepted Requests -->
<h3>Accepted Requests</h3>
<table class="table">
    <thead>
        <tr>
            <th>S.No.</th>
            <th>Campaign Name</th>
            <th>Company Name</th>
            <th>Industry</th>
            <th>Annual Revenue</th>
            <th>Created At</th>
            <th>Details</th>
        </tr>
    </thead>

    <tbody>
        <template v-for="(acceptedRequest, index) in sortedAcceptedRequests" :key="acceptedRequest.id">
            <!-- Main Row -->
            <tr>
                <td>{{ index + 1 }}</td>
                <td>{{ acceptedRequest.campaign_name }}</td>
                <td>{{ acceptedRequest.name }}</td>
                <td>{{ acceptedRequest.industry }}</td>
                <td>{{ acceptedRequest.annual_revenue }}</td>
                <td>{{ formatDate(acceptedRequest.created_at) }}</td>
                <td>
                    <button class="btn btn-info" @click="toggleDetails(acceptedRequest)">Toggle Details</button>
                </td>
            </tr>
            <!-- Details Row -->
            <tr v-if="acceptedRequest.showDetails">
                <td colspan="8">
                    <p><strong>Message:</strong> {{ acceptedRequest.message }}</p>
                    <p><strong>Requirements:</strong> {{ acceptedRequest.requirements }}</p>
                    <p><strong>Payment Amount:</strong> {{ acceptedRequest.payment_amount }}</p>
                </td>
            </tr>
        </template>
    </tbody>
</table>

    </div>
`,

    data() {
        return {
            sponsorRequests: [],
            myRequests: [],
            acceptedRequests: [],
            showNegotiationBox: false,
        };
    },

    components: {
    Negotiation,
},

computed: {
    sortedSponsorRequests() {
        return this.sponsorRequests.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    },

    sortedMyRequests() {
        return this.myRequests.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    },
    sortedAcceptedRequests() { 
        return this.acceptedRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); 
    },
},
    
    methods: {
    openNegotiation(request) {
        this.negotiationRequestData = {
            ad_id: request.ad_id,
            influencer_id: request.influencer_id,
            // currentAmount: request.payment_amount,
            id: request.id,
        };
        // console.log(request.ad_id);
        // console.log(request.influencer_id);
        // console.log(request.payment_amount);
        // console.log(request.id);
        console.log(this.negotiationRequestData);
        this.showNegotiationBox = true;
    },

    // Cancel Negotiation
    closeNegotiation() {
        this.showNegotiationBox = false;
        this.negotiationRequestData = null;
    },

    confirmedNegotiation() {
        const negotiatedRequest = this.sponsorRequests.find(
            (req) => req.id === this.negotiationRequestData.id
        );
    
        if (negotiatedRequest) {
            // Update the status and add to `myRequests`
            const updatedRequest = { ...negotiatedRequest, status: "Negotiation" };
            this.myRequests.push(updatedRequest);
        }

        this.sponsorRequests = this.sponsorRequests.filter(
            (req) => req.id !== this.negotiationRequestData.id
        );

        // this.myRequests = this.myRequests.filter(
        //     (req) => req.id !== this.negotiationRequestData.id
        // );

        // const request = this.sponsorRequests.find(
        //     req => req.id === this.negotiationRequestData.id
        // );
        // // if (request) {
        // this.myRequests.push({
        //     ...request,
        //     status: "Negotiation",
        // });
        // }

        this.showNegotiationBox = false;
        this.negotiationRequestData = null;
    },
    
        async acceptRequest(r) {
            try {
                const requestsResource = await fetch(`${window.location.origin}/api/requests/${r.id}`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('token'),
                    },
                    body: JSON.stringify({
                        id: r.id,
                        influencer_id: localStorage.getItem('id'),
                        ad_id: r.ad_id,
                        // created_at: r.created_at,
                        status: 'Accepted_I',
                    }),
                });

                if (!requestsResource.ok) {
                    const errorText = await requestsResource.text();
                    console.error(`Error updating status: ${errorText}`);
                    return;
                }

                this.sponsorRequests = this.sponsorRequests.filter((req) => req.id !== r.id);
            } 
            catch (error) {
                console.error(`Error updating request: ${error}`);
            }
        },

        async rejectRequest(r) {
            try {
                const requestsResource = await fetch(`${window.location.origin}/api/requests/${r.id}`, {
                    method: "PUT",
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('token'),
                    },
                    body: JSON.stringify({
                        id: r.id,
                        influencer_id: localStorage.getItem('id'),
                        ad_id: r.ad_id,
                        // created_at: r.created_at,
                        status: 'Rejected_I',
                    }),
                });

                if (!requestsResource.ok) {
                    const errorText = await requestsResource.text();
                    console.error(`Error updating status: ${errorText}`);
                    return;
                }

                this.sponsorRequests = this.sponsorRequests.filter((req) => req.id !== r.id);

            } 
            catch (error) {
                console.error(`Error updating request: ${error}`);
            }
        },
    
        toggleDetails(request) {
            this.$set(request, 'showDetails', !request.showDetails);
        },
    
        formatStatus(status) {
            if (status === 'Accepted_S') return 'Accepted';
            if (status === 'Rejected_S') return 'Rejected';
            if (status === 'Pending_S') return 'Pending';
            return status;
        },
    
        formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }
    },

    async mounted() {
        try {
            const influencerId = localStorage.getItem("id");
            const requestsResource = await fetch(`${window.location.origin}/api/requests-table/${influencerId}?user_type=influencer`, {
                headers: {
                    "Authentication-Token": localStorage.getItem("token"),
                },
            });
    
            if (requestsResource.ok) {
                const data = await requestsResource.json();
                console.log("Fetched data:", data);
    
                this.sponsorRequests = data.filter(request =>
                    request.status === "Pending_I" && request.influencer_id == influencerId
                );
    
                const now = new Date();
                const last24Hours = now.getTime() - (24 * 60 * 60 * 1000);
    
                this.myRequests = data.filter(request =>
                    ["Accepted_S", "Rejected_S", "Pending_S", "Negotiation"].includes(request.status) &&
                    request.influencer_id == influencerId &&
                    (request.status === "Pending_S" || new Date(request.created_at).getTime() > last24Hours)
                );
    
                this.acceptedRequests = data.filter(request =>
                    ["Accepted_I", "Accepted_S"].includes(request.status) && request.influencer_id == influencerId
                );
            } else {
                const errorText = await requestsResource.text();
                console.error("API Error:", errorText);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        }
    },
    
    

    // async mounted() {
    //     try {
    //         const influencerId = localStorage.getItem("id");
    
    //         const requestsResource = await fetch(window.location.origin + "/api/requests", {
    //             headers: {
    //                 "Authentication-Token": localStorage.getItem("token"),
    //             },
    //         });
    
    //         if (requestsResource.ok) {
    //             let data = await requestsResource.json();
    
    //             data = await Promise.all(data.map(async (request) => {
    //                 const adResource = await fetch(`${window.location.origin}/api/ad-requests/${request.ad_id}`, {
    //                     headers: {
    //                         "Authentication-Token": localStorage.getItem("token"),
    //                     },
    //                 });

    //                 if (adResource.ok) {
    //                     const adDetails = await adResource.json();
    //                     console.log(adDetails);
    
    //                     const campaignResource = await fetch(`${window.location.origin}/api/campaigns/${adDetails.campaign_id}`, {
    //                         headers: {
    //                             "Authentication-Token": localStorage.getItem("token"),
    //                         },
    //                     });
    
    //                     if (campaignResource.ok) {
    //                         const campaignDetails = await campaignResource.json();
    //                         request.campaignName = campaignDetails.name;
    //                         request.sponsor_id = campaignDetails.sponsor_id;
    //                         request.id = request.id;
    //                     }
    
    //                     request.message = adDetails.message;
    //                     request.requirements = adDetails.requirements;
    //                     request.payment_amount = adDetails.payment_amount;
    //                 }
    
    //                 const userResource = await fetch(`${window.location.origin}/api/users/${request.sponsor_id}`, {
    //                     headers: {
    //                         "Authentication-Token": localStorage.getItem("token"),
    //                     },
    //                 });
    
    //                 if (userResource.ok) {
    //                     const userDetails = await userResource.json();
    //                     request.company_name = userDetails.company_name;
    //                     request.industry = userDetails.industry;
    //                     request.budget = userDetails.budget;
    //                 }
    
    //                 this.$set(request, 'showDetails', false);
    //                 return request;
    //             }));
    
    //             this.sponsorRequests = data.filter(request =>
    //                 request.status === "Pending_I" && request.influencer_id == influencerId
    //             );
    
    //             const now = new Date();
    //             const last24Hours = now.getTime() - (24 * 60 * 60 * 1000);
    
    //             this.myRequests = data.filter(request =>
    //                 ["Accepted_S", "Rejected_S", "Pending_S", "Negotiation"].includes(request.status) &&
    //                 request.influencer_id == influencerId &&
    //                 (request.status === "Pending_S" || new Date(request.created_at).getTime() > last24Hours)
    //             );
    //         } 
    //         else {
    //             const errorText = await requestsResource.text();
    //             console.error("API Error:", errorText);
    //         }
    //     } 
    //     catch (error) {
    //         console.error("API Error:", error);
    //     }
    // },
};

export default InfluencerRequests;