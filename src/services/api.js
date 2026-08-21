const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Production-Ready API Service Client for SecureMind
 * All operations communicate dynamically with the live database backend.
 */
export const apiService = {
  // ==========================================
  // AUTH & USER MANAGEMENT (Two-Tier RBAC)
  // ==========================================

  // Register a new employee or administrator account
  async registerProfile(profileData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to register profile' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return await res.json();
  },

  // Authenticate an existing employee or cyber admin by corporate email
  async login(email) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail || 'Account lookup failed');
    }
    return await res.json();
  },

  // Cyber Team: Fetch all enrolled employee accounts with live performance metrics
  async getAllUsers(filters = {}) {
    let url = `${API_BASE_URL}/auth/users`;
    const params = new URLSearchParams();
    if (filters.department) params.append('department', filters.department);
    if (filters.role) params.append('role', filters.role);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to fetch user list' }));
      throw new Error(err.detail || 'User list retrieval failed');
    }
    return await res.json();
  },

  // Cyber Team: Update an employee's role, department, or active status
  async updateUser(userId, updateData) {
    const res = await fetch(`${API_BASE_URL}/auth/users/${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to update user account' }));
      throw new Error(err.detail || 'User update failed');
    }
    return await res.json();
  },

  // Cyber Team: Decommission/delete an employee account from the database
  async deleteUser(userId) {
    const res = await fetch(`${API_BASE_URL}/auth/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete user account' }));
      throw new Error(err.detail || 'User deletion failed');
    }
    return true;
  },

  // Retrieve complete historical training attempt records for an employee
  async getUserHistory(userId) {
    const res = await fetch(`${API_BASE_URL}/auth/users/${encodeURIComponent(userId)}/history`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to fetch user history' }));
      throw new Error(err.detail || 'History lookup failed');
    }
    return await res.json();
  },

  // ==========================================
  // SCENARIOS & PHISHING SIMULATION
  // ==========================================

  // Fetch threat scenarios dynamically from database
  async getQuestions(category = null, type = null) {
    let url = `${API_BASE_URL}/questions`;
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (type) params.append('type', type);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to fetch scenario questions' }));
      throw new Error(err.detail || 'Question bank retrieval failed');
    }
    return await res.json();
  },

  // Cyber Team: Create a new custom security scenario in the database
  async createQuestion(questionData) {
    const res = await fetch(`${API_BASE_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to create scenario' }));
      throw new Error(err.detail || 'Scenario creation failed');
    }
    return await res.json();
  },

  // Cyber Team: Delete a scenario from the database
  async deleteQuestion(questionId) {
    const res = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: 'DELETE',
    });
    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete scenario' }));
      throw new Error(err.detail || 'Scenario deletion failed');
    }
    return true;
  },

  // ==========================================
  // QUIZ ENGINE & TELEMETRY
  // ==========================================

  // Submit quiz telemetry and record performance in database
  async submitQuiz(submission) {
    const res = await fetch(`${API_BASE_URL}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to submit quiz attempt' }));
      throw new Error(err.detail || 'Submission failed');
    }
    return await res.json();
  },

  // ==========================================
  // HR & ADMIN MATURITY ANALYTICS
  // ==========================================

  // Fetch real-time Security Maturity Index (SMI) and department telemetry
  async getAnalytics() {
    const res = await fetch(`${API_BASE_URL}/analytics/overview`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to fetch analytics' }));
      throw new Error(err.detail || 'Analytics retrieval failed');
    }
    return await res.json();
  }
};
