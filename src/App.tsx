import { useState, useEffect } from 'react';
import { appData } from './data';
import './App.css';

export default function App() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [isGenerated, setIsGenerated] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); 
    window.addEventListener('resize', checkMobile); 
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mapLetter = (char: string) => {
    const finalMap: Record<string, string> = { 'ם': 'מ', 'ן': 'נ', 'ץ': 'צ', 'ף': 'פ', 'ך': 'כ' };
    return finalMap[char] || char;
  };

  const letters = name.replace(/[^א-ת]/g, '').split('').map(mapLetter);

  if (!isGenerated) {
    return (
      <div style={{ maxWidth: '500px', margin: '50px auto', direction: 'rtl', fontFamily: 'system-ui', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', lineHeight: '1.4', fontSize: '2.2rem', marginBottom: '25px' }}>הכנת חוברת לימוד</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="שם הנפטר/ת (לדוגמה: אדם בן רחל)" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} style={{ padding: '12px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}>
            <option value="male">זכר</option>
            <option value="female">נקבה</option>
          </select>
          <button onClick={() => name && setIsGenerated(true)} style={{ padding: '15px', backgroundColor: '#0056b3', color: 'white', fontSize: '18px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' }}>
            הכן חוברת
          </button>
        </div>
      </div>
    );
  }

  const mishnayotData = appData.mishnayot as Record<string, string[]>;
  const tehillimData = appData.tehillim as Record<string, string[]>;

  // הפונקציה המעודכנת שמחפשת את הכותרות בדיוק עם המרכאות
  const renderFormattedText = (text: string) => {
    const headers = ['פרק "יש מעלין"', 'אותיות "נשמה"', "תפילה בסיום לימוד המשניות"];
    return text.split('\n').map((line, i) => {
      const isHeader = headers.some(h => line.includes(h));
      return (
        <p key={i} style={{ 
          fontWeight: isHeader ? 'bold' : 'normal', 
          fontSize: isHeader ? `${fontSize + 2}px` : `${fontSize}px`,
          marginTop: isHeader ? '20px' : '0'
        }}>
          {line}
        </p>
      );
    });
  };

  return (
    <div style={{ display: 'flex', direction: 'rtl', fontFamily: 'Georgia, serif', minHeight: '100vh', backgroundColor: '#faf8f5', flexDirection: isMobile ? 'column' : 'row' }}>
      
      {isMobile ? (
        <header style={{ position: 'sticky', top: 0, backgroundColor: '#fff', borderBottom: '1px solid #ddd', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', padding: '0 10px' }}>
            ☰
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setFontSize(f => f + 2)} style={{ padding: '5px 12px', borderRadius: '5px', border: '1px solid #ccc', background: '#f9f9f9', fontSize: '16px' }}>A+</button>
            <button onClick={() => setFontSize(f => Math.max(12, f - 2))} style={{ padding: '5px 12px', borderRadius: '5px', border: '1px solid #ccc', background: '#f9f9f9', fontSize: '16px' }}>A-</button>
          </div>
        </header>
      ) : (
        <nav style={{ width: '250px', padding: '20px', backgroundColor: '#fff', borderLeft: '1px solid #ddd', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <h3>תוכן עניינים</h3>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
            <li><a href="#tefillah" style={{textDecoration: 'none', color: '#0056b3'}}>תפילה קודם הלימוד</a></li>
            <li><a href="#mishnayot" style={{textDecoration: 'none', color: '#0056b3'}}>לימוד משניות</a></li>
            <li><a href="#tehillim" style={{textDecoration: 'none', color: '#0056b3'}}>תהילים</a></li>
            <li><a href="#zohar" style={{textDecoration: 'none', color: '#0056b3'}}>זוהר (אדרא זוטא)</a></li>
            <li><a href="#hashkava" style={{textDecoration: 'none', color: '#0056b3'}}>השכבה</a></li>
            <li><a href="#kaddish" style={{textDecoration: 'none', color: '#0056b3'}}>קדיש</a></li>
          </ul>
          <div style={{ marginTop: '30px' }}>
            <h4>גודל טקסט (Zoom)</h4>
            <button onClick={() => setFontSize(f => f + 2)} style={{ padding: '5px 15px', margin: '5px' }}>A+</button>
            <button onClick={() => setFontSize(f => Math.max(12, f - 2))} style={{ padding: '5px 15px', margin: '5px' }}>A-</button>
          </div>
        </nav>
      )}

      {isMobile && isMenuOpen && (
        <nav style={{ position: 'fixed', top: '60px', left: 0, right: 0, backgroundColor: '#fff', padding: '20px', borderBottom: '2px solid #0056b3', zIndex: 999, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.5', margin: 0, fontSize: '18px' }}>
            <li><a href="#tefillah" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: '#333' }}>תפילה קודם הלימוד</a></li>
            <li><a href="#mishnayot" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: '#333' }}>לימוד משניות</a></li>
            <li><a href="#tehillim" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: '#333' }}>תהילים</a></li>
            <li><a href="#zohar" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: '#333' }}>זוהר (אדרא זוטא)</a></li>
            <li><a href="#hashkava" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: '#333' }}>השכבה</a></li>
            <li><a href="#kaddish" onClick={() => setIsMenuOpen(false)} style={{ display: 'block', textDecoration: 'none', color: '#333' }}>קדיש יתום</a></li>
          </ul>
        </nav>
      )}

      <main style={{ flex: 1, padding: isMobile ? '15px' : '40px', fontSize: `${fontSize}px`, maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
        
        <section id="tefillah">
          <h2>תפילה קודם הלימוד</h2>
          <p>{appData.tefillah[gender].replace('{name}', name)}</p>
        </section>
        <hr style={{ margin: '40px 0' }}/>

        <section id="mishnayot">
          <h2>לימוד משניות</h2>
          <p>{appData.mishnahIntro}</p>
          {letters.map((char: string, index: number) => (
             <div key={index}>
               <h3>אות {char}</h3>
               {mishnayotData[char] ? mishnayotData[char].map((text: string, i: number) => <p key={i}>{text}</p>) : <p>הטקסט יתווסף בהמשך</p>}
             </div>
          ))}
          <div>{renderFormattedText(appData.mishnahOutro)}</div>
        </section>
        <hr style={{ margin: '40px 0' }}/>

        <section id="tehillim">
          <h2>תהילים</h2>
          <p>{appData.tehillimIntro}</p>
          {letters.map((char: string, index: number) => (
             <div key={index}>
               <h3>אות {char}</h3>
               {tehillimData[char] ? tehillimData[char].map((text: string, i: number) => <p key={i}>{text}</p>) : <p>הטקסט יתווסף בהמשך</p>}
             </div>
          ))}
        </section>
        <hr style={{ margin: '40px 0' }}/>

        <section id="zohar">
          <h2>זוהר (אדרא זוטא)</h2>
          {appData.zohar.map((paragraph: {aramaic: string, hebrew: string}, index: number) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <p><strong>{paragraph.aramaic}</strong></p>
              <p>{paragraph.hebrew}</p>
            </div>
          ))}
        </section>
        <hr style={{ margin: '40px 0' }}/>

        <section id="hashkava">
          <h2>השכבה</h2>
          <p>{appData.hashkava[gender].replace('{name}', name)}</p>
        </section>
        <hr style={{ margin: '40px 0' }}/>

        <section id="kaddish">
          <h2>קדיש יתום / על ישראל</h2>
          <p style={{ whiteSpace: 'pre-line' }}>{appData.kaddish}</p>
        </section>