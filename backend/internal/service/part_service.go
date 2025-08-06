package service

import (
	"github.com/BombartSimon/MissingBrick/internal/entity"
	"github.com/BombartSimon/MissingBrick/internal/repository"
)

type PartService interface {
	CreatePart(partNum string) (*entity.Part, error)
}

type partService struct {
	repo repository.PartRepository
}

// NewPartService creates a new PartService
func NewPartService(repo repository.PartRepository) PartService {
	return &partService{repo: repo}
}

// CreatePart creates a new part with the given part number
func (s *partService) CreatePart(partNum string) (*entity.Part, error) {
	part := &entity.Part{
		PartNum: partNum,
	}

	err := s.repo.Create(part)
	if err != nil {
		return nil, err
	}

	return part, nil
}
