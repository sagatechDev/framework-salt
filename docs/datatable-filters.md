
# DataTable — Filtros

[:arrow_backward: Voltar](../)

O sistema de filtros conecta os campos da barra de busca com a query Eloquent. Você define o operador e as colunas no campo, e o `FilterAppender` aplica automaticamente à query da listagem.

---

## Configurando um filtro

Adicione `filter()` a qualquer campo em `Resource::filters()`:

```php
use ErpSaga\Livewire\Resources\Entities\Common\FilterOperator;

public static function filters(): array
{
    return [
        Input::create('Nome', 'nome')
            ->filter(FilterOperator::LIKE),

        Select::create('Status', 'status')
            ->options(['' => 'Todos', 'ativo' => 'Ativo'])
            ->filter(FilterOperator::EQUAL),
    ];
}
```

O nome do campo é usado como chave para mapear o valor digitado à configuração do filtro.

---

## Operadores disponíveis

### LIKE — busca parcial

Aplica `WHERE coluna LIKE '%valor%'`. Ideal para campos de texto.

```php
Input::create('Nome', 'nome')
    ->filter(FilterOperator::LIKE);
// WHERE nome LIKE '%joão%'
```

Para buscar em múltiplas colunas ao mesmo tempo (com `OR` entre elas):

```php
Input::create('Busca', 'busca')
    ->filter(FilterOperator::LIKE, ['nome', 'email', 'cpf']);
// WHERE (nome LIKE '%x%' OR email LIKE '%x%' OR cpf LIKE '%x%')
```

### EQUAL — igualdade exata

Aplica `WHERE coluna = valor`. Ideal para Selects e campos de código.

```php
Select::create('Status', 'status')
    ->filter(FilterOperator::EQUAL);
// WHERE status = 'ativo'
```

### BOOLEAN — valor booleano

Converte o valor do filtro para `true`/`false` antes de aplicar.

```php
Toggle::create('Ativo', 'ativo')
    ->filter(FilterOperator::BOOLEAN);
// WHERE ativo = 1
```

Aceita como entrada: `true`, `false`, `'true'`, `'false'`, `'1'`, `'0'`.

### BETWEEN — intervalo

Aplica `WHERE coluna BETWEEN min AND max`. Usa o valor do `DateRange` (string `"YYYY-MM-DD - YYYY-MM-DD"` ou array `[min, max]`).

```php
DateRange::create('Período', 'data_inicio', 'data_fim')
    ->filter(FilterOperator::BETWEEN, ['created_at']);
// WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'
```

O filtro só é aplicado quando os dois limites estão presentes. Se o range estiver incompleto, é ignorado.

### JSON — conteúdo de coluna JSON

Aplica `whereJsonContains`. Útil para colunas que armazenam arrays JSON.

```php
Select::create('Tag', 'tag')
    ->filter(FilterOperator::JSON, ['tags']);
// WHERE JSON_CONTAINS(tags, '"laravel"')
```

---

## Filtros via relação

Para filtrar registros a partir de uma relação Eloquent, use `relation()`:

```php
Select::create('Categoria', 'categoria_id')
    ->filter(FilterOperator::EQUAL, ['id'])
    ->relation('categoria');
// WHERE EXISTS (SELECT * FROM categorias WHERE id = X AND ...)
```

---

## Como os filtros são aplicados

O `FilterAppender` é chamado automaticamente pela `AbstractListPage`. Você não precisa chamá-lo manualmente em páginas padrão.

Para usar fora de uma page, ou em contextos customizados:

```php
use Modules\Framework\DataTable\FilterAppender;

$filters = FilterAppender::createFilters($this->configFilters, $this->filters);
$query = FilterAppender::append(Cliente::query(), $filters);
```

Valores nulos e strings vazias são ignorados automaticamente — o filtro só é aplicado quando o usuário digitou algo.

---

## ResourceFilter — filtro via scope

Quando o Model tem um scope `filter()`, o `AbstractListPage` o chama antes do `FilterAppender`:

```php
// No Model:
public function scopeFilter(Builder $query, ResourceFilter $filter): Builder
{
    if ($filter->has('nome')) {
        $query->where('nome', 'like', "%{$filter->get('nome')}%");
    }

    if ($filter->has('ativo')) {
        $query->where('ativo', $filter->boolean('ativo'));
    }

    return $query;
}
```

O `ResourceFilter` tem os métodos `has()`, `get()` e `boolean()` para acessar os valores dos filtros com segurança.

---

> Veja também: [Resource e Pages](./resource) · [Estado e Livewire — filter()](./component-state#filtros)
