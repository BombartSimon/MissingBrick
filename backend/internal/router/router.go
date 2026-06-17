package router

import (
	"github.com/BombartSimon/MissingBrick/internal/handler"
	"github.com/gin-gonic/gin"
)

// Router holds all the handlers
type Router struct {
	setHandler          *handler.SetHandler
	setPartsHandler     *handler.SetPartsHandler
	missingPartsHandler *handler.MissingPartsHandler
	searchHandler       *handler.SearchHandler
	corsAllowedOrigin   string
	uploadsDir          string
}

// NewRouter creates a new router with all handlers
func NewRouter(setHandler *handler.SetHandler, setPartsHandler *handler.SetPartsHandler, missingPartsHandler *handler.MissingPartsHandler, searchHandler *handler.SearchHandler, corsAllowedOrigin string, uploadsDir string) *Router {
	return &Router{
		setHandler:          setHandler,
		setPartsHandler:     setPartsHandler,
		missingPartsHandler: missingPartsHandler,
		searchHandler:       searchHandler,
		corsAllowedOrigin:   corsAllowedOrigin,
		uploadsDir:          uploadsDir,
	}
}

// SetupRoutes configures all the routes
func (r *Router) SetupRoutes() *gin.Engine {
	router := gin.Default()

	router.Use(func(c *gin.Context) {
		allowedOrigin := r.corsAllowedOrigin
		if allowedOrigin == "" {
			allowedOrigin = "*"
		}
		c.Header("Access-Control-Allow-Origin", allowedOrigin)
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	if r.uploadsDir != "" {
		router.Static("/uploads", r.uploadsDir)
	}

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	v1 := router.Group("/api/v1")
	{
		sets := v1.Group("/sets")
		{
			sets.GET("", r.setHandler.GetAllSets)
			sets.GET("/:id", r.setHandler.GetSetByID)
			sets.GET("/by-num/:setNum", r.setHandler.GetSetBySetNum)
			sets.GET("/:id/missing-parts", r.setHandler.GetSetWithMissingParts)
			sets.GET("/:id/with-parts", r.setHandler.GetSetWithParts)
			sets.GET("/:id/photos", r.setHandler.GetSetPhotos)
			sets.POST("", r.setHandler.CreateSet)
			sets.POST("/sync", r.setHandler.SyncSetFromRebrickable)
			sets.POST("/:id/photos", r.setHandler.UploadSetPhoto)
			sets.PUT("/:id", r.setHandler.UpdateSet)
			sets.PUT("/:id/notes", r.setHandler.UpdateSetNotes)
			sets.PUT("/:id/photos/:photo_id", r.setHandler.UpdateSetPhoto)
			sets.DELETE("/:id", r.setHandler.DeleteSet)
			sets.DELETE("/:id/photos/:photo_id", r.setHandler.DeleteSetPhoto)
		}

		search := v1.Group("/search")
		{
			search.GET("/sets", r.searchHandler.SearchSets)
		}

		missingParts := v1.Group("/missing-parts")
		{
			missingParts.GET("", r.missingPartsHandler.GetAllMissingParts)
			missingParts.GET("/shopping-list", r.missingPartsHandler.GetShoppingList)
			missingParts.GET("/:set_id", r.missingPartsHandler.GetMissingPartsBySetID)
			missingParts.POST("", r.missingPartsHandler.AssignMissingPartsToSet)
			missingParts.PUT("/:missing_part_id", r.missingPartsHandler.UpdateMissingPart)
			missingParts.DELETE("/:missing_part_id", r.missingPartsHandler.DeleteMissingPart)
		}

		setParts := v1.Group("/set-parts")
		{
			setParts.GET("/:id", r.setPartsHandler.GetSetParts)
		}
	}

	return router
}
