// import Campaigns from "../../components/Campaigns.js";

const CampaignPage = {
    template: `
<div>
    <div class="filter-section">
        <input type="text" v-model="searchQuery" @input="applyFilters" placeholder="Search campaigns">

        <select v-model="selectedCompanyName" @change="applyFilters">
            <option value="">Select Company</option>
            <option v-for="name in companyNames" :key="name" :value="name">{{ name }}</option>
        </select>

        <select v-model="selectedIndustry" @change="applyFilters">
            <option value="">Select Industry</option>
            <option v-for="industry in industries" :key="industry" :value="industry">{{ industry }}</option>
        </select>

        <input type="number" v-model="minimumBudget" @input="applyFilters" placeholder="Minimum Budget">
    </div>

    <div class="campaign-section">
        <h2>Campaigns</h2>
        <div v-for="(resource, index) in filteredCampaigns" :key="resource.id" class="campaign-box" @click="openCampaign(resource.id)">
            <div class="progress-box">
                <div class="progress" :style="{height: resource.completion + '%'}">
                    {{resource.completion}}%
                </div>
            </div>

            <div class="details-box">
                <h3>{{resource.name}}</h3>
                <p>Budget: {{resource.budget}}</p>
                <p>Start Date: {{formatDate(resource.start_date)}}</p>
                <p>End Date: {{formatDate(resource.end_date)}}</p>
                <p>Ads: {{resource.ad_request_count}}</p>
            </div>
        </div>
    </div>
</div>
`,

    components: {
        // Campaigns,
    },
        data() {
            return {
                publicCampaigns: [],
                filteredCampaigns: [],
                searchQuery: "",
                selectedCompanyName: "",
                selectedIndustry: "",
                minimumBudget: "",
                companyNames: [], // List of available company names for the dropdown
                industries: [], // List of available industries for the dropdown
            };
        },
    
        methods: {
            openCampaign(id) {
                this.$router.push(`/influencer/campaign/${id}`);
            },
            
            applyFilters() { 
                let filteredCampaigns = this.publicCampaigns.filter(campaign => { 
                    const endDate = new Date(campaign.end_date); 
                    const today = new Date(); 
                    endDate.setHours(0, 0, 0, 0); 
                    today.setHours(0, 0, 0, 0); 
                    return endDate >= today; 
                });
                
                if (this.searchQuery) { 
                    const query = this.searchQuery.toLowerCase(); 
                    filteredCampaigns = filteredCampaigns.filter(campaign => 
                        campaign.name.toLowerCase().includes(query) 
                    ); 
                } 
                
                if (this.selectedCompanyName) { 
                    filteredCampaigns = filteredCampaigns.filter(campaign => 
                        campaign.sponsor_details.company_name === this.selectedCompanyName 
                    ); 
                } 
                
                if (this.selectedIndustry) { 
                    filteredCampaigns = filteredCampaigns.filter(campaign => 
                        campaign.sponsor_details.industry === this.selectedIndustry 
                    ); 
                } 
                
                if (this.minimumBudget) { 
                    filteredCampaigns = filteredCampaigns.filter(campaign => 
                        parseFloat(campaign.budget) >= parseFloat(this.minimumBudget) 
                    ); 
                }
    
                this.filteredCampaigns = filteredCampaigns;
            },
    
            formatDate(dateStr) {
                const date = new Date(dateStr);
                return date.toLocaleDateString();
            },        
            
            async fetchCampaigns() {
                try {            
                    const campaignsResource = await fetch(`${window.location.origin}/api/campaigns?include_details=true`, {
                        headers: {
                            "Authentication-Token": localStorage.getItem("token"),
                        },
                    });
    
                    if (campaignsResource.ok) {
                        const campaigns = await campaignsResource.json();
                        console.log(campaigns);
    
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
    
                        const publicCampaigns = [];
    
                        for (const campaign of campaigns) {
                            if (campaign.visibility === "public" && new Date(campaign.end_date) >= today) {
                                const isFlaggedRes = await fetch(window.location.origin + "/api/check-flag/" + campaign.id, {
                                    headers: {
                                        'Authentication-Token': localStorage.getItem("token"),
                                    },
                                });
                                const isFlaggedData = await isFlaggedRes.json();
                                if (!isFlaggedData.exists) {
                                    publicCampaigns.push(campaign);
                                }
                            }
                        }
    
                        this.publicCampaigns = publicCampaigns;
                        console.log(this.publicCampaigns);
    
                        this.companyNames = [...new Set(publicCampaigns.map(campaign => campaign.sponsor_details.company_name))];
                        this.industries = [...new Set(publicCampaigns.map(campaign => campaign.sponsor_details.industry))];
        
                        this.applyFilters();
                    } else {
                        const errorText = await campaignsResource.text();
                        console.error("API Error:", errorText);
                    }
                } catch (error) {
                    console.error("Fetch Error:", error);
                }
            }
        },
    
        async mounted() {
            this.fetchCampaigns();                    

        const style = document.createElement('style');
        style.innerHTML = `
            /* Style for the heading */
            .add-campaign-btn {
                margin-top: 2rem;
            }
            /* Add New Campaign button */
            .btn-primary {
                background-color: #007bff;
                border-color: #007bff;
                color: white;
                padding: 0.75rem 1.25rem;
                border-radius: 5px;
                font-size: 1.2rem;
                font-weight: bold;
                transition: background-color 0.3s, transform 0.3s;
            }
            .btn-primary:hover {
                background-color: #0056b3;
                transform: translateY(-2px); /* Subtle button hover effect */
            }
            h2 {
                margin-left: 4rem;
                margin-top: 2rem;
                margin-bottom: 2rem;
                font-size: 2.2rem;
            }
            /* Campaign section */
            .campaign-section {
                padding: 1rem;
            }
            /* Campaign container */
            .campaign-box {
                background-color: #A6B1E1;
                margin: 1.5rem 8rem;
                padding: 1rem;
                border-radius: 5px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: relative; /* Needed for absolute positioning of icons */
                transition: opacity 0.5s; /* Fade effect */
            }
            /* Hover fade effect */
            .campaign-box:hover {
                opacity: 0.8;
            }
            /* Progress box */
            .progress-box {
                width: 50px;
                height: 50px;
                border: 1px solid #ccc;
                border-radius: 5px;
                overflow: hidden;
                flex-shrink: 0;
                display: flex;
                align-items: flex-end;
                justify-content: center;
                background-color: #4CAF50;
                color: #fff;
            }
            /* Progress fill */
            .progress {
                text-align: center;
                padding: 0.5rem;
                width: 100%;
                background-color: white;
                border-radius: 0;
            }
            .progress {
                width: 50px;
                height: 100%;
            }
            /* Details box */
            .details-box {
                flex-grow: 1;
                margin: 0 1rem;
            }
            /* Icon container */
            .icon-container {
                display: flex;
                gap: 10px;
                position: absolute;
                right: 120px; /* Move icons more to the left */
                top: 50%;
                transform: translateY(-50%);
                z-index: 2;
            }
            .icon-container i {
                cursor: pointer;
                font-size: 1.5rem;
                color: #333; /* Set default icon color to darker shade */
                transition: color 0.3s;
            }
            .icon-container i:hover {
                color: #007bff; /* Hover color for the icons */
            }
            /* Add Ads button */
            .btn-add-ads {
                background-color: #ffc107 !important; /* Ensure background color is applied */
                border: none;
                padding: 1.5rem 1rem;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.3s;
                z-index: 3;
                font-size: 1rem;
                position: absolute;
                right: 0;
                top: 0; /* Align to top */
                bottom: 0; /* Align to bottom */
                display: flex;
                align-items: center; /* Center text vertically */
                justify-content: center; /* Center text horizontally */
            }
            .btn-add-ads:hover {
                background-color: #e0a800;
            }
        `;
        document.head.appendChild(style);
    },
};

export default CampaignPage;