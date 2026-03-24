# Boas Práticas do Framework

Bem-vindo à área voltada à padronização de código do Salt baseado na filosofia do Filament/Laravel.

## 1. Princípio da Interface Declarativa (Fluent API)

Componentes devem ser escritos primariamente injetando suas regras na inicialização, minimizando sobreposições em blades sempre que possível.

**🚫 Evite:**
```blade
<x-framework::components.money-input name="vTot" label="Valor Total" wire:model.defer="meuValor" prefix="R$"  />
```

**✅ Prefira (na Classe):**
```php
Money::create('Valor Total', 'vTot')
    ->prefix('R$')
    ->isWireModel()
```

## 2. Abstrações Especializadas (Invés de Genéricas)

Não tente reinventar o polimento visual nos inputs padrão do Laravel. Se precisar de uma feature massiva repetida várias vezes (ex: "Input de CNPJ com validação e máscara via API"):
- Crie um Componente novo na pasta do framework.
- Herde ou estenda `Input`.
- Inclua sua regra nativa e adicione na documentação.
