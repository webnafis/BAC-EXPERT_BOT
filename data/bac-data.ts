export interface Criterion {
  id: string;
  code: string;
  title: string;
  description: string;
  requiredFiles: string[];
  guidelines: string;
  weight: number; // 1-10
}

export interface Standard {
  id: string;
  code: string;
  title: string;
  description: string;
  criteria: Criterion[];
  demoFiles: DemoFile[];
}

export interface DemoFile {
  id: string;
  name: string;
  description: string;
  content: string; // text content of the demo file
  relatedCriteria: string[]; // criterion ids
}

export const BAC_STANDARDS: Standard[] = [
  {
    id: "s1",
    code: "STD-1",
    title: "Vision, Mission, and Goals",
    description:
      "The program must have clearly defined and documented vision, mission, goals, and objectives that are aligned with the institution's mission and relevant to the needs of society.",
    demoFiles: [
      {
        id: "df1",
        name: "Vision_Mission_Statement_Demo.pdf",
        description:
          "A perfectly structured vision-mission document approved by BAC.",
        content: `DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
VISION, MISSION, GOALS AND OBJECTIVES

VISION:
To be a globally recognized center of excellence in Computer Science and Engineering education, research, and innovation, producing ethical and competent graduates who contribute meaningfully to technological advancement and societal development.

MISSION:
1. To provide high-quality undergraduate and graduate education in Computer Science and Engineering through a rigorous, industry-aligned, and continuously updated curriculum.
2. To foster a culture of research, innovation, and entrepreneurship among faculty and students.
3. To develop graduates with strong technical competencies, professional ethics, and social responsibility.
4. To build strategic partnerships with industry, government, and academic institutions for mutual advancement.

PROGRAM EDUCATIONAL OBJECTIVES (PEOs):
PEO-1: Graduates will demonstrate technical excellence by applying computing knowledge to solve complex engineering problems in professional environments.
PEO-2: Graduates will engage in lifelong learning through advanced studies, certifications, and professional development.
PEO-3: Graduates will exhibit leadership, teamwork, and effective communication skills in multidisciplinary environments.
PEO-4: Graduates will practice professional ethics and contribute positively to society and the environment.

STUDENT OUTCOMES (SOs):
SO-1: An ability to identify, formulate, and solve complex engineering problems.
SO-2: An ability to apply engineering design to produce solutions meeting specified needs.
SO-3: An ability to communicate effectively with diverse audiences.
SO-4: An ability to recognize ethical and professional responsibilities.
SO-5: An ability to function effectively on a team.

ALIGNMENT MATRIX:
The Vision-Mission-PEO alignment has been verified and documented. PEOs are derived directly from the mission statements and are measured through graduate surveys, employer feedback, and alumni tracking conducted every 3 years.`,
        relatedCriteria: ["c1-1", "c1-2"],
      },
    ],
    criteria: [
      {
        id: "c1-1",
        code: "1.1",
        title: "Vision and Mission Statement",
        description:
          "The program shall have a formally documented vision and mission statement that is aligned with the institution's mission.",
        requiredFiles: [
          "Vision and Mission Statement Document",
          "Institutional Mission Statement",
          "Program Brochure/Prospectus",
          "Department Website Screenshot showing V/M",
        ],
        guidelines:
          "The vision should be aspirational and forward-looking (5-10 years). The mission must be specific, actionable, and measurable. Both must be formally approved by relevant governing bodies and publicly displayed.",
        weight: 8,
      },
      {
        id: "c1-2",
        code: "1.2",
        title: "Program Educational Objectives (PEOs)",
        description:
          "The program shall have well-defined Program Educational Objectives that are consistent with the mission and aligned with graduate outcomes.",
        requiredFiles: [
          "PEO Document with Approval Minutes",
          "Mission-PEO Alignment Matrix",
          "Stakeholder Consultation Records",
          "PEO Assessment Plan",
        ],
        guidelines:
          "PEOs should be 3-5 in number, achievable within 3-5 years of graduation, reviewed periodically with stakeholder input.",
        weight: 9,
      },
      {
        id: "c1-3",
        code: "1.3",
        title: "Student Outcomes (SOs)",
        description:
          "The program shall define student outcomes aligned with BAC's 12 criteria that graduates should attain by the time of graduation.",
        requiredFiles: [
          "Student Outcomes Mapping Document",
          "Course-SO Mapping Matrix",
          "SO Assessment Methods Document",
          "SO Attainment Report (Last 3 Years)",
        ],
        guidelines:
          "SOs must include all 12 BAC-specified outcomes. Each SO must have defined assessment tools and performance indicators.",
        weight: 9,
      },
    ],
  },
  {
    id: "s2",
    code: "STD-2",
    title: "Curriculum Design and Delivery",
    description:
      "The curriculum must be designed to achieve program educational objectives and student outcomes, with appropriate content, rigor, and delivery mechanisms.",
    demoFiles: [
      {
        id: "df2",
        name: "Curriculum_Structure_Demo.pdf",
        description: "Complete curriculum document with course mapping.",
        content: `DEPARTMENT OF CSE - CURRICULUM STRUCTURE

TOTAL CREDIT HOURS: 160

CURRICULUM DISTRIBUTION:
- Mathematics & Basic Sciences: 30 credits (18.75%)
- Engineering Sciences: 25 credits (15.62%)
- Computer Science Core: 65 credits (40.62%)
- Elective Courses: 18 credits (11.25%)
- Project/Thesis: 12 credits (7.5%)
- Humanities & Social Sciences: 10 credits (6.25%)

COURSE LIST (Sample):
CSE 1101: Programming Fundamentals (3+1 credits)
CSE 1201: Data Structures (3+1 credits)
CSE 2101: Algorithms (3 credits)
CSE 2201: Database Systems (3+1 credits)
CSE 3101: Software Engineering (3 credits)
CSE 3201: Computer Networks (3+1 credits)
CSE 4101: Machine Learning (3+1 credits)

COURSE-OUTCOME MAPPING MATRIX:
Each course maps to 3-5 Student Outcomes with defined Bloom's Taxonomy levels.

CONTINUOUS IMPROVEMENT:
Curriculum reviewed annually by Curriculum Committee with industry advisory board input.`,
        relatedCriteria: ["c2-1", "c2-2"],
      },
    ],
    criteria: [
      {
        id: "c2-1",
        code: "2.1",
        title: "Curriculum Structure and Content",
        description:
          "The curriculum shall meet minimum credit hour requirements and include appropriate breadth and depth of technical content.",
        requiredFiles: [
          "Full Curriculum Document",
          "Course Syllabus (All Courses)",
          "Credit Hour Distribution Table",
          "BAC Credit Requirement Compliance Table",
        ],
        guidelines:
          "Minimum 160 credit hours for 4-year programs. At least 20% Mathematics/Sciences, 40% CS/Engineering core. Each course syllabus must include CLOs mapped to SOs.",
        weight: 10,
      },
      {
        id: "c2-2",
        code: "2.2",
        title: "Course Learning Outcomes (CLOs)",
        description:
          "Each course must have clearly defined CLOs mapped to program student outcomes.",
        requiredFiles: [
          "CLO-SO Mapping Matrix",
          "Sample Course Syllabi (5 minimum)",
          "Course File Samples",
          "CLO Assessment Tools",
        ],
        guidelines:
          "CLOs must be SMART (Specific, Measurable, Achievable, Relevant, Time-bound) and written in Bloom's Taxonomy action verbs.",
        weight: 9,
      },
      {
        id: "c2-3",
        code: "2.3",
        title: "Laboratory and Practical Components",
        description:
          "The program shall include adequate laboratory/practical components supporting hands-on learning.",
        requiredFiles: [
          "Lab Manuals",
          "Lab Schedule",
          "Equipment Inventory List",
          "Lab Safety Procedures",
          "Lab Reports (Sample)",
        ],
        guidelines:
          "Each technical course should have associated lab component. Lab outcomes must be documented and assessed.",
        weight: 7,
      },
    ],
  },
  {
    id: "s3",
    code: "STD-3",
    title: "Student Assessment and Evaluation",
    description:
      "The program shall have systematic and documented student assessment processes to measure student learning and achievement of student outcomes.",
    demoFiles: [
      {
        id: "df3",
        name: "Assessment_System_Demo.pdf",
        description: "Complete assessment system documentation.",
        content: `ASSESSMENT AND EVALUATION SYSTEM

DIRECT ASSESSMENT TOOLS:
1. Mid-Term Examinations (30% of grade)
2. Final Examinations (40% of grade)
3. Assignments and Quizzes (15% of grade)
4. Laboratory Work (15% of grade)

INDIRECT ASSESSMENT:
1. Course Exit Survey
2. Program Exit Survey
3. Alumni Survey (every 3 years)
4. Employer Survey (every 3 years)

OBE IMPLEMENTATION:
- Course Outcome Attainment calculated after each semester
- Threshold: 60% students achieving 60% marks in each CLO
- Results compiled in Course Assessment Report (CAR)

CONTINUOUS QUALITY IMPROVEMENT (CQI):
- Department Assessment Committee reviews results
- Action plans developed for underperforming outcomes
- Progress monitored in following semester`,
        relatedCriteria: ["c3-1", "c3-2"],
      },
    ],
    criteria: [
      {
        id: "c3-1",
        code: "3.1",
        title: "Student Assessment Methods",
        description:
          "The program shall use multiple assessment methods to evaluate student performance and learning outcomes.",
        requiredFiles: [
          "Assessment Policy Document",
          "Grading Rubrics",
          "Sample Question Papers",
          "Assessment Schedule",
          "Examination Rules and Regulations",
        ],
        guidelines:
          "Use both formative and summative assessments. Rubrics must be aligned to CLOs. Assessment must cover all cognitive levels (Bloom's Taxonomy).",
        weight: 9,
      },
      {
        id: "c3-2",
        code: "3.2",
        title: "Outcome-Based Assessment",
        description:
          "The program must demonstrate outcome-based assessment implementation with evidence of CLO attainment.",
        requiredFiles: [
          "Course Assessment Reports (CARs) - Last 3 Semesters",
          "CLO Attainment Summary",
          "OBE Implementation Guide",
          "Student Performance Data",
        ],
        guidelines:
          "Must show OBE cycle: Define outcomes → Assess → Analyze → Improve. Attainment threshold must be defined and consistently applied.",
        weight: 10,
      },
    ],
  },
  {
    id: "s4",
    code: "STD-4",
    title: "Student Support and Advising",
    description:
      "The program shall provide adequate academic advising, counseling, and support services to facilitate student success and timely graduation.",
    demoFiles: [],
    criteria: [
      {
        id: "c4-1",
        code: "4.1",
        title: "Academic Advising System",
        description:
          "The program shall have a formal academic advising system with documented procedures.",
        requiredFiles: [
          "Academic Advising Policy",
          "Advisor Assignment List",
          "Advising Session Records",
          "Student Handbook",
          "Advising Meeting Minutes (Sample)",
        ],
        guidelines:
          "Each student should have an assigned faculty advisor. Minimum 2 formal advising sessions per semester should be documented.",
        weight: 7,
      },
      {
        id: "c4-2",
        code: "4.2",
        title: "Student Welfare and Support",
        description:
          "The program shall provide student welfare services including counseling, financial aid, and career guidance.",
        requiredFiles: [
          "Student Welfare Services Overview",
          "Scholarship/Financial Aid Policy",
          "Career Services Documentation",
          "Counseling Services Information",
        ],
        guidelines:
          "Document all available student support services. Show evidence of utilization and effectiveness.",
        weight: 6,
      },
    ],
  },
  {
    id: "s5",
    code: "STD-5",
    title: "Faculty and Staff",
    description:
      "The program shall have sufficient qualified faculty with appropriate academic credentials, professional experience, and scholarly activities to deliver quality education.",
    demoFiles: [
      {
        id: "df5",
        name: "Faculty_Profile_Demo.pdf",
        description: "Complete faculty profile documentation.",
        content: `FACULTY PROFILE SUMMARY

TOTAL FACULTY: 15 (Full-time: 12, Part-time: 3)

QUALIFICATION DISTRIBUTION:
- PhD Holders: 6 (40%)
- MS/M.Engg: 9 (60%)

FACULTY-STUDENT RATIO: 1:20

SAMPLE FACULTY PROFILE:
Dr. Mohammad Hasan
Designation: Associate Professor
Qualification: PhD in Computer Science, University of Melbourne, 2018
Research Areas: Machine Learning, Computer Vision
Publications: 25 peer-reviewed articles (h-index: 8)
Teaching Load: 3 courses per semester
Industry Experience: 5 years (Software Engineer, Samsung R&D)

SCHOLARLY ACTIVITIES (Last 3 Years):
- Total Publications: 48 journal articles, 23 conference papers
- Research Grants: 4 (Total: BDT 45 Lakh)
- Books/Book Chapters: 3
- Patents: 1

PROFESSIONAL DEVELOPMENT:
- Faculty attended 12 workshops/training programs
- 3 faculty pursued higher degrees during this period`,
        relatedCriteria: ["c5-1", "c5-2"],
      },
    ],
    criteria: [
      {
        id: "c5-1",
        code: "5.1",
        title: "Faculty Qualifications and Sufficiency",
        description:
          "The program shall have sufficient full-time faculty with appropriate academic qualifications.",
        requiredFiles: [
          "Faculty List with Qualifications",
          "Faculty CVs (All Full-time)",
          "Degree Certificates (Certified Copies)",
          "Faculty-Student Ratio Calculation",
          "Teaching Load Distribution",
        ],
        guidelines:
          "Minimum 60% faculty should hold PhD or equivalent terminal degree. Faculty-student ratio should not exceed 1:25. Each course must have a qualified instructor.",
        weight: 10,
      },
      {
        id: "c5-2",
        code: "5.2",
        title: "Faculty Research and Scholarship",
        description:
          "Faculty must demonstrate active engagement in research, scholarship, and professional development.",
        requiredFiles: [
          "Publication List (Last 5 Years)",
          "Research Grant Records",
          "Conference Participation Evidence",
          "Professional Membership Certificates",
          "Faculty Development Activities Log",
        ],
        guidelines:
          "Each full-time faculty should have at least 1 publication per year. Evidence of ongoing research projects and grant applications should be present.",
        weight: 8,
      },
      {
        id: "c5-3",
        code: "5.3",
        title: "Faculty Performance Evaluation",
        description:
          "The institution shall have a formal faculty performance evaluation system.",
        requiredFiles: [
          "Faculty Evaluation Policy",
          "Student Evaluation Forms (Sample)",
          "Peer Review Records",
          "Annual Performance Reports",
          "Promotion/Tenure Policy",
        ],
        guidelines:
          "Annual evaluation must include teaching, research, and service components. Student feedback should be systematically collected and used for improvement.",
        weight: 7,
      },
    ],
  },
  {
    id: "s6",
    code: "STD-6",
    title: "Facilities and Infrastructure",
    description:
      "The program shall have adequate physical facilities, laboratory equipment, computing resources, and library resources to support program delivery and student learning.",
    demoFiles: [],
    criteria: [
      {
        id: "c6-1",
        code: "6.1",
        title: "Classroom and Laboratory Facilities",
        description:
          "The program shall have adequate and properly equipped classrooms and laboratories.",
        requiredFiles: [
          "Facility Inventory List",
          "Classroom Specifications",
          "Laboratory Equipment List",
          "Floor Plan/Layout",
          "Facility Photos",
          "Maintenance Records",
        ],
        guidelines:
          "Classrooms should have multimedia equipment. Labs should have sufficient computers (1 per student minimum) with required software. All equipment should be calibrated and maintained.",
        weight: 8,
      },
      {
        id: "c6-2",
        code: "6.2",
        title: "Library and Learning Resources",
        description:
          "The program shall have access to adequate library resources and digital learning materials.",
        requiredFiles: [
          "Library Holdings List",
          "Digital Database Subscriptions",
          "Library Usage Statistics",
          "Book Acquisition Plan",
          "E-Resource Access Documentation",
        ],
        guidelines:
          "Library must have current editions of required textbooks. Digital databases (IEEE, ACM, etc.) should be accessible. Library hours should accommodate student schedules.",
        weight: 7,
      },
    ],
  },
  {
    id: "s7",
    code: "STD-7",
    title: "Institutional Support",
    description:
      "The program shall receive adequate institutional support including financial resources, administrative support, and leadership commitment to program quality.",
    demoFiles: [],
    criteria: [
      {
        id: "c7-1",
        code: "7.1",
        title: "Financial Support",
        description:
          "The institution shall provide adequate and stable financial support for program operations and improvement.",
        requiredFiles: [
          "Department Budget (Last 3 Years)",
          "Budget Allocation Documents",
          "Expenditure Reports",
          "Development Plan with Budget",
        ],
        guidelines:
          "Budget must cover faculty salaries, equipment, library, research support, and student activities. Budget trend should show stability or growth.",
        weight: 8,
      },
      {
        id: "c7-2",
        code: "7.2",
        title: "Administrative Leadership",
        description:
          "The program shall have effective administrative leadership and governance structures.",
        requiredFiles: [
          "Organizational Chart",
          "Department Council Minutes",
          "Administrative Policy Documents",
          "Strategic Plan",
        ],
        guidelines:
          "Clear governance structure with defined roles and responsibilities. Regular meetings documented with minutes. Strategic plan aligned with institutional goals.",
        weight: 7,
      },
    ],
  },
  {
    id: "s8",
    code: "STD-8",
    title: "Program Assessment and Continuous Improvement",
    description:
      "The program shall have a systematic and documented continuous quality improvement process based on assessment results and stakeholder feedback.",
    demoFiles: [
      {
        id: "df8",
        name: "CQI_Process_Demo.pdf",
        description: "Continuous Quality Improvement documentation.",
        content: `CONTINUOUS QUALITY IMPROVEMENT (CQI) PROCESS

CQI CYCLE (Annual):
1. Define: Set performance targets for each SO
2. Measure: Collect data through direct and indirect assessment
3. Analyze: Compare results against targets
4. Improve: Develop and implement action plans
5. Review: Monitor improvement effectiveness

ASSESSMENT COMMITTEE:
- Chair: Department Head
- Members: All program coordinators, 2 student representatives
- Meetings: Monthly (documented with minutes)

RECENT CQI ACTIONS:
SO-3 (Communication): Attainment below threshold (55% vs 60% target)
Action: Added technical writing component to CSE 3101
Result: Attainment improved to 68% next cycle

STAKEHOLDER FEEDBACK INTEGRATION:
- Alumni Survey 2023: Added cloud computing elective
- Employer Survey 2023: Enhanced project management content
- Student Survey: Improved lab scheduling`,
        relatedCriteria: ["c8-1"],
      },
    ],
    criteria: [
      {
        id: "c8-1",
        code: "8.1",
        title: "Program Assessment Process",
        description:
          "The program shall have a documented and implemented program assessment process.",
        requiredFiles: [
          "Assessment Process Documentation",
          "Annual Assessment Reports",
          "Outcome Attainment Data",
          "Action Plans and Progress Reports",
          "Assessment Committee Minutes",
        ],
        guidelines:
          "Complete CQI cycle must be documented with evidence. Closing the loop must be demonstrated - show actions taken based on assessment results.",
        weight: 10,
      },
      {
        id: "c8-2",
        code: "8.2",
        title: "Stakeholder Involvement",
        description:
          "The program shall involve all relevant stakeholders in the assessment and improvement process.",
        requiredFiles: [
          "Alumni Survey Instrument and Results",
          "Employer Survey Instrument and Results",
          "Industrial Advisory Board (IAB) Meeting Minutes",
          "Student Feedback Analysis",
        ],
        guidelines:
          "Surveys should be conducted at minimum every 3 years. IAB should meet at least annually. All feedback must be analyzed and used for program improvement.",
        weight: 9,
      },
    ],
  },
  {
    id: "s9",
    code: "STD-9",
    title: "Research and Innovation",
    description:
      "The program shall demonstrate a culture of research and innovation through faculty research activities, student research opportunities, and industry collaboration.",
    demoFiles: [],
    criteria: [
      {
        id: "c9-1",
        code: "9.1",
        title: "Research Culture and Output",
        description:
          "The program shall demonstrate evidence of active research culture and significant research output.",
        requiredFiles: [
          "Research Policy",
          "Publication Database",
          "Research Project List",
          "Grant Application Records",
          "Research Conference Participation",
        ],
        guidelines:
          "Department should have defined research areas. Faculty and student research should be systematically supported and documented.",
        weight: 8,
      },
      {
        id: "c9-2",
        code: "9.2",
        title: "Industry and Community Collaboration",
        description:
          "The program shall demonstrate meaningful collaboration with industry and community.",
        requiredFiles: [
          "MOU/Partnership Agreements",
          "Industry Project Records",
          "Internship Program Documentation",
          "Community Service Records",
          "Technology Transfer Evidence",
        ],
        guidelines:
          "At least 3 active industry partnerships should be documented. Internship program with minimum 70% student participation.",
        weight: 7,
      },
    ],
  },
  {
    id: "s10",
    code: "STD-10",
    title: "Outcomes and Achievements",
    description:
      "The program shall demonstrate evidence of student and graduate achievements, employment outcomes, and overall program effectiveness.",
    demoFiles: [
      {
        id: "df10",
        name: "Graduate_Outcomes_Demo.pdf",
        description: "Graduate achievement and employment data.",
        content: `PROGRAM OUTCOMES AND ACHIEVEMENTS

GRADUATION RATE (Last 5 Years):
2019: 87%  2020: 89%  2021: 91%  2022: 88%  2023: 93%
Average: 89.6%

EMPLOYMENT RATE (Within 6 months of graduation):
2021 Batch: 94%  2022 Batch: 92%  2023 Batch: 96%

TOP EMPLOYERS:
1. Samsung R&D Bangladesh (15 graduates)
2. Brain Station 23 (12 graduates)
3. Grameenphone IT (10 graduates)
4. BJIT Limited (8 graduates)
5. Government/Public Sector (6 graduates)

HIGHER EDUCATION:
25% of graduates pursue MS/PhD (domestic and international)
Top destinations: Canada (8), USA (5), Germany (4), Australia (3)

STUDENT ACHIEVEMENTS:
- National Programming Contest: 3 Gold, 5 Silver medals
- Research Publications by students: 12 papers
- Startup founded by graduates: 4 active startups

AVERAGE STARTING SALARY:
BDT 45,000-75,000 per month (Industry standard: BDT 35,000-60,000)`,
        relatedCriteria: ["c10-1"],
      },
    ],
    criteria: [
      {
        id: "c10-1",
        code: "10.1",
        title: "Student and Graduate Achievement",
        description:
          "The program shall demonstrate evidence of student and graduate achievements.",
        requiredFiles: [
          "Graduation Rate Data (Last 5 Years)",
          "Employment Survey Results",
          "Graduate Tracking System Records",
          "Student Award and Achievement List",
          "Alumni Achievement Database",
        ],
        guidelines:
          "Graduation rate should be above 80%. Employment rate within 6 months should exceed 85%. Achievements should be systematically tracked and documented.",
        weight: 9,
      },
      {
        id: "c10-2",
        code: "10.2",
        title: "Program Effectiveness Indicators",
        description:
          "The program shall track and demonstrate overall program effectiveness metrics.",
        requiredFiles: [
          "Key Performance Indicator (KPI) Report",
          "Benchmarking Data",
          "Trend Analysis Reports",
          "Peer Institution Comparison",
        ],
        guidelines:
          "Define and track minimum 5 KPIs. Compare performance against national benchmarks. Show improvement trends over time.",
        weight: 8,
      },
    ],
  },
];

// In-memory data store (in production, use a database)
let standards = [...BAC_STANDARDS];

export function getStandards(): Standard[] {
  return standards;
}

export function getStandardById(id: string): Standard | undefined {
  return standards.find((s) => s.id === id);
}

export function addStandard(standard: Omit<Standard, "id">): Standard {
  const newStandard: Standard = {
    ...standard,
    id: `s${Date.now()}`,
  };
  standards.push(newStandard);
  return newStandard;
}

export function updateStandard(
  id: string,
  updates: Partial<Standard>
): Standard | null {
  const idx = standards.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  standards[idx] = { ...standards[idx], ...updates };
  return standards[idx];
}

export function deleteStandard(id: string): boolean {
  const idx = standards.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  standards.splice(idx, 1);
  return true;
}

export function addCriterion(
  standardId: string,
  criterion: Omit<Criterion, "id">
): Criterion | null {
  const std = standards.find((s) => s.id === standardId);
  if (!std) return null;
  const newCriterion: Criterion = {
    ...criterion,
    id: `c${Date.now()}`,
  };
  std.criteria.push(newCriterion);
  return newCriterion;
}

export function updateCriterion(
  standardId: string,
  criterionId: string,
  updates: Partial<Criterion>
): Criterion | null {
  const std = standards.find((s) => s.id === standardId);
  if (!std) return null;
  const idx = std.criteria.findIndex((c) => c.id === criterionId);
  if (idx === -1) return null;
  std.criteria[idx] = { ...std.criteria[idx], ...updates };
  return std.criteria[idx];
}

export function deleteCriterion(
  standardId: string,
  criterionId: string
): boolean {
  const std = standards.find((s) => s.id === standardId);
  if (!std) return false;
  const idx = std.criteria.findIndex((c) => c.id === criterionId);
  if (idx === -1) return false;
  std.criteria.splice(idx, 1);
  return true;
}

export function addDemoFile(
  standardId: string,
  demoFile: Omit<DemoFile, "id">
): DemoFile | null {
  const std = standards.find((s) => s.id === standardId);
  if (!std) return null;
  const newFile: DemoFile = { ...demoFile, id: `df${Date.now()}` };
  std.demoFiles.push(newFile);
  return newFile;
}

export function updateDemoFile(
  standardId: string,
  fileId: string,
  updates: Partial<DemoFile>
): DemoFile | null {
  const std = standards.find((s) => s.id === standardId);
  if (!std) return null;
  const idx = std.demoFiles.findIndex((f) => f.id === fileId);
  if (idx === -1) return null;
  std.demoFiles[idx] = { ...std.demoFiles[idx], ...updates };
  return std.demoFiles[idx];
}

export function deleteDemoFile(standardId: string, fileId: string): boolean {
  const std = standards.find((s) => s.id === standardId);
  if (!std) return false;
  const idx = std.demoFiles.findIndex((f) => f.id === fileId);
  if (idx === -1) return false;
  std.demoFiles.splice(idx, 1);
  return true;
}
