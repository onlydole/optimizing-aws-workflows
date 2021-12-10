# Optimizing AWS Workflows

> Showcasing how to use the CDK for Terraform to create a VPC, EKS cluster, and use Fargate for compute

## Table of Contents

- [Optimizing AWS Workflows](#optimizing-aws-workflows)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
  - [Setup](#setup)
  - [Workflow](#workflow)
  - [Additional Reading](#additional-reading)
  - [Author Information](#author-information)
  - [License](#license)

## Requirements

To use the code in this repository, you will need the following applications:

- [TypeScript](https://www.typescriptlang.org/download) `4.4.x` (or later)
- [CDK for Terraform](https://learn.hashicorp.com/tutorials/terraform/cdktf-install) `0.8.x` (or later)
- [Terraform Cloud Account](https://www.terraform.io/cloud)
- [AWS CLI](https://aws.amazon.com/cli/) `2.4.x` (or later)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/) (optional)

### Setup

For this example, you will need to ensure that you have all the required dependencies installed, and which are listed above.

Once you have all the dependencies installed, please ensure that you update your Terraform Cloud Remote Backend to match what you have set up in Terraform Cloud.

Also, ensure that you have set up your [AWS credentials in Terraform Cloud](https://www.terraform.io/docs/cloud/workspaces/managing-variables.html) so that it can execute runs on your behalf.

You should set at least the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` variables in Terraform Cloud as "Workspace variables." While I recommend both should be set as "sensitive" values, I encourage you use your best judgement, or consult your security team for more information on how to set up your credentials.

### Workflow

To run this code, please follow all the steps above, including making sure you have set up and configured all dependencies.

1. `cdktf get` - this pulls down all the correct dependencies for your project.
2. `cdktf synth` - this synthesizes and creates the code bindings you need for all of the project's CDK code .
3. `cdktf diff` - this is like `terraform plan` and will show you what is expected to get created during the next step.
4. `cdktf deploy` - this is like `terraform apply` and will create the resources you saw during the previous step.

If you'd like to interact with the EKS cluster you instantiated, you can run this command to get the correct `kubectl` configuration on your machine.

> `aws eks update-kubeconfig --name optimize`

I have included an `application.yaml` file that you can use to deploy to your EKS cluster and test your Fargate workloads and validate the selectors within our CDK for Terraform code.

Once you are done and no longer have a use for the infrastructure, you stood up, you can run `cdktf destroy` to remove the infrastructure you created.

### Additional Reading

- [CDK for Terraform examples and guides](https://www.terraform.io/docs/cdktf/examples.html)
- [CLI Configuration](https://www.terraform.io/docs/cdktf/cli-reference/cli-configuration.html)
- [CLI Commands](https://www.terraform.io/docs/cdktf/cli-reference/commands.html)
- [AWS Fargate](https://aws.amazon.com/fargate/)

## Author Information

This repository is maintained by [Taylor Dolezal](https://github.com/onlydole)

## License

Licensed under the Apache License, Version 2.0 (the "License").

You may obtain a copy of the License at [apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0).

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an _"AS IS"_ basis, without WARRANTIES or conditions of any kind, either express or implied.

See the License for the specific language governing permissions and limitations under the License.
