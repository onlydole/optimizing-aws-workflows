import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { AwsProvider } from "./.gen/providers/aws";
import { Vpc } from "./.gen/modules/terraform-aws-modules/aws/vpc";

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const projectName = "optimize";
    const cidr = "10.0.0.0/16";


    // define resources here
    new AwsProvider(this, "aws", {
      region: "us-west-2",
    });

    new Vpc(this, "vpc", {
      name: projectName,
      cidr: cidr,
      azs: ["us-west-2a", "us-west-2b", "us-west-2c"], //TODO: update to use data source
      privateSubnets: ['10.0.1.0/24', '10.0.2.0/24', '10.0.3.0/24'], //TODO: update to use locals
      publicSubnets: ['10.0.101.0/24', '10.0.102.0/24', '10.0.103.0/24'], //TODO: update to use locals
      publicSubnetTags: {
          "kubernetes.io/role/elb":"1",
          "kubernetes.io/cluster/optimize":"shared", //TODO: update to use variable
      },
      privateSubnetTags: {
        "kubernetes.io/role/internal-elb":"1",
        "kubernetes.io/cluster/optimize":"shared", //TODO: update to use variable
      },
      enableDnsHostnames: true,
      enableNatGateway: true,
    });
  }
}

const app = new App();
new MyStack(app, "optimizing-aws-workflows");
app.synth();
