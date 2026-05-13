# Admin Dashboard - Quick Reference Guide

## 🎯 What Changed?

The admin dashboard has been **refactored from a monolithic page into component-based architecture**. Instead of one large file with all functionality, it's now split into 4 reusable components.

## 📁 Files Created/Modified

### New Components
```
src/components/admin/
├── AdminNav.tsx          (Navigation with tab switching)
├── UserManagementTab.tsx (User management functionality)
└── CoursesTab.tsx        (Course review functionality)
```

### Modified Files
```
src/app/admin/dashboard/page.tsx (Now uses components)
```

## 🔄 How Tab Switching Works Now

### Before
- Navigation links used `<Link>` which caused full page navigation
- Clicking "Users Management" went to `/admin/dashboard`
- Clicking "Courses" went to `/admin/courses`
- Two separate pages with duplicate navigation

### After
- Both tabs are on the same page (`/admin/dashboard`)
- Clicking tabs updates `activeTab` state without page reload
- Components are conditionally rendered based on `activeTab`
- Smooth, seamless user experience

## 📋 Component Breakdown

### AdminNav.tsx
**Responsibility**: Navigation bar and tab switching

**Props**:
```typescript
interface AdminNavProps {
  activeTab: "dashboard" | "courses";
  onTabChange?: (tab: "dashboard" | "courses") => void;
}
```

**Usage**:
```tsx
<AdminNav 
  activeTab={activeTab} 
  onTabChange={setActiveTab} 
/>
```

---

### UserManagementTab.tsx
**Responsibility**: User list, search, filter, and management

**Features**:
- Display users in table format
- Filter by role (All, Students, Tutors)
- Search by name or email
- View detailed user information
- Toggle user active/inactive status

**Key Functions**:
- `fetchUsers()`: Fetch and display users
- `toggleUserStatus()`: Activate/deactivate users
- `viewUserDetails()`: Open user details modal

---

### CoursesTab.tsx
**Responsibility**: Course review, approval, and management

**Features**:
- Display courses in grid format
- Filter by status (Pending, Active, All)
- View course details
- Approve courses with price setting
- Reject courses with reason

**Key Functions**:
- `fetchCourses()`: Fetch and display courses
- `approveCourse()`: Approve a course
- `rejectCourse()`: Reject a course with reason
- `viewCourseDetails()`: Open course details modal

---

### AdminDashboard Page
**Responsibility**: Main container and state management

**Key Logic**:
```typescript
// Main component structure
export default function AdminDashboard() {
  // 1. Check role
  useEffect(() => {
    if (!roleLoading && role !== "admin") {
      router.push("/student/dashboard");
    }
  }, [role, roleLoading, router]);

  // 2. Render based on active tab
  return (
    <>
      <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "dashboard" && <UserManagementTab />}
      {activeTab === "courses" && <CoursesTab />}
    </>
  );
}
```

## 🎯 User Flow

### Clicking "Users Management" Tab
```
User clicks tab
    ↓
setActiveTab("dashboard") is called
    ↓
activeTab state updates to "dashboard"
    ↓
Page re-renders
    ↓
<UserManagementTab /> component is rendered
```

### Clicking "Courses" Tab
```
User clicks tab
    ↓
setActiveTab("courses") is called
    ↓
activeTab state updates to "courses"
    ↓
Page re-renders
    ↓
<CoursesTab /> component is rendered
```

## 🚀 Benefits

| Feature | Benefit |
|---------|---------|
| **Component-Based** | Easier to maintain and test |
| **No Page Reloads** | Faster tab switching |
| **Reusable** | Components can be imported elsewhere |
| **Cleaner Code** | Main page is now very simple |
| **Scalable** | Easy to add more tabs |
| **Type-Safe** | Full TypeScript support |

## 🔧 How to Add a New Tab

If you need to add a new admin tab (e.g., "Reports"):

### Step 1: Create new component
```typescript
// src/components/admin/ReportsTab.tsx
export default function ReportsTab() {
  // Component code
}
```

### Step 2: Import in AdminDashboard
```typescript
import ReportsTab from "@/components/admin/ReportsTab";
```

### Step 3: Add to state type and UI
```typescript
const [activeTab, setActiveTab] = useState<"dashboard" | "courses" | "reports">("dashboard");

// In JSX
{activeTab === "reports" && <ReportsTab />}
```

### Step 4: Add button in AdminNav
```typescript
<button onClick={() => handleTabClick("reports")}>Reports</button>
```

That's it! The new tab will work automatically.

## 📊 Component Sizes

| File | Lines | Purpose |
|------|-------|---------|
| AdminNav.tsx | ~64 | Navigation only |
| UserManagementTab.tsx | ~300+ | User management UI + logic |
| CoursesTab.tsx | ~300+ | Course management UI + logic |
| AdminDashboard page.tsx | ~40 | Container & orchestration |

## ✅ Testing Checklist

- [ ] Admin can see both tabs
- [ ] Clicking "Users Management" shows user list
- [ ] Clicking "Courses" shows courses grid
- [ ] Tab switching doesn't cause page reload
- [ ] Search functionality works
- [ ] Filter functionality works
- [ ] Modal opens/closes properly
- [ ] User can perform actions (approve/reject, activate/deactivate)
- [ ] Success alerts appear after actions
- [ ] Non-admin users are redirected

## 🐛 Troubleshooting

### Tab clicks not working?
- Check that `onTabChange` prop is passed to AdminNav
- Verify `setActiveTab` is defined in AdminDashboard

### Components not showing?
- Check conditional rendering logic
- Verify activeTab value matches component condition

### Data not loading?
- Check Supabase connection
- Verify RLS policies allow admin access
- Check browser console for errors

## 📚 Related Files

- Navigation style: Uses Tailwind CSS classes
- Data source: Supabase tables (courses, user_profiles)
- Authentication: Uses useUserRole hook
- Image handling: Next.js Image component
