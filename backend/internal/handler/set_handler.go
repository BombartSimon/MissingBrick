package handler

import (
	"net/http"
	"strconv"

	"github.com/BombartSimon/MissingBrick/internal/service"
	"github.com/gin-gonic/gin"
)

// SetHandler handles HTTP requests for sets
type SetHandler struct {
	setService      service.SetService
	setPhotoService service.SetPhotoService
}

// NewSetHandler creates a new set handler
func NewSetHandler(setService service.SetService, setPhotoService service.SetPhotoService) *SetHandler {
	return &SetHandler{
		setService:      setService,
		setPhotoService: setPhotoService,
	}
}

// CreateSet handles POST /sets
func (h *SetHandler) CreateSet(c *gin.Context) {
	var req struct {
		SetNum string `json:"set_num" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	set, err := h.setService.CreateSetWithParts(req.SetNum)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusCreated, set)
}

// GetSetByID handles GET /sets/:id
func (h *SetHandler) GetSetByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid set ID"})
		return
	}

	set, err := h.setService.GetSetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Set not found"})
		return
	}

	c.JSON(http.StatusOK, set)
}

// GetSetBySetNum handles GET /sets/by-num/:setNum
func (h *SetHandler) GetSetBySetNum(c *gin.Context) {
	setNum := c.Param("setNum")

	set, err := h.setService.GetSetBySetNum(setNum)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Set not found"})
		return
	}

	c.JSON(http.StatusOK, set)
}

// GetAllSets handles GET /sets
func (h *SetHandler) GetAllSets(c *gin.Context) {
	sets, err := h.setService.GetAllSets()
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"sets": sets})
}

// UpdateSet handles PUT /sets/:id
func (h *SetHandler) UpdateSet(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid set ID"})
		return
	}

	// Get existing set
	set, err := h.setService.GetSetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Set not found"})
		return
	}

	// Bind JSON to update fields
	if err := c.ShouldBindJSON(set); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = h.setService.UpdateSet(set)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, set)
}

// DeleteSet handles DELETE /sets/:id
func (h *SetHandler) DeleteSet(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid set ID"})
		return
	}

	err = h.setService.DeleteSet(uint(id))
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Set deleted successfully"})
}

// SyncSetFromRebrickable handles POST /sets/sync
func (h *SetHandler) SyncSetFromRebrickable(c *gin.Context) {
	var req struct {
		SetNum string `json:"set_num" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	set, err := h.setService.SyncSetFromRebrickable(req.SetNum)
	if err != nil {
		writeError(c, err)
		return
	}

	c.JSON(http.StatusOK, set)
}

// GetSetWithMissingParts handles GET /sets/:id/missing-parts
func (h *SetHandler) GetSetWithMissingParts(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid set ID"})
		return
	}

	set, err := h.setService.GetSetWithMissingParts(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Set not found"})
		return
	}

	c.JSON(http.StatusOK, set)
}

// GetSetWithParts handles GET /sets/:id/parts
func (h *SetHandler) GetSetWithParts(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid set ID"})
		return
	}

	set, err := h.setService.GetSetWithParts(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Set not found"})
		return
	}

	c.JSON(http.StatusOK, set)
}

// UpdateSetNotes handles PUT /sets/:id/notes
func (h *SetHandler) UpdateSetNotes(c *gin.Context) {
	id, ok := parseUintParam(c, "id", "Invalid set ID")
	if !ok {
		return
	}
	var req service.UpdateSetNotesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	set, err := h.setService.UpdateSetNotes(id, req)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, set)
}

func (h *SetHandler) GetSetPhotos(c *gin.Context) {
	id, ok := parseUintParam(c, "id", "Invalid set ID")
	if !ok {
		return
	}
	photos, err := h.setPhotoService.GetPhotos(id)
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"photos": photos})
}

func (h *SetHandler) UploadSetPhoto(c *gin.Context) {
	id, ok := parseUintParam(c, "id", "Invalid set ID")
	if !ok {
		return
	}
	file, err := c.FormFile("photo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "photo file is required"})
		return
	}
	title := c.PostForm("title")
	isPrimary := c.PostForm("is_primary") == "true" || c.PostForm("is_primary") == "1"
	photo, err := h.setPhotoService.UploadPhoto(id, file, service.SetPhotoRequest{Title: &title, PhotoType: c.PostForm("photo_type"), IsPrimary: &isPrimary})
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, photo)
}

func (h *SetHandler) UpdateSetPhoto(c *gin.Context) {
	setID, ok := parseUintParam(c, "id", "Invalid set ID")
	if !ok {
		return
	}
	photoID, ok := parseUintParam(c, "photo_id", "Invalid photo ID")
	if !ok {
		return
	}
	var req struct {
		Title     *string `json:"title"`
		PhotoType string  `json:"photo_type"`
		IsPrimary *bool   `json:"is_primary"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	photo, err := h.setPhotoService.UpdatePhoto(setID, photoID, service.SetPhotoRequest{Title: req.Title, PhotoType: req.PhotoType, IsPrimary: req.IsPrimary})
	if err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, photo)
}

func (h *SetHandler) DeleteSetPhoto(c *gin.Context) {
	setID, ok := parseUintParam(c, "id", "Invalid set ID")
	if !ok {
		return
	}
	photoID, ok := parseUintParam(c, "photo_id", "Invalid photo ID")
	if !ok {
		return
	}
	if err := h.setPhotoService.DeletePhoto(setID, photoID); err != nil {
		writeError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Photo deleted successfully"})
}

func parseUintParam(c *gin.Context, name string, errorMessage string) (uint, bool) {
	value, err := strconv.ParseUint(c.Param(name), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": errorMessage})
		return 0, false
	}
	return uint(value), true
}
