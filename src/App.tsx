import { StoreProvider }   from "./store/StoreProvider";
import { ModalProvider }   from "./context/ModalProvider.tsx";
import { AppShell }        from "./components/layout/AppShell";

export default function App() {
  return (
    <StoreProvider>
      <ModalProvider>
        <AppShell />
      </ModalProvider>
    </StoreProvider>
  );
}