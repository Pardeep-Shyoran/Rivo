import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styles from './UploadMusic.module.css';
import axiosInstance from '../../../api/axiosMusicConfig';
import useLoader from '../../../contexts/useLoader';

const UploadMusic = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const [error, setError] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      musicFile: null,
      coverImage: null,
    },
  });

  const coverImage = watch('coverImage');
  const musicFile = watch('musicFile');

  // Update cover preview when cover image changes
  useEffect(() => {
    if (coverImage && coverImage[0]) {
      const objectUrl = URL.createObjectURL(coverImage[0]);
      setCoverPreview(objectUrl);
      
      // Cleanup function to revoke the object URL
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setCoverPreview(null);
    }
  }, [coverImage]);

  const onSubmit = async (data) => {
    setError(null);
    showLoader();

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('musicFile', data.musicFile[0]);
      formData.append('coverImage', data.coverImage[0]);

      await axiosInstance.post('/api/music/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Redirect to dashboard after successful upload
      navigate('/artist/dashboard');
    } catch (err) {
      setError('Failed to upload music: ' + (err.response?.data?.message || err.message));
    } finally {
      hideLoader();
    }
  };

  return (
    <div className={styles.uploadMusic}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate('/artist/dashboard')}>
            ← Back to Dashboard
          </button>
          <h1 className={styles.title}>Upload Music</h1>
          <p className={styles.subtitle}>Share your music with the world</p>
        </div>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Track Title <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              {...register('title', {
                required: 'Track title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters',
                },
              })}
              placeholder="Enter track title"
              disabled={isSubmitting}
            />
            {errors.title && (
              <span className={styles.errorMessage}>{errors.title.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Music File <span className={styles.required}>*</span>
            </label>
            <div className={styles.fileInputWrapper}>
              <input
                type="file"
                id="musicFile"
                className={styles.fileInput}
                accept="audio/*"
                {...register('musicFile', {
                  required: 'Music file is required',
                })}
                disabled={isSubmitting}
              />
              <label htmlFor="musicFile" className={styles.fileLabel}>
                <span className={styles.fileIcon}>🎵</span>
                <span className={styles.fileName}>
                  {musicFile?.[0]?.name || 'Choose audio file'}
                </span>
              </label>
            </div>
            <p className={styles.fileHint}>Supported formats: MP3, WAV, OGG, FLAC</p>
            {errors.musicFile && (
              <span className={styles.errorMessage}>{errors.musicFile.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Cover Image <span className={styles.required}>*</span>
            </label>
            <div className={styles.fileInputWrapper}>
              <input
                type="file"
                id="coverImage"
                className={styles.fileInput}
                accept="image/*"
                {...register('coverImage', {
                  required: 'Cover image is required',
                })}
                disabled={isSubmitting}
              />
              <label htmlFor="coverImage" className={styles.fileLabel}>
                <span className={styles.fileIcon}>🖼️</span>
                <span className={styles.fileName}>
                  {coverImage?.[0]?.name || 'Choose cover image'}
                </span>
              </label>
            </div>
            <p className={styles.fileHint}>Recommended: 1:1 aspect ratio, at least 500x500px</p>
            {errors.coverImage && (
              <span className={styles.errorMessage}>{errors.coverImage.message}</span>
            )}
          </div>

          {coverPreview && (
            <div className={styles.preview}>
              <p className={styles.previewLabel}>Preview:</p>
              <img
                src={coverPreview}
                alt="Cover preview"
                className={styles.previewImage}
              />
            </div>
          )}

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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className={styles.spinner}></span>
                  Uploading...
                </>
              ) : (
                'Upload Music'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadMusic;