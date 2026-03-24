# Concerns Livewire (Pages)

Estes traits são usados nos componentes Livewire (pages) para adicionar funcionalidades padronizadas como submissão de formulário, manipulação de modal, upload de arquivos e controle de operação.

---

## IsPage

`Modules\Framework\Concerns\IsPage`

Trait central que compõe todos os outros concerns. É o ponto de entrada para uma page Livewire dentro do framework. Inclui automaticamente: `HasResourceRequest`, `HasConfig`, `HasActionClosures`, `HasBulkActions`.

### O que fornece

- Roteamento (`route()`, `getUrl()`)
- Breadcrumbs (`breadcrumbs()`, `getBreadcrumbs()`)
- Título da página (`getTitle()`, `getPageTitle()`, `actionTitle()`)
- Despacho de modais (`dispatchModal()`)
- Redirecionamento seguro (`safeRedirectBack()`)
- Alertas (`addAlert()`)
- Acesso ao Resource associado (`getResource()`)
- Validação com ResourceRequest (`validateWithResourceRequest()`)
- Tratamento de RecordNotFoundException automático

### Propriedades/Atributos

```php
public array $alerts = [];        // Alertas da página
public ?string $redirectUrl;      // URL de redirecionamento
protected static string $resource; // Resource associado
protected static string $view;     // View Blade da página
protected static string $title;    // Título da página
protected static string $breadcrumbIcon; // Ícone do breadcrumb
```

### Métodos principais

#### Roteamento

```php
// Registra a rota da página no ResourceRegistrar
static::route('/clientes/criar');

// Retorna a URL da página
static::getUrl(['id' => 1]);
```

#### Breadcrumbs

```php
// Override para adicionar breadcrumbs anteriores
protected function previousBreadcrumbs(): array
{
    return [
        Breadcrumb::fromPage(ClienteListPage::class),
    ];
}
```

#### Despacho de Modal

```php
// Abre um modal enviando dados para ele
$this->dispatchModal('modal-editar', ['id' => $id, 'nome' => $nome]);

// Antes de abrir o modal pode-se interceptar com:
public function beforeOpenModalEditar(): void
{
    // lógica pré-abertura — pode lançar AlertException para cancelar
}
```

#### Validação com ResourceRequest

```php
// Valida usando as regras de um FormRequest específico
$this->validateWithResourceRequest(ClienteRequest::class);

// Validando dados de uma chave específica do componente
$this->validateWithResourceRequest(ClienteRequest::class, 'form.dados');
```

#### Redirecionamento seguro

```php
// Redireciona para a URL anterior, ou para index/view/create do resource
$this->safeRedirectBack();
```

### Exemplo de Page completo

```php
use Modules\Framework\Concerns\IsPage;
use Livewire\Component;

class ClienteCreatePage extends Component
{
    use IsPage;
    use CanSubmit;
    use CanFillForm;
    use InteractWithForms;

    protected static string $resource = ClienteResource::class;
    protected static string $view = 'comercial::clientes.create';
    protected static string $title = 'Cliente';
    public static string $actionTitle = 'Novo';
    public static string $breadcrumbIcon = 'fa-users';

    protected function previousBreadcrumbs(): array
    {
        return [Breadcrumb::fromPage(ClienteListPage::class)];
    }

    public function mount(): void
    {
        $this->setPageTitle();
        $this->container->fill([]);
    }
}
```

---

## CanSubmit

`Modules\Framework\Concerns\CanSubmit`

Gerencia o fluxo completo de submissão de formulário com validação, hooks, transação de banco de dados e alertas.

### Fluxo de execução do `submit()`

```
1. resetErrorBag()
2. validate() → beforeValidationException() se falhar
3. afterValidate($form) → addErrors() se retornar erros
4. DB::beginTransaction()
5. callFormHook('beforeSubmit')
6. handleSubmit($form) → retorna $record
7. callFormHook('afterSubmit', $record)
8. callFormHook('saveFileUploads', $record)
9. DB::commit()
10. endSubmit($record) → alertFlashTopSuccess + redirect
```

### Métodos para override

| Método | Descrição |
|--------|-----------|
| `handleSubmit(array $data): Model` | **Obrigatório** — lógica de salvar o registro |
| `afterValidate(array $data): array` | Validações extras após o validate padrão; retorne `['campo' => 'erro']` |
| `beforeSubmit()` | Hook antes de salvar (dentro da transação) |
| `afterSubmit(Model $record)` | Hook após salvar (dentro da transação) |
| `endSubmit()` | Customiza o comportamento final (redirect/alert) |
| `beforeValidationException(ValidationException $e)` | Customiza o alert de erro de validação |

### Exemplo

```php
use Modules\Framework\Concerns\CanSubmit;

class ClienteCreatePage extends Component
{
    use CanSubmit;

    public string $submitSuccessMessage = 'Cliente criado com sucesso!';

    protected function handleSubmit(array $data): Model
    {
        return Cliente::create($data);
    }

    protected function afterValidate(array $data): array
    {
        if ($data['cnpj'] && Cliente::where('cnpj', $data['cnpj'])->exists()) {
            return ['form.cnpj' => 'Este CNPJ já está cadastrado.'];
        }
        return [];
    }

    protected function beforeSubmit(): void
    {
        // Executado dentro da transação, antes de handleSubmit
        Log::info('Iniciando criação de cliente');
    }

    protected function afterSubmit(Model $record): void
    {
        // Executado dentro da transação, após handleSubmit
        event(new ClienteCriado($record));
    }
}
```

### Lançando alertas com AlertException

```php
use ErpSaga\Exceptions\AlertException;

protected function afterValidate(array $data): array
{
    if (!$this->validarEstoque($data)) {
        throw new AlertException('warning', 'Estoque insuficiente para este pedido.');
    }
    return [];
}
```

---

## CanFillForm

`Modules\Framework\Concerns\CanFillForm`

Preenche o formulário com dados de um Model ou array, com suporte a mutações antes do preenchimento.

### Métodos

| Método | Descrição |
|--------|-----------|
| `fillForm(array $data)` | Preenche o container com os dados |
| `fillFormWithDataAndCallHooks(Model $record, array $extraData)` | Preenche a partir de um Model |
| `mutateFormDataBeforeFill(array $data): array` | **Override** para transformar dados antes de preencher |
| `extraFillData($record): array` | **Override** para adicionar dados extras ao preencher |

### Exemplo

```php
use Modules\Framework\Concerns\CanFillForm;

class ClienteEditPage extends Component
{
    use CanFillForm;

    public function mount(int $id): void
    {
        $record = Cliente::findOrFail($id);
        $this->fillFormWithDataAndCallHooks($record);
    }

    // Transformar dados antes de preencher o formulário
    protected function mutateFormDataBeforeFill(array $data): array
    {
        // Converter formato de data
        $data['nascimento'] = Carbon::parse($data['nascimento'])->format('d/m/Y');

        // Deserializar campo JSON
        $data['enderecos'] = json_decode($data['enderecos_json'], true);

        return $data;
    }

    // Adicionar dados extras ao preencher
    protected function extraFillData($record): array
    {
        return [
            'total_pedidos' => $record->pedidos()->count(),
        ];
    }
}
```

---

## CanManipulateModal

`Modules\Framework\Concerns\CanManipulateModal`

Gerencia a abertura e fechamento de modais de criação/edição com base na configuração do Resource.

### Métodos

| Método | Descrição |
|--------|-----------|
| `openCreateModal()` | Abre o modal no modo criação (verifica permissão `canCreate`) |
| `openEditModal(string $id)` | Abre o modal no modo edição (verifica permissão `canEdit`) |
| `openModal(OpenModalDto $dto)` | Abre o modal com um DTO customizado |
| `closeModal()` | Fecha o modal e reseta o estado |
| `beforeOpenCreateModal(OpenModalDto $dto): OpenModalDto` | **Override** para modificar o DTO antes de abrir |
| `beforeOpenEditModal(OpenModalDto $dto): OpenModalDto` | **Override** para modificar o DTO antes de abrir |

### OpenModalDto

```php
new OpenModalDto(
    operation: 'create',           // 'create' ou 'update'
    submitSuccessMessage: 'Salvo!', // mensagem de sucesso
    data: []                        // dados para preencher o formulário
);
```

### Exemplo

```php
use Modules\Framework\Concerns\CanManipulateModal;

class ClienteListPage extends Component
{
    use CanManipulateModal;

    // No blade: wire:click="openCreateModal"
    // No blade: wire:click="openEditModal({{ $cliente->id }})"

    protected function beforeOpenCreateModal(OpenModalDto $dto): OpenModalDto
    {
        // Pré-preencher dados no modal de criação
        $dto->data['status'] = 'ativo';
        $dto->data['tipo'] = 'PF';
        return $dto;
    }

    protected function beforeOpenEditModal(OpenModalDto $dto): OpenModalDto
    {
        // Adicionar dados extras ao modal de edição
        $dto->data['historico'] = $this->buscarHistorico($dto->data['id']);
        return $dto;
    }
}
```

---

## InteractWithForms

`Modules\Framework\Concerns\InteractWithForms`

Gerencia eventos de alteração de campos no formulário, roteando para os métodos `onChange` dos componentes.

### O que faz

- `resetForm()` — reseta todos os campos do container
- `updated(string $key, mixed $value)` — intercepta atualizações do Livewire e roteia para `onChangeConfig` ou `onChangeValue`
- Campos com prefix `config.` disparam `component->onChange($valueKey, $value)` no componente correspondente
- Campos com `form.` no path disparam `component->onChange('value', $value)` no componente pelo state path

### Exemplo

```php
use Modules\Framework\Concerns\InteractWithForms;

class PedidoPage extends Component
{
    use InteractWithForms;

    // Resetar o formulário
    public function cancelar(): void
    {
        $this->resetForm(); // equivalente a $this->container->reset()
    }
}
```

---

## InteractsWithRecord

`Modules\Framework\Concerns\InteractsWithRecord`

Gerencia a resolução e cache do registro atual em páginas de edição/visualização.

### Propriedades

```php
#[Locked]
public int|string|null $recordId; // ID do registro (protegido contra tamper)

protected Model $record;          // Registro cacheado
```

### Métodos

| Método | Descrição |
|--------|-----------|
| `resolveRecord(int\|string $key): Model` | Resolve o registro via Resource (abort 404 se não encontrar) |
| `getRecord(): Model` | Retorna o registro cacheado (lança RecordNotFoundException se não encontrar) |
| `afterResolveRecord(Model $record): Model` | **Override** para processar o registro após resolução |

### Exemplo

```php
use Modules\Framework\Concerns\InteractsWithRecord;

class ClienteEditPage extends Component
{
    use InteractsWithRecord;
    use CanFillForm;

    public function mount(int $id): void
    {
        $record = $this->resolveRecord($id);
        $this->fillFormWithDataAndCallHooks($record);
    }

    protected function handleSubmit(array $data): Model
    {
        $record = $this->getRecord(); // usa o cache
        $record->update($data);
        return $record;
    }

    protected function afterResolveRecord(Model $record): Model
    {
        // Carregar relações necessárias
        return $record->load(['enderecos', 'contatos']);
    }
}
```

---

## HandlesFileUploadAttachments

`Modules\Framework\Concerns\HandlesFileUploadAttachments`

Trait que automatiza o salvamento de arquivos enviados via `FileUpload` para uma relação `morphOne` ou `morphMany` no modelo.

### Requisitos

- O Model deve ter uma relação nomeada igual ao `name` do `FileUpload` que retorne `MorphOne` ou `MorphMany` para `Attachment`
- Inclui automaticamente o trait `WithFilePond`

### Como funciona

1. Após `handleSubmit()`, o hook `saveFileUploads` é chamado automaticamente pelo `CanSubmit`
2. Busca todos os componentes `FileUpload` no container
3. Para cada upload, resolve a relação no modelo e salva o arquivo

### Exemplo

```php
use Modules\Framework\Concerns\HandlesFileUploadAttachments;

class ContratoCreatePage extends Component
{
    use HandlesFileUploadAttachments;
    use CanSubmit;

    protected function schema(): array
    {
        return [
            FileUpload::create('Contrato PDF', 'contrato')
                ->accepts(['application/pdf'])
                ->maxSize('10MB'),

            FileUpload::create('Anexos', 'anexos')
                ->accepts(['image/*', 'application/pdf']),
        ];
    }

    protected function handleSubmit(array $data): Model
    {
        return Contrato::create($data);
        // Os arquivos são salvos automaticamente após isso
        // via o hook afterSubmit -> saveFileUploads($record)
    }
}

// O Model precisa ter as relações:
class Contrato extends Model
{
    public function contrato(): MorphOne
    {
        return $this->morphOne(Attachment::class, 'attachable')
                    ->where('type', 'contrato');
    }

    public function anexos(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable')
                    ->where('type', 'anexo');
    }
}
```

---

## HasBulkActions

`Modules\Framework\Concerns\HasBulkActions`

Gerencia ações em lote em tabelas, recebendo os registros selecionados e executando a BulkAction correspondente.

### Propriedades

```php
public array $selectedTableRecords = []; // IDs selecionados na tabela
```

### Método

```php
mountTableBulkAction(string $actionName, string $tablePath)
```

Este método é chamado automaticamente pelo sistema quando o usuário executa uma ação em lote. Ele:
1. Localiza a tabela pelo path
2. Encontra a BulkAction pelo nome
3. Executa `handleAction($selectedTableRecords)`
4. Fecha o modal de confirmação (se configurado)
5. Limpa a seleção

---

## WithRules

`Modules\Framework\Concerns\WithRules`

Delega as regras de validação, atributos e mensagens para um `AbstractResourceRequest` associado ao Resource.

### Como funciona

Quando a page tem `getResourceRequest()` disponível (via `HasResourceRequest`), os métodos `rules()`, `validationAttributes()` e `messages()` são automaticamente delegados para o ResourceRequest.

### Exemplo

```php
// O ResourceRequest do Resource:
class ClienteRequest extends AbstractResourceRequest
{
    public function rules(?int $id = null): array
    {
        return [
            'form.nome'  => 'required|string|max:255',
            'form.email' => ['required', 'email', Rule::unique('clientes', 'email')->ignore($id)],
            'form.cpf'   => 'required|cpf',
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

---

## HasConfig

`Modules\Framework\Concerns\HasConfig`

Gerencia configurações de componentes que possuem opções dinâmicas (como selects com options carregadas via Livewire).

### Propriedades

```php
public array $config = []; // ['nomeComponente' => ['options' => [...]]]
```

### Métodos

| Método | Parâmetros | Descrição |
|--------|-----------|-----------|
| `setConfig(string $key, array $value)` | chave, configuração | Define a configuração de um componente |
| `getConfigLabel(string $key, string\|int $id)` | chave, id | Retorna o label de uma opção pelo ID |

### Exemplo

```php
// Na page Livewire
public function mount(): void
{
    $this->setConfig('status', [
        'options' => [
            'ativo'    => 'Ativo',
            'inativo'  => 'Inativo',
            'pendente' => 'Pendente',
        ]
    ]);
}

// Lendo o label de uma opção
$label = $this->getConfigLabel('status', 'ativo'); // retorna 'Ativo'
```

---

## HasOperation

`Modules\Framework\Concerns\HasOperation`

Rastreia a operação atual da page (`'create'`, `'update'`, ou nome da classe Livewire).

### Métodos

| Método | Descrição |
|--------|-----------|
| `operation(?string $operation): static` | Define a operação manualmente |
| `getOperation(): string` | Retorna a operação atual |

### Exemplo

```php
// Definindo a operação ao montar a page
public function mount(): void
{
    $this->operation('create');
}

// Ou ao abrir um modal
public function openEditModal(int $id): void
{
    $this->operation('update');
    // ...
}

// Verificando a operação em um componente
Input::create('Senha', 'senha')->visibleOn('create');
// equivale a: visible apenas quando getOperation() === 'create'
```
