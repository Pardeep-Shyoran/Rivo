import { useContext } from 'react';
import { MusicPlayerContext } from './MusicPlayerContextInstance';

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
};
