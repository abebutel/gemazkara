import { useState, useEffect } from 'react';
import { appData } from './data';
import './App.css';

export default function App() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isGenerated, setIsGenerated] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // משתנים עבור מחשבון התאריכים
  const [calcDay, setCalcDay] = useState('');
  const [calcMonth, setCalcMonth] = useState('');
  const [calcYear, setCalcYear] = useState('');
  const [afterSunset, setAfterSunset] = useState(false);
  const [hebDateLetters, setHebDateLetters] = useState('');
  const [hebDateNumbers, setHebDateNumbers] = useState('');

  // פונקציית עזר להמרת מספר לגימטריה (עבור יום ושנה)
  const toGematria = (num: number): string => {
    if (num <= 0) return '';
    
    // טיפול בערכים מיוחדים לשנה (תשפ"ה וכו')
    let n = num % 1000;
    const units = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
    const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
    const hundreds = ["", "ק", "ר", "ש", "ת", "תק", "תר", "תש", "תת", "תתק"];
    
    let res = hundreds[Math.floor(n / 100)] + tens[Math.floor((n % 100) / 10)] + units[n % 10];
    
    // תיקון ט"ו ו-ט"ז
    res = res.replace("יה", "טו").replace("יו", "טז");
    
    // הוספת גרשיים
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

  // מחשב תאריך עברי
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
          // חילוץ נתונים גולמיים מהלוח העברי
          const parts = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }).formatToParts(dateObj);
          
          const dayVal = parseInt(parts.find(p => p.type === 'day')?.value || '0');
          const monthName = parts.find(p => p.type === 'month')?.value || '';
          const yearVal = parseInt(parts.find(p => p.type === 'year')?.value || '0');

          // בניית מחרוזת אותיות (גימטריה)
          const lettersStr = `${toGematria(dayVal)} ב${monthName} ${toGematria(yearVal)}`;
          
          // בניית מחרוזת מספרים
          const numbersStr = `${dayVal} ב${monthName} ${yearVal}`;
          
          setHebDateLetters(lettersStr);
          setHebDateNumbers(numbersStr);
        } catch (e) {
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

  const SectionCard = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
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
              <input type="number" placeholder="2026" value={calcYear