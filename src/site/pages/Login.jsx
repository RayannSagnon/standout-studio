import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { DEMO_CREDENTIALS, requestPasswordReset } from '../auth/mockAuth';
import { fmt, useLang } from '../i18n';
import { href } from '../router';
import Footer from './Footer';

export default function Login() {
  const { login } = useAuth();
  const { c } = useLang();
  const k = c.login;
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorCode, setErrorCode] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setErrorCode('');
    setBusy(true);
    try {
      if (mode === 'login') {
        await login(email, password); // App sends signed-in users from #connexion to #compte
      } else {
        await requestPasswordReset(email);
        setResetSent(true);
      }
    } catch (err) {
      setErrorCode(err.code || 'generic');
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = () => {
    setMode('login');
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setErrorCode('');
  };

  const switchMode = () => {
    setMode(m => (m === 'login' ? 'reset' : 'login'));
    setErrorCode('');
    setResetSent(false);
  };

  return (
    <>
      <section className="login" data-tone="light">
        <div className="login-copy">
          <h1 className="display display-m" data-reveal="wipe">
            {k.title}
          </h1>
          <p className="lead">{k.lead}</p>
          <p className="muted login-alt">
            {k.notClient}{' '}
            <a className="link" href={href('contact')}>
              {k.start}
            </a>
          </p>
        </div>

        <div className="login-panel" data-reveal="frame">
          {mode === 'reset' && resetSent ? (
            <div className="login-done" role="status">
              <h2 className="h3">{k.checkTitle}</h2>
              <p className="muted">{fmt(k.checkText, { email: email || k.thisAddress })}</p>
              <button type="button" className="text-btn" onClick={switchMode}>
                {k.back}
              </button>
            </div>
          ) : (
            <form className="login-form" onSubmit={submit}>
              <h2 className="h3">{mode === 'login' ? k.signIn : k.resetTitle}</h2>
              {mode === 'reset' && <p className="muted">{k.resetHelp}</p>}
              <label className="field">
                <span>{k.email}</span>
                <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
              </label>
              {mode === 'login' && (
                <label className="field">
                  <span className="field-row">
                    {k.password}
                    <button type="button" className="text-btn" onClick={() => setShow(s => !s)} aria-pressed={show}>
                      {show ? k.hide : k.show}
                    </button>
                  </span>
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </label>
              )}
              <p className="form-error" role="alert">
                {errorCode ? k.errors[errorCode] || k.errors.generic : ''}
              </p>
              <div className="login-actions">
                <button className="btn btn-primary" type="submit" disabled={busy}>
                  {busy ? (mode === 'login' ? k.submitting : k.sending) : mode === 'login' ? k.submit : k.sendLink}
                </button>
                <button type="button" className="text-btn" onClick={switchMode}>
                  {mode === 'login' ? k.forgot : k.back}
                </button>
              </div>
            </form>
          )}

          <div className="demo-box">
            <p>
              <strong>{k.demoTitle}</strong> {k.demoEmail} <code>{DEMO_CREDENTIALS.email}</code>, {k.demoPassword}{' '}
              <code>{DEMO_CREDENTIALS.password}</code>.
            </p>
            <button type="button" className="text-btn" onClick={fillDemo}>
              {k.demoFill}
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
