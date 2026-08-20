# 1. Configura o provedor de nuvem (AWS)
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.regiao_aws
}

# 2. TERCEIRA MEDIDA DE SEGURANÇA: Firewall Restritivo (Security Group)
resource "aws_security_group" "firewall_biblioteca" {
  name        = "firewall-sistema-biblioteca"
  description = "Libera apenas as portas minimas para o sistema funcionar"

  # Libera a porta 22 para o Ansible se conectar via SSH e configurar a maquina
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Libera a porta 3000 para os alunos e professores acessarem a tela da biblioteca
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Libera o servidor para buscar atualizacoes na internet (Docker, pacotes Linux)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. Cria a Máquina Virtual Linux Ubuntu na Nuvem
resource "aws_instance" "servidor_biblioteca" {
  ami           = "ami-0c7217cdde317cfec" # ID padrão do Ubuntu Server 22.04 LTS
  instance_type = var.tipo_servidor

  vpc_security_group_ids = [aws_security_group.firewall_biblioteca.id]

  tags = {
    Name = var.nome_projeto
  }
}
