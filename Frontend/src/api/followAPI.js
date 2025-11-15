import musicAxios from './axiosMusicConfig.jsx';

export const followArtist = (artistId, payload = {}) =>
  musicAxios.post(`/api/music/artists/${artistId}/follow`, payload);

export const unfollowArtist = (artistId) =>
  musicAxios.delete(`/api/music/artists/${artistId}/follow`);

export const getFollowStatus = (artistId) =>
  musicAxios.get(`/api/music/artists/${artistId}/follow/status`);

export const getFollowersCount = (artistId) =>
  musicAxios.get(`/api/music/artists/${artistId}/followers/count`);

export const getMyFollowers = () =>
  musicAxios.get('/api/music/artist/followers');

export const getMyFollowedArtists = () =>
  musicAxios.get('/api/music/me/following');
