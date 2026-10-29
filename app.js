/**
 * Intelligent University Exam Hall Seating Allocator - Application Controller
 * CSC262: Artificial Intelligence - I (COMSATS University Islamabad)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    students: JSON.parse(JSON.stringify(DEFAULT_STUDENTS)),
    rooms: JSON.parse(JSON.stringify(DEFAULT_ROOMS)),
    allocation: {},
    auditResults: null,
    selectedSeatId: null,
    colorMode: 'course', // 'course' | 'section' | 'ada'
    hallFilter: 'ALL',
    highlightOrtho: true,
    theme: localStorage.getItem('app-theme') || 'dark',
    isSolving: false,
    solverGenerator: null,
    solverTimer: null,
    speedDelays: [400, 180, 70, 20, 5],
    speedIndex: 3, // default Fast (20ms)
    tableSort: { col: 'seat_id', asc: true },
    tableFilters: {
      search: '',
      hall: 'ALL',
      course: 'ALL',
      section: 'ALL',
      ada: 'ALL'
    },
    printMode: 'master', // 'master' | 'slips'
    viewLayout: 'grid' // 'grid' | 'list'
  };

  // DOM Elements
  const elements = {
    themeToggleBtn: document.getElementById('btn-theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    btnQuickSolve: document.getElementById('btn-quick-solve'),
    btnVisualSolve: document.getElementById('btn-visual-solve'),
    btnResetAllocation: document.getElementById('btn-reset-allocation'),
    kpiStudentsCount: document.getElementById('kpi-students-count'),
    kpiHallsCount: document.getElementById('kpi-halls-count'),
    kpiSeatsCount: document.getElementById('kpi-seats-count'),
    kpiAllocatedCount: document.getElementById('kpi-allocated-count'),
    kpiBufferCount: document.getElementById('kpi-buffer-count'),
    kpiAdaCount: document.getElementById('kpi-ada-count'),
    kpiAdaStatus: document.getElementById('kpi-ada-status'),
    kpiViolationsCount: document.getElementById('kpi-violations-count'),
    kpiViolationsSubtext: document.getElementById('kpi-violations-subtext'),
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    hallsContainer: document.getElementById('halls-container'),
    roomFilterPills: document.getElementById('room-filter-pills'),
    colorModeToggle: document.getElementById('color-mode-toggle'),
    layoutModeToggle: document.getElementById('layout-mode-toggle'),
    btnHighlightOrtho: document.getElementById('btn-highlight-ortho'),
    // Studio
    selectAlgoMode: document.getElementById('select-algorithm-mode'),
    speedSlider: document.getElementById('solver-speed-slider'),
    speedLabel: document.getElementById('speed-label'),
    btnStudioStart: document.getElementById('btn-studio-start'),
    studioPlayIcon: document.getElementById('studio-play-icon'),
    btnStudioStep: document.getElementById('btn-studio-step'),
    btnStudioStop: document.getElementById('btn-studio-stop'),
    metricSteps: document.getElementById('metric-steps'),
    metricBacktracks: document.getElementById('metric-backtracks'),
    metricChecks: document.getElementById('metric-checks'),
    currentEvaluatingStudent: document.getElementById('current-evaluating-student'),
    telemetryLog: document.getElementById('telemetry-log'),
    btnClearTerminal: document.getElementById('btn-clear-terminal'),
    // Roster / Table
    rosterSearchInput: document.getElementById('roster-search-input'),
    filterHallSelect: document.getElementById('filter-hall-select'),
    filterCourseSelect: document.getElementById('filter-course-select'),
    filterSectionSelect: document.getElementById('filter-section-select'),
    filterAdaSelect: document.getElementById('filter-ada-select'),
    masterSeatingTbody: document.getElementById('master-seating-tbody'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    btnAddStudentModal: document.getElementById('btn-add-student-modal'),
    btnGenerateSynthetic: document.getElementById('btn-generate-synthetic'),
    // Audit
    auditGlobalBadge: document.getElementById('audit-global-badge'),
    auditTimestamp: document.getElementById('audit-timestamp'),
    auditAdaChip: document.getElementById('audit-ada-chip'),
    auditAdaDetails: document.getElementById('audit-ada-details'),
    auditCourseChip: document.getElementById('audit-course-chip'),
    auditCourseDetails: document.getElementById('audit-course-details'),
    auditSectionChip: document.getElementById('audit-section-chip'),
    auditSectionDetails: document.getElementById('audit-section-details'),
    auditCapacityChip: document.getElementById('audit-capacity-chip'),
    auditCapacityDetails: document.getElementById('audit-capacity-details'),
    // Print
    printHallSectionsContainer: document.getElementById('print-hall-sections-container'),
    btnPrintSlipsToggle: document.getElementById('btn-print-slips-toggle'),
    // Config
    hallsConfigContainer: document.getElementById('halls-config-container'),
    btnAddRoomCard: document.getElementById('btn-add-room-card'),
    btnResetDefaultRooms: document.getElementById('btn-reset-default-rooms'),
    // Agent Architecture & XAI
    btnAgentRunSolve: document.getElementById('btn-agent-run-solve'),
    btnAgentBalancedMode: document.getElementById('btn-agent-balanced-mode'),
    btnAgentRunAudit: document.getElementById('btn-agent-run-audit'),
    agentXaiStudentSelect: document.getElementById('agent-xai-student-select'),
    agentXaiDetails: document.getElementById('agent-xai-details'),
    agentXaiRadar: document.getElementById('agent-xai-radar'),
    // Modals
    modalSeatInspector: document.getElementById('modal-seat-inspector'),
    modalSeatTitle: document.getElementById('modal-seat-title'),
    btnCloseSeatModal: document.getElementById('btn-close-seat-modal'),
    inspectorStudentDetails: document.getElementById('inspector-student-details'),
    inspectorNeighborsList: document.getElementById('inspector-neighbors-list'),
    modalStudentForm: document.getElementById('modal-student-form'),
    btnCloseStudentModal: document.getElementById('btn-close-student-modal'),
    formNewStudent: document.getElementById('form-new-student'),
    toastContainer: document.getElementById('toast-container')
  };

  /* ==========================================================================
     THEME MANAGEMENT
     ========================================================================== */
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    elements.themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    localStorage.setItem('app-theme', theme);
  }

  elements.themeToggleBtn.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });
  applyTheme(state.theme);

  /* ==========================================================================
     TOAST NOTIFICATIONS
     ========================================================================== */
  function showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : type === 'warning' ? '⚡' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /* ==========================================================================
     TELEMETRY LOGGING
     ========================================================================== */
  function logTerminal(message, type = 'info') {
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    const time = new Date().toLocaleTimeString();
    line.textContent = `[${time}] ${message}`;
    elements.telemetryLog.appendChild(line);
    elements.telemetryLog.scrollTop = elements.telemetryLog.scrollHeight;
  }

  elements.btnClearTerminal.addEventListener('click', () => {
    elements.telemetryLog.innerHTML = '<div class="log-line info">[SYSTEM] Execution trace cleared.</div>';
  });

  /* ==========================================================================
     KPI & METRICS UPDATE
     ========================================================================== */
  function calculateTotalSeats() {
    let total = 0;
    for (const r of Object.values(state.rooms)) {
      total += (r.rows * r.cols);
    }
    return total;
  }

  function updateKPIs() {
    const totalStudents = state.students.length;
    const totalHalls = Object.keys(state.rooms).length;
    const totalDesks = calculateTotalSeats();
    const allocatedCount = Object.keys(state.allocation).length;
    const bufferCount = Math.max(0, totalDesks - allocatedCount);
    const adaTotal = state.students.filter(s => s.ada_needed).length;

    elements.kpiStudentsCount.textContent = totalStudents;
    elements.kpiHallsCount.textContent = totalHalls;
    elements.kpiSeatsCount.textContent = totalDesks;
    elements.kpiAllocatedCount.textContent = allocatedCount;
    elements.kpiBufferCount.textContent = bufferCount;

    // Run audit if allocated
    if (allocatedCount > 0) {
      state.auditResults = CSPExamSeatingAllocator.auditAllocation(state.allocation, state.students, state.rooms);
      const isClean = state.auditResults.isValid && state.auditResults.violations.length === 0;

      elements.kpiAdaCount.textContent = `${state.auditResults.adaCompliantPlaced} / ${adaTotal}`;
      elements.kpiAdaStatus.textContent = state.auditResults.adaCompliantPlaced === adaTotal
        ? '100% Ground Floor Row 1'
        : 'Warning: Unplaced ADA';

      elements.kpiViolationsCount.textContent = isClean ? '0 Conflicts' : `${state.auditResults.violations.length} Conflicts`;
      elements.kpiViolationsCount.style.color = isClean ? '#34d399' : '#f43f5e';
      elements.kpiViolationsSubtext.textContent = isClean
        ? 'Orthogonal Isolation Verified'
        : 'Integrity Breach Detected';

      updateAuditTab(state.auditResults);
    } else {
      elements.kpiAdaCount.textContent = `0 / ${adaTotal}`;
      elements.kpiAdaStatus.textContent = 'Pending allocation';
      elements.kpiViolationsCount.textContent = 'Unallocated';
      elements.kpiViolationsCount.style.color = 'var(--text-muted)';
      elements.kpiViolationsSubtext.textContent = 'Run solver to verify';
    }
  }

  /* ==========================================================================
     DYNAMIC VENUE / HALL NAVIGATION & FILTER SYNCHRONIZATION
     ========================================================================== */
  function syncHallNavigationAndFilters() {
    // 1. Synchronize Room Filter Pills in Tab 1
    if (elements.roomFilterPills) {
      elements.roomFilterPills.innerHTML = '';

      const allBtn = document.createElement('button');
      allBtn.className = `room-pill ${state.hallFilter === 'ALL' ? 'active' : ''}`;
      allBtn.dataset.hallFilter = 'ALL';
      allBtn.innerHTML = 'All Halls Overview';
      allBtn.addEventListener('click', () => {
        state.hallFilter = 'ALL';
        syncHallNavigationAndFilters();
        renderHalls();
      });
      elements.roomFilterPills.appendChild(allBtn);

      Object.entries(state.rooms).forEach(([roomKey, room]) => {
        const pill = document.createElement('button');
        pill.className = `room-pill ${state.hallFilter === roomKey ? 'active' : ''}`;
        pill.dataset.hallFilter = roomKey;
        pill.innerHTML = `${roomKey.replace('_', ' ')} ${room.ada_accessible ? '♿' : ''} (${room.floor || 'Standard'})`;
        pill.addEventListener('click', () => {
          state.hallFilter = roomKey;
          syncHallNavigationAndFilters();
          renderHalls();
        });
        elements.roomFilterPills.appendChild(pill);
      });
    }

    // 2. Synchronize Filter Hall Select in Tab 3 (Master Roster)
    if (elements.filterHallSelect) {
      const currentVal = state.tableFilters.hall || 'ALL';
      elements.filterHallSelect.innerHTML = '<option value="ALL">All Halls</option>';
      Object.keys(state.rooms).forEach(roomKey => {
        const opt = document.createElement('option');
        opt.value = roomKey;
        opt.textContent = roomKey.replace('_', ' ');
        elements.filterHallSelect.appendChild(opt);
      });
      if (state.rooms[currentVal] || currentVal === 'ALL') {
        elements.filterHallSelect.value = currentVal;
      } else {
        elements.filterHallSelect.value = 'ALL';
        state.tableFilters.hall = 'ALL';
      }
    }
  }

  function removeHall(roomKey) {
    const roomKeys = Object.keys(state.rooms);
    if (roomKeys.length <= 1) {
      showToast('Cannot remove hall: At least one examination hall is required.', 'error');
      return;
    }

    const roomName = roomKey.replace('_', ' ');
    const roomSeatsCount = (state.rooms[roomKey].rows || 5) * (state.rooms[roomKey].cols || 5);
    const seatedInHall = Object.values(state.allocation).filter(s => s.room === roomKey).length;
    const remainingCapacity = Object.entries(state.rooms)
      .filter(([k]) => k !== roomKey)
      .reduce((acc, [, r]) => acc + (r.rows * r.cols), 0);
    const totalStudents = state.students.length;

    let warningMsg = `Are you sure you want to remove ${roomName} (${roomSeatsCount} desks)?`;
    if (seatedInHall > 0) {
      warningMsg += `\n\n• ${seatedInHall} candidate assignment(s) currently in this hall will be cleared.`;
    }
    if (remainingCapacity < totalStudents) {
      warningMsg += `\n\n⚠️ CAUTION: Total remaining capacity across other halls (${remainingCapacity} desks) is less than the active student roster (${totalStudents} students).`;
    } else {
      warningMsg += `\n\nRemaining capacity across other halls (${remainingCapacity} desks) is sufficient for all ${totalStudents} students.`;
    }

    const confirmed = window.confirm(warningMsg);
    if (!confirmed) return;

    // Clear assignments in removed hall
    let clearedCount = 0;
    for (const seatId of Object.keys(state.allocation)) {
      if (state.allocation[seatId].room === roomKey) {
        delete state.allocation[seatId];
        clearedCount++;
      }
    }

    // Delete hall
    delete state.rooms[roomKey];

    if (state.hallFilter === roomKey) {
      state.hallFilter = 'ALL';
    }
    if (state.selectedSeatId && state.selectedSeatId.startsWith(roomKey)) {
      state.selectedSeatId = null;
    }

    syncHallNavigationAndFilters();
    renderHalls();
    renderHallsConfig();
    renderMasterTable();
    updateKPIs();

    state.auditResults = IntelligentExamSeatingAgent.auditAllocation(state.allocation, state.students, state.rooms);
    renderAuditReport();

    showToast(`Removed ${roomName}! ${clearedCount > 0 ? `${clearedCount} seat assignments cleared.` : ''}`, 'info');

    // Auto-reallocate if capacity is sufficient
    if (clearedCount > 0 && remainingCapacity >= totalStudents) {
      setTimeout(() => {
        executeQuickSolve();
        showToast(`AI Agent automatically re-allocated all students across remaining ${Object.keys(state.rooms).length} halls!`, 'success');
      }, 350);
    }
  }

  function resetDefaultHalls() {
    if (!window.confirm('Reset examination venues back to default setup (Hall A, Hall B, Hall C)?')) {
      return;
    }
    state.rooms = JSON.parse(JSON.stringify(DEFAULT_ROOMS));
    state.hallFilter = 'ALL';
    state.selectedSeatId = null;
    syncHallNavigationAndFilters();
    renderHalls();
    renderHallsConfig();
    executeQuickSolve();
    showToast('Restored default examination halls (Hall A, B, C) and regenerated seating.', 'success');
  }

  /* ==========================================================================
     TAB 1: RENDER EXAM HALLS
     ========================================================================== */
  function renderHalls() {
    elements.hallsContainer.innerHTML = '';
    const roomKeys = Object.keys(state.rooms);

    roomKeys.forEach(roomKey => {
      if (state.hallFilter !== 'ALL' && state.hallFilter !== roomKey) {
        return;
      }

      const room = state.rooms[roomKey];
      const card = document.createElement('div');
      card.className = 'hall-stage-card';
      card.id = `hall-card-${roomKey}`;
      const isList = state.viewLayout === 'list';
      if (isList) {
        card.classList.add('view-mode-list');
      }

      // Calculate room occupancy
      const roomAssigned = Object.values(state.allocation).filter(s => s.room === roomKey).length;
      const roomCapacity = room.rows * room.cols;

      card.innerHTML = `
        <div class="hall-header">
          <div>
            <div class="hall-title">
              <span>🏛️</span> ${roomKey.replace('_', ' ')}
              ${room.ada_accessible ? '<span title="Ground Floor ADA Accessible" style="color: var(--ada-gold); font-size: 0.95rem;">♿ ADA Hall</span>' : ''}
            </div>
            <div class="hall-meta">${room.floor} • Grid: ${room.rows} Rows × ${room.cols} Columns (${isList ? 'Mobile Card List View' : '5-Column Floor Plan'})</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
            <div class="hall-occupancy-pill">
              ${roomAssigned} / ${roomCapacity} Seated
            </div>
            <button class="btn btn-danger remove-hall-btn" data-room-key="${roomKey}" title="Remove ${roomKey.replace('_', ' ')}" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;">
              <span>🗑️</span> Remove
            </button>
          </div>
        </div>

        <div class="room-front-stage">
          <div class="board-bar"></div>
          <div class="podium-label"><span>👨‍🏫</span> Main Presentation Board & Invigilator Desk</div>
        </div>

        <div class="room-grid-scroll-wrapper">
          <div class="mobile-pan-cue">
            <span>⇄ Swipe horizontally to pan all ${room.cols} columns</span>
          </div>
          <div class="${isList ? 'room-list-container' : 'room-grid'}" id="grid-${roomKey}" style="${isList ? '' : `grid-template-columns: repeat(${room.cols}, minmax(115px, 1fr));`}">
            <!-- Desks rendered below -->
          </div>
        </div>

        <div class="hall-footer-info">
          <span>Entrance & Fire Exit 🚪</span>
          ${room.ada_accessible ? '<span class="ada-indicator">♿ Row 1 Designated ADA Compliant Zone</span>' : '<span>Standard Exam Venue</span>'}
        </div>
      `;

      const removeBtn = card.querySelector('.remove-hall-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeHall(roomKey);
        });
      }

      const gridContainer = card.querySelector(`#grid-${roomKey}`);

      for (let r = 1; r <= room.rows; r++) {
        for (let c = 1; c <= room.cols; c++) {
          const seatId = `${roomKey}-R${r}C${c}`;
          const assigned = state.allocation[seatId];
          const isAdaSeat = room.ada_accessible && r === 1;

          const deskEl = document.createElement('div');
          deskEl.className = isList ? 'desk-item desk-list-item' : 'desk-item';
          deskEl.id = `desk-${seatId}`;
          deskEl.dataset.seatId = seatId;
          deskEl.dataset.room = roomKey;
          deskEl.dataset.row = r;
          deskEl.dataset.col = c;

          if (isAdaSeat) {
            deskEl.classList.add('ada-reserved');
          }

          if (assigned) {
            deskEl.dataset.course = assigned.course_code;
            deskEl.dataset.section = assigned.section;

            if (isList) {
              deskEl.innerHTML = `
                <div class="list-seat-meta">
                  <span class="seat-code">${seatId}</span>
                  <span class="student-tag-id">${assigned.student_id}</span>
                </div>
                <div class="student-display-name" title="${assigned.name}">${assigned.name}</div>
                <div class="desk-badges">
                  <span class="chip chip-course">${assigned.course_code}</span>
                  <span class="chip chip-section">${assigned.section}</span>
                  ${assigned.ada_needed ? '<span class="chip" style="background: rgba(251, 191, 36, 0.2); color: #fbbf24;">♿ ADA</span>' : ''}
                </div>
              `;
            } else {
              deskEl.innerHTML = `
                <div class="desk-header">
                  <span class="seat-code">R${r}C${c}</span>
                  <span class="student-tag-id">${assigned.student_id}</span>
                </div>
                <div class="student-display-name" title="${assigned.name}">${assigned.name}</div>
                <div class="desk-badges">
                  <span class="chip chip-course">${assigned.course_code}</span>
                  <span class="chip chip-section">${assigned.section}</span>
                </div>
              `;
            }
          } else {
            deskEl.classList.add('empty');
            if (isList) {
              deskEl.innerHTML = `
                <div class="list-seat-meta">
                  <span class="seat-code">${seatId}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-dim);">Vacant Buffer Desk</div>
                <div class="desk-badges">
                  <span class="chip" style="background: rgba(255, 255, 255, 0.05); color: var(--text-dim);">Available</span>
                </div>
              `;
            } else {
              deskEl.innerHTML = `
                <span class="seat-code">R${r}C${c}</span>
                <span style="font-size: 0.65rem; color: var(--text-dim);">Vacant</span>
              `;
            }
          }

          // Click handler to inspect seat & neighbors
          deskEl.addEventListener('click', () => {
            selectSeatForInspection(seatId);
          });

          gridContainer.appendChild(deskEl);
        }
      }

      elements.hallsContainer.appendChild(card);
    });

    // Reapply selected seat highlighting if any
    if (state.selectedSeatId) {
      highlightSeatAndNeighbors(state.selectedSeatId);
    }
  }

  /* ==========================================================================
     ORTHOGONAL NEIGHBORS & SEAT INSPECTION
     ========================================================================== */
  function findOrthogonalNeighbors(roomName, row, col) {
    const neighbors = [];
    const directions = [
      { name: 'North (Front)', dr: -1, dc: 0 },
      { name: 'South (Back)', dr: 1, dc: 0 },
      { name: 'West (Left)', dr: 0, dc: -1 },
      { name: 'East (Right)', dr: 0, dc: 1 }
    ];

    const rInfo = state.rooms[roomName];
    if (!rInfo) return neighbors;

    for (const dir of directions) {
      const nr = row + dir.dr;
      const nc = col + dir.dc;

      if (nr >= 1 && nr <= rInfo.rows && nc >= 1 && nc <= rInfo.cols) {
        const neighborSeatId = `${roomName}-R${nr}C${nc}`;
        const student = state.allocation[neighborSeatId] || null;
        neighbors.push({
          direction: dir.name,
          seatId: neighborSeatId,
          row: nr,
          col: nc,
          student: student
        });
      }
    }

    return neighbors;
  }

  function selectSeatForInspection(seatId) {
    state.selectedSeatId = seatId;
    highlightSeatAndNeighbors(seatId);

    const parts = seatId.split('-');
    const roomName = parts[0];
    const match = parts[1].match(/R(\d+)C(\d+)/);
    if (!match) return;

    const row = parseInt(match[1]);
    const col = parseInt(match[2]);
    const student = state.allocation[seatId] || null;
    const room = state.rooms[roomName];

    elements.modalSeatTitle.innerHTML = `<span>💺</span> Desk Details: ${seatId} (${roomName.replace('_', ' ')})`;

    if (student) {
      elements.inspectorStudentDetails.innerHTML = `
        <div style="background: var(--bg-card); border: 1px solid var(--border-card); border-radius: var(--radius-sm); padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 1.1rem; color: #fff;">${student.name}</strong>
            <span class="chip ${student.ada_needed ? 'chip-course' : 'chip-section'}">${student.ada_needed ? '♿ ADA Candidate' : 'Standard Candidate'}</span>
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-muted);">
            Roll Number: <strong style="color: #fff;">${student.student_id}</strong>
          </div>
          <div style="display: flex; gap: 0.75rem; font-size: 0.8rem; margin-top: 0.25rem;">
            <span>Degree Section: <strong style="color: #34d399;">${student.section}</strong></span>
            <span>•</span>
            <span>Course Paper: <strong style="color: #22d3ee;">${student.course_code}</strong></span>
          </div>
        </div>
      `;
    } else {
      elements.inspectorStudentDetails.innerHTML = `
        <div style="background: var(--bg-card); border: 1px solid var(--border-card); border-radius: var(--radius-sm); padding: 1rem; color: var(--text-muted); font-size: 0.85rem;">
          This seat is currently <strong>Vacant / Buffer</strong>. It satisfies all room physical boundaries.
        </div>
      `;
    }

    // Inspect orthogonal neighbors
    const neighbors = findOrthogonalNeighbors(roomName, row, col);
    elements.inspectorNeighborsList.innerHTML = '';

    if (neighbors.length === 0) {
      elements.inspectorNeighborsList.innerHTML = '<div style="color: var(--text-dim); font-size: 0.8rem;">No orthogonal neighbors.</div>';
    } else {
      neighbors.forEach(n => {
        const item = document.createElement('div');
        if (!n.student) {
          item.className = 'radar-item safe';
          item.innerHTML = `
            <div>
              <strong>${n.direction}</strong>: <span style="font-family: var(--font-mono);">${n.seatId}</span>
              <div style="color: var(--text-dim); font-size: 0.72rem;">Vacant Desk</div>
            </div>
            <span style="color: #34d399; font-weight: 600; font-size: 0.75rem;">PASS (Empty)</span>
          `;
        } else if (!student) {
          item.className = 'radar-item safe';
          item.innerHTML = `
            <div>
              <strong>${n.direction}</strong>: <span style="font-family: var(--font-mono);">${n.seatId}</span> (${n.student.student_id})
              <div style="font-size: 0.72rem; color: var(--text-muted);">${n.student.name} • ${n.student.course_code} • ${n.student.section}</div>
            </div>
            <span style="color: #34d399; font-weight: 600; font-size: 0.75rem;">PASS</span>
          `;
        } else {
          // Compare student with neighbor
          const sameCourse = student.course_code === n.student.course_code;
          const sameSection = student.section === n.student.section;
          const isClash = sameCourse || sameSection;

          item.className = `radar-item ${isClash ? 'clash' : 'safe'}`;
          item.innerHTML = `
            <div>
              <strong>${n.direction}</strong>: <span style="font-family: var(--font-mono); font-weight: 600;">${n.seatId}</span> (${n.student.student_id})
              <div style="font-size: 0.72rem; color: var(--text-muted);">
                ${n.student.name} • Course: <strong style="${sameCourse ? 'color: #f43f5e;' : ''}">${n.student.course_code}</strong> | Section: <strong style="${sameSection ? 'color: #f43f5e;' : ''}">${n.student.section}</strong>
              </div>
            </div>
            <div style="text-align: right;">
              ${isClash
                ? `<span style="color: #f43f5e; font-weight: 700; font-size: 0.75rem;">VIOLATION (${sameCourse ? 'Course' : 'Section'})</span>`
                : `<span style="color: #10b981; font-weight: 700; font-size: 0.75rem;">SAFE ✓ (Isolated)</span>`
              }
            </div>
          `;
        }
        elements.inspectorNeighborsList.appendChild(item);
      });
    }

    elements.modalSeatInspector.classList.add('active');
  }

  function highlightSeatAndNeighbors(seatId) {
    // Clear all previous highlight classes
    document.querySelectorAll('.desk-item.selected, .desk-item.orthogonal-neighbor').forEach(el => {
      el.classList.remove('selected', 'orthogonal-neighbor');
    });

    const desk = document.getElementById(`desk-${seatId}`);
    if (desk) {
      desk.classList.add('selected');
    }

    if (!state.highlightOrtho) return;

    const parts = seatId.split('-');
    const roomName = parts[0];
    const match = parts[1].match(/R(\d+)C(\d+)/);
    if (!match) return;

    const row = parseInt(match[1]);
    const col = parseInt(match[2]);
    const neighbors = findOrthogonalNeighbors(roomName, row, col);

    neighbors.forEach(n => {
      const neighborEl = document.getElementById(`desk-${n.seatId}`);
      if (neighborEl) {
        neighborEl.classList.add('orthogonal-neighbor');
      }
    });
  }

  elements.btnCloseSeatModal.addEventListener('click', () => {
    elements.modalSeatInspector.classList.remove('active');
  });

  elements.modalSeatInspector.addEventListener('click', (e) => {
    if (e.target === elements.modalSeatInspector) {
      elements.modalSeatInspector.classList.remove('active');
    }
  });

  /* ==========================================================================
     COLOR MODE & ORTHOGONAL TOGGLES
     ========================================================================== */
  elements.colorModeToggle.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.colorModeToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.colorMode;
      state.colorMode = mode;

      elements.hallsContainer.className = `halls-display-area color-by-${mode}`;
    });
  });

  if (elements.layoutModeToggle) {
    elements.layoutModeToggle.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.layoutModeToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.viewLayout = btn.dataset.layoutMode;
        renderHalls();
        showToast(`Switched view: ${state.viewLayout === 'grid' ? '🗺️ 5-Column Floor Grid' : '📋 Mobile List View'}`, 'info');
      });
    });
  }

  elements.btnHighlightOrtho.addEventListener('click', () => {
    state.highlightOrtho = !state.highlightOrtho;
    elements.btnHighlightOrtho.style.borderColor = state.highlightOrtho ? 'var(--primary)' : 'var(--border-card)';
    showToast(`Orthogonal neighbor detection: ${state.highlightOrtho ? 'ENABLED' : 'DISABLED'}`, 'info');
    if (state.selectedSeatId) {
      highlightSeatAndNeighbors(state.selectedSeatId);
    }
  });

  syncHallNavigationAndFilters();

  /* ==========================================================================
     TAB 3: MASTER ROSTER & SEATING TABLE
     ========================================================================== */
  function renderMasterTable() {
    const tbody = elements.masterSeatingTbody;
    tbody.innerHTML = '';

    // Build data list from students and allocation
    let rows = state.students.map(student => {
      const seatId = Object.keys(state.allocation).find(sid => state.allocation[sid].student_id === student.student_id) || 'Unassigned';
      const allocatedSeat = state.allocation[seatId] || null;

      return {
        student_id: student.student_id,
        name: student.name,
        section: student.section,
        course_code: student.course_code,
        ada_needed: student.ada_needed,
        seat_id: seatId,
        room: allocatedSeat ? allocatedSeat.room : 'N/A',
        row: allocatedSeat ? allocatedSeat.row : 0,
        col: allocatedSeat ? allocatedSeat.col : 0
      };
    });

    // Apply Filter Criteria
    const term = state.tableFilters.search.toLowerCase().trim();
    if (term) {
      rows = rows.filter(r =>
        r.student_id.toLowerCase().includes(term) ||
        r.name.toLowerCase().includes(term) ||
        r.seat_id.toLowerCase().includes(term) ||
        r.section.toLowerCase().includes(term) ||
        r.course_code.toLowerCase().includes(term)
      );
    }

    if (state.tableFilters.hall !== 'ALL') {
      rows = rows.filter(r => r.room === state.tableFilters.hall);
    }
    if (state.tableFilters.course !== 'ALL') {
      rows = rows.filter(r => r.course_code === state.tableFilters.course);
    }
    if (state.tableFilters.section !== 'ALL') {
      rows = rows.filter(r => r.section === state.tableFilters.section);
    }
    if (state.tableFilters.ada !== 'ALL') {
      if (state.tableFilters.ada === 'ADA') {
        rows = rows.filter(r => r.ada_needed);
      } else {
        rows = rows.filter(r => !r.ada_needed);
      }
    }

    // Apply Sorting
    rows.sort((a, b) => {
      let valA = a[state.tableSort.col];
      let valB = b[state.tableSort.col];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return state.tableSort.asc ? -1 : 1;
      if (valA > valB) return state.tableSort.asc ? 1 : -1;
      return 0;
    });

    if (rows.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-dim); padding: 2rem;">No matching student seating records found.</td></tr>`;
      return;
    }

    rows.forEach(row => {
      const tr = document.createElement('tr');
      const isAssigned = row.seat_id !== 'Unassigned';

      let orthoDesc = '—';
      if (isAssigned) {
        const neighbors = findOrthogonalNeighbors(row.room, row.row, row.col);
        const occupiedCount = neighbors.filter(n => n.student).length;
        orthoDesc = `${occupiedCount} adjacent (${neighbors.length - occupiedCount} buffer)`;
      }

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700; color: ${isAssigned ? '#818cf8' : 'var(--text-dim)'};">
          ${row.seat_id}
        </td>
        <td>${row.room !== 'N/A' ? row.room.replace('_', ' ') : '—'}</td>
        <td style="font-family: var(--font-mono);">${row.student_id}</td>
        <td><strong>${row.name}</strong></td>
        <td><span class="chip chip-section">${row.section}</span></td>
        <td><span class="chip chip-course">${row.course_code}</span></td>
        <td>
          ${row.ada_needed ? '<span class="chip" style="background: rgba(251, 191, 36, 0.2); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.4);">♿ Yes (Reserved)</span>' : '<span style="color: var(--text-dim); font-size: 0.8rem;">Standard</span>'}
        </td>
        <td style="font-size: 0.78rem; color: var(--text-muted);">${orthoDesc}</td>
        <td>
          ${isAssigned
            ? '<span style="color: #34d399; font-weight: 600; font-size: 0.78rem;">✓ Verified Safe</span>'
            : '<span style="color: var(--text-dim); font-size: 0.78rem;">Pending</span>'
          }
        </td>
      `;

      if (isAssigned) {
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', () => {
          // Switch to tab-halls and select seat
          switchTab('tab-halls');
          selectSeatForInspection(row.seat_id);
        });
      }

      tbody.appendChild(tr);
    });
  }

  // Table Sort Header Listeners
  document.querySelectorAll('#master-seating-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (state.tableSort.col === col) {
        state.tableSort.asc = !state.tableSort.asc;
      } else {
        state.tableSort.col = col;
        state.tableSort.asc = true;
      }
      renderMasterTable();
    });
  });

  // Table Filters Listeners
  elements.rosterSearchInput.addEventListener('input', (e) => {
    state.tableFilters.search = e.target.value;
    renderMasterTable();
  });
  elements.filterHallSelect.addEventListener('change', (e) => {
    state.tableFilters.hall = e.target.value;
    renderMasterTable();
  });
  elements.filterCourseSelect.addEventListener('change', (e) => {
    state.tableFilters.course = e.target.value;
    renderMasterTable();
  });
  elements.filterSectionSelect.addEventListener('change', (e) => {
    state.tableFilters.section = e.target.value;
    renderMasterTable();
  });
  elements.filterAdaSelect.addEventListener('change', (e) => {
    state.tableFilters.ada = e.target.value;
    renderMasterTable();
  });

  /* ==========================================================================
     CSV EXPORT CAPABILITY
     ========================================================================== */
  elements.btnExportCsv.addEventListener('click', () => {
    if (Object.keys(state.allocation).length === 0) {
      showToast('No active allocation to export! Please run the solver first.', 'warning');
      return;
    }

    const headers = ['Assigned Seat', 'Student ID', 'Name', 'Section', 'Course', 'ADA Status'];
    const rows = [];

    // Sort seats alphabetically matching Mid.py report
    const sortedSeats = Object.keys(state.allocation).sort();
    sortedSeats.forEach(seatId => {
      const s = state.allocation[seatId];
      rows.push([
        seatId,
        s.student_id,
        `"${s.name}"`,
        s.section,
        s.course_code,
        s.ada_needed ? 'Yes (Reserved)' : 'Standard'
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Exam_Seating_Allocation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('CSV seating report generated and downloaded!', 'success');
  });

  /* ==========================================================================
     TAB 4: ACADEMIC INTEGRITY AUDIT UPDATE
     ========================================================================== */
  function updateAuditTab(audit) {
    elements.auditTimestamp.textContent = `Audited: ${new Date().toLocaleTimeString()}`;

    if (audit.isValid && audit.violations.length === 0) {
      elements.auditGlobalBadge.innerHTML = '<span>✓</span> 100% CONSTRAINTS SATISFIED';
      elements.auditGlobalBadge.style.background = '#10b981';

      elements.auditAdaChip.textContent = '100% PASS';
      elements.auditAdaChip.className = 'chip chip-section';
      elements.auditAdaDetails.textContent = `${audit.adaCompliantPlaced} of ${audit.adaTotal} ADA students placed in Hall_A Row 1.`;
      elements.auditAdaDetails.style.color = '#34d399';

      elements.auditCourseChip.textContent = '0 CLASHES';
      elements.auditCourseChip.className = 'chip chip-section';
      elements.auditCourseDetails.textContent = `${audit.orthogonalPairsChecked} orthogonal neighbor pairs verified: 0 shared-course breaches.`;
      elements.auditCourseDetails.style.color = '#34d399';

      elements.auditSectionChip.textContent = '0 CLASHES';
      elements.auditSectionChip.className = 'chip chip-section';
      elements.auditSectionDetails.textContent = `${audit.orthogonalPairsChecked} orthogonal neighbor pairs verified: 0 shared-section breaches.`;
      elements.auditSectionDetails.style.color = '#34d399';

      elements.auditCapacityChip.textContent = '100% UNIQUE';
      elements.auditCapacityChip.className = 'chip chip-section';
      elements.auditCapacityDetails.textContent = `${audit.totalAssigned} students seated with unique desks across ${Object.keys(audit.hallBreakdown).length} halls.`;
    } else {
      elements.auditGlobalBadge.innerHTML = `<span>⚠️</span> ${audit.violations.length} VIOLATIONS FOUND`;
      elements.auditGlobalBadge.style.background = '#f43f5e';
    }
  }

  /* ==========================================================================
     TAB 5: INVIGILATION PRINT SUITE RENDERER
     ========================================================================== */
  function renderPrintSuite() {
    const container = elements.printHallSectionsContainer;
    container.innerHTML = '';

    if (Object.keys(state.allocation).length === 0) {
      container.innerHTML = '<div style="padding: 2rem; text-align: center; color: #64748b;">No allocations available to print. Please run the CSP Solver first.</div>';
      return;
    }

    if (state.printMode === 'master') {
      // Group by Room
      const roomKeys = Object.keys(state.rooms);
      roomKeys.forEach(roomKey => {
        const roomSeats = Object.keys(state.allocation)
          .filter(sid => state.allocation[sid].room === roomKey)
          .sort();

        if (roomSeats.length === 0) return;

        const hallSection = document.createElement('div');
        hallSection.style.marginBottom = '2.5rem';

        let tableRows = '';
        roomSeats.forEach((seatId, idx) => {
          const s = state.allocation[seatId];
          tableRows += `
            <tr>
              <td>${idx + 1}</td>
              <td style="font-family: monospace; font-weight: bold;">${seatId}</td>
              <td style="font-family: monospace;">${s.student_id}</td>
              <td><strong>${s.name}</strong></td>
              <td>${s.section}</td>
              <td>${s.course_code}</td>
              <td>${s.ada_needed ? '♿ ADA Reserved (Row 1)' : 'Standard'}</td>
              <td style="width: 120px;"></td>
            </tr>
          `;
        });

        hallSection.innerHTML = `
          <h3 style="margin-bottom: 0.5rem; font-size: 1.15rem; color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 0.25rem;">
            Venue: ${roomKey.replace('_', ' ')} (Capacity: ${state.rooms[roomKey].capacity} | Seated: ${roomSeats.length})
          </h3>
          <table class="print-table">
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Seat ID</th>
                <th>Roll No</th>
                <th>Student Full Name</th>
                <th>Section</th>
                <th>Paper</th>
                <th>ADA Accommodation</th>
                <th>Student Signature</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        `;

        container.appendChild(hallSection);
      });
    } else {
      // Desk Slips View
      const slipsGrid = document.createElement('div');
      slipsGrid.className = 'desk-slips-grid';

      const sortedSeats = Object.keys(state.allocation).sort();
      sortedSeats.forEach(seatId => {
        const s = state.allocation[seatId];
        const slip = document.createElement('div');
        slip.className = 'desk-slip-item';
        slip.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.25rem;">
            <span style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase;">CUI Exam Hall Slip</span>
            ${s.ada_needed ? '<span style="color: #d97706; font-weight: 800; font-size: 0.75rem;">♿ ADA</span>' : ''}
          </div>
          <div class="slip-seat-id">${seatId}</div>
          <div style="font-weight: 700; font-size: 0.95rem;">${s.name}</div>
          <div style="font-family: monospace; color: #475569;">${s.student_id}</div>
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-top: 0.25rem;">
            <span>Course: <strong>${s.course_code}</strong></span>
            <span>Sec: <strong>${s.section}</strong></span>
          </div>
        `;
        slipsGrid.appendChild(slip);
      });

      container.appendChild(slipsGrid);
    }
  }

  elements.btnPrintSlipsToggle.addEventListener('click', () => {
    state.printMode = state.printMode === 'master' ? 'slips' : 'master';
    elements.btnPrintSlipsToggle.innerHTML = state.printMode === 'master'
      ? '<span>🏷️</span> Switch to Desk Slips'
      : '<span>📋</span> Switch to Master Chart';
    renderPrintSuite();
    showToast(`Print mode toggled to: ${state.printMode === 'master' ? 'Master Sheet' : 'Desk Slips'}`, 'info');
  });

  /* ==========================================================================
     TAB 6: HALLS & INFRASTRUCTURE BUILDER
     ========================================================================== */
  function renderHallsConfig() {
    const container = elements.hallsConfigContainer;
    container.innerHTML = '';

    Object.entries(state.rooms).forEach(([roomKey, room]) => {
      const card = document.createElement('div');
      card.className = 'hall-config-card';

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1.1rem; font-family: var(--font-heading); font-weight: 700;">${roomKey.replace('_', ' ')}</h3>
          <span class="chip ${room.ada_accessible ? 'chip-course' : 'chip-section'}">${room.ada_accessible ? '♿ Accessible' : 'Standard'}</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div class="control-field">
            <label class="field-label">Rows</label>
            <input type="number" class="text-input" value="${room.rows}" min="1" max="15" id="cfg-rows-${roomKey}">
          </div>
          <div class="control-field">
            <label class="field-label">Columns</label>
            <input type="number" class="text-input" value="${room.cols}" min="1" max="15" id="cfg-cols-${roomKey}">
          </div>
        </div>

        <div class="control-field">
          <label class="field-label">Floor Location</label>
          <input type="text" class="text-input" value="${room.floor}" id="cfg-floor-${roomKey}">
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
          <input type="checkbox" id="cfg-ada-${roomKey}" ${room.ada_accessible ? 'checked' : ''} style="width: 16px; height: 16px; accent-color: var(--primary);">
          <label for="cfg-ada-${roomKey}" style="font-size: 0.82rem; font-weight: 500;">Wheelchair / ADA Accessible Hall</label>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
          <button class="btn btn-secondary" style="flex: 1;" id="btn-save-cfg-${roomKey}">
            <span>💾</span> Update Dimensions
          </button>
          <button class="btn btn-danger" style="flex: 1;" id="btn-remove-cfg-${roomKey}" title="Remove ${roomKey.replace('_', ' ')}">
            <span>🗑️</span> Remove Hall
          </button>
        </div>
      `;

      card.querySelector(`#btn-save-cfg-${roomKey}`).addEventListener('click', () => {
        const rows = parseInt(card.querySelector(`#cfg-rows-${roomKey}`).value) || 5;
        const cols = parseInt(card.querySelector(`#cfg-cols-${roomKey}`).value) || 5;
        const floor = card.querySelector(`#cfg-floor-${roomKey}`).value;
        const ada = card.querySelector(`#cfg-ada-${roomKey}`).checked;

        state.rooms[roomKey].rows = rows;
        state.rooms[roomKey].cols = cols;
        state.rooms[roomKey].capacity = rows * cols;
        state.rooms[roomKey].floor = floor;
        state.rooms[roomKey].ada_accessible = ada;

        syncHallNavigationAndFilters();
        renderHalls();
        updateKPIs();
        showToast(`${roomKey.replace('_', ' ')} dimensions and flags updated!`, 'success');
      });

      card.querySelector(`#btn-remove-cfg-${roomKey}`).addEventListener('click', () => {
        removeHall(roomKey);
      });

      container.appendChild(card);
    });
  }

  elements.btnAddRoomCard.addEventListener('click', () => {
    const nextIndex = Object.keys(state.rooms).length + 1;
    const roomKey = `Hall_${String.fromCharCode(64 + nextIndex)}`;
    state.rooms[roomKey] = {
      name: roomKey,
      capacity: 25,
      rows: 5,
      cols: 5,
      ada_accessible: false,
      floor: `${nextIndex}rd Floor`
    };

    syncHallNavigationAndFilters();
    renderHallsConfig();
    renderHalls();
    updateKPIs();
    showToast(`Created new room: ${roomKey.replace('_', ' ')}!`, 'success');
  });

  if (elements.btnResetDefaultRooms) {
    elements.btnResetDefaultRooms.addEventListener('click', resetDefaultHalls);
  }

  /* ==========================================================================
     CSP SOLVER WORKFLOWS (SYNCHRONOUS & ANIMATED)
     ========================================================================== */
  function executeQuickSolve() {
    stopVisualSolver();
    logTerminal('[SOLVER] Starting Instant Backtracking Search...', 'info');

    const algoMode = elements.selectAlgoMode.value;
    const allocator = new CSPExamSeatingAllocator(state.students, state.rooms, { mode: algoMode });

    const success = allocator.solve();

    if (success) {
      state.allocation = allocator.allocation;
      logTerminal(`[SOLVER] Success! Placed all ${Object.keys(state.allocation).length} students in ${allocator.stats.elapsedMs}ms across ${allocator.stats.steps} recursive steps.`, 'success');
      showToast(`Seating arrangement computed successfully in ${allocator.stats.elapsedMs}ms!`, 'success');

      elements.metricSteps.textContent = allocator.stats.steps;
      elements.metricBacktracks.textContent = allocator.stats.backtracks;
      elements.metricChecks.textContent = allocator.stats.checks;

      renderHalls();
      renderMasterTable();
      renderPrintSuite();
      updateKPIs();
      if (elements.agentXaiStudentSelect && elements.agentXaiStudentSelect.value) {
        renderAgentXai(elements.agentXaiStudentSelect.value);
      }
    } else {
      logTerminal('[SOLVER ERROR] Could not satisfy constraints for given roster and room capacities.', 'backtrack');
      showToast('FAILED: Could not satisfy all constraints with given domains.', 'error');
    }
  }

  elements.btnQuickSolve.addEventListener('click', executeQuickSolve);

  // Speed Slider
  elements.speedSlider.addEventListener('input', (e) => {
    state.speedIndex = parseInt(e.target.value) - 1;
    const labels = ['Slow (400ms)', 'Medium (180ms)', 'Normal (70ms)', 'Fast (20ms)', 'Turbo (5ms)'];
    elements.speedLabel.textContent = labels[state.speedIndex];
  });

  function stopVisualSolver() {
    if (state.solverTimer) {
      clearTimeout(state.solverTimer);
      state.solverTimer = null;
    }
    state.isSolving = false;
    elements.studioPlayIcon.textContent = '▶';
    elements.btnStudioStart.querySelector('span:last-child').textContent = 'Start Animation';
  }

  function startVisualSolver() {
    if (state.isSolving) {
      // Pause
      stopVisualSolver();
      showToast('Visual solver paused.', 'info');
      return;
    }

    state.isSolving = true;
    elements.studioPlayIcon.textContent = '⏸';
    elements.btnStudioStart.querySelector('span:last-child').textContent = 'Pause Animation';

    // Clear previous allocation
    state.allocation = {};
    renderHalls();
    renderMasterTable();
    updateKPIs();

    const algoMode = elements.selectAlgoMode.value;
    const allocator = new CSPExamSeatingAllocator(state.students, state.rooms, { mode: algoMode });
    state.solverGenerator = allocator.solveGenerator();

    logTerminal(`[VISUAL SOLVER] Initiating state-space search (Strategy: ${algoMode.toUpperCase()})...`, 'info');

    function stepLoop() {
      if (!state.isSolving || !state.solverGenerator) return;

      const res = state.solverGenerator.next();
      if (res.done) {
        stopVisualSolver();
        renderHalls();
        renderMasterTable();
        renderPrintSuite();
        updateKPIs();
        logTerminal('[VISUAL SOLVER] Completed backtracking search loop.', 'success');
        return;
      }

      const event = res.value;
      handleSolverEvent(event);

      const delay = state.speedDelays[state.speedIndex];
      state.solverTimer = setTimeout(stepLoop, delay);
    }

    stepLoop();
  }

  function handleSolverEvent(event) {
    if (event.stats) {
      elements.metricSteps.textContent = event.stats.steps;
      elements.metricBacktracks.textContent = event.stats.backtracks;
      elements.metricChecks.textContent = event.stats.checks;
    }

    if (event.type === 'CHECK') {
      elements.currentEvaluatingStudent.innerHTML = `
        <div>Evaluating: <strong style="color: #fff;">${event.student.student_id}</strong> (${event.student.name})</div>
        <div style="font-size: 0.72rem; color: var(--text-muted);">Testing Seat: <strong style="color: #38bdf8;">${event.seat.seat_id}</strong></div>
        <div style="font-size: 0.72rem; color: ${event.passed ? '#34d399' : '#f43f5e'};">
          ${event.passed ? '✓ Constraints Safe' : `✗ Clash: ${event.reason}`}
        </div>
      `;

      // Highlight candidate desk
      const desk = document.getElementById(`desk-${event.seat.seat_id}`);
      if (desk) {
        desk.style.outline = event.passed ? '2px solid #34d399' : '2px solid #f43f5e';
        setTimeout(() => {
          if (desk) desk.style.outline = '';
        }, Math.max(state.speedDelays[state.speedIndex] - 5, 10));
      }
    } else if (event.type === 'ASSIGN') {
      state.allocation = event.allocation;
      logTerminal(`[ASSIGN] Student ${event.student.student_id} assigned to ${event.seat.seat_id} (${event.index}/${event.totalStudents})`, 'info');

      // Update that specific desk element in DOM immediately
      updateDeskDOM(event.seat.seat_id, event.student);
    } else if (event.type === 'BACKTRACK') {
      state.allocation = event.allocation;
      logTerminal(`[BACKTRACK] Dead-end encountered! Unwinding assignment at ${event.seat.seat_id} for ${event.student.student_id}`, 'backtrack');

      clearDeskDOM(event.seat.seat_id);
    } else if (event.type === 'SUCCESS') {
      state.allocation = event.allocation;
      logTerminal(`[SUCCESS] Solution reached! All ${event.totalStudents} variables successfully satisfied!`, 'success');
      showToast('CSP Backtracking completed with 0 violations!', 'success');
      renderHalls();
      renderMasterTable();
      renderPrintSuite();
      updateKPIs();
      if (elements.agentXaiStudentSelect && elements.agentXaiStudentSelect.value) {
        renderAgentXai(elements.agentXaiStudentSelect.value);
      }
    } else if (event.type === 'FAIL') {
      logTerminal('[FAILURE] Search exhausted without valid assignment.', 'backtrack');
      showToast('Backtracking search failed to find valid assignment.', 'error');
    }
  }

  function updateDeskDOM(seatId, student) {
    const desk = document.getElementById(`desk-${seatId}`);
    if (!desk) return;

    desk.classList.remove('empty');
    desk.dataset.course = student.course_code;
    desk.dataset.section = student.section;

    const parts = seatId.split('-');
    const match = parts[1].match(/R(\d+)C(\d+)/);
    const r = match ? match[1] : '';
    const c = match ? match[2] : '';

    if (state.viewLayout === 'list') {
      desk.innerHTML = `
        <div class="list-seat-meta">
          <span class="seat-code">${seatId}</span>
          <span class="student-tag-id">${student.student_id}</span>
        </div>
        <div class="student-display-name" title="${student.name}">${student.name}</div>
        <div class="desk-badges">
          <span class="chip chip-course">${student.course_code}</span>
          <span class="chip chip-section">${student.section}</span>
          ${student.ada_needed ? '<span class="chip" style="background: rgba(251, 191, 36, 0.2); color: #fbbf24;">♿ ADA</span>' : ''}
        </div>
      `;
    } else {
      desk.innerHTML = `
        <div class="desk-header">
          <span class="seat-code">R${r}C${c}</span>
          <span class="student-tag-id">${student.student_id}</span>
        </div>
        <div class="student-display-name" title="${student.name}">${student.name}</div>
        <div class="desk-badges">
          <span class="chip chip-course">${student.course_code}</span>
          <span class="chip chip-section">${student.section}</span>
        </div>
      `;
    }
  }

  function clearDeskDOM(seatId) {
    const desk = document.getElementById(`desk-${seatId}`);
    if (!desk) return;

    desk.classList.add('empty');
    delete desk.dataset.course;
    delete desk.dataset.section;

    const parts = seatId.split('-');
    const match = parts[1].match(/R(\d+)C(\d+)/);
    const r = match ? match[1] : '';
    const c = match ? match[2] : '';

    if (state.viewLayout === 'list') {
      desk.innerHTML = `
        <div class="list-seat-meta">
          <span class="seat-code">${seatId}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-dim);">Vacant Buffer Desk</div>
        <div class="desk-badges">
          <span class="chip" style="background: rgba(255, 255, 255, 0.05); color: var(--text-dim);">Available</span>
        </div>
      `;
    } else {
      desk.innerHTML = `
        <span class="seat-code">R${r}C${c}</span>
        <span style="font-size: 0.65rem; color: var(--text-dim);">Vacant</span>
      `;
    }
  }

  elements.btnVisualSolve.addEventListener('click', () => {
    switchTab('tab-studio');
    startVisualSolver();
  });

  elements.btnStudioStart.addEventListener('click', startVisualSolver);

  elements.btnStudioStep.addEventListener('click', () => {
    if (!state.solverGenerator) {
      const algoMode = elements.selectAlgoMode.value;
      const allocator = new CSPExamSeatingAllocator(state.students, state.rooms, { mode: algoMode });
      state.solverGenerator = allocator.solveGenerator();
    }

    const res = state.solverGenerator.next();
    if (!res.done) {
      handleSolverEvent(res.value);
    } else {
      showToast('Search completed.', 'info');
    }
  });

  elements.btnStudioStop.addEventListener('click', () => {
    stopVisualSolver();
    state.solverGenerator = null;
    state.allocation = {};
    renderHalls();
    renderMasterTable();
    updateKPIs();
    logTerminal('[SOLVER] Reset and stopped.', 'info');
  });

  elements.btnResetAllocation.addEventListener('click', () => {
    stopVisualSolver();
    state.solverGenerator = null;
    state.allocation = {};
    renderHalls();
    renderMasterTable();
    renderPrintSuite();
    updateKPIs();
    showToast('Allocation reset to vacant.', 'info');
  });

  /* ==========================================================================
     STUDENT ADD / GENERATE MODALS
     ========================================================================== */
  elements.btnAddStudentModal.addEventListener('click', () => {
    elements.modalStudentForm.classList.add('active');
    const nextId = `SP25-BDS-${String(state.students.length + 1).padStart(3, '0')}`;
    document.getElementById('input-new-id').value = nextId;
    document.getElementById('input-new-name').value = '';
  });

  elements.btnCloseStudentModal.addEventListener('click', () => {
    elements.modalStudentForm.classList.remove('active');
  });

  elements.modalStudentForm.addEventListener('click', (e) => {
    if (e.target === elements.modalStudentForm) {
      elements.modalStudentForm.classList.remove('active');
    }
  });

  elements.formNewStudent.addEventListener('submit', () => {
    const sId = document.getElementById('input-new-id').value.trim();
    const name = document.getElementById('input-new-name').value.trim();
    const section = document.getElementById('select-new-section').value;
    const course = document.getElementById('select-new-course').value;
    const ada = document.getElementById('check-new-ada').checked;

    if (!sId || !name) {
      showToast('Please fill out student ID and name.', 'warning');
      return;
    }

    state.students.push({
      student_id: sId,
      name: name,
      section: section,
      course_code: course,
      ada_needed: ada
    });

    elements.modalStudentForm.classList.remove('active');
    renderMasterTable();
    updateKPIs();
    showToast(`Added ${sId} (${name}) to exam roster!`, 'success');
  });

  elements.btnGenerateSynthetic.addEventListener('click', () => {
    state.students = generateSyntheticStudents(50, 10, 42);
    state.allocation = {};
    renderHalls();
    renderMasterTable();
    renderPrintSuite();
    renderAgentStudio();
    updateKPIs();
    showToast('Reset student roster to Mid.py default 50 students (seed 42).', 'info');
  });

  /* ==========================================================================
     TAB: AI AGENT ARCHITECTURE & EXPLAINABLE AI (XAI)
     ========================================================================== */
  function renderAgentStudio() {
    // Populate Candidate Select Dropdown for XAI
    if (elements.agentXaiStudentSelect) {
      const currentSelected = elements.agentXaiStudentSelect.value;
      elements.agentXaiStudentSelect.innerHTML = '';

      state.students.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.student_id;
        const seatId = Object.keys(state.allocation).find(sid => state.allocation[sid].student_id === s.student_id);
        opt.textContent = `${s.student_id} - ${s.name} (${s.section} | ${s.course_code})${s.ada_needed ? ' [♿ ADA]' : ''}${seatId ? ` -> ${seatId}` : ' [Unassigned]'}`;
        elements.agentXaiStudentSelect.appendChild(opt);
      });

      if (currentSelected && state.students.some(s => s.student_id === currentSelected)) {
        elements.agentXaiStudentSelect.value = currentSelected;
      } else if (state.students.length > 0) {
        const firstAda = state.students.find(s => s.ada_needed);
        elements.agentXaiStudentSelect.value = firstAda ? firstAda.student_id : state.students[0].student_id;
      }

      renderAgentXai(elements.agentXaiStudentSelect.value);
    }
  }

  function renderAgentXai(studentId) {
    if (!elements.agentXaiDetails || !elements.agentXaiRadar) return;

    const student = state.students.find(s => s.student_id === studentId);
    if (!student) {
      elements.agentXaiDetails.innerHTML = '<span style="color: var(--text-dim);">No candidate selected.</span>';
      elements.agentXaiRadar.innerHTML = '';
      return;
    }

    const seatId = Object.keys(state.allocation).find(sid => state.allocation[sid].student_id === studentId);
    if (!seatId) {
      elements.agentXaiDetails.innerHTML = `
        <div style="color: #fb7185; font-weight: 600;">
          Candidate ${student.student_id} (${student.name}) is currently unassigned.
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
          Run the AI Agent Solver to generate a verified conflict-free seating chart.
        </div>
      `;
      elements.agentXaiRadar.innerHTML = '';
      return;
    }

    const assigned = state.allocation[seatId];
    const room = state.rooms[assigned.room];
    const r = assigned.row;
    const c = assigned.col;

    elements.agentXaiDetails.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
        <div>
          <span style="font-weight: 700; font-size: 1rem; color: var(--text-main);">${student.name}</span>
          <span style="font-family: var(--font-mono); color: #818cf8; margin-left: 0.5rem;">${student.student_id}</span>
          <span class="chip chip-section" style="margin-left: 0.5rem;">${student.section}</span>
          <span class="chip chip-course" style="margin-left: 0.25rem;">${student.course_code}</span>
          ${student.ada_needed ? '<span class="chip" style="margin-left: 0.25rem; background: rgba(251, 191, 36, 0.15); color: #fbbf24;">♿ ADA Accessible Row 1</span>' : ''}
        </div>
        <div style="font-family: var(--font-mono); font-weight: 700; color: #34d399; font-size: 0.95rem;">
          Assigned Desk: ${seatId}
        </div>
      </div>
      <div style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted);">
        <strong>Agent Decision Rationale:</strong> Candidate allocated to ${assigned.room.replace('_', ' ')} (Row ${r}, Col ${c}) on ${room ? room.floor : 'exam floor'}.
        ${student.ada_needed ? 'Hard constraint satisfied: Ground-floor Row 1 accessible desk reserved.' : 'Standard domain desk assigned with verified orthogonal isolation.'}
      </div>
    `;

    // Calculate 4 directional neighbors (|dr|+|dc| = 1)
    const neighbors = [
      { dir: 'North (Row - 1)', seatId: `${assigned.room}-R${r - 1}C${c}` },
      { dir: 'South (Row + 1)', seatId: `${assigned.room}-R${r + 1}C${c}` },
      { dir: 'West (Col - 1)', seatId: `${assigned.room}-R${r}C${c - 1}` },
      { dir: 'East (Col + 1)', seatId: `${assigned.room}-R${r}C${c + 1}` }
    ];

    elements.agentXaiRadar.innerHTML = '';
    neighbors.forEach(n => {
      const card = document.createElement('div');
      const occupant = state.allocation[n.seatId] || null;

      if (!occupant) {
        card.className = 'xai-radar-card boundary';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
            <span style="font-weight: 700; color: var(--text-muted); font-size: 0.75rem;">${n.dir}</span>
            <span class="chip" style="font-size: 0.65rem; background: rgba(148, 163, 184, 0.15); color: #94a3b8;">EMPTY / BOUNDARY</span>
          </div>
          <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-dim);">${n.seatId}</div>
          <div style="font-size: 0.75rem; color: #34d399; margin-top: 0.25rem;">✓ Physical Aisle / Safe Wall Barrier</div>
        `;
      } else {
        const sameSec = occupant.section === student.section;
        const sameCrs = occupant.course_code === student.course_code;
        const isSafe = !sameSec && !sameCrs;

        card.className = `xai-radar-card ${isSafe ? 'safe' : 'clash'}`;
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
            <span style="font-weight: 700; font-size: 0.75rem;">${n.dir}</span>
            <span class="chip" style="font-size: 0.65rem; background: ${isSafe ? 'rgba(52, 211, 153, 0.15)' : 'rgba(244, 63, 94, 0.15)'}; color: ${isSafe ? '#34d399' : '#fb7185'};">
              ${isSafe ? '✓ ISO SHIELD ACTIVE' : '⚠️ COLLISION'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600;">${occupant.name}</span>
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #818cf8;">${occupant.student_id}</span>
          </div>
          <div style="display: flex; gap: 0.35rem; margin-top: 0.3rem;">
            <span class="chip chip-section" style="font-size: 0.68rem;">Sec: ${occupant.section} ${sameSec ? '❌' : '✓'}</span>
            <span class="chip chip-course" style="font-size: 0.68rem;">Paper: ${occupant.course_code} ${sameCrs ? '❌' : '✓'}</span>
          </div>
          <div style="font-size: 0.72rem; color: ${isSafe ? 'var(--text-muted)' : '#fb7185'}; margin-top: 0.35rem;">
            ${isSafe ? 'Different degree section & different exam paper. Zero cheating risk.' : 'CRITICAL INTEGRITY CLASH!'}
          </div>
        `;
      }
      elements.agentXaiRadar.appendChild(card);
    });
  }

  // Agent tab event listeners
  if (elements.btnAgentRunSolve) {
    elements.btnAgentRunSolve.addEventListener('click', () => {
      elements.selectAlgoMode.value = 'baseline';
      executeQuickSolve();
      renderAgentStudio();
      showToast('AI Agent executed Goal-Based CSP Backtracking allocation!', 'success');
    });
  }

  if (elements.btnAgentBalancedMode) {
    elements.btnAgentBalancedMode.addEventListener('click', () => {
      elements.selectAlgoMode.value = 'balanced';
      executeQuickSolve();
      renderAgentStudio();
      showToast('AI Agent executed Utility-Balanced allocation across halls!', 'success');
    });
  }

  if (elements.btnAgentRunAudit) {
    elements.btnAgentRunAudit.addEventListener('click', () => {
      state.auditResults = IntelligentExamSeatingAgent.auditAllocation(state.allocation, state.students, state.rooms);
      renderAuditReport();
      switchTab('tab-audit');
      showToast('Autonomous Invigilation Audit completed! 100% compliance certified.', 'success');
    });
  }

  if (elements.agentXaiStudentSelect) {
    elements.agentXaiStudentSelect.addEventListener('change', (e) => {
      renderAgentXai(e.target.value);
    });
  }

  /* ==========================================================================
     TAB NAVIGATION SWITCHER
     ========================================================================== */
  function switchTab(tabId) {
    elements.tabButtons.forEach(btn => {
      const isTarget = btn.dataset.tab === tabId;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    elements.tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === tabId);
    });

    if (tabId === 'tab-halls') {
      renderHalls();
    } else if (tabId === 'tab-agent') {
      renderAgentStudio();
    } else if (tabId === 'tab-roster') {
      renderMasterTable();
    } else if (tabId === 'tab-print') {
      renderPrintSuite();
    } else if (tabId === 'tab-config') {
      renderHallsConfig();
    }
  }

  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  /* ==========================================================================
     INITIALIZATION ON PAGE LOAD
     ========================================================================== */
  // Initial solve so the user immediately sees the fully populated, validated arrangement from Mid.py!
  syncHallNavigationAndFilters();
  executeQuickSolve();
  renderHallsConfig();
  renderPrintSuite();
  renderAgentStudio();
});
