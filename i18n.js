// ============================================
// FuturON Preschool - Internationalization (i18n)
// Supports: English (en), Telugu (te), Hindi (hi)
// ============================================

// Current language state (overrides inline fallback)
currentLang = localStorage.getItem('futuron-lang') || 'en';

// Full translation data (overrides inline fallback)
I18N = {
    en: {
        // Navigation & Layout
        parentPortal: 'Parent Portal',
        studentDashboard: 'Student Dashboard',
        students: 'Students',
        weeks: 'Weeks',
        
        // Quick Summary
        hadGreatWeek: 'had a great week!',
        hadGoodWeek: 'had a good week with room to improve.',
        needsAttention: 'needs some extra attention this week.',
        attendance: 'Attendance',
        nutrition: 'Nutrition',
        hydration: 'Hydration',
        status: 'Status',
        allGood: 'All Good',
        areas: 'area(s)',
        
        // Section Headers
        nourishmentWellness: 'NOURISHMENT & WELLNESS',
        dailyProgress: 'DAILY PROGRESS',
        attendanceCalendar: 'ATTENDANCE CALENDAR',
        monthlyOverview: 'MONTHLY OVERVIEW',
        
        // KPI Labels
        morningSnack: 'Morning Snack',
        afternoonMeal: 'Afternoon Meal',
        hydrationLevel: 'Hydration Level',
        overallScore: 'Overall Score',
        dailyHydration: 'Daily Hydration',
        
        // KPI Sublabels
        snackRate: 'Morning snack consumption rate',
        mealRate: 'Afternoon meal intake rate',
        waterRate: 'Water intake rate',
        thisWeek: 'this week',
        
        // Status Indicators
        excellent: 'Excellent',
        good: 'Good',
        needsAttentionShort: 'Needs Attention',
        
        // Achievements
        fullAttendance: 'Full Attendance',
        wellnessStar: 'Wellness Star',
        healthyEater: 'Healthy Eater',
        hydrationChampion: 'Hydration Champion',
        snackExcellence: 'Snack Excellence',
        punctualityAward: 'Punctuality Award',
        
        // AI Cards
        nutritionIndex: 'Nutrition Wellness Index',
        weeklySummary: 'Weekly Performance Summary',
        recommendations: 'Recommendations for Parents',
        observations: 'Behavioural Observations',
        teacherRecs: 'Teacher Recommendations',
        noAnomalies: 'No anomalies detected. Everything looks normal this week.',
        readMore: 'Read more',
        showLess: 'Show less',
        items: 'items',
        
        // View Toggle
        summary: 'Summary',
        detailed: 'Detailed',
        
        // Daily Grid Headers
        day: 'Day',
        snacks: 'Snacks',
        lunch: 'Lunch',
        activity: 'Activity',
        water: 'Water',
        uniform: 'Uniform',
        
        // Calendar
        present: 'Present',
        absent: 'Absent',
        holiday: 'Holiday',
        
        // Footer
        getDirections: 'Get Directions',
        callUs: 'Call Us',
        
        // Loading
        loadingRecords: 'Loading student records...',
        creatingFutureCEOs: 'Creating Future CEOs',
        unableToLoad: 'Unable to Load Data',
        retryMessage: "We couldn't connect to the school records. This may be due to a network issue or temporary server unavailability.",
        retry: 'Retry',
        
        // Misc
        bottles: 'bottles',
        refills: 'Refills',
        attire: 'Attire',
        completed: 'completed',
        whoGuideline: 'WHO guideline',
        forAges: 'for ages',
        daysPresent: 'days present',
        schoolDays: 'school days',
        dayDateCheckin: 'Day / Date / Check-in',
        morningSnackIntake: 'Morning Snack / Intake',
        afternoonMealIntake: 'Afternoon Meal / Intake',
        preferenceHydration: 'Preference / Hydration',
        academicPeriod: 'Academic Period',
        weeklyAverage: 'Weekly Average',
        upcoming: 'Upcoming',
        uniformYes: 'Uniform',
        uniformNo: 'No',
        colorDay: 'Color Day',
        waterLabel: 'Water',
        downloadPDF: 'Download PDF',
        monthlyProgressOverview: 'Monthly Progress Overview',
        dailyNutritionInsight: 'Daily Nutrition Insight',
        daysAttended: 'Days Attended',
        daysMissed: 'Days Missed',
        holidays: 'Holidays',
        nutritionScore: 'Nutrition Score',
        scheduledHolidays: 'Scheduled holidays & closures',
        workingDays: 'working days this month',
        attendanceRate: 'attendance rate this month',
        improvement: 'improvement',
        decline: 'decline',
        progress: 'Progress',
        dearParent: 'Dear Parent/Guardian',
        weeklyReportIntro: 'Please find below the weekly progress report for',
        classLabel: 'Class',
        forPeriod: 'for the academic period',
        keepUpRoutine: 'Keep up the great routine!',
        schoolHoliday: 'School Holiday',
        institutionalHoliday: 'Institutional Holiday',
        secondSaturday: '2nd Saturday',
        snackTip: 'Percentage of morning snack your child finished at school',
        mealTip: 'How much of the lunch box your child completed',
        waterTip: 'How well your child drinks water at school vs WHO recommended intake',
    },
    
    te: {
        // Navigation & Layout
        parentPortal: 'తల్లిదండ్రుల పోర్టల్',
        studentDashboard: 'విద్యార్థి డాష్‌బోర్డ్',
        students: 'విద్యార్థులు',
        weeks: 'వారాలు',
        
        // Quick Summary
        hadGreatWeek: 'ఈ వారం అద్భుతంగా గడిపారు!',
        hadGoodWeek: 'మంచి వారం గడిపారు, మెరుగుదలకు అవకాశం ఉంది.',
        needsAttention: 'ఈ వారం కొంత అదనపు శ్రద్ధ అవసరం.',
        attendance: 'హాజరు',
        nutrition: 'పోషణ',
        hydration: 'నీరు',
        status: 'స్థితి',
        allGood: 'అంతా బాగుంది',
        areas: 'అంశాలు',
        
        // Section Headers
        nourishmentWellness: 'పోషణ & ఆరోగ్యం',
        dailyProgress: 'రోజువారీ పురోగతి',
        attendanceCalendar: 'హాజరు క్యాలెండర్',
        monthlyOverview: 'నెలవారీ సమీక్ష',
        
        // KPI Labels
        morningSnack: 'ఉదయం స్నాక్',
        afternoonMeal: 'మధ్యాహ్న భోజనం',
        hydrationLevel: 'నీటి స్థాయి',
        overallScore: 'మొత్తం స్కోర్',
        dailyHydration: 'రోజువారీ హైడ్రేషన్',
        
        // KPI Sublabels
        snackRate: 'ఉదయం స్నాక్ వినియోగ రేటు',
        mealRate: 'మధ్యాహ్న భోజన తీసుకునే రేటు',
        waterRate: 'నీటి తీసుకునే రేటు',
        thisWeek: 'ఈ వారం',
        
        // Status Indicators
        excellent: 'అద్భుతం',
        good: 'మంచిది',
        needsAttentionShort: 'శ్రద్ధ అవసరం',
        
        // Achievements
        fullAttendance: 'పూర్తి హాజరు',
        wellnessStar: 'ఆరోగ్య స్టార్',
        healthyEater: 'ఆరోగ్యకరమైన ఆహారం',
        hydrationChampion: 'హైడ్రేషన్ ఛాంపియన్',
        snackExcellence: 'స్నాక్ శ్రేష్ఠత',
        punctualityAward: 'సమయపాలన అవార్డ్',
        
        // AI Cards
        nutritionIndex: 'పోషణ ఆరోగ్య సూచిక',
        weeklySummary: 'వారపు పనితీరు సారాంశం',
        recommendations: 'తల్లిదండ్రులకు సూచనలు',
        observations: 'ప్రవర్తన పరిశీలనలు',
        teacherRecs: 'ఉపాధ్యాయ సిఫార్సులు',
        noAnomalies: 'ఎటువంటి అసాధారణతలు కనుగొనబడలేదు. ఈ వారం అంతా సాధారణంగా ఉంది.',
        readMore: 'మరింత చదవండి',
        showLess: 'తక్కువ చూపించు',
        items: 'అంశాలు',
        
        // View Toggle
        summary: 'సారాంశం',
        detailed: 'వివరాలు',
        
        // Daily Grid Headers
        day: 'రోజు',
        snacks: 'స్నాక్స్',
        lunch: 'భోజనం',
        activity: 'కార్యకలాపం',
        water: 'నీరు',
        uniform: 'యూనిఫారం',
        
        // Calendar
        present: 'హాజరు',
        absent: 'గైర్హాజరు',
        holiday: 'సెలవు',
        
        // Footer
        getDirections: 'దిశలు పొందండి',
        callUs: 'కాల్ చేయండి',
        
        // Loading
        loadingRecords: 'విద్యార్థి రికార్డులు లోడ్ అవుతున్నాయి...',
        creatingFutureCEOs: 'భవిష్యత్ CEOలను సృష్టిస్తోంది',
        unableToLoad: 'డేటా లోడ్ చేయడం సాధ్యం కాలేదు',
        retryMessage: 'పాఠశాల రికార్డులకు కనెక్ట్ అవ్వలేకపోయాము. నెట్‌వర్క్ సమస్య కావచ్చు.',
        retry: 'మళ్ళీ ప్రయత్నించండి',
        
        // Misc
        bottles: 'బాటిళ్ళు',
        refills: 'రీఫిల్స్',
        attire: 'దుస్తులు',
        completed: 'పూర్తయింది',
        whoGuideline: 'WHO మార్గదర్శకం',
        forAges: 'వయస్సు',
        daysPresent: 'రోజులు హాజరు',
        schoolDays: 'పాఠశాల రోజులు',
        dayDateCheckin: 'రోజు / తేదీ / చెక్-ఇన్',
        morningSnackIntake: 'ఉదయం స్నాక్ / తీసుకున్నది',
        afternoonMealIntake: 'మధ్యాహ్న భోజనం / తీసుకున్నది',
        preferenceHydration: 'ఇష్టం / నీరు',
        academicPeriod: 'విద్యా కాలం',
        weeklyAverage: 'వారపు సగటు',
        upcoming: 'రాబోతోంది',
        uniformYes: 'యూనిఫారం',
        uniformNo: 'లేదు',
        colorDay: 'కలర్ డే',
        waterLabel: 'నీరు',
        downloadPDF: 'PDF డౌన్‌లోడ్',
        monthlyProgressOverview: 'నెలవారీ పురోగతి సమీక్ష',
        dailyNutritionInsight: 'రోజువారీ పోషణ సమాచారం',
        daysAttended: 'హాజరైన రోజులు',
        daysMissed: 'గైర్హాజరైన రోజులు',
        holidays: 'సెలవులు',
        nutritionScore: 'పోషణ స్కోర్',
        scheduledHolidays: 'షెడ్యూల్ చేసిన సెలవులు',
        workingDays: 'ఈ నెల పని దినాలు',
        attendanceRate: 'ఈ నెల హాజరు రేటు',
        improvement: 'మెరుగుదల',
        decline: 'తగ్గుదల',
        progress: 'పురోగతి',
        dearParent: 'గౌరవనీయ తల్లిదండ్రులు/సంరక్షకులు',
        weeklyReportIntro: 'దయచేసి వారపు పురోగతి నివేదికను చూడండి',
        classLabel: 'తరగతి',
        forPeriod: 'విద్యా కాలానికి',
        keepUpRoutine: 'మంచి దినచర్యను కొనసాగించండి!',
        schoolHoliday: 'పాఠశాల సెలవు',
        institutionalHoliday: 'సంస్థాగత సెలవు',
        secondSaturday: '2వ శనివారం',
        snackTip: 'మీ పిల్లవాడు పాఠశాలలో తిన్న ఉదయం స్నాక్ శాతం',
        mealTip: 'మీ పిల్లవాడు తిన్న భోజనం ఎంత పూర్తి చేశారు',
        waterTip: 'WHO సిఫార్సుతో పోలిస్తే మీ పిల్లవాడు పాఠశాలలో తాగే నీరు',
    },
    
    hi: {
        // Navigation & Layout
        parentPortal: 'अभिभावक पोर्टल',
        studentDashboard: 'छात्र डैशबोर्ड',
        students: 'छात्र',
        weeks: 'सप्ताह',
        
        // Quick Summary
        hadGreatWeek: 'का इस सप्ताह शानदार रहा!',
        hadGoodWeek: 'का सप्ताह अच्छा रहा, सुधार की गुंजाइश है।',
        needsAttention: 'को इस सप्ताह अतिरिक्त ध्यान की आवश्यकता है।',
        attendance: 'उपस्थिति',
        nutrition: 'पोषण',
        hydration: 'जलयोजन',
        status: 'स्थिति',
        allGood: 'सब ठीक है',
        areas: 'क्षेत्र',
        
        // Section Headers
        nourishmentWellness: 'पोषण एवं स्वास्थ्य',
        dailyProgress: 'दैनिक प्रगति',
        attendanceCalendar: 'उपस्थिति कैलेंडर',
        monthlyOverview: 'मासिक सारांश',
        
        // KPI Labels
        morningSnack: 'सुबह का नाश्ता',
        afternoonMeal: 'दोपहर का भोजन',
        hydrationLevel: 'पानी का स्तर',
        overallScore: 'कुल स्कोर',
        dailyHydration: 'दैनिक जलयोजन',
        
        // KPI Sublabels
        snackRate: 'सुबह के नाश्ते की खपत दर',
        mealRate: 'दोपहर के भोजन की खपत दर',
        waterRate: 'पानी की खपत दर',
        thisWeek: 'इस सप्ताह',
        
        // Status Indicators
        excellent: 'उत्कृष्ट',
        good: 'अच्छा',
        needsAttentionShort: 'ध्यान आवश्यक',
        
        // Achievements
        fullAttendance: 'पूर्ण उपस्थिति',
        wellnessStar: 'स्वास्थ्य स्टार',
        healthyEater: 'स्वस्थ खानपान',
        hydrationChampion: 'जलयोजन चैंपियन',
        snackExcellence: 'नाश्ता उत्कृष्टता',
        punctualityAward: 'समयनिष्ठा पुरस्कार',
        
        // AI Cards
        nutritionIndex: 'पोषण स्वास्थ्य सूचकांक',
        weeklySummary: 'साप्ताहिक प्रदर्शन सारांश',
        recommendations: 'अभिभावकों के लिए सुझाव',
        observations: 'व्यवहार संबंधी अवलोकन',
        teacherRecs: 'शिक्षक की सिफारिशें',
        noAnomalies: 'कोई असामान्यता नहीं पाई गई। इस सप्ताह सब कुछ सामान्य है।',
        readMore: 'और पढ़ें',
        showLess: 'कम दिखाएं',
        items: 'आइटम',
        
        // View Toggle
        summary: 'सारांश',
        detailed: 'विस्तृत',
        
        // Daily Grid Headers
        day: 'दिन',
        snacks: 'नाश्ता',
        lunch: 'भोजन',
        activity: 'गतिविधि',
        water: 'पानी',
        uniform: 'यूनिफॉर्म',
        
        // Calendar
        present: 'उपस्थित',
        absent: 'अनुपस्थित',
        holiday: 'छुट्टी',
        
        // Footer
        getDirections: 'दिशा-निर्देश',
        callUs: 'कॉल करें',
        
        // Loading
        loadingRecords: 'छात्र रिकॉर्ड लोड हो रहे हैं...',
        creatingFutureCEOs: 'भविष्य के CEO बना रहे हैं',
        unableToLoad: 'डेटा लोड करने में असमर्थ',
        retryMessage: 'स्कूल रिकॉर्ड से कनेक्ट नहीं हो सका। यह नेटवर्क समस्या हो सकती है।',
        retry: 'पुनः प्रयास करें',
        
        // Misc
        bottles: 'बोतलें',
        refills: 'रिफिल',
        attire: 'पोशाक',
        completed: 'पूर्ण',
        whoGuideline: 'WHO दिशानिर्देश',
        forAges: 'उम्र के लिए',
        daysPresent: 'दिन उपस्थित',
        schoolDays: 'स्कूल के दिन',
        dayDateCheckin: 'दिन / तिथि / चेक-इन',
        morningSnackIntake: 'सुबह का नाश्ता / सेवन',
        afternoonMealIntake: 'दोपहर का भोजन / सेवन',
        preferenceHydration: 'पसंद / पानी',
        academicPeriod: 'शैक्षणिक अवधि',
        weeklyAverage: 'साप्ताहिक औसत',
        upcoming: 'आगामी',
        uniformYes: 'यूनिफॉर्म',
        uniformNo: 'नहीं',
        colorDay: 'कलर डे',
        waterLabel: 'पानी',
        downloadPDF: 'PDF डाउनलोड',
        monthlyProgressOverview: 'मासिक प्रगति सारांश',
        dailyNutritionInsight: 'दैनिक पोषण जानकारी',
        daysAttended: 'उपस्थित दिन',
        daysMissed: 'अनुपस्थित दिन',
        holidays: 'छुट्टियां',
        nutritionScore: 'पोषण स्कोर',
        scheduledHolidays: 'निर्धारित छुट्टियां',
        workingDays: 'इस माह कार्य दिवस',
        attendanceRate: 'इस माह उपस्थिति दर',
        improvement: 'सुधार',
        decline: 'गिरावट',
        progress: 'प्रगति',
        dearParent: 'प्रिय अभिभावक/संरक्षक',
        weeklyReportIntro: 'कृपया नीचे साप्ताहिक प्रगति रिपोर्ट देखें',
        classLabel: 'कक्षा',
        forPeriod: 'शैक्षणिक अवधि के लिए',
        keepUpRoutine: 'अच्छी दिनचर्या जारी रखें!',
        schoolHoliday: 'स्कूल की छुट्टी',
        institutionalHoliday: 'संस्थागत छुट्टी',
        secondSaturday: 'दूसरा शनिवार',
        snackTip: 'आपके बच्चे ने स्कूल में कितना सुबह का नाश्ता खाया',
        mealTip: 'आपके बच्चे ने लंच बॉक्स कितना पूरा किया',
        waterTip: 'WHO की सिफारिश की तुलना में आपका बच्चा स्कूल में कितना पानी पीता है',
    }
};

// Override fallback functions with full implementations
currentLang = localStorage.getItem('futuron-lang') || 'en';

t = function(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
};

setLanguage = function(lang) {
    currentLang = lang;
    localStorage.setItem('futuron-lang', lang);
    document.documentElement.lang = lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en';
    document.querySelectorAll('.lang-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.lang === lang);
    });
    if (typeof render === 'function' && typeof studentsData !== 'undefined' && Object.keys(studentsData).length > 0) {
        render();
    }
};
