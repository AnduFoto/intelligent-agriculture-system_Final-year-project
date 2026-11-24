import os
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from doc_builder import (
    add_para, add_h1, add_h2, add_h3,
    add_bullet, add_styled_table, add_screenshot_placeholder, set_font
)

def add_chapter_three(doc):
    add_h1(doc, "CHAPTER THREE OBJECT ORIENTED SYSTEM DESIGN")

    add_h2(doc, "3.1 Purpose and Goals of Design")
    add_para(doc, "The overarching purpose of the Object-Oriented System Design phase is to translate the conceptual analysis models formulated in Chapter Two into an enterprise-grade, robust, maintainable, scalable, and secure technical implementation architecture. Software design establishes the blueprints for subsystem partitioning, data persistence schemas, network communication protocols, and hardware deployment topologies. The design goals of Massaye are defined across four core dimensions:")
    add_bullet(doc, "High Cohesion and Loose Coupling: Subsystems, components, and classes are modularized such that each module encapsulates a single coherent responsibility (e.g., authentication, AI inference, consultation workflow, or real-time chat). Inter-module dependencies communicate through clearly defined interfaces and RESTful/WebSocket contracts, enabling independent testing, refactoring, and scaling.")
    add_bullet(doc, "Low-Bandwidth Rural Network Resilience: In agrarian environments across Ethiopia, cellular mobile connections fluctuate unpredictably between 2G, 3G, and 4G. The software design incorporates aggressive client-side image compression, compact JSON serialization, HTTP request caching, and idempotent REST endpoints to ensure flawless operation over high-latency networks.")
    add_bullet(doc, "Zero-Trust Security & Role Separation: Security is integrated into the architectural fabric. Role-Based Access Control (RBAC) is enforced across presentation route guards, API middleware, and database ORM querysets, guaranteeing multi-tenant privacy between farmers and preventing unauthorized data leaks.")
    add_bullet(doc, "Extensibility and Internationalization: Localization dictionaries and administrative hierarchies are structured to support future expansion to additional Ethiopian regional languages (e.g., Afaan Oromo, Tigrinya, Wolaytta) and administrative reorganizations without modifying compiled core application code.")

    add_h2(doc, "3.2 Current Software Architecture")
    add_para(doc, "The legacy conventional agricultural advisory operational environment in Ethiopia possessed no digital software architecture whatsoever. Information exchange relied entirely on physical human travel, verbal consultations, handwritten paper ledgers, and physical postal mail reporting, exhibiting zero digital persistence, zero automated verification, and zero analytical capabilities.")

    add_h2(doc, "3.3 Proposed Software Architecture")
    add_h3(doc, "3.3.1 Subsystem Decomposition")
    add_para(doc, "Massaye is structured into a Three-Tier Subsystem Decomposition Architecture spanning Presentation, Application Logic, and Data Persistence tiers:")
    add_bullet(doc, "Presentation Tier: Comprises the Flutter Mobile Application (dedicated exclusively to the Farmer role) and the React/Vite Single Page Application (SPA) Web Portal (dedicated to Extension Officers and Administrators).")
    add_bullet(doc, "Application Logic Tier: Encapsulates Nginx (reverse proxy and SSL termination), Gunicorn/Django WSGI server (handling synchronous RESTful business transactions), Daphne ASGI server (handling asynchronous WebSocket chat connections), and PyTorch Deep Learning microservices.")
    add_bullet(doc, "Data Persistence Tier: Comprises the PostgreSQL 16 relational database management system for structured ACID transactions and persistent media storage for uploaded crop photographs and voice recordings.")
    
    add_screenshot_placeholder(doc, "3.1", "Three-Tier Subsystem Decomposition Architecture", "Illustrates structural partitioning across Presentation Tier (Flutter, React), Application Tier (Nginx, Gunicorn WSGI, Daphne ASGI, PyTorch CNN), and Persistence Tier (PostgreSQL 16, Media Storage).")

    add_h3(doc, "3.3.2 Component Diagram")
    add_para(doc, "The UML Component Diagram details the software modules, public interfaces, and component dependencies:")
    add_screenshot_placeholder(doc, "3.2", "UML Component Diagram", "Shows Mobile Components (Auth, Scanner, Consultation, Chat), Web Components (Admin Dashboard, Triage Workbench, Prescription Editor), and Backend Components (REST Router, JWT Authenticator, Location Engine, Notification Dispatcher).")

    add_h2(doc, "3.4 Deployment Diagram")
    add_para(doc, "The physical deployment topology models the allocation of software processes onto physical and virtual hardware nodes:")
    add_screenshot_placeholder(doc, "3.3", "Physical System Deployment Diagram", "Depicts Farmer Android Smartphone connecting over 4G cellular to Nginx, Officer/Admin PC Browser connecting over HTTPS, and Production Ubuntu Linux Server hosting Django WSGI, Daphne ASGI, PyTorch, and PostgreSQL 16.")

    add_h2(doc, "3.5 Database Design (E-R Diagram) for Relational Database")
    add_h3(doc, "3.5.1 Conceptual and Logical Schema")
    add_para(doc, "The relational database design adheres strictly to Third Normal Form (3NF), eliminating data redundancy, update anomalies, and referential inconsistencies:")
    add_screenshot_placeholder(doc, "3.4", "Comprehensive Relational Entity-Relationship Diagram (ERD)", "Complete ERD detailing USER, KEBELE, WOREDA, PREDICTION_HISTORY, CROP_TYPE, CONSULTATION, PRESCRIPTION, CONVERSATION, and CHAT_MESSAGE entities with primary/foreign key mappings and cardinalities.")

    add_h3(doc, "3.5.2 Relational Data Dictionary and Table Structures")
    add_para(doc, "The relational data dictionary specifies table schemas, data types, constraints, and operational descriptions:")
    
    # User Table
    u_headers = ["Column Name", "Data Type", "Constraints", "Description"]
    u_data = [
        ["id", "UUID", "Primary Key, Default uuid4", "Universally unique user identifier."],
        ["email", "VARCHAR(254)", "Unique, Not Null, Indexed", "User login email address."],
        ["phone_number", "VARCHAR(20)", "Regex (+?[0-9]{9,15}), Not Null", "User contact mobile phone number."],
        ["password", "VARCHAR(128)", "Not Null", "Cryptographic salted bcrypt password hash."],
        ["first_name", "VARCHAR(100)", "Not Null", "User legal given name."],
        ["last_name", "VARCHAR(100)", "Not Null", "User legal family / father name."],
        ["role", "VARCHAR(20)", "Enum (FARMER, OFFICER, ADMINISTRATOR)", "Access control role."],
        ["status", "VARCHAR(25)", "Enum (PENDING_VERIFICATION, ACTIVE, SUSPENDED)", "Account lifecycle verification state."],
        ["language_preference", "VARCHAR(2)", "Enum ('EN', 'AM'), Default 'EN'", "Preferred user interface language."],
        ["kebele_id", "INTEGER", "Foreign Key -> locations_kebele.id, Nullable", "Linked administrative Kebele of residence."]
    ]
    add_styled_table(doc, u_headers, u_data, "Table 3.1: Relational Data Dictionary - accounts_user")

    # PredictionHistory Table
    p_headers = ["Column Name", "Data Type", "Constraints", "Description"]
    p_data = [
        ["id", "BIGINT", "Primary Key, Auto Increment", "Unique prediction record index."],
        ["user_id", "UUID", "Foreign Key -> accounts_user.id, CASCADE", "Farmer executing the diagnostic scan."],
        ["image", "VARCHAR(255)", "Not Null, File Path", "Relative path to stored crop leaf photo."],
        ["crop", "VARCHAR(100)", "Not Null, Indexed", "Botanical crop species (e.g. Tomato, Maize)."],
        ["disease_class", "VARCHAR(100)", "Not Null", "Machine learning classification label class."],
        ["display_name", "VARCHAR(150)", "Not Null", "Clean human-readable disease name."],
        ["confidence", "DOUBLE PRECISION", "Range [0.00, 100.00]", "Model inference confidence percentage."],
        ["is_healthy", "BOOLEAN", "Default False", "True if crop exhibits no disease symptoms."],
        ["solution_detail", "JSONB", "Structured JSON Object", "Diagnostic symptoms, biological, and chemical treatments."],
        ["created_at", "TIMESTAMPTZ", "Auto-now-add", "Server timestamp when scan was executed."]
    ]
    add_styled_table(doc, p_headers, p_data, "Table 3.2: Relational Data Dictionary - predictions_predictionhistory")

    # Consultation Table
    c_headers = ["Column Name", "Data Type", "Constraints", "Description"]
    c_data = [
        ["id", "BIGINT", "Primary Key, Auto Increment", "Unique consultation ticket identifier."],
        ["farmer_id", "UUID", "Foreign Key -> accounts_user.id, PROTECT", "Farmer initiating the consultation."],
        ["assigned_officer_id", "UUID", "Foreign Key -> accounts_user.id, SET_NULL", "Assigned Kebele extension specialist."],
        ["crop_type_id", "INTEGER", "Foreign Key -> consultations_croptype.id", "Crop species categorized in ticket."],
        ["kebele_id", "INTEGER", "Foreign Key -> locations_kebele.id, PROTECT", "Immutable origin Kebele at ticket creation."],
        ["title", "VARCHAR(200)", "Not Null", "Subject summary of crop symptom."],
        ["description", "TEXT", "Not Null", "Detailed field observations submitted by farmer."],
        ["status", "VARCHAR(25)", "Enum (NEW, ASSIGNED, RESOLVED, CLOSED)", "Current case workflow status."],
        ["created_at", "TIMESTAMPTZ", "Auto-now-add", "Timestamp of ticket submission."],
        ["resolved_at", "TIMESTAMPTZ", "Nullable", "Timestamp when officer issued prescription."]
    ]
    add_styled_table(doc, c_headers, c_data, "Table 3.3: Relational Data Dictionary - consultations_consultation")

    # Chat Message Table
    m_headers = ["Column Name", "Data Type", "Constraints", "Description"]
    m_data = [
        ["id", "BIGINT", "Primary Key, Auto Increment", "Unique message index."],
        ["conversation_id", "BIGINT", "Foreign Key -> chat_conversation.id, CASCADE", "Owning 1-on-1 conversation thread."],
        ["sender_id", "UUID", "Foreign Key -> accounts_user.id, CASCADE", "User authoring the message."],
        ["message_type", "VARCHAR(10)", "Enum (TEXT, IMAGE, VIDEO, VOICE, FILE)", "Payload media classification."],
        ["text_content", "TEXT", "Blank=True", "Textual message body."],
        ["media_file", "VARCHAR(255)", "Blank=True, File Path", "Relative path to audio voice note or image."],
        ["is_read", "BOOLEAN", "Default False", "Read receipt status indicator."],
        ["created_at", "TIMESTAMPTZ", "Auto-now-add", "Message dispatch timestamp."]
    ]
    add_styled_table(doc, m_headers, m_data, "Table 3.4: Relational Data Dictionary - chat_message")

    add_h2(doc, "3.6 Persistence Modelling for Object-Oriented Database")
    add_para(doc, "Persistence is realized through the Django Object-Relational Mapping (ORM) layer. Design patterns implemented in the ORM include:")
    add_bullet(doc, "Case-Insensitive Location Integrity: Custom clean() validators enforce case-insensitive uniqueness across Region, Zone, Woreda, and Kebele entities, preventing duplicate geographic nodes.")
    add_bullet(doc, "Normalized Conversation Constraints: The Conversation model overrides save() to normalize participant IDs (user1_id < user2_id), mathematically preventing duplicate one-to-one conversation rooms between the same farmer and officer.")
    add_bullet(doc, "Elimination of N+1 Query Bottlenecks: Viewsets utilize select_related('farmer', 'assigned_officer', 'kebele') and prefetch_related('images', 'messages'), ensuring complex consultation lists execute in single SQL joins.")

    add_h2(doc, "3.7 Access Control and Security")
    add_para(doc, "Massaye implements a comprehensive Role-Based Access Control (RBAC) security matrix:")
    rbac_headers = ["Resource / Operation", "Farmer Role", "Agriculture Officer", "Lead Officer", "System Administrator"]
    rbac_data = [
        ["Capture & Run AI Prediction", "Allow", "Deny (Redirect)", "Deny (Redirect)", "Deny (Redirect)"],
        ["Create Consultation Ticket", "Allow (Own Kebele)", "Deny", "Deny", "Deny"],
        ["View Assigned Consultations", "Deny", "Allow (Assigned Kebele)", "Allow (Woreda Scope)", "Allow (All System)"],
        ["Issue Official Prescription", "Deny", "Allow (Assigned Cases)", "Allow", "Deny"],
        ["Reassign Officer on Ticket", "Deny", "Deny", "Allow (Woreda Scope)", "Allow (Global Scope)"],
        ["Publish Farming Guide", "Deny", "Allow", "Allow", "Allow"],
        ["CRUD Geographic Locations", "Deny", "Deny", "Deny", "Allow"],
        ["Verify Officer Accounts", "Deny", "Deny", "Deny", "Allow"],
        ["View Outbreak GIS Heatmap", "Deny", "Allow (Woreda Scope)", "Allow (Woreda Scope)", "Allow (National Scope)"]
    ]
    add_styled_table(doc, rbac_headers, rbac_data, "Table 3.5: Role-Based Access Control (RBAC) Permission Matrix")

    doc.add_page_break()
    print("Chapter 3 successfully built!")
    return doc
