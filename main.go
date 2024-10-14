package main

import (
	"fmt"
)

type human struct {
	name string
	age uint8
	isMale bool
}
func (h human) String() string {
	return fmt.Sprintf("Name: %s\nAge: %d\nIsMale: %t", h.name, h.age, h.isMale)
}

func fibonacci(n uint8) uint8 {
	if (n == 0 || n == 1) {
		return n
	} else {
		return fibonacci(n-1) + fibonacci(n-2)
	}
}

func main() {
	jaipal := human{name: "Jaipal", age: 20, isMale: true}

	fmt.Println(jaipal)
	for i:=1; i <= 15; i++ {
		if i % 15 == 0 {
			fmt.Println("FizzBuzz")
		} else if i % 3 == 0 {
			fmt.Println("Fizz")
		} else if i % 5 == 0 {
			fmt.Println("Buzz")
		} else {
			fmt.Println(i)
		}
	}

	fmt.Println(fibonacci(10))
}