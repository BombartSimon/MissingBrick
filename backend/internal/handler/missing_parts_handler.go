package handler

import (
	"net/http"
	"strconv"

	"github.com/BombartSimon/MissingBrick/internal/service"
	"github.com/gin-gonic/gin"
)

type MissingPartsHandler struct {
	missingPartsService service.MissingPartsService
}

func NewMissingPartsHandler(missingPartsService service.MissingPartsService) *MissingPartsHandler {
	return &MissingPartsHandler{
		missingPartsService: missingPartsService,
	}
}

// AssignMissingPartsToSet handles the assignment of missing parts to a set with specific quantities
func (h *MissingPartsHandler) AssignMissingPartsToSet(c *gin.Context) {
	var req struct {
		SetID        int                          `json:"set_id" binding:"required"`
		PartRequests []service.MissingPartRequest `json:"part_requests" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	missingParts, err := h.missingPartsService.AssignMissingPartsToSet(req.SetID, req.PartRequests)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, missingParts)
}

// GetMissingPartsBySetID handles GET
func (h *MissingPartsHandler) GetMissingPartsBySetID(c *gin.Context) {
	setIDStr := c.Param("set_id")
	setID, err := strconv.Atoi(setIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid set ID"})
		return
	}

	missingParts, err := h.missingPartsService.GetMissingPartsBySetID(setID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, missingParts)
}
