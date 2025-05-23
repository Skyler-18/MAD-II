const Campaigns = {
    template: `
      <div>
        <div class="card shadow-sm p-4 mb-4 study-resource-card">
          <div class="card-body">
            <h3 class="card-title text-center mb-3 text-primary text-truncate">{{ name }}</h3>
            <p class="card-text text-secondary text-truncate">{{ description }}</p>
          </div>
          <div class="card-footer text-muted text-end">
            <small>Created by: {{ budget }}</small>
          </div>

          <button v-show="approvalRequired" class="btn btn-success mt-3" @click="sendApproval">Approve</button>
          <button class="btn btn-secondary  mt-3">Close</button>
        </div>
      </div>
    `,
    props: {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: false,
      },
      budget: {
        type: Number,
        required: true,
      },
      start_date: {
        type: String,
        required: true,
      },
      approvalRequired: {
        type: Boolean,
        required: false,
      },
      approvalID: {
        type: String,
      },
    },
    methods: {
      async sendApproval() {
        // send fetch request to approval backend
        console.log("sending Approval");
      },
    },
    mounted() {
      const style = document.createElement("style");
      style.textContent = `
        .study-resource-card {
          max-width: 600px;
          margin: auto;
          border-radius: 15px;
          transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        .study-resource-card:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        }
      `;
      document.head.appendChild(style);
    },
  };
  
  export default Campaigns;