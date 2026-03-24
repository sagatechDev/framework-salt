
# Resource e Pages

[:arrow_backward: Voltar](../)

O `AbstractResource` é o ponto central de um módulo CRUD. Ele reúne o Model Eloquent, as rotas, as permissões, o formulário, os filtros e as colunas da listagem em um único lugar.

Cada Resource é acompanhado de uma ou mais **Pages** que implementam as operações disponíveis: listar, criar, editar, visualizar e gerenciar em modal.

---

## Criando um Resource

Um Resource é uma classe PHP que estende `AbstractResource`. Por convenção, o arquivo se chama `Resource.php` e é descoberto automaticamente pelo `ResourceRegistrar`.

```php
namespace Modules\Comercial\Livewire\Resources;

use ErpSaga\Livewire\Resources\Entities\AbstractResource;
use Modules\Comercial\Models\Cliente;

class Resource extends AbstractResource
{
    protected static ?string $model = Cliente::class;
    protected static ?string $modelLabel = 'cliente';
    protected static ?string $slug = 'comercial/clientes';
}
```

As propriedades principais são:

| Propriedade | Descrição |
|-------------|-----------|
| `$model` | FQCN do Model Eloquent |
| `$modelLabel` | Label singular usado nos títulos das pages |
| `$slug` | Prefixo das rotas (ex: `'comercial/clientes'`) |
| `$pluralModelLabel` | Label plural (opcional, inferido do singular) |
| `$recordRouteKeyName` | Chave de rota alternativa (padrão: `id`) |
| `$shouldSkipAuthorization` | `true` para pular verificação de Policy |
| `$shouldCheckPolicyExistence` | `false` para não falhar quando Policy não existe |

---

## Registrando as Pages

O método `getPages()` define quais pages existem no Resource e suas respectivas rotas.

```php
public static function getPages(): array
{
    return [
        'index'  => ListPage::route('/comercial/clientes'),
        'create' => CreatePage::route('/comercial/clientes/criar'),
        'edit'   => EditPage::route('/comercial/clientes/{record}/editar'),
        'view'   => ViewPage::route('/comercial/clientes/{record}'),
    ];
}
```

As chaves (`'index'`, `'create'`, `'edit'`, `'view'`) são os nomes das pages dentro do Resource. Eles são usados para gerar URLs via `Resource::getUrl('edit', [$id])`.

---

## Definindo o formulário

O método `form()` define o schema de campos compartilhado entre as pages de criação, edição e visualização.

```php
use ErpSaga\Livewire\Resources\Entities\Forms\ComponentContainer;
use ErpSaga\Livewire\Resources\Components\Forms\Input;
use ErpSaga\Livewire\Resources\Components\Forms\Select;

public static function form(ComponentContainer $form): ComponentContainer
{
    return $form->schema([
        Input::create('Nome', 'nome')
            ->columns(['md' => 6]),
        Input::create('E-mail', 'email')
            ->columns(['md' => 6]),
        Select::create('Status', 'status')
            ->options(['ativo' => 'Ativo', 'inativo' => 'Inativo'])
            ->default('ativo')
            ->columns(['md' => 4]),
    ]);
}
```

Cada campo recebe um label e um nome (correspondente ao atributo do Model). Veja todos os campos disponíveis em [Campos de entrada](./form-fields).

---

## Configurando a listagem

### Colunas

O método `tableColumns()` define as colunas do DataTable.

```php
use Rappasoft\LaravelLivewireTables\Views\Column;
use ErpSaga\Livewire\Resources\Components\ActionsColumn;

public static function tableColumns(): array
{
    return [
        Column::make('ID', 'id')->sortable(),
        Column::make('Nome', 'nome')->sortable(),
        Column::make('E-mail', 'email'),
        Column::make('Status', 'status')
            ->label(fn($row) => view('components.status-badge', ['status' => $row->status])),
        ActionsColumn::make(static::class),
    ];
}
```

> A coluna `ActionsColumn` renderiza automaticamente as `tableActions()` e deve ser sempre a última.

### Estilo das colunas

Use `configureColumns()` para definir largura e alinhamento por coluna:

```php
public static function configureColumns(): array
{
    return [
        'ID'     => ['width' => 5,  'alignment' => 'center'],
        'Nome'   => ['width' => 40],
        'E-mail' => ['width' => 30],
        'Status' => ['width' => 10, 'alignment' => 'center'],
    ];
}
```

### Filtros

O método `filters()` define os campos exibidos na barra de filtros acima da tabela.

```php
use ErpSaga\Livewire\Resources\Entities\Common\FilterOperator;
use Modules\Framework\Components\DateRange;

public static function filters(): array
{
    return [
        Input::create('Nome', 'nome')
            ->filter(FilterOperator::LIKE, ['nome', 'razao_social']),

        Select::create('Status', 'status')
            ->options(['' => 'Todos', 'ativo' => 'Ativo', 'inativo' => 'Inativo'])
            ->filter(FilterOperator::EQUAL),

        DateRange::create('Período', 'data_inicio', 'data_fim')
            ->filter(FilterOperator::BETWEEN, ['created_at']),
    ];
}
```

Veja todos os operadores disponíveis em [Filtros](./datatable-filters).

---

## Ações da tabela

### Ações por linha

O método `tableActions()` define os botões que aparecem em cada linha da tabela.

```php
use ErpSaga\Livewire\Resources\Components\EditTableAction;
use ErpSaga\Livewire\Resources\Components\DeleteTableAction;
use ErpSaga\Livewire\Resources\Components\ViewTableAction;

public static function tableActions(): array
{
    return [
        ViewTableAction::make(static::class),
        EditTableAction::make(static::class),
        DeleteTableAction::new(fn($model) => $model->delete()),
    ];
}
```

Para módulos com modal, use as variantes `.modal()`:

```php
public static function tableActions(): array
{
    return [
        EditTableAction::modal(),
        DeleteTableAction::new(fn($model) => $model->delete()),
    ];
}
```

`DeleteTableAction::new()` verifica a permissão `canDelete()` automaticamente antes de executar o callback.

Você pode passar uma mensagem de confirmação customizada como segundo argumento:

```php
DeleteTableAction::new(
    fn($model) => $model->delete(),
    fn($model) => "Excluir o cliente \"{$model->nome}\"?"
);
```

### Ações globais

O método `listActions()` define os botões do toolbar da listagem.

```php
use ErpSaga\Livewire\Resources\Components\CreateAction;

public static function listActions(): array
{
    return [
        CreateAction::make(static::class), // link para create page
        // ou:
        CreateAction::modal(),             // abre o modal (ManagePage)
    ];
}
```

---

## Validação com ResourceRequest

Para centralizar as regras fora da page, use `requests()`:

```php
public static function requests(): array
{
    return [
        'create' => ClienteRequest::class,
        'edit'   => ClienteRequest::class,
    ];
}
```

O `AbstractResourceRequest` exige a implementação de `rules()` e `validationAttributes()`:

```php
use ErpSaga\Livewire\Resources\Entities\Forms\AbstractResourceRequest;
use Illuminate\Validation\Rule;

class ClienteRequest extends AbstractResourceRequest
{
    public function rules(?int $id = null): array
    {
        return [
            'form.nome'  => ['required', 'string', 'max:255'],
            'form.email' => ['required', 'email', Rule::unique('clientes', 'email')->ignore($id)],
            'form.cpf'   => ['required', 'cpf'],
        ];
    }

    public function validationAttributes(): array
    {
        return [
            'form.nome'  => 'nome',
            'form.email' => 'e-mail',
            'form.cpf'   => 'CPF',
        ];
    }

    public function messages(): array
    {
        return [
            'form.cpf.cpf' => 'O CPF informado é inválido.',
        ];
    }
}
```

> Prefixe os campos com `form.` pois os dados ficam na propriedade `$form` do componente Livewire.

---

## Permissões

Todas as verificações de permissão delegam para a **Policy** do Model:

```php
Resource::canViewAny();       // acesso à listagem
Resource::canCreate();        // criar registros
Resource::canEdit($record);   // editar um registro
Resource::canView($record);   // visualizar um registro
Resource::canDelete($record); // excluir um registro
```

Para módulos sem Policy:

```php
protected static bool $shouldSkipAuthorization = true;
// ou, para não falhar quando a Policy não existe:
protected static bool $shouldCheckPolicyExistence = false;
```

---

## Query base

Para adicionar joins, escopos ou filtros fixos à listagem, sobrescreva `getEloquentQuery()`:

```php
public static function getEloquentQuery(): Builder
{
    return parent::getEloquentQuery()
        ->with(['cidade'])
        ->where('empresa_id', auth()->user()->empresa_id);
}
```

---

## Pages

### AbstractListPage

A page de listagem. Já integra filtros, ações e DataTable do Resource automaticamente.

```php
class ListPage extends AbstractListPage
{
    protected static string $resource = Resource::class;
    public static string $breadcrumbIcon = 'fa-users';

    protected function afterMount(): void
    {
        $this->filters['status'] = 'ativo'; // filtro padrão
    }

    protected function afterPagination(ComponentContainer $container): ComponentContainer
    {
        return $container->schema([
            ModalConfirm::create('confirmar-exclusao', 'deletar'),
        ]);
    }
}
```

**Hooks disponíveis:**

| Método | Quando é chamado |
|--------|-----------------|
| `afterMount()` | Após o mount, com filtros já preenchidos |
| `beforeConfigure()` | Antes de configurar o DataTable |
| `afterConfigure()` | Após configurar o DataTable |
| `beforeFilterFill()` | Antes de preencher os filtros |
| `afterPagination(ComponentContainer $c)` | Para adicionar modais e componentes abaixo da paginação |

### AbstractCreatePage

Operação: `'create'`. O `handleSubmit()` padrão chama `Model::create($data)`.

```php
class CreatePage extends AbstractCreatePage
{
    protected static string $resource = Resource::class;
    public string $submitSuccessMessage = 'Cliente criado com sucesso!';

    protected function previousBreadcrumbs(): array
    {
        return [Breadcrumb::fromPage(ListPage::class)];
    }

    // Pré-preencher valores padrão antes de exibir o formulário
    protected function mutateFormDataBeforeFill(array $data): array
    {
        $data['status'] = 'ativo';
        return $data;
    }

    // Lógica de criação customizada
    protected function handleSubmit(array $data): Model
    {
        return ClienteService::make()->criar($data);
    }

    // Executado dentro da transação, após salvar
    protected function afterSubmit(Model $record): void
    {
        event(new ClienteCriado($record));
    }
}
```

### AbstractEditPage

Operação: `'update'`. O `handleSubmit()` padrão chama `$record->fill($data)->save()`.

```php
class EditPage extends AbstractEditPage
{
    protected static string $resource = Resource::class;
    public string $submitSuccessMessage = 'Cliente atualizado!';

    protected function previousBreadcrumbs(): array
    {
        return [Breadcrumb::fromPage(ListPage::class)];
    }

    // Dados extras além dos atributos do Model
    protected function extraFillData($record): array
    {
        return ['total_pedidos' => $record->pedidos()->count()];
    }

    // Carregar relações antes de preencher o form
    protected function afterResolveRecord(Model $record): Model
    {
        return $record->load(['enderecos', 'contatos']);
    }
}
```

### AbstractViewPage

Idêntica ao Edit, mas todos os campos são desabilitados automaticamente. Não há botão de salvar. Operação: `'view'`.

```php
class ViewPage extends AbstractViewPage
{
    protected static string $resource = Resource::class;

    protected function previousBreadcrumbs(): array
    {
        return [Breadcrumb::fromPage(ListPage::class)];
    }
}
```

### ManagePage — lista + modal

Para CRUDs simples que não precisam de página dedicada de edição. Combina listagem com modal de criar/editar.

```php
class ManagePage extends \ErpSaga\Livewire\Resources\Entities\Pages\ManagePage
{
    protected static string $resource = Resource::class;

    // Lógica de criação customizada (opcional)
    protected function handleCreateSubmit(array $data): Model
    {
        return ClienteService::make()->criar($data);
    }

    // Lógica de edição customizada (opcional)
    protected function handleEditSubmit(array $data): Model
    {
        return ClienteService::make()->atualizar($this->recordId, $data);
    }
}
```

No Resource, configure o modal e use as ações `.modal()`:

```php
public static function modalConfig(ModalConfig $config): ModalConfig
{
    return $config
        ->title(['create' => 'Novo Cliente', 'update' => 'Editar Cliente'])
        ->size('md');
}

public static function listActions(): array { return [CreateAction::modal()]; }
public static function tableActions(): array
{
    return [EditTableAction::modal(), DeleteTableAction::new(fn($m) => $m->delete())];
}
```

### AbstractReportPage

Page de parâmetros de relatório. Ao submeter, gera a URL do relatório ou despacha um Responder.

```php
class RelatorioPage extends AbstractReportPage
{
    protected static string $resource = Resource::class;
    protected array $permissions = ['verRelatorioClientes'];
    protected string $redirectRoute = 'relatorios.clientes.export';

    public static function form(ComponentContainer $form): ComponentContainer
    {
        return $form->schema([
            DateRange::create('Período', 'data_inicio', 'data_fim'),
        ]);
    }

    // Para abrir em nova aba via Responder
    protected function getResponder(array $formData): ?string
    {
        return 'relatorio-pdf';
    }
}
```

---

## Responders

Responders geram respostas em nova aba (PDFs, planilhas). São registrados no Resource e disparados via `dispatchResponder()`.

```php
// No Resource:
public static function getResponders(): array
{
    return ['relatorio-pdf' => ClientePdfResponder::class];
}

// Na page ou action:
$this->dispatchResponder('relatorio-pdf', ['ids' => $this->selectedIds]);
```

```php
use ErpSaga\Livewire\Resources\Entities\Common\BaseResponder;

class ClientePdfResponder extends BaseResponder
{
    protected function handle(Request $request): Response
    {
        $pdf = PDF::loadView('relatorios.clientes', [
            'clientes' => Cliente::whereIn('id', $request->ids)->get(),
        ]);
        return response($pdf->output());
    }

    protected function contentType(): string { return 'application/pdf'; }
    protected function disposition(): string { return 'attachment; filename="clientes.pdf"'; }
}
```

---

> Veja também: [Campos de entrada](./form-fields) · [Componentes estruturais](./form-structure) · [Filtros](./datatable-filters) · [Livewire — Submissão](./livewire-submit)
