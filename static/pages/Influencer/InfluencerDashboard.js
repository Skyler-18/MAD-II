const InfluencerDashboard = {
    template: `
    <div>
        <div class="statistics-section">
            <h2>Influencer Statistics</h2>
            <div class="stats">
                <p>Total Requests: {{ totalRequests }}</p>
                <p>Accepted Requests: {{ acceptedRequests }}</p>
                <p>Rejected Requests: {{ rejectedRequests }}</p>
                <p>Negotiation Requests: {{ negotiationRequests }}</p>
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
            totalRequests: 0,
            acceptedRequests: 0,
            rejectedRequests: 0,
            negotiationRequests: 0,
            pendingRequests: 0,
            charts: {}
        };
    },

    methods: {
        async fetchStatistics() {
            try {
                const influencerId = localStorage.getItem('id'); // Assuming the influencer's ID is stored in localStorage
                const statsRes = await fetch(window.location.origin + `/influencer/statistics/${influencerId}/`, {
                    headers: {
                        'Authentication-Token': localStorage.getItem("token"),
                    },
                });

                if (statsRes.ok) {
                    const stats = await statsRes.json();
                    this.totalRequests = stats.totalRequests;
                    this.acceptedRequests = stats.acceptedRequests;
                    this.rejectedRequests = stats.rejectedRequests;
                    this.negotiationRequests = stats.negotiationRequests;
                    this.pendingRequests = this.totalRequests - (stats.acceptedRequests + stats.rejectedRequests + stats.negotiationRequests);

                    this.drawRequestStatusChart(stats);
                }
            } catch (error) {
                console.error(error);
            }
        },

        drawRequestStatusChart(data) {
            const ctx = document.getElementById('requestStatusChart').getContext('2d');
            if (this.charts.requestStatusChart) this.charts.requestStatusChart.destroy();
            this.charts.requestStatusChart = new window.Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Accepted Requests', 'Rejected Requests', 'Pending Requests', 'Negotiation Requests'],
                    datasets: [{
                        label: 'Request Status',
                        data: [data.acceptedRequests, data.rejectedRequests, this.pendingRequests, data.negotiationRequests],
                        backgroundColor: ['green', 'red', 'yellow', 'orange'],
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
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
        max-width: 600px;
        height: 400px;
        margin: auto;
        margin-bottom: 20px; /* Added margin below the charts */
    }

    canvas {
        width: 100% !important;
        height: 100% !important;
    }
        `;
        document.head.appendChild(style);
    },
};

export default InfluencerDashboard;
