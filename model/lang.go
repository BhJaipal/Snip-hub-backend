package model

import "fmt"

type Language struct {
	langName string
	codeBoxes []Snippet
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