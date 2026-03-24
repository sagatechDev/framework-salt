
# Outros concerns Livewire

[:arrow_backward: Voltar](../)

---

## IsPage — trait central

O `IsPage` é o trait que toda page Livewire do framework usa. Ele agrega os comportamentos comuns e é incluído automaticamente pelas classes abstratas (`AbstractListPage`, `AbstractCreatePage`, etc.).

Inclui automaticamente: `HasResourceRequest`, `HasConfig`, `HasActionClosures`, `HasBulkActions`.

### Roteamento

```php
// Registra a rota da page
static::route('/clientes/criar');

// Gera a URL de uma page do Resource
Resource::getUrl('edit', [$id]);
```

### Título da página

```php
protected static string $title = 'Cliente';
public static string $actionTitle = 'Novo'; // resulta em "Novo cliente"
```

### Breadcrumbs

```php
protected function previousBreadcrumbs(): array
{
    return [
        Breadcrumb::fromPage(ListPage::class),
    ];
}
// O item atual é adicionado automaticamente com actived=true
```

### Alertas

```php
$this->addAlert('success', 'Operação realizada com sucesso!');
$this->addAlert('warning', 'Atenção: dados incompletos.', 'Aviso');
```

### Redirecionamento seguro

Redireciona para a URL anterior, ou para `index` / `view` / `create` do Resource se a URL anterior não for válida:

```php
$this->safeRedirectBack();
```

### Validação com ResourceRequest pontual

Para validar sem usar o `WithRules` global, chame diretamente:

```php
$this->validateWithResourceRequest(ClienteRequest::class);

// Validando dados de uma chave específica
$this->validateWithResourceRequest(EnderecoRequest::class, 'form.endereco');
```

---

## InteractWithForms — resetar e observar mudanças

### Resetar o formulário

```php
$this->resetForm(); // equivale a $this->container->reset()
```

### Observar mudanças de campos

O trait intercepta automaticamente o `updated()` do Livewire e roteia para os métodos `onChange()` dos componentes quando o path contém `form.` ou `config.`.

Você raramente precisa lidar com isso diretamente — é o mecanismo interno que, por exemplo, atualiza as options de um Select quando outro campo muda.

---

## HasBulkActions — ações em lote

Disponível automaticamente via `IsPage`. Armazena os IDs selecionados na tabela:

```php
public array $selectedTableRecords = [];
```

O método `mountTableBulkAction()` é chamado pelo sistema ao executar uma ação em lote. Ele localiza a tabela, encontra a `BulkAction` pelo nome e executa com os IDs selecionados.

Para registrar BulkActions em uma tabela inline:

```php
Table::create('itens')
    ->bulkActions([
        BulkAction::make('aprovar')
            ->click(fn($page, $ids) => $page->aprovarItens($ids)),
    ]);
```

---

## WithRules — validação via ResourceRequest

Delega automaticamente `rules()`, `validationAttributes()` e `messages()` para o `AbstractResourceRequest` registrado no Resource para a operação atual.

```php
// No Resource:
public static function requests(): array
{
    return ['create' => ClienteRequest::class, 'edit' => ClienteRequest::class];
}

// Na page, basta usar $this->validate() normalmente — as regras vêm do Request
```

---

## HasConfig — opções dinâmicas de Select

Gerencia a propriedade `$config` que alimenta os Selects com opções dinâmicas.

```php
public array $config = [];

// Definindo opções
$this->setConfig('cidade_id', [
    'options' => Cidade::where('estado_id', $estadoId)->pluck('nome', 'id')->toArray(),
]);

// Lendo o label de uma opção
$label = $this->getConfigLabel('cidade_id', $cidadeId);
```

---

## HasOperation — rastreando a operação atual

Define e consulta a operação ativa (`'create'`, `'update'`, `'view'`, `'filter'`). Usado pelos componentes de formulário para aplicar `visibleOn()`, `hiddenOn()`, etc.

```php
// Definindo manualmente
$this->operation('create');

// Lendo
$this->getOperation(); // 'create' | 'update' | 'view' | 'filter'
```

Em pages que estendem as abstratas, a operação já é definida automaticamente:

| Page | Operação |
|------|----------|
| `AbstractCreatePage` | `'create'` |
| `AbstractEditPage` | `'update'` |
| `AbstractViewPage` | `'view'` |
| `AbstractListPage` (filtros) | `'filter'` |

---

> Veja também: [Resource e Pages](./resource) · [Submissão de formulário](./livewire-submit) · [Visibilidade e desabilitação](./component-behavior)
