
# Upload de arquivos

[:arrow_backward: Voltar](../)

O trait `HandlesFileUploadAttachments` automatiza o salvamento de arquivos enviados via componente `FileUpload` para relações morfológicas (`morphOne` / `morphMany`) no Model.

---

## Configurando o formulário

Adicione o campo `FileUpload` ao schema:

```php
use Modules\Framework\Components\FileUpload;

FileUpload::create('Contrato PDF', 'contrato')
    ->accepts(['application/pdf'])
    ->maxSize('10MB');

FileUpload::create('Anexos', 'anexos')
    ->accepts(['image/jpeg', 'image/png', 'application/pdf']);
```

O nome do campo (`'contrato'`, `'anexos'`) deve corresponder ao nome da relação no Model.

---

## Configurando o Model

O Model precisa ter relações `morphOne` ou `morphMany` retornando `Attachment`:

```php
use Modules\Core\Models\Attachment;

class Contrato extends Model
{
    // morphOne → um único arquivo (o anterior é substituído ao enviar novo)
    public function contrato(): MorphOne
    {
        return $this->morphOne(Attachment::class, 'attachable')
                    ->where('type', 'contrato');
    }

    // morphMany → múltiplos arquivos (todos são mantidos)
    public function anexos(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable')
                    ->where('type', 'anexo');
    }
}
```

---

## Configurando a Page

Adicione o trait `HandlesFileUploadAttachments` à page:

```php
use Modules\Framework\Concerns\HandlesFileUploadAttachments;

class ContratoCreatePage extends AbstractCreatePage
{
    use HandlesFileUploadAttachments;

    protected function handleSubmit(array $data): Model
    {
        return Contrato::create($data);
        // Os arquivos são salvos automaticamente após o commit da transação
    }
}
```

O trait `HandlesFileUploadAttachments` inclui `WithFilePond` automaticamente.

---

## Como funciona

Após o `handleSubmit()` ser executado com sucesso, o `CanSubmit` chama o hook `saveFileUploads($record)`. O trait então:

1. Localiza todos os componentes `FileUpload` no container
2. Para cada upload, resolve a relação no Model pelo nome do campo
3. Para relações `morphOne`: exclui o arquivo anterior e salva o novo
4. Para relações `morphMany`: salva todos os arquivos sem remover os existentes

---

> Veja também: [Campos de entrada — FileUpload](./form-fields#fileupload) · [Submissão de formulário](./livewire-submit)
