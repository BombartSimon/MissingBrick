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
	return &MissingPartsHandler{missingPartsService: missingPartsService}
}

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
		writeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, missingParts)
}

func (h *MissingPartsHandler) GetMissingPartsBySetID(c *gin.Context) {
	setID, err := strconv.Atoi(c.Param("set_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid set ID"})
		return
	}
	missingParts, err := h.missingPartsService.GetMissingPartsBySetID(setID)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, missingParts)
}

func (h *MissingPartsHandler) GetAllMissingParts(c *gin.Context) {
	missingParts, err := h.missingPartsService.GetAllMissingParts()
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"missing_parts": missingParts})
}

func (h *MissingPartsHandler) GetShoppingList(c *gin.Context) {
	items, err := h.missingPartsService.GetShoppingList()
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}

func (h *MissingPartsHandler) UpdateMissingPart(c *gin.Context) {
	missingPartID, err := strconv.Atoi(c.Param("missing_part_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid missing part ID"})
		return
	}

	var req service.UpdateMissingPartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	missingPart, err := h.missingPartsService.UpdateMissingPart(missingPartID, req)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, missingPart)
}

func (h *MissingPartsHandler) DeleteMissingPart(c *gin.Context) {
	missingPartID, err := strconv.Atoi(c.Param("missing_part_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid missing part ID"})
		return
	}
	if err := h.missingPartsService.DeleteMissingPart(missingPartID); err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Missing part deleted successfully"})
}
