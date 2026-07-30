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
    // Handle ISO timestamp (e.g., "1899-12-30T03:35:50.000Z" - time-only from Sheets)
    if (s.includes('T') && s.includes('Z')) {
        const d = new Date(s);
        if (!isNaN(d.getTime())) {
            // Add 5:30 for IST
            const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
            let h = ist.getUTCHours();
            const m = String(ist.getUTCMinutes()).padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            if (h > 12) h -= 12;
            if (h === 0) h = 12;
            return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
        }
    }
    // Handle HH:MM format
    const match = s.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return s;
    let h = parseInt(match[1]);
    const m = match[2];
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

function formatDate(val) {
    if (!val || val === '' || val === 'N/A') return '';
    const s = String(val).trim();
    // Already in DD/MM/YYYY format
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return s;
    // Handle ISO timestamp (e.g., "2026-07-26T18:30:00.000Z")
    if (s.includes('T') && s.includes('Z')) {
        const d = new Date(s);
        if (!isNaN(d.getTime())) {
            // Add 5:30 for IST
            const ist = new Date(d.getTime() + 5.5 * 60 * 60 * 1000);
            const day = String(ist.getUTCDate()).padStart(2, '0');
            const mon = String(ist.getUTCMonth() + 1).padStart(2, '0');
            const year = ist.getUTCFullYear();
            return `${day}/${mon}/${year}`;
        }
    }
    // Handle YYYY-MM-DD format
    const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    return s;
}

function isISODate(val) {
    if (!val) return false;
    const s = String(val).trim();
    return s.includes('T') && s.includes('Z') && !isNaN(new Date(s).getTime());
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

// Detect column indices from header row
function detectColumns(headerRow, colOffset) {
    const headers = headerRow.map(h => String(h || '').toUpperCase().trim());
    // Find column index where header contains ANY of the keywords
    function findCol(keywords) {
        for (let i = 0; i < headers.length; i++) {
            for (const kw of keywords) {
                if (headers[i].includes(kw)) return i;
            }
        }
        return -1;
    }
    const arrival = findCol(['ARRIVAL']);
    const snacks = findCol(['SNACK']);
    // Snack% must contain both COMPLETION and SNACK (or just SNACK%)
    let snack_pct = -1;
    for (let i = 0; i < headers.length; i++) {
        if ((headers[i].includes('COMPLETION') && headers[i].includes('SNACK')) || headers[i].includes('SNACK%')) {
            snack_pct = i; break;
        }
    }
    const interested = findCol(['INTERESTED']);
    // Lunch% must contain LUNCH and (COMPLETION or %)
    let lunch_pct = -1;
    for (let i = 0; i < headers.length; i++) {
        if (headers[i].includes('LUNCH') && (headers[i].includes('COMPLETION') || headers[i].includes('%'))) {
            lunch_pct = i; break;
        }
    }
    // Lunch food column: contains "LUNCH" but NOT "COMPLETION" and NOT "%"
    let lunch = -1;
    for (let i = 0; i < headers.length; i++) {
        if (headers[i].includes('LUNCH') && !headers[i].includes('COMPLETION') && !headers[i].includes('%')) {
            lunch = i; break;
        }
    }
    // Water% must contain WATER
    const water_pct = findCol(['WATER']);
    const bottle = findCol(['BOTTLE', 'REFILL']);
    const uniform = findCol(['UNIFORM']);
    // Fallback to fixed offsets if detection fails
    const o = colOffset;
    return {
        arrival: arrival >= 0 ? arrival : o + 1,
        snacks: snacks >= 0 ? snacks : o + 2,
        snack_pct: snack_pct >= 0 ? snack_pct : o + 3,
        interested: interested >= 0 ? interested : o + 4,
        lunch_pct: lunch_pct,
        lunch: lunch,
        water_pct: water_pct >= 0 ? water_pct : o + 7,
        bottle: bottle >= 0 ? bottle : o + 8,
        uniform: uniform >= 0 ? uniform : o + 9
    };
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
        // If first cell looks like a date (DD/MM/YYYY or ISO) and second cell is a valid day name
        if ((/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cell0) || isISODate(row[0])) && validDays.includes(cell1)) {
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
            // Detect column mapping from header row
            const colMap = detectColumns(headerRow, colOffset);
            i++;
            const days = [];
            for (let d = 0; d < 6 && i < rows.length; d++, i++) {
                const r = rows[i] || [];
                // Day name is at colOffset position
                const dayName = (r[colOffset] || '').toUpperCase().trim();
                if (!validDays.includes(dayName)) break;
                days.push({
                    day: dayName,
                    date: colOffset === 1 ? formatDate(r[0]) : '',
                    arrival_time: formatArrivalTime(r[colMap.arrival]),
                    snacks: r[colMap.snacks] || 'N/A',
                    snack_completion: parsePercentage(r[colMap.snack_pct]),
                    interested_in: r[colMap.interested] || 'N/A',
                    lunch_completion: colMap.lunch_pct >= 0 ? parsePercentage(r[colMap.lunch_pct]) : 0,
                    lunch: colMap.lunch >= 0 ? (r[colMap.lunch] || 'N/A') : 'N/A',
                    water_completion: parsePercentage(r[colMap.water_pct]),
                    bottle_refill: parseBottle(r[colMap.bottle]),
                    uniform: r[colMap.uniform] || 'N/A'
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
        badge.textContent = '? LIVE (instant)';
    } else if (source === 'jsonp') {
        badge.style.background = '#d97706';
        badge.textContent = '? CACHED (~5min delay)';
    } else {
        badge.style.background = '#dc2626';
        badge.textContent = '? OFFLINE (fallback data)';
    }
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 6000);

    renderApp();
}
