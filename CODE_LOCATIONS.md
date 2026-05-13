# Code Location Reference: Course Submission System

## 📍 Exact Line References

### TUTOR: Submit Course for Approval

**File:** `src/app/tutor/dashboard/page.tsx`

**Line 62-88:** The `updateCourseStatus` function that changes status to 'published'

```tsx
const updateCourseStatus = async (courseId: string, newStatus: Course["status"]) => {
  setUpdatingCourseId(courseId);
  
  const { error } = await supabase
    .from("courses")
    .update({ status: newStatus })
    .eq("id", courseId);

  if (!error) {
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId
          ? { ...course, status: newStatus }
          : course
      )
    );
    
    if (newStatus === "published") {
      alert("Course submitted for admin approval. You'll be notified once reviewed.");
    }
  } else {
    console.error("Error updating course status:", error);
    alert("Failed to update course status. Please try again.");
  }

  setUpdatingCourseId(null);
};
```

**Line 293:** The button that calls this function

```tsx
onClick={() => updateCourseStatus(course.id, "published")}
```

---

### TUTOR: Create Initial Draft Course

**File:** `src/app/tutor/courses/new/page.tsx`

**Line 16-28:** Creating course with `status: "draft"`

```tsx
const createCourse = async () => {
  if (!title) return;

  setLoading(true);

  const { error } = await supabase.from("courses").insert([
    {
      title,
      description,
      tutor_id: user?.id,
      status: "draft",  // ← Initial status
    },
  ]);

  setLoading(false);

  if (!error) {
    router.push("/tutor/dashboard");
  } else {
    alert("Error creating course");
  }
};
```

---

### TUTOR: Edit Course Content

**File:** `src/app/tutor/courses/[courseId]/edit/page.tsx`

**Line 80-130:** Loading lessons

```tsx
const loadCourseItems = async () => {
  if (!courseId) return;
  setLoading(true);

  try {
    const { data: lessons, error: lessonsError } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("display_order", { ascending: true });

    if (lessonsError) throw lessonsError;

    const { data: milestones, error: milestonesError } = await supabase
      .from("milestones")
      .select("*")
      .eq("course_id", courseId)
      .order("display_order", { ascending: true });

    if (milestonesError) throw milestonesError;

    // Combine and sort items
    const combinedItems: CourseItem[] = [
      ...(lessons || []).map((lesson: Lesson) => ({
        type: 'lesson' as const,
        id: lesson.id,
        data: lesson,
        display_order: lesson.display_order,
      })),
      ...(milestones || []).map((milestone: Milestone) => ({
        type: 'milestone' as const,
        id: milestone.id,
        data: milestone,
        display_order: milestone.display_order,
      })),
    ].sort((a, b) => a.display_order - b.display_order);

    setItems(combinedItems);
  } catch (error) {
    console.error("Error loading course items:", error);
    alert("Failed to load course content");
  } finally {
    setLoading(false);
  }
};
```

**Line 193-242:** Saving lessons

```tsx
const saveLesson = async () => {
  if (!title) {
    alert("Please enter a lesson title");
    return;
  }

  try {
    const formattedMeetingDate = formatDateForDatabase(meetingDate);
    
    const lessonData = {
      title,
      content,
      video_url: video || null,
      meeting_link: meetingLink || null,
      meeting_date: formattedMeetingDate,
      meeting_platform: meetingPlatform || null,
    };

    if (selected && selected.type === 'lesson') {
      // Update existing lesson
      const { data, error } = await supabase
        .from("lessons")
        .update(lessonData)
        .eq("id", selected.id)
        .select();

      if (error) throw error;
      // ... update state
    } else {
      // Create new lesson
      const display_order = items.length;
      const { data, error } = await supabase
        .from("lessons")
        .insert([
          {
            course_id: courseId,
            ...lessonData,
            display_order,
          },
        ])
        .select();

      if (error) throw error;
      // ... update state
    }

    resetForm();
  } catch (err) {
    console.error("Error saving lesson:", err);
    alert(`Failed to save lesson: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
};
```

---

### ADMIN: Fetch Published Courses

**File:** `src/app/admin/courses/page.tsx`

**Line 36-96:** The `fetchCourses` function with filters

```tsx
const fetchCourses = useCallback(async () => {
  setLoading(true);
  
  // First fetch courses based on filter
  let query = supabase
    .from('courses')
    .select('*');

  // Apply filter
  if (filter === 'pending') {
    query = query.eq('status', 'published');  // ← FETCH PUBLISHED COURSES
  } else if (filter === 'active') {
    query = query.eq('status', 'active');
  }
  // If filter is 'all', no status filter applied

  const { data: coursesData, error: coursesError } = await query.order('created_at', { ascending: false });

  if (coursesError) {
    console.error('Error fetching courses:', coursesError);
    setLoading(false);
    return;
  }

  if (!coursesData || coursesData.length === 0) {
    setCourses([]);
    setLoading(false);
    return;
  }

  // Fetch tutor information separately for each course
  const coursesWithTutors = await Promise.all(
    coursesData.map(async (course) => {
      // Fetch tutor profile from user_profiles
      const { data: tutorData, error: tutorError } = await supabase
        .from('user_profiles')
        .select('full_name, email')
        .eq('id', course.tutor_id)
        .single();

      if (tutorError) {
        return {
          ...course,
          tutor_name: 'Unknown Tutor',
          tutor_email: 'No email available'
        };
      }

      return {
        ...course,
        tutor_name: tutorData?.full_name || 'Unknown Tutor',
        tutor_email: tutorData?.email || 'No email available'
      };
    })
  );

  setCourses(coursesWithTutors);
  setLoading(false);
}, [filter]);
```

**Key Line 48:**
```tsx
query = query.eq('status', 'published');
```
This is where the admin fetches courses submitted by tutors!

---

### ADMIN: Approve Course

**File:** `src/app/admin/courses/page.tsx`

**Line 135-150:** The `approveCourse` function

```tsx
const approveCourse = async (courseId: string) => {
  setActionLoading(true);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from('courses')
    .update({ 
      status: 'active',                                    // ← APPROVED!
      approved_at: new Date().toISOString(),
      approved_by: user?.id,
      rejected_at: null,
      rejected_by: null,
      rejection_reason: null
    })
    .eq('id', courseId);

  if (!error) {
    await fetchCourses();
    setShowModal(false);
    setSelectedCourse(null);
    alert('✅ Course has been approved and is now active!');
  } else {
    console.error('Approval error:', error);
    alert('Error approving course: ' + error.message);
  }
  
  setActionLoading(false);
};
```

---

### ADMIN: Reject Course

**File:** `src/app/admin/courses/page.tsx`

**Line 153-177:** The `rejectCourse` function

```tsx
const rejectCourse = async (courseId: string) => {
  const reason = prompt('Please provide a reason for rejection:');
  if (!reason) return;

  setActionLoading(true);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from('courses')
    .update({ 
      status: 'rejected',                                  // ← REJECTED!
      rejection_reason: reason,
      rejected_at: new Date().toISOString(),
      rejected_by: user?.id,
      approved_at: null,
      approved_by: null
    })
    .eq('id', courseId);

  if (!error) {
    await fetchCourses();
    setShowModal(false);
    setSelectedCourse(null);
    alert('❌ Course has been rejected.');
  } else {
    console.error('Rejection error:', error);
    alert('Error rejecting course: ' + error.message);
  }
  
  setActionLoading(false);
};
```

---

### ADMIN: Filter Tabs UI

**File:** `src/app/admin/courses/page.tsx`

**Line 214-246:** The three filter buttons

```tsx
<button
  onClick={() => setFilter('pending')}
  className={`${
    filter === 'pending'
      ? 'border-blue-500 text-blue-600'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
>
  Pending Approval
  {pendingCount > 0 && (
    <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
      {pendingCount}
    </span>
  )}
</button>

<button
  onClick={() => setFilter('active')}
  className={`...`}
>
  Active Courses
</button>

<button
  onClick={() => setFilter('all')}
  className={`...`}
>
  All Courses
</button>
```

---

### ADMIN: Course Card Display

**File:** `src/app/admin/courses/page.tsx`

**Line 258-306:** Course card grid showing pending courses

```tsx
<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
  {courses.map((course) => (
    <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
      {course.thumbnail_url && (
        <div className="h-48 bg-gray-200 relative">
          <Image 
            src={course.thumbnail_url} 
            alt={course.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {course.title}
          </h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(course.status)}`}>
            {getStatusText(course.status)}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tutor:</span>
            <span className="font-medium text-gray-900">{course.tutor_name || 'N/A'}</span>
          </div>
          {/* More course details */}
        </div>
        <button
          onClick={() => viewCourseDetails(course)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {course.status === 'published' ? 'Review Course' : 'View Details'}
        </button>
      </div>
    </div>
  ))}
</div>
```

---

### ADMIN: Course Details Modal

**File:** `src/app/admin/courses/page.tsx`

**Line 340-420:** Modal showing course details and approval/rejection buttons

```tsx
{showModal && selectedCourse && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      {/* Modal content */}
      
      {selectedCourse.status === 'published' && (
        <div className="flex space-x-4 pt-4">
          <button
            onClick={() => approveCourse(selectedCourse.id)}
            disabled={actionLoading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {actionLoading ? 'Processing...' : '✓ Approve & Activate'}
          </button>
          <button
            onClick={() => rejectCourse(selectedCourse.id)}
            disabled={actionLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {actionLoading ? 'Processing...' : '✗ Reject'}
          </button>
        </div>
      )}
    </div>
  </div>
)}
```

---

## 📊 State Variables Tracking

**In `fetchCourses`:**
- `setLoading(true)` - Show loading state
- `setCourses(coursesWithTutors)` - Store fetched courses
- `setLoading(false)` - Hide loading state

**In `approveCourse` / `rejectCourse`:**
- `setActionLoading(true)` - Disable buttons during action
- `await fetchCourses()` - Refresh the list
- `setShowModal(false)` - Close the modal
- `setSelectedCourse(null)` - Clear selection
- `setActionLoading(false)` - Re-enable buttons

---

## 🔄 The Complete Flow

```
1. TUTOR creates course
   File: tutor/courses/new/page.tsx
   Status: draft

2. TUTOR adds lessons
   File: tutor/courses/[courseId]/edit/page.tsx
   Status: still draft

3. TUTOR submits for approval
   File: tutor/dashboard/page.tsx (Line 293)
   Status: draft → published
   
4. ADMIN fetches published courses
   File: admin/courses/page.tsx (Line 48)
   Query: status = 'published'
   
5. ADMIN approves or rejects
   File: admin/courses/page.tsx
   - Approve: published → active
   - Reject: published → rejected

6. TUTOR sees result
   File: tutor/dashboard/page.tsx
   - Active: visible to students
   - Rejected: can resubmit
```
