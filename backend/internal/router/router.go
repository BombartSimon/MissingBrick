package router

import (
	"github.com/BombartSimon/MissingBrick/internal/handler"
	"github.com/gin-gonic/gin"
)

// Router holds all the handlers
type Router struct {
	setHandler          *handler.SetHandler
	missingPartsHandler *handler.MissingPartsHandler
}

// NewRouter creates a new router with all handlers
func NewRouter(setHandler *handler.SetHandler, missingPartsHandler *handler.MissingPartsHandler) *Router {
	return &Router{
		setHandler:          setHandler,
		missingPartsHandler: missingPartsHandler,
	}
}

// SetupRoutes configures all the routes
func (r *Router) SetupRoutes() *gin.Engine {
	router := gin.Default()

	// Add CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1 group
	v1 := router.Group("/api/v1")
	{
		// Set routes
		sets := v1.Group("/sets")
		{
			// GET
			sets.GET("", r.setHandler.GetAllSets)
			sets.GET("/:id", r.setHandler.GetSetByID)
			sets.GET("/by-num/:setNum", r.setHandler.GetSetBySetNum)
			sets.GET("/:id/missing-parts", r.setHandler.GetSetWithMissingParts)
			sets.GET("/:id/with-parts", r.setHandler.GetSetWithParts)
			// POST
			sets.POST("", r.setHandler.CreateSet)
			sets.POST("/sync", r.setHandler.SyncSetFromRebrickable)
			// PUT
			sets.PUT("/:id", r.setHandler.UpdateSet)
			// DELETE
			sets.DELETE("/:id", r.setHandler.DeleteSet)
		}

		// Missing Parts routes
		missingParts := v1.Group("/missing-parts")
		{
			// POST
			missingParts.POST("", r.missingPartsHandler.AssignMissingPartsToSet)
			// GET
			missingParts.GET("/:set_id", r.missingPartsHandler.GetMissingPartsBySetID)
		}

		// TODO: Add part routes
		// parts := v1.Group("/parts")
		// {
		//     parts.GET("", r.partHandler.GetAllParts)
		//     parts.POST("", r.partHandler.CreatePart)
		//     parts.GET("/:id", r.partHandler.GetPartByID)
		//     parts.PUT("/:id", r.partHandler.UpdatePart)
		//     parts.DELETE("/:id", r.partHandler.DeletePart)
		//     parts.GET("/search", r.partHandler.SearchParts)
		// }

		// TODO: Add missing part routes
		// missingParts := v1.Group("/missing-parts")
		// {
		//     missingParts.GET("", r.missingPartHandler.GetAllMissingParts)
		//     missingParts.POST("", r.missingPartHandler.CreateMissingPart)
		//     missingParts.GET("/:id", r.missingPartHandler.GetMissingPartByID)
		//     missingParts.PUT("/:id", r.missingPartHandler.UpdateMissingPart)
		//     missingParts.DELETE("/:id", r.missingPartHandler.DeleteMissingPart)
		//     missingParts.PUT("/:id/found", r.missingPartHandler.MarkAsFound)
		//     missingParts.PUT("/:id/missing", r.missingPartHandler.MarkAsMissing)
		//     missingParts.GET("/set/:setId", r.missingPartHandler.GetMissingPartsBySetID)
		// }
	}

	return router
}
