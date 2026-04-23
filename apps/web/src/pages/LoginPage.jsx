import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../store/AuthContext";

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();

    try {
      await login(form);
      navigate(location.state?.from || "/");
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-[2.5rem] border border-stone-200 bg-white p-8 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-clay">{t("auth.loginEyebrow")}</p>
      <h1 className="mt-3 font-display text-4xl text-forest">{t("auth.loginTitle")}</h1>
      <form className="mt-6 grid gap-4" onSubmit={submit}>
        <input
          className="rounded-2xl border border-stone-200 px-4 py-3"
          placeholder={t("auth.email")}
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <input
          type="password"
          className="rounded-2xl border border-stone-200 px-4 py-3"
          placeholder={t("auth.password")}
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded-full bg-clay px-5 py-3 text-sm font-semibold text-white">
          {t("actions.login")}
        </button>
      </form>
      <p className="mt-6 text-sm text-stone-600">
        {t("auth.noAccount")}{" "}
        <Link to="/signup" className="font-semibold text-clay">
          {t("actions.signup")}
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;

