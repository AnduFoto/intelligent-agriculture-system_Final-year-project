import os
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from doc_builder import (
    add_para, add_h1, add_h2, add_h3,
    add_bullet, add_styled_table, add_screenshot_placeholder, set_font
)

def add_chapter_five(doc):
    add_h1(doc, "CHAPTER FIVE RESULTS AND DISCUSSION")

    add_h2(doc, "5.1 User Interface Representation (of Respective Project)")
    add_h3(doc, "5.1.1 Brief Description of Various Modules of the System")
    add_para(doc, "The user interface of Massaye is tailored into two dedicated, role-separated client platforms:")
    add_bullet(doc, "Farmer Mobile Application (Flutter / Android): Designed exclusively for smallholder farmers. The interface emphasizes high-contrast visual ergonomics, large touch targets, bilingual toggling (Amharic and English), and clear agricultural iconography. Core modules include:")
    add_bullet(doc, "  - Farmer Home Dashboard: Features a gradient AppBar with the Massaye logo, notification bell, weather advisory cards (soil moisture, rainfall risk), and quick-action navigation cards.")
    add_bullet(doc, "  - AI Camera Scanner & Streaming Result Module: Viewfinder overlay guiding leaf positioning, followed by an animated typewriter streaming view that displays disease classification, confidence score, clinical symptoms, and organic treatments.")
    add_bullet(doc, "  - Consultation Management Module: Displays active and resolved consultation tickets, doctor-style digital prescriptions, and case histories.")
    add_bullet(doc, "  - Multimodal Real-Time Chat Room: Chronologically ordered messaging interface supporting bidirectional text and compressed voice notes with audio waveform visualization.")
    add_bullet(doc, "  - Agricultural Knowledge Library: Categorized farming guides cached locally for offline field reference.")
    
    add_bullet(doc, "Extension Officer & Administrator Web Portal (React / Vite): Engineered for desktop and tablet displays to support clinical analysis and administrative governance. Core modules include:")
    add_bullet(doc, "  - Officer Triage Workbench: Tabular overview of incoming Kebele and Woreda consultation requests filtered by urgency and crop category.")
    add_bullet(doc, "  - Clinical Prescription Drawer: Split-screen view displaying farmer-submitted leaf photographs side-by-side with AI prediction metadata and a digital prescription drafting editor.")
    add_bullet(doc, "  - Geographic Location Manager: Administrative interface for managing Regions, Zones, Woredas, and Kebeles.")
    add_bullet(doc, "  - Officer Kebele Assignment Matrix: Administrative dashboard mapping certified officers to specific Kebeles and designating Lead Officers.")
    add_bullet(doc, "  - Epidemiological Outbreak Heatmap: GIS-enabled mapping interface visualizing disease infection clusters across administrative districts.")

    add_h2(doc, "5.2 Snapshots of System with Brief Detail of Each")
    add_para(doc, "Below are the system snapshots and visual screen representations across the mobile and web client interfaces:")

    add_screenshot_placeholder(doc, "5.1", "Farmer Mobile Application - Login and Kebele Registration", "Screen snapshot showing the farmer authentication and onboarding screen where farmers input phone, password, and select their administrative Region, Woreda, and Kebele.")
    add_screenshot_placeholder(doc, "5.2", "Farmer Mobile Application - Home Dashboard & Weather Advisory", "Screen snapshot showing the emerald green top AppBar with the Massaye logo, notification drawer, weather indices, and quick-action diagnostic cards.")
    add_screenshot_placeholder(doc, "5.3", "Farmer Mobile Application - Camera Scanner Viewfinder", "Screen snapshot showing the integrated camera viewfinder with visual framing bounds guiding leaf photo capture in the field.")
    add_screenshot_placeholder(doc, "5.4", "Farmer Mobile Application - AI Streaming Diagnosis Result", "Screen snapshot showing the simulated animated typewriter diagnosis displaying disease identification, confidence percentage (e.g. 92.4%), clinical symptoms, and treatment options.")
    add_screenshot_placeholder(doc, "5.5", "Farmer Mobile Application - Consultation Ticket & Digital Prescription", "Screen snapshot showing consultation ticket #1042 in status RESOLVED, displaying the extension officer's official chemical prescription and dosage guidelines.")
    add_screenshot_placeholder(doc, "5.6", "Farmer Mobile Application - Real-Time Chat & Voice Note Thread", "Screen snapshot showing the 1-on-1 consultation chat thread with chronological message bubbles, delivery state checkmarks, and playable audio voice notes.")
    add_screenshot_placeholder(doc, "5.7", "Farmer Mobile Application - Offline Agricultural Guide Library", "Screen snapshot showing bilingual crop management guides and pest control recommendations cached for offline reading.")
    add_screenshot_placeholder(doc, "5.8", "Officer Web Portal - Consultation Triage Workbench", "Screen snapshot showing the tabular queue of incoming farmer consultation tickets filtered by Kebele, crop type, and urgency status.")
    add_screenshot_placeholder(doc, "5.9", "Officer Web Portal - Clinical Image Inspection and Prescription Editor", "Screen snapshot showing the side-by-side high-resolution leaf image viewer, AI diagnostic confidence breakdown, and prescription submission editor.")
    add_screenshot_placeholder(doc, "5.10", "Administrator Web Portal - Geographic Location Hierarchy Management", "Screen snapshot showing the administrative interface for managing cascading Region, Zone, Woreda, and Kebele jurisdictions.")
    add_screenshot_placeholder(doc, "5.11", "Administrator Web Portal - Officer Kebele Assignment Dashboard", "Screen snapshot showing the management matrix used by administrators to assign certified extension officers to specific Kebeles and assign Woreda Lead Officers.")
    add_screenshot_placeholder(doc, "5.12", "Administrator Web Portal - Epidemiological Outbreak Heatmap", "Screen snapshot showing the GIS disease mapping interface displaying spatial infection hotspots across Ethiopian agricultural districts.")

    add_h2(doc, "5.3 Back Ends Representation (Database to be Used)")
    add_h3(doc, "5.3.1 Snapshots of Database Tables with Brief Description")
    add_para(doc, "The backend architecture is backed by an enterprise PostgreSQL 16 database. Below are the physical structural representations of the core database tables:")
    
    add_screenshot_placeholder(doc, "5.13", "Database Table Snapshot - accounts_user Table", "Database viewer snapshot showing the accounts_user table with UUID primary keys, hashed bcrypt passwords, role enums, and Kebele foreign keys.")
    add_screenshot_placeholder(doc, "5.14", "Database Table Snapshot - locations_kebele and Hierarchy Tables", "Database viewer snapshot showing the locations_kebele table linked relationally to Woreda and Zone entities.")
    add_screenshot_placeholder(doc, "5.15", "Database Table Snapshot - predictions_predictionhistory Table", "Database viewer snapshot showing stored prediction history records, including crop labels, disease classes, confidence percentages, and solution JSON payloads.")
    add_screenshot_placeholder(doc, "5.16", "Database Table Snapshot - consultations_consultation Table", "Database viewer snapshot showing consultation records, ticket status flags (NEW, ASSIGNED, RESOLVED), and assigned officer IDs.")
    add_screenshot_placeholder(doc, "5.17", "Database Table Snapshot - chat_conversation and chat_message Tables", "Database viewer snapshot showing the chat messaging tables, normalized user order constraints, message types, and media file paths.")

    doc.add_page_break()
    print("Chapter 5 successfully built!")
    return doc
