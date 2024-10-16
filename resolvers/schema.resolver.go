package resolvers

import (
	"backend/model"
	"context"
	"errors"
	"fmt"
	"log"
	"regexp"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type SniphubDbResolvers struct {
	Db *mongo.Database
	Ctx context.Context
}

func (snipHub *SniphubDbResolvers) langNames() []string {
	languages, err := snipHub.Db.ListCollectionNames(snipHub.Ctx, mongo.NewDeleteManyModel().Filter)
	if err != nil {
		fmt.Printf("Error: %v", err)
	}
	return languages
}
func (snipHub *SniphubDbResolvers) langList() []model.Language {
	ctx, cancel := context.WithTimeout(context.Background(), 10 * time.Second)
	defer cancel()
	_, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	langSnips := []model.Language{};
	for i := 0; i < len(snipHub.langList()); i++ {
		LangSnip := model.Language{LangName: snipHub.langNames()[i], CodeBoxes: []model.Snippet{}}
		collection := snipHub.Db.Collection(snipHub.langNames()[i])
		cur, err := collection.Find(ctx, bson.D{})
		if err != nil { log.Fatal(err) }
		defer cur.Close(ctx)
		for cur.Next(ctx) {
			var result bson.D
			err2 := cur.Decode(&result)
			LangSnip.CodeBoxes = append(LangSnip.CodeBoxes, model.Snippet{Title: fmt.Sprintf("%v", result[1].Value), Code: fmt.Sprintf("%v", result[2].Value)})
			if err2 != nil { log.Fatal(err2) }
		}
		if len(LangSnip.CodeBoxes) != 0 {
			langSnips = append(langSnips, LangSnip)
		}
		if err2 := cur.Err(); err2 != nil {
			log.Fatal(err)
		}
	}
	return langSnips
}
func (snipHub *SniphubDbResolvers) langFind(langName string) (model.Language, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10 * time.Second)
	defer cancel()
	_, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	for i := 0; i < len(snipHub.langList()); i++ {
		if snipHub.langNames()[i] != langName {
			continue
		}
		LangSnip := model.Language{LangName: snipHub.langNames()[i], CodeBoxes: []model.Snippet{}}
		collection := snipHub.Db.Collection(snipHub.langNames()[i])
		cur, err := collection.Find(ctx, bson.D{})
		if err != nil { log.Fatal(err) }
		defer cur.Close(ctx)
		for cur.Next(ctx) {
			var result bson.D
			err2 := cur.Decode(&result)
			LangSnip.CodeBoxes = append(LangSnip.CodeBoxes, model.Snippet{Title: fmt.Sprintf("%v", result[1].Value), Code: fmt.Sprintf("%v", result[2].Value)})
			if err2 != nil { log.Fatal(err2) }
		}
		if err2 := cur.Err(); err2 != nil {
			log.Fatal(err)
		}
		return LangSnip, nil
	}
	return model.Language{LangName: "Unknown", CodeBoxes: []model.Snippet{}}, errors.New("language not found")
}
func (snipHub *SniphubDbResolvers) titleFind(title string) []model.Language {
	ctx, cancel := context.WithTimeout(context.Background(), 10 * time.Second)
	defer cancel()
	_, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	langSnips := []model.Language{};
	for i := 0; i < len(snipHub.langList()); i++ {
		LangSnip := model.Language{LangName: snipHub.langNames()[i], CodeBoxes: []model.Snippet{}}
		collection := snipHub.Db.Collection(snipHub.langNames()[i])
		cur, err := collection.Find(ctx, bson.D{})
		if err != nil { log.Fatal(err) }
		defer cur.Close(ctx)
		for cur.Next(ctx) {
			var result bson.D
			err2 := cur.Decode(&result)
			match1 := regexp.MustCompile("(?i)"+ title).Match([]byte(fmt.Sprintf("%v", result[1].Value)))
			match2 := regexp.MustCompile("(?i)"+ fmt.Sprintf("%v", result[2].Value)).Match([]byte(title))
			if match1 || match2 {
				LangSnip.CodeBoxes = append(LangSnip.CodeBoxes, model.Snippet{Title: fmt.Sprintf("%v", result[1].Value), Code: fmt.Sprintf("%v", result[2].Value)})
			}
			if err2 != nil { log.Fatal(err2) }
		}
		if err2 := cur.Err(); err2 != nil {
			log.Fatal(err)
		}
		langSnips = append(langSnips, LangSnip)
	}
	return langSnips
}

func (snipHub *SniphubDbResolvers) snipAdd(snip model.SnipBox) model.Signal {
	langList := snipHub.langList()
	for i := 0; i < len(langList); i++ {
		if langList[i].LangName == snip.LangName {
			langFind, _ := snipHub.langFind(langList[i].LangName)
			for j := 0; j < len(langFind.CodeBoxes); j++ {
				if langFind.CodeBoxes[j].Title == snip.CodeBox.Title {
					return model.Signal{Status: 2, Message: "Snippet already exists"}
				}
			}
			collection := snipHub.Db.Collection(langList[i].LangName)
			_, err := collection.InsertOne(context.TODO(), bson.D{
				{Key: "title",Value: fmt.Sprintf("%v", snip.CodeBox.Title)},
				{Key: "code", Value: fmt.Sprintf("%v", snip.CodeBox.Code)}})
			if err != nil {
				log.Fatal(err)
			}
			return model.Signal{Status: 0, Message: "Snippet added successfully"}
		}
	}
	snipHub.Db.CreateCollection(context.TODO(), snip.LangName)
	snipHub.Db.Collection(snip.LangName).InsertOne(context.TODO(), bson.D{
				{Key: "title",Value: fmt.Sprintf("%v", snip.CodeBox.Title)},
				{Key: "code", Value: fmt.Sprintf("%v", snip.CodeBox.Code)}})
	return model.Signal{Status: 1, Message: "new language added with snippet"}
}
