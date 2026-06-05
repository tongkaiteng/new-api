package model

import (
	"errors"
	"strings"

	"github.com/QuantumNous/new-api/common"

	"gorm.io/gorm"
)

const (
	FreeTokenSiteCodeStatusAvailable = 1
	FreeTokenSiteCodeStatusClaimed   = 2
)

type FreeTokenSiteCode struct {
	Id          int    `json:"id"`
	SiteId      int    `json:"site_id" gorm:"uniqueIndex:idx_free_token_site_code"`
	Code        string `json:"code" gorm:"uniqueIndex:idx_free_token_site_code"`
	Status      int    `json:"status" gorm:"default:1"`
	UsedUserId  int    `json:"used_user_id" gorm:"default:0"`
	ClaimedTime int64  `json:"claimed_time" gorm:"bigint;default:0"`
	CreatedTime int64  `json:"created_time" gorm:"bigint"`
}

type FreeTokenSiteCodeCounts struct {
	Total     int
	Available int
	Claimed   int
}

func NormalizeFreeTokenCodes(raw []string) []string {
	seen := make(map[string]struct{})
	result := make([]string, 0, len(raw))
	for _, item := range raw {
		for _, part := range strings.FieldsFunc(item, func(r rune) bool {
			return r == '\n' || r == '\r' || r == ','
		}) {
			code := strings.TrimSpace(part)
			if code == "" {
				continue
			}
			if _, ok := seen[code]; ok {
				continue
			}
			seen[code] = struct{}{}
			result = append(result, code)
		}
	}
	return result
}

func ParseFreeTokenCodes(codes []string, codesText string) []string {
	parts := append([]string{}, codes...)
	if strings.TrimSpace(codesText) != "" {
		parts = append(parts, codesText)
	}
	return NormalizeFreeTokenCodes(parts)
}

func InsertFreeTokenSiteCodes(siteId int, codes []string) (int, error) {
	if siteId == 0 {
		return 0, errors.New("invalid site id")
	}
	if len(codes) == 0 {
		return 0, nil
	}

	now := common.GetTimestamp()
	inserted := 0
	err := DB.Transaction(func(tx *gorm.DB) error {
		for _, code := range codes {
			var existing FreeTokenSiteCode
			err := tx.Where("site_id = ? AND code = ?", siteId, code).First(&existing).Error
			if err == nil {
				continue
			}
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				return err
			}

			record := FreeTokenSiteCode{
				SiteId:      siteId,
				Code:        code,
				Status:      FreeTokenSiteCodeStatusAvailable,
				CreatedTime: now,
			}
			if err := tx.Create(&record).Error; err != nil {
				return err
			}
			inserted++
		}
		return nil
	})
	return inserted, err
}

func GetFreeTokenSiteCodeCounts(siteIds []int) (map[int]FreeTokenSiteCodeCounts, error) {
	result := make(map[int]FreeTokenSiteCodeCounts, len(siteIds))
	if len(siteIds) == 0 {
		return result, nil
	}

	type row struct {
		SiteId int
		Status int
		Count  int
	}
	var rows []row
	err := DB.Model(&FreeTokenSiteCode{}).
		Select("site_id, status, COUNT(*) AS count").
		Where("site_id IN ?", siteIds).
		Group("site_id, status").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	for _, siteId := range siteIds {
		result[siteId] = FreeTokenSiteCodeCounts{}
	}
	for _, item := range rows {
		counts := result[item.SiteId]
		counts.Total += item.Count
		if item.Status == FreeTokenSiteCodeStatusAvailable {
			counts.Available += item.Count
		} else if item.Status == FreeTokenSiteCodeStatusClaimed {
			counts.Claimed += item.Count
		}
		result[item.SiteId] = counts
	}
	return result, nil
}

func applyFreeTokenSiteCounts(site *FreeTokenSite, counts FreeTokenSiteCodeCounts) {
	site.TotalCount = counts.Total
	site.AvailableCount = counts.Available
	site.ClaimedCount = counts.Claimed
}

func EnrichFreeTokenSitesWithCounts(sites []*FreeTokenSite) error {
	if len(sites) == 0 {
		return nil
	}
	siteIds := make([]int, 0, len(sites))
	for _, site := range sites {
		siteIds = append(siteIds, site.Id)
	}
	countsMap, err := GetFreeTokenSiteCodeCounts(siteIds)
	if err != nil {
		return err
	}
	for _, site := range sites {
		applyFreeTokenSiteCounts(site, countsMap[site.Id])
	}
	return nil
}

func reserveNextFreeTokenSiteCode(tx *gorm.DB, siteId int) (*FreeTokenSiteCode, error) {
	codeRecord := &FreeTokenSiteCode{}
	err := tx.Set("gorm:query_option", "FOR UPDATE").
		Where("site_id = ? AND status = ?", siteId, FreeTokenSiteCodeStatusAvailable).
		Order("id asc").
		First(codeRecord).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrFreeTokenSiteOutOfStock
		}
		return nil, err
	}
	return codeRecord, nil
}
