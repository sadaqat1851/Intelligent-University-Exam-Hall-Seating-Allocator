/**
 * Intelligent University Exam Hall Seating Allocator - CSP Solver Engine
 * CSC262: Artificial Intelligence - I (COMSATS University Islamabad)
 * 
 * Formalization as a Constraint Satisfaction Problem (CSP):
 * - Variables (X): Ordered list of students (ADA students prioritized first).
 * - Domains (D): Available physical seats {Hall_X-RrCc} across all configured exam halls.
 * - Constraints (C):
 *     1. Hard Constraint (ADA Compliance): ADA-flagged students must be assigned
 *        exclusively to ADA-compliant seats (ground floor / row 1 of accessible halls).
 *     2. Anti-Cheating Isolation Rule (Soft/Orthogonal Constraint):
 *        No two students sharing the same degree section OR the same course code may sit
 *        in orthogonally adjacent desks (|dr| + |dc| == 1 in the same room).
 *     3. Uniqueness: Each seat may hold at most one student.
 */

class CSPExamSeatingAllocator {
  constructor(students, rooms, options = {}) {
    // Clone inputs to avoid external mutation
    this.students = JSON.parse(JSON.stringify(students));
    this.rooms = JSON.parse(JSON.stringify(rooms));
    this.options = {
      mode: options.mode || 'baseline', // 'baseline', 'balanced', 'mrv'
      ...options
    };

    this.allocation = {}; // Map of seat_id -> student_record
    this.studentToSeat = {}; // Map of student_id -> seat_id
    this.stats = {
      steps: 0,
      backtracks: 0,
      checks: 0,
      startTime: 0,
      endTime: 0,
      elapsedMs: 0
    };
  }

  /**
   * Generates seat domain across all rooms
   */
  buildSeatPool() {
    const availableSeats = [];
    const roomKeys = Object.keys(this.rooms);

    if (this.options.mode === 'balanced') {
      // Round-robin interleave rows across rooms to balance occupancy
      let maxRows = Math.max(...roomKeys.map(k => this.rooms[k].rows));
      for (let r = 0; r < maxRows; r++) {
        for (const roomName of roomKeys) {
          const rInfo = this.rooms[roomName];
          if (r < rInfo.rows) {
            for (let c = 0; c < rInfo.cols; c++) {
              const seatId = `${roomName}-R${r + 1}C${c + 1}`;
              availableSeats.push({
                seat_id: seatId,
                room: roomName,
                row: r + 1,
                col: c + 1,
                ada_compliant: Boolean(rInfo.ada_accessible && r === 0)
              });
            }
          }
        }
      }
    } else {
      // Standard baseline ordering exactly as in Mid.py
      for (const [roomName, rInfo] of Object.entries(this.rooms)) {
        for (let r = 0; r < rInfo.rows; r++) {
          for (let c = 0; c < rInfo.cols; c++) {
            const seatId = `${roomName}-R${r + 1}C${c + 1}`;
            availableSeats.push({
              seat_id: seatId,
              room: roomName,
              row: r + 1,
              col: c + 1,
              // ADA students prefer ground floor / row 1 of accessible rooms
              ada_compliant: Boolean(rInfo.ada_accessible && r === 0)
            });
          }
        }
      }
    }

    return availableSeats;
  }

  /**
   * Order variables (students) with ADA prioritized first (Most Constrained Heuristic)
   */
  orderStudents() {
    const adaStudents = this.students.filter(s => s.ada_needed);
    const normalStudents = this.students.filter(s => !s.ada_needed);
    return [...adaStudents, ...normalStudents];
  }

  /**
   * Constraint check function matching Mid.py:
   * Returns true if placing student in seat given assigned_seats violates no constraint.
   */
  isSafe(student, seat, assignedSeats) {
    this.stats.checks++;

    // Hard constraint: ADA check
    if (student.ada_needed && !seat.ada_compliant) {
      return { safe: false, reason: 'ADA requirement not met (Requires Row 1 of Accessible Hall)' };
    }

    // Soft anti-cheating constraint: Orthogonal adjacency check
    for (const [sId, assignedStudent] of Object.entries(assignedSeats)) {
      if (assignedStudent.room === seat.room) {
        const dRow = Math.abs(assignedStudent.row - seat.row);
        const dCol = Math.abs(assignedStudent.col - seat.col);

        // Orthogonally adjacent if Manhattan distance == 1 (North, South, East, West)
        if (dRow + dCol === 1) {
          if (assignedStudent.section === student.section) {
            return {
              safe: false,
              reason: `Section conflict with ${assignedStudent.student_id} (${assignedStudent.name}) at ${sId} (Same Section: ${student.section})`
            };
          }
          if (assignedStudent.course_code === student.course_code) {
            return {
              safe: false,
              reason: `Course paper conflict with ${assignedStudent.student_id} (${assignedStudent.name}) at ${sId} (Same Course: ${student.course_code})`
            };
          }
        }
      }
    }

    return { safe: true, reason: 'Constraint check passed' };
  }

  /**
   * Synchronous solver matching Mid.py
   */
  solve() {
    this.stats.startTime = performance.now();
    this.stats.steps = 0;
    this.stats.backtracks = 0;
    this.stats.checks = 0;
    this.allocation = {};
    this.studentToSeat = {};

    const orderedStudents = this.orderStudents();
    const availableSeats = this.buildSeatPool();

    const success = this._backtrack(orderedStudents, 0, availableSeats);

    this.stats.endTime = performance.now();
    this.stats.elapsedMs = Math.round((this.stats.endTime - this.stats.startTime) * 100) / 100;

    return success;
  }

  _backtrack(students, index, seats) {
    if (index === students.length) {
      return true;
    }

    this.stats.steps++;
    const currentStudent = students[index];

    for (const seat of seats) {
      if (!(seat.seat_id in this.allocation)) {
        const check = this.isSafe(currentStudent, seat, this.allocation);
        if (check.safe) {
          const seatRecord = {
            ...currentStudent,
            room: seat.room,
            row: seat.row,
            col: seat.col,
            seat_id: seat.seat_id,
            ada_compliant: seat.ada_compliant
          };

          this.allocation[seat.seat_id] = seatRecord;
          this.studentToSeat[currentStudent.student_id] = seat.seat_id;

          if (this._backtrack(students, index + 1, seats)) {
            return true;
          }

          // Backtrack unwind
          this.stats.backtracks++;
          delete this.allocation[seat.seat_id];
          delete this.studentToSeat[currentStudent.student_id];
        }
      }
    }

    return false;
  }

  /**
   * Generator for step-by-step interactive visualizer
   * Yields step events: 'CHECK', 'ASSIGN', 'BACKTRACK', 'SUCCESS', 'FAIL'
   */
  *solveGenerator() {
    this.stats.startTime = performance.now();
    this.stats.steps = 0;
    this.stats.backtracks = 0;
    this.stats.checks = 0;
    this.allocation = {};
    this.studentToSeat = {};

    const orderedStudents = this.orderStudents();
    const availableSeats = this.buildSeatPool();

    function* backtrackGen(allocator, index) {
      if (index === orderedStudents.length) {
        return true;
      }

      allocator.stats.steps++;
      const currentStudent = orderedStudents[index];

      for (const seat of availableSeats) {
        if (!(seat.seat_id in allocator.allocation)) {
          const check = allocator.isSafe(currentStudent, seat, allocator.allocation);

          yield {
            type: 'CHECK',
            student: currentStudent,
            seat: seat,
            passed: check.safe,
            reason: check.reason,
            stats: { ...allocator.stats },
            index: index,
            totalStudents: orderedStudents.length
          };

          if (check.safe) {
            const seatRecord = {
              ...currentStudent,
              room: seat.room,
              row: seat.row,
              col: seat.col,
              seat_id: seat.seat_id,
              ada_compliant: seat.ada_compliant
            };

            allocator.allocation[seat.seat_id] = seatRecord;
            allocator.studentToSeat[currentStudent.student_id] = seat.seat_id;

            yield {
              type: 'ASSIGN',
              student: currentStudent,
              seat: seat,
              allocation: { ...allocator.allocation },
              stats: { ...allocator.stats },
              index: index + 1,
              totalStudents: orderedStudents.length
            };

            const subSuccess = yield* backtrackGen(allocator, index + 1);
            if (subSuccess) {
              return true;
            }

            // Backtrack
            allocator.stats.backtracks++;
            delete allocator.allocation[seat.seat_id];
            delete allocator.studentToSeat[currentStudent.student_id];

            yield {
              type: 'BACKTRACK',
              student: currentStudent,
              seat: seat,
              allocation: { ...allocator.allocation },
              stats: { ...allocator.stats },
              index: index,
              totalStudents: orderedStudents.length
            };
          }
        }
      }

      return false;
    }

    const completed = yield* backtrackGen(this, 0);

    this.stats.endTime = performance.now();
    this.stats.elapsedMs = Math.round((this.stats.endTime - this.stats.startTime) * 100) / 100;

    if (completed) {
      yield {
        type: 'SUCCESS',
        allocation: { ...this.allocation },
        stats: { ...this.stats },
        totalStudents: orderedStudents.length
      };
    } else {
      yield {
        type: 'FAIL',
        allocation: { ...this.allocation },
        stats: { ...this.stats }
      };
    }

    return completed;
  }

  /**
   * Comprehensive Academic Integrity & Constraint Audit
   * Validates any allocation against all rules
   */
  static auditAllocation(allocation, students, rooms) {
    const results = {
      isValid: true,
      totalStudents: students.length,
      totalAssigned: Object.keys(allocation).length,
      adaTotal: students.filter(s => s.ada_needed).length,
      adaCompliantPlaced: 0,
      violations: [],
      orthogonalPairsChecked: 0,
      hallBreakdown: {}
    };

    // Initialize hall counters
    for (const roomName of Object.keys(rooms)) {
      results.hallBreakdown[roomName] = 0;
    }

    // 1. Check Uniqueness & Completeness
    const assignedStudentIds = new Set();
    for (const [seatId, record] of Object.entries(allocation)) {
      if (assignedStudentIds.has(record.student_id)) {
        results.isValid = false;
        results.violations.push({
          type: 'DUPLICATE_STUDENT',
          seatId,
          studentId: record.student_id,
          message: `Student ${record.student_id} is assigned to multiple seats!`
        });
      }
      assignedStudentIds.add(record.student_id);

      if (record.room in results.hallBreakdown) {
        results.hallBreakdown[record.room]++;
      }
    }

    // 2. Check ADA Constraints
    for (const student of students) {
      if (student.ada_needed) {
        const seatId = Object.keys(allocation).find(sid => allocation[sid].student_id === student.student_id);
        if (!seatId) {
          results.isValid = false;
          results.violations.push({
            type: 'ADA_UNASSIGNED',
            studentId: student.student_id,
            message: `ADA student ${student.student_id} (${student.name}) has no seat assigned!`
          });
          continue;
        }

        const seatRecord = allocation[seatId];
        const roomInfo = rooms[seatRecord.room];
        const isCompliant = roomInfo && roomInfo.ada_accessible && seatRecord.row === 1;

        if (isCompliant) {
          results.adaCompliantPlaced++;
        } else {
          results.isValid = false;
          results.violations.push({
            type: 'ADA_NON_COMPLIANT',
            seatId,
            studentId: student.student_id,
            message: `ADA student ${student.student_id} assigned to non-compliant seat ${seatId}!`
          });
        }
      }
    }

    // 3. Check Orthogonal Adjacency (Anti-cheating)
    const seatKeys = Object.keys(allocation);
    for (let i = 0; i < seatKeys.length; i++) {
      const seatA = seatKeys[i];
      const recA = allocation[seatA];

      for (let j = i + 1; j < seatKeys.length; j++) {
        const seatB = seatKeys[j];
        const recB = allocation[seatB];

        if (recA.room === recB.room) {
          const dRow = Math.abs(recA.row - recB.row);
          const dCol = Math.abs(recA.col - recB.col);

          if (dRow + dCol === 1) {
            results.orthogonalPairsChecked++;

            if (recA.section === recB.section) {
              results.isValid = false;
              results.violations.push({
                type: 'ORTHOGONAL_SECTION_CONFLICT',
                seatA,
                seatB,
                studentA: recA.student_id,
                studentB: recB.student_id,
                sharedSection: recA.section,
                message: `Adjacency conflict: ${recA.student_id} (${seatA}) and ${recB.student_id} (${seatB}) share section ${recA.section}!`
              });
            }

            if (recA.course_code === recB.course_code) {
              results.isValid = false;
              results.violations.push({
                type: 'ORTHOGONAL_COURSE_CONFLICT',
                seatA,
                seatB,
                studentA: recA.student_id,
                studentB: recB.student_id,
                sharedCourse: recA.course_code,
                message: `Cheating vulnerability: ${recA.student_id} (${seatA}) and ${recB.student_id} (${seatB}) share course paper ${recA.course_code}!`
              });
            }
          }
        }
      }
    }

    return results;
  }
}
