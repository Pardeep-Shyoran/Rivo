import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styles from './CreatePlaylist.module.css';
import axiosInstance from '../../../api/axiosMusicConfig';
import Loader from '../../../components/Loader/Loader';
import useLoader from '../../../contexts/useLoader';

const CreatePlaylist = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      isPublic: true,
      musics: [],
    },
  });

  const selectedMusics = watch('musics');
  const titleValue = watch('title');
  const descriptionValue = watch('description');

  useEffect(() => {
    fetchMusics();
  }, []);

  const fetchMusics = async () => {
    try {
      const response = await axiosInstance.get('/api/music/artist/musics');
      setMusics(response.data.musics || []);
    } catch (err) {
      setError('Failed to fetch your music tracks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMusicSelection = (musicId) => {
    const currentMusics = selectedMusics || [];
    const newMusics = currentMusics.includes(musicId)
      ? currentMusics.filter((id) => id !== musicId)
      : [...currentMusics, musicId];
    setValue('musics', newMusics);
  };

  const onSubmit = async (data) => {
    setError(null);
    showLoader();

    try {
      const payload = {
        title: data.title,
        description: data.description || '',
        isPublic: data.isPublic,
        musics: data.musics,
      };
      await axiosInstance.post('/api/music/playlist', payload);
      navigate('/artist/dashboard');
    } catch (err) {
      setError('Failed to create playlist: ' + (err.response?.data?.message || err.message));
    } finally {
      hideLoader();
    }
  };

  if (loading) {
    return (
      <div className={styles.createPlaylist}>
        <Loader message="Loading your music..." inline />
      </div>
    );
  }

  return (
    <div className={styles.createPlaylist}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/artist/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1 className={styles.title}>Create Playlist</h1>
          <p className={styles.subtitle}>Organize your music into collections</p>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={`${styles.field} ${titleValue ? styles.filled : ''}`}>
            <span className={styles.icon} aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3V12.3L18 18.3L19.4 16.9L14 11.5V3H12ZM12 1C18.07 1 23 5.93 23 12C23 18.07 18.07 23 12 23C5.93 23 1 18.07 1 12C1 5.93 5.93 1 12 1ZM12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21Z" fill="currentColor"/>
              </svg>
            </span>
            <input
              id="title"
              type="text"
              className={styles.input}
              {...register('title', {
                required: 'Playlist title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters',
                },
              })}
              disabled={isSubmitting}
            />
            <label className={styles.floatingLabel} htmlFor="title">
              Playlist Title <span className={styles.required}>*</span>
            </label>
          </div>
          {errors.title && (
            <p className={styles.error}>{errors.title.message}</p>
          )}

          <div className={`${styles.field} ${descriptionValue ? styles.filled : ''}`}>
            <span className={styles.icon} aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="currentColor"/>
              </svg>
            </span>
            <textarea
              id="description"
              className={styles.textarea}
              {...register('description')}
              rows={3}
              disabled={isSubmitting}
            />
            <label className={styles.floatingLabel} htmlFor="description">
              Description <span className={styles.optional}>(optional)</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                {...register('isPublic')}
                disabled={isSubmitting}
              />
              <span>Make playlist public</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Select Tracks <span className={styles.optional}>({selectedMusics?.length || 0} selected)</span>
            </label>
            
            {musics.length === 0 ? (
              <div className={styles.noMusic}>
                <div className={styles.noMusicIcon}>🎵</div>
                <h3>No music available</h3>
                <p>Upload some music first to create a playlist</p>
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => navigate('/artist/upload')}
                >
                  Upload Music
                </button>
              </div>
            ) : (
              <div className={styles.musicList}>
                {musics.reverse().map((music) => (
                  <div key={music._id} className={styles.musicItem}>
                    <input
                      type="checkbox"
                      id={`music-${music._id}`}
                      checked={selectedMusics?.includes(music._id) || false}
                      onChange={() => toggleMusicSelection(music._id)}
                      className={styles.checkbox}
                      disabled={isSubmitting}
                    />
                    <label htmlFor={`music-${music._id}`} className={styles.musicLabel}>
                      <img
                        src={music.coverImageUrl || '/placeholder.jpg'}
                        alt={music.title}
                        className={styles.musicThumb}
                      />
                      <div className={styles.musicDetails}>
                        <span className={styles.musicTitle}>{music.title}</span>
                        <span className={styles.musicArtist}>{music.artist}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate('/artist/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={musics.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinnerBtn}></span>
                  Creating...
                </>
              ) : (
                'Create Playlist'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylist;