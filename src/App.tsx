import { useState, useEffect, ReactNode } from 'react';
import { appData } from './data';
import './App.css';

export default function App() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
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

  // Helper function for Gematria
  const toGematria = (num: number): string => {
    if (num <= 0) return '';
    let n = num % 1000;
    const units = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
    const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
    const hundreds = ["", "ק", "ר", "ש", "ת", "תק", "תר", "תש", "תת", "תתק"];
    
    let res = hundreds[Math.floor(n / 100)] + tens[Math.floor((n % 100) / 10)] + units[n % 10];
    res = res.replace("יה", "טו").replace("יו", "טז");
    
    if (res.length > 1) {
      return res.slice(0, -1) + '"' + res.slice(-1);
    }
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
        if (afterSunset) {
          dateObj.setDate(dateObj.getDate() + 1);
        }
        
        try {
          const parts = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).formatToParts(dateObj);
          
          const dayVal = parseInt(parts.find(p => p.type === 'day')?.value || '0');
          const monthName = parts.find(p => p.type === 'month')?.value || '';
          const yearVal = parseInt(parts.find(p => p.type === 'year')?.value || '0');

          const lettersStr = `${toGematria(dayVal)} ב${monthName} ${toGematria(yearVal)}`;
          const numbersStr = `${dayVal} ב${monthName} ${yearVal}`;
          
          setHebDateLetters(lettersStr);
          setHebDateNumbers(numbersStr);
        } catch {
          // Removed the (e) here so Vercel doesn't flag an unused variable!
          setHebDateLetters('');
          setHebDateNumbers('');
        }
      } else {
         setHebDateLetters('');
         setHebDateNumbers('');
      }
    } else {
      setHebDateLetters('');
      setHebDateNumbers('');
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
    const headers = ['פרק "יש מעלין"', 'אותיות "נשמה"', "תפילה בסיום לימוד המשניות"];
    return text.split('\n').map((line: string, i: number) => {
      const cleanLine = line.replace(/["”“'']/g, "");
      const isHeader = headers.some((h: string) => cleanLine.includes(h));
      return (
        <p key={i} style={{ 
          fontWeight: isHeader ? '700' : '400', 
          fontSize: isHeader ? `${fontSize + 4}px` : `${fontSize}px`,
          marginTop: isHeader ? '35px' : '5px',
          color: isHeader ? theme.primary : theme.text,
          textAlign: isHeader ? 'center' : 'justify'
        }}>
          {line}
        </p>
      );
    });
  };

  const SectionCard = ({ id, title, children }: { id: string, title: string, children: ReactNode }) => (
    <section id={id} style={{ 
      backgroundColor: theme.card, 
      padding: isMobile ? '25px 20px' : '45px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 15px rgba(0,0,0,0.04)', 
      marginBottom: '35px' 
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        color: theme.primary, 
        fontFamily: theme.uiFont, 
        borderBottom: `2px solid ${theme.accent}`, 
        paddingBottom: '15px', 
        marginBottom: '25px',
        fontSize: isMobile ? '1.8rem' : '2.2rem'
      }}>
        {title}
      </h2>
      <div style={{ color: theme.text }}>
        {children}
      </div>
    </section>
  );

  if (!isGenerated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: theme.uiFont, padding: '20px', direction: 'rtl', gap: '30px' }}>
        
        <div style={{ backgroundColor: theme.card, padding: '40px 30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', width: '100%', maxWidth: '450px', textAlign: 'center', borderTop: `6px solid ${theme.primary}` }}>
          <h1 style={{ color: theme.primary, marginBottom: '15px', fontSize: '2.5rem', fontWeight: 800 }}>חוברת לימוד</h1>
          <p style={{ color: '#718096', marginBottom: '35px', fontSize: '1.2rem' }}>ליום האזכרה</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'right' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.primary, fontWeight: 600 }}>שם הנפטר/ת (לדוגמה: אדם בן רחל)</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#f8fafc', boxSizing: 'border-box', fontFamily: theme.uiFont }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.primary, fontWeight: 600 }}>מין</label>
              <select 
                value={gender} 
                onChange={(e) => setGender(e.target.value as 'male' | 'female')} 
                style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '8px', border: '1px solid #cbd5e0', backgroundColor: '#f8fafc', boxSizing: 'border-box', fontFamily: theme.uiFont, cursor: 'pointer' }}
              >
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
              </select>
            </div>

            <button 
              onClick={() => name && setIsGenerated(true)} 
              style={{ padding: '16px', backgroundColor: theme.primary, color: 'white', fontSize: '1.2rem', fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '15px', boxShadow: '0 4px 6px rgba(26, 54, 93, 0.2)', transition: 'opacity 0.2s' }}
            >
              הכן חוברת לימוד
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: theme.card, padding: '25px', borderRadius: '16px', boxShadow: '0 6px 20px rgba(0,0,0,0.04)', width: '100%', maxWidth: '450px', textAlign: 'center', borderTop: `4px solid ${theme.accent}` }}>
          <h2 style={{ color: theme.primary, marginBottom: '10px', fontSize: '1.4rem', fontWeight: 700 }}>מחשבון תאריך עברי</h2>
          <p style={{ color: '#718096', marginBottom: '20px', fontSize: '1rem' }}>לא בטוחים מתי חלה האזכרה? המירו כאן:</p>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', textAlign: 'right' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: theme.primary, marginBottom: '5px' }}>שנה</label>
              <input type="number" placeholder="2026" value={calcYear} onChange={(e) => setCalcYear(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}/>
            </div>
            <div style={{ flex: 1.5 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: theme.primary, marginBottom: '5px' }}>חודש</label>
              <select value={calcMonth} onChange={(e) => setCalcMonth(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box', cursor: 'pointer' }}>
                <option value="">בחר...</option>
                <option value="1">ינואר</option>
                <option value="2">פברואר</option>
                <option value="3">מרץ</option>
                <option value="4">אפריל</option>
                <option value="5">מאי</option>
                <option value="6">יוני</option>
                <option value="7">יולי</option>
                <option value="8">אוגוסט</option>
                <option value="9">ספטמבר</option>
                <option value="10">אוקטובר</option>
                <option value="11">נובמבר</option>
                <option value="12">דצמבר</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: theme.primary, marginBottom: '5px' }}>יום</label>
              <input type="number" placeholder="16" min="1" max="31" value={calcDay} onChange={(e) => setCalcDay(e.target.value)} style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box' }}/>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', color: theme.text, fontSize: '1.1rem', marginBottom: '20px' }}>
            <input type="checkbox" checked={afterSunset} onChange={(e) => setAfterSunset(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            התאריך חל <strong>לאחר השקיעה</strong>
          </label>

          {hebDateLetters && (
            <div style={{ padding: '15px', backgroundColor: '#f0f4f8', border: `1px solid ${theme.primary}`, borderRadius: '8px', color: theme.primary }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '5px' }}>{hebDateLetters}</div>
              <div style={{ fontSize: '1.1rem', color: '#4a5568', opacity: 0.8 }}>({hebDateNumbers})</div>
            </div>
          )}
        </div>

      </div>
    );
  }

  const mishnayotData = appData.mishnayot as Record<string, string[]>;
  const tehillimData = appData.tehillim as Record<string, string[]>;

  return (
    <div style={{ display: 'flex', direction: 'rtl', fontFamily: theme.bookFont, minHeight: '100vh', backgroundColor: theme.bg, flexDirection: isMobile ? 'column' : 'row' }}>
      
      {isMobile ? (
        <header style={{ position: 'sticky', top: 0, backgroundColor: theme.card, borderBottom: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', fontSize: '28px', color: theme.primary, cursor: 'pointer' }}>
            ☰
          </button>
          <div style={{ display: 'flex', gap: '8px', fontFamily: theme.uiFont }}>
            <button onClick={() => setFontSize(f => f + 2)} style={{ padding: '6px 14px', borderRadius: '6px', border: `1px solid ${theme.primary}`, color: theme.primary, background: 'transparent', fontSize: '16px', fontWeight: 600 }}>A+</button>
            <button onClick={() => setFontSize(f => Math.max(14, f - 2))} style={{ padding: '6px 14px', borderRadius: '6px', border: `1px solid ${theme.primary}`, color: theme.primary, background: 'transparent', fontSize: '16px', fontWeight: 600 }}>A-</button>
          </div>
        </header>
      ) : (
        <nav style={{ width: '280px', padding: '30px 20px', backgroundColor: theme.card, borderLeft: '1px solid #e2e8f0', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto', fontFamily: theme.uiFont, boxShadow: '-2px 0 15px rgba(0,0,0,0.03)' }}>
          <h3 style={{ color: theme.primary, fontSize: '1.4rem', borderBottom: `2px solid ${theme.accent}`, paddingBottom: '10px', marginBottom: '20px' }}>תוכן עניינים</h3>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5', fontSize: '1.1rem' }}>
            <li><a href="#tefillah" style={{textDecoration: 'none', color: '#4a5568', display: 'block'}}>תפילה קודם הלימוד</a></li>
            <li><a href="#mishnayot" style={{textDecoration: 'none', color: '#4a5568', display: 'block'}}>לימוד משניות</a></li>
            <li><a href="#tehillim" style={{textDecoration: 'none', color: '#4a5568', display: 'block'}}>תהילים</a></li>
            <li><a href="#zohar" style={{textDecoration: 'none', color: '#4a5568', display: 'block'}}>זוהר (אדרא זוטא)</a></li>
            <li><a href="#hashkava" style={{textDecoration: 'none', color: '#4a5568', display: 'block'}}>השכבה</a></li>
            <li><a href="#kaddish" style={{textDecoration: 'none', color: '#4a5568', display: 'block'}}>קדיש</a></li>
          </ul>
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <h4 style={{ color: theme.primary, marginBottom: '15px' }}>גודל טקסט</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setFontSize(f => f + 2)} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: `1px solid ${theme.primary}`, color: theme.primary, background: 'transparent', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>A+</button>
              <button onClick={() => setFontSize(f => Math.max(14, f - 2))} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: `1px solid ${theme.primary}`, color: theme.primary, background: 'transparent', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>A-</button>
            </div>
          </div>
        </nav>
      )}

      {isMobile && isMenuOpen && (
        <nav style={{ position: 'fixed', top: '65px', left: 0, right: 0, backgroundColor: theme.card, padding: '20px', borderBottom: `3px solid ${theme.primary}`, zIndex: 999, boxShadow: '0 10px 20px rgba(0,0,0,0.1)', fontFamily: theme.uiFont }}>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '3', margin: 0, fontSize: '1.2rem' }}>
            <li><a href="#tefillah" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text, borderBottom: '1px solid #f1f5f9' }}>תפילה קודם הלימוד</a></li>
            <li><a href="#mishnayot" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text, borderBottom: '1px solid #f1f5f9' }}>לימוד משניות</a></li>
            <li><a href="#tehillim" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text, borderBottom: '1px solid #f1f5f9' }}>תהילים</a></li>
            <li><a href="#zohar" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text, borderBottom: '1px solid #f1f5f9' }}>זוהר (אדרא זוטא)</a></li>
            <li><a href="#hashkava" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text, borderBottom: '1px solid #f1f5f9' }}>השכבה</a></li>
            <li><a href="#kaddish" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: theme.text }}>קדיש יתום</a></li>
          </ul>
        </nav>
      )}

      <main style={{ flex: 1, padding: isMobile ? '20px' : '40px', fontSize: `${fontSize}px`, maxWidth: '900px', margin: '0 auto', lineHeight: '1.9' }}>
        
        <SectionCard id="tefillah" title="תפילה קודם הלימוד">
          <p style={{ textAlign: 'justify' }}>{appData.tefillah[gender].replace('{name}', name)}</p>
        </SectionCard>

        <SectionCard id="mishnayot" title="לימוד משניות">
          <p style={{ textAlign: 'justify', marginBottom: '35px' }}>{appData.mishnahIntro}</p>
          {letters.map((char: string, index: number) => (
             <div key={index} style={{ marginBottom: '35px' }}>
               <h3 style={{ color: theme.accent, textAlign: 'center', fontSize: '1.8rem', marginBottom: '15px' }}>~ אות {char} ~</h3>
               {mishnayotData[char] ? mishnayotData[char].map((text: string, i: number) => <p key={i} style={{ marginBottom: '12px', textAlign: 'justify' }}>{text}</p>) : <p>הטקסט יתווסף בהמשך</p>}
             </div>
          ))}
          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            {renderFormattedText(appData.mishnahOutro)}
          </div>
        </SectionCard>

        <SectionCard id="tehillim" title="תהילים">
          <p style={{ textAlign: 'center', marginBottom: '35px', fontWeight: 700, color: theme.primary }}>{appData.tehillimIntro}</p>
          {letters.map((char: string, index: number) => (
             <div key={index} style={{ marginBottom: '30px' }}>
               <h3 style={{ color: theme.accent, textAlign: 'center', fontSize: '1.8rem', marginBottom: '15px' }}>~ אות {char} ~</h3>
               {tehillimData[char] ? tehillimData[char].map((text: string, i: number) => <p key={i} style={{ marginBottom: '12px', textAlign: 'center' }}>{text}</p>) : <p>הטקסט יתווסף בהמשך</p>}
             </div>
          ))}
        </SectionCard>

        <SectionCard id="zohar" title="זוהר (אדרא זוטא)">
          {appData.zohar.map((paragraph: {aramaic: string, hebrew: string}, index: number) => (
            <div key={index} style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: index !== appData.zohar.length - 1 ? '1px dashed #cbd5e0' : 'none' }}>
              <p style={{ fontWeight: '700', marginBottom: '12px', color: theme.primary, textAlign: 'justify' }}>{paragraph.aramaic}</p>
              <p style={{ color: '#4a5568', textAlign: 'justify' }}>{paragraph.hebrew}</p>
            </div>
          ))}
        </SectionCard>

        <SectionCard id="hashkava" title="השכבה">
          <p style={{ textAlign: 'justify' }}>{appData.hashkava[gender].replace('{name}', name)}</p>
        </SectionCard>

        <SectionCard id="kaddish" title="קדיש יתום / על ישראל">
          <p style={{ whiteSpace: 'pre-line', textAlign: 'center' }}>{appData.kaddish}</p>
        </SectionCard>

      </main>
    </div>
  );
}