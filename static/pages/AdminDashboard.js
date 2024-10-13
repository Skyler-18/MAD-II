const AdminDashboard = {
    template: `
    <div>
        <h1> Admin Dashboard </h1>
        <h2> Unapproved Sponsors </h2>
        <div v-for="sponsor in unapprovedSponsors">
            <div class="justify"> <span> email : {{sponsor.email}} </span> <span> <button class="btn btn-secondary" @click="approve(sponsor.id)"> Activate </button> </span> </div>
        </div>
    </div>
    `,
    data() {
        return {
            unapprovedSponsors: [],
        };
    },
    methods: {
        async approve(id) {
            const res = await fetch(window.location.origin + "/approve-sponsor/" + id
                , {
                headers: {
                    'Authentication-Token': sessionStorage.getItem("token"),
                },
            }
        );

            if (res.ok) {
                alert("Sponsor Approved");
            }
        },
    },
    async mounted() {
        try {
        console.log("Checkpoint 1");
        const res = await fetch(window.location.origin + "/unapproved-sponsors"
            , {
            headers: {
                'Authentication-Token': sessionStorage.getItem("token"),
            },
        }
    );
        console.log("Checkpoint 2");
        // console.log("Token being sent:", sessionStorage.getItem("token"));

        if (res.ok) {
            console.log("Checkpoint 3");
            this.unapprovedSponsors = await res.json();
            console.log("Checkpoint 4");
        }
    }
    catch (error) {
        console.error(error);
    }
    },
};

export default AdminDashboard;