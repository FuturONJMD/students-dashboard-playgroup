// ============================================
// FuturON Preschool - WhatsApp Daily Digest
// Google Apps Script for automated parent notifications
// ============================================
// SETUP INSTRUCTIONS:
// 1. Open Google Apps Script (script.google.com)
// 2. Create a new project named "FuturON WhatsApp Notifications"
// 3. Paste this code
// 4. Set up a daily trigger at 4:00 PM (Edit > Triggers > Add Trigger)
// 5. Configure the WHATSAPP_API_TOKEN and PHONE_NUMBER_ID below
// 6. Add parent phone numbers in the "Config" sheet tab

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // Google Sheet ID (same as the student data sheet)
    SHEET_ID: '1GUxeW2dhHY7Lnb9Mf42tqiBFCnu4ITd321-U-AiT1ik',
    
    // WhatsApp Business API (Meta)
    // Get these from: https://developers.facebook.com/apps/ > WhatsApp > API Setup
    WHATSAPP_API_TOKEN: 'YOUR_WHATSAPP_API_TOKEN_HERE',
    PHONE_NUMBER_ID: 'YOUR_PHONE_NUMBER_ID_HERE',
    
    // School info
    SCHOOL_NAME: 'FuturON Pre School Jammalamadugu',
    SCHOOL_CLASS: 'LKG CLASS',
    PORTAL_URL: 'https://futuronjmd.github.io/students-dashboard-lkg/',
    
    // Config sheet tab name (contains parent phone numbers)
    CONFIG_SHEET: 'ParentContacts',
    
    // Send time (for display in message)
    REPORT_TIME: '4:00 PM',
};

// ============================================
// MAIN FUNCTION - Daily Trigger
// ============================================
function sendDailyDigest() {
    const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const contacts = getParentContacts(ss);
    
    if (!contacts || contacts.length === 0) {
        Logger.log('No parent contacts found. Add contacts to the ParentContacts sheet.');
        return;
    }
    
    const today = new Date();
    const dayName = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][today.getDay()];
    
    // Skip weekends
    if (today.getDay() === 0) {
        Logger.log('Sunday - no notifications sent.');
        return;
    }
    
    contacts.forEach(contact => {
        try {
            const studentData = getTodayData(ss, contact.studentName, today);
            if (!studentData) {
                Logger.log(`No data found for ${contact.studentName} today.`);
                return;
            }
            
            const message = formatWhatsAppMessage(contact, studentData, today);
            sendWhatsAppMessage(contact.phone, message);
            Logger.log(`Sent digest to ${contact.parentName} (${contact.phone}) for ${contact.studentName}`);
            
            // Rate limiting - wait 1 second between messages
            Utilities.sleep(1000);
        } catch (e) {
            Logger.log(`Error sending to ${contact.parentName}: ${e.message}`);
        }
    });
}

// ============================================
// GET PARENT CONTACTS FROM CONFIG SHEET
// ============================================
function getParentContacts(ss) {
    let sheet;
    try {
        sheet = ss.getSheetByName(CONFIG.CONFIG_SHEET);
    } catch (e) {
        Logger.log('ParentContacts sheet not found. Creating template...');
        createContactsTemplate(ss);
        return [];
    }
    
    if (!sheet) {
        createContactsTemplate(ss);
        return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const contacts = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] && row[1] && row[2] && String(row[4]).toUpperCase() === 'YES') {
            contacts.push({
                studentName: String(row[0]).toUpperCase().trim(),
                parentName: String(row[1]).trim(),
                phone: formatPhone(String(row[2]).trim()),
                language: String(row[3] || 'en').toLowerCase().trim(),
                active: true
            });
        }
    }
    
    return contacts;
}

// ============================================
// CREATE CONTACTS TEMPLATE SHEET
// ============================================
function createContactsTemplate(ss) {
    const sheet = ss.insertSheet(CONFIG.CONFIG_SHEET);
    sheet.getRange('A1:E1').setValues([['Student Name', 'Parent Name', 'Phone (with country code)', 'Language (en/te/hi)', 'Active (YES/NO)']]);
    sheet.getRange('A2:E2').setValues([['DHANVIKA', 'Parent Name', '919876543210', 'en', 'YES']]);
    sheet.getRange('A1:E1').setFontWeight('bold');
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(2, 150);
    sheet.setColumnWidth(3, 180);
    sheet.setColumnWidth(4, 120);
    sheet.setColumnWidth(5, 100);
    Logger.log('Created ParentContacts template sheet. Please fill in parent details.');
}

// ============================================
// GET TODAY'S DATA FOR A STUDENT
// ============================================
function getTodayData(ss, studentName, today) {
    const sheet = ss.getSheetByName(studentName);
    if (!sheet) return null;
    
    const data = sheet.getDataRange().getValues();
    const todayStr = Utilities.formatDate(today, 'Asia/Kolkata', 'dd/MM/yyyy');
    const dayName = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][today.getDay()];
    
    // Search for today's row
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const cellDate = row[0];
        
        // Match by day name in column B or date in column A
        if ((cellDate instanceof Date && Utilities.formatDate(cellDate, 'Asia/Kolkata', 'dd/MM/yyyy') === todayStr) ||
            (String(row[1]).toUpperCase().trim() === dayName && i > data.length - 15)) {
            
            // Check if student was present (has arrival time that's not ABSENT/HOLIDAY)
            const arrivalTime = String(row[2] || '').trim();
            if (!arrivalTime || arrivalTime.toUpperCase() === 'ABSENT') {
                return { present: false, day: dayName };
            }
            if (arrivalTime.toUpperCase().includes('HOLIDAY') || arrivalTime.toUpperCase().includes('DAY')) {
                return { present: false, holiday: true, holidayName: arrivalTime, day: dayName };
            }
            
            return {
                present: true,
                day: dayName,
                arrivalTime: formatArrivalTime(arrivalTime),
                snacks: String(row[3] || ''),
                snackCompletion: parsePercentage(row[4]),
                interestedIn: String(row[5] || ''),
                lunchCompletion: parsePercentage(row[6]),
                lunch: String(row[7] || ''),
                waterCompletion: parsePercentage(row[8]),
                bottleRefills: parseInt(row[9]) || 0,
                uniform: String(row[10] || 'YES'),
            };
        }
    }
    
    return null;
}

// ============================================
// FORMAT WHATSAPP MESSAGE
// ============================================
function formatWhatsAppMessage(contact, data, today) {
    const dateStr = Utilities.formatDate(today, 'Asia/Kolkata', 'dd MMM yyyy');
    const studentName = contact.studentName.charAt(0) + contact.studentName.slice(1).toLowerCase();
    const portalLink = `${CONFIG.PORTAL_URL}?student=${encodeURIComponent(contact.studentName)}`;
    
    if (data.holiday) {
        return `🏫 *${CONFIG.SCHOOL_NAME}*\n📅 ${dateStr}\n\n` +
               `👤 Student: *${studentName}* (${CONFIG.SCHOOL_CLASS})\n\n` +
               `🎉 Today is a holiday: ${data.holidayName}\n\n` +
               `Have a wonderful day! 🌟`;
    }
    
    if (!data.present) {
        return `🏫 *${CONFIG.SCHOOL_NAME}*\n📅 ${dateStr}\n\n` +
               `👤 Student: *${studentName}* (${CONFIG.SCHOOL_CLASS})\n\n` +
               `📋 Status: Absent today\n\n` +
               `We missed ${studentName} today! Each school day includes structured learning, ` +
               `3L skills, co-curricular activities, and interactive sessions.\n\n` +
               `Looking forward to seeing ${studentName} tomorrow! 🙏`;
    }
    
    // Calculate overall score
    const overall = Math.round((data.snackCompletion + data.lunchCompletion + data.waterCompletion) / 3);
    const overallEmoji = overall >= 90 ? '🌟' : overall >= 70 ? '👍' : '📈';
    
    let msg = `🏫 *${CONFIG.SCHOOL_NAME}*\n`;
    msg += `📅 *Daily Report* - ${dateStr}\n\n`;
    msg += `👤 Student: *${studentName}* (${CONFIG.SCHOOL_CLASS})\n`;
    msg += `⏰ Arrival: ${data.arrivalTime}\n\n`;
    msg += `━━━━━━━━━━━━━━━━\n`;
    msg += `🍎 *Snack:* ${data.snackCompletion}% (${data.snacks})\n`;
    msg += `🍽️ *Lunch:* ${data.lunchCompletion}% (${data.lunch})\n`;
    msg += `💧 *Water:* ${data.waterCompletion}% (${data.bottleRefills + 1} bottles)\n`;
    msg += `👕 *Uniform:* ${data.uniform}\n`;
    msg += `━━━━━━━━━━━━━━━━\n\n`;
    msg += `${overallEmoji} *Overall: ${overall}%* - ${overall >= 90 ? 'Excellent day!' : overall >= 70 ? 'Good day!' : 'Needs attention'}\n\n`;
    msg += `📊 View full report:\n${portalLink}`;
    
    return msg;
}

// ============================================
// SEND WHATSAPP MESSAGE VIA META API
// ============================================
function sendWhatsAppMessage(phone, message) {
    const url = `https://graph.facebook.com/v18.0/${CONFIG.PHONE_NUMBER_ID}/messages`;
    
    const payload = {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: message }
    };
    
    const options = {
        method: 'post',
        contentType: 'application/json',
        headers: {
            'Authorization': `Bearer ${CONFIG.WHATSAPP_API_TOKEN}`
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
        throw new Error(`WhatsApp API error (${responseCode}): ${response.getContentText()}`);
    }
    
    return JSON.parse(response.getContentText());
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function formatPhone(phone) {
    // Remove spaces, dashes, plus sign
    let cleaned = phone.replace(/[\s\-\+]/g, '');
    // Add country code if not present
    if (cleaned.length === 10) cleaned = '91' + cleaned;
    return cleaned;
}

function parsePercentage(value) {
    if (typeof value === 'number') return Math.round(value * 100);
    const str = String(value || '0');
    if (str.includes('%')) return parseInt(str);
    const num = parseFloat(str);
    if (num <= 1) return Math.round(num * 100);
    return Math.round(num);
}

function formatArrivalTime(timeStr) {
    // Handle Excel time serial numbers or "HH:MM" strings
    if (timeStr instanceof Date) {
        return Utilities.formatDate(timeStr, 'Asia/Kolkata', 'h:mm a');
    }
    const match = String(timeStr).match(/(\d{1,2}):(\d{2})/);
    if (match) {
        let h = parseInt(match[1]), m = match[2];
        const ampm = h >= 12 ? 'PM' : 'AM';
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        return `${h}:${m} ${ampm}`;
    }
    return timeStr;
}

// ============================================
// MANUAL TEST FUNCTION
// ============================================
function testSendToSelf() {
    // Change this to your own number for testing
    const testPhone = '919876543210';
    const testMessage = '🏫 *FuturON Pre School Jammalamadugu*\n📅 Test Message\n\nThis is a test notification. If you received this, WhatsApp integration is working! ✅';
    
    try {
        sendWhatsAppMessage(testPhone, testMessage);
        Logger.log('Test message sent successfully!');
    } catch (e) {
        Logger.log('Test failed: ' + e.message);
    }
}

// ============================================
// SETUP DAILY TRIGGER
// ============================================
function setupDailyTrigger() {
    // Remove existing triggers
    ScriptApp.getProjectTriggers().forEach(trigger => {
        if (trigger.getHandlerFunction() === 'sendDailyDigest') {
            ScriptApp.deleteTrigger(trigger);
        }
    });
    
    // Create new daily trigger at 4:00 PM IST
    ScriptApp.newTrigger('sendDailyDigest')
        .timeBased()
        .atHour(16)
        .everyDays(1)
        .inTimezone('Asia/Kolkata')
        .create();
    
    Logger.log('Daily trigger set for 4:00 PM IST');
}
