# AWS CD Pipeline Component Example

Test Project to demonstrate using AWS CDK used for a full application component. 

The idea is to be able to get a new component up and going quickly by duplicating and changing details of the 2 CDK pacakges. So if you want to build a new web component you can get up and running very quickly, but still have best practices of continuous delivery, and infrastructure as code for the contained component. 

The source code contains: 
* Source code `src\aws-cd-pipeline` for a lambda function project in C# .Net Core
* Infrastructure code (CDK package 1) `src\cdk` for the application component definition of above lambd function package, but should also include dependencies (SQS, SNS, API Gateway etc)
* Infrastructure code (CDK package 2) `cdk-pipeline` for the build pipeline for the application component defined in this source code repository


# CDK Pipeline Package (CDK Package 2)

This is intended to be deployed manually as the build pipeline definition and contain resources like: 
* GitHub source code repostoriy location
* AWS Code Build definition
* AWS Code Deploy definition
* AWS Pipeline definition

It can be deployed manually as required if the pipeline needs to be udpated. 

# Application

Once CDK Pipeline package has been deployed, it should then build, test, and deploy the application component as the source code is updated. So if the component needs additional dependent resources, the CDK code is updated, code commited, and the pipline will deploy the udpates. If the application code needs updating, again, code change is commited, and the pipeline will deploy it. 

