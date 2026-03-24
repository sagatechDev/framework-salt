
# Repeater e variações

[:arrow_backward: Voltar](../)

O Repeater permite criar listas dinâmicas de campos onde o usuário pode adicionar, remover e reordenar itens. O framework oferece três variações dependendo da complexidade da estrutura de dados.

---

## Repeater

O componente base para listas repetíveis. Cada item do array corresponde a um conjunto de campos, cujos nomes usam `*` como placeholder do índice.

```php
use Modules\Framework\Components\Repeater;
use ErpSaga\Livewire\Resources\Components\Forms\Input;

Repeater::create('telefones', 'Telefones')
    ->schema([
        Input::create('Número', '*.numero'),
        Input::create('Tipo', '*.tipo'),
    ]);
```

O `*` nos nomes dos campos é substituído automaticamente pelo índice de cada item (`0`, `1`, `2`...) durante a renderização.

### Cabeçalho dinâmico por item

O método `content()` define o texto exibido no header de cada item do acordeão. Ele recebe o array do item atual:

```php
Repeater::create('parcelas', 'Parcelas')
    ->content(fn($item) => "Parcela {$item['numero']} — Venc: {$item['vencimento']}")
    ->schema([
        Input::create('Número', '*.numero')->columns(['md' => 2]),
        Input::create('Vencimento', '*.vencimento')->type('date')->columns(['md' => 4]),
        Money::create('Valor', '*.valor')->columns(['md' => 3]),
    ]);
```

Você também pode passar uma view Blade:

```php
->content('pedidos.partials.parcela-header')
```

---

## SimpleRepeater

Variação sem acordeão — os itens são exibidos diretamente, um abaixo do outro, sem header expansível. Use quando a lista for curta ou os itens forem simples.

```php
use Modules\Framework\Components\SimpleRepeater;

SimpleRepeater::create('contatos', 'Contatos')
    ->schema([
        Input::create('Nome', '*.nome')->columns(['md' => 6]),
        Input::create('Cargo', '*.cargo')->columns(['md' => 4]),
        Input::create('Telefone', '*.telefone')->columns(['md' => 4]),
    ]);
```

A API é idêntica ao `Repeater`.

---

## RepeaterContainer

Quando a estrutura de dados tem um nível intermediário — ou seja, cada item do array contém um objeto aninhado — o `RepeaterContainer` elimina a necessidade de usar `Container::create('*.caminho')` manualmente.

### O problema que resolve

Sem o `RepeaterContainer`, você precisaria escrever:

```php
Repeater::create('det', 'Produtos')
    ->schema([
        Container::create('*.prod')->schema([
            Input::create('Código', 'cProd'),
            Input::create('Descrição', 'xProd'),
        ])
    ]);
```

Com o `RepeaterContainer`, fica:

```php
use Modules\Framework\Components\RepeaterContainer;

RepeaterContainer::create('det', 'Produtos')
    ->containerPath('prod')
    ->schema([
        Input::create('Código', 'cProd'),
        Input::create('Descrição', 'xProd'),
    ]);
```

### Como funciona

O `containerPath()` define o caminho intermediário. Para cada item com índice `$i`, o framework constrói automaticamente o caminho `{name}.{i}.{containerPath}.{field}`:

```
det.0.prod.cProd
det.1.prod.cProd
det.2.prod.cProd
```

### Exemplo completo — itens de NF-e

```php
RepeaterContainer::create('det', 'Produtos da NF-e')
    ->containerPath('prod')
    ->content(fn($item) => $item['prod']['xProd'] ?? 'Produto')
    ->schema([
        Input::create('Código', 'cProd')->columns(['md' => 3]),
        Input::create('Descrição', 'xProd')->columns(['md' => 6]),
        Input::create('NCM', 'NCM')->columns(['md' => 3]),
        Input::create('CFOP', 'CFOP')->columns(['md' => 2]),
        Money::create('Valor Unitário', 'vUnCom')->columns(['md' => 3]),
    ]);
```

### Caminho aninhado

O `containerPath` também aceita caminhos com múltiplos níveis:

```php
RepeaterContainer::create('det', 'Impostos')
    ->containerPath('impostos.ICMS')
    ->schema([
        Input::create('CST', 'CST'),
        Money::create('Valor ICMS', 'vICMS'),
    ]);
// Gera: det.0.impostos.ICMS.CST, det.1.impostos.ICMS.CST, etc.
```

### Sem containerPath

Quando não há caminho intermediário, o `RepeaterContainer` funciona como um `Repeater` padrão:

```php
RepeaterContainer::create('items', 'Itens')
    ->schema([
        Input::create('Nome', 'nome'),
        Input::create('Quantidade', 'quantidade'),
    ]);
// Gera: items.0.nome, items.1.nome, etc.
```

---

## Quando usar cada um?

| Situação | Use |
|----------|-----|
| Lista simples, sem objeto aninhado | `Repeater` ou `SimpleRepeater` |
| Lista com acordeão expansível | `Repeater` |
| Lista sem acordeão | `SimpleRepeater` |
| Lista onde cada item tem um sub-objeto (`item.prod`, `item.endereco`) | `RepeaterContainer` |
| Lista com múltiplos containers no mesmo nível | `Repeater` + `Container` manual |

---

> Veja também: [Campos de entrada](./form-fields) · [Componentes estruturais](./form-structure) · [Visibilidade e desabilitação](./component-behavior)
