package controller

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
	"github.com/samber/lo"
	"github.com/tidwall/gjson"
)

func extractFirstModel(models string) string {
	parts := strings.Split(models, ",")
	if len(parts) == 0 {
		return ""
	}
	return strings.TrimSpace(parts[0])
}

// detectFreeApiKeyEndpoint determines the request path and body type from the model name,
// following the same logic as buildTestRequest in channel-test.go.
func detectFreeApiKeyEndpoint(firstModel string) (path string, body any) {
	firstModel = strings.TrimSpace(firstModel)

	// Rerank models
	if strings.Contains(strings.ToLower(firstModel), "rerank") {
		return "/v1/rerank", &dto.RerankRequest{
			Model:     firstModel,
			Query:     "What is Deep Learning?",
			Documents: []any{"Deep Learning is a subset of machine learning.", "Machine learning is a field of artificial intelligence."},
			TopN:      lo.ToPtr(2),
		}
	}

	// Embedding models
	if strings.Contains(strings.ToLower(firstModel), "embedding") ||
		strings.HasPrefix(firstModel, "m3e") ||
		strings.Contains(firstModel, "bge-") ||
		strings.Contains(firstModel, "embed") {
		return "/v1/embeddings", &dto.EmbeddingRequest{
			Model: firstModel,
			Input: []any{"hello world"},
		}
	}

	// Image generation models
	if strings.Contains(firstModel, "seedream") ||
		strings.Contains(strings.ToLower(firstModel), "dall-e") {
		return "/v1/images/generations", &dto.ImageRequest{
			Model:  firstModel,
			Prompt: "a cute cat",
			N:      lo.ToPtr(uint(1)),
			Size:   "1024x1024",
		}
	}

	// Responses-only models (e.g. codex series)
	if strings.Contains(strings.ToLower(firstModel), "codex") {
		return "/v1/responses", &dto.OpenAIResponsesRequest{
			Model: firstModel,
			Input: json.RawMessage(`[{"role":"user","content":"hi"}]`),
		}
	}

	// Default: chat/completions
	maxTokens := uint(16)
	if strings.Contains(strings.ToLower(firstModel), "gemini") {
		maxTokens = 3000
	} else if strings.Contains(firstModel, "thinking") || dto.IsOpenAIReasoningOModel(firstModel) {
		maxTokens = 50
	}
	return "/v1/chat/completions", &dto.GeneralOpenAIRequest{
		Model:  firstModel,
		Stream: lo.ToPtr(false),
		Messages: []dto.Message{
			{Role: "user", Content: "hi"},
		},
		MaxTokens: lo.ToPtr(maxTokens),
	}
}

func testFreeApiKeyConnectivity(apiAddress string, protocol int, apiKey string, firstModel string) error {
	// Strip trailing slash
	apiAddress = strings.TrimSuffix(apiAddress, "/")
	// Detect endpoint path and build proper test request based on model type
	requestPath, requestBody := detectFreeApiKeyEndpoint(firstModel)

	// Handle protocol-specific path overrides for non-OpenAI protocols
	switch protocol {
	case model.FreeApiKeyProtocolAnthropic:
		// Anthropic protocol uses /v1/messages with Messages-format body
		requestPath = "/v1/messages"
		requestBody = &dto.GeneralOpenAIRequest{
			Model:  firstModel,
			Stream: lo.ToPtr(false),
			Messages: []dto.Message{
				{Role: "user", Content: "hi"},
			},
			MaxTokens: lo.ToPtr(uint(16)),
		}
	case model.FreeApiKeyProtocolGemini:
		// Gemini protocol uses /v1beta/models/{model}:generateContent
		requestPath = fmt.Sprintf("/v1beta/models/%s:generateContent", firstModel)
		requestBody = &dto.GeneralOpenAIRequest{
			Model:  firstModel,
			Stream: lo.ToPtr(false),
			Messages: []dto.Message{
				{Role: "user", Content: "hi"},
			},
			MaxTokens: lo.ToPtr(uint(16)),
		}
	case model.FreeApiKeyProtocolCustom:
		return nil // Skip test for custom protocol
	}

	jsonBody, err := common.Marshal(requestBody)
	if err != nil {
		return fmt.Errorf("连接不可用")
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	req, err := http.NewRequest("POST", apiAddress+requestPath, bytes.NewReader(jsonBody))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	// Set auth header per protocol
	switch protocol {
	case model.FreeApiKeyProtocolOpenAI:
		req.Header.Set("Authorization", "Bearer "+apiKey)
	case model.FreeApiKeyProtocolAnthropic:
		req.Header.Set("x-api-key", apiKey)
		req.Header.Set("anthropic-version", "2023-06-01")
	case model.FreeApiKeyProtocolGemini:
		req.Header.Set("x-goog-api-key", apiKey)
	}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("API地址不可用")
	}
	defer resp.Body.Close()

	// Read and validate response body
	respBody, err := io.ReadAll(io.LimitReader(resp.Body, 8<<10))
	if err != nil {
		return fmt.Errorf("API地址不可用")
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		switch resp.StatusCode {
		case http.StatusUnauthorized, http.StatusForbidden:
			return fmt.Errorf("API密钥不正确")
		case http.StatusBadRequest, http.StatusNotFound:
			return fmt.Errorf("模型不正确")
		default:
			if errMsg := detectFreeApiKeyError(respBody); errMsg != nil {
				return errMsg
			}
			return fmt.Errorf("连接不可用")
		}
	}

	// Check for error in response body even with 2xx status
	if errMsg := detectFreeApiKeyError(respBody); errMsg != nil {
		return fmt.Errorf("模型不正确")
	}

	if len(bytes.TrimSpace(respBody)) == 0 || !isValidAiResponse(respBody) {
		return fmt.Errorf("连接不可用")
	}

	return nil
	}

	func detectFreeApiKeyError(respBody []byte) error {
		b := bytes.TrimSpace(respBody)
		if len(b) == 0 || (b[0] != '{' && b[0] != '[') {
			return nil
		}
		errVal := gjson.GetBytes(b, "error")
		if !errVal.Exists() || errVal.Type == gjson.Null {
			return nil
		}
		message := gjson.GetBytes(b, "error.message").String()
		if message == "" {
			message = gjson.GetBytes(b, "error.error.message").String()
		}
		if message == "" && errVal.Type == gjson.String {
			message = errVal.String()
		}
		if message == "" {
			message = errVal.Raw
		}
		return fmt.Errorf("upstream error: %s", strings.TrimSpace(message))
	}

	func isValidAiResponse(respBody []byte) bool {
		b := bytes.TrimSpace(respBody)
		if len(b) == 0 || (b[0] != '{' && b[0] != '[') {
			return false
		}
		return gjson.GetBytes(b, "choices").Exists() ||
			gjson.GetBytes(b, "content").Exists() ||
			gjson.GetBytes(b, "data").Exists() ||
			gjson.GetBytes(b, "results").Exists() ||
			gjson.GetBytes(b, "candidates").Exists() ||
			gjson.GetBytes(b, "output").Exists() ||
			gjson.GetBytes(b, "type").String() == "message"
	}

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

	// Check if this API key has already been shared
	if shared, err := model.IsFreeApiKeyAlreadyShared(payload.ApiKey); err != nil {
		common.ApiError(c, err)
		return
	} else if shared {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "该 API Key 已被分享"})
		return
	}

	// Test connectivity (skip for Custom protocol)
	if payload.Protocol != model.FreeApiKeyProtocolCustom {
		firstModel := extractFirstModel(payload.Models)
		testErr := testFreeApiKeyConnectivity(payload.ApiAddress, payload.Protocol, payload.ApiKey, firstModel)
		if testErr != nil {
			c.JSON(http.StatusOK, gin.H{"success": false, "message": testErr.Error()})
			return
		}
		ak.Status = model.FreeApiKeyStatusAvailable
		ak.TestTime = common.GetTimestamp()
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
	status, _ := strconv.Atoi(c.DefaultQuery("status", "-1"))
	userId := c.GetInt("id")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	items, total, err := model.GetFreeTokenApiKeysPublic(page, pageSize, keyword, protocol, status, userId)
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

func AdminGetFreeApiKeys(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("p", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	keyword := c.Query("keyword")
	protocol, _ := strconv.Atoi(c.DefaultQuery("protocol", "0"))
	status, _ := strconv.Atoi(c.DefaultQuery("status", "-1"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	items, total, err := model.GetAllFreeApiKeysAdmin((page-1)*pageSize, pageSize, keyword, protocol, status)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if items == nil {
		items = []*model.FreeTokenApiKeyAdmin{}
	}

	common.ApiSuccess(c, gin.H{
		"items":     items,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

func AdminGetFreeApiKey(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	ak, err := model.GetFreeTokenApiKeyById(id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, ak)
}

type adminUpdateFreeApiKeyPayload struct {
	Id     int `json:"id"`
	Status int `json:"status"`
}

func AdminUpdateFreeApiKey(c *gin.Context) {
	var payload adminUpdateFreeApiKeyPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		common.ApiError(c, err)
		return
	}
	if err := model.UpdateFreeApiKeyStatus(payload.Id, payload.Status); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, nil)
}

func AdminDeleteFreeApiKey(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if err := model.DeleteFreeApiKeyById(id); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, nil)
}

func AdminDeleteInvalidFreeApiKeys(c *gin.Context) {
	count, err := model.DeleteFreeApiKeysByStatus(model.FreeApiKeyStatusUnavailable)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, gin.H{"deleted": count})
}
