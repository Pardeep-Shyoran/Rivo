import styles from "./Home.module.css";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Home || Rivo</title>
        <meta name="description" content="Welcome to the Home page" />
      </Helmet>
      <div className={styles.home}>Home</div>
    </>
  );
};

export default Home;
