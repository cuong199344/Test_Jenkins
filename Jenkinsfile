pipeline {
    agent any
    
    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        GIT_CREDENTIALS_ID = 'github-credentials'
        SONAR_TOKEN = credentials('sonar-token-id')
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    // Checkout code từ GitHub repository sử dụng Jenkins GitSCM
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/master']],
                        userRemoteConfigs: [[
                            url: 'https://github.com/nguyenhung1402/repo_dev.git',
                            credentialsId: GIT_CREDENTIALS_ID
                        ]]
                    ])
                }
            }
        }
        
        stage('SonarQube Analysis') {
            environment {
                scannerHome = tool 'SonarScanner' // Tên SonarScanner trong Global Tool Configuration
            }
            steps {
                withSonarQubeEnv('SonarQube') { // Tên server đã cấu hình
                    sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=nguyenhung1402jenkins \
                        -Dsonar.organization=nguyenhung1402jenkins \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=https://sonarcloud.io \
                        -Dsonar.login=${SONAR_TOKEN}
                    """
                }
            }
        }

        stage('Generate Docker Tag') {
            steps {
                script {
                    // Sử dụng commit hash và timestamp để tạo Docker tag
                    def commitHash = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    def timestamp = sh(script: 'date +%Y%m%d%H%M%S', returnStdout: true).trim()
                    env.DOCKER_TAG = "${commitHash}-${timestamp}"
                    echo "Generated Docker Tag: ${env.DOCKER_TAG}"
                }
            }
        }

        stage('Determine Changed Folder') {
            steps {
                script {
                    // Lấy danh sách các file đã thay đổi
                    def changedFiles = sh(script: 'git diff --name-only HEAD~1 HEAD', returnStdout: true).trim().split('\n')

                    // Xác định thư mục nào đã thay đổi
                    def buildService1 = changedFiles.any { it.startsWith('job/') }
                    def buildService2 = changedFiles.any { it.startsWith('company/') }
                    def buildService3 = changedFiles.any { it.startsWith('user/') }

                    env.BUILD_SERVICE1 = buildService1 ? "true" : "false"
                    env.BUILD_SERVICE2 = buildService2 ? "true" : "false"
                    env.BUILD_SERVICE3 = buildService3 ? "true" : "false"
                }
            }
        }
        
        stage('Build Docker Image for job') {
            when {
                expression { env.BUILD_SERVICE1 == "true" }
            }
            steps {
                script {
                    echo 'Building Docker Image for job...'
                    sh '''
                        docker build -t nguyenhung1402/job_jenkins:${DOCKER_TAG} ./job
                        docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                        docker push nguyenhung1402/job_jenkins:${DOCKER_TAG}
                    '''
                }
            }
        }
        
        stage('Build Docker Image for company') {
            when {
                expression { env.BUILD_SERVICE2 == "true" }
            }
            steps {
                script {
                    echo 'Building Docker Image for company...'
                    sh '''
                        docker build -t nguyenhung1402/company_jenkins:${DOCKER_TAG} ./company
                        docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                        docker push nguyenhung1402/company_jenkins:${DOCKER_TAG}
                    '''
                }
            }
        }
        
        stage('Build Docker Image for user') {
            when {
                expression { env.BUILD_SERVICE3 == "true" }
            }
            steps {
                script {
                    echo 'Building Docker Image for user...'
                    sh '''
                        docker build -t nguyenhung1402/user_jenkins:${DOCKER_TAG} ./user
                        docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                        docker push nguyenhung1402/user_jenkins:${DOCKER_TAG}
                    '''
                }
            }
        }

        stage('test k8s') {
           agent {
                kubernetes {
      yaml '''
        apiVersion: v1
        kind: Pod
        spec:
          containers:
          - name: k8s
            image: busybox
            command:
            - sh
            - -c
            - |
              mkdir -p /usr/local/bin && \
              wget --no-check-certificate -q -O /usr/local/bin/kubectl https://dl.k8s.io/release/$(wget --no-check-certificate -q -O - https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl && \
              chmod +x /usr/local/bin/kubectl && \
              sleep infinity
            tty: true
          restartPolicy: Never
      '''
    }
            }
            stages {
                stage('Verify kubectl') {
                steps {
                    container('k8s') {
                    sh 'kubectl get deployments -n default'
                    }
                }
                }
                stage('deploy user'){
                    when {
                    expression { env.BUILD_SERVICE3 == "true" }
                    }
                    steps {
                        container('k8s') {
                        sh '''
                            kubectl set image deployment/user-depl user=nguyenhung1402/user_jenkins:${DOCKER_TAG} -n default
                            
                        '''
                        }
                    }
                }
                stage('deploy company'){
                    when {
                    expression { env.BUILD_SERVICE2 == "true" }
                    }
                    steps {
                        container('k8s') {
                        sh '''
                            kubectl set image deployment/company-depl  company=nguyenhung1402/company_jenkins:${DOCKER_TAG} -n default
                            
                        '''
                        }
                    }
                }
                stage('deploy job'){
                    when {
                    expression { env.BUILD_SERVICE1 == "true" }
                    }
                    steps {
                        container('k8s') {
                        sh '''
                            kubectl set image deployment/job-depl job=nguyenhung1402/job_jenkins:${DOCKER_TAG} -n default
                            
                        '''
                        }
                    }
                }
                
                
            }
        }
    }
}
