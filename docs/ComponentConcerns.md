# Concerns dos Componentes (Traits)

Os concerns são traits que compõem o `AbstractComponent` e ficam disponíveis em todos os componentes de formulário do framework. Eles implementam funcionalidades como visibilidade, desabilitação, estado, e integração com Livewire.

---

## CanBeHidden

`Modules\Framework\Components\Concerns\CanBeHidden`

Controla a visibilidade de um componente. Suporta valores estáticos, closures e avaliação baseada em campos do Livewire.

### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `hidden(bool\|Closure $condition)` | `true` | Oculta o componente |
| `visible(bool\|Closure $condition)` | `true` | Força visibilidade |
| `hiddenWhen(string $field, mixed $value, Operator $op)` | campo, valor, operador | Oculta quando campo satisfaz condição |
| `visibleWhen(string $field, mixed $value, Operator $op)` | campo, valor, operador | Visível quando campo satisfaz condição |
| `hiddenOn(string\|array $operations)` | `'create'`, `'update'` | Oculta em operações específicas |
| `visibleOn(string\|array $operations)` | `'create'`, `'update'` | Visível apenas em operações específicas |
| `hiddenWhenEmpty(string $field)` | campo | Oculta quando campo for vazio/nulo |
| `visibleWhenEmpty(string $field)` | campo | Visível quando campo for vazio/nulo |

### Exemplos

```php
// Oculto sempre
Input::create('Campo Interno', 'campo_interno')->hidden();

// Oculto por closure (acessa o Livewire component)
Input::create('Campo', 'campo')
    ->hidden(fn($livewire) => !$livewire->modoAvancado);

// Visível apenas na operação de criação
Input::create('Senha', 'senha')->visibleOn('create');

// Oculto na edição
Input::create('Código', 'codigo')->hiddenOn('update');

// Visível quando outro campo tem valor específico
Input::create('CNPJ', 'cnpj')
    ->visibleWhen('tipo_pessoa', 'J');

// Oculto quando campo está vazio
Input::create('Complemento', 'complemento')
    ->hiddenWhenEmpty('logradouro');

// Com operador customizado
use ErpSaga\Enums\Operator;
Input::create('Desconto Extra', 'desconto_extra')
    ->visibleWhen('total', 1000, Operator::GREATER_THAN);
```

---

## CanBeDisabled

`Modules\Framework\Components\Concerns\CanBeDisabled`

Controla se um componente está habilitado ou desabilitado para edição. Um componente oculto (`hidden`) também é considerado desabilitado.

### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `disabled(bool\|Closure $condition)` | `true` | Desabilita o componente |
| `disabledWhen(string $field, mixed $value, Operator $op)` | campo, valor, operador | Desabilita condicionalmente |
| `disabledWhenEmpty(string $field)` | campo | Desabilita quando campo for vazio |
| `disabledOn(string\|array $operations)` | operações | Desabilita em operações específicas |
| `enabledOn(string\|array $operations)` | operações | Habilitado apenas em operações específicas |
| `canBeDisabled(bool $value)` | `false` | Impede que o componente seja desabilitado |

### Exemplos

```php
// Sempre desabilitado (somente leitura)
Input::create('ID', 'id')->disabled();

// Desabilitado por closure
Input::create('Saldo', 'saldo')
    ->disabled(fn($livewire) => !$livewire->podeEditarSaldo);

// Desabilitado quando outro campo é vazio
Input::create('Valor Desconto', 'valor_desconto')
    ->disabledWhenEmpty('tem_desconto');

// Somente leitura na edição, editável na criação
Input::create('CPF', 'cpf')->disabledOn('update');

// Habilitado apenas ao criar
Input::create('Tipo', 'tipo')->enabledOn('create');

// Desabilitado quando campo tem valor específico
Input::create('Aprovado Por', 'aprovado_por')
    ->disabledWhen('status', 'aprovado');

// Protege contra desabilitação externa
Input::create('Campo Obrigatório', 'campo')
    ->canBeDisabled(false);
```

---

## HasState

`Modules\Framework\Components\Concerns\HasState`

Gerencia o estado (valor) do componente, sua ligação com o path no Livewire e valor padrão.

### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `default(mixed $state)` | qualquer valor | Define o valor padrão ao inicializar o formulário |
| `statePath(string $path)` | path no Livewire | Define explicitamente o caminho do estado |
| `state(mixed $state)` | valor | Define o estado atual (escreve no Livewire) |
| `getStatePath(bool $isAbsolute)` | `true` | Retorna o caminho absoluto do estado |
| `hydrateState(bool $andCallHooks)` | `true` | Aplica o valor padrão ao estado |

### Exemplos

```php
// Valor padrão estático
Input::create('Status', 'status')->default('ativo');

// Valor padrão por closure
Input::create('Data', 'data')->default(fn() => now()->format('Y-m-d'));

// Valor padrão numérico
Money::create('Desconto', 'desconto')->default(0);

// Valor padrão booleano
Select::create('Ativo', 'ativo')->default(true);

// Path explícito (raramente necessário, o framework resolve automaticamente)
Input::create('Email', 'email')->statePath('form.contato.email');
```

### Como o caminho é resolvido

O `getStatePath()` constrói o caminho automaticamente a partir:
1. Do `statePath` do container pai
2. Do `statePath` do component pai (se houver)
3. Do próprio `statePath` do componente

Exemplo: campo `nome` dentro de um container `form` resulta em `form.nome`.

---

## HasWire

`Modules\Framework\Components\Concerns\HasWire`

Configura a integração do componente com os atributos Livewire (`wire:model`, `wire:blur`, etc.).

### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `isWireModel()` | - | Adiciona `wire:model` ao campo |
| `live()` | - | Usa `wire:model.live` (atualiza em tempo real) |
| `onBlur(string\|callable $callback)` | método ou closure | Dispara ao perder foco |
| `onEnter(string $method)` | nome do método | Dispara ao pressionar Enter |

### Exemplos

```php
// Campo com wire:model padrão (atualiza no submit/blur)
Input::create('Nome', 'nome')->isWireModel();

// Campo com wire:model.live (atualiza a cada digitação)
Input::create('Busca', 'busca')->isWireModel()->live();

// Chama método ao pressionar Enter
Input::create('Busca', 'busca')
    ->isWireModel()
    ->onEnter('buscar');

// Chama método ao perder foco
Input::create('CEP', 'cep')
    ->isWireModel()
    ->onBlur('buscarEnderecoPorCep');

// Callback ao perder foco (registra closure no componente)
Input::create('CEP', 'cep')
    ->isWireModel()
    ->onBlur(function($livewire) {
        $livewire->preencherEndereco();
    });
```

---

## HasChildComponents

`Modules\Framework\Components\Concerns\HasChildComponents`

Permite que um componente contenha outros componentes filhos. É a base para componentes como `Repeater`, `CollapsibleGroup` e containers.

### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `schema(array\|Closure $components)` | array de componentes | Define os filhos |
| `childComponents(array\|Closure $components)` | array de componentes | Alias de `schema()` |
| `prepend(Component ...$components)` | componentes | Adiciona componentes no início |
| `getChildComponents()` | - | Retorna os componentes filhos |
| `getFlatComponents(bool $withHidden)` | `false` | Retorna todos os filhos (recursivo) |

### Exemplos

```php
// Schema estático
CollapsibleGroup::create('endereco', 'Endereço')
    ->schema([
        Input::create('CEP', 'cep'),
        Input::create('Logradouro', 'logradouro'),
    ]);

// Schema dinâmico por closure
Repeater::create('itens', 'Itens')
    ->schema(function() {
        return [
            Input::create('Produto', '*.produto'),
            Input::create('Quantidade', '*.quantidade'),
        ];
    });

// Adicionando componentes no início
$grupo->prepend(
    Input::create('Código', 'codigo')
);
```

---

## HasRecord

`Modules\Framework\Components\Concerns\HasRecord`

Associa um registro (Model ou array) a um componente, para uso em tabelas e listagens.

### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `record(mixed $record)` | Model ou array | Define o registro associado |
| `recordIndex(string $index)` | `'id'` (padrão) | Campo usado como chave do registro |
| `getRecord()` | - | Retorna o registro associado |

### Exemplo

```php
// Em um componente de tabela customizado
$component->record($model);            // usa $model->id como chave
$component->record($model)->recordIndex('uuid'); // usa $model->uuid como chave
$component->record(['id' => 1, 'nome' => 'João']); // funciona com arrays também
```

---

## HasInputBehavior

`Modules\Framework\Components\Concerns\HasInputBehavior`

Adiciona comportamentos extras a campos de entrada: ícone de informação, uppercase automático e texto auxiliar.

### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `info(string $infoIcon)` | texto ou ícone | Exibe ícone de informação com tooltip |
| `uppercase(bool $isUppercase)` | `true` | Converte o input para maiúsculas automaticamente |
| `helperText(string $helperText)` | texto | Exibe texto de ajuda abaixo do campo |

### Exemplo

```php
Input::create('CPF', 'cpf')
    ->uppercase()
    ->helperText('Digite apenas números')
    ->info('O CPF deve ser do titular do contrato');

Input::create('Código', 'codigo')
    ->uppercase(true)
    ->helperText('Máx. 10 caracteres');
```

---

## CanBeFilter

`Modules\Framework\Components\Concerns\CanBeFilter`

Configura um componente para funcionar como filtro em DataTables. Define quais colunas do banco de dados serão filtradas e com qual operador.

### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `filter(FilterOperator $operator, $fields)` | operador, campos | Configura o filtro |
| `relation(string $relation)` | nome da relação | Filtra via `whereHas` em uma relação |
| `getConfigFilter()` | - | Retorna a configuração do filtro |

### Exemplos

```php
use ErpSaga\Livewire\Resources\Entities\Common\FilterOperator;

// Filtro LIKE (busca parcial)
Input::create('Nome', 'nome')
    ->filter(FilterOperator::LIKE);

// Filtro em múltiplas colunas
Input::create('Busca', 'busca')
    ->filter(FilterOperator::LIKE, ['nome', 'email', 'cpf']);

// Filtro de igualdade
Select::create('Status', 'status')
    ->filter(FilterOperator::EQUAL);

// Filtro via relação
Input::create('Categoria', 'categoria')
    ->filter(FilterOperator::EQUAL, ['id'])
    ->relation('categoria');

// Filtro booleano
Select::create('Ativo', 'ativo')
    ->filter(FilterOperator::BOOLEAN);

// Filtro de intervalo (para DateRange)
DateRange::create('Período', 'data_inicio', 'data_fim')
    ->filter(FilterOperator::BETWEEN, ['created_at']);
```
