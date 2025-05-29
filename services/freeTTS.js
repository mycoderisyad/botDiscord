const https = require('https');
const fs = require('fs');
const path = require('path');

class FreeTTS {
  constructor() {
    this.supportedLanguages = {
      'id': { code: 'id', name: 'Indonesian', flag: '🇮🇩', gttsCode: 'id' },
      'en': { code: 'en', name: 'English', flag: '🇺🇸', gttsCode: 'en' },
      'ja': { code: 'ja', name: 'Japanese', flag: '🇯🇵', gttsCode: 'ja' },
      'ko': { code: 'ko', name: 'Korean', flag: '🇰🇷', gttsCode: 'ko' },
      'zh': { code: 'zh', name: 'Chinese', flag: '🇨🇳', gttsCode: 'zh' }
    };
  }

  // Google Translate TTS (Gratis)
  async generateTTSWithGoogleTranslate(text, languageCode = 'id') {
    try {
      const langInfo = this.supportedLanguages[languageCode] || this.supportedLanguages['id'];
      
      // Split text jika terlalu panjang (Google Translate TTS ada limit)
      const maxLength = 200;
      const textChunks = this.splitText(text, maxLength);
      
      if (textChunks.length > 1) {
        // Handle multiple chunks
        return await this.generateMultiChunkTTS(textChunks, langInfo);
      }
      
      // Single chunk
      const encodedText = encodeURIComponent(text);
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langInfo.gttsCode}&client=tw-ob&q=${encodedText}`;
      
      return new Promise((resolve, reject) => {
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const filename = `tts_${Date.now()}.mp3`;
        const filePath = path.join(tempDir, filename);
        const file = fs.createWriteStream(filePath);
        
        const request = https.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://translate.google.com/'
          }
        }, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', () => {
              file.close();
              
              // Verify file exists and has content
              if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
                resolve({
                  success: true,
                  audioPath: filePath,
                  filename: filename,
                  format: 'mp3',
                  provider: 'Google Translate TTS (Free)',
                  language: langInfo.name
                });
              } else {
                fs.unlink(filePath, () => {});
                reject(new Error('Generated audio file is empty'));
              }
            });
          } else {
            file.close();
            fs.unlink(filePath, () => {});
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          }
        });
        
        request.on('error', (err) => {
          file.close();
          fs.unlink(filePath, () => {});
          reject(err);
        });
        
        request.setTimeout(15000, () => {
          request.destroy();
          file.close();
          fs.unlink(filePath, () => {});
          reject(new Error('Request timeout'));
        });
      });
      
    } catch (error) {
      console.error('Google Translate TTS Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Split text into chunks for long text
  splitText(text, maxLength) {
    if (text.length <= maxLength) {
      return [text];
    }
    
    const chunks = [];
    const sentences = text.split(/[.!?。！？]+/);
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;
      
      if ((currentChunk + ' ' + trimmedSentence).length <= maxLength) {
        currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = trimmedSentence;
        } else {
          // Single sentence is too long, split by words
          const words = trimmedSentence.split(' ');
          let wordChunk = '';
          for (const word of words) {
            if ((wordChunk + ' ' + word).length <= maxLength) {
              wordChunk += (wordChunk ? ' ' : '') + word;
            } else {
              if (wordChunk) chunks.push(wordChunk);
              wordChunk = word;
            }
          }
          if (wordChunk) currentChunk = wordChunk;
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks.filter(chunk => chunk.trim().length > 0);
  }

  // Generate TTS for multiple chunks (future enhancement)
  async generateMultiChunkTTS(textChunks, langInfo) {
    // For now, just use the first chunk to keep it simple
    const firstChunk = textChunks[0];
    console.log(`⚠️ Text too long, using first part: "${firstChunk}"`);
    
    const encodedText = encodeURIComponent(firstChunk);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langInfo.gttsCode}&client=tw-ob&q=${encodedText}`;
    
    return new Promise((resolve, reject) => {
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const filename = `tts_${Date.now()}.mp3`;
      const filePath = path.join(tempDir, filename);
      const file = fs.createWriteStream(filePath);
      
      const request = https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://translate.google.com/'
        }
      }, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            
            if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
              resolve({
                success: true,
                audioPath: filePath,
                filename: filename,
                format: 'mp3',
                provider: 'Google Translate TTS (Free)',
                language: langInfo.name,
                note: `Truncated from ${textChunks.length} parts`
              });
            } else {
              fs.unlink(filePath, () => {});
              reject(new Error('Generated audio file is empty'));
            }
          });
        } else {
          file.close();
          fs.unlink(filePath, () => {});
          reject(new Error(`HTTP ${response.statusCode}`));
        }
      });
      
      request.on('error', (err) => {
        file.close();
        fs.unlink(filePath, () => {});
        reject(err);
      });
      
      request.setTimeout(15000, () => {
        request.destroy();
        file.close();
        fs.unlink(filePath, () => {});
        reject(new Error('Request timeout'));
      });
    });
  }

  // Main TTS function
  async synthesizeSpeech(text, languageCode = 'id') {
    try {
      console.log(`🗣️ Generating TTS for: "${text}" in ${languageCode}`);
      
      const result = await this.generateTTSWithGoogleTranslate(text, languageCode);
      
      if (result.success) {
        console.log(`✅ TTS generated with ${result.provider}`);
        return result;
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('Free TTS Error:', error);
      return {
        success: false,
        error: `TTS generation failed: ${error.message}`,
        suggestion: 'Please check internet connection. Google Translate TTS requires internet access.'
      };
    }
  }

  // Get supported languages
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  // Cleanup temp files
  cleanupTempFiles() {
    try {
      const tempDir = path.join(__dirname, '../temp');
      if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        const now = Date.now();
        
        files.forEach(file => {
          if (file.startsWith('tts_')) {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);
            
            // Delete TTS files older than 30 minutes
            if (now - stats.mtime.getTime() > 1800000) {
              fs.unlinkSync(filePath);
              console.log(`🗑️ Cleaned up old TTS file: ${file}`);
            }
          }
        });
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = FreeTTS; 