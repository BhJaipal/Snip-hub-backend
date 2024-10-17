package graph

import (
	"backend/graph/model"
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func langNames() []string {
	snipHub, ctx, err := snipHubDB()
	if err != nil {
		log.Fatal(err)
	}
	languages, err := snipHub.ListCollectionNames(ctx, bson.D{})
	if err != nil {
		log.Fatalf("Error: %v\n", err)
	}
	return languages
}

func langList() []model.Language {
	snipHub, ctx, err := snipHubDB()
	if err != nil {
		log.Fatal(err)
	}
	langSnips := []model.Language{};
	langNames_ := langNames()
	for i := 0; i < len(langNames_); i++ {
		LangSnip := model.Language{LangName: langNames_[i], CodeBoxes: []*model.CodeBox{}}
		collection := snipHub.Collection(langNames_[i])
		cur, err := collection.Find(ctx, bson.D{})
		if err != nil { log.Fatal(err) }
		defer cur.Close(ctx)
		for cur.Next(ctx) {
			var result bson.D
			err2 := cur.Decode(&result)
			LangSnip.CodeBoxes = append(LangSnip.CodeBoxes, &model.CodeBox{Title: fmt.Sprintf("%v", result[1].Value), Code: fmt.Sprintf("%v", result[2].Value)})
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


func langFind(langName string) (model.Language, error) {
	snipHub, _, err := snipHubDB()
	if err != nil {
		log.Fatal(err)
	}
	langNames_ := langNames()
	for i := 0; i < len(langNames_); i++ {
		if langNames_[i] != langName {
			continue
		}
		LangSnip := model.Language{LangName: langNames_[i], CodeBoxes: []*model.CodeBox{}}
		collection := snipHub.Collection(langNames_[i])
		cur, err := collection.Find(context.Background(), bson.D{})
		if err != nil { log.Fatal(err) }
		defer cur.Close(context.Background())
		for cur.Next(context.Background()) {
			var result bson.D
			err2 := cur.Decode(&result)
			LangSnip.CodeBoxes = append(LangSnip.CodeBoxes, &model.CodeBox{Title: fmt.Sprintf("%v", result[1].Value), Code: fmt.Sprintf("%v", result[2].Value)})
			if err2 != nil { log.Fatal(err2) }
		}
		if err2 := cur.Err(); err2 != nil {
			log.Fatal(err)
		}
		return LangSnip, nil
	}
	return model.Language{LangName: "Unknown", CodeBoxes: []*model.CodeBox{}}, errors.New("language not found")
}
func mongoUrl() string {
	return "mongodb://localhost:27017/?directConnection=true"
}
func snipHubDB() (*mongo.Database, context.Context, error) {
	ctx, _ := context.WithTimeout(context.Background(), 1 * time.Second)
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoUrl()))
	if err != nil {
		log.Fatal(err)
	}
	snipHub := client.Database("snip-hub")
	if err != nil {
		return nil, nil, err
	}
	return snipHub, ctx, nil
}
