import { LocaleProvider } from "./core/i18n/LocaleProvider";
import { ServicesProvider } from "./app/ServicesProvider";
import { AuthBoundary } from "./features/auth/presentation/AuthBoundary";
export default function App() {
  return (
    <LocaleProvider>
      <ServicesProvider>
        <AuthBoundary />
      </ServicesProvider>
    </LocaleProvider>
  );
}
