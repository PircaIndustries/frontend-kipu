import DocumentsPage from "../presentation/pages/DocumentsPage.vue";
import DocumentCreateDialog from "../presentation/components/DocumentCreateDialog.vue";
import SignatureDialog from "../presentation/components/SignatureDialog.vue";

const signaturesRoutes = [
    {
        path: "/signatures",
        component: DocumentsPage,
        name: "Signatures"
    }
]

export default signaturesRoutes;