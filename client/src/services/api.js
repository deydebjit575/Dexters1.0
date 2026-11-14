const BASE_URL = '/api';

export const getAuthToken = () => localStorage.getItem('storyverse_token');

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('storyverse_token', token);
  } else {
    localStorage.removeItem('storyverse_token');
  }
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'A network error occurred. Please try again.');
    }
    return data;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed.');
  }

  return response;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  changePassword: (body) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  deleteAccount: () => request('/auth/account', { method: 'DELETE' }),

  // Universes
  getUniverses: (filter) => request(`/universes${filter ? `?filter=${filter}` : ''}`),
  getUniverse: (id) => request(`/universes/${id}`),
  getUniverseGraph: (id) => request(`/universes/${id}/graph`),
  createUniverse: (body) => request('/universes', { method: 'POST', body: JSON.stringify(body) }),
  updateUniverse: (id, body) => request(`/universes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteUniverse: (id) => request(`/universes/${id}`, { method: 'DELETE' }),

  // Characters
  getCharacters: (universeId) => request(`/characters?universeId=${universeId}`),
  getCharacter: (id) => request(`/characters/${id}`),
  createCharacter: (body) => request('/characters', { method: 'POST', body: JSON.stringify(body) }),
  updateCharacter: (id, body) => request(`/characters/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCharacter: (id) => request(`/characters/${id}`, { method: 'DELETE' }),
  getRelationships: (universeId) => request(`/characters/meta/relationships?universeId=${universeId}`),
  createRelationship: (body) => request('/characters/meta/relationships', { method: 'POST', body: JSON.stringify(body) }),
  deleteRelationship: (id) => request(`/characters/meta/relationships/${id}`, { method: 'DELETE' }),

  // Locations
  getLocations: (universeId) => request(`/locations?universeId=${universeId}`),
  getLocation: (id) => request(`/locations/${id}`),
  createLocation: (body) => request('/locations', { method: 'POST', body: JSON.stringify(body) }),
  updateLocation: (id, body) => request(`/locations/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteLocation: (id) => request(`/locations/${id}`, { method: 'DELETE' }),
  connectLocations: (body) => request('/locations/connect', { method: 'POST', body: JSON.stringify(body) }),

  // Timelines
  getTimelines: (universeId) => request(`/timelines?universeId=${universeId}`),
  createTimeline: (body) => request('/timelines', { method: 'POST', body: JSON.stringify(body) }),
  updateTimeline: (id, body) => request(`/timelines/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTimeline: (id) => request(`/timelines/${id}`, { method: 'DELETE' }),

  // Stories
  getStories: (universeId) => request(`/stories${universeId ? `?universeId=${universeId}` : ''}`),
  getStory: (id) => request(`/stories/${id}`),
  createStory: (body) => request('/stories', { method: 'POST', body: JSON.stringify(body) }),
  updateStory: (id, body) => request(`/stories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteStory: (id) => request(`/stories/${id}`, { method: 'DELETE' }),

  // Chapters
  getChapters: (storyId) => request(`/stories/${storyId}/chapters`),
  createChapter: (storyId, body) => request(`/stories/${storyId}/chapters`, { method: 'POST', body: JSON.stringify(body) }),
  updateChapter: (storyId, chapterId, body) => request(`/stories/${storyId}/chapters/${chapterId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteChapter: (storyId, chapterId) => request(`/stories/${storyId}/chapters/${chapterId}`, { method: 'DELETE' }),

  // Dialogues
  getDialogues: (universeId) => request(`/dialogues?universeId=${universeId}`),
  getDialogue: (id) => request(`/dialogues/${id}`),
  createDialogue: (body) => request('/dialogues', { method: 'POST', body: JSON.stringify(body) }),
  updateDialogue: (id, body) => request(`/dialogues/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteDialogue: (id) => request(`/dialogues/${id}`, { method: 'DELETE' }),

  // Branching Stories
  getBranchingStories: (universeId) => request(`/branching-stories?universeId=${universeId}`),
  getBranchingStory: (id) => request(`/branching-stories/${id}`),
  createBranchingStory: (body) => request('/branching-stories', { method: 'POST', body: JSON.stringify(body) }),
  updateBranchingStory: (id, body) => request(`/branching-stories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBranchingStory: (id) => request(`/branching-stories/${id}`, { method: 'DELETE' }),

  // Community
  getCommunityFeed: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/community/feed${q ? `?${q}` : ''}`);
  },
  likePost: (id) => request(`/community/posts/${id}/like`, { method: 'POST' }),
  bookmarkPost: (id) => request(`/community/posts/${id}/bookmark`, { method: 'POST' }),
  publishPost: (body) => request('/community/publish', { method: 'POST', body: JSON.stringify(body) }),
  getCreatorProfile: (userId) => request(`/community/creators/${userId}`),

  // Subscription
  getPlans: () => request('/subscription/plans'),
  getSubscriptionStatus: () => request('/subscription/status'),
  createCheckout: (body) => request('/subscription/checkout', { method: 'POST', body: JSON.stringify(body) }),
  verifyPayment: (body) => request('/subscription/verify', { method: 'POST', body: JSON.stringify(body) }),

  // AI Generation
  generateWorldLore: (body) => request('/ai/world-lore', { method: 'POST', body: JSON.stringify(body) }),
  generateCharacter: (body) => request('/ai/character', { method: 'POST', body: JSON.stringify(body) }),
  generateChapter: (body) => request('/ai/chapter', { method: 'POST', body: JSON.stringify(body) }),
  continueStory: (body) => request('/ai/continue', { method: 'POST', body: JSON.stringify(body) }),
  generateDialogue: (body) => request('/ai/dialogue', { method: 'POST', body: JSON.stringify(body) }),
  generatePlotTwist: (body) => request('/ai/plot-twist', { method: 'POST', body: JSON.stringify(body) }),
  checkContinuity: (body) => request('/ai/continuity-check', { method: 'POST', body: JSON.stringify(body) }),
  brainstorm: (body) => request('/ai/brainstorm', { method: 'POST', body: JSON.stringify(body) }),
  getAiHistory: () => request('/ai/usage-history'),
};
