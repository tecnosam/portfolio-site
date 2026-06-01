export const profile = {
  name: "Samuel Abolo",
  title: "Senior Software Engineer",
  subtitle: "Machine Learning · AI Systems · Backend Engineering · MLOps",
  tagline: "I build systems that ship under real production load. From training ML models and designing distributed backends to deploying AI infrastructure that scales without drama.",
  bio: "Senior Software Engineer with 5+ years across machine learning, AI systems, backend engineering, and MLOps. I've trained production ML models, migrated ML pipelines to achieve 360× speedups, reduced AI inference latency by 90%, and cut deployment time from 2 weeks to 30 minutes. I work best at the intersection of correctness and scale.",
  location: "Lagos, Nigeria",
  openTo: "Open to Relocation",
  email: "ikabolo59@gmail.com",
  phone: "+234 706 379 6022",
  socials: {
    linkedin: "https://www.linkedin.com/in/samuel-abolo-24431a176/",
    github: "https://github.com/tecnosam",
    twitter: "https://twitter.com/samuel_abolo",
  },
  resumeUrl: "/Samuel_Abolo_Resume.pdf",
};

export const skills = [
  {
    category: "Machine Learning",
    icon: "🧪",
    items: ["TensorFlow", "PyTorch", "scikit-learn", "Feature Engineering", "Model Training & Evaluation", "Computer Vision", "NLP", "Transfer Learning", "Pricing Models", "Predictive Analytics", "A/B Testing", "ETL Pipelines"],
  },
  {
    category: "AI & LLM Systems",
    icon: "🤖",
    items: ["GPT-4o", "Gemini", "LLaMA", "RAG Pipelines", "pgvector", "FAISS", "Semantic Search", "Prompt Engineering", "Google ADK", "LangChain", "LangGraph", "Multi-agent Orchestration", "Structured Outputs"],
  },
  {
    category: "Backend Engineering",
    icon: "⚙️",
    items: ["Python", "Go", "FastAPI", "AsyncIO", "Pydantic", "Node.js", "Django", "DRF", "REST", "gRPC", "WebSockets", "Kafka", "Redis", "MQTT", "PostgreSQL"],
  },
  {
    category: "MLOps & Model Serving",
    icon: "🚀",
    items: ["Kubernetes", "Docker", "Ray Serve", "Seldon", "Anyscale", "Snowflake", "Terraform", "GitHub Actions", "CI/CD Automation", "Model Versioning", "Deployment Pipelines", "Load Testing"],
  },
  {
    category: "Distributed Systems",
    icon: "🔗",
    items: ["Event-driven Architecture", "Microservices", "High-throughput Pipelines", "Real-time Telemetry", "Stream Processing", "Anomaly Detection", "Predictive Maintenance", "Financial Reconciliation"],
  },
  {
    category: "Cloud & Observability",
    icon: "☁️",
    items: ["GCP", "Vertex AI", "Cloud Run", "AWS", "EKS", "Prometheus", "Grafana", "Loki", "CloudWatch", "Cost Monitoring", "Distributed Tracing"],
  },
];

export const experience = [
  {
    company: "Boostr (via Zazmic Inc)",
    role: "Senior Software Engineer, Agentic AI Platform",
    period: "Nov 2025 – Present",
    location: "New York, USA (Remote)",
    highlights: [
      "Architecting multi-agent orchestration pipelines (Google ADK, Vertex AI, Gemini) for automated AdOps decision-making on GCP",
      "Built answer routing logic with tool-calling, structured outputs, and confidence thresholds",
      "Designed production RAG system using pgvector for semantic retrieval across large customer artifact stores",
      "Implemented end-to-end observability and cost-aware deployment patterns on Kubernetes",
    ],
    current: true,
  },
  {
    company: "TripAdvisor (via Zazmic Inc)",
    role: "Software Engineer II, AI Platforms",
    period: "Oct 2024 – Nov 2025",
    location: "USA (Remote)",
    highlights: [
      "Reduced AI service deployment time from 2 weeks to under 30 minutes (99.5% reduction)",
      "Migrated ML pipelines from Spark on EKS to Snowflake + Ray, cutting query runtime from 4 hours to 40 seconds (360x improvement)",
      "Reduced AI inference latency by 90%, cutting median execution time from 15 minutes to 62 seconds",
      "Built agent evaluation tooling and load-testing framework to stress-test AI microservices",
    ],
    current: false,
  },
  {
    company: "NovaTrack",
    role: "Software Engineer, Real-time Systems (Contract)",
    period: "Sep 2025 – Nov 2025",
    location: "Lagos, Nigeria",
    highlights: [
      "Architected a high-throughput vehicle telematics platform in Go for 10,000+ vehicles",
      "Built real-time behavioral anomaly detection flagging geofence violations and reckless driving",
      "Designed event-driven ingestion pipelines using MQTT and WebSockets",
      "Built distributed microservices with gRPC for low-latency inter-service communication",
    ],
    current: false,
  },
  {
    company: "Credrails",
    role: "Software Engineer, Reconciliation & Finance",
    period: "Apr 2024 – Sep 2024",
    location: "Nairobi, Kenya (Remote)",
    highlights: [
      "Built LLM-powered transaction intelligence system detecting discrepancies across accounts",
      "Engineered the full classification pipeline end-to-end: LLM inference, structured output parsing, regex generation",
      "Built client onboarding platform backend cutting onboarding time by 70%",
    ],
    current: false,
  },
  {
    company: "Quibble",
    role: "Senior Software Engineer, ML Engineering",
    period: "Nov 2022 – Aug 2023",
    location: "Puerto Rico (Remote)",
    highlights: [
      "Built TensorFlow-based pricing recommendation system forecasting optimal nightly rates across a 365-day horizon",
      "Developed computer vision pipeline for room-type classification using transfer learning",
      "Designed and owned ETL pipelines for large-scale property data ingestion and feature engineering",
    ],
    current: false,
  },
];

export const projects = [
  {
    name: "Agentic RAG System (ExcelMind)",
    description: "End-to-end retrieval pipeline using NLP models, vector search, and structured output generation for contextual exam explanation at scale.",
    tags: ["RAG", "NLP", "Vector Search", "Python"],
    link: null,
  },
  {
    name: "Zero-to-One AI Deployment Automation",
    description: "Internal CLI tool automating full lifecycle of deploying AI inference services on EKS and AWS. Auto-generates Terraform and Helm charts, cutting deployment time from 2 weeks to 30 minutes.",
    tags: ["Terraform", "Kubernetes", "AWS", "CI/CD", "Go"],
    link: null,
  },
  {
    name: "Real-time Fleet Intelligence Platform",
    description: "High-throughput vehicle telematics platform in Go with live behavioral anomaly detection, MQTT event ingestion, and predictive maintenance scoring.",
    tags: ["Go", "MQTT", "WebSockets", "PostgreSQL", "Redis", "gRPC"],
    link: null,
  },
  {
    name: "Bookclinic",
    description: "Appointment and booking platform for healthcare providers and clinics. Leading technical architecture, backend infrastructure, and patient booking flows.",
    tags: ["Founding Engineer", "Healthcare", "Backend", "Python"],
    link: null,
  },
];

export const education = [
  {
    institution: "Babcock University",
    degree: "B.Sc. Software Engineering",
    period: "2021 – 2024",
    thesis: "ML-Based Predictive Model for Colorectal Cancer Patient Survival",
  },
  {
    institution: "Yeshua High School",
    degree: "High School Diploma, Science",
    period: "2014 – 2020",
    achievement: "Valedictorian 2020",
  },
];

export const certifications = [
  "Deep Learning Specialization (DeepLearning.AI)",
  "Applied Concurrency in Go",
  "DeepLearning.AI TensorFlow Developer Specialization",
  "TensorFlow Developer Certificate (Google)",
  "Google ML Bootcamp 2022 – Selected among top Sub-Saharan African candidates",
  "Cyber Resilience – LRN Legal Compliance and Ethics Center",
];

export const resumeContext = `
Samuel Abolo is a Senior Software Engineer with 5+ years of experience across machine learning, AI systems, backend engineering, and MLOps. He is highly versatile - equally strong at training ML models, building distributed backends, designing ML infrastructure, and shipping production AI systems.

CURRENT ROLE: Senior Software Engineer, Agentic AI Platform at Boostr (via Zazmic Inc), New York, USA (Remote) - Nov 2025 to Present
- Architecting multi-agent orchestration pipelines (Google ADK, Vertex AI, Gemini) for automated AdOps decision-making on GCP
- Built answer routing logic with tool-calling, structured outputs, and confidence thresholds
- Designed production RAG system using pgvector for semantic retrieval
- Implemented end-to-end observability and cost-aware deployment on Kubernetes

PREVIOUS ROLES:
1. TripAdvisor (via Zazmic Inc) - Software Engineer II, AI Platforms (Oct 2024 – Nov 2025)
   - 99.5% reduction in AI service deployment time (2 weeks → 30 minutes)
   - 360x query runtime improvement (4 hours → 40 seconds) via Snowflake + Ray migration
   - 90% reduction in AI inference latency (15 min → 62 seconds)
   - Built agent evals and load-testing framework

2. NovaTrack - Software Engineer, Real-time Systems (Sep 2025 – Nov 2025, Contract)
   - High-throughput vehicle telematics platform in Go (10,000+ vehicles)
   - Real-time behavioral anomaly detection
   - MQTT/WebSocket event-driven ingestion

3. Credrails - Software Engineer, Reconciliation & Finance (Apr 2024 – Sep 2024)
   - LLM-powered transaction intelligence system
   - 70% reduction in client onboarding time

4. Quibble - Senior Software Engineer, ML Engineering (Nov 2022 – Aug 2023)
   - Built TensorFlow-based pricing recommendation system forecasting optimal nightly rates across a 365-day horizon for short-term rental properties
   - Developed computer vision pipeline for room-type classification and interior attractiveness scoring using transfer learning on ImageNet architectures
   - Designed ETL pipelines for large-scale property data ingestion, cleaning, and feature engineering
   - Mentored a PhD-level junior engineer on model deployment, testing, and production performance tuning

5. Andela - Software Engineer (May 2022 – Apr 2024)
   - Placed with top-tier US companies as part of Andela's elite engineering network
   - Contributed to multiple production systems across MedTech and enterprise software

6. VG Platform Inc - Software Engineer, MedTech (Jan 2024 – Mar 2024)
   - Built backend services for a health-technology product: medication reminders, analytics, patient tracking
   - Integrated Azure App Service and Azure Container Registry for deployment and scalability

7. Prunedge - Backend Developer (Feb 2023 – Jul 2023)
   - Designed and implemented a notification microservice handling push, email, and SMS delivery for thousands of users
   - Built authentication, authorization, and user-invitation systems across multiple services
   - Developed wallet APIs supporting withdrawals, transfers, and deposits in production financial systems

8. ProDevs - Software Engineer (Jan 2023 – Jun 2023)
   - Developed REST APIs using FastAPI for prescription management and automated patient reminders
   - Contributed backend services to medical technology and real-estate management platforms

9. Bookclinic - Founding Engineer / CTO (Dec 2025 – Present)
   - Building appointment and booking platform for healthcare providers and clinics from the ground up
   - Leading technical architecture, backend infrastructure, and product decisions

10. Remllo - Founding Engineer (Jul 2025 – Present)
    - Building a fintech/payments product in the US market

11. ExcelMind - AI Engineer (Jul 2024 – Sep 2024)
    - Built a RAG-based contextual explanation system using NLP models, vector retrieval, and structured output generation
    - Designed data pipelines for training, evaluation, and deployment of NLP-driven exam pattern prediction models

SKILLS:
- Machine Learning: TensorFlow, PyTorch, scikit-learn, feature engineering, model training & evaluation, computer vision, NLP, transfer learning, pricing models, predictive analytics, A/B testing, ETL pipelines
- AI & LLM Systems: GPT-4o, Gemini, LLaMA, RAG pipelines, pgvector, FAISS, embeddings, semantic search, prompt engineering, Google ADK, LangChain, LangGraph, multi-agent orchestration
- Backend Engineering: Python (FastAPI, AsyncIO, Pydantic), Go, Node.js, Django, DRF, REST, gRPC, WebSockets, Kafka, Redis, MQTT, PostgreSQL
- MLOps & Model Serving: Kubernetes, Docker, Ray Serve, Seldon, Anyscale, Snowflake, Terraform, GitHub Actions, CI/CD automation, model versioning, deployment pipelines, load testing
- Distributed Systems: Event-driven architecture, microservices, high-throughput pipelines, real-time telemetry, stream processing, anomaly detection
- Cloud & Observability: GCP (Vertex AI, Cloud Run), AWS, EKS, Prometheus, Grafana, Loki, CloudWatch, cost monitoring

EDUCATION:
- B.Sc. Software Engineering, Babcock University (2021–2024)
- Thesis: ML-Based Predictive Model for Colorectal Cancer Patient Survival
- Valedictorian 2020 (Yeshua High School, 2014–2020)

CERTIFICATIONS:
- Deep Learning Specialization (DeepLearning.AI)
- Applied Concurrency in Go
- DeepLearning.AI TensorFlow Developer Specialization
- TensorFlow Developer Certificate (Google)
- Selected for Google ML Bootcamp 2022 (top Sub-Saharan African candidates)

PROJECTS:
- Agentic RAG System (ExcelMind): NLP models, vector search, structured output generation
- Zero-to-One AI Deployment Automation (TripAdvisor): CLI tool, Terraform, Helm, Kubernetes, AWS
- Real-time Fleet Intelligence Platform (NovaTrack): Go, MQTT, gRPC, PostgreSQL, Redis
- ML-Based Colorectal Cancer Survival Prediction (Thesis): supervised learning, clinical data
- Bookclinic (Founding Engineer / CTO): healthcare SaaS, backend architecture
- Remllo (Founding Engineer): fintech product

OPEN TO:
- Machine Learning Engineer, Senior Software Engineer, AI Engineer, MLOps / ML Infrastructure Engineer, Backend Engineer
- Senior backend, ML platform, infrastructure, and research roles at US companies
- Open to relocation from Lagos, Nigeria

PERSONAL:
- Languages: English (Native), Nigerian Pidgin (Native)
- Hobbies: Quad biking, outdoor activities, nature exploration, technology innovation
- Soft skills: Strong communicator, mentors engineers (mentored PhD-level engineers), DRI mindset, on-call incident response, cross-functional collaboration
- Speaker at tech events (community involvement in Nigerian tech ecosystem)
`;
