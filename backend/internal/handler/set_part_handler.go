package handler

import (
	"net/http"
	"strconv"

	"github.com/BombartSimon/MissingBrick/internal/entity"
	"github.com/BombartSimon/MissingBrick/internal/service"
	"github.com/gin-gonic/gin"
)

// SetPartHandler handles HTTP requests for set parts
type SetPartHandler struct {
	setPartService service.SetPartService
}

// NewSetPartHandler creates a new set part handler
func NewSetPartHandler(setPartService service.SetPartService) *SetPartHandler {
	return &SetPartHandler{
		setPartService: setPartService,
	}
}

// GetSetParts handles GET /sets/:id/parts
func (h *SetPartHandler) GetSetParts(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid set ID"})
		return
	}

	setParts, err := h.setPartService.GetSetParts(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"set_parts": setParts})
}

// SyncSetParts handles POST /sets/:id/sync-parts
func (h *SetPartHandler) SyncSetParts(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid set ID"})
		return
	}

	var req struct {
		SetNum string `json:"set_num" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.setPartService.ReplaceSetParts(uint(id), req.SetNum)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Set parts synchronized successfully"})
}

// CreateSetPart handles POST /set-parts
func (h *SetPartHandler) CreateSetPart(c *gin.Context) {
	var req struct {
		SetID     uint   `json:"set_id" binding:"required"`
		PartID    uint   `json:"part_id" binding:"required"`
		ColorID   int    `json:"color_id" binding:"required"`
		ColorName string `json:"color_name"`
		ColorHex  string `json:"color_hex"`
		Quantity  int    `json:"quantity" binding:"required"`
		IsSpare   bool   `json:"is_spare"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	setPart := &entity.SetPart{
		SetID:     req.SetID,
		PartID:    req.PartID,
		ColorID:   req.ColorID,
		ColorName: req.ColorName,
		ColorHex:  req.ColorHex,
		Quantity:  req.Quantity,
		IsSpare:   req.IsSpare,
	}

	err := h.setPartService.CreateSetPart(setPart)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, setPart)
}
