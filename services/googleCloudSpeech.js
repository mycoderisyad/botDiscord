const speech = require('@google-cloud/speech');

class GoogleCloudSpeech {
  constructor() {
    // Initialize Speech-to-Text client
    this.speechClient = new speech.SpeechClient({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || './google-cloud-key.json',
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    });

    // Default STT configuration
    this.sttConfig = {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'id-ID',
      alternativeLanguageCodes: ['en-US', 'ja-JP', 'ko-KR', 'zh-CN'],
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: true,
      model: 'latest_long'
    };
  }

  // Speech-to-Text
  async transcribeAudio(audioBuffer, languageCode = 'id-ID') {
    try {
      const config = {
        ...this.sttConfig,
        languageCode: languageCode,
        alternativeLanguageCodes: languageCode === 'id-ID' 
          ? ['en-US', 'ja-JP', 'ko-KR', 'zh-CN']
          : ['id-ID']
      };

      const audio = {
        content: audioBuffer.toString('base64')
      };

      const request = {
        config: config,
        audio: audio
      };

      const [response] = await this.speechClient.recognize(request);
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      return {
        success: true,
        transcription: transcription,
        confidence: response.results[0]?.alternatives[0]?.confidence || 0,
        languageCode: languageCode
      };

    } catch (error) {
      console.error('Speech-to-Text Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Real-time Speech Recognition (streaming)
  createSpeechStream(languageCode = 'id-ID', onTranscript, onError) {
    try {
      const config = {
        ...this.sttConfig,
        languageCode: languageCode,
        alternativeLanguageCodes: languageCode === 'id-ID' 
          ? ['en-US', 'ja-JP', 'ko-KR', 'zh-CN']
          : ['id-ID']
      };

      const request = {
        config: config,
        interimResults: true,
        enableVoiceActivityEvents: true
      };

      const recognizeStream = this.speechClient
        .streamingRecognize(request)
        .on('error', (error) => {
          console.error('Streaming recognition error:', error);
          if (onError) onError(error);
        })
        .on('data', (data) => {
          if (data.results[0] && data.results[0].alternatives[0]) {
            const transcript = data.results[0].alternatives[0].transcript;
            const isFinal = data.results[0].isFinal;
            const confidence = data.results[0].alternatives[0].confidence;
            
            if (onTranscript) {
              onTranscript({
                transcript: transcript,
                isFinal: isFinal,
                confidence: confidence || 0
              });
            }
          }
        });

      return recognizeStream;

    } catch (error) {
      console.error('Create speech stream error:', error);
      if (onError) onError(error);
      return null;
    }
  }

  // Get supported languages for STT
  getSupportedLanguages() {
    return {
      'id': { code: 'id-ID', name: 'Indonesian', flag: '🇮🇩' },
      'en': { code: 'en-US', name: 'English', flag: '🇺🇸' },
      'ja': { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
      'ko': { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
      'zh': { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' }
    };
  }

  // Simple language detection from text
  detectLanguage(text) {
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
      if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja-JP';
      return 'zh-CN';
    }
    if (/[\uAC00-\uD7AF]/.test(text)) return 'ko-KR';
    if (/[a-zA-Z]/.test(text) && !/[àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]/.test(text)) return 'en-US';
    return 'id-ID'; // default to Indonesian
  }
}

module.exports = GoogleCloudSpeech; 