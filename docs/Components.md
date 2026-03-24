# Componentes de Formulário

Todos os componentes de formulário do framework seguem o padrão fluente (method chaining) e herdam funcionalidades compartilhadas via traits de `AbstractComponent`.

Os componentes que estendem a base do ErpSaga (`Component`) herdam automaticamente:
- Suporte a colunas responsivas (`columns()`)
- Gerenciamento de estado (`default()`, `state()`, `getStatePath()`)
- Visibilidade condicional (`hidden()`, `visible()`, `hiddenWhen()`, etc.)
- Desabilitação condicional (`disabled()`, `disabledWhen()`, etc.)
- Integração com Livewire (`isWireModel()`, `live()`, `onBlur()`, `onEnter()`)

---

## Repeater

`Modules\Framework\Components\Repeater`

Componente para listas de itens repetíveis. Renderiza um conjunto de componentes filhos para cada item de um array.

### Métodos

| Método | Descrição |
|--------|-----------|
| `create(string $name, ?string $label)` | Cria uma instância do Repeater |
| `content(string\|callable $content)` | Define o conteúdo exibido no header de cada item |
| `schema(array\|Closure $components)` | Define os componentes filhos |
| `disabled(bool\|Closure $condition)` | Desabilita o repeater inteiro |

### Exemplo básico

```php
use Modules\Framework\Components\Repeater;
use ErpSaga\Livewire\Resources\Components\Forms\Input;

Repeater::create('itens', 'Itens do Pedido')
    ->content(fn($item) => $item['descricao'] ?? 'Item')
    ->schema([
        Input::create('Descrição', '*.descricao'),
        Input::create('Quantidade', '*.quantidade'),
        Input::create('Preço', '*.preco'),
    ]);
```

### Exemplo com conteúdo dinâmico no header

```php
Repeater::create('parcelas', 'Parcelas')
    ->content(fn($item) => "Parcela {$item['numero']} - Venc: {$item['vencimento']}")
    ->schema([
        Input::create('Número', '*.numero')->columns(['md' => 2]),
        Input::create('Vencimento', '*.vencimento')->columns(['md' => 4]),
        Input::create('Valor', '*.valor')->columns(['md' => 3]),
    ]);
```

> Para o padrão com Container aninhado (`*.caminho`), prefira o [RepeaterContainer](./RepeaterContainer.md).

---

## SimpleRepeater

`Modules\Framework\Components\SimpleRepeater`

Versão simplificada do Repeater com template de visualização diferente (sem accordeon). Use quando a lista for simples e não precisar de acordeão expansível.

### Exemplo

```php
use Modules\Framework\Components\SimpleRepeater;

SimpleRepeater::create('telefones', 'Telefones')
    ->schema([
        Input::create('Número', '*.numero'),
        Input::create('Tipo', '*.tipo'),
    ]);
```

---

## CollapsibleGroup

`Modules\Framework\Components\CollapsibleGroup`

Agrupa campos em um painel expansível (collapsible). Útil para organizar seções de formulário que podem ser recolhidas.

### Métodos

| Método | Descrição |
|--------|-----------|
| `create(string $name, ?string $label)` | Cria um grupo recolhível |
| `schema(array\|Closure $components)` | Define os componentes internos |
| `disabled(bool\|Closure $condition)` | Desabilita o grupo |

### Exemplo

```php
use Modules\Framework\Components\CollapsibleGroup;

CollapsibleGroup::create('endereco', 'Endereço')
    ->schema([
        Input::create('CEP', 'cep')->columns(['md' => 3]),
        Input::create('Logradouro', 'logradouro')->columns(['md' => 7]),
        Input::create('Número', 'numero')->columns(['md' => 2]),
        Input::create('Complemento', 'complemento')->columns(['md' => 4]),
        Input::create('Bairro', 'bairro')->columns(['md' => 4]),
        Input::create('Cidade', 'cidade')->columns(['md' => 4]),
    ]);
```

### Exemplo com visibilidade condicional

```php
CollapsibleGroup::create('dadosFiscais', 'Dados Fiscais')
    ->schema([
        Input::create('CNPJ', 'cnpj'),
        Input::create('Inscrição Estadual', 'ie'),
    ])
    ->visibleWhen('tipo_pessoa', 'J'); // Visível apenas para pessoa jurídica
```

---

## FileUpload

`Modules\Framework\Components\FileUpload`

Componente de upload de arquivos integrado com FilePond. Suporta múltiplos arquivos, validação de tipo e tamanho.

### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `create(string $label, string $name)` | - | Cria o componente (padrão: max 20MB) |
| `accepts(array $accepts)` | Ex: `['application/pdf', 'image/*']` | Tipos de arquivo aceitos (MIME types) |
| `maxSize(string $maxSize)` | Ex: `'5MB'`, `'500KB'` | Tamanho máximo do arquivo |
| `isWireModel()` | - | Ativa o binding wire:model (já habilitado por padrão) |

### Exemplo básico

```php
use Modules\Framework\Components\FileUpload;

FileUpload::create('Contrato', 'contrato')
    ->accepts(['application/pdf'])
    ->maxSize('10MB');
```

### Exemplo com múltiplos tipos

```php
FileUpload::create('Anexos', 'anexos')
    ->accepts(['application/pdf', 'image/jpeg', 'image/png'])
    ->maxSize('20MB');
```

### Salvando arquivos com HandlesFileUploadAttachments

Para salvar os uploads automaticamente usando a relação morphMany do modelo, use o trait `HandlesFileUploadAttachments` na sua Livewire page. Veja [HandlesFileUploadAttachments](./LivewireConcerns.md#handlesfileuploadattachments).

---

## DateRange

`Modules\Framework\Components\DateRange`

Componente de intervalo de datas. Pode funcionar com um único campo (range em string `"YYYY-MM-DD - YYYY-MM-DD"`) ou dois campos separados.

### Assinatura

```php
DateRange::create(string $label, string $rangeStart, ?string $rangeEnd = null)
```

- `$rangeStart`: nome do campo de data inicial
- `$rangeEnd`: nome do campo de data final (opcional — se omitido, usa apenas um campo)

### Exemplo com dois campos

```php
use Modules\Framework\Components\DateRange;

DateRange::create('Período', 'data_inicio', 'data_fim');
```

### Exemplo com campo único (string range)

```php
// O valor será armazenado como "2024-01-01 - 2024-12-31"
DateRange::create('Período de Competência', 'periodo');
```

### Exemplo com valor padrão

```php
use Illuminate\Support\Carbon;

DateRange::create('Período', 'data_inicio', 'data_fim')
    ->default([Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()]);
```

---

## Money

`Modules\Framework\Components\Money`

Campo de entrada formatado para valores monetários (BRL). Exibe o valor com separadores de milhar e decimais no formato brasileiro.

### Métodos

| Método | Descrição |
|--------|-----------|
| `create(string $label, string $name)` | Cria o campo monetário |

Herda todos os métodos de `Input`, incluindo `disabled()`, `hidden()`, `visibleWhen()`, etc.

### Exemplo

```php
use Modules\Framework\Components\Money;

Money::create('Valor Total', 'valor_total')
    ->columns(['md' => 4])
    ->disabled(); // Apenas leitura

Money::create('Desconto', 'desconto')
    ->columns(['md' => 3])
    ->disabledWhen('tem_desconto', false);
```

---

## Text

`Modules\Framework\Components\Text`

Exibe um texto simples com label, lendo o valor do estado do formulário. Útil para exibir informações somente leitura dentro de um formulário.

### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `create(string $name, ?string $label)` | - | Cria o componente de texto |
| `textClass(string $class)` | Classes CSS | Adiciona classes CSS ao texto exibido |

### Exemplo

```php
use Modules\Framework\Components\Text;

// Exibe o valor do campo 'status' com label 'Status'
Text::create('status', 'Status atual')
    ->textClass('font-bold text-green-600')
    ->columns(['md' => 4]);

// Sem label
Text::create('observacao', '')
    ->textClass('text-sm text-gray-500');
```

---

## ProgressBar

`Modules\Framework\Components\ProgressBar`

Barra de progresso vinculada a um campo numérico (0-100 por padrão, ou com limite customizado).

### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `create(string $name)` | - | Cria a barra de progresso |
| `color(string $color)` | Ex: `'blue'`, `'green'`, `'red'` | Define a cor da barra |
| `size(string $size)` | Ex: `'sm'`, `'md'`, `'lg'` | Define o tamanho |

### Exemplo em formulário

```php
use Modules\Framework\Components\ProgressBar;

ProgressBar::create('progresso')
    ->color('blue')
    ->size('md')
    ->columns(['md' => 12]);
```

### Uso em DataTable (como coluna)

Quando usado como coluna de tabela, suporta `progress_limit_column` para definir o limite máximo dinamicamente:

```php
// Na definição da coluna da tabela:
[
    'title' => 'Progresso',
    'key' => 'progresso',
    'type' => 'progress',
    'progress_limit_column' => 'meta', // coluna que contém o valor máximo
    'rowConfig' => ['color' => 'green'],
]
```

---

## ModalConfirm

`Modules\Framework\Components\ModalConfirm`

Modal de confirmação pré-configurado com header e footer padrão. Estende o componente `Modal` do ErpSaga.

### Assinatura

```php
ModalConfirm::create(string $id, string $onSubmit = '')
```

- `$id`: Identificador único do modal (usado para dispatch de eventos `show-{id}` / `hide-{id}`)
- `$onSubmit`: Nome do método Livewire chamado ao confirmar

### Exemplo

```php
use Modules\Framework\Components\ModalConfirm;

ModalConfirm::create('confirmar-exclusao', 'deletarRegistro')
    ->size('sm'); // tamanhos: 'sm', 'md', 'lg', 'xl'
```

### Abrindo o modal via Livewire

```php
// Na Livewire page:
public function abrirConfirmacao(int $id)
{
    $this->registroId = $id;
    $this->dispatch('show-confirmar-exclusao');
}

public function deletarRegistro()
{
    // lógica de exclusão
    $this->dispatch('hide-confirmar-exclusao');
}
```

### Via dispatchModal (helper do IsPage)

```php
// Usando o helper disponível no trait IsPage:
$this->dispatchModal('confirmar-exclusao', ['id' => $this->registroId]);
```
