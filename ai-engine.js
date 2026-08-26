// ============================================
// AI Intelligence Engine - FuturON Preschool
// Pattern Recognition, Trend Analysis, Contextual Insights
// ============================================

const AIEngine = {

    // === HELPERS ===
    // Check if a day has any data entered (vs placeholder/future day)
    isSecondSaturday(d) {
        if (d.day !== 'SATURDAY') return false;
        if (d.arrival_time && d.arrival_time.toUpperCase().includes('SECOND SATURDAY')) return true;
        if (d.date) {
            const m = String(d.date).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (m) { const day = parseInt(m[1]); if (day >= 8 && day <= 14) return true; }
        }
        return false;
    },

    isHoliday(d) {
        if (this.isSecondSaturday(d)) return true;
        if (d.arrival_time && (d.arrival_time.toUpperCase() === 'HOLIDAY' || d.arrival_time.toUpperCase().includes('HOLIDAY'))) return true;
        return false;
    },

    isFutureDay(d) {
        if (!d.date) return false;
        const m = String(d.date).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (!m) return false;
        const dayDate = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dayDate > today;
    },

    hasData(d) {
        if (this.isHoliday(d)) return false;
        if (this.isFutureDay(d)) return false;
        if (d.date && d.date !== '' && d.date !== 'N/A') return true;
        if (d.arrival_time && d.arrival_time !== 'N/A') return true;
        if (d.snacks && d.snacks !== 'N/A') return true;
        if (d.lunch && d.lunch !== 'N/A') return true;
        if (d.snack_completion > 0 || d.lunch_completion > 0 || d.water_completion > 0) return true;
        return false;
    },

    // Check if child is present — ONLY valid arrival_time means present
    isPresent(d) {
        if (!d.arrival_time || d.arrival_time === 'N/A' || d.arrival_time === '-' || 
            d.arrival_time === '' || d.arrival_time.toUpperCase() === 'ABSENT') return false;
        return true;
    },

    getActive(weekData) {
        // Only present days: exclude holidays (hasData=false) and absent days
        return weekData.days.filter(d => this.hasData(d) && this.isPresent(d));
    },

    pct(val) { return Math.min(Math.round(val * 100), 100); },

    avg(activeDays, metric) {
        if (!activeDays.length) return 0;
        // Saturday is half-day (no lunch served), exclude from lunch average
        const days = metric === 'lunch_completion' ? activeDays.filter(d => d.day !== 'SATURDAY') : activeDays;
        if (!days.length) return 0;
        return days.reduce((s, d) => s + this.pct(d[metric]), 0) / days.length;
    },

    // === PATTERN RECOGNITION ===
    detectFoodPreferences(studentName) {
        const weeks = studentsData[studentName];
        const snackCounts = {};
        const lunchCounts = {};
        const highCompletionSnacks = {};
        const lowCompletionSnacks = {};

        weeks.forEach(w => {
            this.getActive(w).forEach(d => {
                const snack = String(d.snacks || '').toUpperCase().trim();
                const lunch = String(d.lunch || '').toUpperCase().trim();
                if (snack && snack !== 'N/A') {
                    snackCounts[snack] = (snackCounts[snack] || 0) + 1;
                    if (this.pct(d.snack_completion) >= 90) highCompletionSnacks[snack] = (highCompletionSnacks[snack] || 0) + 1;
                    if (this.pct(d.snack_completion) < 50) lowCompletionSnacks[snack] = (lowCompletionSnacks[snack] || 0) + 1;
                }
                if (lunch && lunch !== 'N/A') lunchCounts[lunch] = (lunchCounts[lunch] || 0) + 1;
            });
        });

        const topSnacks = Object.entries(highCompletionSnacks).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
        const avoidSnacks = Object.entries(lowCompletionSnacks).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);
        const mostFrequentSnack = Object.entries(snackCounts).sort((a, b) => b[1] - a[1])[0];

        return { topSnacks, avoidSnacks, mostFrequentSnack: mostFrequentSnack ? mostFrequentSnack[0] : null, snackCounts, lunchCounts };
    },

    // === CONSISTENCY SCORING (0-100) ===
    calculateConsistencyScore(studentName, weekIdx) {
        const weeks = studentsData[studentName];
        const currentWeek = weeks[weekIdx];
        const active = this.getActive(currentWeek);
        if (!active.length) return { score: 0, grade: 'N/A', factors: [] };

        const factors = [];
        let score = 0;

        // Calculate actual school days (exclude days with no data — holidays/future)
        const allDays = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
        const weekDays = allDays.map(dayName => {
            const found = currentWeek.days.find(d => d.day === dayName);
            return found || { day: dayName, arrival_time: 'N/A', snacks: 'N/A', lunch: 'N/A', snack_completion: 0, lunch_completion: 0, water_completion: 0 };
        });
        const totalSchoolDays = weekDays.filter(d => this.hasData(d)).length || active.length;

        // Attendance consistency (max 25 points)
        const attendancePct = (active.length / totalSchoolDays) * 100;
        const attendanceScore = Math.min(25, Math.round(attendancePct / 4));
        score += attendanceScore;
        factors.push({ label: 'Attendance', value: attendanceScore, max: 25 });

        // Meal consistency (max 25 points) - low variance = high consistency
        const snackValues = active.map(d => this.pct(d.snack_completion));
        // Exclude Saturday from lunch variance (half-day, no lunch)
        const lunchDays = active.filter(d => d.day !== 'SATURDAY');
        const lunchValues = lunchDays.map(d => this.pct(d.lunch_completion));
        const snackVariance = this.variance(snackValues);
        const lunchVariance = this.variance(lunchValues);
        const mealConsistency = Math.max(0, 25 - Math.round((snackVariance + lunchVariance) / 80));
        score += mealConsistency;
        factors.push({ label: 'Meal Regularity', value: mealConsistency, max: 25 });

        // Hydration consistency (max 25 points)
        const waterValues = active.map(d => this.pct(d.water_completion));
        const waterAvg = waterValues.reduce((s, v) => s + v, 0) / waterValues.length;
        const hydrationScore = Math.min(25, Math.round(waterAvg / 4));
        score += hydrationScore;
        factors.push({ label: 'Hydration', value: hydrationScore, max: 25 });

        // Punctuality (max 25 points) - based on arrival times
        const arrivalMinutes = active.map(d => this.parseTimeToMinutes(d.arrival_time)).filter(m => m > 0);
        let punctualityScore = 25;
        if (arrivalMinutes.length) {
            const lateArrivals = arrivalMinutes.filter(m => m > 545); // After 9:05 AM
            punctualityScore = Math.max(0, 25 - (lateArrivals.length * 5));
        }
        score += punctualityScore;
        factors.push({ label: 'Punctuality', value: punctualityScore, max: 25 });

        const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B+' : score >= 60 ? 'B' : score >= 50 ? 'C' : 'D';
        return { score, grade, factors };
    },

    variance(arr) {
        if (!arr.length) return 0;
        const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
        return arr.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / arr.length;
    },

    parseTimeToMinutes(timeStr) {
        if (!timeStr || timeStr === 'N/A') return 0;
        const match = String(timeStr).match(/(\d{1,2}):(\d{2})/);
        if (!match) return 0;
        let h = parseInt(match[1]);
        const m = parseInt(match[2]);
        if (timeStr.includes('PM') && h < 12) h += 12;
        return h * 60 + m;
    },

    // === TREND FORECASTING ===
    forecastNextWeek(studentName) {
        const weeks = studentsData[studentName];
        if (weeks.length < 2) return null;

        const metrics = ['snack_completion', 'lunch_completion', 'water_completion'];
        const forecast = {};

        metrics.forEach(metric => {
            const values = weeks.map(w => {
                const active = this.getActive(w);
                return active.length ? Math.round(this.avg(active, metric)) : null;
            }).filter(v => v !== null);

            if (values.length < 2) { forecast[metric] = { predicted: values[0] || 0, direction: 'stable', confidence: 'low' }; return; }

            // Simple linear regression for trend
            const n = values.length;
            const xMean = (n - 1) / 2;
            const yMean = values.reduce((s, v) => s + v, 0) / n;
            let num = 0, den = 0;
            values.forEach((y, x) => { num += (x - xMean) * (y - yMean); den += (x - xMean) * (x - xMean); });
            const slope = den ? num / den : 0;
            const predicted = Math.max(0, Math.min(100, Math.round(yMean + slope * (n - xMean))));

            const direction = slope > 3 ? 'improving' : slope < -3 ? 'declining' : 'stable';
            const confidence = n >= 3 ? 'high' : 'medium';
            forecast[metric] = { predicted, direction, confidence, slope: Math.round(slope * 10) / 10 };
        });

        // Attendance forecast
        const attendanceValues = weeks.map(w => this.getActive(w).length);
        const avgAttendance = attendanceValues.reduce((s, v) => s + v, 0) / attendanceValues.length;
        forecast.attendance = { predicted: Math.round(avgAttendance), direction: 'stable', confidence: 'medium' };

        return forecast;
    },

    // === ARRIVAL TIME ANALYSIS ===
    analyzeArrivalPattern(studentName, weekIdx) {
        const weeks = studentsData[studentName];
        const currentWeek = weeks[weekIdx];
        const active = this.getActive(currentWeek);
        const times = active.map(d => this.parseTimeToMinutes(d.arrival_time)).filter(m => m > 0);

        if (!times.length) return null;

        const avgTime = Math.round(times.reduce((s, t) => s + t, 0) / times.length);
        const earliestTime = Math.min(...times);
        const latestTime = Math.max(...times);
        const lateCount = times.filter(t => t > 545).length; // After 9:05 AM

        const formatTime = (mins) => {
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
            return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
        };

        return {
            average: formatTime(avgTime),
            earliest: formatTime(earliestTime),
            latest: formatTime(latestTime),
            lateCount,
            onTimePercentage: Math.round(((times.length - lateCount) / times.length) * 100)
        };
    },

    // ============================
    // 1. PERSONALIZED TIPS (Enhanced)
    // ============================
    generateTips(studentName, weekIdx) {
        const weeks = studentsData[studentName];
        const currentWeek = weeks[weekIdx];
        const active = this.getActive(currentWeek);
        const tips = [];
        const name = studentName.charAt(0) + studentName.slice(1).toLowerCase();

        if (!active.length) {
            tips.push({ icon: icon('alert'), text: `${name} was not present this week. Each school day encompasses structured learning modules, 3L skill development, co-curricular activities, dramatic arts, and interactive sessions. We look forward to welcoming ${name} back.`, severity: 'critical' });
            return tips;
        }

        const snackAvg = Math.round(this.avg(active, 'snack_completion'));
        const lunchAvg = Math.round(this.avg(active, 'lunch_completion'));
        const waterAvg = Math.round(this.avg(active, 'water_completion'));
        const attendance = active.length;
        // Calculate actual school days for this week (excludes holidays/future days)
        const allWeekDays = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'].map(dayName => {
            const found = currentWeek.days.find(d => d.day === dayName);
            return found || { day: dayName, arrival_time: 'N/A', snacks: 'N/A', lunch: 'N/A', snack_completion: 0, lunch_completion: 0, water_completion: 0 };
        });
        const totalSchoolDays = allWeekDays.filter(d => this.hasData(d)).length || attendance;
        const absentDays = totalSchoolDays - attendance;
        const bottleRefills = active.reduce((s, d) => s + d.bottle_refill, 0);
        const weekBottles = bottleRefills + attendance;

        // Monthly cumulative
        let monthlyBottles = 0, monthlyDaysPresent = 0;
        for (let w = 0; w <= weekIdx; w++) {
            const wActive = this.getActive(weeks[w]);
            monthlyBottles += wActive.reduce((s, d) => s + d.bottle_refill, 0) + wActive.length;
            monthlyDaysPresent += wActive.length;
        }

        // Consistency score insight
        const consistency = this.calculateConsistencyScore(studentName, weekIdx);
        tips.push({ icon: icon('barChart'), text: `${name}'s weekly consistency index: ${consistency.score}/100 (Grade: ${consistency.grade}). ${consistency.score >= 80 ? 'Demonstrating excellent daily routine adherence.' : consistency.score >= 60 ? 'Maintaining good routine with scope for improvement.' : 'Minor adjustments in daily routine at home can yield significant progress.'}`, severity: consistency.score >= 80 ? 'positive' : consistency.score >= 60 ? 'info' : 'warning' });

        // Snack tips
        if (snackAvg >= 90) tips.push({ icon: icon('star'), text: `${name} demonstrates excellent morning snack consumption (${snackAvg}%). Kindly continue with similar food items.`, severity: 'positive' });
        else if (snackAvg >= 70) tips.push({ icon: icon('apple'), text: `${name} consumed ${snackAvg}% of morning snacks. Incorporating preferred fruits may further improve intake.`, severity: 'info' });
        else if (snackAvg >= 50) tips.push({ icon: icon('apple'), text: `${name} consumed only ${snackAvg}% of morning snacks. Smaller portions or varied items are recommended.`, severity: 'warning' });
        else tips.push({ icon: icon('apple'), text: `${name}'s morning snack intake is below expected levels (${snackAvg}%). Kindly explore preferred food options or adjust portion size.`, severity: 'critical' });

        // Lunch tips
        if (lunchAvg >= 90) tips.push({ icon: icon('star'), text: `${name} demonstrates excellent afternoon meal consumption (${lunchAvg}%). Healthy appetite observed at school.`, severity: 'positive' });
        else if (lunchAvg >= 70) tips.push({ icon: icon('utensils'), text: `${name} consumed ${lunchAvg}% of afternoon meals. Good progress; preferred menu items may further improve intake.`, severity: 'info' });
        else if (lunchAvg >= 50) tips.push({ icon: icon('utensils'), text: `${name} consumed only ${lunchAvg}% of afternoon meals. Lighter or preferred meal options are recommended.`, severity: 'warning' });
        else tips.push({ icon: icon('utensils'), text: `${name}'s afternoon meal intake requires attention (${lunchAvg}%). Kindly explore alternative meal options or adjust portion size.`, severity: 'critical' });

        // Water tips with monthly context
        if (waterAvg >= 90) tips.push({ icon: icon('droplet'), text: `${name} maintains excellent hydration levels (${waterAvg}%). Weekly consumption: ${Math.round(weekBottles)} bottles. Monthly total: ${Math.round(monthlyBottles)} bottles across ${monthlyDaysPresent} days. As per WHO guidelines for ages ${WHO_WATER_STANDARDS[CURRENT_CLASS].ageRange}, daily intake of ~${WHO_WATER_STANDARDS[CURRENT_CLASS].dailyLitres}L is recommended — well maintained.`, severity: 'positive' });
        else if (waterAvg >= 70) tips.push({ icon: icon('droplet'), text: `${name}'s hydration level stands at ${waterAvg}%. Weekly: ${Math.round(weekBottles)} bottles (monthly: ${Math.round(monthlyBottles)}). WHO recommends ~${WHO_WATER_STANDARDS[CURRENT_CLASS].schoolLitres}L during school hours for ages ${WHO_WATER_STANDARDS[CURRENT_CLASS].ageRange}. Encouraging regular sips throughout the day is advisable.`, severity: 'info' });
        else if (waterAvg >= 50) tips.push({ icon: icon('droplet'), text: `${name}'s hydration is moderate (${waterAvg}%). Weekly: ${Math.round(weekBottles)} bottles. WHO recommends ~${WHO_WATER_STANDARDS[CURRENT_CLASS].schoolBottles} bottles during school hours for ages ${WHO_WATER_STANDARDS[CURRENT_CLASS].ageRange}. A larger bottle or infused water may encourage better intake.`, severity: 'warning' });
        else tips.push({ icon: icon('droplet'), text: `${name}'s water intake requires immediate attention (${waterAvg}%). Only ${Math.round(weekBottles)} bottles this week. WHO recommends ~${WHO_WATER_STANDARDS[CURRENT_CLASS].dailyLitres}L daily for ages ${WHO_WATER_STANDARDS[CURRENT_CLASS].ageRange}. Establishing regular hydration breaks at home is strongly recommended.`, severity: 'critical' });

        // Attendance
        if (attendance === totalSchoolDays && totalSchoolDays > 0) tips.push({ icon: icon('trophy'), text: `Full attendance achieved! ${name} was present all ${totalSchoolDays} working days this week. Regular attendance fosters consistent learning habits.`, severity: 'positive' });
        else if (absentDays === 1) tips.push({ icon: icon('calendar'), text: `${name} was absent for 1 day this week (${attendance} of ${totalSchoolDays} working days attended). That day included structured learning modules, 3L skills, co-curricular activities, and interactive sessions — looking forward to full attendance next week.`, severity: 'info' });
        else if (absentDays >= 2) tips.push({ icon: icon('calendar'), text: `${name} was absent for ${absentDays} days this week. Each school day encompasses structured learning, 3L skills, co-curricular activities, dramatic arts, and interactive sessions — regular attendance ensures your child benefits from all programmes.`, severity: 'warning' });

        // Arrival time insight
        const arrivalPattern = this.analyzeArrivalPattern(studentName, weekIdx);
        if (arrivalPattern) {
            if (arrivalPattern.onTimePercentage === 100) {
                tips.push({ icon: icon('clock'), text: `${name} reported on time every day (average check-in: ${arrivalPattern.average}). Excellent punctuality demonstrated.`, severity: 'positive' });
            } else if (arrivalPattern.lateCount >= 2) {
                tips.push({ icon: icon('clock'), text: `${name} arrived after 9:05 AM on ${arrivalPattern.lateCount} day(s) this week (latest: ${arrivalPattern.latest}). School commences at 9:00 AM with morning assembly, physical exercises, and yoga — timely arrival enables full participation.`, severity: 'warning' });
            }
        }

        // Food preference insight (only if multiple weeks available)
        if (weekIdx >= 1) {
            const prefs = this.detectFoodPreferences(studentName);
            if (prefs.topSnacks.length > 0) {
                tips.push({ icon: icon('brain'), text: `Pattern identified: ${name} shows higher intake when served ${prefs.topSnacks.slice(0, 2).join(' or ')}. Including these items more frequently is recommended.`, severity: 'info' });
            }
        }



        // Uniform compliance
        const nonUniformDays = active.filter(d => d.uniform === 'NO').length;
        if (nonUniformDays > 0) {
            tips.push({ icon: icon('shirt'), text: `${name} was not in prescribed uniform on ${nonUniformDays} day(s). Adherence to dress code fosters discipline and institutional identity. Kindly refer to the school calendar for uniform and colour dress schedules.`, severity: 'warning' });
        }

        return tips;
    },

    // ============================
    // 2. WEEKLY SUMMARY (Enhanced)
    // ============================
    generateWeeklySummary(studentName, weekIdx) {
        const weeks = studentsData[studentName];
        const currentWeek = weeks[weekIdx];
        const active = this.getActive(currentWeek);
        const name = studentName.charAt(0) + studentName.slice(1).toLowerCase();

        if (!active.length) {
            return `${name} was not present during ${currentWeek.label}. No activity data is available for this period. Each school day encompasses structured learning modules, 3L skill development, co-curricular activities, dramatic arts, and interactive sessions. Daily updates will resume upon ${name}'s return.`;
        }

        const snackAvg = Math.round(this.avg(active, 'snack_completion'));
        const lunchAvg = Math.round(this.avg(active, 'lunch_completion'));
        const waterAvg = Math.round(this.avg(active, 'water_completion'));
        const overall = Math.round((snackAvg + lunchAvg + waterAvg) / 3);
        const attendance = active.length;
        const bottleRefills = active.reduce((s, d) => s + d.bottle_refill, 0);
        const weekBottles = bottleRefills + attendance;
        // Calculate actual school days
        const allWeekDays2 = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'].map(dayName => {
            const found = currentWeek.days.find(d => d.day === dayName);
            return found || { day: dayName, arrival_time: 'N/A', snacks: 'N/A', lunch: 'N/A', snack_completion: 0, lunch_completion: 0, water_completion: 0 };
        });
        const totalSchoolDays = allWeekDays2.filter(d => this.hasData(d)).length || attendance;

        // Monthly cumulative
        let monthlyBottles = 0, monthlyDaysPresent = 0;
        for (let w = 0; w <= weekIdx; w++) {
            const wActive = this.getActive(weeks[w]);
            monthlyBottles += wActive.reduce((s, d) => s + d.bottle_refill, 0) + wActive.length;
            monthlyDaysPresent += wActive.length;
        }

        // Consistency score
        const consistency = this.calculateConsistencyScore(studentName, weekIdx);

        let summary = `${name} attended ${attendance} of ${totalSchoolDays} working days during ${currentWeek.label}. `;

        if (overall >= 90) summary += `Demonstrated excellent performance this week with ${overall}% overall wellness score. `;
        else if (overall >= 70) summary += `Performed well this week with ${overall}% overall wellness score. `;
        else if (overall >= 50) summary += `Performance was moderate at ${overall}% — scope for improvement exists. `;
        else summary += `Performance requires attention with ${overall}% overall score. Focused effort in the areas highlighted below is recommended. `;

        // Consistency grade
        summary += `Consistency Grade: ${consistency.grade} (${consistency.score}/100). `;

        // Strengths
        const strengths = [];
        if (snackAvg >= 90) strengths.push('morning snack intake');
        if (lunchAvg >= 90) strengths.push('afternoon meal intake');
        if (waterAvg >= 90) strengths.push('hydration levels');
        if (strengths.length) summary += `Excelling in: ${strengths.join(', ')}. `;

        // Areas needing work
        const improvements = [];
        if (snackAvg < 60) improvements.push(`morning snack (${snackAvg}%)`);
        if (lunchAvg < 60) improvements.push(`afternoon meal (${lunchAvg}%)`);
        if (waterAvg < 60) improvements.push(`hydration (${waterAvg}%)`);
        if (improvements.length) summary += `Requires improvement in: ${improvements.join(', ')}. `;

        summary += `Weekly hydration: ${Math.round(weekBottles)} bottles (${attendance} carried + ${Math.round(bottleRefills)} refills). Monthly cumulative: ${Math.round(monthlyBottles)} bottles across ${monthlyDaysPresent} days. `;

        // Trend comparison
        if (weekIdx > 0) {
            const prevActive = this.getActive(weeks[weekIdx - 1]);
            if (prevActive.length) {
                const prevOverall = Math.round((this.avg(prevActive, 'snack_completion') + this.avg(prevActive, 'lunch_completion') + this.avg(prevActive, 'water_completion')) / 3);
                if (overall > prevOverall + 5) summary += `An improvement of ${overall - prevOverall}% observed compared to the previous week.`;
                else if (prevOverall > overall + 5) summary += `A decline of ${prevOverall - overall}% observed from the previous week. The areas highlighted above warrant attention.`;
                else summary += `Performance remains consistent with the previous week.`;
            }
        }

        return summary;
    },

    // ============================
    // 3. ANOMALY DETECTION (Enhanced)
    // ============================
    detectAnomalies(studentName, weekIdx) {
        const weeks = studentsData[studentName];
        const currentWeek = weeks[weekIdx];
        const active = this.getActive(currentWeek);
        const anomalies = [];
        const name = studentName.charAt(0) + studentName.slice(1).toLowerCase();
        // Consecutive absent days - only check days that have data entered
        // (don't count future/not-yet-entered days as absent)
        const daysWithData = currentWeek.days.filter(d => this.hasData(d));
        let consecutiveAbsent = 0, maxConsecutive = 0;
        daysWithData.forEach(d => {
            const absent = !this.isPresent(d);
            if (absent) { consecutiveAbsent++; maxConsecutive = Math.max(maxConsecutive, consecutiveAbsent); }
            else { consecutiveAbsent = 0; }
        });

        if (maxConsecutive >= 3) anomalies.push({ severity: 'critical', icon: icon('alertCircle'), text: `${name} was absent for ${maxConsecutive} consecutive days this week. Structured learning modules, 3L skill development, and co-curricular activities were missed — regular attendance is essential for holistic development.`, type: 'attendance' });
        else if (maxConsecutive === 2) anomalies.push({ severity: 'warning', icon: icon('alert'), text: `${name} was absent for 2 consecutive days this week. Consistent attendance enables your child to maintain learning continuity and peer engagement.`, type: 'attendance' });

        if (!active.length) return anomalies;

        // Sudden daily drops (present but 0%)
        active.forEach(d => {
            if (this.pct(d.snack_completion) === 0 && d.snacks !== 'N/A') anomalies.push({ severity: 'warning', icon: icon('alert'), text: `${d.day}: ${name} did not consume morning snack despite it being provided. Preference changes may be a factor.`, type: 'metric' });
            if (this.pct(d.lunch_completion) === 0 && d.lunch !== 'N/A') anomalies.push({ severity: 'warning', icon: icon('alert'), text: `${d.day}: ${name} did not consume afternoon meal. Dietary preferences may be evolving — alternative options are worth exploring.`, type: 'metric' });
            if (this.pct(d.water_completion) === 0) anomalies.push({ severity: 'critical', icon: icon('alertCircle'), text: `${d.day}: ${name} recorded zero water intake. Establishing regular hydration habits at home is strongly advised.`, type: 'health' });
        });

        // Late arrival pattern
        const arrivalPattern = this.analyzeArrivalPattern(studentName, weekIdx);
        if (arrivalPattern && arrivalPattern.lateCount >= 3) {
            anomalies.push({ severity: 'warning', icon: icon('alert'), text: `${name} arrived after 9:05 AM on ${arrivalPattern.lateCount} of ${active.length} days this week (average check-in: ${arrivalPattern.average}). School commences at 9:00 AM with morning assembly, physical exercises, and yoga — punctual arrival enables full participation in all activities.`, type: 'punctuality' });
        }

        // Week-over-week drops
        if (weekIdx > 0) {
            const prevActive = this.getActive(weeks[weekIdx - 1]);
            if (prevActive.length && active.length) {
                const metrics = ['snack_completion', 'lunch_completion', 'water_completion'];
                const labels = ['Snack', 'Lunch', 'Water'];
                metrics.forEach((m, i) => {
                    const curr = this.avg(active, m);
                    const prev = this.avg(prevActive, m);
                    if (prev - curr > 30) anomalies.push({ severity: 'critical', icon: icon('alertCircle'), text: `${labels[i]} intake declined significantly — from ${Math.round(prev)}% to ${Math.round(curr)}% this week. Dietary phases are normal; exploring new options or adjusted portions may help.`, type: 'trend' });
                    else if (prev - curr > 20) anomalies.push({ severity: 'warning', icon: icon('alert'), text: `${labels[i]} intake declined by ${Math.round(prev - curr)}% compared to previous week. Minor adjustments in routine or menu may restore levels.`, type: 'trend' });
                });

                // Only compare attendance if both weeks have similar data completeness
                const prevAttendance = prevActive.length;
                const prevTotalDays = weeks[weekIdx - 1].days.filter(d => this.hasData(d)).length;
                const currTotalDays = currentWeek.days.filter(d => this.hasData(d)).length;
                // Only flag if current week has at least as many days of data as previous week
                if (currTotalDays >= prevTotalDays && prevAttendance - active.length >= 2) {
                    anomalies.push({ severity: 'warning', icon: icon('alert'), text: `${name} attended ${prevAttendance - active.length} fewer days compared to previous week. Regular attendance supports learning continuity and peer relationships.`, type: 'attendance' });
                }
            }
        }

        // Low streak detection (3+ days below 50%)
        const checkStreak = (metric, label) => {
            let lowStreak = 0;
            active.forEach(d => { if (this.pct(d[metric]) < 50 && this.pct(d[metric]) > 0) lowStreak++; });
            if (lowStreak >= 3) anomalies.push({ severity: 'warning', icon: icon('alert'), text: `${label} intake was below 50% on ${lowStreak} days this week. Exploring alternative options may yield improvement.`, type: 'pattern' });
        };
        checkStreak('snack_completion', 'Snacks');
        checkStreak('lunch_completion', 'Lunch');
        checkStreak('water_completion', 'Water');

        // Variance anomaly (wildly inconsistent within the week)
        const snackValues = active.map(d => this.pct(d.snack_completion));
        if (snackValues.length >= 3 && this.variance(snackValues) > 1500) {
            anomalies.push({ severity: 'info', icon: icon('barChart'), text: `${name}'s morning snack consumption varied considerably this week (${Math.min(...snackValues)}% to ${Math.max(...snackValues)}%). Identifying preferred items on high-intake days is recommended.`, type: 'pattern' });
        }

        return anomalies;
    },

    // ============================
    // 4. TEACHER RECOMMENDATIONS (Enhanced)
    // ============================
    generateRecommendations(weekIdx) {
        const recs = [];
        const weekLabel = studentsData[Object.keys(studentsData)[0]][weekIdx]?.label;

        Object.keys(studentsData).forEach(studentName => {
            const weeks = studentsData[studentName];
            const week = weeks.find(w => w.label === weekLabel);
            if (!week) return;
            const active = this.getActive(week);
            const name = studentName.charAt(0) + studentName.slice(1).toLowerCase();

            if (active.length === 0) {
                recs.push({ priority: 'urgent', icon: icon('siren'), text: `${name} was absent the entire week. Immediate parent communication recommended.`, student: studentName });
                return;
            }
            if (active.length <= 2) {
                recs.push({ priority: 'urgent', icon: icon('alert'), text: `${name} attended only ${active.length} days this week. Follow-up on absences recommended.`, student: studentName });
            }

            const snackAvg = this.avg(active, 'snack_completion');
            const lunchAvg = this.avg(active, 'lunch_completion');
            const waterAvg = this.avg(active, 'water_completion');
            const overall = (snackAvg + lunchAvg + waterAvg) / 3;

            if (waterAvg < 50) recs.push({ priority: 'urgent', icon: icon('droplet'), text: `${name}: Hydration critically low (${Math.round(waterAvg)}%). Ensure frequent hydration reminders.`, student: studentName });
            else if (waterAvg < 70) recs.push({ priority: 'important', icon: icon('droplet'), text: `${name}: Hydration below target (${Math.round(waterAvg)}%). Additional encouragement needed.`, student: studentName });

            if (lunchAvg < 50) recs.push({ priority: 'urgent', icon: icon('utensils'), text: `${name}: Afternoon meal intake very low (${Math.round(lunchAvg)}%). Dietary preferences or portion review needed.`, student: studentName });
            else if (lunchAvg < 70) recs.push({ priority: 'important', icon: icon('utensils'), text: `${name}: Afternoon meal intake requires attention (${Math.round(lunchAvg)}%).`, student: studentName });

            if (snackAvg < 50) recs.push({ priority: 'important', icon: icon('apple'), text: `${name}: Morning snack intake low (${Math.round(snackAvg)}%). Preferred alternatives recommended.`, student: studentName });

            // Consistency-based recommendation
            const consistency = this.calculateConsistencyScore(studentName, weekIdx);
            if (consistency.score < 50) {
                recs.push({ priority: 'important', icon: icon('barChart'), text: `${name}: Low consistency index (${consistency.score}/100). Structured routine support recommended.`, student: studentName });
            }

            // Celebrations
            if (overall >= 95) recs.push({ priority: 'celebrate', icon: icon('trophy'), text: `${name} achieved ${Math.round(overall)}% overall — outstanding performance! Recognition recommended.`, student: studentName });
            else if (overall >= 85 && active.length >= 5) recs.push({ priority: 'celebrate', icon: icon('star'), text: `${name}: Excellent attendance with ${Math.round(overall)}% wellness score. Consistency achievement!`, student: studentName });

            // Week-over-week decline
            if (weekIdx > 0) {
                const prevWeek = weeks[weekIdx - 1];
                if (prevWeek) {
                    const prevActive = this.getActive(prevWeek);
                    if (prevActive.length) {
                        const prevOverall = (this.avg(prevActive, 'snack_completion') + this.avg(prevActive, 'lunch_completion') + this.avg(prevActive, 'water_completion')) / 3;
                        if (prevOverall - overall > 25) recs.push({ priority: 'important', icon: icon('trendDown'), text: `${name}: Performance declined ${Math.round(prevOverall - overall)}% from previous week. Parent communication advised.`, student: studentName });
                    }
                }
            }
        });

        const priority = { urgent: 0, important: 1, celebrate: 2 };
        recs.sort((a, b) => priority[a.priority] - priority[b.priority]);
        return recs;
    }
};
