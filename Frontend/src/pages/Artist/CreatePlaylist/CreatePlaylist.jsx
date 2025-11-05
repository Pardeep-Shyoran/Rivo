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
      musics: [],
    },
  });

  const selectedMusics = watch('musics');

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
      await axiosInstance.post('/api/music/playlist', data);
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
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Playlist Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              {...register('title', {
                required: 'Playlist title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters',
                },
              })}
              placeholder="Enter playlist name"
              disabled={isSubmitting}
            />
            {errors.title && (
              <span className={styles.errorMessage}>{errors.title.message}</span>
            )}
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