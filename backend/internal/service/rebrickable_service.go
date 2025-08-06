package service

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// RebrickableService handles interactions with Rebrickable API
type RebrickableService interface {
	GetSet(setNum string) (*RebrickableSet, error)
	GetSetParts(setNum string) ([]RebrickableSetPart, error)
	GetPart(partNum string) (*RebrickablePart, error)
}

// rebrickableService implements RebrickableService interface
type rebrickableService struct {
	apiKey  string
	baseURL string
	client  *http.Client
}

// NewRebrickableService creates a new Rebrickable service
func NewRebrickableService(apiKey string) RebrickableService {
	return &rebrickableService{
		apiKey:  apiKey,
		baseURL: "https://rebrickable.com/api/v3",
		client:  &http.Client{},
	}
}

// RebrickableSet represents a set from Rebrickable API
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

// RebrickablePart represents a part from Rebrickable API
type RebrickablePart struct {
	PartNum      string                 `json:"part_num"`
	Name         string                 `json:"name"`
	PartCatID    int                    `json:"part_cat_id"`
	PartImageURL string                 `json:"part_img_url"`
	PartURL      string                 `json:"part_url"`
	ExternalIDs  map[string]interface{} `json:"external_ids"`
	PrintOf      string                 `json:"print_of"`
}

// RebrickableSetPart represents a part in a set from Rebrickable API
type RebrickableSetPart struct {
	ID        int              `json:"id"`
	InvPartID int              `json:"inv_part_id"`
	Part      RebrickablePart  `json:"part"`
	Color     RebrickableColor `json:"color"`
	Quantity  int              `json:"quantity"`
	IsSpare   bool             `json:"is_spare"`
	NumSets   int              `json:"num_sets"`
}

// RebrickableColor represents a color from Rebrickable API
type RebrickableColor struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	RGB     string `json:"rgb"`
	IsTrans bool   `json:"is_trans"`
}

// GetSet retrieves a set from Rebrickable API
func (s *rebrickableService) GetSet(setNum string) (*RebrickableSet, error) {
	url := fmt.Sprintf("%s/lego/sets/%s/?key=%s", s.baseURL, setNum, s.apiKey)

	resp, err := s.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch set from Rebrickable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("rebrickable API returned status %d", resp.StatusCode)
	}

	var set RebrickableSet
	if err := json.NewDecoder(resp.Body).Decode(&set); err != nil {
		return nil, fmt.Errorf("failed to decode set response: %w", err)
	}

	return &set, nil
}

// GetSetParts retrieves parts for a set from Rebrickable API
func (s *rebrickableService) GetSetParts(setNum string) ([]RebrickableSetPart, error) {
	url := fmt.Sprintf("%s/lego/sets/%s/parts/?page=1&page_size=100000&inc_minifig_parts=1&key=%s", s.baseURL, setNum, s.apiKey)

	resp, err := s.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch set parts from Rebrickable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("rebrickable API returned status %d", resp.StatusCode)
	}

	var response struct {
		Results []RebrickableSetPart `json:"results"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("failed to decode set parts response: %w", err)
	}

	return response.Results, nil
}

// GetPart retrieves a part from Rebrickable API
func (s *rebrickableService) GetPart(partNum string) (*RebrickablePart, error) {
	url := fmt.Sprintf("%s/lego/parts/%s/?key=%s", s.baseURL, partNum, s.apiKey)

	resp, err := s.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch part from Rebrickable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Rebrickable API returned status %d", resp.StatusCode)
	}

	var part RebrickablePart
	if err := json.NewDecoder(resp.Body).Decode(&part); err != nil {
		return nil, fmt.Errorf("failed to decode part response: %w", err)
	}

	return &part, nil
}
