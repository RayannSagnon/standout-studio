import { useLang } from '../i18n';
import { href } from '../router';

export default function Footer() {
  const { c } = useLang();
  return (
    <footer className="footer" data-tone="dark">
      <div className="footer-top">
        <div>
          <p className="footer-mark">Standout Studio</p>
          <p className="footer-where">{c.where}</p>
        </div>
        <nav className="footer-links" aria-label={c.footerAria}>
          <a href={href('work')}>{c.nav.work}</a>
          <a href={href('services')}>{c.nav.services}</a>
          <a href={href('about')}>{c.nav.about}</a>
          <a href={href('contact')}>{c.nav.contact}</a>
          <a href={href('card')}>{c.nav.card}</a>
          <a href={href('login')}>{c.nav.account}</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Standout Studio</span>
        <a href="mailto:standout.studio.ottawa@gmail.com">standout.studio.ottawa@gmail.com</a>
      </div>
    </footer>
  );
}
