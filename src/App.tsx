import React, { useState } from 'react';
import { appData } from './data';
import './App.css';

export default function App() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [isGenerated, setIsGenerated] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  // Convert final letters to standard letters
  const mapLetter = (char) => {
    const finalMap = { 'ם': 'מ', 'ן': 'נ', 'ץ': 'צ', 'ף': 'פ', 'ך': 'כ' };
    return finalMap[char] || char;
  };

  const letters = name.replace(/[^א-ת]/g, '').split('').map(mapLetter);

  if (!isGenerated) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', direction: 'rtl', fontFamily: 'system-ui' }}>
        <h1 style={{ textAlign: 'center' }}>הכנת חוברת לימוד</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="שם הנפטר/ת (לדוגמה: אדם בן רחל)" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ padding: '10px', fontSize: '16px' }}
          />
          <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ padding: '10px', fontSize: '16px' }}>
            <option value="male">זכר</option>
            <option value="female">נקבה</option>
          </select>
          <button onClick={() => name && setIsGenerated(true)} style={{ padding: '15px', backgroundColor: '#0056b3', color: 'white', fontSize: '18px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            הכן חוברת
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', direction: 'rtl', fontFamily: 'Georgia, serif', minHeight: '100vh', backgroundColor: '#faf8f5' }}>
      
      {/* Floating Table of Contents */}
      <nav style={{ width: '250px', padding: '20px', backgroundColor: '#fff', borderLeft: '1px solid #ddd', position: 'sticky', top: 0, height: '100vh' }}>
        <h3>תוכן עניינים</h3>
        <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
          <li><a href="#tefillah">תפילה קודם הלימוד</a></li>
          <li><a href="#mishnayot">לימוד משניות</a></li>
          <li><a href="#tehillim">תהילים</a></li>
          <li><a href="#zohar">זוהר (אדרא זוטא)</a></li>
          <li><a href="#hashkava">השכבה</a></li>
          <li><a href="#kaddish">קדיש</a></li>
        </ul>
        <div style={{ marginTop: '30px' }}>
          <h4>גודל טקסט (Zoom)</h4>
          <button onClick={() => setFontSize(f => f + 2)} style={{ padding: '5px 15px', margin: '5px' }}>A+</button>
          <button onClick={() => setFontSize(f => Math.max(12, f - 2))} style={{ padding: '5px 15px', margin: '5px' }}>A-</button>
        </div>
      </nav>

      {/* Main Booklet Content */}
      <main style={{ flex: 1, padding: '40px', fontSize: `${fontSize}px`, maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
        
        <section id="tefillah">
          <h2>תפילה קודם הלימוד</h2>
          <p>{appData.tefillah[gender].replace('{name}', name)}</p>
        </section>
        <hr style={{ margin: '40px 0' }}/>

        <section id="mishnayot">
          <h2>לימוד משניות</h2>
          <p>{appData.mishnahIntro}</p>
          {letters.map((char, index) => (
             <div key={index}>
               <h3>אות {char}</h3>
               {appData.mishnayot[char] ? appData.mishnayot[char].map((text, i) => <p key={i}>{text}</p>) : <p>הטקסט יתווסף בהמשך</p>}
             </div>
          ))}
          <p>{appData.mishnahOutro}</p>
        </section>
        <hr style={{ margin: '40px 0' }}/>

        <section id="tehillim">
          <h2>תהילים</h2>
          <p>{appData.tehillimIntro}</p>
          {letters.map((char, index) => (
             <div key={index}>
               <h3>אות {char}</h3>
               {appData.tehillim[char] ? appData.tehillim[char].map((text, i) => <p key={i}>{text}</p>) : <p>הטקסט יתווסף בהמשך</p>}
             </div>
          ))}
        </section>
        <hr style={{ margin: '40px 0' }}/>

        <section id="zohar">
          <h2>זוהר (אדרא זוטא)</h2>
          {appData.zohar.map((paragraph, index) => (
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
          <h2>קדיש יתום</h2>
          <p>{appData.kaddish}</p>
        </section>

      </main>
    </div>
  );
}