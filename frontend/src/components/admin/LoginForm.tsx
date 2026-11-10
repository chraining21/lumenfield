"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";
import Logo from "@/components/Logo";
import { DEMO_MODE } from "@/lib/demo";

const ERRORS: Record<NonNullable<LoginState["error"]>, string> = {
  invalid: "帳號或密碼錯誤。",
  locked: "登入失敗次數過多，請 15 分鐘後再試。",
  failed: "目前無法登入，請稍後再試。",
};

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, {});

  const field =
    "w-full border border-ink bg-bg px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/40";

  return (
    <form action={action} className="grid w-full max-w-sm gap-5 border border-ink bg-surface p-8">
      <div className="flex items-center gap-2.5 border-b-2 border-ink pb-4">
        <Logo />
        <div>
          <p className="font-bold tracking-[.12em]">明野照明</p>
          <p className="label-mono">ADMIN / SIGN IN</p>
        </div>
      </div>
      <label>
        <span className="mb-1 block text-sm">帳號</span>
        <input name="username" required maxLength={50} autoComplete="username" className={field} />
      </label>
      <label>
        <span className="mb-1 block text-sm">密碼</span>
        <input name="password" type="password" required maxLength={200} autoComplete="current-password" className={field} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="border-[1.5px] border-ink bg-ink px-5.5 py-3 text-sm font-medium text-bg transition-colors enabled:hover:border-brand enabled:hover:bg-brand enabled:hover:text-[#1d1f22] disabled:opacity-60"
      >
        {pending ? "登入中…" : "登入 →"}
      </button>
      {DEMO_MODE && (
        <p className="border border-brand bg-highlight p-3 text-sm">
          Demo 唯讀帳號：<b className="font-mono">demo</b>／<b className="font-mono">lumenfield-demo</b>
        </p>
      )}
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {ERRORS[state.error]}
        </p>
      )}
    </form>
  );
}
