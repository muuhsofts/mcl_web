pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USERNAME = 'mudhihirdocker'
        DOCKER_HUB_TOKEN = credentials('docker-hub-token')
        DOCKER_IMAGE = 'mudhihirdocker/mcl-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
        KUBE_NAMESPACE = 'mcl-app'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_IMAGE}:latest ."
                }
            }
        }
        
        stage('Push') {
            steps {
                script {
                    sh """
                        echo ${DOCKER_HUB_TOKEN} | docker login -u ${DOCKER_HUB_USERNAME} --password-stdin
                        docker push ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
    }
}
