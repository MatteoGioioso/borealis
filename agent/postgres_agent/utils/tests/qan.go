package tests

import (
	"github.com/borealis/commons/proto"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"google.golang.org/protobuf/encoding/prototext"
)

// AssertBucketsEqual asserts that two MetricsBuckets are equal while providing a good diff.
func AssertBucketsEqual(t *testing.T, expected, actual *proto.MetricsBucket) bool {
	t.Helper()

	return assert.Equal(t, prototext.Format(expected), prototext.Format(actual))
}

// FormatBuckets formats MetricsBuckets to string for tests.
func FormatBuckets(mb []*proto.MetricsBucket) string {
	res := make([]string, len(mb))
	for i, b := range mb {
		res[i] = prototext.Format(b)
	}
	return strings.Join(res, "\n")
}
