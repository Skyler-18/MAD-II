const AddCampaign = {
    template: `<div>      
    <h2>Add Campaign</h2>      
    <form @submit.prevent="submitForm">        
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

        <button type="submit">Add Campaign</button>      
    </form>    
    </div>`,   
    data() {      
        return {        
            name: "",        
            description: "",        
            start_date: "",        
            end_date: "",        
            budget: "",        
            visibility: "",        
            sponsor_id: "",        
            goals: "",      
        };    
    },    
    methods: {      
        submitForm() {    
            // console.log("Submitted");    
            const backendUrl = window.location.origin + "/api/campaigns"; // Replace with your backend URL          
            // Prepare data for POST request        
            const postData = {          
                name: this.name,          
                description: this.description,          
                start_date: this.start_date,          
                end_date: this.end_date,          
                budget: this.budget,          
                visibility: this.visibility,          
                sponsor_id: this.sponsor_id,          
                goals: this.goals,        
            };      

            // console.log(postData);
            // console.log(localStorage.getItem("token"));
            // console.log(sessionStorage.getItem("token"));
            // console.log(backendUrl);
            // console.log(postData);

            // Fetch API POST request        
            fetch(backendUrl, {          
                method: "POST",          
                headers: {            
                    "Content-Type": "application/json",            
                    "Authentication-Token": sessionStorage.getItem("token"),          
                },          
                body: JSON.stringify(postData),        
            })          
            .then((response) => {            
                if (!response.ok) {      
                    if (response.status === 401) {
                        throw new Error("Unauthorized: Invalid authentication token");
                    }        
                    throw new Error("Network response was not ok");            
                }            
                return response.json();          
            })          
            .then((data) => {            
                console.log("Resource added:", data);            
                // Optionally show success message or redirect          
            })          
            .catch((error) => {            
                console.error("Error adding resource:", error);            
                // Handle error, show error message, etc.          
            });        
        },    
    },    
};    
export default AddCampaign;
