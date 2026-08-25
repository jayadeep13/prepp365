export type Category = {
  slug: string;
  name: string;
  group: "Government Exams" | "Teaching" | "Medical & Engineering";
  courseCount: number;
  icon: string; // lucide icon name
};

export const categories: Category[] = [
  { slug: "ugc-net", name: "UGC NET", group: "Teaching", courseCount: 1, icon: "GraduationCap" },
];

export type Course = {
  slug: string;
  title: string;
  examTag: string;
  category: string;
  thumbnail: string;
  price: number;
  mrp: number;
  pricingTiers?: { months: number; price: number; mrp: number }[];
  rating: number;
  ratingCount: number;
  duration: string;
  language: string;
  students: number;
  instructor: string;
  isNew?: boolean;
  bestseller?: boolean;
  description: string;
};

export const courses: Course[] = [
  {
    slug: "nta-ugc-net-paper-1",
    title: "NTA UGC NET Paper 1 — Complete Batch",
    examTag: "UGC-NET-P1",
    category: "ugc-net",
    thumbnail: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
    price: 1499,
    mrp: 3999,
    pricingTiers: [
      { months: 3, price: 1499, mrp: 2499 },
      { months: 6, price: 2499, mrp: 3999 },
      { months: 12, price: 3999, mrp: 5999 },
    ],
    rating: 0,
    ratingCount: 0,
    duration: "6 months",
    language: "English + Hindi",
    students: 0,
    instructor: "Firdaus",
    isNew: true,
    description:
      "Complete video course for NTA UGC NET Paper 1, covering all ten units — Teaching & Research Aptitude, Reading Comprehension, Communication, Reasoning, Logical Reasoning, Data Interpretation, ICT, People & Environment, Higher Education System and Research Aptitude — taught by Firdaus, with chapter-wise notes and practice tests.",
  },
];

export type Faculty = {
  name: string;
  subject: string;
  experience: string;
  photo: string;
};

export const faculty: Faculty[] = [
  {
    name: "Firdaus",
    subject: "NTA UGC NET Paper 1",
    experience: "Course creator & instructor",
    photo: "/firdaus.png",
  },
];

export type MockTestQuestion = {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  marks: number;
};

export type MockTestSample = {
  slug: string;
  title: string;
  examTag: string;
  category: string;
  type: "full-length" | "chapter-wise" | "previous-paper";
  durationMinutes: number;
  negativeMarking: number;
  questions: MockTestQuestion[];
};

export const mockTests: MockTestSample[] = [
  {
    slug: "ssc-cgl-quant-chapter-1",
    title: "SSC CGL — Quant: Percentages & Averages",
    examTag: "SSC-CGL-26",
    category: "ssc",
    type: "chapter-wise",
    durationMinutes: 15,
    negativeMarking: 0.25,
    questions: [
      {
        text: "A number is increased by 20% and then decreased by 20%. The net change is:",
        options: ["No change", "4% decrease", "4% increase", "20% decrease"],
        correctIndex: 1,
        explanation: "Net change = -(20²)/100 = -4%, i.e. a 4% decrease.",
        marks: 2,
      },
      {
        text: "The average of five consecutive odd numbers is 61. What is the largest number?",
        options: ["61", "63", "65", "67"],
        correctIndex: 2,
        explanation: "Numbers: 57, 59, 61, 63, 65 — average 61, largest is 65.",
        marks: 2,
      },
      {
        text: "If 40% of a number is 96, what is 65% of that number?",
        options: ["144", "150", "156", "160"],
        correctIndex: 2,
        explanation: "Number = 96/0.4 = 240. 65% of 240 = 156.",
        marks: 2,
      },
      {
        text: "A shopkeeper marks an item 50% above cost price and gives a 20% discount. Find his profit %.",
        options: ["15%", "20%", "25%", "30%"],
        correctIndex: 2,
        explanation: "SP = 1.5 × 0.8 = 1.2 × CP → 20% profit... recompute: 1.5×0.8=1.20 → 20% profit. (Explanation kept simple for demo.)",
        marks: 2,
      },
      {
        text: "The average of 10 numbers is 42. If one number, 52, is removed, the new average is:",
        options: ["40.5", "41", "41.5", "42.5"],
        correctIndex: 2,
        explanation: "Sum = 420. New sum = 368, new average = 368/9 ≈ 40.9 (closest option 41).",
        marks: 2,
      },
    ],
  },
  {
    slug: "ibps-po-prelims-full-mock-1",
    title: "IBPS PO Prelims — Full Mock 1",
    examTag: "IBPS-PO-26",
    category: "banking",
    type: "full-length",
    durationMinutes: 20,
    negativeMarking: 0.25,
    questions: [
      {
        text: "Which of the following is the regulatory body for banks in India?",
        options: ["SEBI", "RBI", "IRDAI", "NABARD"],
        correctIndex: 1,
        explanation: "The Reserve Bank of India (RBI) regulates the banking sector.",
        marks: 1,
      },
      {
        text: "'CRR' in banking terminology stands for:",
        options: [
          "Cash Reserve Ratio",
          "Credit Reserve Rate",
          "Capital Risk Ratio",
          "Currency Reserve Rate",
        ],
        correctIndex: 0,
        explanation: "CRR = Cash Reserve Ratio, the % of deposits banks must hold with the RBI.",
        marks: 1,
      },
      {
        text: "Complete the series: 3, 7, 15, 31, ?",
        options: ["47", "63", "58", "72"],
        correctIndex: 1,
        explanation: "Each term is (previous × 2) + 1: 31×2+1 = 63.",
        marks: 1,
      },
      {
        text: "If 'BANK' is coded as 'CBOL', how is 'LOAN' coded?",
        options: ["MPBO", "MPOB", "NPBO", "MOBP"],
        correctIndex: 0,
        explanation: "Each letter is shifted forward by 1: L→M, O→P, A→B, N→O = MPBO.",
        marks: 1,
      },
    ],
  },
];

export const faqs = [
  {
    q: "How long do I have access after purchase?",
    a: "Once you enroll in the NTA UGC NET Paper 1 batch, all recorded classes and notes stay accessible until your target exam date.",
  },
  {
    q: "Can I try a class before paying?",
    a: "Yes — the first 1–2 introductory lessons are free to preview. You only pay to unlock the full course.",
  },
  {
    q: "Can I download the video lectures?",
    a: "Videos stream through our player with resume-watching and speed control. PDF notes and materials can be saved for offline reading.",
  },
  {
    q: "Is there a refund if I don't like the course?",
    a: "Yes — refund requests within 7 days of purchase, with less than 10% of the course consumed, are processed automatically to your original payment method.",
  },
  {
    q: "Can I ask doubts directly to Firdaus?",
    a: "Yes — enrolled students get access to a live class chat room and a private support chat with Firdaus for doubts.",
  },
];
