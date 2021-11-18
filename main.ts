import { Construct } from "constructs";
import { App, RemoteBackend, TerraformStack, Token } from "cdktf";
import { AwsProvider } from "./.gen/providers/aws";
import { Vpc } from "./.gen/modules/terraform-aws-modules/aws/vpc";
import { Eks } from "./.gen/modules/terraform-aws-modules/aws/eks";
class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const projectName = "optimize"; //TODO: Use Terraform vars
    const cidr = "10.0.0.0/16"; //TODO: Use Terraform vars

    // Terraform Cloud Remote Backend
    new RemoteBackend(this, {
      hostname: "app.terraform.io",
      organization: "onlydole",
      workspaces: {
        name: "optimizing-aws-workflows",
      },
    });

    // AWS Provider Configuration
    new AwsProvider(this, "aws", {
      region: "us-west-2",
    });

    // Create a VPC with three public subnets and three private subnets
    const vpc = new Vpc(this, "vpc", {
      name: projectName,
      cidr: cidr,
      azs: ["us-west-2a", "us-west-2b", "us-west-2c"], //TODO: update to use data source
      privateSubnets: ['10.0.1.0/24', '10.0.2.0/24', '10.0.3.0/24'], //TODO: update to use locals
      publicSubnets: ['10.0.101.0/24', '10.0.102.0/24', '10.0.103.0/24'], //TODO: update to use locals
      publicSubnetTags: {
        "kubernetes.io/role/elb": "1",
        "kubernetes.io/cluster/optimize": "shared", //TODO: update to use variable
      },
      privateSubnetTags: {
        "kubernetes.io/role/internal-elb": "1",
        "kubernetes.io/cluster/optimize": "shared", //TODO: update to use variable
      },
      enableDnsHostnames: true,
      enableNatGateway: true,
    });

    new Eks(this, "eks", {
      clusterName: projectName,
      clusterVersion: "1.21",
      subnets: Token.asList(vpc.publicSubnetsOutput),
      vpcId: vpc.vpcIdOutput,
      writeKubeconfig: false,
      manageAwsAuth: false,
      workerGroups: [
        {
          asg_desired_capacity: 3,
          asg_max_size: 5,
          instance_type: "m5.large",
        }
      ],
    });

  } // end MyStack
} // end Class

const app = new App();
new MyStack(app, "optimizing-aws-workflows");
app.synth();