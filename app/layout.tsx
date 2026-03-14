import './globals.css';
import Providers from '@/components/Providers';
import Persistor from '@/components/Persistor';
import DatabaseSync from '@/components/DatabaseSync';
import SessionProvider from '@/components/SessionProvider';
export const metadata={title:'English 15-Day Tracker',description:'15-day English checklist with recording and AI review'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang='en'><body><SessionProvider><Providers><Persistor /><DatabaseSync />{children}</Providers></SessionProvider></body></html>}
