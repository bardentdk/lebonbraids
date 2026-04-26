import { Navbar } from '@/components/public/layout/Navbar';
import { Footer } from '@/components/public/layout/Footer';
import { isShopEnabled } from '@/lib/settings/shop'; export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const shopEnabled = await isShopEnabled(); return (
        <>
            <Navbar shopEnabled={shopEnabled} />
            <main className="min-h-screen pt-16">{children}</main>
            <Footer shopEnabled={shopEnabled} />
        </>
    );
}