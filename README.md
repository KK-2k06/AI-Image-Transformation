# Toonify

A React application for transforming images into various cartoon and artistic styles.

## Features

- 🎨 Multiple art style transformations
- 🔐 User authentication (Sign In / Sign Up)
- 📱 Responsive design
- 🎭 Interactive dashboard

## Tech Stack

- **React** 18.3.1
- **Vite** 5.4.0
- **Tailwind CSS** (for styling)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd toonify
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### Build

Build for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
toonify/
├── src/
│   ├── components/      # React components
│   │   ├── Dashboard.jsx
│   │   ├── LandingPage.jsx
│   │   ├── SignInPage.jsx
│   │   └── SignUpPage.jsx
│   ├── data/           # Data files
│   │   └── stylesData.js
│   ├── images/         # Image assets
│   ├── bgimages/       # Background images
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── index.html
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

This project is private and not licensed for public use.

