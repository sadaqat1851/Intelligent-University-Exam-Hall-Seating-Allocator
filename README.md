# Intelligent University Exam Hall Seating Allocator (AI CSP Engine)

**Course:** CSC262: Artificial Intelligence - I (Fall 2026)  
**Institution:** COMSATS University Islamabad (CUI)  
**Project Category:** Artificial Intelligence — Constraint Satisfaction Problem (CSP) / State-Space Search  
**Submitted By:**  
- Ahsan Raza (SP25-BDS-003)  
- Muzzamil Ghaffar (SP25-BDS-034)  
- Muhammad Irshad Khan (SP25-BDS-025)  
- Sadaqat Hussain (SP25-BDS-040)  

---

## 🌟 Overview & Web Application

The **Intelligent University Exam Hall Seating Allocator** is an automated, AI-driven scheduling and invigilation system modeled as a **Constraint Satisfaction Problem (CSP)** and solved via **Recursive Backtracking Search with Domain Pruning & Most Constrained Variable Ordering**.

This repository contains both the original Python core script (`Mid.py`) and a **web application** that transforms the solver into an interactive platform for exam controllers and invigilators.

---

## 🚀 How to Launch the Web App

### Option 1: Double-Click (Easiest on Windows)
Simply double-click:
```
run_app.bat
```
This automatically starts the local server and opens the application in your default web browser at `http://localhost:8080/index.html`.

### Option 2: Python Command Line
Run in PowerShell or Command Prompt:
```bash
python server.py
```
Then visit: `http://localhost:8080/index.html`

### Option 3: Direct File Open
You can also open `index.html` directly in any modern browser (Google Chrome, Microsoft Edge, Firefox, Brave).

---

## 🧩 AI Problem Formalization (CSP)

The examination seating problem is formally defined as a tuple $\langle X, D, C \rangle$:

1. **Variables ($X$):**
   - The list of 50 examination candidates ($X_1, X_2, \dots, X_{50}$), prioritized with ADA candidates first (Most Constrained Heuristic).
2. **Domains ($D$):**
   - The set of 75 physical hall seats across 3 halls:
     - **Hall A:** 25 seats ($5 \times 5$ grid, Ground Floor, ADA Accessible)
     - **Hall B:** 25 seats ($5 \times 5$ grid, 1st Floor)
     - **Hall C:** 25 seats ($5 \times 5$ grid, 2nd Floor)
3. **Constraints ($C$):**
   - **Hard Accessibility Constraint (ADA):** Candidates with mobility needs must be assigned exclusively to row 1 of accessible halls (`Hall_A-R1C1` to `Hall_A-R1C5`).
   - **Anti-Cheating Orthogonal Isolation Rule:** No two students in the same hall sharing the same degree section (`BDS-3A`, `BDS-3B`, `BDS-3C`) OR the same examination paper (`CSC262`, `MTH231`, `DSF201`) may be seated orthogonally adjacent ($|r_1 - r_2| + |c_1 - c_2| = 1$).
   - **Uniqueness:** Each candidate is assigned to exactly one desk without double bookings.

---

## 🖥️ Web App Key Features

### 1. 🏛️ Interactive Exam Halls (Floor Plans)
- Visual 2D grid representation of **Hall A, Hall B, and Hall C**.
- Desks display Seat ID (`Hall_A-R1C1`), Candidate Roll Number, Name, Course Badge, Section Badge, and Wheelchair ADA icon.
- **Dynamic Color-Coding:** Toggle desk visualization by Course Paper, Degree Section, or ADA Status.
- **Interactive Seat Inspector Modal:** Click any desk to view the candidate profile and open the **Orthogonal Neighbor Radar** that tests North, South, East, and West neighbors to prove zero violations.
- **Orthogonal Cheat-Detection Guide:** Highlights adjacent neighbors with animated indicators.

### 2. ⚡ CSP Solver Studio & Visualizer
- **Animated Search:** Watch the recursive backtracking search explore variables and domains in real time.
- **Speed Control:** Adjustable animation speeds (Slow 400ms to Turbo 5ms or Instant).
- **Strategy Selector:** Standard `Mid.py` Baseline vs Balanced Room Allocation.
- **Live Search Metrics:** Dynamic counters for recursive steps, backtracks, and constraint checks.
- **Telemetry Terminal:** Auto-scrolling execution trace logs every assignment and backtrack unwind.

### 3. 📋 Master Seating Chart & Student Roster
- Comprehensive table listing all 50 assignments matching `report_df` in `Mid.py`.
- Real-time search by Student ID, Name, or Seat ID.
- Multi-filter dropdowns for Hall, Course, Section, and ADA status.
- Add new student dialog and random roster generator.
- **CSV Export:** One-click download of the complete seating report conforming to university exam standards.

### 4. 🛡️ Academic Integrity & Constraint Audit Matrix
- Automated test engine auditing 100% of seats against all 4 hard/soft constraints.
- Real-time verification of 0 course clashes, 0 section clashes, and 100% ADA placement.
- Official digital certificate of Academic Integrity.

### 5. 🖨️ Official Invigilation Print Suite
- Clean, print-ready document formatted for A4 paper.
- Official institutional header for COMSATS University Islamabad.
- Student signature columns for hall roll call.
- Chief Invigilator and Examiner signature blocks.
- Toggle between **Master Invigilation Sheet** and **Printable Desk Slips** to paste on exam desks.

### 6. ⚙️ Hall & Capacity Builder
- Configurable examination venues: customize rows, columns, floor levels, and wheelchair accessibility.
- Real-time capacity recalculation.

### 7. 🌓 Dark & Light Theme
- Tailored color palettes with smooth transitions, modern typography, and glassmorphic styling.

---

## 📁 Repository Structure

```
.
├── Mid.py                   # Original Python CSP implementation
├── server.py                # Zero-dependency local web server (Python standard library)
├── run_app.bat              # One-click Windows application launcher
├── index.html               # Main Web Application frontend
├── styles.css               # Modern design system (Vanilla CSS, Glassmorphism, Print Styles)
├── app.js                   # Application controller, event manager & UI renderer
├── csp_engine.js            # JavaScript CSP Backtracking Solver & Audit Engine
├── data.js                  # Default 50 students (seed 42) & room presets
├── Project_Proposal.pdf     # Original submitted Project Proposal
├── Project_Report.pdf       # Original submitted Project Report
└── README.md                # Documentation and guide
```

---

## 🧪 Verification & Output

Running `python Mid.py` verifies the exact reference solution:
- **Total Students Seated:** 50 / 50
- **Halls Utilized:** Hall A (23 students), Hall B (21 students), Hall C (6 students)
- **ADA Accommodated:** 5 of 5, all seated in Hall A Row 1
- **Orthogonal Same-Section / Same-Course Breaches:** 0 found (100% Conflict-Free)
