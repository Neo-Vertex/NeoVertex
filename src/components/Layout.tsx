import React from 'react';
import Header from './Header';
import ChatWidget from './ChatWidget';
import { useTranslation } from 'react-i18next';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flex: 1 }}>
                {children}
            </main>
            <ChatWidget />
            <footer className="section-padding" style={{
                backgroundColor: 'var(--color-surface)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
                color: 'var(--color-text-muted)'
            }}>
                <p>&copy; {new Date().getFullYear()} NeoVertex. {t('footer.rights')}</p>
            </footer>
        </div>
    );
};

export default Layout;
