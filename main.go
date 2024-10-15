package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Snippet struct {
	title string
	code string
}
type Language struct {
	langName string
	codeBoxes []Snippet
}
func (s Snippet) String () string {
	return fmt.Sprintf("{\n\t\ttitle: '%v'\n\t\tcode: \"\"\"\n%v\n\"\"\"\n\t}", s.title, s.code)
}
func (lang Language) String () string {
	strOut := "["
	for i := 0; i < len(lang.codeBoxes); i++ {
		strOut+= lang.codeBoxes[i].String()
		if len(lang.codeBoxes) -1 != i {
			strOut+= ",\n\t"
		}
	}
	strOut += "]"
	return fmt.Sprintf("{\n\tlangName: \"%v\"\n\tcodeBoxes: %v\n}", lang.langName, strOut)
}
func main() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	client, err := mongo.Connect(ctx, options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	// langSnips := []Language{};
	snipHub := client.Database("snip-hub")
	LangSnip := Language{"c", []Snippet{}}
	collection := snipHub.Collection("c")
	cur, err := collection.Find(ctx, bson.D{})
	if err != nil { log.Fatal(err) }
	defer cur.Close(ctx)
	for cur.Next(ctx) {
		var result bson.D
		err2 := cur.Decode(&result)
		LangSnip.codeBoxes = append(LangSnip.codeBoxes, Snippet{fmt.Sprintf("%v", result[1].Value), fmt.Sprintf("%v", result[2].Value)})
		if err2 != nil { log.Fatal(err2) }
	}
	println(LangSnip.String())
	// langSnips = append(langSnips, LangSnip)
	if err2 := cur.Err(); err2 != nil {
		log.Fatal(err)
	}
}
