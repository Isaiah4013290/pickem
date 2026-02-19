import Nav from "../../components/Nav"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      <footer className="text-center py-6 text-xs text-slate-700 border-t border-slate-900">
        🎉 For fun predictions only. No money involved.
      </footer>
    </>
  )
}
