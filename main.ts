import { Construct } from "constructs";
import { App, Fn, RemoteBackend, TerraformStack, Token } from "cdktf";
import { AwsProvider, EKS } from "./.gen/providers/aws";
import { KubernetesProvider } from "./.gen/providers/kubernetes";
import { Vpc } from "./.gen/modules/terraform-aws-modules/aws/vpc";
import { Eks } from "./.gen/modules/terraform-aws-modules/aws/eks";
class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    const projectName = "optimize";
    const cidr = "10.0.0.0/16";

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
      azs: ["us-west-2a", "us-west-2b", "us-west-2c"],
      privateSubnets: ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"],
      publicSubnets: ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"],
      publicSubnetTags: {
        "kubernetes.io/role/elb": "1",
        "kubernetes.io/cluster/optimize": "shared",
      },
      privateSubnetTags: {
        "kubernetes.io/role/internal-elb": "1",
        "kubernetes.io/cluster/optimize": "shared",
      },
      enableDnsHostnames: true,
      enableNatGateway: true,
    });

    const eksCluster = new Eks(this, "eks", {
      clusterName: projectName,
      clusterVersion: "1.21",
      subnets: Token.asList(vpc.publicSubnetsOutput),
      vpcId: vpc.vpcIdOutput,
      writeKubeconfig: false,
      workerGroups: [
        {
          asg_desired_capacity: 3,
          asg_max_size: 5,
          instance_type: "m5.large",
        },
      ],
      fargateProfiles: [
        {
          name: "greenfield",
          subnets: Token.asList(vpc.privateSubnetsOutput),
          selectors: [
            {
              namespace: "kube-system",
              labels: {
                "k8s-app": "kube-dns",
              },
            },
            {
              namespace: "default",
              labels: {
                "WorkerType": "fargate",
              },
            },
          ],
        },
      ],
    });

    // Kubernetes Provider Configuration
    new KubernetesProvider(this, "kubernetes", {
      host: eksCluster.clusterEndpointOutput,
      clusterCaCertificate: Fn.base64decode(
        new EKS.DataAwsEksCluster(this, "eksCaCert", {
          name: projectName,
        }).certificateAuthority("0").data
      ),
      token: Token.asString(
        new EKS.DataAwsEksClusterAuth(this, "eksAuth", {
          name: projectName,
        }).token
      ),
    });
  } // end MyStack
} // end Class

const app = new App();
new MyStack(app, "optimizing-aws-workflows");
app.synth();
