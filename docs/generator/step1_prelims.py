import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from doc_builder import (
    get_base_document, add_para, add_h1, add_h2, add_h3,
    add_bullet, add_styled_table, add_screenshot_placeholder, set_font
)

def build_full_55page_report():
    doc = get_base_document()

    # ==================== COVER PAGE ====================
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(36)
    p_inst.paragraph_format.space_after = Pt(40)
    p_inst.paragraph_format.line_spacing = 1.5
    r = p_inst.add_run("DEBRE BERHAN UNIVERSITY\nCOLLEGE OF COMPUTING\nDEPARTMENT OF INFORMATION SYSTEMS")
    set_font(r, font_name="Times New Roman", size_pt=16, bold=True)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(24)
    p_title.paragraph_format.space_after = Pt(36)
    p_title.paragraph_format.line_spacing = 1.5
    r = p_title.add_run("Massaye: Intelligent Agriculture System With AI-Powered Crop Disease Diagnosis And Extension Advisory")
    set_font(r, font_name="Times New Roman", size_pt=14, bold=True)

    p_by = doc.add_paragraph()
    p_by.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_by.paragraph_format.space_before = Pt(12)
    p_by.paragraph_format.space_after = Pt(12)
    r = p_by.add_run("By")
    set_font(r, font_name="Times New Roman", size_pt=14, bold=True)

    p_name = doc.add_paragraph()
    p_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_name.paragraph_format.space_before = Pt(12)
    p_name.paragraph_format.space_after = Pt(60)
    p_name.paragraph_format.line_spacing = 1.5
    r = p_name.add_run("[Full Name of Student(s) and Address]\nDepartment of Information Systems\nCollege of Computing")
    set_font(r, font_name="Times New Roman", size_pt=14, bold=True)

    p_date = doc.add_paragraph()
    p_date.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_date.paragraph_format.space_before = Pt(40)
    p_date.paragraph_format.space_after = Pt(0)
    r = p_date.add_run("November, 2026\nDebre Berhan, Ethiopia")
    set_font(r, font_name="Times New Roman", size_pt=14, bold=True)

    doc.add_page_break()

    # ==================== PRELIMINARIES ====================
    add_h1(doc, "DECLARATION")
    add_para(doc, "I/We hereby declare that this final year project report entitled \"Massaye: Intelligent Agriculture System With AI-Powered Crop Disease Diagnosis And Extension Advisory\" is our original work, developed under the scholarly guidance and academic supervision of our designated project advisor, and has not been presented or submitted previously to Debre Berhan University or any other academic institution for the award of any academic degree, diploma, or qualification. All primary and secondary materials, domain frameworks, scientific algorithms, and statistical sources utilized within this study have been acknowledged in the text and referenced according to IEEE guidelines.")
    doc.add_paragraph().paragraph_format.space_before = Pt(28)
    add_para(doc, "Student Full Name: ____________________________________    Signature: ______________    Date: __________")
    add_para(doc, "Student Full Name: ____________________________________    Signature: ______________    Date: __________")
    add_para(doc, "Student Full Name: ____________________________________    Signature: ______________    Date: __________")
    doc.add_page_break()

    add_h1(doc, "APPROVAL SHEET")
    add_para(doc, "This is to certify that the final year project report entitled \"Massaye: Intelligent Agriculture System With AI-Powered Crop Disease Diagnosis And Extension Advisory\" submitted by the aforementioned students in partial fulfillment of the requirements for the Degree of Bachelor of Science in Information Systems at Debre Berhan University, College of Computing, Department of Information Systems, is accepted and approved for final oral defense.")
    doc.add_paragraph().paragraph_format.space_before = Pt(24)
    add_para(doc, "1. Designated Advisor:     ____________________________    Signature: ______________    Date: __________")
    add_para(doc, "2. Designated Co-Advisor:  ____________________________    Signature: ______________    Date: __________")
    add_para(doc, "3. Internal Examiner:      ____________________________    Signature: ______________    Date: __________")
    add_para(doc, "4. External Examiner:      ____________________________    Signature: ______________    Date: __________")
    add_para(doc, "5. Department Head:        ____________________________    Signature: ______________    Date: __________")
    doc.add_page_break()

    add_h1(doc, "DEDICATION")
    add_para(doc, "This work is dedicated to the millions of industrious smallholder farmers throughout Ethiopia, whose tireless labor, resilience, and stewardship of the soil nourish our nation.", italic=True)
    doc.add_page_break()

    add_h1(doc, "ACKNOWLEDGMENTS")
    add_para(doc, "First and foremost, we offer our profound praise and thanksgiving to the Almighty for granting us perseverance, wisdom, vitality, and intellectual endurance throughout the design, software development, and academic compilation of this project.")
    add_para(doc, "We extend our deepest and most sincere gratitude to our project advisor for their scholarly mentorship, patient encouragement, methodological critique, and continuous technical reviews. Their academic insight was crucial in steering this project toward rigorous software engineering standards.")
    add_para(doc, "Our gratitude also goes to the faculty members of the Department of Information Systems and the College of Computing at Debre Berhan University, who provided us with foundational competencies in database modeling, object-oriented software engineering, web engineering, and enterprise systems design.")
    add_para(doc, "We express our sincere thanks to the agricultural extension workers (Development Agents) and Woreda supervisors who graciously gave their time during our requirement elicitation sessions, providing operational insights into rural Kebele realities. Finally, we thank our beloved families and fellow classmates for their moral and emotional support.")
    doc.add_page_break()

    add_h1(doc, "ABSTRACT")
    add_para(doc, "Agriculture represents the foundational pillar of the Ethiopian economy, sustaining over 68% of the national labor force and contributing roughly 32% to the national Gross Domestic Product (GDP). Nonetheless, smallholder cereal and horticultural productivity remains persistently hindered by recurring foliar crop diseases such as Maize Northern Leaf Blight, Wheat Stem Rust, Tomato Early Blight, and Potato Late Blight, which regularly inflict severe harvest losses ranging between 30% and 100%. The conventional public agricultural extension system in Ethiopia relies on physical farm visits by Kebele Development Agents (DAs). This legacy operational model suffers from critical structural bottlenecks, including overwhelming agent-to-farmer ratios (frequently exceeding 1:1,000), rugged topography, impassable rural feeder roads during the rainy season, slow disease detection cycles, and paper-based ledgers that preclude real-time epidemiological monitoring.")
    add_para(doc, "To resolve these challenges, this project engineers Massaye, an end-to-end intelligent agricultural advisory and management ecosystem tailored to the Ethiopian agricultural landscape. Massaye couples computer vision deep learning inference with an enterprise multi-tier tele-consultation platform. The system is composed of: (1) a native-performance cross-platform mobile application developed with Flutter, dedicated exclusively to the Farmer role with bilingual Amharic and English interfaces, real-time animated typewriter AI disease diagnosis streaming, ticket submission, and direct chat; (2) a reactive web management portal built on React/Vite and Tailwind CSS for Woreda Lead Officers, Kebele Extension Officers, and Administrators; and (3) a robust backend microservice architecture powered by Python Django REST Framework, PostgreSQL, and WebSockets (Django Channels).")
    add_para(doc, "Empirical evaluation across functional test matrices and field simulations demonstrates that Massaye reduces agricultural diagnosis turnaround from 5-12 days down to under 3 seconds, automates ticket routing by Kebele jurisdiction, and provides administrators with real-time epidemiological outbreak heatmaps.")
    add_para(doc, "Keywords: Intelligent Agriculture, Plant Disease Detection, Deep Learning, Flutter, Django REST Framework, Extension Advisory, Kebele Administration, Tele-Consultation.", bold=True)
    doc.add_page_break()

    # ==================== TABLE OF CONTENTS ====================
    add_h1(doc, "TABLE OF CONTENTS")
    add_para(doc, "Preliminaries ..................................................................................................................................................... i")
    add_para(doc, "Declaration ....................................................................................................................................................... ii")
    add_para(doc, "Approval Sheet ................................................................................................................................................ iii")
    add_para(doc, "Dedication ........................................................................................................................................................ iv")
    add_para(doc, "Acknowledgments ............................................................................................................................................ v")
    add_para(doc, "Abstract ............................................................................................................................................................ vi")
    add_para(doc, "List of Acronyms and Abbreviations ................................................................................................................... vii")
    add_para(doc, "List of Tables ................................................................................................................................................... viii")
    add_para(doc, "List of Figures ................................................................................................................................................... ix")
    add_para(doc, "CHAPTER ONE: INTRODUCTION ................................................................................................................... 1")
    add_para(doc, "  1.1 Background ............................................................................................................................................... 1")
    add_para(doc, "  1.2 Statement of the Problem .......................................................................................................................... 3")
    add_para(doc, "  1.3 Objective of the Project ............................................................................................................................. 5")
    add_para(doc, "    1.3.1 General Objective ............................................................................................................................... 5")
    add_para(doc, "    1.3.2 Specific Objectives .............................................................................................................................. 5")
    add_para(doc, "  1.4 Methodology ............................................................................................................................................. 7")
    add_para(doc, "    1.4.1 Requirement Gathering Methods ......................................................................................................... 7")
    add_para(doc, "    1.4.2 Requirement Modelling Approach ....................................................................................................... 8")
    add_para(doc, "    1.4.3 Tools and Technologies Used .............................................................................................................. 9")
    add_para(doc, "  1.5 Feasibility Study ....................................................................................................................................... 11")
    add_para(doc, "    1.5.1 Economic Feasibility .......................................................................................................................... 11")
    add_para(doc, "    1.5.2 Technical Feasibility .......................................................................................................................... 12")
    add_para(doc, "    1.5.3 Operational Feasibility ........................................................................................................................ 13")
    add_para(doc, "    1.5.4 Political and Legal Feasibility ............................................................................................................. 13")
    add_para(doc, "    1.5.5 Time / Schedule Feasibility ................................................................................................................. 14")
    add_para(doc, "  1.6 Project Scope and Limitation .................................................................................................................... 15")
    add_para(doc, "    1.6.1 Project Scope ..................................................................................................................................... 15")
    add_para(doc, "    1.6.2 Project Limitations ............................................................................................................................. 16")
    add_para(doc, "  1.7 Significance of the Project ......................................................................................................................... 17")
    add_para(doc, "  1.8 Organization of the Project ....................................................................................................................... 18")
    add_para(doc, "CHAPTER TWO: REQUIREMENT SPECIFICATION AND OBJECT-ORIENTED ANALYSIS ................... 19")
    add_para(doc, "  2.1 Existing System ......................................................................................................................................... 19")
    add_para(doc, "    2.1.1 Existing System Description ............................................................................................................... 19")
    add_para(doc, "    2.1.2 Business Rules of the Existing System ................................................................................................ 20")
    add_para(doc, "    2.1.3 Drawbacks of the Existing System ...................................................................................................... 21")
    add_para(doc, "  2.2 Proposed System ....................................................................................................................................... 22")
    add_para(doc, "    2.2.1 Functional Requirements .................................................................................................................... 22")
    add_para(doc, "    2.2.2 Non-Functional Requirements and Constraints ................................................................................... 24")
    add_para(doc, "    2.2.3 Business Rules of the Proposed System .............................................................................................. 26")
    add_para(doc, "    2.2.4 System Actor Identification and Descriptions .................................................................................... 27")
    add_para(doc, "    2.2.5 Use Case Diagram ............................................................................................................................... 28")
    add_para(doc, "    2.2.6 Detailed Use Case Documentation ...................................................................................................... 29")
    add_para(doc, "    2.2.7 Sequence Diagrams ............................................................................................................................. 33")
    add_para(doc, "    2.2.8 State Chart Diagrams .......................................................................................................................... 35")
    add_para(doc, "    2.2.9 Activity Diagrams ............................................................................................................................... 37")
    add_para(doc, "  2.3 Key Abstraction with CRC Analysis .......................................................................................................... 39")
    add_para(doc, "  2.4 Class Diagram .......................................................................................................................................... 41")
    add_para(doc, "  2.5 Identifying Change Cases .......................................................................................................................... 43")
    add_para(doc, "  2.6 User Interface Prototyping ........................................................................................................................ 44")
    add_para(doc, "CHAPTER THREE: OBJECT-ORIENTED SYSTEM DESIGN .......................................................................... 45")
    add_para(doc, "  3.1 Purpose and Goals of Design .................................................................................................................... 45")
    add_para(doc, "  3.2 Current Software Architecture ................................................................................................................... 46")
    add_para(doc, "  3.3 Proposed Software Architecture ................................................................................................................ 46")
    add_para(doc, "    3.3.1 Subsystem Decomposition .................................................................................................................. 46")
    add_para(doc, "    3.3.2 Component Diagram ........................................................................................................................... 48")
    add_para(doc, "  3.4 Deployment Diagram ................................................................................................................................ 49")
    add_para(doc, "  3.5 Database Design (E-R Diagram) for Relational Database ......................................................................... 50")
    add_para(doc, "    3.5.1 Conceptual and Logical Schema ......................................................................................................... 50")
    add_para(doc, "    3.5.2 Relational Data Dictionary and Table Structures ............................................................................... 51")
    add_para(doc, "  3.6 Persistence Modelling for Object-Oriented Database ................................................................................ 54")
    add_para(doc, "  3.7 Access Control and Security ...................................................................................................................... 55")
    add_para(doc, "CHAPTER FOUR: IMPLEMENTATION, TESTING, AND MAINTENANCE .................................................. 57")
    add_para(doc, "  4.1 Introduction to Languages, IDEs, Tools, and Technologies ..................................................................... 57")
    add_para(doc, "  4.2 Coding Standards of Language Used ........................................................................................................ 58")
    add_para(doc, "  4.3 Testing Techniques and Test Plans ............................................................................................................ 59")
    add_para(doc, "    4.3.1 Unit Testing ........................................................................................................................................ 59")
    add_para(doc, "    4.3.2 Integration Testing ............................................................................................................................. 60")
    add_para(doc, "    4.3.3 System and User Acceptance Testing .................................................................................................. 61")
    add_para(doc, "    4.3.4 Test Case Execution Matrix and Results ............................................................................................. 62")
    add_para(doc, "CHAPTER FIVE: RESULTS AND DISCUSSION ............................................................................................... 64")
    add_para(doc, "  5.1 User Interface Representation of Respective Project ................................................................................. 64")
    add_para(doc, "    5.1.1 Brief Description of Various Modules of the System .......................................................................... 64")
    add_para(doc, "  5.2 Snapshots of System with Brief Detail of Each .......................................................................................... 66")
    add_para(doc, "  5.3 Back Ends Representation (Database to be Used) ...................................................................................... 72")
    add_para(doc, "    5.3.1 Snapshots of Database Tables with Brief Description ........................................................................ 72")
    add_para(doc, "CHAPTER SIX: CONCLUSION AND RECOMMENDATION .......................................................................... 75")
    add_para(doc, "  6.1 Conclusion ................................................................................................................................................ 75")
    add_para(doc, "  6.2 Recommendation ..................................................................................................................................... 77")
    add_para(doc, "REFERENCES / BIBLIOGRAPHY ..................................................................................................................... 79")
    add_para(doc, "APPENDIX ........................................................................................................................................................... 82")
    doc.add_page_break()

    # Acronyms Table
    add_h1(doc, "LIST OF ACRONYMS AND ABBREVIATIONS")
    acronyms_headers = ["Acronym / Abbreviation", "Full Expanded Meaning"]
    acronyms_data = [
        ["AI", "Artificial Intelligence"],
        ["API", "Application Programming Interface"],
        ["ASGI", "Asynchronous Server Gateway Interface"],
        ["BLoC", "Business Logic Component"],
        ["CNN", "Convolutional Neural Network"],
        ["CRC", "Class Responsibility Collaborator"],
        ["CRUD", "Create, Read, Update, Delete"],
        ["CSA", "Central Statistical Agency (Ethiopia)"],
        ["DA", "Development Agent (Agricultural Extension Worker)"],
        ["DBU", "Debre Berhan University"],
        ["DRF", "Django REST Framework"],
        ["ERD", "Entity Relationship Diagram"],
        ["FTC", "Farmer Training Center"],
        ["GDP", "Gross Domestic Product"],
        ["GIS", "Geographic Information System"],
        ["HTTPS", "Hypertext Transfer Protocol Secure"],
        ["IDE", "Integrated Development Environment"],
        ["IEEE", "Institute of Electrical and Electronics Engineers"],
        ["JSON", "JavaScript Object Notation"],
        ["JWT", "JSON Web Token"],
        ["MoA", "Ministry of Agriculture (Ethiopia)"],
        ["OOAD", "Object-Oriented Analysis and Design"],
        ["ORM", "Object-Relational Mapping"],
        ["RBAC", "Role-Based Access Control"],
        ["REST", "Representational State Transfer"],
        ["SMART", "Specific, Measurable, Achievable, Relevant, Time-bound"],
        ["UI / UX", "User Interface / User Experience"],
        ["UML", "Unified Modeling Language"],
        ["WSS", "WebSocket Secure"]
    ]
    add_styled_table(doc, acronyms_headers, acronyms_data, "Table 0.1: Standard Project Acronyms and Abbreviations")
    doc.add_page_break()

    print("Preliminaries successfully built!")
    return doc

if __name__ == "__main__":
    doc = build_full_55page_report()
    doc.save("docs/final_report/test_step1.docx")
    print("Step 1 saved.")
