import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function InstitutionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser()

  if (!user) redirect('/login')
  if (user.role !== 'institution') redirect(`/unauthorized?reason=forbidden&role=${user.role}&attemptedPath=/institution`)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role="institution"
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
