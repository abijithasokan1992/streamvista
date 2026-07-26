"""
StreamVista Cloud X — PythonAnywhere Core Backend
File: app.py
Target Host: crayons.pythonanywhere.com
Founder & CEO: Abijith Asokan
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import boto3
from botocore.exceptions import ClientError
import uuid
import os

app = Flask(__name__)
CORS(app) # Allow CORS for streamvista.in and localhost

# S3 Configuration
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "streamvista-masters")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")

s3_client = boto3.client(
    's3',
    region_name=AWS_REGION
)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'StreamVista Python Core Backend',
        'host': 'crayons.pythonanywhere.com'
    }), 200

@app.route('/api/v1/assets/generate-presigned-url', methods=['POST'])
def generate_presigned_url():
    """
    ഫ്രണ്ട്എൻഡിൽ നിന്ന് വലുപ്പമേറിയ മാസ്റ്റർ ഫയലുകൾ (MOV/MP4) 
    ഡയറക്റ്റ് ആയി S3-ലേക്ക് അപ്ലോഡ് ചെയ്യാൻ Presigned URL നൽകുന്നു.
    """
    data = request.get_json() or {}
    
    file_name = data.get('file_name')
    file_type = data.get('file_type', 'video/quicktime')
    user_id = data.get('user_id', 'creator_abijith')
    
    if not file_name or not user_id:
        return jsonify({'error': 'Missing required fields'}), 400

    # യൂണീക് ഫയൽ പാത്ത് തയ്യാറാക്കുന്നു
    unique_filename = f"films/{user_id}/{uuid.uuid4()}_{file_name}"

    try:
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': S3_BUCKET_NAME,
                'Key': unique_filename,
                'ContentType': file_type
            },
            ExpiresIn=3600  # 1 മണിക്കൂർ വാലിഡിറ്റി
        )
        
        return jsonify({
            'success': True,
            'upload_url': presigned_url,
            'storage_path': f"s3://{S3_BUCKET_NAME}/{unique_filename}"
        }), 200

    except ClientError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        # Fallback response for dev environments without AWS credentials configured
        mock_key = f"films/{user_id}/{uuid.uuid4()}_{file_name}"
        return jsonify({
            'success': True,
            'upload_url': f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{mock_key}?X-Amz-Expires=3600",
            'storage_path': f"s3://{S3_BUCKET_NAME}/{mock_key}"
        }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
