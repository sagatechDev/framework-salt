# RepeaterContainer

## O que é?

`RepeaterContainer` é um componente de repetição que encapsula automaticamente a lógica de Containers com wildcards, simplificando a sintaxe e eliminando duplicação de código.

## Problema Resolvido

### Antes (Repeater + Container manual)

```php
// ProdutosFragment.php
Repeater::create('det', 'Produtos da NF-e')
    ->schema([
        Container::create('*.prod')->schema([
            Input::create('Código', 'cProd_I02'),
            Input::create('Descrição', 'xProd_I04'),
        ])
    ]);
```

**Problemas:**
- Necessário usar `Container::create('*.prod')` manualmente
- Wildcard `*` precisa ser especificado
- Código mais verboso

### Depois (RepeaterContainer)

```php
// ProdutosFragment.php
RepeaterContainer::create('det', 'Produtos da NF-e')
    ->containerPath('prod')
    ->schema([
        Input::create('Código', 'cProd_I02'),
        Input::create('Descrição', 'xProd_I04'),
    ]);
```

**Vantagens:**
- Sintaxe mais limpa
- Sem necessidade de wildcards manuais
- Container criado automaticamente
- Menos código repetitivo

## Como Funciona

1. **RepeaterContainer** cria automaticamente o caminho completo para cada item
2. Para cada índice do repeater (0, 1, 2...), substitui wildcards usando: `{índice}.{containerPath}`
3. Os componentes filhos herdam o caminho correto automaticamente

### Exemplo de caminhos gerados:

```php
RepeaterContainer::create('det', 'Produtos')
    ->containerPath('prod')
    ->schema([
        Input::create('Código', 'cProd_I02'),
    ]);
```

**Gera os caminhos:**
- Item 0: `det.0.prod.cProd_I02`
- Item 1: `det.1.prod.cProd_I02`
- Item 2: `det.2.prod.cProd_I02`

## API

### Métodos

#### `create(string $name, ?string $label = '')`
Cria uma nova instância do RepeaterContainer.

```php
RepeaterContainer::create('det', 'Produtos da NF-e')
```

#### `containerPath(string $path)`
Define o caminho do Container que será prefixado com o índice.

```php
->containerPath('prod')           // Caminho simples
->containerPath('impostos.ICMS')  // Caminho aninhado
```

#### `content(string|callable $content)`
Define o conteúdo do header de cada item do repeater.

```php
// Usando component
->content('fiscal::nfe-emission.items-repeater')

// Usando closure
->content(fn($item) => $item['prod']['xProd_I04'] ?? 'Produto')
```

#### `schema(array $components)`
Define os componentes filhos que serão repetidos.

```php
->schema([
    Input::create('Código', 'cProd_I02'),
    Input::create('Descrição', 'xProd_I04'),
])
```

## Exemplos Completos

### Exemplo 1: Produtos de NF-e

```php
use Modules\Framework\Components\RepeaterContainer;

RepeaterContainer::create('det', 'Produtos da NF-e')
    ->containerPath('prod')
    ->content(fn($item) => $item['prod']['xProd_I04'] ?? 'Item')
    ->schema([
        Input::create('Código', 'cProd_I02')
            ->columns(['md' => 4]),
        Input::create('Descrição', 'xProd_I04')
            ->columns(['md' => 8]),
        Input::create('NCM', 'NCM_I05')
            ->columns(['md' => 3]),
        Input::create('CFOP', 'CFOP_I08')
            ->columns(['md' => 2]),
    ]);
```

### Exemplo 2: Container Aninhado

```php
RepeaterContainer::create('parcelas', 'Parcelas')
    ->containerPath('duplicata')
    ->content(fn($item) => "Parcela " . ($item['duplicata']['nDup'] ?? ''))
    ->schema([
        Input::create('Número', 'nDup'),
        Input::create('Vencimento', 'dVenc'),
        Input::create('Valor', 'vDup'),
    ]);
```

### Exemplo 3: Sem containerPath (índice direto)

```php
// Quando não há necessidade de um container intermediário
RepeaterContainer::create('items', 'Itens')
    ->content(fn($item) => $item['nome'] ?? 'Item')
    ->schema([
        Input::create('Nome', 'nome'),
        Input::create('Quantidade', 'quantidade'),
    ]);

// Gera: items.0.nome, items.1.nome, etc.
```

## Migração de Repeater para RepeaterContainer

### Passo 1: Identifique o padrão Container::create('*.caminho')

**Antes:**
```php
Repeater::create('det')->schema([
    Container::create('*.prod')->schema([
        // campos...
    ])
])
```

### Passo 2: Extraia o caminho do Container

O caminho é o que vem depois do wildcard: `*.prod` → `prod`

### Passo 3: Converta para RepeaterContainer

**Depois:**
```php
RepeaterContainer::create('det')
    ->containerPath('prod')
    ->schema([
        // mesmos campos...
    ])
```

### Passo 4: Remova o Container::create

Os campos agora ficam diretos no `schema()` do RepeaterContainer.

## Quando usar?

### ✅ Use RepeaterContainer quando:
- Você tem um Repeater com Container aninhado usando wildcard (`*.caminho`)
- Quer simplificar a sintaxe
- Quer código mais legível e manutenível

### ❌ Use Repeater tradicional quando:
- Não há Container intermediário
- Precisa de lógica customizada no Container
- Tem múltiplos Containers no mesmo nível (não aninhados)

## Arquivos Relacionados

- **Component:** `app-modules/framework/src/Components/RepeaterContainer.php`
- **View:** `app-modules/framework/resources/views/components/repeater-container.blade.php`
- **Exemplo de uso:** `app-modules/fiscal/src/Livewire/Pages/NfeEmission/FormFragments/ProdutosFragment.php`

## Implementação Técnica

### Como funciona internamente:

1. **RepeaterContainer** recebe `containerPath('prod')`
2. No blade, para cada item com índice `$index`:
   ```php
   $indexPath = $containerPath ? "{$index}.{$containerPath}" : $index;
   $component->configWildcardAttributes($indexPath);
   ```
3. Cada componente filho tem seus wildcards substituídos por `0.prod`, `1.prod`, etc.
4. O método `getStatePath()` constrói o caminho completo: `det.0.prod.cProd_I02`

### Compatibilidade:

- ✅ Funciona com todos os componentes de formulário (Input, Select, Textarea, etc.)
- ✅ Funciona com Containers aninhados
- ✅ Funciona com CollapsibleGroup
- ✅ Compatível com validação Livewire
- ✅ Compatível com wire:model
