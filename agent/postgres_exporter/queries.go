package main

// This is an example of how custom queries should be lay-out
var queries = map[string]map[string]string{
	"pg_replication_slots": {
		"v1": `SELECT slot_name, slot_type,
				  case when active then 1.0 else 0.0 end AS active,
				  age(xmin) AS xmin_age,
				  age(catalog_xmin) AS catalog_xmin_age,
				  CASE WHEN pg_is_in_recovery() THEN pg_last_wal_receive_lsn() ELSE pg_current_wal_lsn() END - restart_lsn AS restart_lsn_bytes,
				  CASE WHEN pg_is_in_recovery() THEN pg_last_wal_receive_lsn() ELSE pg_current_wal_lsn() END - confirmed_flush_lsn AS confirmed_flush_lsn_bytes
    			FROM pg_replication_slots`,
		"14": `v1`,
		"15": `v1`,
	},
}
