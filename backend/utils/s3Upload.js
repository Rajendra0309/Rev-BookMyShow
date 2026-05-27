const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Initialize the S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

/**
 * Uploads a file buffer to Amazon S3.
 * @param {Buffer} fileBuffer - The file content in memory.
 * @param {string} originalFilename - Name of the selected file.
 * @param {string} mimeType - File MIME type (e.g. image/jpeg).
 * @returns {Promise<string>} The public S3 URL of the uploaded image.
 */
const uploadToS3 = async (fileBuffer, originalFilename, mimeType) => {
    const { AWS_BUCKET_NAME, AWS_REGION } = process.env;

    if (!AWS_BUCKET_NAME) {
        throw new Error('AWS S3 bucket name is not configured in the environment variables.');
    }

    // Generate unique name: posters/<timestamp>-<random>.<extension>
    const extension = originalFilename.split('.').pop() || 'jpg';
    const uniqueKey = `posters/${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`;

    const uploadParams = {
        Bucket: AWS_BUCKET_NAME,
        Key: uniqueKey,
        Body: fileBuffer,
        ContentType: mimeType
    };

    // Standard upload (relying on Bucket Policy for public access)
    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Return the absolute public access URL
    return `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${uniqueKey}`;
};

module.exports = { uploadToS3 };
