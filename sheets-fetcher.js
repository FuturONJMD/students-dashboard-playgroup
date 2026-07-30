// ============================================
// Data Fetching Layer
// Uses constants from config.js: SHEET_ID, STUDENTS, APPS_SCRIPT_URL
// ============================================

function parsePercentage(val) {
    if (!val || val === 'N/A' || val === '' || val === null) return 0;
    const s = String(val).replace('%', '').trim();
    const num = parseFloat(s);
    if (isNaN(num)) return 0;
    return num > 1 ? num / 100 : num;
}

function parseBottle(val) {
    if (!val || val === 'N/A' || val === '' || val === null) return 0;
    const s = String(val).trim();
    if (s.includes('/')) {
        const parts = s.split('/');
        return parseFloat(parts[0]) / parseFloat(parts[1]);
    }
    const num = parseFloat(s);
    return isNaN(num) ? 0 : num;
}

function formatArrivalTime(val) {
    if (!val || val === '' || val === 'N/A') return 'N/A';
    const s = String(val).trim();
    const match = s.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return s;
    let h = parseInt(match[1]);
    const m = match[2];
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

// === Apps Script fetch (NO caching, instant updates) ===
async function fetchViaAppsScript() {
    if (!APPS_SCRIPT_URL) return null;
    const url = APPS_SCRIPT_URL + '?sheet=ALL&_=' + Date.now();
    const response = await fetch(url);
    if (!response.ok) throw new Error('Apps Script error: ' + response.status);
    const allData = await response.json();
    if (allData.error) throw new Error(allData.error);
    
    const result = {};
    for (const [studentName, rows] of Object.entries(allData)) {
        const weeks = parseSheetRows(rows);
        if (weeks.length > 0) {
            result[studentName] = weeks;
        }
    }
    return result;
}

// Parse rows from Apps Script (array of arrays with display values)
// Auto-detects whether sheet has a Date column (offset=1) or not (offset=0)
function parseSheetRows(rows) {
    const weeks = [];
    let i = 0;
    const validDays = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];

    // Detect if sheet has a date column by checking data rows
    let colOffset = 0;
    for (let r = 0; r < rows.length; r++) {
        const row = rows[r] || [];
        const cell0 = (row[0] || '').toUpperCase().trim();
        const cell1 = (row[1] || '').toUpperCase().trim();
        // If first cell looks like a date (DD/MM/YYYY) and second cell is a valid day name
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cell0) && validDays.includes(cell1)) {
            colOffset = 1;
            break;
        }
        // If first cell is "DATE" (header label)
        if (cell0 === 'DATE' && (cell1.includes('TO') || cell1.includes('ARRIVAL'))) {
            colOffset = 1;
            break;
        }
        // Original format: first cell is a day name
        if (validDays.includes(cell0)) {
            colOffset = 0;
            break;
        }
    }

    while (i < rows.length) {
        const row = rows[i] || [];
        const rowText = row.join(' ').toUpperCase().trim();
        const hasWeek = rowText.includes('WEEK');
        const hasArrival = rowText.includes('ARRIVAL');
        // Check if any of the first cells is a valid day name
        const cell0 = (row[0] || '').toUpperCase().trim();
        const cell1 = (row[1] || '').toUpperCase().trim();
        const isDayRow = validDays.includes(cell0) || validDays.includes(cell1);
        
        if (hasWeek && !hasArrival && !isDayRow) {
            // Extract the full week label from the row
            let label = rowText;
            for (const s of STUDENTS) {
                label = label.replace(new RegExp(s, 'gi'), '').trim();
            }
            // Remove date-like patterns (DD/MM/YYYY) from label
            label = label.replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, '').trim();
            label = label.replace(/\s+/g, ' ').trim();
            i++;
            if (i >= rows.length) break;
            const headerRow = rows[i] || [];
            // Date range: find the cell that contains "TO" (e.g., "06/07/2026 TO 11/07/2026")
            let dateRange = '';
            for (const cell of headerRow) {
                if (cell && String(cell).toUpperCase().includes('TO')) {
                    dateRange = String(cell).trim();
                    break;
                }
            }
            i++;
            const days = [];
            for (let d = 0; d < 6 && i < rows.length; d++, i++) {
                const r = rows[i] || [];
                // Day name is at colOffset position
                const dayName = (r[colOffset] || '').toUpperCase().trim();
                if (!validDays.includes(dayName)) break;
                const o = colOffset; // offset for remaining columns
                days.push({
                    day: dayName,
                    date: colOffset === 1 ? (r[0] || '') : '', // store raw date if available
                    arrival_time: formatArrivalTime(r[o + 1]),
                    snacks: r[o + 2] || 'N/A',
                    snack_completion: parsePercentage(r[o + 3]),
                    interested_in: r[o + 4] || 'N/A',
                    lunch_completion: parsePercentage(r[o + 5]),
                    lunch: r[o + 6] || 'N/A',
                    water_completion: parsePercentage(r[o + 7]),
                    bottle_refill: parseBottle(r[o + 8]),
                    uniform: r[o + 9] || 'N/A'
                });
            }
            if (days.length > 0) {
                weeks.push({ label: label, date_range: dateRange, days: days });
            }
        } else {
            i++;
        }
    }
    return weeks;
}

// === JSONP fallback (Google Visualization API - may be cached up to 5 min) ===
function fetchSheetJSON(sheetName) {
    return new Promise((resolve, reject) => {
        const callbackName = 'sheetCallback_' + sheetName + '_' + Date.now();
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:${callbackName}&sheet=${sheetName}&headers=0&_=${Date.now()}`;
        
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Timeout'));
        }, 10000);

        function cleanup() {
            clearTimeout(timeout);
            delete window[callbackName];
            const el = document.getElementById(callbackName);
            if (el) el.remove();
        }

        window[callbackName] = function(response) {
            cleanup();
            if (response && response.table) {
                resolve(response.table);
            } else {
                reject(new Error('No table data'));
            }
        };

        const script = document.createElement('script');
        script.id = callbackName;
        script.src = url;
        script.onerror = function() { cleanup(); reject(new Error('Script load failed')); };
        document.body.appendChild(script);
    });
}

function extractRows(table) {
    const rows = [];
    if (!table || !table.rows) return rows;
    for (const row of table.rows) {
        const cells = [];
        if (row.c) {
            for (const cell of row.c) {
                if (!cell || cell.v == null) {
                    cells.push('');
                } else if (cell.f) {
                    cells.push(String(cell.f));
                } else {
                    cells.push(String(cell.v));
                }
            }
        }
        rows.push(cells);
    }
    return rows;
}

function parseSheetData(rows) {
    return parseSheetRows(rows);
}

async function fetchStudentData(studentName) {
    const table = await fetchSheetJSON(studentName);
    const rows = extractRows(table);
    return parseSheetData(rows);
}

async function fetchAllViaJSONP() {
    const data = {};
    const results = await Promise.allSettled(
        STUDENTS.map(async (name) => {
            const weeks = await fetchStudentData(name);
            return { name, weeks };
        })
    );
    for (const result of results) {
        if (result.status === 'fulfilled' && result.value.weeks.length > 0) {
            data[result.value.name] = result.value.weeks;
        }
    }
    return data;
}

async function loadData() {
    let source = 'none';
    try {
        // Try Apps Script first (instant, no cache)
        if (APPS_SCRIPT_URL) {
            const appsData = await fetchViaAppsScript();
            if (appsData && Object.keys(appsData).length > 0) {
                studentsData = appsData;
                source = 'apps-script';
                console.log('Live data loaded via Apps Script (no cache):', Object.keys(studentsData).join(', '));
            }
        }
        
        // Fallback to JSONP (may be cached ~5 min by Google)
        if (source === 'none') {
            const jsonpData = await fetchAllViaJSONP();
            if (Object.keys(jsonpData).length > 0) {
                studentsData = jsonpData;
                source = 'jsonp';
                console.log('Live data loaded via JSONP (may be cached):', Object.keys(studentsData).join(', '));
            }
        }
    } catch (err) {
        console.warn('Failed to fetch live data:', err.message);
    }

    // Show status badge
    const badge = document.createElement('div');
    badge.style.cssText = 'position:fixed;bottom:12px;left:12px;padding:6px 14px;border-radius:8px;font-size:0.7rem;font-weight:600;z-index:9999;color:#fff;';
    if (source === 'apps-script') {
        badge.style.background = '#059669';
        badge.textContent = '✓ LIVE (instant)';
    } else if (source === 'jsonp') {
        badge.style.background = '#d97706';
        badge.textContent = '⚠ CACHED (~5min delay)';
    } else {
        badge.style.background = '#dc2626';
        badge.textContent = '✗ OFFLINE (fallback data)';
    }
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 6000);

    renderApp();
}
