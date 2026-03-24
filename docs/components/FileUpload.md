# FileUpload Component

O componente `FileUpload` moderniza o armazenamento de arquivos unindo o poder do Livewire ao FilePond nativamente, controlando limites e tipos direto do PHP.

## Como Usar

```php
use Modules\Framework\Components\FileUpload;

FileUpload::create('XML da NF-e', 'xml_file')
    ->accepts(['text/xml', 'application/xml'])
    ->maxSize('5MB');
```

Ao rodar um `$this->reset()`, os arquivos submetidos desaparecem sozinhos sem lógicas manuais pesadas.
