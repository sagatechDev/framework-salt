
# Modais e registros

[:arrow_backward: Voltar](../)

---

## CanManipulateModal — abrindo modais de CRUD

O trait `CanManipulateModal` gerencia a abertura e o fechamento dos modais de criar e editar no `ManagePage`. Ele lida com permissões, preenchimento do formulário e despacho dos eventos Livewire.

### Abrindo o modal de criação

```php
// No Blade:
// wire:click="openCreateModal"

public function openCreateModal(): void
{
    // Verifica canCreate() automaticamente
    // Reseta o form, define operation='create', abre o modal
}
```

Para pré-preencher dados antes de abrir:

```php
protected function beforeOpenCreateModal(OpenModalDto $dto): OpenModalDto
{
    $dto->data['status'] = 'ativo';
    $dto->data['empresa_id'] = auth()->user()->empresa_id;
    return $dto;
}
```

### Abrindo o modal de edição

```php
// No Blade:
// wire:click="openEditModal({{ $record->id }})"

public function openEditModal(string $id): void
{
    // Resolve o record, verifica canEdit(), preenche o form com os dados
}
```

Para adicionar dados extras ao abrir o modal de edição:

```php
protected function beforeOpenEditModal(OpenModalDto $dto): OpenModalDto
{
    $dto->data['historico'] = $this->buscarHistorico($dto->data['id']);
    return $dto;
}
```

### Fechando o modal

```php
$this->closeModal(); // fecha o modal e reseta o form
```

### Abrindo modais genéricos

Para modais que não são de CRUD (confirmação, visualização, etc.), use `dispatchModal()`:

```php
$this->dispatchModal('confirmar-exclusao', ['id' => $id, 'nome' => $nome]);
```

Para interceptar antes de abrir (e cancelar com `AlertException` se necessário):

```php
public function beforeOpenConfirmarExclusao(): void
{
    if (!$this->podeExcluir()) {
        throw new AlertException('warning', 'Este registro não pode ser excluído.');
    }
}
```

---

## InteractsWithRecord — resolvendo o registro atual

Usado pelas pages de edição e visualização para carregar e cachear o registro atual de forma segura.

### A propriedade recordId

```php
#[Locked]
public int|string|null $recordId;
```

O `#[Locked]` impede que o `recordId` seja modificado pelo cliente via JavaScript — proteção contra adulteração de IDs.

### Resolvendo o registro

```php
public function mount(int $id): void
{
    $record = $this->resolveRecord($id);
    // Retorna 404 automaticamente se não encontrado
}
```

### Buscando o registro cacheado

```php
protected function handleSubmit(array $data): Model
{
    $record = $this->getRecord(); // usa o cache; lança RecordNotFoundException se não existir
    $record->update($data);
    return $record;
}
```

### Processando o registro após resolver

```php
protected function afterResolveRecord(Model $record): Model
{
    return $record->load(['enderecos', 'contatos', 'documentos']);
}
```

### Tratamento automático de RecordNotFoundException

Se o registro for excluído enquanto o usuário está editando, o `IsPage` captura a `RecordNotFoundException` e redireciona com um alerta de aviso — sem tela de erro.

---

> Veja também: [Submissão de formulário](./livewire-submit) · [Resource e Pages](./resource)
