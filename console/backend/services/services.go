package services

import (
	"github.com/borealis/backend/modules"
	"github.com/borealis/backend/services/activities"
	"github.com/borealis/backend/services/analytics"
	"github.com/borealis/backend/services/info"
	"github.com/borealis/backend/services/receiver"
)

var Modules = map[string]modules.Module{
	receiver.ModuleName:   &receiver.Module{},
	info.ModuleName:       &info.Module{},
	activities.ModuleName: &activities.Module{},
	analytics.ModuleName:  &analytics.Module{},
}
