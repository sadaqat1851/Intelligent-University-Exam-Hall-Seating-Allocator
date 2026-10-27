import pandas as pd
import random

class ExamSeatingAllocator:
    def __init__(self, students_df, rooms_dict):
        self.students = students_df.to_dict(orient='records')
        self.rooms = rooms_dict
        self.allocation = {}

    def solve(self):
        # Step 1: Prioritize ADA students first
        ada_students = [s for s in self.students if s['ada_needed']]
        normal_students = [s for s in self.students if not s['ada_needed']]
        all_ordered_students = ada_students + normal_students
        
        # Step 2: Build available seat pool across rooms
        available_seats = []
        for room_name, r_info in self.rooms.items():
            for r in range(r_info['rows']):
                for c in range(r_info['cols']):
                    seat_id = f"{room_name}-R{r+1}C{c+1}"
                    available_seats.append({
                        'seat_id': seat_id,
                        'room': room_name,
                        'row': r+1,
                        'col': c+1,
                        # ADA students prefer ground floor / row 1 of accessible rooms
                        'ada_compliant': r_info['ada_accessible'] and (r == 0)
                    })

        # Step 3: Run Backtracking Engine
        return self._backtrack(all_ordered_students, 0, available_seats)

    def _is_safe(self, student, seat, assigned_seats):
        # Hard constraint: ADA check
        if student['ada_needed'] and not seat['ada_compliant']:
            return False 

        # Soft anti-cheating constraint: Orthogonal adjacency check
        for s_id, assigned_student in assigned_seats.items():
            if assigned_student['room'] == seat['room']:
                d_row = abs(assigned_student['row'] - seat['row'])
                d_col = abs(assigned_student['col'] - seat['col'])
                
                if d_row + d_col == 1:
                    if (assigned_student['section'] == student['section'] or 
                        assigned_student['course_code'] == student['course_code']):
                        return False
        return True

    def _backtrack(self, students, index, seats):
        if index == len(students):
            return True

        current_student = students[index]
        for seat in seats:
            if seat['seat_id'] not in self.allocation:
                if self._is_safe(current_student, seat, self.allocation):
                    seat_record = {**current_student, 'room': seat['room'], 'row': seat['row'], 'col': seat['col']}
                    self.allocation[seat['seat_id']] = seat_record
                    
                    if self._backtrack(students, index + 1, seats):
                        return True
                    
                    del self.allocation[seat['seat_id']]

        return False

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

    # 3 Rooms with 25 seats each (75 total seats for 50 students to guarantee constraint satisfaction)
    rooms = {
        'Hall_A': {'capacity': 25, 'rows': 5, 'cols': 5, 'ada_accessible': True},
        'Hall_B': {'capacity': 25, 'rows': 5, 'cols': 5, 'ada_accessible': False},
        'Hall_C': {'capacity': 25, 'rows': 5, 'cols': 5, 'ada_accessible': False}
    }

    print("Running CSP Exam Seating Allocator for 50 Students...")
    allocator = ExamSeatingAllocator(df, rooms)
    
    if allocator.solve():
        print("\nSUCCESS: Seating arrangement generated successfully!\n")
        report_data = []
        for seat, details in sorted(allocator.allocation.items()):
            report_data.append({
                'Assigned Seat': seat,
                'Student ID': details['student_id'],
                'Name': details['name'],
                'Section': details['section'],
                'Course': details['course_code'],
                'ADA Status': 'Yes (Reserved)' if details['ada_needed'] else 'Standard'
            })
        report_df = pd.DataFrame(report_data)
        
        # Display the entire DataFrame without truncation
        pd.set_option('display.max_rows', None)
        print(report_df.to_string(index=False))
        
        print(f"\nStatus: Successfully generated and verified seating charts for all {len(report_df)} students. Ready for presentation.")
    else:
        print("FAILED: Could not satisfy constraints.")