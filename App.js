import AppNavigator from './src/navigation/AppNavigator';
import { LanguageProvider } from './src/i18n/LanguageContext';
import { PremiumProvider } from './src/iap/PremiumContext';

export default function App() {
    return (
        <LanguageProvider>
            <PremiumProvider>
                <AppNavigator />
            </PremiumProvider>
        </LanguageProvider>
    );
}
