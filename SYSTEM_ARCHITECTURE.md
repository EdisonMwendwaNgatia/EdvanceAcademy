# Visual System Architecture - Course Submission & Approval

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EDVANCE COURSE MANAGEMENT SYSTEM                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐                    ┌──────────────────────────┐
│      TUTOR SIDE          │                    │      ADMIN SIDE          │
│      (/tutor/*)          │                    │      (/admin/*)          │
└──────────────────────────┘                    └──────────────────────────┘
           │                                              │
           │                                              │
    ┌──────▼──────┐                                ┌──────▼──────┐
    │ Dashboard   │                                │ Dashboard   │
    │ - All       │                                │ - Pending   │
    │ - Draft     │                                │ - Active    │
    │ - Pending   │                                │ - All       │
    │ - Active    │                                │             │
    │ - Rejected  │                                │             │
    └──────┬──────┘                                └──────┬──────┘
           │                                              │
    ┌──────▼──────────────────────┐                      │
    │ Actions Available:           │                      │
    │ 1. Create Course             │                      │
    │ 2. Edit Course Content       │                      │
    │ 3. Submit for Approval       │                      │
    │ 4. View Rejection Reason     │                      │
    │ 5. Resubmit Rejected Course  │                      │
    └──────┬──────────────────────┘                      │
           │                                              │
    ┌──────▼──────────────────────┐                      │
    │ COURSE STATUS FLOW:          │                      │
    │                              │                      │
    │ draft                        │                      │
    │   ↓                          │                      │
    │ Submit for Approval          │                      │
    │   ↓                          │                      │
    │ published ───────────────────┼──────────────────────┼──→ (Visible in "Pending Approval")
    │   ↑                          │                      │
    │   │                          │                      │
    │   └──── rejected ◄───────────┼──────────────────────┘
    │         (with reason)        │
    │                              │
    └──────────────────────────────┘

                 ┌────────────────────────┐
                 │   SUPABASE DATABASE    │
                 ├────────────────────────┤
                 │ Courses Table          │
                 │ ├─ id                  │
                 │ ├─ tutor_id            │
                 │ ├─ title               │
                 │ ├─ description         │
                 │ ├─ status ◄────────────┼── Filter by this!
                 │ ├─ price               │
                 │ ├─ category            │
                 │ ├─ created_at          │
                 │ ├─ published_at        │
                 │ ├─ approved_at         │
                 │ ├─ approved_by         │
                 │ ├─ rejected_at         │
                 │ ├─ rejected_by         │
                 │ └─ rejection_reason    │
                 │                        │
                 │ User Profiles Table    │
                 │ ├─ id                  │
                 │ ├─ full_name           │
                 │ └─ email               │
                 │                        │
                 │ Lessons Table          │
                 │ ├─ id                  │
                 │ ├─ course_id           │
                 │ ├─ title               │
                 │ ├─ content             │
                 │ ├─ video_url           │
                 │ ├─ meeting_link        │
                 │ └─ display_order       │
                 │                        │
                 │ Milestones Table       │
                 │ ├─ id                  │
                 │ ├─ course_id           │
                 │ ├─ title               │
                 │ └─ display_order       │
                 └────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
        (Fetched by Tutor)   (Fetched by Admin)
        for their courses    for approval
```

---

## Workflow Timeline

```
TIMELINE: Course from Creation to Live
═════════════════════════════════════════════════════════════════════════════

DAY 1 - TUTOR CREATES
────────────────────────────────────────────────────────────────────────────
  T: 09:00 AM - Tutor logs in
  T: 09:05 AM - Creates course (title: "Python 101")
               Status in DB: "draft"
  T: 09:06 AM - Adds lessons (5 lessons, 3 milestones)
               Status in DB: Still "draft"
  T: 10:00 AM - Adds more content, final review
  T: 10:30 AM - Clicks "Submit for Approval"
               
               🔄 DATABASE UPDATE 🔄
               Status: "draft" → "published"
               published_at: 2026-05-13 10:30:00
               
  T: 10:31 AM - Sees message: "Course submitted for admin approval"


DAY 1 - ADMIN REVIEWS (Afternoon)
────────────────────────────────────────────────────────────────────────────
  A: 02:00 PM - Admin logs in
  A: 02:05 PM - Goes to /admin/courses
               Default shows: "Pending Approval" tab
               
               📋 QUERY EXECUTED 📋
               SELECT * FROM courses WHERE status = 'published'
               Result: Finds "Python 101" by tutor1
  
  A: 02:06 PM - Clicks "Review Course"
               Modal shows:
               - Course: Python 101
               - Tutor: John Doe (john@example.com)
               - Description: [full course description]
               - Lessons: 5
               - Price: $49.99
               - Category: Programming
  
  A: 02:10 PM - Reviews content, looks good
  A: 02:11 PM - Clicks "✓ Approve & Activate"
               
               🔄 DATABASE UPDATE 🔄
               Status: "published" → "active"
               approved_at: 2026-05-13 14:11:00
               approved_by: admin_user_id
               
  A: 02:11 AM - Course moves to "Active Courses" tab
               Sees message: "✅ Course has been approved and is now active!"


NOW - COURSE IS LIVE
────────────────────────────────────────────────────────────────────────────
✓ Course visible in student marketplace
✓ Students can search and find "Python 101"
✓ Students can enroll and start learning
✓ Tutor can see enrollment numbers
✓ Tutor can see course analytics


ALTERNATIVE TIMELINE: REJECTION
────────────────────────────────────────────────────────────────────────────
  A: 02:10 PM - Admin reviews content
               Finds: "Missing course prerequisites section"
  A: 02:11 PM - Clicks "✗ Reject"
               Enters reason: "Please add prerequisites section"
               
               🔄 DATABASE UPDATE 🔄
               Status: "published" → "rejected"
               rejection_reason: "Please add prerequisites section"
               rejected_at: 2026-05-13 14:11:00
               rejected_by: admin_user_id
               
  
  DAY 2 - TUTOR RESPONDS
  ─────────────────────────────────────────────────────────────────────────
  T: 09:00 AM - Tutor logs in
  T: 09:05 AM - Goes to /tutor/dashboard
               Sees "Python 101" in "Rejected" tab
               Reads reason: "Please add prerequisites section"
  T: 09:30 AM - Edits course, adds prerequisites section
  T: 10:00 AM - Clicks "Resubmit"
               
               🔄 DATABASE UPDATE 🔄
               Status: "rejected" → "published" (back to pending)
               
  T: 10:01 AM - Sees message: "Course resubmitted for approval"
  
  
  DAY 2 - ADMIN REVIEWS AGAIN
  ─────────────────────────────────────────────────────────────────────────
  A: 02:00 PM - Admin reviews resubmitted course
               Changes look good!
  A: 02:05 PM - Clicks "✓ Approve & Activate"
               
               🔄 DATABASE UPDATE 🔄
               Status: "published" → "active"
               ✓ Course is now LIVE!
```

---

## API/Query Reference

### Admin Fetches Pending Courses
```javascript
// The query that admin uses
const query = supabase
  .from('courses')
  .select('*')
  .eq('status', 'published');  // ← THE KEY FILTER

const { data: courses } = await query.order('created_at', { ascending: false });

// SQL equivalent:
// SELECT * FROM courses 
// WHERE status = 'published' 
// ORDER BY created_at DESC
```

### Tutor Submits Course
```javascript
// The update that tutor triggers
const { error } = await supabase
  .from('courses')
  .update({ status: 'published' })
  .eq('id', courseId);

// SQL equivalent:
// UPDATE courses 
// SET status = 'published' 
// WHERE id = ?
```

### Admin Approves
```javascript
// The update that admin triggers
const { error } = await supabase
  .from('courses')
  .update({ 
    status: 'active',
    approved_at: new Date().toISOString(),
    approved_by: admin_user_id,
    rejected_at: null,
    rejected_by: null,
    rejection_reason: null
  })
  .eq('id', courseId);

// SQL equivalent:
// UPDATE courses 
// SET status = 'active',
//     approved_at = NOW(),
//     approved_by = ?,
//     rejected_at = NULL,
//     rejected_by = NULL,
//     rejection_reason = NULL
// WHERE id = ?
```

### Admin Rejects
```javascript
// The update that admin triggers
const { error } = await supabase
  .from('courses')
  .update({ 
    status: 'rejected',
    rejection_reason: reason,
    rejected_at: new Date().toISOString(),
    rejected_by: admin_user_id,
    approved_at: null,
    approved_by: null
  })
  .eq('id', courseId);

// SQL equivalent:
// UPDATE courses 
// SET status = 'rejected',
//     rejection_reason = ?,
//     rejected_at = NOW(),
//     rejected_by = ?,
//     approved_at = NULL,
//     approved_by = NULL
// WHERE id = ?
```

---

## Component Communication

```
┌────────────────────────────────────────────────────────────────┐
│ COMPONENT HIERARCHY                                            │
└────────────────────────────────────────────────────────────────┘

TUTOR DASHBOARD (/tutor/dashboard/page.tsx)
  │
  ├─→ useUserRole() ──→ Check if user is tutor
  │
  ├─→ useEffect() ──→ Fetch courses by tutor_id
  │                   useUserRole.user.id
  │
  ├─→ updateCourseStatus(courseId, "published")
  │   │
  │   └─→ supabase.update()
  │       └─→ status: "draft" → "published"
  │
  └─→ Display courses in tabs:
      - All (all statuses)
      - Draft (only draft)
      - Pending (status = published)
      - Active (status = active)
      - Rejected (status = rejected)


ADMIN DASHBOARD (/admin/courses/page.tsx)
  │
  ├─→ useUserRole() ──→ Check if user is admin
  │
  ├─→ fetchCourses()
  │   │
  │   ├─→ if (filter === 'pending')
  │   │   └─→ .eq('status', 'published')  ◄── KEY QUERY
  │   │
  │   ├─→ if (filter === 'active')
  │   │   └─→ .eq('status', 'active')
  │   │
  │   └─→ For each course:
  │       └─→ Fetch tutor info from user_profiles
  │           .eq('id', course.tutor_id)
  │
  ├─→ approveCourse(courseId)
  │   └─→ status: "published" → "active"
  │
  ├─→ rejectCourse(courseId, reason)
  │   └─→ status: "published" → "rejected"
  │
  └─→ Display courses in tabs:
      - Pending Approval (status = published)
      - Active Courses (status = active)
      - All Courses (all statuses)
```

---

## Data State Diagram

```
Course Lifecycle State Machine
═════════════════════════════════════════════════════════════════

                    ┌─────────────────────────┐
                    │    START: New Course    │
                    └────────────┬────────────┘
                                 │
                                 ▼
                          ┌───────────────┐
                          │    DRAFT      │  (Tutor working)
                          │               │
                          │  Tutor can:   │
                          │  • Edit       │
                          │  • Delete     │
                          │  • Add Content│
                          └───────┬───────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │  Tutor clicks "Submit"     │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │  PUBLISHED (PENDING)     │  ◄── ADMIN SEES THIS
                    │                          │
                    │  Awaiting Admin Review   │  ◄── FETCHED BY:
                    │                          │      WHERE status='published'
                    └──┬──────────────────┬────┘
                       │                  │
        ┌──────────────▼─┐              ┌▼─────────────────┐
        │ Admin Rejects  │              │ Admin Approves   │
        └────────┬────────┘              └────────┬─────────┘
                 │                               │
                 ▼                               ▼
        ┌────────────────┐              ┌──────────────────┐
        │   REJECTED     │              │     ACTIVE       │
        │                │              │                  │
        │ Tutor sees:    │              │ Course LIVE:     │
        │ • Reason       │              │ • Visible to all │
        │ • Can edit     │              │ • Students enroll│
        │ • Can resubmit │              │ • Earning money  │
        └────────┬────────┘              └──────────────────┘
                 │
                 │ (Tutor edits & resubmits)
                 │
                 ▼
        ┌────────────────┐
        │  PUBLISHED     │  (Back to review)
        └────────────────┘

Optional Path: Tutor Archives
─────────────────────────────
  DRAFT  ──→  ARCHIVED (hidden, can restore)
  
  PUBLISHED ──→  ARCHIVED (hidden, can restore)
  
  ACTIVE ──→  ARCHIVED (hidden, can restore)
```

---

## Browser Network Flow

```
TUTOR SUBMITTING COURSE
════════════════════════════════════════════════════════════════

BROWSER (Tutor)                     SUPABASE
─────────────────                   ────────────
       │                                │
       │ 1. Click "Submit"              │
       ├─────────────────────────────────→
       │                                │
       │ 2. supabase.update()           │
       │    {status: 'published'}       │
       ├─────────────────────────────────→
       │                                │
       │                          3. Execute SQL:
       │                             UPDATE courses
       │                             SET status='published'
       │                             WHERE id=?
       │                                │
       │ 4. ← {success: true}           │
       │ ←──────────────────────────────┤
       │                                │
       │ 5. Show alert                  │
       │    "Course submitted..."       │
       │                                │


ADMIN REVIEWING COURSE
════════════════════════════════════════════════════════════════

BROWSER (Admin)                     SUPABASE
─────────────────                   ────────────
       │                                │
       │ 1. Go to /admin/courses        │
       ├─────────────────────────────────→
       │                                │
       │ 2. Fetch courses               │
       │    WHERE status='published'    │
       ├─────────────────────────────────→
       │                                │
       │                          3. Execute SQL:
       │                             SELECT * FROM courses
       │                             WHERE status='published'
       │                             ORDER BY created_at DESC
       │                                │
       │ 4. ← [{courseData}, ...]       │
       │ ←──────────────────────────────┤
       │                                │
       │ 5. For each course:            │
       │    Fetch tutor info            │
       ├─────────────────────────────────→
       │                                │
       │                          6. Execute SQL:
       │                             SELECT full_name, email
       │                             FROM user_profiles
       │                             WHERE id=?
       │                                │
       │ 7. ← {full_name, email}        │
       │ ←──────────────────────────────┤
       │                                │
       │ 8. Display course cards        │
       │    with tutor info             │
       │                                │
       │ 9. Click "Approve"             │
       ├─────────────────────────────────→
       │                                │
       │ 10. supabase.update()          │
       │     {status: 'active',         │
       │      approved_at: NOW(),       │
       │      approved_by: userId}      │
       ├─────────────────────────────────→
       │                                │
       │                          11. Execute SQL:
       │                              UPDATE courses
       │                              SET status='active',
       │                                  approved_at=NOW(),
       │                                  approved_by=?
       │                              WHERE id=?
       │                                │
       │ 12. ← {success: true}          │
       │ ←──────────────────────────────┤
       │                                │
       │ 13. Show alert                 │
       │     "Course approved!"         │
       │                                │
       │ 14. Refresh list               │
       ├─────────────────────────────────→
       │     (back to step 2)            │
```

---

## Summary of Key Concepts

| Concept | Value | Used By | Purpose |
|---------|-------|---------|---------|
| Status Filter | `published` | Admin | Find courses awaiting approval |
| Status Change | draft → published | Tutor | Submit course for approval |
| Status Change | published → active | Admin | Approve and go live |
| Status Change | published → rejected | Admin | Send back for changes |
| Status Change | rejected → published | Tutor | Resubmit after rejection |
| Approval Record | approved_at, approved_by | Admin | Track who approved and when |
| Rejection Record | rejected_at, rejected_by, rejection_reason | Admin | Track why it was rejected |
| Tutor Info | user_profiles | Admin | Display tutor name and email |

---

This is the complete system architecture for course submission and admin approval!
