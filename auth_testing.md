# Auth-Gated App Testing Playbook

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('test_database');
var visitorId = 'user_' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: visitorId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  role: 'customer',
  addresses: [],
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: visitorId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + visitorId);
"
```

## Step 2: Test Backend API
```bash
# Test auth endpoint
curl -X GET "https://bellpoint-store.preview.emergentagent.com/api/auth/me" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Test protected endpoints
curl -X GET "https://bellpoint-store.preview.emergentagent.com/api/cart" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

## Step 3: Create Admin User
```bash
mongosh --eval "
use('test_database');
var adminId = 'admin_' + Date.now();
var adminToken = 'admin_session_' + Date.now();
db.users.insertOne({
  user_id: adminId,
  email: 'admin@bellpoint.com',
  name: 'Admin User',
  picture: null,
  role: 'admin',
  addresses: [],
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: adminId,
  session_token: adminToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Admin Session token: ' + adminToken);
print('Admin User ID: ' + adminId);
"
```
