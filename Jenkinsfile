pipeline {
    agent any
    
    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        GIT_CREDENTIALS_ID = 'github-credentials'
        // SONAR_TOKEN = credentials('sonar-token-id')
    }

    stages {
        stage('Push test') {
            when {
                branches "deb"
            }
            stages{
                stage('Checkout'){
                steps {
                    script {
                        // Checkout code từ GitHub repository sử dụng Jenkins GitSCM
                        checkout([
                            $class: 'GitSCM',
                            branches: [[name: '*/master']],
                            userRemoteConfigs: [[
                                url: 'https://github.com/cuong199344/Test_Jenkins.git',
                                credentialsId: GIT_CREDENTIALS_ID
                            ]]
                        ])
                    }
                }
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
        stage('Run Tests Company') {
            when {
                    expression { env.BUILD_SERVICE2 == "true" }
                }
            steps {

                script {
                    // Chạy lệnh test
                    def testResult = sh(
                        script: '''
                            cd company
                            npm ci
                            npm run test
                        ''', 
                        returnStatus: true // Trả về mã thoát của lệnh
                    )

                    // Kiểm tra kết quả và thiết lập biến môi trường
                    if (testResult == 0) {
                        echo "Tests passed!"
                        env.TEST_COMPANY_RESULT = "PASSED"
                    } else {
                        echo "Tests failed!"
                        env.TEST_COMPANY_RESULT = "FAILED"
                    }
                }
            }
        }
        stage('Post Results') {
            when {
                    allOf {
                        expression { env.BUILD_SERVICE2 == "true" };
                        expression { env.TEST_COMPANY_RESULT == "PASSED" }
                    }
                }
            steps {
                script {
                    // Log kết quả test
                    echo "Test result: ${env.TEST_COMPANY_RESULT}"

                    // Lưu vào file nếu cần thiết
                    writeFile file: 'test_result.txt', text: "Test result: ${env.TEST_COMPANY_RESULT}"
                }
            }
        }
        
        stage('Build Docker Image for company') {
            when {
                expression { env.TEST_COMPANY_RESULT == "PASSED"}
            }
            steps {
                script {
                    echo 'Building Docker Image for company...'
                    sh '''
                        docker build -t dangxuancuong/company_jenkins:${DOCKER_TAG} ./company
                        docker login -u $DOCKER_HUB_CREDENTIALS_USR -p $DOCKER_HUB_CREDENTIALS_PSW
                        docker push dangxuancuong/company_jenkins:${DOCKER_TAG}
                    '''
                }
            }
        }

    }
}
