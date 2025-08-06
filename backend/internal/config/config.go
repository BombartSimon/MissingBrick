package config

import "github.com/caarlos0/env/v11"

// Config holds all configuration for our application
type Config struct {
	DatabaseURL       string `env:"DATABASE_URL"`
	RebrickableAPIKey string `env:"REBRICKABLE_API_KEY"`
	Port              string `env:"PORT"`
}

// LoadConfig loads configuration from environment variables
func LoadConfig() (*Config, error) {
	config := &Config{}

	if err := env.Parse(config); err != nil {
		return nil, err
	}

	return config, nil
}
