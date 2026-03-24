# DataTable — Filtros

O sistema de filtros fornece uma forma padronizada de aplicar condições de busca a queries Eloquent. É composto por:

- **`FilterAppender`** — orquestrador que cria e aplica os filtros
- **`Filter`** (abstrata) — contrato base para todos os filtros
- **Implementações concretas** — `LikeFilter`, `EqualFilter`, `BooleanFilter`, `BetweenFilter`, `JsonFilter`
- **`FilterFactory`** — factory que instancia o filtro correto com base no operador

---

## Arquitetura

```
FilterAppender::createFilters($filterConfigurations, $filterValues)
    └── FilterFactory::createFilter($configuration)
            ├── LikeFilter     (FilterOperator::LIKE)
            ├── EqualFilter    (FilterOperator::EQUAL)
            ├── BooleanFilter  (FilterOperator::BOOLEAN)
            ├── BetweenFilter  (FilterOperator::BETWEEN)
            └── JsonFilter     (FilterOperator::JSON)

FilterAppender::append($query, $filters)
    └── Filter::append($query)
            ├── whereHas($relation, ...) — quando há relação
            └── appendFilter($query)    — direto na query
```

---

## FilterAppender

`Modules\Framework\DataTable\FilterAppender`

Classe utilitária estática que faz a ponte entre os valores digitados nos filtros e a query Eloquent.

### Métodos

#### `createFilters(array $filterConfigurations, array $filterValues): Filter[]`

Recebe a configuração dos filtros e os valores atuais, e retorna um array de instâncias de `Filter` prontas para serem aplicadas. Valores nulos ou strings vazias são automaticamente ignorados.

**`$filterConfigurations`** — mapa de `chave => configuração`:
```php
[
    'nome'   => ['operator' => FilterOperator::LIKE,  'columns' => ['nome']],
    'status' => ['operator' => FilterOperator::EQUAL, 'columns' => ['status']],
    'ativo'  => ['operator' => FilterOperator::BOOLEAN, 'columns' => ['ativo']],
    'periodo'=> ['operator' => FilterOperator::BETWEEN, 'columns' => ['created_at']],
]
```

**`$filterValues`** — valores digitados pelo usuário:
```php
['nome' => 'João', 'status' => null, 'ativo' => true]
// status=null é ignorado automaticamente
```

#### `append(Builder $query, Filter[] $filters): Builder`

Aplica todos os filtros à query e a retorna.

### Exemplo completo de uso

```php
use Modules\Framework\DataTable\FilterAppender;
use ErpSaga\Livewire\Resources\Entities\Common\FilterOperator;

class ClienteListPage extends Component
{
    public array $filters = [
        'nome'    => '',
        'status'  => null,
        'ativo'   => null,
        'periodo' => '',
    ];

    protected array $filterConfigurations = [
        'nome'    => ['operator' => FilterOperator::LIKE,    'columns' => ['nome', 'email']],
        'status'  => ['operator' => FilterOperator::EQUAL,   'columns' => ['status']],
        'ativo'   => ['operator' => FilterOperator::BOOLEAN, 'columns' => ['ativo']],
        'periodo' => ['operator' => FilterOperator::BETWEEN, 'columns' => ['created_at']],
    ];

    public function getQuery(): Builder
    {
        $query = Cliente::query();

        $activeFilters = FilterAppender::createFilters(
            $this->filterConfigurations,
            $this->filters
        );

        return FilterAppender::append($query, $activeFilters);
    }
}
```

---

## LikeFilter

`Modules\Framework\DataTable\Filters\LikeFilter`

Aplica uma condição `LIKE %valor%` em uma ou mais colunas com `OR` entre elas.

### SQL gerado

```sql
WHERE (coluna1 LIKE '%valor%' OR coluna2 LIKE '%valor%')
```

### Configuração

```php
'nome' => [
    'operator' => FilterOperator::LIKE,
    'columns'  => ['nome', 'razao_social', 'fantasia'],
]
```

---

## EqualFilter

`Modules\Framework\DataTable\Filters\EqualFilter`

Aplica uma condição de igualdade exata (`= valor`).

### SQL gerado

```sql
WHERE status = 'ativo'
```

### Configuração

```php
'status' => [
    'operator' => FilterOperator::EQUAL,
    'columns'  => ['status'],
]
```

### Exemplo com relação

```php
// Filtra por categoria usando whereHas
'categoria_id' => [
    'operator' => FilterOperator::EQUAL,
    'columns'  => ['id'],
    'relation' => 'categoria',
]
// Gera: WHERE EXISTS (SELECT * FROM categorias WHERE categorias.id = X)
```

---

## BooleanFilter

`Modules\Framework\DataTable\Filters\BooleanFilter`

Filtra por valor booleano. Aceita `true`/`false`, strings `'true'`/`'false'`/`'1'`, e os valores do enum `BooleanOption`.

### SQL gerado

```sql
WHERE ativo = 1
-- ou
WHERE ativo = 0
```

### Configuração

```php
'ativo' => [
    'operator' => FilterOperator::BOOLEAN,
    'columns'  => ['ativo'],
]
```

### Valores aceitos como entrada

```php
true / false
'true' / 'false'
'1' / '0'
BooleanOption::YES / BooleanOption::NO
```

---

## BetweenFilter

`Modules\Framework\DataTable\Filters\BetweenFilter`

Aplica uma condição `BETWEEN` para filtrar intervalos. Aceita um array `[min, max]` ou uma string no formato `"valor1 - valor2"` (padrão do componente `DateRange`).

### SQL gerado

```sql
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'
```

### Configuração

```php
'periodo' => [
    'operator' => FilterOperator::BETWEEN,
    'columns'  => ['created_at'],
]
```

### Formatos de entrada aceitos

```php
// Array (quando usa dois campos separados)
['2024-01-01', '2024-12-31']

// String com separador " - " (padrão do DateRange com campo único)
'2024-01-01 - 2024-12-31'
```

### Validação

O filtro só é aplicado se exatamente 2 valores forem extraídos. Se o range estiver incompleto, o filtro é ignorado.

---

## JsonFilter

`Modules\Framework\DataTable\Filters\JsonFilter`

Aplica `whereJsonContains` para filtrar dentro de colunas JSON. Útil para colunas que armazenam arrays ou objetos JSON.

### SQL gerado

```sql
WHERE JSON_CONTAINS(tags, '"laravel"')
```

### Configuração

```php
'tag' => [
    'operator' => FilterOperator::JSON,
    'columns'  => ['tags'],
]
```

### Exemplo

```php
// Se a coluna 'permissoes' armazena um JSON array: ["admin", "financeiro"]
'permissao' => [
    'operator' => FilterOperator::JSON,
    'columns'  => ['permissoes'],
]
// Com valor 'admin', filtra registros onde permissoes contém "admin"
```

---

## Criando um filtro customizado

Para filtros além dos padrões, você pode criar sua própria classe estendendo `Filter`:

```php
use Modules\Framework\DataTable\Filter;
use Illuminate\Database\Eloquent\Builder;

class StartsWithFilter extends Filter
{
    protected function createWhere(string $column): array
    {
        return [$column, 'like', "{$this->value}%"];
    }
}

// E instanciar diretamente:
$filter = new StartsWithFilter(columns: ['nome'], value: 'João');
$query = $filter->append($query);
```
