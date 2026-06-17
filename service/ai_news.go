package service

import (
	"encoding/xml"
	"io"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"
)

type AINewsItem struct {
	Title     string `json:"title"`
	Link      string `json:"link"`
	Source    string `json:"source"`
	PubDate   string `json:"pub_date"`
	Thumbnail string `json:"thumbnail"`
}

type AINewsResponse struct {
	Articles  []AINewsItem `json:"articles"`
	UpdatedAt int64        `json:"updated_at"`
}

var (
	aiNewsCache     *AINewsResponse
	aiNewsCacheLock sync.Mutex
	aiNewsCacheTTL  = 1 * time.Hour
)

var rssSources = []struct {
	Name string
	URL  string
}{
	{Name: "机器之心", URL: "https://www.jiqizhixin.com/rss"},
	{Name: "36氪", URL: "https://36kr.com/feed"},
	{Name: "虎嗅", URL: "https://www.huxiu.com/rss/0.xml"},
	{Name: "少数派", URL: "https://sspai.com/feed"},
}

type rssFeed struct {
	XMLName xml.Name   `xml:"rss"`
	Channel rssChannel `xml:"channel"`
}

type rssChannel struct {
	Items []rssItem `xml:"item"`
}

type rssItem struct {
	Title   string `xml:"title"`
	Link    string `xml:"link"`
	PubDate string `xml:"pubDate"`
}

type atomFeed struct {
	XMLName xml.Name    `xml:"feed"`
	Entries []atomEntry `xml:"entry"`
}

type atomEntry struct {
	Title   string `xml:"title"`
	Link    atomLink `xml:"link"`
	PubDate string `xml:"published"`
}

type atomLink struct {
	Href string `xml:"href,attr"`
}

func fetchFeed(url string) ([]AINewsItem, error) {
	items, err := fetchRSS(url)
	if err == nil && len(items) > 0 {
		return items, nil
	}
	return fetchAtom(url)
}

func fetchRSS(url string) ([]AINewsItem, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 512<<10))
	if err != nil {
		return nil, err
	}

	var feed rssFeed
	if err := xml.Unmarshal(body, &feed); err != nil {
		return nil, err
	}

	items := make([]AINewsItem, 0, len(feed.Channel.Items))
	for _, item := range feed.Channel.Items {
		if item.Title == "" {
			continue
		}
		items = append(items, AINewsItem{
			Title:   strings.TrimSpace(item.Title),
			Link:    item.Link,
			PubDate: item.PubDate,
		})
	}
	return items, nil
}

func fetchAtom(url string) ([]AINewsItem, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(io.LimitReader(resp.Body, 512<<10))
	if err != nil {
		return nil, err
	}

	var feed atomFeed
	if err := xml.Unmarshal(body, &feed); err != nil {
		return nil, err
	}

	items := make([]AINewsItem, 0, len(feed.Entries))
	for _, entry := range feed.Entries {
		if entry.Title == "" {
			continue
		}
		link := entry.Link.Href
		items = append(items, AINewsItem{
			Title:   strings.TrimSpace(entry.Title),
			Link:    link,
			PubDate: entry.PubDate,
		})
	}
	return items, nil
}

func GetAINews() (*AINewsResponse, error) {
	aiNewsCacheLock.Lock()
	defer aiNewsCacheLock.Unlock()

	if aiNewsCache != nil && time.Since(time.Unix(aiNewsCache.UpdatedAt, 0)) < aiNewsCacheTTL {
		return aiNewsCache, nil
	}

	var allItems []AINewsItem
	for _, src := range rssSources {
		items, err := fetchFeed(src.URL)
		if err != nil {
			continue
		}
		for i := range items {
			items[i].Source = src.Name
		}
		allItems = append(allItems, items...)
	}

	// Deduplicate by title prefix similarity
	seen := make(map[string]bool)
	var deduped []AINewsItem
	for _, item := range allItems {
		key := strings.ToLower(strings.TrimSpace(item.Title))
		if len(key) > 80 {
			key = key[:80]
		}
		if seen[key] {
			continue
		}
		seen[key] = true
		deduped = append(deduped, item)
	}

	sort.Slice(deduped, func(i, j int) bool {
		return deduped[i].PubDate > deduped[j].PubDate
	})

	if len(deduped) > 6 {
		deduped = deduped[:6]
	}
	if deduped == nil {
		deduped = []AINewsItem{}
	}

	aiNewsCache = &AINewsResponse{
		Articles:  deduped,
		UpdatedAt: time.Now().Unix(),
	}
	return aiNewsCache, nil
}

func StartAINewsRefreshTask() {
	go func() {
		for {
			time.Sleep(55 * time.Minute)
			GetAINews()
		}
	}()
}
