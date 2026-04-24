import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { appData } from './data';
import './App.css';

export default function App() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [includeNeshama, setIncludeNeshama] = useState(false);
  const [includeZohar, setIncludeZohar] = useState(false); // New: Zohar option
  const [nusach, setNusach] = useState<'baladi' | 'shami'>('baladi'); // New: Nusach option
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

  // URL Parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlName = params.get('name');
    const urlGender = params.get('gender');
    const urlNeshama = params.get('neshama');
    const urlZohar = params.get('zohar');
    const urlNusach = params.get('nusach');

    if (urlName) {
      setName(urlName);
      if (urlGender === 'male' || urlGender === 'female') setGender(urlGender);
      if (urlNeshama === 'true') setIncludeNeshama(true);
      if (urlZohar === 'true') setIncludeZohar(true);
      if (urlNusach === 'baladi' || urlNusach === 'shami') setNusach(urlNusach);
      setIsGenerated(true);
    }
  }, []);

  const handleGenerate = () => {
    if (name) {
      setIsGenerated(true);
      const newUrl = `${window.location.pathname}?name=${encodeURIComponent(name)}&gender=${gender}&neshama=${includeNeshama}&zohar=${includeZohar}&nusach=${nusach}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  const handleReset = () => {
    setIsGenerated(false);
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'חוברת לימוד',
      text: `חוברת לימוד משניות ותהילים לעילוי נשמת ${name}`,
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('הקישור הועתק ללוח!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toGematria = (num: number): string => {
    if (num <= 0) return '';
    let n = num % 1000;
    const units = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
    const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
    const hundreds = ["", "ק", "ר", "ש", "ת", "תק", "תר", "תש", "תת", "תתק"];
    let res = hundreds[Math.floor(n / 100)] + tens[Math.floor((n % 100) / 10)] + units[n % 10];
    res = res.replace("יה", "טו").replace("יו", "טז");
    if (res.length > 1) return res.slice(0, -1) + '"' + res.slice(-1);
    return res + "'";
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
      const d = parseInt(calcDay);
      const m = parseInt(calcMonth) - 1;
      const y = parseInt(calcYear);
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
        } catch {
          setHebDateLetters(''); setHebDateNumbers('');
        }
      } else {
        setHebDateLetters(''); setHebDateNumbers('');
      }
    } else {
      setHebDateLetters(''); setHebDateNumbers('');
    }
  }, [calcDay, calcMonth, calcYear, afterSunset]);

  const mapLetter = (char: string) => {
    const finalMap: Record<string, string> = { 'ם': 'מ', 'ן': 'נ', 'ץ': 'צ', 'ף': 'פ', 'ך': 'כ' };
    return finalMap[char] || char;
  };

  const letters = name.replace(/[^א-ת]/g, '').split('').map(mapLetter);

  const theme = {
    bg: '#f9f6f0',
    primary: '#1a365d',
    accent: '#d4af37',
    card: '#ffffff',
    text: '#2d3748',
    uiFont: "'Assistant', sans-serif",
    bookFont: "'Frank Ruhl Libre', serif"
  };

  const renderFormattedText = (text: string) => {
    const h3Headers = ['פרק "יש מעלין"', 'אותיות "נשמה"'];
    const boldHeaders = ["תפילה בסיום לימוד המשניות"];
    return text.split('\n').map((line: string, i: number) => {
      const cleanLine = line.replace(/["”“'']/g, "");
      if (h3Headers.some(h => cleanLine.includes(h.replace(/["”“'']/g, "")))) {
        return <h3 key={i} className="print-heading" style={{ color: theme.accent, textAlign: 'center', fontSize: '1.8rem', marginBottom: '15px', marginTop: '35px' }}>~ {line} ~</h3>;
      }
      const isBoldHeader = boldHeaders.some(h => cleanLine.includes(h.replace(/["”“'']/g, "")));
      return <p key={i} style={{ fontWeight: isBoldHeader ? '700' : '400', fontSize: isBoldHeader ? `${fontSize + 4}px` : `${fontSize}px`, marginTop: isBoldHeader ? '35px' : '5px', color: isBoldHeader ? theme.primary : theme.text, textAlign: isBoldHeader ? 'center' : 'justify' }}>{line}</p>;
    });
  };

  const SectionCard = ({ id, title, children }: { id: string, title: string, children: ReactNode }) => (
    <section id={id} className="booklet-section" style={{ backgroundColor: theme.card, padding: isMobile ? '25px 20px' : '45px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', marginBottom: '35px' }}>
      <h2 className="print-section-title" style={{ textAlign: 'center', color: theme.primary, fontFamily: theme.uiFont, borderBottom: `2px solid ${theme.accent}`, paddingBottom: '15px', marginBottom: '25px', fontSize: isMobile ? '1.8rem' : '2.2rem' }}>{title}</h2>
      <div style={{ color: theme.text }}>{children}</div>
    </section>
  );

  if (!isGenerated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: theme.uiFont, padding: '20px', direction: 'rtl', gap: '20px' }}>
        <div style={{ backgroundColor: theme.card, padding: '40px 30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', width: '100%', maxWidth: '450px', textAlign: 'center', borderTop: `6px solid ${theme.primary}` }}>
          <h1 style={{ color: theme.primary, marginBottom: '15px', fontSize: '2.5rem', fontWeight: 800 }}>חוברת לימוד</h1>
          <p style={{ color: '#718096', marginBottom: '35px', fontSize: '1.2rem' }}>לעילוי נשמת הנפטר</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'right' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.primary, fontWeight: 600 }}>שם הנפטר/ת (לדוגמה: אדם בן רחל)</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#f8fafc', boxSizing: 'border-box', fontFamily: theme.uiFont }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.primary, fontWeight: 600 }}>מין</label>
              <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#f8fafc', boxSizing: 'border-box', fontFamily: theme.uiFont, cursor: 'pointer' }}>
                <option value="male">זכר</option><option value="female">נקבה</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.primary, fontWeight: 600 }}>נוסח</label>
              <select value={nusach} onChange={(e) => setNusach(e.target.value as 'baladi' | 'shami')} style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#f8fafc', boxSizing: 'border-box', fontFamily: theme.uiFont, cursor: 'pointer' }}>
                <option value="baladi">בלדי</option><option value="shami">שאמי</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: theme.primary, fontWeight: 600, fontSize: '1.1rem' }}>
                <input type="checkbox" checked={includeNeshama} onChange={(e) => setIncludeNeshama(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                להוסיף תהילים של "נשמה"
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: theme.primary, fontWeight: 600, fontSize: '1.1rem' }}>
                <input type="checkbox" checked={includeZohar} onChange={(e) => setIncludeZohar(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                להוסיף זוהר (אדרא זוטא)
              </label>
            </div>
            <button onClick={handleGenerate} style={{ padding: '16px', backgroundColor: theme.primary, color: 'white', fontSize: '1.2rem', fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '15px', boxShadow: '0 4px 6px rgba(26, 54, 93, 0.2)', transition: 'opacity 0.2s' }}>הכן חוברת לימוד</button>
          </div>
        </div>
        <p style={{ color: '#718096', fontSize: '1.05rem', margin: '5px 0' }}>תודה ל<a href="https://nosachteiman.co.il/" target="_blank" rel="noopener noreferrer" style={{ color: theme.primary, fontWeight: 'bold', textDecoration: 'underline' }}>נוסח תימן</a> על הטקסט</p>
        <div style={{ backgroundColor: theme.card, padding: '25px', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.04)', width: '100%', maxWidth: '450px', textAlign: 'center', borderTop: `4px solid ${theme.accent}` }}>
          <h2 style={{ color: theme.primary, marginBottom: '10px', fontSize: '1.4rem', fontWeight: 700 }}>מחשבון תאריך עברי</h2>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', textAlign: 'right' }}>
            <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '0.9rem', color: theme.primary, marginBottom: '5px' }}>שנה</label><input type="number" placeholder="2026" value={calcYear} onChange={(e) => setCalcYear(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} /></div>
            <div style={{ flex: 1.5 }}><label style={{ display: 'block', fontSize: '0.9rem', color: theme.primary, marginBottom: '5px' }}>חודש</label><select value={calcMonth} onChange={(e) => setCalcMonth(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box', cursor: 'pointer' }}><option value="">בחר...</option><option value="1">ינואר</option><option value="2">פברואר</option><option value="3">מרץ</option><option value="4">אפריל</option><option value="5">מאי</option><option value="6">יוני</option><option value="7">יולי</option><option value="8">אוגוסט</option><option value="9">ספטמבר</option><option value="10">אוקטובר</option><option value="11">נובמבר</option><option value="12">דצמבר</option></select></div>
            <div style={{ flex: 1 }}><label style={{ display: 'block', fontSize: '0.9rem', color: theme.primary, marginBottom: '5px' }}>יום</label><input type="number" placeholder="16" min="1" max="31" value={calcDay} onChange={(e) => setCalcDay(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }} /></div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', color: theme.text, fontSize: '1.1rem', marginBottom: '20px' }}><input type="checkbox" checked={afterSunset} onChange={(e) => setAfterSunset(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />התאריך חל <strong>לאחר השקיעה</strong></label>
          {hebDateLetters && <div style={{ padding: '15px', backgroundColor: '#f0f4f8', border: `1px solid ${theme.primary}`, borderRadius: '8px', color: theme.primary }}><div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '5px' }}>{hebDateLetters}</div><div style={{ fontSize: '1.1rem', color: '#4a5568', opacity: 0.8 }}>({hebDateNumbers})</div></div>}
        </div>
        <footer style={{ maxWidth: '600px', textAlign: 'center', marginTop: '20px', color: '#718096', fontSize: '0.9rem', lineHeight: '1.6' }}><strong>אודות המערכת:</strong><br />אפליקציית "אזכרה" מאפשרת יצירת חוברת אזכרה אישית להדפסה ולשיתוף בחינם. המערכת מפיקה אוטומטית סדר לימוד משניות לעילוי נשמת הנפטר (לפי אותיות השם), פרקי תהילים, אותיות נשמה, אדרא זוטא ותפילות השכבה וקדיש. בנוסף, האתר כולל מחשבון תאריך עברי לאזכרה לאיתור מדויק של יום הפטירה.</footer>
      </div>
    );
  }

  const mishnayotData = appData.mishnayot as Record<string, string[]>;
  const tehillimData = appData.tehillim as Record<string, string[]>;

  return (
    <div style={{ display: 'flex', direction: 'rtl', fontFamily: theme.bookFont, minHeight: '100vh', backgroundColor: theme.bg, flexDirection: isMobile ? 'column' : 'row' }}>
      <style>{`
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

      {/* Navigation */}
      <nav className="no-print" style={{ width: '280px', padding: '30px 20px', backgroundColor: theme.card, borderLeft: '1px solid #e2e8f0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', fontFamily: theme.uiFont }}>
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
          <li><a href="#mincha" style={{ textDecoration: 'none', color: '#4a5568' }}>מנחה</a></li>
          <li><a href="#arvit" style={{ textDecoration: 'none', color: '#4a5568' }}>ערבית</a></li>
        </ul>
      </nav>

      <main style={{ flex: 1, padding: isMobile ? '20px' : '40px', fontSize: `${fontSize}px`, maxWidth: '900px', margin: '0 auto', lineHeight: '1.9' }}>

        {/* Print TOC */}
        <div className="print-only print-toc-page" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
          <h1 style={{ color: theme.primary, fontSize: '40pt', marginBottom: '10px' }}>חוברת לימוד</h1>
          <p style={{ fontSize: '24pt', marginBottom: '40px' }}>לעילוי נשמת {name}</p>
          <h2 style={{ color: theme.primary, fontSize: '28pt', borderBottom: `3px solid ${theme.accent}`, paddingBottom: '15px', marginBottom: '30px' }}>תוכן עניינים</h2>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '20pt', lineHeight: '2.2' }}>
            <li>תפילה קודם הלימוד</li><li>לימוד משניות</li><li>תהילים</li>
            {includeZohar && <li>זוהר</li>}
            <li>תפילה בסיום הלימוד</li><li>השכבה</li><li>קדיש</li>
            <li>מנחה</li><li>ערבית</li>
          </ul>
        </div>

        {/* Content Sections */}
        <SectionCard id="tefillah" title="תפילה קודם הלימוד"><p>{appData.tefillah[gender].replace(/\{\s*name\s*\}/g, name)}</p></SectionCard>

        <SectionCard id="mishnayot" title="לימוד משניות">
          {letters.map((char: string, index: number) => (
            <div key={index} style={{ marginBottom: '35px' }}>
              <h3 className="print-heading" style={{ color: theme.accent, textAlign: 'center', fontSize: '1.8rem' }}>~ אות {char} ~</h3>
              {mishnayotData[char]?.map((text, i) => <p key={i}>{text}</p>)}
            </div>
          ))}
          <div>{renderFormattedText(appData.mishnahOutro)}</div>
        </SectionCard>

        <SectionCard id="tehillim" title="תהילים">
          {letters.map((char: string, index: number) => (
            <div key={index}><h3 className="print-heading" style={{ color: theme.accent, textAlign: 'center' }}>~ אות {char} ~</h3>{tehillimData[char]?.map((text, i) => <p key={i} style={{ textAlign: 'center' }}>{text}</p>)}</div>
          ))}
          {includeNeshama && <div style={{ marginTop: '50px', borderTop: '2px dashed #e2e8f0' }}><h3 className="print-heading" style={{ color: theme.accent, textAlign: 'center' }}>~ אותיות "נשמה" ~</h3>{['נ', 'ש', 'מ', 'ה'].map((char, index) => (<div key={index}><h4 style={{ color: theme.primary, textAlign: 'center' }}>~ אות {char} ~</h4>{tehillimData[char]?.map((text, i) => <p key={i} style={{ textAlign: 'center' }}>{text}</p>)}</div>))}</div>}
        </SectionCard>

        {includeZohar && (
          <SectionCard id="zohar" title="זוהר (אדרא זוטא)">
            {appData.zohar.map((p: any, i: number) => (<div key={i} style={{ marginBottom: '30px' }}><p style={{ fontWeight: '700' }}>{p.aramaic}</p><p>{p.hebrew}</p></div>))}
          </SectionCard>
        )}

        <SectionCard id="sium_tefillah" title="תפילה בסיום הלימוד">{appData.siumTefillah[gender].replace(/\{\s*name\s*\}/g, name).split('\n').map((p, i) => <p key={i}>{p}</p>)}</SectionCard>

        <SectionCard id="hashkava" title="השכבה">
          {appData.hashkava[gender].replace(/\{\s*name\s*\}/g, name).split('\n').map((p, i) => {
            const parts = p.split(/(\([^)]+\))/g);
            return <p key={i}>{parts.map((part, j) => part.startsWith('(') ? <span key={j} style={{ opacity: 0.65 }}>{part}</span> : <span key={j}>{part}</span>)}</p>
          })}
        </SectionCard>

        <SectionCard id="kaddish" title="קדיש">
          <div style={{ textAlign: 'center' }}>
            <h4 className="no-print" style={{ color: theme.primary, opacity: 0.8 }}>נוסח {nusach === 'baladi' ? 'בלדי' : 'שאמי'}</h4>
            <p style={{ whiteSpace: 'pre-line' }}>{(appData.kaddish as any)[nusach]}</p>
          </div>
        </SectionCard>

        {/* New Prayer Sections */}
        <SectionCard id="mincha" title="תפילת מנחה">
          <p style={{ whiteSpace: 'pre-line' }}>{(appData.mincha as any)[nusach]}</p>
        </SectionCard>

        <SectionCard id="arvit" title="תפילת ערבית">
          <p style={{ whiteSpace: 'pre-line' }}>{(appData.arvit as any)[nusach]}</p>
        </SectionCard>

        <div className="print-only print-back-cover" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
          <h2>הוכן ע"י www.azkarapp.com</h2>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://azkarapp.com" style={{ width: '200px' }} />
        </div>
      </main>
    </div>
  );
}