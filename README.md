# BITS Pilani VFAST Admin

A modern, production-ready React admin dashboard template for BITS Pilani VFAST, built with:

- **React 18** + **TypeScript**
- **Vite 5** (blazing fast build tool)
- **Ant Design v5** (UI library)
- **React Router v6** (routing)
- **Zustand v4** (state management)
- **Ant Design Charts** (data visualization)

## ✨ Features

- Out-of-the-box development experience
- Built-in layout: Sidebar, Header, Content, Breadcrumb, Footer
- Automatic route importing (supports nested routes)
- Theme switching (light/dark)
- State management with Zustand
- Authentication-ready structure
- Responsive design
- Easy to extend with new components/pages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm (comes with Node.js)

### Installation

```sh
git clone https://github.com/2024h1120192p/vfast-admin-react.git
cd vfast-admin-react
npm install
```

### Local Development

```sh
npm run dev
```

### Production Build

```sh
npm run build
```

## 📁 Folder Structure

```
├── public/                # Static assets
├── src/
│   ├── assets/            # Images, icons, etc.
│   ├── components/        # Reusable UI components
│   ├── router/            # Route definitions
│   ├── store/             # Zustand stores
│   ├── utils/             # Utility functions
│   └── views/             # Page components
├── package.json           # Project metadata & scripts
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite config
└── README.md              # Project documentation
```

## 🔒 Authentication
- Structure in place for login, registration, and permission management (see `src/views/auth/` and `src/components/ProtectedRoute.tsx`).

## 📋 Todos

- [x] Support login
- [x] Theme switching support
- [ ] Improve documentation
- [ ] Encapsulate state management
- [ ] Add more components and pages

## 🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## 📄 License

This project is licensed under the MIT License.
