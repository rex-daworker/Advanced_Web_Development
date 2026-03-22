# 1️⃣ CREATE – RResource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js and resources.js)
    participant B as Backend (Express Route)
    participant V as express-validator
    participant S as Resource Service
    participant DB as PostgreSQL

    U->>F: Submit form
    F->>F: Client-side validation
    F->>B: POST /api/resources (JSON)

    B->>V: Validate request
    V-->>B: Validation result

    alt Validation fails
        B-->>F: 400 Bad Request + errors[]
        F-->>U: Show validation message
    else Validation OK
        B->>S: create Resource(data)
        S->>DB: INSERT INTO resources
        DB-->>S: Result / Duplicate error

        alt Duplicate
            S-->>B: Duplicate detected
            B-->>F: 409 Conflict
            F-->>U: Show duplicate message
        else Success
            S-->>B: Created resource
            B-->>F: 201 Created
            F-->>U: Show success message
        end
    end
```

# 2️⃣ READ — List of all Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (resources.js)
    participant B as Backend (Express Route)
    participant S as Resource Service (implicit)
    participant DB as PostgreSQL

    U->>F: Load list / refresh
    F->>B: GET /api/resources

    B->>DB: SELECT * FROM resources ORDER BY created_at DESC
    DB-->>B: rows[]

    alt Query successful
        B-->>F: 200 OK + {ok: true, data: [...]}
        F-->>U: Render resource list / table
    else Database error
        B-->>F: 500 + {ok: false, error: "Database error"}
        F-->>U: Show error message
    end
```

# 2️⃣ READ — Single Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (resources.js or form.js)
    participant B as Backend (Express Route)
    participant DB as PostgreSQL

    U->>F: Click Edit / view details (id = 42)
    F->>B: GET /api/resources/42

    B->>B: Check if id is valid number
    alt Invalid ID (NaN)
        B-->>F: 400 + {ok: false, error: "Invalid ID"}
        F-->>U: Show error message
    else Valid ID
        B->>DB: SELECT * FROM resources WHERE id = $1
        DB-->>B: rows[0] or []

        alt Resource found
            B-->>F: 200 + {ok: true, data: {...}}
            F-->>U: Fill edit form / show details
        else Not found
            B-->>F: 404 + {ok: false, error: "Resource not found"}
            F-->>U: Show "not found" message
        end
    end
```

# 3️⃣ UPDATE — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (form.js)
    participant B as Backend (Express Route)
    participant V as express-validator
    participant DB as PostgreSQL

    U->>F: Edit fields → Submit form
    F->>F: Basic client-side checks (if any)
    F->>B: PUT /api/resources/:id (JSON body)

    B->>B: Parse :id → Number
    alt Invalid ID
        B-->>F: 400 + {ok: false, error: "Invalid ID"}
    else Valid ID
        B->>V: Run resourceValidators
        V-->>B: Validation result

        alt Validation fails
            B-->>F: 400 + {ok: false, errors: [...]}
            F-->>U: Show field errors
        else Validation passes
            B->>DB: UPDATE resources SET ... WHERE id = $6 RETURNING *
            DB-->>B: rows[0] or []

            alt Updated (row found)
                B->>B: logEvent("Resource updated ...")
                B-->>F: 200 + {ok: true, data: updatedResource}
                F-->>U: Show success + refresh list / close form
            else Not found
                B-->>F: 404 + {ok: false, error: "Resource not found"}
                F-->>U: Show "not found" message
            else Duplicate name (23505)
                B-->>F: 409 + {ok: false, error: "Duplicate resource name"}
                F-->>U: Show duplicate warning
            else DB error
                B-->>F: 500 + {ok: false, error: "Database error"}
                F-->>U: Show server error
            end
        end
    end
```

# 4️⃣ DELETE — Resource (Sequence Diagram)

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as Frontend (resources.js)
    participant B as Backend (Express Route)
    participant DB as PostgreSQL

    U->>F: Click Delete button (id = 42)
    F->>B: DELETE /api/resources/42

    B->>B: Parse :id → Number
    alt Invalid ID
        B-->>F: 400 + {ok: false, error: "Invalid ID"}
        F-->>U: Show error
    else Valid ID
        B->>DB: DELETE FROM resources WHERE id = $1
        DB-->>B: rowCount

        alt Deleted (rowCount > 0)
            B->>B: logEvent("Resource deleted ...")
            B-->>F: 204 No Content
            F-->>U: Remove row from list / show success
        else Not found (rowCount = 0)
            B-->>F: 404 + {ok: false, error: "Resource not found"}
            F-->>U: Show "not found" message
        else DB error
            B-->>F: 500 + {ok: false, error: "Database error"}
            F-->>U: Show server error
        end
    end
```