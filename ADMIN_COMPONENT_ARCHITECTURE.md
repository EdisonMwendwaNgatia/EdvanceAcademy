# Admin Dashboard Component Architecture

## Component Hierarchy

```
src/app/admin/dashboard/page.tsx (AdminDashboard)
│
├─── Role Check (useUserRole)
│    └─── Redirect if not admin
│
├─── State Management
│    └─── activeTab: "dashboard" | "courses"
│
└─── Render
     │
     ├─── <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />
     │    │
     │    ├─── EdVance Admin Logo
     │    │
     │    ├─── Tab Buttons
     │    │    ├─── Users Management (Click to switch tabs)
     │    │    ├─── Courses (Click to switch tabs)
     │    │    └─── Reports
     │    │
     │    └─── Sign Out Button
     │
     ├─── Conditional Rendering
     │    │
     │    ├─── IF activeTab === "dashboard"
     │    │    └─── <UserManagementTab />
     │    │         │
     │    │         ├─── Header Section
     │    │         │
     │    │         ├─── Search Bar
     │    │         │
     │    │         ├─── Filter Tabs
     │    │         │    ├─── All Users
     │    │         │    ├─── Students
     │    │         │    └─── Tutors
     │    │         │
     │    │         ├─── Users Table
     │    │         │    ├─── Name & Avatar
     │    │         │    ├─── Email
     │    │         │    ├─── Role Badge
     │    │         │    ├─── Status Badge
     │    │         │    ├─── Join Date
     │    │         │    └─── View Details Button
     │    │         │
     │    │         └─── User Details Modal
     │    │              ├─── User Avatar
     │    │              ├─── Full Name
     │    │              ├─── Email
     │    │              ├─── Role
     │    │              ├─── Status
     │    │              ├─── Join Date
     │    │              └─── Activate/Deactivate Button
     │    │
     │    └─── IF activeTab === "courses"
     │         └─── <CoursesTab />
     │              │
     │              ├─── Info Banner
     │              │
     │              ├─── Filter Tabs
     │              │    ├─── Pending Approval (with count badge)
     │              │    ├─── Active Courses
     │              │    └─── All (Published, Active & Rejected)
     │              │
     │              ├─── Courses Grid
     │              │    ├─── Course Card
     │              │    │    ├─── Thumbnail
     │              │    │    ├─── Title
     │              │    │    ├─── Status Badge
     │              │    │    ├─── Description
     │              │    │    ├─── Tutor Name
     │              │    │    ├─── Category
     │              │    │    ├─── Price
     │              │    │    └─── Review/View Details Button
     │              │    └─── [Multiple cards...]
     │              │
     │              └─── Course Details Modal
     │                   ├─── Course Thumbnail
     │                   ├─── Title & Description
     │                   ├─── Tutor Info (Name & Email)
     │                   ├─── Course Details (Category, Price, Submitted Date)
     │                   ├─── Status-Specific Actions
     │                   │    ├─── IF Pending: Approve & Reject Buttons
     │                   │    ├─── IF Rejected: Show Rejection Reason
     │                   │    └─── IF Active: Show Approval Confirmation
     │                   └─── Close Button
     └─── Max Width Container (7xl)
```

## Data Flow

### User Tab Flow
```
UserManagementTab Component
    │
    ├─── fetchUsers() [useCallback]
    │    └─── Supabase Query
    │         ├─── Get user_profiles
    │         ├─── Apply role filter if needed
    │         └─── Sort by created_at
    │
    ├─── setFilter() [State Update]
    │    └─── Triggers fetchUsers()
    │
    ├─── setSearchTerm() [State Update]
    │    └─── Filters users locally
    │
    ├─── toggleUserStatus()
    │    └─── Updates user profile in Supabase
    │         └─── Triggers fetchUsers() refresh
    │
    └─── Modal State Management
         ├─── viewUserDetails(user)
         ├─── setShowModal(false)
         └─── setSelectedUser(null)
```

### Courses Tab Flow
```
CoursesTab Component
    │
    ├─── fetchCourses() [useCallback]
    │    └─── Supabase Query
    │         ├─── Get courses (exclude draft & archived)
    │         ├─── Apply status filter
    │         ├─── Get unique tutor IDs
    │         ├─── Fetch tutor profiles
    │         └─── Combine data with tutor info
    │
    ├─── setFilter() [State Update]
    │    └─── Triggers fetchCourses()
    │
    ├─── approveCourse(courseId)
    │    ├─── Get current user
    │    └─── Update course status to "active"
    │         ├─── Set approved_at timestamp
    │         ├─── Set approved_by admin ID
    │         ├─── Clear rejection fields
    │         └─── Triggers fetchCourses() refresh
    │
    ├─── rejectCourse(courseId)
    │    ├─── Prompt for rejection reason
    │    └─── Update course status to "rejected"
    │         ├─── Set rejection_reason
    │         ├─── Set rejected_at timestamp
    │         ├─── Set rejected_by admin ID
    │         └─── Triggers fetchCourses() refresh
    │
    └─── Modal State Management
         ├─── viewCourseDetails(course)
         ├─── setShowModal(false)
         └─── setSelectedCourse(null)
```

## State Variables

### AdminDashboard
- `activeTab`: Current active tab
- `roleLoading`: Admin authentication check
- `role`: User's role

### UserManagementTab
- `users`: Array of user objects
- `loading`: Data fetching state
- `filter`: Role filter ("all" | "students" | "tutors")
- `searchTerm`: User search input
- `selectedUser`: Currently selected user in modal
- `showModal`: Modal visibility
- `actionLoading`: Action processing state

### CoursesTab
- `courses`: Array of course objects
- `loading`: Data fetching state
- `filter`: Status filter ("pending" | "active" | "all")
- `selectedCourse`: Currently selected course in modal
- `showModal`: Modal visibility
- `actionLoading`: Action processing state

### AdminNav
- `activeTab`: Current active tab (from props)
- `onTabChange`: Callback function (from props)

## Key Features

✅ Tab-based navigation without page reloads
✅ Real-time data updates after actions
✅ Search and filter functionality
✅ Modal dialogs for detailed views
✅ Proper loading states
✅ Error handling with alerts
✅ User role-based access control
✅ Admin-only access verification
