SELECT setup::date
FROM generate_series('2024-03-01', '2024-03-12', INTERVAL '1 day') AS setup
