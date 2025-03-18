# Weather Proxy Server Setup

This server acts as a secure proxy for OpenWeather API requests, keeping the API key secure on the backend.

## Local Development

1. Install dependencies:
```bash
cd server
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Add your configuration to `.env`:
```bash
WEATHER_API_KEY=your_api_key_here
PORT=3000
ALLOWED_ORIGINS=http://localhost:5500,https://yourusername.github.io
```

4. Start the server:
```bash
npm run dev
```

## Deployment Instructions

### Backend Deployment (Render.com)

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Configure the service:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables:
     - `WEATHER_API_KEY`: Your OpenWeather API key
     - `ALLOWED_ORIGINS`: Your GitHub Pages URL (e.g., https://yourusername.github.io)

### Frontend Deployment (GitHub Pages)

1. Update the API URL in weather.html:
   ```javascript
   API_BASE_URL: location.hostname === 'localhost' || location.hostname === '127.0.0.1'
       ? 'http://localhost:3000/api'
       : 'https://your-render-app.onrender.com/api'
   ```
   Replace `your-render-app.onrender.com` with your actual Render.com domain.

2. Update Content-Security-Policy in weather.html to include your Render.com domain.

3. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Update for production deployment"
   git push
   ```

4. Enable GitHub Pages:
   - Go to your repository settings
   - Navigate to "Pages"
   - Choose your branch and save
   - Your site will be available at https://yourusername.github.io/repository-name

## Security Features

- API key is secured in backend environment variables
- CORS is configured to only allow requests from specified origins
- Input validation on all endpoints
- Error handling for API failures
- HTTPS-only in production

## API Endpoints

- GET `/api/weather/:city` - Current weather
- GET `/api/forecast/:city` - Weather forecast

Both endpoints require `lat` and `lon` query parameters.