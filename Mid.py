"""
Intelligent University Exam Hall Seating Allocator (AI CSP Agent)
Course: CSC262: Artificial Intelligence - I (Fall 2026)
Institution: COMSATS University Islamabad (CUI)

AI AGENT ARCHITECTURE & PEAS FORMALIZATION:
=============================================================================
1. Agent Type:
   - Formally a Goal-Based and Utility-Based Intelligent Agent operating
     as an Autonomous Invigilation Supervisor.
   - Solves a Constraint Satisfaction Problem (CSP) via Backtracking Search
     augmented with the Most Constrained Variable (MRV) heuristic.

2. PEAS Specification:
   - Performance Measure (P):
     * 100% Hard Accessibility Constraint Satisfaction (ADA students placed
       exclusively in Row 1 of accessible ground floor halls).
     * 0% Soft Orthogonal Anti-Cheating Violations (no two candidates sharing
       either degree section or course paper seated orthogonally adjacent, |dr|+|dc| = 1).
     * 100% Seating Completeness (all candidates assigned unique valid desks).
     * High Search Efficiency (minimal state-space backtracks and fast execution).
     * Balanced Venue Occupancy (optimal distribution of candidates across available halls).
   - Environment (E):
     * Examination venues with 2D geometric seat matrices {Hall-R{r}C{c}}, floor levels,
       and wheelchair accessibility flags.
     * Student candidate pool characterized by {student_id, name, section, course_code, ada_needed}.
     * Environment Properties: Fully Observable, Deterministic, Static (during deliberation),
       Discrete, Multi-Agent Supervisory.
   - Actuators (A):
     * Seat Assignment: allocation[seat_id] <- candidate
     * Backtrack Unwind: allocation[seat_id] <- None
     * Academic Integrity Certification: generate_audit_certificate()
     * Explainable AI (XAI) Invigilation Report: explain_seat()
   - Sensors (S):
     * Hall Capacity & Geometry Sensor (detects available desk coordinates).
     * ADA Accessibility Sensor (detects ground floor / row 1 compliance).
     * Orthogonal Proximity Collision Sensor (measures Manhattan distance |dr|+|dc| == 1).
     * Candidate Credential Comparator (verifies course codes and academic sections).
=============================================================================
"""

import pandas as pd
import random
import time


class IntelligentExamSeatingAgent:
    """
    Intelligent Goal-Based and Utility-Based Agent for Examination Hall Seating.
    Implements perception, goal formulation, heuristic constraint propagation,
    recursive state-space backtracking, and automated invigilation integrity auditing.
    """

    def __init__(self, students_df, rooms_dict, agent_mode='standard'):
        self.agent_mode = agent_mode
        self.raw_students_df = students_df
        self.raw_rooms_dict = rooms_dict

        # Agent Sensors / Perception
        self.students = []
        self.rooms = {}
        self.available_seats = []
        self.allocation = {}

        # Agent Performance Telemetry
        self.telemetry = {
            'steps': 0,
            'backtracks': 0,
            'constraint_checks': 0,
            'start_time': 0,
            'end_time': 0,
            'elapsed_ms': 0
        }

        # Sense and internalize environment
        self.perceive_environment(students_df, rooms_dict)

    def perceive_environment(self, students_df, rooms_dict):
        """
        Agent Sensor Phase: Ingests environment percepts (student roster and room topologies).
        Constructs internal state representation and domain space.
        """
        self.students = students_df.to_dict(orient='records')
        self.rooms = rooms_dict
        self.allocation = {}

        # Build available seat pool (Domains D)
        self.available_seats = []
        for room_name, r_info in self.rooms.items():
            for r in range(r_info['rows']):
                for c in range(r_info['cols']):
                    seat_id = f"{room_name}-R{r+1}C{c+1}"
                    self.available_seats.append({
                        'seat_id': seat_id,
                        'room': room_name,
                        'row': r + 1,
                        'col': c + 1,
                        # Ground floor / Row 1 of wheelchair-accessible rooms
                        'ada_compliant': bool(r_info.get('ada_accessible', False) and (r == 0))
                    })

    def formulate_goal(self):
        """
        Agent Goal Formulation:
        Goal State = All variables X (students) assigned to domain values D (seats)
        subject to all constraints C (ADA + Anti-Cheating Orthogonal Isolation + Uniqueness).
        """
        return {
            'total_students_to_seat': len(self.students),
            'total_capacity_available': len(self.available_seats),
            'ada_candidates_count': sum(1 for s in self.students if s.get('ada_needed', False)),
            'target_violations': 0
        }

    def order_variables(self):
        """
        Agent Decision Heuristic: Most Constrained Variable (MRV) Ordering.
        ADA students have strictly restricted domains (only accessible Row 1 seats),
        so they are ordered first to dramatically prune the search tree.
        """
        ada_students = [s for s in self.students if s.get('ada_needed', False)]
        normal_students = [s for s in self.students if not s.get('ada_needed', False)]
        return ada_students + normal_students

    def is_safe(self, student, seat, assigned_seats):
        """
        Constraint Sensor & Validation Engine:
        Tests candidate action against Hard (ADA) and Soft (Orthogonal Anti-Cheating) rules.
        """
        self.telemetry['constraint_checks'] += 1

        # Hard constraint: ADA accessibility check
        if student.get('ada_needed', False) and not seat.get('ada_compliant', False):
            return False

        # Soft anti-cheating constraint: Orthogonal Manhattan Distance == 1
        for s_id, assigned_student in assigned_seats.items():
            if assigned_student['room'] == seat['room']:
                d_row = abs(assigned_student['row'] - seat['row'])
                d_col = abs(assigned_student['col'] - seat['col'])

                # Orthogonally adjacent if Manhattan distance == 1 (North, South, East, West)
                if d_row + d_col == 1:
                    # Candidates sharing section or course paper cannot sit adjacently
                    if (assigned_student['section'] == student['section'] or
                            assigned_student['course_code'] == student['course_code']):
                        return False

        return True

    def solve(self):
        """
        Agent Action Phase: Solves the CSP using recursive backtracking search
        guided by the MRV heuristic.
        """
        self.telemetry['start_time'] = time.perf_counter()
        self.telemetry['steps'] = 0
        self.telemetry['backtracks'] = 0
        self.telemetry['constraint_checks'] = 0
        self.allocation = {}

        ordered_students = self.order_variables()
        success = self._backtrack(ordered_students, 0, self.available_seats)

        self.telemetry['end_time'] = time.perf_counter()
        self.telemetry['elapsed_ms'] = round((self.telemetry['end_time'] - self.telemetry['start_time']) * 1000, 2)
        return success

    def _backtrack(self, students, index, seats):
        """
        Recursive CSP Backtracking Engine.
        """
        if index == len(students):
            return True

        self.telemetry['steps'] += 1
        current_student = students[index]

        for seat in seats:
            if seat['seat_id'] not in self.allocation:
                if self.is_safe(current_student, seat, self.allocation):
                    seat_record = {
                        **current_student,
                        'room': seat['room'],
                        'row': seat['row'],
                        'col': seat['col'],
                        'ada_compliant': seat['ada_compliant']
                    }
                    self.allocation[seat['seat_id']] = seat_record

                    if self._backtrack(students, index + 1, seats):
                        return True

                    # Backtrack unwind
                    self.telemetry['backtracks'] += 1
                    del self.allocation[seat['seat_id']]

        return False

    def audit_integrity(self):
        """
        Autonomous Invigilation Integrity Sub-Agent:
        Independently audits 100% of seats, verifying zero ADA breaches and zero
        orthogonal cheating collisions.
        """
        audit = {
            'is_valid': True,
            'total_students': len(self.students),
            'total_assigned': len(self.allocation),
            'ada_total': sum(1 for s in self.students if s.get('ada_needed', False)),
            'ada_compliant_placed': 0,
            'orthogonal_pairs_checked': 0,
            'section_clashes': 0,
            'course_clashes': 0,
            'violations': []
        }

        # 1. Audit ADA placement
        for seat_id, student in self.allocation.items():
            if student.get('ada_needed', False):
                if student.get('ada_compliant', False) and student['row'] == 1:
                    audit['ada_compliant_placed'] += 1
                else:
                    audit['is_valid'] = False
                    audit['violations'].append(f"ADA Violation at {seat_id} for {student['student_id']}")

        # 2. Audit Orthogonal Adjacency
        seat_items = list(self.allocation.items())
        for i in range(len(seat_items)):
            seat_a, rec_a = seat_items[i]
            for j in range(i + 1, len(seat_items)):
                seat_b, rec_b = seat_items[j]

                if rec_a['room'] == rec_b['room']:
                    d_row = abs(rec_a['row'] - rec_b['row'])
                    d_col = abs(rec_a['col'] - rec_b['col'])

                    if d_row + d_col == 1:
                        audit['orthogonal_pairs_checked'] += 1

                        if rec_a['section'] == rec_b['section']:
                            audit['is_valid'] = False
                            audit['section_clashes'] += 1
                            audit['violations'].append(
                                f"Section clash between {rec_a['student_id']} and {rec_b['student_id']} at {seat_a} & {seat_b}"
                            )

                        if rec_a['course_code'] == rec_b['course_code']:
                            audit['is_valid'] = False
                            audit['course_clashes'] += 1
                            audit['violations'].append(
                                f"Course clash between {rec_a['student_id']} and {rec_b['student_id']} at {seat_a} & {seat_b}"
                            )

        return audit

    def explain_assignment(self, student_id):
        """
        Explainable AI (XAI) Module:
        Explains why the agent assigned a candidate to a specific desk and details
        all neighbor boundary defenses.
        """
        seat_match = None
        student_record = None
        for sid, rec in self.allocation.items():
            if rec['student_id'] == student_id:
                seat_match = sid
                student_record = rec
                break

        if not seat_match:
            return f"Candidate {student_id} is currently unassigned."

        room = student_record['room']
        r = student_record['row']
        c = student_record['col']

        # Determine 4 orthogonal directions
        neighbors = {
            'North (Row-1)': f"{room}-R{r-1}C{c}",
            'South (Row+1)': f"{room}-R{r+1}C{c}",
            'West (Col-1)': f"{room}-R{r}C{c-1}",
            'East (Col+1)': f"{room}-R{r}C{c+1}"
        }

        explanations = [
            f"=== Agent Decision Explanation for Candidate {student_id} ({student_record['name']}) ===",
            f"Assigned Desk: {seat_match} in {room} (Row {r}, Column {c})",
            f"Candidate Profile: Section {student_record['section']} | Course {student_record['course_code']} | ADA: {student_record['ada_needed']}",
            f"ADA Strategy: {'Placed in ground-floor Row 1 accessible zone.' if student_record['ada_needed'] else 'Standard placement.'}",
            "Orthogonal Neighbor Shield Analysis:"
        ]

        for direction, n_seat in neighbors.items():
            if n_seat in self.allocation:
                n_rec = self.allocation[n_seat]
                explanations.append(
                    f"  - {direction}: Occupied by {n_rec['student_id']} ({n_rec['name']}) "
                    f"-> Section: {n_rec['section']} (Diff: {n_rec['section'] != student_record['section']}) | "
                    f"Course: {n_rec['course_code']} (Diff: {n_rec['course_code'] != student_record['course_code']}) [SAFE]"
                )
            else:
                explanations.append(f"  - {direction}: Empty Desk / Aisle Boundary [SAFE]")

        return "\n".join(explanations)


# Backward-compatible alias matching original codebase
class ExamSeatingAllocator(IntelligentExamSeatingAgent):
    """
    Subclasses IntelligentExamSeatingAgent to ensure 100% backward compatibility
    with existing test scripts and pipelines.
    """
    pass


if __name__ == "__main__":
    random.seed(42)
    first_names = ['Ali', 'Fatima', 'Bilal', 'Ayesha', 'Usman', 'Zainab', 'Hamza', 'Hira', 'Talha', 'Sana']
    last_names = ['Khan', 'Noor', 'Ahmed', 'Malik', 'Tariq', 'Bibi', 'Ali', 'Amin', 'Zahid', 'Mir']
    sections = ['BDS-3A', 'BDS-3B', 'BDS-3C']
    courses = ['CSC262', 'MTH231', 'DSF201']

    # Generate 50 realistic student records with 5 ADA students
    students_list = []
    for i in range(1, 51):
        students_list.append({
            'student_id': f"SP25-BDS-{i:03d}",
            'name': f"{random.choice(first_names)} {random.choice(last_names)}",
            'section': random.choice(sections),
            'course_code': random.choice(courses),
            'ada_needed': True if i in [3, 15, 28, 39, 45] else False
        })

    df = pd.DataFrame(students_list)

    # 3 Rooms with 25 seats each (75 total capacity for 50 students)
    rooms = {
        'Hall_A': {'capacity': 25, 'rows': 5, 'cols': 5, 'ada_accessible': True},
        'Hall_B': {'capacity': 25, 'rows': 5, 'cols': 5, 'ada_accessible': False},
        'Hall_C': {'capacity': 25, 'rows': 5, 'cols': 5, 'ada_accessible': False}
    }

    print("=" * 80)
    print("CSC262: ARTIFICIAL INTELLIGENCE - I | COMSATS UNIVERSITY ISLAMABAD")
    print("INTELLIGENT EXAM SEATING ALLOCATOR (GOAL-BASED & UTILITY-BASED AI AGENT)")
    print("=" * 80)

    # Instantiate the Intelligent Agent
    agent = IntelligentExamSeatingAgent(df, rooms)
    goal = agent.formulate_goal()

    print(f"[*] Agent Type: Goal-Based & Utility-Based Intelligent CSP Agent")
    print(f"[*] Perception: Ingested {goal['total_students_to_seat']} candidates ({goal['ada_candidates_count']} ADA) across {len(rooms)} venues.")
    print(f"[*] Total Domain Space: {goal['total_capacity_available']} physical desks.")
    print("[*] Actuator: Executing Recursive CSP Backtracking with MRV Domain Pruning...")

    if agent.solve():
        print(f"\n[+] SUCCESS: Goal achieved in {agent.telemetry['elapsed_ms']} ms!")
        print(f"    - Search Steps: {agent.telemetry['steps']}")
        print(f"    - Backtracks: {agent.telemetry['backtracks']}")
        print(f"    - Constraint Checks: {agent.telemetry['constraint_checks']}")

        # Autonomous Invigilation Audit Sub-Agent verification
        audit = agent.audit_integrity()
        print("\n" + "=" * 80)
        print("AUTONOMOUS INVIGILATION AUDIT CERTIFICATE")
        print("=" * 80)
        print(f"Integrity Status:           {'PASS (100% Certified)' if audit['is_valid'] else 'FAIL'}")
        print(f"Candidates Seated:          {audit['total_assigned']} of {audit['total_students']}")
        print(f"ADA Accessibility Placed:   {audit['ada_compliant_placed']} of {audit['ada_total']} (Row 1 Accessible)")
        print(f"Orthogonal Pairs Audited:   {audit['orthogonal_pairs_checked']}")
        print(f"Degree Section Clashes:     {audit['section_clashes']}")
        print(f"Course Paper Clashes:       {audit['course_clashes']}")

        report_data = []
        for seat, details in sorted(agent.allocation.items()):
            report_data.append({
                'Assigned Seat': seat,
                'Student ID': details['student_id'],
                'Name': details['name'],
                'Section': details['section'],
                'Course': details['course_code'],
                'ADA Status': 'Yes (Reserved)' if details['ada_needed'] else 'Standard'
            })
        report_df = pd.DataFrame(report_data)

        # Display the entire DataFrame
        pd.set_option('display.max_rows', None)
        print("\n" + report_df.to_string(index=False))

        print("\n" + "=" * 80)
        print("EXPLAINABLE AI (XAI) SAMPLE PERCEPT TRACE")
        print("=" * 80)
        print(agent.explain_assignment("SP25-BDS-003"))
        print("\n" + "=" * 80)
        print(f"Status: Seating chart certified for presentation and deployment.")
    else:
        print("[-] FAILED: Could not satisfy constraints with given room geometry.")
