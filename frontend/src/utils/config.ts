// Environment configuration utility
export const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    apiVersion: import.meta.env.VITE_API_VERSION || 'v1',
    isDev: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV,
    rebrickableApiKey: import.meta.env.VITE_REBRICKABLE_API_KEY,
};

// Full API URL for reference
export const getApiUrl = () => `${config.apiBaseUrl}/api/${config.apiVersion}`;
export const getHealthUrl = () => `${config.apiBaseUrl}/health`;

// Debug function to log configuration in development
export const logConfig = () => {
    if (config.isDev) {
        console.log('🔧 API Configuration:', {
            baseUrl: config.apiBaseUrl,
            apiVersion: config.apiVersion,
            fullApiUrl: getApiUrl(),
            healthUrl: getHealthUrl(),
            isDev: config.isDev,
        });
    }
};

export default config;
