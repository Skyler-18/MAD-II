const DeleteConfirmation = {
    template: `
        <div class="confirmation" v-if="show">
            <div class="dialog-box">
                <h2>{{message}}</h2>
                <button @click="confirm">Okay</button>
                <button @click="cancel">Cancel</button>
            </div>
        </div>
    `,

    props: {
        show: {
            type: Boolean,
            required: true,
        },
        message: {
            type:String,
            required: true,
        }
    },

    methods: {
        confirm() {
            this.$emit('confirm');
        },
        cancel() {
            this.$emit('cancel');
        },
    },

    async mounted() {
        const style = document.createElement("style");
        style.innerHTML = `
            .confirmation {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .dialog-box {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
        `;
        document.head.appendChild(style);
    },
};

export default DeleteConfirmation;