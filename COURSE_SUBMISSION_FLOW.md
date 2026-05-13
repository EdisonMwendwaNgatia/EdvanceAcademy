# EdVance Course Submission & Admin Approval Flow

## How Tutors Push Courses to Database

### Step 1: Create Course (Draft)
**File:** `src/app/tutor/courses/new/page.tsx`

```tsx
// Tutor creates a new course with initial status: "draft"
await supabase.from("courses").insert([{
  title,
  description,
  tutor_id: user?.id,
  status: "draft",  // ← Initial status
}]);
```

- **Status:** `draft`
- **Visibility:** Only to the tutor
- **Fields:** title, description, tutor_id

### Step 2: Edit Course Content
**File:** `src/app/tutor/courses/[courseId]/edit/page.tsx`

- Tutor adds **lessons** to the course
  - Title, content, video URL, meeting details (Zoom/Teams)
  - Meeting links and scheduled dates
- Tutor adds **milestones** (progress markers)
- Tutor reorders lessons via drag-and-drop
- All changes are automatically saved to database

### Step 3: Submit for Admin Approval
**File:** `src/app/tutor/dashboard/page.tsx` (lines 81-85)

```tsx
const updateCourseStatus = async (courseId: string, newStatus) => {
  await supabase.from("courses")
    .update({ status: newStatus })
    .eq("id", courseId);
  
  if (newStatus === "published") {
    alert("Course submitted for admin approval. You'll be notified once reviewed.");
  }
};
```

**Tutor Dashboard Actions:**
- Click "Submit for Approval" button
- Course status changes: `draft` → `published`
- Tutor sees course in "Pending" tab
- Notification: Course is now awaiting admin review

---

## Course Status States (Database)

| Status | Who Sets | Meaning | Visibility |
|--------|----------|---------|------------|
| `draft` | Tutor | Work in progress, not submitted | Tutor only |
| `published` | Tutor | **Awaiting admin approval** | Tutor (Pending tab) + Admin (Pending tab) |
| `active` | Admin | Approved and live on platform | Everyone (public) |
| `rejected` | Admin | Admin rejected with reason | Tutor (Rejected tab) + Admin |
| `archived` | Tutor | Hidden from view | Tutor only |

---

## Admin Approval Workflow

### Admin View
**File:** `src/app/admin/courses/page.tsx`

Admin can see three tabs:

#### 1. **Pending Approval** (Default)
```tsx
if (filter === 'pending') {
  query = query.eq('status', 'published');  // ← Fetches courses awaiting approval
}
```

Shows: All courses where `status = 'published'`
- Displays tutor name and email
- Shows course details (category, price, description)
- Provides two action buttons per course

#### 2. **Active Courses**
```tsx
if (filter === 'active') {
  query = query.eq('status', 'active');  // ← Approved courses
}
```

Shows: All courses where `status = 'active'`
- Already approved and live

#### 3. **All Courses**
```tsx
if (filter === 'all') {
  // No filter - shows everything
}
```

Shows: All courses in all statuses

### Admin Actions on Pending Courses

#### Approve & Activate
```tsx
const approveCourse = async (courseId) => {
  await supabase.from('courses')
    .update({ 
      status: 'active',           // ← Set to active
      approved_at: new Date().toISOString(),
      approved_by: user?.id,
      rejected_at: null,
      rejected_by: null,
      rejection_reason: null
    })
    .eq("id", courseId);
};
```

**Result:**
- Course status: `published` → `active`
- Course becomes live and searchable
- Tutor is notified

#### Reject Course
```tsx
const rejectCourse = async (courseId) => {
  const reason = prompt('Please provide a reason for rejection:');
  
  await supabase.from('courses')
    .update({ 
      status: 'rejected',         // ← Set to rejected
      rejection_reason: reason,
      rejected_at: new Date().toISOString(),
      rejected_by: user?.id,
      approved_at: null,
      approved_by: null
    })
    .eq("id", courseId);
};
```

**Result:**
- Course status: `published` → `rejected`
- Rejection reason stored for tutor to see
- Tutor can edit and resubmit

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ TUTOR SIDE                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Create Course ──→ Status: draft                         │
│     (New Course Page)                                       │
│           ↓                                                  │
│  2. Add Lessons ──→ Status: still draft                     │
│     (Edit Page)                                             │
│           ↓                                                  │
│  3. Click "Submit" ──→ Status: published ✓                 │
│     (Dashboard)      "Awaiting Admin Approval"              │
│           ↓                                                  │
│  4. Wait for Admin... or Edit More & Resubmit               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
                          │ (Database: status='published')
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ ADMIN SIDE                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Admin Dashboard → Courses Page → Pending Approval Tab      │
│                                                              │
│  Sees: All courses with status='published'                  │
│        + Tutor Info                                          │
│        + Course Details                                     │
│        + Review/Action Buttons                              │
│                                                              │
│  Admin Chooses:                                              │
│        ┌────────────────────────────┐                       │
│        ↓                            ↓                       │
│   ✓ APPROVE              ✗ REJECT                          │
│   Status: active         Status: rejected                   │
│   Course LIVE!           Reason saved                       │
│   Visible to students    Tutor notified                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Courses Table)

```sql
courses {
  id              UUID PRIMARY KEY
  tutor_id        UUID → user_profiles
  title           VARCHAR
  description     TEXT
  status          ENUM('draft', 'published', 'active', 'rejected', 'archived')
  price           DECIMAL
  category        VARCHAR
  thumbnail_url   VARCHAR
  
  -- Submission tracking
  published_at    TIMESTAMP (when tutor submitted)
  approved_at     TIMESTAMP (when admin approved)
  approved_by     UUID (admin user id)
  rejected_at     TIMESTAMP (when admin rejected)
  rejected_by     UUID (admin user id)
  rejection_reason TEXT
  
  created_at      TIMESTAMP
  updated_at      TIMESTAMP
}

user_profiles {
  id              UUID PRIMARY KEY
  full_name       VARCHAR
  email           VARCHAR
  ...
}

lessons {
  id              UUID PRIMARY KEY
  course_id       UUID → courses
  title           VARCHAR
  content         TEXT
  video_url       VARCHAR
  meeting_link    VARCHAR
  meeting_date    TIMESTAMP
  meeting_platform VARCHAR('zoom', 'teams', 'other')
  display_order   INTEGER
}

milestones {
  id              UUID PRIMARY KEY
  course_id       UUID → courses
  title           VARCHAR
  display_order   INTEGER
}
```

---

## Testing the Flow

### Test as Tutor:
1. Go to `/tutor/dashboard`
2. Click "Create Course"
3. Add title and description
4. Go to edit course, add lessons
5. Click "Submit for Approval" button
6. See status change to "Pending"

### Test as Admin:
1. Go to `/admin/courses`
2. Default view shows "Pending Approval" tab
3. See courses submitted by tutors (status='published')
4. Click "Review Course" on any pending course
5. See modal with course details and tutor info
6. Click "✓ Approve & Activate" or "✗ Reject"
7. See status update

---

## Key Points

✅ **Tutors submit courses** by changing status from `draft` → `published`

✅ **Admin fetches published courses** by querying `status = 'published'`

✅ **Admin has two actions:**
   - Approve: Sets status to `active` (goes live)
   - Reject: Sets status to `rejected` (with reason)

✅ **Tutor can resubmit** after rejection by editing and submitting again

✅ **No approval needed** for draft courses (only tutors see them)
