import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getDashboard, sendRequest } from '../auth/mockAuth';
import { drawCard, drawSiteMock } from '../projects';
import { fmt, pick, useLang } from '../i18n';
import { observeReveals } from '../motion';
import { href } from '../router';
import Footer from './Footer';

export default function Account({ navigate }) {
  const { user, logout } = useAuth();
  const { c, lang, locale } = useLang();
  const k = c.account;
  const [data, setData] = useState(null);
  const [request, setRequest] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const fmtDate = iso => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '');
  const fmtShort = iso => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : '');
  const money = n => n.toLocaleString(locale, { style: 'currency', currency: 'CAD' });

  useEffect(() => {
    let alive = true;
    getDashboard().then(d => {
      if (!alive) return;
      setData(d);
      requestAnimationFrame(() => observeReveals(document.querySelector('.account')));
    });
    return () => {
      alive = false;
    };
  }, []);

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const preview = useMemo(
    () => (user ? drawSiteMock({ name: fullName, mock: { bg: '#F5F3EF', ink: '#1E2A33', accent: '#3E6B5A', soft: '#E3E2DC', layout: 'split' } }) : null),
    [user, fullName]
  );
  const card = useMemo(
    () => (user ? drawCard(fullName, pick(user.role, lang), { name: c.card.name, role: c.card.role, scan: c.card.scan }) : null),
    [user, fullName, lang, c]
  );

  if (!user) return null;

  const submitRequest = async e => {
    e.preventDefault();
    if (!request.trim()) return;
    setSending(true);
    const item = await sendRequest(request.trim());
    setData(d => ({ ...d, activity: [item, ...d.activity] }));
    setRequest('');
    setSending(false);
    setSent(true);
  };

  const signOut = async () => {
    await logout();
    navigate({ name: 'home' });
  };

  return (
    <>
      <section className="account" data-tone="light">
        <div className="account-head">
          <div>
            <h1 className="display display-m" data-reveal="wipe">
              {fmt(k.hello, { name: user.firstName })}
            </h1>
            <p className="muted">{fmt(k.since, { pkg: pick(user.package, lang), date: fmtDate(user.clientSince) })}</p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={signOut}>
            {k.signOut}
          </button>
        </div>

        {!data ? (
          <p className="muted account-loading" role="status">
            {k.loading}
          </p>
        ) : (
          <div className="account-grid">
            <article className="panel panel-main" data-reveal="frame">
              <div className="panel-top">
                <div>
                  <h2 className="h3">{pick(data.project.name, lang)}</h2>
                  <p className="muted">{fmt(k.revision, { used: data.project.revision.used, total: data.project.revision.total })}</p>
                </div>
              </div>

              <ol className="tracker" aria-label={k.progress} data-reveal="track">
                {data.project.steps.map(s => (
                  <li key={s.key} className={s.done ? 'is-done' : s.current ? 'is-current' : undefined} aria-current={s.current ? 'step' : undefined}>
                    <span className="tracker-dot" aria-hidden="true" />
                    <span className="tracker-label">{pick(s.label, lang)}</span>
                    <span className="tracker-date">{s.done ? fmtShort(s.date) : s.current ? k.inProgress : k.upcoming}</span>
                  </li>
                ))}
              </ol>

              <div className="next-action">
                <p className="next-label">{k.next}</p>
                <p>{pick(data.project.nextAction, lang)}</p>
              </div>

              <div className="mini-browser">
                <div className="mini-bar">{k.working}</div>
                <div className="mini-view">
                  <img src={preview} alt={fmt(k.previewAlt, { name: pick(data.project.name, lang) })} />
                </div>
              </div>

              <form className="request" onSubmit={submitRequest}>
                <label className="field">
                  <span>{k.requestLabel}</span>
                  <textarea
                    rows={3}
                    value={request}
                    onChange={e => {
                      setRequest(e.target.value);
                      setSent(false);
                    }}
                    placeholder={k.requestPh}
                  />
                </label>
                <div className="request-actions">
                  <button className="btn btn-primary" type="submit" disabled={sending || !request.trim()}>
                    {sending ? k.sending : k.send}
                  </button>
                  <p className="muted" role="status">
                    {sent ? k.sent : ''}
                  </p>
                </div>
              </form>
            </article>

            <aside className="account-side">
              <article className="panel panel-soft" data-reveal="frame" style={{ '--i': 1 }}>
                <h2 className="h3">{k.careTitle}</h2>
                <p className="price">
                  {money(data.care.price)} <span>{k.perMonth}</span>
                </p>
                <p className="muted">
                  {pick(data.care.note, lang)} {k.careIncl}
                </p>
                <p className="status status-pending">{k.careStatus}</p>
              </article>

              <article className="panel panel-soft panel-card" data-reveal="frame" style={{ '--i': 2 }}>
                <img src={card} alt={fmt(k.cardAlt, { name: fullName })} />
                <div>
                  <h2 className="h3">{k.cardTitle}</h2>
                  <p className="muted">{pick(data.card.note, lang)}</p>
                  <a className="link" href={href('card')}>
                    {k.cardEdit}
                  </a>
                </div>
              </article>
            </aside>

            <section className="account-block">
              <h2 className="h3">{k.activity}</h2>
              <ul className="activity">
                {data.activity.map(a => (
                  <li key={a.id}>
                    <span className="activity-date">{fmtShort(a.date)}</span>
                    <span className="activity-who">{a.by === 'client' ? k.you : k.studio}</span>
                    <span className="activity-text">{pick(a.text, lang)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="account-block">
              <h2 className="h3">{k.invoices}</h2>
              <ul className="invoices">
                {data.invoices.map(inv => (
                  <li key={inv.id}>
                    <span className="inv-label">
                      {pick(inv.label, lang)}
                      <span className="muted">{inv.id}</span>
                    </span>
                    <span className="inv-amount">{money(inv.amount)}</span>
                    <span className={`status ${inv.status === 'paid' ? 'status-ok' : 'status-pending'}`}>
                      {inv.status === 'paid' ? fmt(k.paidOn, { date: fmtShort(inv.date) }) : k.dueAtLaunch}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
        <p className="muted account-note">{k.note}</p>
      </section>
      <Footer />
    </>
  );
}
