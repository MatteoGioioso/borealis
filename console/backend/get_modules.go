// THIS FILE IS AUTO GENERATED
package main

import (
	"github.com/borealis/backend/modules"
	"github.com/borealis/backend/services"
)

func GetModules() (map[string]modules.Module, error) {
	return services.Modules, nil
}
