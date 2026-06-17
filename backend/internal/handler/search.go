package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/BombartSimon/MissingBrick/internal/service"
	"github.com/gin-gonic/gin"
)

type SearchHandler struct {
	rebrickableService service.RebrickableService
}

func NewSearchHandler(rebrickableService service.RebrickableService) *SearchHandler {
	return &SearchHandler{rebrickableService: rebrickableService}
}

func (h *SearchHandler) SearchSets(c *gin.Context) {
	searchTerm := strings.TrimSpace(c.Query("search"))
	if len(searchTerm) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "search parameter must contain at least 2 characters"})
		return
	}

	page := parsePositiveQueryInt(c, "page", 1)
	pageSize := parsePositiveQueryInt(c, "page_size", 20)
	if pageSize > 100 {
		pageSize = 100
	}

	results, err := h.rebrickableService.SearchSets(searchTerm, page, pageSize)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, results)
}

func parsePositiveQueryInt(c *gin.Context, key string, fallback int) int {
	value := c.Query(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(value)
	if err != nil || parsed < 1 {
		return fallback
	}
	return parsed
}
