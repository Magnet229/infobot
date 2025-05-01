// script.js

// DOM Element Selections
const FLASK_BASE_URL = 'http://localhost:5000';
const API_KEY = "AIzaSyDAK3gTEiJFynqHm7-jvrL-ePM_YoHHbpM";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
//const inputElement = typingForm.querySelector(".typing-input");
let userMessage = null;
let isResponseGenerating = false;
let currentLanguage = 'en'; // Default language
let conversationHistory = [];
const maxHistoryLength = 5; // number of turns
let queryFrequency = {};
let typingForm;
const sendButton = document.querySelector(".typing-form .icon");
        let isPaused = false;
        let currentTypingInterval;
         typingForm = document.querySelector(".typing-form");

// Speech Synthesis instance
const synth = window.speechSynthesis; // Added for TTS 

const allSuggestions = [
    "Admission Process",
    "Fees structure for ECE",
    "Course Offerings",
    "Student Life",
    "Research Programs",
    "Campus Life",
    "Alumni Network",
    "Academic Calendar",
    "Library Resources",
    "Sports Facilities",
    "Health Services",
   ];

// Translations for multi-language support
const translations = {
    en: {
        welcome: "Welcome to SRM InfoBot!",
        placeholder: "Ask anything about SRM University...",
        suggestions: {
            admissionProcess: "Admission Process",
            campusLife: "Campus Life",
            academicPortal: "Academic Portal",
            feesStructure: "Fees Structure",
            placements: "Placements",
            courseOfferings: "Course Offerings",
            studentLife: "Student Life",
            researchPrograms: "Research Programs",
            alumniNetwork: "Alumni Network",
            academicCalendar: "Academic Calendar",
            libraryResources: "Library Resources",
            sportsFacilities: "Sports Facilities",
            healthServices: "Health Services"
        }
    },
    ta: {
        welcome: "SRM இன்ஃபோபாட்டிற்கு வரவேற்கிறோம்!",
        placeholder: "SRM பல்கலைக்கழகம் பற்றி எதையும் கேளுங்கள்...",
        suggestions: {
            admissionProcess: "சேர்க்கை செயல்முறை",
            campusLife: "வளாக வாழ்க்கை",
            academicPortal: "கல்வி போர்டல்",
            placements: "வேலை வாய்ப்புகள்",
            feesStructure: "கட்டண அமைப்பு",
            courseOfferings: "பாடப்பிரிவுகள்",
            studentLife: "மாணவர் வாழ்க்கை",
            researchPrograms: "ஆராய்ச்சி திட்டங்கள்",
            alumniNetwork: "பழைய மாணவர் வலையமைப்பு",
            academicCalendar: "கல்வி காலண்டர்",
            libraryResources: "நூலக வளங்கள்",
            sportsFacilities: "விளையாட்டு வசதிகள்",
            healthServices: "சுகாதார சேவைகள்"
        }
    },
    te: {
        welcome: "SRM ఇన్ఫోబాట్‌కి స్వాగతం!",
        placeholder: "SRM విశ్వవిద్యాలయం గురించి ఏదైనా అడగండి...",
        suggestions: {
            admissionProcess: "ప్రవేశ విధానం",
            campusLife: "క్యాంపస్ జీవితం",
            academicPortal: "విద్యా పోర్టల్",
            placements: "ప్లేస్‌మెంట్స్",
            feesStructure: "ഫീസ് ഘടന",
            feesStructure: "రుసుము నిర్మాణం",
            courseOfferings: "కోర్స్ ఆఫర్లు",
            studentLife: "విద్యార్థి జీవితం",
            researchPrograms: "పరిశోధన కార్యక్రమాలు",
            alumniNetwork: "పూర్వ విద్యార్థుల నెట్‌వర్క్",
            academicCalendar: "విద్యా క్యాలెండర్",
            libraryResources: "లైబ్రరీ వనరులు",
            sportsFacilities: "క్రీడా సౌకర్యాలు",
            healthServices: "ఆరోగ్య సేవలు"
        }
    },
    ml: {
        welcome: "SRM ഇൻഫോബോട്ടിലേക്ക് സ്വാഗതം!",
        placeholder: "SRM സർവകലാശാലയെക്കുറിച്ച് എന്തെങ്കിലും ചോദിക്കൂ...",
        suggestions: {
            admissionProcess: "പ്രവേശന നടപടിക്രമം",
            campusLife: "ക്യാമ്പസ് ജീവിതം",
            academicPortal: "അക്കാദമിക് പോർട്ടൽ",
            placements: "പ്ലേസ്‌മെന്റുകൾ",
            courseOfferings: "കോഴ്‌സ് ഓഫറുകൾ",
            studentLife: "വിദ്യാർത്ഥി ജീവിതം",
            researchPrograms: "ഗവേഷണ പരിപാടികൾ",
            alumniNetwork: "പൂർവ്വ വിദ്യാർത്ഥി ശൃംഖല",
            academicCalendar: "അക്കാദമിക് കലണ്ടർ",
            libraryResources: "ലൈബ്രറി വിഭവങ്ങൾ",
            sportsFacilities: "കായിക സൗകര്യങ്ങൾ",
            healthServices: "ആരോഗ്യ സേവനങ്ങൾ"
        }
    },
    hi: {
        welcome: "SRM इन्फोबॉट - आपका 24/7 विश्वविद्यालय सहायक",
        placeholder: "SRM विश्वविद्यालय के बारे में कुछ भी पूछें...",
        suggestions: {
            admissionProcess: "प्रवेश प्रक्रिया", campusLife: "कैंपस जीवन", academicPortal: "अकादमिक पोर्टल", placements: "प्लेसमेंट",
            courseOfferings: "पाठ्यक्रम प्रस्ताव", studentLife: "छात्र जीवन", researchPrograms: "अनुसंधान कार्यक्रम", alumniNetwork: "पूर्व छात्र नेटवर्क",
            academicCalendar: "अकादमिक कैलेंडर", libraryResources: "पुस्तकालय संसाधन", sportsFacilities: "खेल सुविधाएं", healthServices: "स्वास्थ्य सेवाएं"
        }
    }
};

// Keywords and Patterns for intent recognition
const srmKeywords = [
    'srm', 'university', 'college', 'campus', 'department', 'faculty',
    'course', 'program', 'semester', 'academic', 'study', 'research',
    'lecture', 'class', 'laboratory', 'lab', 'library', 'examination',
    'exam', 'test', 'assignment', 'project', 'grade', 'result',
    'attendance', 'syllabus', 'curriculum', 'timetable', 'schedule',
    'admission', 'application', 'enrollment', 'registration', 'fee',
    'scholarship', 'financial aid', 'document', 'certificate',
    'eligibility', 'criteria', 'requirement', 'deadline', 'payment',
    'hostel', 'accommodation', 'dormitory', 'cafeteria', 'canteen',
    'mess', 'food', 'transport', 'bus', 'shuttle', 'parking',
    'security', 'facility', 'amenity', 'infrastructure', 'wifi',
    'internet', 'lab', 'equipment', 'sports', 'gym', 'fitness',
    'student', 'staff', 'faculty', 'teacher', 'professor', 'dean',
    'advisor', 'counselor', 'mentor', 'support', 'help', 'guidance',
    'office', 'department', 'administration', 'management',
    'placement', 'career', 'internship', 'job', 'recruitment',
    'company', 'industry', 'corporate', 'salary', 'package',
    'interview', 'training', 'skill', 'development',
    'hospital', 'health', 'medical', 'clinic', 'healthcare', 'emergency',
    'doctor', 'physician', 'ambulance', 'pharmacy', 'medicine', 'treatment',
    'srm hospital', 'medical center', 'health service', 'health care',
    'medical facility', 'emergency care', 'outpatient', 'inpatient'
];

const conversationPatterns = {
    greetings: ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
    farewells: ['bye', 'goodbye', 'see you', 'thank you', 'thanks'],
    help: ['help', 'assist', 'support', 'guide', 'what can you do', 'how can you help']
};

// Predefined Answers for common questions
const srmPredefinedAnswers = {
    en: {
        admissions: `SRM University admissions process involves:
- Online application through the SRM website
- Entrance exam (SRMJEEE)
- Merit-based selection
- Document verification
- Fee payment to confirm admission
- Orientation program before classes begin`,

        placements: `SRM University has an excellent placement record:
- 85%+ placement rate across programs
- 600+ companies visit campus annually
- Average package of 5-6 LPA
- Top recruiters include Microsoft, Amazon, IBM, TCS
- Pre-placement training provided
- Dedicated placement cell for student support`,

        campus: `SRM University campus features:
- Modern classrooms with smart technology
- Well-equipped laboratories
- Central library with digital resources
- Multiple hostels for boys and girls
- Food courts and cafeterias
- Sports facilities including swimming pool
- Wi-Fi enabled campus
- Medical center for healthcare`,

        hospital: `SRM Hospital is a state-of-the-art medical facility that provides:
- 24/7 emergency medical services
- Outpatient and inpatient care
- Advanced diagnostic facilities
- Specialized departments for various medical needs
- Well-equipped pharmacy
- Ambulance services
- Regular health check-up camps
- Modern operation theaters
- Qualified medical professionals and staff`
    },
    ta: {
        admissions: `SRM பல்கலைக்கழக சேர்க்கை செயல்முறையில் அடங்கும்:
- SRM இணையதளம் மூலம் ஆன்லைன் விண்ணப்பம்
- நுழைவுத் தேர்வு (SRMJEEE)
- தகுதி அடிப்படையிலான தேர்வு
- ஆவண சரிபார்ப்பு
- சேர்க்கையை உறுதிப்படுத்த கட்டணம் செலுத்துதல்
- வகுப்புகள் தொடங்குவதற்கு முன் அறிமுக நிகழ்ச்சி`,

        placements: `SRM பல்கலைக்கழகம் சிறந்த வேலைவாய்ப்பு பதிவைக் கொண்டுள்ளது:
- அனைத்து திட்டங்களிலும் 85%+ வேலைவாய்ப்பு விகிதம்
- ஆண்டுதோறும் 600+ நிறுவனங்கள் வளாகத்திற்கு வருகை
- சராசரி பேக்கேஜ் 5-6 LPA
- முன்னணி நிறுவனங்களில் Microsoft, Amazon, IBM, TCS போன்றவை அடங்கும்
- வேலைவாய்ப்புக்கு முந்தைய பயிற்சி வழங்கப்படுகிறது
- மாணவர் ஆதரவுக்கான அர்ப்பணிப்புள்ள வேலைவாய்ப்பு பிரிவு`,

        campus: `SRM பல்கலைக்கழக வளாகத்தில் உள்ளவை:
- நவீன தொழில்நுட்பத்துடன் கூடிய நவீன வகுப்பறைகள்
- நன்கு வசதிகள் கொண்ட ஆய்வகங்கள்
- டிஜிட்டல் வளங்களுடன் கூடிய மைய நூலகம்
- ஆண், பெண் இருவருக்கும் பல விடுதிகள்
- உணவு அரங்குகள் மற்றும் கஃபேட்டீரியாக்கள்
- நீச்சல் குளம் உட்பட விளையாட்டு வசதிகள்
- வை-ஃபை செயல்படுத்தப்பட்ட வளாகம்
- சுகாதார பராமரிப்புக்கான மருத்துவ மையம்`,

        hospital: `SRM மருத்துவமனை ஒரு நவீன மருத்துவ வசதியாகும்:
- 24/7 அவசர மருத்துவ சேவைகள்
- வெளிநோயாளி மற்றும் உள்நோயாளி பராமரிப்பு
- மேம்பட்ட நோயறிதல் வசதிகள்
- பல்வேறு மருத்துவ தேவைகளுக்கான சிறப்பு துறைகள்
- நன்கு வசதி கொண்ட மருந்தகம்
- ஆம்புலன்ஸ் சேவைகள்
- வழக்கமான உடல்நல பரிசோதனை முகாம்கள்
- நவீன அறுவை சிகிச்சை அரங்குகள்
- தகுதி வாய்ந்த மருத்துவ நிபுணர்கள் மற்றும் ஊழியர்கள்`
    },
    te: {
        admissions: `SRM విశ్వవిద్యాలయ ప్రవేశ ప్రక్రియలో ఉన్నవి:
- SRM వెబ్‌సైట్ ద్వారా ఆన్‌లైన్ దరఖాస్తు
- ప్రవేశ పరీక్ష (SRMJEEE)
- మెరిట్ ఆధారిత ఎంపిక
- డాక్యుమెంట్ వెరిఫికేషన్
- ప్రవేశాన్ని నిర్ధారించడానికి ఫీజు చెల్లింపు
- తరగతులు ప్రారంభానికి ముందు ఓరియంటేషన్ ప్రోగ్రామ్`,

        placements: `SRM విశ్వవిద్యాలయానికి ఉత్తమమైన ప్లేస్‌మెంట్ రికార్డు ఉంది:
- అన్ని ప్రోగ్రాముల్లో 85%+ ప్లేస్‌మెంట్ రేటు
- సంవత్సరానికి 600+ కంపెనీలు క్యాంపస్‌కు వస్తాయి
- సగటు ప్యాకేజీ 5-6 LPA
- టాప్ రిక్రూటర్లలో Microsoft, Amazon, IBM, TCS వంటివి ఉన్నాయి
- ప్రీ-ప్లేస్‌మెంట్ ట్రైనింగ్ అందించబడుతుంది
- విద్యార్థులకు మద్దతు కోసం అంకితమైన ప్లేస్‌మెంట్ సెల్`,

        campus: `SRM విశ్వవిద్యాలయ క్యాంపస్‌లో ఉన్నవి:
- స్మార్ట్ టెక్నాలజీతో ఆధునిక తరగతి గదులు
- బాగా సజ్జితమైన ల్యాబొరేటరీలు
- డిజిటల్ వనరులతో సెంట్రల్ లైబ్రరీ
- బాలురు మరియు బాలికల కోసం బహుళ హాస్టళ్లు
- ఫుడ్ కోర్టులు మరియు కేఫేటేరియాలు
- స్విమ్మింగ్ పూల్ సహా క్రీడా సౌకర్యాలు
- వైఫై ఎనేబుల్డ్ క్యాంపస్
- ఆరోగ్య సంరక్షణ కోసం మెడికల్ సెంటర్`,

        hospital: `SRM హాస్పిటల్ ఒక అత్యాధునిక వైద్య సౌకర్యం:
- 24/7 అత్యవసర వైద్య సేవలు
- బయట రోగులు మరియు లోపల రోగుల సంరక్షణ
- అధునాతన డయాగ్నొస్టిక్ సౌకర్యాలు
- వివిధ వైద్య అవసరాల కోసం ప్రత్యేక విభాగాలు
- బాగా అమర్చబడిన ఫార్మసీ
- అంబులెన్స్ సేవలు
- క్రమం తప్పకుండా ఆరోగ్య తనిఖీ శిబిరాలు
- ఆధునిక ఆపరేషన్ థియేటర్లు
- అర్హత కలిగిన వైద్య నిపుణులు మరియు సిబ్బంది`
    },
    ml: {
        admissions: `SRM സർവ്വകലാശാല അഡ്മിഷൻ പ്രക്രിയയിൽ ഉൾപ്പെടുന്നവ:
- SRM വെബ്സൈറ്റ് വഴി ഓൺലൈൻ അപേക്ഷ
- പ്രവേശന പരീക്ഷ (SRMJEEE)
- മെറിറ്റ് അടിസ്ഥാനമാക്കിയുള്ള തിരഞ്ഞെടുപ്പ്
- രേഖകളുടെ പരിശോധന
- പ്രവേശനം സ്ഥിരീകരിക്കാൻ ഫീസ് അടയ്ക്കൽ
- ക്ലാസുകൾ ആരംഭിക്കുന്നതിന് മുമ്പ് ഓറിയന്റേഷൻ പ്രോഗ്രാം`,

        placements: `SRM സർവ്വകലാശാലയ്ക്ക് മികച്ച പ്ലേസ്മെന്റ് റെക്കോർഡ് ഉണ്ട്:
- എല്ലാ പ്രോഗ്രാമുകളിലും 85%+ പ്ലേസ്മെന്റ് നിരക്ക്
- വർഷംതോറും 600+ കമ്പനികൾ ക്യാമ്പസ് സന്ദർശിക്കുന്നു
- ശരാശരി പാക്കേജ് 5-6 LPA
- Microsoft, Amazon, IBM, TCS തുടങ്ങിയവ ടോപ് റിക്രൂട്ടർമാരിൽ ഉൾപ്പെടുന്നു
- പ്രീ-പ്ലേസ്മെന്റ് പരിശീലനം നൽകുന്നു
- വിദ്യാർത്ഥികളുടെ പിന്തുണയ്ക്കായി സമർപ്പിത പ്ലേസ്മെന്റ് സെൽ`,

        campus: `SRM സർവ്വകലാശാല ക്യാമ്പസിൽ ഉള്ളത്:
- സ്മാർട്ട് സാങ്കേതികവിദ്യയുള്ള ആധുനിക ക്ലാസ് മുറികൾ
- നല്ല സജ്ജീകരണങ്ങളുള്ള ലാബുകൾ
- ഡിജിറ്റൽ വിഭവങ്ങളുള്ള സെൻട്രൽ ലൈബ്രറി
- ആൺകുട്ടികൾക്കും പെൺകുട്ടികൾക്കുമായി ഒന്നിലധികം ഹോസ്റ്റലുകൾ
- ഫുഡ് കോർട്ടുകളും കാഫേറ്റീരിയകളും
- സ്വിമ്മിംഗ് പൂൾ ഉൾപ്പെടെയുള്ള കായിക സൗകര്യങ്ങൾ
- വൈഫൈ സജ്ജമാക്കിയ ക്യാമ്പസ്
- ആരോഗ്യ പരിപാലനത്തിനായുള്ള മെഡിക്കൽ സെന്റർ`,

        hospital: `SRM ഹോസ്പിറ്റൽ ഒരു അത്യാധുനിക മെഡിക്കൽ സൗകര്യമാണ്:
- 24/7 അടിയന്തിര മെഡിക്കൽ സേവനങ്ങൾ
- ഔട്ട്പേഷ്യന്റ്, ഇൻപേഷ്യന്റ് പരിചരണം
- വിപുലമായ രോഗനിർണയ സൗകര്യങ്ങൾ
- വിവിധ മെഡിക്കൽ ആവശ്യങ്ങൾക്കായുള്ള സ്പെഷ്യലൈസ്ഡ് ഡിപ്പാർട്ട്മെന്റുകൾ
- നന്നായി സജ്ജീകരിച്ച ഫാർമസി
- ആംബുലൻസ് സേവനങ്ങൾ
- പതിവ് ആരോഗ്യ പരിശോധനാ ക്യാമ്പുകൾ
- ആധുനിക ഓപ്പറേഷൻ തിയേറ്ററുകൾ
- യോഗ്യതയുള്ള മെഡിക്കൽ വിദഗ്ധരും ജീവനക്കാരും`
    },
hi:{
    admissions: `SRM विश्वविद्यालय में प्रवेश प्रक्रिया में शामिल हैं:
- SRM वेबसाइट के माध्यम से ऑनलाइन आवेदन
- प्रवेश परीक्षा (SRMJEEE)
- योग्यता आधारित चयन
- दस्तावेज़ों का सत्यापन
- प्रवेश की पुष्टि के लिए शुल्क भुगतान
- कक्षाएं शुरू होने से पहले ओरिएंटेशन प्रोग्राम`,

    placements: `SRM विश्वविद्यालय की प्लेसमेंट रिकॉर्ड उत्कृष्ट है:
- 85% से अधिक प्लेसमेंट दर
- 600+ कंपनियां हर साल कैंपस आती हैं
- औसत पैकेज 5-6 लाख प्रति वर्ष
- प्रमुख भर्तीकर्ताओं में Microsoft, Amazon, IBM, TCS शामिल हैं
- प्री-प्लेसमेंट प्रशिक्षण प्रदान किया जाता है
- छात्रों के समर्थन के लिए समर्पित प्लेसमेंट सेल`,

    campus: `SRM विश्वविद्यालय का कैंपस सुविधाओं से भरपूर है:
- स्मार्ट तकनीक से युक्त आधुनिक कक्षाएं
- अच्छी तरह से सुसज्जित प्रयोगशालाएं
- डिजिटल संसाधनों के साथ केंद्रीय पुस्तकालय
- लड़कों और लड़कियों के लिए कई हॉस्टल
- फूड कोर्ट और कैफेटेरिया
- तैराकी पूल सहित खेल सुविधाएं
- वाई-फाई युक्त कैंपस
- स्वास्थ्य सेवा के लिए चिकित्सा केंद्र`,

    hospital: `SRM अस्पताल एक अत्याधुनिक चिकित्सा सुविधा है जो प्रदान करता है:
- 24/7 आपातकालीन चिकित्सा सेवाएं
- बाह्य रोगी और आंतरिक रोगी देखभाल
- उन्नत डायग्नोस्टिक सुविधाएं
- विभिन्न चिकित्सा आवश्यकताओं के लिए विशेष विभाग
- अच्छी तरह से सुसज्जित फार्मेसी
- एम्बुलेंस सेवाएं
- नियमित स्वास्थ्य जांच शिविर
- आधुनिक ऑपरेशन थिएटर
- योग्य चिकित्सा पेशेवर और स्टाफ`
}


};

// UI Update based on Language
function updateUILanguage(lang) {
    currentLanguage = lang;
    document.querySelector('.typing-input').placeholder = translations[lang].placeholder;
    document.querySelector('.disclaimer-text').textContent = translations[lang].welcome;

    const suggestions = document.querySelectorAll('.suggestion .text');
    suggestions.forEach(suggestion => {
        const key = Object.keys(translations.en.suggestions).find(k => translations.en.suggestions[k] === suggestion.getAttribute('data-original-text'));
        if (key) {
            suggestion.textContent = translations[lang].suggestions[key];
        }
    });
// Stop any ongoing speech when language changes
    if (synth.speaking) {
    synth.cancel();
   }
}


// Show Welcome Notification
const showWelcomeNotification = () => {
    const notification = document.createElement('div');
    notification.className = 'notification-popup';
    notification.innerHTML = `
        <div class="bot-icon">
            <span class="material-symbols-rounded">smart_toy</span>
        </div>
        <div class="notification-content">
            <div class="notification-title">SRM InfoBot</div>
            <div class="notification-message">👋 Hi! I'm here to help you with any questions about SRM University.</div>
        </div>
        <div class="close-btn">
            <span class="material-symbols-rounded">close</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 1000);

    notification.querySelector('.close-btn').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    });

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
};

// Check if SRM Keyword is Present 
const isSRMKeywordPresent = (message) => {
    const lowerMessage = message.toLowerCase();
    return srmKeywords.some(keyword => lowerMessage.includes(keyword));
};

// Check if there is a predefined answer
const checkPredefinedAnswer = (message, lang = 'en') => {
    const lowerMessage = message.toLowerCase();
    for (const key in srmPredefinedAnswers[lang]) {
        if (lowerMessage.includes(key)) {
            return srmPredefinedAnswers[lang][key];
        }
    }
    return null;
};

// Create Chat Bubble
function createChatBubble(message, isUser) {
    const chatBubble = document.createElement('div');
    chatBubble.classList.add('chat-bubble');
    chatBubble.classList.add(isUser ? 'user-bubble' : 'bot-bubble');
    chatBubble.textContent = message;
    return chatBubble;
}

// Create Message Element
const createMessageElement = (content, isOutgoing = false) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", isOutgoing ? "outgoing" : "incoming");
    messageDiv.innerHTML = content;
    return messageDiv;
};

// Check if query is university related
const isUniversityRelatedQuery = (query) => {
    query = query.toLowerCase();
    return srmKeywords.some(keyword => query.includes(keyword.toLowerCase()));
};

// Copy Message (Keep as is)
const copyMessage = (copyBtn) => {
    // Find the text content within the message-content div
    const messageContent = copyBtn.closest('.message')?.querySelector('.message-content .text');
    if (!messageContent) return; // Safety check

    const messageText = messageContent.textContent || messageContent.innerText; // Get text
    navigator.clipboard.writeText(messageText).then(() => {
        copyBtn.textContent = "done";
        setTimeout(() => copyBtn.textContent = "content_copy", 1500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        // Optionally provide user feedback about the failure
    });
};
// --- START OF COMBINED VOICE MODULE ---

// --- Configuration & State ---

let voiceEnabled = true; // Voice output is enabled by default
let isRecognizing = false; // Track if speech recognition is active

// Variables for the manual TTS on message bubbles
let currentlySpeakingBtn = null; // Tracks the button clicked for manual speech
let currentManualUtterance = null; // Tracks the utterance started by speakMessage

// Variables for automatic TTS (greeting, exit, potentially bot replies)
let currentAutoUtterance = null; // Tracks utterances started by speakText

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false; // Recognize a single phrase
    recognition.interimResults = false; // We only want the final result
    recognition.maxAlternatives = 1;
    console.log("Speech Recognition initialized.");
} else {
    console.warn("Speech Recognition API not supported in this browser.");
    // Optionally disable the mic button visually if API not supported
    document.addEventListener('DOMContentLoaded', () => {
        const micButton = document.getElementById('voice-input-button');
        if (micButton) {
            micButton.disabled = true;
            micButton.style.opacity = 0.5;
            micButton.title = "Voice input not supported";
        }
    });
}

// --- DOM Elements (fetched after DOM loaded) ---
let typingInput;
let voiceInputButton;
let voiceStatus;
let voiceStatusText;
let languageSelect;
let toggleVoiceButton; // Assuming you have a button with id="toggle-voice-button"

// --- Helper Functions ---

/**
 * Resets the visual state of a manual speak button.
 * @param {Element} button The button element.
 */

/**
 * Speaks the given text automatically (greeting, exit, bot replies).
 * Respects the voiceEnabled flag.
 * @param {string} text The text to speak.
 * @param {boolean} force Optional: Speak even if another auto utterance is active (e.g., for exit).
 */
const speakText = (text, force = false) => {
    if (!voiceEnabled || !text || text.trim() === '' || !synth) {
        console.log("speakText cancelled: Voice disabled, no text, or synth unavailable.");
        return;
    }

    // If already speaking automatically and not forced, don't interrupt
    if (synth.speaking && currentAutoUtterance && !force) {
        console.log("speakText deferred: Already speaking automatically.");
        return;
    }

    // Cancel any previous speech (manual or auto) before starting new auto speech
    console.log("speakText: Cancelling existing speech before speaking:", text.substring(0, 30));
    synth.cancel(); // Stop everything
    //resetButtonState(currentlySpeakingBtn); // Reset any active manual button
    currentlySpeakingBtn = null;
    currentManualUtterance = null;

    const utterance = new SpeechSynthesisUtterance(text);
    currentAutoUtterance = utterance; // Track this utterance

    // Set language based on the global select element
    const currentLang = languageSelect ? languageSelect.value : 'en';
    // Assuming languageToLocaleMap is defined globally or accessible here
    const locale = 'en-US'; // Directly set locale to English (US)
    utterance.lang = locale;
    console.log("Speech synthesis language forced to:", utterance.lang); // Optional log

    // Simple handlers for auto speech
    utterance.onstart = () => {
        console.log("Auto speech started:", text.substring(0, 30));
        if (toggleVoiceButton) toggleVoiceButton.textContent = 'volume_off'; // Show speaking state on main toggle
    };

    utterance.onend = () => {
        console.log("Auto speech ended.");
        currentAutoUtterance = null;
        // Only reset toggle button if voice is still enabled AND no other speech has started
        if (voiceEnabled && !synth.speaking && toggleVoiceButton) {
             toggleVoiceButton.textContent = 'volume_up';
        }
    };

    utterance.onerror = (event) => {
        console.error(`Auto SpeechSynthesis error: ${event.error}`, event);
        currentAutoUtterance = null;
        // Ensure toggle button resets on error too
        if (voiceEnabled && !synth.speaking && toggleVoiceButton) {
            toggleVoiceButton.textContent = 'volume_up';
       }
    };

    // Speak the text
    synth.speak(utterance);
};


/**
 * Speaks the content of a chat message bubble when its speaker icon is clicked.
 * Respects the voiceEnabled flag.
 * @param {Element} clickedBtn The speaker button element that was clicked.
 */
const speakMessage = (clickedBtn) => {
    // 1. Check if voice output is enabled globally
    if (!voiceEnabled) {
        console.log("speakMessage cancelled: Voice output is disabled.");
        // Optional feedback: Flash the icon
        clickedBtn.textContent = "volume_off";
        setTimeout(() => { clickedBtn.textContent = "volume_up"; }, 1000);
        return;
    }

    // 2. Check browser support
    if (!('speechSynthesis' in window) || !synth) {
        alert("Sorry, your browser doesn't support text-to-speech.");
        return;
    }

    // 3. Find the text content
    const messageContainer = clickedBtn.closest('.message');
    if (!messageContainer) {
        console.error("Could not find parent '.message' container for button:", clickedBtn);
        return;
    }
    const messageContent = messageContainer.querySelector('.message-content .text');
    if (!messageContent) {
        console.error("Could not find '.message-content .text' within message:", messageContainer);
        return;
    }
    const textToSpeak = messageContent.textContent || messageContent.innerText;
    if (!textToSpeak || textToSpeak.trim() === '') {
        console.warn("No text content found to speak in message:", messageContainer);
        return;
    }

    // 4. Handle existing speech (Toggle Logic)
    if (synth.speaking) {
        // If the *same button* is clicked again, stop speech.
        if (currentlySpeakingBtn === clickedBtn && currentManualUtterance) {
            console.log("speakMessage: Clicked the currently speaking button. Stopping speech.");
            synth.cancel(); // This will trigger the 'onend' for currentManualUtterance
            // State reset happens in onend/onerror
            return;
        } else {
            // If a *different button* is clicked, or if auto-speech is happening,
            // stop the old speech before starting the new one.
            console.log("speakMessage: Different button clicked or auto-speech active. Cancelling previous speech.");
            synth.cancel(); // Stop whatever is speaking
            resetButtonState(currentlySpeakingBtn); // Reset the *previous* manual button visually
            // Let the previous utterance's onend/onerror clear its state.
        }
    }

    // 5. Start Speaking the new message
    console.log("speakMessage: Starting speech for button:", clickedBtn);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    currentManualUtterance = utterance; // Track THIS utterance

    // Set language
    const locale = 'en-US'; // Directly set locale to English (US)
    utterance.lang = locale;
    console.log("Speech synthesis language forced to:", utterance.lang); // Optional log

    // Event Handlers for THIS manual utterance
    utterance.onstart = () => {
        console.log('Manual speech started for:', clickedBtn);
        clickedBtn.textContent = "volume_up"; // Indicate speaking on THIS button
        currentlySpeakingBtn = clickedBtn; // Mark THIS button as the one speaking
        if (toggleVoiceButton) toggleVoiceButton.textContent = 'volume_off'; // Also update main toggle
    };

    utterance.onend = () => {
        console.log('Manual speech ended or was cancelled for:', clickedBtn);
        resetButtonState(clickedBtn); // Reset THIS button's icon
        // Clear the global state ONLY if the utterance that just ended is the one we were tracking.
        if (currentManualUtterance === utterance) {
            currentlySpeakingBtn = null;
            currentManualUtterance = null;
            // Reset main toggle ONLY if voice enabled AND no other speech started
            if (voiceEnabled && !synth.speaking && toggleVoiceButton) {
                 toggleVoiceButton.textContent = 'volume_off';
            }
        }
    };

    utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
            console.error(`Manual SpeechSynthesis error: ${event.error}`, event);
        } else {
             console.log(`Manual speech ${event.error} for:`, clickedBtn);
        }
        resetButtonState(clickedBtn); // Reset THIS button's icon on error too
        if (currentManualUtterance === utterance) {
            currentlySpeakingBtn = null;
            currentManualUtterance = null;
             // Reset main toggle ONLY if voice enabled AND no other speech started
             if (voiceEnabled && !synth.speaking && toggleVoiceButton) {
                 toggleVoiceButton.textContent = 'volume_up';
            }
        }
    };

    // Speak the text
    synth.speak(utterance);
};


/**
 * Starts the speech recognition process.
 */
const startVoiceInput = () => {
    if (!recognition) {
        alert("Speech input is not supported in this browser.");
        return;
    }
    if (isRecognizing) {
        console.log("Already recognizing.");
        return;
    }

    // Stop any current speech output before listening
    if (synth.speaking) {
        console.log("startVoiceInput: Stopping current speech before listening.");
        synth.cancel();
    }

    try {
        // Set language for recognition based on current selection

        const locale = 'en-US'; // Directly set locale to English (US)
        recognition.lang = locale;
        console.log("Recognition language forced to:", recognition.lang); // Updated log message

        recognition.start();
        isRecognizing = true;
        if (voiceInputButton) voiceInputButton.classList.add('active');
        if (voiceStatus) voiceStatus.style.display = 'flex';
        if (voiceStatusText) voiceStatusText.textContent = "Listening...";
        console.log("Speech recognition started.");

    } catch (error) {
        console.error("Error starting speech recognition:", error);
         if (error.name === 'NotAllowedError' || error.name === 'ServiceNotAllowedError') {
             alert("Microphone access denied. Please allow microphone access in your browser settings.");
        } else {
            alert("Could not start voice input. Please try again.");
        }
        isRecognizing = false; // Reset state on error
        if (voiceInputButton) voiceInputButton.classList.remove('active');
        if (voiceStatus) voiceStatus.style.display = 'none';
    }
};

// --- Event Listeners Setup ---

document.addEventListener('DOMContentLoaded', () => {
    // Get elements now that the DOM is ready
    typingInput = document.querySelector(".typing-input");
    voiceInputButton = document.getElementById('voice-input-button');
    voiceStatus = document.getElementById('voice-status');
    voiceStatusText = document.querySelector('#voice-status .voice-status-text'); // More specific
    typingForm = document.querySelector(".typing-form");
    languageSelect = document.getElementById('languageSelect');
    toggleVoiceButton = document.getElementById('toggle-voice-button');

    // --- Initial Greeting ---
    setTimeout(() => {
        speakText("Hello! I'm SRM InfoBot. How can I help you?");
    }, 1500); // Delay to allow voices to load potentially

    // --- Voice Input Button Listener ---
    if (voiceInputButton && recognition) {
        voiceInputButton.addEventListener('click', startVoiceInput);
    }

    // --- Voice Output Toggle Button Listener ---
    if (toggleVoiceButton) {
        // Set initial state based on default
        toggleVoiceButton.textContent = voiceEnabled ? 'volume_up' : 'volume_off';

        toggleVoiceButton.addEventListener('click', () => {
            voiceEnabled = !voiceEnabled;
            toggleVoiceButton.textContent = voiceEnabled ? 'volume_up' : 'volume_off';
            console.log("Voice output enabled:", voiceEnabled);

            if (!voiceEnabled && synth.speaking) {
                console.log("Voice output disabled. Stopping current speech.");
                synth.cancel(); // Stop speech immediately if disabled
            } else if (voiceEnabled && !synth.speaking) {
                 // Optional: Announce it's re-enabled if nothing else is speaking
                 // speakText("Voice enabled.");
            }
        });
    }


    // --- Speech Recognition Event Handlers ---
    if (recognition) {
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            console.log("Recognition result:", transcript);

            if (typingInput) {
                typingInput.value = transcript; // Put text in input field
            }
             if (voiceStatusText) {
                 voiceStatusText.textContent = `"${transcript}"`; // Show what was heard
             }


            // Check for EXIT command
            if (transcript.toLowerCase() === 'exit' || transcript.toLowerCase() === 'quit') {
                 speakText("Thank you for using SRM InfoBot. Goodbye!", true); // Force speak exit message
                 // Optionally disable voice features after exit
                 // voiceEnabled = false;
                 // if (toggleVoiceButton) toggleVoiceButton.textContent = 'volume_off';
            } else {
                // Auto-submit the form after a short delay
                setTimeout(() => {
                    if (typingForm && typingInput && typingInput.value) { // Check if form and input exist and has value
                        console.log("Auto-submitting form for recognized speech.");
                        // Standard way to trigger form submission including listeners
                         typingForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                    }
                     // Reset visual indicator after submission attempt
                     if (voiceStatusText) voiceStatusText.textContent = "Listening...";

                }, 500); // 0.5 second delay
            }
        };

        recognition.onend = () => {
            isRecognizing = false;
            if (voiceInputButton) voiceInputButton.classList.remove('active');
            if (voiceStatus) voiceStatus.style.display = 'none';
            console.log("Speech recognition ended.");
        };

        recognition.onerror = (event) => {
            console.error(`Speech recognition error: ${event.error}`, event.message);
            isRecognizing = false;
            if (voiceInputButton) voiceInputButton.classList.remove('active');
            if (voiceStatus) voiceStatus.style.display = 'none';
            if (voiceStatusText) voiceStatusText.textContent = `Error: ${event.error}`; // Show error

            // Provide specific feedback for common errors
            if (event.error === 'no-speech') {
                 if (voiceStatusText) voiceStatusText.textContent = "Didn't hear that.";
            } else if (event.error === 'audio-capture') {
                 alert("Microphone error. Please check if another app is using it or if it's connected properly.");
                 if (voiceStatusText) voiceStatusText.textContent = "Mic error.";
            } else if (event.error === 'not-allowed') {
                 // Already handled in startVoiceInput, but good fallback
                 if (voiceStatusText) voiceStatusText.textContent = "Mic blocked.";
            }
        };

        // Stop recognition if user starts typing manually
         if(typingInput) {
             typingInput.addEventListener('input', () => {
                if (isRecognizing) {
                    console.log("User typing detected, stopping recognition.");
                    recognition.stop(); // Use stop() for graceful shutdown if possible, or abort()
                }
            });
         }
    }

    // --- Add Listeners for Manual Speak Buttons (if using class) ---
    // If your speaker buttons have a class like 'speak-message-button' instead of onclick=""
    document.querySelector('.chat-list').addEventListener('click', (event) => {
        // Use event delegation on the chat list for dynamically added messages
        const speakButton = event.target.closest('.speak-message-button'); // Adjust selector if needed
        if (speakButton) {
            speakMessage(speakButton); // Pass the clicked button element
        }
    });

}); // End DOMContentLoaded

// --- Make functions globally accessible if called via onclick attribute in HTML ---
window.speakMessage = speakMessage; // Needed if using onclick="speakMessage(this)"

// Optional: Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (synth && synth.speaking) {
        synth.cancel();
    }
    if (recognition && isRecognizing) {
        recognition.abort(); // Stop listening immediately
    }
});

// --- END OF COMBINED VOICE MODULE --

// --- Example Usage (How to attach the listener) ---
// Assuming your buttons have a class like 'speak-message-button'
document.querySelectorAll('.speak-message-button').forEach(button => {
    // Set initial state visually
    button.textContent = 'volume_up';
    // Add the click listener
    button.addEventListener('click', (event) => {
        // Pass the specific button that was clicked to the function
        speakMessage(event.currentTarget);
    });
});

// Optional: Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (synth.speaking) {
        synth.cancel();
    }
});

// Add event listener after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // DOM Element Selections
    const typingForm = document.querySelector(".typing-form");
    const chatList = document.querySelector(".chat-list");
    const toggleThemeButton = document.querySelector("#toggle-theme-button");
    const deleteChatButton = document.querySelector("#delete-chat-button");
    const languageSelect = document.getElementById('languageSelect');
    const suggestionsGroup1 = document.getElementById('suggestions-group-1');
    const suggestionsGroup2 = document.getElementById('suggestions-group-2');
    const suggestionsGroup3 = document.getElementById('suggestions-group-3');
    const scrollUpButton = document.getElementById('scrollUp');
    const scrollDownButton = document.getElementById('scrollDown');
    const sendButton = document.querySelector(".typing-form .icon");
    const inputElement = typingForm.querySelector(".typing-input");
    
         

    // Variables
    let userMessage = null;
    let isResponseGenerating = false;
    let currentGroup = 1;
    let isPaused = false;
    let currentTypingInterval;
    
    //typingForm = document.querySelector(".typing-form");

    // Store original text for language switching
    document.querySelectorAll('.suggestion .text').forEach(suggestion => {
        suggestion.setAttribute('data-original-text', suggestion.textContent);
    });

    // Function to process simple queries
    const processQuery = (query) => {
        query = query.toLowerCase().trim();

        if (conversationPatterns.greetings.some(greeting => query.includes(greeting))) {
            const greetings = {
                'en': "Hello! 👋 I'm SRM InfoBot, your university assistant. How can I help you today?",
                'ta': "வணக்கம்! 👋 நான் SRM InfoBot, உங்கள் பல்கலைக்கழக உதவியாளர். நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
                'te': "నమస్కారం! 👋 నేను SRM InfoBot, మీ విశ్వవిద్యాలయ సహాయకుడిని. నేను మీకు ఎలా సహాయపడగలను?",
                'ml': "നമസ്കാരം! 👋 ഞാൻ SRM InfoBot, നിങ്ങളുടെ സർവകലാശാല സഹായി. എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാൻ കഴിയും?",
                'hi':"नमस्ते! 👋 मैं SRM InfoBot हूँ, आपका विश्वविद्यालय सहायक। मैं आपकी किस प्रकार मदद कर सकता हूँ?",

            };
            return greetings[currentLanguage];
        }

        if (conversationPatterns.farewells.some(farewell => query.includes(farewell))) {
            const farewells = {
                'en': "Thank you for chatting with me! If you have more questions, feel free to ask anytime. Have a great day! 😊",
                'ta': "என்னுடன் அரட்டையடித்ததற்கு நன்றி! உங்களுக்கு கூடுதல் கேள்விகள் இருந்தால், எப்போது வேண்டுமானாலும் கேட்கலாம். ஒரு அருமையான நாள் வாழ்த்துக்கள்! 😊",
                'te': "నాతో చాట్ చేసినందుకు ధన్యవాదాలు! మీకు మరిన్ని ప్రశ్నలు ఉంటే, ఎప్పుడైనా అడగడానికి సంకోచించకండి. శుభదినం! 😊",
                'ml': "എന്നോട് സംസാരിച്ചതിന് നന്ദി! നിങ്ങൾക്ക് കൂടുതൽ ചോദ്യങ്ങൾ ഉണ്ടെങ്കിൽ, എപ്പോൾ വേണമെങ്കിലും ചോദിക്കാൻ മടിക്കേണ്ട. നല്ലൊരു ദിവസം ആശംസിക്കുന്നു! 😊",
                'hi':"मुझसे बातचीत करने के लिए धन्यवाद! यदि आपके पास और प्रश्न हों, तो कभी भी पूछें। आपका दिन शुभ हो! 😊"

            };
            return farewells[currentLanguage];
        }

        if (conversationPatterns.help.some(helpWord => query.includes(helpWord))) {
            return `I can assist you with various aspects of SRM University:
    1. Academic Information: Courses, programs, departments, faculty
    2. Admission Process: Requirements, applications, documents
    3. Campus Facilities: Hostels, transport, labs, library
    4. Student Services: Support, guidance, mentoring
    5. Career Services: Placements, internships, training
    
    What would you like to know more about?`;
        }

        if (query.toLowerCase().includes('health') || query.toLowerCase().includes('hospital')) {
            return `SRM Hospital is a state-of-the-art medical facility within the university campus that provides:
    - 24/7 emergency medical services
    - Outpatient and inpatient care
    - Advanced diagnostic facilities
    - Specialized departments for various medical needs
    - Well-equipped pharmacy
    - Ambulance services
    - Regular health check-up camps
    - Modern operation theaters
    - Qualified medical professionals and staff
    
    The hospital is equipped to handle both routine medical care and emergencies for students, faculty, and the local community.`;
        }

        return null;
    };

    // Format bot response
    const formatBotResponse = (response) => {
        // Remove asterisks
        response = response.replace(/ /g, ' ');
        response = response.replace(/[#*]/g, '');
        
        // If response contains bullet points, format them with proper spacing
        if (response.includes('- ')) {
            const lines = response.split('\n');
            const formattedLines = lines.map(line => {
                if (line.trim().startsWith('- ')) {
                    // Add extra indentation and spacing for bullet points
                    return '\n' + line.trim() + '\n';
                }
                return line;
            });
            return formattedLines.join('\n');
        }
        
        return response;
    };

    // Generate API Response
    const generateAPIResponse = async (incomingMessageDiv) => {
        const textElement = incomingMessageDiv.querySelector(".text");

        if (!userMessage) {
            showTypingEffect("I'm sorry, I couldn't process your message. Please try again.", textElement, incomingMessageDiv);
            return;
        }

        const simpleResponse = processQuery(userMessage);

        if (simpleResponse) {
            showTypingEffect(simpleResponse, textElement, incomingMessageDiv);
            return;
        }
         // Format conversation for API request
        let conversationString = "";
        for (const turn of conversationHistory) {
            conversationString += `${turn.role}: ${turn.content}\n`;
        }

        // Add language parameter to the API request
        const apiBody = {
            contents: [{
                role: "user",
                parts: [{
                    text:   `As an SRM University assistant, with conversation history, answer the new question as well As an SRM University assistant, consider our conversation history:
                            ${conversationString}
                    
                            Now, answer the user's new question: ${userMessage} in ${currentLanguage} language. 
                          Include specific details and keep the response focused on official university information.`
                }]
            }]
        };

        try {
            // First try knowledge base
            let useGemini = false;
            try {
                const kbResponse = await fetch(`${FLASK_BASE_URL}/api/query-knowledge-base`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: userMessage,
                        language: currentLanguage
                    })
                });

                if (kbResponse.ok) {
                    const kbData = await kbResponse.json();
                     if (kbData.response) {
                         const formattedResponse = kbData.response.replace(/\n/g, '<br>');
                         // Remove '#' and '*' from the response
                        const cleanResponse = formattedResponse.replace(/[#*]/g, '');
                         showTypingEffect(cleanResponse,formattedResponse, textElement, incomingMessageDiv);
                         //showTypingEffect(kbData.response, textElement, incomingMessageDiv);
                         return;
                     }


                 }
                 useGemini = true;
             }  catch (error) {
                useGemini = true;
            }

            // Fall back to Gemini API if needed
            if (useGemini) {
                const response = await fetch(API_URL + `?key=${API_KEY}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(apiBody)
                });

                if (!response.ok) throw new Error('API request failed');

                const data = await response.json();
                const apiResponse = data.candidates[0].content.parts[0].text.trim();
                showTypingEffect(apiResponse, textElement, incomingMessageDiv);
            }
        } catch (error) {
            const errorMessages = {
                en: "I apologize, but I'm having trouble connecting. Please try again.",
                ta: "மன்னிக்கவும், இணைப்பில் சிக்கல் உள்ளது. மீண்டும் முயற்சிக்கவும்.",
                te: "క్షమించండి, కనెక్ట్ చేయడంలో సమస్య ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
                ml: "ക്ഷമിക്കണം, കണക്റ്റ് ചെയ്യുന്നതിൽ പ്രശ്നമുണ്ട്. വീണ്ടും ശ്രമിക്കുക.",
                hi: "क्षमा करें, प्रतिक्रिया उत्पन्न करने में कोई समस्या आई। कृपया विवरण जांचें या बाद में पुनः प्रयास करें।"
            };
            showTypingEffect(errorMessages[currentLanguage], textElement, incomingMessageDiv);
            textElement.classList.add("error");
        }
    };

    const CONFIG = {
        TYPING_SPEED: 10 // Configurable typing speed
    };

    // Show Typing Effect
    const showTypingEffect = (text, element, messageDiv) => {
        isPaused = false;
        const formattedText = formatBotResponse(text);
        const words = formattedText.split(' ');
        let currentIndex = 0;
        element.innerText = '';
        
        sendButton.textContent = "pause";
        
        const typingInterval = setInterval(() => {
            currentTypingInterval = typingInterval;
            if(isPaused) return;
            if (currentIndex < words.length) {
                element.innerText += (currentIndex === 0 ? '' : ' ') + words[currentIndex];
                currentIndex++;
                chatList.scrollTo(0, chatList.scrollHeight);
            } else {
                clearInterval(typingInterval);
                isResponseGenerating = false;
                messageDiv.classList.remove("loading");

                if (messageDiv.classList.contains("incoming")) {
                    sendButton.textContent = "send";
                    const copyButton = messageDiv.querySelector(".icon");
                    const voiceButton = messageDiv.querySelector(".icon.material-symbols-rounded[onclick*='speakMessage']");
                    if (copyButton) copyButton.classList.remove("hide");
                    if (voiceButton) voiceButton.classList.remove("hide");
                }

                localStorage.setItem("savedChats", chatList.innerHTML);
            }
        },
        1000 / CONFIG.TYPING_SPEED);
    };
     //Adding Pause and Resume Functionality
   const pauseResumeResponse = () => {
    if(isPaused){
        sendButton.textContent = "pause";
        isPaused = false;

    }else{
        sendButton.textContent = "send";
        isPaused = true;
        clearInterval(currentTypingInterval);

    }
   }

    // Handle outgoing chat
    const handleOutgoingChat = () => {
        const inputElement = typingForm.querySelector(".typing-input");
        userMessage = inputElement.value.trim() || userMessage;
        if (!userMessage || isResponseGenerating) return;

        isResponseGenerating = true;
        isPaused = false;

        const html = `
            <div class="message-content">
                <img src="images/user.jpg" alt="User Avatar" class="avatar">
                <p class="text">${userMessage}</p>
            </div>
        `;

        const outgoingMessageDiv = createMessageElement(html, true);
        chatList.appendChild(outgoingMessageDiv);
        inputElement.value = '';

        document.body.classList.add("hide-header");
        chatList.scrollTo(0, chatList.scrollHeight);
        /*setTimeout(showLoadingAnimation, 500);*/
        conversationHistory.push({ role: "user", content: userMessage });
         if (conversationHistory.length > maxHistoryLength) {
            conversationHistory.shift(); // remove the oldest entry
        }
        queryFrequency[userMessage] = (queryFrequency[userMessage] || 0) + 1;
        const simpleResponse = processQuery(userMessage);
        if (simpleResponse){
            const html = `
                <div class="message-content">
                    <img src="images/gemini.svg" alt="Bot Avatar" class="avatar">
                    <p class="text"></p>
                    <div class="loading-indicator">
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                    </div>
                </div>
                <span class="icon material-symbols-rounded hide" onclick="copyMessage(this)">content_copy</span>
                <span class="icon material-symbols-rounded voice-button hide" onclick="speakMessage(this)">volume_up</span>
            `;

            const incomingMessageDiv = createMessageElement(html, false);
            showTypingEffect(simpleResponse, incomingMessageDiv.querySelector(".text"), incomingMessageDiv);
            chatList.appendChild(incomingMessageDiv)

        }else{
           setTimeout(showLoadingAnimation, 500);
       }
     };

     const generateContextualSuggestions = (query) => {
        const lowerQuery = query.toLowerCase();
        let suggestions = [];
       
        if (lowerQuery.includes("admission")) {
            suggestions.push("What are the eligibility criteria?", "How can I apply?", "What documents do I need?");
        } else if (lowerQuery.includes("fees")) {
            suggestions.push("What is the fee structure for ECE?", "Are there any scholarships available?", "What payment methods are accepted?");
        } else if (lowerQuery.includes("course")) {
            suggestions.push("What are the core subjects?", "Is there industry exposure?", "Are there any electives?");
        } else if (lowerQuery.includes("placement")) {
            suggestions.push("Which companies recruit from SRM?", "What is the average salary package?", "How is the placement training?");
        } else if (lowerQuery.includes("health service")) {
            suggestions.push("What are the timings of the SRM Hospital?", "Where is the SRM hospital located", "How many doctors are in the hospital?");
        }
        // Add some random suggestions to make sure it always has something
        const allSuggestions = [
            "Tell me about campus life",
            "What research opportunities are there?",
            "How is the faculty?",
            "How is the infrastructure",
            "Is there a hospital in campus?"
        ]
        while (suggestions.length < 3 && allSuggestions.length > 0) {
            const randIndex = Math.floor(Math.random() * allSuggestions.length);
            suggestions.push(allSuggestions[randIndex]);
            allSuggestions.splice(randIndex, 1); // prevent repeats
        }
       
        return suggestions;
       };

       const displayContextualSuggestions = (messageDiv, query) => {
        const suggestions = generateContextualSuggestions(query);
        const suggestionList = messageDiv.querySelector("#contextual-suggestions");
        suggestionList.innerHTML = ""; // Clear existing suggestions
     const inputElement = document.querySelector(".typing-input");
        suggestions.forEach(suggestion => {
            const listItem = document.createElement("li");
            listItem.textContent = suggestion;
            listItem.classList.add("contextual-suggestion");
            listItem.addEventListener("click", () => {
                // When clicked, put suggestion into the typing area
                //The content is already there so handOutgoingChat
                inputElement.value= suggestion;
                handleOutgoingChat()
            });
            suggestionList.appendChild(listItem);
        });
    };
    

    // Show Loading Animation
    const showLoadingAnimation = () => {
        const html = `
        <div class="message-content">
            <img src="images/gemini.svg" alt="Bot Avatar" class="avatar">
            <p class="text"></p>
            <div class="loading-indicator">
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
                <div class="loading-bar"></div>
            </div>
             </div>
             <div class="frequent-questions">
              <h5>Related Questions:</h5>
            <ul class="suggestion-list" id="contextual-suggestions">
                <!-- Suggestions will be dynamically added here -->
            </ul>

        <span class="icon material-symbols-rounded hide" onclick="copyMessage(this)">content_copy</span>
        <span class="icon material-symbols-rounded voice-button hide" onclick="speakMessage(this)">volume_up</span>
    `;
   const incomingMessageDiv = createMessageElement(html, false);
   incomingMessageDiv.classList.add("loading");
   
   const textElement = incomingMessageDiv.querySelector(".text");

// Apply inline styles for gradient text effect
   /*textElement.style.background = "linear-gradient(45deg, #000000)";
   textElement.style.webkitBackgroundClip = "text";  // For WebKit browsers
   textElement.style.backgroundClip = "text";  
   textElement.style.webkitTextFillColor = "transparent";  // Makes the non-gradient part transparent
   textElement.style.fontWeight = "bold"; 
   textElement.style.fontSize = "1.2rem"; */
  
        showTypingEffect("Bot is thinking...", incomingMessageDiv.querySelector(".text"), incomingMessageDiv);
   chatList.appendChild(incomingMessageDiv);
   chatList.scrollTo(0, chatList.scrollHeight);
   displayContextualSuggestions(incomingMessageDiv, userMessage);
   generateAPIResponse(incomingMessageDiv);
};
    // Suggestion Group Management
    const hideAllGroups = () => {
        [suggestionsGroup1, suggestionsGroup2, suggestionsGroup3].forEach(group => {
            group.style.opacity = '0';
            group.style.visibility = 'hidden';
            group.style.pointerEvents = 'none';
        });
    };

    const showGroup = (groupNumber) => {
        hideAllGroups();
        const group = document.getElementById(`suggestions-group-${groupNumber}`);
        if (group) {
            group.style.opacity = '1';
            group.style.visibility = 'visible';
            group.style.pointerEvents = 'auto';
            group.style.zIndex = '3';
        }
    };

    // Update Button Visibility
    const updateButtonVisibility = () => {
        scrollUpButton.style.opacity = currentGroup === 1 ? '0.5' : '1';
        scrollUpButton.style.pointerEvents = currentGroup === 1 ? 'none' : 'auto';
        scrollDownButton.style.opacity = currentGroup === 3 ? '0.5' : '1';
        scrollDownButton.style.pointerEvents = currentGroup === 3 ? 'none' : 'auto';
    };

    // ========================= Event Listeners =========================
       //Adding Listener to send button

       inputElement.addEventListener("input", () => {
        const inputText = inputElement.value.toLowerCase();
        const filteredSuggestions = allSuggestions.filter(suggestion => suggestion.toLowerCase().startsWith(inputText));
        displayAutocompleteSuggestions(filteredSuggestions);
       });
       
       const displayAutocompleteSuggestions = (suggestions) => {
        const suggestionList = document.getElementById("autocomplete-list");
        suggestionList.innerHTML = ""; // clear any existing
       
        suggestions.forEach(suggestion => {
            const listItem = document.createElement("li");
            listItem.textContent = suggestion;
            listItem.classList.add("autocomplete-item");
            listItem.addEventListener("click", () => {
                inputElement.value = suggestion;
                suggestionList.innerHTML = ""; // clear list when selected
            });
            suggestionList.appendChild(listItem);
        });
       
        // Show or hide list based on content
        suggestionList.style.display = suggestions.length > 0 ? "block" : "none";
       };

   sendButton.addEventListener('click', (e) => {
    if(sendButton.textContent === "pause" || sendButton.textContent === "play_arrow"){
        e.preventDefault();
        pauseResumeResponse();
    }else{

        return;
    }
   });
    // Typing Form Submission
    typingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        handleOutgoingChat();
    });

    // Suggestion Navigation (Scroll Up)
    scrollUpButton.addEventListener('click', () => {
        if (currentGroup > 1) {
            currentGroup--;
            showGroup(currentGroup);
            updateButtonVisibility();
        }
    });

    // Suggestion Navigation (Scroll Down)
    scrollDownButton.addEventListener('click', () => {
        if (currentGroup < 3) {
            currentGroup++;
            showGroup(currentGroup);
            updateButtonVisibility();
        }
    });

    // Click Handlers for Suggestions
    document.querySelectorAll('.suggestion').forEach(suggestion => {
        suggestion.addEventListener("click", () => {
            const text = suggestion.querySelector(".text").textContent;
            userMessage = text;

            if (text === "Health Services") {
                userMessage = "Tell me about SRM Hospital and its medical services";
            }

            handleOutgoingChat();
        });
    });

    document.querySelectorAll(".suggestion").forEach(suggestion => {
        suggestion.addEventListener("mouseenter", function () {
            const imageUrl = this.getAttribute("data-image");
            this.style.backgroundImage = `url('${imageUrl}')`;
        });
    
        suggestion.addEventListener("mouseleave", function () {
            this.style.backgroundImage = "";
        });
    });
    

    // Theme Toggle
    toggleThemeButton.addEventListener("click", () => {
        const isLightMode = document.body.classList.toggle("light_mode");
        localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
        toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
    });

    // Delete Chat
    deleteChatButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete all messages?")) {
            localStorage.removeItem("savedChats");
            chatList.innerHTML = "";
            document.body.classList.remove("hide-header");
        }
    });

    // Language Selection
    languageSelect.addEventListener('change', (e) => {
        updateUILanguage(e.target.value);
    });

    // ========================= Initialization =========================
    showGroup(1);
    updateButtonVisibility();
    showWelcomeNotification();
});

// Make copyMessage accessible globally
window.copyMessage = copyMessage;
window.speakMessage = speakMessage

// Network Event Listeners for debugging
window.addEventListener('offline', () => {
    console.error('Network connection lost. Please check your internet connection.');
});

window.addEventListener('online', () => {
    console.log('Network connection restored.');
});