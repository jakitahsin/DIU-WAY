import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface/60 pb-28 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted">
            Your Campus. Your Friends. Your Ride. A tiny commute board built by DIU students, for
            the crew that rides to Daffodil Smart City together.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="text-ink-soft hover:text-brand" href="/today">Today&apos;s schedule</Link></li>
            <li><Link className="text-ink-soft hover:text-brand" href="/friends">Our travel crew</Link></li>
            <li><Link className="text-ink-soft hover:text-brand" href="/find">Find friends</Link></li>
            <li><Link className="text-ink-soft hover:text-brand" href="/my-schedule">My schedule</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Bus slots</h2>
          <p className="mt-4 text-sm text-ink-soft">
            To campus · 7:00, 8:30, 10:00 AM, 12:00 PM
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Back home · 11:15 AM, 1:20, 3:00, 4:20, 6:10 PM
          </p>
          <p className="mt-4 text-xs text-muted">Classes Saturday – Thursday · Times in Asia/Dhaka</p>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted sm:px-6">
          © {new Date().getFullYear()} DIU WAY · An independent student project, not an official
          Daffodil International University service. Campus photos © Daffodil International
          University.
        </p>
      </div>
    </footer>
  );
}
