# Kipu: Frontend Web App

Frontend web application for the **Kipu - Construction Management Platform**. This project serves as the user interface for Kipu, allowing construction teams to manage materials, track inventory, coordinate suppliers, request materials, and handle waste management.

## 🚀 Quick Start

### Prerequisites
*   **Node.js** (v16.x or higher)
*   **npm** (usually comes with Node.js) or **yarn**

### Installation
1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd frontend-kipu
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Configure environment variables:
    Copy the sample environment file and fill in the required values:
    ```bash
    cp .env.example .env
    # Edit .env with your API URLs and keys
    ```

### Running the Application
Start the development server:
```bash
npm run dev
# or
yarn dev
```

Access the application at `http://localhost:5173` (or the port shown in the terminal).

## 🏗️ Project Structure

```
frontend-kipu/
├── src/
│   ├── api/             # API configuration and Axios instances
│   ├── assets/          # Static assets (images, fonts, etc.)
│   ├── components/      # Reusable UI components
│   │   ├── auth/        # Authentication components
│   │   ├── common/      # General UI elements (buttons, modals)
│   │   └── specific/    # Feature-specific components
│   ├── layouts/         # Page layouts (sidebar, header)
│   ├── pages/           # Main application pages
│   │   ├── auth/        # Authentication pages
│   │   ├── catalog/     # Category and material management
│   │   ├── inventory/   # Inventory tracking
│   │   ├── suppliers/   # Supplier and offer management
│   │   ├── requests/    # Material requests
│   │   ├── machinery/   # Machinery management
│   │   └── user/        # User profile and team management
│   ├── router/          # Vue Router configuration
│   ├── store/           # Pinia state management
│   │   ├── auth/        # Auth store
│   │   ├── categories/  # Category store
│   │   ├── materials/   # Material store
│   │   └── ...          # Other feature stores
│   ├── utils/           # Utility functions
│   └── App.vue          # Root component
├── public/              # Public assets
├── .env                 # Environment variables
└── vite.config.js       # Vite build configuration
```

## 🔌 API Configuration

Environment variables control API connections. Key variables in `.env`:

*   `VITE_API_KIPU_BASEURL`: Production API URL
*   `VITE_API_KIPU_BASEURL_LOCAL`: Local development API URL
*   `VITE_API_TEST`: Test mode flag

API endpoints are defined in `src/api/api.js`.

## 🔐 Authentication

Authentication is managed using **Pinia** and **Axios interceptors**.

*   **Login**: Supports email/password and OAuth (Google, Microsoft).
*   **Token Management**: JWT tokens are stored in `localStorage`.
*   **Guards**: Route guards in `src/router/index.js` protect authenticated routes.

## 🧩 Key Features

*   **Material Catalog**: View and manage material categories and items.
*   **Inventory Management**: Track material stock levels and movements.
*   **Supplier Management**: Manage supplier information and offers.
*   **Material Requests**: Create and track material requests.
*   **Machinery Management**: Track machinery assignments and usage.
*   **Team Management**: Manage team users and their roles.

## 🛠️ Development

### Adding Components
New components should be created in `src/components/`:
```bash
# Create a new component
mkdir -p src/components/new-feature
```

### Adding Pages
Pages should be created in `src/pages/`:
```bash
# Create a new page
mkdir -p src/pages/new-feature
```

### State Management
Use Pinia stores in `src/store/` for state management:
```bash
# Create a new store
mkdir -p src/store/new-feature
```

### Routing
Update `src/router/index.js` to add new routes.

### API Integration
Add new API endpoints in `src/api/api.js` or create new API service files.

## 🧪 Testing

Unit tests are configured with **Vitest** and **Vue Test Utils**.

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Run coverage
npm test:coverage
```

## 🔄 Deployment

### Build
Build the production bundle:
```bash
npm run build
# or
yarn build
```
The build output will be in the `dist/` directory.

### Preview
Preview the production build locally:
```bash
npm run preview
# or
yarn preview
```

### Netlify Deployment
This project supports one-command deployment to Netlify:
```bash
npm run deploy
# or
yarn deploy
```

## 📚 Documentation

*   [API Documentation](#api-configuration)
*   [Component Structure](#-project-structure)
*   [State Management](#state-management)
*   [Routing](#routing)
*   [Testing](#testing)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ using Vue 3 and Vite*
