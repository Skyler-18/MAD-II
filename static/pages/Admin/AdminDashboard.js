const AdminDashboard = {
    template: `
    <div>
        <h2>New Sponsors for Approval</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Email</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(sponsor, index) in unapprovedSponsors" :key="sponsor.id">
                    <td>{{ index + 1 }}</td>
                    <td>{{ sponsor.email }}</td>
                    <td>
                        <button class="btn btn-secondary" @click="approve(sponsor.id)">Activate</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <hr>

        <div class="statistics-section">
            <h2>Platform Statistics</h2>
            <div class="stats">
                <p>Total Users: {{ totalUsers }}</p>
                <p>Total Sponsors: {{ totalSponsors }}</p>
                <p>Total Influencers: {{ totalInfluencers }}</p>
                <p>Total Campaigns: {{ totalCampaigns }}</p>
                <p>Active Campaigns: {{ activeCampaigns }}</p>
                <p>Accepted Requests: {{ acceptedRequests }}</p>
                <p>Rejected Requests: {{ rejectedRequests }}</p>
            </div>

            <div class="canvas-container">
                <h3>User Distribution</h3>
                <canvas id="userDistributionChart"></canvas>
            </div>
            <div class="canvas-container">
                <h3>Campaign Visibility</h3>
                <canvas id="campaignVisibilityChart"></canvas>
            </div>
            <div class="canvas-container">
                <h3>Number of Ads in Campaigns</h3>
                <canvas id="campaignAdsChart"></canvas>
            </div>
            <div class="canvas-container">
                <h3>Request Status</h3>
                <canvas id="requestStatusChart"></canvas>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            unapprovedSponsors: [],
            totalUsers: 0,
            totalSponsors: 0,
            totalInfluencers: 0,
            totalCampaigns: 0,
            activeCampaigns: 0,
            acceptedRequests: 0,
            rejectedRequests: 0,
            charts: {}
        };
    },

    methods: {
        async approve(id) {
            const res = await fetch(window.location.origin + "/approve-sponsor/" + id, {
                headers: {
                    'Authentication-Token': localStorage.getItem("token"),
                },
            });

            if (res.ok) {
                alert("Sponsor Approved");
                this.fetchUnapprovedSponsors();
            }
        },

        async fetchUnapprovedSponsors() {
            try {
                const res = await fetch(window.location.origin + "/api/unapproved-sponsors", {
                    headers: {
                        'Authentication-Token': localStorage.getItem("token"),
                    },
                });

                if (res.ok) {
                    this.unapprovedSponsors = await res.json();
                }
            } catch (error) {
                console.error(error);
            }
        },

        async fetchStatistics() {
            try {
                const statsRes = await fetch(window.location.origin + "/admin/statistics/", {
                    headers: {
                        'Authentication-Token': localStorage.getItem("token"),
                    },
                });

                if (statsRes.ok) {
                    const stats = await statsRes.json();
                    this.totalUsers = stats.totalUsers;
                    this.totalSponsors = stats.totalSponsors;
                    this.totalInfluencers = stats.totalInfluencers;
                    this.totalCampaigns = stats.totalCampaigns;
                    this.activeCampaigns = stats.activeCampaigns;
                    this.acceptedRequests = stats.acceptedRequests;
                    this.rejectedRequests = stats.rejectedRequests;

                    this.drawUserDistributionChart(stats.userDistribution);
                    this.drawCampaignVisibilityChart(stats.campaignVisibility);
                    this.drawCampaignAdsChart(stats.campaignAds);
                    this.drawRequestStatusChart(stats);
                }
            } catch (error) {
                console.error(error);
            }
        },

        drawUserDistributionChart(data) {
            const ctx = document.getElementById('userDistributionChart').getContext('2d');
            if (this.charts.userDistributionChart) this.charts.userDistributionChart.destroy();
            this.charts.userDistributionChart = new window.Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Sponsors', 'Influencers'],
                    datasets: [{
                        label: 'User Distribution',
                        data: [data.sponsors, data.influencers],
                        backgroundColor: ['blue', 'green'],
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                },
            });
        },

        drawCampaignVisibilityChart(data) {
            const ctx = document.getElementById('campaignVisibilityChart').getContext('2d');
            if (this.charts.campaignVisibilityChart) this.charts.campaignVisibilityChart.destroy();
            this.charts.campaignVisibilityChart = new window.Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Public', 'Private'],
                    datasets: [{
                        label: 'Campaign Visibility',
                        data: [data.public, data.private],
                        backgroundColor: ['orange', 'purple'],
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                },
            });
        },

        drawCampaignAdsChart(data) {
            const ctx = document.getElementById('campaignAdsChart').getContext('2d');
            if (this.charts.campaignAdsChart) this.charts.campaignAdsChart.destroy();
            this.charts.campaignAdsChart = new window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(item => item.campaign_name),
                    datasets: [{
                        label: 'Number of Ads',
                        data: data.map(item => item.ad_count),
                        backgroundColor: 'teal',
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            max: 10,
                        },
                    },
                },
            });
        },

        drawRequestStatusChart(data) {
            const ctx = document.getElementById('requestStatusChart').getContext('2d');
            if (this.charts.requestStatusChart) this.charts.requestStatusChart.destroy();
            this.charts.requestStatusChart = new window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Pending_I', 'Pending_S', 'Negotiation'],
                    datasets: [{
                        label: 'Request Status',
                        data: [data.pendingIRequests, data.pendingSRequests, data.negotiationRequests],
                        backgroundColor: ['yellow', 'grey', 'pink'],
                    }],
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                },
            });
        },
    },

    async mounted() {
        this.fetchUnapprovedSponsors();
        this.fetchStatistics();

        const style = document.createElement('style');
        style.innerHTML = `
    .canvas-container {
        width: 100%;
        max-width: 600px;
        height: 400px;
        margin: auto;
        margin-bottom: 60px;
    }

    canvas {
        width: 100% !important;
        height: 100% !important;
    }

        `;
        document.head.appendChild(style);
    },
};

export default AdminDashboard;
