package service_test

import (
	"testing"

	"github.com/BombartSimon/MissingBrick/internal/database"
	"github.com/BombartSimon/MissingBrick/internal/entity"
	"github.com/BombartSimon/MissingBrick/internal/repository"
	"github.com/BombartSimon/MissingBrick/internal/service"
)

func setupMissingPartsService(t *testing.T) (service.MissingPartsService, repository.MissingPartsRepository, entity.SetPart) {
	t.Helper()
	db, err := database.NewDatabase(t.TempDir() + "/missing_brick.db")
	if err != nil {
		t.Fatalf("database init: %v", err)
	}

	set := entity.Set{SetNum: "75301-1", Name: "Luke Skywalker's X-wing Fighter", Year: 2021, NumParts: 474}
	if err := db.DB.Create(&set).Error; err != nil {
		t.Fatalf("create set: %v", err)
	}
	part := entity.Part{PartNum: "3001", Name: "Brick 2 x 4"}
	if err := db.DB.Create(&part).Error; err != nil {
		t.Fatalf("create part: %v", err)
	}
	setPart := entity.SetPart{SetID: set.ID, PartID: part.ID, ColorID: 4, ColorName: "Red", ColorHex: "C91A09", Quantity: 4}
	if err := db.DB.Create(&setPart).Error; err != nil {
		t.Fatalf("create set part: %v", err)
	}

	missingRepo := repository.NewMissingPartRepository(db.DB)
	setPartRepo := repository.NewSetPartRepository(db.DB)
	return service.NewMissingPartsService(missingRepo, setPartRepo), missingRepo, setPart
}

func TestAssignMissingPartsUpsertsExistingIdentity(t *testing.T) {
	svc, repo, setPart := setupMissingPartsService(t)

	qty := 2
	created, err := svc.AssignMissingPartsToSet(int(setPart.SetID), []service.MissingPartRequest{{SetPartID: setPart.ID, Quantity: &qty}})
	if err != nil {
		t.Fatalf("first assign: %v", err)
	}
	if len(created) != 1 || created[0].Quantity != 2 {
		t.Fatalf("expected one missing part quantity 2, got %#v", created)
	}

	qty = 3
	updated, err := svc.AssignMissingPartsToSet(int(setPart.SetID), []service.MissingPartRequest{{SetPartID: setPart.ID, Quantity: &qty}})
	if err != nil {
		t.Fatalf("second assign: %v", err)
	}
	if len(updated) != 1 || updated[0].ID != created[0].ID || updated[0].Quantity != 3 {
		t.Fatalf("expected existing row updated to quantity 3, got %#v", updated)
	}

	all, err := repo.GetBySetID(setPart.SetID)
	if err != nil {
		t.Fatalf("get by set: %v", err)
	}
	if len(all) != 1 {
		t.Fatalf("expected one active missing part, got %d", len(all))
	}
}

func TestAssignMissingPartsRejectsInvalidQuantity(t *testing.T) {
	svc, _, setPart := setupMissingPartsService(t)

	qty := 5
	if _, err := svc.AssignMissingPartsToSet(int(setPart.SetID), []service.MissingPartRequest{{SetPartID: setPart.ID, Quantity: &qty}}); err == nil {
		t.Fatal("expected error for quantity greater than set part quantity")
	}
}

func TestShoppingListAggregatesMissingParts(t *testing.T) {
	svc, repo, setPart := setupMissingPartsService(t)

	qty := 2
	if _, err := svc.AssignMissingPartsToSet(int(setPart.SetID), []service.MissingPartRequest{{SetPartID: setPart.ID, Quantity: &qty}}); err != nil {
		t.Fatalf("assign: %v", err)
	}

	items, err := repo.GetShoppingList()
	if err != nil {
		t.Fatalf("shopping list: %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected one shopping list item, got %d", len(items))
	}
	if items[0].PartNum != "3001" || items[0].ColorID != 4 || items[0].TotalQuantity != 2 || items[0].SetCount != 1 {
		t.Fatalf("unexpected shopping item: %#v", items[0])
	}
}
