const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const shouldAttemptRemote = () => {
  if (typeof window === 'undefined') return false;
  if (window.location.protocol === 'https:' && API_BASE_URL.startsWith('http://localhost')) {
    return false;
  }
  return true;
};

// ONLY Cyber Security Admin seeded - Clean slate for live staff enrollment
const SEED_USERS = [
  {
    id: 'usr_admin_01',
    name: 'Cyber Security Lead',
    email: 'admin@securemind-corp.com',
    department: 'Cybersecurity & IT',
    role: 'admin',
    is_active: true,
    created_at: new Date().toISOString(),
    completed_trainings: 0,
    average_score: 0.0,
    pass_rate: 0.0
  }
];

const SEED_QUESTIONS = [
  // 1. CEO Fraud / BEC Wire Transfer
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
        { id: "rf-3", target: "urgency", label: "Artificial Executive Urgency", description: "Demands an immediate wire transfer while claiming to be unavailable by phone." },
        { id: "rf-4", target: "link", label: "Deceptive Hyperlink URL", description: "The link directs to an external credential harvesting server." }
      ],
      educational_debrief: {
        summary: "Business Email Compromise (BEC) / CEO Fraud attack.",
        explanation: "Cybercriminals impersonate senior executives to coerce finance staff into bypassing standard approval protocols.",
        key_takeaways: ["Always execute out-of-band verification.", "Inspect sender domain names letter-by-letter.", "Check Reply-To headers before transferring funds."]
      }
    },
    options: [
      "Immediately click the link and authorize the wire to avoid delaying the CEO's meeting.",
      "Verify the request through an out-of-band secondary channel (e.g., call the CEO's verified office number or follow internal finance dual-control protocol).",
      "Forward the email to your personal email to view the attachment safely.",
      "Reply directly to the email asking for confirmation of the bank routing number."
    ],
    correct_index: 1,
    educational_feedback: "This is a classic Business Email Compromise (BEC) attack. Always execute out-of-band verification via established multi-party approval protocols."
  },

  // 2. Microsoft 365 Credential Harvest
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
        { id: "rf-1", target: "sender", label: "Suspicious Third-Party Domain", description: "Microsoft notifications originate from microsoft.com, not security-msft-notifications-live.com." },
        { id: "rf-2", target: "urgency", label: "Arbitrary Expiration Countdown", description: "Creates false pressure (2 hours) to provoke hasty action." },
        { id: "rf-3", target: "link", label: "Phishing Landing Page", description: "Points to 'account-sync.tech', a credential harvesting site." }
      ],
      educational_debrief: {
        summary: "Credential Harvesting Phishing Campaign.",
        explanation: "Attackers clone login pages of platforms like Microsoft 365 to harvest corporate passwords.",
        key_takeaways: ["Never click links in emails to reset passwords. Navigate directly to portal.office.com.", "IT will never ask you to click a button to 'keep your existing password'."]
      }
    },
    options: [
      "Click the button and enter your password to avoid being locked out of corporate email.",
      "Report the email to the Security Team and navigate manually to the official identity portal to check password status.",
      "Forward the email to coworkers to see if their passwords are also expiring.",
      "Reply with your current password to request an extension."
    ],
    correct_index: 1,
    educational_feedback: "Attackers leverage urgency to harvest corporate credentials. Real identity providers never provide links to 'keep your existing password'."
  },

  // 3. Legitimate HR Benefits Policy (True Negative)
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
        explanation: "The sender domain is legitimate (@securemind-corp.com), SPF and DKIM pass completely, and the URL points to the internal verified intranet subdomain.",
        key_takeaways: ["Legitimate emails direct employees to verified internal portals.", "Look for proper cryptographic alignment (SPF and DKIM pass)."]
      }
    },
    options: [
      "Mark as Safe and visit the benefits portal via the verified company intranet link.",
      "Report the email as malicious phishing and block the HR director's address.",
      "Download email attachments to an external personal USB drive.",
      "Ignore all company benefits communications permanently."
    ],
    correct_index: 0,
    educational_feedback: "This is a legitimate internal email: sender address matches the official company domain, authentication headers pass, and links point directly to the company intranet."
  },

  // 4. DocuSign Counterfeit Signature Request
  {
    id: 4,
    scenario_text: "You receive an automated DocuSign notification requesting you to review and sign an 'Amended Non-Disclosure Agreement' from an external unknown sender.",
    category: "Phishing",
    type: "email_inspection",
    difficulty: "Intermediate",
    email_metadata: {
      title: "DocuSign: Electronic Document Signature Required",
      is_phishing: true,
      sender_name: "DocuSign System Mailer",
      sender_email: "docusign-notifications@service-docusign-esign99.com",
      reply_to: "legal-review@service-docusign-esign99.com",
      subject: "Please DocuSign: 2026 Executive NDA & IP Assignment.pdf",
      date: "Today, 11:20 AM",
      spf_status: "SOFTFAIL (Domain unverified)",
      dkim_status: "FAIL (Signature invalid)",
      real_link_target: "https://docusign.net.app-sign-verify88.cc/auth/login",
      body_text: "David Sterling via DocuSign has sent you a document to review and sign.\n\nPlease review and complete the document within 24 hours:\n\n[Review and Sign Document]\n\nDocuSign Secure Electronic Signatures",
      red_flags: [
        { id: "rf-1", target: "sender", label: "Lookalike Brand Domain", description: "Sender domain is not official DocuSign." },
        { id: "rf-2", target: "link", label: "Obfuscated Redirection Target", description: "Hyperlink points to an external harvesting endpoint." }
      ],
      educational_debrief: {
        summary: "Brand Impersonation & Fake Electronic Signature Phishing.",
        explanation: "Attackers clone DocuSign branding to trick employees into providing corporate credentials.",
        key_takeaways: ["Verify sender domains on e-signature notifications.", "Check official DocuSign portal directly."]
      }
    },
    options: [
      "Click 'Review and Sign Document' and enter your single-sign-on credentials.",
      "Inspect the sender domain and report the email as malicious brand impersonation.",
      "Forward the document to personal webmail.",
      "Reply to the email asking who authorized the document."
    ],
    correct_index: 1,
    educational_feedback: "Attackers frequently spoof e-signature services like DocuSign. Authentic DocuSign notifications originate from @docusign.net or @docusign.com."
  },

  // 5. Quishing / QR Code MFA Trap
  {
    id: 5,
    scenario_text: "An IT advisory email instructs staff to scan an attached QR code using their smartphone camera to sync their multi-factor Authenticator app credentials.",
    category: "Phishing",
    type: "email_inspection",
    difficulty: "Advanced",
    email_metadata: {
      title: "IT Security Notice: Mandatory MFA System Migration",
      is_phishing: true,
      sender_name: "Enterprise IT Service Hub",
      sender_email: "servicedesk@securemind-portal-it.com",
      reply_to: "mfa-support@securemind-portal-it.com",
      subject: "Mandatory Action: Scan QR Code to sync your Enterprise 2FA token",
      date: "Today, 01:10 PM",
      spf_status: "NEUTRAL",
      dkim_status: "Unsigned",
      real_link_target: "https://mfa-session-sync.net/login?token=8831",
      body_text: "Security Operations is upgrading enterprise multi-factor authentication.\n\nTo ensure uninterrupted VPN and email access, please scan the QR code below using your mobile device:\n\n[📷 Scan Authenticator Migration QR Code]\n\nFailure to complete this by 5:00 PM will result in account suspension.",
      red_flags: [
        { id: "rf-1", target: "technique", label: "Quishing (QR Phishing)", description: "Attackers use QR codes to bypass email spam filters." },
        { id: "rf-2", target: "urgency", label: "Coercive Account Suspension Threat", description: "Uses threats of lockout to bypass scrutiny." }
      ],
      educational_debrief: {
        summary: "Quishing (QR Code Phishing).",
        explanation: "Attackers embed QR codes to bypass gateway security scanners.",
        key_takeaways: ["Never scan QR codes in unsolicited emails to update security credentials."]
      }
    },
    options: [
      "Scan the QR code with your mobile phone camera and enter your corporate password.",
      "Report the email to the Security Team and do not scan the embedded QR code.",
      "Print the email and scan it using the office scanner.",
      "Save the QR code image to your desktop."
    ],
    correct_index: 1,
    educational_feedback: "'Quishing' is designed to evade corporate email security filters. Never scan QR codes in emails to authenticate."
  },

  // 6. Direct Deposit & Payroll Modification
  {
    id: 6,
    scenario_text: "An email claiming to be from Payroll requests you to confirm your direct deposit banking details prior to monthly payroll processing.",
    category: "Phishing",
    type: "email_inspection",
    difficulty: "Intermediate",
    email_metadata: {
      title: "Payroll Discrepancy Notice",
      is_phishing: true,
      sender_name: "Corporate Payroll Services",
      sender_email: "payroll-update@securemind-hr-portal.com",
      reply_to: "payroll-override@securemind-hr-portal.com",
      subject: "Action Required: Verify Direct Deposit Account Details",
      date: "Today, 03:45 PM",
      spf_status: "FAIL",
      dkim_status: "Unsigned",
      real_link_target: "https://payroll-verify.securemind-hr-portal.com/direct-deposit",
      body_text: "Attention Employee,\n\nDuring our quarterly audit, an error was detected with your direct deposit bank account. Please verify your routing and account number to avoid paycheck delays.\n\n[Update Direct Deposit Information]\n\nHuman Resources & Payroll",
      red_flags: [
        { id: "rf-1", target: "sender", label: "Lookalike Domain", description: "Sender uses an unverified external domain." }
      ],
      educational_debrief: {
        summary: "Payroll Divergence / Direct Deposit Phishing.",
        explanation: "Attackers target payroll credentials to redirect salaries into money mule accounts.",
        key_takeaways: ["Only modify payroll details inside your official HRIS system."]
      }
    },
    options: [
      "Click the link and re-enter your bank account and routing number immediately.",
      "Report the email as phishing and verify details directly in your official HR portal.",
      "Reply with your voided check attached.",
      "Forward the email to coworkers."
    ],
    correct_index: 1,
    educational_feedback: "Payroll divergence attacks seek to redirect employee salaries. Always access payroll systems directly through bookmarked HR portals."
  },

  // 7. Supply Chain Vendor Banking Coordinate Alteration
  {
    id: 7,
    scenario_text: "A regular hardware supplier sends an email stating their bank routing coordinates have changed and requests all pending invoices be paid to a new account.",
    category: "Social Engineering",
    type: "multiple_choice",
    difficulty: "Advanced",
    email_metadata: null,
    options: [
      "Update the accounting software with the new bank details provided in the email and release payment.",
      "Execute out-of-band verification by calling the vendor's known finance director at their pre-established verified telephone number.",
      "Reply to the email asking the sender to confirm that the new bank account is correct.",
      "Wait 30 days and pay the old bank account anyway."
    ],
    correct_index: 1,
    educational_feedback: "This is Vendor Email Compromise (VEC). Never alter vendor payment coordinates without verbal out-of-band confirmation with verified vendor contacts."
  },

  // 8. MFA Fatigue / Prompt Bombing
  {
    id: 8,
    scenario_text: "You receive a rapid succession of 15 push notifications on your phone asking you to approve an authentication request from an unknown device in Eastern Europe at 2:00 AM.",
    category: "Credential Hygiene",
    type: "multiple_choice",
    difficulty: "Intermediate",
    email_metadata: null,
    options: [
      "Approve the notification so your phone stops buzzing and go back to sleep.",
      "Deny the request, immediately change your corporate password, and report the incident to the Security Operations Center (SOC).",
      "Turn off your phone's Wi-Fi and ignore it until the morning.",
      "Approve just once to see which application is requesting access."
    ],
    correct_index: 1,
    educational_feedback: "This is an 'MFA Fatigue' or 'Prompt Bombing' attack. Denying the prompt, reporting the intrusion, and changing your credentials stops the breach."
  },

  // 9. AI Voice Cloning / Deepfake Vishing
  {
    id: 9,
    scenario_text: "You receive an urgent phone call from someone whose voice sounds identical to your Chief Financial Officer requesting an immediate wire transfer for an overseas acquisition.",
    category: "Social Engineering",
    type: "multiple_choice",
    difficulty: "Advanced",
    email_metadata: null,
    options: [
      "Process the wire transfer immediately since you recognized the CFO's voice.",
      "Hang up, refuse the transaction, and contact the CFO or finance supervisor via internal corporate Slack or verified office phone.",
      "Text the bank transfer confirmation to the caller's mobile number.",
      "Ask the caller to email their driver's license before transferring funds."
    ],
    correct_index: 1,
    educational_feedback: "Generative AI voice cloning allows attackers to replicate executive voices with high fidelity. Always verify unexpected financial instructions out-of-band."
  },

  // 10. IT Helpdesk Remote Access Vishing
  {
    id: 10,
    scenario_text: "An incoming caller claims to be 'Alex from the Enterprise IT Service Desk'. They state your workstation has been flagged for malware and ask you to install AnyDesk so they can remediate it.",
    category: "Social Engineering",
    type: "multiple_choice",
    difficulty: "Intermediate",
    email_metadata: null,
    options: [
      "Download and install AnyDesk and provide the connection ID to Alex.",
      "Refuse the request, terminate the call, and contact the official IT Helpdesk using the verified internal directory number.",
      "Ask Alex for his employee badge number and proceed once he provides it.",
      "Leave your computer unlocked and let them take over."
    ],
    correct_index: 1,
    educational_feedback: "Unsolicited callers requesting remote desktop tool installations are conducting tech support vishing scams to gain initial network persistence."
  },

  // 11. Baiting / USB Drop in Parking Lot
  {
    id: 11,
    scenario_text: "While walking through the employee parking lot, you find an attractive high-speed 128GB USB drive labeled 'Confidential - Executive Compensation 2026.xlsx'.",
    category: "Physical Security",
    type: "multiple_choice",
    difficulty: "Beginner",
    email_metadata: null,
    options: [
      "Plug it into your corporate laptop to find the owner's name in document properties.",
      "Plug it into a coworker's computer to test if it contains viruses.",
      "Do not plug the USB into any machine; deliver it directly to Corporate Physical Security / IT Incident Response.",
      "Format the drive immediately so you can use it for personal presentations."
    ],
    correct_index: 2,
    educational_feedback: "This is a 'USB Baiting' attack. Rogue flash drives can execute keystroke injection payloads or deploy ransomware instantly upon insertion."
  },

  // 12. Macro Ransomware Invoice
  {
    id: 12,
    scenario_text: "A vendor sends an invoice as an attached .xlsm (macro-enabled) file. Upon opening, a yellow banner reads: 'Macros have been disabled. Click Enable Content to view your encrypted invoice.'",
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
    educational_feedback: "Macro-enabled documents are a primary delivery vehicle for ransomware. Genuine invoices rarely require VBA macro execution."
  },

  // 13. Public Wi-Fi & Evil Twin Attack
  {
    id: 13,
    scenario_text: "While working at an airport coffee shop, you notice two open Wi-Fi networks: 'Airport_Free_WiFi' and 'Airport_Free_WiFi_HighSpeed'.",
    category: "Credential Hygiene",
    type: "multiple_choice",
    difficulty: "Intermediate",
    email_metadata: null,
    options: [
      "Connect to the High Speed network and log into corporate servers without a VPN.",
      "Connect to the network and immediately enable your corporate Virtual Private Network (VPN) with full-tunnel encryption, or use your phone's cellular hotspot.",
      "Disable your firewall to ensure smooth streaming.",
      "Accept any invalid SSL certificate warnings when loading web pages."
    ],
    correct_index: 1,
    educational_feedback: "Public Wi-Fi networks are susceptible to rogue access points and packet sniffing. Always use corporate VPN encryption on untrusted public networks."
  },

  // 14. Shadow IT & Confidential Data in Public AI
  {
    id: 14,
    scenario_text: "You are writing a confidential client proposal and want to summarize 50 pages of proprietary financial data and source code using a free public AI chatbot.",
    category: "Social Engineering",
    type: "multiple_choice",
    difficulty: "Advanced",
    email_metadata: null,
    options: [
      "Paste the entire confidential document into the public AI tool since prompts are automatically deleted.",
      "Refrain from pasting confidential data or source code into unapproved public AI tools; consult the corporate Generative AI policy for enterprise-approved environments.",
      "Change the client name to a pseudonym and paste the raw source code and financial balances.",
      "Share the AI login with all team members."
    ],
    correct_index: 1,
    educational_feedback: "Pasting proprietary code or client PII into unapproved consumer AI platforms creates serious data leakage and compliance violations (GDPR, SOC 2)."
  },

  // 15. Credential Sharing on Team Slack
  {
    id: 15,
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
    educational_feedback: "Sharing account credentials violates individual accountability and increases breach risk. Users must never share passwords."
  },

  // 16. Shoulder Surfing & Privacy Screen
  {
    id: 16,
    scenario_text: "You are working on a high-speed train reviewing unreleased quarterly financial earnings on your laptop with passengers sitting directly behind and beside you.",
    category: "Physical Security",
    type: "multiple_choice",
    difficulty: "Beginner",
    email_metadata: null,
    options: [
      "Continue working at full screen brightness since strangers are unlikely to understand corporate financial statements.",
      "Use a privacy screen filter, minimize screen brightness, and avoid displaying highly sensitive trade secrets or customer PII in public view.",
      "Ask the person sitting next to you to look away.",
      "Save the confidential file to an unencrypted public Dropbox."
    ],
    correct_index: 1,
    educational_feedback: "'Shoulder Surfing' is a prevalent visual social engineering threat. When working in public spaces, privacy screen filters and situational awareness are essential."
  },

  // 17. Illicit Cloud OAuth App Consent Grant
  {
    id: 17,
    scenario_text: "A third-party web application asks you to sign in with your corporate account and prompts: 'App requires permission to Read all emails, Send email on your behalf, and Access all OneDrive files'.",
    category: "Credential Hygiene",
    type: "multiple_choice",
    difficulty: "Advanced",
    email_metadata: null,
    options: [
      "Grant permission immediately so you can test the free tool.",
      "Deny the consent request and report the third-party application to Enterprise Security for OAuth permission review.",
      "Accept permissions but revoke them next year.",
      "Create a fake corporate account to bypass the warning."
    ],
    correct_index: 1,
    educational_feedback: "This is an 'Illicit Consent Grant' attack. Rogue third-party cloud apps trick users into granting permanent API access tokens without needing their password."
  },

  // 18. Smishing (SMS Package Delivery Phishing)
  {
    id: 18,
    scenario_text: "You receive an SMS on your work phone: 'DHL: Your corporate delivery #8821 could not be completed due to unpaid customs fee ($1.50). Update address at: http://dhl-tracking-pay2.com'",
    category: "Phishing",
    type: "multiple_choice",
    difficulty: "Beginner",
    email_metadata: null,
    options: [
      "Click the link and enter your corporate credit card details to pay the $1.50 fee.",
      "Delete the SMS, do not click the link, and report the smishing attempt to Security Operations.",
      "Reply 'STOP' with your credit card number.",
      "Forward the text to all colleagues."
    ],
    correct_index: 1,
    educational_feedback: "Smishing (SMS Phishing) exploits parcel delivery notifications to steal credit card details and personal identity information."
  },

  // 19. Malicious Browser Extension Permission Creep
  {
    id: 19,
    scenario_text: "A simple 'PDF Viewer' browser extension you installed 6 months ago updates and displays a prompt: 'Extension now requires permission to read and change all data on all websites you visit'.",
    category: "Credential Hygiene",
    type: "multiple_choice",
    difficulty: "Intermediate",
    email_metadata: null,
    options: [
      "Approve the new permissions because extension updates are vetted automatically.",
      "Reject the permissions and immediately uninstall the browser extension.",
      "Allow permissions in incognito mode only.",
      "Disable your browser security settings."
    ],
    correct_index: 1,
    educational_feedback: "Attackers buy abandoned browser extensions with large install bases and push updates with malicious keystroke logging or session cookie exfiltration capabilities."
  },

  // 20. Public Git Repository Secrets Leak
  {
    id: 20,
    scenario_text: "While committing code to a public GitHub repository, an engineer accidentally includes an unencrypted `.env` file containing production database credentials and AWS access keys.",
    category: "Ransomware",
    type: "multiple_choice",
    difficulty: "Advanced",
    email_metadata: null,
    options: [
      "Leave the commit as is since the repository has zero followers.",
      "Immediately rotate/invalidate the exposed credentials, notify Security Incident Response, and purge the sensitive git commit history.",
      "Push a new commit that deletes the file without rotating the credentials.",
      "Make the repository private and assume the keys were never seen."
    ],
    correct_index: 1,
    educational_feedback: "Automated bot scanners index public git commits within seconds. Once a secret is pushed publicly, it must be considered compromised and rotated immediately."
  },

  // 21. Disposal of Printed Financial & PII Documents
  {
    id: 21,
    scenario_text: "You finish reviewing a 20-page printed report containing customer credit card numbers, home addresses, and Social Security Numbers.",
    category: "Physical Security",
    type: "multiple_choice",
    difficulty: "Beginner",
    email_metadata: null,
    options: [
      "Toss the document into the standard paper recycling bin near your desk.",
      "Place the document into the locked cross-cut confidential shredding security console.",
      "Leave it on top of the office printer for the next person.",
      "Take it home in your backpack to throw away."
    ],
    correct_index: 1,
    educational_feedback: "Physical dumpster diving is an active social engineering vector. Printed documents containing PII or financial data must always be destroyed in locked shredding consoles."
  },

  // 22. Accidental Phishing Click Incident Reporting
  {
    id: 22,
    scenario_text: "You accidentally click a suspicious email link and enter your corporate password on an unusual web page before realizing it was a phishing site.",
    category: "Social Engineering",
    type: "multiple_choice",
    difficulty: "Intermediate",
    email_metadata: null,
    options: [
      "Close the browser tab, say nothing, and hope nobody notices.",
      "Immediately disconnect your device from the network, change your password from another device, and notify the Security Team immediately.",
      "Restart your laptop and wait until tomorrow.",
      "Clear your browser history to erase evidence of the click."
    ],
    correct_index: 1,
    educational_feedback: "Rapid transparent incident reporting allows security teams to revoke compromised sessions, isolate hosts, and prevent enterprise-wide lateral movement within minutes."
  }
];

function getStoredUsers() {
  const data = localStorage.getItem('securemind_db_users_v3');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  localStorage.setItem('securemind_db_users_v3', JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

function saveStoredUsers(users) {
  localStorage.setItem('securemind_db_users_v3', JSON.stringify(users));
}

function getStoredQuestions() {
  const data = localStorage.getItem('securemind_db_questions_v3');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length >= 20) return parsed;
    } catch (e) {}
  }
  localStorage.setItem('securemind_db_questions_v3', JSON.stringify(SEED_QUESTIONS));
  return SEED_QUESTIONS;
}

function getStoredResults() {
  const data = localStorage.getItem('securemind_db_results_v3');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  const initial = [];
  localStorage.setItem('securemind_db_results_v3', JSON.stringify(initial));
  return initial;
}

export const apiService = {
  async registerProfile(profileData) {
    if (shouldAttemptRemote()) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData),
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

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
        pass_rate: 0.0
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
      } catch (e) {}
    }

    const users = getStoredUsers();
    let user = users.find(u => u.email.toLowerCase() === emailClean);
    if (!user) {
      if (emailClean === 'admin@securemind-corp.com' || emailClean.includes('admin')) {
        user = SEED_USERS[0];
        if (!users.some(u => u.email === user.email)) {
          users.unshift(user);
          saveStoredUsers(users);
        }
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
      } catch (e) {}
    }

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
      } catch (e) {}
    }

    const users = getStoredUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      if (updateData.name !== undefined) user.name = updateData.name;
      if (updateData.department !== undefined) user.department = updateData.department;
      if (updateData.role !== undefined) user.role = updateData.role;
      saveStoredUsers(users);
      return user;
    }
    throw new Error('User not found');
  },

  async deleteUser(userId) {
    if (shouldAttemptRemote()) {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
        if (res.ok || res.status === 204) return true;
      } catch (e) {}
    }

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
      } catch (e) {}
    }

    const results = getStoredResults();
    return results.filter(r => r.user_id === userId);
  },

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
      } catch (e) {}
    }

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
      } catch (e) {}
    }

    const questions = getStoredQuestions();
    const newQ = { id: Date.now(), ...questionData };
    questions.push(newQ);
    localStorage.setItem('securemind_db_questions_v3', JSON.stringify(questions));
    return newQ;
  },

  async deleteQuestion(questionId) {
    if (shouldAttemptRemote()) {
      try {
        const res = await fetch(`${API_BASE_URL}/questions/${questionId}`, { method: 'DELETE' });
        if (res.ok || res.status === 204) return true;
      } catch (e) {}
    }

    let questions = getStoredQuestions();
    questions = questions.filter(q => q.id !== questionId);
    localStorage.setItem('securemind_db_questions_v3', JSON.stringify(questions));
    return true;
  },

  async submitQuiz(submission) {
    if (shouldAttemptRemote()) {
      try {
        const res = await fetch(`${API_BASE_URL}/quiz/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submission),
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }

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
    localStorage.setItem('securemind_db_results_v3', JSON.stringify(allResults));

    const users = getStoredUsers();
    const user = users.find(u => u.id === submission.user_id);
    if (user) {
      user.completed_trainings = (user.completed_trainings || 0) + 1;
      saveStoredUsers(users);
    }

    return resultRecord;
  },

  async getAnalytics() {
    if (shouldAttemptRemote()) {
      try {
        const res = await fetch(`${API_BASE_URL}/analytics/overview`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    const users = getStoredUsers();
    const results = getStoredResults();

    const totalEmployees = users.length;
    const totalTrainings = results.length;
    const passCount = results.filter(r => r.passed).length;
    const passRate = totalTrainings > 0 ? Math.round((passCount / totalTrainings) * 1000) / 10 : 100.0;
    const avgScore = totalTrainings > 0 ? Math.round((results.reduce((acc, r) => acc + r.percentage, 0) / totalTrainings) * 10) / 10 : 85.0;

    const deptMap = {};
    users.forEach(u => {
      if (!deptMap[u.department]) {
        deptMap[u.department] = { total_staff: 0, completed_count: 0, total_pct: 0 };
      }
      deptMap[u.department].total_staff += 1;
    });

    results.forEach(r => {
      const user = users.find(u => u.id === r.user_id);
      if (user && deptMap[user.department]) {
        deptMap[user.department].completed_count += 1;
        deptMap[user.department].total_pct += r.percentage;
      }
    });

    const departmentBenchmarks = Object.entries(deptMap).map(([dept, data]) => {
      const deptAvg = data.completed_count > 0 ? Math.round((data.total_pct / data.completed_count) * 10) / 10 : 80.0;
      let riskLevel = 'Low Risk';
      if (deptAvg < 60) riskLevel = 'Critical Vulnerability';
      else if (deptAvg < 70) riskLevel = 'Elevated Risk';
      else if (deptAvg < 80) riskLevel = 'Moderate Risk';

      return {
        department: dept,
        total_staff: data.total_staff,
        completed_count: data.completed_count,
        average_score: deptAvg,
        risk_level: riskLevel,
        category_scores: { "Phishing": deptAvg, "Credential Hygiene": 80.0, "Social Engineering": 75.0 }
      };
    });

    const highRiskDepts = departmentBenchmarks.filter(d => d.average_score < 70).map(d => d.department);

    const recentCompletions = results.slice(0, 10).map(r => {
      const user = users.find(u => u.id === r.user_id);
      return {
        id: r.id,
        user_name: user ? user.name : 'Corporate Employee',
        department: user ? user.department : 'Operations',
        score: r.score,
        total: r.total_questions,
        percentage: r.percentage,
        passed: r.passed,
        timestamp: new Date(r.timestamp).toLocaleDateString()
      };
    });

    return {
      security_maturity_index: avgScore || 85.0,
      total_employees: totalEmployees,
      total_trainings_completed: totalTrainings,
      pass_rate: passRate,
      high_risk_departments: highRiskDepts,
      department_benchmarks: departmentBenchmarks,
      category_weaknesses: {
        "Phishing": 75.0,
        "Credential Hygiene": 85.0,
        "Social Engineering": 70.0,
        "Physical Security": 80.0,
        "Ransomware": 80.0
      },
      recent_completions: recentCompletions
    };
  }
};
