import Campaigns from '../components/Campaigns.js';

const SponsorDashboard = {
    template: `<div><h1>This is Sponsor dashboard {{test}}</h1>
              <div d-flex flex-row p-5 v-for="(resource, index) in allResources">
                <Campaigns :name="resource.name" :description="resource.description" :budget="resource.budget" :start_date="resource.start_date" :approvalRequired="true" />
              </div>
          </div>`,
    components: {
        Campaigns,
    },
    // computed: {
    //   test() {
    //     return this.$store.state.test;  // Access Vuex state
    //   },
    // },
    data() {
        return {
            // test: this.$vuex-store.state.test,
            allResources: [],
        };
    },
    async mounted() {
      const res = await fetch(window.location.origin + "/api/campaigns", {
        headers: {
          "Authentication-Token": localStorage.getItem("token"),
        },
      });

      console.log(res.ok);

      if (res.ok) {
        const data = await res.json();
        this.allResources = data;
      }
    },
};

export default SponsorDashboard;