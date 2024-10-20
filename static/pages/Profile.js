const Profile = {
    template: `
        <div>
            Welcome {{email}}, having role: {{role}}
        </div>
    `,
    data() {
        return {
            email: localStorage.getItem("email"),
            role: localStorage.getItem("role"),
            id: localStorage.getItem("id"),
        };
    },
};

export default Profile;