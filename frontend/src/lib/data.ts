export type Question = { id: string; dept: string; topic: string; text: string; options: string[]; answer: number };

export const departments = [
  { code: "CS", name: "Computer Science", questions: 1240, resources: 86, desc: "Programming, data structures, networks, databases and operating systems." },
  { code: "ACC", name: "Accounting & Finance", questions: 980, resources: 54, desc: "Financial accounting, auditing, cost accounting and taxation." },
  { code: "MED", name: "Medicine", questions: 2110, resources: 132, desc: "Anatomy, physiology, pharmacology and clinical practice." },
  { code: "LAW", name: "Law", questions: 760, resources: 41, desc: "Constitutional, criminal, civil procedure and commercial law." },
  { code: "CE", name: "Civil Engineering", questions: 890, resources: 63, desc: "Structural analysis, geotechnics, hydraulics and surveying." },
  { code: "ECO", name: "Economics", questions: 670, resources: 38, desc: "Micro and macroeconomics, econometrics and development." },
];

export const plans = [
  { id: "monthly", name: "Monthly", price: 300, period: "30 days", features: ["1 department", "Unlimited practice", "All resources"] },
  { id: "semester", name: "Semester", price: 1200, period: "5 months", features: ["1 department", "Unlimited practice & exams", "All resources", "Performance reports"], popular: true },
  { id: "annual", name: "Annual", price: 2000, period: "12 months", features: ["2 departments", "Unlimited practice & exams", "All resources", "Performance reports"] },
];

export const examQuestions: Question[] = [
  { id: "q1", dept: "CS", topic: "Data Structures", text: "Which data structure provides O(1) average-time lookup by key?", options: ["Singly linked list", "Hash table", "Binary heap", "Stack"], answer: 1 },
  { id: "q2", dept: "CS", topic: "Computer Networks", text: "Which layer of the OSI reference model is responsible for routing packets between networks?", options: ["Data link layer", "Transport layer", "Network layer", "Session layer"], answer: 2 },
  { id: "q3", dept: "CS", topic: "Databases", text: "In a relational database, a primary key must be:", options: ["Nullable and unique", "Unique and not null", "Always a foreign key", "A text column"], answer: 1 },
  { id: "q4", dept: "CS", topic: "Algorithms", text: "What is the worst-case time complexity of quicksort?", options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], answer: 2 },
  { id: "q5", dept: "CS", topic: "Operating Systems", text: "During a context switch, the operating system saves:", options: ["The contents of the disk cache", "The CPU state of the running process", "Only the page table", "All open network sockets"], answer: 1 },
  { id: "q6", dept: "CS", topic: "Software Engineering", text: "Which SDLC model is characterised by sequential, non-overlapping phases?", options: ["Agile", "Spiral", "Waterfall", "Incremental"], answer: 2 },
  { id: "q7", dept: "CS", topic: "Programming", text: "Which keyword in Java prevents a class from being subclassed?", options: ["static", "final", "private", "abstract"], answer: 1 },
  { id: "q8", dept: "CS", topic: "Databases", text: "Which normal form eliminates transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF only"], answer: 2 },
  { id: "q9", dept: "CS", topic: "Computer Networks", text: "The default port for HTTPS is:", options: ["80", "21", "443", "8080"], answer: 2 },
  { id: "q10", dept: "CS", topic: "Algorithms", text: "Dijkstra's algorithm fails when the graph contains:", options: ["Cycles", "Negative edge weights", "More than 100 nodes", "Undirected edges"], answer: 1 },
];

export const resources = [
  { id: "r1", title: "Data Structures Lecture Notes (Ch. 1–8)", dept: "CS", type: "PDF", size: "4.2 MB", updated: "12 Oct 2026" },
  { id: "r2", title: "Computer Networks Past Exit Exam 2025", dept: "CS", type: "Past Paper", size: "1.1 MB", updated: "02 Sep 2026" },
  { id: "r3", title: "Database Normalization Explained", dept: "CS", type: "Video", size: "38 min", updated: "20 Aug 2026" },
  { id: "r4", title: "Operating Systems Summary Sheet", dept: "CS", type: "PDF", size: "860 KB", updated: "15 Aug 2026" },
  { id: "r5", title: "Financial Accounting II Handout", dept: "ACC", type: "PDF", size: "2.7 MB", updated: "30 Sep 2026" },
  { id: "r6", title: "Auditing Principles Past Paper 2024", dept: "ACC", type: "Past Paper", size: "940 KB", updated: "11 Jul 2026" },
  { id: "r7", title: "Algorithm Design Practice Set", dept: "CS", type: "Worksheet", size: "1.4 MB", updated: "05 Oct 2026" },
];

export type PayStatus = "Pending" | "Approved" | "Rejected";
export const paymentHistory: { id: string; date: string; plan: string; amount: number; channel: string; ref: string; status: PayStatus; note?: string }[] = [
  { id: "PAY-2031", date: "01 Nov 2026", plan: "Semester", amount: 1200, channel: "Telebirr", ref: "TB8H2K91QX", status: "Pending" },
  { id: "PAY-1977", date: "14 Oct 2026", plan: "Monthly", amount: 300, channel: "CBE Transfer", ref: "FT26287ABC", status: "Rejected", note: "Receipt image unreadable" },
];

export const adminPayments: { id: string; student: string; dept: string; plan: string; amount: number; channel: string; ref: string; date: string; status: PayStatus }[] = [
  { id: "PAY-2031", student: "Hana Tesfaye", dept: "CS", plan: "Semester", amount: 1200, channel: "Telebirr", ref: "TB8H2K91QX", date: "01 Nov 2026", status: "Pending" },
  { id: "PAY-2030", student: "Abel Girma", dept: "MED", plan: "Monthly", amount: 300, channel: "CBE Transfer", ref: "FT26310A12", date: "01 Nov 2026", status: "Pending" },
  { id: "PAY-2029", student: "Liya Bekele", dept: "LAW", plan: "Annual", amount: 2000, channel: "Telebirr", ref: "TB77QW02LM", date: "31 Oct 2026", status: "Pending" },
  { id: "PAY-2028", student: "Dawit Alemu", dept: "ACC", plan: "Monthly", amount: 300, channel: "CBE Transfer", ref: "FT26288C44", date: "30 Oct 2026", status: "Approved" },
  { id: "PAY-2027", student: "Meron Haile", dept: "CE", plan: "Semester", amount: 1200, channel: "Telebirr", ref: "TB55RT90PA", date: "29 Oct 2026", status: "Approved" },
  { id: "PAY-2026", student: "Yonas Kebede", dept: "ECO", plan: "Monthly", amount: 300, channel: "Telebirr", ref: "TB11AB22CD", date: "28 Oct 2026", status: "Rejected" },
];

export const students = [
  { id: "STU-0142", name: "Hana Tesfaye", email: "hana.t@aau.edu.et", dept: "CS", trial: "5/5", access: "Pending", joined: "28 Oct 2026" },
  { id: "STU-0141", name: "Abel Girma", email: "abel.g@ju.edu.et", dept: "MED", trial: "5/5", access: "Pending", joined: "27 Oct 2026" },
  { id: "STU-0140", name: "Liya Bekele", email: "liya.b@hu.edu.et", dept: "LAW", trial: "3/5", access: "Trial", joined: "25 Oct 2026" },
  { id: "STU-0139", name: "Dawit Alemu", email: "dawit.a@bdu.edu.et", dept: "ACC", trial: "5/5", access: "Active", joined: "20 Oct 2026" },
  { id: "STU-0138", name: "Meron Haile", email: "meron.h@mu.edu.et", dept: "CE", trial: "5/5", access: "Active", joined: "18 Oct 2026" },
];

export const examsList = [
  { id: "cs-mock-1", title: "CS Exit Exam — Mock 1", dept: "CS", questions: 10, minutes: 15, status: "Available" },
  { id: "cs-net", title: "Computer Networks Quiz", dept: "CS", questions: 20, minutes: 25, status: "Completed", score: 80 },
  { id: "cs-db", title: "Database Systems Quiz", dept: "CS", questions: 20, minutes: 25, status: "Completed", score: 65 },
  { id: "cs-mock-2", title: "CS Exit Exam — Mock 2", dept: "CS", questions: 100, minutes: 180, status: "Locked" },
];
