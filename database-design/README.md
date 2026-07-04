# Database Design

PostgreSQL design artifacts — the reference for schema decisions before/while migrations are written.

| Folder | Contents                                        |
| ------ | ----------------------------------------------- |
| `erd/` | Entity-Relationship diagrams (source + exports) |
| `sql/` | Reference SQL, seed data, and helper queries    |

Also documented: data dictionary, relationships, keys, indexes, constraints, and RBAC seed data.
Owner: **Dev A** (schema sequencing). Migrations live in `../backend` and are the executable source of truth.
