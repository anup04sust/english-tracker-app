import './globals.css';
import Providers from '@/components/Providers';
import Persistor from '@/components/Persistor';
import DatabaseSync from '@/components/DatabaseSync';
import SessionProvider from '@/components/SessionProvider';
export const metadata={title:'LetsSpeak - AI-Powered Language Learning',description:'Master any language in 15 days with AI-powered personalized learning and instant feedback'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang='en'><body><SessionProvider><Providers><Persistor /><DatabaseSync />{children}</Providers></SessionProvider></body></html>}
