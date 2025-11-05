import MainRoutes from "./routes/MainRoutes";
import { LoaderProvider } from "./contexts/LoaderContext";
import { MusicPlayerProvider } from "./contexts/MusicPlayerContext";
import useLoader from "./contexts/useLoader";
import Loader from "./components/Loader/Loader";
import Header from "./components/Header/Header";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";
import PageWrapper from "./components/PageWrapper/PageWrapper";
import styles from "./App.module.css";

const AppContent = () => {
  const { loading } = useLoader();
  return (
    <div className={styles.appLayout}>
      {loading && <Loader />}
      <Header />
      <main className={styles.mainContent}>
        <PageWrapper>
          <MainRoutes />
        </PageWrapper>
      </main>
      <MusicPlayer />
    </div>
  );
};

const App = () => (
  <LoaderProvider>
    <MusicPlayerProvider>
      <AppContent />
    </MusicPlayerProvider>
  </LoaderProvider>
);

export default App;