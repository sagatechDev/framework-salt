# Plano de Ajuste do Deploy (VitePress CI/CD)

## Objetivo
Resolver os erros de dependência e compilação do fluxo contínuo do Github Actions. Isso será feito homologando a estrutura de pacotes NodeJS recém-criada localmente pelo `ag-kit` (`package.json`, `package-lock.json`) no ambiente de produção.

## Agentes Envolvidos
- **project-planner**: Orquestração e planejamento.
- **devops-engineer**: Controle de versão e CI/CD.
- **security-auditor**: Verificações de segurança antes do push.

---

## Passo a Passo (Implementação)

### 1. Auditoria de Segurança (`security-auditor`)
- Verificar detalhadamente os metadados gerados dentro da pasta local `.agent/` pelo *Antigravity Kit*.
- Garantir que nenhum arquivo temporário, sensível ou binário pesado seja indevidamente adicionado ao repositório.
- Revisar a integridade protetiva do `.gitignore`.

### 2. Infraestrutura e Controle de Versão (`devops-engineer`)
- Incluir os pacotes mestres de rastreio (`package.json`, `package-lock.json`) no histórico Git.
- Incluir a documentação das novas ferramentas da pasta `.agent`.
- Criar a rotina de commit semântico oficial explicitando a correção da infraestrutura.
- Efetuar o `git push origin main` com segurança total para reinicializar o motor do **GitHub Actions**.

### 3. Scripts de Verificação
- Rodar o módulo de segurança/lint configurado via `ag-kit` (ex: `security_scan.py`).
- Monitorar a saída estrutural em modo final local antes que a nuvem processe a página.
