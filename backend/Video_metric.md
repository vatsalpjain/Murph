# Video Metrics & Pricing Integration Guide

## Murph Learning Platform - Architecture & Integration Strategy

**Stack:** React + Vite + Tailwind + TypeScript | FastAPI Backend | Supabase Database

> **Purpose:** This document guides IDE AI assistants on how to integrate video metrics tracking, real-time pricing, and payment settlement into existing incomplete systems without breaking them.

---

## 📁 PROJECT STRUCTURE CONVENTIONS

### **Frontend Structure (React + Vite + TS)**

```
src/
├── components/
│   ├── video/              # All video player related components
│   ├── session/            # Session lifecycle components
│   └── payment/            # Payment UI components
├── hooks/                  # Custom React hooks for state logic
├── services/               # API communication layer
├── types/                  # TypeScript type definitions
└── utils/                  # Pure functions (calculations, formatting)
```

### **Backend Structure (FastAPI)**

```
app/
├── api/routes/            # API endpoint definitions
├── services/              # Business logic layer
├── models/                # Pydantic models
└── core/                  # Config, database clients
```

### **Integration Principle**

* **Respect existing file structure** - Don't reorganize what's already there
* **Extend, don't replace** - Add new files alongside existing ones
* **Use existing patterns** - Match naming conventions, import styles
* **Fail gracefully** - Handle cases where features might be partially implemented

---

## 🎯 CORE INTEGRATION FLOW (HIGH-LEVEL)

### **Phase 1: Session Lifecycle**

```
User Journey:
1. Student selects course → System locks funds ($30 via Finternet Gateway)
2. Session created in DB with status='locked'
3. Student clicks "Start Learning" → status changes to 'active', start_time recorded
4. Student watches video → Metrics tracked every 5 seconds
5. Student clicks "End Session" → Final settlement, refund unused balance
```

### **Phase 2: Real-Time Metrics Tracking**

```
While Video Playing:
- Track elapsed time (duration_seconds)
- Calculate which lecture student is on (based on video timestamp)
- Calculate completion percentage
- Update price in real-time: (duration_seconds / 60) * price_per_minute
- Send batch updates to backend every 5 seconds
```

### **Phase 3: Payment Calculation & Settlement**

```
On Session End:
1. Calculate: final_cost = (total_duration_seconds / 60) * price_per_minute
2. Calculate: refund_amount = locked_amount - final_cost
3. Backend calls Finternet Gateway to settle
4. Update DB: amount_paid, amount_refunded, payment_tx_id
5. Update teacher's total_earnings
6. Show summary to student
```

---

## 🧩 KEY COMPONENTS TO BUILD

### **1. Video Player System**

**Purpose:** Play video, track time, detect current lecture, handle play/pause

**Key Responsibilities:**

* Render HTML5 `<video>` element with controls
* Track `currentTime` from video element
* Map video timestamp to lecture number (using course.content_structure)
* Emit events: onPlay, onPause, onTimeUpdate, onEnded
* Display overlay with current cost and lecture info

**Integration Points:**

* Receives `sessionId`, `courseId`, `videoUrl`, `pricePerMinute` as props
* Calls `useVideoMetrics` hook to track and persist data
* Calls `usePriceCalculation` hook for real-time cost display

**UI Requirements:**

* Tailwind classes for responsive design
* Overlay showing: current lecture, time elapsed, current cost
* Controls: Play/Pause, End Session button (always visible)

---

### **2. Video Metrics Hook (useVideoMetrics)**

**Purpose:** Track video playback time and progress, sync to backend

**Key Responsibilities:**

* Start interval timer when video plays (every 5 seconds)
* Accumulate `duration_seconds` (don't rely on video.currentTime - student might seek)
* Calculate `completion_pct` from video.currentTime / video.duration
* Determine `current_lecture` by comparing currentTime to lecture timestamps
* Batch updates to backend API

**State Managed:**

* `durationSeconds` (total billable time)
* `currentLecture` (lecture ID/number)
* `completionPct` (0-100)
* `isTracking` (boolean)

**API Calls:**

* `PATCH /api/sessions/{sessionId}/metrics` every 5 seconds

**Edge Cases:**

* Handle pause/resume without duplicating time
* Handle page refresh (resume from last saved duration_seconds)
* Handle seeking backward (don't decrease duration_seconds)
* Handle network failures (retry with exponential backoff)

---

### **3. Price Calculation Utilities**

**Purpose:** Pure functions to calculate costs accurately

**Key Functions:**

```
calculateCurrentCost(durationSeconds, pricePerMinute)
  → Returns: number (e.g., 7.69)
  → Formula: (durationSeconds / 60) * pricePerMinute
  → Round to 2 decimal places

calculateRefund(lockedAmount, finalCost)
  → Returns: number
  → Formula: lockedAmount - finalCost
  → Ensure refund >= 0

formatCurrency(amount)
  → Returns: string (e.g., "$7.69")
  
formatDuration(seconds)
  → Returns: string (e.g., "15m 23s")
```

**Integration:**

* Import in `usePriceCalculation` hook
* Import in summary/breakdown components
* Used by backend for validation

---

### **4. Session Management Service (Frontend)**

**Purpose:** API calls for session CRUD operations

**Key Methods:**

```
createSession(courseId, studentId, lockedAmount)
  → POST /api/sessions
  → Returns: { session_id, status, locked_amount }

startSession(sessionId)
  → PATCH /api/sessions/{sessionId}/start
  → Sets status='active', start_time=now()

updateMetrics(sessionId, metrics)
  → PATCH /api/sessions/{sessionId}/metrics
  → Updates duration_seconds, content_progress

endSession(sessionId)
  → POST /api/sessions/{sessionId}/end
  → Returns: { final_cost, amount_refunded, payment_tx_id }
```

**HTTP Client:**

* Use existing Axios/Fetch instance if present
* Add request interceptors for auth tokens
* Handle errors with user-friendly messages

---

### **5. Backend Session Service (FastAPI)**

**Purpose:** Business logic for session operations

**Key Methods:**

```
async create_session(course_id, student_id, locked_amount) -> Session:
  - Validate course exists and is active
  - Get teacher_id from course
  - Insert into sessions table with status='locked'
  - Return session object

async start_session(session_id, user_id) -> Session:
  - Verify session belongs to user
  - Check status is 'locked'
  - Update status='active', start_time=now()
  - Return updated session

async update_metrics(session_id, metrics: MetricsUpdate) -> Session:
  - Verify session is 'active'
  - Update duration_seconds, content_progress
  - Calculate and update final_cost
  - Return updated session

async end_session(session_id, user_id) -> SettlementResult:
  - Verify session belongs to user and is 'active'
  - Calculate final_cost = (duration_seconds / 60) * price_per_minute
  - Calculate refund = locked_amount - final_cost
  - Call Finternet Gateway: settle_payment()
  - Update session: status='completed', end_time, amounts
  - Create payment record
  - Update teacher earnings
  - Return settlement details
```

**Database Operations:**

* Use Supabase service role client (bypass RLS)
* Use transactions for payment settlement
* Update teacher.total_earnings atomically

**Integration with Existing Backend:**

* Add new routes to existing router or create new router
* Reuse existing Supabase client initialization
* Follow existing error handling patterns (HTTPException)

---

## 📊 DATABASE INTEGRATION STRATEGY

### **Tables to Update**

**`sessions` table:**

* **On session start:** INSERT with status='locked'
* **On video play:** UPDATE status='active', start_time
* **Every 5 sec:** UPDATE duration_seconds, content_progress, final_cost
* **On session end:** UPDATE status='completed', end_time, amount_paid, amount_refunded

**`payments` table:**

* **On settlement:** INSERT payment record with session_id, amounts, tx_ids

**`teachers` table:**

* **On settlement:** UPDATE total_earnings += amount_paid
* **On settlement:** UPDATE total_sessions_completed += 1

### **Key Fields to Track**

**In `sessions.content_progress` (JSONB):**

```json
{
  "stopped_at_lecture": 2,
  "completion_pct": 25.4,
  "last_position_seconds": 305,
  "lecture_progress": [
    {"lecture_id": 1, "watched_seconds": 180, "completed": true},
    {"lecture_id": 2, "watched_seconds": 125, "completed": false}
  ]
}
```

**Calculation Logic:**

* Map video.currentTime to lecture using course.content_structure
* Example: If lectures are [10min, 15min, 20min] and currentTime=900s (15min), student is in lecture 2

---

## 🔄 REAL-TIME UPDATES (OPTIONAL ENHANCEMENT)

**Use Supabase Realtime Subscriptions:**

```
Frontend subscribes to:
  - `sessions` table WHERE id = sessionId
  - Listen for changes to: duration_seconds, final_cost, status
  
Teacher Dashboard subscribes to:
  - `sessions` table WHERE teacher_id = teacherId AND status='active'
  - See live student sessions
```

**Benefits:**

* Teacher sees earnings accumulate in real-time
* Student sees cost update even if metrics sync is delayed
* Admin dashboard can monitor active sessions

**Implementation:**

* Use `supabase.channel()` API
* Handle reconnection on network failures
* Unsubscribe on component unmount

---

## 🛡️ ERROR HANDLING STRATEGIES

### **Frontend Resilience**

```
Scenario: Backend API call fails
  → Retry 3 times with exponential backoff
  → Queue metrics updates locally
  → Sync when connection restored
  → Show warning banner "Syncing data..."

Scenario: Video fails to load
  → Show error message
  → Allow session cancellation with full refund
  → Don't charge for time before video starts

Scenario: Page refresh during active session
  → On mount: Fetch session from DB
  → Resume from last saved duration_seconds
  → Continue tracking seamlessly
```

### **Backend Validation**

```
Scenario: duration_seconds decreases
  → Reject update, log warning
  → Return current state to frontend

Scenario: Session already completed
  → Return 400 error: "Session already ended"
  → Frontend redirects to summary

Scenario: Payment gateway fails
  → Rollback session status
  → Retry settlement up to 3 times
  → Mark session as 'failed' if all retries fail
  → Alert admin for manual resolution
```

---

## 💰 PRICING ACCURACY REQUIREMENTS

### **Critical Precision Rules**

* Use `DECIMAL(12, 6)` in database (not FLOAT)
* Always round to 2 decimal places for display
* Calculate in cents/smallest unit to avoid floating point errors
* Example: Store 7.692583 in DB, display as $7.69

### **Price Calculation Formula**

```
Pseudocode:
  total_seconds = sum of all 5-second tracking intervals
  total_minutes = total_seconds / 60.0
  final_cost = total_minutes * price_per_minute
  final_cost_rounded = round(final_cost, 2)
```

### **Refund Calculation**

```
Pseudocode:
  refund = locked_amount - final_cost
  if refund < 0:
    refund = 0  # Student used more than locked (shouldn't happen if lock is sufficient)
    alert_admin()
```

---

## 🔌 INTEGRATION WITH EXISTING SYSTEMS

### **Scenario 1: Existing Video Player**

```
If system already has video player component:
  → Wrap it with metrics tracking hooks
  → Add event listeners: onPlay → startTracking, onPause → stopTracking
  → Inject PriceMeter overlay as sibling component
  → Don't replace entire player - extend it
```

### **Scenario 2: Existing Session Logic**

```
If system already manages sessions:
  → Add metrics tracking to existing session state
  → Extend existing session service with metrics endpoints
  → Add duration_seconds, content_progress to existing session model
  → Keep existing session creation/end logic, add metrics updates
```

### **Scenario 3: No Existing Implementation**

```
Build from scratch following this structure:
  → Start with types (session.types.ts, course.types.ts)
  → Build utils (priceCalculator.ts)
  → Build hooks (useVideoMetrics, usePriceCalculation)
  → Build services (session.service.ts)
  → Build components (VideoPlayer, PriceMeter)
  → Wire up backend routes
```

---

## 🧪 TESTING STRATEGY

### **Frontend Tests**

```
Test: useVideoMetrics hook
  - Mock video element with currentTime
  - Verify duration_seconds increments every 5 seconds
  - Verify API calls are batched correctly
  - Verify pause stops tracking

Test: Price calculation utilities
  - Test edge cases: 0 seconds, very long duration
  - Verify rounding to 2 decimals
  - Verify refund calculation

Test: VideoPlayer component
  - Simulate play/pause/end session
  - Verify metrics hook is called
  - Verify UI updates correctly
```

### **Backend Tests**

```
Test: Session service
  - Test create_session with invalid course_id
  - Test start_session with wrong user_id
  - Test update_metrics with decreasing duration (should reject)
  - Test end_session calculates costs correctly

Test: Payment settlement
  - Mock Finternet Gateway responses
  - Verify teacher earnings updated
  - Verify payment record created
  - Verify session marked as completed
```

---

## 📝 IMPLEMENTATION CHECKLIST

### **Phase 1: Setup (1-2 hours)**

* [ ] Create type definitions for Session, Metrics, Course
* [ ] Set up Supabase client in frontend and backend
* [ ] Create price calculation utility functions
* [ ] Write tests for price calculations

### **Phase 2: Backend API (2-3 hours)**

* [ ] Create session routes: POST /sessions, PATCH /sessions/:id/start
* [ ] Create metrics route: PATCH /sessions/:id/metrics
* [ ] Create end route: POST /sessions/:id/end
* [ ] Implement session service methods
* [ ] Add database update logic
* [ ] Test with Postman/curl

### **Phase 3: Frontend Core (3-4 hours)**

* [ ] Build useVideoMetrics hook with 5-second interval
* [ ] Build usePriceCalculation hook
* [ ] Create session service (API calls)
* [ ] Test hooks in isolation

### **Phase 4: UI Components (2-3 hours)**

* [ ] Build VideoPlayer component with HTML5 video
* [ ] Build PriceMeter overlay component
* [ ] Build VideoControls component
* [ ] Build SessionSummary component (end screen)
* [ ] Style with Tailwind

### **Phase 5: Integration & Testing (2-3 hours)**

* [ ] Wire VideoPlayer to session page
* [ ] Test full flow: lock funds → play → pause → resume → end
* [ ] Test edge cases: page refresh, network failure, video seek
* [ ] Verify DB updates correctly
* [ ] Verify pricing accuracy

### **Phase 6: Polish (1-2 hours)**

* [ ] Add loading states
* [ ] Add error messages
* [ ] Add success confirmations
* [ ] Add real-time updates (optional)
* [ ] Mobile responsive testing

---

## 🚨 CRITICAL GOTCHAS TO AVOID

### **1. Time Tracking Accuracy**

❌ **DON'T:** Use `video.currentTime` as duration_seconds

* Student can seek backward, making time decrease

✅ **DO:** Accumulate time in 5-second intervals based on actual playback

* `duration_seconds += 5` every interval while playing

### **2. Floating Point Errors**

❌ **DON'T:** Use JavaScript `number` for prices

* 0.1 + 0.2 = 0.30000000000000004

✅ **DO:** Use integer cents or backend validation

* Frontend calculates for display only
* Backend calculates authoritative final_cost

### **3. Race Conditions**

❌ **DON'T:** Send metrics updates on every video.onTimeUpdate (fires 4x per second)

✅ **DO:** Debounce/batch updates every 5 seconds

### **4. Session State Sync**

❌ **DON'T:** Rely only on frontend state for duration_seconds

✅ **DO:** Always fetch from DB on page load to resume correctly

### **5. Payment Security**

❌ **DON'T:** Trust frontend calculations for final settlement

✅ **DO:** Backend recalculates final_cost from DB duration_seconds before payment

---

## 🎓 LEARNING RESOURCES

**Supabase Realtime:**

* https://supabase.com/docs/guides/realtime

**React Video Tracking:**

* HTML5 Video API events: `onPlay`, `onPause`, `onTimeUpdate`, `onEnded`
* Use `useRef` to access video element

**FastAPI Database:**

* Supabase Python client: https://supabase.com/docs/reference/python
* Use service role key for backend operations

**Payment Precision:**

* Always use DECIMAL for money
* Round display values, not stored values

---

## 💡 EXAMPLE USER FLOW (END-TO-END)

```
1. Student browses courses → Clicks "Start Learning: Guitar Basics"

2. System checks:
   - Student has sufficient wallet balance ($30+)
   - Course is active and available

3. Payment lock initiated:
   - Frontend: POST /api/sessions { course_id, student_id, locked_amount: 30 }
   - Backend: Calls Finternet Gateway lock_funds()
   - Backend: Creates session with status='locked'
   - Response: { session_id: "abc-123" }

4. Student clicks "Begin Session":
   - Frontend: PATCH /api/sessions/abc-123/start
   - Backend: Updates status='active', start_time='2026-02-05T10:30:00Z'
   - Frontend: Navigates to VideoPlayer component

5. VideoPlayer loads:
   - Fetches course details (lectures, price_per_minute)
   - Displays video at lecture 1
   - Shows initial cost: $0.00, Time: 0:00

6. Student presses Play:
   - useVideoMetrics hook starts 5-second interval
   - Every 5 seconds:
     * duration_seconds += 5
     * currentLecture calculated from video.currentTime
     * completion_pct = (currentTime / totalDuration) * 100
     * current_cost = (duration_seconds / 60) * 0.50
     * API call: PATCH /api/sessions/abc-123/metrics { duration_seconds: 5, content_progress: {...} }
   
   Display updates:
   - At 5 sec: Cost: $0.04, Time: 0:05
   - At 300 sec (5 min): Cost: $2.50, Time: 5:00, Lecture: 2
   - At 900 sec (15 min): Cost: $7.50, Time: 15:00, Lecture: 3

7. Student pauses at 15min 23sec:
   - Interval cleared
   - Final metrics sent: { duration_seconds: 923, ... }
   - Video paused, cost frozen at $7.69

8. Student resumes (optional):
   - Interval restarted
   - Continues from duration_seconds=923

9. Student clicks "End Session":
   - Frontend: POST /api/sessions/abc-123/end
   - Backend:
     * Fetches session from DB (duration_seconds: 923)
     * Calculates final_cost = (923 / 60) * 0.50 = 7.692 → $7.69
     * Calculates refund = 30.00 - 7.69 = $22.31
     * Calls Finternet Gateway: settle_payment(7.69, 22.31)
     * Updates session: status='completed', amount_paid=7.69, amount_refunded=22.31
     * Creates payment record
     * Updates teacher earnings: total_earnings += 7.69
   - Response: { final_cost: 7.69, refund: 22.31, payment_tx_id: "tx_xyz" }
   
10. Frontend shows SessionSummary:
    ```
    Session Complete!
  
    Time Watched: 15m 23s
    Content Progress: 3 of 4 lectures (76%)
  
    Payment Breakdown:
    - Amount Locked: $30.00
    - Amount Charged: $7.69
    - Amount Refunded: $22.31
  
    Thank you for learning!
    ```
```

---

## 🎯 SUCCESS CRITERIA

**System is working correctly when:**

* ✅ Student can start/pause/resume/end session without bugs
* ✅ Time tracking is accurate (no duplicates, no decreases)
* ✅ Price calculation matches: (duration_seconds / 60) * price_per_minute
* ✅ Refund is correct: locked_amount - final_cost
* ✅ Teacher receives payment immediately after session ends
* ✅ Database reflects all state changes correctly
* ✅ Page refresh during session allows seamless continuation
* ✅ Multiple sessions can run simultaneously for different students
* ✅ All monetary values are precise (no floating point errors)

---

**End of Guide** - Use this as context for building any component in the video metrics system.
