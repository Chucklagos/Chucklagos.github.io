const measurementId = 'G-7HZQN96LNZ';

const gtagScript = document.createElement('script');
gtagScript.async = true;
gtagScript.src =
  'https://www.googletagmanager.com/gtag/js?id=${measurementId}';

document.head.appendChild(gtagScript);

window.dataLayer = window.dataLayer || [];

function gtag() {
  dataLayer.push(arguments);
}

window.gtag = gtag;

gtag('js', new Date());
gtag('config', measurementId);