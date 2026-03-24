
# Componentes Estruturais

[:arrow_backward: Voltar](../)

Os componentes estruturais organizam campos em formulários, abas, modais e tabelas. Eles não capturam dados por si sós, mas agrupam e contextualizam os campos de entrada.

---

## Form

O `Form` envolve um grupo de campos com botões de **Salvar** e **Cancelar**. É o componente raiz dos formulários nas pages de criação e edição.

```php
use ErpSaga\Livewire\Resources\Entities\Forms\Form;

Form::create('form')
    ->schema([
        Input::create('Nome', 'nome'),
        Input::create('E-mail', 'email'),
    ]);
```

### Customizando o botão de salvar

```php
Form::create('form')->submitLabel('Confirmar pedido');
```

### Botão de cancelar

```php
Form::create('form')->cancelRoute('clientes.index');
```

### Sem botões de ação

Use quando o Form está dentro de um Modal ou contexto que já tem seus próprios botões:

```php
Form::create('form')->withoutActions();
```

### Prevenindo submit ao pressionar Enter

Útil em formulários com múltiplos campos onde Enter poderia disparar o submit acidentalmente:

```php
Form::create('form')->disableSubmitOnEnterPress();
```

---

## Container

Agrupa campos em um bloco com seu próprio caminho de estado. É usado internamente pelo `Repeater` para separar cada item, mas também pode ser usado manualmente para estruturas aninhadas.

```php
use ErpSaga\Livewire\Resources\Entities\Forms\Container;

// Com path explícito (comum em Repeaters)
Container::create('*.endereco')->schema([
    Input::create('CEP', 'cep'),
    Input::create('Logradouro', 'logradouro'),
]);

// Apenas agrupamento visual (sem path)
Container::create()->schema([
    Input::create('Campo A', 'campo_a'),
    Input::create('Campo B', 'campo_b'),
]);
```

> Para o uso com `Repeater`, prefira o `RepeaterContainer` que gerencia o wildcard automaticamente. Veja [Repeater e variações](./repeater).

---

## Tabs

Organiza seções do formulário em abas. Cada aba pode conter campos inline ou uma view Blade.

```php
use ErpSaga\Livewire\Resources\Entities\Forms\Tabs;

Tabs::create('cliente-tabs')
    ->tab('Dados Gerais', Form::create('geral')->withoutActions()->schema([
        Input::create('Nome', 'nome'),
        Input::create('CPF', 'cpf'),
    ]))
    ->tab('Endereços', Form::create('enderecos')->withoutActions()->schema([
        Repeater::create('enderecos', 'Endereços')->schema([
            Input::create('CEP', '*.cep'),
            Input::create('Logradouro', '*.logradouro'),
        ]),
    ]))
    ->tab('Histórico', 'clientes.partials.historico'); // view Blade
```

---

## Modal

Modal de criação/edição com suporte a formulário, callbacks de submit e close, e tamanhos configuráveis.

```php
use ErpSaga\Livewire\Resources\Components\Modal;

Modal::create('modal-nota', 'Adicionar Nota')
    ->size('md')
    ->form([
        Textarea::create('Nota', 'nota')->rows(4),
    ])
    ->onSubmit('salvarNota');
```

Os tamanhos disponíveis são: `'sm'`, `'md'` (padrão), `'lg'`, `'xl'`.

### Abrindo e fechando o modal

O modal responde a eventos Livewire com o nome do seu ID:

```php
// Na page Livewire:
$this->dispatch('show-modal-nota');
$this->dispatch('hide-modal-nota');

// Ou via helper do IsPage:
$this->dispatchModal('modal-nota', ['cliente_id' => $id]);
```

### Callback ao fechar

```php
Modal::create('modal-aprovacao', 'Aprovação')
    ->onClose(function ($page) {
        $page->resetAprovacao();
    });
```

### Schema livre (sem Form wrapper)

```php
Modal::create('modal-historico', 'Histórico')
    ->size('xl')
    ->schema([
        Table::create('historico')->columns([...])->default([]),
    ])
    ->confirmText('Fechar')
    ->onSubmit(fn($page) => $page->dispatch('hide-modal-historico'));
```

### Modal padrão do ManagePage

O `ManagePage` cria automaticamente o modal de criar/editar via `Modal::createWithModalConfig()`. Você raramente precisa instanciá-lo manualmente.

---

## Table (inline)

Tabela de dados embutida dentro de um formulário. Diferente do DataTable da listagem, essa tabela é usada para listas de itens dentro de forms (ex: itens de pedido, parcelas).

```php
use ErpSaga\Livewire\Resources\Components\Table;

Table::create('itens')
    ->columns([
        ['label' => 'Produto',    'field' => 'produto_nome'],
        ['label' => 'Quantidade', 'field' => 'quantidade'],
        ['label' => 'Preço',      'field' => 'preco', 'money' => true],
        ['label' => 'Total',      'field' => 'total', 'money' => true],
    ])
    ->default([]);
```

### Ações por linha

```php
Table::create('itens')
    ->columns([...])
    ->actions([
        TableAction::make('editar-item')
            ->set('icon', 'fa-pencil')
            ->click(fn($page, $id) => $page->abrirEdicaoItem($id)),
    ]);
```

### Botão de remover linha

```php
Table::create('itens')
    ->columns([...])
    ->withRemoveAction('removerItem'); // chama $this->removerItem($id) na page
```

### Ações em lote (bulk)

```php
Table::create('itens')
    ->columns([...])
    ->bulkActions([
        BulkAction::make('aprovar')->click(fn($page, $ids) => $page->aprovarItens($ids)),
    ]);
```

### Aparência

```php
Table::create('itens')
    ->slim()               // versão compacta
    ->height('400px')      // scroll após esta altura
    ->columns([...]);
```

### Estilo por linha

Por padrão, linhas com `is_finished = true` ficam em cinza. Você pode customizar:

```php
Table::create('itens')
    ->rowStyle(function ($row) {
        return ['class' => $row['cancelado'] ? 'text-red-400 line-through' : ''];
    });
```

---

## CollapsibleGroup

Agrupa campos em um painel que pode ser expandido ou recolhido. Útil para seções opcionais ou de preenchimento menos frequente.

```php
use Modules\Framework\Components\CollapsibleGroup;

CollapsibleGroup::create('endereco', 'Endereço')
    ->schema([
        Input::create('CEP', 'cep')->columns(['md' => 3]),
        Input::create('Logradouro', 'logradouro')->columns(['md' => 7]),
        Input::create('Número', 'numero')->columns(['md' => 2]),
        Input::create('Bairro', 'bairro')->columns(['md' => 4]),
        Input::create('Cidade', 'cidade')->columns(['md' => 4]),
    ]);
```

Aceita visibilidade condicional como qualquer outro componente:

```php
CollapsibleGroup::create('dadosFiscais', 'Dados Fiscais')
    ->schema([...])
    ->visibleWhen('tipo_pessoa', 'J');
```

---

## Text (somente leitura)

Exibe um valor do estado do formulário como texto simples com label. Ideal para campos informativos que não devem ser editados.

```php
use Modules\Framework\Components\Text;

Text::create('status', 'Status atual')
    ->textClass('font-bold text-green-600')
    ->columns(['md' => 4]);
```

---

## ProgressBar

Barra de progresso vinculada a um valor numérico (0–100).

```php
use Modules\Framework\Components\ProgressBar;

ProgressBar::create('progresso')
    ->color('blue')
    ->size('md')
    ->columns(['md' => 12]);
```

---

> Veja também: [Campos de entrada](./form-fields) · [Repeater e variações](./repeater) · [Resource e Pages](./resource)
