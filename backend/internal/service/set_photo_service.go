package service

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/BombartSimon/MissingBrick/internal/entity"
	"github.com/BombartSimon/MissingBrick/internal/repository"
	"gorm.io/gorm"
)

type SetPhotoService interface {
	GetPhotos(setID uint) ([]entity.SetPhoto, error)
	UploadPhoto(setID uint, fileHeader *multipart.FileHeader, req SetPhotoRequest) (*entity.SetPhoto, error)
	UpdatePhoto(setID uint, photoID uint, req SetPhotoRequest) (*entity.SetPhoto, error)
	DeletePhoto(setID uint, photoID uint) error
}

type SetPhotoRequest struct {
	Title     *string
	PhotoType string
	IsPrimary *bool
}

type setPhotoService struct {
	setRepo   repository.SetRepository
	photoRepo repository.SetPhotoRepository
	uploadDir string
	maxBytes  int64
}

func NewSetPhotoService(setRepo repository.SetRepository, photoRepo repository.SetPhotoRepository, uploadDir string, maxUploadMB int) SetPhotoService {
	if maxUploadMB <= 0 {
		maxUploadMB = 8
	}
	return &setPhotoService{setRepo: setRepo, photoRepo: photoRepo, uploadDir: uploadDir, maxBytes: int64(maxUploadMB) * 1024 * 1024}
}

func (s *setPhotoService) GetPhotos(setID uint) ([]entity.SetPhoto, error) {
	if setID == 0 {
		return nil, ErrInvalidInput
	}
	if _, err := s.setRepo.GetByID(setID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return s.photoRepo.GetBySetID(setID)
}

func (s *setPhotoService) UploadPhoto(setID uint, fileHeader *multipart.FileHeader, req SetPhotoRequest) (*entity.SetPhoto, error) {
	if setID == 0 || fileHeader == nil {
		return nil, ErrInvalidInput
	}
	if fileHeader.Size <= 0 || fileHeader.Size > s.maxBytes {
		return nil, fmt.Errorf("%w: image must be between 1 byte and %d bytes", ErrInvalidInput, s.maxBytes)
	}
	if _, err := s.setRepo.GetByID(setID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	file, err := fileHeader.Open()
	if err != nil {
		return nil, err
	}
	defer file.Close()

	head := make([]byte, 512)
	n, err := file.Read(head)
	if err != nil && err != io.EOF {
		return nil, err
	}
	contentType := http.DetectContentType(head[:n])
	if !allowedImageType(contentType) {
		return nil, fmt.Errorf("%w: only JPEG, PNG and WebP images are supported", ErrInvalidInput)
	}
	if _, err := file.Seek(0, io.SeekStart); err != nil {
		return nil, err
	}

	photoType := normalizePhotoType(req.PhotoType)
	fileName := randomHex(16) + fileExtension(contentType)
	setDir := filepath.Join(s.uploadDir, "sets", fmt.Sprintf("%d", setID))
	if err := os.MkdirAll(setDir, 0755); err != nil {
		return nil, err
	}
	destPath := filepath.Join(setDir, fileName)
	dest, err := os.Create(destPath)
	if err != nil {
		return nil, err
	}
	if _, err := io.Copy(dest, file); err != nil {
		_ = dest.Close()
		_ = os.Remove(destPath)
		return nil, err
	}
	if err := dest.Close(); err != nil {
		_ = os.Remove(destPath)
		return nil, err
	}

	isPrimary := req.IsPrimary != nil && *req.IsPrimary
	if isPrimary {
		if err := s.photoRepo.ClearPrimary(setID); err != nil {
			_ = os.Remove(destPath)
			return nil, err
		}
	}
	photo := &entity.SetPhoto{
		SetID:        setID,
		FileName:     fileName,
		OriginalName: filepath.Base(fileHeader.Filename),
		ContentType:  contentType,
		SizeBytes:    fileHeader.Size,
		URL:          fmt.Sprintf("/uploads/sets/%d/%s", setID, fileName),
		PhotoType:    photoType,
		IsPrimary:    isPrimary,
	}
	if req.Title != nil {
		photo.Title = strings.TrimSpace(*req.Title)
	}
	if err := s.photoRepo.Create(photo); err != nil {
		_ = os.Remove(destPath)
		return nil, err
	}
	return photo, nil
}

func (s *setPhotoService) UpdatePhoto(setID uint, photoID uint, req SetPhotoRequest) (*entity.SetPhoto, error) {
	photo, err := s.getOwnedPhoto(setID, photoID)
	if err != nil {
		return nil, err
	}
	if req.Title != nil {
		photo.Title = strings.TrimSpace(*req.Title)
	}
	if req.PhotoType != "" {
		photo.PhotoType = normalizePhotoType(req.PhotoType)
	}
	if req.IsPrimary != nil {
		if *req.IsPrimary {
			if err := s.photoRepo.ClearPrimary(setID); err != nil {
				return nil, err
			}
		}
		photo.IsPrimary = *req.IsPrimary
	}
	if err := s.photoRepo.Update(photo); err != nil {
		return nil, err
	}
	return photo, nil
}

func (s *setPhotoService) DeletePhoto(setID uint, photoID uint) error {
	photo, err := s.getOwnedPhoto(setID, photoID)
	if err != nil {
		return err
	}
	if err := s.photoRepo.Delete(photoID); err != nil {
		return err
	}
	_ = os.Remove(filepath.Join(s.uploadDir, "sets", fmt.Sprintf("%d", setID), photo.FileName))
	return nil
}

func (s *setPhotoService) getOwnedPhoto(setID uint, photoID uint) (*entity.SetPhoto, error) {
	if setID == 0 || photoID == 0 {
		return nil, ErrInvalidInput
	}
	photo, err := s.photoRepo.GetByID(photoID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	if photo.SetID != setID {
		return nil, ErrNotFound
	}
	return photo, nil
}

func allowedImageType(contentType string) bool {
	switch contentType {
	case "image/jpeg", "image/png", "image/webp":
		return true
	default:
		return false
	}
}

func fileExtension(contentType string) string {
	switch contentType {
	case "image/jpeg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/webp":
		return ".webp"
	default:
		return ".img"
	}
}

func normalizePhotoType(value string) string {
	switch strings.TrimSpace(value) {
	case "box", "instructions", "storage", "build", "other":
		return strings.TrimSpace(value)
	default:
		return "other"
	}
}

func randomHex(bytesLen int) string {
	b := make([]byte, bytesLen)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("fallback-%d", os.Getpid())
	}
	return hex.EncodeToString(b)
}
