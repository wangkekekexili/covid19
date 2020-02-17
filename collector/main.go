package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"
)

func init() {
	log.SetFlags(log.Lshortfile | log.Ltime)
}

func main() {
	var millis = time.Now().UnixNano() / 1000000
	i := 0
	var data []interface{}
	for {
		url := fmt.Sprintf("https://assets.cbndata.org/2019-nCoV/%d/data.json?timestamp=%d", i, millis*1000)
		resp, err := http.DefaultClient.Get(url)
		if err != nil {
			log.Fatalf("failed to get data: %v", err)
		}
		if resp.StatusCode != http.StatusOK {
			break
		}
		b, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			log.Fatalf("failed to get all bytes: %v", err)
		}
		m := make(map[string][]interface{})
		err = json.Unmarshal(b, &m)
		if err != nil {
			log.Fatalf("failed to unmarshal bytes: %v", err)
		}

		data = append(data, m["data"]...)

		i++
		time.Sleep(time.Second)
	}

	b, err := json.Marshal(map[string][]interface{}{"data": data})
	if err != nil {
		log.Fatalf("failed to marshal data: %v", err)
	}
	h, err := os.UserHomeDir()
	if err != nil {
		log.Fatalf("failed to get home directory: %v", err)
	}
	filename := fmt.Sprintf("%s/.covid19-%d", h, millis)
	err = ioutil.WriteFile(filename, b, 0644)
	if err != nil {
		log.Fatalf("failed to write data to file: %v", err)
	}
}
