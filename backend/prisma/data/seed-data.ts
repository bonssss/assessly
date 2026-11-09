export interface SeedOption {
  text: string;
  isCorrect: boolean;
}

export interface SeedQuestion {
  deptCode: string;
  topic: string;
  body: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  explanation: string;
  options: SeedOption[];
}

export interface SeedExam {
  deptCode: string;
  title: string;
  instructions: string;
  durationMinutes: number;
}

export const questionsData: SeedQuestion[] = [
  // --- Computer Science & Software Engineering (CS-101) ---
  {
    deptCode: "CS-101",
    topic: "Data Structures",
    body: "Which data structure operates on a First-In-First-Out (FIFO) principle?",
    difficulty: "EASY",
    explanation: "A Queue processes elements in First-In-First-Out (FIFO) sequence, whereas a Stack is LIFO.",
    options: [
      { text: "Queue", isCorrect: true },
      { text: "Stack", isCorrect: false },
      { text: "Binary Search Tree", isCorrect: false },
      { text: "Heap", isCorrect: false },
    ],
  },
  {
    deptCode: "CS-101",
    topic: "Algorithms",
    body: "What is the worst-case time complexity of QuickSort when elements are already sorted and a naive pivot is chosen?",
    difficulty: "MEDIUM",
    explanation: "Without randomized or median-of-three pivot selection, an already sorted array degrades QuickSort to O(n²) comparisons.",
    options: [
      { text: "O(n²)", isCorrect: true },
      { text: "O(n log n)", isCorrect: false },
      { text: "O(n)", isCorrect: false },
      { text: "O(log n)", isCorrect: false },
    ],
  },
  {
    deptCode: "CS-101",
    topic: "Networking",
    body: "Which layer of the OSI model is responsible for logical IP addressing and end-to-end packet routing?",
    difficulty: "MEDIUM",
    explanation: "The Network layer (Layer 3) handles logical IP addressing, routing tables, and internetworking.",
    options: [
      { text: "Network Layer", isCorrect: true },
      { text: "Data Link Layer", isCorrect: false },
      { text: "Transport Layer", isCorrect: false },
      { text: "Application Layer", isCorrect: false },
    ],
  },
  {
    deptCode: "CS-101",
    topic: "Operating Systems",
    body: "Which of the following is NOT one of the four necessary Coffman conditions for a system deadlock to occur?",
    difficulty: "HARD",
    explanation: "Preemption actually prevents deadlock. The fourth deadlock condition is No Preemption (resources cannot be forcibly taken).",
    options: [
      { text: "Preemption allowed by kernel", isCorrect: true },
      { text: "Mutual Exclusion", isCorrect: false },
      { text: "Hold and Wait", isCorrect: false },
      { text: "Circular Wait", isCorrect: false },
    ],
  },
  {
    deptCode: "CS-101",
    topic: "Databases",
    body: "Which SQL normalization form eliminates transitive functional dependencies on non-prime attributes?",
    difficulty: "MEDIUM",
    explanation: "Third Normal Form (3NF) requires 2NF and mandates that no non-prime attribute is transitively dependent on the primary key.",
    options: [
      { text: "Third Normal Form (3NF)", isCorrect: true },
      { text: "First Normal Form (1NF)", isCorrect: false },
      { text: "Second Normal Form (2NF)", isCorrect: false },
      { text: "Boyce-Codd Normal Form (BCNF)", isCorrect: false },
    ],
  },
  {
    deptCode: "CS-101",
    topic: "Software Engineering",
    body: "Which software development methodology emphasizes iterative delivery, customer collaboration, and adaptive planning over rigid contract negotiation?",
    difficulty: "EASY",
    explanation: "The Agile Manifesto explicitly prioritizes customer collaboration, responding to change, and working software in iterative sprints.",
    options: [
      { text: "Agile Development", isCorrect: true },
      { text: "Waterfall Model", isCorrect: false },
      { text: "V-Model", isCorrect: false },
      { text: "Cleanroom Software Engineering", isCorrect: false },
    ],
  },
  {
    deptCode: "CS-101",
    topic: "Cybersecurity",
    body: "In asymmetric public-key cryptography, which key must be used by the recipient to decrypt a message encrypted with their public key?",
    difficulty: "MEDIUM",
    explanation: "In asymmetric cryptography (e.g., RSA), messages encrypted with a party's public key can only be decrypted using that party's private key.",
    options: [
      { text: "Recipient's Private Key", isCorrect: true },
      { text: "Sender's Public Key", isCorrect: false },
      { text: "Sender's Private Key", isCorrect: false },
      { text: "Shared Session Key", isCorrect: false },
    ],
  },
  {
    deptCode: "CS-101",
    topic: "Distributed Systems",
    body: "According to Brewer's CAP Theorem, which two guarantees can a distributed data store choose when network partitions (P) occur?",
    difficulty: "HARD",
    explanation: "In the presence of network partitions, a distributed system must trade off between Consistency (C) and Availability (A).",
    options: [
      { text: "Consistency or Availability", isCorrect: true },
      { text: "Concurrency or Atomicity", isCorrect: false },
      { text: "Partition tolerance or Security", isCorrect: false },
      { text: "Linearizability or Durability", isCorrect: false },
    ],
  },

  // --- Business & Economics (BUS-101) ---
  {
    deptCode: "BUS-101",
    topic: "Management Principles",
    body: "Which core management function involves setting organizational objectives and formulating strategies to achieve them?",
    difficulty: "EASY",
    explanation: "Planning is the foundational management function where organizational goals and future courses of action are decided.",
    options: [
      { text: "Planning", isCorrect: true },
      { text: "Leading", isCorrect: false },
      { text: "Organizing", isCorrect: false },
      { text: "Controlling", isCorrect: false },
    ],
  },
  {
    deptCode: "BUS-101",
    topic: "Basic Economics",
    body: "What is the fundamental economic problem that arises because resources are finite while human wants are unlimited?",
    difficulty: "EASY",
    explanation: "Scarcity is the central economic problem forcing societies to make allocation choices among competing alternatives.",
    options: [
      { text: "Scarcity", isCorrect: true },
      { text: "Hyperinflation", isCorrect: false },
      { text: "Fiscal deficit", isCorrect: false },
      { text: "Monopoly", isCorrect: false },
    ],
  },
  {
    deptCode: "BUS-101",
    topic: "Accounting",
    body: "What is the foundational balance sheet equation in double-entry bookkeeping?",
    difficulty: "EASY",
    explanation: "The core accounting equation states that Assets = Liabilities + Owner's Equity.",
    options: [
      { text: "Assets = Liabilities + Owner's Equity", isCorrect: true },
      { text: "Assets = Liabilities - Owner's Equity", isCorrect: false },
      { text: "Assets + Liabilities = Owner's Equity", isCorrect: false },
      { text: "Revenue - Expenses = Assets", isCorrect: false },
    ],
  },
  {
    deptCode: "BUS-101",
    topic: "Macroeconomics",
    body: "Which term describes a macroeconomic condition characterized by stagnant economic growth, high unemployment, and persistently high inflation?",
    difficulty: "MEDIUM",
    explanation: "Stagflation is the toxic combination of economic stagnation and inflation simultaneously.",
    options: [
      { text: "Stagflation", isCorrect: true },
      { text: "Deflation", isCorrect: false },
      { text: "Reflation", isCorrect: false },
      { text: "Recessionary Liquidity Trap", isCorrect: false },
    ],
  },
  {
    deptCode: "BUS-101",
    topic: "Financial Management",
    body: "Which capital budgeting criterion evaluates an investment by comparing the present value of future cash inflows against the initial cash outlay?",
    difficulty: "MEDIUM",
    explanation: "Net Present Value (NPV) discounts all expected future cash flows to the present and subtracts initial investment costs.",
    options: [
      { text: "Net Present Value (NPV)", isCorrect: true },
      { text: "Payback Period", isCorrect: false },
      { text: "Accounting Rate of Return (ARR)", isCorrect: false },
      { text: "Gross Margin Ratio", isCorrect: false },
    ],
  },
  {
    deptCode: "BUS-101",
    topic: "Marketing Strategy",
    body: "In the traditional marketing mix framework, which of the following represents the foundational '4 Ps'?",
    difficulty: "EASY",
    explanation: "The traditional marketing mix developed by E. Jerome McCarthy consists of Product, Price, Place, and Promotion.",
    options: [
      { text: "Product, Price, Place, Promotion", isCorrect: true },
      { text: "People, Process, Profit, Packaging", isCorrect: false },
      { text: "Planning, Production, Promotion, Payroll", isCorrect: false },
      { text: "Performance, Penetration, Positioning, Price", isCorrect: false },
    ],
  },

  // --- Civil & Environmental Engineering (ENG-101) ---
  {
    deptCode: "ENG-101",
    topic: "Structural Analysis",
    body: "In structural mechanics, what type of beam has three or more support reactions, making equations of static equilibrium insufficient to determine all unknowns?",
    difficulty: "MEDIUM",
    explanation: "Statically indeterminate structures cannot be analyzed solely with equilibrium equations (ΣFx=0, ΣFy=0, ΣM=0) and require deformation/compatibility equations.",
    options: [
      { text: "Statically Indeterminate Beam", isCorrect: true },
      { text: "Simply Supported Beam", isCorrect: false },
      { text: "Cantilever Beam", isCorrect: false },
      { text: "Statically Determinate Truss", isCorrect: false },
    ],
  },
  {
    deptCode: "ENG-101",
    topic: "Fluid Mechanics",
    body: "Which governing equation in fluid dynamics expresses the principle of conservation of energy along a streamline for steady, frictionless, incompressible flow?",
    difficulty: "EASY",
    explanation: "Bernoulli's equation states that P/ρg + v²/2g + z = constant along a streamline in ideal steady flow.",
    options: [
      { text: "Bernoulli's Equation", isCorrect: true },
      { text: "Manning's Formula", isCorrect: false },
      { text: "Darcy-Weisbach Equation", isCorrect: false },
      { text: "Navier-Stokes Compressible Form", isCorrect: false },
    ],
  },
  {
    deptCode: "ENG-101",
    topic: "Geotechnical Engineering",
    body: "Which physical law describes the rate of fluid flow through a porous soil medium proportional to the hydraulic gradient?",
    difficulty: "MEDIUM",
    explanation: "Darcy's Law (Q = k * i * A) relates discharge velocity to permeability coefficient and hydraulic gradient in soils.",
    options: [
      { text: "Darcy's Law", isCorrect: true },
      { text: "Hooke's Law", isCorrect: false },
      { text: "Terzaghi's Effective Stress Principle", isCorrect: false },
      { text: "Stokes' Settling Law", isCorrect: false },
    ],
  },
  {
    deptCode: "ENG-101",
    topic: "Environmental Engineering",
    body: "What critical wastewater parameter measures the amount of dissolved oxygen required by aerobic microorganisms to biologically decompose organic matter over 5 days?",
    difficulty: "EASY",
    explanation: "Biochemical Oxygen Demand (BOD5) measures the oxygen required by microbes to degrade organic pollutants.",
    options: [
      { text: "Biochemical Oxygen Demand (BOD)", isCorrect: true },
      { text: "Chemical Oxygen Demand (COD)", isCorrect: false },
      { text: "Total Dissolved Solids (TDS)", isCorrect: false },
      { text: "Total Suspended Solids (TSS)", isCorrect: false },
    ],
  },
  {
    deptCode: "ENG-101",
    topic: "Transportation Engineering",
    body: "In highway geometric design, why are transition spirals and super-elevation (cant) introduced along horizontal curves?",
    difficulty: "MEDIUM",
    explanation: "Super-elevation counteracts the lateral centrifugal force acting on vehicles negotiating horizontal highway curves.",
    options: [
      { text: "To counteract lateral centrifugal force on traversing vehicles", isCorrect: true },
      { text: "To maximize pavement asphalt thickness", isCorrect: false },
      { text: "To eliminate longitudinal stormwater runoff", isCorrect: false },
      { text: "To increase tyre friction coefficient beyond 1.0", isCorrect: false },
    ],
  },

  // --- Law & Legal Studies (LAW-101) ---
  {
    deptCode: "LAW-101",
    topic: "Constitutional Law",
    body: "Under modern constitutional doctrine, what doctrine establishes that a supreme constitution overrides any conflicting secondary legislation enacted by parliament?",
    difficulty: "EASY",
    explanation: "Constitutional Supremacy means the constitution is the supreme law of the land; any law inconsistent with it is null and void.",
    options: [
      { text: "Constitutional Supremacy", isCorrect: true },
      { text: "Parliamentary Sovereignty", isCorrect: false },
      { text: "Executive Prerogative", isCorrect: false },
      { text: "Stare Decisis", isCorrect: false },
    ],
  },
  {
    deptCode: "LAW-101",
    topic: "Criminal Jurisprudence",
    body: "In criminal jurisprudence, which two foundational elements must normally coincide for criminal liability to be established?",
    difficulty: "EASY",
    explanation: "Criminal liability requires both an unlawful physical act or omission (Actus Reus) and a culpable mental state (Mens Rea).",
    options: [
      { text: "Actus Reus and Mens Rea", isCorrect: true },
      { text: "Corpus Delicti and Habeas Corpus", isCorrect: false },
      { text: "Prima Facie and Res Ipsa Loquitur", isCorrect: false },
      { text: "Subpoena and Quo Warranto", isCorrect: false },
    ],
  },
  {
    deptCode: "LAW-101",
    topic: "Civil Procedure",
    body: "What common law doctrine prevents the same parties from re-litigating a lawsuit or claim that has already reached a final judgment on the merits?",
    difficulty: "MEDIUM",
    explanation: "Res Judicata bars parties from re-litigating claims that have already been settled by a competent court's final judgment.",
    options: [
      { text: "Res Judicata", isCorrect: true },
      { text: "Locus Standi", isCorrect: false },
      { text: "Obiter Dictum", isCorrect: false },
      { text: "Amicus Curiae", isCorrect: false },
    ],
  },
  {
    deptCode: "LAW-101",
    topic: "Law of Contracts",
    body: "What essential legal element in the formation of a binding simple contract represents the bargained-for exchange or price paid for the promise?",
    difficulty: "MEDIUM",
    explanation: "Consideration is the legal value, detriment, or benefit given in exchange for a promise to make an agreement enforceable.",
    options: [
      { text: "Consideration", isCorrect: true },
      { text: "Promissory Estoppel", isCorrect: false },
      { text: "Privity of Contract", isCorrect: false },
      { text: "Liquidated Damages", isCorrect: false },
    ],
  },
  {
    deptCode: "LAW-101",
    topic: "Human Rights Law",
    body: "Adopted by the United Nations General Assembly in 1948, which landmark document serves as the global standard for universal human rights protection?",
    difficulty: "EASY",
    explanation: "The Universal Declaration of Human Rights (UDHR) was proclaimed in Paris on 10 December 1948 as a common standard for all peoples.",
    options: [
      { text: "Universal Declaration of Human Rights (UDHR)", isCorrect: true },
      { text: "Geneva Conventions of 1949", isCorrect: false },
      { text: "Treaty of Versailles", isCorrect: false },
      { text: "Magna Carta", isCorrect: false },
    ],
  },

  // --- Medicine & Health Sciences (MED-101) ---
  {
    deptCode: "MED-101",
    topic: "Cellular Biology & Anatomy",
    body: "Which cellular organelle is responsible for generating the majority of adenosine triphosphate (ATP) through oxidative phosphorylation?",
    difficulty: "EASY",
    explanation: "Mitochondria are the primary sites of ATP production via aerobic respiration and the electron transport chain.",
    options: [
      { text: "Mitochondria", isCorrect: true },
      { text: "Ribosome", isCorrect: false },
      { text: "Golgi apparatus", isCorrect: false },
      { text: "Endoplasmic reticulum", isCorrect: false },
    ],
  },
  {
    deptCode: "MED-101",
    topic: "Pharmacology",
    body: "What is the primary mechanism of action of beta-lactam antibiotics such as penicillin?",
    difficulty: "MEDIUM",
    explanation: "Beta-lactams inhibit transpeptidase enzymes, preventing bacterial peptidoglycan cell wall cross-linking.",
    options: [
      { text: "Inhibition of bacterial cell wall synthesis", isCorrect: true },
      { text: "Disruption of 50S ribosomal protein synthesis", isCorrect: false },
      { text: "Blockade of DNA gyrase topoisomerase", isCorrect: false },
      { text: "Interference with folic acid metabolism", isCorrect: false },
    ],
  },
  {
    deptCode: "MED-101",
    topic: "Endocrinology",
    body: "Which hormone secreted by pancreatic beta cells promotes cellular uptake of glucose, thereby lowering serum blood sugar?",
    difficulty: "EASY",
    explanation: "Insulin promotes glucose transport into muscle and adipose tissues and stimulates glycogen synthesis.",
    options: [
      { text: "Insulin", isCorrect: true },
      { text: "Glucagon", isCorrect: false },
      { text: "Cortisol", isCorrect: false },
      { text: "Thyroxine (T4)", isCorrect: false },
    ],
  },
  {
    deptCode: "MED-101",
    topic: "Cardiology",
    body: "Which intrinsic specialized cardiac conduction tissue initiates spontaneous electrical impulses, functioning as the primary physiological pacemaker of the human heart?",
    difficulty: "EASY",
    explanation: "The Sinoatrial (SA) node located in the right atrium possesses the fastest intrinsic automaticity and acts as the heart's natural pacemaker.",
    options: [
      { text: "Sinoatrial (SA) Node", isCorrect: true },
      { text: "Atrioventricular (AV) Node", isCorrect: false },
      { text: "Bundle of His", isCorrect: false },
      { text: "Purkinje Fiber Network", isCorrect: false },
    ],
  },
  {
    deptCode: "MED-101",
    topic: "Medical Ethics",
    body: "Which fundamental bioethical principle requires clinicians to respect a competent patient's right to make autonomous, informed decisions regarding their medical care?",
    difficulty: "EASY",
    explanation: "Autonomy upholds the patient's right to self-determination, informed consent, and refusal of treatment.",
    options: [
      { text: "Autonomy", isCorrect: true },
      { text: "Beneficence", isCorrect: false },
      { text: "Non-maleficence", isCorrect: false },
      { text: "Distributive Justice", isCorrect: false },
    ],
  },
];

export const mockExams: SeedExam[] = [
  {
    deptCode: "CS-101",
    title: "Computer Science Comprehensive Exit Examination",
    instructions: "Answer all questions. Strict 60-minute duration. Server-side deadline enforced.",
    durationMinutes: 60,
  },
  {
    deptCode: "BUS-101",
    title: "Business & Economics Exit Exam Mock Test",
    instructions: "Comprehensive test evaluating core economics, accounting, and management principles.",
    durationMinutes: 60,
  },
  {
    deptCode: "ENG-101",
    title: "Civil & Environmental Engineering Licensure Mock Examination",
    instructions: "Comprehensive assessment covering structural analysis, fluid mechanics, geotechnics, and environmental engineering.",
    durationMinutes: 60,
  },
  {
    deptCode: "LAW-101",
    title: "Jurisprudence & Legal Studies Qualification Exam",
    instructions: "Evaluates constitutional law, criminal jurisprudence, and civil procedure standards.",
    durationMinutes: 60,
  },
  {
    deptCode: "MED-101",
    title: "Clinical Medicine & Health Sciences Licensure Mock",
    instructions: "Licensure mock assessment covering pharmacology, anatomy, and clinical diagnostics.",
    durationMinutes: 60,
  },
];
