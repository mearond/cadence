import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('cadence_lang', newLang);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>{t('app.name')}</h1>
      <p>{t('auth.signIn')}</p>
      <button onClick={toggleLanguage}>Switch Language</button>
    </div>
  );
}

export default App;