package controller

import (
	"net/http"
	"strconv"
	"unicode/utf8"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

type freeTokenSitePayload struct {
	model.FreeTokenSite
	Codes     []string `json:"codes"`
	CodesText string   `json:"codes_text"`
}

type freeTokenSiteCodesPayload struct {
	Codes     []string `json:"codes"`
	CodesText string   `json:"codes_text"`
}

func GetAllFreeTokenSites(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	sites, total, err := model.GetAllFreeTokenSites(pageInfo.GetStartIdx(), pageInfo.GetPageSize())
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(sites)
	common.ApiSuccess(c, pageInfo)
}

func SearchFreeTokenSites(c *gin.Context) {
	keyword := c.Query("keyword")
	pageInfo := common.GetPageQuery(c)
	sites, total, err := model.SearchFreeTokenSites(keyword, pageInfo.GetStartIdx(), pageInfo.GetPageSize())
	if err != nil {
		common.ApiError(c, err)
		return
	}
	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(sites)
	common.ApiSuccess(c, pageInfo)
}

func GetFreeTokenSite(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	site, err := model.GetFreeTokenSiteById(id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, site)
}

func AddFreeTokenSite(c *gin.Context) {
	payload := freeTokenSitePayload{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		common.ApiError(c, err)
		return
	}
	if valid, msg := validateFreeTokenSiteFields(&payload.FreeTokenSite); !valid {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": msg})
		return
	}
	codes := model.ParseFreeTokenCodes(payload.Codes, payload.CodesText)
	if len(codes) == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "at least one redemption code is required"})
		return
	}
	if payload.Status == 0 {
		payload.Status = model.FreeTokenSiteStatusEnabled
	}
	if err := payload.Insert(); err != nil {
		common.ApiError(c, err)
		return
	}
	inserted, err := model.InsertFreeTokenSiteCodes(payload.Id, codes)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if inserted == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "no valid redemption codes were added"})
		return
	}
	site, err := model.GetFreeTokenSiteById(payload.Id)
	if err != nil {
		common.ApiSuccess(c, payload.FreeTokenSite)
		return
	}
	common.ApiSuccess(c, site)
}

func UpdateFreeTokenSite(c *gin.Context) {
	payload := freeTokenSitePayload{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		common.ApiError(c, err)
		return
	}
	if payload.Id == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "invalid id"})
		return
	}
	if valid, msg := validateFreeTokenSiteFields(&payload.FreeTokenSite); !valid {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": msg})
		return
	}
	existing, err := model.GetFreeTokenSiteById(payload.Id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	payload.CreatedTime = existing.CreatedTime
	if err := payload.Update(); err != nil {
		common.ApiError(c, err)
		return
	}

	codes := model.ParseFreeTokenCodes(payload.Codes, payload.CodesText)
	if len(codes) > 0 {
		if _, err := model.InsertFreeTokenSiteCodes(payload.Id, codes); err != nil {
			common.ApiError(c, err)
			return
		}
	}

	site, err := model.GetFreeTokenSiteById(payload.Id)
	if err != nil {
		common.ApiSuccess(c, payload.FreeTokenSite)
		return
	}
	common.ApiSuccess(c, site)
}

func AddFreeTokenSiteCodes(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if _, err := model.GetFreeTokenSiteById(id); err != nil {
		common.ApiError(c, err)
		return
	}

	payload := freeTokenSiteCodesPayload{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		common.ApiError(c, err)
		return
	}
	codes := model.ParseFreeTokenCodes(payload.Codes, payload.CodesText)
	if len(codes) == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "at least one redemption code is required"})
		return
	}
	inserted, err := model.InsertFreeTokenSiteCodes(id, codes)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if inserted == 0 {
		c.JSON(http.StatusOK, gin.H{"success": false, "message": "no new redemption codes were added"})
		return
	}
	site, err := model.GetFreeTokenSiteById(id)
	if err != nil {
		common.ApiSuccess(c, gin.H{"inserted": inserted})
		return
	}
	common.ApiSuccess(c, gin.H{
		"inserted": inserted,
		"site":     site,
	})
}

func DeleteFreeTokenSite(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}
	site, err := model.GetFreeTokenSiteById(id)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if err := site.Delete(); err != nil {
		common.ApiError(c, err)
		return
	}
	common.ApiSuccess(c, nil)
}

func validateFreeTokenSiteFields(site *model.FreeTokenSite) (bool, string) {
	nameLen := utf8.RuneCountInString(site.Name)
	if nameLen == 0 || nameLen > 50 {
		return false, "site name must be 1-50 characters"
	}
	if site.SiteUrl == "" {
		return false, "site url is required"
	}
	return true, ""
}

func GetFreeTokens(c *gin.Context) {
	sites, err := model.GetEnabledFreeTokenSites()
	if err != nil {
		common.ApiError(c, err)
		return
	}

	userId := c.GetInt("id")
	claimMap, err := model.GetUserFreeTokenClaimMap(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}

	items := make([]*model.FreeTokenSitePublic, 0, len(sites))
	for _, site := range sites {
		item := &model.FreeTokenSitePublic{
			Id:             site.Id,
			Name:           site.Name,
			Description:    site.Description,
			SiteUrl:        site.SiteUrl,
			LogoUrl:        site.LogoUrl,
			Bonus:          site.Bonus,
			SortOrder:      site.SortOrder,
			TotalCount:     site.TotalCount,
			AvailableCount: site.AvailableCount,
			ClaimedCount:   site.ClaimedCount,
			CreatedTime:    site.CreatedTime,
		}
		if claim, ok := claimMap[site.Id]; ok {
			item.Claimed = true
			item.Code = claim.Code
		}
		items = append(items, item)
	}

	common.ApiSuccess(c, items)
}

func GetFreeTokenClaimsSelf(c *gin.Context) {
	userId := c.GetInt("id")
	records, err := model.GetUserFreeTokenClaims(userId)
	if err != nil {
		common.ApiError(c, err)
		return
	}
	if records == nil {
		records = []*model.FreeTokenClaimRecord{}
	}
	common.ApiSuccess(c, records)
}

func ClaimFreeToken(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.ApiError(c, err)
		return
	}

	userId := c.GetInt("id")
	claim, err := model.ClaimFreeTokenSite(userId, id)
	if err != nil {
		switch err {
		case model.ErrFreeTokenSiteNotFound:
			c.JSON(http.StatusOK, gin.H{"success": false, "message": "site not found"})
		case model.ErrFreeTokenSiteDisabled:
			c.JSON(http.StatusOK, gin.H{"success": false, "message": "this offer is no longer available"})
		case model.ErrFreeTokenSiteOutOfStock:
			c.JSON(http.StatusOK, gin.H{"success": false, "message": "this offer is out of stock"})
		case model.ErrFreeTokenAlreadyClaimed:
			c.JSON(http.StatusOK, gin.H{"success": false, "message": "you have already claimed this code"})
		default:
			common.ApiError(c, err)
		}
		return
	}

	site, err := model.GetFreeTokenSiteById(id)
	if err != nil {
		common.ApiSuccess(c, claim)
		return
	}

	common.ApiSuccess(c, gin.H{
		"id":           claim.Id,
		"site_id":      claim.SiteId,
		"site_name":    site.Name,
		"site_url":     site.SiteUrl,
		"logo_url":     site.LogoUrl,
		"bonus":        site.Bonus,
		"code":         claim.Code,
		"claimed_time": claim.ClaimedTime,
	})
}
