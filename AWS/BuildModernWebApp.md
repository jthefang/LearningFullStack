- Following this [tutorial](https://aws.amazon.com/getting-started/hands-on/build-modern-app-fargate-lambda-dynamodb-python/module-one/)

- [Hosting a static website](#hosting-a-static-website)
- [Adding SSL](#adding-ssl)

## Hosting a static website

- Use AWS CLI to create S3 bucket
  - `aws s3 mb s3://[unique-bucket-name]`, e.g. `aws s3 mb s3://my-first-bucket-for-tutorial`
  - `aws s3 website s3://[unique-bucket-name] --index-document index.html`
    - sets it up for static hosting
- Need to update the S3 bucket policy to allow the public to access your website files
  - `aws s3api put-bucket-policy --bucket [unique-bucket-name] --policy file://~/environment/aws-modern-application-workshop/module-1/aws-cli/website-bucket-policy.json`
  - where the `website-bucket-policy.json` is
```json
{
  "Id": "MyPolicy",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::[unique-bucket-name]/*"
    }
  ]
}
```
- `aws s3 cp ~/environment/aws-modern-application-workshop/module-1/web/index.html s3://[unique-bucket-name]/index.html`
  - to copy `index.html` or static files to the S3 bucket to be served
- Now go to `http://[unique-bucket-name].s3-website.us-east-2.amazonaws.com`
  - NOTE that we used `us-east-2` since we are hosting the bucket from the Ohio datacenter

## Adding SSL

- [Link](https://medium.com/@sbuckpesch/setup-aws-s3-static-website-hosting-using-ssl-acm-34d41d32e394)
  - Just don't do email, verify via `DNS validation` in the certificate manager instead
