# EC2 자동 배포 설정 가이드

## 🚀 빠른 시작

### 1단계: EC2 인스턴스 생성

**AWS Console에서:**
1. EC2 → Launch Instance
2. **AMI**: Amazon Linux 2023 또는 Ubuntu 22.04
3. **Instance Type**: `t3.small` (추천) 또는 `t3.micro` (Free Tier)
4. **Key Pair**: 새로 생성하거나 기존 것 선택 (PEM 파일 다운로드)
5. **Security Group**:
   - SSH (22): My IP
   - Custom TCP (8080): Anywhere (API Gateway)
   - Custom TCP (5432): My IP (PostgreSQL, 선택사항)

### 2단계: EC2 초기 설정

```bash
# EC2에 SSH 접속
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# 초기 설정 스크립트 실행
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/HydroX/main/backend/deploy/ec2-setup.sh | bash

# 재로그인 (docker 그룹 적용)
exit
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# 상태 확인
cd ~/hydrox-backend/backend
docker-compose ps
```

### 3단계: GitHub Secrets 설정

GitHub 레포지토리 → Settings → Secrets and variables → Actions

| Secret Name | 값 | 설명 |
|-------------|-----|------|
| `EC2_HOST` | `13.xxx.xxx.xxx` | EC2 퍼블릭 IP |
| `EC2_USERNAME` | `ec2-user` | Amazon Linux는 ec2-user, Ubuntu는 ubuntu |
| `EC2_SSH_KEY` | PEM 파일 내용 전체 | `cat your-key.pem` 출력값 |

**PEM 키 복사 방법:**
```bash
# 로컬에서
cat your-key.pem

# 출력되는 내용 전체 복사 (-----BEGIN RSA PRIVATE KEY----- 부터 끝까지)
```

### 4단계: 테스트

```bash
# 로컬에서 push
git add .
git commit -m "Test auto deploy"
git push origin main

# GitHub Actions 탭에서 배포 확인
# 또는 EC2에서 로그 확인
ssh -i your-key.pem ec2-user@YOUR_EC2_IP
docker-compose logs -f
```

---

## 📁 파일 구조

```
backend/
├── deploy/
│   ├── ec2-setup.sh              # EC2 초기 설정 스크립트
│   ├── docker-compose.prod.yml   # 프로덕션용 docker-compose
│   └── README.md                 # 이 파일
├── docker-compose.yml            # 개발용 docker-compose
└── ...
```

---

## 🔧 배포 흐름

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   개발자     │────▶│   GitHub Push    │────▶│   GitHub    │
│  git push   │     │   (main branch)  │     │   Actions   │
└─────────────┘     └──────────────────┘     └──────┬──────┘
                                                    │
                                                    │ SSH
                                                    ▼
                    ┌──────────────────────────────────────┐
                    │              EC2 인스턴스             │
                    │  ┌────────────────────────────────┐  │
                    │  │  1. git pull                   │  │
                    │  │  2. docker-compose build       │  │
                    │  │  3. docker-compose up -d       │  │
                    │  └────────────────────────────────┘  │
                    └──────────────────────────────────────┘
```

---

## 🛠 유용한 명령어

```bash
# EC2 접속
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f              # 전체
docker-compose logs -f gateway      # 특정 서비스

# 재시작
docker-compose restart

# 완전 재빌드
docker-compose down
docker-compose up -d --build

# 데이터 포함 완전 초기화
docker-compose down -v
docker-compose up -d --build

# PostgreSQL 접속
docker exec -it hydrox-postgres psql -U hydrox_user -d hydrox_db

# Redis 접속
docker exec -it hydrox-redis redis-cli
```

---

## 🔒 보안 체크리스트

- [ ] Security Group에서 SSH는 My IP만 허용
- [ ] PEM 키 파일 안전하게 보관
- [ ] GitHub Secrets에 민감 정보 저장
- [ ] `.env` 파일 `.gitignore`에 추가
- [ ] 프로덕션에서는 DB 비밀번호 변경

---

## 💰 예상 비용

| 리소스 | 사양 | 월 비용 |
|--------|------|---------|
| EC2 t3.micro | 1GB RAM | Free Tier 무료 |
| EC2 t3.small | 2GB RAM | ~$15 |
| EBS (스토리지) | 30GB | Free Tier 무료 |

**총: Free Tier면 $0, 아니면 ~$15/월**

---

## ❓ 트러블슈팅

### Docker permission denied
```bash
sudo usermod -aG docker $USER
exit  # 재로그인
```

### 메모리 부족
```bash
# 스왑 확인
free -h

# 스왑 추가
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 포트 접속 안됨
- Security Group에서 8080 포트 열렸는지 확인
- `docker-compose ps`로 컨테이너 상태 확인

### GitHub Actions 실패
- Secrets 값 확인 (특히 SSH 키 줄바꿈)
- EC2 Security Group에서 GitHub Actions IP 허용

