package model

import (
	"errors"

	"github.com/QuantumNous/new-api/common"

	"gorm.io/gorm"
)

const (
	FreeTokenSiteStatusEnabled  = 1
	FreeTokenSiteStatusDisabled = 2
)

type FreeTokenSite struct {
	Id             int            `json:"id"`
	Name           string         `json:"name" gorm:"index"`
	Description    string         `json:"description"`
	SiteUrl        string         `json:"site_url"`
	LogoUrl        string         `json:"logo_url"`
	Bonus          string         `json:"bonus"`
	Status         int            `json:"status" gorm:"default:1"`
	SortOrder      int            `json:"sort_order" gorm:"default:0"`
	CreatedTime    int64          `json:"created_time" gorm:"bigint"`
	UpdatedTime    int64          `json:"updated_time" gorm:"bigint"`
	DeletedAt      gorm.DeletedAt `json:"-" gorm:"index"`
	TotalCount     int            `json:"total_count" gorm:"-:all"`
	AvailableCount int            `json:"available_count" gorm:"-:all"`
	ClaimedCount   int            `json:"claimed_count" gorm:"-:all"`
}

type FreeTokenClaim struct {
	Id          int    `json:"id"`
	UserId      int    `json:"user_id" gorm:"index"`
	SiteId      int    `json:"site_id" gorm:"index"`
	CodeId      int    `json:"code_id" gorm:"index"`
	Code        string `json:"code"`
	ClaimedTime int64  `json:"claimed_time" gorm:"bigint"`
}

type FreeTokenSitePublic struct {
	Id             int    `json:"id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	SiteUrl        string `json:"site_url"`
	LogoUrl        string `json:"logo_url"`
	Bonus          string `json:"bonus"`
	SortOrder      int    `json:"sort_order"`
	TotalCount     int    `json:"total_count"`
	AvailableCount int    `json:"available_count"`
	ClaimedCount   int    `json:"claimed_count"`
	Claimed        bool   `json:"claimed"`
	Code           string `json:"code,omitempty"`
}

type FreeTokenClaimRecord struct {
	Id          int    `json:"id"`
	SiteId      int    `json:"site_id"`
	SiteName    string `json:"site_name"`
	SiteUrl     string `json:"site_url"`
	LogoUrl     string `json:"logo_url"`
	Bonus       string `json:"bonus"`
	Code        string `json:"code"`
	ClaimedTime int64  `json:"claimed_time"`
}

var (
	ErrFreeTokenSiteNotFound   = errors.New("free token site not found")
	ErrFreeTokenSiteDisabled   = errors.New("free token site is disabled")
	ErrFreeTokenSiteOutOfStock = errors.New("free token site is out of stock")
	ErrFreeTokenAlreadyClaimed = errors.New("you have already claimed this code")
	ErrFreeTokenNoCodes        = errors.New("at least one redemption code is required")
)

func GetAllFreeTokenSites(startIdx int, num int) ([]*FreeTokenSite, int64, error) {
	var sites []*FreeTokenSite
	var total int64
	err := DB.Model(&FreeTokenSite{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	err = DB.Order("sort_order asc, id desc").Limit(num).Offset(startIdx).Find(&sites).Error
	if err != nil {
		return nil, 0, err
	}
	if err := EnrichFreeTokenSitesWithCounts(sites); err != nil {
		return nil, 0, err
	}
	return sites, total, err
}

func SearchFreeTokenSites(keyword string, startIdx int, num int) ([]*FreeTokenSite, int64, error) {
	var sites []*FreeTokenSite
	var total int64
	query := DB.Model(&FreeTokenSite{}).Where("name LIKE ? OR description LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	err := query.Order("sort_order asc, id desc").Limit(num).Offset(startIdx).Find(&sites).Error
	if err != nil {
		return nil, 0, err
	}
	if err := EnrichFreeTokenSitesWithCounts(sites); err != nil {
		return nil, 0, err
	}
	return sites, total, err
}

func GetFreeTokenSiteById(id int) (*FreeTokenSite, error) {
	site := &FreeTokenSite{}
	err := DB.Where("id = ?", id).First(site).Error
	if err != nil {
		return nil, err
	}
	if err := EnrichFreeTokenSitesWithCounts([]*FreeTokenSite{site}); err != nil {
		return nil, err
	}
	return site, nil
}

func (site *FreeTokenSite) Insert() error {
	now := common.GetTimestamp()
	if site.CreatedTime == 0 {
		site.CreatedTime = now
	}
	site.UpdatedTime = now
	return DB.Create(site).Error
}

func (site *FreeTokenSite) Update() error {
	site.UpdatedTime = common.GetTimestamp()
	return DB.Model(site).Select(
		"name", "description", "site_url", "logo_url", "bonus",
		"status", "sort_order", "updated_time",
	).Updates(site).Error
}

func (site *FreeTokenSite) Delete() error {
	return DB.Delete(site).Error
}

func GetEnabledFreeTokenSites() ([]*FreeTokenSite, error) {
	var sites []*FreeTokenSite
	err := DB.Where("status = ?", FreeTokenSiteStatusEnabled).
		Order("sort_order asc, id desc").
		Find(&sites).Error
	if err != nil {
		return nil, err
	}
	if err := EnrichFreeTokenSitesWithCounts(sites); err != nil {
		return nil, err
	}
	return sites, nil
}

func GetUserFreeTokenClaimMap(userId int) (map[int]*FreeTokenClaim, error) {
	result := make(map[int]*FreeTokenClaim)
	if userId == 0 {
		return result, nil
	}
	var claims []*FreeTokenClaim
	err := DB.Where("user_id = ?", userId).Find(&claims).Error
	if err != nil {
		return nil, err
	}
	for _, claim := range claims {
		result[claim.SiteId] = claim
	}
	return result, nil
}

func GetUserFreeTokenClaims(userId int) ([]*FreeTokenClaimRecord, error) {
	if userId == 0 {
		return nil, nil
	}
	var records []*FreeTokenClaimRecord
	err := DB.Table("free_token_claims AS c").
		Select(`c.id, c.site_id, s.name AS site_name, s.site_url, s.logo_url, s.bonus, c.code, c.claimed_time`).
		Joins("LEFT JOIN free_token_sites AS s ON s.id = c.site_id AND s.deleted_at IS NULL").
		Where("c.user_id = ?", userId).
		Order("c.claimed_time desc, c.id desc").
		Scan(&records).Error
	return records, err
}

func ClaimFreeTokenSite(userId, siteId int) (*FreeTokenClaim, error) {
	if userId == 0 {
		return nil, errors.New("invalid user id")
	}

	var claim *FreeTokenClaim
	err := DB.Transaction(func(tx *gorm.DB) error {
		site := &FreeTokenSite{}
		if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("id = ?", siteId).First(site).Error; err != nil {
			return ErrFreeTokenSiteNotFound
		}
		if site.Status != FreeTokenSiteStatusEnabled {
			return ErrFreeTokenSiteDisabled
		}

		var existing FreeTokenClaim
		err := tx.Where("user_id = ? AND site_id = ?", userId, siteId).First(&existing).Error
		if err == nil {
			return ErrFreeTokenAlreadyClaimed
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		codeRecord, err := reserveNextFreeTokenSiteCode(tx, siteId)
		if err != nil {
			return err
		}

		now := common.GetTimestamp()
		codeRecord.Status = FreeTokenSiteCodeStatusClaimed
		codeRecord.UsedUserId = userId
		codeRecord.ClaimedTime = now
		if err := tx.Model(codeRecord).Select("status", "used_user_id", "claimed_time").Updates(codeRecord).Error; err != nil {
			return err
		}

		claim = &FreeTokenClaim{
			UserId:      userId,
			SiteId:      siteId,
			CodeId:      codeRecord.Id,
			Code:        codeRecord.Code,
			ClaimedTime: now,
		}
		return tx.Create(claim).Error
	})
	if err != nil {
		return nil, err
	}
	return claim, nil
}
