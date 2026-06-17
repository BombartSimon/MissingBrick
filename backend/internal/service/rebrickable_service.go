package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

// RebrickableService handles interactions with Rebrickable API
type RebrickableService interface {
	GetSet(setNum string) (*RebrickableSet, error)
	GetSetParts(setNum string) ([]RebrickableSetPart, error)
	GetPart(partNum string) (*RebrickablePart, error)
	SearchSets(searchTerm string, page, pageSize int) (*RebrickableSetResponse, error)
}

type rebrickableService struct {
	apiKey  string
	baseURL string
	client  *http.Client
}

func NewRebrickableService(apiKey string) RebrickableService {
	return &rebrickableService{
		apiKey:  apiKey,
		baseURL: "https://rebrickable.com/api/v3",
		client:  &http.Client{Timeout: 15 * time.Second},
	}
}

type RebrickableSet struct {
	SetNum       string `json:"set_num"`
	Name         string `json:"name"`
	Year         int    `json:"year"`
	ThemeID      int    `json:"theme_id"`
	NumParts     int    `json:"num_parts"`
	SetImageURL  string `json:"set_img_url"`
	SetURL       string `json:"set_url"`
	LastModified string `json:"last_modified_dt"`
}

type RebrickablePart struct {
	PartNum      string                 `json:"part_num"`
	Name         string                 `json:"name"`
	PartCatID    int                    `json:"part_cat_id"`
	PartImageURL string                 `json:"part_img_url"`
	PartURL      string                 `json:"part_url"`
	ExternalIDs  map[string]interface{} `json:"external_ids"`
	PrintOf      string                 `json:"print_of"`
}

type RebrickableSetPart struct {
	ID        int              `json:"id"`
	InvPartID int              `json:"inv_part_id"`
	Part      RebrickablePart  `json:"part"`
	Color     RebrickableColor `json:"color"`
	Quantity  int              `json:"quantity"`
	IsSpare   bool             `json:"is_spare"`
	NumSets   int              `json:"num_sets"`
}

type RebrickableColor struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	RGB     string `json:"rgb"`
	IsTrans bool   `json:"is_trans"`
}

type RebrickableSetResponse struct {
	Count    int              `json:"count"`
	Next     *string          `json:"next"`
	Previous *string          `json:"previous"`
	Results  []RebrickableSet `json:"results"`
}

func (s *rebrickableService) GetSet(setNum string) (*RebrickableSet, error) {
	endpoint := fmt.Sprintf("%s/lego/sets/%s/", s.baseURL, url.PathEscape(setNum))
	var set RebrickableSet
	if err := s.getJSON(endpoint, nil, &set); err != nil {
		return nil, fmt.Errorf("failed to fetch set from Rebrickable: %w", err)
	}
	return &set, nil
}

func (s *rebrickableService) GetSetParts(setNum string) ([]RebrickableSetPart, error) {
	var all []RebrickableSetPart
	for page := 1; ; page++ {
		params := url.Values{}
		params.Set("page", strconv.Itoa(page))
		params.Set("page_size", "1000")
		params.Set("inc_minifig_parts", "1")

		var response struct {
			Next    *string              `json:"next"`
			Results []RebrickableSetPart `json:"results"`
		}
		endpoint := fmt.Sprintf("%s/lego/sets/%s/parts/", s.baseURL, url.PathEscape(setNum))
		if err := s.getJSON(endpoint, params, &response); err != nil {
			return nil, fmt.Errorf("failed to fetch set parts from Rebrickable: %w", err)
		}
		all = append(all, response.Results...)
		if response.Next == nil {
			break
		}
	}
	return all, nil
}

func (s *rebrickableService) GetPart(partNum string) (*RebrickablePart, error) {
	endpoint := fmt.Sprintf("%s/lego/parts/%s/", s.baseURL, url.PathEscape(partNum))
	var part RebrickablePart
	if err := s.getJSON(endpoint, nil, &part); err != nil {
		return nil, fmt.Errorf("failed to fetch part from Rebrickable: %w", err)
	}
	return &part, nil
}

func (s *rebrickableService) SearchSets(searchTerm string, page, pageSize int) (*RebrickableSetResponse, error) {
	params := url.Values{}
	params.Set("search", searchTerm)
	params.Set("page", strconv.Itoa(page))
	params.Set("page_size", strconv.Itoa(pageSize))

	var result RebrickableSetResponse
	if err := s.getJSON(s.baseURL+"/lego/sets/", params, &result); err != nil {
		return nil, fmt.Errorf("failed to search sets on Rebrickable: %w", err)
	}
	return &result, nil
}

func (s *rebrickableService) getJSON(endpoint string, params url.Values, target any) error {
	parsed, err := url.Parse(endpoint)
	if err != nil {
		return err
	}
	if params != nil {
		parsed.RawQuery = params.Encode()
	}

	req, err := http.NewRequest(http.MethodGet, parsed.String(), nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "key "+s.apiKey)
	req.Header.Set("Accept", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("%w: %v", ErrUpstreamUnavailable, err)
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		return json.NewDecoder(resp.Body).Decode(target)
	case http.StatusNotFound:
		return ErrUpstreamNotFound
	case http.StatusTooManyRequests:
		return ErrUpstreamRateLimited
	default:
		if resp.StatusCode >= 500 {
			return fmt.Errorf("%w: status %d", ErrUpstreamUnavailable, resp.StatusCode)
		}
		return errors.Join(ErrUpstreamUnavailable, fmt.Errorf("status %d", resp.StatusCode))
	}
}
