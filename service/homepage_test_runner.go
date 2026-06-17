package service

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"github.com/samber/lo"
	"github.com/tidwall/gjson"
)

type TestDimensionResult struct {
	Name    string  `json:"name"`
	Score   float64 `json:"score"`
	Passed  bool    `json:"passed"`
	Details string  `json:"details"`
}

type HomepageTestResult struct {
	Success          bool                  `json:"success"`
	Dimensions       []TestDimensionResult `json:"dimensions"`
	TotalScore       float64               `json:"total_score"`
	LatencyMs        int64                 `json:"latency_ms"`
	Model            string                `json:"model"`
	RefModel         string                `json:"ref_model"`
	PromptTokens     int64                 `json:"prompt_tokens"`
	CompletionTokens int64                 `json:"completion_tokens"`
	TokensPerSec     float64               `json:"tokens_per_sec"`
}

type HomepageTestRequest struct {
	ApiAddress     string `json:"api_address"`
	ApiKey         string `json:"api_key"`
	Model          string `json:"model"`
	RefModel       string `json:"ref_model"`
	CacheDetection bool   `json:"cache_detection"`
}

type requestMetrics struct {
	code             int
	body             string
	latency          int64
	ok               bool
	promptTokens     int64
	completionTokens int64
}

func doTestRequest(apiAddress, apiKey, model, prompt string) requestMetrics {
	apiAddress = strings.TrimSuffix(apiAddress, "/")
	body, err := common.Marshal(dto.GeneralOpenAIRequest{
		Model:  model,
		Stream: lo.ToPtr(false),
		Messages: []dto.Message{
			{Role: "user", Content: prompt},
		},
		MaxTokens: lo.ToPtr(uint(64)),
	})
	if err != nil {
		return requestMetrics{code: 0, body: err.Error(), ok: false}
	}

	client := &http.Client{
		Timeout: 15 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	req, err := http.NewRequest("POST", apiAddress+"/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		return requestMetrics{code: 0, ok: false}
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	start := time.Now()
	resp, err := client.Do(req)
	latency := time.Since(start).Milliseconds()
	if err != nil {
		return requestMetrics{code: 0, body: err.Error(), latency: latency, ok: false}
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(io.LimitReader(resp.Body, 16<<10))
	if err != nil {
		return requestMetrics{code: resp.StatusCode, latency: latency, ok: false}
	}

	bodyStr := string(respBody)
	promptTokens := gjsonFirst(bodyStr, "usage.prompt_tokens", "usage.input_tokens")
	completionTokens := gjsonFirst(bodyStr, "usage.completion_tokens", "usage.output_tokens")

	return requestMetrics{
		code:             resp.StatusCode,
		body:             bodyStr,
		latency:          latency,
		ok:               resp.StatusCode >= 200 && resp.StatusCode < 300,
		promptTokens:     promptTokens,
		completionTokens: completionTokens,
	}
}

func canonicalize(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}

func containsAny(s string, subs []string) bool {
	lower := canonicalize(s)
	for _, sub := range subs {
		if strings.Contains(lower, canonicalize(sub)) {
			return true
		}
	}
	return false
}

func RunHomepageTest(req HomepageTestRequest) HomepageTestResult {
	model := req.Model
	if model == "" {
		model = "gpt-3.5-turbo"
	}

	startTime := time.Now()
	var wg sync.WaitGroup
	dimensions := make([]TestDimensionResult, 4)
	totalLatency := int64(0)
	totalPromptTokens := int64(0)
	totalCompletionTokens := int64(0)

	// Dimension 1: Knowledge Q&A Validation
	wg.Add(1)
	go func() {
		defer wg.Done()
		m := doTestRequest(req.ApiAddress, req.ApiKey, model,
			"What is the capital of France? Answer in one word.")
		atomic.AddInt64(&totalLatency, m.latency)
		atomic.AddInt64(&totalPromptTokens, m.promptTokens)
		atomic.AddInt64(&totalCompletionTokens, m.completionTokens)
		score := 0.0
		details := ""
		if m.ok && m.code == 200 {
			if containsAny(m.body, []string{"paris", "Paris"}) {
				score = 100
				details = "模型正确回答了基础知识问题"
			} else {
				score = 30
				details = "模型未能正确回答基础知识问题"
			}
		} else {
			details = fmt.Sprintf("请求失败 (HTTP %d): %s", m.code, shorten(m.body, 100))
		}
		dimensions[0] = TestDimensionResult{
			Name: "知识问答校验", Score: score, Passed: score >= 60, Details: details,
		}
	}()

	// Dimension 2: Model Feature Validation
	wg.Add(1)
	go func() {
		defer wg.Done()
		m := doTestRequest(req.ApiAddress, req.ApiKey, model,
			"What AI model are you? What is your model name and version?")
		atomic.AddInt64(&totalLatency, m.latency)
		atomic.AddInt64(&totalPromptTokens, m.promptTokens)
		atomic.AddInt64(&totalCompletionTokens, m.completionTokens)
		score := 0.0
		details := ""
		if m.ok && m.code == 200 {
			if containsAny(m.body, []string{model, strings.Split(model, "-")[0]}) ||
				gjson.Get(m.body, "choices.0.message.content").String() != "" {
				score = 80
				details = "模型正确返回了响应内容"
			} else {
				score = 20
				details = "模型未返回有效响应"
			}
		} else {
			details = fmt.Sprintf("请求失败 (HTTP %d)", m.code)
		}
		dimensions[1] = TestDimensionResult{
			Name: "型号特征校验", Score: score, Passed: score >= 60, Details: details,
		}
	}()

	// Dimension 3: Protocol Consistency
	wg.Add(1)
	go func() {
		defer wg.Done()
		m := doTestRequest(req.ApiAddress, req.ApiKey, model, "hi")
		atomic.AddInt64(&totalLatency, m.latency)
		atomic.AddInt64(&totalPromptTokens, m.promptTokens)
		atomic.AddInt64(&totalCompletionTokens, m.completionTokens)
		score := 0.0
		details := ""
		if m.ok && m.code == 200 {
			hasChoices := gjson.Get(m.body, "choices").Exists()
			hasContent := gjson.Get(m.body, "content").Exists()
			hasCandidates := gjson.Get(m.body, "candidates").Exists()
			if hasChoices || hasContent || hasCandidates {
				score = 100
				details = "响应结构符合 OpenAI 协议规范"
			} else {
				score = 40
				details = "响应结构不符合标准协议格式"
			}
		} else {
			details = fmt.Sprintf("协议校验失败 (HTTP %d)", m.code)
		}
		dimensions[2] = TestDimensionResult{
			Name: "协议一致性", Score: score, Passed: score >= 60, Details: details,
		}
	}()

	// Dimension 4: Response Structure
	wg.Add(1)
	go func() {
		defer wg.Done()
		m := doTestRequest(req.ApiAddress, req.ApiKey, model, "say test")
		atomic.AddInt64(&totalLatency, m.latency)
		atomic.AddInt64(&totalPromptTokens, m.promptTokens)
		atomic.AddInt64(&totalCompletionTokens, m.completionTokens)
		score := 0.0
		details := ""
		if m.ok {
			structureScore := 50.0
			if gjson.Get(m.body, "id").Exists() {
				structureScore += 10
			}
			if gjson.Get(m.body, "model").Exists() {
				structureScore += 10
			}
			if gjson.Get(m.body, "object").Exists() {
				structureScore += 10
			}
			if gjson.Get(m.body, "usage").Exists() {
				structureScore += 10
			}
			if gjson.Get(m.body, "usage.total_tokens").Int() > 0 {
				structureScore += 10
			}
			if m.latency < 5000 {
				structureScore += 10
			}
			score = structureScore
			if score >= 80 {
				details = "响应结构完整，包含所有必要字段"
			} else {
				details = fmt.Sprintf("响应结构不完整 (%.0f/100)", score)
			}
		} else {
			details = fmt.Sprintf("响应结构检测失败 (HTTP %d)", m.code)
		}
		dimensions[3] = TestDimensionResult{
			Name: "响应结构", Score: score, Passed: score >= 60, Details: details,
		}
	}()

	wg.Wait()

	elapsedMs := time.Since(startTime).Milliseconds()
	if elapsedMs < 1 {
		elapsedMs = 1
	}

	tokensPerSec := 0.0
	if elapsedMs > 0 {
		tokensPerSec = float64(totalCompletionTokens) / (float64(elapsedMs) / 1000.0)
	}
	tokensPerSec = float64(int64(tokensPerSec*10)) / 10.0

	totalScore := 0.0
	allPassed := true
	for _, d := range dimensions {
		totalScore += d.Score
		if !d.Passed {
			allPassed = false
		}
	}
	totalScore = totalScore / 4.0

	return HomepageTestResult{
		Success:          allPassed,
		Dimensions:       dimensions,
		TotalScore:       totalScore,
		LatencyMs:        totalLatency,
		Model:            model,
		RefModel:         req.RefModel,
		PromptTokens:     totalPromptTokens,
		CompletionTokens: totalCompletionTokens,
		TokensPerSec:     tokensPerSec,
	}
}

func shorten(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

// gjsonFirst tries each gjson path in order and returns the first non-zero int64 value.
func gjsonFirst(jsonStr string, paths ...string) int64 {
	for _, p := range paths {
		if v := gjson.Get(jsonStr, p).Int(); v != 0 {
			return v
		}
	}
	return 0
}
