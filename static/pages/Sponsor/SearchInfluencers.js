const SearchInfluencers = {
    template: `
        <div>
            <div>
                <input type="text" v-model="searchQuery" placeholder="Search Influencers..." class="search-bar" />
            </div>
            <div>
                <select v-model="selectedCategory">
                    <option value="">All Categories</option>
                    <option v-for="category in uniqueCategories" :key="category" :value="category">{{ category }}</option>
                </select>
                <select v-model="selectedNiche">
                    <option value="">All Niches</option>
                    <option v-for="niche in uniqueNiches" :key="niche" :value="niche">{{ niche }}</option>
                </select>
                <input type="number" v-model.number="minFollowers" placeholder="Min Followers" class="followers-input" />
            </div>
            <div>
                <div v-for="(influencer, index) in filteredInfluencers" :key="influencer.id">
                    <p>{{ influencer.email }}</p>
                    <p><strong>{{ influencer.name }}</strong></p>
                    <p>Category: {{ influencer.category }}</p>
                    <p>Niche: {{ influencer.niche }}</p>
                    <p>Followers: {{ influencer.followers }}</p>
                    <button 
                        v-if="!anyAcceptedStatus"
                        class="btn btn-primary" 
                        :disabled="requestButtonDisabled(influencer.id)"
                        @click.stop="sendRequest(influencer.id)"
                    >
                        {{ buttonText(influencer.id) }}
                    </button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            searchQuery: '',
            influencers: [],
            selectedCategory: '',
            selectedNiche: '',
            minFollowers: 0,
            uniqueCategories: [],
            uniqueNiches: [],
            requestStatuses: {},
        };
    },
    computed: {
        filteredInfluencers() {
            return this.influencers.filter(influencer => {
                const matchedSearch = this.searchQuery
                    ? influencer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                      influencer.email.toLowerCase().includes(this.searchQuery.toLowerCase())
                    : true;
                const matchedCategory = this.selectedCategory ? influencer.category === this.selectedCategory : true;
                const matchedNiche = this.selectedNiche ? influencer.niche === this.selectedNiche : true;
                const matchedFollowers = influencer.followers >= this.minFollowers;
                return matchedSearch && matchedCategory && matchedNiche && matchedFollowers;
            });
        },

        anyAcceptedStatus() {
            return Object.values(this.requestStatuses).some(status =>
                status === 'Accepted_I' || status === 'Accepted_S'
            );
        },
    },

    methods: {
        // async checkRequestExists(ad_id, influencer_id) {
        //     const checkRequest = await fetch(`${window.location.origin}/api/check-request?ad_id=${ad_id}&influencer_id=${influencer_id}`, {
        //         headers: {
        //             "Authentication-Token": localStorage.getItem("token"),
        //         },
        //     });

        //     if (checkRequest.ok) {
        //         const data = await checkRequest.json();
        //         return data.exists ? data.status : null;
        //     }
        //     else {
        //         const errorText = await checkRequest.text();
        //         console.error("API Error:", errorText);
        //         return null;
        //     } 
        // },

        async checkRequestStatus(ad_id, influencer_ids) {
            try {
                const url = new URL(`${window.location.origin}/api/requests`);
                influencer_ids.forEach(influencer_id => url.searchParams.append('influencer_ids', influencer_id));
                url.searchParams.append('ad_id', ad_id);

                const checkRequestResource = await fetch(url, {
                    headers: {
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

        requestButtonDisabled(influencer_id) {
            // const status = this.requestStatuses[influencer_id]?.status;
            const status = this.requestStatuses[influencer_id];
            return (
                status === 'Pending_I' || 
                status === 'Pending_S' || 
                status === 'Accepted_I' || 
                status === 'Accepted_S' || 
                status === 'Negotiation'
            );
        },

        buttonText(influencer_id) {
            // const status = this.requestStatuses[influencer_id]?.status;
            const status = this.requestStatuses[influencer_id];

            if (status === 'Pending_I' || status === 'Pending_S') {
                return 'Request Pending';
            } 
            else if (status === 'Accepted_I' || status === 'Accepted_S') {
                return 'Request Accepted';
            } 
            else if (status === 'Negotiation') {
                return 'Negotiation In Progress';
            } 
            else {
                return 'Send Request';
            }
        },

        async sendRequest(id) {
            const ad_id = this.$route.params.id;
            try {
                const requestsResource = await fetch(`${window.location.origin}/api/requests`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("token"),
                    },
                    body: JSON.stringify({
                        ad_id: ad_id,
                        influencer_id: id,
                        status: "Pending_I",
                    }),
                });

                if (requestsResource.ok) {
                    alert("Request sent successfully.");
                    // this.$set(this.requestStatuses, id, {
                    //     isPending: true,
                    //     status: "Pending_I",
                    //     statusText: "Request Pending",
                    // });
                    // this.requestStatuses[id] = "Request Pending";
                    this.$set(this.requestStatuses, id, "Pending_I");

                } 
                else {
                    const errorText = await requestsResource.json();
                    console.error("Error:", errorText);
                }
            } 
            catch (error) {
                console.error("Error adding request:", error);
            }
        },
    },

    async mounted() {
        try {
            const [usersResource, requestsRes] = await Promise.all([
                fetch(window.location.origin + "/api/users", {
                    headers: { "Authentication-Token": localStorage.getItem("token") },
                }),
            ]);

            if (usersResource.ok) {
                const data = await usersResource.json();
                const influencers = data.filter(user => user.roles === "influencer");
                this.influencers = influencers;
                console.log(this.influencers)
                this.uniqueCategories = [...new Set(influencers.map(i => i.category).filter(Boolean))];
                this.uniqueNiches = [...new Set(influencers.map(i => i.niche).filter(Boolean))];
            } 
            else {
                const errorText = await usersResource.text();
                console.error("Users API Error:", errorText);
            }

            const influencer_ids = [];
            for (const influencer of this.influencers) {
                influencer_ids.push(influencer.id);
            }
            console.log(influencer_ids);
            const ad_id = this.$route.params.id;

            const statuses = await this.checkRequestStatus(ad_id, influencer_ids);

            this.influencers.forEach(influencer => {
                this.$set(this.requestStatuses, influencer.id, statuses[influencer.id] || "No Request");
            });
            // Check request status for all influencers
            // for (const influencer of this.influencers) {
            //     const status = await this.checkRequestExists(this.$route.params.id, influencer.id);
            //     this.$set(this.requestStatuses, influencer.id, {
            //         isPending: status === 'Pending_I' || status === 'Pending_S',
            //         status: status,
            //         statusText: this.buttonText(influencer.id),
                    // statusText: status === 'Accepted_I' || status === 'Accepted_S' 
                    //             ? 'Request Accepted' 
                    //             : status === 'Pending_I' || status === 'Pending_S'
                    //             ? 'Request Pending'
                    //             : status === 'Negotiation'
                    //             ? 'Negotiation Asked'
                    //             : 'Send Request',
                // });
            // }
        } 
        catch (error) {
            console.error("Fetch error:", error);
        }
    },
};

export default SearchInfluencers;
