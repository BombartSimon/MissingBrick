package handler

import (
	"errors"
	"net/http"

	"github.com/BombartSimon/MissingBrick/internal/service"
	"github.com/gin-gonic/gin"
)

func writeError(c *gin.Context, err error) {
	status := http.StatusInternalServerError
	message := err.Error()

	switch {
	case errors.Is(err, service.ErrInvalidInput):
		status = http.StatusBadRequest
	case errors.Is(err, service.ErrNotFound), errors.Is(err, service.ErrUpstreamNotFound):
		status = http.StatusNotFound
	case errors.Is(err, service.ErrConflict):
		status = http.StatusConflict
	case errors.Is(err, service.ErrUpstreamRateLimited):
		status = http.StatusTooManyRequests
	case errors.Is(err, service.ErrUpstreamUnavailable):
		status = http.StatusBadGateway
	}

	c.JSON(status, gin.H{"error": message})
}
