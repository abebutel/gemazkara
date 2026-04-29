import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import './App.css';

export default function App() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [includeNeshama, setIncludeNeshama] = useState(false);
  const [includeZohar, setIncludeZohar] = useState(false);
  const [includeTfilot, setIncludeTfilot] = useState(false);
  const [nusach, setNusach] = useState<'baladi' | 'shami'>('shami');
  const [isGenerated, setIsGenerated] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [calcDay, setCalcDay] = useState('');
  const [calcMonth, setCalcMonth] = useState('');
  const [calcYear, setCalcYear] = useState('');
  const [afterSunset, setAfterSunset] = useState(false);
  const [hebDateLetters, setHebDateLetters] = useState('');
  const [hebDateNumbers, setHebDateNumbers] = useState('');
  
  const isNativeApp = Capacitor.isNativePlatform();

  // S3 Data States
  const [appData, setAppData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch Data from S3
  useEffect(() => {
    fetch('https://azkarapp-data.s3.il-central-1.amazonaws.com/data.json')
      .then(response => response.json())
      .then(data => {
        // --- FRONTEND DATA PATCHER ---
        // Fixes S3 data formatting issues on the fly without bloating the UI code
        if (data.mishnahOutro) {
          data.mishnahOutro = data.mishnahOutro
            .replace(/\*פרק "יש מעלין"\*/g, '~פרק "יש מעלין"~')
            .replace(/\*אותיות "נשמה"\*/g, '~אותיות "נשמה"~')
            .replace(/תפילה בסיום לימוד המשניות/g, '~תפילה בסיום לימוד המשניות~')
            .replace(/רִבִּי חֲנַנְיָא[\s\S]*?יַגְדִּיל תּוֹרָה וְיַאְדִּיר:\n*/, '') // Removes Rabbi Chananya
            .trim();
        }
        if (data.mincha && data.mincha.baladi) {
           data.mincha.baladi = data.mincha.baladi.replace(/\nקדיש דעתיד\n/g, '\n~קדיש דעתיד~\n');
        }
        // ------------------------------
        
        setAppData(data);
        setIsLoadingData(false);
      })
      .catch(error => {
        console.error("Error loading data:", error);
        alert("שגיאה בטעינת הנתונים. אנא בדוק את חיבור האינטרנט שלך.");
        setIsLoadingData(false);
      });
  }, []);
  
  // Snap to top when generated
  useEffect(() => {
    if (isGenerated) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [isGenerated]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('name')) {
      setName(params.get('name') || '');
      const urlGender = params.get('gender');
      if (urlGender === 'male' || urlGender === 'female') setGender(urlGender);
      setIncludeNeshama(params.get('neshama') === 'true');
      setIncludeZohar(params.get('zohar') === 'true');
      setIncludeTfilot(params.get('tfilot') === 'true');
      const urlNusach = params.get('nusach');
      if (urlNusach === 'baladi' || urlNusach === 'shami') setNusach(urlNusach);
      setIsGenerated(true);
    }
  }, []);

  const handleGenerate = () => {
    if (name) {
      setIsGenerated(true);
      const newUrl = `${window.location.pathname}?name=${encodeURIComponent(name)}&gender=${gender}&neshama=${includeNeshama}&zohar=${includeZohar}&tfilot=${includeTfilot}&nusach=${nusach}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  const handleReset = () => {
    setIsGenerated(false);
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleShare = async () => {
    const shareText = `חוברת לימוד משניות ותהילים לעילוי נשמת ${name}`;
    const shareUrl = `https://azkarapp.com/${window.location.search}`;
    
    if (isNativeApp || typeof navigator.share === 'function') {
      try {
        await Share.share({
          title: 'חוברת לימוד',
          text: shareText,
          url: shareUrl,
          dialogTitle: 'שתף עם חברים'
        });
      } catch (err) {
        console.log('Share canceled', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl); 
      alert('הקישור הועתק ללוח!'); 
    }
  };

  const handlePrint = async () => {
    if (isNativeApp) {
      const win = window as any;
      if (win.cordova && win.cordova.plugins && win.cordova.plugins.printer) {
        win.cordova.plugins.printer.print();
      } else {
        alert("תכונת ההדפסה לא זמינה כרגע במכשיר זה.");
      }
    } else {
      window.print();
    }
  };

  const toGematria = (num: number): string => {
    if (num <= 0) return '';
    let n = num % 1000;
    const units = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
    const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
    const hundreds = ["", "ק", "ר", "ש", "ת", "תק", "תר", "תש", "תת", "תתק"];
    let res = hundreds[Math.floor(n / 100)] + tens[Math.floor((n % 100) / 10)] + units[n % 10];
    res = res.replace("יה", "טו").replace("יו", "טז");
    return res.length > 1 ? res.slice(0, -1) + '"' + res.slice(-1) : res + "'";
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); 
    window.addEventListener('resize', checkMobile); 
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Assistant:wght@400;600;800&family=Frank+Ruhl+Libre:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (calcDay && calcMonth && calcYear) {
      const d = parseInt(calcDay), m = parseInt(calcMonth) - 1, y = parseInt(calcYear);
      const dateObj = new Date(y, m, d);
      if (dateObj.getFullYear() === y && dateObj.getMonth() === m && dateObj.getDate() === d) {
        if (afterSunset) dateObj.setDate(dateObj.getDate() + 1);
        try {
          const parts = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(dateObj);
          const dayVal = parseInt(parts.find(p => p.type === 'day')?.value || '0');
          const monthName = parts.find(p => p.type === 'month')?.value || '';
          const yearVal = parseInt(parts.find(p => p.type === 'year')?.value || '0');
          setHebDateLetters(`${toGematria(dayVal)} ב${monthName} ${toGematria(yearVal)}`);
          setHebDateNumbers(`${dayVal} ב${monthName} ${yearVal}`);
        } catch { setHebDateLetters(''); setHebDateNumbers(''); }
      } else { setHebDateLetters(''); setHebDateNumbers(''); }
    } else { setHebDateLetters(''); setHebDateNumbers(''); }
  }, [calcDay, calcMonth, calcYear, afterSunset]);

  const mapLetter = (char: string) => {
    const finalMap: Record<string, string> = { 'ם': 'מ', 'ן': 'נ', 'ץ': 'צ', 'ף': 'פ', 'ך': 'כ' };
    return finalMap[char] || char;
  };

  const firstNameOnly = name.split(/\s+(?:בן|בת|בר)\s+/)[0];
  const letters = firstNameOnly.replace(/[^א-ת]/g, '').split('').map(mapLetter);

  const theme = {
    bg: '#f9f6f0',       
    primary: '#1a365d',  
    accent: '#d4af37',   
    card: '#ffffff',     
    text: '#2d3748',     
    uiFont: "'Assistant', sans-serif",
    bookFont: "'Frank Ruhl Libre', serif"
  };

  interface RenderOptions {
    forceCenter?: boolean;
    enlargeFirstLetter?: boolean; 
    sectionId?: string;
    isMinchaArvit?: boolean;
    isMishnahOutro?: boolean;
  }

  const renderFormattedText = (text: string, options: RenderOptions = {}) => {
    const { forceCenter = false, enlargeFirstLetter = false, sectionId = '', isMinchaArvit = false, isMishnahOutro = false } = options;
    
    let sectionHeaders: string[] = [];
    if (sectionId) {
      sectionHeaders = text.split('\n')
        .map(line => line.trim())
        .filter(line => (line.startsWith('*') && line.endsWith('*')) || (line.startsWith('~') && line.endsWith('~')))
        .map(line => line.substring(1, line.length - 1).trim());
    }

    let hasEnlargedInThisBlock = false;
    let inNeshamaSection = false;
    let neshamaEnlargedCount = 0;
    let isMultiLineWeak = false;
    let spanKeyCounter = 0;

    return text.split('\n').map((line: string, i: number) => {
      let cleanLine = line.trim();
      if (!cleanLine) return <br key={i} />;

      cleanLine = cleanLine.replace(/\^/g, '');

      let isH3 = false;
      let isBold = false;
      let headerText = cleanLine;

      if (cleanLine.startsWith('~') && cleanLine.endsWith('~')) {
          isH3 = true;
          headerText = cleanLine.substring(1, cleanLine.length - 1).trim();
      } else if (cleanLine.startsWith('*') && cleanLine.endsWith('*')) {
          isBold = true;
          headerText = cleanLine.substring(1, cleanLine.length - 1).trim();
      }

      const isHeader = isH3 || isBold;
      const hasHebrew = /[\u05D0-\u05EA]/.test(headerText);
      const hasNikud = /[\u0591-\u05C7]/.test(headerText);
      const isInstructionLine = isMinchaArvit && hasHebrew && !hasNikud && !isHeader;

      const anchorId = (isHeader && sectionId) ? `subtitle-${sectionId}-${headerText.replace(/\s+/g, '-')}` : undefined;

      let prefix = "";
      let firstLetter = "";
      let restOfLine = isHeader ? headerText : cleanLine;
      let shouldEnlarge = false;

      if (enlargeFirstLetter && !hasEnlargedInThisBlock && !isInstructionLine && !isHeader) {
        shouldEnlarge = true;
        hasEnlargedInThisBlock = true;
      } else if (isMishnahOutro && inNeshamaSection && !isInstructionLine && !isHeader && neshamaEnlargedCount < 4 && hasHebrew) {
        shouldEnlarge = true;
        neshamaEnlargedCount++;
      }

      if (shouldEnlarge) {
        const prefixMatch = restOfLine.match(/^([א-ת\d]{1,3}[.'׳"״)\]-]+\s*)/);
        let tempMain = restOfLine;
        if (prefixMatch) {
          prefix = prefixMatch[1];
          tempMain = restOfLine.substring(prefix.length);
        }

        const letterMatch = tempMain.match(/^([^א-ת\uFB1D-\uFB4F]*)([א-ת\uFB1D-\uFB4F][\u0591-\u05C7]*)(.*)$/);
        if (letterMatch) {
           prefix += letterMatch[1];
           firstLetter = letterMatch[2].normalize('NFKD');
           restOfLine = letterMatch[3];
        }
      }

      const renderParts = (textStr: string) => {
        const spans: ReactNode[] = [];
        let currentBuffer = "";

        const pushBuffer = () => {
          if (!currentBuffer) return;
          const subParts = currentBuffer.split(/(\([^)]+\))/g);
          subParts.forEach((sp) => {
            if (!sp) return;
            if (sp.startsWith('(') && sp.endsWith(')')) {
              spans.push(<span key={`sp-${spanKeyCounter++}`} style={{ opacity: 0.65, fontSize: `${Math.max(14, fontSize - 2)}px` }}>{sp}</span>);
            } else if (isMultiLineWeak) {
              spans.push(<span key={`sp-${spanKeyCounter++}`} style={{ opacity: 0.65, fontSize: `${Math.max(14, fontSize - 2)}px` }}>{sp}</span>);
            } else {
              spans.push(<span key={`sp-${spanKeyCounter++}`}>{sp}</span>);
            }
          });
          currentBuffer = "";
        };

        for (let j = 0; j < textStr.length; j++) {
          const char = textStr[j];
          if (char === '{') {
            pushBuffer();
            isMultiLineWeak = true;
          } else if (char === '}') {
            pushBuffer();
            isMultiLineWeak = false;
          } else {
            currentBuffer += char;
          }
        }
        pushBuffer();
        return spans;
      };

      const content = (
        <>
          {firstLetter ? (
            <>
              {renderParts(prefix)}
              <span style={{ fontSize: `${fontSize + 10}px`, fontWeight: '900', color: theme.primary, marginLeft: '2px', opacity: isMultiLineWeak ? 0.65 : 1 }}>
                {firstLetter}
              </span>
              {renderParts(restOfLine)}
            </>
          ) : (
            renderParts(restOfLine)
          )}
        </>
      );

      const renderNavDetails = () => {
          if (!anchorId || sectionHeaders.length <= 1) return null;
          return (
            <details className="no-print" style={{ textAlign: 'center', marginBottom: '25px' }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.95rem', color: theme.primary, display: 'inline-block', padding: '5px 15px', fontWeight: 600, backgroundColor: '#edf2f7', borderRadius: '20px', border: `1px dashed ${theme.primary}` }}>
                ⏷ ניווט לפרקים נוספים
              </summary>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '12px', padding: '0 10px' }}>
                {sectionHeaders.map((h, idx) => (
                  <a 
                    key={idx} 
                    href={`#subtitle-${sectionId}-${h.replace(/\s+/g, '-')}`}
                    style={{ padding: '5px 12px', backgroundColor: h === headerText ? theme.primary : '#ffffff', color: h === headerText ? 'white' : theme.primary, borderRadius: '15px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: h === headerText ? 700 : 600, border: `1px solid ${theme.primary}`, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                  >
                    {h}
                  </a>
                ))}
              </div>
            </details>
          );
      };

      if (isH3) {
          if (isMishnahOutro && cleanLine.replace(/["”“'״׳*~]/g, "").includes("אותיות נשמה")) {
            inNeshamaSection = true;
          }
          const h3Element = (
            <h3 className="print-heading" style={{ color: theme.accent, textAlign: 'center', fontSize: '1.8rem', marginBottom: '15px', marginTop: '35px' }}>
              ~ {headerText} ~
            </h3>
          );

          if (anchorId) {
              return (
                <div key={i} id={anchorId} style={{ marginTop: '20px' }}>
                  {h3Element}
                  {renderNavDetails()}
                </div>
              );
          }
          return <div key={i}>{h3Element}</div>;
      }

      const pStyle = {
        fontWeight: isBold ? '700' : '400',
        fontSize: isBold ? `${fontSize + 4}px` : (isInstructionLine ? `${Math.max(14, fontSize - 3)}px` : `${fontSize}px`),
        marginTop: isBold ? '35px' : '5px',
        marginBottom: isInstructionLine ? '5px' : '15px',
        color: isBold ? theme.primary : (isInstructionLine ? '#718096' : theme.text),
        textAlign: isBold || forceCenter || isInstructionLine ? 'center' : ('justify' as any),
        lineHeight: isInstructionLine ? '1.5' : '1.9'
      };

      if (anchorId) {
          return (
            <div key={i} id={anchorId} style={{ marginTop: '20px' }}>
              <p style={pStyle}>{content}</p>
              {renderNavDetails()}
            </div>
          );
      }

      return <p key={i} style={pStyle}>{content}</p>;
    });
  };

  const MiniTOC = ({ text, sectionId }: { text: string, sectionId: string }) => {
    if (!text) return null;
    const headers = text.split('\n')
      .map(line => line.trim())
      .filter(line => (line.startsWith('*') && line.endsWith('*')) || (line.startsWith('~') && line.endsWith('~')))
      .map(line => line.substring(1, line.length - 1).trim());

    if (headers.length === 0) return null;

    return (
      <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '25px', padding: '0 10px' }}>
        {headers.map((h, i) => (
          <a key={i} href={`#subtitle-${sectionId}-${h.replace(/\s+/g, '-')}`} style={{ padding: '6px 14px', backgroundColor: '#edf2f7', color: theme.primary, borderRadius: '20px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, border: `1px solid #cbd5e0`, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
            {h}
          </a>
        ))}
      </div>
    );
  };

  const SectionCard = ({ id, title, children }: { id: string, title: string, children: ReactNode }) => (
    <section id={id} className="booklet-section" style={{ backgroundColor: theme.card, padding: isMobile ? '25px 20px' : '45px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', marginBottom: '35px' }}>
      <h2 className="print-section-title" style={{ textAlign: 'center', color: theme.primary, fontFamily: theme.uiFont, borderBottom: `2px solid ${theme.accent}`, paddingBottom: '15px', marginBottom: '25px', fontSize: isMobile ? '1.8rem' : '2.2rem' }}>{title}</h2>
      <div style={{ color: theme.text }}>{children}</div>
    </section>
  );

  if (isLoadingData) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl', fontFamily: theme.uiFont }}>
        <div style={{ fontSize: '24px', color: theme.primary, fontWeight: 'bold' }}>טוען נתונים...</div>
      </div>
    );
  }

  if (!isGenerated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: theme.uiFont, padding: '20px', direction: 'rtl', gap: '20px' }}>
        <div style={{ backgroundColor: theme.card, padding: '40px 30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', width: '100%', maxWidth: '450px', textAlign: 'center', borderTop: `6px solid ${theme.primary}` }}>
          <h1 style={{ color: theme.primary, marginBottom: '15px', fontSize: '2.5rem', fontWeight: 800 }}>חוברת לימוד</h1>
          <p style={{ color: '#718096', marginBottom: '35px', fontSize: '1.2rem' }}>לעילוי נשמת הנפטר</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'right' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.primary, fontWeight: 600 }}>שם הנפטר/ת (לדוגמה: אדם בן רחל)</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#f8fafc', color: theme.text, boxSizing: 'border-box', fontFamily: theme.uiFont }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.primary, fontWeight: 600 }}>מין</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#f8fafc', color: theme.text, boxSizing: 'border-box', fontFamily: theme.uiFont, cursor: 'pointer' }}>
                <option value="male">זכר</option><option value="female">נקבה</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.primary, fontWeight: 600 }}>נוסח התפילות (קדיש, מנחה, ערבית)</label>
              <select value={nusach} onChange={(e) => setNusach(e.target.value as 'baladi' | 'shami')} style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#f8fafc', color: theme.text, boxSizing: 'border-box', fontFamily: theme.uiFont, cursor: 'pointer' }}>
                <option value="shami">שאמי</option><option value="baladi">בלדי</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: theme.primary, fontWeight: 600, fontSize: '1.1rem' }}>
                <input type="checkbox" checked={includeNeshama} onChange={(e) => setIncludeNeshama(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                להוסיף תהילים של ״נשמה״
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: theme.primary, fontWeight: 600, fontSize: '1.1rem' }}>
                <input type="checkbox" checked={includeZohar} onChange={(e) => setIncludeZohar(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                להוסיף זוהר (אדרא זוטא)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: theme.primary, fontWeight: 600, fontSize: '1.1rem' }}>
                <input type="checkbox" checked={includeTfilot} onChange={(e) => setIncludeTfilot(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                להוסיף תפילת מנחה וערבית
              </label>
            </div>
            <button onClick={handleGenerate} style={{ padding: '16px', backgroundColor: theme.primary, color: 'white', fontSize: '1.2rem', fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '15px', boxShadow: '0 4px 6px rgba(26, 54, 93, 0.2)' }}>הכן חוברת לימוד</button>
          </div>
        </div>
        <p style={{ color: '#718096', fontSize: '1.05rem', margin: '5px 0' }}>תודה ל<a href="https://nosachteiman.co.il/" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary, fontWeight: 'bold', textDecoration: 'underline' }}>נוסח תימן</a> על הטקסט</p>
        <div style={{ backgroundColor: theme.card, padding: '25px', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.04)', width: '100%', maxWidth: '450px', textAlign: 'center', borderTop: `4px solid ${theme.accent}` }}>
          <h2 style={{ color: theme.primary, marginBottom: '10px', fontSize: '1.4rem', fontWeight: 700 }}>מחשבון תאריך עברי</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', textAlign: 'right' }}>
            <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '0.9rem', color: theme.primary, marginBottom: '5px' }}>שנה</label><input type="number" placeholder="2026" value={calcYear} onChange={(e) => setCalcYear(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: '#fff', color: theme.text, boxSizing: 'border-box' }}/></div>
            <div style={{ flex: 1.5 }}><label style={{ display: 'block', fontSize: '0.9rem', color: theme.primary, marginBottom: '5px' }}>חודש</label><select value={calcMonth} onChange={(e) => setCalcMonth(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: '#fff', color: theme.text, boxSizing: 'border-box', cursor: 'pointer' }}><option value="">בחר...</option><option value="1">ינואר</option><option value="2">פברואר</option><option value="3">מרץ</option><option value="4">אפריל</option><option value="5">מאי</option><option value="6">יוני</option><option value="7">יולי</option><option value="8">אוגוסט</option><option value="9">ספטמבר</option><option value="10">אוקטובר</option><option value="11">נובמבר</option><option value="12">דצמבר</option></select></div>
            <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '0.9rem', color: theme.primary, marginBottom: '5px' }}>יום</label><input type="number" placeholder="16" min="1" max="31" value={calcDay} onChange={(e) => setCalcDay(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: '#fff', color: theme.text, boxSizing: 'border-box' }}/></div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', color: theme.text, fontSize: '1.1rem', marginBottom: '20px' }}><input type="checkbox" checked={afterSunset} onChange={(e) => setAfterSunset(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />התאריך חל <strong>לאחר השקיעה</strong></label>
          {hebDateLetters && <div style={{ padding: '15px', backgroundColor: '#f0f4f8', border: `1px solid ${theme.primary}`, borderRadius: '8px', color: theme.primary }}><div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '5px' }}>{hebDateLetters}</div><div style={{ fontSize: '1.1rem', color: '#4a5568', opacity: 0.8 }}>({hebDateNumbers})</div></div>}
        </div>
        {!isNativeApp && (
          <footer style={{ maxWidth: '600px', textAlign: 'center', marginTop: '20px', color: '#718096', fontSize: '0.9rem', lineHeight: '1.6' }}><strong>אודות המערכת:</strong><br/>אפליקציית ״אזכרה״ מאפשרת יצירת חוברת אזכרה אישית להדפסה ולשיתוף בחינם. המערכת מפיקה אוטומטית סדר לימוד משניות לעילוי נשמת הנפטר (לפי אותיות השם), פרקי תהילים, אותיות נשמה, אדרא זוטא ותפילות השכבה וקדיש. בנוסף, האתר כולל מחשבון תאריך עברי לאזכרה לאיתור מדויק של יום הפטירה.</footer>
        )}
      </div>
    );
  }

  const mishnayotData = appData.mishnayot as Record<string, string[]>;
  const mishnayotData2 = (appData as any).mishnayot2 as Record<string, string[]> || {};
  const tehillimData = appData.tehillim as Record<string, string[]>;

  const getMishnayotForLetter = (char: string, index: number, allLetters: string[]) => {
    const appearanceCount = allLetters.slice(0, index).filter(c => c === char).length;
    if (appearanceCount === 1 && mishnayotData2[char]) {
      return mishnayotData2[char];
    }
    return mishnayotData[char];
  };

  return (
    <div style={{ display: 'flex', direction: 'rtl', fontFamily: theme.bookFont, minHeight: '100vh', backgroundColor: theme.bg, flexDirection: isMobile ? 'column' : 'row' }}>
      <style>{`
        html { scroll-behavior: auto; scroll-padding-top: 90px; }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
        @media print {
          header, nav, .no-print { display: none !important; }
          body, html, main, div { background-color: white !important; color: black !important; }
          .booklet-section { page-break-before: always; box-shadow: none !important; padding: 40px 0 !important; border-top: 3px solid #1a365d !important; border-bottom: 3px solid #1a365d !important; border-radius: 0 !important; margin-bottom: 0 !important; }
          .print-toc-page, .print-back-cover { page-break-before: always; border: none !important; padding: 40px 0 !important; }
          p { line-height: 2 !important; font-size: 14pt !important; }
          .print-heading { color: #d4af37 !important; }
          .print-section-title { color: #1a365d !important; border-bottom-color: #d4af37 !important; }
          .print-only { display: flex !important; }
          @page { margin: 2cm; }
        }
        .print-only { display: none; }
      `}</style>

      {isMobile ? (
        <header className="no-print" style={{ position: 'sticky', top: 0, backgroundColor: theme.card, borderBottom: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', fontSize: '28px', color: theme.primary, cursor: 'pointer' }}>☰</button>
          <div style={{ display: 'flex', gap: '8px', fontFamily: theme.uiFont, alignItems: 'center' }}>
            <button onClick={handleShare} style={{ padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: theme.primary, color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>🔗 שתף</button>
            <button onClick={handlePrint} style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${theme.primary}`, backgroundColor: 'white', color: theme.primary, fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>📥 הורד</button>
            <button onClick={() => setFontSize(f => f + 2)} style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${theme.primary}`, color: theme.primary, background: 'transparent', fontSize: '14px', fontWeight: 600 }}>A+</button>
            <button onClick={() => setFontSize(f => Math.max(14, f - 2))} style={{ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${theme.primary}`, color: theme.primary, background: 'transparent', fontSize: '14px', fontWeight: 600 }}>A-</button>
          </div>
        </header>
      ) : (
        <nav className="no-print" style={{ width: '280px', padding: '30px 20px', backgroundColor: theme.card, borderLeft: '1px solid #e2e8f0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', fontFamily: theme.uiFont, boxShadow: '-2px 0 15px rgba(0,0,0,0.03)' }}>
          <button onClick={handleReset} style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '8px', border: `2px solid ${theme.primary}`, backgroundColor: '#f0f4f8', color: theme.primary, fontSize: '16px', fontWeight: 800, cursor: 'pointer' }}>🏠 חזור לעמוד הראשי</button>
          <h3 style={{ color: theme.primary, fontSize: '1.4rem', borderBottom: `2px solid ${theme.accent}`, paddingBottom: '10px', marginBottom: '20px' }}>תוכן עניינים</h3>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5', fontSize: '1.1rem' }}>
            <li><a href="#tefillah" style={{ textDecoration: 'none', color: '#4a5568' }}>תפילה קודם הלימוד</a></li>
            <li><a href="#mishnayot" style={{ textDecoration: 'none', color: '#4a5568' }}>לימוד משניות</a></li>
            <li><a href="#tehillim" style={{ textDecoration: 'none', color: '#4a5568' }}>תהילים</a></li>
            {includeZohar && <li><a href="#zohar" style={{ textDecoration: 'none', color: '#4a5568' }}>זוהר (אדרא זוטא)</a></li>}
            <li><a href="#sium_tefillah" style={{ textDecoration: 'none', color: '#4a5568' }}>תפילה בסיום הלימוד</a></li>
            <li><a href="#hashkava" style={{ textDecoration: 'none', color: '#4a5568' }}>השכבה</a></li>
            <li><a href="#kaddish" style={{ textDecoration: 'none', color: '#4a5568' }}>קדיש</a></li>
            {includeTfilot && <li><a href="#mincha" style={{ textDecoration: 'none', color: '#4a5568' }}>מנחה</a></li>}
            {includeTfilot && <li><a href="#arvit" style={{ textDecoration: 'none', color: '#4a5568' }}>ערבית</a></li>}
          </ul>
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <h4 style={{ color: theme.primary, marginBottom: '15px' }}>גודל טקסט</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setFontSize(f => f + 2)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: `1px solid ${theme.primary}`, color: theme.primary, background: 'transparent', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>A+</button>
              <button onClick={() => setFontSize(f => Math.max(14, f - 2))} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: `1px solid ${theme.primary}`, color: theme.primary, background: 'transparent', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>A-</button>
            </div>
            {!isNativeApp && (
              <>
                <button onClick={handleShare} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '6px', border: 'none', backgroundColor: theme.primary, color: 'white', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>🔗 שתף קישור</button>
                <button onClick={handlePrint} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: `1px solid ${theme.primary}`, backgroundColor: 'transparent', color: theme.primary, fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>📥 הורד כ-PDF</button>
              </>
            )}
          </div>
        </nav>
      )}

      {isMobile && isMenuOpen && (
        <nav className="no-print" style={{ position: 'fixed', top: '65px', left: 0, right: 0, maxHeight: 'calc(100vh - 65px)', overflowY: 'auto', backgroundColor: theme.card, padding: '20px', borderBottom: `3px solid ${theme.primary}`, zIndex: 999, boxShadow: '0 10px 20px rgba(0,0,0,0.1)', fontFamily: theme.uiFont }}>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '3', margin: 0, fontSize: '1.2rem' }}>
            <li style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '2px solid #e2e8f0' }}><button onClick={() => { setIsMenuOpen(false); handleReset(); }} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: `2px solid ${theme.primary}`, backgroundColor: '#f0f4f8', color: theme.primary, fontSize: '16px', fontWeight: 800, cursor: 'pointer' }}>🏠 חזור לעמוד הראשי</button></li>
            <li><a href="#tefillah" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text, borderBottom: '1px solid #f1f5f9' }}>תפילה קודם הלימוד</a></li>
            <li><a href="#mishnayot" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text, borderBottom: '1px solid #f1f5f9' }}>לימוד משניות</a></li>
            <li><a href="#tehillim" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text, borderBottom: '1px solid #f1f5f9' }}>תהילים</a></li>
            {includeZohar && <li><a href="#zohar" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text, borderBottom: '1px solid #f1f5f9' }}>זוהר (אדרא זוטא)</a></li>}
            <li><a href="#sium_tefillah" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text, borderBottom: '1px solid #f1f5f9' }}>תפילה בסיום הלימוד</a></li>
            <li><a href="#hashkava" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text, borderBottom: '1px solid #f1f5f9' }}>השכבה</a></li>
            <li><a href="#kaddish" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text, borderBottom: '1px solid #f1f5f9' }}>קדיש</a></li>
            {includeTfilot && <li><a href="#mincha" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text, borderBottom: '1px solid #f1f5f9' }}>מנחה</a></li>}
            {includeTfilot && <li><a href="#arvit" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text }}>ערבית</a></li>}
          </ul>
        </nav>
      )}

      <main style={{ flex: 1, padding: isMobile ? '20px' : '40px', fontSize: `${fontSize}px`, maxWidth: '900px', margin: '0 auto', lineHeight: '1.9' }}>
        
        <div className="print-only print-toc-page" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
          <h1 style={{ color: theme.primary, fontSize: '40pt', marginBottom: '10px', fontFamily: theme.uiFont }}>חוברת לימוד</h1>
          <p style={{ fontSize: '24pt', marginBottom: '40px', color: '#4a5568' }}>לעילוי נשמת {name}</p>
          <h2 style={{ color: theme.primary, fontSize: '28pt', borderBottom: `3px solid ${theme.accent}`, paddingBottom: '15px', marginBottom: '30px', display: 'inline-block' }}>תוכן עניינים</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '20pt', lineHeight: '2.2' }}>
            <li>תפילה קודם הלימוד</li><li>לימוד משניות</li><li>תהילים</li>
            {includeZohar && <li>זוהר</li>}
            <li>תפילה בסיום הלימוד</li><li>השכבה</li><li>קדיש</li>
            {includeTfilot && <li>מנחה</li>}
            {includeTfilot && <li>ערבית</li>}
          </ul>
        </div>

        <SectionCard id="tefillah" title="תפילה קודם הלימוד">
          {renderFormattedText(appData.tefillah[gender].replace(/\{\s*name\s*\}/g, name))}
        </SectionCard>

        <SectionCard id="mishnayot" title="לימוד משניות">
          {renderFormattedText(appData.mishnahIntro)}
          {letters.map((char: string, index: number) => {
            const blockData = getMishnayotForLetter(char, index, letters);
            return (
             <div key={`mishnah-${index}`} style={{ marginBottom: '35px' }}>
               <h3 className="print-heading" style={{ color: theme.accent, textAlign: 'center', fontSize: '1.8rem', marginBottom: '15px' }}>~ אות {char} ~</h3>
               {blockData ? blockData.map((text: string, i: number) => <div key={i}>{renderFormattedText(text, { enlargeFirstLetter: i === 0 })}</div>) : <p>הטקסט יתווסף בהמשך</p>}
             </div>
            );
          })}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            {renderFormattedText(appData.mishnahOutro, { isMishnahOutro: true })}
          </div>
        </SectionCard>

        <SectionCard id="tehillim" title="תהילים">
          <p style={{ textAlign: 'center', marginBottom: '35px', fontWeight: 700, color: theme.primary }}>{appData.tehillimIntro}</p>
          {letters.map((char: string, index: number) => (
             <div key={`tehillim-${index}`} style={{ marginBottom: '30px' }}>
               <h3 className="print-heading" style={{ color: theme.accent, textAlign: 'center', fontSize: '1.8rem', marginBottom: '15px' }}>~ אות {char} ~</h3>
               {tehillimData[char] ? tehillimData[char].map((text: string, i: number) => <div key={i}>{renderFormattedText(text, { forceCenter: true })}</div>) : <p>הטקסט יתווסף בהמשך</p>}
             </div>
          ))}
          {includeNeshama && (
            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px dashed #e2e8f0' }}>
              <h3 className="print-heading" style={{ color: theme.primary, textAlign: 'center', fontSize: '2rem', marginBottom: '25px' }}>~ תהילים לאותיות נשמה ~</h3>
              {['נ', 'ש', 'מ', 'ה'].map((char: string, index: number) => (
               <div key={`tehillim-neshama-${index}`} style={{ marginBottom: '30px' }}>
                 <h3 className="print-heading" style={{ color: theme.accent, textAlign: 'center', fontSize: '1.8rem', marginBottom: '15px' }}>~ אות {char} ~</h3>
                 {tehillimData[char] ? tehillimData[char].map((text: string, i: number) => <div key={i}>{renderFormattedText(text, { forceCenter: true })}</div>) : <p>הטקסט יתווסף בהמשך</p>}
               </div>
              ))}
            </div>
          )}
        </SectionCard>

        {includeZohar && (
          <SectionCard id="zohar" title="זוהר (אדרא זוטא)">
            {appData.zohar.map((paragraph: { aramaic: string, hebrew: string }, index: number) => (
              <div key={index} style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: index !== appData.zohar.length - 1 ? '1px dashed #cbd5e0' : 'none' }}>
                <p style={{ fontWeight: '700', marginBottom: '12px', color: theme.primary, textAlign: 'justify' }}>{paragraph.aramaic}</p>
                <p style={{ color: '#4a5568', textAlign: 'justify' }}>{paragraph.hebrew}</p>
              </div>
            ))}
          </SectionCard>
        )}

        <SectionCard id="sium_tefillah" title="תפילה כללית בסיום הלימוד">
          {renderFormattedText(appData.siumTefillah[gender].replace(/\{\s*name\s*\}/g, name))}
          <p style={{ textAlign: 'center', fontWeight: 'bold', color: theme.primary, marginTop: '25px', opacity: 0.8 }}>
            (אם יש עשרה, אומרים רבי חנניה וקדיש על ישראל)
          </p>
          <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px dashed #cbd5e0' }}>
             {renderFormattedText("רִבִּי חֲנַנְיָא בֶּן עֲקַשְׁיָא אוֹמֵר, רָצָה הַקָּדוֹשׁ בָּרוּךְ הוּא לְזַכּוֹת אֶת יִשְׂרָאֵל, לְפִיכָּךְ הִרְבָּה לָהֶם תּוֹרָה וּמִצְוֹת. שֶׁנֶּאֱמָר: יְהֹוָה חָפֵץ לְמַעַן צִדְקוֹ. יַגְדִּיל תּוֹרָה וְיַאְדִּיר:", { forceCenter: true })}
          </div>
        </SectionCard>

        <SectionCard id="hashkava" title="השכבה">
          {renderFormattedText(appData.hashkava[gender].replace(/\{\s*name\s*\}/g, name))}
        </SectionCard>

        <SectionCard id="kaddish" title="קדיש">
          <div style={{ textAlign: 'center' }}>
            <h4 className="no-print" style={{ color: theme.primary, marginBottom: '10px', fontSize: '1.2rem', opacity: 0.8 }}>נוסח {nusach === 'baladi' ? 'בלדי' : 'שאמי'}</h4>
            {appData.kaddish ? renderFormattedText((appData.kaddish as Record<string, string>)[nusach], { forceCenter: true }) : <p>הטקסט יתווסף בהמשך</p>}
          </div>
        </SectionCard>

        {includeTfilot && (
          <>
            <SectionCard id="mincha" title="תפילת מנחה">
              <MiniTOC 
                text={appData.mincha ? (appData.mincha as Record<string, string>)[nusach] : ''} 
                sectionId="mincha" 
              />
              {appData.mincha 
                ? renderFormattedText((appData.mincha as Record<string, string>)[nusach] || 'הטקסט יתווסף בהמשך', { sectionId: 'mincha', isMinchaArvit: true }) 
                : <p>הטקסט יתווסף בהמשך</p>}
            </SectionCard>
            <SectionCard id="arvit" title="תפילת ערבית">
               <MiniTOC 
                 text={appData.arvit ? (appData.arvit as Record<string, string>)[nusach] : ''} 
                 sectionId="arvit" 
               />
               {appData.arvit 
                 ? renderFormattedText((appData.arvit as Record<string, string>)[nusach] || 'הטקסט יתווסף בהמשך', { sectionId: 'arvit', isMinchaArvit: true }) 
                 : <p>הטקסט יתווסף בהמשך</p>}
            </SectionCard>
          </>
        )}

        <div className="print-only print-back-cover" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', fontFamily: theme.uiFont }}>
          <h2 style={{ color: theme.primary, fontSize: '24pt', marginBottom: '15px' }}>{'הוכן ע״י www.azkarapp.com'}</h2>
          <p style={{ fontSize: '16pt', color: '#4a5568', marginBottom: '40px' }}>ליצירת חוברת משלכם, סרקו את הקוד:</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://azkarapp.com" alt="QR Code" style={{ width: '200px', height: '200px', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', backgroundColor: 'white' }} />
        </div>

      </main>
    </div>
  );
}