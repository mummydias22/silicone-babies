"use client";
import { useActionState } from "react";
import { changeEmail, changePassword } from "../../actions";

export default function AccountForms({ email }: { email: string }) {
  const [em, emAction] = useActionState(changeEmail, "");
  const [pw, pwAction] = useActionState(changePassword, "");
  return (
    <>
      <form action={emAction} className="card mt-4 space-y-3">
        <h2 className="font-semibold">Login email</h2>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required defaultValue={email} className="input" /></div>
        <div><label className="label" htmlFor="current1">Current password</label><input id="current1" name="current" type="password" required autoComplete="current-password" className="input" /></div>
        <button type="submit" className="btn">Change email</button>
        <p role="status" className="text-sm">{em}</p>
      </form>
      <form action={pwAction} className="card mt-4 space-y-3">
        <h2 className="font-semibold">Password</h2>
        <div><label className="label" htmlFor="current2">Current password</label><input id="current2" name="current" type="password" required autoComplete="current-password" className="input" /></div>
        <div><label className="label" htmlFor="next">New password</label><input id="next" name="next" type="password" required minLength={8} autoComplete="new-password" className="input" /></div>
        <button type="submit" className="btn">Change password</button>
        <p role="status" className="text-sm">{pw}</p>
      </form>
    </>
  );
}
