import json
from datetime import datetime, timedelta
from .models import Profile, Question, QuizResult
from .database import SessionLocal, engine, Base

INITIAL_PROFILES = [
    {
        "name": "Cyber Security Lead",
        "email": "admin@securemind-corp.com",
        "department": "Cybersecurity & IT",
        "role": "admin"
    },
    {
        "name": "Sarah Jenkins",
        "email": "s.jenkins@securemind-corp.com",
        "department": "Finance",
        "role": "staff"
    },
    {
        "name": "Marcus Vance",
        "email": "m.vance@securemind-corp.com",
        "department": "Engineering",
        "role": "staff"
    },
    {
        "name": "Amara Okafor",
        "email": "a.okafor@securemind-corp.com",
        "department": "HR",
        "role": "staff"
    },
    {
        "name": "Liam Gallagher",
        "email": "l.gallagher@securemind-corp.com",
        "department": "Sales",
        "role": "staff"
    },
    {
        "name": "Elena Rostova",
        "email": "e.rostova@securemind-corp.com",
        "department": "Legal",
        "role": "staff"
    },
    {
        "name": "Tariq Al-Mansoor",
        "email": "t.almansoor@securemind-corp.com",
        "department": "Operations",
        "role": "staff"
    }
]

INITIAL_QUESTIONS = [
    # ----------------------------------------------------
    # PHISHING & EMAIL INSPECTION LAB SCENARIOS
    # ----------------------------------------------------
    {
        "scenario_text": "You receive an urgent email from your CEO requesting an immediate wire transfer for a confidential vendor acquisition while they are in an overseas board meeting.",
        "category": "Phishing",
        "type": "email_inspection",
        "difficulty": "Intermediate",
        "email_metadata": {
            "title": "Urgent Wire Transfer Authorization",
            "is_phishing": True,
            "sender_name": "David Sterling (CEO)",
            "sender_email": "david.sterling@securem1nd-corp.com",
            "reply_to": "exec-confidential-override@mail-router-net.com",
            "subject": "URGENT & STRICTLY CONFIDENTIAL: Wire Authorization Ref #99281",
            "date": "Today, 08:42 AM",
            "spf_status": "FAIL (Spoofed Domain)",
            "dkim_status": "Unsigned",
            "real_link_target": "http://login.securem1nd-corp.com.portal-auth99.net/verify",
            "body_text": "Hi team,\n\nI am currently in closed-door M&A negotiations and cannot take calls. Please process an expedited wire transfer of $48,500 to our external counsel account immediately. Details attached in the secure portal.\n\n[Click here to access wire authorization portal]\n\nThanks,\nDavid Sterling\nChief Executive Officer",
            "red_flags": [
                {"id": "rf-1", "target": "sender", "label": "Domain Typosquatting", "description": "Notice the sender domain 'securem1nd-corp.com' uses number '1' instead of the letter 'i'."},
                {"id": "rf-2", "target": "replyto", "label": "Mismatched Reply-To Address", "description": "Reply-To points to an external unverified domain ('mail-router-net.com')."},
                {"id": "rf-3", "target": "urgency", "label": "Artificial Executive Urgency", "description": "Demands an immediate wire transfer while claiming to be unavailable by phone to prevent verification."},
                {"id": "rf-4", "target": "link", "label": "Deceptive Hyperlink URL", "description": "The link directs to 'portal-auth99.net', an external credential harvesting server."}
            ],
            "educational_debrief": {
                "summary": "This was a Business Email Compromise (BEC) / CEO Fraud attack.",
                "explanation": "Cybercriminals frequently impersonate senior executives to coerce finance staff into bypassing standard multi-tier approval protocols. They rely on fear of reprimand and urgency.",
                "key_takeaways": [
                    "Always execute out-of-band verification (call the executive or verified secondary contact) before transferring funds.",
                    "Inspect sender domain names letter-by-letter for subtle number/character substitutions.",
                    "Check Reply-To headers if an email asks for confidentiality or urgent actions."
                ]
            }
        },
        "options": [
            "Immediately click the link and authorize the wire to avoid delaying the CEO's meeting.",
            "Verify the request through an out-of-band secondary channel (e.g., call the CEO's verified office number or follow internal finance dual-control protocol).",
            "Forward the email to your personal email to view the attachment safely.",
            "Reply directly to the email asking for confirmation of the bank routing number."
        ],
        "correct_index": 1,
        "educational_feedback": "This is a classic Business Email Compromise (BEC) / CEO Fraud attack. Attackers exploit executive authority and artificial urgency. Never rely on email instructions alone for financial transactions; always execute out-of-band verification via established multi-party approval protocols."
    },
    {
        "scenario_text": "An automated notification claiming your Microsoft 365 password is expiring in 2 hours arrives in your inbox with a link to retain your existing credentials.",
        "category": "Phishing",
        "type": "email_inspection",
        "difficulty": "Beginner",
        "email_metadata": {
            "title": "Microsoft 365 Password Expiration Alert",
            "is_phishing": True,
            "sender_name": "Microsoft 365 Security Team",
            "sender_email": "no-reply@security-msft-notifications-live.com",
            "reply_to": "support@security-msft-notifications-live.com",
            "subject": "Action Required: Your corporate password expires in 2 hours",
            "date": "Today, 09:15 AM",
            "spf_status": "NEUTRAL (Third-party sender)",
            "dkim_status": "PASS (Domain mismatch)",
            "real_link_target": "https://login-microsoftonline.account-sync.tech/auth",
            "body_text": "Your enterprise Microsoft 365 password is scheduled to expire in 2 hours.\n\nTo keep your current password and prevent email disruption, click below to keep your active credentials.\n\n[Keep My Current Password]\n\nIT Support Services",
            "red_flags": [
                {"id": "rf-1", "target": "sender", "label": "Suspicious Third-Party Domain", "description": "Microsoft internal notifications originate from microsoft.com, not security-msft-notifications-live.com."},
                {"id": "rf-2", "target": "urgency", "label": "Arbitrary Expiration Countdown", "description": "Creates false pressure (2 hours) to provoke hasty action without thinking."},
                {"id": "rf-3", "target": "link", "label": "Phishing Landing Page", "description": "Points to 'account-sync.tech', a credential harvesting site designed to clone the MS login interface."}
            ],
            "educational_debrief": {
                "summary": "This was a Credential Harvesting Phishing Campaign.",
                "explanation": "Attackers clone login pages of ubiquitous enterprise platforms (Microsoft 365, Google Workspace, Okta) to harvest corporate passwords and session tokens.",
                "key_takeaways": [
                    "Never click links in emails to reset or retain passwords. Always navigate manually to portal.office.com or your internal identity provider.",
                    "Enterprise IT will never ask you to click a button to 'keep your existing password'.",
                    "Enable hardware/FIDO2 MFA keys to neutralize harvested credentials."
                ]
            }
        },
        "options": [
            "Click the button and enter your password to avoid being locked out of corporate email.",
            "Report the email to the Security Team and navigate manually to the official identity portal to check password status.",
            "Forward the email to coworkers to see if their passwords are also expiring.",
            "Reply with your current password to request an extension."
        ],
        "correct_index": 1,
        "educational_feedback": "Attackers leverage urgency and fear of system disruption to harvest corporate credentials. Real identity providers never provide links to 'keep your existing password'."
    },
    {
        "scenario_text": "An annual health and dental benefits enrollment reminder is sent from the internal People & Culture team directing staff to the company intranet.",
        "category": "Phishing",
        "type": "email_inspection",
        "difficulty": "Advanced",
        "email_metadata": {
            "title": "HR Benefits Policy Update (Official Internal)",
            "is_phishing": False,
            "sender_name": "Amara Okafor (Head of HR)",
            "sender_email": "hr@securemind-corp.com",
            "reply_to": "hr@securemind-corp.com",
            "subject": "Quarterly Reminder: Annual Health Benefits Enrollment Window",
            "date": "Yesterday, 02:30 PM",
            "spf_status": "PASS (Aligned corporate domain)",
            "dkim_status": "PASS (Validated RSA signature)",
            "real_link_target": "https://intranet.securemind-corp.com/benefits/2026",
            "body_text": "Hello all,\n\nThis is a friendly reminder that the annual open enrollment for our health and dental coverage closes at the end of this month.\n\nYou can review your current coverage tier directly on the internal employee intranet:\n\n[Visit Employee Intranet Benefits Portal]\n\nWarm regards,\nPeople & Culture Team",
            "red_flags": [],
            "educational_debrief": {
                "summary": "This was a Legitimate Internal Corporate Communication.",
                "explanation": "The sender domain is legitimate (@securemind-corp.com), SPF and DKIM pass completely, the URL points to the internal verified intranet subdomain, and there is no artificial panic.",
                "key_takeaways": [
                    "Legitimate emails direct employees to verified internal portal bookmarks or company intranets.",
                    "Look for proper cryptographic alignment (SPF and DKIM pass).",
                    "Calm, informative reminders without demanding credentials or urgent money transfers are standard for internal HR."
                ]
            }
        },
        "options": [
            "Mark as Safe and visit the benefits portal via the verified company intranet link.",
            "Report the email as malicious phishing and block the HR director's address.",
            "Download email attachments to an external personal USB drive.",
            "Ignore all company benefits communications permanently."
        ],
        "correct_index": 0,
        "educational_feedback": "This is a legitimate internal email: sender address matches the official company domain, authentication headers pass, and links point directly to the company intranet without suspicious parameters."
    },

    # ----------------------------------------------------
    # MULTI-DOMAIN SECURITY CHALLENGES
    # ----------------------------------------------------
    {
        "scenario_text": "You receive a rapid succession of 15 push notifications on your phone asking you to approve an authentication request from an unknown device in Eastern Europe at 2:00 AM.",
        "category": "Credential Hygiene",
        "type": "multiple_choice",
        "difficulty": "Intermediate",
        "email_metadata": None,
        "options": [
            "Approve the notification so your phone stops buzzing and go back to sleep.",
            "Deny the request, immediately change your password, and report the incident to the Security Operations Center (SOC).",
            "Turn off your phone's Wi-Fi and ignore it until the morning.",
            "Approve just once to see which application is requesting access."
        ],
        "correct_index": 1,
        "educational_feedback": "This is an 'MFA Fatigue' or 'Prompt Bombing' attack. Attackers have your password and spam your 2FA app hoping you will accidentally or exasperatedly approve access. Denying the prompt, reporting the intrusion to your security team, and changing your credentials stops the breach."
    },
    {
        "scenario_text": "An incoming caller claims to be 'Alex from the Enterprise IT Service Desk'. They state your workstation has been flagged for malware and ask you to read back the 6-digit one-time code sent to your mobile phone.",
        "category": "Social Engineering",
        "type": "multiple_choice",
        "difficulty": "Advanced",
        "email_metadata": None,
        "options": [
            "Read the code to Alex because legitimate IT support personnel often need it for remote debugging.",
            "Ask Alex for their employee ID and immediately share the code once provided.",
            "Refuse to provide the OTP, hang up, and call the official IT Helpdesk using the verified internal directory number.",
            "Give them a fake code first to see if they can detect it."
        ],
        "correct_index": 2,
        "educational_feedback": "Legitimate IT staff will NEVER ask for your One-Time Passcode (OTP), passwords, or 2FA credentials. This is Voice Phishing (Vishing) aimed at intercepting session authorization tokens. Always verify callers via official internal directories."
    },
    {
        "scenario_text": "While walking through the employee cafeteria, you notice a brand-new 64GB USB thumb drive labeled 'Q4 Executive Salary & Bonus Review.xlsx'.",
        "category": "Physical Security",
        "type": "multiple_choice",
        "difficulty": "Beginner",
        "email_metadata": None,
        "options": [
            "Plug it into your corporate laptop to find the owner's name in the document properties.",
            "Plug it into an isolated test computer in the IT room without informing anyone.",
            "Do not connect the drive to any machine; deliver it directly to Corporate Physical Security / IT Incident Response.",
            "Format the USB drive immediately so you can use it for your own presentations."
        ],
        "correct_index": 2,
        "educational_feedback": "This is a 'Baiting' / 'USB Drop' attack. Rogue flash drives can execute malicious payloads, keyboard emulator scripts (Rubber Ducky), or ransomware automatically upon insertion. Never connect untrusted physical media to corporate devices."
    },
    {
        "scenario_text": "A regular vendor sends an invoice as an attached .xlsm (macro-enabled) file. Upon opening, a yellow banner reads: 'Macros have been disabled. Click Enable Content to view your encrypted invoice.'",
        "category": "Ransomware",
        "type": "multiple_choice",
        "difficulty": "Intermediate",
        "email_metadata": None,
        "options": [
            "Click 'Enable Content' since invoices commonly require macros to calculate sales tax.",
            "Do not enable macros, close the file, and reach out to the vendor through a verified phone number to confirm the document's authenticity.",
            "Forward the macro-enabled file to all team members to see if anyone else can read it.",
            "Disable your antivirus software temporarily to allow the macro to finish calculating."
        ],
        "correct_index": 1,
        "educational_feedback": "Macro-enabled office documents are a primary delivery vehicle for trojans, loaders, and ransomware. Attackers use social engineering prompts to lure victims into enabling macros. Genuine invoices rarely require VBA macro execution."
    },
    {
        "scenario_text": "A customer success teammate messages you on Slack: 'Hey, I lost my login to our customer database. Can you DM me your username and password real quick? I have a client on the phone!'",
        "category": "Credential Hygiene",
        "type": "multiple_choice",
        "difficulty": "Beginner",
        "email_metadata": None,
        "options": [
            "Send your credentials via Direct Message since Slack is an encrypted internal tool.",
            "Decline to share credentials, remind the teammate of company policy prohibiting credential sharing, and direct them to IT for emergency access.",
            "Change your password to something simple, share it, and change it back tomorrow.",
            "Post the credentials in a private Slack channel so other team members can also help."
        ],
        "correct_index": 1,
        "educational_feedback": "Sharing account credentials violates the principle of individual accountability, breaks audit logging trails, and increases credential leak surface. Users must never share passwords under any circumstance."
    }
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed or Update Initial Profiles
        profiles_map = {}
        for p in INITIAL_PROFILES:
            existing = db.query(Profile).filter(Profile.email == p["email"].lower()).first()
            if not existing:
                db_p = Profile(
                    name=p["name"],
                    email=p["email"].lower(),
                    department=p["department"],
                    role=p["role"],
                    is_active=True,
                    created_at=datetime.utcnow() - timedelta(days=14)
                )
                db.add(db_p)
                db.flush()
                profiles_map[p["name"]] = db_p
            else:
                # Ensure role and department alignment
                existing.role = p["role"]
                existing.department = p["department"]
                profiles_map[p["name"]] = existing
        db.commit()

        # 2. Seed Questions if empty
        existing_q_count = db.query(Question).count()
        if existing_q_count == 0:
            for q in INITIAL_QUESTIONS:
                db_q = Question(
                    scenario_text=q["scenario_text"],
                    category=q["category"],
                    type=q["type"],
                    difficulty=q["difficulty"],
                    email_metadata=json.dumps(q["email_metadata"]) if q["email_metadata"] else None,
                    options=json.dumps(q["options"]),
                    correct_index=q["correct_index"],
                    educational_feedback=q["educational_feedback"],
                )
                db.add(db_q)
            db.commit()
            print(f"Seeded {len(INITIAL_QUESTIONS)} live database cybersecurity scenarios.")

        # 3. Seed baseline quiz telemetry if no results exist
        existing_results = db.query(QuizResult).count()
        if existing_results == 0:
            sample_benchmarks = [
                {"name": "Sarah Jenkins", "score": 6, "total": 8, "passed": True, "cat": {"Phishing": {"correct": 2, "total": 2}, "Credential Hygiene": {"correct": 2, "total": 3}, "Social Engineering": {"correct": 1, "total": 1}, "Physical Security": {"correct": 1, "total": 1}, "Ransomware": {"correct": 0, "total": 1}}},
                {"name": "Marcus Vance", "score": 8, "total": 8, "passed": True, "cat": {"Phishing": {"correct": 2, "total": 2}, "Credential Hygiene": {"correct": 3, "total": 3}, "Social Engineering": {"correct": 1, "total": 1}, "Physical Security": {"correct": 1, "total": 1}, "Ransomware": {"correct": 1, "total": 1}}},
                {"name": "Amara Okafor", "score": 7, "total": 8, "passed": True, "cat": {"Phishing": {"correct": 2, "total": 2}, "Credential Hygiene": {"correct": 2, "total": 3}, "Social Engineering": {"correct": 1, "total": 1}, "Physical Security": {"correct": 1, "total": 1}, "Ransomware": {"correct": 1, "total": 1}}},
                {"name": "Liam Gallagher", "score": 4, "total": 8, "passed": False, "cat": {"Phishing": {"correct": 1, "total": 2}, "Credential Hygiene": {"correct": 1, "total": 3}, "Social Engineering": {"correct": 0, "total": 1}, "Physical Security": {"correct": 1, "total": 1}, "Ransomware": {"correct": 1, "total": 1}}},
                {"name": "Elena Rostova", "score": 8, "total": 8, "passed": True, "cat": {"Phishing": {"correct": 2, "total": 2}, "Credential Hygiene": {"correct": 3, "total": 3}, "Social Engineering": {"correct": 1, "total": 1}, "Physical Security": {"correct": 1, "total": 1}, "Ransomware": {"correct": 1, "total": 1}}},
                {"name": "Tariq Al-Mansoor", "score": 5, "total": 8, "passed": False, "cat": {"Phishing": {"correct": 1, "total": 2}, "Credential Hygiene": {"correct": 2, "total": 3}, "Social Engineering": {"correct": 1, "total": 1}, "Physical Security": {"correct": 0, "total": 1}, "Ransomware": {"correct": 1, "total": 1}}},
            ]

            for sb in sample_benchmarks:
                user = profiles_map.get(sb["name"])
                if user:
                    pct = round((sb["score"] / sb["total"]) * 100, 1)
                    qr = QuizResult(
                        user_id=user.id,
                        score=sb["score"],
                        total_questions=sb["total"],
                        percentage=pct,
                        passed=sb["passed"],
                        category_scores=json.dumps(sb["cat"]),
                        timestamp=datetime.utcnow() - timedelta(days=2)
                    )
                    db.add(qr)
            db.commit()
            print("Seeded baseline telemetry for registered employee accounts.")

    except Exception as e:
        db.rollback()
        print(f"Error during database seed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
