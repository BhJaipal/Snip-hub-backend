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
	ctx, cancel := context.WithTimeout(context.TODO(), 1 * time.Second)
	defer cancel()
	snipHub, err := snipHubDB()
	if err != nil {
		log.Fatal(err)
	}
	languages, err := snipHub.ListCollectionNames(ctx, mongo.NewDeleteManyModel().Filter)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
	}
	return languages
}

func langList() []model.Language {
	ctx, cancel := context.WithTimeout(context.Background(), 1 * time.Second)
	defer cancel()
	snipHub, err := snipHubDB()
	if err != nil {
		log.Fatal(err)
	}
	langSnips := []model.Language{};
	for i := 0; i < len(langNames()); i++ {
		LangSnip := model.Language{LangName: langNames()[i], CodeBoxes: []*model.CodeBox{}}
		collection := snipHub.Collection(langNames()[i])
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
	snipHub, err := snipHubDB()
	if err != nil {
		log.Fatal(err)
	}
	langNames_ := langNames()
	for i := 0; i < len(langList()); i++ {
		if langNames()[i] != langName {
			continue
		}
		LangSnip := model.Language{LangName: langNames_[i], CodeBoxes: []*model.CodeBox{}}
		collection := snipHub.Collection(langNames_[i])
		cur, err := collection.Find(context.TODO(), bson.D{})
		if err != nil { log.Fatal(err) }
		defer cur.Close(context.TODO())
		for cur.Next(context.TODO()) {
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
func snipHubDB() (*mongo.Database, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 1 * time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoUrl()))
	if err != nil {
		log.Fatal(err)
	}
	snipHub := client.Database("snip-hub")
	if err != nil {
		return nil, err
	}
	return snipHub, nil
}
func snipHubDBContext(ctx context.Context) (*mongo.Database, error) {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoUrl()))
	if err != nil {
		log.Fatal(err)
	}
	snipHub := client.Database("snip-hub")
	if err != nil {
		return nil, err
	}
	return snipHub, nil
}