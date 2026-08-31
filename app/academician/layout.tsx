import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function AcademicianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()

  if (!user) redirect('/login')
  if (user.role !== 'academician') redirect(`/unauthorized?reason=forbidden&role=${user.role}&attemptedPath=/academician`)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role="academician"
        fullName={user.full_name}
        email={user.email}
        avatarUrl={user.avatar_url}
      />
      <main className="flex-1 overflow-y-auto bg-surface">
        {children}
      </main>
    </div>
  )
}
