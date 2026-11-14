import PageTitle from "../../../components/PageTitle";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { confirmEmail, resendConfirmation } from "../../../services/authApi";
import { getErrorMessage } from "../../../utils/apiError";
import { CheckCircle2, AlertCircle, Loader2, Mail } from "lucide-react";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const email = useMemo(
    () => searchParams.get("email") || location.state?.email || "",
    [searchParams, location.state],
  );
  const emailSent = location.state?.emailSent !== false;
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const hasToken = !!token;

  const [status, setStatus] = useState(hasToken ? "loading" : (email ? "pending" : "error"));
  const [message, setMessage] = useState(email ? "" : "This confirmation link is invalid or incomplete.");
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [resendLink, setResendLink] = useState("");

  useEffect(() => {
    if (!hasToken) return;
    let mounted = true;
    const run = async () => {
      if (!email) {
        if (mounted) {
          setStatus("error");
          setMessage("This confirmation link is invalid or incomplete.");
        }
        return;
      }
      try {
        const res = await confirmEmail({ email, token });
        if (!mounted) return;
        setStatus("success");
        setMessage(res?.data?.message || "Email confirmed successfully. You can now sign in.");
      } catch (err) {
        if (!mounted) return;
        setStatus("error");
        setMessage(getErrorMessage(err, "Email confirmation failed. The link may be invalid or expired."));
      }
    };
    run();
    return () => { mounted = false; };
  }, [email, token, hasToken]);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendMsg("");
    setResendLink("");
    try {
      const res = await resendConfirmation({ email });
      setResendMsg(res?.data?.message || "If the email is registered and unconfirmed, a confirmation link has been sent.");
      setResendLink(res?.data?.data?.confirmLink || "");
    } catch (err) {
      setResendMsg(getErrorMessage(err, "Failed to resend confirmation email."));
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <PageTitle title="Confirm Email" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 sm:py-8 md:py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-surface rounded-2xl shadow-sm border border-border-main p-5 sm:p-6 md:p-8 text-center">
            {status === "loading" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
                <h1 className="text-xl font-bold text-text-main">Confirming your email</h1>
                <p className="text-sm text-text-muted">Please wait while we verify your account.</p>
              </div>
            )}

            {status === "pending" && (
              <div className="flex flex-col items-center gap-3 py-2">
                <Mail className="w-12 h-12 text-primary-600" />
                <h1 className="text-xl font-bold text-text-main">Check your email</h1>
                <p className="text-sm text-text-muted">
                  {emailSent
                    ? <>We sent a confirmation link{email ? <> to <strong className="text-text-main">{email}</strong></> : ""}. Confirm your email address to activate your account, then sign in.</>
                    : <>Your account was created, but we couldn&apos;t send the confirmation email{email ? <> to <strong className="text-text-main">{email}</strong></> : ""}. Check your email settings or try resending.</>}
                </p>
                {resendMsg && <p className="text-sm text-text-muted">{resendMsg}</p>}
                {resendLink && (
                  <a href={resendLink} className="text-sm text-primary-600 font-medium hover:underline break-all">
                    Confirm email now (development link)
                  </a>
                )}
                <div className="mt-2 flex flex-col gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || !email}
                    className="inline-flex items-center justify-center bg-primary-600 text-text-inverse font-medium px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-70"
                  >
                    {resending ? "Sending..." : "Resend confirmation email"}
                  </button>
                  <Link
                    to="/login"
                    state={{ message: "After confirming your email, you can sign in." }}
                    className="inline-flex items-center justify-center border border-border-main text-text-main font-medium px-5 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Go to login
                  </Link>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center gap-3 py-2">
                <CheckCircle2 className="w-12 h-12 text-success-600" />
                <h1 className="text-xl font-bold text-text-main">Email confirmed</h1>
                <p className="text-sm text-text-muted">{message}</p>
                <Link
                  to="/login"
                  state={{ message: "Email confirmed successfully. You can now sign in." }}
                  className="mt-2 inline-flex items-center justify-center bg-primary-600 text-text-inverse font-medium px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Go to login
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-3 py-2">
                <AlertCircle className="w-12 h-12 text-danger-600" />
                <h1 className="text-xl font-bold text-text-main">Confirmation issue</h1>
                <p className="text-sm text-text-muted">{message}</p>
                {resendMsg && <p className="text-sm text-text-muted">{resendMsg}</p>}
                {resendLink && (
                  <a href={resendLink} className="text-sm text-primary-600 font-medium hover:underline break-all">
                    Confirm email now (development link)
                  </a>
                )}
                <div className="mt-2 flex flex-col gap-2 w-full">
                  {email && (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="inline-flex items-center justify-center bg-primary-600 text-text-inverse font-medium px-5 py-2.5 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-70"
                    >
                      {resending ? "Sending..." : "Resend confirmation email"}
                    </button>
                  )}
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center border border-border-main text-text-main font-medium px-5 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Go to login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
