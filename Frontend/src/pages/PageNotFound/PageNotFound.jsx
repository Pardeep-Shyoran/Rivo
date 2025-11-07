import styles from './PageNotFound.module.css';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';

const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>Page Not Found || Rivo</title>
        <meta name="description" content="The page you are looking for does not exist" />
      </Helmet>
      <section className={styles.page}>
        <div className={styles.wrapper}>
          <div className={styles.illustration} aria-hidden="true">
            <div className={styles.code}>404</div>
          </div>
          <h1 className={styles.title}>Oops! Page not found</h1>
          <p className={styles.message}>
            We couldn't find the page you were looking for. <br />
            Let’s get you back to something awesome.
          </p>
          <div className={styles.actions}>
            <Link to="/" className={styles.homeBtn}>
              <span className={styles.homeIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12L12 3L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 12V19C6 19.5523 6.44772 20 7 20H17C17.5523 20 18 19.5523 18 19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Go Home
            </Link>
            <button type="button" className={styles.secondaryBtn} onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default PageNotFound;