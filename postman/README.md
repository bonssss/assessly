# Assessly Postman Collection & Environment

This folder contains the official Postman API collection and environment files for the Assessly Platform.

## Files
1. `Assessly_API.postman_collection.json`: Complete endpoint collection structured by module.
2. `Assessly_Local.postman_environment.json`: Local development environment (`baseUrl: http://localhost:3000`).

## How to Import
1. Open **Postman**.
2. Click **Import** (top left).
3. Drag and drop both JSON files from this directory.
4. Select the **Assessly Local Environment** in the environment dropdown in the top right.

## Authentication Auto-Handling
* When you run `Auth -> Login User` or `Auth -> Register Student`, Postman automatically captures the JWT from `data.token` and saves it into the `{{authToken}}` environment variable.
* All protected requests (`Get Current Profile (Me)`, `Create Department`, etc.) automatically inherit and use `Bearer {{authToken}}`.

## Modules Covered
* **Health**: Root and `/api/v1/health` status checks.
* **Auth**: Registration with department enrollment, login, profile retrieval, profile updates.
* **Departments**: Public active department directory & admin creation.
* **Questions, Exams & Payments**: Planned endpoint templates ready for upcoming development phases.

