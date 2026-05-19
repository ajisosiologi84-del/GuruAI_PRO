# Security Specification for Guru AI

## Data Invariants
1. A user profile (`/users/{uid}`) must be created upon first login.
2. Only the owner of a profile or an admin can read the profile.
3. Only the owner can update their profile (except for the `role` field, which should only be modifiable by an existing admin). *Correction: In this simple app, only admins can change roles. Users can set their info on first create.*
4. App progress (`/progress/{uid}`) is private to the user.
5. All timestamps must be server-generated.

## The Dirty Dozen Payloads (PERMISSION_DENIED expected)

1. **Identity Spoofing**: Attempt to create a user profile with a different UID than `request.auth.uid`.
   - Payload: `{ "uid": "other_uid", "email": "me@me.com", "role": "user" }` at `/users/other_uid`
2. **Privilege Escalation (Create)**: A new user attempts to set their role to `admin`.
   - Payload: `{ "uid": "my_uid", "email": "me@me.com", "role": "admin" }`
3. **Privilege Escalation (Update)**: A regular user attempts to change their own role to `admin`.
   - Update Keys: `['role']`
4. **ID Poisoning**: Attempt to create a document with a 2KB junk string as ID.
5. **PII Leak**: An authenticated user attempts to list the `/users` collection without being an admin.
6. **Data Injection**: Attempt to add a "verified" field to a progress document that isn't in the schema.
   - Payload: `{ "verified": true, "userId": "my_uid" }`
7. **Resource Exhaustion**: Sending a 1MB string for the `displayName` field.
8. **Orphaned Writes**: Creating progress for a user UID that doesn't exist in the `users` collection.
9. **Timestamp Spoofing**: Sending a client-side date for `createdAt` instead of `request.time`.
10. **Cross-User Access**: Attempt to read `/progress/other_uid` as `user_uid`.
11. **Update-Gap**: Attempting to update `userId` in a progress document (should be immutable).
12. **Malicious Role Update**: Admin attempting to delete the root admin (if we had complex logic, but here we just check for admin document).

## Test Runner (Logic Outline)
- `test('spoof identity')`: assert `allow create: if request.auth.uid == userId`
- `test('escalate role')`: assert `allow update: if !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role'])`
- `test('admin list')`: assert `allow list: if isAdmin()`
