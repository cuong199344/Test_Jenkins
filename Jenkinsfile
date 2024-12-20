pipeline {
    agent any
    
    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        GIT_CREDENTIALS_ID = 'github-credentials'
        // SONAR_TOKEN = credentials('sonar-token-id')

    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    // Checkout code từ GitHub repository sử dụng Jenkins GitSCM
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: '*/deb']],
                        userRemoteConfigs: [[
                            url: 'https://github.com/cuong199344/Test_Jenkins.git',
                            credentialsId: GIT_CREDENTIALS_ID
                        ]]
                    ])
                }
            }
        }
        
        
        // stage('SonarQube Analysis') {
        //     environment {
        //         scannerHome = tool 'SonarScanner' // Tên SonarScanner trong Global Tool Configuration
        //     }
        //     steps {
        //         withSonarQubeEnv('SonarQube') { // Tên server đã cấu hình
        //             sh """
        //                 ${scannerHome}/bin/sonar-scanner \
        //                 -Dsonar.projectKey=nguyenhung1402jenkins \
        //                 -Dsonar.organization=nguyenhung1402jenkins \
        //                 -Dsonar.sources=. \
        //                 -Dsonar.host.url=https://sonarcloud.io \
        //                 -Dsonar.login=${SONAR_TOKEN}
        //             """
        //         }
        //     }
        // }

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
        
        stage('Deb change'){
            when{
                // branch 'deb';
                branch 'PR-*';
            }
            stages{
                stage('Test company') {
                    when {
                        expression { env.BUILD_SERVICE2 == "true" }
                    }
                    steps {
                        script {
                            def testResult = sh(
                                script: '''
                                    cd company
                                    npm install
                                    npm run test
                                ''', 
                                returnStatus: true
                            )

                            if (testResult == 0) {
                                echo "Tests passed!"
                                env.TEST_COMPANY_RESULT = "PASSED"
                            } else {
                                echo "Tests failed!"
                                env.TEST_COMPANY_RESULT = "FAILED"
                                error("Tests failed, marking build as FAILED.")
                            }
                            
                        }
                    }
                }

                stage('Test user') {
                    when {
                        expression { env.BUILD_SERVICE3 == "true" }
                    }
                    steps {
                        script {
                            def testResult = sh(
                                script: '''
                                    cd user
                                    npm install
                                    npm run test
                                ''', 
                                returnStatus: true 
                            )

                            if (testResult == 0) {
                                echo "Tests passed!"
                                env.TEST_USER_RESULT = "PASSED"
                            } else {
                                echo "Tests failed!"
                                env.TEST_USER_RESULT = "FAILED"
                                error("Tests failed, marking build as FAILED.")
                            }
                        }
                    }
                }

                stage('Build test Docker Image for job') {
                    when {
                        expression { env.BUILD_SERVICE1 == "true" }
                    }
                    steps {
                        script {
                            echo 'Building test Docker Image for job...'
                            sh '''
                                docker build -t nguyenhung1402/job_jenkins_test:${DOCKER_TAG} ./job
                                docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                                docker push nguyenhung1402/job_jenkins_test:${DOCKER_TAG}
                            '''
                            env.BUILD_TEST_SERVICE_1 = "true"
                        }
                    }
                }
        
                stage('Build test Docker Image for company') {
                    when {
                        allOf {
                            expression { env.BUILD_SERVICE2 == "true" };
                            expression { env.TEST_COMPANY_RESULT == "PASSED" }
                        }
                    }
                    steps {
                        script {
                            echo 'Building test Docker Image for company...'
                            sh '''
                                docker build -t nguyenhung1402/company_jenkins_test:${DOCKER_TAG} ./company
                                docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                                docker push nguyenhung1402/company_jenkins_test:${DOCKER_TAG}
                            '''
                            env.BUILD_TEST_SERVICE_2 = "true"
                        }
                    }
                }
                
                stage('Build test Docker Image for user') {
                    when {
                        allOf {
                            expression { env.BUILD_SERVICE3 == "true" };
                            expression { env.TEST_USER_RESULT == "PASSED" }
                        }
                
                    }
                    steps {
                        script {
                            echo 'Building test Docker Image for user...'
                            sh '''
                                docker build -t nguyenhung1402/user_jenkins_test:${DOCKER_TAG} ./user
                                docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                                docker push nguyenhung1402/user_jenkins_test:${DOCKER_TAG}
                            '''
                            env.BUILD_TEST_SERVICE_3 = "true"
                        }
                    }
                }
                stage('Docker-compose'){
                    when{
                        anyOf{
                            expression { env.BUILD_TEST_SERVICE_1 == "true" };
                            expression { env.BUILD_TEST_SERVICE_2 == "true" };
                            expression { env.BUILD_TEST_SERVICE_3 == "true" };
                        }
                    }
                    steps{
                        script{
                            env.JOB = env.BUILD_TEST_SERVICE_1 == "true" ? "job_jenkins_test:${DOCKER_TAG}" : "job_svc:latest"
                            env.COMPANY = env.BUILD_TEST_SERVICE_2 == "true" ? "company_jenkins_test:${DOCKER_TAG}" : "company_svc:latest"
                            env.USER = env.BUILD_TEST_SERVICE_3 == "true" ? "user_jenkins_test:${DOCKER_TAG}" : "user_svc:latest"

                            sh '''
                                JOB_IMAGE=nguyenhung1402/$JOB USER_IMAGE=nguyenhung1402/$USER COMPANY_IMAGE=nguyenhung1402/$COMPANY docker-compose up -d

                                docker ps
                            '''
                            env.READY_FOR_TEST = "true"
                        }
                    }
                }

                stage('Run test with Postman') {
                    when{
                        expression { env.READY_FOR_TEST == "true" }
                    }
                    steps {
                        withCredentials([string(credentialsId: 'POSTMAN_API_KEY', variable: 'POSTMAN_API_KEY')]) {
                            sh 'postman login --with-api-key $POSTMAN_API_KEY'
                        }
                        withCredentials([string(credentialsId: 'Postman_collection_and_environments', variable: 'POSTMAN_COLLECTION_AND_ENVIRONMENTS')]) {
                            sh '''
                                postman collection run $POSTMAN_COLLECTION_AND_ENVIRONMENTS
                            '''
                        }
                        script {
                            env.FINISH_TEST = "true" 
                        }
                    }
                }


                stage('Delete docker-compose'){
                    when{
                        expression { env.FINISH_TEST == "true" };
                    }
                    steps{
                        script{
                            sh '''
                                docker-compose down
                                docker system prune -f

                                docker ps
                            '''
                            env.OK_TO_RUN_MASTER = "true" 
                        }
                    }
                }
                
            }
        }
        stage('Test master'){
            when{
                branch 'master';
            }
            stages{
                stage('Build Docker Image for job') {
                    when {
                        expression { env.BUILD_SERVICE1 == "true" };
                    }
                    steps {
                        script {
                            echo 'Building Docker Image for job...'
                            sh '''
                                docker build -t nguyenhung1402/job_svc:latest ./job
                                docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                                docker push nguyenhung1402/job_svc:latest
                            '''
                        }
                    }
                }
        
                stage('Build Docker Image for company') {
                    when {
                        expression { env.BUILD_SERVICE2 == "true" };
                    }
                    steps {
                        script {
                            echo 'Building Docker Image for company...'
                            sh '''
                                docker build -t nguyenhung1402/company_svc:latest ./company
                                docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                                docker push nguyenhung1402/company_svc:latest
                            '''
                        }
                    }
                }
                
                stage('Build Docker Image for user') {
                    when {
                        expression { env.BUILD_SERVICE3 == "true" };
                    }
                    steps {
                        script {
                            echo 'Building Docker Image for user...'
                            sh '''
                                docker build -t nguyenhung1402/user_svc:latest ./user
                                docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                                docker push nguyenhung1402/user_svc:latest
                            '''
                        }
                    }
                }  
            }
        }

        stage('test k8s') {
            when{
                branch 'master'
            }
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
                            kubectl set image deployment/user-depl user=nguyenhung1402/user_svc:latest -n default
                            kubectl rollout restart deployment/user-depl -n default
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
                            kubectl set image deployment/company-depl  company=nguyenhung1402/company_svc:latest -n default
                            kubectl rollout restart deployment/company-depl -n default
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
                            kubectl set image deployment/job-depl job=nguyenhung1402/job_svc:latest -n default
                            kubectl rollout restart deployment/job-depl -n default
                        '''
                        }
                    }
                }   
            }
        }
    }
    post {
        always {
            sh '''
                docker-compose down
                docker system prune -f
            '''
        }
    }
}