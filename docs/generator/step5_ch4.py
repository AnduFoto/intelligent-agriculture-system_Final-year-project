import os
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from doc_builder import (
    add_para, add_h1, add_h2, add_h3,
    add_bullet, add_styled_table, add_screenshot_placeholder, set_font
)

def add_chapter_four(doc):
    add_h1(doc, "CHAPTER FOUR IMPLEMENTATION, TESTING, AND MAINTENANCE")

    add_h2(doc, "4.1 Introduction to Languages, IDEs, Tools, and Technologies Used for Implementation")
    add_para(doc, "The implementation phase of Massaye realized the conceptual analysis and architectural design models into industrial, production-grade source code. Development was structured across specialized technology stacks:")
    add_bullet(doc, "Backend Web & API Framework: Built using Python 3.11 with Django 5.1 and Django REST Framework (DRF 3.15). Development was conducted within Visual Studio Code and JetBrains PyCharm Professional IDEs. Relational persistence was managed via PostgreSQL 16 on Ubuntu Linux. Real-time WebSocket protocol handling utilized Django Channels 4.x running under the Daphne ASGI application server.")
    add_bullet(doc, "Mobile Application Framework: Developed using the Dart 3.5.x programming language on Flutter 3.24.x SDK. Target execution binaries were compiled into native Android Application Packages (APK). The mobile architecture implemented the BLoC (Business Logic Component) reactive state management library (flutter_bloc 8.1.6). Network communication utilized the Dio 5.11 HTTP client with custom bearer token interceptors, while hardware camera integration leveraged image_picker and native Android camera permissions.")
    add_bullet(doc, "Web Management Portal: Developed using the React 18 library orchestrated via the Vite 5 build tool. The web interface utilizes Tailwind CSS 3.4 for responsive utility styling, Lucide React for consistent UI iconography, and Axios for RESTful API communication.")
    add_bullet(doc, "Artificial Intelligence Pipeline: Model training and inference utilized the PyTorch 2.4 deep learning framework, Torchvision, and Albumentations for image augmentation. Inference execution was encapsulated within a dedicated microservice.")

    add_h2(doc, "4.2 Coding Standards of Language Used")
    add_para(doc, "To ensure high code maintainability, readability, and consistency across development repositories, strict standards were enforced:")
    add_bullet(doc, "Python Standards (PEP 8): Strict adherence to PEP 8 guidelines. Variable and function identifiers follow snake_case; class identifiers follow PascalCase; constants follow UPPER_SNAKE_CASE. Explicit Python type hints (typing module) were enforced across all viewsets, serializers, and service functions. All models feature exhaustive docstrings describing architectural decisions.")
    add_bullet(doc, "Dart & Flutter Standards (Effective Dart): Dart source code complies strictly with Effective Dart guidelines. Widget classes utilize PascalCase; variables and private methods utilize camelCase with leading underscore prefixes. To optimize Flutter widget tree rebuild cycles, const constructors were applied to all immutable widget instances. Asynchronous operations rigorously utilize async/await with mandatory try-catch exception handling.")
    add_bullet(doc, "RESTful API Standards: Endpoints follow clean RESTful URI naming conventions utilizing plural nouns (e.g., /api/consultations/, /api/predictions/history/). HTTP methods are semantically mapped: GET for idempotent retrieval, POST for entity creation, PATCH for partial updates, and DELETE for deletion. All responses return standardized JSON envelopes with semantic HTTP status codes.")

    add_h2(doc, "4.3 Testing Techniques and Test Plans")
    add_para(doc, "To verify software correctness, stability, security, and performance, a multi-tier testing strategy spanning Unit, Integration, System, and User Acceptance Testing (UAT) was executed.")
    
    add_h3(doc, "4.3.1 Unit Testing")
    add_para(doc, "Unit tests validated individual software components, algorithms, and model constraints in strict isolation. Key unit test suites included:")
    add_bullet(doc, "Model Validation Tests: Verified that custom clean() methods correctly enforce case-insensitive uniqueness across Region, Zone, Woreda, and Kebele models.")
    add_bullet(doc, "Authentication & Hash Verification: Validated that passwords hashed via bcrypt cannot be decrypted, that invalid credentials return HTTP 401 Unauthorized, and that expired JWT tokens are rejected.")
    add_bullet(doc, "BLoC State Machine Tests: Validated Flutter BLoC transitions for the disease scanner: verifying that emitting ScanImageEvent reliably transitions states from ScannerInitial -> ScannerLoading -> ScannerSuccess.")

    add_h3(doc, "4.3.2 Integration Testing")
    add_para(doc, "Integration testing verified interoperability across subsystem boundaries:")
    add_bullet(doc, "AI Image Upload & Classification Pipeline: Verified that transmitting a raw multipart leaf image from the mobile client to /api/predictions/predict/ successfully invokes the CNN inference microservice, writes a row to PredictionHistory, and returns structured diagnosis JSON.")
    add_bullet(doc, "Ticket Routing Integration: Verified that when a farmer submits a consultation ticket, the backend accurately queries the Kebele assignment table and dispatches a WebSocket notification directly to the connected browser socket of the assigned extension officer.")

    add_h3(doc, "4.3.3 System and User Acceptance Testing (UAT)")
    add_para(doc, "System testing evaluated end-to-end performance under simulated field conditions. User Acceptance Testing was conducted with agricultural extension workers and simulated rural farmers, focusing on interface usability, text streaming readability, and Amharic translation accuracy.")

    add_h3(doc, "4.3.4 Test Case Execution Matrix and Results")
    add_para(doc, "The comprehensive test matrix summarizes test cases executed against the system:")
    test_headers = ["Test ID", "Test Case Description", "Input / Preconditions", "Expected Result", "Actual Result", "Status"]
    test_data = [
        ["TC-01", "Farmer Registration", "Valid phone, email, Kebele ID", "User created, role=FARMER, status=ACTIVE", "User registered successfully", "PASS"],
        ["TC-02", "Officer Mobile Lockdown", "Officer credentials on Mobile", "Login rejected with redirect warning", "Rejected: 'Use Web Portal'", "PASS"],
        ["TC-03", "AI Disease Classification", "Tomato Early Blight leaf photo", "Disease identified with confidence >= 85%", "'Tomato Early Blight' (91.4%)", "PASS"],
        ["TC-04", "Invalid Image Rejection", "Photograph of automobile", "HTTP 422: Unclear / Non-Plant Alert", "Alert displayed, no DB row", "PASS"],
        ["TC-05", "Automated Kebele Routing", "Farmer in Kebele 02 submits case", "Ticket assigned to Kebele 02 officer", "Assigned to Officer Chala", "PASS"],
        ["TC-06", "Lead Officer Triage", "Lead Officer delegates ticket", "Assigned officer updated, log created", "Ticket delegated successfully", "PASS"],
        ["TC-07", "Chat Chronological Order", "Send 3 sequential messages", "Oldest message top, newest bottom", "Messages ordered chronologically", "PASS"],
        ["TC-08", "Offline Guide Caching", "Device in Airplane Mode", "Guides load smoothly from local cache", "Guides rendered from cache", "PASS"],
        ["TC-09", "Unconditional Back Navigation", "Click drawer item then Back", "Returns to Home dashboard", "Returned to Home immediately", "PASS"],
        ["TC-10", "Password Hash Security", "Inspect database user table", "Password stored as bcrypt hash string", "Hashed string verified", "PASS"]
    ]
    add_styled_table(doc, test_headers, test_data, "Table 4.1: Comprehensive Test Case Execution Matrix and Results")

    doc.add_page_break()
    print("Chapter 4 successfully built!")
    return doc
