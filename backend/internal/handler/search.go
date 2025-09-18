package handler

import (
	"net/http"
	"strconv"

	"github.com/BombartSimon/MissingBrick/internal/service"
	"github.com/gin-gonic/gin"
)

type SearchHandler struct {
	rebrickableService service.RebrickableService
}

func NewSearchHandler(rebrickableService service.RebrickableService) *SearchHandler {
	return &SearchHandler{
		rebrickableService: rebrickableService,
	}
}

func (h *SearchHandler) SearchSets(c *gin.Context) {
	searchTerm := c.Query("search")
	if searchTerm == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "search parameter is required"})
		return
	}

	// Optional parameters
	page := 1
	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil {
			page = parsed
		}
	}

	pageSize := 20
	if ps := c.Query("page_size"); ps != "" {
		if parsed, err := strconv.Atoi(ps); err == nil {
			pageSize = parsed
		}
	}

	results, err := h.rebrickableService.SearchSets(searchTerm, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search sets"})
		return
	}

	c.JSON(http.StatusOK, results)
}
