import Campaigns from "../components/Campaigns.js";
import DeleteConfirmation from "../components/DeleteConfirmation.js";

const SponsorDashboard = {
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
                        <p>Ads: {{resource.adsCount}}</p>
                    </div>

                    <div class="icon container">
                        <i class="fas fa-edit" @click.stop="editCampaign(resource.id)"></i>
                        <i class="fas fa-trash" @click.stop="showConfirmation(resource.id)"></i>
                    </div>

                    <button class="btn-add-ads" @click.stop="addAds(resource.id)">Add Ads</button>
                </div>

                <h2>Private</h2>
                <div v-for="(resource, index) in privateCampaigns" :key="resource.id" class="campaign-box" @click="openCampaign(resource.id)">

                <div class="progress-box">
                    <div class="progress" :style="{height: resource.completion + '%'}">
                        {{resource.completion}}%
                    </div>
                </div>

                <div class="details-box">
                    <h3>{{resource.name}}</h3>
                    <p>Ads: {{resource.adsCount}}</p>
                </div>

                <div class="icon container">
                    <i class="fas fa-edit" @click.stop="editCampaign(resource.id)"></i>
                    <i class="fas fa-trash" @click.stop="showConfirmation(resource.id)"></i>
                </div>

                <button class="btn-add-ads" @click.stop="addAds(resource.id)">Add Ads</button>                 
            </div>
            </div>

            <DeleteConfirmation
                :show="showConfirmationComponent"
                message="Are you sure you want to delete this campaign?"
                @confirm="deleteCampaign"
                @cancel="hideConfirmation"
            />
        </div>
    `,

    components: {
        Campaigns,
        DeleteConfirmation,
    },

    data() {
        return {
            allResources: [],
            publicCampaigns: [],
            privateCampaigns: [],
            name: "",
            description: "",
            start_date: "",
            end_date: "",
            budget: "",
            visibility: "",
            goals: "",
            showConfirmationComponent: false,
            campaignToDelete: null,
        };
    },

    async mounted() {
        try {
            const res = await fetch(window.location.origin + "/api/campaigns", {
                headers: {
                    "Authentication-Token": localStorage.getItem("token"),
                },
            });

            if (res.ok) {
                const data = await res.json();
                this.allResources = data;
                this.publicCampaigns = data.filter(campaign => campaign.visibility === "public");
                this.privateCampaigns = data.filter(campaign => campaign.visibility === "private");
            }
            else {
                const errorText = await res.text();
                console.error("API Error:", errorText);
            }
        }
        catch(error) {
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

    methods: {
        openCampaign(id) {
            this.$router.push(`/campaign/${id}`);
        },

        editCampaign(id) {
            this.$router.push(`/campaign/edit/${id}`);
        },

        showConfirmation(id) {
            this.campaignToDelete = id;
            this.showConfirmationComponent = true;
        },

        hideConfirmation() {
            this.showConfirmationComponent = false;
        },

        addAds(id) {
            console.log("Add ads button is clicked for campaign ID:", id);
            this.$router.push(`/ads/add/${id}`);
        },

        deleteCampaign() {
            const id = this.campaignToDelete;
            const backendUrl = `${window.location.origin}/api/campaigns/${id}`;
            fetch(backendUrl, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("token"),
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                if (this.allResources) {
                    this.allResources = this.allResources.filter(r => r.id !== id);
                  }
                  if (this.publicCampaigns) {
                    this.publicCampaigns = this.publicCampaigns.filter(c => c.id !== id);
                  }
                  if (this.privateCampaigns) {
                    this.privateCampaigns = this.privateCampaigns.filter(c => c.id !== id);
                  }
            })
            .catch(error => {
                console.error("Error deleting Campaign:", error);
            });
            this.hideConfirmation();
        },
    }
};

export default SponsorDashboard;