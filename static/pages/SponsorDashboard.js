import Campaigns from '../components/Campaigns.js';

const SponsorDashboard = {
    template: `<div><h1>This is Sponsor dashboard {{test}}</h1>

    <!-- Add Campaign Button -->
    <div class="d-flex justify-content-end">
        <router-link to="/campaign/add">
            <button class="btn btn-primary m-2">Add New Campaign</button>
        </router-link>
    </div>

              <div d-flex flex-row p-5 v-for="(resource, index) in allResources">
                <Campaigns :name="resource.name" :description="resource.description" :budget="resource.budget" :start_date="resource.start_date" :approvalRequired="true" />

                <button @click="editCampaign(resource.id)">Edit</button>
                <button @click="deleteCampaign(resource.id)">Delete</button>
              </div>


              <div v-if="editMode">
    <form @submit.prevent="saveChanges">
        <label for="topic">Name:</label>
        <input type="text" id="name" v-model="name" required><br><br>
        <label for="content">Description:</label>
        <textarea id="description" v-model="description" required></textarea><br><br>
        <label for="content">Start Date:</label>
        <input type="date" id="startDate" v-model="start_date" required><br><br>
        <label for="content">End Date:</label>
        <input type="date" id="endDate" v-model="end_date" required><br><br>
        <label for="content">Budget:</label>
        <textarea id="budget" v-model="budget" required></textarea><br><br>
        <label for="content">Visibility:</label>
        <textarea id="visibility" v-model="visibility" required></textarea><br><br>
        <label for="creatorId">Sponsor ID:</label>
        <input type="integer" id="sponsorID" v-model="sponsor_id" required><br><br>
        <label for="content">Goals:</label>
        <textarea id="goals" v-model="goals" required></textarea><br><br>
        <button type="submit">Save Changes</button>
    </form>
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
            name: "",
            description: "",
            start_date: "",
            end_date: "",
            budget: "",
            visibility: "",
            sponsor_id: "",
            goals: "",
            editMode: false,
            editId: null
        };
    },
    async mounted() {
      const res = await fetch(window.location.origin + "/api/campaigns", {
        headers: {
          "Authentication-Token": sessionStorage.getItem("token"),
        },
      });

      console.log(res.ok);

      if (res.ok) {
        const data = await res.json();
        this.allResources = data;
      }
    },

    methods: {
    deleteCampaign(id) {
        const backendUrl = `${window.location.origin}/api/campaigns/${id}`;
        
        fetch(backendUrl, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token": sessionStorage.getItem("token"),
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log("Campaign deleted:", data);
            // Optionally refresh the list or remove the deleted item from `allResources`
            this.allResources = this.allResources.filter(resource => resource.id !== id);
        })
        .catch(error => {
            console.error("Error deleting campaign:", error);
            // Handle error, show error message, etc.
        });
    },

    editCampaign(id) {
      console.log("Edit button clicked for campaign ID:", id);

      const resource = this.allResources.find(r => r.id === id);
      this.name = resource.name;
      this.description = resource.description;
      this.start_date = resource.start_date;
      this.end_date = resource.end_date;
      this.budget = resource.budget;
      this.visibility = resource.visibility;
      this.sponsor_id = resource.sponsor_id;
      this.goals = resource.goals;
      this.editMode = true;
      this.editId = id;
  },
  saveChanges() {
      if (!this.editMode) return;

      const backendUrl = `${window.location.origin}/api/campaigns/${this.editId}`;

      const postData = {
          name: this.name,
          description: this.description,
          start_date: this.start_date,
          end_date: this.end_date,
          budget: this.budget,
          visibility: this.visibility,
          sponsor_id: this.sponsor_id,
          goals: this.goals
      };

      fetch(backendUrl, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
              "Authentication-Token": sessionStorage.getItem("token")
          },
          body: JSON.stringify(postData)
      })
      .then(response => {
          if (!response.ok) {
              throw new Error("Network response was not ok");
          }
          return response.json();
      })
      .then(data => {
          console.log("Campaign updated:", data);
          this.editMode = false;
          this.editId = null;
          // this.refreshResources(); // Refresh the list after saving changes
      })
      .catch(error => {
          console.error("Error updating campaign:", error);
      });
  },
  // refreshResources() {
  //     // Implement this method to fetch the updated list of resources
  // }
  }
};

export default SponsorDashboard;