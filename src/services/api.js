const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Helper to determine if we should attempt a remote network request
const shouldAttemptRemote = () => {
  if (typeof window === 'undefined') return false;
  // If we are on HTTPS and API_BASE_URL is localhost, do NOT fetch (prevents Mixed Content block)
  if (window.location.protocol === 'https:' && API_BASE_URL.startsWith('http://localhost')) {
    return false;
  }
  return true;
};

// =========================================================================
// EMBEDDED RESILIENT LOCAL STORAGE ENGINE (DEMO & OFFLINE-READY)
// Automatically initializes if the remote backend is unreachable.
// =========================================================================

const LOCAL_STORAGE_USERS_KEY = 'securemind_db_users';
const LOCAL_STORAGE_QUESTIONS_KEY = 'securemind_db_questions';
const LOCAL_STORAGE_RESULTS_KEY = 'securemind_db_results';

const SEED_USERS = [
  {
    id: 'usr_admin_01',
    name: 'Cyber Security Lead',
    email: 'admin@securemind-corp.com',
    department: 'Cybersecurity & IT',
    role: 'admin',
    is_active: true,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    completed_trainings: 5,
    average_score: 95.0,
    pass_rate: 100.0,
    last_activity: new Date().toISOString()
  },
  {
    id: 'usr_staff_01',
    name: 'Sarah Jenkins',
    email: 's.jenkins@securemind-corp.com',
    department: 'Finance',
    role: 'staff',
    is_active: true,
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    completed_trainings: 3,
    average_score: 75.0,
    pass_rate: 66.7,
    last_activity: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'usr_staff_02',
    name: 'Marcus Vance',
    email: 'm.vance@securemind-corp.com',
    department: 'Engineering',
    role: 'staff',
    is_active: true,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    completed_trainings: 4,
    average_score: 100.0,
    pass_rate: 100.0,
    last_activity: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'usr_staff_03',
    name: 'Amara Okafor',
    email: 'a.okafor@securemind-corp.com',
    department: 'HR',
    role: 'staff',
    is_active: true,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    completed_trainings: 2,
    average_score: 87.5,
    pass_rate: 100.0,
    last_activity: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'usr_staff_04',
    name: 'Liam Gallagher',
    email: 'l.gallagher@securemind-corp.com',
    department: 'Sales',
    role: 'staff',
    is_active: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    completed_trainings: 3,
    average_score: 50.0,
    pass_rate: 33.3,
    last_activity: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'usr_staff_05',
    name: 'Elena Rostova',
    email: 'e.rostova@securemind-corp.com',
    department: 'Legal',
    role: 'staff',
    is_active: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    completed_trainings: 2,
    average_score: 100.0,
    pass_rate: 100.0,
    last_activity: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'usr_staff_06',
    name: 'Tariq Al-Mansoor',
    email: 't.almansoor@securemind-corp.com',
    department: 'Operations',
    role: 'staff',
    is_active: true,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    completed_trainings: 2,
    average_score: 62.5,
    pass_rate: 50.0,
    last_activity: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

const SEED_QUESTIONS = [
  {
    id: 1,
    scenario_text: "You receive an urgent email from your CEO requesting an immediate wire transfer for a confidential vendor acquisition while they are in an overseas board meeting.",
    category: "Phishing",
    type: "email_inspection",
    difficulty: "Intermediate",
    email_metadata: {
      title: "Urgent Wire Transfer Authorization",
      is_phishing: true,
      sender_name: "David Sterling (CEO)",
      sender_email: "david.sterling@securem1nd-corp.com",
      reply_to: "exec-confidential-override@mail-router-net.com",
      subject: "URGENT & STRICTLY CONFIDENTIAL: Wire Authorization Ref #99281",
      date: "Today, 08:42 AM",
      spf_status: "FAIL (Spoofed Domain)",
      dkim_status: "Unsigned",
      real_link_target: "http://login.securem1nd-corp.com.portal-auth99.net/verify",
      body_text: "Hi team,\n\nI am currently in closed-door M&A negotiations and cannot take calls. Please process an expedited wire transfer of $48,500 to our external counsel account immediately. Details attached in the secure portal.\n\n[Click here to access wire authorization portal]\n\nThanks,\nDavid Sterling\nChief Executive Officer",
      red_flags: [
        { id: "rf-1", target: "sender", label: "Domain Typosquatting", description: "Notice the sender domain 'securem1nd-corp.com' uses number '1' instead of the letter 'i'." },
        { id: "rf-2", target: "replyto", label: "Mismatched Reply-To Address", description: "Reply-To points to an external unverified domain ('mail-router-net.com')." },
        { id: "rf-3", target: "urgency", label: "Artificial Executive Urgency", description: "Demands an immediate wire transfer while claiming to be unavailable by phone to prevent verification." },
        { id: "rf-4", target: "link", label: "Deceptive Hyperlink URL", description: "The link directs to 'portal-auth99.net', an external credential harvesting server." }
      ],
      educational_debrief: {
        summary: "Business Email Compromise (BEC) / CEO Fraud attack.",
        explanation: "Cybercriminals impersonate senior executives to coerce finance staff into bypassing standard multi-tier approval protocols. They rely on fear of reprimand and artificial urgency.",
        key_takeaways: [
          "Always execute out-of-band verification (call the executive or verified secondary contact) before transferring funds.",
          "Inspect sender domain names letter-by-letter for subtle number/character substitutions.",
          "Check Reply-To headers if an email asks for confidentiality or urgent wire transfers."
        ]
      }
    },
    options: [
      "Immediately click the link and authorize the wire to avoid delaying the CEO's meeting.",
      "Verify the request through an out-of-band secondary channel (e.g., call the CEO's verified office number or follow internal finance dual-control protocol).",
      "Forward the email to your personal email to view the attachment safely.",
      "Reply directly to the email asking for confirmation of the bank routing number."
    ],
    correct_index: 1,
    educational_feedback: "This is a classic Business Email Compromise (BEC) attack. Never rely on email instructions alone for financial transactions; always execute out-of-band verification via established multi-party approval protocols."
  },
  {
    id: 2,
    scenario_text: "An automated notification claiming your Microsoft 365 password is expiring in 2 hours arrives in your inbox with a link to retain your existing credentials.",
    category: "Phishing",
    type: "email_inspection",
    difficulty: "Beginner",
    email_metadata: {
      title: "Microsoft 365 Password Expiration Alert",
      is_phishing: true,
      sender_name: "Microsoft 365 Security Team",
      sender_email: "no-reply@security-msft-notifications-live.com",
      reply_to: "support@security-msft-notifications-live.com",
      subject: "Action Required: Your corporate password expires in 2 hours",
      date: "Today, 09:15 AM",
      spf_status: "NEUTRAL (Third-party sender)",
      dkim_status: "PASS (Domain mismatch)",
      real_link_target: "https://login-microsoftonline.account-sync.tech/auth",
      body_text: "Your enterprise Microsoft 365 password is scheduled to expire in 2 hours.\n\nTo keep your current password and prevent email disruption, click below to keep your active credentials.\n\n[Keep My Current Password]\n\nIT Support Services",
      red_flags: [
        { id: "rf-1", target: "sender", label: "Suspicious Third-Party Domain", description: "Microsoft internal notifications originate from microsoft.com, not security-msft-notifications-live.com." },
        { id: "rf-2", target: "urgency", label: "Arbitrary Expiration Countdown", description: "Creates false pressure (2 hours) to provoke hasty action without thinking." },
        { id: "rf-3", target: "link", label: "Phishing Landing Page", description: "Points to 'account-sync.tech', a credential harvesting site designed to clone the MS login interface." }
      ],
      educational_debrief: {
        summary: "Credential Harvesting Phishing Campaign.",
        explanation: "Attackers clone login pages of ubiquitous enterprise platforms (Microsoft 365, Google Workspace, Okta) to harvest corporate passwords and session tokens.",
        key_takeaways: [
          "Never click links in emails to reset or retain passwords. Always navigate manually to portal.office.com.",
          "Enterprise IT will never ask you to click a button to 'keep your existing password'.",
          "Enable hardware/FIDO2 MFA keys to neutralize harvested credentials."
        ]
      }
    },
    options: [
      "Click the button and enter your password to avoid being locked out of corporate email.",
      "Report the email to the Security Team and navigate manually to the official identity portal to check password status.",
      "Forward the email to coworkers to see if their passwords are also expiring.",
      "Reply with your current password to request an extension."
    ],
    correct_index: 1,
    educational_feedback: "Attackers leverage urgency and fear of system disruption to harvest corporate credentials. Real identity providers never provide links to 'keep your existing password'."
  },
  {
    id: 3,
    scenario_text: "An annual health and dental benefits enrollment reminder is sent from the internal People & Culture team directing staff to the company intranet.",
    category: "Phishing",
    type: "email_inspection",
    difficulty: "Advanced",
    email_metadata: {
      title: "HR Benefits Policy Update (Official Internal)",
      is_phishing: false,
      sender_name: "Amara Okafor (Head of HR)",
      sender_email: "hr@securemind-corp.com",
      reply_to: "hr@securemind-corp.com",
      subject: "Quarterly Reminder: Annual Health Benefits Enrollment Window",
      date: "Yesterday, 02:30 PM",
      spf_status: "PASS (Aligned corporate domain)",
      dkim_status: "PASS (Validated RSA signature)",
      real_link_target: "https://intranet.securemind-corp.com/benefits/2026",
      body_text: "Hello all,\n\nThis is a friendly reminder that the annual open enrollment for our health and dental coverage closes at the end of this month.\n\nYou can review your current coverage tier directly on the internal employee intranet:\n\n[Visit Employee Intranet Benefits Portal]\n\nWarm regards,\nPeople & Culture Team",
      red_flags: [],
      educational_debrief: {
        summary: "Legitimate Internal Corporate Communication.",
        explanation: "The sender domain is legitimate (@securemind-corp.com), SPF and DKIM pass completely, the URL points to the internal verified intranet subdomain, and there is no artificial panic.",
        key_takeaways: [
          "Legitimate emails direct employees to verified internal portal bookmarks or company intranets.",
          "Look for proper cryptographic alignment (SPF and DKIM pass).",
          "Calm, informative reminders without demanding credentials or urgent money transfers are standard for internal HR."
        ]
      }
    },
    options: [
      "Mark as Safe and visit the benefits portal via the verified company intranet link.",
      "Report the email as malicious phishing and block the HR director's address.",
      "Download email attachments to an external personal USB drive.",
      "Ignore all company benefits communications permanently."
    ],
    correct_index: 0,
    educational_feedback: "This is a legitimate internal email: sender address matches the official company domain, authentication headers pass, and links point directly to the company intranet without suspicious parameters."
  },
  {
    id: 4,
    scenario_text: "You receive a rapid succession of 15 push notifications on your phone asking you to approve an authentication request from an unknown device in Eastern Europe at 2:00 AM.",
    category: "Credential Hygiene",
    type: "multiple_choice",
    difficulty: "Intermediate",
    email_metadata: null,
    options: [
      "Approve the notification so your phone stops buzzing and go back to sleep.",
      "Deny the request, immediately change your password, and report the incident to the Security Operations Center (SOC).",
      "Turn off your phone's Wi-Fi and ignore it until the morning.",
      "Approve just once to see which application is requesting access."
    ],
    correct_index: 1,
    educational_feedback: "This is an 'MFA Fatigue' or 'Prompt Bombing' attack. Attackers have your password and spam your 2FA app hoping you will accidentally approve access. Denying the prompt and changing your credentials stops the intrusion."
  },
  {
    id: 5,
    scenario_text: "An incoming caller claims to be 'Alex from the Enterprise IT Service Desk'. They state your workstation has been flagged for malware and ask you to read back the 6-digit one-time code sent to your mobile phone.",
    category: "Social Engineering",
    type: "multiple_choice",
    difficulty: "Advanced",
    email_metadata: null,
    options: [
      "Read the code to Alex because legitimate IT support personnel often need it for remote debugging.",
      "Ask Alex for their employee ID and immediately share the code once provided.",
      "Refuse to provide the OTP, hang up, and call the official IT Helpdesk using the verified internal directory number.",
      "Give them a fake code first to see if they can detect it."
    ],
    correct_index: 2,
    educational_feedback: "Legitimate IT staff will NEVER ask for your One-Time Passcode (OTP), passwords, or 2FA credentials. This is Voice Phishing (Vishing) aimed at intercepting session authorization tokens. Always verify callers via official internal directories."
  },
  {
    id: 6,
    scenario_text: "While walking through the employee cafeteria, you notice a brand-new 64GB USB thumb drive labeled 'Q4 Executive Salary & Bonus Review.xlsx'.",
    category: "Physical Security",
    type: "multiple_choice",
    difficulty: "Beginner",
    email_metadata: null,
    options: [
      "Plug it into your corporate laptop to find the owner's name in the document properties.",
      "Plug it into an isolated test computer in the IT room without informing anyone.",
      "Do not connect the drive to any machine; deliver it directly to Corporate Physical Security / IT Incident Response.",
      "Format the USB drive immediately so you can use it for your own presentations."
    ],
    correct_index: 2,
    educational_feedback: "This is a 'Baiting' / 'USB Drop' attack. Rogue flash drives can execute malicious payloads, keyboard emulator scripts (Rubber Ducky), or ransomware automatically upon insertion. Never connect untrusted physical media to corporate devices."
  },
  {
    id: 7,
    scenario_text: "A regular vendor sends an invoice as an attached .xlsm (macro-enabled) file. Upon opening, a yellow banner reads: 'Macros have been disabled. Click Enable Content to view your encrypted invoice.'",
    category: "Ransomware",
    type: "multiple_choice",
    difficulty: "Intermediate",
    email_metadata: null,
    options: [
      "Click 'Enable Content' since invoices commonly require macros to calculate sales tax.",
      "Do not enable macros, close the file, and reach out to the vendor through a verified phone number to confirm the document's authenticity.",
      "Forward the macro-enabled file to all team members to see if anyone else can read it.",
      "Disable your antivirus software temporarily to allow the macro to finish calculating."
    ],
    correct_index: 1,
    educational_feedback: "Macro-enabled office documents are a primary delivery vehicle for trojans, loaders, and ransomware. Attackers use social engineering prompts to lure victims into enabling macros. Genuine invoices rarely require VBA macro execution."
  },
  {
    id: 8,
    scenario_text: "A customer success teammate messages you on Slack: 'Hey, I lost my login to our customer database. Can you DM me your username and password real quick? I have a client on the phone!'",
    category: "Credential Hygiene",
    type: "multiple_choice",
    difficulty: "Beginner",
    email_metadata: null,
    options: [
      "Send your credentials via Direct Message since Slack is an encrypted internal tool.",
      "Decline to share credentials, remind the teammate of company policy prohibiting credential sharing, and direct them to IT for emergency access.",
      "Change your password to something simple, share it, and change it back tomorrow.",
      "Post the credentials in a private Slack channel so other team members can also help."
    ],
    correct_index: 1,
    educational_feedback: "Sharing account credentials violates the principle of individual accountability, breaks audit logging trails, and increases credential leak surface. Users must never share passwords under any circumstance."
  }
];

function getStoredUsers() {
  const data = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  if (data) {
    try { 
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

function saveStoredUsers(users) {
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
}

function getStoredQuestions() {
  const data = localStorage.getItem(LOCAL_STORAGE_QUESTIONS_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  localStorage.setItem(LOCAL_STORAGE_QUESTIONS_KEY, JSON.stringify(SEED_QUESTIONS));
  return SEED_QUESTIONS;
}

function getStoredResults() {
  const data = localStorage.getItem(LOCAL_STORAGE_RESULTS_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  const initialResults = [
    { id: 1, user_id: 'usr_staff_01', score: 6, total_questions: 8, percentage: 75.0, passed: true, category_scores: {}, timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 2, user_id: 'usr_staff_02', score: 8, total_questions: 8, percentage: 100.0, passed: true, category_scores: {}, timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 3, user_id: 'usr_staff_03', score: 7, total_questions: 8, percentage: 87.5, passed: true, category_scores: {}, timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 4, user_id: 'usr_staff_04', score: 4, total_questions: 8, percentage: 50.0, passed: false, category_scores: {}, timestamp: new Date(Date.now() - 4 * 86400000).toISOString() },
    { id: 5, user_id: 'usr_staff_05', score: 8, total_questions: 8, percentage: 100.0, passed: true, category_scores: {}, timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 6, user_id: 'usr_staff_06', score: 5, total_questions: 8, percentage: 62.5, passed: false, category_scores: {}, timestamp: new Date(Date.now() - 2 * 86400000).toISOString() }
  ];
  localStorage.setItem(LOCAL_STORAGE_RESULTS_KEY, JSON.stringify(initialResults));
  return initialResults;
}

function saveStoredResults(results) {
  localStorage.setItem(LOCAL_STORAGE_RESULTS_KEY, JSON.stringify(results));
}

// =========================================================================
// HYBRID API SERVICE CLIENT
// Communicates with live backend when available; falls back to embedded storage
// =========================================================================

export const apiService = {
  // ==========================================
  // AUTH & USER MANAGEMENT (Two-Tier RBAC)
  // ==========================================

  async registerProfile(profileData) {
    if (shouldAttemptRemote()) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, using local embedded identity engine:', e.message);
      }
    }

    // Embedded Fallback
    const users = getStoredUsers();
    const emailClean = profileData.email.toLowerCase().trim();
    let user = users.find(u => u.email.toLowerCase() === emailClean);

    if (user) {
      user.name = profileData.name;
      user.department = profileData.department;
      if (profileData.role) user.role = profileData.role;
    } else {
      user = {
        id: `usr_${Date.now()}`,
        name: profileData.name,
        email: emailClean,
        department: profileData.department,
        role: profileData.role || (emailClean.includes('admin') ? 'admin' : 'staff'),
        is_active: true,
        created_at: new Date().toISOString(),
        completed_trainings: 0,
        average_score: 0.0,
        pass_rate: 0.0,
        last_activity: new Date().toISOString()
      };
      users.push(user);
    }
    saveStoredUsers(users);
    return user;
  },

  async login(email) {
    const emailClean = email.toLowerCase().trim();
    if (shouldAttemptRemote()) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailClean }),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, validating against embedded identity engine:', e.message);
      }
    }

    // Embedded Fallback
    const users = getStoredUsers();
    let user = users.find(u => u.email.toLowerCase() === emailClean);
    if (!user) {
      if (emailClean === 'admin@securemind-corp.com' || emailClean.includes('admin')) {
        user = SEED_USERS[0];
        users.unshift(user);
        saveStoredUsers(users);
      } else {
        throw new Error(`No account registered with email: ${emailClean}. Please enroll first.`);
      }
    }
    return user;
  },

  async getAllUsers(filters = {}) {
    if (shouldAttemptRemote()) {
      try {
        let url = `${API_BASE_URL}/auth/users`;
        const params = new URLSearchParams();
        if (filters.department) params.append('department', filters.department);
        if (filters.role) params.append('role', filters.role);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, fetching embedded user list');
      }
    }

    // Embedded Fallback
    let users = getStoredUsers();
    if (filters.department && filters.department !== 'All') {
      users = users.filter(u => u.department.toLowerCase() === filters.department.toLowerCase());
    }
    if (filters.role && filters.role !== 'All') {
      users = users.filter(u => u.role === filters.role.toLowerCase());
    }
    return users;
  },

  async updateUser(userId, updateData) {
    if (shouldAttemptRemote()) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/users/${encodeURIComponent(userId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, updating embedded user profile');
      }
    }

    // Embedded Fallback
    const users = getStoredUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      if (updateData.name !== undefined) user.name = updateData.name;
      if (updateData.department !== undefined) user.department = updateData.department;
      if (updateData.role !== undefined) user.role = updateData.role;
      if (updateData.is_active !== undefined) user.is_active = updateData.is_active;
      saveStoredUsers(users);
      return user;
    }
    throw new Error('User not found');
  },

  async deleteUser(userId) {
    if (shouldAttemptRemote()) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/users/${encodeURIComponent(userId)}`, {
          method: 'DELETE',
        });
        if (res.ok || res.status === 204) return true;
      } catch (e) {
        console.warn('Backend unavailable, deleting embedded user account');
      }
    }

    // Embedded Fallback
    let users = getStoredUsers();
    users = users.filter(u => u.id !== userId);
    saveStoredUsers(users);
    return true;
  },

  async getUserHistory(userId) {
    if (shouldAttemptRemote()) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/users/${encodeURIComponent(userId)}/history`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, fetching embedded user history');
      }
    }

    // Embedded Fallback
    const results = getStoredResults();
    const userResults = results.filter(r => r.user_id === userId);
    return userResults;
  },

  // ==========================================
  // SCENARIOS & PHISHING SIMULATION
  // ==========================================

  async getQuestions(category = null, type = null) {
    if (shouldAttemptRemote()) {
      try {
        let url = `${API_BASE_URL}/questions`;
        const params = new URLSearchParams();
        if (category && category !== 'All') params.append('category', category);
        if (type) params.append('type', type);
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, loading embedded scenario bank');
      }
    }

    // Embedded Fallback
    let questions = getStoredQuestions();
    if (category && category !== 'All') {
      questions = questions.filter(q => q.category.toLowerCase() === category.toLowerCase());
    }
    if (type) {
      questions = questions.filter(q => q.type.toLowerCase() === type.toLowerCase());
    }
    return questions;
  },

  async createQuestion(questionData) {
    if (shouldAttemptRemote()) {
      try {
        const res = await fetch(`${API_BASE_URL}/questions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(questionData),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, saving question to embedded bank');
      }
    }

    const questions = getStoredQuestions();
    const newQ = { id: Date.now(), ...questionData };
    questions.push(newQ);
    localStorage.setItem(LOCAL_STORAGE_QUESTIONS_KEY, JSON.stringify(questions));
    return newQ;
  },

  async deleteQuestion(questionId) {
    if (shouldAttemptRemote()) {
      try {
        const res = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
          method: 'DELETE',
        });
        if (res.ok || res.status === 204) return true;
      } catch (e) {
        console.warn('Backend unavailable, removing embedded question');
      }
    }

    let questions = getStoredQuestions();
    questions = questions.filter(q => q.id !== questionId);
    localStorage.setItem(LOCAL_STORAGE_QUESTIONS_KEY, JSON.stringify(questions));
    return true;
  },

  // ==========================================
  // QUIZ ENGINE & TELEMETRY
  // ==========================================

  async submitQuiz(submission) {
    if (shouldAttemptRemote()) {
      try {
        const res = await fetch(`${API_BASE_URL}/quiz/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission),
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable, calculating telemetry locally');
      }
    }

    // Embedded Fallback Calculation
    const questions = getStoredQuestions();
    let score = 0;
    const evaluations = [];
    const categoryBreakdown = {};

    submission.answers.forEach(ans => {
      const q = questions.find(item => item.id === ans.question_id);
      if (q) {
        const isCorrect = ans.selected_index === q.correct_index;
        if (isCorrect) score += 1;

        if (!categoryBreakdown[q.category]) {
          categoryBreakdown[q.category] = { correct: 0, total: 0 };
        }
        categoryBreakdown[q.category].total += 1;
        if (isCorrect) categoryBreakdown[q.category].correct += 1;

        evaluations.push({
          question_id: q.id,
          selected_index: ans.selected_index,
          correct_index: q.correct_index,
          is_correct: isCorrect,
          scenario_text: q.scenario_text,
          category: q.category,
          educational_feedback: q.educational_feedback
        });
      }
    });

    const total = submission.answers.length || 1;
    const percentage = Math.round((score / total) * 1000) / 10;
    const passed = percentage >= 70.0;

    const resultRecord = {
      id: Date.now(),
      user_id: submission.user_id,
      score,
      total_questions: total,
      percentage,
      passed,
      category_scores: categoryBreakdown,
      evaluations,
      timestamp: new Date().toISOString()
    };

    const allResults = getStoredResults();
    allResults.unshift(resultRecord);
    saveStoredResults(allResults);
  };
  }
};
