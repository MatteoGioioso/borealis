package k8sutil

import (
	"fmt"
	clientbatchv1beta1 "k8s.io/client-go/kubernetes/typed/batch/v1beta1"

	apiextclient "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset"
	apiextv1 "k8s.io/apiextensions-apiserver/pkg/client/clientset/clientset/typed/apiextensions/v1"
	"k8s.io/client-go/kubernetes"
	appsv1 "k8s.io/client-go/kubernetes/typed/apps/v1"
	corev1 "k8s.io/client-go/kubernetes/typed/core/v1"
	policyv1beta1 "k8s.io/client-go/kubernetes/typed/policy/v1beta1"
	rbacv1 "k8s.io/client-go/kubernetes/typed/rbac/v1"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	metrics "k8s.io/metrics/pkg/client/clientset/versioned"
	v1beta1metrics "k8s.io/metrics/pkg/client/clientset/versioned/typed/metrics/v1beta1"
)

func Int32ToPointer(value int32) *int32 {
	return &value
}

// KubernetesClient describes getters for Kubernetes objects
type KubernetesClient struct {
	corev1.SecretsGetter
	corev1.ServicesGetter
	corev1.EndpointsGetter
	corev1.PodsGetter
	corev1.PersistentVolumesGetter
	corev1.PersistentVolumeClaimsGetter
	corev1.ConfigMapsGetter
	corev1.NodesGetter
	corev1.NamespacesGetter
	corev1.ServiceAccountsGetter
	corev1.EventsGetter
	appsv1.StatefulSetsGetter
	appsv1.DeploymentsGetter
	rbacv1.RoleBindingsGetter
	policyv1beta1.PodDisruptionBudgetsGetter
	apiextv1.CustomResourceDefinitionsGetter
	clientbatchv1beta1.CronJobsGetter
	v1beta1metrics.PodMetricsesGetter
	v1beta1metrics.NodeMetricsesGetter

	RESTClient rest.Interface
}

func InitializeKubeClient() (KubernetesClient, error) {
	restConfig, err := RestConfig("", false)
	if err != nil {
		return KubernetesClient{}, fmt.Errorf("could not create rest config for kube client: %v", err)
	}

	kubeClient, err := NewFromConfig(restConfig)
	if err != nil {
		return KubernetesClient{}, fmt.Errorf("could not create kube client: %v", err)
	}

	return kubeClient, nil
}

// RestConfig creates REST config
func RestConfig(kubeConfig string, outOfCluster bool) (*rest.Config, error) {
	if outOfCluster {
		return clientcmd.BuildConfigFromFlags("", kubeConfig)
	}

	return rest.InClusterConfig()
}

// NewFromConfig create Kubernetes Interface using REST config
func NewFromConfig(cfg *rest.Config) (KubernetesClient, error) {
	kubeClient := KubernetesClient{}

	client, err := kubernetes.NewForConfig(cfg)
	if err != nil {
		return kubeClient, fmt.Errorf("could not get clientset: %v", err)
	}

	metricsClient, err := metrics.NewForConfig(cfg)
	if err != nil {
		return kubeClient, fmt.Errorf("could not get metricsClient: %v", err)
	}

	kubeClient.PodsGetter = client.CoreV1()
	kubeClient.ServicesGetter = client.CoreV1()
	kubeClient.EndpointsGetter = client.CoreV1()
	kubeClient.SecretsGetter = client.CoreV1()
	kubeClient.ServiceAccountsGetter = client.CoreV1()
	kubeClient.ConfigMapsGetter = client.CoreV1()
	kubeClient.PersistentVolumeClaimsGetter = client.CoreV1()
	kubeClient.PersistentVolumesGetter = client.CoreV1()
	kubeClient.NodesGetter = client.CoreV1()
	kubeClient.NamespacesGetter = client.CoreV1()
	kubeClient.StatefulSetsGetter = client.AppsV1()
	kubeClient.DeploymentsGetter = client.AppsV1()
	kubeClient.PodDisruptionBudgetsGetter = client.PolicyV1beta1()
	kubeClient.RESTClient = client.CoreV1().RESTClient()
	kubeClient.RoleBindingsGetter = client.RbacV1()
	kubeClient.CronJobsGetter = client.BatchV1beta1()
	kubeClient.EventsGetter = client.CoreV1()
	kubeClient.PodMetricsesGetter = metricsClient.MetricsV1beta1()
	kubeClient.NodeMetricsesGetter = metricsClient.MetricsV1beta1()

	apiextClient, err := apiextclient.NewForConfig(cfg)
	if err != nil {
		return kubeClient, fmt.Errorf("could not create api client:%v", err)
	}

	kubeClient.CustomResourceDefinitionsGetter = apiextClient.ApiextensionsV1()

	return kubeClient, nil
}
