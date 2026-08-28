(() => {
  if (document.querySelector('.gtranslate_wrapper')) return;

  try {
    const wrapper = document.createElement('div');
    wrapper.className = 'gtranslate_wrapper';
    document.body.appendChild(wrapper);

    /*window.gtranslateSettings = {
      default_language: 'en',
      native_language_names: true,
      detect_browser_language: true,
      languages: ['en', 'es', 'pt', 'fr', 'de', 'tr', 'nl'],
      wrapper_selector: '.gtranslate_wrapper',
      switcher_horizontal_position: 'right',
      alt_flags: {
        en: 'usa',
        pt: 'brazil'
      }
    };*/

    window.gtranslateSettings = {"default_language":"en","native_language_names":true,"detect_browser_language":true,"languages":["en","es","pt","fr","de","tr","nl"],"wrapper_selector":".gtranslate_wrapper","flag_size":24,"horizontal_position":"right","vertical_position":"bottom","alt_flags":{"en":"usa","pt":"brazil"}};

    const script = document.createElement('script');
    //script.src = 'https://cdn.gtranslate.net/widgets/latest/float.js';
    script.src = 'https://cdn.gtranslate.net/widgets/latest/popup.js';
    script.defer = true;
    document.head.appendChild(script);
  } catch (error) {
    // Translation is optional; the English site remains fully functional.
  }
})();

