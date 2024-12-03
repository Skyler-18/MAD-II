const AllCampaigns = {
    template: `
    <div>
        <h1 class="text-center">Ongoing Campaigns</h1>
        <div v-for="(campaign, index) in ongoingCampaigns" :key="campaign.id">
            <h3>{{ index + 1 }}. {{ campaign.name }}</h3>
            <p><strong>Company Name:</strong> {{ campaign.company_name }}</p>
            <p><strong>Visibility:</strong> {{ campaign.visibility }}</p>
            <p><strong>Start Date:</strong> {{ formatDate(campaign.start_date) }}</p>
            <p><strong>End Date:</strong> {{ formatDate(campaign.end_date) }}</p>
            <p><strong>Budget:</strong> Rs. {{ campaign.budget }}</p>
            <p><strong>Description:</strong> {{ campaign.description }}</p>
            <p><strong>Goals:</strong> {{ campaign.goals }}</p>
            <button class="btn btn-warning" @click="promptFlagReason(campaign.id)">Flag</button>
            <h4>Ads in this Campaign</h4>
            <ul>
                <li v-for="(ad, adIndex) in campaign.ad_requests" :key="ad.id">
                    <p><strong>S.No.:</strong> {{ adIndex + 1 }}</p>
                    <p><strong>Message:</strong> {{ ad.message }}</p>
                    <p><strong>Requirements:</strong> {{ ad.requirements }}</p>
                    <p><strong>Payment Amount:</strong> Rs. {{ ad.payment_amount }}</p>
                </li>
            </ul>
        </div>

        <h1 class="text-center">Flagged Campaigns</h1>
        <div v-for="(campaign, index) in flaggedCampaigns" :key="campaign.id">
            <h3>{{ index + 1 }}. {{ campaign.name }}</h3>
            <p><strong>Company Name:</strong> {{ campaign.company_name }}</p>
            <p><strong>Visibility:</strong> {{ campaign.visibility }}</p>
            <p><strong>Start Date:</strong> {{ formatDate(campaign.start_date) }}</p>
            <p><strong>End Date:</strong> {{ formatDate(campaign.end_date) }}</p>
            <p><strong>Budget:</strong> Rs. {{ campaign.budget }}</p>
            <p><strong>Description:</strong> {{ campaign.description }}</p>
            <p><strong>Goals:</strong> {{ campaign.goals }}</p>
            <p><strong>Reason for Flagging:</strong> {{ campaign.reason }}</p>
            <button class="btn btn-success" @click="unflagCampaign(campaign.id)">Unflag</button>
            <h4>Ads in this Campaign</h4>
            <ul>
                <li v-for="(ad, adIndex) in campaign.ad_requests" :key="ad.id">
                    <p><strong>S.No.:</strong> {{ adIndex + 1 }}</p>
                    <p><strong>Message:</strong> {{ ad.message }}</p>
                    <p><strong>Requirements:</strong> {{ ad.requirements }}</p>
                    <p><strong>Payment Amount:</strong> Rs. {{ ad.payment_amount }}</p>
                </li>
            </ul>
        </div>
    </div>
    `,
    data() {
        return {
            ongoingCampaigns: [],
            flaggedCampaigns: [],
        };
    },
    methods: {
        async fetchCampaigns() {
            try {
                const res = await fetch(window.location.origin + "/api/campaigns?include_details=True", {
                    headers: {
                        'Authentication-Token': localStorage.getItem("token"),
                    },
                });

                if (res.ok) {
                    const campaigns = await res.json();
                    const ongoingCampaigns = [];
                    const flaggedCampaigns = [];

                    for (const campaign of campaigns) {
                        if (new Date(campaign.end_date) > new Date()) {
                            const isFlaggedRes = await fetch(window.location.origin + "/api/check-flag/" + campaign.id, {
                                headers: {
                                    'Authentication-Token': localStorage.getItem("token"),
                                },
                            });
                            const isFlaggedData = await isFlaggedRes.json();
                            if (isFlaggedData.exists) {
                                campaign.reason = isFlaggedData.reason; // Include the reason in the campaign object
                                flaggedCampaigns.push(campaign);
                            } else {
                                ongoingCampaigns.push(campaign);
                            }
                        }
                    }
                    this.ongoingCampaigns = ongoingCampaigns;
                    this.flaggedCampaigns = flaggedCampaigns;
                }
            } catch (error) {
                console.error(error);
            }
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        },
        promptFlagReason(id) {
            const reason = prompt("Please enter the reason for flagging this campaign:");
            if (reason) {
                this.flagCampaign(id, reason);
            }
        },
        async flagCampaign(id, reason) {
            const res = await fetch(window.location.origin + "/api/flag-campaign/" + id, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem("token"),
                },
                body: JSON.stringify({ reason })
            });

            if (res.ok) {
                alert("Campaign flagged successfully");
                this.fetchCampaigns();
            }
        },
        async unflagCampaign(id) {
            const res = await fetch(window.location.origin + "/api/flag-campaign/" + id, {
                method: 'DELETE',
                headers: {
                    'Authentication-Token': localStorage.getItem("token"),
                },
            });

            if (res.ok) {
                alert("Campaign unflagged successfully");
                this.fetchCampaigns();
            }
        }
    },
    async mounted() {
        this.fetchCampaigns();
    },
};

export default AllCampaigns;
