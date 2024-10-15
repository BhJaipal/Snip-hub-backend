package model

import "fmt"

type Snippet struct {
	title string
	code string
}
func (s Snippet) String () string {
	return fmt.Sprintf("{\n\t\ttitle: '%v'\n\t\tcode: \"\"\"\n%v\n\"\"\"\n\t}", s.title, s.code)
}