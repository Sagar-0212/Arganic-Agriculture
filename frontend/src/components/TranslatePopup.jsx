import { useEffect } from 'react';

const TranslatePopup = () => {
  useEffect(() => {
    // Inject Google Translate Script
    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            { 
              pageLanguage: 'en', 
              includedLanguages: 'mr,en', 
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false
            },
            'google_translate_element'
          );
        }
      };
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Hidden container for Google Translate widget
  return <div id="google_translate_element" style={{ display: 'none' }}></div>;
};

export default TranslatePopup;
