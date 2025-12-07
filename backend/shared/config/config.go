package config

import (
	"os"
)

type Config struct {
	Port        string
	RedisURL    string
	DatabaseURL string
}

func Load() *Config {
	return &Config{
		Port:        getEnv("PORT", "8080"),
		RedisURL:    getEnv("REDIS_URL", "localhost:6379"),
		DatabaseURL: getEnv("DATABASE_URL", "postgres://hydrox:hydrox_secret@localhost:5432/hydrox?sslmode=disable"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

