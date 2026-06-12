package model

import (
	"errors"

	"github.com/QuantumNous/new-api/common"

	"gorm.io/gorm"
)

const (
	FreeApiKeyProtocolOpenAI    = 1
	FreeApiKeyProtocolAnthropic = 2
	FreeApiKeyProtocolGemini    = 3
	FreeApiKeyProtocolCustom    = 4

	FreeApiKeyStatusUntested    = 0
	FreeApiKeyStatusAvailable   = 1
	FreeApiKeyStatusUnavailable = 2

	FreeApiKeyMaxConsecutiveFailures = 5
)

type FreeTokenApiKey struct {
	Id                 int            `json:"id"`
	UserId             int            `json:"user_id" gorm:"index"`
	ApiAddress         string         `json:"api_address"`
	Protocol           int            `json:"protocol" gorm:"default:1"`
	ApiKey             string         `json:"api_key"`
	Models             string         `json:"models"`
	Note               string         `json:"note"`
	ClaimCount         int            `json:"claim_count" gorm:"default:0"`
	Status             int            `json:"status" gorm:"default:0"`
	ConsecutiveFailures int           `json:"consecutive_failures" gorm:"default:0"`
	TestTime           int64          `json:"test_time" gorm:"bigint;default:0"`
	CreatedTime        int64          `json:"created_time" gorm:"bigint"`
	UpdatedTime        int64          `json:"updated_time" gorm:"bigint"`
	DeletedAt          gorm.DeletedAt `json:"-" gorm:"index"`
}

type FreeTokenApiKeyPublic struct {
	Id          int    `json:"id" gorm:"column:id"`
	UserId      int    `json:"user_id" gorm:"column:user_id"`
	Username    string `json:"username" gorm:"column:username"`
	ApiAddress  string `json:"api_address" gorm:"column:api_address"`
	Protocol    int    `json:"protocol" gorm:"column:protocol"`
	ApiKey      string `json:"api_key" gorm:"column:api_key"`
	Models      string `json:"models" gorm:"column:models"`
	Note        string `json:"note" gorm:"column:note"`
	ClaimCount  int    `json:"claim_count" gorm:"column:claim_count"`
	ClaimCost   int    `json:"claim_cost"`
	Claimed     bool   `json:"claimed"`
	Status      int    `json:"status" gorm:"column:status"`
	ClaimedTime int64  `json:"claimed_time" gorm:"column:claimed_time"`
	CreatedTime int64  `json:"created_time" gorm:"column:created_time"`
}

type FreeTokenApiKeyClaim struct {
	Id          int   `json:"id"`
	UserId      int   `json:"user_id" gorm:"index"`
	ApiKeyId    int   `json:"api_key_id" gorm:"index"`
	ClaimedTime int64 `json:"claimed_time" gorm:"bigint"`
}

type FreeTokenApiKeyAdmin struct {
	Id          int    `json:"id" gorm:"column:id"`
	UserId      int    `json:"user_id" gorm:"column:user_id"`
	Username    string `json:"username" gorm:"column:username"`
	ApiAddress  string `json:"api_address" gorm:"column:api_address"`
	Protocol    int    `json:"protocol" gorm:"column:protocol"`
	ApiKey      string `json:"api_key" gorm:"column:api_key"`
	Models      string `json:"models" gorm:"column:models"`
	Note        string `json:"note" gorm:"column:note"`
	ClaimCount  int    `json:"claim_count" gorm:"column:claim_count"`
	Status      int    `json:"status" gorm:"column:status"`
	TestTime    int64  `json:"test_time" gorm:"column:test_time"`
	CreatedTime int64  `json:"created_time" gorm:"column:created_time"`
	UpdatedTime int64  `json:"updated_time" gorm:"column:updated_time"`
}

var (
	ErrFreeApiKeyNotFound       = errors.New("api key not found")
	ErrFreeApiKeyOwnSubmission  = errors.New("cannot claim your own submission")
	ErrFreeApiKeyAlreadyClaimed = errors.New("you have already claimed this api key")
)

func maskApiKey(key string) string {
	if len(key) <= 8 {
		if len(key) <= 2 {
			return "****"
		}
		return key[:2] + "****" + key[len(key)-1:]
	}
	return key[:6] + "****" + key[len(key)-2:]
}

func (ak *FreeTokenApiKey) Insert() error {
	now := common.GetTimestamp()
	if ak.CreatedTime == 0 {
		ak.CreatedTime = now
	}
	ak.UpdatedTime = now
	return DB.Create(ak).Error
}

func IsFreeApiKeyAlreadyShared(apiKey string) (bool, error) {
	var count int64
	err := DB.Model(&FreeTokenApiKey{}).Where("api_key = ?", apiKey).Count(&count).Error
	return count > 0, err
}

func GetFreeTokenApiKeysPublic(page, pageSize int, keyword string, protocol int, status int, userId int) ([]*FreeTokenApiKeyPublic, int64, error) {
	var items []*FreeTokenApiKeyPublic
	var total int64

	baseQuery := DB.Table("free_token_api_keys AS a").
		Select(`a.id, a.user_id, u.username, a.api_address, a.protocol, a.api_key,
			a.models, a.note, a.claim_count, a.status, a.test_time, a.created_time`).
		Joins("LEFT JOIN users AS u ON u.id = a.user_id")

	if keyword != "" {
		kw := "%" + keyword + "%"
		baseQuery = baseQuery.Where(
			"a.api_address LIKE ? OR a.models LIKE ? OR a.note LIKE ? OR u.username LIKE ?",
			kw, kw, kw, kw,
		)
	}

	if protocol > 0 {
		baseQuery = baseQuery.Where("a.protocol = ?", protocol)
	}

	if status >= 0 {
		baseQuery = baseQuery.Where("a.status = ?", status)
	}

	if err := baseQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := baseQuery.Order("a.id desc").
		Limit(pageSize).Offset((page - 1) * pageSize).
		Scan(&items).Error
	if err != nil {
		return nil, 0, err
	}

	claimCost := common.FreeApiKeyClaimCost

	if userId > 0 {
		claimedIds, err := GetUserFreeApiKeyClaimedIds(userId)
		if err != nil {
			return nil, 0, err
		}
		claimedSet := make(map[int]bool, len(claimedIds))
		for _, id := range claimedIds {
			claimedSet[id] = true
		}
		for _, item := range items {
			item.ClaimCost = claimCost
			item.Claimed = claimedSet[item.Id]
			if !item.Claimed && item.UserId != userId {
				item.ApiKey = maskApiKey(item.ApiKey)
			}
		}
	} else {
		for _, item := range items {
			item.ClaimCost = claimCost
			item.ApiKey = maskApiKey(item.ApiKey)
		}
	}

	return items, total, nil
}

func GetUserFreeApiKeyClaimedIds(userId int) ([]int, error) {
	var ids []int
	err := DB.Model(&FreeTokenApiKeyClaim{}).
		Where("user_id = ?", userId).
		Pluck("api_key_id", &ids).Error
	return ids, err
}

func GetUserClaimedFreeApiKeys(userId int) ([]*FreeTokenApiKeyPublic, error) {
	if userId == 0 {
		return nil, nil
	}
	var items []*FreeTokenApiKeyPublic
	err := DB.Table("free_token_api_key_claims AS c").
		Select(`a.id, a.user_id, u.username, a.api_address, a.protocol, a.api_key,
			a.models, a.note, a.claim_count, a.status, a.test_time, a.created_time, c.claimed_time`).
		Joins("LEFT JOIN free_token_api_keys AS a ON a.id = c.api_key_id").
		Joins("LEFT JOIN users AS u ON u.id = a.user_id").
		Where("c.user_id = ?", userId).
		Order("c.claimed_time desc, c.id desc").
		Scan(&items).Error
	if err != nil {
		return nil, err
	}
	claimCost := common.FreeApiKeyClaimCost
	for _, item := range items {
		item.ClaimCost = claimCost
		item.Claimed = true
	}
	return items, nil
}

func GetFreeTokenApiKeyById(id int) (*FreeTokenApiKey, error) {
	ak := &FreeTokenApiKey{}
	err := DB.Where("id = ?", id).First(ak).Error
	return ak, err
}

func ClaimFreeTokenApiKey(userId, apiKeyId int) (*FreeTokenApiKeyPublic, error) {
	if userId == 0 {
		return nil, errors.New("invalid user id")
	}

	var result *FreeTokenApiKeyPublic
	err := DB.Transaction(func(tx *gorm.DB) error {
		ak := &FreeTokenApiKey{}
		if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("id = ?", apiKeyId).First(ak).Error; err != nil {
			return ErrFreeApiKeyNotFound
		}

		if ak.UserId == userId {
			return ErrFreeApiKeyOwnSubmission
		}

		var existing FreeTokenApiKeyClaim
		err := tx.Where("user_id = ? AND api_key_id = ?", userId, apiKeyId).First(&existing).Error
		if err == nil {
			return ErrFreeApiKeyAlreadyClaimed
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		now := common.GetTimestamp()
		claim := &FreeTokenApiKeyClaim{
			UserId:      userId,
			ApiKeyId:    apiKeyId,
			ClaimedTime: now,
		}
		if err := tx.Create(claim).Error; err != nil {
			return err
		}

		ak.ClaimCount++
		if err := tx.Model(ak).Update("claim_count", ak.ClaimCount).Error; err != nil {
			return err
		}

		var user User
		if err := tx.Where("id = ?", userId).First(&user).Error; err != nil {
			return err
		}
		cost := common.FreeApiKeyClaimCost
		if cost > 0 {
			user.Quota -= cost
			if err := tx.Model(&user).Update("quota", user.Quota).Error; err != nil {
				return err
			}
		}

		result = &FreeTokenApiKeyPublic{
			Id:         ak.Id,
			UserId:     ak.UserId,
			ApiAddress: ak.ApiAddress,
			Protocol:   ak.Protocol,
			ApiKey:     ak.ApiKey,
			Models:     ak.Models,
			Note:       ak.Note,
			ClaimCount: ak.ClaimCount,
			ClaimCost:  cost,
			Claimed:    true,
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return result, nil
}

func GetAllFreeApiKeysAdmin(startIdx, pageSize int, keyword string, protocol int, status int) ([]*FreeTokenApiKeyAdmin, int64, error) {
	var items []*FreeTokenApiKeyAdmin
	var total int64

	baseQuery := DB.Table("free_token_api_keys AS a").
		Select(`a.id, a.user_id, u.username, a.api_address, a.protocol, a.api_key,
			a.models, a.note, a.claim_count, a.status, a.test_time, a.created_time, a.updated_time`).
		Joins("LEFT JOIN users AS u ON u.id = a.user_id")

	if keyword != "" {
		kw := "%" + keyword + "%"
		baseQuery = baseQuery.Where(
			"a.api_address LIKE ? OR a.models LIKE ? OR a.note LIKE ? OR u.username LIKE ?",
			kw, kw, kw, kw,
		)
	}

	if protocol > 0 {
		baseQuery = baseQuery.Where("a.protocol = ?", protocol)
	}

	if status >= 0 {
		baseQuery = baseQuery.Where("a.status = ?", status)
	}

	if err := baseQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := baseQuery.Order("a.id desc").
		Limit(pageSize).Offset(startIdx).
		Scan(&items).Error
	if err != nil {
		return nil, 0, err
	}

	return items, total, nil
}

func UpdateFreeApiKeyStatus(id int, status int) error {
	return DB.Model(&FreeTokenApiKey{}).Where("id = ?", id).Updates(map[string]any{
		"status":       status,
		"updated_time": common.GetTimestamp(),
	}).Error
}

func DeleteFreeApiKeyById(id int) error {
	return DB.Where("id = ?", id).Delete(&FreeTokenApiKey{}).Error
}

func DeleteFreeApiKeysByStatus(status int) (int64, error) {
	result := DB.Where("status = ?", status).Delete(&FreeTokenApiKey{})
	return result.RowsAffected, result.Error
}

func GetFreeApiKeysForTesting() ([]*FreeTokenApiKey, error) {
	var keys []*FreeTokenApiKey
	err := DB.Where("protocol != ?", FreeApiKeyProtocolCustom).
		Where("consecutive_failures < ?", FreeApiKeyMaxConsecutiveFailures).
		Find(&keys).Error
	return keys, err
}

func UpdateFreeApiKeyTestResult(id int, success bool) error {
	updates := map[string]any{
		"test_time":    common.GetTimestamp(),
		"updated_time": common.GetTimestamp(),
	}
	if success {
		updates["status"] = FreeApiKeyStatusAvailable
		updates["consecutive_failures"] = 0
	} else {
		updates["status"] = FreeApiKeyStatusUnavailable
		updates["consecutive_failures"] = gorm.Expr("consecutive_failures + 1")
	}
	return DB.Model(&FreeTokenApiKey{}).Where("id = ?", id).Updates(updates).Error
}
