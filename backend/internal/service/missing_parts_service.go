package service

import (
	"errors"
	"fmt"

	"github.com/BombartSimon/MissingBrick/internal/entity"
	"github.com/BombartSimon/MissingBrick/internal/repository"
	"gorm.io/gorm"
)

type MissingPartsService interface {
	AssignMissingPartsToSet(setID int, partRequests []MissingPartRequest) ([]*entity.MissingPart, error)
	GetMissingPartsBySetID(setID int) ([]entity.MissingPart, error)
	GetAllMissingParts() ([]entity.MissingPart, error)
	GetShoppingList() ([]repository.ShoppingListItem, error)
	UpdateMissingPart(missingPartID int, req UpdateMissingPartRequest) (*entity.MissingPart, error)
	MarkPartAsFound(setID int, partID int) error
	DeleteMissingPart(missingPartID int) error
}

type MissingPartRequest struct {
	SetPartID uint `json:"set_part_id"`
	Quantity  *int `json:"quantity,omitempty"`
}

type UpdateMissingPartRequest struct {
	Quantity *int    `json:"quantity,omitempty"`
	Notes    *string `json:"notes,omitempty"`
}

type missingPartsService struct {
	missingPartsRepo repository.MissingPartsRepository
	setPartRepo      repository.SetPartRepository
}

func NewMissingPartsService(missingPartsRepo repository.MissingPartsRepository, setPartRepo repository.SetPartRepository) MissingPartsService {
	return &missingPartsService{
		missingPartsRepo: missingPartsRepo,
		setPartRepo:      setPartRepo,
	}
}

func (s *missingPartsService) AssignMissingPartsToSet(setID int, partRequests []MissingPartRequest) ([]*entity.MissingPart, error) {
	if setID <= 0 || len(partRequests) == 0 {
		return nil, ErrInvalidInput
	}

	var missingParts []*entity.MissingPart
	for _, partRequest := range partRequests {
		if partRequest.SetPartID == 0 {
			return nil, fmt.Errorf("%w: set_part_id is required", ErrInvalidInput)
		}

		setPart, err := s.setPartRepo.GetByID(partRequest.SetPartID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return nil, fmt.Errorf("%w: set part %d", ErrNotFound, partRequest.SetPartID)
			}
			return nil, fmt.Errorf("failed to get set part with ID %d: %w", partRequest.SetPartID, err)
		}

		if setPart.SetID != uint(setID) {
			return nil, fmt.Errorf("%w: set part %d does not belong to set %d", ErrInvalidInput, partRequest.SetPartID, setID)
		}

		missingQuantity := setPart.Quantity
		if partRequest.Quantity != nil {
			missingQuantity = *partRequest.Quantity
		}
		if missingQuantity <= 0 {
			return nil, fmt.Errorf("%w: missing quantity must be positive", ErrInvalidInput)
		}
		if missingQuantity > setPart.Quantity {
			return nil, fmt.Errorf("%w: missing quantity %d cannot be greater than set quantity %d", ErrInvalidInput, missingQuantity, setPart.Quantity)
		}

		missingPart, err := s.missingPartsRepo.GetActiveByIdentity(uint(setID), setPart.PartID, setPart.ColorID)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("failed to check existing missing part: %w", err)
		}

		if missingPart != nil {
			missingPart.Quantity = missingQuantity
			missingPart.ColorName = setPart.ColorName
			missingPart.ColorHex = setPart.ColorHex
			missingPart.IsMissing = true
			if err := s.missingPartsRepo.Update(missingPart); err != nil {
				return nil, fmt.Errorf("failed to update missing part: %w", err)
			}
			missingParts = append(missingParts, missingPart)
			continue
		}

		missingPart = &entity.MissingPart{
			SetID:     uint(setID),
			PartID:    setPart.PartID,
			ColorID:   setPart.ColorID,
			ColorName: setPart.ColorName,
			ColorHex:  setPart.ColorHex,
			Quantity:  missingQuantity,
			IsMissing: true,
		}
		if err := s.missingPartsRepo.Create(missingPart); err != nil {
			return nil, fmt.Errorf("failed to create missing part: %w", err)
		}
		missingParts = append(missingParts, missingPart)
	}

	return missingParts, nil
}

func (s *missingPartsService) GetMissingPartsBySetID(setID int) ([]entity.MissingPart, error) {
	if setID <= 0 {
		return nil, ErrInvalidInput
	}
	return s.missingPartsRepo.GetBySetID(uint(setID))
}

func (s *missingPartsService) GetAllMissingParts() ([]entity.MissingPart, error) {
	return s.missingPartsRepo.GetAll()
}

func (s *missingPartsService) GetShoppingList() ([]repository.ShoppingListItem, error) {
	return s.missingPartsRepo.GetShoppingList()
}

func (s *missingPartsService) UpdateMissingPart(missingPartID int, req UpdateMissingPartRequest) (*entity.MissingPart, error) {
	if missingPartID <= 0 {
		return nil, ErrInvalidInput
	}
	missingPart, err := s.missingPartsRepo.GetByID(uint(missingPartID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	if req.Quantity != nil {
		if *req.Quantity <= 0 {
			return nil, fmt.Errorf("%w: quantity must be positive", ErrInvalidInput)
		}
		missingPart.Quantity = *req.Quantity
	}
	if req.Notes != nil {
		missingPart.Notes = *req.Notes
	}
	if err := s.missingPartsRepo.Update(missingPart); err != nil {
		return nil, err
	}
	return missingPart, nil
}

func (s *missingPartsService) MarkPartAsFound(setID int, partID int) error {
	return s.missingPartsRepo.MarkAsFound(uint(setID), uint(partID))
}

func (s *missingPartsService) DeleteMissingPart(missingPartID int) error {
	if missingPartID <= 0 {
		return ErrInvalidInput
	}
	return s.missingPartsRepo.Delete(uint(missingPartID))
}
