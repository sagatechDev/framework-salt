
# Estado e Livewire

[:arrow_backward: Voltar](../)

Cada campo de formulário está ligado a um caminho (`statePath`) na propriedade `$form` do componente Livewire. O framework constrói esse caminho automaticamente a partir do nome do campo e do container onde ele está.

---

## Valor padrão

Use `default()` para definir o valor inicial de um campo. Ele é aplicado quando o formulário é preenchido pela primeira vez (mount ou reset).

```php
Input::create('Status', 'status')->default('ativo');
Input::create('Data', 'data')->default(fn() => now()->format('Y-m-d'));
Money::create('Desconto', 'desconto')->default(0);
Select::create('Tipo', 'tipo')->default('F');
Checkbox::create('Ativo', 'ativo')->default(true);
Repeater::create('itens', 'Itens')->default([]);
```

O `default()` aceita closures — útil para valores que dependem de dados em tempo de execução.

---

## Como o caminho é resolvido

O `getStatePath()` constrói o caminho absoluto automaticamente combinando:

1. O caminho do container pai (`form`)
2. O caminho do componente pai (quando dentro de um Container ou Repeater)
3. O `name` do próprio campo

Resultado para um campo `nome` dentro de um formulário padrão:

```
form.nome
```

Para um campo dentro de um Repeater:

```
form.itens.0.nome
form.itens.1.nome
```

Você raramente precisa definir o `statePath` manualmente. O framework resolve isso automaticamente.

---

## Integração com Livewire

### wire:model

A maioria dos campos já chama `isWireModel()` internamente, que configura o `wire:model` com o caminho absoluto do campo. Não é necessário fazer nada adicional.

Para campos que precisam atualizar o Livewire a cada digitação (em tempo real), use `live()`:

```php
Input::create('Busca', 'busca')
    ->live(); // adiciona wire:model.live
```

### Disparar método ao perder foco

```php
// Chama $this->buscarEnderecoPorCep() na page
Input::create('CEP', 'cep')->onBlur('buscarEnderecoPorCep');

// Com closure (registra o callback no componente)
Input::create('CEP', 'cep')
    ->onBlur(function($livewire) {
        $livewire->preencherEndereco();
    });
```

### Disparar método ao pressionar Enter

```php
Input::create('Busca', 'busca')->onEnter('buscar');
```

---

## Filtros

Os campos que funcionam como filtros na barra de busca da listagem usam `filter()` para configurar como o valor digitado é aplicado à query.

```php
use ErpSaga\Livewire\Resources\Entities\Common\FilterOperator;

// Busca parcial (LIKE %valor%)
Input::create('Nome', 'nome')
    ->filter(FilterOperator::LIKE);

// Busca em múltiplas colunas ao mesmo tempo
Input::create('Busca', 'busca')
    ->filter(FilterOperator::LIKE, ['nome', 'email', 'cpf']);

// Igualdade exata
Select::create('Status', 'status')
    ->filter(FilterOperator::EQUAL);

// Valor booleano
Toggle::create('Ativo', 'ativo')
    ->filter(FilterOperator::BOOLEAN);

// Intervalo de datas
DateRange::create('Período', 'data_inicio', 'data_fim')
    ->filter(FilterOperator::BETWEEN, ['created_at']);

// Filtrar via relação (whereHas)
Select::create('Categoria', 'categoria_id')
    ->filter(FilterOperator::EQUAL, ['id'])
    ->relation('categoria');
```

Veja a referência completa dos filtros em [DataTable — Filtros](./datatable-filters).

---

> Veja também: [Visibilidade e desabilitação](./component-behavior) · [DataTable — Filtros](./datatable-filters)
