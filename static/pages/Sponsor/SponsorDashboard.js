const SponsorDashboard = {
    template: `
    <div>

        <button class="btn btn-primary" @click="startExport">Export Campaigns to CSV</button>
        <div v-if="exporting">
        <p>Exporting... Please wait.</p>
        </div>
        <div v-if="exportError">
        <p>{{ exportError }}</p>
        </div>

        <div class="statistics-section">
            <h2>Sponsor Statistics</h2>
            <div class="stats">
                <p>Total Campaigns: {{ totalCampaigns }}</p>
                <p>Active Campaigns: {{ activeCampaigns }}</p>
                <p>Flagged Campaigns: {{ flaggedCampaigns }}</p>
                <p>Total Requests: {{ totalRequests }}</p>
                <p>Accepted Requests: {{ acceptedRequests }}</p>
                <p>Rejected Requests: {{ rejectedRequests }}</p>
                <p>Negotiation Requests: {{ negotiationRequests }}</p>
            </div>

            <div class="canvas-container">
                <h3>Number of Ads in Active Campaigns</h3>
                <canvas id="campaignAdsChart"></canvas>
            </div>
            <div class="canvas-container">
                <h3>Campaign Visibility</h3>
                <canvas id="campaignVisibilityChart"></canvas>
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
            totalCampaigns: 0,
            activeCampaigns: 0,
            flaggedCampaigns: 0,
            totalRequests: 0,
            acceptedRequests: 0,
            rejectedRequests: 0,
            negotiationRequests: 0,
            charts: {}
        };
    },

    methods: {
        // Add this in the template section

        async startExport() {
            this.exporting = true;
            this.exportError = null;
        
            try {
                const sponsorId = localStorage.getItem("id"); // Retrieve the sponsor's ID from localStorage
                const exportRes = await fetch(window.location.origin + `/start-export`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json', // Set the content type to JSON
                        'Authentication-Token': localStorage.getItem("token"),
                    },
                    body: JSON.stringify({ sponsor_id: sponsorId }) // Send sponsor_id in the request body
                });
        
                if (exportRes.ok) {
                    const { task_id } = await exportRes.json();
                    this.checkExportStatus(task_id);
                } else {
                    this.exportError = 'Failed to start export.';
                    this.exporting = false;
                }
            } catch (error) {
                this.exportError = 'An error occurred while starting the export.';
                console.error(error);
                this.exporting = false;
            }
        },                

    async checkExportStatus(taskId) {
        try {
            const statusRes = await fetch(window.location.origin + `/get-csv/${taskId}`, {
                headers: {
                    'Authentication-Token': localStorage.getItem("token"),
                },
            });

            if (statusRes.status === 200) {
                const blob = await statusRes.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'file.csv';
                document.body.appendChild(a);
                a.click();
                a.remove();
                this.exporting = false;
            } else if (statusRes.status === 405) {
                setTimeout(() => this.checkExportStatus(taskId), 2000);
            } else {
                this.exportError = 'An error occurred while checking export status.';
                this.exporting = false;
            }
        } catch (error) {
            this.exportError = 'An error occurred while checking export status.';
            console.error(error);
            this.exporting = false;
        }
    },
        async fetchStatistics() {
            try {
                const sponsorId = localStorage.getItem('id'); // Assuming the sponsor's ID is stored in localStorage
                const statsRes = await fetch(window.location.origin + `/sponsor/statistics/${sponsorId}/`, {
                    headers: {
                        'Authentication-Token': localStorage.getItem("token"),
                    },
                });

                if (statsRes.ok) {
                    const stats = await statsRes.json();
                    this.totalCampaigns = stats.totalCampaigns;
                    this.activeCampaigns = stats.activeCampaigns;
                    this.flaggedCampaigns = stats.flaggedCampaigns;
                    this.totalRequests = stats.totalRequests;
                    this.acceptedRequests = stats.acceptedRequests;
                    this.rejectedRequests = stats.rejectedRequests;
                    this.negotiationRequests = stats.negotiationRequests;

                    this.drawCampaignAdsChart(stats.campaignAds);
                    this.drawCampaignVisibilityChart(stats.campaignVisibility);
                    this.drawRequestStatusChart(stats);
                }
            } catch (error) {
                console.error(error);
            }
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
                        y: {
                            beginAtZero: true,
                        },
                        x: {
                            max: 10, // Limit the x-axis size
                        },
                    },
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

        drawRequestStatusChart(data) {
            const ctx = document.getElementById('requestStatusChart').getContext('2d');
            if (this.charts.requestStatusChart) this.charts.requestStatusChart.destroy();
            this.charts.requestStatusChart = new window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Accepted Requests', 'Rejected Requests', 'Negotiation Requests'],
                    datasets: [{
                        label: 'Request Status',
                        data: [data.acceptedRequests, data.rejectedRequests, data.negotiationRequests],
                        backgroundColor: ['green', 'red', 'orange'],
                    }],
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        },
    },

    async mounted() {
        this.fetchStatistics();
        const style = document.createElement('style');
        style.innerHTML = `
    .canvas-container {
        width: 100%;
        max-width: 600px; /* Limit the width of the chart */
        height: 400px;    /* Fixed height for the chart */
        margin: auto;
        margin-bottom: 50px; /* Add 50px margin below the charts */
    }

    canvas {
        width: 100% !important;
        height: 100% !important;
    }
        `;
        document.head.appendChild(style);
    },
};

export default SponsorDashboard;
