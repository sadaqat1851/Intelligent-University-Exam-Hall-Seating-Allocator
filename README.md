# Intelligent University Exam Hall Seating Allocator (AI CSP Agent)

**Course:** CSC262: Artificial Intelligence - I (Fall 2026)  
**Institution:** COMSATS University Islamabad (CUI)  
**Project Category:** Artificial Intelligence — Constraint Satisfaction Problem (CSP) / Intelligent Agent Architecture  
**Submitted By:**  
- Ahsan Raza (SP25-BDS-003)  
- Muzzamil Ghaffar (SP25-BDS-034)  
- Muhammad Irshad Khan (SP25-BDS-025)  
- Sadaqat Hussain (SP25-BDS-040)  

---

## 🌟 Overview & Web Application

The **Intelligent University Exam Hall Seating Allocator** is an automated, AI-driven scheduling and invigilation system modeled under the **Russell & Norvig Intelligent Agent Framework** as a **Goal-Based and Utility-Based Intelligent Agent**. The system formalizes university examination seating as a **Constraint Satisfaction Problem (CSP)** and solves it via **Recursive Backtracking Search with Domain Pruning & Most Constrained Variable (MRV) Ordering**.

This repository contains both the Python core engine (`Mid.py`) and a responsive **Web Application** (ready for local execution or cloud deployment on **Vercel**), equipping exam controllers and invigilators with real-time floor plans, interactive radar cheat-detection, live telemetry, and dynamic venue management.

---

## 🤖 AI Agent Architecture & PEAS Specification

The system is formally modeled as a **Goal-Based and Utility-Based Intelligent Agent** with an autonomous Multi-Agent Supervisory Architecture:

### 1. Formal PEAS Matrix

| Component | Description |
| :--- | :--- |
| **Performance Measure ($P$)** | • **100% ADA Accessibility Compliance:** ADA-flagged students placed strictly in Row 1 of accessible ground-floor venues.<br>• **0% Orthogonal Adjacency Violations:** No two candidates sharing degree section or examination paper seated orthogonally adjacent ($|r_1 - r_2| + |c_1 - c_2| = 1$).<br>• **100% Seating Completeness:** All roster candidates assigned unique desks without double-booking.<br>• **Search Efficiency:** Minimal state-space backtracks and node expansions.<br>• **Utility Optimization:** Balanced occupancy distribution across available halls. |
| **Environment ($E$)** | • Examination venues with 2D geometric seat matrices $\{ \text{Hall-R}r\text{C}c \}$, floor levels, and wheelchair accessibility flags.<br>• Candidate pool characterized by $\{ \text{student\_id}, \text{name}, \text{section}, \text{course\_code}, \text{ada\_needed} \}$.<br>• **Properties:** Fully Observable, Deterministic, Static (during solver deliberation), Discrete, Multi-Agent Supervisory. |
| **Actuators ($A$)** | • **Desk Assignment:** $\text{allocation}[\text{seat\_id}] \leftarrow \text{student}$<br>• **Backtrack Unwind:** $\text{delete allocation}[\text{seat\_id}]$<br>• **Academic Integrity Certification:** Automated emission of compliance certificates.<br>• **Explainable AI (XAI) Dispatch:** Interactive 4-directional radar traces for invigilators.<br>• **Hall Dynamic Governor:** Safe addition, updating, and removal of examination halls. |
| **Sensors ($S$)** | • **Hall Capacity & Geometry Sensor:** Detects rows, columns, and total available desks.<br>• **ADA Accessibility Sensor:** Detects ground-floor wheelchair ramp access.<br>• **Manhattan Distance Sensor:** Tests orthogonal adjacency ($|\Delta r| + |\Delta c| = 1$).<br>• **Credential Comparator:** Verifies course codes and degree sections.<br>• **Search Telemetry Monitor:** Tracks recursive steps, backtracks, and latency. |

### 2. Multi-Agent Supervisory Architecture

1. **Seating Planner Agent (`GoalBasedSeatingAgent`):** Performs recursive backtracking search guided by the Most Constrained Variable (MRV) heuristic.
2. **Invigilation Integrity Agent (`InvigilationAuditAgent`):** Continuously scans all desks, auditing 100% of seats to guarantee zero cheating vulnerabilities.
3. **Accessibility Governor Agent (`CapacityGovernorAgent`):** Enforces ground-floor accessibility regulations and manages venue capacity load balancing.

---

## 🚀 How to Launch the Web App

### Option 1: Vercel Deployment (Cloud Hosting)
The application is pre-configured with `vercel.json` for one-click deployment on **Vercel**:
- Simply connect this GitHub repository to Vercel or run `vercel --prod`.
- Serves static assets instantly with HTTPS, responsive layouts, and zero server dependencies.

### Option 2: Double-Click (Local Windows)
Double-click:
```
run_app.bat
```
Starts the local server and opens `http://localhost:8080/index.html`.

### Option 3: Python Command Line
```bash
python server.py
```
Then visit: `http://localhost:8080/index.html`

### Option 4: Direct File Open
Open `index.html` directly in any web browser (Google Chrome, Microsoft Edge, Firefox, Brave).

---

## 🧩 AI Problem Formalization (CSP)

The examination seating problem is formally defined as a tuple $\langle X, D, C \rangle$:

1. **Variables ($X$):**
   - The list of 50 examination candidates ($X_1, X_2, \dots, X_{50}$), prioritized with ADA candidates first (MRV Heuristic).
2. **Domains ($D$):**
   - The set of physical hall seats across all active halls (e.g., 75 desks across Hall A, Hall B, Hall C).
3. **Constraints ($C$):**
   - **Hard Accessibility Constraint (ADA):** Candidates with mobility needs must be assigned exclusively to row 1 of accessible halls (`Hall_A-R1C1` to `Hall_A-R1C5`).
   - **Anti-Cheating Orthogonal Isolation Rule:** No two students in the same hall sharing the same degree section (`BDS-3A`, `BDS-3B`, `BDS-3C`) OR the same examination paper (`CSC262`, `MTH231`, `DSF201`) may be seated orthogonally adjacent ($|r_1 - r_2| + |c_1 - c_2| = 1$).
   - **Uniqueness:** Each candidate is assigned to exactly one desk without double bookings.

---

## 🖥️ Web App Key Features

### 1. 🤖 AI Agent Architecture & XAI Radar (NEW)
- Interactive tab dedicated to the **Goal-Based & Utility-Based Intelligent Agent**.
- Complete **PEAS Specification Matrix** with interactive criteria breakdowns.
- Visual **Percept-Action Decision Pipeline**.
- **Explainable AI (XAI) Decision Radar:** Select any candidate to audit why the agent placed them at that desk, accompanied by directional North/South/East/West anti-cheating isolation shields.

### 2. 🏛️ Interactive Exam Halls (Floor Plans) & Quick Hall Removal (NEW)
- Visual 2D grid representation of examination venues.
- Dynamic color-coding by Course Paper, Degree Section, or ADA Status.
- **Direct Hall Removal:** Each hall card features a `🗑️ Remove Hall` button in the header, with safety checks and automatic re-allocation.
- Dynamic room filter pills that automatically update when halls are added, updated, or removed.

### 3. ⚙️ Hall & Capacity Builder with Safe Removal (NEW)
- Configure rows, columns, floor levels, and wheelchair accessibility flags.
- **Remove Hall Functionality:** Dedicated `🗑️ Remove Hall` button on every hall card with capacity warning prompts.
- **One-Click Reset:** `🔄 Reset Default Halls` button to restore the original 3-hall configuration (Hall A, B, C) anytime.

### 4. ⚡ CSP Solver Studio & Visualizer
- **Animated Search:** Watch the recursive backtracking search explore variables and domains in real time.
- **Speed Control:** Adjustable animation speeds (Slow 400ms to Turbo 5ms or Instant).
- **Strategy Selector:** Standard Baseline vs Balanced Room Allocation.
- **Live Search Metrics:** Counters for recursive steps, backtracks, and constraint checks.
- **Telemetry Terminal:** Auto-scrolling execution trace logging every assignment and backtrack unwind.

### 5. 📋 Master Seating Chart & Student Roster
- Comprehensive table listing all assignments matching `report_df` in `Mid.py`.
- Dynamic search and multi-filter dropdowns synchronized with active halls.
- **CSV Export:** One-click download of the complete seating report conforming to university exam standards.

### 6. 🛡️ Academic Integrity & Constraint Audit Matrix
- Automated test engine auditing 100% of seats against all 4 hard/soft constraints.
- Real-time verification of 0 course clashes, 0 section clashes, and 100% ADA placement.
- Official digital certificate of Academic Integrity.

### 7. 🖨️ Official Invigilation Print Suite
- Clean, print-ready document formatted for A4 paper with COMSATS University Islamabad header.
- Student signature roll call sheets and printable desk slips.

---

## 📁 Repository Structure

```
.
├── Mid.py                   # Python Intelligent Agent CSP implementation with PEAS, XAI & Audit
├── server.py                # Zero-dependency local web server (Python standard library)
├── run_app.bat              # One-click Windows application launcher
├── index.html               # Main Web Application frontend (Agent Studio, Floor Plans, Roster)
├── styles.css               # Modern design system (Vanilla CSS, Glassmorphism, Print Styles)
├── app.js                   # Application controller, dynamic hall manager & XAI renderer
├── csp_engine.js            # JavaScript Intelligent Agent CSP Backtracking Solver & Audit Engine
├── data.js                  # Default 50 students (seed 42) & room presets
├── vercel.json              # Vercel deployment configuration
├── Project_Proposal.pdf     # Original submitted Project Proposal
├── Project_Report.pdf       # Original submitted Project Report
└── README.md                # Documentation and guide
```

---

## 🧪 Verification & Output

Running `python Mid.py` verifies the exact reference solution:
- **Agent Type:** Goal-Based & Utility-Based Intelligent CSP Agent
- **Total Students Seated:** 50 / 50
- **Halls Utilized:** Hall A (23 students), Hall B (21 students), Hall C (6 students)
- **ADA Accommodated:** 5 of 5, all seated in Hall A Row 1
- **Orthogonal Same-Section / Same-Course Breaches:** 0 found (100% Conflict-Free)
- **Explainable AI Percept Trace:** Verified for SP25-BDS-003
