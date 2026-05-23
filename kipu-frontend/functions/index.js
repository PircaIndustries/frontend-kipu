const functions = require("firebase-functions");
const jsonServer = require("json-server");
const path = require("path");

// Cargar tu db.json
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "kipudb.json"));
const middlewares = jsonServer.defaults();

// Configurar json-server con tus rutas personalizadas
const rewriter = jsonServer.rewriter({
    "/api/v1/logistics/materials": "/materialsCatalog",
    "/api/v1/logistics/categories": "/categoriesCatalog",
    "/api/v1/logistics/supplierOffer": "/supplierOffers",
    "/api/v1/logistics/requests": "/materialsRequests",
    "/api/v1/logistics/inventory": "/materialsInventory",
    "/api/v1/logistics/waste": "/materialsWaste",
    "/apu/v1/logistics/machinery": "/machineryCatalog",
    "/api/v1/logistics/machineryAssignment": "/machineryAssignments",
    "/api/v1/logistics/suppliers": "/materialsSuppliers",
    "/api/v1/logistics/materials/:id": "/materialsCatalog/:id",
    "/api/v1/logistics/categories/:id": "/categoriesCatalog/:id",
    "/api/v1/logistics/supplierOffer/:id": "/supplierOffers/:id",
    "/api/v1/logistics/requests/:id": "/materialsRequests/:id",
    "/api/v1/logistics/inventory/:id": "/materialsInventory/:id",
    "/api/v1/logistics/waste/:id": "/materialsWaste/:id",
    "/apu/v1/logistics/machinery/:id": "/machineryCatalog/:id",
    "/api/v1/logistics/machineryAssignment/:id": "/machineryAssignments/:id",
    "/api/v1/logistics/suppliers/:id": "/materialsSuppliers/:id",
    "/api/v1/identities": "/identities",
    "/api/v1/projects": "/projects",
    "/api/v1/budget": "/budgets",
    "/api/v1/ncr": "/ncr",
    "/api/v1/team/users": "/team-users",
    "/api/v1/team/workers": "/team-workers",
    "/api/v1/team": "/team",
    "/api/v1/documents": "/documents",
    "/api/v1/*": "/$1"
});

server.use(middlewares);
server.use(rewriter);
server.use(router);

// Exportar como Cloud Function
exports.fakeApi = functions.https.onRequest(server);