import { login } from "../actions";

export const metadata = { title: "Admin login" };

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-3xl font-semibold">Admin sign in</h1>
      <form action={login} className="card mt-6 space-y-3">
        {error && <p role="alert" className="text-sm text-red-600">Wrong email or password.</p>}
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="input" autoComplete="username" /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required className="input" autoComplete="current-password" /></div>
        <button type="submit" className="btn w-full">Sign in</button>
      </form>
    </div>
  );
}
