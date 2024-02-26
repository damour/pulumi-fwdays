import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";

const stack = pulumi.getStack();

const stackRef = new pulumi.StackReference(`organization/base/${stack}`)

const k8sProvider = new k8s.Provider("k8s", {
    kubeconfig: stackRef.getOutput("k8sConfig"),
});

const myNamespace = new k8s.core.v1.Namespace("my-namespace", {
    metadata: { name: "my-namespace" },
}, { provider: k8sProvider });
