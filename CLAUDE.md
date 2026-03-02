# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue 3 admin dashboard for user management, session monitoring, API usage statistics, and custom data management. Built with Vite, Element Plus, and Pinia.

## Development Commands

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production (outputs to dist/ with single admin.js/admin.css)
npm run build

# Preview production build
npm run preview
```

## Architecture

### API Layer (`src/axios.js` + `src/api/`)

**Critical**: All API calls MUST use the unified axios instance from `src/axios.js`. This instance includes:
- Automatic JWT token refresh when expiring
- 401 error handling with token retry
- Unified error messages via ElMessage
- Base URL: `window.ADMIN_BASE` (https://dialects.yzup.top/admin)

**API Modules** (all in `src/api/`):
- `user.js` - User management (getAll, getAllUsers, create, update, delete, getStats)
- `custom.js` - Custom data CRUD (getAll, getUserData, create, update, delete, getDataCounts)
- `userSession.js` - Session management (listSessions, getSessionDetail, revokeSession, etc.)
- `analytics.js` - API usage analysis (getApiUsage, getApiChart, getApiSummary, getApiDetail)
- `ip.js` - IP geolocation (queryIP)
- `stats.js` - Statistics (getUserStats, getDataCounts, getStatsQuery, getSuccessLoginLogs)
- `index.js` - Unified exports for all API modules

When creating new API modules:
1. Import `api` from `../axios.js`
2. Return `api.get/post/put/delete(...).then(res => res.data)`
3. Never create separate axios instances
4. Export from `src/api/index.js` for centralized imports

Example:
```javascript
import api from '../axios.js';

export const myAPI = {
  getAll() {
    return api.get('/endpoint').then(res => res.data);
  }
};
```

**Importing APIs in components:**
```javascript
import { userAPI, customAPI, analyticsAPI } from '@/api/index';
// or
import { userAPI } from '../api/index';
```

### Authentication Flow

Token management is handled by `src/utils/auth.js`:
- Access token stored in localStorage as `access_token`
- Refresh token stored as `refresh_token`
- `isTokenExpiringSoon()` checks if token expires within 5 minutes
- `refreshAccessToken()` automatically refreshes using refresh token
- Router guard in `src/router/index.js` initializes user info from cache or API

**User info caching**: User data is cached in localStorage (`user_cache`) to avoid repeated `/auth/me` calls. Cache is cleared on logout via `window.__resetUserInfoCache()`.

### Router Structure

Routes are defined in `src/router/index.js` with:
- `meta: { requiresAuth: true }` for protected routes
- Global `beforeEach` guard handles authentication
- User info initialization happens once per session

New session management routes (recently added):
- `/user-sessions/:userId` - UserSessionManagement (user-specific sessions)
- `/sessions/global` - GlobalSessionManagement (admin view)
- Old routes `/sessions` and `/sessions/user` kept for backward compatibility

### Component Organization

```
src/components/
├── UserManagement.vue          # Main entry point
├── Login.vue                   # Authentication
├── user/                       # User-related features
│   ├── UserStats.vue          # API usage statistics only
│   ├── ApiDetail.vue          # API call details
│   ├── ApiChart.vue           # Chart.js visualizations
│   └── IPQuery.vue            # Leaflet map for IP geolocation
├── custom/                     # Custom data CRUD
│   └── CustomPerUser.vue      # Per-user data view
└── session/                    # Session management
    ├── UserSessionManagement.vue    # NEW: User session view with stats
    ├── GlobalSessionManagement.vue  # NEW: Admin global session view
    ├── SessionManagement.vue        # OLD: RefreshToken management
    └── UserSessions.vue             # OLD: Legacy user sessions
```

### Session Management System (New)

The session management system was recently refactored to use the new `/admin/user-sessions/*` API:

**API Module** (`src/api/userSession.js`):
- Uses unified axios instance from `src/axios.js`
- 9 endpoints: listSessions, getSessionDetail, getSessionActivity, revokeSession, revokeBulk, revokeUserSessions, flagSession, getStats, getUserHistory

**UserSessionManagement.vue**:
- Displays user statistics (login count, failed attempts, register IP, online duration, last login)
- Session list with filtering (show revoked, suspicious only)
- Recent login IP statistics
- Actions: revoke session, revoke all sessions
- Uses `query_green.ico` icon from assets

**GlobalSessionManagement.vue**:
- Admin dashboard with 8 stat cards
- Advanced filtering (username, IP, suspicious status, revoked status, sorting)
- Batch operations (bulk revoke)
- Pagination support

### State Management (Pinia)

Stores in `src/stores/`:
- `user.js` - User list, CRUD operations
- `custom.js` - Custom data, selected items state

**Important**: Use Pinia stores for component data sharing instead of localStorage. Example:
```javascript
// Sending component
this.customStore.setSelectedUsers(this.selectedUsers);
this.$router.push({ name: 'TargetPage' });

// Receiving component
const selectedUsers = this.customStore.selectedUsers;
```

### Build Configuration

Vite config (`vite.config.js`) produces single-file output:
- `admin.js` - All JavaScript bundled into one file
- `admin.css` - All styles bundled into one file
- Base path: `/admin/`
- `inlineDynamicImports: true` ensures no code splitting

### Styling System

**Global CSS Variables** (`src/styles/variables.css`):
- Apple green theme colors: `--color-primary`, `--color-primary-dark`, `--color-primary-light`
- Background colors: `--color-background`, `--color-background-white`
- Border colors: `--color-border`, `--color-border-light`
- Status colors: `--color-success`, `--color-warning`, `--color-danger`
- Spacing: `--spacing-xs` to `--spacing-xl`
- Border radius: `--radius-sm` to `--radius-xl`
- Shadows: `--shadow-sm` to `--shadow-xl`

**Common Styles** (`src/styles/common.css`):
- Button classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`
- Table styles: `.table-container`, automatic styling for `<table>`, `<th>`, `<td>`
- Form styles: `.form-group`, `.form-label`, `.form-input`
- Search input: `.search-input`
- Pagination: `.pagination`, `.pagination-btn`
- Stats card: `.stats-card`
- Utility classes: `.text-center`, `.mt-md`, `.mb-lg`, `.p-sm`, etc.

**Usage:**
```vue
<button class="btn btn-primary">按鈕</button>
<div class="stats-card">
  <div class="number" style="color: var(--color-primary)">123</div>
  <div class="label">標籤</div>
</div>
```

### Common Components

**Location:** `src/components/common/`

**BasePagination** - Reusable pagination:
```vue
<BasePagination
  :current-page="currentPage"
  :total-pages="totalPages"
  :page-size="pageSize"
  @page-change="handlePageChange"
/>
```

**BaseSearchInput** - Search input with v-model:
```vue
<BaseSearchInput
  v-model="searchQuery"
  placeholder="搜索..."
  @update:modelValue="handleSearch"
/>
```

**BaseTable** - Sortable table with slots:
```vue
<BaseTable
  :columns="columns"
  :data="tableData"
  :loading="loading"
  @sort="handleSort"
>
  <template #cell-username="{ value }">
    <strong>{{ value }}</strong>
  </template>
  <template #actions="{ row }">
    <button @click="edit(row)">編輯</button>
  </template>
</BaseTable>
```

**StatsCard** - Statistics display:
```vue
<StatsCard
  :number="1234"
  label="活躍用戶"
  color="var(--color-primary)"
/>
```

**Import:**
```javascript
import { BasePagination, BaseSearchInput, BaseTable, StatsCard } from '@/components/common';
```

## Key Patterns

### Error Handling

Axios interceptors handle most errors automatically. Components should use API modules instead of direct axios calls:
```javascript
import { userAPI } from '@/api/index';

try {
  const users = await userAPI.getAllUsers();
  this.$message.success('成功');
} catch (error) {
  // Error already shown by interceptor
  console.error(error);
}
```

### Icon Usage

Use `query_green.ico` from assets for consistency:
```javascript
import queryGreenIcon from '@/assets/query_green.ico';

// In template
<img :src="queryGreenIcon" class="header-icon" />
```

### Date Formatting

Use `toLocaleString('zh-CN')` or `toLocaleDateString('zh-CN')` for consistent Chinese date formatting.

### Component Communication

Navigation with data:
```javascript
this.$router.push({
  name: 'TargetComponent',
  params: { userId: user.id },
  query: { username: user.username }
});
```

## API Endpoints

Base: `window.ADMIN_BASE` (https://dialects.yzup.top/admin)

### User Management
- `GET /users` - List users (use `userAPI.getAll()`)
- `GET /users/all` - List all users with details (use `userAPI.getAllUsers()`)
- `POST /users/create` - Create user (use `userAPI.create()`)
- `PUT /users/update` - Update user (use `userAPI.update()`)
- `DELETE /users/delete/:username` - Delete user (use `userAPI.delete()`)
- `GET /users/stats` - User statistics (use `userAPI.getStats()`)

### Session Management
**New API** (`/user-sessions/*` - use `sessionAPI` from `userSession.js`):
- `GET /user-sessions/list` - List sessions with filtering (use `sessionAPI.listSessions()`)
- `GET /user-sessions/:sessionId` - Session detail (use `sessionAPI.getSessionDetail()`)
- `GET /user-sessions/:sessionId/activity` - Activity timeline (use `sessionAPI.getSessionActivity()`)
- `POST /user-sessions/:sessionId/revoke` - Revoke session (use `sessionAPI.revokeSession()`)
- `POST /user-sessions/revoke-bulk` - Bulk revoke (use `sessionAPI.revokeBulk()`)
- `POST /user-sessions/revoke-user/:userId` - Revoke all user sessions (use `sessionAPI.revokeUserSessions()`)
- `POST /user-sessions/:sessionId/flag` - Flag suspicious (use `sessionAPI.flagSession()`)
- `GET /user-sessions/stats` - Global statistics (use `sessionAPI.getStats()`)
- `GET /user-sessions/user/:userId/history` - User session history (use `sessionAPI.getUserHistory()`)

**Legacy API** (`/sessions/*` - also available via `sessionAPI`):
- `GET /sessions/active` - Active sessions (use `sessionAPI.getActiveSessions()`)
- `GET /sessions/user/:userId` - User sessions (use `sessionAPI.getUserSessions()`)
- `POST /sessions/cleanup-expired` - Cleanup expired (use `sessionAPI.cleanupExpired()`)

### Custom Data
- `GET /custom/all` - All custom data (use `customAPI.getAll()`)
- `GET /custom/user?query=username` - User's custom data (use `customAPI.getUserData()`)
- `POST /custom/create` - Create data (use `customAPI.create()`)
- `PUT /custom/update` - Update data (use `customAPI.update()`)
- `DELETE /custom/delete` - Delete data (use `customAPI.delete()`)
- `GET /custom/num` - Data counts (use `customAPI.getDataCounts()` or `statsAPI.getDataCounts()`)

### API Usage Analytics
- `GET /api-usage/api-usage` - API usage records (use `analyticsAPI.getApiUsage()`)
- `GET /api-usage/chart/:username` - API chart data (use `analyticsAPI.getApiChart()`)
- `GET /api-usage/stats/:username` - API stats (use `analyticsAPI.getUserApiStats()`)
- `GET /api-usage/api-summary?query=username` - API summary (use `analyticsAPI.getApiSummary()`)
- `GET /api-usage/api-detail?query=username` - API detail (use `analyticsAPI.getApiDetail()`)

### Statistics
- `GET /stats/user/:username` - User stats (use `statsAPI.getUserStats()`)
- `GET /stats/stats?query=username` - User stats query (use `statsAPI.getStatsQuery()`)
- `GET /stats/login-history/:username` - Login history (use `statsAPI.getUserLoginHistory()`)
- `GET /login-logs/success-login-logs?query=username` - Success login logs (use `statsAPI.getSuccessLoginLogs()`)

### IP Geolocation
- `GET /ip/:provider/:ip` - Query IP (use `ipAPI.queryIP(ip, provider)`)
  - Providers: `ip-api`, `ip-sb`, `nordvpn`

### Authentication
- `POST /auth/login` - Login (returns access_token + refresh_token)
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Current user info

## Important Notes

- **Always use API modules** - Import from `src/api/index.js`, never use direct axios calls
- **Never create separate axios instances** - always import from `src/axios.js` when creating new API modules
- **Token refresh is automatic** - don't manually handle 401 errors
- **User info is cached** - check `getUserCache()` before calling `/auth/me`
- **Build outputs single files** - admin.js and admin.css only
- **Language**: UI text is in Traditional Chinese (繁體中文)
- **Element Plus**: Use for all UI components (buttons, tables, forms, dialogs)

## Migration Status (2026-03-02)

**Phase 1 Complete: API Layer Unification**
- ✅ Created `analytics.js` - API usage analysis endpoints
- ✅ Created `ip.js` - IP geolocation queries
- ✅ Created `stats.js` - Statistics and login logs
- ✅ Merged `session.js` into `userSession.js` (session.js deleted)
- ✅ Updated `user.js` - Added getAllUsers(), removed deprecated methods
- ✅ Updated `custom.js` - Added getDataCounts()
- ✅ Updated `api/index.js` - Centralized exports for all modules

**Migrated Components:**
- ✅ UserManagement.vue - Now uses `userAPI.getAllUsers()` and `statsAPI.getDataCounts()`
- ✅ ApiDetail.vue - Now uses `analyticsAPI.getApiUsage()`
- ✅ IPQuery.vue - Now uses `ipAPI.queryIP()`
- ✅ UserStats.vue - Now uses `statsAPI` and `analyticsAPI`
- ✅ SessionManagement.vue - Now uses `userSessionAPI`
- ✅ UserSessions.vue - Now uses `userSessionAPI`

**Phase 2 In Progress: Component Architecture Refactoring**
- ✅ Created global CSS variables (`src/styles/variables.css`) - Apple green theme
- ✅ Created common styles (`src/styles/common.css`) - Buttons, tables, forms, pagination
- ✅ Created `src/components/common/` directory for reusable components
- ✅ Created `BasePagination.vue` - Reusable pagination component
- ✅ Created `BaseSearchInput.vue` - Reusable search input with v-model
- ✅ Created `BaseTable.vue` - Reusable table with sorting, slots, loading state
- ✅ Created `StatsCard.vue` - Reusable statistics card component
- ✅ Created `src/views/` directory structure (auth/, user/, analytics/, custom/, session/)
- ✅ Created example `UserManagementView.vue` demonstrating new components
- ✅ Imported global styles in `main.js`

**Common Components Usage:**
```javascript
import { BasePagination, BaseSearchInput, BaseTable, StatsCard } from '@/components/common';
```

**Remaining Work:**
- Migrate remaining page components to views/ directory
- Apply common components to existing components (SessionManagement, ApiDetail, etc.)
- Extract UserForm, UserTable, CustomForm components
- Phase 3: Composables for business logic (useTable, useTimeFormat, useApiStats)

