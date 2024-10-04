import axios from 'axios';

export const uploadAudio = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');

  try {
    const response = await axios.post('/api/upload-audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (err) {
    console.error('Error uploading audio:', err);
    throw err;
  }
};
