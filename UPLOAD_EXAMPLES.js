// Example: How to Use S3 vs Cloudinary Upload in Your Frontend

// ============================================
// METHOD 1: S3 Upload (Existing - Unchanged)
// ============================================

async function uploadImageToS3(imageFile, token) {
  // Step 1: Get presigned URL from backend
  const response = await fetch('http://localhost:3000/api/posts/image/upload-url', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contentType: imageFile.type, // e.g., 'image/jpeg', 'image/png'
    }),
  });

  const { data } = await response.json();
  const { uploadUrl, key } = data;

  // Step 2: Upload directly to S3 using presigned URL
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': imageFile.type,
    },
    body: imageFile,
  });

  // Step 3: The image URL would be:
  const imageUrl = `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

  return { imageUrl, key };
}

// ============================================
// METHOD 2: Cloudinary Upload (New)
// ============================================

async function uploadImageToCloudinary(imageFile, token) {
  // Step 1: Get Cloudinary signature from backend
  const response = await fetch('http://localhost:3000/api/posts/image/cloudinary-signature', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      resourceType: 'image', // optional, defaults to 'image'
    }),
  });

  const { data } = await response.json();
  const { signature, timestamp, cloudName, apiKey, folder } = data;

  // Step 2: Upload directly to Cloudinary
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp);
  formData.append('api_key', apiKey);
  formData.append('folder', folder);

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const result = await uploadResponse.json();

  // Step 3: Get the uploaded image URL
  return {
    imageUrl: result.secure_url,
    publicId: result.public_id,
    // Additional info available:
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

// ============================================
// USAGE EXAMPLE IN REACT COMPONENT
// ============================================

function ImageUploadComponent() {
  const [uploadMethod, setUploadMethod] = useState('s3'); // 's3' or 'cloudinary'
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = localStorage.getItem('accessToken');

      let result;
      if (uploadMethod === 's3') {
        result = await uploadImageToS3(file, token);
      } else {
        result = await uploadImageToCloudinary(file, token);
      }

      setImageUrl(result.imageUrl);
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <select value={uploadMethod} onChange={(e) => setUploadMethod(e.target.value)}>
        <option value="s3">S3 Upload</option>
        <option value="cloudinary">Cloudinary Upload</option>
      </select>

      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />

      {uploading && <p>Uploading...</p>}
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
}

// ============================================
// WHICH METHOD TO CHOOSE?
// ============================================

/*
Use S3 when:
- You want simple, cost-effective storage
- You already have AWS infrastructure
- You need full control over CDN and caching
- You handle image transformations separately

Use Cloudinary when:
- You need on-the-fly image transformations (resize, crop, filters)
- You want automatic format optimization (WebP, AVIF)
- You need built-in CDN with better performance
- You want responsive image generation
- You need video processing capabilities

Examples of Cloudinary transformations:
- Resize: `${imageUrl}?w=500&h=500`
- Crop: `${imageUrl}?w=500&h=500&c=fill`
- Quality: `${imageUrl}?q=auto`
- Format: `${imageUrl}?f=auto`
- Multiple: `${imageUrl}?w=500&h=500&c=fill&q=auto&f=auto`
*/
