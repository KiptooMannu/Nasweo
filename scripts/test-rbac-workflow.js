/**
 * Automated End-to-End RBAC, User Management, and Mandatory Password Change Test
 * NASWEO Welfare Data Management System
 */

const API_BASE = 'http://localhost:8080/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, body: json };
}

async function runTests() {
  console.log('================================================================');
  console.log('NASWEO RBAC, USER MANAGEMENT & SECURITY WORKFLOW TEST SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Admin Login
  console.log('\n--- 1. ADMIN AUTHENTICATION ---');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  assert(loginRes.status === 200 && loginRes.body.success, 'Admin authenticated successfully');
  const adminToken = loginRes.body.data.token;
  assert(!!adminToken, 'Admin received JWT Bearer token');

  // 2. Query Roles Catalog
  console.log('\n--- 2. ROLES & PERMISSIONS GOVERNANCE ---');
  const rolesRes = await request('/auth/roles', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(rolesRes.status === 200, 'GET /api/auth/roles returned 200 OK');
  assert(rolesRes.body.data && rolesRes.body.data.length === 5, 'Retrieved all 5 documented RFQ roles');

  // 3. Admin User Management - List Users
  console.log('\n--- 3. USER MANAGEMENT - DIRECTORY ---');
  const usersRes = await request('/auth/users', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(usersRes.status === 200 && Array.isArray(usersRes.body.data), 'GET /api/auth/users returned user directory');
  console.log(`      Current user count: ${usersRes.body.data.length}`);

  // 4. Admin Register New User with Temporary Password
  console.log('\n--- 4. USER PROVISIONING & TEMPORARY CREDENTIAL ---');
  const testUsername = `user_${Date.now().toString().slice(-4)}`;
  const createRes = await request('/auth/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      username: testUsername,
      fullName: 'Research Scientist Test',
      email: `${testUsername}@kalro.org`,
      phoneNumber: '+254711999888',
      payrollNo: `NARL-${testUsername.slice(-4)}`,
      roles: ['ROLE_MEMBER'],
      enabled: true
    })
  });
  assert(createRes.status === 200 && createRes.body.success, `Created new account @${testUsername}`);
  const tempPassword = createRes.body.data.temporaryPassword;
  assert(!!tempPassword, `Generated secure temporary password: ${tempPassword}`);
  assert(createRes.body.data.user.mustChangePassword === true, 'Account flagged mustChangePassword=true');

  // 5. User First-Login with Temporary Password
  console.log('\n--- 5. MANDATORY FIRST-LOGIN ENFORCEMENT ---');
  const userLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: testUsername, password: tempPassword })
  });
  assert(userLoginRes.status === 200, 'User logged in successfully using temporary password');
  assert(userLoginRes.body.data.mustChangePassword === true, 'Login response confirms mustChangePassword=true');
  const userToken = userLoginRes.body.data.token;

  // 6. Access Restriction: protected endpoints blocked while mustChangePassword is true
  console.log('\n--- 6. ACCESS RESTRICTION WHILE PASSWORD CHANGE PENDING ---');
  const blockedEndpointRes = await request('/members', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(blockedEndpointRes.status === 403, 'Protected endpoint /api/members blocked with HTTP 403 Forbidden');

  // 7. Change Password Endpoint - Establish Permanent Password
  console.log('\n--- 7. PERMANENT PASSWORD ESTABLISHMENT ---');
  const newPermanentPassword = 'Permanent#Pass2026!';
  const changePassRes = await request('/auth/change-password', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      currentPassword: tempPassword,
      newPassword: newPermanentPassword,
      confirmPassword: newPermanentPassword
    })
  });
  assert(changePassRes.status === 200 && changePassRes.body.success, 'POST /api/auth/change-password succeeded');

  // 8. Re-authenticate with New Permanent Password
  console.log('\n--- 8. LOGIN WITH NEW PERMANENT PASSWORD ---');
  const newLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: testUsername, password: newPermanentPassword })
  });
  assert(newLoginRes.status === 200, 'User logged in with new permanent password');
  assert(newLoginRes.body.data.mustChangePassword === false, 'Account mustChangePassword is now false');
  const permanentUserToken = newLoginRes.body.data.token;

  // 9. Member Data Isolation - Ordinary member cannot query other members
  console.log('\n--- 9. MEMBER DATA ISOLATION RESTRICTION ---');
  const unauthorizedOtherMemberRes = await request('/members/payroll/NARL-1002', {
    headers: { Authorization: `Bearer ${permanentUserToken}` }
  });
  assert(unauthorizedOtherMemberRes.status === 403, 'Ordinary member accessing other member payroll rejected with HTTP 403');

  // 10. Audit Log Verification
  console.log('\n--- 10. IMMUTABLE SECURITY AUDIT TRAIL ---');
  const auditRes = await request('/auth/audit-logs/recent', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(auditRes.status === 200 && Array.isArray(auditRes.body.data), 'Audit logs retrieved');
  const hasUserCreated = auditRes.body.data.some(l => l.action === 'USER_CREATED');
  const hasPasswordChanged = auditRes.body.data.some(l => l.action === 'PASSWORD_CHANGED');
  assert(hasUserCreated, 'Audit log recorded USER_CREATED action');
  assert(hasPasswordChanged, 'Audit log recorded PASSWORD_CHANGED action');

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
