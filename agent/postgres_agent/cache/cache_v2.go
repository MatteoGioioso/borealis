package cache

import (
	"context"
	"github.com/eko/gocache/lib/v4/cache"
	"github.com/eko/gocache/lib/v4/store"
	gocachestore "github.com/eko/gocache/store/go_cache/v4"
	gocache "github.com/patrickmn/go-cache"
	"github.com/pkg/errors"
	"time"
)

// TODO migrate to this cache

type Params struct {
	DefaultExpiration time.Duration
	CleanupInterval   time.Duration
}

type CacheV2 struct {
	client *cache.Cache[[]byte]
}

func NewV2(params Params) *CacheV2 {
	client := gocache.New(10*time.Minute, 10*time.Minute)
	return &CacheV2{client: cache.New[[]byte](gocachestore.NewGoCache(client))}
}

func (c CacheV2) Get(ctx context.Context, key string) (string, error) {
	get, err := c.client.Get(ctx, key)
	if errors.Is(err, store.NotFound{}) {
		return "", nil
	}
	if err != nil {
		return "", err
	}

	return string(get), nil
}

func (c CacheV2) Set(ctx context.Context, key string, data []byte) error {
	return c.client.Set(ctx, key, data)
}
