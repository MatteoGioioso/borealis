package utils

import (
	"context"
	"github.com/sirupsen/logrus"
	"golang.org/x/sys/unix"
	"os"
	"os/signal"
)

func GetContext(log *logrus.Entry) context.Context {
	ctx, cancel := context.WithCancel(context.Background())

	signals := make(chan os.Signal, 1)
	signal.Notify(signals, unix.SIGTERM, unix.SIGINT)
	go func() {
		sig := <-signals
		signal.Stop(signals)
		log.Warnf("Got %s, shutting down...", unix.SignalName(sig.(unix.Signal)))
		cancel()
	}()

	return ctx
}
