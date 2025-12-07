#!/bin/bash
# EC2 Amazon Linux 2023 / Ubuntu 초기 설정 스크립트
# 사용법: curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/backend/deploy/ec2-setup.sh | bash

set -e

echo "🚀 HydroX 백엔드 EC2 설정 시작..."

# 1. Docker 설치
echo "📦 Docker 설치 중..."
if command -v yum &> /dev/null; then
    # Amazon Linux
    sudo yum update -y
    sudo yum install -y docker git
else
    # Ubuntu
    sudo apt-get update -y
    sudo apt-get install -y docker.io git
fi

# Docker 시작 및 자동 실행 설정
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# 2. Docker Compose 설치
echo "📦 Docker Compose 설치 중..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. 스왑 메모리 추가 (t3.micro 대비)
echo "💾 스왑 메모리 설정 중..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
fi

# 4. 프로젝트 클론
echo "📥 프로젝트 클론 중..."
cd ~
if [ -d "hydrox-backend" ]; then
    cd hydrox-backend
    git pull origin main
else
    git clone https://github.com/YOUR_USERNAME/HydroX.git hydrox-backend
    cd hydrox-backend/backend
fi

# 5. 환경 변수 설정
echo "⚙️ 환경 변수 설정..."
if [ ! -f .env ]; then
    cat > .env << EOF
DB_PASSWORD=hydrox_secret_2024
DB_USER=hydrox_user
DB_NAME=hydrox_db
EOF
fi

# 6. Docker Compose 실행
echo "🐳 Docker 컨테이너 시작..."
newgrp docker << EOF
cd ~/hydrox-backend/backend
docker-compose up -d --build
EOF

echo ""
echo "✅ 설정 완료!"
echo ""
echo "📋 다음 단계:"
echo "1. 재로그인하여 docker 그룹 적용: exit 후 다시 SSH 접속"
echo "2. 상태 확인: docker-compose ps"
echo "3. 로그 확인: docker-compose logs -f"
echo ""
echo "🌐 API Gateway: http://$(curl -s ifconfig.me):8080"

