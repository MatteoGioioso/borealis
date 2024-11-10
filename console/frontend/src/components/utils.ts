export const QUERY_PLAN_EXAMPLE_PLACEHOLDER = `[
  {
    "Plan": {
      "Node Type": "Seq Scan",
      "Parallel Aware": false,
      "Relation Name": "people",
      "Alias": "people",
      "Filter": "((first_name)::text = 'Alice'::text)",
      "Startup Cost": 0.00,
      "Total Cost": 16.49,
      "Plan Rows": 2,
      "Plan Width": 1032,
      "Actual Startup Time": 0.099,
      "Actual Total Time": 0.357,
      "Actual Rows": 2,
      "Actual Loops": 1,
      "Rows Removed by Filter": 2684
    },
    "Planning Time": 0.108,    
    "Execution Time": 0.381,
    "Triggers": []
  }
]`


export const QUERY_EXAMPLE_PLACEHOLDER = `SELECT DISTINCT city
                                          FROM weather
                                          ORDER BY city;`