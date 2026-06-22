package service

import (
	"sync"
	"time"

	"github.com/QuantumNous/new-api/model"
	perfmetrics "github.com/QuantumNous/new-api/pkg/perf_metrics"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
	"github.com/samber/lo"
)

type ModelLeaderboardItem struct {
	ModelName    string  `json:"model_name"`
	Vendor       string  `json:"vendor"`
	VendorIcon   string  `json:"vendor_icon,omitempty"`
	SuccessRate  float64 `json:"success_rate"`
	AvgLatencyMs int64   `json:"avg_latency_ms"`
	AvgTtftMs    int64   `json:"avg_ttft_ms"`
	AvgTps       float64 `json:"avg_tps"`
	RequestCount int64   `json:"request_count"`
	TokenUsage   int64   `json:"token_usage"`
	ModelPrice   float64 `json:"model_price"`
	ModelRatio   float64 `json:"model_ratio"`
	QuotaType    int     `json:"quota_type"`
}

type ModelLeaderboardResponse struct {
	Models    []ModelLeaderboardItem `json:"models"`
	UpdatedAt int64                  `json:"updated_at"`
}

var (
	modelLeaderboardCache     *ModelLeaderboardResponse
	modelLeaderboardCacheLock sync.RWMutex
	modelLeaderboardCacheTTL  = 5 * time.Minute
	modelLeaderboardCacheTime time.Time
)

func GetModelLeaderboard() (*ModelLeaderboardResponse, error) {
	modelLeaderboardCacheLock.RLock()
	if modelLeaderboardCache != nil && time.Since(modelLeaderboardCacheTime) < modelLeaderboardCacheTTL {
		defer modelLeaderboardCacheLock.RUnlock()
		return modelLeaderboardCache, nil
	}
	modelLeaderboardCacheLock.RUnlock()

	modelLeaderboardCacheLock.Lock()
	defer modelLeaderboardCacheLock.Unlock()

	if modelLeaderboardCache != nil && time.Since(modelLeaderboardCacheTime) < modelLeaderboardCacheTTL {
		return modelLeaderboardCache, nil
	}

	activeGroups := append(lo.Keys(ratio_setting.GetGroupRatioCopy()), "auto")
	result, err := perfmetrics.QuerySummaryAll(24, activeGroups)
	if err != nil {
		return nil, err
	}

	pricingList := model.GetPricing()
	vendorList := model.GetVendors()

	// Build model -> pricing lookup
	pricingByModel := make(map[string]model.Pricing, len(pricingList))
	for _, p := range pricingList {
		pricingByModel[p.ModelName] = p
	}

	// Build vendor id -> vendor lookup
	vendorByID := make(map[int]model.PricingVendor, len(vendorList))
	for _, v := range vendorList {
		vendorByID[v.ID] = v
	}

	topN := min(20, len(result.Models))

	items := make([]ModelLeaderboardItem, 0, topN)
	for i := range topN {
		m := result.Models[i]
		item := ModelLeaderboardItem{
			ModelName:    m.ModelName,
			SuccessRate:  m.SuccessRate,
			AvgLatencyMs: m.AvgLatencyMs,
			AvgTtftMs:    m.AvgTtftMs,
			AvgTps:       m.AvgTps,
			RequestCount: m.RequestCount,
			TokenUsage:   m.TokenUsage,
		}

		if p, ok := pricingByModel[m.ModelName]; ok {
			if v, ok := vendorByID[p.VendorID]; ok {
				item.Vendor = v.Name
				item.VendorIcon = v.Icon
			}
			item.ModelPrice = p.ModelPrice
			item.ModelRatio = p.ModelRatio
			item.QuotaType = p.QuotaType
			if item.QuotaType != 1 && item.QuotaType != 0 {
				item.QuotaType = 0
			}
		}

		items = append(items, item)
	}

	modelLeaderboardCache = &ModelLeaderboardResponse{
		Models:    items,
		UpdatedAt: time.Now().Unix(),
	}
	modelLeaderboardCacheTime = time.Now()

	return modelLeaderboardCache, nil
}
