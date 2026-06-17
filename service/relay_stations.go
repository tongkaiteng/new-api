package service

import (
	"sort"
	"sync"
	"time"

	"github.com/QuantumNous/new-api/model"
)

type RelayStationItem struct {
	ID           int     `json:"id"`
	Name         string  `json:"name"`
	Group        string  `json:"group"`
	Status       int     `json:"status"`
	ResponseTime int     `json:"response_time"`
	UsedQuota    int64   `json:"used_quota"`
	Models       string  `json:"models"`
	TestTime     int64   `json:"test_time"`
}

type RelayStationResponse struct {
	Stations  []RelayStationItem `json:"stations"`
	UpdatedAt int64              `json:"updated_at"`
}

var (
	relayStationCache     *RelayStationResponse
	relayStationCacheLock sync.RWMutex
	relayStationCacheTTL  = 5 * time.Minute
	relayStationCacheTime time.Time
)

func GetRelayStations() (*RelayStationResponse, error) {
	relayStationCacheLock.RLock()
	if relayStationCache != nil && time.Since(relayStationCacheTime) < relayStationCacheTTL {
		defer relayStationCacheLock.RUnlock()
		return relayStationCache, nil
	}
	relayStationCacheLock.RUnlock()

	relayStationCacheLock.Lock()
	defer relayStationCacheLock.Unlock()

	if relayStationCache != nil && time.Since(relayStationCacheTime) < relayStationCacheTTL {
		return relayStationCache, nil
	}

	var channels []model.Channel
	if err := model.DB.Where("status = ?", 1).
		Order("used_quota desc").
		Limit(50).
		Find(&channels).Error; err != nil {
		return nil, err
	}

	stations := make([]RelayStationItem, 0, len(channels))
	for _, ch := range channels {
		stations = append(stations, RelayStationItem{
			ID:           ch.Id,
			Name:         ch.Name,
			Group:        ch.Group,
			Status:       ch.Status,
			ResponseTime: ch.ResponseTime,
			UsedQuota:    ch.UsedQuota,
			Models:       ch.Models,
			TestTime:     ch.TestTime,
		})
	}

	sort.Slice(stations, func(i, j int) bool {
		return stations[i].UsedQuota > stations[j].UsedQuota
	})

	relayStationCache = &RelayStationResponse{
		Stations:  stations,
		UpdatedAt: time.Now().Unix(),
	}
	relayStationCacheTime = time.Now()

	return relayStationCache, nil
}
