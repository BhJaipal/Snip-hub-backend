package model

import "fmt"

type Snippet struct {
	Title string
	Code string
}
func (s Snippet) String () string {
	return fmt.Sprintf("{\n\t\ttitle: \033[32m\"%v\"\033[0m\n\t\tcode: \033[32m\"\"\"\n%v\n\"\"\"\033[0m\n\t}", s.Title, s.Code)
}

type Language struct {
	LangName string
	CodeBoxes []Snippet
}
type CodeBlock struct {
	Title string
	Code string
}

type SnipBox struct {
	LangName string
	CodeBox CodeBlock
}

type Signal struct {
	Status int
	Message string
}
func (lang Language) String () string {
	strOut := "["
	for i := 0; i < len(lang.CodeBoxes); i++ {
		strOut+= lang.CodeBoxes[i].String()
		if len(lang.CodeBoxes) -1 != i {
			strOut+= ",\n\t"
		}
	}
	strOut += "]"
	return fmt.Sprintf("{\n\tlangName: \033[32m'%v'\033[0m\n\tcodeBoxes: %v\n}", lang.LangName, strOut)
}