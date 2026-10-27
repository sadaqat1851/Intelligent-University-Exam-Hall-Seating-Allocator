/**
 * Default Data & Seeded Generators for Intelligent University Exam Hall Seating Allocator
 * Matches Mid.py (CSC262 AI - I, COMSATS University Islamabad)
 */

const DEFAULT_FIRST_NAMES = ['Ali', 'Fatima', 'Bilal', 'Ayesha', 'Usman', 'Zainab', 'Hamza', 'Hira', 'Talha', 'Sana'];
const DEFAULT_LAST_NAMES = ['Khan', 'Noor', 'Ahmed', 'Malik', 'Tariq', 'Bibi', 'Ali', 'Amin', 'Zahid', 'Mir'];
const DEFAULT_SECTIONS = ['BDS-3A', 'BDS-3B', 'BDS-3C'];
const DEFAULT_COURSES = ['CSC262', 'MTH231', 'DSF201'];

// Default Rooms matching Mid.py
const DEFAULT_ROOMS = {
  'Hall_A': { name: 'Hall_A', capacity: 25, rows: 5, cols: 5, ada_accessible: true, floor: 'Ground Floor' },
  'Hall_B': { name: 'Hall_B', capacity: 25, rows: 5, cols: 5, ada_accessible: false, floor: '1st Floor' },
  'Hall_C': { name: 'Hall_C', capacity: 25, rows: 5, cols: 5, ada_accessible: false, floor: '2nd Floor' }
};

// Exact 50 students generated with random.seed(42) in Mid.py
const DEFAULT_STUDENTS = [
  { student_id: "SP25-BDS-001", name: "Fatima Khan", section: "BDS-3C", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-002", name: "Ayesha Malik", section: "BDS-3A", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-003", name: "Fatima Zahid", section: "BDS-3A", course_code: "DSF201", ada_needed: true },
  { student_id: "SP25-BDS-004", name: "Hamza Khan", section: "BDS-3A", course_code: "CSC262", ada_needed: false },
  { student_id: "SP25-BDS-005", name: "Ayesha Malik", section: "BDS-3C", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-006", name: "Ali Zahid", section: "BDS-3A", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-007", name: "Talha Ali", section: "BDS-3A", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-008", name: "Sana Tariq", section: "BDS-3A", course_code: "CSC262", ada_needed: false },
  { student_id: "SP25-BDS-009", name: "Hamza Bibi", section: "BDS-3B", course_code: "CSC262", ada_needed: false },
  { student_id: "SP25-BDS-010", name: "Ayesha Bibi", section: "BDS-3A", course_code: "CSC262", ada_needed: false },
  { student_id: "SP25-BDS-011", name: "Hamza Noor", section: "BDS-3B", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-012", name: "Sana Tariq", section: "BDS-3A", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-013", name: "Hira Zahid", section: "BDS-3A", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-014", name: "Fatima Zahid", section: "BDS-3B", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-015", name: "Sana Bibi", section: "BDS-3C", course_code: "CSC262", ada_needed: true },
  { student_id: "SP25-BDS-016", name: "Fatima Khan", section: "BDS-3C", course_code: "CSC262", ada_needed: false },
  { student_id: "SP25-BDS-017", name: "Usman Noor", section: "BDS-3A", course_code: "CSC262", ada_needed: false },
  { student_id: "SP25-BDS-018", name: "Hamza Tariq", section: "BDS-3B", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-019", name: "Zainab Ahmed", section: "BDS-3B", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-020", name: "Ayesha Tariq", section: "BDS-3C", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-021", name: "Fatima Mir", section: "BDS-3C", course_code: "CSC262", ada_needed: false },
  { student_id: "SP25-BDS-022", name: "Talha Malik", section: "BDS-3A", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-023", name: "Hamza Tariq", section: "BDS-3C", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-024", name: "Talha Malik", section: "BDS-3C", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-025", name: "Ali Malik", section: "BDS-3A", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-026", name: "Hamza Tariq", section: "BDS-3A", course_code: "CSC262", ada_needed: false },
  { student_id: "SP25-BDS-027", name: "Sana Bibi", section: "BDS-3A", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-028", name: "Hira Ali", section: "BDS-3C", course_code: "MTH231", ada_needed: true },
  { student_id: "SP25-BDS-029", name: "Bilal Tariq", section: "BDS-3A", course_code: "CSC262", ada_needed: false },
  { student_id: "SP25-BDS-030", name: "Talha Zahid", section: "BDS-3B", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-031", name: "Sana Ali", section: "BDS-3C", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-032", name: "Zainab Malik", section: "BDS-3A", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-033", name: "Hira Noor", section: "BDS-3A", course_code: "CSC262", ada_needed: false },
  { student_id: "SP25-BDS-034", name: "Bilal Ahmed", section: "BDS-3C", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-035", name: "Sana Noor", section: "BDS-3B", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-036", name: "Sana Amin", section: "BDS-3C", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-037", name: "Talha Khan", section: "BDS-3C", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-038", name: "Fatima Zahid", section: "BDS-3B", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-039", name: "Zainab Noor", section: "BDS-3B", course_code: "MTH231", ada_needed: true },
  { student_id: "SP25-BDS-040", name: "Bilal Amin", section: "BDS-3A", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-041", name: "Usman Zahid", section: "BDS-3A", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-042", name: "Fatima Tariq", section: "BDS-3C", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-043", name: "Sana Malik", section: "BDS-3A", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-044", name: "Bilal Zahid", section: "BDS-3C", course_code: "CSC262", ada_needed: false },
  { student_id: "SP25-BDS-045", name: "Sana Bibi", section: "BDS-3B", course_code: "CSC262", ada_needed: true },
  { student_id: "SP25-BDS-046", name: "Fatima Bibi", section: "BDS-3B", course_code: "CSC262", ada_needed: false },
  { student_id: "SP25-BDS-047", name: "Ali Malik", section: "BDS-3C", course_code: "CSC262", ada_needed: false },
  { student_id: "SP25-BDS-048", name: "Fatima Amin", section: "BDS-3A", course_code: "DSF201", ada_needed: false },
  { student_id: "SP25-BDS-049", name: "Bilal Ahmed", section: "BDS-3C", course_code: "MTH231", ada_needed: false },
  { student_id: "SP25-BDS-050", name: "Talha Ahmed", section: "BDS-3B", course_code: "DSF201", ada_needed: false }
];

// Helper to generate synthetic student lists with custom count / seed
function generateSyntheticStudents(count = 50, adaPercent = 10, seed = null) {
  // Simple pseudo-random number generator if seed provided
  let rng = Math.random;
  if (seed !== null && typeof seed === 'number') {
    let s = seed;
    rng = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  }

  const students = [];
  for (let i = 1; i <= count; i++) {
    const fn = DEFAULT_FIRST_NAMES[Math.floor(rng() * DEFAULT_FIRST_NAMES.length)];
    const ln = DEFAULT_LAST_NAMES[Math.floor(rng() * DEFAULT_LAST_NAMES.length)];
    const sec = DEFAULT_SECTIONS[Math.floor(rng() * DEFAULT_SECTIONS.length)];
    const crs = DEFAULT_COURSES[Math.floor(rng() * DEFAULT_COURSES.length)];
    const isAda = (rng() * 100) < adaPercent;

    students.push({
      student_id: `SP25-BDS-${String(i).padStart(3, '0')}`,
      name: `${fn} ${ln}`,
      section: sec,
      course_code: crs,
      ada_needed: isAda
    });
  }
  return students;
}
