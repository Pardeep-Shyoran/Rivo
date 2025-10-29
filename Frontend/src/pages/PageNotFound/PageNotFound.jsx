import styles from './PageNotFound.module.css'
import { Helmet } from 'react-helmet';

const PageNotFound = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found || Rivo</title>
        <meta name="description" content="The page you are looking for does not exist" />
      </Helmet>
      <div className={styles.pageNotFound}>Page Not Found</div>
    </>
  );
}

export default PageNotFound