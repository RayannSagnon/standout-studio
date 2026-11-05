import { useState } from 'react';
import Magnet from '../rb/Magnet';
import Footer from './Footer';
import StepTitle from './StepTitle';
import { useLang } from '../i18n';

const EMAIL = 'standout.studio.ottawa@gmail.com';
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

// An invitation, not a form in a card: you write one sentence, and the dot sends it.
export default function Contact() {
  const { c, lang } = useLang();
  const k = c.contact;
  const [form, setForm] = useState({ name: '', need: 0, email: '', message: '', botcheck: '' });
  // idle | sending | sent | mail (mail app opened) | error
  const [status, setStatus] = useState('idle');
  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (status === 'sending') return;
    const need = k.needOptions[form.need];
    const subject = `${k.subject} : ${need}`;
    const body = [`${k.hello} ${form.name}, ${k.needIntro} ${need}.`, `${k.body.email} : ${form.email}`, '', form.message].join('\n');

    // Without a Web3Forms key (local preview), fall back to the visitor's mail app
    if (!ACCESS_KEY) {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setStatus('mail');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: `Standout Studio: ${form.name} (${need})`,
          from_name: 'Standout Studio website',
          name: form.name,
          email: form.email,
          replyto: form.email,
          need,
          locale: lang,
          message: body,
          botcheck: form.botcheck
        })
      });
      const result = await res.json().catch(() => null);
      setStatus(res.ok && result?.success ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const done = status === 'sent' || status === 'mail';

  return (
    <>
      <section className="invite" data-tone="light">
        <StepTitle lines={k.title} className="invite-title" trail={40} />

        {done ? (
          <div className="sent" role="status">
            <p className="h2">{status === 'sent' ? k.sentTitle : k.mailTitle}</p>
            <p className="lead">{status === 'sent' ? k.sentText : k.mailText}</p>
          </div>
        ) : (
          <form className="sentence" onSubmit={submit} aria-busy={status === 'sending'}>
            <input type="checkbox" name="botcheck" className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" checked={Boolean(form.botcheck)} onChange={e => setForm(f => ({ ...f, botcheck: e.target.checked ? 'true' : '' }))} />
            <p className="sentence-text">
              {k.hello}{' '}
              <label className="blank">
                <span className="sr-only">{k.name}</span>
                <input required value={form.name} onChange={set('name')} placeholder={k.phName} autoComplete="name" size={Math.max(8, form.name.length + 1)} />
              </label>{' '}
              {k.needIntro}{' '}
              {/* A field and the full stop after it stay on the same line */}
              <span className="blank-group">
                <label className="blank blank-select">
                  <span className="sr-only">{k.legend}</span>
                  <select value={form.need} onChange={e => setForm(f => ({ ...f, need: Number(e.target.value) }))}>
                    {k.needOptions.map((o, i) => (
                      <option key={o} value={i}>
                        {o}
                      </option>
                    ))}
                  </select>
                </label>
                .
              </span>{' '}
              {k.reach}{' '}
              <span className="blank-group">
                <label className="blank">
                  <span className="sr-only">{k.email}</span>
                  <input required type="email" value={form.email} onChange={set('email')} placeholder={k.phEmail} autoComplete="email" size={Math.max(12, form.email.length + 1)} />
                </label>
                .
              </span>
            </p>
            <label className="sentence-more">
              <span>{k.more}</span>
              <textarea rows={2} value={form.message} onChange={set('message')} placeholder={k.phMore} />
            </label>
            <div className="sentence-send">
              <Magnet padding={90} magnetStrength={4}>
                <button className="btn-orb invite-orb" type="submit" disabled={status === 'sending'}>
                  <span className="orb-label">{status === 'sending' ? k.sending : k.send}</span>
                </button>
              </Magnet>
              {status === 'error' && (
                <p className="invite-error" role="alert">
                  {k.error}{' '}
                  <a className="link" href={`mailto:${EMAIL}`}>
                    {EMAIL}
                  </a>
                </p>
              )}
              <p className="muted invite-mail">
                <a className="link" href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
                <br />
                {k.where}
              </p>
            </div>
          </form>
        )}
      </section>
      <Footer />
    </>
  );
}
