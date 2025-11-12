# TODO: Add Group Management to User Management Section

## Tasks

- [x] Modify src/pages/Users.jsx to add group state management
- [x] Add "Create Group" button beside "Add User" button
- [x] Create group creation dialog with form fields:
  - Group name (input)
  - Member selection (multi-select from users)
  - Permissions (checkboxes: manage_users, view_reports, create_hazards, etc.)
  - Notification button (for group notifications)
- [x] Implement group creation logic and store groups in localStorage
- [x] Extend src/lib/notificationUtils.js with createGroupNotification function
- [x] Add group update functionality (add/remove members, change permissions)
- [x] Ensure group changes notify only group members
- [x] Test the group creation form and notifications
- [x] Add Groups section to sidebar for all roles
- [x] Create Groups.jsx page for viewing/managing groups
- [x] Add routing for /groups
- [x] Implement group-specific notifications in Notifications page (only group members see group notifications)

## Progress

- [x] Plan approved by user
- [x] Extended notificationUtils.js with createGroupNotification
