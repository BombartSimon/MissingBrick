package service_test

import (
	"bytes"
	"mime/multipart"
	"testing"

	"github.com/BombartSimon/MissingBrick/internal/database"
	"github.com/BombartSimon/MissingBrick/internal/entity"
	"github.com/BombartSimon/MissingBrick/internal/repository"
	"github.com/BombartSimon/MissingBrick/internal/service"
)

func setupSetPhotoTest(t *testing.T) (service.SetService, service.SetPhotoService, entity.Set) {
	t.Helper()
	db, err := database.NewDatabase(t.TempDir() + "/missing_brick.db")
	if err != nil {
		t.Fatalf("database init: %v", err)
	}

	set := entity.Set{SetNum: "75301-1", Name: "Luke Skywalker's X-wing Fighter", BuildStatus: "not_started"}
	if err := db.DB.Create(&set).Error; err != nil {
		t.Fatalf("create set: %v", err)
	}

	setRepo := repository.NewSetRepository(db.DB)
	photoRepo := repository.NewSetPhotoRepository(db.DB)
	setSvc := service.NewSetService(setRepo, nil, nil)
	photoSvc := service.NewSetPhotoService(setRepo, photoRepo, t.TempDir(), 1)
	return setSvc, photoSvc, set
}

func TestUpdateSetNotesRejectsInvalidBuildStatus(t *testing.T) {
	setSvc, _, set := setupSetPhotoTest(t)

	if _, err := setSvc.UpdateSetNotes(set.ID, service.UpdateSetNotesRequest{BuildStatus: "invalid"}); err == nil {
		t.Fatal("expected invalid status error")
	}
}

func TestUploadPhotoAndPrimarySwitch(t *testing.T) {
	_, photoSvc, set := setupSetPhotoTest(t)
	primary := true

	first, err := photoSvc.UploadPhoto(set.ID, pngFileHeader(t, "first.png"), service.SetPhotoRequest{PhotoType: "box", IsPrimary: &primary})
	if err != nil {
		t.Fatalf("upload first: %v", err)
	}
	if !first.IsPrimary || first.PhotoType != "box" {
		t.Fatalf("unexpected first photo: %#v", first)
	}

	second, err := photoSvc.UploadPhoto(set.ID, pngFileHeader(t, "second.png"), service.SetPhotoRequest{PhotoType: "build", IsPrimary: &primary})
	if err != nil {
		t.Fatalf("upload second: %v", err)
	}
	if !second.IsPrimary {
		t.Fatalf("expected second primary")
	}

	photos, err := photoSvc.GetPhotos(set.ID)
	if err != nil {
		t.Fatalf("get photos: %v", err)
	}
	primaryCount := 0
	for _, photo := range photos {
		if photo.IsPrimary {
			primaryCount++
		}
	}
	if primaryCount != 1 {
		t.Fatalf("expected exactly one primary photo, got %d", primaryCount)
	}
}

func TestUploadPhotoRejectsNonImage(t *testing.T) {
	_, photoSvc, set := setupSetPhotoTest(t)
	if _, err := photoSvc.UploadPhoto(set.ID, textFileHeader(t), service.SetPhotoRequest{}); err == nil {
		t.Fatal("expected non-image upload to be rejected")
	}
}

func pngFileHeader(t *testing.T, name string) *multipart.FileHeader {
	t.Helper()
	png := []byte{0x89, 'P', 'N', 'G', '\r', '\n', 0x1a, '\n', 0, 0, 0, '\r', 'I', 'H', 'D', 'R'}
	return fileHeader(t, name, png)
}

func textFileHeader(t *testing.T) *multipart.FileHeader {
	t.Helper()
	return fileHeader(t, "notes.txt", []byte("not an image"))
}

func fileHeader(t *testing.T, name string, content []byte) *multipart.FileHeader {
	t.Helper()
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("photo", name)
	if err != nil {
		t.Fatalf("create form file: %v", err)
	}
	if _, err := part.Write(content); err != nil {
		t.Fatalf("write form file: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("close writer: %v", err)
	}

	reader := multipart.NewReader(bytes.NewReader(body.Bytes()), writer.Boundary())
	form, err := reader.ReadForm(int64(body.Len()))
	if err != nil {
		t.Fatalf("read form: %v", err)
	}
	files := form.File["photo"]
	if len(files) != 1 {
		t.Fatalf("expected one file")
	}
	return files[0]
}
