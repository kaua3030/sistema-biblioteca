variable "regiao_aws" {
  description = "Região da AWS onde os recursos serão criados"
  type        = string
  default     = "us-east-1"
}

variable "tipo_servidor" {
  description = "Tipo da instância EC2 (tamanho do servidor)"
  type        = string
  default     = "t2.micro"
}

variable "nome_projeto" {
  description = "Nome do projeto, usado como tag de identificação dos recursos"
  type        = string
  default     = "sistema-biblioteca"
}