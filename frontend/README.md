# MissingBrick Frontend

Frontend React TypeScript application for the MissingBrick LEGO set tracker.

## Tech Stack

- **Vite** - Build tool
- **React 18** - UI framework  
- **TypeScript** - Type safety
- **Axios** - HTTP client for API calls

## Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Page components 
├── services/          # API service layer
├── types/             # TypeScript type definitions
├── hooks/             # Custom React hooks
├── utils/             # Utility functions
└── styles/            # CSS/styling files
```

## Available Scripts

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Integration

The frontend is configured to proxy API calls to the Go backend running on `localhost:8080`.

### API Endpoints Available

- `GET /api/v1/sets` - Get all sets
- `POST /api/v1/sets/with-parts` - Create set with parts
- `GET /api/v1/sets/:id/with-parts` - Get set with parts
- `POST /api/v1/missing-parts` - Assign missing parts
- `GET /api/v1/missing-parts/:set_id` - Get missing parts

## Getting Started

1. Make sure the backend is running on port 8080
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open http://localhost:3000

## Environment Setup

The Vite proxy is configured to forward `/api` requests to `http://localhost:8080`.

No additional environment variables needed for development.

## Next Steps

1. Create page components (Sets list, Set details, Missing parts)
2. Build reusable UI components
3. Implement API integration with the service layer
4. Add routing with React Router
5. Style with CSS/styled-components
