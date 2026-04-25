import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/admin/Sidebar';
import { TopBar } from '@/components/admin/TopBar';
import { isShopEnabled } from '@/lib/settings/shop';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: profile }, shopEnabled] = await Promise.all([
    supabase
      .from('profiles')
      .select('email, first_name, last_name, avatar_url, role')
      .eq('id', user.id)
      .single(),
    isShopEnabled(),
  ]);

  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    redirect('/');
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar shopEnabled={shopEnabled} />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar
          user={{
            email: profile.email,
            firstName: profile.first_name,
            lastName: profile.last_name,
            avatarUrl: profile.avatar_url,
            role: profile.role,
          }}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}