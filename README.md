# 🚴 Cycling Community Website

A community platform for cycling enthusiasts — built with React.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v14+
- npm v6+ _(comes with Node.js)_
- [Git](https://git-scm.com/)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Indusaranie004/Cycling_Community_Website.git
cd Cycling_Community_Website
```

### 2. Switch to the development branch

```bash
git checkout dev2
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

### 5. Start the development server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start the development server |
| `npm run build` | Build for production |
| `npm test` | Run tests |

---

## Project Structure

```
Cycling_Community_Website/
├── public/               # Static assets
└── src/
    ├── components/       # Reusable React components
    ├── pages/            # Page-level components
    ├── styles/           # CSS/SCSS files
    ├── App.js            # Root component
    └── index.js          # Entry point
```

---

## Troubleshooting

**Port 3000 already in use**
```bash
npm start -- --port 3001
```

**Dependencies not installing**
```bash
npm cache clean --force
npm install
```

**Module not found errors**
```bash
rm -rf node_modules
npm install
```

---

## Contributing

1. Branch off from `dev2`: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m "Add your feature"`
3. Push and open a PR targeting `dev2`

---

## Support

Open an issue in the repository or reach out to the project maintainers.