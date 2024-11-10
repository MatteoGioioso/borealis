package parser

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type expectedResult struct {
	Tables []string `json:"tables"`
	Err    string   `json:"error"`
}

func TestExtractTables(t *testing.T) {
	files, err := filepath.Glob(filepath.FromSlash("./fixtures/*.sql"))
	require.NoError(t, err)

	for _, file := range files {
		file := file
		t.Run(filepath.Base(file), func(t *testing.T) {
			d, err := os.ReadFile(file)
			require.NoError(t, err)
			query := string(d)

			goldenFile := strings.TrimSuffix(file, ".sql") + ".json"
			d, err = os.ReadFile(goldenFile)
			require.NoError(t, err)
			var expected expectedResult
			err = json.Unmarshal(d, &expected)
			require.NoError(t, err)

			t.Run("ExtractTables", func(t *testing.T) {
				t.Parallel()

				actual, err := ExtractTables(query)
				assert.Equal(t, expected.Tables, actual)
				if expected.Err != "" {
					require.EqualError(t, err, expected.Err, "err = %+v", err)
				} else {
					require.NoError(t, err)
				}
			})
		})
	}
}
