package controller

import (
	"net/http"
	"strconv"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

type submitFreeApiKeyPayload struct {
	ApiAddress string `json:"api_address"`
	Protocol   int    `json:"protocol"`
	ApiKey     string `json:"api_key"`
	Models     string `json:"models"`
	Note       string `json:"note"`
}

func SubmitFreeApiKey(c *gin.Context) {
	userId := c.GetInt("id")
	if userId == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "sign in required"})
		return
	}

	var payload submitFreeApiKeyPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		common.ApiError(c, err)
		return
	}
	if payload.ApiAddress == "" || payload.ApiKey == "" || payload.Models == "" {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "api_address, api_key, and models are required"})
		return
	}
	if payload.Protocol < 1 || payload.Protocol > 4 {
		payload.Protocol = model.FreeApiKeyProtocolOpenAI
	}

	ak := &model.FreeTokenApiKey{
		UserId:     userId,
		ApiAddress: payload.ApiAddress,
		Protocol:   payload.Protocol,
		ApiKey:     payload.ApiKey,
		Models:     payload.Models,
		Note:       payload.Note,
	}
	if err := ak.Insert(); err != nil {
		common.ApiError(c, err)
		return
	}

	// Reward submitter
	reward := common.FreeApiKeySubmitReward
	if reward > 0 {
		var user model.User
		if err := model.DB.Where("id = ?", userId).First(&user).Error; err == nil {
			user.Quota += reward
			model.DB.Model(&user).Update("quota", user.Quota)
		}
	}

	common.ApiSuccess(c, ak)
}

func GetFreeApiKeys(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("p", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	keyword := c.Query("keyword")
	protocol, _ := strconv.Atoi(c.DefaultQuery("protocol", "0"))
	userId := c.GetInt("id")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	items, total, err := model.GetFreeTokenApiKeysPublic(page, pageSize, keyword, protocol, userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if items == nil {
		items = []*model.FreeTokenApiKeyPublic{}
	}

	common.ApiSuccess(c, gin.H{
		"items":     items,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func GetClaimedFreeApiKeys(c *gin.Context) {
	userId := c.GetInt("id")
	if userId == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "sign in required"})
		return
	}
	items, err := model.GetUserClaimedFreeApiKeys(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if items == nil {
		items = []*model.FreeTokenApiKeyPublic{}
	}
	common.ApiSuccess(c, items)
}

func ClaimFreeApiKey(c *gin.Context) {
	userId := c.GetInt("id")
	if userId == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "sign in required"})
		return
	}

	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}

	result, err := model.ClaimFreeTokenApiKey(userId, id)
	if err != nil {
		switch err {
		case model.ErrFreeApiKeyNotFound:
			c.JSON(http.StatusOK, gin.H{"success": false, "message": "api key not found"})
		case model.ErrFreeApiKeyOwnSubmission:
			c.JSON(http.StatusOK, gin.H{"success": false, "message": "cannot claim your own submission"})
		case model.ErrFreeApiKeyAlreadyClaimed:
			c.JSON(http.StatusOK, gin.H{"success": false, "message": "already claimed"})
		default:
			common.ApiError(c, err)
		}
		return
	}

	common.ApiSuccess(c, result)
}
