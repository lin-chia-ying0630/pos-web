# Migration Runbook

## Deploy

1. Confirm the target database and application credentials are stored in the deployment secret manager.
2. Run `./backup-mysql.sh` and verify the compressed file exists and is readable.
3. Restore that backup into an isolated MySQL instance and start the new API against the clone.
4. Run `docker compose up -d` and verify `docker compose ps` reports MySQL and API as healthy.
5. Check Flyway logs for successful validation and migration completion before sending traffic.

## Rollback

Flyway migrations are forward-only. Do not edit or delete an applied migration. For a failed deployment:

1. Stop application traffic and preserve the logs.
2. Restore the pre-deployment backup into a new database or restore the original database during an approved maintenance window.
3. Deploy the previous application image only after schema compatibility is confirmed.

## Required rehearsal

V6 and V7 change existing policy-change records. Before production rollout, execute them against a sanitized production snapshot and verify:

- No duplicate change fields remain after V6.
- Existing 002 cases have a complete `main_policy_ride` snapshot after V7.
- `P`, `S`, and `C` case status transitions still work.
- The application can query and review both migrated and newly-created cases.
