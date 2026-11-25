import { useState } from "react";
import { FaLock } from "react-icons/fa";
import { useApp } from "../../context/AppContext.jsx";
import { api } from "../../api/client.js";
import { asset } from "../../utils/helpers.js";
import "./Login.css";

export default function Login({ onOk }) {
  const { T, data } = useApp();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");

  const go = async (e) => {
    e.preventDefault();
    try {
      const a = await api.get("/auth");
      if (a.user === u && a.pass === p) {
        sessionStorage.setItem("auth", "1");
        onOk();
      } else setErr(T("اسم المستخدم أو كلمة المرور غير صحيحة", "Wrong username or password"));
    } catch {
      setErr(T("تعذر الاتصال بالخادم", "Cannot reach the server"));
    }
  };

  return (
    <div className="login">
      <form onSubmit={go}>
        <img src={asset(data.settings.brand.logo) || "/logo.png"} alt="" />
        <h2>{T("لوحة التحكم", "Admin dashboard")}</h2>
        <p>{T("سجّل الدخول لإدارة الموقع", "Sign in to manage the site")}</p>
        <input autoFocus placeholder={T("المستخدم", "Username")} value={u} onChange={(e) => setU(e.target.value)} />
        <input type="password" placeholder={T("كلمة المرور", "Password")} value={p} onChange={(e) => setP(e.target.value)} />
        {err && <small className="login-err" role="alert">{err}</small>}
        <button><FaLock /> {T("دخول", "Login")}</button>
      </form>
    </div>
  );
}
