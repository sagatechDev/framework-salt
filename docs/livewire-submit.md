
# Submissão de formulário

[:arrow_backward: Voltar](../)

O trait `CanSubmit` implementa o ciclo completo de submissão de formulário: validação, hooks, transação de banco de dados e feedback ao usuário.

O `CanFillForm` cuida de preencher o formulário com dados de um registro existente.

---

## CanSubmit — fluxo de submit

Ao chamar `$this->submit()` (geralmente via `wire:click="submit"` no Blade), o seguinte ocorre:

```
1. resetErrorBag()
2. validate()                    — regras do rules() / ResourceRequest
3. afterValidate($form)          — validações extras; retorna ['campo' => 'erro']
4. DB::beginTransaction()
5. beforeSubmit()                — hook (dentro da transação)
6. handleSubmit($form)           — salva o registro
7. afterSubmit($record)          — hook (dentro da transação)
8. saveFileUploads($record)      — salva uploads (se HandlesFileUploadAttachments)
9. DB::commit()
10. endSubmit()                  — redireciona com flash de sucesso
```

Se qualquer exceção for lançada entre os passos 4 e 9, a transação é revertida automaticamente.

### handleSubmit — lógica de salvar

Este é o único método obrigatório. Receba o array `$data` e retorne o Model salvo:

```php
protected function handleSubmit(array $data): Model
{
    return Cliente::create($data);
}
```

As pages `AbstractCreatePage` e `AbstractEditPage` já têm uma implementação padrão (`Model::create()` e `$record->fill()->save()`). Sobrescreva apenas quando precisar de lógica diferente:

```php
protected function handleSubmit(array $data): Model
{
    return ClienteService::make()->criar($data);
}
```

### afterValidate — validações extras

Para validações que dependem de lógica de negócio (não apenas regras de formulário), retorne um array de erros. Se retornar vazio, o submit continua.

```php
protected function afterValidate(array $data): array
{
    if (Cliente::where('cnpj', $data['cnpj'])->exists()) {
        return ['form.cnpj' => 'Este CNPJ já está cadastrado.'];
    }

    return [];
}
```

Para interromper com um alerta (sem adicionar erros nos campos):

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

### Hooks — beforeSubmit e afterSubmit

Executados dentro da transação. Use para tarefas que devem ser atômicas com o save principal:

```php
protected function beforeSubmit(): void
{
    // Executado antes de handleSubmit
    Log::info('Iniciando criação de cliente');
}

protected function afterSubmit(Model $record): void
{
    // Executado após handleSubmit, antes do commit
    $record->historico()->create(['acao' => 'criado', 'user_id' => auth()->id()]);
    event(new ClienteCriado($record));
}
```

### endSubmit — comportamento final

Por padrão, redireciona para a página anterior com um flash de sucesso. Para customizar:

```php
protected function endSubmit()
{
    return $this->alertFlashTopSuccess('Pedido confirmado!', '', route('pedidos.index'));
}
```

No `ManagePage`, o padrão é fechar o modal e exibir um alerta inline (sem redirecionamento).

### Mensagem de sucesso

```php
public string $submitSuccessMessage = 'Cliente salvo com sucesso!';
```

---

## CanFillForm — preenchendo o formulário

### Preenchendo com dados de um Model

```php
protected function fillFormWithDataAndCallHooks(Model $record, array $extraData = []): void
```

Combina os atributos do Model com `$extraData` e preenche todos os campos do container.

```php
// Nas pages de edição (já chamado automaticamente pelo AbstractEditPage):
public function mount(int $id): void
{
    $record = Cliente::findOrFail($id);
    $this->fillFormWithDataAndCallHooks($record);
}
```

### Preenchendo com array de dados

Para formulários sem registro (criação ou wizards):

```php
protected function fillForm(array $data = []): void
```

```php
public function mount(): void
{
    $this->fillForm(['status' => 'ativo', 'tipo' => 'F']);
}
```

### Transformando dados antes de preencher

Sobrescreva `mutateFormDataBeforeFill()` para converter formatos ou adicionar dados derivados:

```php
protected function mutateFormDataBeforeFill(array $data): array
{
    // Converter data para o formato do campo
    $data['nascimento'] = Carbon::parse($data['nascimento'])->format('d/m/Y');

    // Desserializar JSON
    $data['enderecos'] = json_decode($data['enderecos_json'], true);

    return $data;
}
```

### Dados extras ao preencher

Para adicionar campos que não existem no Model:

```php
protected function extraFillData($record): array
{
    return [
        'total_pedidos' => $record->pedidos()->count(),
        'ultimo_acesso'  => $record->logins()->latest()->value('created_at'),
    ];
}
```

### Hooks de preenchimento

```php
protected function beforeFill($record): void
{
    // Executado antes de preencher; pode lançar AlertException para abortar
}

protected function afterFill($record): void
{
    // Executado após preencher
}
```

---

> Veja também: [Resource e Pages](./resource) · [Upload de arquivos](./livewire-uploads) · [Modais e registros](./livewire-modal-record)
