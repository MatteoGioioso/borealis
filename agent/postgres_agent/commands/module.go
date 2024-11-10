package commands

import (
	"context"
	"github.com/borealis/agent/config/pkg"
	"github.com/borealis/commons/proto"
	"github.com/borealis/postgres_agent/agents"
	"github.com/borealis/postgres_agent/cache"
	"github.com/borealis/postgres_agent/pg"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"net"
	"runtime/debug"
)

type CommandModule struct {
	*agents.Params
	server *grpc.Server
	log    *logrus.Entry
}

func (a *CommandModule) Init(config *config.Config, params *agents.Params, log *logrus.Entry) error {
	grpcServer := grpc.NewServer(
		grpc.StreamInterceptor(
			grpc_middleware.ChainStreamServer(
				grpc_recovery.StreamServerInterceptor(),
			),
		),
		grpc.UnaryInterceptor(
			grpc_middleware.ChainUnaryServer(
				grpc_recovery.UnaryServerInterceptor(
					grpc_recovery.WithRecoveryHandler(func(p interface{}) (err error) {
						return status.Errorf(codes.Unknown, "panic triggered: %v, %v", p, string(debug.Stack()))
					}),
				),
			),
		),
	)

	a.log = log.WithField("module", "command")
	a.server = grpcServer
	a.Params = params

	service := Service{
		Log:     log,
		config:  config,
		pgUtils: pg.NewPGUtils(cache.NewV2(cache.Params{}), a.log),
	}

	proto.RegisterCommandsServer(grpcServer, &service)
	return nil
}

func (a *CommandModule) Run(ctx context.Context) {
	listen, err := net.Listen("tcp", a.GrpcAddress)
	if err != nil {
		a.log.Fatalln(err)
	}

	go func() {
		if err := a.server.Serve(listen); err != nil {
			a.log.Fatalln(err)
		}
	}()

	<-ctx.Done()
	a.log.Warning("shutting down command module server")
	a.server.Stop()
	listen.Close()
}
