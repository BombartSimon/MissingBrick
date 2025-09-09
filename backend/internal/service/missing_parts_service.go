package service

import (
	"fmt"

	"github.com/BombartSimon/MissingBrick/internal/entity"
	"github.com/BombartSimon/MissingBrick/internal/repository"
)

type MissingPartsService interface {
	AssignMissingPartsToSet(setID int, partRequests []MissingPartRequest) ([]*entity.MissingPart, error)
	GetMissingPartsBySetID(setID int) ([]entity.MissingPart, error)
	MarkPartAsFound(setID int, partID int) error
	DeleteMissingPart(missingPartID int) error
}

type MissingPartRequest struct {
	SetPartID uint `json:"set_part_id"`
	Quantity  *int `json:"quantity,omitempty"`
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
	var missingParts []*entity.MissingPart

	for _, partRequest := range partRequests {
		setPart, err := s.setPartRepo.GetByID(partRequest.SetPartID)
		if err != nil {
			return nil, fmt.Errorf("failed to get set part with ID %d: %w", partRequest.SetPartID, err)
		}

		if setPart.SetID != uint(setID) {
			return nil, fmt.Errorf("set part %d does not belong to set %d", partRequest.SetPartID, setID)
		}

		missingQuantity := setPart.Quantity
		if partRequest.Quantity != nil {
			missingQuantity = *partRequest.Quantity

			if missingQuantity > setPart.Quantity {
				return nil, fmt.Errorf("missing quantity (%d) cannot be greater than set quantity (%d) for set_part_id %d",
					missingQuantity, setPart.Quantity, partRequest.SetPartID)
			}

			if missingQuantity <= 0 {
				return nil, fmt.Errorf("missing quantity must be positive for set_part_id %d", partRequest.SetPartID)
			}
		}

		missingPart := &entity.MissingPart{
			SetID:     uint(setID),
			PartID:    setPart.PartID,
			ColorID:   setPart.ColorID,
			ColorName: setPart.ColorName,
			ColorHex:  setPart.ColorHex,
			Quantity:  missingQuantity,
			IsMissing: true,
		}

		// TODO: Vérifier si cette pièce n'est pas déjà marquée comme manquante pour ce set
		// pour éviter les doublons

		if err := s.missingPartsRepo.Create(missingPart); err != nil {
			return nil, fmt.Errorf("failed to create missing part: %w", err)
		}
		missingParts = append(missingParts, missingPart)
	}

	return missingParts, nil
}

func (s *missingPartsService) GetMissingPartsBySetID(setID int) ([]entity.MissingPart, error) {
	missingParts, err := s.missingPartsRepo.GetBySetID(uint(setID))
	if err != nil {
		return nil, err
	}

	return missingParts, nil
}

func (s *missingPartsService) MarkPartAsFound(setID int, partID int) error {
	err := s.missingPartsRepo.MarkAsFound(uint(setID), uint(partID))
	if err != nil {
		return fmt.Errorf("failed to mark part as found: %w", err)
	}

	return nil
}

func (s *missingPartsService) DeleteMissingPart(missingPartID int) error {
	err := s.missingPartsRepo.Delete(uint(missingPartID))
	if err != nil {
		return fmt.Errorf("failed to delete missing part: %w", err)
	}

	return nil
}
