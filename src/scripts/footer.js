import footerHtml from '../components/footer.html?raw';

export function loadFooter() {
  document.getElementById('footer-placeholder').innerHTML = footerHtml;
} 