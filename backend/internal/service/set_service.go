package service

import (
	"fmt"
	"time"

	"github.com/BombartSimon/MissingBrick/internal/entity"
	"github.com/BombartSimon/MissingBrick/internal/repository"
)

// SetService handles business logic for sets
type SetService interface {
	CreateSetWithParts(setNum string) (*entity.Set, error)
	GetSetByID(id uint) (*entity.Set, error)
	GetSetBySetNum(setNum string) (*entity.Set, error)
	GetAllSets() ([]entity.Set, error)
	UpdateSet(set *entity.Set) error
	DeleteSet(id uint) error
	SyncSetFromRebrickable(setNum string) (*entity.Set, error)
	GetSetWithMissingParts(id uint) (*entity.Set, error)
	GetSetWithParts(id uint) (*entity.Set, error)
}

// setService implements SetService interface
type setService struct {
	setRepo            repository.SetRepository
	setPartService     SetPartService
	rebrickableService RebrickableService
}

// NewSetService creates a new set service
func NewSetService(setRepo repository.SetRepository, setPartService SetPartService, rebrickableService RebrickableService) SetService {
	return &setService{
		setRepo:            setRepo,
		setPartService:     setPartService,
		rebrickableService: rebrickableService,
	}
}

// createSet creates a new set
func (s *setService) createSet(setNum string) (*entity.Set, error) {
	// Check if set already exists
	existingSet, err := s.setRepo.GetBySetNum(setNum)
	if err == nil && existingSet != nil {
		return nil, fmt.Errorf("set with number %s already exists", setNum)
	}

	// Fetch from Rebrickable
	rbSet, err := s.rebrickableService.GetSet(setNum)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch set from Rebrickable: %w", err)
	}

	// Parse last modified date
	lastModified, _ := time.Parse(time.RFC3339, rbSet.LastModified)

	// Create entity
	set := &entity.Set{
		SetNum:       rbSet.SetNum,
		Name:         rbSet.Name,
		Year:         rbSet.Year,
		ThemeID:      rbSet.ThemeID,
		NumParts:     rbSet.NumParts,
		SetImageURL:  rbSet.SetImageURL,
		SetURL:       rbSet.SetURL,
		LastModified: lastModified,
	}

	err = s.setRepo.Create(set)
	if err != nil {
		return nil, fmt.Errorf("failed to create set: %w", err)
	}

	return set, nil
}

// CreateSetWithParts creates a new set and automatically imports all its parts
func (s *setService) CreateSetWithParts(setNum string) (*entity.Set, error) {
	// Create the set first
	set, err := s.createSet(setNum)
	if err != nil {
		return nil, err
	}

	// Import the parts for this set
	if s.setPartService != nil {
		err = s.setPartService.SyncSetPartsFromRebrickable(set.ID, setNum)
		if err != nil {
			// Log the error but don't fail the set creation
			fmt.Printf("Warning: failed to import parts for set %s: %v\n", setNum, err)
		}
	}

	return set, nil
}

// GetSetByID retrieves a set by ID
func (s *setService) GetSetByID(id uint) (*entity.Set, error) {
	return s.setRepo.GetByID(id)
}

// GetSetBySetNum retrieves a set by set number
func (s *setService) GetSetBySetNum(setNum string) (*entity.Set, error) {
	return s.setRepo.GetBySetNum(setNum)
}

// GetAllSets retrieves all sets
func (s *setService) GetAllSets() ([]entity.Set, error) {
	return s.setRepo.GetAll()
}

// UpdateSet updates a set
func (s *setService) UpdateSet(set *entity.Set) error {
	return s.setRepo.Update(set)
}

// DeleteSet deletes a set
func (s *setService) DeleteSet(id uint) error {
	return s.setRepo.Delete(id)
}

// SyncSetFromRebrickable syncs a set from Rebrickable API
func (s *setService) SyncSetFromRebrickable(setNum string) (*entity.Set, error) {
	// Fetch from Rebrickable
	rbSet, err := s.rebrickableService.GetSet(setNum)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch set from Rebrickable: %w", err)
	}

	// Check if set exists locally
	existingSet, err := s.setRepo.GetBySetNum(setNum)
	if err != nil {
		// Set doesn't exist, create new one
		return s.createSet(setNum)
	}

	// Update existing set
	lastModified, _ := time.Parse(time.RFC3339, rbSet.LastModified)
	existingSet.Name = rbSet.Name
	existingSet.Year = rbSet.Year
	existingSet.ThemeID = rbSet.ThemeID
	existingSet.NumParts = rbSet.NumParts
	existingSet.SetImageURL = rbSet.SetImageURL
	existingSet.SetURL = rbSet.SetURL
	existingSet.LastModified = lastModified

	err = s.setRepo.Update(existingSet)
	if err != nil {
		return nil, fmt.Errorf("failed to update set: %w", err)
	}

	return existingSet, nil
}

// GetSetWithMissingParts retrieves a set with its missing parts
func (s *setService) GetSetWithMissingParts(id uint) (*entity.Set, error) {
	return s.setRepo.GetWithMissingParts(id)
}

// GetSetWithParts retrieves a set with all its parts
func (s *setService) GetSetWithParts(id uint) (*entity.Set, error) {
	set, err := s.setRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if s.setPartService != nil {
		setParts, err := s.setPartService.GetSetParts(id)
		if err != nil {
			return nil, fmt.Errorf("failed to get set parts: %w", err)
		}
		set.SetParts = setParts
	}

	return set, nil
}
