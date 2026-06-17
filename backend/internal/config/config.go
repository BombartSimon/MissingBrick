package config

import "github.com/caarlos0/env/v11"

// Config holds all configuration for our application
type Config struct {
	DatabaseURL       string `env:"DATABASE_URL" envDefault:"missing_brick.db"`
	RebrickableAPIKey string `env:"REBRICKABLE_API_KEY"`
	Port              string `env:"PORT" envDefault:"8080"`
	CORSAllowedOrigin string `env:"CORS_ALLOWED_ORIGIN" envDefault:"*"`
	UploadsDir        string `env:"UPLOADS_DIR" envDefault:"uploads"`
	MaxUploadMB       int    `env:"MAX_UPLOAD_MB" envDefault:"8"`
}

// LoadConfig loads configuration from environment variables
func LoadConfig() (*Config, error) {
	config := &Config{}

	if err := env.Parse(config); err != nil {
		return nil, err
	}

	return config, nil
}
