S D:\preplyte> tree src1 /f
Folder PATH listing for volume New Volume
Volume serial number is 8E25-E21E
D:\PREPLYTE\SRC1
│   middleware.ts
│   
├───app
│   │   favicon.ico
│   │   globals.css
│   │   layout.tsx
│   │   page.tsx
│   │   providers.tsx
│   │
│   ├───(auth)
│   │   │   layout.tsx
│   │   │
│   │   ├───login
│   │   │       page.tsx
│   │   │
│   │   └───register
│   │           page.tsx
│   │
│   ├───admin
│   │   │   layout.tsx
│   │   │   page.tsx
│   │   │
│   │   ├───institutes
│   │   │   │   page.tsx
│   │   │   │
│   │   │   ├───new
│   │   │   │       page.tsx
│   │   │   │
│   │   │   └───[id]
│   │   │       │   page.tsx
│   │   │       │
│   │   │       └───edit
│   │   │               page.tsx
│   │   │
│   │   ├───reports
│   │   │       page.tsx
│   │   │
│   │   └───users
│   │       │   page.tsx
│   │       │
│   │       └───new
│   │           │   page.tsx
│   │           │
│   │           └───[id]
│   │               │   page.tsx
│   │               │
│   │               ├───edit
│   │               │       page.tsx
│   │               │
│   │               └───reset-password
│   │                       page.tsx
│   │
│   ├───dashboard
│   │       page.tsx
│   │
│   └───practice
│       │   layout.tsx
│       │
│       ├───ai-interview
│       │   │   layout.tsx
│       │   │   page.tsx
│       │   │
│       │   ├───results
│       │   │   └───[sessionId]
│       │   │           page.tsx
│       │   │
│       │   └───[sessionId]
│       │           page.tsx
│       │
│       ├───aptitude
│       │   │   layout.tsx
│       │   │   page.tsx
│       │   │
│       │   ├───history
│       │   │       page.tsx
│       │   │
│       │   ├───result
│       │   │   └───[sessionId]
│       │   │           page.tsx
│       │   │
│       │   └───test
│       │       └───[sessionId]
│       │               page.tsx
│       │
│       └───machine
│           │   layout.tsx
│           │   page.tsx
│           │
│           ├───result
│           │   └───[sessionId]
│           │           page.tsx
│           │
│           └───test
│               └───[sessionId]
│                       page.tsx
│
├───components
│   │   theme-toggle.tsx
│   │
│   ├───admin
│   │   │   admin-header.tsx
│   │   │   admin-sidebar.tsx
│   │   │
│   │   ├───analytics
│   │   │       performance-cards.tsx
│   │   │       sessions-overview.tsx
│   │   │       stats-cards.tsx
│   │   │       trends-chart.tsx
│   │   │
│   │   ├───common
│   │   │       pagination.tsx
│   │   │
│   │   ├───institutes
│   │   │       institute-admins-list.tsx
│   │   │       institute-filters.tsx
│   │   │       institute-form.tsx
│   │   │       institute-list.tsx
│   │   │       institute-stats.tsx
│   │   │       institute-students-list.tsx
│   │   │
│   │   ├───reports
│   │   │       activity-report-table.tsx
│   │   │       report-card.tsx
│   │   │
│   │   └───users
│   │           user-filters.tsx
│   │           user-form.tsx
│   │           user-list.tsx
│   │           user-stats.tsx
│   │
│   ├───auth
│   │       login-form.tsx
│   │       ProtectedRoute.tsx
│   │       register-form.tsx
│   │
│   ├───dashboard
│   │       institute-admin-dashboard.tsx
│   │       platform-admin-dashboard.tsx
│   │       student-dashboard.tsx
│   │
│   ├───layout
│   │       app-header.tsx
│   │       app-layout.tsx
│   │       app-sidebar.tsx
│   │       main-nav.tsx
│   │       mobile-nav.tsx
│   │       user-menu.tsx
│   │
│   ├───practice
│   │   ├───ai-interview
│   │   │       audio-visualizer.tsx
│   │   │       interview-config-form.tsx
│   │   │       interview-results.tsx
│   │   │       interview-session.tsx
│   │   │       mic-button.tsx
│   │   │       question-progress.tsx
│   │   │       session-card.tsx
│   │   │       status-indicator.tsx
│   │   │       transcript-display.tsx
│   │   │
│   │   ├───aptitude
│   │   │       index.ts
│   │   │       practice-config-form.tsx
│   │   │       question-display.tsx
│   │   │       question-navigator.tsx
│   │   │       session-card.tsx
│   │   │       solution-item.tsx
│   │   │       submit-dialog.tsx
│   │   │       test-result.tsx
│   │   │       test-timer.tsx
│   │   │
│   │   └───machine
│   │           execution-panel.tsx
│   │           monaco-editor.tsx
│   │           problem-description.tsx
│   │           question-tabs.tsx
│   │           session-result.tsx
│   │           submit-dialog.tsx
│   │           test-selector.tsx
│   │           test-timer.tsx
│   │
│   ├───providers
│   │       AuthProvider.tsx
│   │       MachineConfigProvider.tsx
│   │
│   └───ui
│           accordion.tsx
│           alert-dialog.tsx
│           avatar.tsx
│           badge.tsx
│           button.tsx
│           card.tsx
│           checkbox.tsx
│           dialog.tsx
│           dropdown-menu.tsx
│           input.tsx
│           label.tsx
│           pagination.tsx
│           progress.tsx
│           radio-group.tsx
│           resizable.tsx
│           scroll-area.tsx
│           select.tsx
│           separator.tsx
│           skeleton.tsx
│           slider.tsx
│           switch.tsx
│           table.tsx
│           tabs.tsx
│           textarea.tsx
│
├───lib
│   │   utils.ts
│   │
│   ├───api
│   │   │   axios-instance.ts
│   │   │   endpoints.ts
│   │   │   error-handler.ts
│   │   │
│   │   └───services
│   │           admin.service.ts
│   │           aptitude.service.ts
│   │           auth.service.ts
│   │           interview.service.ts
│   │           machine.service.ts
│   │           profile.service.ts
│   │
│   ├───constants
│   │       aptitude.constants.ts
│   │       interview.constants.ts
│   │
│   ├───hooks
│   │       use-admin.ts
│   │       use-aptitude.ts
│   │       use-auth.ts
│   │       use-interview.ts
│   │       use-machine.ts
│   │       use-timer.ts
│   │       useSpeechRecognition.ts
│   │       useTextToSpeech.ts
│   │
│   ├───store
│   │       admin-store.ts
│   │       aptitude-store.ts
│   │       auth-store.ts
│   │       interview-store.ts
│   │       machine-store.ts
│   │
│   └───validations
│           auth.schema.ts
│
└───types
        admin.types.ts
        aiInterview.types.ts
        api.types.ts
        aptitude.types.ts
        auth.types.ts
        machine.types.ts
        speech-recognition.d.ts

PS D:\preplyte> this is my old folder file strucure and i want to convert this into  PS D:\preplyte\frontend> tree src /f
Folder PATH listing for volume New Volume
Volume serial number is 8E25-E21E
D:\PREPLYTE\FRONTEND\SRC
│   middleware.ts
│   
├───app
│   │   error.tsx
│   │   globals.css
│   │   layout.tsx
│   │   loading.tsx
│   │   not-found.tsx
│   │   page.tsx
│   │
│   ├───(auth)
│   │   │   layout.tsx
│   │   │
│   │   ├───forgot-password
│   │   │       page.tsx
│   │   │
│   │   ├───login
│   │   │       page.tsx
│   │   │
│   │   └───register
│   │           page.tsx
│   │
│   └───(platform)
│       │   layout.tsx
│       │
│       ├───(institute-admin)
│       │   │   layout.tsx
│       │   │
│       │   ├───analytics
│       │   │       page.tsx
│       │   │
│       │   ├───dashboard
│       │   │       page.tsx
│       │   │
│       │   ├───settings
│       │   │       page.tsx
│       │   │
│       │   └───students
│       │       │   page.tsx
│       │       │
│       │       ├───invite
│       │       │       page.tsx
│       │       │
│       │       └───[studentId]
│       │               page.tsx
│       │
│       ├───(platform-admin)
│       │   │   layout.tsx
│       │   │
│       │   ├───dashboard
│       │   │       page.tsx
│       │   │
│       │   ├───institutes
│       │   │   │   page.tsx
│       │   │   │
│       │   │   ├───create
│       │   │   │       page.tsx
│       │   │   │
│       │   │   └───[instituteId]
│       │   │       │   page.tsx
│       │   │       │
│       │   │       └───edit
│       │   │               page.tsx
│       │   │
│       │   ├───reports
│       │   │       page.tsx
│       │   │
│       │   ├───settings
│       │   │       page.tsx
│       │   │
│       │   └───users
│       │       │   page.tsx
│       │       │
│       │       ├───create
│       │       │       page.tsx
│       │       │
│       │       └───[userId]
│       │           │   page.tsx
│       │           │
│       │           └───edit
│       │                   page.tsx
│       │
│       └───(student)
│           │   layout.tsx
│           │
│           ├───dashboard
│           │       page.tsx
│           │
│           ├───practice
│           │   │   layout.tsx
│           │   │
│           │   ├───aptitude
│           │   │   │   page.tsx
│           │   │   │
│           │   │   ├───history
│           │   │   │       page.tsx
│           │   │   │
│           │   │   └───[sessionId]
│           │   │       │   page.tsx
│           │   │       │
│           │   │       └───result
│           │   │               page.tsx
│           │   │
│           │   ├───coding
│           │   │   │   page.tsx
│           │   │   │
│           │   │   ├───history
│           │   │   │       page.tsx
│           │   │   │
│           │   │   └───[sessionId]
│           │   │       │   page.tsx
│           │   │       │
│           │   │       └───result
│           │   │               page.tsx
│           │   │
│           │   └───interview
│           │       │   page.tsx
│           │       │
│           │       ├───history
│           │       │       page.tsx
│           │       │
│           │       └───[sessionId]
│           │           │   page.tsx
│           │           │
│           │           └───result
│           │                   page.tsx
│           │
│           └───profile
│                   page.tsx
│
├───components
│   ├───common
│   │   │   confirm-dialog.tsx
│   │   │   empty-state.tsx
│   │   │   error-boundary.tsx
│   │   │   index.ts
│   │   │   loading-spinner.tsx
│   │   │   page-header.tsx
│   │   │
│   │   └───data-table
│   │           data-table-pagination.tsx
│   │           data-table-toolbar.tsx
│   │           data-table.tsx
│   │           index.ts
│   │
│   ├───forms
│   │       form-checkbox.tsx
│   │       form-field.tsx
│   │       form-radio-group.tsx
│   │       form-select.tsx
│   │       form-textarea.tsx
│   │       index.ts
│   │
│   ├───layout
│   │   │   index.ts
│   │   │   mobile-nav.tsx
│   │   │
│   │   ├───header
│   │   │       header.tsx
│   │   │       index.ts
│   │   │       notifications.tsx
│   │   │       user-nav.tsx
│   │   │
│   │   └───sidebar
│   │           index.ts
│   │           sidebar-item.tsx
│   │           sidebar-nav.tsx
│   │           sidebar.tsx
│   │
│   └───ui
│           button.tsx
│           card.tsx
│           dialog.tsx
│           input.tsx
│           select.tsx
│
├───config
│       index.ts
│       navigation.ts
│       site.ts
│
├───features
│   ├───admin
│   │   │   index.ts
│   │   │
│   │   ├───components
│   │   │   │   index.ts
│   │   │   │   performance-cards.tsx
│   │   │   │   sessions-overview.tsx
│   │   │   │   trends-chart.tsx
│   │   │   │
│   │   │   └───charts
│   │   │           bar-chart.tsx
│   │   │           index.ts
│   │   │           line-chart.tsx
│   │   │           pie-chart.tsx
│   │   │
│   │   ├───hooks
│   │   │       use-analytics.ts
│   │   │
│   │   ├───services
│   │   │       analytics.service.ts
│   │   │
│   │   └───types
│   │           analytics.types.ts
│   │
│   ├───auth
│   │   │   index.ts
│   │   │
│   │   ├───components
│   │   │       forgot-password-form.tsx
│   │   │       index.ts
│   │   │       login-form.tsx
│   │   │       register-form.tsx
│   │   │
│   │   ├───hooks
│   │   │       use-auth.ts
│   │   │
│   │   ├───services
│   │   │       auth.service.ts
│   │   │
│   │   ├───store
│   │   │       auth.store.ts
│   │   │
│   │   ├───types
│   │   │       auth.types.ts
│   │   │
│   │   └───validations
│   │           auth.schema.ts
│   │
│   ├───dashboard
│   │   │   index.ts
│   │   │
│   │   ├───components
│   │   │   │   index.ts
│   │   │   │
│   │   │   ├───institute-admin
│   │   │   │       index.ts
│   │   │   │       performance-chart.tsx
│   │   │   │       stats-cards.tsx
│   │   │   │       student-overview.tsx
│   │   │   │
│   │   │   ├───platform-admin
│   │   │   │       index.ts
│   │   │   │       institutes-overview.tsx
│   │   │   │       stats-cards.tsx
│   │   │   │       system-health.tsx
│   │   │   │
│   │   │   └───student
│   │   │           index.ts
│   │   │           progress-chart.tsx
│   │   │           recent-activity.tsx
│   │   │           stats-cards.tsx
│   │   │
│   │   ├───hooks
│   │   │       use-dashboard.ts
│   │   │
│   │   ├───services
│   │   │       dashboard.service.ts
│   │   │
│   │   └───types
│   │           dashboard.types.ts
│   │
│   ├───institutes
│   │   │   index.ts
│   │   │
│   │   ├───components
│   │   │       admin-list.tsx
│   │   │       index.ts
│   │   │       institute-card.tsx
│   │   │       institute-filters.tsx
│   │   │       institute-form.tsx
│   │   │       institute-list.tsx
│   │   │       institute-stats.tsx
│   │   │       student-list.tsx
│   │   │
│   │   ├───hooks
│   │   │       use-institutes.ts
│   │   │
│   │   ├───services
│   │   │       institutes.service.ts
│   │   │
│   │   └───types
│   │           institutes.types.ts
│   │
│   ├───practice
│   │   ├───aptitude
│   │   │   │   index.ts
│   │   │   │
│   │   │   ├───components
│   │   │   │       config-form.tsx
│   │   │   │       index.ts
│   │   │   │       question-display.tsx
│   │   │   │       question-navigator.tsx
│   │   │   │       result-summary.tsx
│   │   │   │       session-card.tsx
│   │   │   │       solution-viewer.tsx
│   │   │   │       submit-dialog.tsx
│   │   │   │       test-timer.tsx
│   │   │   │
│   │   │   ├───constants
│   │   │   │       aptitude.constants.ts
│   │   │   │
│   │   │   ├───hooks
│   │   │   │       use-aptitude.ts
│   │   │   │
│   │   │   ├───services
│   │   │   │       aptitude.service.ts
│   │   │   │
│   │   │   ├───store
│   │   │   │       aptitude.store.ts
│   │   │   │
│   │   │   └───types
│   │   │           aptitude.types.ts
│   │   │
│   │   ├───coding
│   │   │   │   index.ts
│   │   │   │
│   │   │   ├───components
│   │   │   │       code-editor.tsx
│   │   │   │       config-form.tsx
│   │   │   │       execution-panel.tsx
│   │   │   │       index.ts
│   │   │   │       problem-description.tsx
│   │   │   │       question-tabs.tsx
│   │   │   │       result-summary.tsx
│   │   │   │       submit-dialog.tsx
│   │   │   │       test-cases-panel.tsx
│   │   │   │
│   │   │   ├───constants
│   │   │   │       coding.constants.ts
│   │   │   │
│   │   │   ├───hooks
│   │   │   │       use-coding.ts
│   │   │   │
│   │   │   ├───services
│   │   │   │       coding.service.ts
│   │   │   │
│   │   │   ├───store
│   │   │   │       coding.store.ts
│   │   │   │
│   │   │   └───types
│   │   │           coding.types.ts
│   │   │
│   │   └───interview
│   │       │   index.ts
│   │       │
│   │       ├───components
│   │       │       audio-visualizer.tsx
│   │       │       config-form.tsx
│   │       │       index.ts
│   │       │       interview-session.tsx
│   │       │       mic-button.tsx
│   │       │       question-progress.tsx
│   │       │       result-summary.tsx
│   │       │       status-indicator.tsx
│   │       │       transcript-display.tsx
│   │       │
│   │       ├───constants
│   │       │       interview.constants.ts
│   │       │
│   │       ├───hooks
│   │       │       use-interview.ts
│   │       │       use-speech-recognition.ts
│   │       │       use-text-to-speech.ts
│   │       │
│   │       ├───services
│   │       │       interview.service.ts
│   │       │
│   │       ├───store
│   │       │       interview.store.ts
│   │       │
│   │       └───types
│   │               interview.types.ts
│   │
│   ├───profile
│   │   │   index.ts
│   │   │
│   │   ├───components
│   │   │       avatar-upload.tsx
│   │   │       index.ts
│   │   │       password-change-form.tsx
│   │   │       profile-form.tsx
│   │   │
│   │   ├───hooks
│   │   │       use-profile.ts
│   │   │
│   │   ├───services
│   │   │       profile.service.ts
│   │   │
│   │   └───types
│   │           profile.types.ts
│   │
│   ├───reports
│   │   │   index.ts
│   │   │
│   │   ├───components
│   │   │       activity-table.tsx
│   │   │       export-button.tsx
│   │   │       index.ts
│   │   │       report-card.tsx
│   │   │
│   │   ├───hooks
│   │   │       use-reports.ts
│   │   │
│   │   ├───services
│   │   │       reports.service.ts
│   │   │
│   │   └───types
│   │           reports.types.ts
│   │
│   ├───students
│   │   │   index.ts
│   │   │
│   │   ├───components
│   │   │       index.ts
│   │   │       student-detail.tsx
│   │   │       student-invite-form.tsx
│   │   │       student-list.tsx
│   │   │       student-performance.tsx
│   │   │
│   │   ├───hooks
│   │   │       use-students.ts
│   │   │
│   │   ├───services
│   │   │       students.service.ts
│   │   │
│   │   └───types
│   │           students.types.ts
│   │
│   └───users
│       │   index.ts
│       │
│       ├───components
│       │       index.ts
│       │       user-filters.tsx
│       │       user-form.tsx
│       │       user-list.tsx
│       │       user-stats.tsx
│       │
│       ├───hooks
│       │       use-users.ts
│       │
│       ├───services
│       │       users.service.ts
│       │
│       └───types
│               users.types.ts
│
├───lib
│   ├───api
│   │       client.ts
│   │       endpoints.ts
│   │       error-handler.ts
│   │       index.ts
│   │
│   ├───constants
│   │       api-routes.ts
│   │       index.ts
│   │       roles.ts
│   │       routes.ts
│   │
│   └───utils
│           cn.ts
│           format.ts
│           index.ts
│           storage.ts
│           validation.ts
│
├───providers
│       auth-provider.tsx
│       index.tsx
│       query-provider.tsx
│       theme-provider.tsx
│       toast-provider.tsx
│
├───styles
│       globals.css
│
└───types
        api.types.ts
        common.types.ts
        config.types.ts
        global.d.ts
        index.ts
        speech.types.ts

PS D:\preplyte\frontend> i ill send you files of my old strcutre you are gonna give me updated clean files fro new strcuture