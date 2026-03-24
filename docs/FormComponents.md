# Componentes de Formulário Base e Estruturais

Esta seção documenta os componentes de entrada (campos de formulário) e os componentes estruturais (que organizam e agrupam campos).

---

## Componentes de Entrada

### Input

`ErpSaga\Livewire\Resources\Components\Forms\Input`

Campo de texto de uso geral. Suporte a máscaras, tipos HTML, centralização, modo slim e modo number.

#### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `create(string $label, string $name)` | - | Cria o campo com `wire:model` |
| `mask(string $mask)` | Ex: `'99/99/9999'` | Aplica máscara via Alpine x-mask |
| `type(string $type)` | `'date'`, `'email'`, `'password'`, etc. | Define o tipo do input HTML |
| `number()` | - | Configura para entrada numérica (type=number, step=any, min=0) |
| `step(string $step)` | `'0.01'`, `'1'`, `'any'` | Define o incremento numérico |
| `centered(bool $value)` | `true` | Centraliza o texto do campo |
| `slim()` | - | Versão compacta (menor padding) |
| `accept(string $accept)` | MIME type | Para inputs do tipo file |
| `tableNumber(string $name)` | - | **Estático** — input numérico slim centralizado para uso em tabelas |
| `info(string $text)` | - | Ícone de informação com tooltip (via `HasInputBehavior`) |
| `uppercase()` | - | Converte para maiúsculas automaticamente |
| `helperText(string $text)` | - | Texto de ajuda abaixo do campo |

#### Exemplos

```php
use ErpSaga\Livewire\Resources\Components\Forms\Input;

// Campo de texto simples
Input::create('Nome', 'nome')
    ->columns(['md' => 6]);

// Campo de data
Input::create('Data de Nascimento', 'nascimento')
    ->type('date')
    ->columns(['md' => 3]);

// Campo com máscara de CPF
Input::create('CPF', 'cpf')
    ->mask('999.999.999-99')
    ->uppercase()
    ->columns(['md' => 4]);

// Campo numérico (quantidade)
Input::create('Quantidade', 'quantidade')
    ->number()
    ->columns(['md' => 2]);

// Campo numérico com casas decimais
Input::create('Peso (kg)', 'peso')
    ->number()
    ->step('0.001')
    ->columns(['md' => 3]);

// Campo de senha
Input::create('Senha', 'senha')
    ->type('password')
    ->visibleOn('create');

// Campo com helper e info
Input::create('CNPJ', 'cnpj')
    ->mask('99.999.999/9999-99')
    ->helperText('Digite apenas números')
    ->info('Informe o CNPJ da empresa')
    ->columns(['md' => 5]);

// Input compacto para tabela inline
Input::tableNumber('*.quantidade'); // slim + centered + number
```

---

### Select

`ErpSaga\Livewire\Resources\Components\Forms\Select`

Select com busca (searchable). Suporta options estáticas, options via config do Livewire e seleção múltipla.

#### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `create(string $label, string $name)` | - | Cria o select com busca |
| `options(array $options)` | `['valor' => 'Label']` | Define as opções estáticas |
| `multiple(bool $value)` | `true` | Permite seleção múltipla (default: `[]`) |
| `hasConfigOptions(bool $value)` | `true` | As options vêm do `config` do Livewire |
| `keepOptions()` | - | Mantém as options no config sem sobrescrever |

#### Opções via config do Livewire

Quando as options são dinâmicas (carregadas via API ou banco), use `hasConfigOptions()` para sincronizar com a propriedade `$config` do Livewire:

```php
// No Resource/schema:
Select::create('Cidade', 'cidade_id')
    ->hasConfigOptions()
    ->columns(['md' => 4]);

// Na Livewire page:
public function updatedFormEstadoId($value): void
{
    $cidades = Cidade::where('estado_id', $value)->get();
    $this->setConfig('cidade_id', [
        'options' => $cidades->pluck('nome', 'id')->toArray(),
    ]);
}
```

#### Exemplos

```php
use ErpSaga\Livewire\Resources\Components\Forms\Select;

// Options estáticas simples
Select::create('Status', 'status')
    ->options([
        'ativo'   => 'Ativo',
        'inativo' => 'Inativo',
        'bloqueado' => 'Bloqueado',
    ])
    ->columns(['md' => 3]);

// Seleção múltipla
Select::create('Permissões', 'permissoes')
    ->options(Permissao::toOptions())
    ->multiple()
    ->columns(['md' => 12]);

// Options do Model
Select::create('Categoria', 'categoria_id')
    ->options(Categoria::pluck('nome', 'id')->toArray())
    ->columns(['md' => 4]);

// Valor padrão
Select::create('Tipo', 'tipo')
    ->options(['F' => 'Física', 'J' => 'Jurídica'])
    ->default('F')
    ->columns(['md' => 3]);
```

---

### SimpleSelect

`ErpSaga\Livewire\Resources\Components\Forms\SimpleSelect`

Select nativo do HTML (sem busca). Mais leve que o `Select`. Aceita options no formato `['valor' => 'Label']` ou `[['id' => x, 'label' => y]]`.

#### Métodos adicionais

| Método | Descrição |
|--------|-----------|
| `withoutPlaceholder()` | Remove a opção vazia inicial |

#### Exemplos

```php
use ErpSaga\Livewire\Resources\Components\Forms\SimpleSelect;

// Formato chave => valor
SimpleSelect::create('Sexo', 'sexo')
    ->options(['M' => 'Masculino', 'F' => 'Feminino'])
    ->columns(['md' => 3]);

// Formato array de objetos [['id' => x, 'label' => y]]
SimpleSelect::create('UF', 'uf')
    ->options(Estado::all(['id', 'nome as label'])->toArray())
    ->columns(['md' => 2]);

// Sem placeholder (primeira opção já é válida)
SimpleSelect::create('Tipo', 'tipo')
    ->options(['padrao' => 'Padrão', 'especial' => 'Especial'])
    ->withoutPlaceholder()
    ->default('padrao');
```

---

### Textarea

`ErpSaga\Livewire\Resources\Components\Forms\Textarea`

Campo de texto multilinha. Padrão: 3 linhas.

#### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `create(string $label, string $name)` | - | Cria o textarea |
| `rows(int $rows)` | número de linhas | Define a altura |
| `info(string $text)` | - | Ícone de informação |
| `helperText(string $text)` | - | Texto de ajuda |
| `uppercase()` | - | Converte para maiúsculas |

#### Exemplos

```php
use ErpSaga\Livewire\Resources\Components\Forms\Textarea;

// Observações simples (3 linhas padrão)
Textarea::create('Observações', 'observacoes')
    ->columns(['md' => 12]);

// Campo maior
Textarea::create('Descrição do Produto', 'descricao')
    ->rows(6)
    ->columns(['md' => 12]);

// Com helper
Textarea::create('Justificativa', 'justificativa')
    ->rows(4)
    ->helperText('Mínimo 50 caracteres')
    ->columns(['md' => 12]);
```

---

### Checkbox

`ErpSaga\Livewire\Resources\Components\Forms\Checkbox`

Campo de marcação booleana. Valor padrão: `false`.

#### Exemplos

```php
use ErpSaga\Livewire\Resources\Components\Forms\Checkbox;

Checkbox::create('Aceito os termos', 'aceite_termos')
    ->columns(['md' => 12]);

Checkbox::create('Enviar notificações', 'notificacoes')
    ->default(true) // pré-marcado
    ->columns(['md' => 6]);
```

---

### Toggle

`ErpSaga\Livewire\Resources\Components\Forms\Toggle`

Switch on/off (toggle button). Mais visual que o Checkbox. Valor padrão: `false`.

#### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `create(string $label, string $name)` | - | Cria o toggle |
| `info(string $info)` | texto | Ícone de informação |
| `isBold(bool $bold)` | `true` | Label em negrito |

#### Exemplos

```php
use ErpSaga\Livewire\Resources\Components\Forms\Toggle;

Toggle::create('Ativo', 'ativo')
    ->default(true)
    ->columns(['md' => 3]);

Toggle::create('Permite desconto', 'permite_desconto')
    ->info('Habilita o campo de desconto nas vendas')
    ->isBold()
    ->columns(['md' => 4]);
```

---

## Componentes Estruturais

### Form

`ErpSaga\Livewire\Resources\Entities\Forms\Form`

Componente que envolve o formulário com botões de Salvar e Cancelar. Usado pelas pages de criação e edição.

#### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `create(string $name)` | - | Cria o form (submitLabel='Salvar') |
| `schema(array $components)` | - | Define os campos |
| `submitLabel(string $label)` | - | Texto do botão de salvar |
| `cancelRoute(string $route)` | nome da rota | Rota do botão Cancelar |
| `withoutActions()` | - | Remove os botões de ação |
| `disableSubmitOnEnterPress()` | - | Previne submit ao pressionar Enter |

#### Exemplo

```php
use ErpSaga\Livewire\Resources\Entities\Forms\Form;

Form::create('form')
    ->submitLabel('Salvar Cliente')
    ->cancelRoute('clientes.index')
    ->schema([
        Input::create('Nome', 'nome'),
        Input::create('Email', 'email'),
    ]);
```

---

### Container

`ErpSaga\Livewire\Resources\Entities\Forms\Container`

Agrupa componentes em um bloco com path de estado próprio. Útil para estruturas aninhadas e para usar com wildcards em Repeaters.

#### Exemplo

```php
use ErpSaga\Livewire\Resources\Entities\Forms\Container;

// Container com path explícito (usado internamente pelo Repeater)
Container::create('*.endereco')->schema([
    Input::create('CEP', 'cep'),
    Input::create('Logradouro', 'logradouro'),
]);

// Container sem path (apenas agrupamento visual)
Container::create()->schema([
    Input::create('Campo A', 'campo_a'),
    Input::create('Campo B', 'campo_b'),
]);
```

---

### Tabs

`ErpSaga\Livewire\Resources\Entities\Forms\Tabs`

Organiza seções do formulário em abas. Cada aba contém um conjunto de componentes ou uma view Blade.

#### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `create(string $name)` | - | Cria o componente de abas |
| `tab(string $tabLabel, mixed $component)` | label, componente ou view | Adiciona uma aba |

#### Exemplos

```php
use ErpSaga\Livewire\Resources\Entities\Forms\Tabs;

// Aba com componentes inline
Tabs::create('cliente-tabs')
    ->tab('Dados Gerais', Form::create('geral')->schema([
        Input::create('Nome', 'nome'),
        Input::create('CPF', 'cpf'),
    ]))
    ->tab('Endereços', Form::create('enderecos')->schema([
        Repeater::create('enderecos', 'Endereços')->schema([
            Input::create('CEP', '*.cep'),
        ]),
    ]))
    ->tab('Contatos', 'clientes.partials.contatos'); // Blade view
```

---

### Modal

`ErpSaga\Livewire\Resources\Components\Modal`

Modal de criação/edição com suporte a formulário, callbacks de submit e close, e configuração de tamanho.

#### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `create(string $id, string $title)` | - | Cria o modal (tamanho 'md', confirmText='Salvar') |
| `createWithModalConfig()` | - | **Estático** — modal padrão do ManagePage |
| `size(string $size)` | `'sm'`, `'md'`, `'lg'`, `'xl'` | Tamanho do modal |
| `form(array $components)` | - | Adiciona Form interno com os campos |
| `schema(array $components)` | - | Schema livre (sem Form wrapper) |
| `onSubmit(callable\|string $callback)` | método ou closure | Callback ao confirmar |
| `onClose(callable $callback)` | closure | Callback ao fechar |
| `confirmText(string $text)` | - | Texto do botão de confirmação |
| `shouldRenderContainer()` | - | Renderiza o container do Livewire page no modal |
| `shouldUseModalConfig()` | - | Usa `modalConfig()` do Resource para título/tamanho |
| `header(ModalHeader $header)` | - | Header customizado |
| `footer(ModalFooter $footer)` | - | Footer customizado |
| `confirmAction(Action $action)` | - | Botão de confirmação customizado |

#### Abrindo/fechando via eventos Livewire

```php
// Abrir
$this->dispatch('show-{modal-id}');

// Fechar
$this->dispatch('hide-{modal-id}');
```

#### Exemplos

```php
use ErpSaga\Livewire\Resources\Components\Modal;

// Modal simples com callback de submit
Modal::create('modal-notas', 'Adicionar Nota')
    ->size('md')
    ->form([
        Textarea::create('Nota', 'nota')->rows(4),
    ])
    ->onSubmit('salvarNota');

// Modal com schema livre
Modal::create('modal-historico', 'Histórico')
    ->size('xl')
    ->schema([
        Table::create('historico')
            ->columns([...])
            ->default($this->historico),
    ])
    ->confirmText('Fechar')
    ->onSubmit(fn($page) => $page->dispatch('hide-modal-historico'));

// Modal com callback ao fechar
Modal::create('modal-aprovacao', 'Aprovação')
    ->onClose(function ($page) {
        $page->resetAprovacao();
    });
```

---

### Table

`ErpSaga\Livewire\Resources\Components\Table`

Tabela de dados embutida dentro de um formulário (diferente do DataTable da listagem). Usada para listas de itens dentro de forms (ex: itens de pedido).

#### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `create(string $name)` | - | Cria a tabela |
| `columns(array $columns)` | array de definição | Define as colunas |
| `actions(array $actions)` | array de Action | Ações por linha |
| `bulkActions(array $bulkActions)` | array de BulkAction | Ações em lote |
| `headerActions(array $actions)` | array de Action | Ações no cabeçalho da tabela |
| `withRemoveAction(?string $action, ?string $afterAction)` | - | Adiciona botão de remover linha |
| `infos(array $infos)` | - | Informações exibidas acima da tabela |
| `slim(bool $isSlim)` | `true` | Versão compacta |
| `height(string $height)` | ex: `'400px'` | Altura máxima com scroll |
| `rowStyle(callable $callback)` | closure recebe `$row` | Estilo dinâmico por linha |

#### Exemplo com tabela de itens em formulário

```php
use ErpSaga\Livewire\Resources\Components\Table;

Table::create('itens')
    ->columns([
        ['label' => 'Produto',    'field' => 'produto_nome'],
        ['label' => 'Qtd',       'field' => 'quantidade'],
        ['label' => 'Preço Unit.','field' => 'preco_unitario', 'money' => true],
        ['label' => 'Total',     'field' => 'total', 'money' => true],
    ])
    ->actions([
        TableAction::make('editar-item')
            ->set('icon', 'fa-pencil')
            ->click(fn($page, $id) => $page->abrirEdicaoItem($id)),
    ])
    ->withRemoveAction('removerItem')
    ->slim()
    ->default([]);
```

---

## Ações de Tabela

### CreateAction

`ErpSaga\Livewire\Resources\Components\CreateAction`

Botão de criação para o toolbar da listagem.

```php
// Redireciona para a create page
CreateAction::make(static::class);

// Abre o modal de criação (ManagePage)
CreateAction::modal();

// Customizado
CreateAction::new()
    ->set('text', 'Nova OS')
    ->url(fn() => OrdemServicoResource::getUrl('create'));
```

### EditTableAction

`ErpSaga\Livewire\Resources\Components\EditTableAction`

Botão de edição por linha.

```php
// Redireciona para a edit page
EditTableAction::make(static::class);

// Abre o modal de edição (ManagePage)
EditTableAction::modal();

// Customizado com lógica extra
EditTableAction::new()
    ->click(fn($page, $id) => $page->openEditModal($id))
    ->visible(fn($record) => $record->pode_editar);
```

### DeleteTableAction

`ErpSaga\Livewire\Resources\Components\DeleteTableAction`

Botão de exclusão por linha com confirmação automática.

```php
// Exclusão simples com verificação de permissão automática
DeleteTableAction::new(fn($model) => $model->delete());

// Com mensagem de confirmação customizada
DeleteTableAction::new(
    fn($model) => $model->delete(),
    fn($model) => "Deseja excluir o cliente {$model->nome}?"
);

// Soft delete com lógica extra
DeleteTableAction::new(function ($model) {
    $model->pedidos()->update(['cliente_id' => null]);
    $model->delete();
});
```

### ViewTableAction

`ErpSaga\Livewire\Resources\Components\ViewTableAction`

Botão de visualização por linha.

```php
ViewTableAction::make(static::class); // Redireciona para view page
```

### ActionsColumn

`ErpSaga\Livewire\Resources\Components\ActionsColumn`

Coluna de ações para o DataTable da listagem (rappasoft). Renderiza as `tableActions()` do Resource.

```php
// Sempre a última coluna do tableColumns():
ActionsColumn::make(static::class);
```

---

## AbstractResourceRequest

`ErpSaga\Livewire\Resources\Entities\Forms\AbstractResourceRequest`

Classe base para validação de formulários. Centraliza as regras de validação fora da Livewire page.

### Métodos obrigatórios

```php
abstract public function rules(): array;
abstract public function validationAttributes(): array;
```

### Exemplo completo

```php
use ErpSaga\Livewire\Resources\Entities\Forms\AbstractResourceRequest;
use Illuminate\Validation\Rule;

class ClienteRequest extends AbstractResourceRequest
{
    public function __construct(private ?array $data = null) {}

    public function rules(?int $id = null): array
    {
        return [
            'form.nome'     => ['required', 'string', 'max:255'],
            'form.email'    => ['required', 'email', Rule::unique('clientes', 'email')->ignore($id)],
            'form.cpf'      => ['required', 'cpf'],
            'form.telefone' => ['nullable', 'celular_com_ddd'],
            'form.status'   => ['required', Rule::in(['ativo', 'inativo'])],
        ];
    }

    public function validationAttributes(): array
    {
        return [
            'form.nome'     => 'nome',
            'form.email'    => 'e-mail',
            'form.cpf'      => 'CPF',
            'form.telefone' => 'telefone',
            'form.status'   => 'status',
        ];
    }

    public function messages(): array
    {
        return [
            'form.cpf.cpf'               => 'O CPF informado é inválido.',
            'form.telefone.celular_com_ddd' => 'O telefone deve estar no formato (99) 99999-9999.',
        ];
    }
}

// Registrado no Resource:
public static function requests(): array
{
    return [
        'create' => ClienteRequest::class,
        'edit'   => ClienteRequest::class,
    ];
}
```

---

## BaseService

`ErpSaga\Livewire\Resources\Entities\BaseService`

Classe base para services, com factory method `make()` via container do Laravel.

```php
use ErpSaga\Livewire\Resources\Entities\BaseService;

class ClienteService extends BaseService
{
    public function __construct(
        private ClienteRepository $repository,
        private NotificacaoService $notificacoes,
    ) {}

    public function criar(array $data): Cliente
    {
        $cliente = Cliente::create($data);
        $this->notificacoes->notificarNovoCadastro($cliente);
        return $cliente;
    }
}

// Uso:
ClienteService::make()->criar($data);
// equivalente a: app(ClienteService::class)->criar($data)
```

---

## BaseResponder

`ErpSaga\Livewire\Resources\Entities\Common\BaseResponder`

Classe base para geração de responses em nova aba (PDFs, planilhas, etc.). Registrado em `getResponders()` do Resource e acessível via `dispatchResponder()` nas pages.

### Métodos para override

| Método | Descrição |
|--------|-----------|
| `handle(Request $request): Response` | **Obrigatório** — lógica da resposta |
| `contentType(): string` | Content-Type do response |
| `disposition(): string` | Content-Disposition (para download) |

### Exemplo: PDF

```php
use ErpSaga\Livewire\Resources\Entities\Common\BaseResponder;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ClientePdfResponder extends BaseResponder
{
    protected function handle(Request $request): Response
    {
        $clientes = Cliente::whereIn('id', $request->ids)->get();

        $pdf = PDF::loadView('relatorios.clientes', compact('clientes'));

        return response($pdf->output());
    }

    protected function contentType(): string
    {
        return 'application/pdf';
    }

    protected function disposition(): string
    {
        return 'attachment; filename="clientes.pdf"';
    }
}

// Registrado no Resource:
public static function getResponders(): array
{
    return ['relatorio-pdf' => ClientePdfResponder::class];
}

// Disparado na page:
$this->dispatchResponder('relatorio-pdf', ['ids' => $this->selectedIds]);
```

### Exemplo: Download de API externa

```php
class RelatorioExternoResponder extends BaseResponder
{
    protected function handle(Request $request): Response
    {
        $response = Http::get('https://api.externa/relatorio', $request->all());

        return $this->responseStreamDownload($response, 'relatorio.xlsx');
    }

    protected function contentType(): string
    {
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    }
}
```

---

## FilterOperator (enum)

`ErpSaga\Livewire\Resources\Entities\Common\FilterOperator`

Enum que define os operadores disponíveis para filtros de tabela.

| Caso | Valor | Filtro aplicado |
|------|-------|----------------|
| `LIKE` | `'lk'` | `WHERE coluna LIKE '%valor%'` |
| `EQUAL` | `'eq'` | `WHERE coluna = valor` |
| `BOOLEAN` | `'bool'` | `WHERE coluna = true/false` |
| `JSON` | `'json'` | `whereJsonContains(coluna, valor)` |
| `BETWEEN` | `'bt'` | `WHERE coluna BETWEEN min AND max` |

```php
use ErpSaga\Livewire\Resources\Entities\Common\FilterOperator;

Input::create('Nome', 'nome')->filter(FilterOperator::LIKE);
Select::create('Status', 'status')->filter(FilterOperator::EQUAL);
Toggle::create('Ativo', 'ativo')->filter(FilterOperator::BOOLEAN);
DateRange::create('Período', 'inicio', 'fim')->filter(FilterOperator::BETWEEN, ['created_at']);
```

---

## ResourceFilter

`ErpSaga\Livewire\Resources\Entities\Common\ResourceFilter`

DTO de filtros que pode ser passado para um scope `filter()` no Model. Alternativa ao `FilterAppender` quando o Model implementa `scopeFilter`.

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

// Na ListPage (automático quando scopeFilter existe):
// $query->filter(ResourceFilter::fromArray($this->filters));
```
