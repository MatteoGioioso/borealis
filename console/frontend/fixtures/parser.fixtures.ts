export const parserFixtures = [
    {
        input: `Parallel Hash  (cost=19973.78..19973.78 rows=1932 width=80) (actual time=34.443..34.446 rows=3394 loops=3)
                                                        Buckets: 16384 (originally 8192)  Batches: 1 (originally 1)  Memory Usage: 1248kB
                                ->  Parallel Hash  (cost=13764.12..13764.12 rows=191412 width=32) (actual time=136.362..136.363 rows=153144 loops=3)
                                      Buckets: 524288  Batches: 1  Memory Usage: 32928kB
                          ->  Hash  (cost=401.65..401.65 rows=46 width=137) (actual time=0.022..0.025 rows=0 loops=3)
                                Buckets: 1024  Batches: 1  Memory Usage: 8kB
Planning Time: 3.548 ms
Execution Time: 428.011 ms`,
        expected: [
            {
                "Plan": {
                    "Actual Loops": 3,
                    "Actual Rows": 3394,
                    "Actual Startup Time": 34.443,
                    "Actual Total Time": 34.446,
                    "Node Type": "Hash",
                    "Parallel Aware": true,
                    "Plans": [
                        {
                            "Actual Loops": 3,
                            "Actual Rows": 153144,
                            "Actual Startup Time": 136.362,
                            "Actual Total Time": 136.363,
                            "Node Type": "Hash",
                            "Parallel Aware": true,
                            "Plan Rows": 191412,
                            "Total Cost": 13764.12,
                            "Startup Cost": 13764.12,
                            "Plan Width": 32,
                            "Buckets": "524288",
                            "Batches": "1",
                            "Memory Usage": "32928"
                        },
                        {
                            "Actual Loops": 3,
                            "Actual Rows": 0,
                            "Actual Startup Time": 0.022,
                            "Actual Total Time": 0.025,
                            "Node Type": "Hash",
                            "Plan Rows": 46,
                            "Total Cost": 401.65,
                            "Startup Cost": 401.65,
                            "Plan Width": 137,
                            "Buckets": "1024",
                            "Batches": "1",
                            "Memory Usage": "8"
                        }
                    ],
                    "Plan Rows": 1932,
                    "Total Cost": 19973.78,
                    "Startup Cost": 19973.78,
                    "Plan Width": 80,
                    "Buckets": "16384",
                    "Buckets Originally": "8192",
                    "Batches": "1",
                    "Batches Originally": "1",
                    "Memory Usage": "1248"
                },
                "Planning Time": 3.548,
                "Execution Time": 428.011
            }
        ]
    },
    {
        input: `                                                                                     QUERY PLAN                                                                                     
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Gather Merge  (cost=3746920.66..10099125.47 rows=51367424 width=44) (actual time=194070.494..220324.361 rows=19160881 loops=1)
         Workers Planned: 8
         Workers Launched: 8
         ->  Sort  (cost=3745920.52..3761972.84 rows=6420928 width=44) (actual time=51300.644..53486.394 rows=2128987 loops=9)
               Sort Key: d.name, (SUBSTRING(d.value FROM 1 FOR 255))
               Sort Method: quicksort  Memory: 181483kB
               Worker 0:  Sort Method: external merge  Disk: 379728kB
               Worker 1:  Sort Method: quicksort  Memory: 34800kB
               Worker 2:  Sort Method: quicksort  Memory: 42741kB
               Worker 3:  Sort Method: external merge  Disk: 846744kB
               Worker 4:  Sort Method: quicksort  Memory: 58495kB
               Worker 5:  Sort Method: quicksort  Memory: 33308kB
               Worker 6:  Sort Method: quicksort  Memory: 40501kB
               Worker 7:  Sort Method: quicksort  Memory: 306044kB
               ->  Partial HashAggregate  (cost=2672790.48..3019894.94 rows=6420928 width=44) (actual time=24668.113..25984.895 rows=2128987 loops=9)
                     Group Key: d.name, SUBSTRING(d.value FROM 1 FOR 255)
                     Planned Partitions: 4  Batches: 1  Memory Usage: 253969kB
                     Worker 0:  Batches: 5  Memory Usage: 524337kB  Disk Usage: 175520kB
                     Worker 1:  Batches: 1  Memory Usage: 131089kB
                     Worker 2:  Batches: 1  Memory Usage: 147473kB
                     Worker 3:  Batches: 5  Memory Usage: 524337kB  Disk Usage: 544128kB
                     Worker 4:  Batches: 1  Memory Usage: 139281kB
                     Worker 5:  Batches: 1  Memory Usage: 122897kB
                     Worker 6:  Batches: 1  Memory Usage: 131089kB
                     Worker 7:  Batches: 1  Memory Usage: 393233kB
 Planning Time: 21.015 ms
 Execution Time: 227841.764 ms
(236 rows)
`,
        expected: [
            {
                "Plan": {
                    "Actual Loops": 1,
                    "Actual Rows": 19160881,
                    "Actual Startup Time": 194070.494,
                    "Actual Total Time": 220324.361,
                    "Node Type": "Gather Merge",
                    "Plans": [
                        {
                            "Actual Loops": 9,
                            "Actual Rows": 2128987,
                            "Actual Startup Time": 51300.644,
                            "Actual Total Time": 53486.394,
                            "Node Type": "Sort",
                            "Plans": [
                                {
                                    "Actual Loops": 9,
                                    "Actual Rows": 2128987,
                                    "Actual Startup Time": 24668.113,
                                    "Actual Total Time": 25984.895,
                                    "Node Type": "Partial HashAggregate",
                                    "Plan Rows": 6420928,
                                    "Total Cost": 3019894.94,
                                    "Workers": [
                                        {
                                            "Worker Number": 0,
                                            "Memory Usage": "524337",
                                            "Disk Usage": "175520",
                                            "Batches": "5"
                                        },
                                        {
                                            "Worker Number": 1,
                                            "Memory Usage": "131089",
                                            "Batches": "1"
                                        },
                                        {
                                            "Worker Number": 2,
                                            "Memory Usage": "147473",
                                            "Batches": "1"
                                        },
                                        {
                                            "Worker Number": 3,
                                            "Memory Usage": "524337",
                                            "Disk Usage": "544128",
                                            "Batches": "5"
                                        },
                                        {
                                            "Worker Number": 4,
                                            "Memory Usage": "139281",
                                            "Batches": "1"
                                        },
                                        {
                                            "Worker Number": 5,
                                            "Memory Usage": "122897",
                                            "Batches": "1"
                                        },
                                        {
                                            "Worker Number": 6,
                                            "Memory Usage": "131089",
                                            "Batches": "1"
                                        },
                                        {
                                            "Worker Number": 7,
                                            "Memory Usage": "393233",
                                            "Batches": "1"
                                        }
                                    ],
                                    "Startup Cost": 2672790.48,
                                    "Plan Width": 44,
                                    "Group Key": "d.name, SUBSTRING(d.value FROM 1 FOR 255)",
                                    "Planned Partitions": 4
                                }
                            ],
                            "Plan Rows": 6420928,
                            "Total Cost": 3761972.84,
                            "Workers": [
                                {
                                    "Worker Number": 0,
                                    "Sort Method": "external merge",
                                    "Sort Space Used": "379728",
                                    "Sort Space Type": "Disk"
                                },
                                {
                                    "Worker Number": 1,
                                    "Sort Method": "quicksort",
                                    "Sort Space Used": "34800",
                                    "Sort Space Type": "Memory"
                                },
                                {
                                    "Worker Number": 2,
                                    "Sort Method": "quicksort",
                                    "Sort Space Used": "42741",
                                    "Sort Space Type": "Memory"
                                },
                                {
                                    "Worker Number": 3,
                                    "Sort Method": "external merge",
                                    "Sort Space Used": "846744",
                                    "Sort Space Type": "Disk"
                                },
                                {
                                    "Worker Number": 4,
                                    "Sort Method": "quicksort",
                                    "Sort Space Used": "58495",
                                    "Sort Space Type": "Memory"
                                },
                                {
                                    "Worker Number": 5,
                                    "Sort Method": "quicksort",
                                    "Sort Space Used": "33308",
                                    "Sort Space Type": "Memory"
                                },
                                {
                                    "Worker Number": 6,
                                    "Sort Method": "quicksort",
                                    "Sort Space Used": "40501",
                                    "Sort Space Type": "Memory"
                                },
                                {
                                    "Worker Number": 7,
                                    "Sort Method": "quicksort",
                                    "Sort Space Used": "306044",
                                    "Sort Space Type": "Memory"
                                }
                            ],
                            "Startup Cost": 3745920.52,
                            "Plan Width": 44,
                            "Sort Key": [
                                "d.name",
                                "(SUBSTRING(d.value FROM 1 FOR 255))"
                            ],
                            "Sort Method": "quicksort",
                            "Sort Space Used": "181483",
                            "Sort Space Type": "Memory"
                        }
                    ],
                    "Plan Rows": 51367424,
                    "Total Cost": 10099125.47,
                    "Workers Launched": 8,
                    "Workers Planned": 8,
                    "Startup Cost": 3746920.66,
                    "Plan Width": 44,
                    "Planning Time": 21.015,
                    "Execution Time": 227841.764
                }
            }
        ]
    }
]