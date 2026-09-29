import Link from "next/link";
import { logOut } from "../account-actions";

export default function AccountNav({ active, email }: { active: "cards" | "account"; email: string }) {
  const tab = (on: boolean) => `rounded-full px-4 py-2 text-sm font-extrabold ${on ? "bg-plum text-white" : "bg-white text-plum-soft ring-1 ring-petal hover:text-plum"}`;
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <nav className="flex gap-2">
        <Link href="/account/cards" className={tab(active === "cards")}>My cards</Link>
        <Link href="/account" className={tab(active === "account")}>Account</Link>
      </nav>
      <div className="flex items-center gap-3 text-sm">
        <span className="max-w-[16rem] truncate text-plum-soft">{email}</span>
        <form action={logOut}>
          <button className="font-extrabold text-rose">Log out</button>
        </form>
      </div>
    </div>
  );
}
