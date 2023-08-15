pipeline{
    agent {
      node {
        label 'nodejs'
      }
    }
    environment {
         //Docker凭证ID
         DOCKER_CREDENTIAL_ID = 'huaweidocker'
         //Docker仓库地址
         DOCKER_REGISTRY = 'swr.ap-southeast-1.myhuaweicloud.com'
         //Docker仓库命名空间
         DOCKER_NAMESPACE = 'gh'
         APP_NAME = 'datawarehouse'
         // 部署代码yaml dev
        //  CODE_TO_DEV = ' datawarehouse/dev'
         // 部署代码yaml test
         CODE_TO_TEST = 'datawarehouse/test'
         // 部署代码yaml uat
        //  CODE_TO_UAT = 'datawarehouse/uat'
         // 部署代码yaml master
         CODE_TO_MASTER = 'datawarehouse/master'
    }
  
    //构建阶段
    stages {
  
      //生成镜像版本
      stage('get tag') {
          steps {
            container ('nodejs') {
            sh 'git rev-parse HEAD > tag_name.txt && cat tag_name.txt && tag_name=`cat tag_name.txt`'
                }
              }
      }
      stage('check code tag or download') {
          steps {
            container ('nodejs') {
               sh 'ls -la && pwd'
            }
          }
      }
  
      //构建Docker镜像并推送到远程Docker仓库
//       stage('Build images && Push Hw imgaed center Dev') {
//          when {
//            branch 'dev'
//          }
//           steps {
//             container ('nodejs') {
//                   sh 'ls -la'
//                   sh 'cat tag_name.txt'
//                //构建docker镜像
//                   sh 'docker build -t $DOCKER_REGISTRY/$DOCKER_NAMESPACE/$APP_NAME-dev:`cat tag_name.txt` -f apps/insight/DockerFile .'
//                //登录Docker并推送镜像到远程Docker仓库
//                   withCredentials([usernamePassword(passwordVariable : 'DOCKER_PASSWORD' ,usernameVariable : 'DOCKER_USERNAME' ,credentialsId : "$DOCKER_CREDENTIAL_ID" ,)]) {
//                   sh 'echo "$DOCKER_PASSWORD" | docker login $DOCKER_REGISTRY -u "$DOCKER_USERNAME" --password-stdin'
//                   sh 'docker push $DOCKER_REGISTRY/$DOCKER_NAMESPACE/$APP_NAME-dev:`cat tag_name.txt`'
//                }
//             }
          
//       }
             
//   }
      stage('Build images && Push Hw imgaed center Test') {
         when {
           branch 'test'
         }
          steps {
            container ('nodejs') {
                  sh 'ls -la'
                  sh 'cat tag_name.txt'
               //构建docker镜像
                  sh 'docker build -t $DOCKER_REGISTRY/$DOCKER_NAMESPACE/$APP_NAME-test:`cat tag_name.txt` -f apps/insight/DockerFile .'
               //登录Docker并推送镜像到远程Docker仓库
                  withCredentials([usernamePassword(passwordVariable : 'DOCKER_PASSWORD' ,usernameVariable : 'DOCKER_USERNAME' ,credentialsId : "$DOCKER_CREDENTIAL_ID" ,)]) {
                  sh 'echo "$DOCKER_PASSWORD" | docker login $DOCKER_REGISTRY -u "$DOCKER_USERNAME" --password-stdin'
                  sh 'docker push $DOCKER_REGISTRY/$DOCKER_NAMESPACE/$APP_NAME-test:`cat tag_name.txt`'
               }
            }
          
      }
             
  }

       stage('Build images && Push Hw imgaed center master') {
         when {
           branch 'master'
         }
          steps {
            container ('nodejs') {
                  sh 'ls -la'
                  sh 'cat tag_name.txt'
               //构建docker镜像
                  sh 'docker build -t $DOCKER_REGISTRY/$DOCKER_NAMESPACE/$APP_NAME-prod:`cat tag_name.txt` -f apps/insight/DockerFile .'
               //登录Docker并推送镜像到远程Docker仓库
                  withCredentials([usernamePassword(passwordVariable : 'DOCKER_PASSWORD' ,usernameVariable : 'DOCKER_USERNAME' ,credentialsId : "$DOCKER_CREDENTIAL_ID" ,)]) {
                  sh 'echo "$DOCKER_PASSWORD" | docker login $DOCKER_REGISTRY -u "$DOCKER_USERNAME" --password-stdin'
                  sh 'docker push $DOCKER_REGISTRY/$DOCKER_NAMESPACE/$APP_NAME-prod:`cat tag_name.txt`'
               }
            }
          
      }
             
  }

//       stage('Build images && Push Hw imgaed center Uat') {
//          when {
//            branch 'test'
//          }
//           steps {
//             container ('nodejs') {
//                   sh 'ls -la'
//                   sh 'cat tag_name.txt'
//                //构建docker镜像
//                   sh 'docker build -t $DOCKER_REGISTRY/$DOCKER_NAMESPACE/$APP_NAME-uat:`cat tag_name.txt` -f apps/insight/DockerFile .'
//                //登录Docker并推送镜像到远程Docker仓库
//                   withCredentials([usernamePassword(passwordVariable : 'DOCKER_PASSWORD' ,usernameVariable : 'DOCKER_USERNAME' ,credentialsId : "$DOCKER_CREDENTIAL_ID" ,)]) {
//                   sh 'echo "$DOCKER_PASSWORD" | docker login $DOCKER_REGISTRY -u "$DOCKER_USERNAME" --password-stdin'
//                   sh 'docker push $DOCKER_REGISTRY/$DOCKER_NAMESPACE/$APP_NAME-uat:`cat tag_name.txt`'
//                }
//             }
          
//       }
             
//   }
 //     stage('审核') {
    
//          steps {
//            container('nodejs') {
//                input(message: '@admin', submitter: 'admin')
//                  }

//               }
 //           }
      // K8S部署
    //   stage('Deploy to Dev') {
    //      when {
    //        branch 'dev'
    //      }
    //       steps {
    //         container ('nodejs') {
    //             git(url: 'https://gitlab.diancun.net/cryptomint.space/code-depoly.git', credentialsId: 'gitlab-ce', branch: 'master', changelog: true, poll: false)
    //             sh 'ls -la'
    //             sh 'cat tag_name.txt'
    //             withCredentials([kubeconfigContent(credentialsId : 'demo-kubeconfig' ,variable : 'KUBECONFIG_CONTENT' ,)]) {
    //             sh '''ls -la
    //             tag_name=`cat tag_name.txt`
    //             mkdir ~/.kube
    //             echo "$KUBECONFIG_CONTENT" > ~/.kube/config
    //             sed -i "s/lasssetest:tag_names/$APP_NAME-dev:`cat tag_name.txt`/g" $CODE_TO_DEV/deployment.yaml  
    //             envsubst < $CODE_TO_DEV/deployment.yaml | kubectl apply -f -        
    //             envsubst < $CODE_TO_DEV/service.yaml | kubectl apply -f -'''
    //                               }
    //                        }
    //                 }
    //         }
      stage('Deploy to TEST') {
         when {
           branch 'test'
         }
          steps {
            container ('nodejs') {
                git(url: 'https://gitlab.diancun.net/cryptomint.space/code-depoly.git', credentialsId: 'gitlab-ce', branch: 'master', changelog: true, poll: false)
                sh 'ls -la'
                sh 'cat tag_name.txt'
                withCredentials([kubeconfigContent(credentialsId : 'demo-kubeconfig' ,variable : 'KUBECONFIG_CONTENT' ,)]) {
                sh '''ls -la
                tag_name=`cat tag_name.txt`
                mkdir ~/.kube
                echo "$KUBECONFIG_CONTENT" > ~/.kube/config
                sed -i "s/lasssetest:tag_names/$APP_NAME-test:`cat tag_name.txt`/g" $CODE_TO_TEST/deployment.yaml  
                envsubst < $CODE_TO_TEST/deployment.yaml | kubectl apply -f -'''
                                  }
                           }
                    }
            }
        stage('Deploy to MASTER') {
         when {
           branch 'master'
         }
          steps {
            container ('nodejs') {
                git(url: 'https://gitlab.diancun.net/cryptomint.space/code-depoly.git', credentialsId: 'gitlab-ce', branch: 'master', changelog: true, poll: false)
                sh 'ls -la'
                sh 'cat tag_name.txt'
                withCredentials([kubeconfigContent(credentialsId : 'demo-kubeconfig' ,variable : 'KUBECONFIG_CONTENT' ,)]) {
                sh '''ls -la
                tag_name=`cat tag_name.txt`
                mkdir ~/.kube
                echo "$KUBECONFIG_CONTENT" > ~/.kube/config
                sed -i "s/lasssetest:tag_names/$APP_NAME-prod:`cat tag_name.txt`/g" $CODE_TO_MASTER/deployment.yaml  
                envsubst < $CODE_TO_MASTER/deployment.yaml | kubectl apply -f -'''
                                  }
                           }
                    }
            }
    //   stage('Deploy to UAT') {
    //      when {
    //        branch 'uat'
    //      }
    //       steps {
    //         container ('nodejs') {
    //             git(url: 'https://gitlab.diancun.net/cryptomint.space/code-depoly.git', credentialsId: 'gitlab-ce', branch: 'master', changelog: true, poll: false)
    //             sh 'ls -la'
    //             sh 'cat tag_name.txt'
    //             withCredentials([kubeconfigContent(credentialsId : 'demo-kubeconfig' ,variable : 'KUBECONFIG_CONTENT' ,)]) {
    //             sh '''ls -la
    //             tag_name=`cat tag_name.txt`
    //             mkdir ~/.kube
    //             echo "$KUBECONFIG_CONTENT" > ~/.kube/config
    //             sed -i "s/lasssetest:tag_names/$APP_NAME-uat:`cat tag_name.txt`/g" $CODE_TO_UAT/deployment.yaml  
    //             envsubst < $CODE_TO_UAT/deployment.yaml | kubectl apply -f -        
    //             envsubst < $CODE_TO_UAT/service.yaml | kubectl apply -f -'''
    //                               }
    //                        }
    //                 }
    //         }
//       stage('lark通知 DEVDEV') {
//          when {
//            branch 'dev'
//          }
//           steps {
//             container ('nodejs') {
//                 git(url: 'https://gitlab.diancun.net/cryptomint.space/code-depoly.git', credentialsId: 'gitlab-ce', branch: 'master', changelog: true, poll: false)
//                 sh 'ls -la'
//                 sh 'cat tag_name.txt'
//                 sh 'sed -i "s/cryptomint_HHJKKK/$APP_NAME/g" lark.sh'
//                 sh 'cat lark.sh'
//                 sh 'bash lark.sh dev'
//                   }
//             }
//   }
      stage('lark通知 TEST') {
         when {
           branch 'test'
         }
          steps {
            container ('nodejs') {
                git(url: 'https://gitlab.diancun.net/cryptomint.space/code-depoly.git', credentialsId: 'gitlab-ce', branch: 'master', changelog: true, poll: false)
                sh 'ls -la'
                sh 'cat tag_name.txt'
                sh 'sed -i "s/cryptomint_HHJKKK/$APP_NAME/g" lark.sh'
                sh 'cat lark.sh'
                sh 'bash lark.sh test'
                  }
            }
  }

      stage('lark通知 MASTER') {
         when {
           branch 'master'
         }
          steps {
            container ('nodejs') {
                git(url: 'https://gitlab.diancun.net/cryptomint.space/code-depoly.git', credentialsId: 'gitlab-ce', branch: 'master', changelog: true, poll: false)
                sh 'ls -la'
                sh 'cat tag_name.txt'
                sh 'sed -i "s/cryptomint_HHJKKK/$APP_NAME/g" lark.sh'
                sh 'cat lark.sh'
                sh 'bash lark.sh prod'
                  }
            }
  }
//       stage('lark通知 UAT') {
//          when {
//            branch 'uat'
//          }
//           steps {
//             container ('nodejs') {
//                 git(url: 'https://gitlab.diancun.net/cryptomint.space/code-depoly.git', credentialsId: 'gitlab-ce', branch: 'master', changelog: true, poll: false)
//                 sh 'ls -la'
//                 sh 'cat tag_name.txt'
//                 sh 'sed -i "s/cryptomint_HHJKKK/$APP_NAME/g" lark.sh'
//                 sh 'cat lark.sh'
//                 sh 'bash lark.sh uat'
//                   }
//             }
//   }
 }
}
