import os
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from doc_builder import (
    add_para, add_h1, add_h2, add_h3,
    add_bullet, add_styled_table, add_screenshot_placeholder, set_font
)

def add_chapter_two(doc):
    add_h1(doc, "CHAPTER TWO REQUIREMENT SPECIFICATION and OBJECT ORIENTED ANALYSIS")

    add_h2(doc, "2.1 Existing System")
    add_h3(doc, "2.1.1 Existing System Description")
    add_para(doc, "In the current conventional agricultural extension system operating across rural Ethiopia, information exchange, crop pathology diagnostics, and agronomic advisory services remain entirely physical, manual, paper-dependent, and geographically tethered. When a smallholder farmer observes abnormal foliar discoloration, wilting, powdery mildew, or necrotic lesions on their staple cereal or vegetable plots, the existing operational process unfolds through the following sequential manual steps:")
    add_bullet(doc, "Step 1 (Symptom Discovery): The farmer identifies abnormal symptoms on their crop while conducting routine weeding, irrigation, or field inspection.")
    add_bullet(doc, "Step 2 (Physical Journey to FTC): Because rural farmers lack direct telephone contact with agricultural specialists, the farmer must physically walk or travel via local animal transport to the Kebele Farmer Training Center (FTC) to report the issue to the resident Crop Production Development Agent (DA).")
    add_bullet(doc, "Step 3 (Agent Availability Bottleneck): Upon arriving at the Kebele FTC, the farmer frequently discovers that the Development Agent is away on field duty in a distant sub-village, attending administrative meetings at the Woreda center, or off duty. Under such circumstances, the farmer returns home without advice, losing valuable hours of manual field labor.")
    add_bullet(doc, "Step 4 (Delayed Farm Inspection): If the DA is present, the agent schedules a physical inspection visit. Due to the DA's heavy workload (often serving hundreds of farming households), this visit typically occurs 4 to 10 days later.")
    add_bullet(doc, "Step 5 (In-Field Visual Diagnosis): The extension agent physically visits the farm plot, visually examines the afflicted crop foliage, relies on personal memory or paper field manuals to diagnose the pathology, and provides verbal chemical or cultural advice.")
    add_bullet(doc, "Step 6 (Agrochemical Procurement): The farmer travels to an agro-dealer in the nearest commercial town to purchase the recommended chemical, frequently encountering stock-outs or purchasing incorrect formulations due to verbal miscommunication.")
    add_bullet(doc, "Step 7 (Manual Ledger Logging): The DA enters a brief handwritten record in a physical paper ledger at the FTC office. These ledgers are periodically aggregated into monthly summary reports sent to the Woreda Agricultural Office via public transport.")

    add_h3(doc, "2.1.2 Business Rules of the Existing System")
    add_bullet(doc, "BR-EXT-01 (Jurisdictional Restriction): A farmer is strictly permitted to seek formal agricultural extension support only from the Development Agents assigned to their official Kebele of residence.")
    add_bullet(doc, "BR-EXT-02 (Working Hours Constraint): Official extension services and FTC office consultations are accessible exclusively during formal civil service hours (Monday through Friday, 8:30 AM to 5:30 PM).")
    add_bullet(doc, "BR-EXT-03 (Mandatory Physical Inspection): Official disease diagnosis requires the physical presence of the extension agent on the afflicted farm plot.")
    add_bullet(doc, "BR-EXT-04 (Fixed Reporting Schedule): Administrative disease incidence reporting from Kebele to Woreda occurs on a rigid monthly schedule, regardless of emergency outbreak conditions.")

    add_h3(doc, "2.1.3 Drawbacks of the Existing System")
    add_bullet(doc, "Severe Diagnostic Latency: The average turnaround time between initial disease observation and expert diagnosis ranges from 5 to 12 days, during which pathogens often spread across entire fields.")
    add_bullet(doc, "Diagnostic Misclassification: Extension agents lack optical diagnostic aids; visual confusion between fungal blights and nutrient deficiencies leads to inappropriate chemical recommendations.")
    add_bullet(doc, "High Opportunity Costs: Resource-poor farmers incur financial transport expenses and lose days of productive labor traveling to distant FTC offices.")
    add_bullet(doc, "Vulnerability of Paper Ledgers: Physical records are subject to moisture, vermin, physical damage, and misplacement, preventing historical epidemiological analysis.")
    add_bullet(doc, "Absence of Early Warning Capabilities: Zonal and Regional bureaus remain unaware of emergent disease outbreaks until weeks after inception, precluding containment.")

    add_h2(doc, "2.2 New System")
    add_h3(doc, "2.2.1 Functional Requirements")
    add_para(doc, "The functional requirements of Massaye are structured across six operational subsystem modules:")
    fr_headers = ["Req ID", "Subsystem Module", "Detailed Functional Specification", "Primary Actor"]
    fr_data = [
        ["FR-AUTH-01", "Accounts & Auth", "The system shall allow Farmers, Officers, and Admins to authenticate securely using Email/Phone and Password with JWT token generation.", "All Actors"],
        ["FR-AUTH-02", "Accounts & Auth", "The system shall require Farmers during registration to specify their Region, Zone, Woreda, and Kebele for automated jurisdictional routing.", "Farmer"],
        ["FR-AUTH-03", "Accounts & Auth", "The system shall enforce Administrator verification of newly registered Agriculture Officers before granting workbench access.", "Administrator"],
        ["FR-PRED-01", "AI Diagnostics", "The system shall enable Farmers to capture real-time plant leaf photographs via mobile camera or upload from local gallery storage.", "Farmer"],
        ["FR-PRED-02", "AI Diagnostics", "The system shall transmit the image tensor to the deep learning inference service and return disease classification, confidence score, and symptom checklist.", "Farmer"],
        ["FR-PRED-03", "AI Diagnostics", "The system shall visually stream the clinical diagnosis with an interactive token-by-token animated typewriter effect to optimize perceived latency.", "Farmer"],
        ["FR-PRED-04", "AI Diagnostics", "The system shall persist successful crop disease diagnoses into the farmer's historical record while automatically rejecting non-plant or corrupt images.", "Farmer"],
        ["FR-CONS-01", "Consultations", "The system shall enable Farmers to escalate an AI prediction into a formal Consultation Ticket with field observation notes.", "Farmer"],
        ["FR-CONS-02", "Consultations", "The system shall automatically route the consultation ticket to the assigned Agriculture Officer based on the farmer's registered Kebele.", "System / Officer"],
        ["FR-CONS-03", "Consultations", "The system shall permit Lead Officers to triage and reassign consultation tickets across specialized officers within their Woreda.", "Lead Officer"],
        ["FR-CONS-04", "Consultations", "The system shall provide Officers with a clinical workbench to review symptoms, inspect high-resolution leaf images, and issue formal prescriptions.", "Officer"],
        ["FR-CONS-05", "Consultations", "The system shall transition consultation ticket states (NEW -> ASSIGNED -> WAITING_FOR_FARMER -> RESOLVED -> CLOSED).", "System / Officer"],
        ["FR-CHAT-01", "Real-Time Chat", "The system shall initialize a secure bidirectional WebSocket chat room once a consultation is assigned to an officer.", "Farmer, Officer"],
        ["FR-CHAT-02", "Real-Time Chat", "The system shall support recording, transmitting, and playing compressed audio voice notes within the consultation chat thread.", "Farmer, Officer"],
        ["FR-CHAT-03", "Real-Time Chat", "The system shall render chat messages in strictly chronological order (oldest top, newest bottom) with delivery state indicators.", "Farmer, Officer"],
        ["FR-EDUC-01", "Education Library", "The system shall allow Officers to author and publish agronomic pest-control and crop-management guides tagged by crop type and Kebele.", "Officer"],
        ["FR-EDUC-02", "Education Library", "The system shall cache educational guides locally on the mobile client for offline reading without active cellular connectivity.", "Farmer"],
        ["FR-COMM-01", "Community (Tarike)", "The system shall provide a moderated community discussion feed for farmers to share localized farming insights and weather advisories.", "Farmer, Officer"],
        ["FR-ADMN-01", "Administration", "The system shall provide Admins with hierarchical CRUD controls for Regions, Zones, Woredas, and Kebeles.", "Administrator"],
        ["FR-ADMN-02", "Administration", "The system shall permit Admins to assign officers to Kebeles and designate Woreda Lead Officers.", "Administrator"],
        ["FR-ADMN-03", "Administration", "The system shall render an epidemiological disease outbreak heatmap based on georeferenced prediction records.", "Administrator"]
    ]
    add_styled_table(doc, fr_headers, fr_data, "Table 2.1: Functional Requirements Specification Matrix")

    add_h3(doc, "2.2.2 Non-Functional Requirements and Constraints")
    add_para(doc, "The non-functional requirements define the quality attributes, architectural constraints, and performance baselines:")
    nfr_headers = ["Category", "Requirement ID", "Metric / Standard", "Specification & Implementation Constraint"]
    nfr_data = [
        ["Performance", "NFR-PERF-01", "Latency <= 3.0 sec", "AI leaf image classification inference must return within 3 seconds over standard 3G/4G connections."],
        ["Performance", "NFR-PERF-02", "Response <= 500 ms", "Standard REST API CRUD endpoints must respond within 500 milliseconds under a concurrent load of 500 requests."],
        ["Reliability", "NFR-REL-01", "Uptime >= 99.5%", "The backend services must maintain 99.5% operational availability, backed by automated process recovery."],
        ["Security", "NFR-SEC-01", "Cryptographic Hashing", "All user passwords must be hashed using the industry-standard bcrypt algorithm with salted work factors."],
        ["Security", "NFR-SEC-02", "RBAC & Token Auth", "Endpoints must enforce JSON Web Token (JWT) verification; unauthorized role access must return HTTP 403 Forbidden."],
        ["Usability", "NFR-USE-01", "Bilingual Support", "The user interface must support seamless one-touch toggling between Amharic and English across all UI components."],
        ["Usability", "NFR-USE-02", "Touch Target Size", "Action targets on the mobile app must have a minimum touch dimension of 48x48 dp to accommodate field usage."],
        ["Maintainability", "NFR-MNT-01", "Decoupled Architecture", "The system must maintain strict separation between the Presentation (Flutter/React), Business (DRF), and Data layers."],
        ["Portability", "NFR-PORT-01", "OS Compatibility", "The mobile app must execute on Android devices running Android 8.0 (API level 26) through Android 14+."]
    ]
    add_styled_table(doc, nfr_headers, nfr_data, "Table 2.2: Non-Functional Requirements and Quality Baselines")

    add_h3(doc, "2.2.3 Business Rules of the Proposed System")
    add_bullet(doc, "BR-SYS-01 (Kebele Immutability on Ticket): When a farmer creates a consultation ticket, the ticket immutably snapshots the farmer's registered Kebele at creation time. Subsequent changes to the farmer's profile do not alter historical ticket routing.")
    add_bullet(doc, "BR-SYS-02 (Farmer Mobile Lockdown): The mobile application is exclusively reserved for the Farmer role. Officers and Administrators attempting to log into the mobile application are rejected with a clear redirection to the Web Portal.")
    add_bullet(doc, "BR-SYS-03 (Officer Verification Gate): Newly registered Agriculture Officers are created in a PENDING_VERIFICATION state and cannot view consultation queues until an Administrator verifies their credentials and sets status to ACTIVE.")
    add_bullet(doc, "BR-SYS-04 (Lead Officer Delegation): Only designated Woreda Lead Officers possess the authority to reassign consultations between field officers within their jurisdiction.")
    add_bullet(doc, "BR-SYS-05 (Prediction Storage Integrity): Only authentic plant disease predictions meeting a minimum model confidence threshold (>= 60%) are persisted in the permanent PredictionHistory table; low-confidence scans are rejected without database pollution.")

    add_h3(doc, "2.2.4 System Actor Identification and Descriptions")
    add_para(doc, "The system defines four distinct actors interacting with specialized subsystems:")
    actors_headers = ["Actor Name", "Interface Classification", "Core System Responsibilities and Scope"]
    actors_data = [
        ["Farmer", "Mobile App (Flutter) / Android", "Captures leaf photos, receives AI streaming diagnoses, escalates cases into consultation tickets, chats with assigned Kebele officers, and reads offline guides."],
        ["Agriculture Officer", "Web Portal (React / Vite)", "Reviews incoming Kebele consultation tickets, inspects leaf photos, formulates clinical prescriptions, and authors localized farming guides."],
        ["Lead Officer", "Web Portal (React / Vite)", "Oversees Woreda-level consultation queues, manages Kebele specializations, and delegates tickets to specialized field officers."],
        ["Administrator", "Web Portal (React / Vite)", "Manages geographic administrative units (Region, Zone, Woreda, Kebele), verifies officer credentials, and monitors national outbreak heatmaps."]
    ]
    add_styled_table(doc, actors_headers, actors_data, "Table 2.3: Actor Role Identification Matrix")

    add_h3(doc, "2.2.5 Use Case Diagram")
    add_para(doc, "The Use Case Diagram defines the interactions between human actors, the AI inference engine, and the core functional boundaries of the system.")
    add_screenshot_placeholder(doc, "2.1", "System Use Case Diagram", "Illustrates actor interactions across Authentication, AI Diagnostics, Consultation Ticketing, Real-Time Chat, and Administrative subsystems with <<include>> and <<extend>> relationships.")

    add_h3(doc, "2.2.6 Detailed Use Case Documentation")
    add_para(doc, "Below is the detailed specification for core system use cases:")
    
    uc1_headers = ["Use Case Element", "Detailed Specification"]
    uc1_data = [
        ["Use Case ID & Name", "UC-01: Authenticate User"],
        ["Primary Actors", "Farmer, Agriculture Officer, Lead Officer, Administrator"],
        ["Preconditions", "User possesses an active account in the system database."],
        ["Postconditions", "JWT Access and Refresh tokens generated; user routed to appropriate dashboard."],
        ["Main Course of Action", "1. User opens application and inputs email/phone and password.\n2. Client transmits credentials to /api/accounts/login/.\n3. Backend validates password hash using bcrypt.\n4. System checks account status (ACTIVE vs PENDING_VERIFICATION).\n5. Backend returns JWT tokens and user profile payload.\n6. Mobile app validates role is FARMER (rejects non-farmers with web redirect).\n7. Web app routes user to Admin, Lead Officer, or Officer dashboard based on role."],
        ["Exceptions", "Invalid credentials return HTTP 401 Unauthorized. Suspended accounts return HTTP 403 Forbidden."]
    ]
    add_styled_table(doc, uc1_headers, uc1_data, "Table 2.4: Use Case Documentation UC-01 (Authenticate User)")

    uc2_headers = ["Use Case Element", "Detailed Specification"]
    uc2_data = [
        ["Use Case ID & Name", "UC-05: Capture & Scan Plant Leaf for Disease Diagnosis"],
        ["Primary Actor", "Farmer (Mobile Client)"],
        ["Secondary Actor", "AI Inference Engine (CNN Microservice)"],
        ["Preconditions", "Farmer authenticated on mobile app; camera permission granted; internet active."],
        ["Postconditions", "Disease diagnosis rendered via animated typewriter stream; persisted in PredictionHistory."],
        ["Main Course of Action", "1. Farmer taps 'Diagnose Plant' from Home Dashboard.\n2. Mobile app initializes camera viewfinder with leaf positioning overlay.\n3. Farmer captures leaf photo and confirms image clarity.\n4. Farmer taps 'Analyze Disease'.\n5. Client sends multipart image payload to /api/predictions/predict/.\n6. Backend verifies JWT, resizes tensor (224x224), and executes CNN forward pass.\n7. Model outputs disease classification, confidence score, and treatment recommendations.\n8. If confidence >= 60%, record is persisted to PredictionHistory table.\n9. Mobile app renders progressive token typewriter streaming effect.\n10. Farmer chooses to save to history or tap 'Consult an Expert'."],
        ["Exceptions", "Non-plant or blurred image returns HTTP 422 alert: 'Unclear image or plant not recognized. Please retake photo in bright lighting.' No database record created."]
    ]
    add_styled_table(doc, uc2_headers, uc2_data, "Table 2.5: Use Case Documentation UC-05 (AI Disease Diagnosis)")

    uc3_headers = ["Use Case Element", "Detailed Specification"]
    uc3_data = [
        ["Use Case ID & Name", "UC-09: Create Consultation Ticket"],
        ["Primary Actor", "Farmer"],
        ["Secondary Actor", "Assigned Kebele Agriculture Officer"],
        ["Preconditions", "Farmer completed AI scan or observed crop degradation; linked to active Kebele."],
        ["Postconditions", "Consultation ticket persisted with status ASSIGNED or NEW; officer notified."],
        ["Main Course of Action", "1. Farmer taps 'Consult an Expert' from diagnosis result screen.\n2. System pre-populates crop type, predicted disease class, and leaf photo.\n3. Farmer enters inquiry title and describes field observations.\n4. Farmer taps 'Submit Request'.\n5. System snapshots farmer's Kebele ID and queries active officer assignments.\n6. If officer assigned, ticket status sets to ASSIGNED; otherwise sets to NEW.\n7. System dispatches real-time WebSocket alert to officer's workbench.\n8. Mobile client displays confirmation ticket number (e.g. #CONS-1042)."],
        ["Exceptions", "Network interruption triggers local draft persistence and displays retry prompt."]
    ]
    add_styled_table(doc, uc3_headers, uc3_data, "Table 2.6: Use Case Documentation UC-09 (Create Consultation Ticket)")

    uc4_headers = ["Use Case Element", "Detailed Specification"]
    uc4_data = [
        ["Use Case ID & Name", "UC-11: Review & Prescribe Treatment"],
        ["Primary Actor", "Agriculture Officer"],
        ["Secondary Actor", "Farmer"],
        ["Preconditions", "Consultation ticket assigned to officer in ASSIGNED status."],
        ["Postconditions", "Prescription recorded; ticket status transitioned to RESOLVED; farmer notified."],
        ["Main Course of Action", "1. Officer logs into Web Portal and selects assigned consultation ticket.\n2. Officer inspects high-resolution leaf photos and AI prediction metadata.\n3. Officer drafts clinical prescription (causative agent, fungicide name, dosage, spray timing).\n4. Officer clicks 'Submit Prescription'.\n5. Backend updates ticket status to RESOLVED and records resolved_at timestamp.\n6. System appends prescription message into consultation thread.\n7. Push and in-app notification dispatched to farmer's mobile device.\n8. 1-on-1 direct chat room unlocks for follow-up communication."],
        ["Exceptions", "Incomplete mandatory dosage fields trigger client-side validation warnings."]
    ]
    add_styled_table(doc, uc4_headers, uc4_data, "Table 2.7: Use Case Documentation UC-11 (Prescribe Treatment)")

    add_h3(doc, "2.2.7 Sequence Diagrams")
    add_para(doc, "Sequence diagrams capture the time-ordered message exchange between participating objects:")
    add_screenshot_placeholder(doc, "2.2", "Sequence Diagram - AI Disease Diagnosis Pipeline", "Illustrates chronological interactions between Farmer Mobile Client, Scanner Bloc, Django REST API, PyTorch CNN Engine, and PostgreSQL Database.")
    add_screenshot_placeholder(doc, "2.3", "Sequence Diagram - Consultation Escalation & Prescription", "Models message sequences from Farmer consultation submission, automatic Kebele officer lookup, WebSocket notification broadcast, to Officer prescription submission.")

    add_h3(doc, "2.2.8 State Chart Diagrams")
    add_para(doc, "State chart diagrams illustrate dynamic lifecycle state transitions for core domain entities:")
    add_screenshot_placeholder(doc, "2.4", "State Chart Diagram - Consultation Ticket Lifecycle", "Details ticket states: NEW -> ASSIGNED -> WAITING_FOR_FARMER -> WAITING_FOR_OFFICER -> RESOLVED -> CLOSED.")
    add_screenshot_placeholder(doc, "2.5", "State Chart Diagram - User Account Lifecycle", "Models user state transitions: PENDING_VERIFICATION -> ACTIVE -> SUSPENDED.")

    add_h3(doc, "2.2.9 Activity Diagrams")
    add_para(doc, "The activity diagram illustrates operational decision flows across end-to-end diagnostic and advisory processes:")
    add_screenshot_placeholder(doc, "2.6", "Activity Diagram - End-to-End Disease Advisory Workflow", "Flowchart modeling user actions from photo capture, confidence threshold evaluation, animated streaming, consultation escalation, ticket triage, to prescription issuance.")

    add_h2(doc, "2.3 Key Abstraction with CRC Analysis")
    add_para(doc, "Class-Responsibility-Collaborator (CRC) cards define core conceptual abstractions:")
    crc_headers = ["Class Name", "Core Responsibilities", "Collaborating Classes"]
    crc_data = [
        ["User", "Maintains user credentials, personal profile, role (Farmer/Officer/Admin), and Kebele association.", "Kebele, RoleChoices, StatusChoices"],
        ["Kebele", "Represents rural administrative boundary; links farmers to local extension officers.", "Woreda, User, Consultation"],
        ["PredictionHistory", "Persists verified AI crop disease diagnosis, confidence score, and symptom/treatment JSON.", "User, AIInferenceEngine"],
        ["Consultation", "Manages the tele-advisory ticket lifecycle, status transitions, and assigned specialist.", "User, CropType, Kebele, ConsultationMessage"],
        ["Conversation", "Coordinates 1-on-1 private messaging, enforces user ordering, and tracks unread states.", "User, ChatMessage"],
        ["EducationGuide", "Stores agronomic best practices, pest advisories, and planting guides in Amharic and English.", "CropType, User"]
    ]
    add_styled_table(doc, crc_headers, crc_data, "Table 2.8: Class Responsibility Collaborator (CRC) Matrix")

    add_h2(doc, "2.4 Class Diagram")
    add_para(doc, "The Analysis Class Diagram defines the static structural entities, their internal attributes, methods, and relationships:")
    add_screenshot_placeholder(doc, "2.7", "Domain Analysis Class Diagram", "UML Class diagram depicting User, Kebele, Woreda, PredictionHistory, Consultation, Prescription, and ChatMessage entities with multiplicity associations.")

    add_h2(doc, "2.5 Identifying Change Cases")
    add_para(doc, "Anticipating future requirements evolution in agricultural informatics:")
    cc_headers = ["Change Case ID", "Requirement Evolution Description", "Likelihood", "Impact", "Architectural Mitigation Strategy"]
    cc_data = [
        ["CC-01", "On-Device Edge AI Inference (TFLite) for 100% offline mobile crop scanning.", "High", "Medium", "Encapsulated inference service behind a repository interface; swapping cloud REST for local TFLite requires zero UI changes."],
        ["CC-02", "Integration of Real-Time Soil & Meteorological Telemetry APIs.", "High", "Low", "Extensible Django service hooks; weather metadata can be appended to diagnostic payloads without database migration."],
        ["CC-03", "Multilingual Voice Translation (Amharic/Oromo Speech-to-Text via Whisper).", "Medium", "Medium", "Chat models store audio files with standardized URIs; background audio transcription tasks can be hooked into WebSocket consumer pipelines."],
        ["CC-04", "Administrative Kebele and Woreda Boundary Restructuring.", "Medium", "High", "Normalized relational tree architecture; boundary realignments executed via simple administrative SQL updates without code changes."]
    ]
    add_styled_table(doc, cc_headers, cc_data, "Table 2.9: Anticipated Change Cases and Mitigation Strategies")

    add_h2(doc, "2.6 User Interface Prototyping")
    add_para(doc, "Iterative UI prototyping established essential design constraints: (1) All drawer pages feature an explicit unconditional back button; (2) The diagnosis screen utilizes an animated typewriter stream to reduce user perceived waiting time; and (3) The color theme incorporates high-contrast emerald green (#1B5E20) and earth amber (#F57C00) to ensure readability under direct outdoor sunlight.")

    doc.add_page_break()
    print("Chapter 2 successfully built!")
    return doc
