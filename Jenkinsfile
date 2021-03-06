#!groovy
def tryStep(String message, Closure block, Closure tearDown = null) {
    try {
        block()
    }
    catch (Throwable t) {
        slackSend message: "${env.JOB_NAME}: ${message} failure ${env.BUILD_URL}", channel: '#ci-channel', color: 'danger'
        throw t
    }
    finally {
        if (tearDown) {
            tearDown()
        }
    }
}
String BRANCH = "${env.BRANCH_NAME}"
node('BS16') {
    stage("Checkout") {
        def scmVars = checkout(scm)
        env.GIT_COMMIT = scmVars.GIT_COMMIT
        env.COMPOSE_DOCKER_CLI_BUILD = 1 
    }
    stage("Get cached build") {
        docker.withRegistry('https://repo.data.amsterdam.nl','docker-registry') {
            docker.image("ois/signalsfrontend-base:acceptance").pull()
        }
    }
    stage("Lint") {
        String PROJECT = "sia-eslint-${env.BUILD_TAG}"
        tryStep "lint start", {
            sh "docker-compose -p ${PROJECT} up --build --exit-code-from lint-container lint-container"
        }, {
            sh "docker-compose -p ${PROJECT} down -v || true"
        }
    }
    stage("Test") {
        String PROJECT = "sia-unittests-${env.BUILD_TAG}"
        tryStep "unittests start", {
            sh "docker-compose -p ${PROJECT} up --build --exit-code-from unittest-container unittest-container"
        }, {
            sh "docker-compose -p ${PROJECT} down -v || true"
        }
    }
    if (BRANCH == "develop") {
        stage("Build and push the base image to speed up lint and unittest builds") {
            tryStep "build", {
                def image_name = "ois/signalsfrontend-base"
                docker.withRegistry('https://repo.data.amsterdam.nl','docker-registry') {
                    def image = docker.build("${image_name}:${env.BUILD_NUMBER}",
                    "--shm-size 1G " +
                    "--target base " +
                    ".")
                    image.push()
                    image.push("acceptance")
                }
            }
        }
        stage("Build and push acceptance image") {
            tryStep "build", {
                docker.withRegistry('https://repo.data.amsterdam.nl','docker-registry') {
                    def cachedImage = docker.image("ois/signalsfrontend:acceptance")
                    cachedImage.pull()
                    def image = docker.build("ois/signalsfrontend:${env.BUILD_NUMBER}",
                    "--shm-size 1G " +
                    "--build-arg BUILD_ENV=acc " +
                    "--build-arg BUILD_NUMBER=${env.BUILD_NUMBER} " +
                    "--build-arg GIT_COMMIT=${env.GIT_COMMIT} " +
                    ".")
                    image.push()
                    image.push("acceptance")
                }
            }
        }
        stage("Deploy to ACC") {
            tryStep "deployment", {
                build job: 'Subtask_Openstack_Playbook',
                parameters: [
                    [$class: 'StringParameterValue', name: 'INVENTORY', value: 'acceptance'],
                    [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-signals-frontend.yml'],
                ]
            }
        }
    }
    if (BRANCH == "master") {
        stage("Build and Push Production image") {
            tryStep "build", {
                docker.withRegistry('https://repo.data.amsterdam.nl','docker-registry') {
                    def cachedImage = docker.image("ois/signalsfrontend:production")
                    cachedImage.pull()
                    def image = docker.build("ois/signalsfrontend:${env.BUILD_NUMBER}",
                        "--shm-size 1G " +
                        "--build-arg BUILD_ENV=prod " +
                        "--build-arg BUILD_NUMBER=${env.BUILD_NUMBER} " +
                        "--build-arg GIT_COMMIT=${env.GIT_COMMIT} " +
                        ".")
                    image.push("production")
                    image.push("latest")
                }
            }
        }
        stage("Deploy to PROD") {
            tryStep "deployment", {
                build job: 'Subtask_Openstack_Playbook',
                parameters: [
                    [$class: 'StringParameterValue', name: 'INVENTORY', value: 'production'],
                    [$class: 'StringParameterValue', name: 'PLAYBOOK', value: 'deploy-signals-frontend.yml'],
                ]
            }
        }
    }
}
