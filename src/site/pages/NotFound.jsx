import Footer from './Footer';
import StepTitle from './StepTitle';
import { useLang } from '../i18n';
import { href } from '../router';

export default function NotFound() {
  const { c } = useLang();
  const k = c.notFound;
  return (
    <>
      <section className="invite" data-tone="light">
        <StepTitle lines={k.title} className="invite-title" trail={40} />
        <p className="lead">{k.text}</p>
        <p className="hero-actions" style={{ marginTop: 32 }}>
          <a className="btn btn-primary" href={href('home')}>
            <span>{k.back}</span>
          </a>
          <a className="link" href={href('work')}>
            {c.home.seeWork}
          </a>
        </p>
      </section>
      <Footer />
    </>
  );
}
