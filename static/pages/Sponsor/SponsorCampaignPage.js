// import Campaigns from "../../components/Campaigns.js";
import DeleteConfirmation from "../../components/DeleteConfirmation.js";

const SponsorCampaignPage = {
    template: `
    <div>
    <div class="d-flex justify-content-center add-campaign-btn">
        <router-link to="/campaign/add">
            <button class="btn btn-primary m-2">Add New Campaign</button>
        </router-link>
    </div>

    <div class="campaign-section">
        <h2>Public</h2>
        <div v-for="(resource, index) in publicCampaigns" :key="resource.id" class="campaign-box" @click="openCampaign(resource.id)">

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

            <div v-if="$store.state.role === 'sponsor'" class="icon container">
                <i class="fas fa-edit" @click.stop="editCampaign(resource.id)"></i>
                <i class="fas fa-trash" @click.stop="deleteBox(resource.id)"></i>
            </div>

            <button v-if="$store.state.role === 'sponsor'" class="btn-add-ads" @click.stop="addAds(resource.id)">Add Ads</button>
        </div>

        <div>
            <h2>Private</h2>
            <div v-for="(resource, index) in privateCampaigns" :key="resource.id" class="campaign-box" @click="openCampaign(resource.id)">

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

            <div class="icon container">
                <i class="fas fa-edit" @click.stop="editCampaign(resource.id)"></i>
                <i class="fas fa-trash" @click.stop="deleteBox(resource.id)"></i>
            </div>

            <button class="btn-add-ads" @click.stop="addAds(resource.id)">Add Ads</button>                 
        </div>

        <h2>Expired Campaigns</h2>
        <div v-for="(resource, index) in expiredCampaigns" :key="resource.id" class="campaign-box" @click="openCampaign(resource.id)">
        <div class="progress-box">
            <div class="progress" :style="{ height: resource.completion + '%' }">
                {{ resource.completion }}%
            </div>
        </div>
    
        <div class="details-box">
            <h3>{{ resource.name }}</h3>
            <p>Budget: {{ resource.budget }}</p>
            <p>Start Date: {{ formatDate(resource.start_date) }}</p>
            <p>End Date: {{ formatDate(resource.end_date) }}</p>
            <p>Ads: {{ resource.ad_request_count }}</p>
        </div>
    </div>
    
      
        </div>

        <DeleteConfirmation
            :show="showDeleteBox"
            message="Are you sure you want to delete this campaign?"
            @confirm="deleteCampaign"
            @cancel="hideDeleteBox"
        />
    </div>
</div>

    `,

    components: {
        // Campaigns,
        DeleteConfirmation,
    },

    data() {
        return {
            publicCampaigns: [],
            privateCampaigns: [],
            expiredCampaigns: [],
            showDeleteBox: false,
            campaignToDelete: null,
        };
    },

    methods: {
        openCampaign(id) {
            this.$router.push(`/sponsor/campaign/${id}`);
        },

        editCampaign(id) {
            this.$router.push(`/campaign/edit/${id}`);
        },

        deleteBox(id) {
            this.campaignToDelete = id;
            this.showDeleteBox = true;
        },

        hideDeleteBox() {
            this.showDeleteBox = false;
        },

        addAds(id) {
            console.log("Add ads button is clicked for campaign ID:", id);
            this.$router.push(`/${id}/ads/add`);
        },

        async deleteCampaign() {
            const id = this.campaignToDelete;
            const campaignResource = await fetch(`${window.location.origin}/api/campaigns/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token"),
                },
            });

            if (!campaignResource.ok) {
                const errorText = await campaignResource.text();
                console.error("Error deleting campagin:", errorText);
            }

            const data = await campaignResource.json();
            console.log("Campaign Deleted:", data);

            if (this.publicCampaigns) {
                this.publicCampaigns = this.publicCampaigns.filter(campaign => campaign.id !== id);
            }

            if (this.privateCampaigns) {
                this.privateCampaigns = this.privateCampaigns.filter(campaign => campaign.id !== id);
            }

            this.hideDeleteBox();
        },

        formatDate(dateStr) {
            const date = new Date(dateStr);
            return date.toLocaleDateString();
        },  
        
        sortCampaigns() {
            const sortByDate = (a, b) => new Date(a.end_date) - new Date(b.end_date);
            this.publicCampaigns.sort(sortByDate);
            this.privateCampaigns.sort(sortByDate);
            this.expiredCampaigns.sort(sortByDate);
        },
    },
        

    async mounted() {
        const userId = localStorage.getItem('id');
    
        try {
            const campaignsResource = await fetch(`${window.location.origin}/api/my-campaigns/${userId}`, {
                headers: {
                    "Authentication-Token": localStorage.getItem("token"),
                },
            });
    
            // const adsResource = await fetch(window.location.origin + "/api/ad-requests", {
            //     headers: {
            //         "Authentication-Token": localStorage.getItem("token"),
            //     },
            // });
    
            if (campaignsResource.ok) {
                const campaigns = await campaignsResource.json();
                console.log(campaigns);
                // const ads = await adsResource.json();
    
                // Count ads for each campaign
                // const adsCount = ads.reduce((adCount, ad) => {
                //     adCount[ad.campaign_id] = (adCount[ad.campaign_id] || 0) + 1;
                //     return adCount;
                // }, {});
    
                // Assign ads count to each campaign
                // campaigns.forEach(campaign => {
                //     campaign.adsCount = adsCount[campaign.id] || 0;
                // });

                const today = new Date();
                today.setHours(0,0,0,0);
                
                this.publicCampaigns = campaigns.filter(campaign => campaign.visibility === "public" && new Date(campaign.end_date) >= today);
                this.privateCampaigns = campaigns.filter(campaign => campaign.visibility === "private" && new Date(campaign.end_date) >= today);
                this.expiredCampaigns = campaigns.filter(campaign => new Date(campaign.end_date) < today);
                this.sortCampaigns();
                console.log(this.publicCampaigns);
            } 
            else {
                const errorText = await campaignsResource.text();
                console.error("API Error:", errorText);
            }
        } 
        catch (error) {
            console.error("Fetch Error:", error);
        }                 

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

export default SponsorCampaignPage;