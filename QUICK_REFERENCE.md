# Quick Reference: Course Submission & Admin Approval

## 🎯 TL;DR - The Flow

```
Tutor                          Admin
────────────────────────────────────────
draft course
   ↓
Add lessons
   ↓
Click "Submit"  ──→  Status = published
   ↓
                     Admin sees in "Pending Approval"
                     ↓
                     Click "Approve" or "Reject"
                     ↓
                     Status = active (approve) or rejected (reject)
```

---

## 📝 Where Tutors Submit Courses

**File:** `/src/app/tutor/dashboard/page.tsx` (Line 293)

```tsx
onClick={() => updateCourseStatus(course.id, "published")}
```

**Button Text:** "Submit for Approval" or "Resubmit"

**What it does:**
- Changes course `status` from `draft` → `published`
- Marks course as ready for admin review
- Shows message: "Course submitted for admin approval. You'll be notified once reviewed."

---

## 🔍 Where Admin Fetches Published Courses

**File:** `/src/app/admin/courses/page.tsx` (Lines 44-50)

```tsx
let query = supabase
  .from('courses')
  .select('*');

if (filter === 'pending') {
  query = query.eq('status', 'published');  // ← THIS FILTERS FOR SUBMITTED COURSES
}
```

**Three Tabs:**
1. **Pending Approval** → `status = 'published'`
2. **Active Courses** → `status = 'active'`
3. **All Courses** → All statuses

---

## ✅ Admin Approval Actions

### Approve Course
**Function:** `approveCourse()` (Line 135)

```tsx
await supabase.from('courses')
  .update({ 
    status: 'active',
    approved_at: new Date().toISOString(),
    approved_by: user?.id,
    rejected_at: null,
    rejected_by: null,
    rejection_reason: null
  })
  .eq("id", courseId);
```

**Result:** Course becomes live and visible to students

### Reject Course
**Function:** `rejectCourse()` (Line 158)

```tsx
await supabase.from('courses')
  .update({ 
    status: 'rejected',
    rejection_reason: reason,
    rejected_at: new Date().toISOString(),
    rejected_by: user?.id,
    approved_at: null,
    approved_by: null
  })
  .eq("id", courseId);
```

**Result:** Tutor sees rejection reason in "Rejected" tab and can resubmit

---

## 🗄️ Course Status Values

| Value | Meaning | Set By | Action |
|-------|---------|--------|--------|
| `draft` | Work in progress | Tutor (on create) | Tutor adds content |
| `published` | **Awaiting approval** | Tutor (on submit) | Admin reviews |
| `active` | Approved & live | Admin (on approve) | Students can enroll |
| `rejected` | Needs changes | Admin (on reject) | Tutor resubmits |
| `archived` | Hidden | Tutor | Not shown |

---

## 🔗 Fetching Related Data

The admin page also fetches **tutor information** from `user_profiles`:

```tsx
const { data: tutorData } = await supabase
  .from('user_profiles')
  .select('full_name, email')
  .eq('id', course.tutor_id)
  .single();
```

This displays in the course card:
- Tutor Name
- Tutor Email

---

## 🧪 Testing Checklist

- [ ] Tutor creates course (appears in "All" tab as draft)
- [ ] Tutor adds lessons to course
- [ ] Tutor clicks "Submit for Approval"
- [ ] Admin sees course in "Pending Approval" tab
- [ ] Admin clicks "Review Course"
- [ ] Modal shows tutor info and course details
- [ ] Admin clicks "✓ Approve & Activate"
- [ ] Course moves to "Active Courses" tab
- [ ] Course is now visible to students

**Rejection Flow:**
- [ ] Admin clicks "✗ Reject"
- [ ] Admin enters rejection reason
- [ ] Tutor sees course in "Rejected" tab with reason
- [ ] Tutor can edit course and resubmit

---

## 🔑 Key Database Fields

**When tracking submissions/approvals:**

```
published_at    → When tutor submitted (timestamp)
approved_at     → When admin approved (timestamp)
approved_by     → Which admin approved (user id)
rejected_at     → When admin rejected (timestamp)
rejected_by     → Which admin rejected (user id)
rejection_reason → Why it was rejected (text)
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `/src/app/tutor/courses/new/page.tsx` | Create course (draft status) |
| `/src/app/tutor/courses/[courseId]/edit/page.tsx` | Edit lessons/milestones |
| `/src/app/tutor/dashboard/page.tsx` | Submit course for approval |
| `/src/app/admin/courses/page.tsx` | Admin review & approve/reject |
| `/src/lib/supabase.ts` | Supabase client |

---

## ⚡ Recent Improvements

✅ Removed debug console logs from admin page
✅ Cleaned up debug UI section  
✅ Removed "Status in DB" from course card display
✅ Kept core filtering logic: `filter='pending'` → `status='published'`
