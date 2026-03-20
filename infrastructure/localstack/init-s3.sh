#!/bin/bash
# Creates the S3 bucket used for prescription PDFs in local development
awslocal s3 mb s3://preventia-prescriptions --region ap-south-1
awslocal s3api put-bucket-lifecycle-configuration \
  --bucket preventia-prescriptions \
  --lifecycle-configuration file:///etc/localstack/init/ready.d/lifecycle.json
echo "LocalStack S3 bucket 'preventia-prescriptions' ready."
