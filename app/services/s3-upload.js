import Service from '@ember/service';

export default class S3UploadService extends Service {
  async uploadFile(file) {
    // Mock API call to S3
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Mock S3 URL response
    const mockS3Url = `https://fake-s3-bucket.s3.amazonaws.com/${file.name}`;
    
    return {
      url: mockS3Url,
      fileName: file.name,
      fileEmoji: '📎' // Adding file emoji
    };
  }
} 