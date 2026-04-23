import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../store/AuthContext";

const SignupPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",
    region: "",
    preferredLanguage: i18n.language,
    story: "",
    craft: "",
    culturalInfo: ""
  });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();

    try {
      await signup(form);
      navigate("/");
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl rounded-[2.5rem] border border-stone-200 bg-white p-8 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-clay">{t("auth.signupEyebrow")}</p>
      <h1 className="mt-3 font-display text-4xl text-forest">{t("auth.signupTitle")}</h1>
      <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={submit}>
        <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("auth.name")} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
        <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("auth.email")} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
        <input type="password" className="rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("auth.password")} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
        <input className="rounded-2xl border border-stone-200 px-4 py-3" placeholder={t("auth.region")} value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))} />
        <select className="rounded-2xl border border-stone-200 px-4 py-3" value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>
          <option value="buyer">{t("roles.buyer")}</option>
          <option value="artisan">{t("roles.artisan")}</option>
        </select>
        <select className="rounded-2xl border border-stone-200 px-4 py-3" value={form.preferredLanguage} onChange={(event) => setForm((current) => ({ ...current, preferredLanguage: event.target.value }))}>
          {["en", "hi", "ur"].map((language) => (
            <option key={language} value={language}>
              {t(`languages.${language}`)}
            </option>
          ))}
        </select>

        {form.role === "artisan" && (
          <>
            <input className="rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2" placeholder={t("artisan.craft")} value={form.craft} onChange={(event) => setForm((current) => ({ ...current, craft: event.target.value }))} />
            <textarea className="min-h-28 rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2" placeholder={t("artisan.story")} value={form.story} onChange={(event) => setForm((current) => ({ ...current, story: event.target.value }))} />
            <textarea className="min-h-28 rounded-2xl border border-stone-200 px-4 py-3 md:col-span-2" placeholder={t("artisan.culturalInfo")} value={form.culturalInfo} onChange={(event) => setForm((current) => ({ ...current, culturalInfo: event.target.value }))} />
          </>
        )}

        {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}

        <button type="submit" className="rounded-full bg-clay px-5 py-3 text-sm font-semibold text-white md:col-span-2">
          {t("actions.createAccount")}
        </button>
      </form>
      <p className="mt-6 text-sm text-stone-600">
        {t("auth.haveAccount")}{" "}
        <Link to="/login" className="font-semibold text-clay">
          {t("actions.login")}
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;

