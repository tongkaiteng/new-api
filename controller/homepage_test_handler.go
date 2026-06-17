package controller

import (
	"net/http"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/service"
	"github.com/gin-gonic/gin"
)

type homepageTestRequest struct {
	ApiAddress     string `json:"api_address"`
	ApiKey         string `json:"api_key"`
	Model          string `json:"model"`
	RefModel       string `json:"ref_model"`
	CacheDetection bool   `json:"cache_detection"`
}

func HomepageTest(c *gin.Context) {
	var payload homepageTestRequest
	if err := c.ShouldBindJSON(&payload); err != nil {
		common.ApiError(c, err)
		return
	}
	if payload.ApiAddress == "" || payload.ApiKey == "" || payload.Model == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "api_address, api_key, and model are required",
		})
		return
	}

	result := service.RunHomepageTest(service.HomepageTestRequest{
		ApiAddress:     payload.ApiAddress,
		ApiKey:         payload.ApiKey,
		Model:          payload.Model,
		RefModel:       payload.RefModel,
		CacheDetection: payload.CacheDetection,
	})

	common.ApiSuccess(c, result)
}
