const SponsorRequests = {
    template: `
        <div>
            <table class="table">
                <thead>
                    <tr>
                        <th>S.No.</th>
                        <th>Campaign Name</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Niche</th>
                        <th>Created At</th>
                        <th>Action</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(request, index) in sortedInfluencerRequests" :key="request.id">
                        <!-- Main Row -->
                        <tr>
                            <td>{{ index + 1 }}</td>
                            <td>{{ request.campaign_name }}</td>
                            <td>{{ request.name }}</td>
                            <td>{{ request.category }}</td>
                            <td>{{ request.niche }}</td>
                            <td>{{ formatDate(request.created_at) }}</td>
                            <td>
                                <button class="btn btn-success" @click="acceptRequest(request)">Accept</button>
                                <button class="btn btn-danger" @click="rejectRequest(request)">Reject</button>
                            </td>
                            <td>
                                <button class="btn btn-info" @click="toggleDetails(request)">Toggle Details</button>
                            </td>
                        </tr>
                        <!-- Details Row -->
                        <tr v-if="request.showDetails">
                            <td colspan="9">
                                <p><strong>Message:</strong> {{ request.message }}</p>
                                <p><strong>Requirements:</strong> {{ request.requirements }}</p>
                                <p><strong>Payment Amount:</strong> {{ request.payment_amount }}</p>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>

            <table class="table">
                <thead>
                    <tr>
                        <th>S.No.</th>
                        <th>Campaign Name</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Niche</th>
                        <th>Created At</th>
                        <th>Negotiated Amount</th>
                        <th>Action</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="(request, index) in sortedNegotiationRequests" :key="request.id">
                        <!-- Main Row -->
                        <tr>
                            <td>{{ index + 1 }}</td>
                            <td>{{ request.campaign_name }}</td>
                            <td>{{ request.name }}</td>
                            <td>{{ request.category }}</td>
                            <td>{{ request.niche }}</td>
                            <td>{{ formatDate(request.created_at) }}</td>
                            <td>{{ request.negotiated_amount }}</td>
                            <td>
                                <button class="btn btn-success" @click="acceptNegotiation(request)">Accept</button>
                                <button class="btn btn-danger" @click="rejectRequest(request)">Reject</button>
                            </td>
                            <td>
                                <button class="btn btn-info" @click="toggleDetails(request)">Toggle Details</button>
                            </td>
                        </tr>
                        <!-- Details Row -->
                        <tr v-if="request.showDetails">
                            <td colspan="9">
                                <p><strong>Message:</strong> {{ request.message }}</p>
                                <p><strong>Requirements:</strong> {{ request.requirements }}</p>
                                <p><strong>Payment Amount:</strong> {{ request.payment_amount }}</p>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>

            <!-- New Table for Sponsor Request Status -->
            <h3>My Requests Status</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>S.No.</th>
                        <th>Campaign Name</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Niche</th>
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
                            <td>{{ myRequest.category }}</td>
                            <td>{{ myRequest.niche }}</td>
                            <td>{{ formatDate(myRequest.created_at) }}</td>
                            <td>{{ formatStatus(myRequest.status) }}</td>
                            <td>
                                <button class="btn btn-info" @click="toggleDetails(myRequest)">Toggle Details</button>
                            </td>
                        </tr>
                        <!-- Details Row -->
                        <tr v-if="myRequest.showDetails">
                            <td colspan="9">
                                <p><strong>Message:</strong> {{ myRequest.message }}</p>
                                <p><strong>Requirements:</strong> {{ myRequest.requirements }}</p>
                                <p><strong>Payment Amount:</strong> {{ myRequest.payment_amount }}</p>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    `,
    data() {
        return {
            influencerRequests: [],
            negotiationRequests: [],
            myRequests: [],
        };
    },

    computed: {
        sortedInfluencerRequests() {
            return this.influencerRequests.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        },
        sortedNegotiationRequests() {
            return this.negotiationRequests.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        },
        sortedMyRequests() {
            return this.myRequests.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        },
    },

    methods: {
        async acceptRequest(request) {
        try {
            const requestResource = await fetch(`${window.location.origin}/api/requests/${request.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    id: request.id,
                    influencer_id: request.influencer_id,
                    ad_id: request.ad_id,
                    status: "Accepted_S",
                }),
            });

            if (!requestResource.ok) {
                const errorText = await requestResource.text();
                console.error(`Error updating status: ${errorText}`);
                return;
            }

            this.influencerRequests = this.influencerRequests.filter((r) => r.id !== request.id);
            // this.negotiationRequests = this.negotiationRequests.filter((r) => r.id !== request.id);
        } 
        catch (error) {
            console.error(`Error updating request: ${error}`);
        }
    },

    async acceptNegotiation(request) {
        try {
            this.acceptRequest(request);

            const adResource = await fetch(`${window.location.origin}/api/ad-requests/${request.ad_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    campaign_id: request.campaign_id,
                    message: request.message,
                    requirements: request.requirements,
                    payment_amount: request.negotiated_amount,
                }),
            });

            if (!adResource.ok) {
                const errorText = await adResource.text();
                console.error(`Error updating amount: ${errorText}`);
                return;
            }

            this.influencerRequests = this.influencerRequests.filter((r) => r.id !== request.id);
            this.negotiationRequests = this.negotiationRequests.filter((r) => r.id !== request.id);
        }
        catch (error) {
            console.error(`Error updating request: ${error}`);
        }
    },

    async rejectRequest(request) {
        try {
            const requestResource = await fetch(`${window.location.origin}/api/requests/${request.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token"),
                },
                body: JSON.stringify({
                    id: request.id,
                    influencer_id: request.influencer_id,
                    ad_id: request.ad_id,
                    status: "Rejected_S",
                }),
            });

            if (!requestResource.ok) {
                const errorText = await requestResource.text();
                console.error(`Error updating status: ${errorText}`);
                return;
            }

            this.influencerRequests = this.influencerRequests.filter((r) => r.id !== request.id);
            this.negotiationRequests = this.negotiationRequests.filter((r) => r.id !== request.id);
        } 
        catch (error) {
            console.error(`Error updating request: ${error}`);
        }
    },

    toggleDetails(request) {
        this.$set(request, "showDetails", !request.showDetails);
    },

    formatStatus(status) {
        if (status === "Accepted_I") return "Accepted";
        if (status === "Rejected_I") return "Rejected";
        if (status === "Pending_I") return "Pending";
        return status;
    },

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    },
},

async mounted() {
    try {
        const sponsorId = localStorage.getItem("id");

        const requestsResource = await fetch(`${window.location.origin}/api/requests-table/${sponsorId}?user_type=sponsor`, {
            headers: {
                "Authentication-Token": localStorage.getItem("token"),
            },
        });

        if (requestsResource.ok) {
            const requests = await requestsResource.json();
            console.log("Fetched data:", requests);

            // Filter accepted and rejected requests for last 24 hours only
            const now = new Date();
            const last24Hours = now.getTime() - 24 * 60 * 60 * 1000;

            this.influencerRequests = requests.filter(
                (request) =>
                    request.status === "Pending_S" &&
                    request.sponsor_id == sponsorId
            );

            this.negotiationRequests = requests.filter(
                (request) =>
                    request.status === "Negotiation" &&
                request.sponsor_id == sponsorId
            );

            this.myRequests = requests.filter(
                (request) =>
                    ["Pending_I", "Accepted_I", "Rejected_I"].includes(request.status) &&
                    request.sponsor_id == sponsorId &&
                    (request.status === "Pending_I" || new Date(request.created_at).getTime() > last24Hours)
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
    //         const sponsorId = localStorage.getItem("id");
            
    //         const requestsResource = await fetch(window.location.origin + "/api/requests", {
    //             headers: { 
    //                 "Authentication-Token": localStorage.getItem("token") 
    //             },
    //         });

    //         if (requestsResource.ok) {
    //             let requests = await requestsResource.json();

    //             requests = await Promise.all(requests.map(async (request) => {
    //                 const adResource = await fetch(`${window.location.origin}/api/ad-requests/${request.ad_id}`, {
    //                     headers: { 
    //                         "Authentication-Token": localStorage.getItem("token") 
    //                     },
    //                 });

    //                 if (adResource.ok) {
    //                     const adDetails = await adResource.json();
    //                     request.campaign_id = adDetails.campaign_id;

    //                     const campaignResource = await fetch(`${window.location.origin}/api/campaigns/${adDetails.campaign_id}?include_details=false`, {
    //                         headers: { 
    //                             "Authentication-Token": localStorage.getItem("token") 
    //                         },
    //                     });

    //                     if (campaignResource.ok) {
    //                         const campaignDetails = await campaignResource.json();
    //                         request.campaignName = campaignDetails.name;
    //                         request.sponsor_id = campaignDetails.sponsor_id;
    //                     }

    //                     // Ad details
    //                     request.message = adDetails.message;
    //                     request.requirements = adDetails.requirements;
    //                     request.payment_amount = adDetails.payment_amount;
    //                 }

    //                 // Influencer details
    //                 const userResource = await fetch(`${window.location.origin}/api/users/${request.influencer_id}`, {
    //                     headers: { 
    //                         "Authentication-Token": localStorage.getItem("token") 
    //                     },
    //                 });

    //                 if (userResource.ok) {
    //                     const userDetails = await userResource.json();
    //                     request.username = userDetails.username;
    //                     request.category = userDetails.category;
    //                     request.niche = userDetails.niche;
    //                     request.followers = userDetails.followers;
    //                 }

    //                 this.$set(request, "showDetails", false);
    //                 return request;
    //             }));

    //             // Filter accepted and rejected requests for last 24 hours only
    //             const now = new Date();
    //             const last24Hours = now.getTime() - 24 * 60 * 60 * 1000;

    //             this.influencerRequests = requests.filter(
    //                 (request) =>
    //                     request.status === "Pending_S" &&
    //                     request.sponsor_id == sponsorId
    //             );

    //             this.negotiationRequests = requests.filter(
    //                 (request) =>
    //                     request.status === "Negotiation" &&
    //                 request.sponsor_id == sponsorId
    //             );

    //             this.myRequests = requests.filter(
    //                 (request) =>
    //                     ["Pending_I", "Accepted_I", "Rejected_I"].includes(request.status) &&
    //                     request.sponsor_id == sponsorId &&
    //                     (request.status === "Pending_I" || new Date(request.created_at).getTime() > last24Hours)
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

export default SponsorRequests;